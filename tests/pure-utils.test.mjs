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

const initiative = loadBrowserUtility('src/features/online-table/utils/initiative.js', 'OnlineInitiativeUtils');
const table = loadBrowserUtility('src/features/online-table/utils/online-table-utils.js', 'DndOnlineTableUtils');
const appUtils = loadBrowserUtility('src/shared/utils/app-utils.js', 'DndAppUtils');
const characterRules = loadBrowserUtility('src/data/srd-character-rules.js', 'DndSrdCharacterRules');
const spellcasting = loadBrowserUtility('src/data/srd-spellcasting-profiles.js', 'DndSrdSpellcasting');
const dice = loadBrowserUtility('src/features/dice/dice-engine.js', 'DndDiceEngine');
const dice3d = loadBrowserUtility('src/features/dice/dice-3d.js', 'DndDice3D');

test('dice formulas parse mixed polyhedra and modifiers without ambiguity', () => {
  const parsed = dice.parseDiceFormula('1d8 + 2d6 + 5');
  assert.equal(parsed.totalDice, 3);
  assert.deepEqual(Array.from(parsed.terms, term => term.type === 'dice' ? `${term.count}d${term.sides}` : term.value), ['1d8', '2d6', 5]);
  const built = dice.formatDiceFormula([{ sides: 20, count: 1 }, { sides: 10, count: 1 }], 0);
  assert.equal(built, '1d20+1d10');
  assert.equal(dice.parseDiceFormula(built).totalDice, 2);
  assert.throws(() => dice.parseDiceFormula('1d202d6'), /fórmula/i);
  assert.throws(() => dice.parseDiceFormula('-1d20'), /restar dados/i);
});

test('dice formulas can be extracted from weapon and spell descriptions', () => {
  assert.equal(dice.extractDiceFormula('1d8 + 4 cortante'), '1d8+4');
  assert.equal(dice.extractDiceFormula('Recupera 2d6 + 3 puntos de golpe'), '2d6+3');
  assert.equal(dice.extractDiceFormula('Daño fijo: 5'), '');
});

test('dice engine keeps logical totals, advantage and percentile visuals consistent', () => {
  const values = [.01, .49, .99];
  const mixed = dice.rollDice('1d8+2d6+5', { random: () => values.shift() });
  assert.equal(mixed.naturalTotal, 10);
  assert.equal(mixed.total, 15);

  const advantageValues = [.2, .8];
  const advantage = dice.rollDice('1d20+7', { advantage: true, difficultyClass: 20, random: () => advantageValues.shift() });
  assert.deepEqual(Array.from(advantage.terms[0].rolls), [5, 17]);
  assert.equal(advantage.primaryNatural, 17);
  assert.equal(advantage.total, 24);
  assert.equal(advantage.success, true);
  assert.equal(advantage.visualDice.find(item => item.state === 'selected').result, 17);

  const percentile = dice.rollDice('1d100', { random: () => .999999 });
  assert.equal(percentile.total, 100);
  assert.deepEqual(Array.from(percentile.visualDice, item => [item.result, item.displayValue]), [[10, '00'], [10, '0']]);

  const sheetRoll = dice.rollDice('1d20', { modifiers: [{ label: 'Destreza', value: 4 }, { label: 'Competencia', value: 3 }], displayFormula: '1d20+7', random: () => .5 });
  assert.equal(sheetRoll.total, 18);
  assert.equal(sheetRoll.modifierTotal, 7);
  assert.equal(sheetRoll.displayFormula, '1d20+7');
});

test('spell dice plans scale damage, healing and cantrips at the selected level', () => {
  const fireball = appUtils.getSpellDicePlan({
    name: 'Bola de fuego', level: 3, school: 'Evocación',
    description: 'Cada objetivo sufrirá 8d6 de daño de fuego. A niveles superiores. El daño aumenta en 1d6 por cada nivel por encima de 3.'
  }, { slotLevel: 5, characterLevel: 9, spellcastingModifier: 4 });
  assert.equal(fireball.formula, '10d6');
  assert.deepEqual(Array.from(fireball.palette.rgb), [249, 115, 22]);

  const healing = appUtils.getSpellDicePlan({
    name: 'Curar heridas', level: 1, school: 'Evocación',
    description: 'Recupera una cantidad de puntos de golpe igual a 1d8 + tu modificador por aptitud mágica. A niveles superiores. La curación aumenta en 1d8 por cada nivel por encima de 1.'
  }, { slotLevel: 3, characterLevel: 5, spellcastingModifier: 4 });
  assert.equal(healing.formula, '3d8');
  assert.equal(healing.modifiers[0].value, 4);
  assert.equal(healing.palette.key, 'curacion');

  const cantrip = appUtils.getSpellDicePlan({
    name: 'Agarre electrizante', level: 0, school: 'Evocación',
    description: 'Haz un ataque de conjuro. Si impacta, recibe 1d8 de daño de relámpago. El daño aumenta en 1d8 al nivel 5 (2d8), nivel 11 (3d8) y nivel 17 (4d8).'
  }, { characterLevel: 11, spellcastingModifier: 3 });
  assert.equal(cantrip.formula, '3d8');
  assert.equal(cantrip.attackCount, 1);
  assert.equal(cantrip.palette.key, 'relampago');
});

