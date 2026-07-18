(function () {
  'use strict';

  const normalizeInitiative = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const uniqueIds = (ids) => [...new Set((Array.isArray(ids) ? ids : []).filter(Boolean))];

  const buildCombatantsMap = (participants, publicCombatants) => {
    const map = {};
    [...(Array.isArray(participants) ? participants : []), ...(Array.isArray(publicCombatants) ? publicCombatants : [])]
      .forEach((combatant) => {
        const id = combatant && (combatant.id || combatant.ownerUid);
        if (id) map[id] = { ...combatant, id };
      });
    return map;
  };

  const sortCombatantIdsByInitiative = (ids, combatantsById) => uniqueIds(ids)
    .map((id, index) => ({ id, index, initiative: normalizeInitiative(combatantsById?.[id]?.initiative) }))
    .sort((left, right) => {
      if (left.initiative === null && right.initiative === null) return left.index - right.index;
      if (left.initiative === null) return 1;
      if (right.initiative === null) return -1;
      return right.initiative - left.initiative || left.index - right.index;
    })
    .map((item) => item.id);

  const insertIdsAfterCurrent = (turnOrder, currentTurnId, newIds) => {
    const order = uniqueIds(turnOrder);
    const additions = uniqueIds(newIds).filter((id) => !order.includes(id));
    const index = order.indexOf(currentTurnId);
    return index < 0 ? [...order, ...additions] : [...order.slice(0, index + 1), ...additions, ...order.slice(index + 1)];
  };

  const insertIdsAtEnd = (turnOrder, newIds) => {
    const order = uniqueIds(turnOrder);
    return [...order, ...uniqueIds(newIds).filter((id) => !order.includes(id))];
  };

  const insertIdsByInitiativeStable = (turnOrder, combatantsById, newIds) =>
    sortCombatantIdsByInitiative(insertIdsAtEnd(turnOrder, newIds), combatantsById);

  const recalculateTurnIndex = (turnOrder, currentTurnId) => {
    const order = uniqueIds(turnOrder);
    if (!order.length) return -1;
    const index = order.indexOf(currentTurnId);
    return index < 0 ? 0 : index;
  };

  const validateTurnState = ({ turnOrder, turnIndex, currentTurnId, round }) => {
    const rawOrder = Array.isArray(turnOrder) ? turnOrder.filter(Boolean) : [];
    const order = uniqueIds(rawOrder);
    const errors = [];
    const normalizedRound = Math.max(1, Number(round) || 1);

    if (rawOrder.length !== order.length) errors.push('DUPLICATE_TURN_IDS');

    if (!order.length) {
      if (currentTurnId !== null && currentTurnId !== undefined) errors.push('CURRENT_TURN_WITH_EMPTY_ORDER');
      return { valid: !errors.length, errors, turnOrder: order, turnIndex: 0, currentTurnId: null, round: normalizedRound };
    }

    const currentIndex = order.indexOf(currentTurnId);
    if (currentIndex < 0) errors.push('CURRENT_TURN_NOT_IN_ORDER');
    if (!Number.isInteger(Number(turnIndex)) || Number(turnIndex) < 0 || Number(turnIndex) >= order.length) errors.push('TURN_INDEX_OUT_OF_RANGE');
    if (currentIndex >= 0 && Number(turnIndex) !== currentIndex) errors.push('TURN_INDEX_DOES_NOT_MATCH_CURRENT');

    return {
      valid: !errors.length,
      errors,
      turnOrder: order,
      turnIndex: currentIndex >= 0 ? currentIndex : 0,
      currentTurnId: currentIndex >= 0 ? currentTurnId : order[0],
      round: normalizedRound
    };
  };

  const isCombatantEligible = (combatant, round) => {
    if (combatant?.type === 'enemy' && combatant.defeated === true) return false;
    const eligibleFromRound = Number(combatant?.eligibleFromRound);
    return !Number.isFinite(eligibleFromRound) || eligibleFromRound <= round;
  };

  const findNextEligibleTurn = ({ turnOrder, currentIndex, currentRound, combatantsById }) => {
    const order = uniqueIds(turnOrder);
    if (!order.length) return { nextIndex: -1, nextRound: Math.max(1, Number(currentRound) || 1), nextId: null };
    let index = Math.max(0, Math.min(Number(currentIndex) || 0, order.length - 1));
    let round = Math.max(1, Number(currentRound) || 1);
    for (let step = 0; step < order.length * 2; step += 1) {
      index = (index + 1) % order.length;
      if (index === 0) round += 1;
      if (isCombatantEligible(combatantsById?.[order[index]], round)) return { nextIndex: index, nextRound: round, nextId: order[index] };
    }
    return { nextIndex: -1, nextRound: round, nextId: null };
  };

  const findPreviousEligibleTurn = ({ turnOrder, currentIndex, currentRound, combatantsById }) => {
    const order = uniqueIds(turnOrder);
    if (!order.length) return { nextIndex: -1, nextRound: Math.max(1, Number(currentRound) || 1), nextId: null };
    let index = Math.max(0, Math.min(Number(currentIndex) || 0, order.length - 1));
    let round = Math.max(1, Number(currentRound) || 1);
    for (let step = 0; step < order.length * 2; step += 1) {
      index = (index - 1 + order.length) % order.length;
      if (index === order.length - 1 && round > 1) round -= 1;
      if (isCombatantEligible(combatantsById?.[order[index]], round)) return { nextIndex: index, nextRound: round, nextId: order[index] };
    }
    return { nextIndex: -1, nextRound: round, nextId: null };
  };

  const moveCurrentCombatant = ({ turnOrder, currentTurnId, destinationMode, destinationId }) => {
    const order = uniqueIds(turnOrder);
    const currentIndex = order.indexOf(currentTurnId);
    if (!order.length || currentIndex < 0) {
      return {
        valid: false,
        reason: !order.length ? 'EMPTY_TURN_ORDER' : 'CURRENT_TURN_NOT_FOUND',
        turnOrder: order,
        turnIndex: -1,
        currentTurnId: currentTurnId || null
      };
    }

    const remainingOrder = order.filter((id) => id !== currentTurnId);
    let insertionIndex = remainingOrder.length;

    if (destinationMode === 'after-next') {
      const nextId = order[(currentIndex + 1) % order.length];
      const nextIndex = remainingOrder.indexOf(nextId);
      insertionIndex = nextIndex >= 0 ? nextIndex + 1 : remainingOrder.length;
    } else if (destinationMode === 'after-combatant') {
      const destinationIndex = remainingOrder.indexOf(destinationId);
      insertionIndex = destinationIndex >= 0 ? destinationIndex + 1 : remainingOrder.length;
    } else if (destinationMode === 'before-combatant') {
      const destinationIndex = remainingOrder.indexOf(destinationId);
      insertionIndex = destinationIndex >= 0 ? destinationIndex : remainingOrder.length;
    }

    const newTurnOrder = [
      ...remainingOrder.slice(0, insertionIndex),
      currentTurnId,
      ...remainingOrder.slice(insertionIndex)
    ];
    const newTurnIndex = newTurnOrder.indexOf(currentTurnId);

    return {
      valid: newTurnIndex >= 0,
      reason: newTurnIndex >= 0 ? null : 'CURRENT_TURN_NOT_FOUND',
      turnOrder: newTurnOrder,
      turnIndex: newTurnIndex,
      currentTurnId
    };
  };

  const runOnlineInitiativeUtilsSelfTest = () => {
    const combatants = { a: { initiative: 10 }, b: { initiative: 0 }, c: { initiative: -2 }, d: { initiative: null }, e: { initiative: 8, eligibleFromRound: 2 } };
    const results = [
      ['after-current', JSON.stringify(insertIdsAfterCurrent(['a', 'b'], 'a', ['c', 'b'])) === JSON.stringify(['a', 'c', 'b'])],
      ['at-end', JSON.stringify(insertIdsAtEnd(['a'], ['b', 'a'])) === JSON.stringify(['a', 'b'])],
      ['stable-sort', JSON.stringify(sortCombatantIdsByInitiative(['b', 'a', 'c', 'd'], combatants)) === JSON.stringify(['a', 'b', 'c', 'd'])],
      ['turn-index', recalculateTurnIndex(['a', 'b'], 'b') === 1 && recalculateTurnIndex([], 'a') === -1],
      ['turn-state', validateTurnState({ turnOrder: ['a', 'b'], turnIndex: 1, currentTurnId: 'b', round: 1 }).valid === true],
      ['next-round', findNextEligibleTurn({ turnOrder: ['a', 'e'], currentIndex: 0, currentRound: 1, combatantsById: combatants }).nextRound === 2],
      ['previous', findPreviousEligibleTurn({ turnOrder: ['a', 'b'], currentIndex: 1, currentRound: 1, combatantsById: combatants }).nextId === 'a'],
      ['defeated-enemy', isCombatantEligible({ type: 'enemy', defeated: true }, 1) === false],
      ['move-after-next', JSON.stringify(moveCurrentCombatant({ turnOrder: ['a', 'b', 'c'], currentTurnId: 'a', destinationMode: 'after-next' }).turnOrder) === JSON.stringify(['b', 'a', 'c'])],
      ['move-after-combatant', JSON.stringify(moveCurrentCombatant({ turnOrder: ['a', 'b', 'c'], currentTurnId: 'a', destinationMode: 'after-combatant', destinationId: 'c' }).turnOrder) === JSON.stringify(['b', 'c', 'a'])],
      ['move-end', JSON.stringify(moveCurrentCombatant({ turnOrder: ['a', 'b', 'c'], currentTurnId: 'b', destinationMode: 'end' }).turnOrder) === JSON.stringify(['a', 'c', 'b'])],
      ['move-invalid', moveCurrentCombatant({ turnOrder: [], currentTurnId: 'a', destinationMode: 'end' }).valid === false]
    ];
    console.table(results.map(([name, passed]) => ({ name, passed })));
    return results.every(([, passed]) => passed);
  };

  window.OnlineInitiativeUtils = { normalizeInitiative, buildCombatantsMap, sortCombatantIdsByInitiative, insertIdsAfterCurrent, insertIdsAtEnd, insertIdsByInitiativeStable, recalculateTurnIndex, validateTurnState, isCombatantEligible, findNextEligibleTurn, findPreviousEligibleTurn, moveCurrentCombatant, runOnlineInitiativeUtilsSelfTest };
  window.runOnlineInitiativeUtilsSelfTest = runOnlineInitiativeUtilsSelfTest;
}());
