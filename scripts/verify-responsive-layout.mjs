import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9900 + Math.floor(Math.random() * 500);
const profile = join(tmpdir(), `dnd-responsive-check-${Date.now()}`);
const pageUrl = `file:///${process.cwd().replaceAll('\\', '/')}/index.html`;
const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--allow-file-access-from-files',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    pageUrl
], { stdio: 'ignore', windowsHide: true });
const keepAlive = setInterval(() => {}, 1000);
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const viewports = [
    { width: 390, height: 844, mode: 'mobile', density: 'mobile' },
    { width: 768, height: 1024, mode: 'tablet', density: 'tablet' },
    { width: 1024, height: 768, mode: 'tablet', density: 'tablet' },
    { width: 1280, height: 720, mode: 'desktop', density: 'compact' },
    { width: 1366, height: 768, mode: 'desktop', density: 'compact' },
    { width: 1440, height: 900, mode: 'desktop', density: 'compact' },
    { width: 1600, height: 1000, mode: 'desktop', density: 'standard' },
    { width: 1920, height: 1080, mode: 'desktop', density: 'standard' },
    { width: 2560, height: 1080, mode: 'desktop', density: 'wide' },
    { width: 2560, height: 1440, mode: 'desktop', density: 'wide' },
    { width: 3440, height: 1440, mode: 'desktop', density: 'wide' },
    { width: 3840, height: 2160, mode: 'desktop', density: 'wide' },
    { width: 5120, height: 1440, mode: 'desktop', density: 'wide' }
];

const getPage = async () => {
    for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
            const response = await fetch(`http://127.0.0.1:${port}/json`);
            if (response.ok) {
                const pages = await response.json();
                const page = pages.find(item => item.url.includes('index.html'));
                if (page) return page;
            }
        } catch {}
        await wait(200);
    }
    throw new Error('Chrome no abrió la página para la validación responsive.');
};

const panel = (className, title) => `<section class="rpg-panel ${className}"><h2>${title}</h2><p>Contenido representativo para comprobar anchura, alineación y desbordamiento.</p></section>`;
const appFixture = ({ mode, density }) => {
    const workspace = mode === 'desktop'
        ? `<section class="desktop-workspace-layout" data-view="character"><div class="character-desktop-board">${panel('character-attributes-panel', 'Atributos')}${panel('character-saves-panel', 'Salvaciones')}${panel('character-skills-panel', 'Habilidades')}${panel('companion-panel', 'Compañeros')}${panel('character-traits-panel', 'Rasgos')}${panel('character-feats-panel', 'Dotes')}</div></section>`
        : `<section class="${mode}-workspace-layout" data-view="character"><div class="character-touch-board">${panel('character-attributes-panel', 'Atributos')}${panel('character-saves-panel', 'Salvaciones')}${panel('character-skills-panel', 'Habilidades')}</div></section>`;
    return `<div class="app-shell ${mode}-shell ${mode}-shell--${density}" data-layout-mode="${mode}" data-layout-density="${density}"><div class="app-frame"><main class="tab-viewport" data-active-tab="character"><div class="tab-content-wrapper">${workspace}</div></main></div><nav class="bottom-nav">${Array.from({ length: 5 }, (_, index) => `<button class="bottom-nav-button"><span>Sección ${index + 1}</span></button>`).join('')}</nav></div>`;
};

const moduleButton = title => `<button><span class="online-room-modules__icon">◇</span><span><small>Función</small><strong>${title}</strong><em>Descripción de la función disponible.</em></span><b>→</b></button>`;
const onlineHeader = '<header class="online-table-header"><div class="online-table-header-identity"><span class="online-table-header-emblem">◆</span><div class="online-table-header-copy"><small>Campaña conectada</small><h3>Mesa de prueba</h3><p>Validación de composición</p></div></div><button class="online-table-dismiss is-session">Ficha</button></header>';
const onlineLobbyFixture = ({ mode, density }) => `<div class="online-table-screen online-table-panel is-session" data-layout-mode="${mode}" data-layout-density="${density}" data-table-view="lobby" data-room-module="home">${onlineHeader}<div class="online-table-content is-lobby"><div data-online-table-view="lobby"><div class="online-table-session-flow"><nav class="online-room-modules">${['Inicio', 'Grupo', 'Combate', 'Campaña'].map(moduleButton).join('')}</nav><section class="online-lobby-home"><header class="online-lobby-home__hero"><div class="online-lobby-home__sigil">♜</div><div class="online-lobby-home__welcome"><small>Centro de dirección</small><h4>La mesa está preparada</h4><p>Consulta al grupo y prepara el encuentro.</p></div><div class="online-lobby-home__primary"><button><span>＋</span><span><small>Acción rápida</small><strong>Invitar jugadores</strong></span></button></div></header><div class="online-lobby-home__metrics">${['Jugadores', 'Fichas', 'Iniciativas', 'Oposición'].map(item => `<span><small>${item}</small><strong>4</strong><p>Información disponible</p></span>`).join('')}</div><section class="online-group-roster is-compact"><header><div><small>Compañeros</small><h4>El grupo de hoy</h4></div><span>4 jugadores</span></header><div class="online-group-roster__grid">${Array.from({ length: 4 }, (_, index) => `<article class="is-online"><div class="online-group-roster__identity"><span class="online-combatant-avatar">${index + 1}</span><div><small>Conectado</small><strong>Personaje ${index + 1}</strong><p>Clase · Nivel 5</p></div><i></i></div></article>`).join('')}</div></section></section></div></div></div></div>`;
const onlineEncounterFixture = ({ mode, density }) => `<div class="online-table-screen online-table-panel is-session" data-layout-mode="${mode}" data-layout-density="${density}" data-table-view="encounter">${onlineHeader}<nav class="online-encounter-modules">${['Combate', 'Fichas', 'Efectos'].map(title => `<button><span>&#9671;</span><span><small>Función</small><strong>${title}</strong></span></button>`).join('')}</nav><div class="online-table-content is-encounter"><div data-online-table-view="encounter"><div class="online-table-session-flow"><section class="tactical-encounter-grid" data-mobile-panel="turn"><nav class="online-encounter-panel-nav">${['Turno', 'Orden', 'Detalle'].map(title => `<button><strong>${title}</strong></button>`).join('')}</nav><div class="online-encounter-panels"><section class="tactical-turn-panel"><h3>Turno actual</h3>${Array.from({ length: 6 }, (_, index) => `<button class="online-initiative-card">Combatiente ${index + 1}</button>`).join('')}</section><section class="tactical-controls"><div><button>Anterior</button><button>Siguiente</button></div></section><aside class="tactical-order-panel"><h3>Orden</h3>${Array.from({ length: 8 }, (_, index) => `<button class="online-roster-card">${index + 1}. Aventurero</button>`).join('')}</aside><aside class="tactical-detail-panel online-tactical-detail"><h3>Detalle</h3><p>Estado, vida, condiciones y efectos del combatiente seleccionado.</p></aside></div></section></div></div></div></div>`;