test('multi-attack spell plans keep one damage packet per ray and count upcast rays', () => {
  const scorchingRay = appUtils.getSpellDicePlan({
    name: 'Rayo abrasador', level: 2, school: 'Evocación',
    description: 'Creas tres rayos de fuego. Haz un ataque de conjuro a distancia por cada rayo. Si impacta, recibe 2d6 de daño de fuego. A niveles superiores. Puedes crear un rayo adicional por cada nivel por encima de 2.'
  }, { slotLevel: 4, characterLevel: 7, spellcastingModifier: 3 });
  assert.equal(scorchingRay.attackCount, 5);
  assert.equal(scorchingRay.perAttackFormula, '2d6');

  const eldritchBlast = appUtils.getSpellDicePlan({
    name: 'Descarga sobrenatural', level: 0, school: 'Evocación',
    description: 'Haz un ataque de conjuro. Si impacta, recibe 1d10 de daño de fuerza. El conjuro crea más de un rayo cuando alcanzas niveles superiores: dos rayos en el nivel 5, tres rayos en el nivel 11 y cuatro rayos en el nivel 17. Realiza una tirada de ataque por separado para cada rayo.'
  }, { characterLevel: 17, spellcastingModifier: 5 });
  assert.equal(eldritchBlast.attackCount, 4);
  assert.equal(eldritchBlast.perAttackFormula, '1d10');
});

test('dice rolls preserve a custom spell palette through selected rerolls', () => {
  const rolled = dice.rollDice('2d6', { dicePalette: [249, 115, 22], random: () => .2 });
  const rerolled = dice.rerollDiceResult(rolled, ['dice_0_0'], { random: () => .9 });
  assert.deepEqual(Array.from(rolled.dicePalette), [249, 115, 22]);
  assert.deepEqual(Array.from(rerolled.dicePalette), [249, 115, 22]);
});

test('selected logical dice can be rerolled without changing the rest of the result', () => {
  const values = [.1, .8];
  const original = dice.rollDice('2d6+3', { random: () => values.shift(), followUp: { type: 'weapon-damage', formula: '1d6' } });
  const rerolled = dice.rerollDiceResult(original, ['dice_0_0'], { random: () => .99 });
  assert.deepEqual(Array.from(original.terms[0].rolls), [1, 5]);
  assert.deepEqual(Array.from(rerolled.terms[0].rolls), [6, 5]);
  assert.equal(original.total, 9);
  assert.equal(rerolled.total, 14);
  assert.equal(rerolled.rerollCount, 1);
  assert.deepEqual(Array.from(rerolled.rerolledGroupIds), ['dice_0_0']);
  assert.equal(rerolled.followUp.type, 'weapon-damage');
  assert.notEqual(rerolled.id, original.id);
  assert.throws(() => dice.rerollDiceResult(original, ['missing']), /selecciona/i);
});

test('rerolling an advantage die recalculates the used natural result and critical state', () => {
  const values = [.999999, .5];
  const original = dice.rollDice('1d20+4', { advantage: true, random: () => values.shift() });
  const rerolled = dice.rerollDiceResult(original, ['dice_0_0'], { random: () => 0 });
  assert.equal(original.primaryNatural, 20);
  assert.equal(original.critical, true);
  assert.deepEqual(Array.from(rerolled.terms[0].rolls), [1, 11]);
  assert.equal(rerolled.primaryNatural, 11);
  assert.equal(rerolled.total, 15);
  assert.equal(rerolled.critical, false);
});

