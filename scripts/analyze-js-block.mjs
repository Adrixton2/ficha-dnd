import { spawn } from 'node:child_process';

const [sourceFile, startMarker, endMarker] = process.argv.slice(2);
if (!sourceFile || !startMarker || !endMarker) {
    throw new Error('Uso: node scripts/analyze-js-block.mjs <archivo> <inicio> <fin>');
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9878;
const profile = `${process.env.TEMP || process.cwd()}\\dnd-js-analysis-${Date.now()}`;
const pageUrl = `file:///${process.cwd().replaceAll('\\', '/')}/index.dev.html`;
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
                const page = pages.find(item => item.url.includes('index.dev.html'));
                if (page) return page;
            }
        } catch {}
        await wait(250);
    }
    throw new Error('Chrome no abrió el analizador.');
};

try {
    const page = await getPage();
    const socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
        socket.addEventListener('open', resolve);
        socket.addEventListener('error', reject);
    });
    const expression = `(async () => {
        while (!window.Babel) await new Promise(resolve => setTimeout(resolve, 100));
        const source = await fetch(${JSON.stringify(`./${sourceFile}`)}).then(response => response.text());
        const markerStart = source.indexOf(${JSON.stringify(startMarker)});
        const markerEnd = source.indexOf(${JSON.stringify(endMarker)}, markerStart);
        if (markerStart < 0 || markerEnd < 0) throw new Error('Marcadores no encontrados');
        const start = source.lastIndexOf('\\n', markerStart) + 1;
        const end = source.lastIndexOf('\\n', markerEnd) + 1;
        const snippet = source.slice(start, end);
        const free = new Set();
        const bindings = new Set();
        const plugin = () => ({ visitor: {
            ReferencedIdentifier(path) { if (!path.scope.hasBinding(path.node.name)) free.add(path.node.name); },
            FunctionDeclaration(path) {
                if (path.node.id?.name === 'AnalyzedController') {
                    Object.keys(path.scope.bindings).filter(name => name !== 'AnalyzedController').forEach(name => bindings.add(name));
                }
            }
        } });
        Babel.transform('function AnalyzedController(){\\n' + snippet + '\\n}', { presets: [['react', { runtime: 'classic' }]], plugins: [plugin] });
        return { free: [...free].sort(), bindings: [...bindings].sort() };
    })()`;
    socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    const result = await new Promise((resolve, reject) => socket.addEventListener('message', event => {
        const message = JSON.parse(event.data);
        if (message.id !== 1) return;
        if (message.result?.exceptionDetails) reject(new Error(message.result.exceptionDetails.text));
        else resolve(message.result?.result?.value);
    }));
    console.log(JSON.stringify(result, null, 2));
    socket.close();
} finally {
    clearInterval(keepAlive);
    chrome.kill();
}
