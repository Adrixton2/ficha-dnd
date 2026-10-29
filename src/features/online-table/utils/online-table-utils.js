/* Pure data helpers shared by Mesa Online handlers and presentation. */
(function () {
    const normalizeHpValue = (value, fallback) => {
        if (value === null || value === undefined || value === '') return fallback;
        const numeric = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(numeric) ? Math.max(0, numeric) : fallback;
    };

    const getHpValues = (value, fallback = { currentHp: 0, maxHp: 0, tempHp: 0 }) => ({
        currentHp: normalizeHpValue(value?.currentHp, normalizeHpValue(fallback.currentHp, 0)),
        maxHp: normalizeHpValue(value?.maxHp, normalizeHpValue(fallback.maxHp, 0)),
        tempHp: normalizeHpValue(value?.tempHp, normalizeHpValue(fallback.tempHp, 0))
    });

    const normalizeOnlinePlayerName = value => String(value || '')
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 40);

    const isValidOnlinePlayerName = value => normalizeOnlinePlayerName(value).length >= 2;

    const normalizeOnlineRoomCode = value => {
        const raw = String(value || '').trim();
        const roomParameter = raw.match(/[?&#]room=([a-z0-9]+)/i)?.[1];
        const source = roomParameter || raw;
        return source.toUpperCase().replace(/\s+/g, '').replace(/[^A-HJ-KM-NP-Z2-9]/g, '').slice(0, 12);
    };

    const calculateEnemyVisibleState = (currentHp, maxHp, mode, manualState) => {
        if (mode === 'hidden') return 'oculto';
        if (mode === 'manual') return manualState || 'oculto';
        const current = normalizeHpValue(currentHp, 0);
        const maximum = normalizeHpValue(maxHp, 0);
        if (current <= 0) return 'derrotado';
        if (maximum > 0 && current === maximum) return 'intacto';
        return maximum > 0 && current > maximum / 2 ? 'herido' : 'muy-herido';
    };

    const createEnemyId = () => `enemy_${Date.now().toString(36)}_${(
        window.crypto?.getRandomValues
            ? Array.from(window.crypto.getRandomValues(new Uint32Array(1)))[0].toString(36)
            : Math.random().toString(36).slice(2, 8)
    )}`;

    const normalizeOnlineConditions = (value) => (Array.isArray(value) ? value : [])
        .map(condition => typeof condition === 'string'
            ? { id: `condition_${condition}`, name: condition, source: '', notes: '', mechanicsEnabled: true, createdAt: new Date().toISOString() }
            : {
                id: condition.id || `condition_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                name: String(condition.name || ''),
                source: String(condition.source || ''),
                notes: String(condition.notes || ''),
                mechanicsEnabled: condition.mechanicsEnabled !== false,
                createdAt: condition.createdAt || new Date().toISOString()
            })
        .filter(condition => condition.name);

    const ONLINE_CONDITIONS = [
        'Agarrado', 'Asustado', 'Aturdido', 'Cegado', 'Derribado', 'Envenenado',
        'Ensordecido', 'Hechizado', 'Incapacitado', 'Inconsciente', 'Invisible', 'Paralizado',
        'Petrificado', 'Restringido'
    ];

    const ONLINE_ABILITY_LABELS = Object.freeze({ fue: 'Fuerza', des: 'Destreza', con: 'Constitución', int: 'Inteligencia', sab: 'Sabiduría', car: 'Carisma' });
    const ONLINE_SKILL_LABELS = Object.freeze({ acrobacias: 'Acrobacias', arcanos: 'Arcano', atletismo: 'Atletismo', engano: 'Engaño', historia: 'Historia', interpretacion: 'Interpretación', intimidacion: 'Intimidación', investigacion: 'Investigación', juego_de_manos: 'Juego de Manos', medicina: 'Medicina', naturaleza: 'Naturaleza', percepcion: 'Percepción', perspicacia: 'Perspicacia', persuasion: 'Persuasión', religion: 'Religión', sigilo: 'Sigilo', supervivencia: 'Supervivencia', trato_con_animales: 'Trato con Animales' });
    const ONLINE_EFFECT_OPERATIONS = Object.freeze({
        add: 'Sumar o restar', set: 'Establecer valor', dice: 'Añadir o restar dado',
        advantage: 'Ventaja', disadvantage: 'Desventaja', 'auto-fail': 'Fallo automático',
        multiply: 'Multiplicar', flag: 'Aviso de regla'
    });
    const ONLINE_EFFECT_MODIFIER_TYPES = Object.freeze({
        ability: { label: 'Puntuación de atributo', ability: true, operations: ['add', 'set', 'dice'] },
        'ability-check': { label: 'Pruebas de característica', ability: true, allowAll: true, operations: ['add', 'dice', 'advantage', 'disadvantage', 'auto-fail'] },
        'skill-check': { label: 'Habilidad concreta', skill: true, operations: ['add', 'dice', 'advantage', 'disadvantage', 'auto-fail'] },
        'saving-throw': { label: 'Tiradas de salvación', ability: true, allowAll: true, operations: ['add', 'dice', 'advantage', 'disadvantage', 'auto-fail'] },
        'armor-class': { label: 'Clase de armadura', operations: ['add', 'set'] },
        initiative: { label: 'Iniciativa', operations: ['add', 'dice', 'advantage', 'disadvantage'] },
        speed: { label: 'Velocidad', operations: ['add', 'set'] },
        'attack-roll': { label: 'Tiradas de ataque', operations: ['add', 'dice', 'advantage', 'disadvantage'] },
        'damage-roll': { label: 'Tiradas de daño', operations: ['add', 'dice'] },
        'spell-attack': { label: 'Ataques de conjuro', operations: ['add', 'dice', 'advantage', 'disadvantage'] },
        'spell-save-dc': { label: 'CD de conjuros', operations: ['add', 'set'] },
        'incoming-attack': { label: 'Ataques contra el objetivo', operations: ['advantage', 'disadvantage'] },
        'movement-cost': { label: 'Coste de movimiento', operations: ['multiply'] },
        incapacitated: { label: 'Incapacitado', operations: ['flag'] },
        'sight-check': { label: 'Pruebas que dependan de la vista', operations: ['auto-fail'] },
        'melee-critical': { label: 'Crítico cuerpo a cuerpo', operations: ['flag'] }
    });
    const normalizeEffectDiceFormula = value => {
        const source = String(value || '').toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '');
        const match = source.match(/^([+-]?)(\d*)d(4|6|8|10|12|20)$/);
        if (!match) return '';
        const count = Math.max(1, Math.min(20, Number(match[2] || 1)));
        return `${match[1] === '-' ? '-' : '+'}${count}d${match[3]}`;
    };
    const rollEffectDiceFormula = (formula, random = Math.random) => {
        const normalized = normalizeEffectDiceFormula(formula);
        if (!normalized) return 0;
        const match = normalized.match(/^([+-])(\d+)d(\d+)$/);
        const sign = match[1] === '-' ? -1 : 1;
        let total = 0;
        for (let index = 0; index < Number(match[2]); index += 1) total += Math.floor(Math.max(0, Math.min(.999999999, Number(random()) || 0)) * Number(match[3])) + 1;
        return sign * total;
    };
    const normalizeEffectAdjustments = value => (Array.isArray(value) ? value : []).slice(0, 16).map((adjustment, index) => {
        const type = Object.prototype.hasOwnProperty.call(ONLINE_EFFECT_MODIFIER_TYPES, adjustment?.type) ? adjustment.type : '';
        const definition = ONLINE_EFFECT_MODIFIER_TYPES[type];
        if (!definition) return null;
        const ability = definition.ability
            ? (Object.prototype.hasOwnProperty.call(ONLINE_ABILITY_LABELS, adjustment?.ability) ? adjustment.ability : definition.allowAll && adjustment?.ability === 'all' ? 'all' : '')
            : '';
        if (definition.ability && !ability) return null;
        const skill = definition.skill && Object.prototype.hasOwnProperty.call(ONLINE_SKILL_LABELS, adjustment?.skill) ? adjustment.skill : '';
        if (definition.skill && !skill) return null;
        const requestedOperation = String(adjustment?.operation || 'add');
        const operation = definition.operations.includes(requestedOperation) ? requestedOperation : definition.operations[0];
        const numericValue = Number(adjustment?.value);
        const needsNumericValue = ['add', 'set', 'multiply'].includes(operation);
        if (needsNumericValue && (!Number.isFinite(numericValue) || (operation === 'add' && numericValue === 0) || (operation === 'multiply' && numericValue <= 0))) return null;
        const diceFormula = operation === 'dice' ? normalizeEffectDiceFormula(adjustment?.diceFormula || adjustment?.formula) : '';
        if (operation === 'dice' && !diceFormula) return null;
        const normalized = {
            id: String(adjustment?.id || `adjustment_${index}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || `adjustment_${index}`,
            type,
            ability,
            skill,
            operation,
            enabled: adjustment?.enabled !== false
        };
        if (needsNumericValue) normalized.value = operation === 'multiply'
            ? Math.max(.1, Math.min(10, numericValue))
            : Math.max(-100, Math.min(100, Math.trunc(numericValue)));
        if (diceFormula) {
            normalized.diceFormula = diceFormula;
            if (type === 'ability' && Number.isFinite(Number(adjustment?.rolledValue))) normalized.rolledValue = Math.trunc(Number(adjustment.rolledValue));
        }
        return normalized;
    }).filter(Boolean);
    const effectAppliesToTarget = (effect, target) => {
        if (!effect || effect.expired === true || (effect.remaining !== null && Number(effect.remaining) <= 0)) return false;
        if (effect.targetType === 'global' || effect.targetId === 'global') return true;
        if (!target) return false;
        const targetIds = typeof target === 'string' ? [target] : [target.id, target.ownerUid].filter(Boolean);
        return targetIds.includes(effect.targetId);
    };
    const normalizeConditionKey = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const ONLINE_CONDITION_MECHANICS = Object.freeze({
        derribado: [
            { type: 'attack-roll', operation: 'disadvantage' },
            { type: 'movement-cost', operation: 'multiply', value: 2 },
            { type: 'incoming-attack', operation: 'advantage' }
        ],
        prone: [
            { type: 'attack-roll', operation: 'disadvantage' },
            { type: 'movement-cost', operation: 'multiply', value: 2 },
            { type: 'incoming-attack', operation: 'advantage' }
        ],
        agarrado: [{ type: 'speed', operation: 'set', value: 0 }],
        grappled: [{ type: 'speed', operation: 'set', value: 0 }],
        restringido: [
            { type: 'speed', operation: 'set', value: 0 },
            { type: 'attack-roll', operation: 'disadvantage' },
            { type: 'saving-throw', ability: 'des', operation: 'disadvantage' },
            { type: 'incoming-attack', operation: 'advantage' }
        ],
        restrained: [
            { type: 'speed', operation: 'set', value: 0 },
            { type: 'attack-roll', operation: 'disadvantage' },
            { type: 'saving-throw', ability: 'des', operation: 'disadvantage' },
            { type: 'incoming-attack', operation: 'advantage' }
        ],
        envenenado: [{ type: 'attack-roll', operation: 'disadvantage' }, { type: 'ability-check', ability: 'all', operation: 'disadvantage' }],
        poisoned: [{ type: 'attack-roll', operation: 'disadvantage' }, { type: 'ability-check', ability: 'all', operation: 'disadvantage' }],
        asustado: [{ type: 'attack-roll', operation: 'disadvantage' }, { type: 'ability-check', ability: 'all', operation: 'disadvantage' }],
        frightened: [{ type: 'attack-roll', operation: 'disadvantage' }, { type: 'ability-check', ability: 'all', operation: 'disadvantage' }],
        cegado: [{ type: 'attack-roll', operation: 'disadvantage' }, { type: 'incoming-attack', operation: 'advantage' }, { type: 'sight-check', operation: 'auto-fail' }],
        blinded: [{ type: 'attack-roll', operation: 'disadvantage' }, { type: 'incoming-attack', operation: 'advantage' }, { type: 'sight-check', operation: 'auto-fail' }],
        incapacitado: [{ type: 'incapacitated', operation: 'flag' }],
        incapacitated: [{ type: 'incapacitated', operation: 'flag' }],
        aturdido: [{ type: 'incapacitated', operation: 'flag' }, { type: 'saving-throw', ability: 'fue', operation: 'auto-fail' }, { type: 'saving-throw', ability: 'des', operation: 'auto-fail' }, { type: 'incoming-attack', operation: 'advantage' }],
        stunned: [{ type: 'incapacitated', operation: 'flag' }, { type: 'saving-throw', ability: 'fue', operation: 'auto-fail' }, { type: 'saving-throw', ability: 'des', operation: 'auto-fail' }, { type: 'incoming-attack', operation: 'advantage' }],
        paralizado: [{ type: 'incapacitated', operation: 'flag' }, { type: 'saving-throw', ability: 'fue', operation: 'auto-fail' }, { type: 'saving-throw', ability: 'des', operation: 'auto-fail' }, { type: 'incoming-attack', operation: 'advantage' }, { type: 'melee-critical', operation: 'flag' }],
        paralyzed: [{ type: 'incapacitated', operation: 'flag' }, { type: 'saving-throw', ability: 'fue', operation: 'auto-fail' }, { type: 'saving-throw', ability: 'des', operation: 'auto-fail' }, { type: 'incoming-attack', operation: 'advantage' }, { type: 'melee-critical', operation: 'flag' }],
        inconsciente: [{ type: 'incapacitated', operation: 'flag' }, { type: 'saving-throw', ability: 'fue', operation: 'auto-fail' }, { type: 'saving-throw', ability: 'des', operation: 'auto-fail' }, { type: 'incoming-attack', operation: 'advantage' }, { type: 'melee-critical', operation: 'flag' }],
        unconscious: [{ type: 'incapacitated', operation: 'flag' }, { type: 'saving-throw', ability: 'fue', operation: 'auto-fail' }, { type: 'saving-throw', ability: 'des', operation: 'auto-fail' }, { type: 'incoming-attack', operation: 'advantage' }, { type: 'melee-critical', operation: 'flag' }],
        petrificado: [{ type: 'incapacitated', operation: 'flag' }, { type: 'saving-throw', ability: 'fue', operation: 'auto-fail' }, { type: 'saving-throw', ability: 'des', operation: 'auto-fail' }],
        petrified: [{ type: 'incapacitated', operation: 'flag' }, { type: 'saving-throw', ability: 'fue', operation: 'auto-fail' }, { type: 'saving-throw', ability: 'des', operation: 'auto-fail' }]
    });
    const getConditionMechanicalEffects = conditions => normalizeOnlineConditions(conditions).flatMap(condition => {
        if (condition.mechanicsEnabled === false) return [];
        const adjustments = ONLINE_CONDITION_MECHANICS[normalizeConditionKey(condition.name)];
        if (!adjustments) return [];
        return [{ id: `condition-effect-${condition.id}`, name: condition.name, isCondition: true, adjustments: adjustments.map((adjustment, index) => ({ id: `${condition.id}_${index}`, ...adjustment })) }];
    });
    const createRollBucket = () => ({ flat: 0, dice: [], advantageSources: [], disadvantageSources: [], automaticFailureSources: [] });
    const resolveAdvantageState = states => {
        const values = (Array.isArray(states) ? states : [states]).flatMap(value => Array.isArray(value) ? value : [value]).filter(Boolean);
        const hasAdvantage = values.includes('advantage');
        const hasDisadvantage = values.includes('disadvantage');
        return hasAdvantage === hasDisadvantage ? 'normal' : hasAdvantage ? 'advantage' : 'disadvantage';
    };
    const applyRollAdjustment = (bucket, adjustment, source) => {
        if (!bucket || adjustment.enabled === false) return;
        if (adjustment.operation === 'add') bucket.flat += Number(adjustment.value) || 0;
        else if (adjustment.operation === 'dice') bucket.dice.push({ formula: adjustment.diceFormula, source });
        else if (adjustment.operation === 'advantage') bucket.advantageSources.push(source);
        else if (adjustment.operation === 'disadvantage') bucket.disadvantageSources.push(source);
        else if (adjustment.operation === 'auto-fail') bucket.automaticFailureSources.push(source);
    };
    const combineRollMechanics = (...buckets) => {
        const result = createRollBucket();
        buckets.filter(Boolean).forEach(bucket => {
            result.flat += Number(bucket.flat) || 0;
            result.dice.push(...(bucket.dice || []));
            result.advantageSources.push(...(bucket.advantageSources || []));
            result.disadvantageSources.push(...(bucket.disadvantageSources || []));
            result.automaticFailureSources.push(...(bucket.automaticFailureSources || []));
        });
        result.advantageState = resolveAdvantageState([
            ...result.advantageSources.map(() => 'advantage'),
            ...result.disadvantageSources.map(() => 'disadvantage')
        ]);
        return result;
    };
    const aggregateEffectModifiers = (effects, target, conditions = []) => {
        const totals = {
            abilities: Object.fromEntries(Object.keys(ONLINE_ABILITY_LABELS).map(key => [key, 0])),
            abilitySets: Object.fromEntries(Object.keys(ONLINE_ABILITY_LABELS).map(key => [key, null])),
            abilityChecks: { all: 0, ...Object.fromEntries(Object.keys(ONLINE_ABILITY_LABELS).map(key => [key, 0])) },
            savingThrows: { all: 0, ...Object.fromEntries(Object.keys(ONLINE_ABILITY_LABELS).map(key => [key, 0])) },
            armorClass: 0,
            armorClassSet: null,
            initiative: 0,
            speed: 0,
            speedSet: null,
            attackRoll: 0,
            damageRoll: 0,
            spellAttack: 0,
            spellSaveDc: 0,
            spellSaveDcSet: null,
            movementCostMultiplier: 1,
            flags: { incapacitated: [], sightCheckAutomaticFailure: [], meleeCriticalWarning: [] },
            rolls: {
                abilityChecks: { all: createRollBucket(), ...Object.fromEntries(Object.keys(ONLINE_ABILITY_LABELS).map(key => [key, createRollBucket()])) },
                skills: Object.fromEntries(Object.keys(ONLINE_SKILL_LABELS).map(key => [key, createRollBucket()])),
                savingThrows: { all: createRollBucket(), ...Object.fromEntries(Object.keys(ONLINE_ABILITY_LABELS).map(key => [key, createRollBucket()])) },
                initiative: createRollBucket(), attackRoll: createRollBucket(), damageRoll: createRollBucket(), spellAttack: createRollBucket(), incomingAttack: createRollBucket()
            },
            effects: []
        };
        const activeEffects = (Array.isArray(effects) ? effects : []).filter(effect => effectAppliesToTarget(effect, target));
        [...activeEffects, ...getConditionMechanicalEffects(conditions)].forEach(effect => {
            const adjustments = normalizeEffectAdjustments(effect.adjustments);
            if (!adjustments.length) return;
            totals.effects.push({ id: effect.id, name: String(effect.name || 'Efecto'), isCondition: effect.isCondition === true, adjustments });
            adjustments.forEach(adjustment => {
                if (adjustment.enabled === false) return;
                const source = String(effect.name || 'Efecto');
                if (adjustment.type === 'ability') {
                    if (adjustment.operation === 'set') totals.abilitySets[adjustment.ability] = adjustment.value;
                    else totals.abilities[adjustment.ability] += adjustment.operation === 'dice' ? Number(adjustment.rolledValue) || 0 : Number(adjustment.value) || 0;
                } else if (adjustment.type === 'ability-check') {
                    applyRollAdjustment(totals.rolls.abilityChecks[adjustment.ability], adjustment, source);
                    totals.abilityChecks[adjustment.ability] += adjustment.operation === 'add' ? Number(adjustment.value) || 0 : 0;
                } else if (adjustment.type === 'skill-check') {
                    applyRollAdjustment(totals.rolls.skills[adjustment.skill], adjustment, source);
                } else if (adjustment.type === 'saving-throw') {
                    applyRollAdjustment(totals.rolls.savingThrows[adjustment.ability], adjustment, source);
                    totals.savingThrows[adjustment.ability] += adjustment.operation === 'add' ? Number(adjustment.value) || 0 : 0;
                } else if (adjustment.type === 'armor-class') adjustment.operation === 'set' ? totals.armorClassSet = adjustment.value : totals.armorClass += Number(adjustment.value) || 0;
                else if (adjustment.type === 'initiative') { applyRollAdjustment(totals.rolls.initiative, adjustment, source); totals.initiative += adjustment.operation === 'add' ? Number(adjustment.value) || 0 : 0; }
                else if (adjustment.type === 'speed') adjustment.operation === 'set' ? totals.speedSet = adjustment.value : totals.speed += Number(adjustment.value) || 0;
                else if (adjustment.type === 'attack-roll') { applyRollAdjustment(totals.rolls.attackRoll, adjustment, source); totals.attackRoll += adjustment.operation === 'add' ? Number(adjustment.value) || 0 : 0; }
                else if (adjustment.type === 'damage-roll') { applyRollAdjustment(totals.rolls.damageRoll, adjustment, source); totals.damageRoll += adjustment.operation === 'add' ? Number(adjustment.value) || 0 : 0; }
                else if (adjustment.type === 'spell-attack') { applyRollAdjustment(totals.rolls.spellAttack, adjustment, source); totals.spellAttack += adjustment.operation === 'add' ? Number(adjustment.value) || 0 : 0; }
                else if (adjustment.type === 'spell-save-dc') adjustment.operation === 'set' ? totals.spellSaveDcSet = adjustment.value : totals.spellSaveDc += Number(adjustment.value) || 0;
                else if (adjustment.type === 'incoming-attack') applyRollAdjustment(totals.rolls.incomingAttack, adjustment, source);
                else if (adjustment.type === 'movement-cost') totals.movementCostMultiplier *= Number(adjustment.value) || 1;
                else if (adjustment.type === 'incapacitated') totals.flags.incapacitated.push(source);
                else if (adjustment.type === 'sight-check') totals.flags.sightCheckAutomaticFailure.push(source);
                else if (adjustment.type === 'melee-critical') totals.flags.meleeCriticalWarning.push(source);
            });
        });
        return totals;
    };
    const getEffectiveAbilityScore = (baseScore, totals, ability) => Math.max(0, totals?.abilitySets?.[ability] === null || totals?.abilitySets?.[ability] === undefined
        ? (Number(baseScore) || 0) + (Number(totals?.abilities?.[ability]) || 0)
        : Number(totals.abilitySets[ability]) || 0);
    const getEffectiveScalar = (baseValue, additive, setValue, minimum = 0) => Math.max(minimum, setValue === null || setValue === undefined ? (Number(baseValue) || 0) + (Number(additive) || 0) : Number(setValue) || 0);
    const getRollMechanics = (totals, rollType, ability = '') => {
        if (!totals?.rolls) return createRollBucket();
        if (rollType === 'ability-check') return combineRollMechanics(totals.rolls.abilityChecks.all, totals.rolls.abilityChecks[ability]);
        if (rollType === 'skill-check') return combineRollMechanics(totals.rolls.skills[ability]);
        if (rollType === 'saving-throw') return combineRollMechanics(totals.rolls.savingThrows.all, totals.rolls.savingThrows[ability]);
        return combineRollMechanics(totals.rolls[rollType]);
    };
    const formatEffectAdjustment = adjustment => {
        const normalized = normalizeEffectAdjustments([adjustment])[0];
        if (!normalized) return '';
        const definition = ONLINE_EFFECT_MODIFIER_TYPES[normalized.type];
        const abilityLabel = normalized.ability === 'all' ? 'todas' : ONLINE_ABILITY_LABELS[normalized.ability];
        const label = definition.ability ? `${definition.label} · ${abilityLabel}` : definition.skill ? `${definition.label} · ${ONLINE_SKILL_LABELS[normalized.skill]}` : definition.label;
        if (normalized.operation === 'set') return `${label} = ${normalized.value}`;
        if (normalized.operation === 'dice') return `${label} ${normalized.diceFormula}${normalized.type === 'ability' && Number.isFinite(Number(normalized.rolledValue)) ? ` (${formatOnlineModifier(normalized.rolledValue)})` : ''}`;
        if (normalized.operation === 'advantage') return `${label} · ventaja`;
        if (normalized.operation === 'disadvantage') return `${label} · desventaja`;
        if (normalized.operation === 'auto-fail') return `${label} · fallo automático`;
        if (normalized.operation === 'multiply') return `${label} ×${normalized.value}`;
        if (normalized.operation === 'flag') return label;
        return `${label} ${formatOnlineModifier(normalized.value)}`;
    };
    const ONLINE_SKILLS = Object.freeze([
        { key: 'acrobacias', name: 'Acrobacias', stat: 'des' }, { key: 'arcanos', name: 'Arcano', stat: 'int' },
        { key: 'atletismo', name: 'Atletismo', stat: 'fue' }, { key: 'engano', name: 'Engaño', stat: 'car' },
        { key: 'historia', name: 'Historia', stat: 'int' }, { key: 'interpretacion', name: 'Interpretación', stat: 'car' },
        { key: 'intimidacion', name: 'Intimidación', stat: 'car' }, { key: 'investigacion', name: 'Investigación', stat: 'int' },
        { key: 'juego_de_manos', name: 'Juego de Manos', stat: 'des' }, { key: 'medicina', name: 'Medicina', stat: 'sab' },
        { key: 'naturaleza', name: 'Naturaleza', stat: 'int' }, { key: 'percepcion', name: 'Percepción', stat: 'sab' },
        { key: 'perspicacia', name: 'Perspicacia', stat: 'sab' }, { key: 'persuasion', name: 'Persuasión', stat: 'car' },
        { key: 'religion', name: 'Religión', stat: 'int' }, { key: 'sigilo', name: 'Sigilo', stat: 'des' },
        { key: 'supervivencia', name: 'Supervivencia', stat: 'sab' }, { key: 'trato_con_animales', name: 'Trato con Animales', stat: 'sab' }
    ]);
    const safeText = (value, maximum = 160) => String(value || '').trim().slice(0, maximum);
    const safeNumber = (value, fallback = 0) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    const calculateAbilityModifier = value => Math.floor((safeNumber(value, 10) - 10) / 2);
    const formatOnlineModifier = value => `${Number(value) >= 0 ? '+' : ''}${Number(value) || 0}`;
    const ONLINE_PRESENCE_AWAY_AFTER_MS = 2 * 60 * 1000;
    const ONLINE_PRESENCE_OFFLINE_AFTER_MS = 5 * 60 * 1000;
    const getOnlineTimestamp = value => Number(value?.toMillis?.() || value?.seconds * 1000 || value || 0);
    const getOnlinePresence = (member, participant, now = Date.now()) => {
        const lastSeenAt = getOnlineTimestamp(member?.lastSeen) || getOnlineTimestamp(participant?.updatedAt);
        const elapsedMs = lastSeenAt > 0 ? Math.max(0, Number(now) - lastSeenAt) : 0;
        let status = 'online';
        if (!member || member.active === false || !participant || participant.connected === false) status = 'offline';
        else if (lastSeenAt > 0 && elapsedMs >= ONLINE_PRESENCE_OFFLINE_AFTER_MS) status = 'offline';
        else if (lastSeenAt > 0 && elapsedMs >= ONLINE_PRESENCE_AWAY_AFTER_MS) status = 'away';
        return {
            status,
            label: status === 'online' ? 'Conectado' : status === 'away' ? 'Ausente' : 'Desconectado',
            lastSeenAt,
            elapsedMs
        };
    };

    const formatOnlinePresenceAge = (lastSeenAt, now = Date.now()) => {
        const timestamp = getOnlineTimestamp(lastSeenAt);
        if (!timestamp) return 'Sin actividad registrada';
        const minutes = Math.max(0, Math.floor((Number(now) - timestamp) / 60000));
        if (minutes < 1) return 'Activo ahora';
        if (minutes < 60) return `Última actividad hace ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Última actividad hace ${hours} h`;
        const days = Math.floor(hours / 24);
        return `Última actividad hace ${days} ${days === 1 ? 'día' : 'días'}`;
    };

    const createOnlineCompanionParticipantId = (ownerUid, companionId) => {
        const cleanPart = value => String(value || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 96) || 'unknown';
        return `companion_${cleanPart(ownerUid)}_${cleanPart(companionId)}`;
    };

    const createOnlineCompanionParticipant = (companion, options = {}) => {
        const ownerUid = safeText(options.ownerUid, 128);
        const characterId = safeText(options.characterId, 128);
        const companionId = safeText(companion?.id, 100);
        const initiativeMode = ['after-owner', 'own', 'shared'].includes(companion?.initiativeMode) ? companion.initiativeMode : 'after-owner';
        const ownInitiative = companion?.initiative === null || companion?.initiative === undefined || companion?.initiative === '' ? null : safeNumber(companion.initiative);
        const ownerInitiative = options.ownerInitiative === null || options.ownerInitiative === undefined || options.ownerInitiative === '' ? null : safeNumber(options.ownerInitiative);
        const avatarDataUrl = typeof companion?.avatarDataUrl === 'string' && /^data:image\/(?:png|jpeg|webp);base64,/i.test(companion.avatarDataUrl) && companion.avatarDataUrl.length <= 102400 ? companion.avatarDataUrl : '';
        const avatarPath = typeof companion?.avatarPath === 'string' && /^(?:\.\/)?assets\/[a-z0-9_./-]+$/i.test(companion.avatarPath) ? companion.avatarPath.slice(0, 300) : '';
        const conditions = (Array.isArray(companion?.conditions) ? companion.conditions : []).map((condition, index) => {
            const source = typeof condition === 'string' ? { name: condition } : condition || {};
            const name = safeText(source.name, 100);
            return { id: safeText(source.id, 120) || `companion_condition_${index}_${name.replace(/\s+/g, '_').toLowerCase()}`, name, source: safeText(source.source, 120), notes: safeText(source.notes, 300), createdAt: safeText(source.createdAt, 40) };
        }).filter(condition => condition.name);
        return {
            id: createOnlineCompanionParticipantId(ownerUid, companionId),
            ownerUid,
            type: 'companion',
            characterId,
            companionId,
            name: safeText(companion?.name || 'Compañero', 120),
            category: safeText(companion?.category, 30),
            currentHp: Math.max(0, safeNumber(companion?.currentHp)),
            maxHp: Math.max(0, safeNumber(companion?.maxHp)),
            tempHp: Math.max(0, safeNumber(companion?.tempHp)),
            armorClass: companion?.armorClass === null || companion?.armorClass === undefined ? 0 : Math.max(0, safeNumber(companion.armorClass)),
            initiativeMode,
            initiative: initiativeMode === 'own' ? ownInitiative : ownerInitiative,
            conditions,
            connected: options.connected !== false,
            ...(avatarDataUrl ? { avatarDataUrl } : {}),
            ...(avatarPath ? { avatarPath } : {})
        };
    };

    const orderOnlineEncounterCombatants = combatants => {
        const ordered = (Array.isArray(combatants) ? combatants : []).slice().sort((left, right) => {
            const initiativeDifference = safeNumber(right?.initiative, Number.NEGATIVE_INFINITY) - safeNumber(left?.initiative, Number.NEGATIVE_INFINITY);
            if (initiativeDifference !== 0) return initiativeDifference;
            return String(left?.name || '').localeCompare(String(right?.name || '')) || String(left?.id || '').localeCompare(String(right?.id || ''));
        });
        const linked = ordered.filter(combatant => combatant?.type === 'companion' && ['after-owner', 'shared'].includes(combatant.initiativeMode));
        linked.forEach(companion => {
            const currentIndex = ordered.findIndex(combatant => combatant?.id === companion.id);
            const ownerIndex = ordered.findIndex(combatant => combatant?.type === 'player' && combatant?.ownerUid === companion.ownerUid);
            if (currentIndex < 0 || ownerIndex < 0) return;
            ordered.splice(currentIndex, 1);
            const refreshedOwnerIndex = ordered.findIndex(combatant => combatant?.type === 'player' && combatant?.ownerUid === companion.ownerUid);
            let insertionIndex = refreshedOwnerIndex + 1;
            while (ordered[insertionIndex]?.type === 'companion' && ordered[insertionIndex]?.ownerUid === companion.ownerUid && ['after-owner', 'shared'].includes(ordered[insertionIndex]?.initiativeMode)) insertionIndex += 1;
            ordered.splice(insertionIndex, 0, companion);
        });
        return ordered;
    };

    const createOnlinePlayerSheetSnapshot = (character, options = {}) => {
        const data = character?.data || {};
        const build = data.characterBuild || {};
        const characterRules = options.characterRules;
        const classRule = characterRules?.classes?.[build.classId]
            || characterRules?.getClassForName?.(data.charInfo?.cls)
            || null;
        const speciesRule = characterRules?.species?.[build.speciesId]
            || characterRules?.getSpeciesForName?.(data.charInfo?.race)
            || null;
        const backgroundRule = characterRules?.backgrounds?.[build.backgroundId]
            || characterRules?.getBackgroundForName?.(build.backgroundName)
            || null;
        const level = Math.max(1, Math.min(20, Math.trunc(safeNumber(data.level, 1))));
        const proficiencyBonus = Math.ceil(level / 4) + 1;
        const speciesBonuses = build.applySpeciesAbilityBonuses && speciesRule ? speciesRule.abilityBonuses || {} : {};
        const getScore = key => safeNumber(data.stats?.[key]) + safeNumber(data.tempStats?.[key]) + safeNumber(speciesBonuses[key]);
        const getModifier = key => Math.floor((getScore(key) - 10) / 2);
        const savingProficiencies = new Set([...(Array.isArray(data.savingThrows) ? data.savingThrows : []), ...(classRule?.savingThrows || [])]);
        const skillProficiencies = new Set([
            ...(Array.isArray(data.proficiencies?.proficient) ? data.proficiencies.proficient : []),
            ...(speciesRule?.skillProficiencies || []),
            ...(backgroundRule?.skillProficiencies || []),
            ...(Array.isArray(build.classSkillChoices) ? build.classSkillChoices : [])
        ]);
        const expertise = new Set([
            ...(Array.isArray(data.proficiencies?.expertise) ? data.proficiencies.expertise : []),
            ...(Array.isArray(build.classExpertiseChoices) ? build.classExpertiseChoices : [])
        ]);
        const abilities = Object.entries(ONLINE_ABILITY_LABELS).map(([key, label]) => {
            const modifier = getModifier(key);
            const proficient = savingProficiencies.has(key);
            return { key, label, score: getScore(key), modifier, saveBonus: modifier + (proficient ? proficiencyBonus : 0), saveProficient: proficient };
        });
        const skills = ONLINE_SKILLS.map(skill => {
            const isExpert = expertise.has(skill.key);
            const isProficient = isExpert || skillProficiencies.has(skill.key);
            const bonus = getModifier(skill.stat) + (isExpert ? proficiencyBonus * 2 : isProficient ? proficiencyBonus : 0);
            return { ...skill, bonus, proficient: isProficient, expertise: isExpert };
        });
        const passiveFor = key => 10 + (skills.find(skill => skill.key === key)?.bonus || 0);
        const spellcastingAbility = Object.prototype.hasOwnProperty.call(ONLINE_ABILITY_LABELS, data.grimoireConfig?.spellcastingAbility)
            ? data.grimoireConfig.spellcastingAbility
            : '';
        const spellcastingModifier = spellcastingAbility ? getModifier(spellcastingAbility) : null;
        const armorClass = Math.max(0, safeNumber(options.armorClass, 0));
        const trimList = (value, maximum) => (Array.isArray(value) ? value : []).slice(0, maximum);
        const sanitizeCreatureEntries = entries => trimList(entries, 20).map(entry => ({ name: safeText(entry?.name, 140), description: safeText(entry?.desc || entry?.description, 1000), dice: trimList(entry?.dice, 10).map(die => safeText(die, 40)) })).filter(entry => entry.name || entry.description);
        const companions = trimList(data.companions, 12).map(companion => {
            const details = companion?.details || {};
            return {
                id: safeText(companion?.id, 100),
                name: safeText(companion?.name, 120),
                category: safeText(companion?.category, 30),
                sourceLabel: safeText(companion?.sourceLabel, 120),
                avatarPath: safeText(companion?.avatarPath, 300),
                currentHp: Math.max(0, safeNumber(companion?.currentHp)),
                maxHp: Math.max(0, safeNumber(companion?.maxHp)),
                tempHp: Math.max(0, safeNumber(companion?.tempHp)),
                armorClass: companion?.armorClass === null || companion?.armorClass === undefined ? null : Math.max(0, safeNumber(companion.armorClass)),
                participates: companion?.participates === true,
                initiativeMode: ['after-owner', 'own', 'shared'].includes(companion?.initiativeMode) ? companion.initiativeMode : 'after-owner',
                initiative: companion?.initiative === null || companion?.initiative === undefined || companion?.initiative === '' ? null : safeNumber(companion.initiative),
                conditions: trimList(companion?.conditions, 30).map(condition => safeText(typeof condition === 'string' ? condition : condition?.name, 100)).filter(Boolean),
                notes: safeText(companion?.notes, 1000),
                details: {
                    subtitle: safeText(details.subtitle, 180), type: safeText(details.type, 100), speedText: safeText(details.speedText, 180), hitDice: safeText(details.hitDice, 80),
                    abilities: Object.fromEntries(['str','dex','con','int','wis','cha'].map(key => [key, safeNumber(details.abilities?.[key], 10)])),
                    saves: safeText(details.saves, 500), skills: safeText(details.skills, 500), senses: safeText(details.senses, 500), languages: safeText(details.languages, 500),
                    resistances: safeText(details.resistances, 500), immunities: safeText(details.immunities, 500), vulnerabilities: safeText(details.vulnerabilities, 500), conditionImmunities: safeText(details.conditionImmunities, 500),
                    traits: sanitizeCreatureEntries(details.traits), actions: sanitizeCreatureEntries(details.actions), bonusActions: sanitizeCreatureEntries(details.bonusActions), reactions: sanitizeCreatureEntries(details.reactions)
                }
            };
        }).filter(companion => companion.name);

        return {
            schemaVersion: 1,
            generatedAt: new Date().toISOString(),
            identity: {
                name: safeText(data.charInfo?.name || character?.meta?.name || 'Personaje sin nombre', 100),
                className: safeText(data.charInfo?.cls, 100),
                race: safeText(data.charInfo?.race, 100),
                level,
                size: safeText(data.size, 40),
                speed: safeText(data.speed, 40)
            },
            combat: {
                armorClass,
                currentHp: Math.max(0, safeNumber(data.hp?.current)),
                maxHp: Math.max(0, safeNumber(data.hp?.max)),
                tempHp: Math.max(0, safeNumber(data.hp?.temp)),
                initiativeBonus: getModifier('des') + safeNumber(data.initBonus),
                proficiencyBonus,
                inspiration: data.inspiration === true,
                guidance: data.guidance === true,
                hitDice: { current: Math.max(0, safeNumber(data.hitDice?.current)), type: safeText(data.hitDice?.type, 20) },
                deathSaves: { successes: Math.max(0, Math.min(3, safeNumber(data.deathSaves?.successes))), failures: Math.max(0, Math.min(3, safeNumber(data.deathSaves?.failures))) },
                concentration: safeText(data.activeConcentration?.spellName, 120)
            },
            passives: { perception: passiveFor('percepcion'), investigation: passiveFor('investigacion'), insight: passiveFor('perspicacia') },
            abilities,
            skills,
            resources: trimList(data.resources, 40).map(resource => ({ name: safeText(resource?.name, 100), current: safeNumber(resource?.current), max: Math.max(0, safeNumber(resource?.max)), type: safeText(resource?.type, 30), recovery: safeText(resource?.recoveryRest, 30) })).filter(resource => resource.name),
            weapons: trimList(data.weapons, 30).map(weapon => ({ name: safeText(weapon?.name, 100), attacks: trimList(weapon?.attacks, 8).map(attack => ({ name: safeText(attack?.name, 100), attack: safeText(attack?.atk, 40), damage: safeText(attack?.dmg, 100), notes: safeText(attack?.notes, 300) })) })).filter(weapon => weapon.name),
            armors: trimList(data.armors, 30).map(armor => ({ name: safeText(armor?.name, 100), type: safeText(armor?.type, 40), armorClass: safeNumber(armor?.ac), equipped: armor?.equipped === true, stealthDisadvantage: armor?.stealthDis === true })).filter(armor => armor.name),
            inventory: trimList(data.inventory, 120).map(item => ({ name: safeText(item?.name, 120), quantity: Math.max(0, safeNumber(item?.qty ?? item?.quantity)), description: safeText(item?.desc, 500) })).filter(item => item.name),
            tools: trimList(data.tools, 40).map(tool => ({ name: safeText(tool?.name, 120), description: safeText(tool?.desc, 400) })).filter(tool => tool.name),
            currency: { pc: Math.max(0, safeNumber(data.currency?.pc)), plata: Math.max(0, safeNumber(data.currency?.plata)), electro: Math.max(0, safeNumber(data.currency?.electro)), po: Math.max(0, safeNumber(data.currency?.po)), platino: Math.max(0, safeNumber(data.currency?.platino)) },
            proficiencies: trimList(data.proficiencyEntries, 80).filter(entry => !entry?.hidden && entry?.name).map(entry => ({ category: safeText(entry.category, 30), name: safeText(entry.name, 160), source: safeText(entry.source, 120) })),
            traits: trimList(data.traits, 80).map(trait => ({ name: safeText(trait?.title || trait?.name, 140), description: safeText(trait?.desc || trait?.description, 600) })).filter(trait => trait.name),
            feats: trimList(data.feats, 50).map(feat => ({ name: safeText(feat?.title || feat?.name, 140), description: safeText(feat?.desc || feat?.description, 600) })).filter(feat => feat.name),
            companions,
            spellcasting: {
                ability: spellcastingAbility,
                abilityName: ONLINE_ABILITY_LABELS[spellcastingAbility] || '',
                saveDc: spellcastingModifier === null ? null : 8 + proficiencyBonus + spellcastingModifier,
                attackBonus: spellcastingModifier === null ? null : proficiencyBonus + spellcastingModifier,
                slots: Object.entries(data.spellSlots || {}).map(([slotLevel, slot]) => ({ level: Math.max(1, Math.min(9, safeNumber(slotLevel, 1))), current: Math.max(0, safeNumber(slot?.current)), max: Math.max(0, safeNumber(slot?.max)) })).filter(slot => slot.max > 0),
                pactSlots: data.grimoireConfig?.usePactMagic ? { level: Math.max(1, Math.min(9, safeNumber(data.grimoireConfig?.pactSlots?.level, 1))), current: Math.max(0, safeNumber(data.grimoireConfig?.pactSlots?.current)), max: Math.max(0, safeNumber(data.grimoireConfig?.pactSlots?.max)) } : null
            },
            spells: trimList(data.spells, 250).map(spell => ({ name: safeText(spell?.name, 140), level: Math.max(0, Math.min(9, safeNumber(spell?.level))), school: safeText(spell?.school, 60), prepared: spell?.prepared === true, known: spell?.known !== false, concentration: spell?.concentration === true, ritual: spell?.ritual === true, castingTime: safeText(spell?.castingTime, 100), range: safeText(spell?.range, 100), duration: safeText(spell?.duration, 100), ownUsesCurrent: Math.max(0, safeNumber(spell?.ownUsesCurrent)), ownUsesMax: Math.max(0, safeNumber(spell?.ownUsesMax)) })).filter(spell => spell.name)
        };
    };

    const serializeOnlinePlayerSheetSnapshot = snapshot => {
        const serialized = JSON.stringify(snapshot);
        if (serialized.length > 240000) throw new Error('ONLINE_SHEET_TOO_LARGE');
        return serialized;
    };

    const parseOnlinePlayerSheetSnapshot = value => {
        try {
            const parsed = typeof value === 'string' ? JSON.parse(value) : value;
            return parsed && parsed.schemaVersion === 1 && parsed.identity && parsed.combat ? parsed : null;
        } catch (error) {
            return null;
        }
    };

    window.DndOnlineTableUtils = {
        ONLINE_CONDITIONS,
        ONLINE_ABILITY_LABELS,
        ONLINE_SKILL_LABELS,
        ONLINE_CONDITION_MECHANICS,
        ONLINE_EFFECT_OPERATIONS,
        ONLINE_EFFECT_MODIFIER_TYPES,
        aggregateEffectModifiers,
        combineRollMechanics,
        calculateAbilityModifier,
        calculateEnemyVisibleState,
        createOnlineCompanionParticipant,
        createOnlineCompanionParticipantId,
        createOnlinePlayerSheetSnapshot,
        createEnemyId,
        formatOnlinePresenceAge,
        formatOnlineModifier,
        formatEffectAdjustment,
        getConditionMechanicalEffects,
        getEffectiveAbilityScore,
        getEffectiveScalar,
        getOnlinePresence,
        getRollMechanics,
        getHpValues,
        isValidOnlinePlayerName,
        normalizeHpValue,
        normalizeOnlineConditions,
        normalizeEffectAdjustments,
        normalizeEffectDiceFormula,
        normalizeOnlinePlayerName,
        normalizeOnlineRoomCode,
        orderOnlineEncounterCombatants,
        resolveAdvantageState,
        rollEffectDiceFormula,
        parseOnlinePlayerSheetSnapshot,
        serializeOnlinePlayerSheetSnapshot
    };
}());
