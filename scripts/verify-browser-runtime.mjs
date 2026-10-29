import { spawn } from 'node:child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9877 + Math.floor(Math.random() * 700);
const profile = `${process.env.TEMP || process.cwd()}\\dnd-runtime-check-${Date.now()}`;
const pageUrl = `file:///${process.cwd().replaceAll('\\', '/')}/index.html`;
const chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, pageUrl
], { stdio: 'ignore', windowsHide: true });
const keepAlive = setInterval(() => {}, 1000);
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const getPage = async () => {
    for (let attempt = 0; attempt < 40; attempt += 1) {
        try {
            const response = await fetch(`http://127.0.0.1:${port}/json`);
            if (response.ok) {
                const pages = await response.json();
                const page = pages.find(item => item.url.includes('index.html'));
                if (page) return page;
            }
        } catch {}
        await wait(250);
    }
    throw new Error('Chrome no abrió la página de producción.');
};

try {
    const page = await getPage();
    const socket = new WebSocket(page.webSocketDebuggerUrl);
    const exceptions = [];
    let nextId = 1;
    const pending = new Map();
    socket.addEventListener('message', event => {
        const message = JSON.parse(event.data);
        if (message.method === 'Runtime.exceptionThrown') {
            exceptions.push(message.params.exceptionDetails?.exception?.description || message.params.exceptionDetails?.text || 'Error desconocido');
        }
        if (message.id && pending.has(message.id)) {
            pending.get(message.id)(message);
            pending.delete(message.id);
        }
    });
    await new Promise((resolve, reject) => {
        socket.addEventListener('open', resolve);
        socket.addEventListener('error', reject);
    });
    const send = (method, params = {}) => new Promise(resolve => {
        const id = nextId++;
        pending.set(id, resolve);
        socket.send(JSON.stringify({ id, method, params }));
    });
    await send('Runtime.enable');
    await wait(5000);
    await send('Runtime.evaluate', {
        expression: `(() => {
            if (document.querySelector('.mobile-shell, .tablet-shell, .desktop-shell')) return 'already-mounted';
            if (!window.firebaseConnectionState) return 'firebase-state-unavailable';
            window.firebaseConnectionState.authResolved = true;
            window.firebaseConnectionState.user = {
                uid: 'runtime-layout-check',
                isAnonymous: true,
                displayName: 'Prueba local'
            };
            window.dispatchEvent(new CustomEvent('firebase-auth-state'));
            return 'test-identity-injected';
        })()`
    });
    await wait(500);
    const inspectLayout = async ({ width, height, touch, expectedMode, expectedDensity }) => {
        await send('Emulation.setTouchEmulationEnabled', { enabled: touch, maxTouchPoints: touch ? 5 : 0 });
        await send('Emulation.setDeviceMetricsOverride', {
            width,
            height,
            deviceScaleFactor: 1,
            mobile: touch
        });
        await wait(250);
        const response = await send('Runtime.evaluate', {
            expression: `(() => ({
                mode: document.documentElement.dataset.layoutMode || '',
                density: document.documentElement.dataset.layoutDensity || '',
                activeShells: [...document.querySelectorAll('.mobile-shell, .tablet-shell, .desktop-shell')]
                    .filter(element => element.getClientRects().length > 0)
                    .map(element => ['mobile-shell', 'tablet-shell', 'desktop-shell']
                        .find(className => element.classList.contains(className)))
            }))()`,
            returnByValue: true
        });
        const actual = response.result?.result?.value || {};
        return {
            viewport: `${width}x${height}`,
            expectedMode,
            expectedDensity,
            ...actual,
            passed: actual.mode === expectedMode
                && actual.density === expectedDensity
                && actual.activeShells?.length === 1
                && actual.activeShells[0] === `${expectedMode}-shell`
        };
    };
    const layoutTransitions = [];
    layoutTransitions.push(await inspectLayout({ width: 3440, height: 1440, touch: false, expectedMode: 'desktop', expectedDensity: 'wide' }));
    layoutTransitions.push(await inspectLayout({ width: 1700, height: 1000, touch: false, expectedMode: 'desktop', expectedDensity: 'standard' }));
    layoutTransitions.push(await inspectLayout({ width: 1280, height: 720, touch: false, expectedMode: 'desktop', expectedDensity: 'compact' }));
    const evaluateValue = async expression => {
        const response = await send('Runtime.evaluate', { expression, returnByValue: true });
        return response.result?.result?.value;
    };
    const selectTab = async index => {
        await evaluateValue(`(() => { document.querySelectorAll('.bottom-nav-button')[${index}]?.click(); return true; })()`);
        await wait(900);
    };
    await inspectLayout({ width: 1920, height: 1080, touch: false, expectedMode: 'desktop', expectedDensity: 'standard' });
    await selectTab(0);
    const characterComposition = await evaluateValue(`(() => {
        const rect = selector => document.querySelector(selector)?.getBoundingClientRect();
        const stats = rect('.character-stats-column');
        const skills = rect('.character-skills-panel');
        const companion = rect('.character-secondary-column > .companion-panel');
        const traits = rect('.character-traits-panel');
        const feats = rect('.character-feats-panel');
        const companionGap = skills && companion ? companion.top - skills.bottom : null;
        const passed = Boolean(stats?.height && skills?.height && companion?.height && traits?.height && feats?.height)
            && Math.abs(stats.top - skills.top) <= 3
            && companionGap >= 0 && companionGap <= 40
            && traits.top >= stats.bottom
            && Math.abs(traits.top - feats.top) <= 3
            && document.documentElement.scrollWidth <= innerWidth + 1;
        return { passed, activeTab: document.querySelector('.tab-viewport')?.dataset.activeTab, statsDisplay: getComputedStyle(document.querySelector('.character-stats-column')).display, statsTop: stats?.top, skillsTop: skills?.top, companionTop: companion?.top, companionGap, traitsTop: traits?.top, featsTop: feats?.top };
    })()`);
    await selectTab(1);
    const combatComposition = await evaluateValue(`(() => {
        const rect = selector => document.querySelector(selector)?.getBoundingClientRect();
        const side = rect('.combat-desktop-side');
        const resources = rect('.combat-resources-panel');
        const arsenal = rect('.combat-arsenal-panel');
        const passed = Boolean(side?.height && resources?.height && arsenal?.height)
            && Math.abs(resources.top - arsenal.top) <= 3
            && Math.abs(arsenal.top - side.top) <= 3
            && document.documentElement.scrollWidth <= innerWidth + 1;
        return { passed, activeTab: document.querySelector('.tab-viewport')?.dataset.activeTab, resourcesTop: resources?.top, arsenalTop: arsenal?.top, sideTop: side?.top };
    })()`);
    await selectTab(4);
    const inventoryComposition = await evaluateValue(`(() => {
        const rect = selector => document.querySelector(selector)?.getBoundingClientRect();
        const equipment = rect('.inventory-equipment-panel');
        const currency = rect('.inventory-currency-panel');
        const market = rect('.inventory-market-panel');
        const backpack = rect('.inventory-backpack-panel');
        const leftGap = equipment && currency ? currency.top - equipment.bottom : null;
        const rightGap = market && backpack ? backpack.top - market.bottom : null;
        const passed = Boolean(equipment?.height && currency?.height && market?.height && backpack?.height)
            && leftGap >= 0 && leftGap <= 40
            && rightGap >= 0 && rightGap <= 40
            && document.documentElement.scrollWidth <= innerWidth + 1;
        return { passed, activeTab: document.querySelector('.tab-viewport')?.dataset.activeTab, leftGap, rightGap, marketHeight: market?.height, backpackHeight: backpack?.height };
    })()`);
    await inspectLayout({ width: 3440, height: 1440, touch: false, expectedMode: 'desktop', expectedDensity: 'wide' });
    const inventoryWideComposition = await evaluateValue(`(() => {
        const rect = selector => document.querySelector(selector)?.getBoundingClientRect();
        const equipment = rect('.inventory-equipment-panel');
        const currency = rect('.inventory-currency-panel');
        const market = rect('.inventory-market-panel');
        const backpack = rect('.inventory-backpack-panel');
        const diary = rect('.inventory-diary-panel');
        const leftGap = equipment && currency ? currency.top - equipment.bottom : null;
        const rightGap = market && backpack ? backpack.top - market.bottom : null;
        const diaryGap = backpack && diary ? diary.top - backpack.bottom : null;
        const passed = Boolean(equipment?.height && currency?.height && market?.height && backpack?.height)
            && leftGap >= 0 && leftGap <= 40
            && rightGap >= 0 && rightGap <= 40
            && diaryGap >= 0 && diaryGap <= 40
            && document.documentElement.scrollWidth <= innerWidth + 1;
        return { passed, activeTab: document.querySelector('.tab-viewport')?.dataset.activeTab, leftGap, rightGap, diaryGap, marketHeight: market?.height, backpackHeight: backpack?.height };
    })()`);
    const compositions = { character: characterComposition, combat: combatComposition, inventory: inventoryComposition, inventoryWide: inventoryWideComposition };
    layoutTransitions.push(await inspectLayout({ width: 1024, height: 768, touch: false, expectedMode: 'tablet', expectedDensity: 'tablet' }));
    layoutTransitions.push(await inspectLayout({ width: 2560, height: 1600, touch: true, expectedMode: 'tablet', expectedDensity: 'tablet' }));
    layoutTransitions.push(await inspectLayout({ width: 390, height: 844, touch: true, expectedMode: 'mobile', expectedDensity: 'mobile' }));
    layoutTransitions.push(await inspectLayout({ width: 768, height: 1024, touch: true, expectedMode: 'tablet', expectedDensity: 'tablet' }));
    const result = await send('Runtime.evaluate', {
        expression: `(() => ({
            mounted: document.getElementById('root')?.childElementCount > 0,
            architecture: window.runDndArchitectureChecks?.() || null
        }))()`,
        returnByValue: true
    });
    const value = result.result?.result?.value;
    socket.close();
    const passed = Boolean(value?.mounted
        && value?.architecture?.passed
        && layoutTransitions.every(transition => transition.passed)
        && Object.values(compositions).every(composition => composition?.passed)
        && exceptions.length === 0);
    console.log(JSON.stringify({ passed, mounted: value?.mounted, architecture: value?.architecture, layoutTransitions, compositions, exceptions }, null, 2));
    if (!passed) process.exitCode = 1;
} finally {
    clearInterval(keepAlive);
    chrome.kill();
}
