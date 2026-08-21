import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const libraryPath = path.join(projectRoot, 'spell-library-srd51-es.js');
const iconDirectory = path.join(projectRoot, 'assets', 'spell-icons');
const outputPath = path.join(projectRoot, 'spell-icon-registry.js');

const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const schoolColors = {
    'abjuracion': '34 211 238',
    'adivinacion': '96 165 250',
    'conjuracion': '167 139 250',
    'encantamiento': '244 114 182',
    'evocacion': '249 115 22',
    'ilusion': '129 140 248',
    'ilusionismo': '129 140 248',
    'nigromancia': '192 132 252',
    'transmutacion': '250 204 21'
};

const source = fs.readFileSync(libraryPath, 'utf8');
const sandbox = { window: {}, Object };
vm.runInNewContext(source, sandbox, { filename: libraryPath });
const spells = sandbox.window.DndSrdSpellLibrary?.spells || [];
const spellBySlug = new Map(spells.map(spell => [normalize(spell.name), spell]));
const iconFiles = fs.existsSync(iconDirectory)
    ? fs.readdirSync(iconDirectory)
        .filter(file => /\.(?:png|jpe?g|webp)$/i.test(file))
        .sort((left, right) => {
            const formatPriority = { '.png': 0, '.jpeg': 1, '.jpg': 2, '.webp': 3 };
            const leftPriority = formatPriority[path.extname(left).toLowerCase()] ?? 0;
            const rightPriority = formatPriority[path.extname(right).toLowerCase()] ?? 0;
            return leftPriority - rightPriority || left.localeCompare(right, 'es');
        })
    : [];

const registry = {};
const unmatched = [];
for (const file of iconFiles) {
    const slug = normalize(path.basename(file, path.extname(file)));
    const spell = spellBySlug.get(slug);
    if (!spell) {
        unmatched.push(file);
        continue;
    }
    registry[spell.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')] = {
        src: `assets/spell-icons/${file}`,
        rgb: schoolColors[normalize(spell.school)] || '167 139 250'
    };
}

const payload = `window.DndSpellIconRegistry = Object.freeze(${JSON.stringify(registry, null, 2)});\n`;
fs.writeFileSync(outputPath, payload, 'utf8');

console.log(`Registro de iconos actualizado: ${Object.keys(registry).length}/${spells.length}.`);
if (unmatched.length) console.warn(`Archivos sin conjuro asociado: ${unmatched.join(', ')}`);