test('percentile visuals reroll as one logical die and critical formulas double only dice', () => {
  const original = dice.rollDice('1d100', { random: () => .45 });
  const rerolled = dice.rerollDiceResult(original, ['dice_0_0'], { random: () => .999999 });
  assert.equal(rerolled.total, 100);
  assert.deepEqual(Array.from(rerolled.visualDice, item => item.groupId), ['dice_0_0', 'dice_0_0']);
  assert.deepEqual(Array.from(rerolled.visualDice, item => item.displayValue), ['00', '0']);
  assert.equal(dice.doubleDiceFormula('1d8+3d6+4'), '2d8+6d6+4');
});

test('combined damage keeps a per-hit breakdown and updates it after rerolls', () => {
  const values = [0, .5, .99];
  const combined = dice.rollDice('1d6+3+2d8', {
    random: () => values.shift(),
    modifiers: [{ label: 'Segundo impacto · Destreza', value: 4 }],
    damageGroups: [
      { label: 'Primer impacto', formula: '1d6+3', termCount: 2, modifierTotal: 0 },
      { label: 'Segundo impacto', formula: '2d8+4', termCount: 1, modifierTotal: 4 }
    ]
  });
  assert.equal(combined.total, 21);
  assert.deepEqual(Array.from(combined.damageBreakdown, group => [group.label, group.total]), [['Primer impacto', 4], ['Segundo impacto', 17]]);
  const rerolled = dice.rerollDiceResult(combined, ['dice_2_1'], { random: () => 0 });
  assert.equal(rerolled.total, 14);
  assert.deepEqual(Array.from(rerolled.damageBreakdown, group => group.total), [4, 10]);
});

test('every supported 3D polyhedron can orient the requested face towards the camera', () => {
  for (const sides of [4, 6, 8, 10, 12, 20]) {
    const geometry = dice3d.getGeometry(sides);
    assert.equal(geometry.faces.length, sides);
    for (const face of geometry.faces) {
      const target = dice3d.getTargetQuaternion(geometry, face.value);
      assert.equal(dice3d.getFrontFaceValue(geometry, target), face.value);
    }
  }
  assert.equal(dice3d.getGeometry(8).faces.every(face => face.indices.length === 3), true);
  assert.equal(dice3d.getGeometry(10).vertices.length, 7);
  assert.equal(dice3d.getGeometry(10).faces.every(face => face.indices.length === 3), true);
});

test('the landed face stays blank until the result reveal', () => {
  const labels = [];
  const gradient = { addColorStop() {} };
  const context = {
    canvas: { width: 240, height: 240 },
    clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, fill() {}, stroke() {}, save() {}, restore() {}, fillRect() {},
    createRadialGradient() { return gradient; },
    fillText(value) { labels.push(String(value)); }
  };
  const geometry = dice3d.getGeometry(20);
  const rotation = dice3d.getTargetQuaternion(geometry, 20);
  dice3d.drawDie(context, geometry, rotation, { result: 20, settled: false, hideResultLabel: true });
  assert.equal(labels.includes('20'), false);
  labels.length = 0;
  dice3d.drawDie(context, geometry, rotation, { result: 20, settled: true, hideResultLabel: false, resultReveal: 0, resultTone: 'critical' });
  assert.equal(labels.includes('20'), false);
  labels.length = 0;
  dice3d.drawDie(context, geometry, rotation, { result: 20, settled: true, hideResultLabel: false });
  assert.equal(labels.includes('20'), true);
  labels.length = 0;
  dice3d.drawDie(context, geometry, rotation, { result: 20, settled: true, hideResultLabel: false, resultNeighborhoodFade: 1 });
  const resultFace = geometry.faces.find(face => face.value === 20);
  const allowedLabels = new Set(geometry.faces
    .filter(face => face.value === 20 || face.indices.filter(index => resultFace.indices.includes(index)).length >= 2)
    .map(face => String(face.value)));
  assert.equal(labels.includes('20'), true);
  assert.equal(labels.every(label => allowedLabels.has(label)), true);
  assert.ok(labels.length <= 4);
});

test('online player names are cleaned and require a recognizable name', () => {
  assert.equal(table.normalizeOnlinePlayerName('  Ana   María  '), 'Ana María');
  assert.equal(table.normalizeOnlinePlayerName(`Al\u0000ba`), 'Alba');
  assert.equal(table.normalizeOnlinePlayerName('a'.repeat(60)).length, 40);
  assert.equal(table.normalizeOnlineRoomCode(' bbet kmsb gctg '), 'BBETKMSBGCTG');
  assert.equal(table.normalizeOnlineRoomCode('https://example.test/?room=bbetkmsbgctg'), 'BBETKMSBGCTG');
  assert.equal(table.isValidOnlinePlayerName(' A '), false);
  assert.equal(table.isValidOnlinePlayerName(' Alex '), true);
});

