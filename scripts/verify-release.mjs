import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const jsxModules = [
  ['src/features/dice/DiceRoller.jsx', 'dist/features/dice/DiceRoller.js'],
  ['src/features/online-table/OnlineTableComponents.jsx', 'dist/features/online-table/OnlineTableComponents.js'],
  ['src/features/character/CharacterBuilder.jsx', 'dist/features/character/CharacterBuilder.js'],
  ['src/features/bestiary/Bestiary.jsx', 'dist/features/bestiary/Bestiary.js'],
  ['src/shared/components/LocalModals.jsx', 'dist/shared/components/LocalModals.js'],
  ['src/features/spellbook/Spellbook.jsx', 'dist/features/spellbook/Spellbook.js'],
  ['src/shared/components/CharacterPrimitives.jsx', 'dist/shared/components/CharacterPrimitives.js'],
  ['src/features/companions/CompanionManager.jsx', 'dist/features/companions/CompanionManager.js'],
  ['src/features/combat/SessionMode.jsx', 'dist/features/combat/SessionMode.js'],
  ['src/features/inventory/InventoryView.jsx', 'dist/features/inventory/InventoryView.js'],
  ['src/features/character/CharacterFooter.jsx', 'dist/features/character/CharacterFooter.js'],
  ['src/features/online-table/OnlineTable.jsx', 'dist/features/online-table/OnlineTable.js'],
  ['src/features/combat/CombatDashboard.jsx', 'dist/features/combat/CombatDashboard.js'],
  ['src/features/character/CharacterHeader.jsx', 'dist/features/character/CharacterHeader.js'],
  ['src/features/character/CharacterSheet.jsx', 'dist/features/character/CharacterSheet.js'],
  ['src/features/online-table/useOnlineRoom.jsx', 'dist/features/online-table/useOnlineRoom.js'],
  ['src/shared/components/dialogs/CompendiumDialogs.jsx', 'dist/shared/components/dialogs/CompendiumDialogs.js'],
  ['src/shared/components/dialogs/ActionDialogs.jsx', 'dist/shared/components/dialogs/ActionDialogs.js'],
  ['src/shared/components/dialogs/EditorDialogs.jsx', 'dist/shared/components/dialogs/EditorDialogs.js'],
  ['src/app/CharacterSheetApp.jsx', 'dist/app/CharacterSheetApp.js'],
  ['src/features/account/AccountGate.jsx', 'dist/features/account/AccountGate.js']
];
const compiledModuleFiles = jsxModules.map(([, compiled]) => compiled);
const requiredFiles = [
  'index.html', 'src/styles/app.css', 'src/styles/online-table.css', 'src/styles/dice.css',
  'src/features/dice/dice-engine.js', 'src/features/dice/dice-3d.js', 'dist/App.js',
  ...compiledModuleFiles, 'src/shared/utils/app-utils.js', 'src/data/spell-library-srd51-es.js',
  'src/data/srd-spellcasting-profiles.js', 'src/data/srd-character-rules.js',
  'src/data/phb2014-expansion.js', 'src/data/eberron-character-expansion.js',
  'src/data/feat-compendium.js', 'src/data/monster-compendium-srd51.js',
  'src/data/equipment-compendium-srd51-es.js', 'src/services/character-storage.js',
  'src/shared/utils/development-checks.js', 'src/services/firebase.js', 'firebase-config.example.js',
  'src/features/online-table/utils/initiative.js',
  'src/features/online-table/utils/online-table-utils.js', 'service-worker.js',
  'manifest.json', 'icon-192.png', 'icon-512.png', '.build-manifest.json',
  'firestore.rules', 'firestore.indexes.json'
];
const compiledSources = [
  'src/App.jsx', ...jsxModules.flatMap(([source, compiled]) => [source, compiled]),
  'dist/App.js'
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
  './firebase-config.js', './src/services/firebase.js', './dist/App.js',
  './src/features/dice/dice-engine.js', './src/features/dice/dice-3d.js', './src/styles/dice.css',
  ...compiledModuleFiles.map(file => `./${file}`), './src/styles/app.css',
  './src/styles/online-table.css', './src/data/spell-library-srd51-es.js',
  './src/data/spell-icon-registry.js', './src/data/srd-spellcasting-profiles.js',
  './src/data/srd-character-rules.js', './src/data/phb2014-expansion.js',
  './src/data/eberron-character-expansion.js', './src/data/feat-compendium.js',
  './src/data/monster-compendium-srd51.js', './src/data/equipment-compendium-srd51-es.js'
]) {
  if (!index.includes(reference)) fail(`index.html does not reference ${reference}`);
}

