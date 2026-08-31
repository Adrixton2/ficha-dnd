import { spawn } from 'node:child_process';

const [sourceFile, startMarker, endMarker] = process.argv.slice(2);
if (!sourceFile || !startMarker || !endMarker) {
    throw new Error('Uso: node scripts/analyze-jsx-block.mjs <archivo> <inicio> <fin>');
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9876;
const profile = `${process.env.TEMP || process.cwd()}\\dnd-jsx-analysis-${Date.now()}`;
const pageUrl = `file:///${process.cwd().replaceAll('\\', '/')}/index.dev.html`;
const chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, pageUrl
], { stdio: 'ignore', windowsHide: true });
const keepAlive = setInterval(() => {}, 1000);

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const getPages = async () => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
        try {
            const response = await fetch(`http://127.0.0.1:${port}/json`);
            if (response.ok) return response.json();
        } catch {}
        await wait(300);
    }
    throw new Error('Chrome no abrió el depurador.');
};
const evaluate = async (socket, expression) => {
    const id = 1;
    socket.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    return new Promise((resolve, reject) => {
        socket.addEventListener('message', event => {
            const message = JSON.parse(event.data);
            if (message.id !== id) return;
            if (message.result?.exceptionDetails) reject(new Error(message.result.exceptionDetails.text));
            else resolve(message.result?.result?.value);
        });
    });
};

try {
    const pages = await getPages();
    const page = pages.find(item => item.url.includes('index.dev.html'));
    if (!page) throw new Error('No se encontró index.dev.html.');
    const socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve); socket.addEventListener('error', reject); });
    const expression = `(async () => {
        const startedAt = Date.now();
        while (!window.Babel) {
            if (Date.now() - startedAt > 15000) throw new Error('Babel no se cargó a tiempo');
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        const source = await fetch(${JSON.stringify(`./${sourceFile}`)}).then(response => response.text());
        const markerStart = source.indexOf(${JSON.stringify(startMarker)});
        const markerEnd = source.indexOf(${JSON.stringify(endMarker)}, markerStart);
        if (markerStart < 0 || markerEnd < 0) throw new Error('Marcadores no encontrados');
        const start = source.lastIndexOf('\\n', markerStart) + 1;
        const end = source.lastIndexOf('\\n', markerEnd) + 1;
        const snippet = source.slice(start, end);
        const free = new Set();
        const plugin = () => ({ visitor: { ReferencedIdentifier(path) { if (!path.scope.hasBinding(path.node.name)) free.add(path.node.name); } } });
        Babel.transform('function AnalyzedView(){ return (<>\\n' + snippet + '\\n</>); }', { presets: [['react', { runtime: 'classic' }]], plugins: [plugin] });
        return [...free].sort();
    })()`;
    const names = await evaluate(socket, expression);
    console.log(JSON.stringify(names, null, 2));
    socket.close();
} finally {
    clearInterval(keepAlive);
    chrome.kill();
}
