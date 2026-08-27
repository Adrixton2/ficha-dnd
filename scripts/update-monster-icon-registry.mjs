import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'monster-compendium-srd51.js');
const iconDirectory = path.join(root, 'assets', 'monster-icons');
const sandbox = { window: {}, Object };
vm.runInNewContext(fs.readFileSync(sourcePath, 'utf8'), sandbox, { filename: sourcePath });
const monsters = sandbox.window.DndSrdMonsterCompendium?.monsters || [];
const ids = new Set(monsters.map(monster => monster.id));
const registry = {};
const unmatched = [];
for (const file of (fs.existsSync(iconDirectory) ? fs.readdirSync(iconDirectory) : []).filter(file => /\.(?:png|jpe?g|webp)$/i.test(file)).sort((a, b) => a.localeCompare(b, 'es'))) {
    const id = path.basename(file, path.extname(file));
    if (!ids.has(id)) { unmatched.push(file); continue; }
    registry[id] = `assets/monster-icons/${file}`;
}
fs.writeFileSync(path.join(root, 'monster-icon-registry.js'), `window.DndMonsterIconRegistry = Object.freeze(${JSON.stringify(registry, null, 2)});\n`, 'utf8');
console.log(`Registro de iconos de criaturas actualizado: ${Object.keys(registry).length}/${monsters.length}.`);
if (unmatched.length) console.warn(`Archivos sin criatura asociada: ${unmatched.join(', ')}`);
