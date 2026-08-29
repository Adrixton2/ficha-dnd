(() => {
    const SUPPORTED_DICE = Object.freeze([4, 6, 8, 10, 12, 20, 100]);
    const MAX_DICE_PER_TERM = 20;
    const MAX_TOTAL_DICE = 40;

    const makeError = (message, code = 'INVALID_DICE_FORMULA') => Object.assign(new Error(message), { code });
    const normalizeFormula = value => String(value || '')
        .toLowerCase()
        .replace(/[−–—]/g, '-')
        .replace(/\s+/g, '');

    const parseDiceFormula = formula => {
        const source = normalizeFormula(formula);
        if (!source) throw makeError('Introduce una fórmula de tirada.');
        const terms = [];
        const token = /([+-]?)(?:(\d*)d(100|20|12|10|8|6|4)|(\d+))/gy;
        let cursor = 0;
        let totalDice = 0;
        while (cursor < source.length) {
            token.lastIndex = cursor;
            const match = token.exec(source);
            if (!match || match.index !== cursor || (cursor > 0 && !match[1])) {
                throw makeError(`No se reconoce la fórmula cerca de "${source.slice(cursor)}".`);
            }
            const sign = match[1] === '-' ? -1 : 1;
            if (match[3]) {
                if (sign < 0) throw makeError('No se pueden restar dados; usa un modificador negativo.');
                const count = Number(match[2] || 1);
                const sides = Number(match[3]);
                if (!Number.isInteger(count) || count < 1 || count > MAX_DICE_PER_TERM) {
                    throw makeError(`Cada grupo puede contener entre 1 y ${MAX_DICE_PER_TERM} dados.`);
                }
                totalDice += count;
                if (totalDice > MAX_TOTAL_DICE) throw makeError(`Una tirada puede contener como máximo ${MAX_TOTAL_DICE} dados.`);
                terms.push({ type: 'dice', count, sides });
            } else {
                terms.push({ type: 'modifier', value: sign * Number(match[4]), label: 'Modificador' });
            }
            cursor = token.lastIndex;
        }
        if (!terms.some(term => term.type === 'dice')) throw makeError('La fórmula debe contener al menos un dado.');
        return { source, terms, totalDice };
    };

    const formatDiceFormula = (dice = [], modifier = 0) => {
        const groups = (Array.isArray(dice) ? dice : [])
            .filter(group => SUPPORTED_DICE.includes(Number(group?.sides)) && Number(group?.count) > 0)
            .map(group => `${Math.max(1, Math.min(MAX_DICE_PER_TERM, Math.trunc(Number(group.count))))}d${Number(group.sides)}`);
        const numericModifier = Math.trunc(Number(modifier) || 0);
        if (numericModifier) groups.push(`${numericModifier > 0 ? '+' : ''}${numericModifier}`);
        return groups.join('') || '1d20';
    };

    const extractDiceFormula = value => {
        const text = String(value || '').toLowerCase().replace(/[−–—]/g, '-');
        const match = text.match(/\d*d(?:100|20|12|10|8|6|4)(?:\s*[+-]\s*(?:\d*d(?:100|20|12|10|8|6|4)|\d+))*/i);
        if (!match) return '';
        const candidate = match[0].replace(/\s+/g, '');
        try {
            return parseDiceFormula(candidate).source;
        } catch (error) {
            return '';
        }
    };

    const secureRandomInt = (maximum, random) => {
        if (typeof random === 'function') {
            const value = Math.max(0, Math.min(0.999999999999, Number(random()) || 0));
            return Math.floor(value * maximum) + 1;
        }
        if (window.crypto?.getRandomValues) {
            const range = 0x100000000;
            const limit = Math.floor(range / maximum) * maximum;
            const values = new Uint32Array(1);
            do { window.crypto.getRandomValues(values); } while (values[0] >= limit);
            return (values[0] % maximum) + 1;
        }
        return Math.floor(Math.random() * maximum) + 1;
    };

    const makePercentileVisuals = (roll, groupId) => {
        const tensDigit = roll === 100 ? 0 : Math.floor(roll / 10);
        const unitsDigit = roll === 100 ? 0 : roll % 10;
        const tensLabels = Object.fromEntries(Array.from({ length: 10 }, (_, index) => [index + 1, index === 9 ? '00' : `${index + 1}0`]));
        const unitsLabels = Object.fromEntries(Array.from({ length: 10 }, (_, index) => [index + 1, index === 9 ? '0' : String(index + 1)]));
        return [
            { id: `${groupId}_tens`, sides: 10, result: tensDigit || 10, displayValue: tensDigit ? `${tensDigit}0` : '00', faceLabels: tensLabels, percentileRole: 'decenas', groupId },
            { id: `${groupId}_units`, sides: 10, result: unitsDigit || 10, displayValue: String(unitsDigit), faceLabels: unitsLabels, percentileRole: 'unidades', groupId }
        ];
    };

    const rollDice = (formula, options = {}) => {
        const parsed = parseDiceFormula(formula);
        const advantageMode = options.advantage ? 'advantage' : options.disadvantage ? 'disadvantage' : null;
        if (options.advantage && options.disadvantage) throw makeError('Una tirada no puede tener ventaja y desventaja a la vez.', 'INVALID_DICE_OPTIONS');
        const eligibleAdvantageIndex = advantageMode
            ? parsed.terms.findIndex(term => term.type === 'dice' && term.sides === 20 && term.count === 1)
            : -1;
        if (advantageMode && eligibleAdvantageIndex < 0) throw makeError('La ventaja o desventaja necesita al menos 1d20.', 'INVALID_DICE_OPTIONS');

        const visualDice = [];
        let naturalTotal = 0;
        let primaryNatural = null;
        const terms = parsed.terms.map((term, termIndex) => {
            if (term.type === 'modifier') return { ...term };
            const rolls = [];
            const isAdvantageTerm = termIndex === eligibleAdvantageIndex;
            const rollCount = isAdvantageTerm ? 2 : term.count;
            for (let index = 0; index < rollCount; index += 1) rolls.push(secureRandomInt(term.sides, options.random));
            const usedRollIndex = isAdvantageTerm
                ? (advantageMode === 'advantage'
                    ? (rolls[1] > rolls[0] ? 1 : 0)
                    : (rolls[1] < rolls[0] ? 1 : 0))
                : null;
            const usedRolls = isAdvantageTerm ? [rolls[usedRollIndex]] : rolls;
            const subtotal = usedRolls.reduce((sum, value) => sum + value, 0);
            naturalTotal += subtotal;
            if (isAdvantageTerm || (primaryNatural === null && term.sides === 20 && term.count === 1)) primaryNatural = isAdvantageTerm ? rolls[usedRollIndex] : rolls[0];
            rolls.forEach((value, rollIndex) => {
                const groupId = `dice_${termIndex}_${rollIndex}`;
                const state = isAdvantageTerm ? (rollIndex === usedRollIndex ? 'selected' : 'discarded') : 'normal';
                if (term.sides === 100) {
                    makePercentileVisuals(value, groupId).forEach(visual => visualDice.push({ ...visual, state, logicalValue: value, termIndex, rollIndex }));
                } else {
                    visualDice.push({ id: groupId, groupId, sides: term.sides, result: value, displayValue: String(value), state, logicalValue: value, termIndex, rollIndex });
                }
            });
            return { ...term, rolls, usedRollIndex, subtotal, advantageMode: isAdvantageTerm ? advantageMode : null };
        });

        const formulaModifiers = terms.filter(term => term.type === 'modifier');
        const extraModifiers = (Array.isArray(options.modifiers) ? options.modifiers : [])
            .map((modifier, index) => ({ type: 'modifier', value: Math.trunc(Number(modifier?.value) || 0), label: String(modifier?.label || `Modificador ${index + 1}`) }))
            .filter(modifier => modifier.value !== 0);
        const modifiers = [...formulaModifiers, ...extraModifiers];
        const modifierTotal = modifiers.reduce((sum, modifier) => sum + modifier.value, 0);
        const total = naturalTotal + modifierTotal;
        const difficultyClass = options.difficultyClass === '' || options.difficultyClass === null || options.difficultyClass === undefined
            ? null
            : Number(options.difficultyClass);
        if (difficultyClass !== null && !Number.isFinite(difficultyClass)) throw makeError('La dificultad debe ser un número válido.', 'INVALID_DICE_OPTIONS');

        return {
            id: `roll_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            formula: parsed.source,
            displayFormula: String(options.displayFormula || parsed.source),
            label: String(options.label || 'Tirada manual').trim() || 'Tirada manual',
            rollType: String(options.rollType || 'Tirada').trim() || 'Tirada',
            difficultyClass,
            advantageMode,
            terms,
            modifiers,
            visualDice,
            naturalTotal,
            modifierTotal,
            total,
            primaryNatural,
            critical: primaryNatural === 20,
            fumble: primaryNatural === 1,
            success: difficultyClass === null ? null : total >= difficultyClass,
            createdAt: new Date().toISOString()
        };
    };

    window.DndDiceEngine = Object.freeze({
        SUPPORTED_DICE,
        MAX_DICE_PER_TERM,
        MAX_TOTAL_DICE,
        normalizeFormula,
        parseDiceFormula,
        formatDiceFormula,
        extractDiceFormula,
        rollDice
    });
})();