test('spell text search ignores accents and imported line-break hyphens are repaired', () => {
  assert.equal(appUtils.normalizeRuleLookupText('Guía'), 'guia');
  assert.equal(appUtils.normalizeRuleLookupText('PROYECCIÓN ASTRAL'), 'proyeccion astral');
  assert.equal(appUtils.repairSrdLineBreakHyphens('una caracterís- tica permanente- mente'), 'una característica permanentemente');
  assert.equal(appUtils.repairSrdLineBreakHyphens('niebla amarillo- verdosa'), 'niebla amarillo-verdosa');
});

test('initiative helpers calculate DEX modifiers and independent or shared totals', () => {
  assert.equal(table.calculateAbilityModifier(9), -1);
  assert.equal(table.calculateAbilityModifier(10), 0);
  assert.equal(table.calculateAbilityModifier(18), 4);

  const individualRoll = dice.rollDice('2d20', { random: (() => { const values = [.2, .7]; return () => values.shift(); })() });
  const entries = [{ id: 'a', name: 'A', modifier: -1 }, { id: 'b', name: 'B', modifier: 3 }];
  const individual = dice.resolveInitiativeAssignments(individualRoll, entries, 'individual');
  assert.deepEqual(Array.from(individual, item => [item.natural, item.total]), [[5, 4], [15, 18]]);

  const sharedRoll = dice.rollDice('1d20', { random: () => .5 });
  const shared = dice.resolveInitiativeAssignments(sharedRoll, entries, 'shared');
  assert.deepEqual(Array.from(shared, item => [item.natural, item.total]), [[11, 10], [11, 14]]);
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

test('online player sheet snapshot exposes master essentials but excludes private notes', () => {
  const character = {
    meta: { id: 'pj_1', name: 'Kael' },
    data: {
      charInfo: { name: 'Kael', race: 'Humano', cls: 'Guerrero' }, level: 5,
      stats: { fue: 16, des: 14, con: 12, int: 10, sab: 13, car: 8 }, tempStats: {},
      hp: { current: 27, max: 35, temp: 4 }, speed: '30 pies', size: 'Mediano',
      inventory: [{ name: 'Cuerda', qty: 2, desc: '15 metros' }],
      weapons: [{ name: 'Espada larga', attacks: [{ name: 'Ataque', atk: '+6', dmg: '1d8+3' }] }],
      spells: [{ name: 'Luz', level: 0, prepared: true }],
      narrative: { history: 'SECRETO_DEL_JUGADOR' }, sessionNotes: 'OTRO_SECRETO'
    }
  };
  const snapshot = table.createOnlinePlayerSheetSnapshot(character, { armorClass: 18, characterRules });
  const serialized = table.serializeOnlinePlayerSheetSnapshot(snapshot);
  const parsed = table.parseOnlinePlayerSheetSnapshot(serialized);
  assert.equal(parsed.identity.name, 'Kael');
  assert.equal(parsed.combat.armorClass, 18);
  assert.equal(parsed.inventory[0].name, 'Cuerda');
  assert.equal(parsed.weapons[0].name, 'Espada larga');
  assert.equal(parsed.spells[0].name, 'Luz');
  assert.equal(serialized.includes('SECRETO_DEL_JUGADOR'), false);
  assert.equal(serialized.includes('OTRO_SECRETO'), false);
  assert.equal(Object.hasOwn(parsed, 'narrative'), false);
  const dynamicCharacter = JSON.parse(JSON.stringify(character));
  dynamicCharacter.data.inspiration = true;
  dynamicCharacter.data.guidance = true;
  dynamicCharacter.data.spellSlots = { 1: { current: 1, max: 3 } };
  dynamicCharacter.data.resources = [{ name: 'Segundo aliento', current: 0, max: 1 }];
  dynamicCharacter.data.companions = [{ id: 'comp_1', name: 'Nimbo', category: 'familiar', currentHp: 5, maxHp: 7, tempHp: 0, armorClass: 12, participates: true, initiativeMode: 'after-owner', conditions: ['Invisible'], details: { type: 'Bestia', speedText: '3 m, volar 18 m', abilities: { str: 3, dex: 15, con: 8, int: 2, wis: 12, cha: 7 }, traits: [{ name: 'Vista aguda', desc: 'Ventaja en Percepción visual.' }], actions: [] } }];
  const dynamic = table.createOnlinePlayerSheetSnapshot(dynamicCharacter, { armorClass: 18, characterRules });
  assert.equal(dynamic.combat.inspiration, true);
  assert.equal(dynamic.combat.guidance, true);
  assert.equal(dynamic.spellcasting.slots[0].current, 1);
  assert.equal(dynamic.resources[0].current, 0);
  assert.equal(dynamic.companions[0].name, 'Nimbo');
  assert.equal(dynamic.companions[0].participates, true);
  assert.equal(dynamic.companions[0].details.traits[0].name, 'Vista aguda');
  assert.notEqual(table.serializeOnlinePlayerSheetSnapshot(dynamic), serialized);
});

test('online companions become stable public combatants and follow their owner in initiative', () => {
  const companion = table.createOnlineCompanionParticipant({
    id: 'nimbo/uno', name: 'Nimbo', category: 'familiar', currentHp: 5, maxHp: 7, tempHp: 1,
    armorClass: 12, initiativeMode: 'after-owner', initiative: 19, conditions: ['Invisible'], avatarPath: 'assets/monster-icons/owl.webp'
  }, { ownerUid: 'player_1', characterId: 'pj_1', ownerInitiative: 14 });
  assert.equal(companion.id, 'companion_player_1_nimbo_uno');
  assert.equal(companion.type, 'companion');
  assert.equal(companion.initiative, 14);
  assert.equal(companion.conditions[0].name, 'Invisible');
  assert.equal(companion.avatarPath, 'assets/monster-icons/owl.webp');

  const enemy = { id: 'enemy_1', type: 'enemy', name: 'Orco', initiative: 14 };
  const owner = { id: 'player_1', ownerUid: 'player_1', type: 'player', name: 'Kael', initiative: 14 };
  const faster = { id: 'player_2', ownerUid: 'player_2', type: 'player', name: 'Lira', initiative: 18 };
  const order = table.orderOnlineEncounterCombatants([companion, enemy, owner, faster]).map(combatant => combatant.id);
  assert.deepEqual(Array.from(order), ['player_2', 'player_1', companion.id, 'enemy_1']);
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
  assert.equal(data.guidance, false);
  assert.deepEqual(JSON.parse(JSON.stringify(data.resources)), []);
  assert.deepEqual(JSON.parse(JSON.stringify(data.spells)), []);
  assert.deepEqual(JSON.parse(JSON.stringify(data.inventory)), []);
  assert.deepEqual(JSON.parse(JSON.stringify(data.companions)), []);
  assert.equal(data.hp.current, '');
  assert.equal(data.hp.temp, '0');
  assert.equal(data.characterBuild.autoFeatures, true);
  assert.equal(data.narrative.history, '');
  assert.equal(Object.keys(data.narrative).length, 15);
});

test('sheet review reports only objective omissions and contradictory live values', () => {
  const blank = appUtils.createBlankCharacterData();
  const incomplete = appUtils.reviewCharacterSheet(blank);
  assert.equal(incomplete.status, 'attention');
  assert.equal(incomplete.issues.some(issue => issue.id === 'name'), true);
  assert.equal(incomplete.issues.some(issue => issue.id === 'max-hp'), true);
  assert.equal(incomplete.issues.some(issue => issue.id === 'abilities'), true);

  const ready = appUtils.reviewCharacterSheet({
    ...blank,
    charInfo: { name: 'Kael', race: 'Humano', cls: 'Guerrero' }, level: '5', speed: '30',
    hp: { current: '27', max: '35', temp: '0' }, hitDice: { current: '3', type: 'd10' },
    stats: { fue: '16', des: '14', con: '12', int: '10', sab: '13', car: '8' },
    resources: [{ id: 'surge', name: 'Oleada de acción', current: 1, max: 1 }]
  });
  assert.equal(ready.status, 'ready');
  assert.equal(ready.issues.length, 0);

  const contradictory = appUtils.reviewCharacterSheet({
    ...blank,
    charInfo: { name: 'Nara', race: 'Elfa', cls: 'Maga' }, level: '3', speed: '30',
    hp: { current: 14, max: 12 }, hitDice: { current: 4, type: 'd6' },
    stats: { fue: 8, des: 14, con: 12, int: 16, sab: 10, car: 10 },
    spellSlots: { 1: { current: 5, max: 4 } }, grimoireConfig: { spellcastingAbility: '' },
    companions: [{ id: 'owl', name: 'Nimbo', participates: true, maxHp: 0, initiativeMode: 'own', initiative: null }]
  }, { spellcastingExpected: true });
  assert.equal(contradictory.issues.some(issue => issue.id === 'current-hp'), true);
  assert.equal(contradictory.issues.some(issue => issue.id === 'hit-dice-current'), true);
  assert.equal(contradictory.issues.some(issue => issue.id === 'slot-1'), true);
  assert.equal(contradictory.issues.some(issue => issue.id === 'spellcasting-ability'), true);
  assert.deepEqual(
    JSON.parse(JSON.stringify(contradictory.issues.find(issue => issue.id === 'companion-hp-owl'))),
    {
      id: 'companion-hp-owl', severity: 'important', section: 'companions', companionId: 'owl', field: 'maxHp',
      title: 'Nimbo no tiene PV', detail: 'Define sus PV máximos antes de incluirlo en un combate.'
    }
  );
  assert.equal(contradictory.issues.find(issue => issue.id === 'companion-initiative-owl')?.field, 'initiative');
});

test('rest preview separates automatic recovery from manual decisions safely', () => {
  const data = {
    ...appUtils.createBlankCharacterData(),
    level: '5',
    hp: { current: '8', max: '20', temp: '6' },
    hitDice: { current: '1', type: 'd8' },
    deathSaves: { successes: 1, failures: 2 },
    resources: [
      { id: 'short', name: 'Recurso corto', current: 0, max: 2, recoveryRest: 'short', recoveryMode: 'full' },
      { id: 'long', name: 'Recurso largo', current: 0, max: 1, recoveryRest: 'long', recoveryMode: 'full' },
      { id: 'manual', name: 'Recurso manual', current: 0, max: 3, recoveryRest: 'short', recoveryMode: 'manual' }
    ],
    spellSlots: { 1: { current: 0, max: 4 } },
    grimoireConfig: { ...appUtils.createDefaultGrimoireConfig(), usePactMagic: true, pactSlots: { current: 0, max: 2, level: 2 } },
    conditions: [{ name: 'Envenenado' }],
    activeConcentration: { spellId: 'spell_1', spellName: 'Detectar magia', startedAt: new Date().toISOString() }
  };

  const shortRest = appUtils.calculateRestPreview('short', data, 1, 7);
  assert.equal(shortRest.data.hp.current, '15');
  assert.equal(shortRest.data.hp.temp, '6');
  assert.equal(shortRest.data.hitDice.current, '0');
  assert.equal(shortRest.data.resources.find(resource => resource.id === 'short').current, 2);
  assert.equal(shortRest.data.resources.find(resource => resource.id === 'long').current, 0);
  assert.equal(shortRest.manualActions.some(action => action.id === 'resource-manual'), true);
  assert.equal(shortRest.manualActions.some(action => action.id === 'conditions'), true);
  assert.equal(shortRest.manualActions.some(action => action.id === 'concentration'), true);

  const longRest = appUtils.calculateRestPreview('long', data);
  assert.equal(longRest.data.hp.current, '20');
  assert.equal(longRest.data.hp.temp, '0');
  assert.deepEqual(JSON.parse(JSON.stringify(longRest.data.deathSaves)), { successes: 0, failures: 0 });
  assert.equal(longRest.data.hitDice.current, '3');
  assert.equal(longRest.data.spellSlots[1].current, 4);
  assert.equal(longRest.data.resources.find(resource => resource.id === 'short').current, 2);
  assert.equal(longRest.data.resources.find(resource => resource.id === 'long').current, 1);
  assert.equal(longRest.changes.some(change => change.startsWith('PV temporales:')), true);
  assert.equal(longRest.changes.some(change => change.startsWith('Salvaciones contra muerte:')), true);
});

test('companions migrate safely and keep combat state separate from creature details', () => {
  const normalized = appUtils.normalizeGrimoireData({
    companions: [{ name: 'Nimbo', category: 'familiar', maxHp: '7', currentHp: '20', tempHp: '2', armorClass: '12', participates: true, initiativeMode: 'after-owner', details: { speedText: '3 m, volar 18 m', abilities: { dex: 15 } } }]
  });
  assert.equal(normalized.companions.length, 1);
  assert.equal(normalized.companions[0].currentHp, 7);
  assert.equal(normalized.companions[0].tempHp, 2);
  assert.equal(normalized.companions[0].participates, true);
  assert.equal(normalized.companions[0].details.abilities.dex, 15);
  assert.equal(appUtils.normalizeCompanion({ name: 'Búho', category: 'familiar', maxHp: 1 }).initiativeMode, 'own');
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
