import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const requiredFiles = [
  'index.html', 'styles.css', 'online-table.css', 'app.compiled.js',
  'online-table-components.compiled.js', 'app-utils.js', 'spell-library-srd51-es.js', 'character-manager.js',
  'development-checks.js', 'firebase-client.js', 'firebase-config.example.js',
  'online-initiative-utils.js', 'online-table-utils.js', 'service-worker.js',
  'manifest.json', 'icon-192.png', 'icon-512.png', '.build-manifest.json',
  'firestore.rules'
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
  './online-table-components.compiled.js', './styles.css', './online-table.css', './spell-library-srd51-es.js'
]) {
  if (!index.includes(reference)) fail(`index.html does not reference ${reference}`);
}

const serviceWorker = readText('service-worker.js');
for (const asset of ['./firebase-config.js', './firebase-client.js', './app.compiled.js', './online-table-components.compiled.js', './spell-library-srd51-es.js']) {
  if (!serviceWorker.includes(asset)) fail(`service-worker.js does not cache ${asset}`);
}

const firebaseClient = readText('firebase-client.js');
if (!firebaseClient.includes('window.__FIREBASE_CONFIG__')) fail('Firebase client does not use the injected configuration.');
if (/AIza[\w-]{20,}/.test(firebaseClient)) fail('Firebase API key found in firebase-client.js.');

const spellLibrarySource = readText('spell-library-srd51-es.js');
const spellLibraryMatch = spellLibrarySource.match(/Object\.freeze\((.*)\);\s*\}\)\(\);/s);
if (!spellLibraryMatch) {
  fail('spell-library-srd51-es.js is not a valid local library wrapper.');
} else {
  try {
    const spellLibrary = JSON.parse(spellLibraryMatch[1]);
    if (spellLibrary.format !== 'dnd-srd-spell-library' || spellLibrary.schemaVersion !== 1) {
      fail('spell library has an unsupported schema.');
    }
    if (!Array.isArray(spellLibrary.spells) || spellLibrary.spells.length === 0) {
      fail('spell library has no spells.');
    }
    const invalidSpell = spellLibrary.spells.find(spell => (
      typeof spell?.id !== 'string' || !spell.id || typeof spell.name !== 'string' || !spell.name
      || !Number.isInteger(spell.level) || spell.level < 0 || spell.level > 9
      || typeof spell.description !== 'string' || !spell.description
    ));
    if (invalidSpell) fail(`spell library contains an invalid spell: ${invalidSpell?.id || 'unknown'}.`);
  } catch (error) {
    fail(`spell library JSON is invalid: ${error.message}`);
  }
}

const firestoreRules = readText('firestore.rules');
if (!firestoreRules.includes("rules_version = '2';") || !firestoreRules.includes('service cloud.firestore')) {
  fail('firestore.rules is not a Firestore rules file.');
}
if (/allow\s+(?:read|write|read\s*,\s*write)\s*:\s*if\s+true\s*;/i.test(firestoreRules)) {
  fail('firestore.rules contains an unrestricted read/write rule.');
}

const deployWorkflow = readText('.github/workflows/deploy-pages.yml');
if (/\bfirestore\.rules\b/.test(deployWorkflow)) fail('firestore.rules must not be part of the Pages artifact.');

const manifest = JSON.parse(readText('.build-manifest.json').replace(/^\uFEFF/, ''));
if (manifest.schemaVersion !== 1 || !manifest.files) fail('invalid build manifest.');
for (const file of compiledSources) {
  if (manifest.files[file] !== normalizedHash(file)) fail(`${file} differs from .build-manifest.json; run build-production.ps1.`);
}

const trackedFiles = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
for (const forbidden of ['firebase-config.js', 'config-firebase.txt', '.github-upload-token']) {
  if (trackedFiles.includes(forbidden)) fail(`sensitive local file is tracked: ${forbidden}`);
}
for (const file of trackedFiles) {
  if (!/\.(?:js|jsx|html|json|md|ps1|yml|yaml|txt|rules)$/i.test(file)) continue;
  const content = readText(file);
  if (/AIza[\w-]{20,}/.test(content)) fail(`possible Google API key found in tracked file: ${file}`);
  if (/BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/.test(content)) fail(`private key found in tracked file: ${file}`);
}

if (!process.exitCode) console.log('Release validation passed.');