const serviceWorker = readText('service-worker.js');
for (const asset of ['./firebase-config.js', './src/services/firebase.js', './dist/App.js', './src/features/dice/dice-engine.js', './src/features/dice/dice-3d.js', './src/styles/dice.css', ...compiledModuleFiles.map(file => `./${file}`), './src/data/spell-library-srd51-es.js', './src/data/spell-icon-registry.js', './src/data/srd-spellcasting-profiles.js', './src/data/srd-character-rules.js', './src/data/phb2014-expansion.js', './src/data/eberron-character-expansion.js', './src/data/feat-compendium.js', './src/data/monster-compendium-srd51.js', './src/data/equipment-compendium-srd51-es.js']) {
  if (!serviceWorker.includes(asset)) fail(`service-worker.js does not cache ${asset}`);
}
if (!serviceWorker.includes('dnd-character-sheet-assets-v1') || !serviceWorker.includes('dnd-character-sheet-vendor-v1')) {
  fail('service-worker.js does not preserve stable image and vendor caches.');
}
for (const firebaseModule of ['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js', 'firebase-app-check.js']) {
  if (!serviceWorker.includes(firebaseModule)) fail(`service-worker.js does not cache ${firebaseModule}`);
}
if (!/caches\.open\(ASSET_CACHE\)[\s\S]*cacheRegisteredImages/.test(serviceWorker)) {
  fail('offline image warmup is not using the stable asset cache.');
}
if (!index.includes("window.addEventListener('online', resumeOptionalWarmup)")) {
  fail('offline image warmup does not resume when connectivity returns.');
}

const firebaseClient = readText('src/services/firebase.js');
if (!firebaseClient.includes('window.__FIREBASE_CONFIG__')) fail('Firebase client does not use the injected configuration.');
if (/AIza[\w-]{20,}/.test(firebaseClient)) fail('Firebase API key found in src/services/firebase.js.');

const spellLibrarySource = readText('src/data/spell-library-srd51-es.js');
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

const monsterCompendiumSource = readText('src/data/monster-compendium-srd51.js');
const monsterCompendiumMatch = monsterCompendiumSource.match(/const monsters = Object\.freeze\(\s*(\[.*\])\s*\);/s);
if (!monsterCompendiumMatch) {
  fail('monster-compendium-srd51.js is not a valid local compendium wrapper.');
} else {
  try {
    const monsters = JSON.parse(monsterCompendiumMatch[1]);
    if (!Array.isArray(monsters) || monsters.length === 0) {
      fail('monster compendium has no creatures.');
    }
    const invalidMonster = monsters.find(monster => (
      typeof monster?.id !== 'string' || !monster.id || typeof monster.name !== 'string' || !monster.name
      || !Number.isFinite(monster.maxHp) || monster.maxHp < 0
      || !Number.isFinite(monster.armorClass) || monster.armorClass < 0
      || !monster.details || typeof monster.details !== 'object'
    ));
    if (invalidMonster) fail(`monster compendium contains an invalid creature: ${invalidMonster?.id || 'unknown'}.`);
  } catch (error) {
    fail(`monster compendium JSON is invalid: ${error.message}`);
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
for (const asset of ['src', 'dist', 'assets']) {
  if (!deployWorkflow.includes(asset)) fail(`Pages artifact does not include ${asset}.`);
}

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
  if (!existsSync(resolve(root, file))) continue;
  const content = readText(file);
  if (/AIza[\w-]{20,}/.test(content)) fail(`possible Google API key found in tracked file: ${file}`);
  if (/BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/.test(content)) fail(`private key found in tracked file: ${file}`);
}

if (!process.exitCode) console.log('Release validation passed.');
