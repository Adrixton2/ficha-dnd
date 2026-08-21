import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const loadBrowserUtility = (file, globalName) => {
  const window = { crypto: globalThis.crypto };
  const context = vm.createContext({ window, console, Date, Math, Uint32Array, Array, Number, String, Boolean, JSON, Set, atob, btoa });
  vm.runInContext(readFileSync(resolve(root, file), 'utf8'), context, { filename: file });
  return window[globalName];
};

const initiative = loadBrowserUtility('online-initiative-utils.js', 'OnlineInitiativeUtils');
const table = loadBrowserUtility('online-table-utils.js', 'DndOnlineTableUtils');
const appUtils = loadBrowserUtility('app-utils.js', 'DndAppUtils');
const characterRules = loadBrowserUtility('srd-character-rules.js', 'DndSrdCharacterRules');
const spellcasting = loadBrowserUtility('srd-spellcasting-profiles.js', 'DndSrdSpellcasting');

test('spell text search ignores accents and imported line-break hyphens are repaired', () => {
  assert.equal(appUtils.normalizeRuleLookupText('Guía'), 'guia');
  assert.equal(appUtils.normalizeRuleLookupText('PROYECCIÓN ASTRAL'), 'proyeccion astral');
  assert.equal(appUtils.repairSrdLineBreakHyphens('una caracterís- tica permanente- mente'), 'una característica permanentemente');
  assert.equal(appUtils.repairSrdLineBreakHyphens('niebla amarillo- verdosa'), 'niebla amarillo-verdosa');
});

test('initiative keeps a stable descending order and leaves empty values last', () => {
  const ordered = initiative.sortCombatantIdsByInitiative(['a', 'b', 'c', 'd'], {
    a: { initiative: 4 }, b: { initiative: null }, c: { initiative: 15 }, d: { initiative: 4 }
  });
  assert.deepEqual([...ordered], ['c', 'a', 'd', 'b']);
});

test('next turn skips defeated enemies and advances the round on wrap', () => {
  const result = initiative.findNextEligibleTurn({
    turnOrder: ['a', 'b', 'c'], currentIndex: 1, currentRound: 1,
    combatantsById: { a: {}, b: {}, c: { type: 'enemy', defeated: true } }
  });
  assert.equal(result.nextIndex, 0);
  assert.equal(result.nextRound, 2);
  assert.equal(result.nextId, 'a');
});

test('postponing does not duplicate or replace the current combatant', () => {
  const result = initiative.moveCurrentCombatant({
    turnOrder: ['a', 'b', 'c'], currentTurnId: 'a', destinationMode: 'after-combatant', destinationId: 'c'
  });
  assert.equal(result.currentTurnId, 'a');
  assert.deepEqual([...result.turnOrder], ['b', 'c', 'a']);
  assert.equal(new Set(result.turnOrder).size, result.turnOrder.length);
});

test('enemy visible state and hit points normalize safely', () => {
  assert.equal(table.calculateEnemyVisibleState('8', '12', 'automatic', ''), 'herido');
  assert.equal(table.calculateEnemyVisibleState(0, 12, 'automatic', ''), 'derrotado');
  assert.deepEqual(JSON.parse(JSON.stringify(table.getHpValues({ currentHp: '-2', maxHp: '12', tempHp: '' }))), {
    currentHp: 0, maxHp: 12, tempHp: 0
  });
});

test('condition normalization supports legacy strings without empty records', () => {
  const conditions = table.normalizeOnlineConditions(['Invisible', '', { name: 'Asustado' }]);
  assert.equal(conditions.length, 2);
  assert.deepEqual(Array.from(conditions, condition => condition.name), ['Invisible', 'Asustado']);
});

test('character presentation normalizes identity, privacy and featured references safely', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(appUtils.normalizeCharacterPresentation({ accent: 'crimson', tagline: 'A'.repeat(140), visibility: 'full', featuredTraitId: 'trait_1', featuredItemId: 7 }))), {
    accent: 'crimson', tagline: 'A'.repeat(120), visibility: 'full', featuredTraitId: 'trait_1', featuredItemId: '', featuredSpellId: ''
  });
  assert.deepEqual(JSON.parse(JSON.stringify(appUtils.normalizeCharacterPresentation({ accent: 'pink', visibility: 'private' }))), {
    accent: 'violet', tagline: '', visibility: 'profile', featuredTraitId: '', featuredItemId: '', featuredSpellId: ''
  });
});

