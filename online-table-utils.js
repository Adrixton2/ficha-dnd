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
            ? { id: `condition_${condition}`, name: condition, source: '', notes: '', createdAt: new Date().toISOString() }
            : {
                id: condition.id || `condition_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                name: String(condition.name || ''),
                source: String(condition.source || ''),
                notes: String(condition.notes || ''),
                createdAt: condition.createdAt || new Date().toISOString()
            })
        .filter(condition => condition.name);

    const ONLINE_CONDITIONS = [
        'Agarrado', 'Asustado', 'Aturdido', 'Cegado', 'Derribado', 'Envenenado',
        'Ensordecido', 'Hechizado', 'Incapacitado', 'Invisible', 'Paralizado',
        'Petrificado', 'Restringido'
    ];

    window.DndOnlineTableUtils = {
        ONLINE_CONDITIONS,
        calculateEnemyVisibleState,
        createEnemyId,
        getHpValues,
        normalizeHpValue,
        normalizeOnlineConditions
    };
}());
