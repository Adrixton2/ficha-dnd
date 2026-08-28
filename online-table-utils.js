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

    const ONLINE_ABILITY_LABELS = Object.freeze({ fue: 'Fuerza', des: 'Destreza', con: 'Constitución', int: 'Inteligencia', sab: 'Sabiduría', car: 'Carisma' });
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
    const formatOnlineModifier = value => `${Number(value) >= 0 ? '+' : ''}${Number(value) || 0}`;

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
        calculateEnemyVisibleState,
        createOnlinePlayerSheetSnapshot,
        createEnemyId,
        formatOnlineModifier,
        getHpValues,
        isValidOnlinePlayerName,
        normalizeHpValue,
        normalizeOnlineConditions,
        normalizeOnlinePlayerName,
        parseOnlinePlayerSheetSnapshot,
        serializeOnlinePlayerSheetSnapshot
    };
}());
