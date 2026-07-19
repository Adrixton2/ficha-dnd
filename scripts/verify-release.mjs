import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const requiredFiles = [
  'index.html', 'styles.css', 'online-table.css', 'app.compiled.js',
  'online-table-components.compiled.js', 'app-utils.js', 'character-manager.js',
  'development-checks.js', 'firebase-client.js', 'firebase-config.example.js',
  'online-initiative-utils.js', 'online-table-utils.js', 'service-worker.js',
  'manifest.json', 'icon-192.png', 'icon-512.png', '.build-manifest.json'
];
const compiledSources = [
  'app.jsx', 'online-table-components.jsx', 'app.compiled.js',
  'online-table-components.compiled.js'
];

const fail = (message) => {
  console.error(`Release validation failed: ${message}`);
  process.exitCode = 1;
};
const readText = (file) => readFileSync(resolve(root, file), 'utf8');
const normalizedHash = (file) => createHash('sha256')
  .update(readText(file).replace(/\r\n/g, '\n'))
  .digest('hex');

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) fail(`missing required file: ${file}`);
}

const index = readText('index.html');
for (const reference of [
  './firebase-config.js', './firebase-client.js', './app.compiled.js',
  './online-table-components.compiled.js', './styles.css', './online-table.css'
]) {
  if (!index.includes(reference)) fail(`index.html does not reference ${reference}`);
}

const serviceWorker = readText('service-worker.js');
for (const asset of ['./firebase-config.js', './firebase-client.js', './app.compiled.js', './online-table-components.compiled.js']) {
  if (!serviceWorker.includes(asset)) fail(`service-worker.js does not cache ${asset}`);
}

const firebaseClient = readText('firebase-client.js');
if (!firebaseClient.includes('window.__FIREBASE_CONFIG__')) fail('Firebase client does not use the injected configuration.');
if (/AIza[\w-]{20,}/.test(firebaseClient)) fail('Firebase API key found in firebase-client.js.');

const manifest = JSON.parse(readText('.build-manifest.json'));
if (manifest.schemaVersion !== 1 || !manifest.files) fail('invalid build manifest.');
for (const file of compiledSources) {
  if (manifest.files[file] !== normalizedHash(file)) fail(`${file} differs from .build-manifest.json; run build-production.ps1.`);
}

const trackedFiles = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
for (const forbidden of ['firebase-config.js', 'config-firebase.txt', '.github-upload-token']) {
  if (trackedFiles.includes(forbidden)) fail(`sensitive local file is tracked: ${forbidden}`);
}
for (const file of trackedFiles) {
  if (!/\.(?:js|jsx|html|json|md|ps1|yml|yaml|txt)$/i.test(file)) continue;
  const content = readText(file);
  if (/AIza[\w-]{20,}/.test(content)) fail(`possible Google API key found in tracked file: ${file}`);
  if (/BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/.test(content)) fail(`private key found in tracked file: ${file}`);
}

if (!process.exitCode) console.log('Release validation passed.');
