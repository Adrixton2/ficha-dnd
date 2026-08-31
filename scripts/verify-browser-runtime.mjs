import { spawn } from 'node:child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9877;
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
    const result = await send('Runtime.evaluate', {
        expression: `(() => ({
            mounted: document.getElementById('root')?.childElementCount > 0,
            architecture: window.runDndArchitectureChecks?.() || null
        }))()`,
        returnByValue: true
    });
    const value = result.result?.result?.value;
    socket.close();
    const passed = Boolean(value?.mounted && value?.architecture?.passed && exceptions.length === 0);
    console.log(JSON.stringify({ passed, mounted: value?.mounted, architecture: value?.architecture, exceptions }, null, 2));
    if (!passed) process.exitCode = 1;
} finally {
    clearInterval(keepAlive);
    chrome.kill();
}