test('a new character starts empty while retaining neutral technical defaults', () => {
  const data = appUtils.createBlankCharacterData();
  assert.equal(data.level, '1');
  assert.deepEqual(JSON.parse(JSON.stringify(data.resources)), []);
  assert.deepEqual(JSON.parse(JSON.stringify(data.spells)), []);
  assert.deepEqual(JSON.parse(JSON.stringify(data.inventory)), []);
  assert.equal(data.hp.current, '');
  assert.equal(data.hp.temp, '0');
  assert.equal(data.characterBuild.autoFeatures, true);
  assert.equal(data.narrative.history, '');
  assert.equal(Object.keys(data.narrative).length, 15);
});

test('character migration gives older sheets a complete character build without removing manual data', () => {
  const normalized = appUtils.normalizeGrimoireData({
    traits: [{ title: 'Rasgo manual', desc: 'Permanece editable.' }],
    characterBuild: { classId: 'rogue' }
  });
  assert.equal(normalized.characterBuild.classId, 'rogue');
  assert.equal(normalized.characterBuild.autoHitDie, true);
  assert.equal(normalized.traits[0].title, 'Rasgo manual');
  assert.equal(normalized.narrative.alignment, '');
  const narrative = appUtils.normalizeGrimoireData({ narrative: { alignment: 'Neutral bueno', age: 27, unknown: 'ignorado' } }).narrative;
  assert.equal(narrative.alignment, 'Neutral bueno');
  assert.equal(narrative.age, '27');
  assert.equal(narrative.unknown, undefined);
});

test('weapon ammunition migration preserves links and gives legacy weapons safe defaults', () => {
  const normalized = appUtils.normalizeGrimoireData({
    inventory: [{ id: 'ammo_arrows', name: 'Flechas', qty: '20', desc: 'Carcaj' }],
    weapons: [
      { id: 'bow', name: 'Arco largo', usesAmmo: true, ammoItemId: 'ammo_arrows', ammoPerShot: '2', attacks: [{ name: 'Disparo' }] },
      { id: 'sword', name: 'Espada larga', attacks: [] }
    ]
  });
  assert.equal(normalized.inventory[0].qty, 20);
  assert.equal(normalized.weapons[0].usesAmmo, true);
  assert.equal(normalized.weapons[0].ammoItemId, 'ammo_arrows');
  assert.equal(normalized.weapons[0].ammoPerShot, 2);
  assert.equal(normalized.weapons[1].usesAmmo, false);
  assert.equal(normalized.weapons[1].ammoItemId, '');
  assert.equal(normalized.weapons[1].ammoPerShot, 1);
});

test('proficiency entries normalize their category and source without affecting skill proficiencies', () => {
  const normalized = appUtils.normalizeGrimoireData({
    proficiencies: { proficient: ['sigilo'], expertise: ['percepcion'] },
    proficiencyEntries: [
      { id: 'lang_1', category: 'languages', name: ' Élfico ', source: 'Especie' },
      { category: 'unknown', name: 'Regla casera', source: 42 },
      { category: 'tools', name: '   ', source: 'Trasfondo' }
    ]
  });
  assert.deepEqual(JSON.parse(JSON.stringify(normalized.proficiencies)), { proficient: ['sigilo'], expertise: ['percepcion'] });
  assert.equal(normalized.proficiencyEntries.length, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(normalized.proficiencyEntries[0])), { id: 'lang_1', category: 'languages', name: 'Élfico', source: 'Especie', autoKey: '', hidden: false, nameEdited: false, sourceEdited: false });
  assert.equal(normalized.proficiencyEntries[1].category, 'custom');
  assert.equal(normalized.proficiencyEntries[1].source, '');
});

test('SRD proficiency suggestions combine class, species and background with stable editable keys', () => {
  const entries = appUtils.getSrdProficiencySuggestions({ classId: 'rogue', speciesId: 'elf', backgroundId: 'criminal' });
  assert.ok(entries.some(entry => entry.category === 'armor' && entry.name.includes('ligeras')));
  assert.ok(entries.some(entry => entry.category === 'languages' && entry.name === 'Élfico'));
  assert.ok(entries.some(entry => entry.category === 'games'));
  assert.ok(entries.some(entry => entry.category === 'tools' && entry.name === 'Herramientas de ladrón'));
  const thievesTools = entries.filter(entry => entry.category === 'tools' && entry.name === 'Herramientas de ladrón');
  assert.equal(thievesTools.length, 1);
  assert.equal(thievesTools[0].source, 'Clase · Trasfondo');
  assert.ok(entries.every(entry => !entry.source.includes('SRD')));
  assert.equal(new Set(entries.map(entry => entry.autoKey)).size, entries.length);
});

