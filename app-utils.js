/* Shared non-React helpers for the character sheet. */
window.DndAppUtils = (() => {

        const CHARACTER_MANAGER_KEY = 'dnd_character_manager_v1';
        const CHARACTER_MANAGER_VERSION = 1;
        const CHARACTER_EXPORT_FORMAT = 'dnd-character-sheet';
        const CHARACTER_EXPORT_SCHEMA_VERSION = 1;
        const MAX_IMPORT_FILE_SIZE = 1024 * 1024;
        const MAX_PORTRAIT_FILE_SIZE = 5 * 1024 * 1024;
        const MAX_PORTRAIT_DATA_URL_LENGTH = 1500000;
        const MAX_SHARED_AVATAR_DATA_URL_LENGTH = 100000;
        const LOCAL_BESTIARY_STORAGE_KEY = 'dnd_master_bestiary_v1';
        const LOCAL_BESTIARY_BACKUP_KEY = 'dnd_master_bestiary_backup_v1';
        const LOCAL_BESTIARY_SCHEMA_VERSION = 1;
        const MAX_BESTIARY_IMPORT_SIZE = 2 * 1024 * 1024;
        const MAX_BESTIARY_MONSTERS = 250;
        const MAX_BESTIARY_AVATAR_TOTAL = 2 * 1024 * 1024;
        const APP_SETTINGS_KEY = 'dnd_app_settings_v1';
        const ONLINE_TABLE_STORAGE_KEY = 'dnd_online_table_v1';
        const ONLINE_HP_PENDING_KEY = 'dnd_online_hp_pending_v1';
        const DEFAULT_APP_SETTINGS = { theme: 'classic', language: 'es', textSize: 'normal' };
        const APP_TRANSLATIONS = {
            es: { character: 'Personaje', combat: 'Combate', spellbook: 'Grimorio', inventory: 'Inventario/Lore', settings: 'Configuración', theme: 'Tema', language: 'Idioma', textSize: 'Tamaño de texto', classic: 'Oscuro clásico', parchment: 'Pergamino', arcane: 'Arcano', contrast: 'Alto contraste', small: 'Pequeño', normal: 'Normal', large: 'Grande', close: 'Cerrar' },
            en: { character: 'Character', combat: 'Combat', spellbook: 'Spellbook', inventory: 'Inventory/Lore', settings: 'Settings', theme: 'Theme', language: 'Language', textSize: 'Text size', classic: 'Classic dark', parchment: 'Parchment', arcane: 'Arcane', contrast: 'High contrast', small: 'Small', normal: 'Normal', large: 'Large', close: 'Close' }
        };

        const loadAppSettings = () => {
            try {
                const stored = JSON.parse(window.localStorage.getItem(APP_SETTINGS_KEY));
                if (!isRecord(stored)) return DEFAULT_APP_SETTINGS;
                return {
                    theme: ['classic', 'parchment', 'arcane', 'contrast'].includes(stored.theme) ? stored.theme : DEFAULT_APP_SETTINGS.theme,
                    language: ['es', 'en'].includes(stored.language) ? stored.language : DEFAULT_APP_SETTINGS.language,
                    textSize: ['small', 'normal', 'large'].includes(stored.textSize) ? stored.textSize : DEFAULT_APP_SETTINGS.textSize
                };
            } catch (error) {
                return DEFAULT_APP_SETTINGS;
            }
        };
        const loadOnlineTableSession = () => {
            try {
                const stored = JSON.parse(window.localStorage.getItem(ONLINE_TABLE_STORAGE_KEY));
                if (!isRecord(stored) || !/^[A-HJ-KM-NP-Z2-9]{6}$/.test(stored.currentRoomCode || '') || !['master', 'player'].includes(stored.currentRoomRole)) return null;
                return { code: stored.currentRoomCode, role: stored.currentRoomRole, sharedCharacterId: typeof stored.sharedCharacterId === 'string' ? stored.sharedCharacterId : null };
            } catch (error) {
                return null;
            }
        };
        const loadPendingHpSync = () => {
            try {
                const stored = JSON.parse(window.localStorage.getItem(ONLINE_HP_PENDING_KEY));
                return isRecord(stored) ? stored : {};
            } catch (error) {
                return {};
            }
        };

        const createCharacterId = () => window.crypto?.randomUUID?.() || `character_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const cloneData = (value) => JSON.parse(JSON.stringify(value));
        const createBlankSpellSlots = () => Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => [level, { current: 0, max: 0 }]));
        const createDefaultGrimoireConfig = () => ({ spellcastingAbility: '', useKnownLimit: false, knownLimit: '', usePrepared: false, preparedLimit: '', useCantripLimit: false, cantripLimit: '', usePactMagic: false, pactSlots: { current: 0, max: 0, level: 1 } });

        const createBlankCharacterData = () => ({
            charInfo: { name: '', race: '', cls: '' }, level: '1', inspiration: false,
            hp: { current: '', max: '', temp: '0' }, hitDice: { current: '', type: '' },
            speed: '', size: '', initBonus: '0', deathSaves: { successes: 0, failures: 0 },
            stats: { fue: '', des: '', con: '', int: '', sab: '', car: '' }, tempStats: { fue: '0', des: '0', con: '0', int: '0', sab: '0', car: '0' }, savingThrows: [],
            proficiencies: { expertise: [], proficient: [] }, resources: [], currency: { po: '0', pp: '0', pc: '0' },
            inventory: [], armors: [], tools: [], miscAc: '0', weapons: [], traits: [], feats: [],
            spells: [], spellLimits: { known: '', prepared: '' }, spellSlots: createBlankSpellSlots(), grimoireConfig: createDefaultGrimoireConfig(), conditions: [], timers: [], activityLog: [], sessionNotes: []
        });

        const legacyStorageKeys = {
            charInfo: 'kael_char_info', level: 'kael_level', inspiration: 'kael_inspiration', hp: 'kael_hp_v3',
            hitDice: 'kael_hit_dice_v2', speed: 'kael_speed', size: 'kael_size', initBonus: 'kael_init_bonus_v2',
            deathSaves: 'kael_deathsaves', stats: 'kael_stats_v2', savingThrows: 'kael_saving_throws',
            proficiencies: 'kael_proficiencies', resources: 'kael_resources', currency: 'kael_currency_v2',
            inventory: 'kael_inventory_v3', armors: 'kael_armors_v1', tools: 'kael_tools_v1', miscAc: 'kael_misc_ac',
            weapons: 'kael_weapons_v3', traits: 'kael_traits', feats: 'kael_feats', spells: 'kael_spells_v3',
            spellLimits: 'kael_spell_limits', spellSlots: 'kael_spell_slots', sessionNotes: 'kael_session_notes_v2'
        };

        const legacyDefaults = () => ({
            charInfo: { name: 'Kael Velosombrío', race: 'Shadar-kai', cls: 'Pícaro (Soulknife)' }, level: '5', inspiration: false,
            hp: { current: '34', max: '34', temp: '0' }, hitDice: { current: '5', type: 'd8' }, speed: '30', size: 'Mediano', initBonus: '0', deathSaves: { successes: 0, failures: 0 },
            stats: { fue: '12', des: '20', con: '16', int: '12', sab: '15', car: '15' }, tempStats: { fue: '0', des: '0', con: '0', int: '0', sab: '0', car: '0' }, savingThrows: ['des', 'int'],
            proficiencies: { expertise: ['sigilo', 'percepcion'], proficient: ['acrobacias', 'juego_de_manos', 'engano', 'persuasion'] },
            resources: [
                { id: 'res_psi', name: 'Dados Psiónicos', current: 6, max: 6, type: 'd8' },
                { id: 'res_luck', name: 'Suerte (Lucky)', current: 3, max: 3, type: '' },
                { id: 'res_ki', name: 'Puntos de Ki', current: 0, max: 0, type: '' },
                { id: 'res_sup', name: 'Dados de Superioridad', current: 0, max: 0, type: 'd8' }
            ],
            currency: { po: '191', pp: '0', pc: '0' },
            inventory: [
                { id: 'i1', name: 'Antorchas', qty: 5, desc: 'Luz brillante a 20 pies, tenue a 20 más.' },
                { id: 'i2', name: 'Cuerda de Cáñamo', qty: 1, desc: '50 pies de longitud.' },
                { id: 'i3', name: 'Raciones', qty: 10, desc: 'Comida para 1 día.' },
                { id: 'i5', name: 'Poción Azul', qty: 19, desc: 'Efecto desconocido/Mágico.' },
                { id: 'i6', name: 'Poción de Vida', qty: 1, desc: 'Cura 2d4+2 PV.' }
            ],
            armors: [{ id: 'arm_1', name: 'Armadura de Cuero Tachonado', type: 'light', ac: 12, stealthDis: false, equipped: true }],
            tools: [{ id: 'tool_1', name: 'Herramientas de Ladrón', desc: 'Permite abrir cerraduras y desarmar trampas si se tiene competencia.' }], miscAc: '0',
            weapons: [
                { id: 'wp_soul', name: 'Cuchillas Psíquicas', attacks: [
                    { name: 'Cuchilla Principal', atk: '+8', dmg: '1d6 + 5 Psíquico', notes: 'Sutil, arrojadiza (60\'). Desaparece al impactar.' },
                    { name: 'Cuchilla Secundaria', atk: '+8', dmg: '1d4 + 5 Psíquico', notes: 'Acción bonus. Requiere mano libre.' }
                ]},
                { id: 'wp_snk', name: 'Ataque Furtivo', attacks: [{ name: 'Daño Furtivo', atk: 'Auto', dmg: '+3d6 Extra', notes: '1 vez/turno con Ventaja o aliado a 5 pies.' }] }
            ],
            traits: [
                { title: 'Esquiva Asombrosa (Uncanny Dodge)', desc: 'Reacción para dividir daño a la mitad.' },
                { title: 'Telepatía Psiónica', desc: '1 milla de distancia, dura 1d8 horas.' },
                { title: 'Habilidad Agudizada', desc: 'Suma 1d8 a pruebas de habilidad falladas.' }
            ],
            feats: [{ title: 'Afortunado (Lucky)', desc: 'Tienes 3 puntos de suerte. Puedes gastar uno para tirar un d20 adicional en ataques, pruebas o salvaciones.' }],
            spells: [], spellLimits: { known: '', prepared: '' }, spellSlots: createBlankSpellSlots(),
            sessionNotes: [{ id: `note_${Date.now()}`, date: new Date().toLocaleDateString(), text: 'Comienza la aventura...' }]
        });

        const readLegacyCharacterData = () => {
            const defaults = legacyDefaults();
            return Object.keys(legacyStorageKeys).reduce((data, field) => {
                try {
                    const stored = window.localStorage.getItem(legacyStorageKeys[field]);
                    data[field] = stored ? JSON.parse(stored) : defaults[field];
                } catch (error) {
                    data[field] = defaults[field];
                }
                return data;
            }, {});
        };

        const createCharacterRecord = (data, name, portrait = '') => {
            const now = new Date().toISOString();
            return {
                meta: { id: createCharacterId(), name: name || data.charInfo?.name || 'Personaje sin nombre', createdAt: now, updatedAt: now, portrait },
                data: cloneData(data)
            };
        };

        const isRecord = (value) => value && typeof value === 'object' && !Array.isArray(value);
        const normalizeSpell = (spell) => ({ id: spell.id || `sp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, sourceId: typeof spell.sourceId === 'string' ? spell.sourceId : '', name: spell.name || '', level: Math.max(0, Math.min(9, Number(spell.level) || 0)), school: spell.school || '', castingTime: spell.castingTime || '', duration: spell.duration || '', range: spell.range || '', areaShape: spell.areaShape || (spell.shape && spell.shape !== '-' ? spell.shape : 'ninguna'), areaSize: spell.areaSize || spell.size || '', length: spell.length || '', width: spell.width || '', customArea: spell.customArea || '', compV: !!spell.compV, compS: !!spell.compS, compM: !!spell.compM, compMDesc: spell.compMDesc || '', concentration: !!spell.concentration, ritual: !!spell.ritual, attackBonus: spell.attackBonus || '', savingThrow: !!spell.savingThrow, savingAbility: spell.savingAbility || '', damageHealing: spell.damageHealing || '', description: spell.description || '', notes: spell.notes || '', known: spell.known !== false, prepared: Number(spell.level) === 0 ? false : !!spell.prepared, favorite: !!spell.favorite });
        const normalizeResource = (resource) => {
            const suggestedRest = resource.recoveryRest || (resource.recovery === 'both' ? 'short' : resource.recovery === 'short' || resource.recovery === 'long' || resource.recovery === 'manual' ? resource.recovery : 'manual');
            return { ...resource, recoveryRest: suggestedRest === 'both' ? 'short' : suggestedRest, recoveryMode: ['full','fixed','half','manual'].includes(resource.recoveryMode) ? resource.recoveryMode : 'full', recoveryAmount: Number(resource.recoveryAmount) || 0 };
        };
        const normalizeTempStats = (tempStats) => Object.fromEntries(['fue', 'des', 'con', 'int', 'sab', 'car'].map(key => [key, String(Number(tempStats?.[key]) || 0)]));
        const getArmorFormula = (armor) => {
            const ac = Number(armor?.ac) || (armor?.type === 'shield' ? 2 : 11);
            if (armor?.type === 'light') return `${ac} + DES`;
            if (armor?.type === 'medium') return `${ac} + DES (máx. +2)`;
            if (armor?.type === 'heavy') return `${ac} fija`;
            return `+${ac} CA`;
        };
        const calculateCharacterArmorClass = (data) => {
            const armorList = Array.isArray(data?.armors) ? data.armors : [];
            const equippedArmor = armorList.find(armor => armor.equipped && armor.type !== 'shield');
            const equippedShield = armorList.find(armor => armor.equipped && armor.type === 'shield');
            const dexScore = (Number(data?.stats?.des) || 0) + (Number(data?.tempStats?.des) || 0);
            const dexModifier = Math.floor((dexScore - 10) / 2);
            const dexLimit = equippedArmor?.type === 'medium' ? 2 : equippedArmor?.type === 'heavy' ? 0 : Infinity;
            const armorBase = equippedArmor ? (Number(equippedArmor.ac) || 0) : 10;
            const shieldBonus = equippedShield ? (Number(equippedShield.ac) || 2) : 0;
            return armorBase + Math.min(dexModifier, dexLimit) + shieldBonus + (Number(data?.miscAc) || 0);
        };
        const reorderItemsById = (items, sourceId, targetId) => {
            const sourceIndex = items.findIndex(item => item.id === sourceId);
            const targetIndex = items.findIndex(item => item.id === targetId);
            if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return items;
            const next = items.slice();
            const [moved] = next.splice(sourceIndex, 1);
            next.splice(targetIndex, 0, moved);
            return next;
        };
        const REAL_TIMER_UNITS = { minutes: 60 * 1000, hours: 60 * 60 * 1000 };
        const normalizeTimer = (timer) => {
            const type = ['turns', 'rounds', 'minutes', 'hours', 'days'].includes(timer.type) ? timer.type : 'turns';
            const current = Math.max(0, Number(timer.current) || 0);
            const storedExpiration = Date.parse(timer.expiresAt);
            const expiresAt = REAL_TIMER_UNITS[type] ? (Number.isFinite(storedExpiration) ? new Date(storedExpiration).toISOString() : new Date(Date.now() + current * REAL_TIMER_UNITS[type]).toISOString()) : '';
            return { id: timer.id || `timer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, name: typeof timer.name === 'string' ? timer.name : '', current, max: timer.max === '' || timer.max === null || timer.max === undefined ? '' : Math.max(0, Number(timer.max) || 0), type, expiresAt };
        };
        const normalizeActivityLog = (entries) => Array.isArray(entries) ? entries.filter(entry => isRecord(entry) && typeof entry.description === 'string').map(entry => ({ id: entry.id || `activity_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, timestamp: Number.isFinite(Date.parse(entry.timestamp)) ? entry.timestamp : new Date().toISOString(), description: entry.description })).slice(0, 100) : [];
        const normalizeGrimoireData = (data) => ({ ...data, tempStats: normalizeTempStats(data.tempStats), resources: Array.isArray(data.resources) ? data.resources.map(normalizeResource) : [], spells: Array.isArray(data.spells) ? data.spells.map(normalizeSpell) : [], conditions: Array.isArray(data.conditions) ? data.conditions : [], timers: Array.isArray(data.timers) ? data.timers.map(normalizeTimer) : [], activityLog: normalizeActivityLog(data.activityLog), grimoireConfig: { ...createDefaultGrimoireConfig(), ...(isRecord(data.grimoireConfig) ? data.grimoireConfig : {}), pactSlots: { ...createDefaultGrimoireConfig().pactSlots, ...(isRecord(data.grimoireConfig?.pactSlots) ? data.grimoireConfig.pactSlots : {}) } } });
        const calculateRestPreview = (restType, characterData, spentHitDice = 0, manualHealing = 0) => {
            const data = normalizeGrimoireData(cloneData(characterData));
            const changes = [], unchanged = [];
            const recoverResource = resource => {
                const eligible = restType === 'long' ? ['short','long'].includes(resource.recoveryRest) : resource.recoveryRest === 'short';
                if (!eligible || resource.recoveryMode === 'manual') { unchanged.push(resource.name); return resource; }
                const max = Number(resource.max) || 0, current = Number(resource.current) || 0;
                const gain = resource.recoveryMode === 'fixed' ? Number(resource.recoveryAmount) || 0 : resource.recoveryMode === 'half' ? (max > 0 ? Math.max(1, Math.floor(max / 2)) : 0) : max;
                const next = Math.min(max, resource.recoveryMode === 'full' ? max : current + gain);
                if (next !== current) changes.push(`${resource.name}: ${current}/${max} -> ${next}/${max}`); else unchanged.push(resource.name);
                return { ...resource, current: next };
            };
            data.resources = data.resources.map(recoverResource);
            const hpMax = Number(data.hp?.max), hpCurrent = Number(data.hp?.current) || 0, availableDice = Math.max(0, Number(data.hitDice?.current) || 0);
            if (restType === 'short') {
                const spent = Math.min(availableDice, Math.max(0, Number(spentHitDice) || 0));
                const healing = spent > 0 && Number.isFinite(hpMax) ? Math.max(0, Number(manualHealing) || 0) : 0;
                if (spent) { data.hitDice = { ...data.hitDice, current: String(availableDice - spent) }; changes.push(`Dados de golpe: ${availableDice} -> ${availableDice - spent}`); }
                if (healing && Number.isFinite(hpMax)) { const nextHp = Math.min(hpMax, hpCurrent + healing); data.hp = { ...data.hp, current: String(nextHp) }; changes.push(`Vida: ${hpCurrent}/${hpMax} -> ${nextHp}/${hpMax}`); }
                if (data.grimoireConfig.usePactMagic) { const pact = data.grimoireConfig.pactSlots, next = Number(pact.max) || 0; if (Number(pact.current) !== next) { data.grimoireConfig.pactSlots = { ...pact, current: next }; changes.push(`Magia de pacto: ${pact.current}/${pact.max} -> ${next}/${pact.max}`); } }
            } else {
                if (Number.isFinite(hpMax)) { data.hp = { ...data.hp, current: String(hpMax) }; if (hpCurrent !== hpMax) changes.push(`Vida: ${hpCurrent}/${hpMax} -> ${hpMax}/${hpMax}`); }
                const totalDice = Math.max(0, Number(data.level) || 0), recovered = totalDice > 0 ? Math.max(1, Math.floor(totalDice / 2)) : 0, nextDice = Math.min(totalDice, availableDice + recovered); data.hitDice = { ...data.hitDice, current: String(nextDice) }; if (nextDice !== availableDice) changes.push(`Dados de golpe: ${availableDice} -> ${nextDice}`);
                data.spellSlots = Object.fromEntries(Object.entries(data.spellSlots).map(([level, slot]) => { const next = Number(slot.max) || 0; if (Number(slot.current) !== next) changes.push(`Ranura nivel ${level}: ${slot.current}/${slot.max} -> ${next}/${slot.max}`); return [level, { ...slot, current: next }]; }));
                if (data.grimoireConfig.usePactMagic) data.grimoireConfig.pactSlots = { ...data.grimoireConfig.pactSlots, current: Number(data.grimoireConfig.pactSlots.max) || 0 };
            }
            return { data, changes, unchanged };
        };
        const isValidPortraitDataUrl = (value) => typeof value === 'string' && value.length <= MAX_PORTRAIT_DATA_URL_LENGTH && /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/]+={0,2}$/i.test(value);
        const createBestiaryId = () => `monster_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        const normalizeBestiaryMonster = (value, now = new Date().toISOString()) => ({
            id: typeof value?.id === 'string' && value.id ? value.id : createBestiaryId(),
            name: String(value?.name || '').trim(),
            maxHp: Math.max(0, Number.isFinite(Number(value?.maxHp)) ? Number(value.maxHp) : 0),
            armorClass: value?.armorClass === '' || value?.armorClass === null || value?.armorClass === undefined || !Number.isFinite(Number(value.armorClass)) ? null : Math.max(0, Number(value.armorClass)),
            defaultVisibleStateMode: ['automatic', 'manual', 'hidden'].includes(value?.defaultVisibleStateMode) ? value.defaultVisibleStateMode : 'automatic',
            defaultManualVisibleState: typeof value?.defaultManualVisibleState === 'string' && value.defaultManualVisibleState ? value.defaultManualVisibleState : null,
            defaultPublicConditions: Array.isArray(value?.defaultPublicConditions) ? value.defaultPublicConditions.filter(item => typeof item === 'string' || isRecord(item)).map(item => cloneData(item)) : [],
            privateNotes: String(value?.privateNotes || ''),
            tags: Array.isArray(value?.tags) ? value.tags.map(tag => String(tag).trim()).filter(Boolean) : [],
            avatarDataUrl: isValidPortraitDataUrl(value?.avatarDataUrl) && value.avatarDataUrl.length <= MAX_SHARED_AVATAR_DATA_URL_LENGTH ? value.avatarDataUrl : '',
            createdAt: typeof value?.createdAt === 'string' ? value.createdAt : now,
            updatedAt: typeof value?.updatedAt === 'string' ? value.updatedAt : now
        });
        const loadLocalBestiary = () => {
            const empty = { schemaVersion: LOCAL_BESTIARY_SCHEMA_VERSION, updatedAt: new Date().toISOString(), monsters: [], warning: '' };
            try {
                const raw = window.localStorage.getItem(LOCAL_BESTIARY_STORAGE_KEY);
                if (!raw) return empty;
                const parsed = JSON.parse(raw);
                if (!isRecord(parsed) || parsed.schemaVersion !== LOCAL_BESTIARY_SCHEMA_VERSION || !Array.isArray(parsed.monsters)) throw new Error('Formato de bestiario no válido.');
                return { ...empty, updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : empty.updatedAt, monsters: parsed.monsters.map(monster => normalizeBestiaryMonster(monster)).filter(monster => monster.name) };
            } catch (error) {
                try { window.localStorage.setItem(`${LOCAL_BESTIARY_STORAGE_KEY}_corrupt_${Date.now()}`, window.localStorage.getItem(LOCAL_BESTIARY_STORAGE_KEY) || ''); } catch (backupError) {}
                return { ...empty, warning: 'El bestiario local no pudo leerse. Se ha iniciado vacío sin sobrescribir la copia anterior.' };
            }
        };
        const saveLocalBestiary = (bestiary) => {
            const payload = { schemaVersion: LOCAL_BESTIARY_SCHEMA_VERSION, updatedAt: new Date().toISOString(), monsters: Array.isArray(bestiary?.monsters) ? bestiary.monsters.map(monster => normalizeBestiaryMonster(monster)) : [] };
            window.localStorage.setItem(LOCAL_BESTIARY_STORAGE_KEY, JSON.stringify(payload));
            return payload;
        };
        const createBestiaryExportPayload = (monsters) => ({ format: 'dnd-local-bestiary', schemaVersion: LOCAL_BESTIARY_SCHEMA_VERSION, exportedAt: new Date().toISOString(), monsters: (Array.isArray(monsters) ? monsters : []).map(monster => normalizeBestiaryMonster(monster)) });
        const hasCharacterDataShape = (data) => {
            const objectFields = ['charInfo', 'hp', 'hitDice', 'deathSaves', 'stats', 'proficiencies', 'currency', 'spellLimits', 'spellSlots'];
            const arrayFields = ['savingThrows', 'resources', 'inventory', 'armors', 'tools', 'weapons', 'traits', 'feats', 'spells', 'sessionNotes'];
            return isRecord(data) && objectFields.every(field => isRecord(data[field])) && arrayFields.every(field => Array.isArray(data[field])) && typeof data.charInfo.name === 'string';
        };
        const normalizeLegacyData = (rawData) => {
            const defaults = legacyDefaults();
            const data = { ...defaults, ...rawData };
            const objectFields = ['charInfo', 'hp', 'hitDice', 'deathSaves', 'stats', 'tempStats', 'currency', 'spellLimits'];
            objectFields.forEach(field => {
                data[field] = isRecord(rawData[field]) ? { ...defaults[field], ...rawData[field] } : defaults[field];
            });
            const asText = (value, fallback) => typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
            ['level', 'speed', 'size', 'initBonus', 'miscAc'].forEach(field => { data[field] = asText(rawData[field], defaults[field]); });
            data.inspiration = typeof rawData.inspiration === 'boolean' ? rawData.inspiration : defaults.inspiration;
            data.charInfo = Object.fromEntries(Object.keys(defaults.charInfo).map(field => [field, asText(data.charInfo[field], defaults.charInfo[field])]));
            data.stats = Object.fromEntries(Object.keys(defaults.stats).map(field => [field, asText(data.stats[field], defaults.stats[field])]));
            ['current', 'max', 'temp'].forEach(field => { data.hp[field] = asText(data.hp[field], defaults.hp[field]); });
            ['current', 'type'].forEach(field => { data.hitDice[field] = asText(data.hitDice[field], defaults.hitDice[field]); });
            data.deathSaves = {
                successes: Number.isFinite(Number(data.deathSaves.successes)) ? Number(data.deathSaves.successes) : defaults.deathSaves.successes,
                failures: Number.isFinite(Number(data.deathSaves.failures)) ? Number(data.deathSaves.failures) : defaults.deathSaves.failures
            };
            Object.keys(defaults.currency).forEach(field => { data.currency[field] = asText(data.currency[field], defaults.currency[field]); });
            Object.keys(defaults.spellLimits).forEach(field => { data.spellLimits[field] = asText(data.spellLimits[field], defaults.spellLimits[field]); });
            data.proficiencies = isRecord(rawData.proficiencies) ? {
                expertise: Array.isArray(rawData.proficiencies.expertise) ? rawData.proficiencies.expertise : defaults.proficiencies.expertise,
                proficient: Array.isArray(rawData.proficiencies.proficient) ? rawData.proficiencies.proficient : defaults.proficiencies.proficient
            } : defaults.proficiencies;
            data.spellSlots = Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                const slot = isRecord(rawData.spellSlots?.[level]) ? { ...defaults.spellSlots[level], ...rawData.spellSlots[level] } : defaults.spellSlots[level];
                return [level, { current: Number.isFinite(Number(slot.current)) ? Number(slot.current) : defaults.spellSlots[level].current, max: Number.isFinite(Number(slot.max)) ? Number(slot.max) : defaults.spellSlots[level].max }];
            }));
            ['savingThrows', 'resources', 'inventory', 'armors', 'tools', 'weapons', 'traits', 'feats', 'spells', 'sessionNotes'].forEach(field => {
                data[field] = Array.isArray(rawData[field]) ? rawData[field] : defaults[field];
            });
            return normalizeGrimoireData(data);
        };
        const createUniqueCharacterRecord = (data, name, portrait, characters = {}) => {
            let record;
            do { record = createCharacterRecord(data, name, portrait); } while (characters[record.meta.id]);
            return record;
        };
        const resizePortraitFile = (file) => new Promise((resolve, reject) => {
            if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
                reject(new Error('Selecciona una imagen PNG, JPEG o WebP.'));
                return;
            }
            if (file.size > MAX_PORTRAIT_FILE_SIZE) {
                reject(new Error('La imagen supera el límite de 5 MB.'));
                return;
            }
            const objectUrl = URL.createObjectURL(file);
            const image = new Image();
            const release = () => URL.revokeObjectURL(objectUrl);
            image.onload = () => {
                const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
                if (!longestSide) {
                    release();
                    reject(new Error('No se pudo procesar la imagen.'));
                    return;
                }
                const scale = Math.min(1, 512 / longestSide);
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
                canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
                const context = canvas.getContext('2d');
                if (!context) {
                    release();
                    reject(new Error('El navegador no permite procesar esta imagen.'));
                    return;
                }
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                const portrait = canvas.toDataURL('image/webp', 0.8);
                release();
                if (!isValidPortraitDataUrl(portrait)) {
                    reject(new Error('La imagen procesada no es válida.'));
                    return;
                }
                resolve(portrait);
            };
            image.onerror = () => {
                release();
                reject(new Error('No se pudo leer la imagen seleccionada.'));
            };
            image.src = objectUrl;
        });
        const createExportPayload = (character) => ({
            format: CHARACTER_EXPORT_FORMAT,
            schemaVersion: CHARACTER_EXPORT_SCHEMA_VERSION,
            exportedAt: new Date().toISOString(),
            character: cloneData(character)
        });
        const createSharedAvatar = (portrait) => new Promise((resolve, reject) => {
            if (!isValidPortraitDataUrl(portrait)) { resolve(''); return; }
            const image = new Image();
            image.onload = () => {
                const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
                if (!longestSide) { reject(new Error('No se pudo procesar el retrato.')); return; }
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) { reject(new Error('El navegador no permite crear la miniatura.')); return; }
                const sizes = [384, 320, 256, 192, 160, 128];
                for (const size of sizes) {
                    const scale = Math.min(1, size / longestSide);
                    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
                    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    const avatar = canvas.toDataURL('image/webp', 0.78);
                    if (avatar.length <= MAX_SHARED_AVATAR_DATA_URL_LENGTH && isValidPortraitDataUrl(avatar)) {
                        resolve(avatar);
                        return;
                    }
                }
                resolve('');
            };
            image.onerror = () => reject(new Error('No se pudo leer el retrato.'));
            image.src = portrait;
        });
        const createSafeExportFileName = (name) => {
            const safeName = String(name || 'personaje').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'personaje';
            return `${safeName}-${new Date().toISOString().slice(0, 10)}.json`;
        };
        const getImportedCharacter = (payload) => {
            if (!isRecord(payload) || payload.format !== CHARACTER_EXPORT_FORMAT) throw new Error('El archivo no es una ficha de personaje compatible.');
            if (payload.schemaVersion === 0 && isRecord(payload.character) && isRecord(payload.character.data)) {
                const blank = createBlankCharacterData();
                return {
                    meta: { ...payload.character.meta, name: payload.character.meta?.name || payload.character.data.charInfo?.name || 'Personaje importado', portrait: payload.character.meta?.portrait || '' },
                    data: { ...blank, ...payload.character.data, charInfo: { ...blank.charInfo, ...payload.character.data.charInfo }, hp: { ...blank.hp, ...payload.character.data.hp }, hitDice: { ...blank.hitDice, ...payload.character.data.hitDice }, deathSaves: { ...blank.deathSaves, ...payload.character.data.deathSaves }, stats: { ...blank.stats, ...payload.character.data.stats }, proficiencies: { ...blank.proficiencies, ...payload.character.data.proficiencies }, currency: { ...blank.currency, ...payload.character.data.currency }, spellLimits: { ...blank.spellLimits, ...payload.character.data.spellLimits }, spellSlots: { ...blank.spellSlots, ...payload.character.data.spellSlots } }
                };
            }
            if (payload.schemaVersion !== CHARACTER_EXPORT_SCHEMA_VERSION) throw new Error('La versión de esta ficha no es compatible.');
            if (!isRecord(payload.character) || !isRecord(payload.character.meta) || !isRecord(payload.character.data)) throw new Error('El archivo no contiene los datos completos de un personaje.');
            return payload.character;
        };
        const validateImportedCharacter = (character) => {
            const { meta, data } = character;
            if (!isRecord(meta) || !isRecord(data) || typeof meta.name !== 'string' || (meta.portrait !== undefined && meta.portrait !== '' && !isValidPortraitDataUrl(meta.portrait))) throw new Error('Los metadatos del personaje no son válidos.');
            if (!hasCharacterDataShape(data)) throw new Error('Los datos de la ficha están incompletos o tienen un formato incorrecto.');
            return { meta: cloneData(meta), data: cloneData(data) };
        };

        const normalizeStoredManager = (stored) => {
            if (!isRecord(stored) || stored.version !== CHARACTER_MANAGER_VERSION || !isRecord(stored.characters)) return null;
            const now = new Date().toISOString();
            const characters = Object.entries(stored.characters).reduce((validCharacters, [id, character]) => {
                if (!isRecord(character) || !isRecord(character.meta) || !hasCharacterDataShape(character.data)) return validCharacters;
                validCharacters[id] = {
                    meta: {
                        ...character.meta,
                        id,
                        name: typeof character.meta.name === 'string' ? character.meta.name : 'Personaje sin nombre',
                        createdAt: typeof character.meta.createdAt === 'string' ? character.meta.createdAt : now,
                        updatedAt: typeof character.meta.updatedAt === 'string' ? character.meta.updatedAt : now,
                        portrait: isValidPortraitDataUrl(character.meta.portrait) ? character.meta.portrait : ''
                    },
                    data: normalizeGrimoireData(character.data)
                };
                return validCharacters;
            }, {});
            const ids = Object.keys(characters);
            if (!ids.length) return null;
            return { version: CHARACTER_MANAGER_VERSION, activeCharacterId: characters[stored.activeCharacterId] ? stored.activeCharacterId : ids[0], characters };
        };

        const loadCharacterManager = () => {
            try {
                const stored = JSON.parse(window.localStorage.getItem(CHARACTER_MANAGER_KEY));
                const normalized = normalizeStoredManager(stored);
                if (normalized) return normalized;
            } catch (error) {}

            const legacyData = normalizeLegacyData(readLegacyCharacterData());
            const record = createUniqueCharacterRecord(legacyData, legacyData.charInfo?.name || 'Personaje importado');
            const migrated = { version: CHARACTER_MANAGER_VERSION, activeCharacterId: record.meta.id, characters: { [record.meta.id]: record } };
            try { window.localStorage.setItem(CHARACTER_MANAGER_KEY, JSON.stringify(migrated)); } catch (error) {}
            return migrated;
        };


        return {
            CHARACTER_MANAGER_KEY,
            CHARACTER_MANAGER_VERSION,
            CHARACTER_EXPORT_FORMAT,
            CHARACTER_EXPORT_SCHEMA_VERSION,
            MAX_IMPORT_FILE_SIZE,
            MAX_PORTRAIT_FILE_SIZE,
            MAX_PORTRAIT_DATA_URL_LENGTH,
            MAX_SHARED_AVATAR_DATA_URL_LENGTH,
            LOCAL_BESTIARY_STORAGE_KEY,
            LOCAL_BESTIARY_BACKUP_KEY,
            LOCAL_BESTIARY_SCHEMA_VERSION,
            MAX_BESTIARY_IMPORT_SIZE,
            MAX_BESTIARY_MONSTERS,
            MAX_BESTIARY_AVATAR_TOTAL,
            APP_SETTINGS_KEY,
            ONLINE_TABLE_STORAGE_KEY,
            ONLINE_HP_PENDING_KEY,
            DEFAULT_APP_SETTINGS,
            APP_TRANSLATIONS,
            loadAppSettings,
            loadOnlineTableSession,
            loadPendingHpSync,
            createCharacterId,
            cloneData,
            createBlankSpellSlots,
            createDefaultGrimoireConfig,
            createBlankCharacterData,
            legacyStorageKeys,
            legacyDefaults,
            readLegacyCharacterData,
            createCharacterRecord,
            isRecord,
            normalizeSpell,
            normalizeResource,
            normalizeTempStats,
            getArmorFormula,
            calculateCharacterArmorClass,
            reorderItemsById,
            REAL_TIMER_UNITS,
            normalizeTimer,
            normalizeActivityLog,
            normalizeGrimoireData,
            calculateRestPreview,
            isValidPortraitDataUrl,
            createBestiaryId,
            normalizeBestiaryMonster,
            loadLocalBestiary,
            saveLocalBestiary,
            createBestiaryExportPayload,
            hasCharacterDataShape,
            normalizeLegacyData,
            createUniqueCharacterRecord,
            resizePortraitFile,
            createExportPayload,
            createSharedAvatar,
            createSafeExportFileName,
            getImportedCharacter,
            validateImportedCharacter,
            normalizeStoredManager,
            loadCharacterManager
        };
})();
