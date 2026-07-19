import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const loadBrowserUtility = (file, globalName) => {
  const window = { crypto: globalThis.crypto };
  const context = vm.createContext({ window, console, Date, Math, Uint32Array, Array, Number, String, Boolean, JSON, Set });
  vm.runInContext(readFileSync(resolve(root, file), 'utf8'), context, { filename: file });
  return window[globalName];
};

const initiative = loadBrowserUtility('online-initiative-utils.js', 'OnlineInitiativeUtils');
const table = loadBrowserUtility('online-table-utils.js', 'DndOnlineTableUtils');

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