test('active concentration keeps the spell and start time while rejecting incomplete reminders', () => {
  const startedAt = '2026-08-15T10:30:00.000Z';
  const active = appUtils.normalizeGrimoireData({ activeConcentration: { spellId: 'spell_1', spellName: 'Bendecir', startedAt } }).activeConcentration;
  assert.deepEqual(JSON.parse(JSON.stringify(active)), { spellId: 'spell_1', spellName: 'Bendecir', startedAt });
  assert.equal(appUtils.normalizeGrimoireData({ activeConcentration: { spellName: '' } }).activeConcentration, null);
});

test('granted spells preserve origin, limits and independent uses', () => {
  const spell = appUtils.normalizeSpell({ name: 'Paso brumoso', level: 2, grantType: 'item', grantSource: 'Capa feérica', countsPreparation: false, countsKnownLimit: false, castingResource: 'independent', ownUsesMax: 3, ownUsesCurrent: 2 });
  assert.equal(spell.grantType, 'item');
  assert.equal(spell.grantSource, 'Capa feérica');
  assert.equal(spell.countsPreparation, false);
  assert.equal(spell.countsKnownLimit, false);
  assert.equal(spell.castingResource, 'independent');
  assert.equal(spell.ownUsesCurrent, 2);
  assert.equal(spell.ownUsesMax, 3);
});

test('class resource suggestions use safe 2014 progressions without touching sheet state', () => {
  const monk = appUtils.getSuggestedClassResources({ className: 'Monje', level: 5 });
  assert.deepEqual(JSON.parse(JSON.stringify(monk)), [{
    key: 'ki', name: 'Puntos de Ki', max: 5, type: '', recoveryRest: 'short', recoveryMode: 'full', aliases: ['puntos de ki', 'ki']
  }]);

  const soulknife = appUtils.getSuggestedClassResources({ className: 'Pícaro', subclassName: 'Cuchillas de alma', level: 5 });
  assert.equal(soulknife[0].name, 'Dados psiónicos');
  assert.equal(soulknife[0].max, 6);
  assert.equal(soulknife[0].type, 'd8');
  const fighter = appUtils.getSuggestedClassResources({ className: 'Guerrero', level: 17 });
  assert.equal(fighter.find(resource => resource.key === 'second-wind').max, 1);
  assert.equal(fighter.find(resource => resource.key === 'action-surge').max, 2);
  const bard = appUtils.getSuggestedClassResources({ className: 'Bardo', level: 5, charismaModifier: 4 });
  assert.equal(bard[0].max, 4);
  assert.equal(bard[0].recoveryRest, 'short');
  assert.equal(appUtils.getSuggestedClassResources({ className: 'Mago', level: 10 }).length, 0);
});

test('rule catalogs resolve class, subclass and class spellcasting progression', () => {
  const rogue = characterRules.getClassForName('Pícaro (Soulknife)');
  const soulknife = characterRules.getSubclassForName('Cuchillas de alma', rogue.id);
  const features = characterRules.getFeaturesForBuild({
    classId: rogue.id,
    subclassId: soulknife.id,
    speciesId: 'shadar-kai',
    level: 5
  });
  assert.equal(rogue.id, 'rogue');
  assert.ok(soulknife);
  assert.ok(features.some(feature => feature.name === 'Susurros psíquicos'));
  assert.equal(spellcasting.getProfileForClass('Paladín').mode, 'prepared');
  assert.equal(spellcasting.getProfileForClass('Mago').requiresSpellbook, true);
  assert.deepEqual([...spellcasting.getProgressionValue(spellcasting.profiles.paladin.slotProgression, 5)], [4, 2]);
});

test('fixed spell grants unlock by source and character level without expanded lists', () => {
  const tiefling = characterRules.getAutomaticSpellGrantsForBuild({ speciesId: 'tiefling', level: 5 });
  assert.deepEqual([...tiefling.map(grant => grant.spellId)], [
    'srd51-es-taumaturgia',
    'srd51-es-reprensio-n-infernal',
    'srd51-es-oscuridad'
  ]);
  assert.equal(tiefling.every(grant => grant.mode === 'known'), true);
  assert.equal(tiefling.every(grant => grant.sourceType === 'species'), true);
  assert.equal(tiefling.every(grant => grant.sourceType === 'species'), true);

  const devotion = characterRules.getAutomaticSpellGrantsForBuild({ subclassId: 'devotion', level: 5 });
  assert.equal(devotion.length, 4);
  assert.equal(devotion.every(grant => grant.mode === 'prepared'), true);
  assert.equal(devotion.every(grant => grant.sourceType === 'subclass'), true);
  assert.equal(devotion.every(grant => grant.sourceType === 'subclass'), true);
  assert.equal(devotion.some(grant => grant.spellId === 'srd51-es-reprensio-n-infernal'), false);
});