try {
    const page = await getPage();
    const socket = new WebSocket(page.webSocketDebuggerUrl);
    let nextId = 1;
    const pending = new Map();
    socket.addEventListener('message', event => {
        const message = JSON.parse(event.data);
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
    await wait(1500);

    const results = [];
    for (const viewport of viewports) {
        await send('Emulation.setDeviceMetricsOverride', {
            width: viewport.width,
            height: viewport.height,
            deviceScaleFactor: 1,
            mobile: viewport.mode === 'mobile'
        });
        for (const [fixtureName, fixture] of [
            ['character', appFixture(viewport)],
            ['online-lobby', onlineLobbyFixture(viewport)],
            ['online-encounter', onlineEncounterFixture(viewport)]
        ]) {
            const expression = `(() => {
                document.documentElement.dataset.layoutMode = ${JSON.stringify(viewport.mode)};
                document.documentElement.dataset.layoutDensity = ${JSON.stringify(viewport.density)};
                document.body.innerHTML = ${JSON.stringify(fixture)};
                const board = document.querySelector('.character-desktop-board');
                const session = document.querySelector('.online-table-session-flow');
                const modules = document.querySelector('.online-room-modules');
                const encounter = document.querySelector('.tactical-encounter-grid');
                const columnCount = element => element ? getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length : null;
                const root = document.body.firstElementChild;
                const overflowingElements = root ? [...root.querySelectorAll('*')]
                    .filter(element => element.scrollWidth > element.clientWidth + 1)
                    .map(element => ({
                        selector: element.className || element.tagName,
                        clientWidth: element.clientWidth,
                        scrollWidth: element.scrollWidth
                    }))
                    .slice(0, 8) : [];
                return {
                    viewport: [innerWidth, innerHeight],
                    documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
                    rootOverflow: root ? root.scrollWidth > root.clientWidth + 1 : false,
                    overflowingElements,
                    characterColumns: columnCount(board),
                    sessionColumns: columnCount(session),
                    moduleColumns: columnCount(modules),
                    encounterColumns: columnCount(encounter)
                };
            })()`;
            const response = await send('Runtime.evaluate', { expression, returnByValue: true });
            const value = response.result?.result?.value;
            const expectedCharacterColumns = fixtureName === 'character' && viewport.mode === 'desktop'
                ? 2
                : null;
            const passed = Boolean(value)
                && !value.documentOverflow
                && !value.rootOverflow
                && (expectedCharacterColumns === null || value.characterColumns === expectedCharacterColumns)
                && (fixtureName !== 'online-lobby' || viewport.mode !== 'desktop' || (value.sessionColumns === 2 && value.moduleColumns === 1))
                && (fixtureName !== 'online-encounter' || viewport.mode !== 'desktop' || value.encounterColumns === 2);
            results.push({ viewport: `${viewport.width}x${viewport.height}`, mode: viewport.mode, density: viewport.density, fixture: fixtureName, passed, ...value });
        }
    }
    socket.close();
    const failures = results.filter(result => !result.passed);
    const report = process.argv.includes('--verbose')
        ? { passed: failures.length === 0, checks: results.length, failures, results }
        : { passed: failures.length === 0, checks: results.length, viewports: viewports.length, fixtures: 3, failures };
    console.log(JSON.stringify(report, null, 2));
    if (failures.length) process.exitCode = 1;
} finally {
    clearInterval(keepAlive);
    chrome.kill();
}
