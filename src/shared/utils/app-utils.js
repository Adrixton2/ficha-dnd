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
                return {
                    code: stored.currentRoomCode,
                    role: stored.currentRoomRole,
                    sharedCharacterId: typeof stored.sharedCharacterId === 'string' ? stored.sharedCharacterId : null,
                    playerName: typeof stored.playerName === 'string' ? stored.playerName.trim().slice(0, 40) : ''
                };
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
        const createDefaultGrimoireConfig = () => ({ spellcastingAbility: '', srdProfileKey: '', useKnownLimit: false, knownLimit: '', usePrepared: false, preparedLimit: '', useCantripLimit: false, cantripLimit: '', usePactMagic: false, pactSlots: { current: 0, max: 0, level: 1 } });
        const createDefaultCharacterBuild = () => ({
            classId: '', subclassId: '', subclassName: '', speciesId: '', backgroundId: '', backgroundName: '', classSkillChoices: [], classExpertiseChoices: [],
            applySpeciesAbilityBonuses: false,
            autoHitDie: true, autoSpeedAndSize: true, autoFeatures: true, lastLevelReview: 0
        });
        const createBlankNarrativeProfile = () => ({
            alignment: '', age: '', height: '', weight: '', appearance: '', personality: '', ideals: '', bonds: '', flaws: '',
            organizations: '', allies: '', enemies: '', goals: '', faith: '', history: ''
        });
        const CHARACTER_ACCENTS = ['violet', 'crimson', 'azure', 'emerald', 'amber', 'silver'];
        const createDefaultCharacterPresentation = () => ({ accent: 'violet', tagline: '', visibility: 'profile', featuredTraitId: '', featuredItemId: '', featuredSpellId: '' });

        const createBlankCharacterData = () => ({
            charInfo: { name: '', race: '', cls: '' }, characterBuild: createDefaultCharacterBuild(), narrative: createBlankNarrativeProfile(), presentation: createDefaultCharacterPresentation(), level: '1', inspiration: false, guidance: false,
            hp: { current: '', max: '', temp: '0' }, hitDice: { current: '', type: '' },
            speed: '', size: '', initBonus: '0', deathSaves: { successes: 0, failures: 0 },
            stats: { fue: '', des: '', con: '', int: '', sab: '', car: '' }, tempStats: { fue: '0', des: '0', con: '0', int: '0', sab: '0', car: '0' }, savingThrows: [],
            proficiencies: { expertise: [], proficient: [] }, proficiencyEntries: [], resources: [], currency: { pc: '0', plata: '0', electro: '0', po: '0', platino: '0' },
            inventory: [], armors: [], tools: [], miscAc: '0', weapons: [], traits: [], feats: [], companions: [],
            spells: [], spellLimits: { known: '', prepared: '' }, spellSlots: createBlankSpellSlots(), grimoireConfig: createDefaultGrimoireConfig(), spellGrantUses: {}, activeConcentration: null, conditions: [], timers: [], activityLog: [], sessionNotes: []
        });

        const legacyStorageKeys = {
            charInfo: 'kael_char_info', level: 'kael_level', inspiration: 'kael_inspiration', guidance: 'kael_guidance', hp: 'kael_hp_v3',
            hitDice: 'kael_hit_dice_v2', speed: 'kael_speed', size: 'kael_size', initBonus: 'kael_init_bonus_v2',
            deathSaves: 'kael_deathsaves', stats: 'kael_stats_v2', savingThrows: 'kael_saving_throws',
            proficiencies: 'kael_proficiencies', resources: 'kael_resources', currency: 'kael_currency_v2',
            inventory: 'kael_inventory_v3', armors: 'kael_armors_v1', tools: 'kael_tools_v1', miscAc: 'kael_misc_ac',
            weapons: 'kael_weapons_v3', traits: 'kael_traits', feats: 'kael_feats', spells: 'kael_spells_v3',
            spellLimits: 'kael_spell_limits', spellSlots: 'kael_spell_slots', sessionNotes: 'kael_session_notes_v2'
        };

        const legacyDefaults = () => ({
            charInfo: { name: 'Kael Velosombrío', race: 'Shadar-kai', cls: 'Pícaro (Soulknife)' }, level: '5', inspiration: false, guidance: false,
            hp: { current: '34', max: '34', temp: '0' }, hitDice: { current: '5', type: 'd8' }, speed: '30', size: 'Mediano', initBonus: '0', deathSaves: { successes: 0, failures: 0 },
            stats: { fue: '12', des: '20', con: '16', int: '12', sab: '15', car: '15' }, tempStats: { fue: '0', des: '0', con: '0', int: '0', sab: '0', car: '0' }, savingThrows: ['des', 'int'],
            proficiencies: { expertise: ['sigilo', 'percepcion'], proficient: ['acrobacias', 'juego_de_manos', 'engano', 'persuasion'] },
            resources: [
                { id: 'res_psi', name: 'Dados Psiónicos', current: 6, max: 6, type: 'd8' },
                { id: 'res_luck', name: 'Suerte (Lucky)', current: 3, max: 3, type: '' },
                { id: 'res_ki', name: 'Puntos de Ki', current: 0, max: 0, type: '' },
                { id: 'res_sup', name: 'Dados de Superioridad', current: 0, max: 0, type: 'd8' }
            ],
            currency: { pc: '0', plata: '0', electro: '0', po: '191', platino: '0' },
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
        const normalizeSpell = (spell) => {
            const grantType = ['standard','species','class','subclass','feat','item'].includes(spell.grantType) ? spell.grantType : 'standard';
            const castingResource = ['slots','independent','at-will'].includes(spell.castingResource) ? spell.castingResource : 'slots';
            const ownUsesMax = Math.max(0, Math.trunc(Number(spell.ownUsesMax) || 0));
            return { id: spell.id || `sp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, sourceId: typeof spell.sourceId === 'string' ? spell.sourceId : '', name: spell.name || '', level: Math.max(0, Math.min(9, Number(spell.level) || 0)), school: spell.school || '', castingTime: spell.castingTime || '', duration: spell.duration || '', range: spell.range || '', areaShape: spell.areaShape || (spell.shape && spell.shape !== '-' ? spell.shape : 'ninguna'), areaSize: spell.areaSize || spell.size || '', length: spell.length || '', width: spell.width || '', customArea: spell.customArea || '', compV: !!spell.compV, compS: !!spell.compS, compM: !!spell.compM, compMDesc: spell.compMDesc || '', concentration: !!spell.concentration, ritual: !!spell.ritual, attackBonus: spell.attackBonus || '', savingThrow: !!spell.savingThrow, savingAbility: spell.savingAbility || '', damageHealing: spell.damageHealing || '', description: spell.description || '', notes: spell.notes || '', known: spell.known !== false, prepared: Number(spell.level) === 0 ? false : !!spell.prepared, favorite: !!spell.favorite, grantType, grantSource: typeof spell.grantSource === 'string' ? spell.grantSource : '', countsPreparation: spell.countsPreparation ?? (grantType === 'standard' && Number(spell.level) > 0 && !!spell.prepared), countsKnownLimit: spell.countsKnownLimit ?? (grantType === 'standard' && !spell.prepared), castingResource, ownUsesMax, ownUsesCurrent: Math.min(ownUsesMax, Math.max(0, Math.trunc(Number(spell.ownUsesCurrent ?? ownUsesMax) || 0))) };
        };
        const normalizeResource = (resource) => {
            const suggestedRest = resource.recoveryRest || (resource.recovery === 'both' ? 'short' : resource.recovery === 'short' || resource.recovery === 'long' || resource.recovery === 'manual' ? resource.recovery : 'manual');
            return { ...resource, recoveryRest: suggestedRest === 'both' ? 'short' : suggestedRest, recoveryMode: ['full','fixed','half','manual'].includes(resource.recoveryMode) ? resource.recoveryMode : 'full', recoveryAmount: Number(resource.recoveryAmount) || 0 };
        };
        const normalizeRuleLookupText = (value) => String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLocaleLowerCase('es')
            .replace(/\s+/g, ' ')
            .trim();
        const repairSrdLineBreakHyphens = (value) => String(value || '')
            .replace(/\bamarillo-\s+verdosa\b/giu, 'amarillo-verdosa')
            .replace(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])-\s+([a-záéíóúüñ])/g, '$1$2');
        const SPELL_DICE_COLORS = Object.freeze({
            acido: [132, 204, 22], frio: [56, 189, 248], fuego: [249, 115, 22], fuerza: [139, 92, 246],
            necrotico: [168, 85, 247], psiquico: [236, 72, 153], radiante: [250, 204, 21],
            relampago: [34, 211, 238], trueno: [99, 102, 241], veneno: [34, 197, 94], curacion: [16, 185, 129],
            abjuracion: [34, 211, 238], adivinacion: [96, 165, 250], conjuracion: [167, 139, 250],
            encantamiento: [244, 114, 182], evocacion: [249, 115, 22], ilusion: [129, 140, 248],
            nigromancia: [192, 132, 252], transmutacion: [250, 204, 21], arcana: [139, 92, 246]
        });
        const getSpellDicePalette = (spell, kind = '') => {
            const descriptionKey = normalizeRuleLookupText(`${spell?.damageHealing || ''} ${spell?.description || ''}`);
            const damageTypes = ['acido','frio','fuego','fuerza','necrotico','psiquico','radiante','relampago','trueno','veneno'];
            const damageType = damageTypes.find(key => new RegExp(`dano (?:de )?${key}`).test(descriptionKey));
            const schoolKey = normalizeRuleLookupText(spell?.school || '').split(' ')[0];
            const key = kind === 'healing' ? 'curacion' : damageType || schoolKey || 'arcana';
            return { key, rgb: [...(SPELL_DICE_COLORS[key] || SPELL_DICE_COLORS.arcana)] };
        };
        const getSpellDicePlan = (spell, options = {}) => {
            const description = repairSrdLineBreakHyphens(spell?.description || '');
            const normalized = normalizeRuleLookupText(description);
            const sentences = description.match(/[^.!?]+[.!?]?/g)?.map(sentence => sentence.replace(/\s+/g, ' ').trim()) || [];
            const dicePattern = /\b\d+d(?:4|6|8|10|12|20|100)(?:\s*[+\-]\s*\d+)?\b/gi;
            const hasDice = sentence => { dicePattern.lastIndex = 0; return dicePattern.test(sentence); };
            const damageSentence = sentences.find(sentence => /\bdaño\b/i.test(sentence) && hasDice(sentence));
            const healingSentence = sentences.find(sentence => /puntos de golpe/i.test(sentence) && /recuper|restaur|cur|sana/i.test(sentence) && hasDice(sentence));
            const fallbackText = String(spell?.damageHealing || '');
            const sourceSentence = damageSentence || healingSentence || fallbackText;
            dicePattern.lastIndex = 0;
            const formulas = [...sourceSentence.matchAll(dicePattern)].map(match => match[0].replace(/\s+/g, ''));
            // Las descripciones importadas pueden arrastrar tablas del apéndice; ante una frase anómala es más seguro no automatizarla.
            let formula = formulas.length <= 4 ? formulas.join('+') : '';
            const kind = damageSentence ? 'damage' : healingSentence ? 'healing' : /cur|recuper|restaur/i.test(fallbackText) ? 'healing' : formula ? 'damage' : '';
            const characterLevel = Math.max(1, Math.min(20, Math.trunc(Number(options.characterLevel) || 1)));
            const baseLevel = Math.max(0, Math.min(9, Math.trunc(Number(spell?.level) || 0)));
            const slotLevel = Math.max(baseLevel, Math.min(9, Math.trunc(Number(options.slotLevel) || baseLevel)));
            const usesSpellAttack = !!spell?.attackBonus || /ataque de conjuro/i.test(description);
            const saveMatch = description.match(/tirada de salvación de (Fuerza|Destreza|Constitución|Inteligencia|Sabiduría|Carisma)/i);
            const modifiers = [];
            if (/tu modificador por aptitud mágica|modificador de (?:tu )?característica de lanzamiento/i.test(sourceSentence)
                && options.spellcastingModifier !== null && options.spellcastingModifier !== '' && Number.isFinite(Number(options.spellcastingModifier))) {
                modifiers.push({ label: 'Aptitud mágica', value: Math.trunc(Number(options.spellcastingModifier)) });
            }

            const cantripScales = [...description.matchAll(/nivel\s+(5|11|17)\s*\((\d+d(?:4|6|8|10|12))\)/gi)]
                .map(match => ({ level: Number(match[1]), formula: match[2].toLowerCase() }));
            if (baseLevel === 0 && cantripScales.length) {
                const scale = cantripScales.filter(item => characterLevel >= item.level).at(-1);
                if (scale) formula = scale.formula;
            }

            const addDice = (baseFormula, addition, repeats) => {
                if (!addition || repeats <= 0) return baseFormula;
                const match = addition.match(/(\d+)d(\d+)/i);
                if (!match) return baseFormula;
                const addedCount = Number(match[1]) * repeats;
                const sides = Number(match[2]);
                let merged = false;
                const terms = baseFormula.split('+').filter(Boolean).map(term => {
                    const die = term.match(/^(\d+)d(\d+)$/i);
                    if (!merged && die && Number(die[2]) === sides) { merged = true; return `${Number(die[1]) + addedCount}d${sides}`; }
                    return term;
                });
                if (!merged) terms.push(`${addedCount}d${sides}`);
                return terms.join('+');
            };
            const higherText = normalized.split('a niveles superiores')[1] || '';
            const upcastMatch = higherText.match(/aumenta en (\d+d(?:4|6|8|10|12)) por cada (dos )?nivel(?:es)? por encima de (\d+)/);
            if (formula && upcastMatch && slotLevel > Number(upcastMatch[3])) {
                const interval = upcastMatch[2] ? 2 : 1;
                const repeats = Math.floor((slotLevel - Number(upcastMatch[3])) / interval) * (/tanto el inicial como el posterior/.test(higherText) ? 2 : 1);
                formula = addDice(formula, upcastMatch[1], repeats);
            }

            const numberWords = { un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10 };
            let attackCount = usesSpellAttack ? 1 : 0;
            const raysMatch = normalized.match(/creas?\s+(un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|\d+)\s+rayos/);
            const separateRays = /ataque de conjuro[^.]*por cada rayo|tirada de ataque por separado para cada rayo/.test(normalized);
            if (separateRays && raysMatch) attackCount = Number(raysMatch[1]) || numberWords[raysMatch[1]] || 1;
            if (/mas de un rayo cuando alcanzas niveles superiores/.test(normalized)) attackCount = characterLevel >= 17 ? 4 : characterLevel >= 11 ? 3 : characterLevel >= 5 ? 2 : 1;
            const extraRayMatch = higherText.match(/un rayo adicional por cada nivel por encima de (\d+)/);
            if (extraRayMatch && slotLevel > Number(extraRayMatch[1])) attackCount += slotLevel - Number(extraRayMatch[1]);

            const palette = getSpellDicePalette(spell, kind);
            return {
                canRoll: !!formula,
                kind,
                formula,
                perAttackFormula: formula,
                modifiers,
                usesSpellAttack,
                savingAbility: String(spell?.savingAbility || '').trim() || saveMatch?.[1] || '',
                attackCount: Math.max(attackCount, usesSpellAttack ? 1 : 0),
                slotLevel,
                characterLevel,
                palette,
                damageType: palette.key,
                partialOnSave: /mitad del daño si la super/i.test(description)
            };
        };
        const getSuggestedClassResources = ({ className, subclassName, level, charismaModifier = 0 }) => {
            const normalizedLevel = Math.max(1, Math.min(20, Math.trunc(Number(level) || 1)));
            const classKey = normalizeRuleLookupText(className);
            const subclassKey = normalizeRuleLookupText(subclassName);
            const normalizedCharismaModifier = Math.max(1, Math.trunc(Number(charismaModifier) || 0));
            const suggestions = [];

            const addSuggestion = (suggestion) => suggestions.push({
                recoveryMode: 'full',
                type: '',
                ...suggestion
            });

            if (classKey === 'barbaro' || classKey === 'barbarian') {
                const rageUses = normalizedLevel >= 17 ? 6 : normalizedLevel >= 12 ? 5 : normalizedLevel >= 6 ? 4 : normalizedLevel >= 3 ? 3 : 2;
                if (normalizedLevel < 20) {
                    addSuggestion({ key: 'rage', name: 'Ira', max: rageUses, recoveryRest: 'long', aliases: ['ira', 'iras'] });
                }
            }

            if (classKey === 'bardo' || classKey === 'bard') {
                addSuggestion({
                    key: 'bardic-inspiration',
                    name: 'Inspiración bárdica',
                    max: normalizedCharismaModifier,
                    recoveryRest: normalizedLevel >= 5 ? 'short' : 'long',
                    aliases: ['inspiracion bardica', 'inspiración bárdica', 'bardic inspiration']
                });
            }

            if (classKey === 'clerigo' || classKey === 'cleric') {
                if (normalizedLevel >= 2) {
                    addSuggestion({
                        key: 'channel-divinity-cleric',
                        name: 'Canalizar divinidad',
                        max: normalizedLevel >= 18 ? 3 : normalizedLevel >= 6 ? 2 : 1,
                        recoveryRest: 'short',
                        aliases: ['canalizar divinidad', 'channel divinity']
                    });
                }
            }

            if (classKey === 'druida' || classKey === 'druid') {
                if (normalizedLevel >= 2 && normalizedLevel < 20) {
                    addSuggestion({ key: 'wild-shape', name: 'Forma salvaje', max: 2, recoveryRest: 'short', aliases: ['forma salvaje', 'wild shape'] });
                }
            }

            if (classKey === 'guerrero' || classKey === 'fighter') {
                addSuggestion({ key: 'second-wind', name: 'Segundo aliento', max: 1, recoveryRest: 'short', aliases: ['segundo aliento', 'second wind'] });
                if (normalizedLevel >= 2) {
                    addSuggestion({ key: 'action-surge', name: 'Oleada de acción', max: normalizedLevel >= 17 ? 2 : 1, recoveryRest: 'short', aliases: ['oleada de accion', 'action surge'] });
                }
            }

            if (classKey === 'paladin' || classKey === 'paladin') {
                if (normalizedLevel >= 3) {
                    addSuggestion({ key: 'channel-divinity-paladin', name: 'Canalizar divinidad', max: 1, recoveryRest: 'short', aliases: ['canalizar divinidad', 'channel divinity'] });
                }
            }

            if (classKey === 'monje' || classKey === 'monk') {
                if (normalizedLevel >= 2) {
                    addSuggestion({
                        key: 'ki',
                        name: 'Puntos de Ki',
                        max: normalizedLevel,
                        type: '',
                        recoveryRest: 'short',
                        recoveryMode: 'full',
                        aliases: ['puntos de ki', 'ki']
                    });
                }
            }

            if (classKey === 'hechicero' || classKey === 'sorcerer') {
                if (normalizedLevel >= 2) {
                    addSuggestion({
                        key: 'sorcery-points',
                        name: 'Puntos de hechicería',
                        max: normalizedLevel,
                        type: '',
                        recoveryRest: 'long',
                        recoveryMode: 'full',
                        aliases: ['puntos de hechiceria', 'puntos de magia', 'sorcery points']
                    });
                }
            }

            if (subclassKey === 'cuchillas de alma' || subclassKey === 'soulknife') {
                if (normalizedLevel >= 3) {
                    const progression = normalizedLevel >= 17
                        ? { max: 12, type: 'd12' }
                        : normalizedLevel >= 11
                            ? { max: 8, type: 'd10' }
                            : normalizedLevel >= 5
                                ? { max: 6, type: 'd8' }
                                : { max: 4, type: 'd6' };
                    addSuggestion({
                        key: 'psionic-energy-dice',
                        name: 'Dados psiónicos',
                        max: progression.max,
                        type: progression.type,
                        recoveryRest: 'long',
                        recoveryMode: 'full',
                        aliases: ['dados psionicos', 'dados psiquicos', 'dados de energia psionica']
                    });
                }
            }

            return suggestions;
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
        const normalizeInventoryItem = item => ({
            ...(isRecord(item) ? item : {}),
            id: typeof item?.id === 'string' && item.id ? item.id : `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            name: typeof item?.name === 'string' ? item.name : '',
            qty: Math.max(0, Number(item?.qty ?? item?.quantity) || 0),
            desc: typeof item?.desc === 'string' ? item.desc : ''
        });
        const normalizeWeapon = weapon => ({
            ...(isRecord(weapon) ? weapon : {}),
            id: typeof weapon?.id === 'string' && weapon.id ? weapon.id : `wp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            name: typeof weapon?.name === 'string' ? weapon.name : '',
            attacks: Array.isArray(weapon?.attacks) ? weapon.attacks.filter(isRecord).map(attack => ({ ...attack })) : [],
            usesAmmo: weapon?.usesAmmo === true,
            ammoItemId: typeof weapon?.ammoItemId === 'string' ? weapon.ammoItemId : '',
            ammoPerShot: Math.max(1, Math.trunc(Number(weapon?.ammoPerShot) || 1))
        });
        const normalizeCompanion = companion => {
            const source = isRecord(companion) ? companion : {};
            const maximum = Math.max(0, Number(source.maxHp) || 0);
            const current = Math.min(maximum, Math.max(0, Number(source.currentHp ?? maximum) || 0));
            const details = isRecord(source.details) ? cloneData(source.details) : {};
            return {
                id: typeof source.id === 'string' && source.id ? source.id : `companion_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                name: typeof source.name === 'string' ? source.name.trim().slice(0, 120) : '',
                category: ['familiar', 'animal', 'construct', 'mount', 'summon', 'other'].includes(source.category) ? source.category : 'familiar',
                sourceKind: ['srd', 'bestiary', 'manual'].includes(source.sourceKind) ? source.sourceKind : 'manual',
                sourceId: typeof source.sourceId === 'string' ? source.sourceId : '',
                sourceLabel: typeof source.sourceLabel === 'string' ? source.sourceLabel.slice(0, 120) : '',
                avatarDataUrl: isValidPortraitDataUrl(source.avatarDataUrl) && source.avatarDataUrl.length <= MAX_SHARED_AVATAR_DATA_URL_LENGTH ? source.avatarDataUrl : '',
                avatarPath: typeof source.avatarPath === 'string' && !source.avatarPath.includes('://') ? source.avatarPath.slice(0, 300) : '',
                maxHp: maximum,
                currentHp: current,
                tempHp: Math.max(0, Number(source.tempHp) || 0),
                armorClass: source.armorClass === '' || source.armorClass === null || source.armorClass === undefined || !Number.isFinite(Number(source.armorClass)) ? null : Math.max(0, Number(source.armorClass)),
                initiativeMode: ['after-owner', 'own', 'shared'].includes(source.initiativeMode) ? source.initiativeMode : source.category === 'familiar' ? 'own' : 'after-owner',
                initiative: source.initiative === '' || source.initiative === null || source.initiative === undefined || !Number.isFinite(Number(source.initiative)) ? null : Number(source.initiative),
                participates: source.participates === true,
                conditions: Array.isArray(source.conditions) ? source.conditions.filter(item => typeof item === 'string' || isRecord(item)).map(item => cloneData(item)).slice(0, 30) : [],
                notes: typeof source.notes === 'string' ? source.notes.slice(0, 3000) : '',
                details
            };
        };
        const PROFICIENCY_ENTRY_CATEGORIES = ['languages', 'weapons', 'armor', 'tools', 'instruments', 'games', 'vehicles', 'custom'];
        const normalizeProficiencyEntry = entry => ({
            id: typeof entry?.id === 'string' && entry.id ? entry.id : `prof_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            category: PROFICIENCY_ENTRY_CATEGORIES.includes(entry?.category) ? entry.category : 'custom',
            name: typeof entry?.name === 'string' ? entry.name.trim() : '',
            source: typeof entry?.source === 'string' ? entry.source.replace(/\s*\(SRD\)/gi, '').trim() : '',
            autoKey: typeof entry?.autoKey === 'string' ? entry.autoKey : '',
            hidden: entry?.hidden === true,
            nameEdited: entry?.nameEdited === true,
            sourceEdited: entry?.sourceEdited === true
        });
        const getSrdProficiencySuggestions = ({ classId = '', speciesId = '', backgroundId = '' } = {}) => {
            const classEntries = {
                barbarian: [['armor', 'Armaduras ligeras, medias y escudos'], ['weapons', 'Armas sencillas y marciales']],
                bard: [['armor', 'Armaduras ligeras'], ['weapons', 'Armas sencillas, ballestas de mano, espadas largas, estoques y espadas cortas'], ['instruments', 'Tres instrumentos musicales a elegir']],
                cleric: [['armor', 'Armaduras ligeras, medias y escudos'], ['weapons', 'Armas sencillas']],
                druid: [['armor', 'Armaduras ligeras, medias y escudos no metálicos'], ['weapons', 'Armas de druida'], ['tools', 'Kit de herboristería']],
                fighter: [['armor', 'Todas las armaduras y escudos'], ['weapons', 'Armas sencillas y marciales']],
                monk: [['weapons', 'Armas sencillas y espadas cortas'], ['tools', 'Una herramienta de artesano o instrumento musical a elegir']],
                paladin: [['armor', 'Todas las armaduras y escudos'], ['weapons', 'Armas sencillas y marciales']],
                ranger: [['armor', 'Armaduras ligeras, medias y escudos'], ['weapons', 'Armas sencillas y marciales']],
                rogue: [['armor', 'Armaduras ligeras'], ['weapons', 'Armas sencillas, ballestas de mano, espadas largas, estoques y espadas cortas'], ['tools', 'Herramientas de ladrón']],
                sorcerer: [['weapons', 'Dagas, dardos, hondas, bastones y ballestas ligeras']],
                warlock: [['armor', 'Armaduras ligeras'], ['weapons', 'Armas sencillas']],
                wizard: [['weapons', 'Dagas, dardos, hondas, bastones y ballestas ligeras']]
            };
            const speciesLanguages = {
                dragonborn: ['Común', 'Dracónico'], dwarf: ['Común', 'Enano'], elf: ['Común', 'Élfico'], gnome: ['Común', 'Gnómico'],
                'half-elf': ['Común', 'Élfico', 'Un idioma adicional a elegir'], 'half-orc': ['Común', 'Orco'], halfling: ['Común', 'Mediano'],
                human: ['Común', 'Un idioma adicional a elegir'], 'shadar-kai': ['Común', 'Élfico'], tiefling: ['Común', 'Infernal']
            };
            const backgroundEntries = {
                acolyte: [['languages', 'Dos idiomas a elegir']], charlatan: [['tools', 'Kit de disfraz'], ['tools', 'Kit de falsificación']],
                criminal: [['games', 'Un tipo de juego a elegir'], ['tools', 'Herramientas de ladrón']], entertainer: [['tools', 'Kit de disfraz'], ['instruments', 'Un instrumento musical a elegir']],
                'folk-hero': [['tools', 'Un tipo de herramienta de artesano a elegir'], ['vehicles', 'Vehículos terrestres']],
                'guild-artisan': [['tools', 'Un tipo de herramienta de artesano a elegir'], ['languages', 'Un idioma a elegir']],
                hermit: [['tools', 'Kit de herboristería'], ['languages', 'Un idioma a elegir']], noble: [['games', 'Un tipo de juego a elegir'], ['languages', 'Un idioma a elegir']],
                outlander: [['instruments', 'Un instrumento musical a elegir'], ['languages', 'Un idioma a elegir']], sage: [['languages', 'Dos idiomas a elegir']],
                sailor: [['tools', 'Herramientas de navegante'], ['vehicles', 'Vehículos acuáticos']], soldier: [['games', 'Un tipo de juego a elegir'], ['vehicles', 'Vehículos terrestres']],
                urchin: [['tools', 'Kit de disfraz'], ['tools', 'Herramientas de ladrón']]
            };
            const suggestions = [];
            const add = (origin, source, entries) => (entries || []).forEach(([category, name], index) => suggestions.push({ id: `prof_auto_${origin}_${index}`, autoKey: `${origin}:${index}`, category, name, source, hidden: false }));
            add(`class_${classId}`, 'Clase', classEntries[classId]);
            add(`species_${speciesId}`, 'Especie', (speciesLanguages[speciesId] || []).map(name => ['languages', name]));
            add(`background_${backgroundId}`, 'Trasfondo', backgroundEntries[backgroundId]);
            const merged = new Map();
            suggestions.forEach(entry => {
                const identity = `${entry.category}:${normalizeRuleLookupText(entry.name)}`;
                const existing = merged.get(identity);
                if (existing) {
                    existing.source = [...new Set([...existing.source.split(' · '), entry.source])].join(' · ');
                    return;
                }
                merged.set(identity, {
                    ...entry,
                    id: `prof_auto_${normalizeRuleLookupText(identity).replace(/[^a-z0-9]+/g, '_')}`,
                    autoKey: identity
                });
            });
            return [...merged.values()];
        };
        const normalizeCurrency = (currency) => {
            const defaults = createBlankCharacterData().currency;
            const source = isRecord(currency) ? currency : {};
            const asText = (value, fallback) => typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
            return {
                ...defaults,
                ...source,
                plata: asText(source.plata ?? source.pp, defaults.plata),
                electro: asText(source.electro, defaults.electro),
                platino: asText(source.platino, defaults.platino),
                po: asText(source.po, defaults.po),
                pc: asText(source.pc, defaults.pc)
            };
        };
        const normalizeNarrativeProfile = narrative => {
            const defaults = createBlankNarrativeProfile();
            const source = isRecord(narrative) ? narrative : {};
            return Object.fromEntries(Object.keys(defaults).map(field => [field, typeof source[field] === 'string' || typeof source[field] === 'number' ? String(source[field]) : '']));
        };
        const normalizeCharacterPresentation = presentation => {
            const source = isRecord(presentation) ? presentation : {};
            return {
                accent: CHARACTER_ACCENTS.includes(source.accent) ? source.accent : 'violet',
                tagline: typeof source.tagline === 'string' ? source.tagline.slice(0, 120) : '',
                visibility: source.visibility === 'full' ? 'full' : 'profile',
                featuredTraitId: typeof source.featuredTraitId === 'string' ? source.featuredTraitId : '',
                featuredItemId: typeof source.featuredItemId === 'string' ? source.featuredItemId : '',
                featuredSpellId: typeof source.featuredSpellId === 'string' ? source.featuredSpellId : ''
            };
        };
        const normalizeActiveConcentration = concentration => isRecord(concentration) && typeof concentration.spellName === 'string' && concentration.spellName.trim() ? { spellId: typeof concentration.spellId === 'string' ? concentration.spellId : '', spellName: concentration.spellName.trim(), startedAt: Number.isFinite(Date.parse(concentration.startedAt)) ? new Date(concentration.startedAt).toISOString() : new Date().toISOString() } : null;
        const normalizeGrimoireData = (data) => ({ ...data, characterBuild: { ...createDefaultCharacterBuild(), ...(isRecord(data.characterBuild) ? data.characterBuild : {}) }, narrative: normalizeNarrativeProfile(data.narrative), presentation: normalizeCharacterPresentation(data.presentation), tempStats: normalizeTempStats(data.tempStats), currency: normalizeCurrency(data.currency), proficiencyEntries: Array.isArray(data.proficiencyEntries) ? data.proficiencyEntries.map(normalizeProficiencyEntry).filter(entry => entry.name) : [], inventory: Array.isArray(data.inventory) ? data.inventory.map(normalizeInventoryItem) : [], weapons: Array.isArray(data.weapons) ? data.weapons.map(normalizeWeapon) : [], companions: Array.isArray(data.companions) ? data.companions.map(normalizeCompanion).filter(companion => companion.name) : [], resources: Array.isArray(data.resources) ? data.resources.map(normalizeResource) : [], spells: Array.isArray(data.spells) ? data.spells.map(normalizeSpell) : [], spellGrantUses: isRecord(data.spellGrantUses) ? Object.fromEntries(Object.entries(data.spellGrantUses).map(([key, value]) => [key, Math.max(0, Math.trunc(Number(value) || 0))])) : {}, activeConcentration: normalizeActiveConcentration(data.activeConcentration), conditions: Array.isArray(data.conditions) ? data.conditions : [], timers: Array.isArray(data.timers) ? data.timers.map(normalizeTimer) : [], activityLog: normalizeActivityLog(data.activityLog), grimoireConfig: { ...createDefaultGrimoireConfig(), ...(isRecord(data.grimoireConfig) ? data.grimoireConfig : {}), pactSlots: { ...createDefaultGrimoireConfig().pactSlots, ...(isRecord(data.grimoireConfig?.pactSlots) ? data.grimoireConfig.pactSlots : {}) } } });
        const reviewCharacterSheet = (characterData, options = {}) => {
            const data = isRecord(characterData) ? characterData : {};
            const issues = [];
            const checks = [];
            const addCheck = (id, valid, issue = null) => {
                checks.push({ id, valid: Boolean(valid) });
                if (!valid && issue) issues.push({ id, severity: 'important', ...issue });
            };
            const text = value => String(value ?? '').trim();
            const numeric = value => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value));
            const level = Number(data.level);
            const hpCurrent = Number(data.hp?.current);
            const hpMax = Number(data.hp?.max);
            const hitDiceCurrent = Number(data.hitDice?.current);
            const abilityLabels = { fue: 'FUE', des: 'DES', con: 'CON', int: 'INT', sab: 'SAB', car: 'CAR' };

            addCheck('name', text(data.charInfo?.name).length > 0, { section: 'character', title: 'Falta el nombre', detail: 'Añade un nombre para identificar la ficha y compartirla en la Mesa Online.' });
            addCheck('race', text(data.charInfo?.race).length > 0, { section: 'character', title: 'Falta la especie', detail: 'Indica la especie o linaje del personaje.' });
            addCheck('class', text(data.charInfo?.cls).length > 0, { section: 'character', title: 'Falta la clase', detail: 'Indica la clase para calcular y organizar correctamente la ficha.' });
            addCheck('level', Number.isInteger(level) && level >= 1 && level <= 20, { section: 'character', title: 'Nivel no válido', detail: 'El nivel debe ser un número entre 1 y 20.' });

            const missingAbilities = Object.keys(abilityLabels).filter(key => !numeric(data.stats?.[key]));
            addCheck('abilities', missingAbilities.length === 0, { section: 'character', title: 'Faltan características', detail: `Completa ${missingAbilities.map(key => abilityLabels[key]).join(', ')} para calcular tiradas, salvaciones y pasivas.` });
            const unusualAbilities = Object.keys(abilityLabels).filter(key => numeric(data.stats?.[key]) && (Number(data.stats[key]) < 1 || Number(data.stats[key]) > 30));
            if (unusualAbilities.length) issues.push({ id: 'ability-range', severity: 'notice', section: 'character', title: 'Características fuera del rango habitual', detail: `Revisa ${unusualAbilities.map(key => abilityLabels[key]).join(', ')}; sus valores están fuera de 1–30.` });

            addCheck('max-hp', numeric(data.hp?.max) && hpMax > 0, { section: 'combat', title: 'Faltan los PV máximos', detail: 'Define los puntos de golpe máximos para controlar daño, curación y descansos.' });
            if (numeric(data.hp?.current) && numeric(data.hp?.max) && (hpCurrent < 0 || hpCurrent > hpMax)) issues.push({ id: 'current-hp', severity: 'important', section: 'combat', title: 'PV actuales incoherentes', detail: 'Los PV actuales deben estar entre 0 y los PV máximos.' });
            addCheck('speed', numeric(data.speed) && Number(data.speed) > 0, { section: 'character', title: 'Falta la velocidad', detail: 'Indica la velocidad de movimiento del personaje.' });
            addCheck('hit-die', /^d(?:4|6|8|10|12|20)$/i.test(text(data.hitDice?.type)), { section: 'combat', title: 'Falta el dado de golpe', detail: 'Indica un dado válido, por ejemplo d8 o d10.' });
            if (numeric(data.hitDice?.current) && Number.isInteger(level) && (hitDiceCurrent < 0 || hitDiceCurrent > level)) issues.push({ id: 'hit-dice-current', severity: 'important', section: 'combat', title: 'Dados de golpe incoherentes', detail: `Los dados disponibles no pueden superar el nivel ${level}.` });

            (Array.isArray(data.resources) ? data.resources : []).forEach(resource => {
                const current = Number(resource?.current);
                const maximum = Number(resource?.max);
                if (Number.isFinite(current) && Number.isFinite(maximum) && (current < 0 || maximum < 0 || current > maximum)) issues.push({ id: `resource-${resource?.id || resource?.name}`, severity: 'important', section: 'combat', resourceId: resource?.id || '', title: `Revisa ${text(resource?.name) || 'un recurso'}`, detail: 'El valor disponible debe estar entre 0 y su máximo.' });
            });
            Object.entries(isRecord(data.spellSlots) ? data.spellSlots : {}).forEach(([slotLevel, slot]) => {
                const current = Number(slot?.current);
                const maximum = Number(slot?.max);
                if (Number.isFinite(current) && Number.isFinite(maximum) && (current < 0 || maximum < 0 || current > maximum)) issues.push({ id: `slot-${slotLevel}`, severity: 'important', section: 'grimoire', title: `Ranuras de nivel ${slotLevel} incoherentes`, detail: 'Las ranuras disponibles deben estar entre 0 y su máximo.' });
            });

            if (options.spellcastingExpected === true) {
                addCheck('spellcasting-ability', ['fue','des','con','int','sab','car'].includes(data.grimoireConfig?.spellcastingAbility), { section: 'grimoire', title: 'Falta la aptitud mágica', detail: 'Elige la característica de lanzamiento para calcular ataque de conjuro y CD.' });
                if (!(Array.isArray(data.spells) && data.spells.length)) issues.push({ id: 'spells-empty', severity: 'notice', section: 'grimoire', title: 'Grimorio vacío', detail: 'Esta progresión ya puede lanzar conjuros, pero todavía no hay ninguno registrado.' });
            }

            (Array.isArray(data.companions) ? data.companions : []).forEach(companion => {
                if (!companion?.participates) return;
                if (!(Number(companion.maxHp) > 0)) issues.push({ id: `companion-hp-${companion.id}`, severity: 'important', section: 'companions', companionId: companion.id, field: 'maxHp', title: `${text(companion.name) || 'Compañero'} no tiene PV`, detail: 'Define sus PV máximos antes de incluirlo en un combate.' });
                if (companion.initiativeMode === 'own' && !numeric(companion.initiative)) issues.push({ id: `companion-initiative-${companion.id}`, severity: 'notice', section: 'companions', companionId: companion.id, field: 'initiative', title: `Falta la iniciativa de ${text(companion.name) || 'un compañero'}`, detail: 'Puedes escribirla ahora o completarla al preparar el encuentro online.' });
            });

            const importantCount = issues.filter(issue => issue.severity === 'important').length;
            const noticeCount = issues.length - importantCount;
            const passedChecks = checks.filter(check => check.valid).length;
            return {
                status: importantCount ? 'attention' : noticeCount ? 'review' : 'ready',
                issues,
                importantCount,
                noticeCount,
                passedChecks,
                totalChecks: checks.length
            };
        };
        const calculateRestPreview = (restType, characterData, spentHitDice = 0, manualHealing = 0) => {
            const data = normalizeGrimoireData(cloneData(characterData));
            const changes = [], unchanged = [], manualActions = [], warnings = [];
            const isShortRest = restType === 'short';
            const isLongRest = restType === 'long';
            if (!isShortRest && !isLongRest) return { data, changes, unchanged, manualActions, warnings: [{ id: 'invalid-rest', tone: 'danger', text: 'Elige un tipo de descanso válido.' }] };
            const recoverResource = resource => {
                const eligible = restType === 'long' ? ['short','long'].includes(resource.recoveryRest) : resource.recoveryRest === 'short';
                if (!eligible) { unchanged.push(resource.name); return resource; }
                if (resource.recoveryMode === 'manual') {
                    unchanged.push(resource.name);
                    manualActions.push({ id: `resource-${resource.id}`, label: resource.name || 'Recurso sin nombre', detail: 'Su recuperación está configurada como manual y no se modificará.' });
                    return resource;
                }
                const max = Number(resource.max) || 0, current = Number(resource.current) || 0;
                const gain = resource.recoveryMode === 'fixed' ? Number(resource.recoveryAmount) || 0 : resource.recoveryMode === 'half' ? (max > 0 ? Math.max(1, Math.floor(max / 2)) : 0) : max;
                const next = Math.min(max, resource.recoveryMode === 'full' ? max : current + gain);
                if (next !== current) changes.push(`${resource.name}: ${current}/${max} -> ${next}/${max}`); else unchanged.push(resource.name);
                return { ...resource, current: next };
            };
            data.resources = data.resources.map(recoverResource);
            const hpMax = Number(data.hp?.max), hpCurrent = Number(data.hp?.current) || 0, availableDice = Math.max(0, Number(data.hitDice?.current) || 0);
            if (!(Number.isFinite(hpMax) && hpMax > 0)) warnings.push({ id: 'missing-max-hp', tone: 'danger', text: 'Configura los PV máximos antes de aplicar el descanso.' });
            if (isShortRest) {
                const spent = Math.min(availableDice, Math.max(0, Number(spentHitDice) || 0));
                const healing = spent > 0 && Number.isFinite(hpMax) ? Math.max(0, Number(manualHealing) || 0) : 0;
                if (spent) { data.hitDice = { ...data.hitDice, current: String(availableDice - spent) }; changes.push(`Dados de golpe: ${availableDice} -> ${availableDice - spent}`); }
                if (healing && Number.isFinite(hpMax)) { const nextHp = Math.min(hpMax, hpCurrent + healing); data.hp = { ...data.hp, current: String(nextHp) }; changes.push(`Vida: ${hpCurrent}/${hpMax} -> ${nextHp}/${hpMax}`); }
                if (data.grimoireConfig.usePactMagic) { const pact = data.grimoireConfig.pactSlots, next = Number(pact.max) || 0; if (Number(pact.current) !== next) { data.grimoireConfig.pactSlots = { ...pact, current: next }; changes.push(`Magia de pacto: ${pact.current}/${pact.max} -> ${next}/${pact.max}`); } }
                if (hpCurrent < hpMax && availableDice <= 0) warnings.push({ id: 'no-hit-dice', tone: 'warning', text: 'Te faltan PV, pero no tienes dados de golpe disponibles.' });
                else if (hpCurrent < hpMax && spent === 0) manualActions.unshift({ id: 'spend-hit-dice', label: 'Decidir dados de golpe', detail: `Te faltan ${Math.max(0, hpMax - hpCurrent)} PV y tienes ${availableDice} ${data.hitDice?.type || 'dados'} disponibles.` });
                else if (spent > 0 && healing <= 0) warnings.push({ id: 'missing-healing', tone: 'warning', text: 'Has marcado dados de golpe, pero el total de curación sigue en 0.' });
            } else {
                if (Number.isFinite(hpMax)) { data.hp = { ...data.hp, current: String(hpMax) }; if (hpCurrent !== hpMax) changes.push(`Vida: ${hpCurrent}/${hpMax} -> ${hpMax}/${hpMax}`); }
                const tempHp = Math.max(0, Number(data.hp?.temp) || 0);
                if (tempHp > 0) { data.hp = { ...data.hp, temp: '0' }; changes.push(`PV temporales: ${tempHp} -> 0`); }
                const deathSuccesses = Math.max(0, Number(data.deathSaves?.successes) || 0), deathFailures = Math.max(0, Number(data.deathSaves?.failures) || 0);
                if (deathSuccesses || deathFailures) { data.deathSaves = { successes: 0, failures: 0 }; changes.push('Salvaciones contra muerte: reiniciadas'); }
                const totalDice = Math.max(0, Number(data.level) || 0), recovered = totalDice > 0 ? Math.max(1, Math.floor(totalDice / 2)) : 0, nextDice = Math.min(totalDice, availableDice + recovered); data.hitDice = { ...data.hitDice, current: String(nextDice) }; if (nextDice !== availableDice) changes.push(`Dados de golpe: ${availableDice} -> ${nextDice}`);
                data.spellSlots = Object.fromEntries(Object.entries(data.spellSlots).map(([level, slot]) => { const next = Number(slot.max) || 0; if (Number(slot.current) !== next) changes.push(`Ranura nivel ${level}: ${slot.current}/${slot.max} -> ${next}/${slot.max}`); return [level, { ...slot, current: next }]; }));
                if (data.grimoireConfig.usePactMagic) {
                    const pact = data.grimoireConfig.pactSlots, next = Number(pact.max) || 0;
                    if (Number(pact.current) !== next) changes.push(`Magia de pacto: ${pact.current}/${pact.max} -> ${next}/${pact.max}`);
                    data.grimoireConfig.pactSlots = { ...pact, current: next };
                }
            }
            const activeConditions = Array.isArray(data.conditions) ? data.conditions.length : 0;
            if (activeConditions > 0) manualActions.push({ id: 'conditions', label: `${activeConditions} condición${activeConditions === 1 ? '' : 'es'} activa${activeConditions === 1 ? '' : 's'}`, detail: 'Las condiciones no se eliminan automáticamente; revisa su duración con el Máster.' });
            if (data.activeConcentration) manualActions.push({ id: 'concentration', label: `Concentración: ${data.activeConcentration.spellName}`, detail: 'La app la conserva para no decidir por ti; confirma si debería terminar.' });
            return { data, changes, unchanged, manualActions, warnings };
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
            // Optional structured reference data from the open SRD compendium.
            // Manual templates keep this null and continue to use the fields above.
            srdDetails: isRecord(value?.srdDetails) ? cloneData(value.srdDetails) : null,
            compendiumSource: typeof value?.compendiumSource === 'string' ? value.compendiumSource : '',
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
            data.guidance = typeof rawData.guidance === 'boolean' ? rawData.guidance : defaults.guidance;
            data.charInfo = Object.fromEntries(Object.keys(defaults.charInfo).map(field => [field, asText(data.charInfo[field], defaults.charInfo[field])]));
            data.stats = Object.fromEntries(Object.keys(defaults.stats).map(field => [field, asText(data.stats[field], defaults.stats[field])]));
            ['current', 'max', 'temp'].forEach(field => { data.hp[field] = asText(data.hp[field], defaults.hp[field]); });
            ['current', 'type'].forEach(field => { data.hitDice[field] = asText(data.hitDice[field], defaults.hitDice[field]); });
            data.deathSaves = {
                successes: Number.isFinite(Number(data.deathSaves.successes)) ? Number(data.deathSaves.successes) : defaults.deathSaves.successes,
                failures: Number.isFinite(Number(data.deathSaves.failures)) ? Number(data.deathSaves.failures) : defaults.deathSaves.failures
            };
            if (rawData.currency?.plata === undefined && rawData.currency?.pp !== undefined) data.currency.plata = rawData.currency.pp;
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
            ['savingThrows', 'proficiencyEntries', 'resources', 'inventory', 'armors', 'tools', 'weapons', 'traits', 'feats', 'spells', 'sessionNotes'].forEach(field => {
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
            return { meta: cloneData(meta), data: normalizeGrimoireData(cloneData(data)) };
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
            createDefaultCharacterBuild,
            createBlankNarrativeProfile,
            createDefaultCharacterPresentation,
            createBlankCharacterData,
            legacyStorageKeys,
            legacyDefaults,
            readLegacyCharacterData,
            createCharacterRecord,
            isRecord,
            normalizeSpell,
            normalizeResource,
            normalizeRuleLookupText,
            repairSrdLineBreakHyphens,
            getSpellDicePalette,
            getSpellDicePlan,
            getSuggestedClassResources,
            normalizeTempStats,
            getArmorFormula,
            calculateCharacterArmorClass,
            reorderItemsById,
            REAL_TIMER_UNITS,
            normalizeTimer,
            normalizeActivityLog,
            normalizeInventoryItem,
            normalizeWeapon,
            normalizeCompanion,
            normalizeProficiencyEntry,
            getSrdProficiencySuggestions,
            normalizeActiveConcentration,
            normalizeCharacterPresentation,
            normalizeGrimoireData,
            reviewCharacterSheet,
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
