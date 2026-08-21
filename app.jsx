        const { useState, useEffect, useRef, useMemo } = React;
        const {
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
            createBlankCharacterData,
            legacyStorageKeys,
            legacyDefaults,
            readLegacyCharacterData,
            createCharacterRecord,
            isRecord,
            normalizeSpell,
            normalizeResource,
            normalizeRuleLookupText,
            getSuggestedClassResources,
            normalizeTempStats,
            getArmorFormula,
            calculateCharacterArmorClass,
            reorderItemsById,
            REAL_TIMER_UNITS,
            normalizeTimer,
            normalizeActivityLog,
            getSrdProficiencySuggestions,
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
        } = window.DndAppUtils;
        const {
            ONLINE_CONDITIONS,
            calculateEnemyVisibleState,
            createEnemyId,
            getHpValues,
            normalizeHpValue,
            normalizeOnlineConditions
        } = window.DndOnlineTableUtils;
        const {
            EnemyModal,
            OnlineConditionModal,
            OnlineEffectModal,
            OnlineHpModal,
            OnlineCombatantAvatar: OnlineCombatantAvatarView
        } = window.DndOnlineComponents;
        const { CharacterBuildModal, CharacterCreationWizard = null } = window.DndCharacterBuilderComponents;
        const { BestiaryImportPreviewModal, LocalBestiaryModal, SrdMonsterCompendiumModal } = window.DndBestiaryComponents;
        const { ActivityHistoryModal, TimerModal, CharacterManagerModal, EquipmentCompendiumModal } = window.DndLocalModalComponents;
        const { ArcaneCompendiumView } = window.DndSpellbookComponents;
        const SPELL_ICON_META = window.DndSpellIconRegistry || {
            'bola de fuego': { src: 'assets/spell-icons/bola-de-fuego.png', rgb: '249 115 22' },
            'curar heridas': { src: 'assets/spell-icons/curar-heridas.png', rgb: '74 222 128' },
            'dormir': { src: 'assets/spell-icons/dormir.png', rgb: '129 140 248' },
            'mano de mago': { src: 'assets/spell-icons/mano-de-mago.png', rgb: '34 211 238' },
            'proyectil magico': { src: 'assets/spell-icons/proyectil-magico.png', rgb: '167 139 250' }
        };
        const getSpellIconMeta = spell => SPELL_ICON_META[normalizeRuleLookupText(spell?.name || '')] || null;
        const getSpellIconPath = spell => getSpellIconMeta(spell)?.src || '';
        const SPELL_SCHOOL_COLORS = Object.freeze({
            abjuracion: '34 211 238',
            adivinacion: '96 165 250',
            conjuracion: '167 139 250',
            encantamiento: '244 114 182',
            evocacion: '249 115 22',
            ilusion: '129 140 248',
            ilusionismo: '129 140 248',
            nigromancia: '192 132 252',
            transmutacion: '250 204 21'
        });
        const getSpellIconColor = spell => SPELL_SCHOOL_COLORS[normalizeRuleLookupText(spell?.school || '')]
            || getSpellIconMeta(spell)?.rgb
            || '';
        const srdMonsterCompendium = window.DndSrdMonsterCompendium?.format === 'dnd-srd-monster-compendium'
            ? window.DndSrdMonsterCompendium
            : { monsters: [], attribution: '' };

        const { useCharacterManager, useCharacterField } = window.DndCharacterManager;

        function AbilityGlyph({ ability }) {
            const paths = {
                fue: 'M3 10h18M6 7v6m12-6v6M3 8v4m18-4v4',
                des: 'M20 4c-5 1-9 5-10 10l-1 6 6-1c5-1 9-5 10-10l-5 1Z M8 16l4-4m0 8 4-4',
                con: 'M12 3 5 6v5c0 4.5 2.8 7.8 7 10 4.2-2.2 7-5.5 7-10V6l-7-3Z',
                int: 'M5 4.5A3.5 3.5 0 0 1 8.5 2H19v17H8.5A3.5 3.5 0 0 0 5 22ZM5 4.5V22m4-14h6m-6 4h6',
                sab: 'M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Zm9 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
                car: 'm12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z'
            };
            return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[ability] || paths.int} /></svg>;
        }

        function CombatSectionIcon({ section }) {
            const paths = {
                summary: 'M12 3 5 6v5c0 4.5 2.8 7.8 7 10 4.2-2.2 7-5.5 7-10V6l-7-3Z M9 12l2 2 4-4',
                conditions: 'M9 5h.01M15 5h.01M8 13c1.1 1 2.4 1.5 4 1.5s2.9-.5 4-1.5M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z',
                timers: 'M9 2h6M12 14l3-3m-3 10a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
                resources: 'M9 3h6M10 3v5l-4 8a3 3 0 0 0 2.7 4h6.6a3 3 0 0 0 2.7-4l-4-8V3M8 15h8',
                arsenal: 'm14 5 5 5M4 20l7-7m2-6 2-2 4 4-2 2m-8 2-4 4'
            };
            return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[section] || paths.summary} /></svg>;
        }

        function CharacterSectionGlyph({ section }) {
            const paths = {
                attributes: 'M12 3 5 7v5c0 4.2 2.7 7.5 7 9 4.3-1.5 7-4.8 7-9V7l-7-4Zm-3 8h6m-3-3v6',
                saves: 'M12 3 5 6v5c0 4.5 2.8 7.8 7 10 4.2-2.2 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4',
                skills: 'm12 3 1.7 5.2L19 10l-5.3 1.8L12 17l-1.7-5.2L5 10l5.3-1.8L12 3Zm0 14v2m-5-4 1.5 1.5m8.5-1.5-1.5 1.5',
                traits: 'M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 14 .8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17Z',
                feats: 'M12 3 14.8 8l5.2 1-3.6 3.8.7 5.2-5.1-2.3L6.9 18l.7-5.2L4 9l5.2-1L12 3Z'
            };
            return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[section] || paths.attributes} /></svg>;
        }

        function InventoryGlyph({ section }) {
            const paths = {
                equipment: 'M7 21h10M8 21V9l4-5 4 5v12M9 12h6M9 16h6',
                backpack: 'M7 8h10a3 3 0 0 1 3 3v8H4v-8a3 3 0 0 1 3-3Zm2 0V6a3 3 0 0 1 6 0v2m-7 5h8',
                coins: 'M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3Zm8 3v5c0 1.7-3.6 3-8 3s-8-1.3-8-3V7m16 5v5c0 1.7-3.6 3-8 3s-8-1.3-8-3v-5',
                journal: 'M6 4h11v16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4h6m-6 4h6m-6 4h4',
                treasure: 'M5 8h14v11H5V8Zm2-4h10l2 4H5l2-4Zm5 7v5m-2.5-2.5h5'
            };
            return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[section] || paths.backpack} /></svg>;
        }

        const DND_CURRENCIES = [
            { key: 'pc', label: 'Cobre', short: 'PC', symbol: '●', copperValue: 1 },
            { key: 'plata', label: 'Plata', short: 'PP', symbol: '◆', copperValue: 10 },
            { key: 'electro', label: 'Electrum', short: 'PE', symbol: '◇', copperValue: 50 },
            { key: 'po', label: 'Oro', short: 'PO', symbol: '✦', copperValue: 100 },
            { key: 'platino', label: 'Platino', short: 'PPL', symbol: '✧', copperValue: 1000 }
        ];

        const getCurrencyCopperValue = (currency) => DND_CURRENCIES.reduce((total, coin) => total + Math.max(0, Number(currency?.[coin.key]) || 0) * coin.copperValue, 0);
        const formatCurrencyEquivalent = (currency) => {
            let remaining = getCurrencyCopperValue(currency);
            const parts = [];
            [...DND_CURRENCIES].reverse().forEach(coin => {
                const quantity = Math.floor(remaining / coin.copperValue);
                if (quantity) parts.push(`${quantity} ${coin.short}`);
                remaining %= coin.copperValue;
            });
            return parts.length ? parts.join(' · ') : '0 PC';
        };

        function KaelCharacterSheet() {
            /* ================= ESTADOS ================= */
            const { manager, activeCharacter, updateActiveData, updateCharacterData, createCharacter, duplicateCharacter, importCharacter, selectCharacter, deleteCharacter, setPortrait } = useCharacterManager();
            const [appSettings, setAppSettings] = useState(loadAppSettings);
            const [appSettingsOpen, setAppSettingsOpen] = useState(false);
            const [firebaseReady, setFirebaseReady] = useState(false);
            const [firebaseUser, setFirebaseUser] = useState(null);
            const [firebaseError, setFirebaseError] = useState(null);
            const [onlineStatus, setOnlineStatus] = useState(() => navigator.onLine);
            const [onlineTableOpen, setOnlineTableOpen] = useState(false);
            const [onlineTableScreen, setOnlineTableScreen] = useState('menu');
            const [roomCodeInput, setRoomCodeInput] = useState('');
            const [createdRoomCode, setCreatedRoomCode] = useState('');
            const [currentRoom, setCurrentRoom] = useState(null);
            const [roomData, setRoomData] = useState(null);
            const [roomMembers, setRoomMembers] = useState([]);
            const [roomParticipants, setRoomParticipants] = useState([]);
            const [publicCombatants, setPublicCombatants] = useState([]);
            const [privateEnemies, setPrivateEnemies] = useState([]);
            const [publicEffects, setPublicEffects] = useState([]);
            const [privateEffects, setPrivateEffects] = useState([]);
            const [conditionModal, setConditionModal] = useState({ isOpen: false, target: null, name: '', source: '', notes: '' });
            const [effectModal, setEffectModal] = useState({ isOpen: false, effectId: null, data: {} });
            const [selectedCombatantId, setSelectedCombatantId] = useState(null);
            const [onlineTableMenuOpen, setOnlineTableMenuOpen] = useState(false);
            const [enemyModal, setEnemyModal] = useState({ isOpen: false, mode: 'create', enemyId: null, data: {} });
            const [creatingEnemy, setCreatingEnemy] = useState(false);
            const [reinforcementEntry, setReinforcementEntry] = useState({ isOpen: false, enemyIds: [] });
            const [outsideEncounterEnemyIds, setOutsideEncounterEnemyIds] = useState([]);
            const [enemySourceChoiceOpen, setEnemySourceChoiceOpen] = useState(false);
            const [bestiaryEnemySelectorOpen, setBestiaryEnemySelectorOpen] = useState(false);
            const [bestiaryEnemyDraft, setBestiaryEnemyDraft] = useState(null);
            const [bestiaryEnemyQuery, setBestiaryEnemyQuery] = useState('');
            const [bestiaryEnemyTag, setBestiaryEnemyTag] = useState('');
            const [bestiary, setBestiary] = useState(() => loadLocalBestiary());
            const srdEquipmentCompendium = window.DndSrdEquipmentCompendium?.format === 'dnd-srd-equipment-compendium' ? window.DndSrdEquipmentCompendium : { items: [] };
            const srdMagicItemCompendium = window.DndSrdMagicItemCompendium?.format === 'dnd-srd-magic-item-compendium' ? window.DndSrdMagicItemCompendium : { items: [] };
            const marketCompendiumItems = [...srdEquipmentCompendium.items, ...srdMagicItemCompendium.items];
            const [equipmentCompendiumOpen, setEquipmentCompendiumOpen] = useState(false);
            const [equipmentCompendiumQuery, setEquipmentCompendiumQuery] = useState('');
            const [equipmentCompendiumCategory, setEquipmentCompendiumCategory] = useState('');
            const [bestiaryOpen, setBestiaryOpen] = useState(false);
            const [bestiaryQuery, setBestiaryQuery] = useState('');
            const [bestiaryTag, setBestiaryTag] = useState('');
            const [bestiarySort, setBestiarySort] = useState('name');
            const [bestiaryCompendiumOpen, setBestiaryCompendiumOpen] = useState(false);
            const [bestiaryCompendiumQuery, setBestiaryCompendiumQuery] = useState('');
            const [bestiaryCompendiumType, setBestiaryCompendiumType] = useState('');
            const [bestiaryCompendiumChallenge, setBestiaryCompendiumChallenge] = useState('');
            const [bestiaryCompendiumPreview, setBestiaryCompendiumPreview] = useState(null);
            const [bestiaryEditor, setBestiaryEditor] = useState(null);
            const [bestiaryNotice, setBestiaryNotice] = useState('');
            const bestiaryAvatarRef = useRef(null);
            const bestiaryImportRef = useRef(null);
            const [bestiaryImportPreview, setBestiaryImportPreview] = useState(null);
            const [bestiaryImportMode, setBestiaryImportMode] = useState('merge');
            const [bestiaryDuplicateMode, setBestiaryDuplicateMode] = useState('skip');
            const [bestiarySelectedImportIds, setBestiarySelectedImportIds] = useState([]);
            const [enemyHpModal, setEnemyHpModal] = useState({ isOpen: false, enemyId: null, mode: 'damage', amount: '' });
            const [finishEncounterPrompt, setFinishEncounterPrompt] = useState(false);
            const [sharedCharacterId, setSharedCharacterId] = useState(null);
            const [shareCharacterOpen, setShareCharacterOpen] = useState(false);
            const [sharingCharacter, setSharingCharacter] = useState(false);
            const [encounterSetupOpen, setEncounterSetupOpen] = useState(false);
            const [preparedTurnOrder, setPreparedTurnOrder] = useState([]);
            const [encounterActionsOpen, setEncounterActionsOpen] = useState(false);
            const [onlineEncounterView, setOnlineEncounterView] = useState('encounter');
            const [onlineEncounterPanel, setOnlineEncounterPanel] = useState('turn');
            const [expiredEffectsOpen, setExpiredEffectsOpen] = useState(false);
            const [encounterBusy, setEncounterBusy] = useState(false);
            const [postponeOpen, setPostponeOpen] = useState(false);
            const [onlineTableError, setOnlineTableError] = useState('');
            const [onlineTableNotice, setOnlineTableNotice] = useState('');
            const [onlineTableBusy, setOnlineTableBusy] = useState(false);
            const [participantInitiativeDrafts, setParticipantInitiativeDrafts] = useState({});
            const [lastOnlineRoom, setLastOnlineRoom] = useState(loadOnlineTableSession);
            const [onlineReconnectState, setOnlineReconnectState] = useState({ status: 'idle', message: '' });
            const [hpSyncStatus, setHpSyncStatus] = useState('idle');
            const [pendingHpSync, setPendingHpSync] = useState(loadPendingHpSync);
            const [hpModal, setHpModal] = useState({ isOpen: false, participantId: null, mode: 'damage', amount: '' });
            const [hpConflict, setHpConflict] = useState(null);
            const [participantsHavePendingWrites, setParticipantsHavePendingWrites] = useState(false);
            const [activityHistoryOpen, setActivityHistoryOpen] = useState(false);
            const [portraitViewerOpen, setPortraitViewerOpen] = useState(false);
            const [onlineAvatarViewer, setOnlineAvatarViewer] = useState(null);
            const t = (key) => APP_TRANSLATIONS[appSettings.language]?.[key] || APP_TRANSLATIONS.es[key] || key;
            const firebaseConnectionLabel = firebaseError ? 'Error de conexión' : !onlineStatus ? 'Sin conexión' : firebaseReady && firebaseUser ? 'Online' : 'Conectando…';
            const firebaseConnectionClass = firebaseError ? 'border-red-800 bg-red-950/40 text-red-200' : !onlineStatus ? 'border-gray-700 bg-gray-900/70 text-gray-400' : firebaseReady && firebaseUser ? 'border-emerald-700 bg-emerald-950/30 text-emerald-200' : 'border-cyan-800 bg-cyan-950/25 text-cyan-200';
            const isCurrentRoomMaster = !!currentRoom && roomData?.ownerUid === firebaseUser?.uid;
            const canManageEnemies = roomData?.ownerUid === firebaseUser?.uid;
            const encounterParticipants = roomParticipants.filter(participant => participant.connected !== false && roomMembers.some(member => member.uid === participant.ownerUid && member.active));
            const encounterCombatants = [...encounterParticipants, ...publicCombatants];
            const encounterEffects = [...publicEffects, ...(canManageEnemies ? privateEffects : [])];
            const getCombatant = (id) => encounterCombatants.find(combatant => combatant.id === id || combatant.ownerUid === id) || null;
            const participantName = (id) => getCombatant(id)?.name || 'Participante';
            const hasInitiativeValue = (value) => value !== null && value !== '' && value !== undefined && Number.isFinite(Number(value));
            const shouldShowEncounter = roomData?.status === 'active' || roomData?.status === 'paused';
            const onlineTableView = !currentRoom
                ? 'start'
                : roomData?.status === 'closed'
                    ? 'closed'
                    : shouldShowEncounter
                        ? 'encounter'
                        : encounterSetupOpen
                            ? 'preparation'
                            : 'lobby';
            const saveOnlineTableViewScroll = (event) => {
                const previous = onlineTableScrollPositionsRef.current[onlineTableView] || {};
                onlineTableScrollPositionsRef.current[onlineTableView] = { ...previous, inner: event.currentTarget.scrollTop };
            };
            const OnlineCombatantAvatar = (props) => (
                <OnlineCombatantAvatarView
                    {...props}
                    onAvatarPreview={setOnlineAvatarViewer}
                />
            );
            const sharedCharacter = sharedCharacterId ? manager.characters[sharedCharacterId] : null;
            const sharedCharacterHp = sharedCharacter?.data?.hp || null;
            const ownRoomParticipant = roomParticipants.find(participant => participant.ownerUid === firebaseUser?.uid && participant.characterId === sharedCharacterId) || null;
            const [charInfo, setCharInfo] = useCharacterField(activeCharacter.data, updateActiveData, 'charInfo');
            const [characterBuild, setCharacterBuild] = useCharacterField(activeCharacter.data, updateActiveData, 'characterBuild');
            const [presentation, setPresentation] = useCharacterField(activeCharacter.data, updateActiveData, 'presentation');
            const [characterHeaderMenuOpen, setCharacterHeaderMenuOpen] = useState(false);
            const [level, setLevel] = useCharacterField(activeCharacter.data, updateActiveData, 'level');
            const PROF_BONUS = Math.ceil((Number(level) || 1) / 4) + 1;

            const [inspiration, setInspiration] = useCharacterField(activeCharacter.data, updateActiveData, 'inspiration');

            const [hp, setHp] = useCharacterField(activeCharacter.data, updateActiveData, 'hp');
            const [hitDice, setHitDice] = useCharacterField(activeCharacter.data, updateActiveData, 'hitDice');
            
            const [speed, setSpeed] = useCharacterField(activeCharacter.data, updateActiveData, 'speed');
            const [size, setSize] = useCharacterField(activeCharacter.data, updateActiveData, 'size');
            const [initBonus, setInitBonus] = useCharacterField(activeCharacter.data, updateActiveData, 'initBonus');
            const [deathSaves, setDeathSaves] = useCharacterField(activeCharacter.data, updateActiveData, 'deathSaves');
            const [deathSavePulse, setDeathSavePulse] = useState(null);
            const [deathSaveOutcome, setDeathSaveOutcome] = useState(null);
            const deathSaveOutcomeTimerRef = useRef(null);

            const [stats, setStats] = useCharacterField(activeCharacter.data, updateActiveData, 'stats');
            const [tempStats, setTempStats] = useCharacterField(activeCharacter.data, updateActiveData, 'tempStats');
            const [savingThrows, setSavingThrows] = useCharacterField(activeCharacter.data, updateActiveData, 'savingThrows');

            const [proficiencies, setProficiencies] = useCharacterField(activeCharacter.data, updateActiveData, 'proficiencies');
            const [proficiencyEntries = [], setProficiencyEntries] = useCharacterField(activeCharacter.data, updateActiveData, 'proficiencyEntries');

            const [resources, setResources] = useCharacterField(activeCharacter.data, updateActiveData, 'resources');
            const [resourceDrag, setResourceDrag] = useState({ id: null, targetId: null, x: 0, y: 0, left: 0, top: 0, width: 0, height: 0 });
            const resourcePressRef = useRef(null);
            const resourceLongPressTimerRef = useRef(null);
            const resourceReorderTargetRef = useRef(null);
            const resourceCardRefs = useRef(new Map());
            const resourceGridRef = useRef(null);
            const resourceDragListenersRef = useRef(null);
            const roomListenersRef = useRef({ code: null, room: null, members: null, participants: null, publicCombatants: null, privateEnemies: null, publicEffects: null, privateEffects: null });
            const roomRestoreAttemptedRef = useRef(false);
            const hpSyncTimerRef = useRef(null);
            const hpConfirmTimerRef = useRef(null);
            const applyingRemoteHpRef = useRef(null);
            const lastSentHpPayloadRef = useRef(null);
            const pendingHpSyncRef = useRef(loadPendingHpSync());
            const hpConflictHandledRef = useRef(null);
            const hpSyncContextRef = useRef(null);
            const conditionsSyncRef = useRef({ key: null, hash: null });
            const [currency, setCurrency] = useCharacterField(activeCharacter.data, updateActiveData, 'currency');
            const [inventory, setInventory] = useCharacterField(activeCharacter.data, updateActiveData, 'inventory');
            
            const [armors, setArmors] = useCharacterField(activeCharacter.data, updateActiveData, 'armors');
            const [tools, setTools] = useCharacterField(activeCharacter.data, updateActiveData, 'tools');
            const [miscAc, setMiscAc] = useCharacterField(activeCharacter.data, updateActiveData, 'miscAc');

            const [weapons, setWeapons] = useCharacterField(activeCharacter.data, updateActiveData, 'weapons');
            const [selectedWeaponId, setSelectedWeaponId] = useState('wp_soul');
            const [ammoSettingsOpen, setAmmoSettingsOpen] = useState(false);
            const selectedWeapon = weapons.find(weapon => weapon.id === selectedWeaponId) || null;
            const selectedWeaponAmmo = selectedWeapon?.ammoItemId ? inventory.find(item => item.id === selectedWeapon.ammoItemId) || null : null;
            useEffect(() => {
                const singleLineInputTypes = new Set(['', 'text', 'search', 'email', 'url', 'tel', 'password', 'number']);
                const isSingleLineInput = target => target instanceof HTMLInputElement
                    && singleLineInputTypes.has(String(target.type || '').toLocaleLowerCase('en'))
                    && !target.disabled
                    && !target.readOnly
                    && target.dataset.enterKeepsFocus !== 'true';
                const handleInputFocus = event => {
                    if (isSingleLineInput(event.target) && !event.target.hasAttribute('enterkeyhint')) {
                        event.target.setAttribute('enterkeyhint', 'done');
                    }
                };
                const dismissKeyboardOnEnter = event => {
                    if ((event.key !== 'Enter' && event.keyCode !== 13) || event.isComposing || !isSingleLineInput(event.target)) return;
                    event.preventDefault();
                    event.target.blur();
                };
                document.addEventListener('focusin', handleInputFocus);
                document.addEventListener('keydown', dismissKeyboardOnEnter);
                return () => {
                    document.removeEventListener('focusin', handleInputFocus);
                    document.removeEventListener('keydown', dismissKeyboardOnEnter);
                };
            }, []);
            useEffect(() => {
                if (!weapons.some(weapon => weapon.id === selectedWeaponId)) {
                    setSelectedWeaponId(weapons[0]?.id || '');
                }
            }, [weapons, selectedWeaponId]);
            const [activeTab, setActiveTab] = useState("character");
            const [combatMode, setCombatMode] = useState(false);
            const [combatDashboardView, setCombatDashboardView] = useState('summary');
            const [conditionsManagerOpen, setConditionsManagerOpen] = useState(false);
            const [tabTransition, setTabTransition] = useState({ phase: 'idle', pendingTab: null, direction: 'left', enterActive: false });
            const [isTransitioning, setIsTransitioning] = useState(false);
            const tabTransitionRef = useRef({ phase: 'idle', pendingTab: null, direction: 'left', enterActive: false });
            const tabScrollRef = useRef(null);
            const tabScrollPositions = useRef({ combat: 0, character: 0, grimoire: 0, inventory: 0 });
            const onlineTableContentRef = useRef(null);
            const onlineTableViewContentRef = useRef(null);
            const onlineTableScrollPositionsRef = useRef({});
            const tabTouchStart = useRef(null);
            const activitySnapshotRef = useRef(null);
            const transitionTimerRef = useRef(null);
            const safetyTimerRef = useRef(null);
            const enterFrameRef = useRef(null);
            const TAB_ORDER = ['character', 'combat', 'grimoire', 'inventory'];
            const { phase: transitionPhase, pendingTab, direction: transitionDirection, enterActive: isEnterActive } = tabTransition;

            const [traits, setTraits] = useCharacterField(activeCharacter.data, updateActiveData, 'traits');
            const [feats, setFeats] = useCharacterField(activeCharacter.data, updateActiveData, 'feats');
            const [narrative, setNarrative] = useCharacterField(activeCharacter.data, updateActiveData, 'narrative');
            const narrativeFilledCount = Object.values(narrative || {}).filter(value => String(value || '').trim()).length;
            const [spells, setSpells] = useCharacterField(activeCharacter.data, updateActiveData, 'spells');
            const [spellLimits, setSpellLimits] = useCharacterField(activeCharacter.data, updateActiveData, 'spellLimits');
            const [spellSlots, setSpellSlots] = useCharacterField(activeCharacter.data, updateActiveData, 'spellSlots');
            const [grimoireConfig, setGrimoireConfig] = useCharacterField(activeCharacter.data, updateActiveData, 'grimoireConfig');
            const [spellGrantUses, setSpellGrantUses] = useCharacterField(activeCharacter.data, updateActiveData, 'spellGrantUses');
            const [activeConcentration, setActiveConcentration] = useCharacterField(activeCharacter.data, updateActiveData, 'activeConcentration');
            const [conditions, setConditions] = useCharacterField(activeCharacter.data, updateActiveData, 'conditions');
            const [timers, setTimers] = useCharacterField(activeCharacter.data, updateActiveData, 'timers');
            const [activityLog, setActivityLog] = useCharacterField(activeCharacter.data, updateActiveData, 'activityLog');
            const [sessionNotes, setSessionNotes] = useCharacterField(activeCharacter.data, updateActiveData, 'sessionNotes');
            const [grimoireView, setGrimoireView] = useState('available');
            const [spellSearch, setSpellSearch] = useState('');
            const [spellFilter, setSpellFilter] = useState('all');
            const [srdSpellSearch, setSrdSpellSearch] = useState('');
            const [srdSpellLevel, setSrdSpellLevel] = useState('all');
            const [srdSpellSchool, setSrdSpellSchool] = useState('all');
            const [srdSpellTrait, setSrdSpellTrait] = useState('all');
            const [srdSpellClassFilter, setSrdSpellClassFilter] = useState('auto');
            const [srdSpellDetail, setSrdSpellDetail] = useState(null);
            const [featCompendiumOpen, setFeatCompendiumOpen] = useState(false);
            const [featCompendiumSearch, setFeatCompendiumSearch] = useState('');
            const [featCompendiumSource, setFeatCompendiumSource] = useState('all');
            const [featCompendiumDetail, setFeatCompendiumDetail] = useState(null);
            const [castSpell, setCastSpell] = useState(null);
            const [spellCastAnimation, setSpellCastAnimation] = useState(null);
            const [grimoireSettingsOpen, setGrimoireSettingsOpen] = useState(false);
            const [grimoireGuideOpen, setGrimoireGuideOpen] = useState(false);
            const [characterBuildOpen, setCharacterBuildOpen] = useState(false);
            const [characterCreationWizardOpen, setCharacterCreationWizardOpen] = useState(false);
            const [levelReviewOpen, setLevelReviewOpen] = useState(false);
            const [levelReviewHpGain, setLevelReviewHpGain] = useState('');
            const [levelReviewChecks, setLevelReviewChecks] = useState({});
            const [levelDraft, setLevelDraft] = useState(String(activeCharacter.data.level || '1'));
            const [pendingLevelChange, setPendingLevelChange] = useState(null);
            const [levelUpCeremony, setLevelUpCeremony] = useState(null);
            const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
            const [printPreviewMode, setPrintPreviewMode] = useState('session');
            const [presentationSettingsOpen, setPresentationSettingsOpen] = useState(false);
            const [presentationPreviewOpen, setPresentationPreviewOpen] = useState(false);
            const [sheetFeedback, setSheetFeedback] = useState('');
            const [sheetFeedbackMessage, setSheetFeedbackMessage] = useState('');
            const [showEmptySlots, setShowEmptySlots] = useState(false);
            const [editingSlotLevel, setEditingSlotLevel] = useState(null);
            const [restModalOpen, setRestModalOpen] = useState(false);
            const [restType, setRestType] = useState(null);
            const [restSpentDice, setRestSpentDice] = useState(0);
            const [restHealing, setRestHealing] = useState(0);
            const [restCeremony, setRestCeremony] = useState(null);
            const [timerModal, setTimerModal] = useState({ isOpen: false, id: null, data: { name: '', current: '1', max: '', type: 'turns' } });
            const [timerNow, setTimerNow] = useState(Date.now());

            // ESTADOS PARA MODALES
            const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null, isAlert: false, confirmLabel: 'Eliminar', confirmTone: 'danger' });
            const [skillModal, setSkillModal] = useState({ isOpen: false, skillKey: null, skillName: "" });
            const [addModal, setAddModal] = useState({ isOpen: false, type: null, data: {} }); 
            const [notesModalOpen, setNotesModalOpen] = useState(false);
            const [diaryOpen, setDiaryOpen] = useState(false);
            const [diaryCategory, setDiaryCategory] = useState('all');
            const [diarySearch, setDiarySearch] = useState('');
            const [editingDiaryEntry, setEditingDiaryEntry] = useState(null);
            const [characterManagerOpen, setCharacterManagerOpen] = useState(false);
            const [pendingImport, setPendingImport] = useState(null);
            const importFileRef = useRef(null);
            const portraitFileRef = useRef(null);

            // Ref para la barra de vida táctil
            const hpBarRef = useRef(null);
            const hpVisualRef = useRef({ characterId: manager.activeCharacterId, current: Number(activeCharacter.data.hp?.current) || 0, max: Number(activeCharacter.data.hp?.max) || 1, temp: Number(activeCharacter.data.hp?.temp) || 0 });
            const hpVisualTimerRef = useRef(null);
            const [hpBarMotion, setHpBarMotion] = useState(null);
            const [isDraggingHp, setIsDraggingHp] = useState(false);
            const presentationFeedbackRef = useRef({ characterId: manager.activeCharacterId, hp: Number(activeCharacter.data.hp?.current) || 0, temp: Number(activeCharacter.data.hp?.temp) || 0, inspiration: Boolean(activeCharacter.data.inspiration), concentration: Boolean(activeCharacter.data.activeConcentration), slots: JSON.stringify(activeCharacter.data.spellSlots || {}), resources: JSON.stringify((activeCharacter.data.resources || []).map(resource => [resource.id, resource.current])), conditions: JSON.stringify(activeCharacter.data.conditions || []) });
            const createActivitySnapshot = (data = activeCharacter.data) => ({
                hp: { current: data.hp?.current ?? '', temp: data.hp?.temp ?? '' },
                miscAc: data.miscAc ?? '',
                resources: Object.fromEntries((data.resources || []).map(resource => [resource.id, { name: resource.name, current: Number(resource.current) || 0 }])),
                spellSlots: Object.fromEntries(Object.entries(data.spellSlots || {}).map(([level, slot]) => [level, Number(slot.current) || 0])),
                conditions: [...(data.conditions || [])],
                timers: Object.fromEntries((data.timers || []).map(timer => [timer.id, { name: timer.name, current: Number(timer.current) || 0, expiresAt: timer.expiresAt || '', type: timer.type }]))
            });
            const appendActivity = (descriptions) => {
                const entries = (Array.isArray(descriptions) ? descriptions : [descriptions]).filter(Boolean);
                if (!entries.length) return;
                const timestamp = new Date().toISOString();
                setActivityLog(previous => entries.map((description, index) => ({ id: `activity_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 6)}`, timestamp, description })).concat(previous || []).slice(0, 100));
            };

            useEffect(() => {
                setSelectedWeaponId(weapons[0]?.id || null);
                setPortraitViewerOpen(false);
            }, [manager.activeCharacterId]);

            useEffect(() => {
                if (isDraggingHp) return;
                const snapshot = createActivitySnapshot();
                const previous = activitySnapshotRef.current;
                if (!previous || previous.characterId !== manager.activeCharacterId) {
                    activitySnapshotRef.current = { characterId: manager.activeCharacterId, snapshot };
                    return;
                }

                const changes = [];
                if (String(previous.snapshot.hp.current) !== String(snapshot.hp.current)) changes.push(`Vida ${previous.snapshot.hp.current || 0} → ${snapshot.hp.current || 0}`);
                if (String(previous.snapshot.hp.temp) !== String(snapshot.hp.temp)) changes.push(`Vida temporal ${previous.snapshot.hp.temp || 0} → ${snapshot.hp.temp || 0}`);
                if (String(previous.snapshot.miscAc) !== String(snapshot.miscAc)) changes.push(`Modificador temporal de CA ${formatMod(Number(previous.snapshot.miscAc) || 0)} → ${formatMod(Number(snapshot.miscAc) || 0)}`);

                Object.entries(snapshot.resources).forEach(([id, resource]) => {
                    const prior = previous.snapshot.resources[id];
                    if (prior && prior.current !== resource.current) changes.push(`${resource.name} ${prior.current} → ${resource.current}`);
                });
                Object.entries(snapshot.spellSlots).forEach(([level, current]) => {
                    if (previous.snapshot.spellSlots[level] !== undefined && previous.snapshot.spellSlots[level] !== current) {
                        const maximum = Number(spellSlots?.[level]?.max) || 0;
                        changes.push(`Ranura de nivel ${level}: ${previous.snapshot.spellSlots[level]} → ${current} disponibles${maximum ? ` de ${maximum}` : ''}`);
                    }
                });
                snapshot.conditions.filter(condition => !previous.snapshot.conditions.includes(condition)).forEach(condition => changes.push(`Condición activada: ${condition}`));
                previous.snapshot.conditions.filter(condition => !snapshot.conditions.includes(condition)).forEach(condition => changes.push(`Condición eliminada: ${condition}`));
                Object.entries(snapshot.timers).forEach(([id, timer]) => {
                    const prior = previous.snapshot.timers[id];
                    if (!prior) changes.push(`Temporizador añadido: ${timer.name}`);
                    else if (prior.current !== timer.current || prior.expiresAt !== timer.expiresAt || prior.type !== timer.type) changes.push(`Temporizador ${timer.name}: ${prior.current} → ${timer.current}`);
                });
                Object.entries(previous.snapshot.timers).filter(([id]) => !snapshot.timers[id]).forEach(([, timer]) => changes.push(`Temporizador eliminado: ${timer.name}`));

                activitySnapshotRef.current = { characterId: manager.activeCharacterId, snapshot };
                appendActivity(changes);
            }, [manager.activeCharacterId, hp.current, hp.temp, miscAc, resources, spellSlots, conditions, timers, isDraggingHp]);

            useEffect(() => {
                const next = { characterId: manager.activeCharacterId, hp: Number(hp.current) || 0, temp: Number(hp.temp) || 0, inspiration: Boolean(inspiration), concentration: Boolean(activeConcentration), slots: JSON.stringify(spellSlots || {}), resources: JSON.stringify((resources || []).map(resource => [resource.id, resource.current])), conditions: JSON.stringify(conditions || []) };
                const previous = presentationFeedbackRef.current;
                presentationFeedbackRef.current = next;
                if (previous.characterId !== next.characterId) return;
                let feedback = '', message = '';
                if (previous.hp !== next.hp) { feedback = next.hp < previous.hp ? 'damage' : 'healing'; message = `${next.hp < previous.hp ? 'Daño' : 'Curación'} · ${Math.abs(next.hp - previous.hp)} PV`; }
                else if (previous.temp !== next.temp) { feedback = 'temporary'; message = `Vida temporal · ${next.temp}`; }
                else if (previous.inspiration !== next.inspiration) { feedback = 'inspiration'; message = next.inspiration ? 'Inspiración obtenida' : 'Inspiración gastada'; }
                else if (previous.concentration !== next.concentration) { feedback = 'concentration'; message = next.concentration ? 'Concentración iniciada' : 'Concentración finalizada'; }
                else if (previous.slots !== next.slots) { feedback = 'slots'; message = 'Ranuras actualizadas'; }
                else if (previous.resources !== next.resources) { feedback = 'resources'; message = 'Recurso actualizado'; }
                else if (previous.conditions !== next.conditions) { feedback = 'conditions'; message = 'Condiciones actualizadas'; }
                if (!feedback) return;
                setSheetFeedback('');
                setSheetFeedbackMessage('');
                const frame = window.requestAnimationFrame(() => { setSheetFeedback(feedback); setSheetFeedbackMessage(message); });
                const timer = window.setTimeout(() => { setSheetFeedback(''); setSheetFeedbackMessage(''); }, 1100);
                return () => { window.cancelAnimationFrame(frame); window.clearTimeout(timer); };
            }, [manager.activeCharacterId, hp.current, hp.temp, inspiration, activeConcentration, spellSlots, resources, conditions]);
            useEffect(() => { setLevelDraft(String(level || '1')); setPendingLevelChange(null); }, [manager.activeCharacterId, level]);

            const markDeathSave = (type, mark) => {
                const field = type === 'success' ? 'successes' : 'failures';
                const current = Math.max(0, Math.min(3, Number(deathSaves?.[field]) || 0));
                const next = current === mark ? mark - 1 : mark;
                setDeathSaves(previous => ({ ...previous, [field]: next }));
                if (deathSaveOutcomeTimerRef.current) window.clearTimeout(deathSaveOutcomeTimerRef.current);
                deathSaveOutcomeTimerRef.current = null;
                if (next <= current) return;
                setDeathSavePulse({ id: `${type}_${Date.now()}`, type, mark: next });
                if (next === 3) {
                    deathSaveOutcomeTimerRef.current = window.setTimeout(() => {
                        if (type === 'success') {
                            setHp(previous => ({ ...previous, current: String(Math.max(1, Number(previous.current) || 0)) }));
                            setDeathSaves({ successes: 0, failures: 0 });
                        }
                        setDeathSaveOutcome({ type, characterName: charInfo.name || 'El personaje' });
                        deathSaveOutcomeTimerRef.current = null;
                    }, 520);
                }
            };
            const resetDeathSaves = () => {
                if (deathSaveOutcomeTimerRef.current) window.clearTimeout(deathSaveOutcomeTimerRef.current);
                deathSaveOutcomeTimerRef.current = null;
                setDeathSaveOutcome(null);
                setDeathSaves({ successes: 0, failures: 0 });
            };
            useEffect(() => () => {
                if (deathSaveOutcomeTimerRef.current) window.clearTimeout(deathSaveOutcomeTimerRef.current);
            }, []);
            useEffect(() => {
                if (deathSaveOutcomeTimerRef.current) window.clearTimeout(deathSaveOutcomeTimerRef.current);
                deathSaveOutcomeTimerRef.current = null;
                setDeathSavePulse(null);
                setDeathSaveOutcome(null);
            }, [manager.activeCharacterId]);
            useEffect(() => {
                if ((Number(hp.current) || 0) > 0 && deathSaveOutcome?.type !== 'success') setDeathSaveOutcome(null);
            }, [hp.current, deathSaveOutcome?.type]);

            useEffect(() => {
                try { window.localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(appSettings)); } catch (error) {}
                document.documentElement.dataset.theme = appSettings.theme;
                document.documentElement.dataset.textSize = appSettings.textSize;
                document.documentElement.lang = appSettings.language;
            }, [appSettings]);

            useEffect(() => {
                const syncFirebaseState = () => {
                    const state = window.firebaseConnectionState;
                    if (!state) return;
                    setFirebaseReady(!!state.ready);
                    setFirebaseUser(state.user || null);
                    setFirebaseError(state.error || null);
                };
                const handleOnline = () => setOnlineStatus(navigator.onLine);
                const handleAuth = event => { setFirebaseUser(event.detail.user || null); setFirebaseError(null); };
                const handleError = event => setFirebaseError(event.detail.error || new Error('Error de conexión con Firebase.'));
                syncFirebaseState();
                window.addEventListener('firebase-ready', syncFirebaseState);
                window.addEventListener('firebase-auth-state', handleAuth);
                window.addEventListener('firebase-error', handleError);
                window.addEventListener('online', handleOnline);
                window.addEventListener('offline', handleOnline);
                const loadTimeout = window.setTimeout(() => {
                    if (!window.firebaseConnectionState?.ready && !window.firebaseConnectionState?.error) setFirebaseError(new Error('No se pudo cargar Firebase. La ficha continúa disponible localmente.'));
                }, 8000);
                return () => {
                    window.clearTimeout(loadTimeout);
                    window.removeEventListener('firebase-ready', syncFirebaseState);
                    window.removeEventListener('firebase-auth-state', handleAuth);
                    window.removeEventListener('firebase-error', handleError);
                    window.removeEventListener('online', handleOnline);
                    window.removeEventListener('offline', handleOnline);
                };
            }, []);

            useEffect(() => {
                try { window.localStorage.setItem(ONLINE_HP_PENDING_KEY, JSON.stringify(pendingHpSync)); } catch (error) {}
            }, [pendingHpSync]);

            useEffect(() => {
                if (!currentRoom?.code || !sharedCharacterId || !sharedCharacterHp || !ownRoomParticipant || !firebaseUser?.uid) return;
                const localValues = getHpValues({ currentHp: sharedCharacterHp.current, maxHp: sharedCharacterHp.max, tempHp: sharedCharacterHp.temp });
                const remoteValues = getHpValues(ownRoomParticipant, localValues);
                const localHash = getHpHash(localValues);
                const remoteHash = getHpHash(remoteValues);
                const syncKey = getHpSyncKey(currentRoom.code, firebaseUser.uid, sharedCharacterId);
                const contextChanged = hpSyncContextRef.current?.key !== syncKey;
                if (contextChanged) {
                    hpSyncContextRef.current = { key: syncKey, lastKnownHash: null };
                    hpConflictHandledRef.current = null;
                }
                const context = hpSyncContextRef.current;
                const pending = getPendingHpSync(syncKey, currentRoom.code, firebaseUser.uid, sharedCharacterId);
                const lastSent = lastSentHpPayloadRef.current;

                if (remoteHash === localHash) {
                    if (lastSent?.key === syncKey && lastSent.hash === remoteHash && participantsHavePendingWrites) {
                        setHpSyncStatus('syncing');
                        return;
                    }
                    if (lastSent?.key === syncKey && lastSent.hash === remoteHash && !participantsHavePendingWrites) {
                        lastSentHpPayloadRef.current = null;
                        if (hpConfirmTimerRef.current) window.clearTimeout(hpConfirmTimerRef.current);
                        hpConfirmTimerRef.current = null;
                    }
                    if (pending) clearPendingHpSync(syncKey);
                    applyingRemoteHpRef.current = null;
                    context.lastKnownHash = remoteHash;
                    setHpSyncStatus('synced');
                    return;
                }

                if (pending) {
                    setHpSyncStatus(pending.status === 'failed' ? 'failed' : 'pending');
                    if (contextChanged && hpConflictHandledRef.current !== syncKey) {
                        hpConflictHandledRef.current = syncKey;
                        setHpConflict({ key: syncKey, characterId: sharedCharacterId, participantId: ownRoomParticipant.id, local: localValues, remote: remoteValues });
                    }
                    return;
                }

                const localChangeAwaitingSend = !contextChanged && context.lastKnownHash === remoteHash && localHash !== remoteHash;
                if (localChangeAwaitingSend || participantsHavePendingWrites) return;

                // A confirmed remote value is authoritative unless an offline change was explicitly saved.
                applyingRemoteHpRef.current = remoteHash;
                context.lastKnownHash = remoteHash;
                console.log('[HP] Aplicando cambio remoto:', remoteValues);
                updateCharacterData(sharedCharacterId, previous => ({ ...previous, hp: { ...previous.hp, current: String(remoteValues.currentHp), max: String(remoteValues.maxHp), temp: String(remoteValues.tempHp) } }));
                setHpSyncStatus('synced');
            }, [currentRoom?.code, sharedCharacterId, sharedCharacterHp?.current, sharedCharacterHp?.max, sharedCharacterHp?.temp, ownRoomParticipant?.currentHp, ownRoomParticipant?.maxHp, ownRoomParticipant?.tempHp, ownRoomParticipant?.lastUpdatedBy, participantsHavePendingWrites, firebaseUser?.uid]);

            useEffect(() => {
                if (!currentRoom?.code || !sharedCharacterId || !sharedCharacterHp || !ownRoomParticipant || !firebaseUser?.uid) return;
                const syncKey = getHpSyncKey(currentRoom.code, firebaseUser.uid, sharedCharacterId);
                const context = hpSyncContextRef.current;
                if (context?.key !== syncKey || hpConflict?.key === syncKey) return;
                const localValues = getHpValues({ currentHp: sharedCharacterHp.current, maxHp: sharedCharacterHp.max, tempHp: sharedCharacterHp.temp });
                const localHash = getHpHash(localValues);
                const remoteValues = getHpValues(ownRoomParticipant, localValues);
                const remoteHash = getHpHash(remoteValues);
                if (applyingRemoteHpRef.current) {
                    if (applyingRemoteHpRef.current === localHash) applyingRemoteHpRef.current = null;
                    return;
                }
                if (localHash === remoteHash || context.lastKnownHash !== remoteHash) return;
                if (!onlineStatus || !firebaseReady) {
                    markPendingHpSync(syncKey, currentRoom.code, firebaseUser.uid, sharedCharacterId, localValues, 'pending');
                    setHpSyncStatus('pending');
                    return;
                }
                if (hpSyncTimerRef.current) window.clearTimeout(hpSyncTimerRef.current);
                const payload = { key: syncKey, hash: localHash, values: getHpValues(localValues) };
                lastSentHpPayloadRef.current = payload;
                setHpSyncStatus('syncing');
                hpSyncTimerRef.current = window.setTimeout(async () => {
                    try {
                        const hpChanges = { currentHp: payload.values.currentHp, tempHp: payload.values.tempHp };
                        if (payload.values.maxHp !== remoteValues.maxHp) hpChanges.maxHp = payload.values.maxHp;
                        await updateParticipantHp(ownRoomParticipant, hpChanges, 'player');
                        scheduleHpConfirmation(syncKey, currentRoom.code, firebaseUser.uid, sharedCharacterId, payload.values);
                    } catch (error) {
                        console.error('[Mesa] Error actualizando vida:', error.code, error.message, error);
                        if (isHpNetworkError(error)) markPendingHpSync(syncKey, currentRoom.code, firebaseUser.uid, sharedCharacterId, payload.values, 'failed');
                        setHpSyncStatus('failed');
                    }
                }, 350);
                return () => { if (hpSyncTimerRef.current) window.clearTimeout(hpSyncTimerRef.current); };
            }, [currentRoom?.code, sharedCharacterId, sharedCharacterHp?.current, sharedCharacterHp?.max, sharedCharacterHp?.temp, ownRoomParticipant?.currentHp, ownRoomParticipant?.maxHp, ownRoomParticipant?.tempHp, onlineStatus, firebaseReady, firebaseUser?.uid, hpConflict?.key]);

            useEffect(() => {
                if (!currentRoom?.code || !sharedCharacterId || !ownRoomParticipant || !firebaseUser?.uid) return;
                const key = `${currentRoom.code}:${firebaseUser.uid}:${sharedCharacterId}`;
                const remote = normalizeOnlineConditions(ownRoomParticipant.conditions);
                const remoteHash = remote.map(condition => `${condition.id}:${condition.name}:${condition.source || ''}`).join('|');
                const localNames = (Array.isArray(conditions) ? conditions : []).map(condition => typeof condition === 'string' ? condition : condition.name).filter(Boolean);
                const localHash = localNames.slice().sort().join('|');
                if (conditionsSyncRef.current.key !== key) {
                    conditionsSyncRef.current = { key, hash: remoteHash };
                    if (remote.map(condition => condition.name).slice().sort().join('|') !== localHash) setConditions(remote.map(condition => condition.name));
                    return;
                }
                if (remoteHash !== conditionsSyncRef.current.hash) {
                    conditionsSyncRef.current.hash = remoteHash;
                    if (remote.map(condition => condition.name).slice().sort().join('|') !== localHash) setConditions(remote.map(condition => condition.name));
                    return;
                }
                if (localNames.slice().sort().join('|') === remote.map(condition => condition.name).slice().sort().join('|')) return;
                if (!onlineStatus || !firebaseReady) return;
                const next = localNames.map(name => ({ id: `condition_${name}`, name, source: '', notes: '', createdAt: new Date().toISOString() }));
                const { db, api } = getOnlineServices();
                api.updateDoc(api.doc(db, 'rooms', currentRoom.code, 'participants', ownRoomParticipant.id), { conditions: next, updatedAt: api.serverTimestamp(), lastUpdatedBy: firebaseUser.uid }).then(() => { conditionsSyncRef.current.hash = next.map(condition => `${condition.id}:${condition.name}:`).join('|'); }).catch(() => {});
            }, [currentRoom?.code, sharedCharacterId, ownRoomParticipant?.id, ownRoomParticipant?.conditions, conditions, firebaseUser?.uid, onlineStatus, firebaseReady]);

            useEffect(() => {
                if (!timers.some(timer => REAL_TIMER_UNITS[timer.type] && Date.parse(timer.expiresAt) > Date.now())) return;
                const intervalId = window.setInterval(() => setTimerNow(Date.now()), 1000);
                return () => window.clearInterval(intervalId);
            }, [timers, timerNow]);

            // Keep integer inputs editable: an intermediate empty value or minus sign must not become NaN.
            const handleNumInput = (value) => {
                const text = String(value);
                return /^-?\d*$/.test(text) ? text : '';
            };
            const handleBoundedNumInput = (value, maximum = null) => {
                if (value === '') return '';
                const numeric = Number(value);
                if (!Number.isFinite(numeric)) return '';
                const bounded = Math.max(0, numeric);
                const hasMaximum = maximum !== null && maximum !== undefined && maximum !== '' && Number.isFinite(Number(maximum));
                return hasMaximum ? Math.min(Number(maximum), bounded) : bounded;
            };

            const clearResourceLongPress = () => {
                if (resourceLongPressTimerRef.current) window.clearTimeout(resourceLongPressTimerRef.current);
                resourceLongPressTimerRef.current = null;
            };

            const finishResourceDrag = () => {
                clearResourceLongPress();
                resourceDragListenersRef.current?.();
                resourceDragListenersRef.current = null;
                resourcePressRef.current = null;
                resourceReorderTargetRef.current = null;
                setResourceDrag({ id: null, targetId: null, x: 0, y: 0, left: 0, top: 0, width: 0, height: 0 });
            };

            const reorderResources = (sourceId, targetId) => {
                const previousRects = new Map();
                resourceCardRefs.current.forEach((element, id) => previousRects.set(id, element.getBoundingClientRect()));
                setResources(previous => {
                    const next = reorderItemsById(previous, sourceId, targetId);
                    if (next === previous) return previous;
                    requestAnimationFrame(() => {
                        next.forEach(resource => {
                            if (resource.id === sourceId) return;
                            const element = resourceCardRefs.current.get(resource.id);
                            const previousRect = previousRects.get(resource.id);
                            if (!element || !previousRect) return;
                            const nextRect = element.getBoundingClientRect();
                            const x = previousRect.left - nextRect.left;
                            const y = previousRect.top - nextRect.top;
                            if (!x && !y) return;
                            element.style.transition = 'none';
                            element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                            requestAnimationFrame(() => {
                                element.style.transition = 'transform 160ms cubic-bezier(0.22, 1, 0.36, 1)';
                                element.style.transform = '';
                                window.setTimeout(() => { element.style.transition = ''; }, 180);
                            });
                        });
                    });
                    return next;
                });
            };

            const handleResourcePointerDown = (event, resourceId) => {
                if (event.button !== undefined && event.button !== 0) return;
                if (resourcePressRef.current) return;
                if (event.target.closest('button, input, select, textarea, a, label')) return;
                const start = { id: resourceId, pointerId: event.pointerId, x: event.clientX, y: event.clientY, active: false, element: event.currentTarget };
                start.element.setPointerCapture?.(start.pointerId);
                resourcePressRef.current = start;
                resourceLongPressTimerRef.current = window.setTimeout(() => {
                    if (resourcePressRef.current !== start) return;
                    start.active = true;
                    resourceReorderTargetRef.current = resourceId;
                    const rect = start.element.getBoundingClientRect();
                    const gridRect = resourceGridRef.current?.getBoundingClientRect();
                    setResourceDrag({ id: resourceId, targetId: resourceId, x: 0, y: 0, left: rect.left - (gridRect?.left || 0), top: rect.top - (gridRect?.top || 0), width: rect.width, height: rect.height });
                    const onMove = moveEvent => handleResourcePointerMove(moveEvent);
                    const onEnd = endEvent => handleResourcePointerEnd(endEvent);
                    window.addEventListener('pointermove', onMove, { passive: false });
                    window.addEventListener('pointerup', onEnd);
                    window.addEventListener('pointercancel', onEnd);
                    resourceDragListenersRef.current = () => {
                        window.removeEventListener('pointermove', onMove);
                        window.removeEventListener('pointerup', onEnd);
                        window.removeEventListener('pointercancel', onEnd);
                    };
                }, 420);
            };

            const handleResourcePointerMove = (event) => {
                const press = resourcePressRef.current;
                if (!press || press.pointerId !== event.pointerId) return;
                const x = event.clientX - press.x;
                const y = event.clientY - press.y;
                if (!press.active) {
                    if (Math.hypot(x, y) > 12) clearResourceLongPress();
                    return;
                }
                event.preventDefault();
                const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-resource-id]');
                const targetId = target?.dataset.resourceId || press.id;
                setResourceDrag(previous => previous.id === press.id && (previous.x !== x || previous.y !== y || previous.targetId !== targetId) ? { ...previous, x, y, targetId } : previous);
                if (targetId !== resourceReorderTargetRef.current) {
                    resourceReorderTargetRef.current = targetId;
                    if (targetId !== press.id) reorderResources(press.id, targetId);
                }
            };

            const handleResourcePointerEnd = (event) => {
                const press = resourcePressRef.current;
                if (!press || press.pointerId !== event.pointerId) return;
                if (press.active) event.preventDefault();
                if (press.element.hasPointerCapture?.(press.pointerId)) press.element.releasePointerCapture(press.pointerId);
                finishResourceDrag();
            };

            useEffect(() => () => { clearResourceLongPress(); resourceDragListenersRef.current?.(); }, []);
            useEffect(() => finishResourceDrag(), [manager.activeCharacterId]);

            const restoreTabScroll = (tab) => {
                requestAnimationFrame(() => {
                    if (tabScrollRef.current) tabScrollRef.current.scrollTop = tabScrollPositions.current[tab] || 0;
                });
            };

            const updateTabTransition = (nextState) => {
                const next = typeof nextState === 'function' ? nextState(tabTransitionRef.current) : nextState;
                tabTransitionRef.current = next;
                setTabTransition(next);
            };

            const clearTabTransitionTimers = () => {
                if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
                if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
                if (enterFrameRef.current) cancelAnimationFrame(enterFrameRef.current);
                transitionTimerRef.current = null;
                safetyTimerRef.current = null;
                enterFrameRef.current = null;
            };

            const finishTransition = () => {
                // Fin de transicion: libera siempre la navegacion antes del siguiente gesto o pulsacion.
                clearTabTransitionTimers();
                updateTabTransition(prev => ({ ...prev, phase: 'idle', pendingTab: null, enterActive: false }));
                setIsTransitioning(false);
            };

            const beginEnterPhase = () => {
                const currentTransition = tabTransitionRef.current;
                if (currentTransition.phase !== 'exit' || !currentTransition.pendingTab) {
                    finishTransition();
                    return;
                }

                if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
                transitionTimerRef.current = null;
                const nextTab = currentTransition.pendingTab;

                // La pestaña visible solo cambia despues de que la salida haya concluido.
                setActiveTab(nextTab);
                updateTabTransition(prev => ({ ...prev, phase: 'enter', enterActive: false }));
                restoreTabScroll(nextTab);

                enterFrameRef.current = requestAnimationFrame(() => {
                    enterFrameRef.current = requestAnimationFrame(() => {
                        updateTabTransition(prev => prev.phase === 'enter' ? { ...prev, enterActive: true } : prev);
                        enterFrameRef.current = null;
                    });
                });
                safetyTimerRef.current = setTimeout(finishTransition, 260);
            };

            useEffect(() => () => {
                clearTabTransitionTimers();
            }, []);

            const requestTabChange = (tab) => {
                if (tab === activeTab || isTransitioning || tabTransitionRef.current.phase !== 'idle') return;

                if (tabScrollRef.current) tabScrollPositions.current[activeTab] = tabScrollRef.current.scrollTop;
                const direction = TAB_ORDER.indexOf(tab) > TAB_ORDER.indexOf(activeTab) ? 'left' : 'right';
                const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

                if (reducedMotion) {
                    updateTabTransition(prev => ({ ...prev, direction }));
                    setActiveTab(tab);
                    restoreTabScroll(tab);
                    finishTransition();
                    return;
                }

                // Inicio de transicion: la salida conserva activeTab hasta que termina.
                clearTabTransitionTimers();
                setIsTransitioning(true);
                updateTabTransition({ phase: 'exit', pendingTab: tab, direction, enterActive: false });
                transitionTimerRef.current = setTimeout(beginEnterPhase, 260);
            };

            const handleTabTransitionEnd = (event) => {
                if (event.target !== event.currentTarget) return;

                if (transitionPhase === 'exit' && event.type === 'animationend' && pendingTab) {
                    beginEnterPhase();
                    return;
                }

                if (transitionPhase === 'enter' && isEnterActive && event.type === 'transitionend' && event.propertyName === 'transform') {
                    finishTransition();
                }
            };

            const handleTabTouchStart = (event) => {
                if (event.touches.length !== 1 || event.target.closest('input, textarea, select, button, [data-no-tab-swipe]')) {
                    tabTouchStart.current = null;
                    return;
                }
                const touch = event.touches[0];
                tabTouchStart.current = { x: touch.clientX, y: touch.clientY };
            };

            const handleTabTouchEnd = (event) => {
                if (!tabTouchStart.current || event.changedTouches.length !== 1) return;

                const touch = event.changedTouches[0];
                const deltaX = touch.clientX - tabTouchStart.current.x;
                const deltaY = touch.clientY - tabTouchStart.current.y;
                tabTouchStart.current = null;

                if (Math.abs(deltaX) < 56 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

                const currentIndex = TAB_ORDER.indexOf(activeTab);
                const nextIndex = currentIndex + (deltaX < 0 ? 1 : -1);
                if (nextIndex >= 0 && nextIndex < TAB_ORDER.length) requestTabChange(TAB_ORDER[nextIndex]);
            };

            const srdCharacterRules = window.DndSrdCharacterRules;
            const normalizedCharacterLevel = Math.max(1, Math.min(20, Math.trunc(Number(level) || 1)));
            const selectedSrdClass = srdCharacterRules?.classes?.[characterBuild?.classId]
                || srdCharacterRules?.getClassForName?.(charInfo.cls)
                || null;
            const selectedSrdSubclass = srdCharacterRules?.subclasses?.[characterBuild?.subclassId]
                || srdCharacterRules?.getSubclassForName?.(characterBuild?.subclassName, selectedSrdClass?.id)
                || null;
            const activeSrdSubclass = selectedSrdSubclass?.classId === selectedSrdClass?.id ? selectedSrdSubclass : null;
            const selectedSrdSpecies = srdCharacterRules?.species?.[characterBuild?.speciesId]
                || srdCharacterRules?.getSpeciesForName?.(charInfo.race)
                || null;
            const selectedSrdBackground = srdCharacterRules?.backgrounds?.[characterBuild?.backgroundId]
                || srdCharacterRules?.getBackgroundForName?.(characterBuild?.backgroundName)
                || null;
            const speciesAbilityBonuses = characterBuild?.applySpeciesAbilityBonuses && selectedSrdSpecies
                ? selectedSrdSpecies.abilityBonuses || {}
                : {};
            const suggestedClassResources = getSuggestedClassResources({
                className: selectedSrdClass?.name || charInfo.cls,
                subclassName: activeSrdSubclass?.name || characterBuild?.subclassName,
                level: normalizedCharacterLevel,
                charismaModifier: Math.floor((((Number(stats?.car) || 0) + (Number(tempStats?.car) || 0) + (Number(speciesAbilityBonuses?.car) || 0)) - 10) / 2)
            });
            const speciesArmorClassBonus = Number(selectedSrdSpecies?.armorClassBonus) || 0;
            const automaticSavingThrows = selectedSrdClass?.savingThrows || [];
            const originSkillProficiencies = [...new Set([
                ...(selectedSrdSpecies?.skillProficiencies || []),
                ...(selectedSrdBackground?.skillProficiencies || [])
            ])];
            const selectedClassSkillChoices = (Array.isArray(characterBuild?.classSkillChoices) ? characterBuild.classSkillChoices : [])
                .filter(skillKey => !originSkillProficiencies.includes(skillKey));
            const automaticSkillProficiencies = [...new Set([
                ...originSkillProficiencies,
                ...selectedClassSkillChoices
            ])];
            const skillProficiencySources = [
                { label: `Especie: ${selectedSrdSpecies?.name || charInfo.race || 'Personalizada'}`, skills: selectedSrdSpecies?.skillProficiencies || [] },
                { label: `Trasfondo: ${selectedSrdBackground?.name || characterBuild?.backgroundName || 'Personalizado'}`, skills: selectedSrdBackground?.skillProficiencies || [] },
                { label: `Clase: ${selectedSrdClass?.name || charInfo.cls || 'Personalizada'}`, skills: selectedClassSkillChoices }
            ].filter(source => source.skills.length > 0);
            const automaticExpertiseLimit = Object.entries(selectedSrdClass?.expertiseLevels || {})
                .filter(([requiredLevel]) => normalizedCharacterLevel >= Number(requiredLevel))
                .reduce((total, [, amount]) => total + amount, 0);
            const automaticExpertiseChoices = (Array.isArray(characterBuild?.classExpertiseChoices) ? characterBuild.classExpertiseChoices : []).slice(0, automaticExpertiseLimit);
            const availableAutomaticRuleTraits = srdCharacterRules?.getFeaturesForBuild?.({
                classId: selectedSrdClass?.id,
                subclassId: activeSrdSubclass?.id,
                speciesId: selectedSrdSpecies?.id,
                level: normalizedCharacterLevel
            }) || [];
            const automaticRuleTraits = characterBuild?.autoFeatures !== false
                ? availableAutomaticRuleTraits
                : [];
            const selectedClassSkillChoiceCount = selectedClassSkillChoices.length;
            const requiredClassSkillChoices = Number(selectedSrdClass?.skillChoices?.count) || 0;
            const remainingClassSkillChoices = Math.max(0, requiredClassSkillChoices - selectedClassSkillChoiceCount);
            const selectedExpertiseChoiceCount = Array.isArray(characterBuild?.classExpertiseChoices)
                ? characterBuild.classExpertiseChoices.length
                : 0;
            const remainingExpertiseChoices = Math.max(0, automaticExpertiseLimit - selectedExpertiseChoiceCount);
            const lastReviewedLevel = Math.max(0, Math.min(20, Math.trunc(Number(characterBuild?.lastLevelReview) || 0)));
            const levelReviewTarget = pendingLevelChange?.target || normalizedCharacterLevel;
            const levelReviewStart = pendingLevelChange ? normalizedCharacterLevel : Math.min(lastReviewedLevel, normalizedCharacterLevel);
            const levelReviewDelta = Math.max(0, levelReviewTarget - levelReviewStart);
            const levelReviewExpertiseLimit = Object.entries(selectedSrdClass?.expertiseLevels || {}).filter(([requiredLevel]) => levelReviewTarget >= Number(requiredLevel)).reduce((total,[,amount]) => total + amount,0);
            const levelReviewRemainingExpertiseChoices = Math.max(0, levelReviewExpertiseLimit - selectedExpertiseChoiceCount);
            const previousProficiencyBonus = Math.ceil((Math.max(1, levelReviewStart) || 1) / 4) + 1;
            const levelReviewProficiencyBonus = Math.ceil(levelReviewTarget / 4) + 1;
            const proficiencyChanged = levelReviewStart === 0 || previousProficiencyBonus !== levelReviewProficiencyBonus;
            const levelReviewFeatureGroups = [
                { label: 'Especie', features: selectedSrdSpecies?.traits || [] },
                { label: 'Clase', features: selectedSrdClass?.features || [] },
                { label: 'Subclase', features: activeSrdSubclass?.features || [] }
            ].map(group => ({
                ...group,
                features: group.features.filter(feature => Number(feature.level) > levelReviewStart && Number(feature.level) <= levelReviewTarget)
            })).filter(group => group.features.length > 0);
            const abilityImprovementLevels = selectedSrdClass?.id === 'fighter'
                ? [4, 6, 8, 12, 14, 16, 19]
                : selectedSrdClass?.id === 'rogue'
                    ? [4, 8, 10, 12, 16, 19]
                    : [4, 8, 12, 16, 19];
            const levelReviewResourceSuggestions = getSuggestedClassResources({ className: selectedSrdClass?.name || charInfo.cls, subclassName: activeSrdSubclass?.name || characterBuild?.subclassName, level: levelReviewTarget, charismaModifier: Math.floor((((Number(stats?.car) || 0) + (Number(tempStats?.car) || 0) + (Number(speciesAbilityBonuses?.car) || 0)) - 10) / 2) });
            const pendingAbilityImprovementLevels = abilityImprovementLevels.filter(reviewLevel => reviewLevel > levelReviewStart && reviewLevel <= levelReviewTarget);
            const pendingResourceSuggestions = levelReviewResourceSuggestions.filter(suggestion => {
                const existing = resources.find(resource => suggestion.aliases.some(alias => normalizeRuleLookupText(alias) === normalizeRuleLookupText(resource.name)));
                return !existing || (existing.source === 'class-suggestion' && (Number(existing.max) !== Number(suggestion.max) || existing.type !== suggestion.type || existing.recoveryRest !== suggestion.recoveryRest));
            });
            const automaticMechanicalRules = srdCharacterRules?.getMechanicalRulesForBuild?.({
                classId: selectedSrdClass?.id,
                level: normalizedCharacterLevel
            }) || {};
            const displayedTraits = [
                ...automaticRuleTraits.map(trait => ({ ...trait, title: trait.name, automatic: true })),
                ...traits.map((trait, manualIndex) => ({ ...trait, id: `manual-trait-${manualIndex}`, manualIndex, automatic: false }))
            ];
            const hasSavingThrowProficiency = (statKey) => savingThrows.includes(statKey) || automaticSavingThrows.includes(statKey);
            const hasSkillProficiency = (skillKey) => proficiencies.proficient.includes(skillKey) || automaticSkillProficiencies.includes(skillKey) || proficiencies.expertise.includes(skillKey) || automaticExpertiseChoices.includes(skillKey);
            const hasSkillExpertise = (skillKey) => proficiencies.expertise.includes(skillKey) || automaticExpertiseChoices.includes(skillKey);
            const proficiencyCategoryLabels = {
                languages: 'Idiomas', weapons: 'Armas', armor: 'Armaduras y escudos', tools: 'Herramientas',
                instruments: 'Instrumentos', games: 'Juegos', vehicles: 'Vehículos', custom: 'Personalizadas'
            };
            useEffect(() => {
                const suggestions = getSrdProficiencySuggestions({ classId: selectedSrdClass?.id, speciesId: selectedSrdSpecies?.id, backgroundId: selectedSrdBackground?.id });
                setProficiencyEntries(previous => {
                    const current = Array.isArray(previous) ? previous : [];
                    const automatic = new Map(current.filter(entry => entry.autoKey).map(entry => [entry.autoKey, { ...entry, source: String(entry.source || '').replace(/\s*\(SRD\)/gi, '').trim() }]));
                    const next = [
                        ...current.filter(entry => !entry.autoKey),
                        ...suggestions.map(suggestion => {
                            const existing = automatic.get(suggestion.autoKey);
                            return {
                                ...suggestion,
                                ...(existing || {}),
                                id: suggestion.id,
                                autoKey: suggestion.autoKey,
                                name: existing?.nameEdited ? existing.name : suggestion.name,
                                source: existing?.sourceEdited ? existing.source : suggestion.source
                            };
                        })
                    ];
                    return JSON.stringify(current) === JSON.stringify(next) ? current : next;
                });
            }, [manager.activeCharacterId, selectedSrdClass?.id, selectedSrdSpecies?.id, selectedSrdBackground?.id]);
            const updateProficiencyEntry = (entryId, changes) => setProficiencyEntries(previous => (previous || []).map(entry => entry.id === entryId ? { ...entry, ...changes } : entry));
            const addProficiencyEntryToCategory = category => setProficiencyEntries(previous => [...(previous || []), { id: `prof_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, category, name: '', source: 'Personalizada', autoKey: '', hidden: false }]);
            const removeProficiencyEntry = entry => setProficiencyEntries(previous => entry.autoKey
                ? (previous || []).map(item => item.id === entry.id ? { ...item, hidden: true } : item)
                : (previous || []).filter(item => item.id !== entry.id));
            const getModNum = (scoreStr) => {
                const score = Number(scoreStr) || 0;
                return Math.floor((score - 10) / 2);
            };
            const getEffectiveStat = (statKey) => (Number(stats[statKey]) || 0) + (Number(tempStats[statKey]) || 0) + (Number(speciesAbilityBonuses[statKey]) || 0);
            const simplifyWeaponText = value => normalizeRuleLookupText(value).split(/\s+/).map(word => word.length > 4 && word.endsWith('les') ? word.slice(0, -2) : word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word).join(' ');
            const hasWeaponProficiency = (weaponName, weaponCategory = '') => {
                const visibleEntries = proficiencyEntries.filter(entry => entry.category === 'weapons' && !entry.hidden);
                const proficiencyText = simplifyWeaponText(visibleEntries.map(entry => entry.name).join(' · '));
                const normalizedName = simplifyWeaponText(weaponName);
                const normalizedCategory = simplifyWeaponText(weaponCategory);
                if (normalizedCategory.includes('arma sencilla') && proficiencyText.includes('arma sencilla')) return true;
                if (normalizedCategory.includes('arma marcial') && (proficiencyText.includes('arma marcial') || proficiencyText.includes('arma sencilla y marcial'))) return true;
                if (normalizedName && proficiencyText.includes(normalizedName)) return true;
                const classWeaponGroups = {
                    druid: ['bastón', 'cimitarra', 'daga', 'dardo', 'hoz', 'honda', 'jabalina', 'lanza', 'maza', 'porra'],
                    rogue: ['ballesta de mano', 'espada larga', 'estoque', 'espada corta'],
                    sorcerer: ['daga', 'dardo', 'honda', 'bastón', 'ballesta ligera'],
                    wizard: ['daga', 'dardo', 'honda', 'bastón', 'ballesta ligera']
                };
                const classId = selectedSrdClass?.id || normalizeRuleLookupText(charInfo.cls);
                return (classWeaponGroups[classId] || []).some(name => normalizedName.includes(simplifyWeaponText(name)));
            };
            const inferWeaponAbility = attack => {
                const rules = normalizeRuleLookupText(`${attack?.notes || ''} ${attack?.name || ''}`);
                if (rules.includes('sutil')) return 'finesse';
                if (rules.includes('municion') || rules.includes('ataque a distancia')) return 'des';
                return 'fue';
            };
            const srdWeaponCategories = {
                'daga': 'Arma sencilla', 'arco corto': 'Arma sencilla', 'ballesta ligera': 'Arma sencilla', 'hacha de mano': 'Arma sencilla', 'lanza': 'Arma sencilla',
                'espada corta': 'Arma marcial', 'espada larga': 'Arma marcial', 'arco largo': 'Arma marcial'
            };
            const getWeaponContext = (attack, weapon = null) => {
                const name = attack?.weaponName || weapon?.name || attack?.name || '';
                const normalizedName = normalizeRuleLookupText(name);
                const category = attack?.weaponCategory || Object.entries(srdWeaponCategories).find(([knownName]) => normalizedName.includes(knownName))?.[1] || '';
                return { name, category, automatic: attack?.autoAttack === true || (!String(attack?.atk || '').trim() && Boolean(category)) };
            };
            const getWeaponAttackAbility = attack => (attack?.attackAbility || inferWeaponAbility(attack)) === 'finesse'
                ? (getModNum(getEffectiveStat('des')) > getModNum(getEffectiveStat('fue')) ? 'des' : 'fue')
                : ((attack?.attackAbility || inferWeaponAbility(attack)) === 'des' ? 'des' : 'fue');
            const getWeaponAttackProficiency = (attack, weapon = null) => {
                const context = getWeaponContext(attack, weapon);
                return attack?.autoProficiency || (context.automatic && attack?.proficient === undefined)
                ? hasWeaponProficiency(context.name, context.category)
                : attack?.proficient === true;
            };
            const getWeaponAttackBonus = (attack, weapon = null) => {
                if (!getWeaponContext(attack, weapon).automatic) return attack?.atk || '';
                const ability = getWeaponAttackAbility(attack);
                const total = getModNum(getEffectiveStat(ability)) + (getWeaponAttackProficiency(attack, weapon) ? PROF_BONUS : 0) + (Number(attack.magicBonus) || 0);
                return formatMod(total);
            };
            const getWeaponAttackFormula = (attack, weapon = null) => {
                if (!getWeaponContext(attack, weapon).automatic) return '';
                const ability = getWeaponAttackAbility(attack);
                return `${ability === 'des' ? 'DES' : 'FUE'}${getWeaponAttackProficiency(attack, weapon) ? ' + competencia' : ' · sin competencia'}${Number(attack.magicBonus) ? ` +${Number(attack.magicBonus)} mágico` : ''}`;
            };
            const openAddWeaponAttack = () => {
                if (!selectedWeapon) return;
                const reference = selectedWeapon.attacks?.[0] || {};
                const context = getWeaponContext(reference, selectedWeapon);
                const attackAbility = reference.attackAbility || inferWeaponAbility({ name: selectedWeapon.name, notes: selectedWeapon.usesAmmo ? 'Munición' : '' });
                setAddModal({ isOpen: true, type: 'attack', data: { autoAttack: true, attackAbility, proficient: hasWeaponProficiency(context.name, context.category), autoProficiency: true, weaponName: selectedWeapon.name, weaponCategory: context.category, magicBonus: Number(reference.magicBonus) || 0 } });
            };
            const SPELLCASTING_ABILITIES = [
                ['fue', 'Fuerza'], ['des', 'Destreza'], ['con', 'Constitución'],
                ['int', 'Inteligencia'], ['sab', 'Sabiduría'], ['car', 'Carisma']
            ];
            const srdSpellcasting = window.DndSrdSpellcasting;
            const srdSpellcastingIdentity = activeSrdSubclass
                ? `${selectedSrdClass?.name || charInfo.cls} (${activeSrdSubclass.name})`
                : (selectedSrdClass?.name || charInfo.cls);
            const srdSpellcastingProfile = srdSpellcasting?.getProfileForClass?.(srdSpellcastingIdentity) || null;
            const srdSpellcastingLevel = Math.max(1, Math.min(20, Math.trunc(Number(level) || 1)));
            const spellcastingAbility = SPELLCASTING_ABILITIES.some(([key]) => key === grimoireConfig.spellcastingAbility)
                ? grimoireConfig.spellcastingAbility
                : '';
            const spellcastingAbilityName = SPELLCASTING_ABILITIES.find(([key]) => key === spellcastingAbility)?.[1] || '';
            const spellcastingModifier = spellcastingAbility ? getModNum(getEffectiveStat(spellcastingAbility)) : null;
            const spellSaveDc = spellcastingModifier === null ? null : 8 + PROF_BONUS + spellcastingModifier;
            const spellAttackBonus = spellcastingModifier === null ? null : PROF_BONUS + spellcastingModifier;
            const srdProfileModifier = srdSpellcastingProfile ? getModNum(getEffectiveStat(srdSpellcastingProfile.ability)) : 0;
            const srdAutoProfileKey = srdSpellcastingProfile
                ? `${srdSpellcastingProfile.id}:${srdSpellcastingLevel}:${srdProfileModifier}`
                : '';
            const srdProfileCantrips = srdSpellcastingProfile
                ? Number(srdSpellcasting.getProgressionValue(srdSpellcastingProfile.cantrips, srdSpellcastingLevel)) || 0
                : 0;
            const srdProfileKnownLimit = srdSpellcastingProfile?.mode.startsWith('known')
                ? Number(srdSpellcasting.getProgressionValue(srdSpellcastingProfile.known, srdSpellcastingLevel)) || 0
                : 0;
            const srdProfilePreparedLimit = srdSpellcastingProfile?.prepared === 'level-plus-modifier'
                ? Math.max(1, srdSpellcastingLevel + srdProfileModifier)
                : srdSpellcastingProfile?.prepared === 'half-level-plus-modifier'
                    ? Math.max(1, Math.floor(srdSpellcastingLevel / 2) + srdProfileModifier)
                    : 0;
            const srdProfileSlotValues = srdSpellcastingProfile
                ? srdSpellcasting.getProgressionValue(srdSpellcastingProfile.slotProgression, srdSpellcastingLevel)
                : [];
            const srdProfilePactValues = srdSpellcastingProfile?.pact
                ? srdSpellcasting.getProgressionValue(srdSpellcastingProfile.pact, srdSpellcastingLevel)
                : null;
            const srdProfileMaxSpellLevel = srdProfilePactValues
                ? Math.max(0, Number(srdProfilePactValues[1]) || 0)
                : (Array.isArray(srdProfileSlotValues) ? srdProfileSlotValues.length : 0);
            const srdProfileHasSpellcasting = srdProfileMaxSpellLevel > 0 || (
                srdSpellcastingProfile?.mode !== 'prepared'
                && (srdProfileCantrips > 0 || srdProfileKnownLimit > 0)
            );
            const getSpellProgressionAtLevel = reviewLevel => {
                if (!srdSpellcastingProfile || reviewLevel < 1) return { cantrips: 0, known: 0, prepared: 0, slots: [], pact: null };
                const cantrips = Number(srdSpellcasting.getProgressionValue(srdSpellcastingProfile.cantrips, reviewLevel)) || 0;
                const known = srdSpellcastingProfile.known ? Number(srdSpellcasting.getProgressionValue(srdSpellcastingProfile.known, reviewLevel)) || 0 : 0;
                const prepared = srdSpellcastingProfile.prepared === 'level-plus-modifier'
                    ? Math.max(1, reviewLevel + srdProfileModifier)
                    : srdSpellcastingProfile.prepared === 'half-level-plus-modifier'
                        ? Math.max(1, Math.floor(reviewLevel / 2) + srdProfileModifier)
                        : 0;
                return {
                    cantrips,
                    known,
                    prepared,
                    slots: srdSpellcastingProfile.slotProgression ? srdSpellcasting.getProgressionValue(srdSpellcastingProfile.slotProgression, reviewLevel) || [] : [],
                    pact: srdSpellcastingProfile.pact ? srdSpellcasting.getProgressionValue(srdSpellcastingProfile.pact, reviewLevel) || null : null
                };
            };
            const previousSpellProgression = getSpellProgressionAtLevel(levelReviewStart);
            const currentSpellProgression = getSpellProgressionAtLevel(levelReviewTarget);
            const spellSlotChanges = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(slotLevel => ({
                level: slotLevel,
                previous: Number(previousSpellProgression.slots?.[slotLevel - 1]) || 0,
                current: Number(currentSpellProgression.slots?.[slotLevel - 1]) || 0
            })).filter(slot => slot.previous !== slot.current);
            const levelReviewHasSpellcasting = currentSpellProgression.cantrips > 0 || currentSpellProgression.known > 0 || currentSpellProgression.prepared > 0 || currentSpellProgression.slots.some(Boolean) || Boolean(currentSpellProgression.pact);
            const levelReviewChecklist = [
                { key: 'proficiency', label: 'Bono de competencia' },
                { key: 'hit-points', label: 'Puntos de golpe y dados de golpe' },
                levelReviewFeatureGroups.length > 0 && { key: 'features', label: 'Rasgos nuevos' },
                pendingResourceSuggestions.length > 0 && { key: 'resources', label: 'Recursos y usos máximos' },
                levelReviewHasSpellcasting && { key: 'spellcasting', label: 'Ranuras y conjuros' },
                pendingAbilityImprovementLevels.length > 0 && { key: 'improvements', label: 'Mejora de característica o dote' },
                (remainingClassSkillChoices > 0 || levelReviewRemainingExpertiseChoices > 0) && { key: 'choices', label: 'Otras elecciones' }
            ].filter(Boolean);
            const levelReviewChecklistComplete = levelReviewChecklist.every(item => levelReviewChecks[item.key]);
            const usesSpellbook = !!srdSpellcastingProfile?.requiresSpellbook;
            const spellWorkflow = !srdProfileHasSpellcasting
                ? 'manual'
                : usesSpellbook
                    ? 'spellbook'
                    : srdSpellcastingProfile?.mode === 'prepared'
                        ? 'prepared'
                        : 'known';
            const spellWorkflowCopy = {
                prepared: {
                    ready: 'Conjuros listos',
                    collection: 'Preparados hoy',
                    compendium: 'Preparar conjuros',
                    action: 'Preparar',
                    added: 'Ya preparado',
                    description: `Elige hasta ${srdProfilePreparedLimit} conjuros de tu lista. Los concedidos por tu origen se preparan solos.`
                },
                spellbook: {
                    ready: 'Conjuros listos',
                    collection: 'Libro de conjuros',
                    compendium: 'Añadir al libro',
                    action: 'Añadir al libro',
                    added: 'Ya está en el libro',
                    description: `Añade conjuros a tu libro y prepara hasta ${srdProfilePreparedLimit} para hoy.`
                },
                known: {
                    ready: 'Conjuros listos',
                    collection: 'Conjuros aprendidos',
                    compendium: 'Aprender conjuros',
                    action: 'Aprender',
                    added: 'Ya aprendido',
                    description: `Aprende hasta ${srdProfileKnownLimit} conjuros. Los conjuros aprendidos están listos sin prepararlos.`
                },
                manual: {
                    ready: 'Conjuros listos',
                    collection: 'Mis conjuros',
                    compendium: 'Compendio Arcano',
                    action: 'Añadir al grimorio',
                    added: 'Ya añadido al grimorio',
                    description: 'Configura manualmente cómo funciona la magia de este personaje.'
                }
            }[spellWorkflow];
            const spellGuideProfile = spellWorkflow === 'prepared'
                ? {
                    title: 'Lanzador preparado',
                    explanation: `Tu clase puede conocer toda su lista, pero solo lleva preparados hasta ${srdProfilePreparedLimit} conjuros a la vez. En las reglas de 2014, normalmente cambias esa selección tras un descanso largo.`,
                    limitLabel: 'Límite preparado',
                    limitValue: srdProfilePreparedLimit,
                    recovery: 'Ranuras: descanso largo'
                }
                : spellWorkflow === 'spellbook'
                    ? {
                        title: 'Lanzador con libro',
                        explanation: `Tu grimorio tiene dos pasos: primero añades conjuros a tu libro; después preparas hasta ${srdProfilePreparedLimit} para usarlos hoy. Normalmente eliges los preparados tras un descanso largo.`,
                        limitLabel: 'Preparados hoy',
                        limitValue: srdProfilePreparedLimit,
                        recovery: 'Ranuras: descanso largo'
                    }
                    : spellWorkflow === 'known'
                        ? {
                            title: srdSpellcastingProfile?.mode === 'known-pact' ? 'Magia de pacto' : 'Lanzador de conjuros conocidos',
                            explanation: srdSpellcastingProfile?.mode === 'known-pact'
                                ? `Aprendes hasta ${srdProfileKnownLimit} conjuros y quedan listos sin preparación diaria. Tus ranuras de Magia de pacto se recuperan con un descanso corto o largo.`
                                : `Aprendes hasta ${srdProfileKnownLimit} conjuros y quedan listos sin preparación diaria. En las reglas de 2014, los eliges al subir de nivel, no cada descanso.`,
                            limitLabel: 'Conjuros aprendidos',
                            limitValue: srdProfileKnownLimit,
                            recovery: srdSpellcastingProfile?.mode === 'known-pact' ? 'Ranuras: descanso corto o largo' : 'Ranuras: descanso largo'
                        }
                        : {
                            title: 'Magia configurada manualmente',
                            explanation: 'No hay un perfil automático para esta clase o variante. Puedes usar el Grimorio igualmente, pero debes indicar tú los límites y las ranuras que correspondan.',
                            limitLabel: 'Perfil',
                            limitValue: 'Manual',
                            recovery: 'Recuperación: configúrala según tu mesa'
                        };
            const spellGuideSteps = spellWorkflow === 'prepared'
                ? [
                    ['Comprueba tu perfil', 'Toca Configuración de lanzamiento para revisar la característica de lanzamiento, la CD y el límite que calcula la ficha para tu personaje.'],
                    ['Busca en el compendio', `Abre ${spellWorkflowCopy.compendium}. La biblioteca ya filtra los conjuros que puede usar tu clase y nivel; toca Preparar en los que quieras usar.`],
                    ['Organiza el día', `En ${spellWorkflowCopy.collection} puedes ver qué conjuros cuentan para tu límite. Los concedidos por raza, clase o subclase aparecen solos cuando corresponden.`],
                    ['Lanza durante la partida', 'Vuelve a Conjuros listos y toca Lanzar. Elige una ranura disponible de nivel igual o superior; la ficha la descuenta, pero tú sigues tirando los dados en la mesa.']
                ]
                : spellWorkflow === 'spellbook'
                    ? [
                        ['Comprueba tu perfil', 'Toca Configuración de lanzamiento para revisar tu característica, CD, ataque de conjuro y el número de conjuros que puedes preparar.'],
                        ['Añade al libro', `Abre ${spellWorkflowCopy.compendium}, consulta un conjuro si tienes dudas y toca Añadir al libro. Esto lo guarda en ${spellWorkflowCopy.collection}; todavía no significa que esté listo para lanzar.`],
                        ['Prepara los de hoy', `Abre ${spellWorkflowCopy.collection} y toca Preparar en los conjuros que quieras llevar. Solo los preparados aparecerán en Conjuros listos.`],
                        ['Lanza durante la partida', 'Desde Conjuros listos toca Lanzar y selecciona una ranura válida. Los trucos no gastan ranuras y los dados se tiran físicamente en vuestra mesa.']
                    ]
                    : spellWorkflow === 'known'
                        ? [
                            ['Comprueba tu perfil', 'Toca Configuración de lanzamiento para revisar tu característica, CD, ataque de conjuro y el máximo que la ficha calcula para esta clase y nivel.'],
                            ['Aprende un conjuro', `Abre ${spellWorkflowCopy.compendium}, consulta su ficha y toca ${spellWorkflowCopy.action}. Así pasa a ${spellWorkflowCopy.collection}.`],
                            ['No hace falta preparar', `Todo lo que figure en ${spellWorkflowCopy.collection} aparece también en Conjuros listos. La ficha separa ambas vistas para que puedas organizarte sin perder nada.`],
                            ['Lanza durante la partida', 'Toca Lanzar junto al conjuro. Si no es un truco, elige una ranura válida; la ficha solo registra el gasto, no sustituye las tiradas de dados.']
                        ]
                        : [
                            ['Configura primero', 'Abre Configuración de lanzamiento e indica la característica, los límites y las ranuras que usa este personaje o clase personalizada.'],
                            ['Añade conjuros', 'Usa el Compendio Arcano para buscar y consultar conjuros del catálogo, o + Conjuro para crear uno manualmente.'],
                            ['Organiza la ficha', 'Mis conjuros contiene todo lo añadido. Marca como preparado, conocido o favorito solo si la regla de tu personaje lo necesita.'],
                            ['Lanza durante la partida', 'En Conjuros listos toca Lanzar y ajusta las ranuras disponibles. Los trucos no gastan ranuras.']
                        ];

            useEffect(() => {
                if (!selectedSrdClass || !characterBuild?.autoHitDie) return;
                setHitDice(previous => previous?.type === selectedSrdClass.hitDie
                    ? previous
                    : { ...previous, type: selectedSrdClass.hitDie });
            }, [selectedSrdClass?.id, selectedSrdClass?.hitDie, characterBuild?.autoHitDie]);

            useEffect(() => {
                if (!selectedSrdSpecies || !characterBuild?.autoSpeedAndSize) return;
                const nextSpeed = String(selectedSrdSpecies.speed || '');
                setSpeed(previous => String(previous) === nextSpeed ? previous : nextSpeed);
                setSize(previous => String(previous) === selectedSrdSpecies.size ? previous : selectedSrdSpecies.size);
            }, [selectedSrdSpecies?.id, selectedSrdSpecies?.speed, selectedSrdSpecies?.size, characterBuild?.autoSpeedAndSize]);

            useEffect(() => {
                if (!srdSpellcastingProfile || !srdAutoProfileKey) return;
                const profileChanged = String(grimoireConfig.srdProfileKey || '').split(':')[0] !== srdSpellcastingProfile.id;
                if (grimoireConfig.srdProfileKey === srdAutoProfileKey) return;

                const nextSlotValues = Array.isArray(srdProfileSlotValues) ? srdProfileSlotValues : [];
                setSpellSlots(previous => Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map(slotLevel => {
                    const prior = previous?.[slotLevel] || { current: 0, max: 0 };
                    const priorMax = Math.max(0, Number(prior.max) || 0);
                    const priorCurrent = Math.max(0, Number(prior.current) || 0);
                    const nextMax = Math.max(0, Number(nextSlotValues[slotLevel - 1]) || 0);
                    const nextCurrent = profileChanged || priorMax === 0 || priorCurrent >= priorMax
                        ? nextMax
                        : Math.min(priorCurrent, nextMax);
                    return [slotLevel, { current: nextCurrent, max: nextMax }];
                })));

                setGrimoireConfig(previous => {
                    const pactMax = Math.max(0, Number(srdProfilePactValues?.[0]) || 0);
                    const pactLevel = Math.max(1, Number(srdProfilePactValues?.[1]) || 1);
                    const priorPact = previous.pactSlots || { current: 0, max: 0, level: 1 };
                    const priorPactMax = Math.max(0, Number(priorPact.max) || 0);
                    const priorPactCurrent = Math.max(0, Number(priorPact.current) || 0);
                    const pactCurrent = profileChanged || priorPactMax === 0 || priorPactCurrent >= priorPactMax
                        ? pactMax
                        : Math.min(priorPactCurrent, pactMax);
                    const hasSrdSpellcasting = nextSlotValues.length > 0 || pactMax > 0 || (
                        srdSpellcastingProfile.mode !== 'prepared'
                        && (srdProfileCantrips > 0 || srdProfileKnownLimit > 0)
                    );
                    const isKnown = srdSpellcastingProfile.mode.startsWith('known') && hasSrdSpellcasting;
                    const isPrepared = srdSpellcastingProfile.mode === 'prepared' && hasSrdSpellcasting;
                    return {
                        ...previous,
                        srdProfileKey: srdAutoProfileKey,
                        spellcastingAbility: srdSpellcastingProfile.ability,
                        useKnownLimit: isKnown,
                        knownLimit: isKnown ? String(srdProfileKnownLimit) : '',
                        usePrepared: isPrepared,
                        preparedLimit: isPrepared ? String(srdProfilePreparedLimit) : '',
                        useCantripLimit: srdProfileCantrips > 0,
                        cantripLimit: srdProfileCantrips > 0 ? String(srdProfileCantrips) : '',
                        usePactMagic: srdSpellcastingProfile.mode === 'known-pact' && pactMax > 0,
                        pactSlots: { current: pactCurrent, max: pactMax, level: pactLevel }
                    };
                });
            }, [grimoireConfig.srdProfileKey, srdSpellcastingProfile?.id, srdAutoProfileKey, srdProfileCantrips, srdProfileKnownLimit, srdProfilePreparedLimit, srdProfileSlotValues, srdProfilePactValues]);
            const getSpellResolution = (spell) => {
                const description = String(spell?.description || '');
                const normalizedSavingAbility = String(spell?.savingAbility || '').trim();
                const saveMatch = description.match(/tirada de salvación de (Fuerza|Destreza|Constitución|Inteligencia|Sabiduría|Carisma)/i);
                return {
                    usesSpellAttack: !!spell?.attackBonus || /ataque de conjuro/i.test(description),
                    savingAbility: normalizedSavingAbility || saveMatch?.[1] || ''
                };
            };
            
            const formatMod = (mod) => (mod >= 0 ? `+${mod}` : mod);
            
            const getPassivePerception = () => {
                const isExp = hasSkillExpertise('percepcion');
                const isProf = hasSkillProficiency('percepcion');
                const baseMod = getModNum(getEffectiveStat('sab'));
                const totalMod = baseMod + (isExp ? PROF_BONUS * 2 : isProf ? PROF_BONUS : 0);
                return 10 + totalMod;
            };

            const getAcBreakdown = () => {
                const equippedArmor = armors.find(a => a.equipped && a.type !== 'shield');
                const equippedShield = armors.find(a => a.equipped && a.type === 'shield');
                const unarmoredDefense = automaticMechanicalRules.unarmoredDefense;
                let armorBase = 10;
                let dexLimit = Infinity;
                if (equippedArmor) {
                    armorBase = Number(equippedArmor.ac) || 0;
                    if (equippedArmor.type === 'medium') dexLimit = 2;
                    if (equippedArmor.type === 'heavy') dexLimit = 0;
                }
                let dexMod = getModNum(getEffectiveStat('des'));
                dexMod = Math.min(dexMod, dexLimit);
                const canUseUnarmoredDefense = !equippedArmor
                    && !!unarmoredDefense
                    && (unarmoredDefense.allowsShield || !equippedShield);
                const unarmoredBonus = canUseUnarmoredDefense
                    ? getModNum(getEffectiveStat(unarmoredDefense.ability))
                    : 0;
                const shieldBonus = equippedShield ? (Number(equippedShield.ac) || 2) : 0;
                return {
                    armor: equippedArmor,
                    shield: equippedShield,
                    armorBase,
                    dexApplied: dexMod,
                    shieldBonus,
                    unarmoredBonus,
                    unarmoredLabel: canUseUnarmoredDefense ? unarmoredDefense.label : '',
                    speciesBonus: speciesArmorClassBonus,
                    temporary: Number(miscAc) || 0
                };
            };

            const calculateBaseAC = () => {
                const breakdown = getAcBreakdown();
                return breakdown.armorBase + breakdown.dexApplied + breakdown.shieldBonus + breakdown.unarmoredBonus;
            };

            const calculateAC = () => calculateBaseAC() + speciesArmorClassBonus + (Number(miscAc) || 0);

            const stealthDisadvantageArmor = armors.find(a => a.equipped && a.stealthDis);
            const isStealthDisadvantaged = !!stealthDisadvantageArmor;

            // Funciones de interacción rápida
            const toggleSavingThrow = (statKey) => {
                if (savingThrows.includes(statKey)) {
                    setSavingThrows(prev => prev.filter(save => save !== statKey));
                    return;
                }
                if (automaticSavingThrows.includes(statKey)) {
                    showAlert(`La salvación de ${SPELLCASTING_ABILITIES.find(([key]) => key === statKey)?.[1] || statKey.toUpperCase()} ya está concedida por la construcción del personaje.`);
                    return;
                }
                const abilityName = SPELLCASTING_ABILITIES.find(([key]) => key === statKey)?.[1] || statKey.toUpperCase();
                setConfirmDialog({
                    isOpen: true,
                    message: `¿Marcar competencia en la salvación de ${abilityName}?`,
                    onConfirm: () => setSavingThrows(prev => prev.includes(statKey) ? prev : [...prev, statKey]),
                    isAlert: false,
                    confirmLabel: 'Activar salvación',
                    confirmTone: 'primary'
                });
            };

            const toggleArmorEquip = (id) => {
                setArmors(prev => prev.map(a => {
                    if (a.id === id) {
                        const targetArmor = armors.find(arm => arm.id === id);
                        if (!targetArmor.equipped && targetArmor.type !== 'shield') {
                            return { ...a, equipped: true };
                        }
                        return { ...a, equipped: !a.equipped };
                    }
                    if (armors.find(arm => arm.id === id && !arm.equipped && arm.type !== 'shield')) {
                         if (a.type !== 'shield') return { ...a, equipped: false };
                    }
                    return a;
                }));
            };

            const updateSkillProficiency = (level) => {
                const { skillKey } = skillModal;
                setProficiencies(prev => {
                    const newExp = prev.expertise.filter(k => k !== skillKey);
                    const newProf = prev.proficient.filter(k => k !== skillKey);
                    if (level === 'expertise') newExp.push(skillKey);
                    if (level === 'proficient') newProf.push(skillKey);
                    return { expertise: newExp, proficient: newProf };
                });
                setSkillModal({ isOpen: false, skillKey: null, skillName: "" });
            };

            const confirmDelete = (message, action) => {
                const isOnlineEnemyDeletion = typeof message === 'string' && message.startsWith('¿Eliminar a ');
                if (isOnlineEnemyDeletion) {
                    console.log('[DeleteEnemyUI] click', {
                        enemyId: selectedCombatantId,
                        selectedCombatantId,
                        isMaster: isCurrentRoomMaster
                    });
                }
                setConfirmDialog({
                    isOpen: true,
                    message: isOnlineEnemyDeletion ? `${message.replace(/\?$/, '')}? Se eliminará del encuentro y de la sala.` : message,
                    onConfirm: action,
                    isAlert: false,
                    confirmLabel: 'Eliminar',
                    confirmTone: 'danger'
                });
            };
            const showAlert = (message) => setConfirmDialog({ isOpen: true, message, onConfirm: null, isAlert: true, confirmLabel: 'Entendido', confirmTone: 'primary' });
            const closeConfirm = () => setConfirmDialog({ isOpen: false, message: "", onConfirm: null, isAlert: false, confirmLabel: 'Eliminar', confirmTone: 'danger' });

            const ONLINE_ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
            const normalizeRoomCode = (value) => String(value || '').toUpperCase().replace(/\s+/g, '').replace(/[^A-HJ-KM-NP-Z2-9]/g, '').slice(0, 6);
            const generateRoomCode = () => Array.from({ length: 6 }, () => ONLINE_ROOM_ALPHABET[Math.floor(Math.random() * ONLINE_ROOM_ALPHABET.length)]).join('');
            // Connection gate: local sheet remains usable when Firebase is unavailable.
            const getOnlineServices = () => {
                if (!onlineStatus || !firebaseReady || !firebaseUser?.uid || !window.firebaseServices?.firestore || !window.firebaseFirestore) throw new Error('No hay conexión con Firebase.');
                return { db: window.firebaseServices.firestore, api: window.firebaseFirestore, uid: firebaseUser.uid };
            };
            // Central cleanup prevents duplicate Firestore listeners across room changes and reconnects.
            const cleanupOnlineTableListeners = () => {
                roomListenersRef.current.room?.();
                roomListenersRef.current.members?.();
                roomListenersRef.current.participants?.();
                roomListenersRef.current.publicCombatants?.();
                roomListenersRef.current.privateEnemies?.();
                roomListenersRef.current.publicEffects?.();
                roomListenersRef.current.privateEffects?.();
                roomListenersRef.current = { code: null, room: null, members: null, participants: null, publicCombatants: null, privateEnemies: null, publicEffects: null, privateEffects: null };
            };
            const saveOnlineRoomSession = (room) => {
                setLastOnlineRoom(room);
                try {
                    if (room) window.localStorage.setItem(ONLINE_TABLE_STORAGE_KEY, JSON.stringify({ currentRoomCode: room.code, currentRoomRole: room.role, sharedCharacterId: room.sharedCharacterId || null }));
                    else window.localStorage.removeItem(ONLINE_TABLE_STORAGE_KEY);
                } catch (error) {}
            };
            // One listener per room source; previous subscriptions are always cleared first.
            const attachRoomListeners = (code, role) => {
                const { db, api } = getOnlineServices();
                cleanupOnlineTableListeners();
                roomListenersRef.current.code = code;
                setCurrentRoom({ code, role });
                setRoomData(null);
                setRoomMembers([]);
                setRoomParticipants([]);
                setPublicCombatants([]);
                setPrivateEnemies([]);
                setPublicEffects([]);
                setPrivateEffects([]);
                setParticipantsHavePendingWrites(false);
                setSharedCharacterId(null);
                setShareCharacterOpen(false);
                roomListenersRef.current.room = api.onSnapshot(api.doc(db, 'rooms', code), snapshot => {
                    if (!snapshot.exists()) {
                        setOnlineTableError('Sala no encontrada.');
                        setRoomData(null);
                        return;
                    }
                    const nextRoom = { id: snapshot.id, ...snapshot.data() };
                    setRoomData(nextRoom);
                    if (nextRoom.ownerUid === firebaseUser?.uid && !roomListenersRef.current.privateEnemies && roomListenersRef.current.code === code) {
                        roomListenersRef.current.privateEnemies = api.onSnapshot(api.collection(db, 'rooms', code, 'privateEnemies'), privateSnapshot => {
                            setPrivateEnemies(privateSnapshot.docs.map(enemy => ({ id: enemy.id, ...enemy.data() })));
                        }, error => setOnlineTableError('No se pudo recibir los datos privados de enemigos.'));
                        roomListenersRef.current.privateEffects = api.onSnapshot(api.collection(db, 'rooms', code, 'effectsPrivate'), effectSnapshot => {
                            setPrivateEffects(effectSnapshot.docs.map(effect => ({ id: effect.id, ...effect.data() })));
                        }, error => setOnlineTableError('No se pudo recibir los efectos privados.'));
                    }
                    if (nextRoom.status === 'closed' && roomListenersRef.current.code === code) {
                        saveOnlineRoomSession(null);
                        setOnlineTableNotice('La sala anterior fue cerrada.');
                        cleanupOnlineTableListeners();
                    }
                }, error => {
                    setRoomData(null);
                    setOnlineTableError('No se pudo recibir el estado del encuentro.');
                });
                roomListenersRef.current.members = api.onSnapshot(api.collection(db, 'rooms', code, 'members'), snapshot => {
                    setRoomMembers(snapshot.docs.map(member => ({ id: member.id, ...member.data() })).sort((a, b) => (a.role === 'master' ? -1 : b.role === 'master' ? 1 : String(a.displayName).localeCompare(String(b.displayName)))));
                }, error => setOnlineTableError('No se pudo escuchar a los miembros de la sala.'));
                roomListenersRef.current.participants = api.onSnapshot(api.collection(db, 'rooms', code, 'participants'), snapshot => {
                    setRoomParticipants(snapshot.docs.map(participant => ({ id: participant.id, ...participant.data() })));
                    setParticipantsHavePendingWrites(!!snapshot.metadata?.hasPendingWrites);
                }, error => setOnlineTableError('No se pudo escuchar a los personajes compartidos.'));
                roomListenersRef.current.publicCombatants = api.onSnapshot(api.collection(db, 'rooms', code, 'publicCombatants'), snapshot => {
                    setPublicCombatants(snapshot.docs.map(enemy => ({ id: enemy.id, ...enemy.data() })).sort((a, b) => Number(a.orderCreated || 0) - Number(b.orderCreated || 0)));
                }, error => setOnlineTableError('No se pudo escuchar a los enemigos del encuentro.'));
                roomListenersRef.current.publicEffects = api.onSnapshot(api.collection(db, 'rooms', code, 'effectsPublic'), snapshot => {
                    setPublicEffects(snapshot.docs.map(effect => ({ id: effect.id, ...effect.data() })));
                }, error => setOnlineTableError('No se pudo escuchar los efectos del encuentro.'));
            };
            const getLocalCharacter = (characterId) => {
                if (characterId === null || characterId === undefined) return null;
                return manager.characters[characterId] || Object.values(manager.characters).find(character => String(character.meta?.id) === String(characterId)) || null;
            };
            const buildPublicParticipant = (character, avatarDataUrl = '') => ({
                characterId: character.meta.id,
                name: character.data.charInfo?.name || character.meta.name || 'Personaje sin nombre',
                className: character.data.charInfo?.cls || '',
                level: character.data.level || '1',
                currentHp: Math.max(0, Number(character.data.hp?.current) || 0),
                maxHp: Math.max(0, Number(character.data.hp?.max) || 0),
                tempHp: Math.max(0, Number(character.data.hp?.temp) || 0),
                armorClass: calculateCharacterArmorClass(character.data),
                conditions: Array.isArray(character.data.conditions) ? character.data.conditions : [],
                avatarDataUrl,
                connected: true
            });
            const resolveRoomMembership = async (code, allowNewMember) => {
                const { db, api, uid } = getOnlineServices();
                const roomRef = api.doc(db, 'rooms', code);
                const roomSnapshot = await api.getDoc(roomRef);
                if (!roomSnapshot.exists()) throw new Error('ROOM_NOT_FOUND');
                const room = roomSnapshot.data();
                if (room.status === 'closed') throw new Error('ROOM_CLOSED');
                const memberRef = api.doc(db, 'rooms', code, 'members', uid);
                const memberSnapshot = await api.getDoc(memberRef);
                let role;
                if (memberSnapshot.exists()) {
                    role = memberSnapshot.data().role;
                    if (!['master', 'player'].includes(role)) throw new Error('INVALID_MEMBERSHIP');
                    const reconnectPayload = { active: true, lastSeen: api.serverTimestamp() };
                    console.log('[Mesa] Escritura member:', { operation: 'reconnect-member', roomCode: code, uid, payload: reconnectPayload });
                    try {
                        await api.updateDoc(memberRef, reconnectPayload);
                    } catch (error) {
                        console.error('[Mesa] Error member:', error.code, error.message, error);
                        throw error;
                    }
                } else {
                    if (!allowNewMember) throw new Error('MEMBER_NOT_FOUND');
                    role = 'player';
                    const createPayload = { uid, role: 'player', displayName: 'Jugador', active: true, joinedAt: api.serverTimestamp(), lastSeen: api.serverTimestamp() };
                    console.log('[Mesa] Escritura member:', { operation: 'create-member', roomCode: code, uid, payload: createPayload });
                    try {
                        await api.setDoc(memberRef, createPayload);
                    } catch (error) {
                        console.error('[Mesa] Error member:', error.code, error.message, error);
                        throw error;
                    }
                }
                const participantRef = api.doc(db, 'rooms', code, 'participants', uid);
                const participantSnapshot = await api.getDoc(participantRef);
                let sharedId = null;
                let needsCharacterSelection = false;
                if (participantSnapshot.exists()) {
                    const participant = participantSnapshot.data();
                    if (participant.ownerUid !== uid) throw new Error('OWNER_MISMATCH');
                    await api.updateDoc(participantRef, { connected: true, updatedAt: api.serverTimestamp() });
                    if (getLocalCharacter(participant.characterId)) sharedId = participant.characterId;
                    else needsCharacterSelection = role !== 'master';
                } else {
                    needsCharacterSelection = role !== 'master';
                }
                return { room, role, sharedId, needsCharacterSelection };
            };
            const activateRoomSession = (code, membership) => {
                attachRoomListeners(code, membership.role);
                setSharedCharacterId(membership.sharedId);
                setShareCharacterOpen(membership.needsCharacterSelection);
                saveOnlineRoomSession({ code, role: membership.role, sharedCharacterId: membership.sharedId });
                setOnlineTableScreen('lobby');
            };
            const shareLocalCharacter = async (characterId) => {
                const character = getLocalCharacter(characterId);
                if (!character) { setOnlineTableError('No se encontró el personaje local.'); return; }
                if (!currentRoom) { setOnlineTableError('No hay una sala activa.'); return; }
                try {
                    const { db, api, uid } = getOnlineServices();
                    setSharingCharacter(true);
                    setOnlineTableError('');
                    const participantRef = api.doc(db, 'rooms', currentRoom.code, 'participants', uid);
                    const existing = await api.getDoc(participantRef);
                    if (existing.exists() && existing.data().ownerUid !== uid) throw new Error('OWNER_MISMATCH');
                    const previousInitiative = existing.exists() && hasInitiativeValue(existing.data().initiative) ? Number(existing.data().initiative) : null;
                    let avatarDataUrl = '';
                    try {
                        avatarDataUrl = await createSharedAvatar(character.meta?.portrait || '');
                    } catch (avatarError) {
                        setOnlineTableNotice('Personaje compartido sin retrato.');
                    }
                    const normalizeFiniteNumber = (value, fallback = 0) => {
                        const parsed = Number(value);
                        return Number.isFinite(parsed) ? parsed : fallback;
                    };
                    const rawLevel = character.data?.level;
                    const rawCurrentHp = character.data?.hp?.current;
                    const rawMaxHp = character.data?.hp?.max;
                    const rawTempHp = character.data?.hp?.temp;
                    const rawArmorClass = calculateCharacterArmorClass(character.data);
                    const rawInitiative = previousInitiative;
                    const normalizedLevel = Math.max(1, Math.trunc(normalizeFiniteNumber(rawLevel, 1)));
                    const normalizedMaxHp = Math.max(0, normalizeFiniteNumber(rawMaxHp, 0));
                    const normalizedCurrentHp = Math.min(normalizedMaxHp, Math.max(0, normalizeFiniteNumber(rawCurrentHp, normalizedMaxHp)));
                    const normalizedTempHp = Math.max(0, normalizeFiniteNumber(rawTempHp, 0));
                    const normalizedArmorClass = Math.max(0, normalizeFiniteNumber(rawArmorClass, 0));
                    const normalizedInitiative = rawInitiative === null || rawInitiative === undefined || rawInitiative === '' ? null : normalizeFiniteNumber(rawInitiative, 0);
                    const participantPayload = {
                        id: String(uid),
                        ownerUid: String(uid),
                        type: 'player',
                        characterId: String(character.meta?.id || characterId || ''),
                        name: String(character.data?.charInfo?.name || character.meta?.name || 'Personaje sin nombre'),
                        className: String(character.data?.charInfo?.cls || ''),
                        level: normalizedLevel,
                        currentHp: normalizedCurrentHp,
                        maxHp: normalizedMaxHp,
                        tempHp: normalizedTempHp,
                        armorClass: normalizedArmorClass,
                        initiative: normalizedInitiative,
                        conditions: Array.isArray(character.data?.conditions) ? normalizeOnlineConditions(character.data.conditions) : [],
                        connected: true,
                        updatedAt: api.serverTimestamp(),
                        lastUpdatedBy: String(uid),
                        updateSource: 'share-character'
                    };
                    if (avatarDataUrl && avatarDataUrl.length <= MAX_SHARED_AVATAR_DATA_URL_LENGTH && isValidPortraitDataUrl(avatarDataUrl)) {
                        participantPayload.avatarDataUrl = avatarDataUrl;
                    }
                    if (!existing.exists()) participantPayload.joinedAt = api.serverTimestamp();
                    await api.setDoc(participantRef, participantPayload, { merge: true });
                    setSharedCharacterId(characterId);
                    setShareCharacterOpen(false);
                    saveOnlineRoomSession({ code: currentRoom.code, role: currentRoom.role, sharedCharacterId: characterId });
                    setOnlineTableNotice('Personaje compartido.');
                } catch (error) {
                    console.error('[ShareCharacter] error real', error);
                    setOnlineTableError('No se pudo compartir el personaje.');
                } finally {
                    setSharingCharacter(false);
                }
            };
            const updateSharedCharacter = () => {
                if (!sharedCharacterId || !getLocalCharacter(sharedCharacterId)) {
                    setOnlineTableError('No se encontró el personaje local.');
                    setShareCharacterOpen(true);
                    return;
                }
                shareLocalCharacter(sharedCharacterId);
            };
            const openCharacterSelector = () => {
                setOnlineTableError('');
                setOnlineTableNotice('');
                setShareCharacterOpen(true);
            };
            const updateParticipantInitiative = async (participant, rawValue) => {
                if (!currentRoom || !participant || (!isCurrentRoomMaster && participant.ownerUid !== firebaseUser?.uid)) return false;
                const value = String(rawValue).trim() === '' ? null : Number(rawValue);
                if (value !== null && !Number.isFinite(value)) return false;
                try {
                    const { db, api } = getOnlineServices();
                    await api.updateDoc(api.doc(db, 'rooms', currentRoom.code, 'participants', participant.id), { initiative: value, updatedAt: api.serverTimestamp() });
                    return true;
                } catch (error) {
                    setOnlineTableError('No se pudo actualizar la iniciativa.');
                    return false;
                }
            };
            const commitParticipantInitiative = async (participant) => {
                const draft = participantInitiativeDrafts[participant.id];
                if (draft === undefined) return;
                if (await updateParticipantInitiative(participant, draft)) {
                    setParticipantInitiativeDrafts(previous => {
                        const next = { ...previous };
                        delete next[participant.id];
                        return next;
                    });
                }
            };
            const getHpHash = (value, fallback) => { const hpValues = getHpValues(value, fallback); return `${hpValues.currentHp}/${hpValues.maxHp}/${hpValues.tempHp}`; };
            const getHpSyncKey = (roomCode, ownerUid, characterId) => `${roomCode}:${ownerUid}:${characterId}`;
            const getPendingHpSync = (key, roomCode, ownerUid, characterId) => {
                const pending = pendingHpSyncRef.current[key];
                return pending && pending.roomCode === roomCode && pending.ownerUid === ownerUid && pending.characterId === characterId ? pending : null;
            };
            const markPendingHpSync = (key, roomCode, ownerUid, characterId, values, status = 'pending') => {
                const pending = { roomCode, ownerUid, characterId, ...getHpValues(values), createdAt: Date.now(), status };
                pendingHpSyncRef.current[key] = pending;
                setPendingHpSync(previous => ({ ...previous, [key]: pending }));
                return pending;
            };
            const clearPendingHpSync = (key) => {
                if (!pendingHpSyncRef.current[key]) return;
                delete pendingHpSyncRef.current[key];
                setPendingHpSync(previous => { const next = { ...previous }; delete next[key]; return next; });
            };
            const isHpNetworkError = (error) => ['unavailable', 'deadline-exceeded', 'network-request-failed'].includes(error?.code);
            const scheduleHpConfirmation = (key, roomCode, ownerUid, characterId, values) => {
                if (hpConfirmTimerRef.current) window.clearTimeout(hpConfirmTimerRef.current);
                const hash = getHpHash(values);
                hpConfirmTimerRef.current = window.setTimeout(() => {
                    if (lastSentHpPayloadRef.current?.key !== key || lastSentHpPayloadRef.current?.hash !== hash) return;
                    markPendingHpSync(key, roomCode, ownerUid, characterId, values, 'failed');
                    setHpSyncStatus('failed');
                }, 5000);
            };
            // HP writes use a minimal payload and never replace participant documents.
            const updateParticipantHp = async (participant, changes, source) => {
                if (!currentRoom || !participant) throw new Error('NO_ACTIVE_ROOM');
                const isMasterWriter = roomData?.ownerUid === firebaseUser?.uid;
                if (!isMasterWriter && participant.ownerUid !== firebaseUser?.uid) throw new Error('HP_PERMISSION_DENIED');
                const current = getHpValues(participant);
                const maxHp = changes.maxHp === undefined ? current.maxHp : normalizeHpValue(changes.maxHp, current.maxHp);
                const next = {
                    currentHp: Math.max(0, Math.min(maxHp, changes.currentHp === undefined ? current.currentHp : normalizeHpValue(changes.currentHp, current.currentHp))),
                    maxHp,
                    tempHp: Math.max(0, changes.tempHp === undefined ? current.tempHp : normalizeHpValue(changes.tempHp, current.tempHp))
                };
                const { db, api } = getOnlineServices();
                const payload = { currentHp: next.currentHp, tempHp: next.tempHp, updatedAt: api.serverTimestamp(), lastUpdatedBy: firebaseUser.uid, updateSource: isMasterWriter ? 'master' : source };
                if (changes.maxHp !== undefined) payload.maxHp = next.maxHp;
                try {
                    if (isMasterWriter) {
                        console.log('[Mesa] Payload HP del máster:', payload);
                        console.log('[Mesa] Participante destino:', { roomCode: currentRoom.code, participantId: participant.id, masterUid: firebaseUser.uid, roomOwnerUid: roomData?.ownerUid });
                    }
                    await api.updateDoc(api.doc(db, 'rooms', currentRoom.code, 'participants', participant.id), payload);
                } catch (error) {
                    console.error('[Mesa] Error actualizando vida:', { code: error.code, message: error.message, roomCode: currentRoom.code, participantId: participant.id, payload });
                    throw error;
                }
                return next;
            };
            const openParticipantHpModal = (participant) => setHpModal({ isOpen: true, participantId: participant.id, mode: 'damage', amount: '' });
            const applyParticipantHpModal = async () => {
                const participant = roomParticipants.find(item => item.id === hpModal.participantId);
                const amount = Math.max(0, Number(hpModal.amount) || 0);
                if (!participant) return;
                const current = getHpValues(participant);
                let changes = {};
                if (hpModal.mode === 'damage') {
                    const absorbed = Math.min(current.tempHp, amount);
                    changes = { tempHp: current.tempHp - absorbed, currentHp: Math.max(0, current.currentHp - (amount - absorbed)) };
                } else if (hpModal.mode === 'healing') changes = { currentHp: Math.min(current.maxHp, current.currentHp + amount) };
                else if (hpModal.mode === 'temp') changes = { tempHp: amount };
                else changes = { currentHp: Math.min(current.maxHp, amount) };
                try {
                    setOnlineTableBusy(true);
                    await updateParticipantHp(participant, changes, isCurrentRoomMaster ? 'master' : 'player');
                    setHpModal({ isOpen: false, participantId: null, mode: 'damage', amount: '' });
                } catch (error) {
                    setOnlineTableError('No se pudo actualizar la vida en la mesa.');
                } finally {
                    setOnlineTableBusy(false);
                }
            };
            const useRemoteHpConflict = () => {
                if (!hpConflict) return;
                applyingRemoteHpRef.current = getHpHash(hpConflict.remote);
                updateCharacterData(hpConflict.characterId, previous => ({ ...previous, hp: { ...previous.hp, current: String(hpConflict.remote.currentHp), max: String(hpConflict.remote.maxHp), temp: String(hpConflict.remote.tempHp) } }));
                clearPendingHpSync(hpConflict.key);
                setHpConflict(null);
                setHpSyncStatus('synced');
            };
            const shareLocalHpConflict = async () => {
                if (!hpConflict) return;
                const participant = roomParticipants.find(item => item.id === hpConflict.participantId);
                if (!participant) return;
                try {
                    setHpSyncStatus('syncing');
                    const hpChanges = { currentHp: hpConflict.local.currentHp, tempHp: hpConflict.local.tempHp };
                    if (hpConflict.local.maxHp !== hpConflict.remote.maxHp) hpChanges.maxHp = hpConflict.local.maxHp;
                    lastSentHpPayloadRef.current = { key: hpConflict.key, hash: getHpHash(hpConflict.local), values: getHpValues(hpConflict.local) };
                    await updateParticipantHp(participant, hpChanges, isCurrentRoomMaster ? 'master' : 'player');
                    scheduleHpConfirmation(hpConflict.key, currentRoom.code, firebaseUser.uid, sharedCharacterId, hpConflict.local);
                    setHpConflict(null);
                    setHpSyncStatus('syncing');
                } catch (error) {
                    if (isHpNetworkError(error)) markPendingHpSync(hpConflict.key, currentRoom.code, firebaseUser.uid, sharedCharacterId, hpConflict.local, 'failed');
                    setHpSyncStatus('failed');
                }
            };
            const retryPendingHpSync = async () => {
                if (!currentRoom?.code || !sharedCharacterId || !ownRoomParticipant) return;
                const syncKey = getHpSyncKey(currentRoom.code, firebaseUser?.uid, sharedCharacterId);
                const pending = getPendingHpSync(syncKey, currentRoom.code, firebaseUser?.uid, sharedCharacterId);
                if (!pending) return;
                try {
                    const retrying = markPendingHpSync(syncKey, currentRoom.code, firebaseUser.uid, sharedCharacterId, pending, 'pending');
                    setHpSyncStatus('syncing');
                    console.log('[HP] Escritura enviada:', retrying);
                    const remoteValues = getHpValues(ownRoomParticipant, retrying);
                    const hpChanges = { currentHp: retrying.currentHp, tempHp: retrying.tempHp };
                    if (retrying.maxHp !== remoteValues.maxHp) hpChanges.maxHp = retrying.maxHp;
                    lastSentHpPayloadRef.current = { key: syncKey, hash: getHpHash(retrying), values: getHpValues(retrying) };
                    await updateParticipantHp(ownRoomParticipant, hpChanges, isCurrentRoomMaster ? 'master' : 'player');
                    scheduleHpConfirmation(syncKey, currentRoom.code, firebaseUser.uid, sharedCharacterId, retrying);
                } catch (error) {
                    console.error('[Mesa] Error actualizando vida:', error.code, error.message, error);
                    markPendingHpSync(syncKey, currentRoom.code, firebaseUser.uid, sharedCharacterId, pending, 'failed');
                    setHpSyncStatus('failed');
                }
            };
            const insertEnemyIdsIntoEncounter = async (enemyIds, insertionMode) => {
                if (!isCurrentRoomMaster || !currentRoom || encounterBusy) return false;
                const normalizedEnemyIds = [...new Set((Array.isArray(enemyIds) ? enemyIds : [enemyIds]).filter(Boolean))];
                if (!normalizedEnemyIds.length) return false;
                const initiativeUtils = window.OnlineInitiativeUtils;
                if (!initiativeUtils || typeof initiativeUtils.insertIdsAfterCurrent !== 'function' || typeof initiativeUtils.insertIdsAtEnd !== 'function' || typeof initiativeUtils.recalculateTurnIndex !== 'function') {
                    console.error('[EnemyReinforcements] OnlineInitiativeUtils no está disponible.');
                    setOnlineTableError('No se pudo añadir los enemigos al orden.');
                    return false;
                }
                try {
                    const { db, api } = getOnlineServices();
                    setEncounterBusy(true);
                    await api.runTransaction(db, async transaction => {
                        const roomRef = api.doc(db, 'rooms', currentRoom.code);
                        const snapshot = await transaction.get(roomRef);
                        if (!snapshot.exists()) throw new Error('ROOM_NOT_FOUND');
                        const room = snapshot.data();
                        if (room.status !== 'active' && room.status !== 'paused') throw new Error('ENCOUNTER_NOT_ACTIVE');
                        const turnOrder = Array.isArray(room.turnOrder) ? room.turnOrder.filter(Boolean) : [];
                        const currentTurnId = room.currentTurnId || turnOrder[Math.max(0, Math.min(Number(room.turnIndex) || 0, Math.max(0, turnOrder.length - 1)))];
                        if (!turnOrder.length || !currentTurnId || !turnOrder.includes(currentTurnId)) throw new Error('INVALID_TURN_ORDER');
                        const newTurnOrder = insertionMode === 'after-current'
                            ? initiativeUtils.insertIdsAfterCurrent(turnOrder, currentTurnId, normalizedEnemyIds)
                            : initiativeUtils.insertIdsAtEnd(turnOrder, normalizedEnemyIds);
                        const newTurnIndex = initiativeUtils.recalculateTurnIndex(newTurnOrder, currentTurnId);
                        if (!Array.isArray(newTurnOrder) || !newTurnOrder.length || newTurnIndex < 0 || newTurnIndex >= newTurnOrder.length || newTurnOrder[newTurnIndex] !== currentTurnId || new Set(newTurnOrder).size !== newTurnOrder.length) throw new Error('INVALID_REINFORCEMENT_ORDER');
                        transaction.update(roomRef, {
                            turnOrder: newTurnOrder,
                            turnIndex: newTurnIndex,
                            updatedAt: api.serverTimestamp()
                        });
                    });
                    setOutsideEncounterEnemyIds(previous => previous.filter(id => !normalizedEnemyIds.includes(id)));
                    setOnlineTableNotice(`${normalizedEnemyIds.length} ${normalizedEnemyIds.length === 1 ? 'enemigo añadido' : 'enemigos añadidos'} al orden.`);
                    return true;
                } catch (error) {
                    console.error('[EnemyReinforcements] error:', {
                        code: error?.code,
                        message: error?.message,
                        enemyIds: normalizedEnemyIds,
                        insertionMode,
                        error
                    });
                    setOnlineTableError('Los enemigos se crearon, pero no pudieron añadirse al orden.');
                    return false;
                } finally {
                    setEncounterBusy(false);
                }
            };
            const addEnemyIdsAfterCurrent = (enemyIds) => insertEnemyIdsIntoEncounter(enemyIds, 'after-current');
            const addEnemyIdsAtEnd = (enemyIds) => insertEnemyIdsIntoEncounter(enemyIds, 'end');
            const confirmReinforcementEntry = async (insertionMode) => {
                const enemyIds = reinforcementEntry.enemyIds;
                if (insertionMode === 'outside') {
                    setReinforcementEntry({ isOpen: false, enemyIds: [] });
                    setOnlineTableNotice('Los enemigos se han creado fuera del encuentro.');
                    return;
                }
                const inserted = insertionMode === 'after-current'
                    ? await addEnemyIdsAfterCurrent(enemyIds)
                    : await addEnemyIdsAtEnd(enemyIds);
                if (inserted) setReinforcementEntry({ isOpen: false, enemyIds: [] });
            };
            const openEnemyModal = (enemy = null) => {
                if (!canManageEnemies) return;
                if (!enemy) {
                    setEnemySourceChoiceOpen(true);
                    return;
                }
                const privateData = enemy ? privateEnemies.find(item => item.id === enemy.id) : null;
                setEnemyModal({ isOpen: true, mode: enemy ? 'edit' : 'create', enemyId: enemy?.id || null, data: enemy ? { name: enemy.name || '', initiative: enemy.initiative ?? '', currentHp: privateData?.currentHp ?? 0, maxHp: privateData?.maxHp ?? 0, tempHp: privateData?.tempHp ?? 0, armorClass: privateData?.armorClass ?? '', notes: privateData?.notes || '', visibleStateMode: enemy.visibleStateMode || 'automatic', manualVisibleState: enemy.manualVisibleState || 'herido' } : { name: '', initiative: '', currentHp: 0, maxHp: 0, tempHp: 0, armorClass: '', notes: '', visibleStateMode: 'automatic', manualVisibleState: 'herido' } });
            };
            const openDirectEnemyModal = () => {
                setEnemySourceChoiceOpen(false);
                setEnemyModal({ isOpen: true, mode: 'create', enemyId: null, data: { name: '', initiative: '', currentHp: 0, maxHp: 0, tempHp: 0, armorClass: '', notes: '', visibleStateMode: 'automatic', manualVisibleState: 'herido' } });
            };
            const buildNextEnemyNames = (baseName, quantity = 1, namingMode = 'auto') => {
                const base = String(baseName || '').trim();
                const amount = Math.max(1, Math.trunc(Number(quantity) || 1));
                if (!base) return Array.from({ length: amount }, () => 'Enemigo');
                const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const escapedBase = escapeRegExp(base);
                const exactPattern = new RegExp(`^${escapedBase}$`, 'i');
                const letterPattern = new RegExp(`^${escapedBase}\\s+([A-Z]+)$`, 'i');
                const numberPattern = new RegExp(`^${escapedBase}\\s+(\\d+)$`, 'i');
                const letterToIndex = letters => letters.toUpperCase().split('').reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0);
                const indexToLetters = index => {
                    let value = index;
                    let result = '';
                    while (value > 0) {
                        value -= 1;
                        result = String.fromCharCode(65 + (value % 26)) + result;
                        value = Math.floor(value / 26);
                    }
                    return result;
                };
                const existingNames = publicCombatants.map(enemy => String(enemy.name || '').trim());
                const letterIndexes = [];
                const numberIndexes = [];
                let hasMatchingName = false;
                existingNames.forEach(existingName => {
                    if (exactPattern.test(existingName)) hasMatchingName = true;
                    const letterMatch = existingName.match(letterPattern);
                    const numberMatch = existingName.match(numberPattern);
                    if (letterMatch) {
                        hasMatchingName = true;
                        letterIndexes.push(letterToIndex(letterMatch[1]));
                    }
                    if (numberMatch) {
                        hasMatchingName = true;
                        numberIndexes.push(Number(numberMatch[1]));
                    }
                });
                const resolvedMode = namingMode === 'numbers'
                    ? 'numbers'
                    : namingMode === 'letters'
                        ? 'letters'
                        : letterIndexes.length
                            ? 'letters'
                            : numberIndexes.length
                                ? 'numbers'
                                : 'letters';
                if (namingMode === 'same' || (amount === 1 && !hasMatchingName)) return Array.from({ length: amount }, () => base);
                const start = resolvedMode === 'letters'
                    ? (letterIndexes.length ? Math.max(...letterIndexes) + 1 : 1)
                    : (numberIndexes.length ? Math.max(...numberIndexes) + 1 : 1);
                return Array.from({ length: amount }, (_, index) => `${base} ${resolvedMode === 'letters' ? indexToLetters(start + index) : start + index}`);
            };
            const openBestiaryEnemyDraft = (monster) => {
                setBestiaryEnemySelectorOpen(false);
                setBestiaryEnemyDraft({ templateId: monster.id, name: monster.name, initiative: '', maxHp: monster.maxHp, armorClass: monster.armorClass ?? '', visibleStateMode: monster.defaultVisibleStateMode, manualVisibleState: monster.defaultManualVisibleState || 'herido', conditionsVisible: cloneData(monster.defaultPublicConditions), notes: monster.privateNotes, avatarDataUrl: isValidPortraitDataUrl(monster.avatarDataUrl) ? monster.avatarDataUrl : '', quantity: 1, nameMode: 'letters', copyNames: buildNextEnemyNames(monster.name, 1, 'letters'), initiativeMode: 'same', copyInitiatives: [''] });
            };
            const updateBestiaryEnemyCopies = (changes) => setBestiaryEnemyDraft(previous => {
                if (!previous) return previous;
                const next = { ...previous, ...changes };
                if (next.quantity === '') return next;
                const quantity = Math.max(1, Math.min(50, Math.trunc(Number(next.quantity) || 1)));
                const mode = ['letters', 'numbers', 'manual', 'same'].includes(next.nameMode) ? next.nameMode : 'letters';
                const previousNames = Array.isArray(previous.copyNames) ? previous.copyNames : [];
                next.quantity = quantity;
                next.nameMode = mode;
                if (quantity === 1) next.initiativeMode = 'same';
                const generatedNames = mode === 'letters' || mode === 'numbers'
                    ? buildNextEnemyNames(next.name, quantity, mode)
                    : [];
                next.copyNames = Array.from({ length: quantity }, (_, index) => {
                    if (mode === 'manual') return previousNames[index] || `${next.name} ${index + 1}`;
                    if (mode === 'same') return next.name;
                    return generatedNames[index];
                });
                next.copyInitiatives = Array.from({ length: quantity }, (_, index) => previous.copyInitiatives?.[index] ?? next.initiative ?? '');
                return next;
            });
            const addEnemiesToPreparedOrder = (enemyIds, initiativesById) => {
                if (roomData?.status !== 'lobby' || !encounterSetupOpen || !enemyIds.length) return;
                setPreparedTurnOrder(previous => [...new Set([...previous, ...enemyIds])].sort((left, right) => {
                    const leftInitiative = initiativesById[left] ?? getCombatant(left)?.initiative;
                    const rightInitiative = initiativesById[right] ?? getCombatant(right)?.initiative;
                    const leftValue = Number.isFinite(Number(leftInitiative)) ? Number(leftInitiative) : -Infinity;
                    const rightValue = Number.isFinite(Number(rightInitiative)) ? Number(rightInitiative) : -Infinity;
                    return rightValue - leftValue;
                }));
            };
            const createEnemyFromBestiaryDraft = async () => {
                if (!bestiaryEnemyDraft || !currentRoom || !isCurrentRoomMaster) return;
                const toNumber = (value, fallback = NaN) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; };
                const name = String(bestiaryEnemyDraft.name || '').trim();
                const quantity = Math.max(1, Math.min(50, Math.trunc(Number(bestiaryEnemyDraft.quantity) || 1)));
                const initiativeMode = quantity === 1
                    ? 'same'
                    : ['same', 'manual', 'none'].includes(bestiaryEnemyDraft.initiativeMode)
                        ? bestiaryEnemyDraft.initiativeMode
                        : 'same';
                const initiative = toNumber(bestiaryEnemyDraft.initiative);
                const maxHp = Math.max(0, toNumber(bestiaryEnemyDraft.maxHp));
                const armorClass = bestiaryEnemyDraft.armorClass === '' || bestiaryEnemyDraft.armorClass === null ? null : Math.max(0, toNumber(bestiaryEnemyDraft.armorClass, 0));
                const avatarDataUrl = isValidPortraitDataUrl(bestiaryEnemyDraft.avatarDataUrl) && bestiaryEnemyDraft.avatarDataUrl.length <= MAX_SHARED_AVATAR_DATA_URL_LENGTH
                    ? bestiaryEnemyDraft.avatarDataUrl
                    : '';
                if (!name || !Number.isFinite(maxHp) || (initiativeMode === 'same' && !Number.isFinite(initiative))) { setOnlineTableError('Revisa nombre, iniciativa y PV máximos del enemigo.'); return; }
                const names = bestiaryEnemyDraft.nameMode === 'manual' || bestiaryEnemyDraft.nameMode === 'same'
                    ? Array.from({ length: quantity }, (_, index) => String(bestiaryEnemyDraft.copyNames?.[index] || name).trim() || name)
                    : buildNextEnemyNames(name, quantity, bestiaryEnemyDraft.nameMode);
                const initiatives = Array.from({ length: quantity }, (_, index) => initiativeMode === 'none' ? null : initiativeMode === 'manual' ? toNumber(bestiaryEnemyDraft.copyInitiatives?.[index]) : initiative);
                if (initiativeMode === 'manual' && initiatives.some(value => !Number.isFinite(value))) { setOnlineTableError('Introduce una iniciativa válida para cada copia.'); return; }
                const mode = ['automatic', 'manual', 'hidden'].includes(bestiaryEnemyDraft.visibleStateMode) ? bestiaryEnemyDraft.visibleStateMode : 'automatic';
                const manualVisibleState = mode === 'manual' ? String(bestiaryEnemyDraft.manualVisibleState || 'oculto') : null;
                try {
                    const { db, api } = getOnlineServices();
                    setCreatingEnemy(true);
                    const createdIds = [];
                    for (let start = 0; start < quantity; start += 200) {
                        const batch = api.writeBatch(db);
                        const end = Math.min(quantity, start + 200);
                        for (let index = start; index < end; index += 1) {
                            const enemyId = createEnemyId();
                            const publicPayload = { id: enemyId, type: 'enemy', name: names[index], initiative: initiatives[index], visibleState: calculateEnemyVisibleState(maxHp, maxHp, mode, manualVisibleState), visibleStateMode: mode, conditionsVisible: normalizeOnlineConditions(bestiaryEnemyDraft.conditionsVisible), defeated: false, orderCreated: Date.now() + index, createdAt: api.serverTimestamp(), updatedAt: api.serverTimestamp() };
                            if (manualVisibleState !== null) publicPayload.manualVisibleState = manualVisibleState;
                            if (avatarDataUrl) publicPayload.avatarDataUrl = avatarDataUrl;
                            const privatePayload = { id: enemyId, currentHp: maxHp, maxHp, tempHp: 0, notes: String(bestiaryEnemyDraft.notes || ''), updatedAt: api.serverTimestamp() };
                            if (armorClass !== null) privatePayload.armorClass = armorClass;
                            batch.set(api.doc(db, 'rooms', currentRoom.code, 'publicCombatants', enemyId), publicPayload);
                            batch.set(api.doc(db, 'rooms', currentRoom.code, 'privateEnemies', enemyId), privatePayload);
                            createdIds.push(enemyId);
                        }
                        await batch.commit();
                    }
                    addEnemiesToPreparedOrder(createdIds, Object.fromEntries(createdIds.map((id, index) => [id, initiatives[index]])));
                    setBestiaryEnemyDraft(null);
                    if (roomData?.status === 'active' || roomData?.status === 'paused') {
                        setReinforcementEntry({ isOpen: true, enemyIds: createdIds });
                        setOnlineTableNotice(`${quantity} ${quantity === 1 ? 'enemigo creado' : 'enemigos creados'} desde el Bestiario. Elige cómo entran en el encuentro.`);
                    } else {
                        setOnlineTableNotice(`${quantity} ${quantity === 1 ? 'enemigo creado' : 'enemigos creados'} desde el Bestiario.`);
                    }
                } catch (error) {
                    console.error('[BestiaryEnemy] error real', error);
                    setOnlineTableError('No se pudo crear el enemigo desde el Bestiario.');
                } finally { setCreatingEnemy(false); }
            };
            const openEnemyDuplicateModal = (enemy) => {
                if (!canManageEnemies || !enemy) return;
                const privateData = privateEnemies.find(item => item.id === enemy.id);
                setEnemyModal({ isOpen: true, mode: 'duplicate', enemyId: enemy.id, data: { name: enemy.name || '', initiative: enemy.initiative ?? '', currentHp: privateData?.currentHp ?? 0, maxHp: privateData?.maxHp ?? 0, tempHp: privateData?.tempHp ?? 0, armorClass: privateData?.armorClass ?? '', notes: privateData?.notes || '', visibleStateMode: enemy.visibleStateMode || 'automatic', manualVisibleState: enemy.manualVisibleState || 'herido', conditionsVisible: enemy.conditionsVisible || [], quantity: 1, nameMode: 'numbered', copyCurrentHp: false, copyConditions: false, copyPrivateNotes: false } });
            };
            const persistBestiary = (monsters) => {
                try {
                    const saved = saveLocalBestiary({ monsters });
                    setBestiary({ ...saved, warning: '' });
                } catch (error) {
                    setBestiaryNotice('No se pudo guardar el Bestiario local.');
                }
            };
            const createBestiaryMonster = (data) => {
                const now = new Date().toISOString();
                const monster = normalizeBestiaryMonster({ ...data, id: createBestiaryId(), createdAt: now, updatedAt: now }, now);
                if (!monster.name) { setBestiaryNotice('El nombre de la criatura es obligatorio.'); return false; }
                persistBestiary([...bestiary.monsters, monster]);
                return true;
            };
            const createSrdMonsterPrivateNotes = (sourceMonster) => {
                const details = sourceMonster?.details || {};
                if (typeof details.referenceText === 'string' && details.referenceText.trim()) {
                    return `Ficha de referencia SRD 5.1:\n\n${details.referenceText.trim()}`;
                }
                const formatGroup = (title, entries) => Array.isArray(entries) && entries.length
                    ? `${title}:\n${entries.map(entry => `- ${entry?.name || 'Rasgo'}${entry?.desc ? `. ${entry.desc}` : ''}`).join('\n')}`
                    : '';
                return [
                    `Ficha de referencia: ${details.size || ''} ${details.type || 'criatura'}${details.subtype ? ` (${details.subtype})` : ''} · CR ${details.challengeRating ?? '—'}.`,
                    details.senses ? `Sentidos: ${details.senses}.` : '',
                    details.languages ? `Idiomas: ${details.languages}.` : '',
                    details.resistances ? `Resistencias: ${details.resistances}.` : '',
                    details.immunities ? `Inmunidades: ${details.immunities}.` : '',
                    details.conditionImmunities ? `Inmunidades de condición: ${details.conditionImmunities}.` : '',
                    formatGroup('Rasgos', details.traits),
                    formatGroup('Acciones', details.actions),
                    formatGroup('Acciones adicionales', details.bonusActions),
                    formatGroup('Reacciones', details.reactions),
                    formatGroup('Acciones legendarias', details.legendaryActions)
                ].filter(Boolean).join('\n\n');
            };
            const createSrdBestiaryTemplate = (sourceMonster) => {
                const now = new Date().toISOString();
                return normalizeBestiaryMonster({
                    id: createBestiaryId(),
                    name: sourceMonster.name,
                    maxHp: sourceMonster.maxHp,
                    armorClass: sourceMonster.armorClass,
                    tags: Array.isArray(sourceMonster.tags) ? sourceMonster.tags : ['SRD 5.1'],
                    srdDetails: cloneData(sourceMonster.details || {}),
                    compendiumSource: sourceMonster.id,
                    defaultVisibleStateMode: 'automatic',
                    defaultPublicConditions: [],
                    privateNotes: createSrdMonsterPrivateNotes(sourceMonster),
                    createdAt: now,
                    updatedAt: now
                }, now);
            };
            const addSrdMonsterToBestiary = (sourceMonster) => {
                if (!sourceMonster?.id || !sourceMonster?.name) return;
                const existing = bestiary.monsters.find(monster => monster.compendiumSource === sourceMonster.id);
                if (existing) {
                    setBestiaryNotice(`${sourceMonster.name} ya está en tus criaturas.`);
                    setBestiaryCompendiumPreview(null);
                    return;
                }
                const template = createSrdBestiaryTemplate(sourceMonster);
                try {
                    persistBestiary([...bestiary.monsters, template]);
                    setBestiaryNotice(`${template.name} añadido a tus criaturas.`);
                    setBestiaryCompendiumPreview(null);
                } catch (error) {
                    setBestiaryNotice(error?.name === 'QuotaExceededError'
                        ? 'No hay espacio local suficiente para guardar la plantilla.'
                        : 'No se pudo añadir la criatura al Bestiario.');
                }
            };
            const useSrdMonsterInOnlineTable = (sourceMonster) => {
                if (!currentRoom || !isCurrentRoomMaster) {
                    setBestiaryNotice('Abre una sala como Máster para preparar esta criatura en la mesa.');
                    return;
                }
                openBestiaryEnemyDraft(createSrdBestiaryTemplate(sourceMonster));
                setBestiaryCompendiumPreview(null);
                setBestiaryCompendiumOpen(false);
            };
            const updateBestiaryMonster = (id, changes) => {
                const now = new Date().toISOString();
                const next = bestiary.monsters.map(monster => monster.id === id ? normalizeBestiaryMonster({ ...monster, ...changes, id: monster.id, createdAt: monster.createdAt, updatedAt: now }, now) : monster);
                if (!next.find(monster => monster.id === id)?.name) { setBestiaryNotice('El nombre de la criatura es obligatorio.'); return false; }
                persistBestiary(next);
                return true;
            };
            const deleteBestiaryMonster = (id) => persistBestiary(bestiary.monsters.filter(monster => monster.id !== id));
            const duplicateBestiaryMonster = (id) => {
                const source = bestiary.monsters.find(monster => monster.id === id);
                if (!source) return;
                const now = new Date().toISOString();
                persistBestiary([...bestiary.monsters, normalizeBestiaryMonster({ ...cloneData(source), id: createBestiaryId(), name: `${source.name} Copia`, createdAt: now, updatedAt: now }, now)]);
            };
            const openBestiaryEditor = (monster = null) => setBestiaryEditor(monster ? cloneData(monster) : { name: '', maxHp: 0, armorClass: '', defaultVisibleStateMode: 'automatic', defaultManualVisibleState: 'herido', defaultPublicConditions: [], privateNotes: '', tags: [], avatarDataUrl: '' });
            const saveBestiaryEditor = () => {
                if (!bestiaryEditor) return;
                const success = bestiaryEditor.id ? updateBestiaryMonster(bestiaryEditor.id, bestiaryEditor) : createBestiaryMonster(bestiaryEditor);
                if (success) { setBestiaryEditor(null); setBestiaryNotice('Plantilla guardada localmente.'); }
            };
            const handleBestiaryAvatar = async (event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (!file || !bestiaryEditor) return;
                if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > MAX_PORTRAIT_FILE_SIZE) { setBestiaryNotice('Usa una imagen PNG, JPEG o WebP de hasta 5 MB.'); return; }
                const reader = new FileReader();
                reader.onerror = () => setBestiaryNotice('No se pudo leer la imagen.');
                reader.onload = async () => {
                    try {
                        const avatarDataUrl = await createSharedAvatar(String(reader.result || ''));
                        setBestiaryEditor(previous => ({ ...previous, avatarDataUrl }));
                        if (!avatarDataUrl) setBestiaryNotice('La plantilla se guardará sin avatar.');
                    } catch (error) { setBestiaryNotice('La plantilla se guardará sin avatar.'); }
                };
                reader.readAsDataURL(file);
            };
            const exportBestiary = () => {
                const content = JSON.stringify(createBestiaryExportPayload(bestiary.monsters), null, 2);
                const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = `bestiario-dnd-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
                URL.revokeObjectURL(url);
            };
            const isBestiaryDuplicate = (monster, current) => current.find(item => item.id === monster.id || (item.name.trim().toLocaleLowerCase('es') === monster.name.trim().toLocaleLowerCase('es') && item.maxHp === monster.maxHp && item.armorClass === monster.armorClass));
            const handleBestiaryImportFile = (event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (!file) return;
                if (!file.name.toLocaleLowerCase().endsWith('.json') || file.size > MAX_BESTIARY_IMPORT_SIZE) { setBestiaryNotice('Selecciona un JSON de Bestiario de hasta 2 MB.'); return; }
                const reader = new FileReader();
                reader.onerror = () => setBestiaryNotice('No se pudo leer el archivo.');
                reader.onload = () => {
                    try {
                        const parsed = JSON.parse(String(reader.result || ''));
                        if (!isRecord(parsed) || parsed.format !== 'dnd-local-bestiary' || parsed.schemaVersion !== LOCAL_BESTIARY_SCHEMA_VERSION || !Array.isArray(parsed.monsters)) throw new Error('Formato de Bestiario no compatible.');
                        if (parsed.monsters.length > MAX_BESTIARY_MONSTERS) throw new Error(`El archivo supera el límite de ${MAX_BESTIARY_MONSTERS} criaturas.`);
                        let invalid = 0;
                        let avatarBytes = 0;
                        const monsters = parsed.monsters.reduce((list, raw) => {
                            if (!isRecord(raw) || !String(raw.name || '').trim()) { invalid += 1; return list; }
                            const monster = normalizeBestiaryMonster(raw);
                            avatarBytes += monster.avatarDataUrl.length;
                            list.push(monster);
                            return list;
                        }, []);
                        if (avatarBytes > MAX_BESTIARY_AVATAR_TOTAL) monsters.forEach(monster => { monster.avatarDataUrl = ''; });
                        const duplicates = monsters.filter(monster => isBestiaryDuplicate(monster, bestiary.monsters)).map(monster => monster.id);
                        setBestiaryImportPreview({ monsters, invalid, duplicates, avatarBytes, size: file.size, avatarsRemoved: avatarBytes > MAX_BESTIARY_AVATAR_TOTAL });
                        setBestiarySelectedImportIds(monsters.map(monster => monster.id));
                        setBestiaryImportMode('merge');
                        setBestiaryDuplicateMode('skip');
                    } catch (error) { setBestiaryNotice(error.message || 'El archivo no es un Bestiario válido.'); }
                };
                reader.readAsText(file);
            };
            const backupBestiary = () => window.localStorage.setItem(LOCAL_BESTIARY_BACKUP_KEY, JSON.stringify(createBestiaryExportPayload(bestiary.monsters)));
            const restoreBestiaryBackup = () => {
                try {
                    const backup = JSON.parse(window.localStorage.getItem(LOCAL_BESTIARY_BACKUP_KEY) || '');
                    if (!isRecord(backup) || backup.format !== 'dnd-local-bestiary' || !Array.isArray(backup.monsters)) throw new Error();
                    persistBestiary(backup.monsters.map(monster => normalizeBestiaryMonster(monster)));
                    setBestiaryNotice('Copia anterior restaurada.');
                } catch (error) { setBestiaryNotice('No hay una copia anterior válida.'); }
            };
            const applyBestiaryImport = () => {
                if (!bestiaryImportPreview) return;
                const selected = bestiaryImportPreview.monsters.filter(monster => bestiarySelectedImportIds.includes(monster.id));
                if (bestiaryImportMode === 'replace' && !window.confirm('Se reemplazará todo el Bestiario local. ¿Confirmas esta segunda acción?')) return;
                try {
                    backupBestiary();
                    let omitted = 0;
                    let next = bestiaryImportMode === 'replace' ? [] : [...bestiary.monsters];
                    selected.forEach(source => {
                        const duplicate = isBestiaryDuplicate(source, next);
                        if (duplicate && bestiaryDuplicateMode === 'skip') { omitted += 1; return; }
                        if (duplicate && bestiaryDuplicateMode === 'replace') { next = next.map(monster => monster.id === duplicate.id ? normalizeBestiaryMonster({ ...source, id: monster.id, createdAt: monster.createdAt, updatedAt: new Date().toISOString() }) : monster); return; }
                        const monster = duplicate ? normalizeBestiaryMonster({ ...cloneData(source), id: createBestiaryId(), name: `${source.name} Copia`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }) : source;
                        next.push(monster);
                    });
                    if (next.length > MAX_BESTIARY_MONSTERS) throw new Error(`El resultado supera ${MAX_BESTIARY_MONSTERS} criaturas.`);
                    persistBestiary(next);
                    setBestiaryNotice(`Importación completada: ${selected.length - omitted} añadidas, ${omitted} omitidas.`);
                    setBestiaryImportPreview(null);
                } catch (error) {
                    if (error?.name === 'QuotaExceededError') setBestiaryNotice('No hay espacio local suficiente. Prueba importando sin avatares.');
                    else setBestiaryNotice(error.message || 'No se pudo importar el Bestiario.');
                }
            };
            const saveEnemy = async () => {
                if (!currentRoom || !enemyModal.data) return;
                if (roomData?.ownerUid !== firebaseUser?.uid) {
                    setOnlineTableError('Solo el Máster puede añadir enemigos.');
                    return;
                }
                const data = enemyModal.data;
                const name = String(data.name || '').trim();
                const normalizeFiniteNumber = (value, fallback = 0) => {
                    const parsed = Number(value);
                    return Number.isFinite(parsed) ? parsed : fallback;
                };
                const initiative = normalizeFiniteNumber(data.initiative, NaN);
                const maxHp = Math.max(0, normalizeFiniteNumber(data.maxHp, NaN));
                const currentHp = Math.max(0, normalizeFiniteNumber(data.currentHp, NaN));
                const tempHp = Math.max(0, normalizeFiniteNumber(data.tempHp, NaN));
                if (!name || !Number.isFinite(initiative) || !Number.isFinite(maxHp) || !Number.isFinite(currentHp) || !Number.isFinite(tempHp) || maxHp < 0 || currentHp < 0 || currentHp > maxHp || tempHp < 0) { setOnlineTableError('Revisa nombre, iniciativa y valores de vida del enemigo.'); return; }
                const enemyId = enemyModal.enemyId || createEnemyId();
                const quantity = enemyModal.mode === 'duplicate' ? Math.max(1, Math.min(50, Math.trunc(normalizeFiniteNumber(data.quantity, 1)))) : 1;
                const mode = ['automatic', 'manual', 'hidden'].includes(data.visibleStateMode) ? data.visibleStateMode : 'automatic';
                const manualVisibleState = mode === 'manual' ? String(data.manualVisibleState || 'oculto') : null;
                const visibleState = calculateEnemyVisibleState(currentHp, maxHp, mode, manualVisibleState);
                const normalizedConditions = Array.isArray(data.conditionsVisible) ? normalizeOnlineConditions(data.conditionsVisible) : [];
                const hasArmorClass = data.armorClass !== '' && data.armorClass !== null && data.armorClass !== undefined;
                const normalizedArmorClass = hasArmorClass ? Math.max(0, normalizeFiniteNumber(data.armorClass, 0)) : null;
                const normalizedNotes = String(data.notes || '');
                let publicEnemyPayload = null;
                let privateEnemyPayload = null;
                try {
                    const { db, api } = getOnlineServices();
                    setCreatingEnemy(true);
                    setOnlineTableError('');
                    if (enemyModal.mode === 'edit') {
                        const batch = api.writeBatch(db);
                        publicEnemyPayload = { id: String(enemyId), type: 'enemy', name, initiative, visibleState, visibleStateMode: mode, conditionsVisible: normalizedConditions, defeated: currentHp <= 0, orderCreated: normalizeFiniteNumber(publicCombatants.find(item => item.id === enemyId)?.orderCreated, Date.now()), updatedAt: api.serverTimestamp() };
                        if (manualVisibleState !== null) publicEnemyPayload.manualVisibleState = manualVisibleState;
                        privateEnemyPayload = { id: String(enemyId), currentHp, maxHp, tempHp, notes: normalizedNotes, updatedAt: api.serverTimestamp() };
                        if (normalizedArmorClass !== null) privateEnemyPayload.armorClass = normalizedArmorClass;
                        batch.update(api.doc(db, 'rooms', currentRoom.code, 'publicCombatants', enemyId), publicEnemyPayload);
                        batch.update(api.doc(db, 'rooms', currentRoom.code, 'privateEnemies', enemyId), privateEnemyPayload);
                        await batch.commit();
                        if (currentHp <= 0) await removeCombatantFromTurnOrder({ roomCode: currentRoom.code, combatantId: enemyId, reason: 'defeated' });
                    } else {
                        const created = [];
                        const duplicateBaseName = enemyModal.mode === 'duplicate'
                            ? (name.replace(/\s+(?:[A-Z]+|\d+)$/i, '').trim() || name)
                            : name;
                        const generatedNames = enemyModal.mode === 'create' || enemyModal.mode === 'duplicate'
                            ? buildNextEnemyNames(duplicateBaseName, quantity, 'auto')
                            : null;
                        for (let start = 0; start < quantity; start += 200) {
                            const batch = api.writeBatch(db);
                            const group = Math.min(200, quantity - start);
                            for (let offset = 0; offset < group; offset += 1) {
                                const index = start + offset;
                                const id = createEnemyId();
                                const suffix = quantity > 1 ? (data.nameMode === 'letters' ? String.fromCharCode(65 + (index % 26)) : index + 1) : '';
                                const enemyName = generatedNames?.[index] || (suffix ? `${name} ${suffix}` : name);
                                const initialHp = enemyModal.mode === 'duplicate' && !data.copyCurrentHp ? maxHp : currentHp;
                                const initialTempHp = enemyModal.mode === 'duplicate' ? 0 : tempHp;
                                const enemyVisibleState = calculateEnemyVisibleState(initialHp, maxHp, mode, manualVisibleState);
                                publicEnemyPayload = { id: String(id), type: 'enemy', name: String(enemyName), initiative, visibleState: enemyVisibleState, visibleStateMode: mode, conditionsVisible: data.copyConditions ? normalizedConditions : [], defeated: false, orderCreated: Date.now() + index, createdAt: api.serverTimestamp(), updatedAt: api.serverTimestamp() };
                                if (manualVisibleState !== null) publicEnemyPayload.manualVisibleState = manualVisibleState;
                                privateEnemyPayload = { id: String(id), currentHp: initialHp, maxHp, tempHp: initialTempHp, notes: data.copyPrivateNotes ? normalizedNotes : '', updatedAt: api.serverTimestamp() };
                                if (normalizedArmorClass !== null) privateEnemyPayload.armorClass = normalizedArmorClass;
                                batch.set(api.doc(db, 'rooms', currentRoom.code, 'publicCombatants', id), publicEnemyPayload);
                                batch.set(api.doc(db, 'rooms', currentRoom.code, 'privateEnemies', id), privateEnemyPayload);
                                created.push(id);
                            }
                            await batch.commit();
                        }
                        addEnemiesToPreparedOrder(created, Object.fromEntries(created.map(id => [id, initiative])));
                        if (roomData?.status === 'active' || roomData?.status === 'paused') {
                            setReinforcementEntry({ isOpen: true, enemyIds: created });
                            setOnlineTableNotice(`${quantity} ${quantity === 1 ? 'enemigo creado' : 'enemigos creados'}. Elige cómo entran en el encuentro.`);
                        } else {
                            setOnlineTableNotice(`${quantity} ${quantity === 1 ? 'enemigo creado' : 'enemigos creados'}. Añádelos al orden desde Preparación cuando corresponda.`);
                        }
                    }
                    setEnemyModal({ isOpen: false, mode: 'create', enemyId: null, data: {} });
                } catch (error) {
                    console.error('[EnemyCreate] error real:', {
                        code: error?.code,
                        message: error?.message,
                        name: error?.name,
                        publicPayload: publicEnemyPayload,
                        privatePayload: privateEnemyPayload,
                        error
                    });
                    const errorMessages = {
                        'permission-denied': 'Firestore rechazó la creación del enemigo por permisos.',
                        'invalid-argument': 'Hay un dato del enemigo con formato inválido.',
                        unavailable: 'No hay conexión con Firebase.'
                    };
                    setOnlineTableError(errorMessages[error?.code] || `No se pudo crear el enemigo: ${error?.code || error?.message || 'error desconocido'}`);
                } finally {
                    setCreatingEnemy(false);
                }
            };
            const removeCombatantFromTurnOrder = async ({ roomCode, combatantId, reason = 'removed', removeEnemyDocuments = false }) => {
                const { db, api } = getOnlineServices();
                let outcome = { removed: false, currentTurnId: null, turnIndex: 0 };
                await api.runTransaction(db, async transaction => {
                    const roomRef = api.doc(db, 'rooms', roomCode);
                    const snapshot = await transaction.get(roomRef);
                    if (!snapshot.exists()) throw new Error('ROOM_NOT_FOUND');
                    const room = snapshot.data();
                    const oldTurnOrder = Array.isArray(room.turnOrder) ? room.turnOrder.filter(Boolean) : [];
                    const oldTurnIndex = Math.max(0, Math.min(Number(room.turnIndex) || 0, Math.max(0, oldTurnOrder.length - 1)));
                    const oldCurrentTurnId = room.currentTurnId || oldTurnOrder[oldTurnIndex] || null;
                    const oldRemovedIndex = oldTurnOrder.indexOf(combatantId);
                    if (reason === 'deleted') console.log('[DeleteEnemy] antes', { enemyId: combatantId, oldTurnOrder, oldCurrentTurnId, oldTurnIndex });

                    if (removeEnemyDocuments) {
                        transaction.delete(api.doc(db, 'rooms', roomCode, 'publicCombatants', combatantId));
                        transaction.delete(api.doc(db, 'rooms', roomCode, 'privateEnemies', combatantId));
                    }

                    if (oldRemovedIndex < 0) {
                        outcome = { removed: false, currentTurnId: oldCurrentTurnId, turnIndex: oldTurnIndex };
                        if (reason === 'deleted') console.log('[DeleteEnemy] después', { newTurnOrder: oldTurnOrder, newCurrentTurnId: oldCurrentTurnId, newTurnIndex: oldTurnIndex });
                        return;
                    }

                    const newTurnOrder = oldTurnOrder.filter(id => id !== combatantId);
                    let newCurrentTurnId = oldCurrentTurnId;
                    let newTurnIndex = 0;
                    let wrappedToNextRound = false;
                    if (oldCurrentTurnId !== combatantId && newTurnOrder.includes(oldCurrentTurnId)) {
                        const initiativeUtils = window.OnlineInitiativeUtils;
                        newTurnIndex = typeof initiativeUtils?.recalculateTurnIndex === 'function'
                            ? initiativeUtils.recalculateTurnIndex(newTurnOrder, oldCurrentTurnId)
                            : newTurnOrder.indexOf(oldCurrentTurnId);
                    } else if (!newTurnOrder.length) {
                        newCurrentTurnId = null;
                        newTurnIndex = 0;
                    } else if (oldRemovedIndex < newTurnOrder.length) {
                        newCurrentTurnId = newTurnOrder[oldRemovedIndex];
                        newTurnIndex = oldRemovedIndex;
                    } else {
                        newCurrentTurnId = newTurnOrder[0];
                        newTurnIndex = 0;
                        wrappedToNextRound = oldCurrentTurnId === combatantId;
                    }

                    if (wrappedToNextRound) console.log('[RemoveCombatant] wrappedToNextRound', { combatantId, oldTurnOrder, newTurnOrder });

                    transaction.update(roomRef, {
                        turnOrder: newTurnOrder,
                        turnIndex: newTurnIndex,
                        currentTurnId: newCurrentTurnId,
                        ...(wrappedToNextRound ? { round: Math.max(1, Number(room.round) || 1) + 1 } : {}),
                        updatedAt: api.serverTimestamp()
                    });
                    outcome = { removed: true, currentTurnId: newCurrentTurnId, turnIndex: newTurnIndex };
                    if (reason === 'deleted') console.log('[DeleteEnemy] después', { newTurnOrder, newCurrentTurnId, newTurnIndex });
                });
                return outcome;
            };
            // Enemy public state and private HP are committed together to avoid inconsistent snapshots.
            const updateEnemyHp = async (enemy, changes) => {
                if (!canManageEnemies || !currentRoom) return;
                const privateData = privateEnemies.find(item => item.id === enemy.id);
                if (!privateData) return;
                const current = getHpValues(privateData);
                const maxHp = changes.maxHp === undefined ? current.maxHp : normalizeHpValue(changes.maxHp, current.maxHp);
                const next = { maxHp, currentHp: Math.max(0, Math.min(maxHp, changes.currentHp === undefined ? current.currentHp : normalizeHpValue(changes.currentHp, current.currentHp))), tempHp: Math.max(0, changes.tempHp === undefined ? current.tempHp : normalizeHpValue(changes.tempHp, current.tempHp)) };
                const visibleState = calculateEnemyVisibleState(next.currentHp, next.maxHp, enemy.visibleStateMode, enemy.manualVisibleState);
                const { db, api } = getOnlineServices();
                const batch = api.writeBatch(db);
                batch.update(api.doc(db, 'rooms', currentRoom.code, 'privateEnemies', enemy.id), { ...next, updatedAt: api.serverTimestamp() });
                batch.update(api.doc(db, 'rooms', currentRoom.code, 'publicCombatants', enemy.id), { visibleState, defeated: next.currentHp <= 0, updatedAt: api.serverTimestamp() });
                await batch.commit();
                if (next.currentHp <= 0) await removeCombatantFromTurnOrder({ roomCode: currentRoom.code, combatantId: enemy.id, reason: 'defeated' });
            };
            const applyEnemyHpModal = async () => {
                const enemy = publicCombatants.find(item => item.id === enemyHpModal.enemyId);
                const privateData = privateEnemies.find(item => item.id === enemyHpModal.enemyId);
                const amount = Math.max(0, Number(enemyHpModal.amount) || 0);
                if (!enemy || !privateData) return;
                const current = getHpValues(privateData);
                let changes = {};
                if (enemyHpModal.mode === 'damage') { const absorbed = Math.min(current.tempHp, amount); changes = { tempHp: current.tempHp - absorbed, currentHp: Math.max(0, current.currentHp - (amount - absorbed)) }; }
                else if (enemyHpModal.mode === 'healing') changes = { currentHp: Math.min(current.maxHp, current.currentHp + amount) };
                else if (enemyHpModal.mode === 'temp') changes = { tempHp: amount };
                else if (enemyHpModal.mode === 'max') changes = { maxHp: amount, currentHp: Math.min(current.currentHp, amount) };
                else changes = { currentHp: Math.min(current.maxHp, amount) };
                try { setOnlineTableBusy(true); await updateEnemyHp(enemy, changes); setEnemyHpModal({ isOpen: false, enemyId: null, mode: 'damage', amount: '' }); } catch (error) { setOnlineTableError('No se pudo actualizar la vida del enemigo.'); } finally { setOnlineTableBusy(false); }
            };
            const deleteEnemy = async (enemyId) => {
                if (!canManageEnemies || !currentRoom) return false;
                try {
                    const outcome = await removeCombatantFromTurnOrder({ roomCode: currentRoom.code, combatantId: enemyId, reason: 'deleted', removeEnemyDocuments: true });
                    if (roomData?.status === 'lobby') {
                        setPreparedTurnOrder(previous => previous.filter(id => id !== enemyId));
                    }
                    setOutsideEncounterEnemyIds(previous => previous.filter(id => id !== enemyId));
                    setSelectedCombatantId(previous => previous === enemyId ? outcome.currentTurnId : previous);
                    return true;
                } catch (error) {
                    console.error('[DeleteEnemyUI] error', error);
                    setOnlineTableError('No se pudo eliminar el enemigo.');
                    return false;
                }
            };
            const openConditionModal = (target, name = '') => setConditionModal({ isOpen: true, target, name, source: '', notes: '' });
            const saveOnlineCondition = async () => {
                const target = conditionModal.target;
                const name = String(conditionModal.name || '').trim();
                if (!target || !name || !currentRoom) return;
                const isMaster = canManageEnemies;
                if (target.type === 'enemy') {
                    if (!isMaster) return;
                    const next = [...normalizeOnlineConditions(target.conditionsVisible), { id: `condition_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name, source: String(conditionModal.source || ''), createdAt: new Date().toISOString() }];
                    await getOnlineServices().api.updateDoc(getOnlineServices().api.doc(getOnlineServices().db, 'rooms', currentRoom.code, 'publicCombatants', target.id), { conditionsVisible: next, updatedAt: getOnlineServices().api.serverTimestamp() });
                } else {
                    if (!isMaster && target.ownerUid !== firebaseUser?.uid) return;
                    const next = [...normalizeOnlineConditions(target.conditions), { id: `condition_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name, source: String(conditionModal.source || ''), notes: String(conditionModal.notes || ''), createdAt: new Date().toISOString() }];
                    const { db, api } = getOnlineServices();
                    await api.updateDoc(api.doc(db, 'rooms', currentRoom.code, 'participants', target.id), { conditions: next, updatedAt: api.serverTimestamp(), lastUpdatedBy: firebaseUser.uid });
                    if (target.ownerUid === firebaseUser?.uid && target.characterId === sharedCharacterId) setConditions(next.map(condition => condition.name));
                }
                setConditionModal({ isOpen: false, target: null, name: '', source: '', notes: '' });
            };
            const removeOnlineCondition = async (target, conditionId) => {
                if (!currentRoom) return;
                const isMaster = canManageEnemies;
                const field = target.type === 'enemy' ? 'conditionsVisible' : 'conditions';
                if ((target.type === 'enemy' && !isMaster) || (target.type !== 'enemy' && !isMaster && target.ownerUid !== firebaseUser?.uid)) return;
                const next = normalizeOnlineConditions(target[field]).filter(condition => condition.id !== conditionId);
                const { db, api } = getOnlineServices();
                const collectionName = target.type === 'enemy' ? 'publicCombatants' : 'participants';
                await api.updateDoc(api.doc(db, 'rooms', currentRoom.code, collectionName, target.id), { [field]: next, updatedAt: api.serverTimestamp(), ...(target.type === 'enemy' ? {} : { lastUpdatedBy: firebaseUser.uid }) });
                if (target.type !== 'enemy' && target.ownerUid === firebaseUser?.uid && target.characterId === sharedCharacterId) setConditions(next.map(condition => condition.name));
            };
            const createEffectId = () => `effect_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
            const openEffectModal = (effect = null) => setEffectModal({ isOpen: true, effectId: effect?.id || null, data: effect ? { ...effect } : { name: '', targetId: ownRoomParticipant?.id || '', targetType: 'player', durationType: 'rounds', remaining: 1, maximum: 1, decrementMoment: 'end-of-round', visibleToPlayers: true, concentration: false, notesPublic: '' } });
            const effectCollectionName = (effect) => effect.visibleToPlayers ? 'effectsPublic' : 'effectsPrivate';
            const canManageEffect = (effect) => roomData?.ownerUid === firebaseUser?.uid || (effect?.ownerUid === firebaseUser?.uid && effect?.targetType === 'player' && effect?.targetId === firebaseUser?.uid);
            const saveEffect = async () => {
                const data = effectModal.data || {};
                const roomCode = currentRoom?.code;
                const isMaster = roomData?.ownerUid === firebaseUser?.uid;
                const validDurationTypes = ['turns', 'rounds', 'minutes', 'manual'];
                const validTargetTypes = ['player', 'enemy', 'global'];
                const validDecrementMoments = ['start-of-target-turn', 'end-of-target-turn', 'start-of-round', 'end-of-round', 'manual'];
                const targetType = validTargetTypes.includes(data.targetType) ? data.targetType : '';
                const selectedTarget = targetType === 'global' ? null : getCombatant(data.targetId);
                const normalizedName = String(data.name || '').trim();
                const durationType = validDurationTypes.includes(data.durationType) ? data.durationType : '';
                const decrementMoment = durationType === 'manual' ? 'manual' : (validDecrementMoments.includes(data.decrementMoment) ? data.decrementMoment : '');
                if (!firebaseReady || !firebaseUser?.uid) { setOnlineTableError('No hay conexión con Firebase.'); return; }
                if (!roomCode || !roomMembers.some(member => member.uid === firebaseUser.uid && member.active)) { setOnlineTableError('No eres miembro activo de esta sala.'); return; }
                if (!normalizedName || !targetType || !durationType || !decrementMoment || (targetType !== 'global' && !selectedTarget)) { setOnlineTableError('El efecto contiene datos no válidos.'); return; }
                if (!isMaster && (targetType !== 'player' || selectedTarget?.ownerUid !== firebaseUser.uid)) { setOnlineTableError('Solo puedes crear efectos para tu personaje.'); return; }
                const isPrivate = isMaster && !data.visibleToPlayers;
                if (!isMaster && isPrivate) { setOnlineTableError('Los jugadores no pueden crear efectos privados.'); return; }
                const effectId = effectModal.effectId || createEffectId();
                const selectedTargetId = targetType === 'global' ? 'global' : (!isMaster && targetType === 'player' ? firebaseUser.uid : selectedTarget.id);
                const effectOwnerUid = targetType === 'player' ? (isMaster ? selectedTarget.ownerUid : firebaseUser.uid) : null;
                const normalizedRemaining = durationType === 'manual' ? null : Math.max(0, Number(data.remaining) || 0);
                const normalizedMaximum = durationType === 'manual' ? null : Math.max(normalizedRemaining, Number(data.maximum) || normalizedRemaining);
                const requiresConcentration = Boolean(data.concentration || data.requiresConcentration);
                const existingConcentration = requiresConcentration && encounterEffects.find(effect => (effect.requiresConcentration || effect.concentration) && !effect.expired && effect.targetId === selectedTargetId && effect.id !== effectId);
                if (existingConcentration) { setOnlineTableError(`Este personaje ya mantiene concentración en ${existingConcentration.name}.`); return; }
                const { db, api } = getOnlineServices();
                const collectionName = isPrivate ? 'effectsPrivate' : 'effectsPublic';
                const effectPath = `rooms/${roomCode}/${collectionName}/${effectId}`;
                const effectRef = api.doc(db, 'rooms', roomCode, collectionName, effectId);
                const effectPayload = isPrivate ? {
                    id: effectId, name: normalizedName, targetId: selectedTargetId, targetType, createdBy: firebaseUser.uid,
                    durationType, remaining: normalizedRemaining, maximum: normalizedMaximum, decrementMoment,
                    expired: false, requiresConcentration, notesPrivate: String(data.notesPrivate || ''),
                    createdAt: api.serverTimestamp(), updatedAt: api.serverTimestamp()
                } : {
                    id: effectId, name: normalizedName, targetId: selectedTargetId, targetType, ownerUid: effectOwnerUid,
                    createdBy: firebaseUser.uid, durationType, remaining: normalizedRemaining, maximum: normalizedMaximum,
                    decrementMoment, visibleToPlayers: true, expired: false, requiresConcentration,
                    notesPublic: String(data.notesPublic || ''), createdAt: api.serverTimestamp(), updatedAt: api.serverTimestamp()
                };
                try {
                    console.log('[Efectos] Ruta:', effectPath);
                    console.log('[Efectos] Tipo:', isPrivate ? 'private' : 'public');
                    console.log('[Efectos] Payload completo:', effectPayload);
                    console.log('[Efectos] Usuario:', { uid: firebaseUser?.uid, roomOwnerUid: roomData?.ownerUid, isMaster: roomData?.ownerUid === firebaseUser?.uid });
                    await api.setDoc(effectRef, effectPayload);
                    setEffectModal({ isOpen: false, effectId: null, data: {} });
                } catch (error) {
                    console.error('[Efectos] Error creando efecto:', { code: error?.code, message: error?.message, name: error?.name, path: effectPath, payload: effectPayload, error });
                    const message = error?.code === 'permission-denied' ? 'Firestore rechazó la creación del efecto por permisos.' : error?.code === 'invalid-argument' ? 'El efecto contiene datos no válidos.' : error?.code === 'unavailable' ? 'No hay conexión con Firebase.' : `No se pudo crear el efecto: ${error?.code || 'error-desconocido'}`;
                    setOnlineTableError(message);
                }
            };
            // Effects only update their duration fields; ownership and targets are immutable here.
            const updateEffectRemaining = async (effect, nextRemaining) => {
                if (!currentRoom || !canManageEffect(effect) || effect.remaining === null) return;
                const normalizedRemaining = Math.max(0, Number(nextRemaining) || 0);
                const payload = { remaining: normalizedRemaining, expired: normalizedRemaining === 0, updatedAt: getOnlineServices().api.serverTimestamp() };
                try {
                    const { db, api } = getOnlineServices();
                    await api.updateDoc(api.doc(db, 'rooms', currentRoom.code, effectCollectionName(effect), effect.id), payload);
                } catch (error) {
                    console.error('[Efectos] Error actualizando duración:', { code: error?.code, message: error?.message, effectId: effect.id, payload });
                    setOnlineTableError(`No se pudo actualizar el efecto: ${error?.code || 'error-desconocido'}`);
                }
            };
            const updateEffect = async (effect, changes) => {
                if (!currentRoom || !canManageEffect(effect)) return;
                const { db, api } = getOnlineServices();
                await api.updateDoc(api.doc(db, 'rooms', currentRoom.code, effectCollectionName(effect), effect.id), { ...changes, updatedAt: api.serverTimestamp() });
            };
            const deleteEffect = async (effect) => { if (!currentRoom || !canManageEffect(effect)) return; const { db, api } = getOnlineServices(); await api.updateDoc(api.doc(db, 'rooms', currentRoom.code, effectCollectionName(effect), effect.id), { expired: true, remaining: effect.remaining === null ? null : 0, updatedAt: api.serverTimestamp() }); };
            const permanentlyDeleteEffect = async (effect) => { if (!currentRoom || !canManageEffect(effect)) return; const { db, api } = getOnlineServices(); const batch = api.writeBatch(db); batch.delete(api.doc(db, 'rooms', currentRoom.code, effectCollectionName(effect), effect.id)); await batch.commit(); };
            const processEffectsForMoment = async (moment, targetId = null) => {
                if (!canManageEnemies || !currentRoom) return;
                const targetOwnerUid = targetId ? getCombatant(targetId)?.ownerUid : null;
                const affected = encounterEffects.filter(effect => !effect.expired && effect.remaining !== null && effect.decrementMoment === moment && (moment.includes('target-turn') ? (effect.targetId === targetId || effect.targetId === targetOwnerUid) : true));
                const { db, api } = getOnlineServices();
                await Promise.all(affected.map(effect => api.runTransaction(db, async transaction => { const ref = api.doc(db, 'rooms', currentRoom.code, effectCollectionName(effect), effect.id); const snapshot = await transaction.get(ref); if (!snapshot.exists()) return; const current = snapshot.data(); if (current.expired || current.remaining === null) return; const remaining = Math.max(0, Number(current.remaining) - 1); transaction.update(ref, { remaining, expired: remaining === 0, updatedAt: api.serverTimestamp() }); })));
            };
            const buildPreparedTurnOrder = () => {
                if (!isCurrentRoomMaster || roomData?.status !== 'lobby') return;
                const ordered = encounterCombatants.slice().sort((left, right) => {
                    const initiativeDifference = Number(right.initiative) - Number(left.initiative);
                    if (initiativeDifference !== 0) return initiativeDifference;
                    return String(left.name || '').localeCompare(String(right.name || '')) || String(left.id).localeCompare(String(right.id));
                }).map(participant => participant.id);
                setPreparedTurnOrder(ordered);
                setEncounterSetupOpen(true);
                setPostponeOpen(false);
            };
            const movePreparedParticipant = (id, direction) => {
                setPreparedTurnOrder(previous => {
                    const index = previous.indexOf(id);
                    const targetIndex = index + direction;
                    if (index < 0 || targetIndex < 0 || targetIndex >= previous.length) return previous;
                    const next = previous.slice();
                    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
                    return next;
                });
            };
            const startEncounter = async () => {
                if (!isCurrentRoomMaster || !currentRoom || roomData?.status !== 'lobby' || encounterBusy) return;
                const missingInitiative = encounterCombatants.filter(participant => !hasInitiativeValue(participant.initiative));
                const order = preparedTurnOrder.filter(id => encounterCombatants.some(participant => participant.id === id));
                if (missingInitiative.length || !order.length || order.length !== encounterCombatants.length) {
                    setOnlineTableError(missingInitiative.length ? `Falta iniciativa: ${missingInitiative.map(participant => participant.name || 'Participante').join(', ')}.` : 'Prepara el orden de turnos antes de iniciar.');
                    return;
                }
                try {
                    const { db, api } = getOnlineServices();
                    setEncounterBusy(true);
                    await api.updateDoc(api.doc(db, 'rooms', currentRoom.code), { status: 'active', round: 1, turnIndex: 0, currentTurnId: order[0], turnOrder: order, updatedAt: api.serverTimestamp() });
                    setEncounterSetupOpen(false);
                    setOnlineTableNotice('Encuentro iniciado.');
                } catch (error) {
                    setOnlineTableError('No se pudo iniciar el encuentro.');
                } finally {
                    setEncounterBusy(false);
                }
            };
            // Turn changes are transactional so simultaneous clients cannot advance twice.
            const changeEncounterTurn = async (direction) => {
                if (!isCurrentRoomMaster || !currentRoom || encounterBusy) return;
                const initiativeUtils = window.OnlineInitiativeUtils;
                const hasInitiativeUtils = Boolean(
                    initiativeUtils &&
                    typeof initiativeUtils.buildCombatantsMap === 'function' &&
                    typeof initiativeUtils.findNextEligibleTurn === 'function' &&
                    typeof initiativeUtils.findPreviousEligibleTurn === 'function'
                );
                if (!hasInitiativeUtils) console.error('[EncounterTurn] OnlineInitiativeUtils no está disponible; se usará el cálculo anterior.');
                try {
                    const { db, api } = getOnlineServices();
                    let transition = null;
                    setEncounterBusy(true);
                    await api.runTransaction(db, async transaction => {
                        const roomRef = api.doc(db, 'rooms', currentRoom.code);
                        const snapshot = await transaction.get(roomRef);
                        if (!snapshot.exists() || snapshot.data().status !== 'active') throw new Error('ENCOUNTER_NOT_ACTIVE');
                        const room = snapshot.data();
                        const order = Array.isArray(room.turnOrder) ? room.turnOrder.filter(Boolean) : [];
                        if (!order.length) throw new Error('EMPTY_TURN_ORDER');
                        let turnIndex = Number.isInteger(room.turnIndex) ? room.turnIndex : 0;
                        turnIndex = Math.max(0, Math.min(turnIndex, order.length - 1));
                        let round = Math.max(1, Number(room.round) || 1);
                        const currentTurnId = room.currentTurnId || order[turnIndex];
                        console.log('[EncounterTurn] antes', { direction, turnOrder: order, turnIndex, currentTurnId, round });
                        const combatantsById = hasInitiativeUtils
                            ? initiativeUtils.buildCombatantsMap(roomParticipants, publicCombatants)
                            : {};
                        let result = null;
                        if (hasInitiativeUtils) result = direction > 0
                            ? initiativeUtils.findNextEligibleTurn({ turnOrder: order, currentIndex: turnIndex, currentRound: round, combatantsById })
                            : initiativeUtils.findPreviousEligibleTurn({ turnOrder: order, currentIndex: turnIndex, currentRound: round, combatantsById });
                        if (!result) {
                            const fallbackIndex = direction > 0 ? (turnIndex + 1) % order.length : (turnIndex - 1 + order.length) % order.length;
                            const fallbackRound = direction > 0 && fallbackIndex === 0 ? round + 1 : direction < 0 && turnIndex === 0 ? Math.max(1, round - 1) : round;
                            result = { nextIndex: fallbackIndex, nextRound: fallbackRound, nextId: order[fallbackIndex] };
                        }
                        console.log('[EncounterTurn] resultado', result);
                        if (!Number.isInteger(result.nextIndex) || result.nextIndex < 0 || result.nextIndex >= order.length || !result.nextId || result.nextId !== order[result.nextIndex] || !Number.isFinite(Number(result.nextRound))) {
                            console.error('[EncounterTurn] Resultado inválido', result);
                            throw new Error('INVALID_TURN_RESULT');
                        }
                        transaction.update(roomRef, { round: Math.max(1, Number(result.nextRound)), turnIndex: result.nextIndex, currentTurnId: result.nextId, updatedAt: api.serverTimestamp() });
                        transition = { previousId: currentTurnId, nextId: result.nextId, roundChanged: Number(result.nextRound) !== round };
                    });
                    if (transition) {
                        await processEffectsForMoment('end-of-target-turn', transition.previousId);
                        if (transition.roundChanged) await processEffectsForMoment('end-of-round');
                        if (transition.roundChanged) await processEffectsForMoment('start-of-round');
                        await processEffectsForMoment('start-of-target-turn', transition.nextId);
                    }
                } catch (error) {
                    setOnlineTableError('No se pudo cambiar el turno.');
                } finally {
                    setEncounterBusy(false);
                }
            };
            const setEncounterStatus = async (status) => {
                if (!isCurrentRoomMaster || !currentRoom || encounterBusy) return;
                try {
                    const { db, api } = getOnlineServices();
                    setEncounterBusy(true);
                    await api.updateDoc(api.doc(db, 'rooms', currentRoom.code), { status, updatedAt: api.serverTimestamp() });
                } catch (error) {
                    setOnlineTableError(status === 'paused' ? 'No se pudo pausar el encuentro.' : 'No se pudo reanudar el encuentro.');
                } finally {
                    setEncounterBusy(false);
                }
            };
            const finishEncounter = async (removeEnemies = false) => {
                if (!isCurrentRoomMaster || !currentRoom || encounterBusy) return;
                try {
                    const { db, api } = getOnlineServices();
                    setEncounterBusy(true);
                    if (removeEnemies) {
                        const batch = api.writeBatch(db);
                        batch.update(api.doc(db, 'rooms', currentRoom.code), { status: 'lobby', round: 0, turnIndex: 0, currentTurnId: null, turnOrder: [], updatedAt: api.serverTimestamp() });
                        [...new Set([...publicCombatants.map(enemy => enemy.id), ...privateEnemies.map(enemy => enemy.id)])].forEach(enemyId => {
                            batch.delete(api.doc(db, 'rooms', currentRoom.code, 'publicCombatants', enemyId));
                            batch.delete(api.doc(db, 'rooms', currentRoom.code, 'privateEnemies', enemyId));
                        });
                        await batch.commit();
                    } else {
                        await api.updateDoc(api.doc(db, 'rooms', currentRoom.code), { status: 'lobby', round: 0, turnIndex: 0, currentTurnId: null, turnOrder: [], updatedAt: api.serverTimestamp() });
                    }
                    setEncounterSetupOpen(false);
                    setPreparedTurnOrder([]);
                    setPostponeOpen(false);
                    setFinishEncounterPrompt(false);
                    setOnlineTableNotice('Encuentro finalizado.');
                } catch (error) {
                    setOnlineTableError('No se pudo finalizar el encuentro.');
                } finally {
                    setEncounterBusy(false);
                }
            };
            const postponeCurrentTurn = async (mode, targetId = null) => {
                if (!isCurrentRoomMaster || !currentRoom || encounterBusy) return;
                const initiativeUtils = window.OnlineInitiativeUtils;
                const hasInitiativeUtils = Boolean(
                    initiativeUtils &&
                    typeof initiativeUtils.moveCurrentCombatant === 'function'
                );
                if (!hasInitiativeUtils) console.error('[Postpone] OnlineInitiativeUtils no está disponible; se usará el cálculo anterior.');
                try {
                    const { db, api } = getOnlineServices();
                    setEncounterBusy(true);
                    await api.runTransaction(db, async transaction => {
                        const roomRef = api.doc(db, 'rooms', currentRoom.code);
                        const snapshot = await transaction.get(roomRef);
                        if (!snapshot.exists() || snapshot.data().status !== 'active') throw new Error('ENCOUNTER_NOT_ACTIVE');
                        const room = snapshot.data();
                        const order = Array.isArray(room.turnOrder) ? room.turnOrder.filter(Boolean) : [];
                        const currentIndex = Math.max(0, Math.min(Number(room.turnIndex) || 0, order.length - 1));
                        const round = Math.max(1, Number(room.round) || 1);
                        if (order.length < 2 || !order[currentIndex]) throw new Error('INVALID_TURN_ORDER');
                        const currentTurnId = room.currentTurnId || order[currentIndex];
                        const destinationMode = mode === 'before' ? 'before-combatant' : mode;
                        console.log('[Postpone] antes', {
                            turnOrder: order,
                            currentTurnId,
                            turnIndex: currentIndex,
                            round,
                            destinationMode,
                            destinationId: targetId
                        });
                        let result = hasInitiativeUtils
                            ? initiativeUtils.moveCurrentCombatant({
                                turnOrder: order,
                                currentTurnId,
                                destinationMode,
                                destinationId: targetId
                            })
                            : null;
                        if (!result) {
                            const remainingOrder = order.filter(id => id !== currentTurnId);
                            let insertionIndex = remainingOrder.length;
                            if (destinationMode === 'after-next') {
                                const nextId = order[(currentIndex + 1) % order.length];
                                const nextIndex = remainingOrder.indexOf(nextId);
                                insertionIndex = nextIndex >= 0 ? nextIndex + 1 : remainingOrder.length;
                            } else if (destinationMode === 'before-combatant') {
                                const targetIndex = remainingOrder.indexOf(targetId);
                                insertionIndex = targetIndex >= 0 ? targetIndex : remainingOrder.length;
                            } else if (destinationMode === 'after-combatant') {
                                const targetIndex = remainingOrder.indexOf(targetId);
                                insertionIndex = targetIndex >= 0 ? targetIndex + 1 : remainingOrder.length;
                            }
                            const turnOrder = [...remainingOrder.slice(0, insertionIndex), currentTurnId, ...remainingOrder.slice(insertionIndex)];
                            result = { valid: true, turnOrder, turnIndex: turnOrder.indexOf(currentTurnId), currentTurnId };
                        }
                        console.log('[Postpone] resultado', result);
                        if (!result.valid || !Array.isArray(result.turnOrder) || result.turnOrder.length !== order.length || new Set(result.turnOrder).size !== result.turnOrder.length || !Number.isInteger(result.turnIndex) || result.turnIndex < 0 || result.turnIndex >= result.turnOrder.length || result.currentTurnId !== currentTurnId || result.turnOrder[result.turnIndex] !== currentTurnId) {
                            console.error('[Postpone] Resultado inválido', result);
                            throw new Error('INVALID_POSTPONE_RESULT');
                        }
                        transaction.update(roomRef, {
                            turnOrder: result.turnOrder,
                            turnIndex: result.turnIndex,
                            currentTurnId: result.currentTurnId,
                            updatedAt: api.serverTimestamp()
                        });
                    });
                    setPostponeOpen(false);
                } catch (error) {
                    setOnlineTableError('No se pudo postergar el turno.');
                } finally {
                    setEncounterBusy(false);
                }
            };
            const resetOnlineTable = () => {
                cleanupOnlineTableListeners();
                roomRestoreAttemptedRef.current = true;
                if (hpSyncTimerRef.current) window.clearTimeout(hpSyncTimerRef.current);
                if (hpConfirmTimerRef.current) window.clearTimeout(hpConfirmTimerRef.current);
                hpSyncTimerRef.current = null;
                hpConfirmTimerRef.current = null;
                applyingRemoteHpRef.current = null;
                lastSentHpPayloadRef.current = null;
                hpConflictHandledRef.current = null;
                hpSyncContextRef.current = null;
                conditionsSyncRef.current = { key: null, hash: null };
                setCurrentRoom(null);
                setRoomData(null);
                setRoomMembers([]);
                setRoomParticipants([]);
                setPublicCombatants([]);
                setPrivateEnemies([]);
                setPublicEffects([]);
                setPrivateEffects([]);
                setParticipantsHavePendingWrites(false);
                setSharedCharacterId(null);
                setShareCharacterOpen(false);
                setSharingCharacter(false);
                setEncounterSetupOpen(false);
                setPreparedTurnOrder([]);
                setPostponeOpen(false);
                setEnemyModal({ isOpen: false, mode: 'create', enemyId: null, data: {} });
                setEnemyHpModal({ isOpen: false, enemyId: null, mode: 'damage', amount: '' });
                setFinishEncounterPrompt(false);
                setHpConflict(null);
                setHpSyncStatus('idle');
                setCreatedRoomCode('');
                saveOnlineRoomSession(null);
                setOnlineTableScreen('menu');
            };
            const openOnlineTable = () => {
                setOnlineTableError('');
                setOnlineTableNotice('');
                setOnlineTableScreen(currentRoom ? 'lobby' : 'menu');
                setOnlineTableOpen(true);
            };
            const createOnlineRoom = async () => {
                try {
                    const { db, api, uid } = getOnlineServices();
                    setOnlineTableBusy(true);
                    setOnlineTableError('');
                    for (let attempt = 0; attempt < 12; attempt += 1) {
                        const code = generateRoomCode();
                        try {
                            await api.runTransaction(db, async transaction => {
                                const roomRef = api.doc(db, 'rooms', code);
                                if ((await transaction.get(roomRef)).exists()) throw new Error('ROOM_CODE_EXISTS');
                                transaction.set(roomRef, { code, ownerUid: uid, status: 'lobby', round: 0, currentTurnId: null, turnOrder: [], turnIndex: 0, schemaVersion: 1, createdAt: api.serverTimestamp(), updatedAt: api.serverTimestamp() });
                                const masterMemberPayload = { uid, role: 'master', displayName: 'Máster', active: true, joinedAt: api.serverTimestamp() };
                                console.log('[Mesa] Escritura member:', { operation: 'create-master-member', roomCode: code, uid, payload: masterMemberPayload });
                                transaction.set(api.doc(db, 'rooms', code, 'members', uid), masterMemberPayload);
                            });
                            setCreatedRoomCode(code);
                            setOnlineTableScreen('created');
                            setOnlineTableNotice('Sala creada.');
                            return;
                        } catch (error) {
                            if (error?.message !== 'ROOM_CODE_EXISTS') throw error;
                        }
                    }
                    throw new Error('No se pudo generar un código único.');
                } catch (error) {
                    setOnlineTableError(error.message === 'No hay conexión con Firebase.' ? error.message : 'No se pudo crear la sala.');
                } finally {
                    setOnlineTableBusy(false);
                }
            };
            const joinOnlineRoom = async (providedCode = roomCodeInput) => {
                const code = normalizeRoomCode(providedCode);
                if (code.length !== 6) { setOnlineTableError('Código inválido.'); return; }
                try {
                    setOnlineTableBusy(true);
                    setOnlineTableError('');
                    const membership = await resolveRoomMembership(code, true);
                    activateRoomSession(code, membership);
                    setOnlineReconnectState({ status: 'idle', message: '' });
                    setOnlineTableNotice(membership.role === 'master' ? 'Has vuelto a entrar como Máster.' : 'Te has unido a la sala.');
                } catch (error) {
                    const errorMessages = {
                        ROOM_NOT_FOUND: 'Sala no encontrada.',
                        ROOM_CLOSED: 'Sala cerrada.',
                        MEMBER_NOT_FOUND: 'Ya no eres miembro de esta sala.',
                        INVALID_MEMBERSHIP: 'La membresía de la sala no es válida.',
                        'permission-denied': 'Error de permisos al unirse a la sala.'
                    };
                    setOnlineTableError(errorMessages[error.code] || errorMessages[error.message] || (error.message === 'No hay conexión con Firebase.' ? error.message : 'No se pudo unir a la sala.'));
                } finally {
                    setOnlineTableBusy(false);
                }
            };
            const leaveOnlineRoom = async () => {
                if (!currentRoom) return;
                try {
                    const { db, api, uid } = getOnlineServices();
                    const participantRef = api.doc(db, 'rooms', currentRoom.code, 'participants', uid);
                    if ((await api.getDoc(participantRef)).exists()) await api.updateDoc(participantRef, { connected: false, updatedAt: api.serverTimestamp() });
                    const leavePayload = { active: false };
                    console.log('[Mesa] Escritura member:', { operation: 'leave-member', roomCode: currentRoom.code, uid, payload: leavePayload });
                    await api.updateDoc(api.doc(db, 'rooms', currentRoom.code, 'members', uid), leavePayload);
                } catch (error) {
                    console.error('[Mesa] Error member:', error.code, error.message, error);
                    setOnlineTableError('No se pudo salir de la sala.');
                    return;
                }
                resetOnlineTable();
            };
            const closeOnlineRoom = async () => {
                if (!currentRoom || roomData?.ownerUid !== firebaseUser?.uid) return;
                try {
                    const { db, api } = getOnlineServices();
                    await api.updateDoc(api.doc(db, 'rooms', currentRoom.code), { status: 'closed', updatedAt: api.serverTimestamp() });
                    setRoomData(previous => ({ ...(previous || {}), status: 'closed' }));
                    cleanupOnlineTableListeners();
                    saveOnlineRoomSession(null);
                    setOnlineTableNotice('Sala cerrada. Los miembros pueden salir.');
                } catch (error) {
                    setOnlineTableError('No se pudo cerrar la sala.');
                }
            };
            const getRoomShareUrl = (code) => {
                const url = new URL(window.location.href);
                url.searchParams.set('room', code);
                return url.toString();
            };
            const copyRoomCode = async (value, label = 'Código copiado.') => {
                try {
                    await navigator.clipboard.writeText(value);
                    setOnlineTableNotice(label);
                } catch (error) {
                    setOnlineTableError('No se pudo copiar el código.');
                }
            };
            const shareRoomLink = async (code) => {
                const url = getRoomShareUrl(code);
                try {
                    if (navigator.share) await navigator.share({ title: 'Mesa online D&D', text: `Únete a la sala ${code}`, url });
                    else await copyRoomCode(url, 'Enlace copiado.');
                } catch (error) {
                    if (error?.name !== 'AbortError') setOnlineTableError('No se pudo compartir el enlace.');
                }
            };
            const restoreRoomSession = async (force = false) => {
                if (!lastOnlineRoom?.code || (!force && roomRestoreAttemptedRef.current)) return;
                roomRestoreAttemptedRef.current = true;
                try {
                    setOnlineReconnectState({ status: 'reconnecting', message: 'Reconectando a la mesa…' });
                    const membership = await resolveRoomMembership(lastOnlineRoom.code, false);
                    activateRoomSession(lastOnlineRoom.code, membership);
                    setOnlineTableOpen(true);
                    setOnlineReconnectState({ status: 'idle', message: '' });
                } catch (error) {
                    console.error('[Mesa] Error al restaurar:', error.code, error);
                    const messageByCode = {
                        ROOM_NOT_FOUND: 'La sala anterior ya no existe.',
                        ROOM_CLOSED: 'La sala anterior fue cerrada.',
                        MEMBER_NOT_FOUND: 'Ya no eres miembro de esta sala.',
                        INVALID_MEMBERSHIP: 'La membresía de la sala no es válida.',
                        'permission-denied': 'Error de permisos al restaurar la sesión.'
                    };
                    const message = messageByCode[error.code] || messageByCode[error.message];
                    if (message && ['ROOM_NOT_FOUND', 'ROOM_CLOSED', 'MEMBER_NOT_FOUND', 'INVALID_MEMBERSHIP'].includes(error.code || error.message)) {
                        saveOnlineRoomSession(null);
                        setRoomCodeInput(lastOnlineRoom.code);
                        setOnlineReconnectState({ status: 'idle', message });
                        return;
                    }
                    setOnlineReconnectState({ status: 'error', message: error?.message === 'No hay conexión con Firebase.' ? 'No se pudo reconectar. Reintentar.' : 'No se pudo restaurar la sesión. Reintentar.' });
                }
            };
            const retryRoomConnection = () => {
                roomRestoreAttemptedRef.current = false;
                restoreRoomSession(true);
            };

            useEffect(() => {
                const roomFromUrl = normalizeRoomCode(new URLSearchParams(window.location.search).get('room'));
                if (roomFromUrl.length !== 6) return;
                setRoomCodeInput(roomFromUrl);
                setOnlineTableScreen('join');
                setOnlineTableOpen(true);
            }, []);
            useEffect(() => {
                if (!firebaseReady || !firebaseUser?.uid || currentRoom || !lastOnlineRoom?.code) return;
                restoreRoomSession();
            }, [firebaseReady, firebaseUser?.uid, currentRoom, lastOnlineRoom?.code]);
            useEffect(() => {
                if (roomData?.currentTurnId) setSelectedCombatantId(previous => previous || roomData.currentTurnId);
            }, [roomData?.currentTurnId]);
            useEffect(() => {
                if (onlineTableView === 'encounter') setOnlineEncounterView('encounter');
            }, [onlineTableView]);
            useEffect(() => {
                if (!onlineTableOpen) return;
                const savedPosition = onlineTableScrollPositionsRef.current[onlineTableView];
                const outerScrollTop = Number.isFinite(savedPosition) ? savedPosition : savedPosition?.outer;
                const innerScrollTop = savedPosition?.inner;
                if (!Number.isFinite(outerScrollTop) && !Number.isFinite(innerScrollTop)) return;
                const frame = requestAnimationFrame(() => {
                    if (Number.isFinite(outerScrollTop) && onlineTableContentRef.current) onlineTableContentRef.current.scrollTop = outerScrollTop;
                    if (Number.isFinite(innerScrollTop) && onlineTableViewContentRef.current) onlineTableViewContentRef.current.scrollTop = innerScrollTop;
                });
                return () => cancelAnimationFrame(frame);
            });
            useEffect(() => () => cleanupOnlineTableListeners(), []);
            useEffect(() => {
                if (!onlineTableOpen) {
                    setOnlineTableMenuOpen(false);
                    return;
                }
                const previousBodyOverflow = document.body.style.overflow;
                const previousDocumentOverflow = document.documentElement.style.overflow;
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
                return () => {
                    document.body.style.overflow = previousBodyOverflow;
                    document.documentElement.style.overflow = previousDocumentOverflow;
                };
            }, [onlineTableOpen]);

            const characterList = Object.values(manager.characters).sort((a, b) => b.meta.updatedAt.localeCompare(a.meta.updatedAt));
            const selectManagedCharacter = (id) => {
                selectCharacter(id);
                setCharacterManagerOpen(false);
                setNotesModalOpen(false);
                setSkillModal({ isOpen: false, skillKey: null, skillName: '' });
                setAddModal({ isOpen: false, type: null, data: {} });
            };
            const createManagedCharacter = () => {
                createCharacter();
                setCharacterManagerOpen(false);
                setCharacterCreationWizardOpen(true);
            };
            const deleteManagedCharacter = (id) => {
                if (characterList.length <= 1) {
                    showAlert('No puedes eliminar el único personaje. Crea otro personaje antes de borrar esta ficha.');
                    return;
                }
                const name = manager.characters[id]?.meta.name || 'este personaje';
                confirmDelete(`¿Eliminar definitivamente a ${name}? Esta acción no se puede deshacer.`, () => deleteCharacter(id));
            };
            const buildCharacterExport = (character) => {
                const payload = createExportPayload(character);
                const content = JSON.stringify(payload, null, 2);
                const fileName = createSafeExportFileName(character.meta.name);
                return { content, fileName, blob: new Blob([content], { type: 'application/json' }) };
            };
            const exportCharacter = (characterId = manager.activeCharacterId) => {
                const character = manager.characters[characterId];
                if (!character) return;
                const { blob, fileName } = buildCharacterExport(character);
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                link.remove();
                requestAnimationFrame(() => URL.revokeObjectURL(url));
            };
            const supportsFileSharing = (() => {
                try {
                    return typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && typeof File !== 'undefined' && navigator.canShare({ files: [new File(['{}'], 'personaje.json', { type: 'application/json' })] });
                } catch (error) {
                    return false;
                }
            })();
            const shareCharacterFile = async (characterId = manager.activeCharacterId) => {
                const character = manager.characters[characterId];
                if (!character) return;
                const { content, fileName } = buildCharacterExport(character);
                const file = new File([content], fileName, { type: 'application/json' });
                if (!supportsFileSharing || !navigator.canShare({ files: [file] })) {
                    exportCharacter(characterId);
                    return;
                }
                try {
                    await navigator.share({ title: character.meta.name || 'Personaje D&D', text: `Ficha de ${character.meta.name || 'personaje'}`, files: [file] });
                } catch (error) {
                    if (error?.name !== 'AbortError') showAlert('No se pudo compartir el personaje.');
                }
            };
            const handleImportFile = (event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (!file) return;
                if (file.size > MAX_IMPORT_FILE_SIZE) {
                    showAlert('El archivo supera el límite de 1 MB.');
                    return;
                }
                const reader = new FileReader();
                reader.onerror = () => showAlert('No se pudo leer el archivo seleccionado.');
                reader.onload = () => {
                    try {
                        const character = validateImportedCharacter(getImportedCharacter(JSON.parse(reader.result)));
                        setPendingImport(character);
                    } catch (error) {
                        showAlert(error.message || 'El archivo no es válido.');
                    }
                };
                reader.readAsText(file);
            };
            const confirmImportCharacter = () => {
                if (!pendingImport) return;
                importCharacter(pendingImport);
                setPendingImport(null);
                setCharacterManagerOpen(false);
            };
            const handlePortraitFile = async (event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (!file) return;
                const characterId = activeCharacter.meta.id;
                try {
                    const portrait = await resizePortraitFile(file);
                    setPortrait(characterId, portrait);
                } catch (error) {
                    showAlert(error.message || 'No se pudo guardar el retrato.');
                }
            };
            const removePortrait = () => {
                if (!activeCharacter.meta.portrait) return;
                confirmDelete('¿Eliminar el retrato de este personaje?', () => setPortrait(activeCharacter.meta.id, ''));
            };

            const addCurrency = (type, amount) => {
                setCurrency(prev => {
                    const current = Math.max(0, Number(prev[type]) || 0);
                    return { ...prev, [type]: String(Math.max(0, current + amount)) };
                });
            };
            const updateCurrencyAmount = (type, value) => {
                setCurrency(previous => ({ ...previous, [type]: value === '' ? '' : String(Math.max(0, Number(value) || 0)) }));
            };

            const adjustInvQty = (id, delta) => {
                setInventory(prev => prev.map(item => {
                    if (item.id === id) {
                        return { ...item, qty: Math.max(0, (Number(item.qty)||0) + delta) };
                    }
                    return item;
                }));
            };
            const updateWeaponAmmo = (weaponId, changes) => {
                setWeapons(previous => previous.map(weapon => weapon.id === weaponId ? { ...weapon, ...changes } : weapon));
            };
            const spendWeaponAmmo = (weaponId) => {
                const weapon = weapons.find(item => item.id === weaponId);
                if (!weapon?.usesAmmo) return;
                const amount = Math.max(1, Math.trunc(Number(weapon.ammoPerShot) || 1));
                const ammo = inventory.find(item => item.id === weapon.ammoItemId);
                if (!ammo) {
                    showAlert('Vincula esta arma con una pila de munición de la mochila antes de disparar.');
                    return;
                }
                if ((Number(ammo.qty) || 0) < amount) {
                    showAlert(`No quedan suficientes unidades de ${ammo.name}.`);
                    return;
                }
                setInventory(previous => previous.map(item => item.id === ammo.id ? { ...item, qty: Math.max(0, (Number(item.qty) || 0) - amount) } : item));
            };

            const adjustSpellSlot = (lvl, delta) => {
                setSpellSlots(prev => {
                    const current = Number(prev[lvl].current) || 0;
                    const max = Number(prev[lvl].max) || 0;
                    const newCurrent = Math.max(0, Math.min(max, current + delta));
                    return { ...prev, [lvl]: { ...prev[lvl], current: newCurrent } };
                });
            };

            const timerTypeLabels = { turns: 'Turnos', rounds: 'Rondas', minutes: 'Minutos', hours: 'Horas', days: 'Días' };
            const getTimerRemaining = (timer) => {
                const unit = REAL_TIMER_UNITS[timer.type];
                if (!unit) return Math.max(0, Number(timer.current) || 0);
                const expiration = Date.parse(timer.expiresAt);
                return Number.isFinite(expiration) ? Math.max(0, Math.ceil((expiration - timerNow) / unit)) : Math.max(0, Number(timer.current) || 0);
            };
            const formatTimerRemaining = (timer) => {
                const unit = REAL_TIMER_UNITS[timer.type];
                if (!unit) return `${getTimerRemaining(timer)} ${timerTypeLabels[timer.type]}`;
                const expiration = Date.parse(timer.expiresAt);
                const milliseconds = Number.isFinite(expiration) ? Math.max(0, expiration - timerNow) : getTimerRemaining(timer) * unit;
                const totalSeconds = Math.ceil(milliseconds / 1000);
                const seconds = totalSeconds % 60;
                const totalMinutes = Math.floor(totalSeconds / 60);
                if (timer.type === 'minutes') return `${totalMinutes} min ${seconds} s`;
                if (totalSeconds < 60 * 60) return `${totalMinutes} min ${seconds} s`;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return `${hours} h ${minutes} min`;
            };
            const setTimerRemaining = (id, value) => setTimers(previous => previous.map(timer => {
                if (timer.id !== id) return timer;
                const current = Math.max(0, Number(value) || 0);
                return REAL_TIMER_UNITS[timer.type] ? { ...timer, current, expiresAt: new Date(Date.now() + current * REAL_TIMER_UNITS[timer.type]).toISOString() } : { ...timer, current };
            }));
            const sortedTimers = timers.slice().sort((a, b) => getTimerRemaining(a) - getTimerRemaining(b) || a.name.localeCompare(b.name));
            const openTimerModal = (timer = null) => setTimerModal(timer ? { isOpen: true, id: timer.id, data: { ...timer, current: String(getTimerRemaining(timer)) } } : { isOpen: true, id: null, data: { name: '', current: '1', max: '', type: 'turns' } });
            const saveTimer = () => {
                const name = timerModal.data.name.trim();
                if (!name) {
                    showAlert('Indica un nombre para el temporizador.');
                    return;
                }
                const current = Math.max(0, Number(timerModal.data.current) || 0);
                const nextTimer = normalizeTimer({ ...timerModal.data, id: timerModal.id || `timer_${Date.now()}`, name, current, expiresAt: REAL_TIMER_UNITS[timerModal.data.type] ? new Date(Date.now() + current * REAL_TIMER_UNITS[timerModal.data.type]).toISOString() : '' });
                setTimers(previous => timerModal.id ? previous.map(timer => timer.id === timerModal.id ? nextTimer : timer) : [...previous, nextTimer]);
                setTimerModal({ isOpen: false, id: null, data: { name: '', current: '1', max: '', type: 'turns' } });
            };
            const adjustTimer = (id, delta) => {
                const timer = timers.find(item => item.id === id);
                if (timer) setTimerRemaining(id, getTimerRemaining(timer) + delta);
            };

            const updateHpFromEvent = (e) => {
                const target = e.currentTarget || hpBarRef.current;
                if (!target) return;
                const rect = target.getBoundingClientRect();
                if (!rect.width) return;
                const clientX = e.clientX;
                let percentage = (clientX - rect.left) / rect.width;
                percentage = Math.max(0, Math.min(1, percentage));
                const newHp = Math.round((Number(hp.max) || 1) * percentage);
                setHp(p => ({ ...p, current: String(newHp) }));
            };

            const handleHpPointerDown = (e) => {
                setIsDraggingHp(true);
                e.currentTarget.setPointerCapture(e.pointerId);
                updateHpFromEvent(e);
            };

            const handleHpPointerMove = (e) => {
                if (isDraggingHp) {
                    updateHpFromEvent(e);
                }
            };

            const handleHpPointerUp = (e) => {
                setIsDraggingHp(false);
                if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
            };

            const handleAddSubmit = () => {
                const { type, data } = addModal;
                if (type === 'item' && data.name) setInventory([...inventory, { id: 'inv_' + Date.now(), name: data.name, qty: Number(data.qty) || 1, desc: data.desc || "" }]);
                if (type === 'armor' && data.name) setArmors([...armors, { id: 'arm_' + Date.now(), name: data.name, type: data.type || 'light', ac: Number(data.ac) || 11, stealthDis: data.stealthDis || false, equipped: false }]);
                if (type === 'tool' && data.name) setTools([...tools, { id: 'tool_' + Date.now(), name: data.name, desc: data.desc || "" }]);
                if (type === 'trait' && data.title) setTraits([...traits, { title: data.title, desc: data.desc }]);
                if (type === 'feat' && data.title) setFeats([...feats, { title: data.title, desc: data.desc }]);
                if (type === 'weapon' && data.name) {
                    const attacks = Array.isArray(data.attacks) ? data.attacks.map(attack => ({ ...attack })) : [];
                    const newWp = {
                        id: 'wp_' + Date.now(),
                        name: data.name,
                        attacks,
                        usesAmmo: data.usesAmmo === undefined
                            ? attacks.some(attack => /munici[oó]n/i.test(String(attack.notes || '')))
                            : data.usesAmmo === true,
                        ammoItemId: data.ammoItemId || '',
                        ammoPerShot: Math.max(1, Math.trunc(Number(data.ammoPerShot) || 1))
                    };
                    setWeapons([...weapons, newWp]);
                    setSelectedWeaponId(newWp.id);
                }
                if (type === 'attack' && data.name && selectedWeaponId) {
                    setWeapons(weapons.map(w => w.id === selectedWeaponId ? 
                        { ...w, attacks: [...w.attacks, { name: data.name, atk: data.atk, dmg: data.dmg, notes: data.notes, autoAttack: data.autoAttack === true, attackAbility: data.attackAbility || '', proficient: data.proficient === true, autoProficiency: data.autoProficiency === true, weaponName: data.weaponName || w.name, weaponCategory: data.weaponCategory || '', magicBonus: Number(data.magicBonus) || 0 }] } : w
                    ));
                }
                if (type === 'resource' && data.name) {
                    setResources([...resources, { id: 'res_' + Date.now(), name: data.name, current: Number(data.max)||0, max: Number(data.max)||0, type: data.dice || '', recoveryRest: data.recoveryRest || 'manual', recoveryMode: data.recoveryMode || 'full', recoveryAmount: Number(data.recoveryAmount) || 0 }]);
                }
                if (type === 'spell' && data.name) {
                    const level = Math.max(0, Math.min(9, Number(data.level)));
                    const knownCount = spells.filter(spell => spell.level > 0 && spell.known && spell.countsKnownLimit !== false && !automaticSpellSourceIds.has(spell.sourceId)).length;
                    const cantripCount = spells.filter(spell => spell.level === 0 && spell.known && spell.countsKnownLimit !== false && !automaticSpellSourceIds.has(spell.sourceId)).length;
                    const countsAgainstLimit = data.countsKnownLimit ?? (data.grantType || 'standard') === 'standard';
                    if (countsAgainstLimit && ((level === 0 && grimoireConfig.useCantripLimit && cantripCount >= (Number(grimoireConfig.cantripLimit) || 0)) || (level > 0 && grimoireConfig.useKnownLimit && knownCount >= (Number(grimoireConfig.knownLimit) || 0)))) {
                        showAlert('Has alcanzado el límite configurado para ese tipo de conjuro.');
                    } else setSpells([...spells, normalizeSpell({ ...data, id: 'sp_' + Date.now(), level, known: true, prepared: false })]);
                }
                setAddModal({ isOpen: false, type: null, data: {} });
            };

            const addSuggestedClassResources = () => {
                const existingNames = new Set(resources.map(resource => normalizeRuleLookupText(resource.name)));
                const missingSuggestions = suggestedClassResources.filter(suggestion => !suggestion.aliases.some(alias => existingNames.has(normalizeRuleLookupText(alias))));
                const outdatedSuggestions = suggestedClassResources.filter(suggestion => resources.some(resource => resource.source === 'class-suggestion'
                    && suggestion.aliases.some(alias => normalizeRuleLookupText(alias) === normalizeRuleLookupText(resource.name))
                    && (Number(resource.max) !== Number(suggestion.max) || resource.type !== suggestion.type || resource.recoveryRest !== suggestion.recoveryRest)));
                if (!missingSuggestions.length && !outdatedSuggestions.length) {
                    showAlert('Ya tienes los recursos sugeridos para esta clase y nivel. Tus valores actuales no se han modificado.');
                    return;
                }

                const applySuggestions = () => {
                    const stamp = Date.now();
                    setResources(previous => {
                        const updated = previous.map(resource => {
                            const suggestion = suggestedClassResources.find(candidate => candidate.aliases.some(alias => normalizeRuleLookupText(alias) === normalizeRuleLookupText(resource.name)));
                            if (!suggestion || resource.source !== 'class-suggestion') return resource;
                            return { ...resource, max: suggestion.max, type: suggestion.type, recoveryRest: suggestion.recoveryRest, recoveryMode: suggestion.recoveryMode };
                        });
                        return [...updated, ...missingSuggestions.map((suggestion, index) => ({
                            id: `res_rule_${stamp}_${index}`,
                            name: suggestion.name,
                            current: suggestion.max,
                            max: suggestion.max,
                            type: suggestion.type,
                            recoveryRest: suggestion.recoveryRest,
                            recoveryMode: suggestion.recoveryMode,
                            recoveryAmount: 0,
                            source: 'class-suggestion'
                        }))];
                    });
                    const notices = [];
                    if (missingSuggestions.length) notices.push(`${missingSuggestions.length === 1 ? 'Añadido' : 'Añadidos'}: ${missingSuggestions.map(suggestion => suggestion.name).join(', ')}.`);
                    if (outdatedSuggestions.length) notices.push('Se ha actualizado su máximo sugerido sin recuperar usos gastados.');
                    showAlert(notices.join(' '));
                };

                if (outdatedSuggestions.length) {
                    setConfirmDialog({
                        isOpen: true,
                        message: `Hay ${outdatedSuggestions.length === 1 ? 'un recurso sugerido que necesita actualizarse' : `${outdatedSuggestions.length} recursos sugeridos que necesitan actualizarse`} por el nivel actual. Se conservarán los usos gastados.`,
                        onConfirm: applySuggestions,
                        isAlert: false
                    });
                    return;
                }
                applySuggestions();
            };

            const getSrdSpellDiceDetails = (librarySpell) => {
                const description = librarySpell?.description || '';
                const sentences = description.match(/[^.!?]+[.!?]?/g) || [];
                const details = [];
                let previousDetail = null;

                sentences.forEach(rawSentence => {
                    const sentence = rawSentence.replace(/\s+/g, ' ').trim();
                    const dice = sentence.match(/\b\d+d\d+(?:\s*[+\-]\s*(?:\d+|tu modificador[^.,;)]*))?/i)?.[0];
                    if (!dice) return;

                    const hasDamage = /da\u00f1o/i.test(sentence);
                    const damageType = sentence.match(/da\u00f1o de ([a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc\u00f1]+)/i)?.[1];
                    const hasHealingVerb = /\b(recuper(?:a|an|ar|ar\u00e1|ar\u00e1n|en)|restaur(?:a|an|ar|ar\u00e1|ar\u00e1n|en)|cur(?:a|an|ar|ar\u00e1|ar\u00e1n|en)|recobr(?:a|an|ar|ar\u00e1|ar\u00e1n|en)|san(?:a|an|ar|ar\u00e1|ar\u00e1n|en))\b/i.test(sentence);
                    const hasHealingNegation = /\bno\s+(?:puede|podr\u00e1|puedan|puedas)?\s*(?:recuper\w*|restaur\w*|cur\w*)\b/i.test(sentence);
                    const isHealing = !hasDamage && hasHealingVerb && !hasHealingNegation && /puntos de golpe/i.test(sentence);
                    const isHitPointPool = /total de puntos de golpe|puntos de golpe (?:de las criaturas|a las que puede afectar|actuales)/i.test(sentence);
                    const isBonus = !hasDamage && !isHealing && /bonificador|a\u00f1ade|a\u00f1adir|sumas|suma/i.test(sentence);
                    const isScaling = /por cada nivel|nivel por encima|el da\u00f1o del conjuro aumenta|la curaci\u00f3n aumenta/i.test(sentence);
                    const cantripLevels = [...sentence.matchAll(/nivel (\d+)/gi)].map(match => match[1]);

                    let kind = '';
                    let baseLabel = '';
                    if (hasDamage) {
                        kind = 'damage';
                        baseLabel = damageType ? `Daño ${damageType}` : 'Daño';
                    } else if (isHealing) {
                        kind = 'healing';
                        baseLabel = 'Curación';
                    } else if (isHitPointPool) {
                        kind = 'pool';
                        baseLabel = 'PV afectados';
                    } else if (isBonus) {
                        kind = 'benefit';
                        baseLabel = 'Bonificador';
                    } else if (isScaling && previousDetail) {
                        kind = previousDetail.kind;
                        baseLabel = previousDetail.baseLabel;
                    } else {
                        return;
                    }

                    const value = isScaling
                        ? `${`+${dice.replace(/^\+/, '')}`}${/por cada nivel|nivel por encima/i.test(sentence) ? '/nivel' : ''}`
                        : dice;
                    const label = isScaling
                        ? `${baseLabel} · ${cantripLevels.length ? `Niveles ${cantripLevels.join(', ')}` : 'Nivel superior'}`
                        : baseLabel;
                    details.push({ value, label, kind });
                    previousDetail = { kind, baseLabel };
                });

                return details.filter((detail, index, collection) => collection.findIndex(item => item.value === detail.value && item.label === detail.label && item.kind === detail.kind) === index).slice(0, 4);
            };

            const addSpellFromSrdLibrary = (librarySpell) => {
                if (!librarySpell || !librarySpell.id || !librarySpell.name) return;
                if (automaticSpellSourceIds.has(librarySpell.id)) {
                    showAlert('Este conjuro se concede automáticamente por tu personaje y ya está disponible en el Grimorio.');
                    return;
                }
                const level = Math.max(0, Math.min(9, Number(librarySpell.level) || 0));
                const knownCount = spells.filter(spell => spell.level > 0 && spell.known && !automaticSpellSourceIds.has(spell.sourceId)).length;
                const cantripCount = spells.filter(spell => spell.level === 0 && spell.known && !automaticSpellSourceIds.has(spell.sourceId)).length;
                const existingSpell = spells.find(spell => spell.sourceId === librarySpell.id);
                const preparesDirectly = spellWorkflow === 'prepared' && level > 0;
                const preparedLimitReached = preparesDirectly
                    && preparedSpellCount >= (Number(grimoireConfig.preparedLimit) || 0);
                if (existingSpell) {
                    if (preparesDirectly && !existingSpell.prepared && !preparedLimitReached) {
                        setSpells(previous => previous.map(spell => spell.id === existingSpell.id ? { ...spell, prepared: true } : spell));
                        setSrdSpellDetail(null);
                        return;
                    }
                    showAlert('Este conjuro ya está en el Grimorio.');
                    return;
                }
                const knownLimitReached = level > 0
                    && grimoireConfig.useKnownLimit
                    && knownCount >= (Number(grimoireConfig.knownLimit) || 0);
                const cantripLimitReached = level === 0
                    && grimoireConfig.useCantripLimit
                    && cantripCount >= (Number(grimoireConfig.cantripLimit) || 0);

                if (knownLimitReached || cantripLimitReached || preparedLimitReached) {
                    showAlert('Has alcanzado el límite configurado para ese tipo de conjuro.');
                    return;
                }

                setSpells(previous => [
                    ...previous,
                    normalizeSpell({
                        ...librarySpell,
                        id: `sp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                        sourceId: librarySpell.id,
                        damageHealing: getSrdSpellDiceDetails(librarySpell).map(detail => `${detail.value} ${detail.label}`).join(' · '),
                        known: true,
                        prepared: preparesDirectly
                    })
                ]);
                setSrdSpellDetail(null);
            };
            const getSpellCompendiumActionLabel = (spell) => Number(spell?.level) === 0
                ? 'Aprender truco'
                : spellWorkflowCopy.action;
            const getSpellCompendiumAddedLabel = (spell) => Number(spell?.level) === 0
                ? 'Truco añadido'
                : spellWorkflowCopy.added;

            const addFeatFromCompendium = (libraryFeat) => {
                if (!libraryFeat?.id || !libraryFeat?.name) return;
                if (feats.some(feat => feat.sourceId === libraryFeat.id || String(feat.title || '').trim().toLocaleLowerCase('es') === libraryFeat.name.toLocaleLowerCase('es'))) {
                    showAlert('Esta dote ya está añadida a la ficha.');
                    return;
                }
                setFeats(previous => [...previous, {
                    title: libraryFeat.name,
                    desc: libraryFeat.summary,
                    sourceId: libraryFeat.id,
                    source: libraryFeat.source,
                    prerequisites: libraryFeat.prerequisites || ''
                }]);
                setFeatCompendiumDetail(null);
            };

            const toggleSpellPreparation = (sp) => {
                if (!grimoireConfig.usePrepared || sp.level === 0 || sp.automatic) return;
                if (!sp.prepared) {
                    const maxPrep = Number(grimoireConfig.preparedLimit) || 0;
                    const currentPrep = spells.filter(s => s.level > 0 && s.prepared && !automaticSpellSourceIds.has(s.sourceId)).length;
                    if (currentPrep >= maxPrep) {
                        showAlert(`Has alcanzado tu límite máximo de ${maxPrep} hechizos preparados.`);
                        return;
                    }
                }
                setSpells(spells.map(s => s.id === sp.id ? {...s, prepared: !s.prepared, countsPreparation: !s.prepared} : s));
            };
            const toggleSpellKnown = (sp) => {
                if (sp.level === 0 || !grimoireConfig.useKnownLimit || sp.automatic) return;
                if (!sp.known && knownSpellCount >= (Number(grimoireConfig.knownLimit) || 0)) { showAlert('Has alcanzado el límite de conjuros conocidos.'); return; }
                setSpells(spells.map(item => item.id === sp.id ? { ...item, known: !item.known, prepared: item.known ? false : item.prepared } : item));
            };

            const completeSpellCast = (spell, slotLevel, pact = false) => {
                if (spell.level > 0 && spell.castingResource === 'slots') {
                    if (pact) setGrimoireConfig(prev => ({ ...prev, pactSlots: { ...prev.pactSlots, current: Math.max(0, Number(prev.pactSlots.current) - 1) } }));
                    else setSpellSlots(prev => ({ ...prev, [slotLevel]: { ...prev[slotLevel], current: Math.max(0, Number(prev[slotLevel].current) - 1) } }));
                }
                if (spell.castingResource === 'independent') {
                    if (spell.automatic && spell.sourceId) setSpellGrantUses(previous => ({ ...(previous || {}), [spell.sourceId]: Math.max(0, Number(spell.ownUsesCurrent) - 1) }));
                    else setSpells(previous => previous.map(item => item.id === spell.id ? { ...item, ownUsesCurrent: Math.max(0, Number(item.ownUsesCurrent) - 1) } : item));
                }
                if (spell.concentration) {
                    const startedAt = new Date().toISOString();
                    setActiveConcentration({ spellId: spell.id || spell.sourceId || '', spellName: spell.name, startedAt });
                    setActivityLog(previous => [{ id: `concentration_${Date.now()}`, timestamp: startedAt, description: `Concentración iniciada: ${spell.name}.` }, ...(previous || [])].slice(0, 100));
                }
                const schoolText = String(spell.school || 'Magia arcana');
                const normalizedSchool = schoolText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
                const schoolKey = [['abjur','abjuration'],['conjur','conjuration'],['adivin','divination'],['encant','enchantment'],['evoca','evocation'],['ilusion','illusion'],['nigroman','necromancy'],['transmut','transmutation']].find(([needle]) => normalizedSchool.includes(needle))?.[1] || 'arcane';
                setSpellCastAnimation({ id: `cast_${Date.now()}`, spell, slotLevel, pact, schoolText, schoolKey });
                setCastSpell(null);
            };
            const castWithSlot = (slotLevel, pact = false) => {
                if (!castSpell) return;
                const spell = castSpell;
                if (spell.concentration && activeConcentration && activeConcentration.spellId !== (spell.id || spell.sourceId || '')) {
                    setConfirmDialog({
                        isOpen: true,
                        message: `Ya estás concentrándote en ${activeConcentration.spellName}. ¿Quieres sustituirlo por ${spell.name}?`,
                        onConfirm: () => completeSpellCast(spell, slotLevel, pact),
                        isAlert: false,
                        confirmLabel: 'Sustituir',
                        confirmTone: 'primary'
                    });
                    return;
                }
                completeSpellCast(spell, slotLevel, pact);
            };
            const finishConcentration = () => {
                if (!activeConcentration) return;
                const ended = activeConcentration;
                setActiveConcentration(null);
                setActivityLog(previous => [{ id: `concentration_end_${Date.now()}`, timestamp: new Date().toISOString(), description: `Concentración finalizada: ${ended.spellName}.` }, ...(previous || [])].slice(0, 100));
            };

            const requestLevelChange = () => {
                const target = Math.max(1, Math.min(20, Math.trunc(Number(levelDraft) || normalizedCharacterLevel)));
                setLevelDraft(String(target));
                if (target === normalizedCharacterLevel) return;
                if (target < normalizedCharacterLevel) {
                    setConfirmDialog({ isOpen: true, message: `¿Cambiar el nivel de ${normalizedCharacterLevel} a ${target}? Al bajar de nivel no se retirarán automáticamente rasgos, recursos, conjuros ni puntos de golpe.`, onConfirm: () => { setLevel(String(target)); setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, lastLevelReview: Math.min(target, Number(previous?.lastLevelReview) || target) })); setActivityLog(previous => [{ id: `level_down_${Date.now()}`, timestamp: new Date().toISOString(), description: `Nivel cambiado manualmente: ${normalizedCharacterLevel} → ${target}.` }, ...(previous || [])].slice(0,100)); }, isAlert: false, confirmLabel: 'Cambiar nivel', confirmTone: 'primary' });
                    return;
                }
                setPendingLevelChange({ from: normalizedCharacterLevel, target });
                setLevelReviewHpGain('');
                setLevelReviewChecks({});
                setLevelReviewOpen(true);
            };
            const closeLevelReview = () => {
                setLevelReviewOpen(false);
                if (pendingLevelChange) { setPendingLevelChange(null); setLevelDraft(String(level || normalizedCharacterLevel)); }
            };

            const confirmLevelReview = () => {
                const hpGain = Math.max(0, Math.trunc(Number(levelReviewHpGain) || 0));
                const actualLevelUp = pendingLevelChange && levelReviewTarget > normalizedCharacterLevel;
                const ceremony = actualLevelUp ? {
                    id: `level_up_${Date.now()}`,
                    from: normalizedCharacterLevel,
                    to: levelReviewTarget,
                    className: activeSrdSubclass?.name || selectedSrdClass?.name || charInfo.cls || 'Aventurero',
                    hpGain,
                    hitDiceGain: levelReviewDelta,
                    hitDie: selectedSrdClass?.hitDie || hitDice.type || '',
                    proficiencyBefore: previousProficiencyBonus,
                    proficiencyAfter: levelReviewProficiencyBonus,
                    features: levelReviewFeatureGroups.flatMap(group => group.features.map(feature => ({ ...feature, group: group.label }))),
                    resources: pendingResourceSuggestions.map(resource => ({ name: resource.name, max: resource.max, type: resource.type })),
                    spellSlots: spellSlotChanges,
                    cantripsBefore: previousSpellProgression.cantrips,
                    cantripsAfter: currentSpellProgression.cantrips,
                    knownBefore: previousSpellProgression.known,
                    knownAfter: currentSpellProgression.known,
                    preparedBefore: previousSpellProgression.prepared,
                    preparedAfter: currentSpellProgression.prepared,
                    improvements: pendingAbilityImprovementLevels,
                    classSkillChoices: remainingClassSkillChoices,
                    expertiseChoices: levelReviewRemainingExpertiseChoices
                } : null;
                if (hpGain > 0) {
                    setHp(previous => ({
                        ...previous,
                        current: String(Math.max(0, Number(previous.current) || 0) + hpGain),
                        max: String(Math.max(0, Number(previous.max) || 0) + hpGain)
                    }));
                }
                if (levelReviewDelta > 0) {
                    setHitDice(previous => ({
                        ...previous,
                        current: String(Math.min(levelReviewTarget, Math.max(0, Number(previous.current) || 0) + levelReviewDelta)),
                        type: characterBuild?.autoHitDie && selectedSrdClass?.hitDie ? selectedSrdClass.hitDie : previous.type
                    }));
                }
                if (actualLevelUp) setLevel(String(levelReviewTarget));
                setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, lastLevelReview: levelReviewTarget }));
                setActivityLog(previous => [{ id: `level_${Date.now()}`, timestamp: new Date().toISOString(), description: `${actualLevelUp ? `Subida de nivel ${normalizedCharacterLevel} → ${levelReviewTarget}` : `Nivel ${levelReviewTarget} revisado`}${hpGain ? ` · +${hpGain} PV máximos` : ''}.` }, ...(previous || [])].slice(0, 100));
                setLevelReviewHpGain('');
                setLevelReviewOpen(false);
                setPendingLevelChange(null);
                if (ceremony) setLevelUpCeremony(ceremony);
            };

            // Cálculos para la barra de vida de videojuego
            const curHp = Number(hp.current) || 0;
            const maxHp = Number(hp.max) || 1;
            const tmpHp = Number(hp.temp) || 0;
            
            const hpPercent = Math.min(100, Math.max(0, (curHp / maxHp) * 100));
            const tempHpPercent = Math.min(100, Math.max(0, (tmpHp / maxHp) * 100));
            const hpCondition = curHp <= 0 ? 'down' : hpPercent <= 25 ? 'critical' : hpPercent <= 50 ? 'wounded' : 'steady';
            useEffect(() => {
                const previous = hpVisualRef.current;
                const next = { characterId: manager.activeCharacterId, current: curHp, max: maxHp, temp: tmpHp };
                hpVisualRef.current = next;
                if (previous.characterId !== next.characterId) {
                    setHpBarMotion(null);
                    return;
                }
                let motion = null;
                if (previous.current !== next.current) {
                    const fromPercent = Math.min(100, Math.max(0, (previous.current / next.max) * 100));
                    const toPercent = Math.min(100, Math.max(0, (next.current / next.max) * 100));
                    motion = { id: `hp_${Date.now()}`, type: next.current < previous.current ? 'damage' : 'healing', sign: next.current < previous.current ? '−' : '+', delta: Math.abs(next.current - previous.current), fromPercent, toPercent };
                } else if (previous.temp !== next.temp) {
                    motion = { id: `temp_${Date.now()}`, type: 'temporary', sign: next.temp < previous.temp ? '−' : '+', delta: Math.abs(next.temp - previous.temp), fromPercent: Math.min(100, Math.max(0, (previous.temp / next.max) * 100)), toPercent: tempHpPercent };
                }
                if (!motion) return;
                if (hpVisualTimerRef.current) window.clearTimeout(hpVisualTimerRef.current);
                setHpBarMotion(motion);
                hpVisualTimerRef.current = window.setTimeout(() => { setHpBarMotion(null); hpVisualTimerRef.current = null; }, 1050);
            }, [manager.activeCharacterId, curHp, maxHp, tmpHp, tempHpPercent]);
            useEffect(() => () => {
                if (hpVisualTimerRef.current) window.clearTimeout(hpVisualTimerRef.current);
            }, []);
            const renderVitalityBar = (attachRef = false, extraClass = '') => <div
                className={`health-bar-container vitality-bar is-${hpCondition} ${isDraggingHp ? 'is-dragging' : ''} ${extraClass}`}
                data-no-tab-swipe
                data-health-state={hpCondition}
                ref={attachRef ? hpBarRef : null}
                onPointerDown={handleHpPointerDown}
                onPointerMove={handleHpPointerMove}
                onPointerUp={handleHpPointerUp}
                onPointerCancel={handleHpPointerUp}
                aria-label={`${curHp} de ${maxHp} puntos de golpe${tmpHp > 0 ? ` y ${tmpHp} temporales` : ''}`}
            >
                <div className="vitality-track" aria-hidden="true"></div>
                <div className="health-fill" style={{ width: `${hpPercent}%` }}><i className="vitality-flow"></i><i className="vitality-edge"></i></div>
                {hpBarMotion?.type === 'damage' && <div key={hpBarMotion.id} className="vitality-damage-trail" style={{ left: `${hpBarMotion.toPercent}%`, width: `${Math.max(0, hpBarMotion.fromPercent - hpBarMotion.toPercent)}%` }}><i></i></div>}
                {hpBarMotion?.type === 'healing' && <div key={hpBarMotion.id} className="vitality-healing-wave" style={{ left: `${Math.min(hpBarMotion.fromPercent, hpBarMotion.toPercent)}%`, width: `${Math.abs(hpBarMotion.toPercent - hpBarMotion.fromPercent)}%` }}><i></i></div>}
                {tmpHp > 0 && <div key={`temporary_${tmpHp}`} className="temporary-health-fill" style={{ width: `${tempHpPercent}%` }}><i></i></div>}
                <div className="vitality-current-marker" style={{ left: `${hpPercent}%` }}><i></i></div>
                {hpBarMotion && <span key={`delta_${hpBarMotion.id}`} className={`vitality-delta is-${hpBarMotion.type}`}>{hpBarMotion.sign}{hpBarMotion.delta}</span>}
                <div className="glass-overlay"></div>
            </div>;

            const SKILLS = [
                { key: 'acrobacias', name: 'Acrobacias', stat: 'des' }, { key: 'arcanos', name: 'Arcano', stat: 'int' },
                { key: 'atletismo', name: 'Atletismo', stat: 'fue' }, { key: 'engano', name: 'Engaño', stat: 'car' },
                { key: 'historia', name: 'Historia', stat: 'int' }, { key: 'interpretacion', name: 'Interpretación', stat: 'car' },
                { key: 'intimidacion', name: 'Intimidación', stat: 'car' }, { key: 'investigacion', name: 'Investigación', stat: 'int' },
                { key: 'juego_de_manos', name: 'Juego de Manos', stat: 'des' }, { key: 'medicina', name: 'Medicina', stat: 'sab' },
                { key: 'naturaleza', name: 'Naturaleza', stat: 'int' }, { key: 'percepcion', name: 'Percepción', stat: 'sab' },
                { key: 'perspicacia', name: 'Perspicacia', stat: 'sab' }, { key: 'persuasion', name: 'Persuasión', stat: 'car' },
                { key: 'religion', name: 'Religión', stat: 'int' }, { key: 'sigilo', name: 'Sigilo', stat: 'des' },
                { key: 'supervivencia', name: 'Supervivencia', stat: 'sab' }, { key: 'trato_con_animales', name: 'Trato con Animales', stat: 'sab' },
            ];
            useEffect(() => { setRestModalOpen(false); setRestType(null); setRestCeremony(null); }, [manager.activeCharacterId]);
            const restPreview = restType ? calculateRestPreview(restType, activeCharacter.data, restSpentDice, restHealing) : null;
            const restPreviewResources = restPreview ? (resources || []).map(resource => {
                const recovered = (restPreview.data.resources || []).find(candidate => candidate.id === resource.id);
                return recovered && Number(resource.current) !== Number(recovered.current) ? { name: resource.name, before: Number(resource.current) || 0, after: Number(recovered.current) || 0, max: Number(recovered.max) || 0 } : null;
            }).filter(Boolean) : [];
            const restPreviewSlots = restPreview ? Object.keys(restPreview.data.spellSlots || {}).map(level => {
                const before = Number(spellSlots?.[level]?.current) || 0;
                const after = Number(restPreview.data.spellSlots?.[level]?.current) || 0;
                const max = Number(restPreview.data.spellSlots?.[level]?.max) || 0;
                return before !== after ? { level, before, after, max } : null;
            }).filter(Boolean) : [];
            const restPreviewPact = restPreview && Number(activeCharacter.data.grimoireConfig?.pactSlots?.current) !== Number(restPreview.data.grimoireConfig?.pactSlots?.current) ? {
                before: Number(activeCharacter.data.grimoireConfig?.pactSlots?.current) || 0,
                after: Number(restPreview.data.grimoireConfig?.pactSlots?.current) || 0,
                max: Number(restPreview.data.grimoireConfig?.pactSlots?.max) || 0
            } : null;
            const restPreviewChangeCount = restPreview ? Number(Number(hp.current) !== Number(restPreview.data.hp?.current)) + Number(Number(hitDice.current) !== Number(restPreview.data.hitDice?.current)) + restPreviewResources.length + restPreviewSlots.length + Number(Boolean(restPreviewPact)) : 0;
            const closeRestPlanner = () => {
                setRestModalOpen(false);
                setRestType(null);
                setRestSpentDice(0);
                setRestHealing(0);
            };
            const chooseRestType = type => {
                setRestType(type);
                setRestSpentDice(0);
                setRestHealing(0);
            };
            const confirmRest = () => {
                if (!restPreview) return;
                const before = activeCharacter.data;
                const after = restPreview.data;
                const changedResources = (before.resources || []).map(resource => {
                    const recovered = (after.resources || []).find(candidate => candidate.id === resource.id);
                    if (!recovered || Number(resource.current) === Number(recovered.current)) return null;
                    return { name: resource.name, before: Number(resource.current) || 0, after: Number(recovered.current) || 0, max: Number(recovered.max) || 0 };
                }).filter(Boolean);
                const changedSlots = Object.keys(after.spellSlots || {}).map(level => {
                    const previous = Number(before.spellSlots?.[level]?.current) || 0;
                    const current = Number(after.spellSlots?.[level]?.current) || 0;
                    const max = Number(after.spellSlots?.[level]?.max) || 0;
                    return previous !== current ? { level, previous, current, max } : null;
                }).filter(Boolean);
                const pactBefore = Number(before.grimoireConfig?.pactSlots?.current) || 0;
                const pactAfter = Number(after.grimoireConfig?.pactSlots?.current) || 0;
                setRestCeremony({
                    id: `rest_${Date.now()}`,
                    type: restType,
                    characterName: charInfo.name || 'Tu personaje',
                    hpBefore: Number(before.hp?.current) || 0,
                    hpAfter: Number(after.hp?.current) || 0,
                    hpMax: Number(after.hp?.max) || 0,
                    hitDiceBefore: Number(before.hitDice?.current) || 0,
                    hitDiceAfter: Number(after.hitDice?.current) || 0,
                    hitDie: after.hitDice?.type || '',
                    resources: changedResources,
                    slots: changedSlots,
                    pact: pactBefore !== pactAfter ? { before: pactBefore, after: pactAfter, max: Number(after.grimoireConfig?.pactSlots?.max) || 0 } : null,
                    changes: restPreview.changes || []
                });
                activitySnapshotRef.current = { characterId: manager.activeCharacterId, snapshot: createActivitySnapshot(restPreview.data) };
                updateActiveData(restPreview.data);
                appendActivity(restType === 'short' ? 'Descanso corto' : 'Descanso largo');
                closeRestPlanner();
            };
            const automaticSpellGrants = useMemo(() => {
                if (!srdCharacterRules?.getAutomaticSpellGrantsForBuild) return [];
                return srdCharacterRules.getAutomaticSpellGrantsForBuild({
                    subclassId: activeSrdSubclass?.id || characterBuild?.subclassId,
                    speciesId: selectedSrdSpecies?.id || characterBuild?.speciesId,
                    level: normalizedCharacterLevel
                });
            }, [srdCharacterRules, activeSrdSubclass?.id, characterBuild?.subclassId, selectedSrdSpecies?.id, characterBuild?.speciesId, normalizedCharacterLevel]);
            const automaticSpellSourceIds = useMemo(() => new Set(automaticSpellGrants.map(grant => grant.spellId)), [automaticSpellGrants]);
            const automaticSpells = useMemo(() => {
                const library = window.DndSrdSpellLibrary?.spells || [];
                return automaticSpellGrants.map(grant => {
                    const sourceSpell = library.find(spell => spell.id === grant.spellId);
                    if (!sourceSpell) return null;
                    return {
                        ...normalizeSpell({
                        ...sourceSpell,
                        id: `automatic_spell_${grant.spellId}`,
                        sourceId: grant.spellId,
                        damageHealing: getSrdSpellDiceDetails(sourceSpell).map(detail => `${detail.value} ${detail.label}`).join(' · '),
                        known: true,
                        prepared: grant.mode === 'prepared',
                        grantType: grant.sourceType || 'class',
                        grantSource: grant.sourceLabel || '',
                        countsPreparation: false,
                        countsKnownLimit: false,
                        castingResource: grant.sourceType === 'species' ? (Number(sourceSpell.level) === 0 ? 'at-will' : 'independent') : 'slots',
                        ownUsesMax: grant.sourceType === 'species' && Number(sourceSpell.level) > 0 ? 1 : 0,
                        ownUsesCurrent: grant.sourceType === 'species' && Number(sourceSpell.level) > 0 ? Math.min(1, Number(spellGrantUses?.[grant.spellId] ?? 1)) : 0
                        }),
                        automatic: true,
                        automaticGrant: grant
                    };
                }).filter(Boolean);
            }, [automaticSpellGrants, spellGrantUses]);
            const manualSpells = spells.filter(spell => !automaticSpellSourceIds.has(spell.sourceId));
            const spellGrantLabels = { species: 'Concedido por especie', class: 'Concedido por clase', subclass: 'Concedido por subclase', feat: 'Concedido por dote', item: 'Concedido por objeto' };
            const getSpellGrantSummary = spell => {
                const granted = spell.grantType && spell.grantType !== 'standard';
                return {
                    type: granted ? spellGrantLabels[spell.grantType] : spell.prepared ? 'Preparado' : 'Conocido',
                    source: spell.grantSource || spell.automaticGrant?.sourceLabel || '',
                    preparation: spell.countsPreparation ? 'Consume espacio de preparación' : 'No consume preparación',
                    knownLimit: spell.countsKnownLimit ? 'Cuenta contra el límite' : 'No cuenta contra el límite',
                    resource: spell.castingResource === 'independent' ? `Usos propios ${spell.ownUsesCurrent}/${spell.ownUsesMax}` : spell.castingResource === 'at-will' ? 'A voluntad · sin ranura' : 'Usa ranuras normales'
                };
            };
            const restoreSpellOwnUses = spell => {
                if (spell.automatic && spell.sourceId) setSpellGrantUses(previous => ({ ...(previous || {}), [spell.sourceId]: spell.ownUsesMax }));
                else setSpells(previous => previous.map(item => item.id === spell.id ? { ...item, ownUsesCurrent: item.ownUsesMax } : item));
            };
            const grimorioSpells = [...manualSpells, ...automaticSpells];
            const knownSpellCount = manualSpells.filter(spell => spell.level > 0 && spell.known && spell.countsKnownLimit !== false).length;
            const preparedSpellCount = manualSpells.filter(spell => spell.level > 0 && spell.prepared && spell.countsPreparation !== false).length;
            const cantripCount = manualSpells.filter(spell => spell.level === 0 && spell.known && spell.countsKnownLimit !== false).length;
            const availableSpells = grimorioSpells.filter(spell => spell.level === 0 || spell.automatic || (grimoireConfig.usePrepared ? spell.prepared : grimoireConfig.useKnownLimit ? spell.known : true));
            const tacticalWeapons = (() => {
                const favorites = weapons.filter(weapon => weapon.favorite);
                return favorites.length ? favorites : weapons.slice(0, 3);
            })();
            const tacticalSpells = (() => {
                if (grimoireConfig.usePrepared) return grimorioSpells.filter(spell => spell.prepared);
                const favorites = grimorioSpells.filter(spell => spell.favorite);
                return favorites.length ? favorites : availableSpells.slice(0, 3);
            })();
            const tacticalResources = resources.filter(resource => Number(resource.max) > 0);
            const combatConditions = ['Derribado', 'Agarrado', 'Invisible', 'Asustado', 'Hechizado', 'Envenenado', 'Paralizado', 'Petrificado', 'Aturdido', 'Restringido'];
            const conditionSymbols = { Derribado: '↓', Agarrado: '⊗', Invisible: '◇', Asustado: '!', Hechizado: '♢', Envenenado: '☠', Paralizado: '‖', Petrificado: '▣', Aturdido: '✷', Restringido: '⊘' };
            const addNamePlaceholders = { item: 'Ej: Cuerda de cáñamo', armor: 'Ej: Armadura de cuero', tool: 'Ej: Herramientas de ladrón', weapon: 'Ej: Espada larga', resource: 'Ej: Puntos de Ki', spell: 'Ej: Bola de fuego', attack: 'Ej: Ataque con espada' };
            const renderAcTemporaryControls = () => (
                <div className="combat-ac-temporary">
                    <span>Base <b>{calculateBaseAC() + speciesArmorClassBonus}</b> · Temporal <b>{formatMod(Number(miscAc) || 0)}</b></span>
                    <div>
                        <button type="button" aria-label="Reducir modificador temporal de CA" onClick={() => setMiscAc(String((Number(miscAc) || 0) - 1))}>−</button>
                        <label><small>Ajuste</small><input aria-label="Modificador temporal de CA" type="number" value={miscAc} onChange={e => setMiscAc(handleNumInput(e.target.value))} /></label>
                        <button type="button" aria-label="Aumentar modificador temporal de CA" onClick={() => setMiscAc(String((Number(miscAc) || 0) + 1))}>+</button>
                    </div>
                    <button type="button" disabled={(Number(miscAc) || 0) === 0} onClick={() => { if ((Number(miscAc) || 0) !== 0) setMiscAc('0'); }}>Reiniciar ajuste</button>
                </div>
            );
            const renderAcBreakdown = () => {
                const breakdown = getAcBreakdown();
                return <div className="combat-ac-breakdown">
                    <span><small>Protección</small><b>{breakdown.armor ? `${breakdown.armor.name} · ${breakdown.armorBase}` : breakdown.unarmoredLabel ? `Sin armadura · ${breakdown.unarmoredLabel}` : 'Sin armadura · 10'}</b></span>
                    <div><span>DES <b>{formatMod(breakdown.dexApplied)}</b></span>
                    {breakdown.unarmoredLabel && <span>{breakdown.unarmoredLabel === 'Monje' ? 'SAB' : 'CON'} <b>{formatMod(breakdown.unarmoredBonus)}</b></span>}
                    {breakdown.shield && <span>Escudo <b>+{breakdown.shieldBonus}</b></span>}
                    {breakdown.speciesBonus !== 0 && <span>Especie <b>{formatMod(breakdown.speciesBonus)}</b></span>}
                    {breakdown.temporary !== 0 && <span>Temporal <b>{formatMod(breakdown.temporary)}</b></span>}</div>
                </div>;
            };
            const renderUsageDots = (current, max, colorClass = 'text-purple-400') => {
                const safeMax = Math.floor(Math.max(0, Number(max) || 0));
                const safeCurrent = Math.floor(Math.max(0, Math.min(safeMax, Number(current) || 0)));
                if (!safeMax) return null;
                if (safeMax > 12) return <span className={`text-xs font-mono ${colorClass}`} aria-label={`${safeCurrent} de ${safeMax} usos disponibles`}>● × {safeCurrent} / {safeMax}</span>;
                return <span className="usage-dot-track flex flex-wrap justify-center gap-1" role="img" aria-label={`${safeCurrent} de ${safeMax} usos disponibles`}>{Array.from({ length: safeMax }, (_, index) => <span key={index} aria-hidden="true" className={`usage-dot text-sm leading-none ${index < safeCurrent ? `is-available ${colorClass}` : 'is-spent text-gray-700'}`}>●</span>)}</span>;
            };
            const renderTimerList = (editable = false) => sortedTimers.length ? (
                <div className="combat-timer-list">
                    {sortedTimers.map(timer => {
                        const remaining = getTimerRemaining(timer);
                        const expired = remaining === 0;
                        const hasMax = timer.max !== '' && timer.max !== null && timer.max !== undefined;
                        const realTime = Boolean(REAL_TIMER_UNITS[timer.type]);
                        const safeMax = Math.max(0, Number(timer.max) || 0);
                        const progress = hasMax && safeMax > 0 ? Math.max(0, Math.min(100, (remaining / safeMax) * 100)) : null;
                        return <article key={timer.id} className={`combat-timer-card ${expired ? 'is-expired' : ''} ${realTime ? 'is-realtime' : 'is-manual'}`}>
                            <div className="combat-timer-emblem" aria-hidden="true"><span>{realTime ? '⌛' : '↻'}</span><i></i></div>
                            <div className="combat-timer-content">
                                <header><div><small>{timerTypeLabels[timer.type] || 'Temporizador'} · {realTime ? 'tiempo real' : 'seguimiento manual'}</small><strong>{timer.name}</strong></div><span className="combat-timer-status">{expired ? 'Finalizado' : 'Activo'}</span></header>
                                <div className="combat-timer-readout"><strong>{expired ? '0' : formatTimerRemaining(timer)}</strong>{hasMax && <span>de <b>{timer.max}</b> {String(timerTypeLabels[timer.type] || '').toLocaleLowerCase('es')}</span>}</div>
                                {progress !== null && <div className="combat-timer-progress" role="progressbar" aria-label={`Progreso restante de ${timer.name}`} aria-valuemin="0" aria-valuemax={safeMax} aria-valuenow={remaining}><i style={{ width: `${progress}%` }}></i></div>}
                            </div>
                            {editable && <div className="combat-timer-controls"><div className="combat-timer-stepper"><button type="button" aria-label={`Reducir ${timer.name}`} onClick={() => adjustTimer(timer.id, -1)}>−</button><label><span className="sr-only">Valor de {timer.name}</span><input aria-label={`Valor de ${timer.name}`} type="number" min="0" value={remaining} onChange={event => setTimerRemaining(timer.id, event.target.value)} /></label><button type="button" aria-label={`Aumentar ${timer.name}`} onClick={() => adjustTimer(timer.id, 1)}>+</button></div><div className="combat-timer-actions"><button type="button" onClick={() => openTimerModal(timer)}><span aria-hidden="true">✎</span> Editar</button><button type="button" className="is-delete" aria-label={`Eliminar ${timer.name}`} onClick={() => confirmDelete(`¿Eliminar el temporizador "${timer.name}"?`, () => setTimers(previous => previous.filter(item => item.id !== timer.id)))}>×</button></div></div>}
                        </article>;
                    })}
                </div>
            ) : <div className="combat-tracker-empty is-timer"><span aria-hidden="true">⌛</span><strong>Nada que vigilar</strong><p>Crea un temporizador para seguir turnos, rondas o duraciones reales.</p></div>;
            const displayedSpells = (grimoireView === 'available' ? availableSpells : grimorioSpells).filter(spell => {
                const query = spell.name.toLowerCase().includes(spellSearch.toLowerCase());
                const filter = spellFilter === 'all' || (spellFilter === 'cantrip' && spell.level === 0) || (spellFilter === 'prepared' && spell.prepared) || (spellFilter === 'ritual' && spell.ritual) || (spellFilter === 'concentration' && spell.concentration) || (spellFilter === 'favorite' && spell.favorite) || Number(spellFilter) === spell.level;
                return query && filter;
            }).slice().sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
            const srdSpellLibrary = useMemo(() => {
                const rawSrdSpellLibrary = window.DndSrdSpellLibrary?.spells || [];
                const srdSpellNamesByLength = rawSrdSpellLibrary
                    .map(spell => String(spell.name || '').trim())
                    .filter(Boolean)
                    .sort((left, right) => right.length - left.length);

                return rawSrdSpellLibrary.map(spell => {
                    const description = String(spell.description || '').trim();
                    const leakedName = srdSpellNamesByLength.find(name => description.endsWith(` ${name}`));
                    return {
                        ...spell,
                        description: leakedName
                            ? description.slice(0, -(leakedName.length + 1)).trimEnd()
                            : description
                    };
                });
            }, []);
            const srdSpellSchools = [...new Set(srdSpellLibrary.map(spell => spell.school).filter(Boolean))].sort((left, right) => left.localeCompare(right));
            const featCompendium = useMemo(() => (window.DndFeatCompendium?.feats || [])
                .slice()
                .sort((left, right) => left.name.localeCompare(right.name, 'es')), []);
            const displayedCompendiumFeats = featCompendium.filter(feat => {
                const query = `${feat.name} ${feat.summary} ${feat.prerequisites || ''}`.toLocaleLowerCase('es')
                    .includes(featCompendiumSearch.toLocaleLowerCase('es'));
                return query && (featCompendiumSource === 'all' || feat.source === featCompendiumSource);
            });
            const srdSpellClassListKey = srdSpellcastingProfile?.spellListKey || srdSpellcastingProfile?.id || '';
            const srdClassSpellIds = useMemo(() => new Set(
                srdSpellcasting?.classSpellIds?.[srdSpellClassListKey] || []
            ), [srdSpellcasting, srdSpellClassListKey]);
            const isSrdClassFilterActive = srdSpellClassFilter === 'auto' && !!srdSpellcastingProfile && srdClassSpellIds.size > 0;
            const displayedSrdSpells = srdSpellLibrary.filter(spell => {
                const query = spell.name.toLocaleLowerCase('es').includes(srdSpellSearch.toLocaleLowerCase('es'));
                const levelMatches = srdSpellLevel === 'all' || Number(srdSpellLevel) === spell.level;
                const schoolMatches = srdSpellSchool === 'all' || srdSpellSchool === spell.school;
                const classMatches = !isSrdClassFilterActive || (
                    srdClassSpellIds.has(spell.id)
                    && (spell.level === 0 || spell.level <= srdProfileMaxSpellLevel)
                );
                const diceDetails = getSrdSpellDiceDetails(spell);
                const traitMatches = srdSpellTrait === 'all'
                    || (srdSpellTrait === 'ritual' && spell.ritual)
                    || (srdSpellTrait === 'concentration' && spell.concentration)
                    || (srdSpellTrait === 'damage' && diceDetails.some(detail => detail.kind === 'damage'))
                    || (srdSpellTrait === 'healing' && diceDetails.some(detail => detail.kind === 'healing'));
                return query && levelMatches && schoolMatches && classMatches && traitMatches;
            }).slice().sort((left, right) => left.level - right.level || left.name.localeCompare(right.name, 'es'));

            const featuredPresentationTrait = traits.find(trait => (trait.id || trait.title) === presentation?.featuredTraitId);
            const featuredPresentationItem = inventory.find(item => item.id === presentation?.featuredItemId);
            const featuredPresentationSpell = grimorioSpells.find(spell => spell.id === presentation?.featuredSpellId || spell.sourceId === presentation?.featuredSpellId);
            const buildPresentationText = () => {
                const identity = [charInfo.race, charInfo.cls, `Nivel ${normalizedCharacterLevel}`].filter(Boolean).join(' · ');
                const lines = [charInfo.name || 'Personaje', presentation?.tagline ? `“${presentation.tagline}”` : '', identity];
                if (narrative.personality) lines.push(`Personalidad: ${narrative.personality}`);
                if (narrative.ideals) lines.push(`Ideales: ${narrative.ideals}`);
                if (narrative.bonds) lines.push(`Vínculos: ${narrative.bonds}`);
                if (presentation?.visibility === 'full') lines.push(`PV ${hp.current || 0}/${hp.max || 0} · CA ${calculateAC()} · Iniciativa ${formatMod(getModNum(getEffectiveStat('des')) + (Number(initBonus) || 0))}`);
                return lines.filter(Boolean).join('\n');
            };
            const escapePresentationHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
            const buildPresentationHtml = () => {
                const accentPalette = { violet:['#a78bfa','#6d28d9'], crimson:['#fb7185','#be123c'], azure:['#38bdf8','#0369a1'], emerald:['#34d399','#047857'], amber:['#fbbf24','#b45309'], silver:['#d1d5db','#64748b'] };
                const [accent, accentDark] = accentPalette[presentation?.accent] || accentPalette.violet;
                const identity = [charInfo.race, charInfo.cls, activeSrdSubclass?.name || characterBuild?.subclassName, `Nivel ${normalizedCharacterLevel}`].filter(Boolean).map(escapePresentationHtml).join(' · ');
                const narrativeCards = [['Personalidad',narrative.personality],['Ideales',narrative.ideals],['Vínculos',narrative.bonds],['Defectos',narrative.flaws],['Objetivos',narrative.goals],['Deidad o filosofía',narrative.faith]].filter(([,value]) => String(value || '').trim());
                const featuredCards = [['Rasgo emblemático',featuredPresentationTrait?.title,featuredPresentationTrait?.desc],['Objeto emblemático',featuredPresentationItem?.name,featuredPresentationItem?.notes || featuredPresentationItem?.description],['Conjuro característico',featuredPresentationSpell?.name,featuredPresentationSpell ? (Number(featuredPresentationSpell.level) === 0 ? 'Truco' : `Conjuro de nivel ${featuredPresentationSpell.level}`) : '']].filter(([,title]) => title);
                const portrait = isValidPortraitDataUrl(activeCharacter.meta.portrait) ? `<img src="${activeCharacter.meta.portrait}" alt="Retrato">` : `<span>${escapePresentationHtml((charInfo.name || 'PJ').trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase())}</span>`;
                const card = (label,value) => `<article><small>${escapePresentationHtml(label)}</small><p>${escapePresentationHtml(value)}</p></article>`;
                const mechanics = presentation?.visibility === 'full' ? `<section><h2>Resumen de ficha</h2><div class="mechanics">${[['Puntos de golpe',`${hp.current || 0} / ${hp.max || 0}`],['CA',calculateAC()],['Iniciativa',formatMod(getModNum(getEffectiveStat('des')) + (Number(initBonus) || 0))],['Percepción pasiva',getPassivePerception()]].map(([label,value]) => `<article><small>${label}</small><strong>${escapePresentationHtml(value)}</strong></article>`).join('')}</div></section>` : '';
                return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapePresentationHtml(charInfo.name || 'Perfil de personaje')}</title><style>:root{--a:${accent};--ad:${accentDark}}*{box-sizing:border-box}body{margin:0;min-height:100vh;padding:24px;color:#dbe1eb;background:radial-gradient(circle at 18% 0,color-mix(in srgb,var(--a) 18%,transparent),transparent 34rem),linear-gradient(145deg,#111626,#080b13);font-family:system-ui,sans-serif}.sheet{max-width:820px;margin:auto;overflow:hidden;border:1px solid color-mix(in srgb,var(--a) 62%,transparent);border-radius:18px;background:rgba(8,12,22,.88);box-shadow:0 30px 90px #0009}.hero{display:grid;grid-template-columns:120px 1fr;gap:22px;align-items:center;padding:28px;border-bottom:1px solid color-mix(in srgb,var(--a) 30%,transparent)}.portrait{display:grid;width:120px;height:120px;place-items:center;overflow:hidden;border:1px solid var(--a);border-radius:16px;background:#020617;color:#fff;font:700 28px Georgia}.portrait img{width:100%;height:100%;object-fit:cover}.kicker,article small{color:var(--a);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}h1,h2,strong{font-family:Georgia,serif}h1{margin:5px 0;color:#fff;font-size:36px}h2{margin:0 0 12px;color:var(--a);font-size:15px;text-transform:uppercase}.identity{color:#94a3b8}.quote{margin:14px 0 0;color:#d5d9e2;font:italic 16px Georgia}.content{display:grid;gap:22px;padding:26px}.story{border-left:3px solid var(--a);padding-left:16px}.story p,article p{color:#adb7c7;line-height:1.65;white-space:pre-wrap}.grid,.featured,.mechanics{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.featured{grid-template-columns:repeat(3,1fr)}article{border:1px solid #334155;border-radius:12px;padding:14px;background:#0f172a99}article p{margin:8px 0 0}.featured strong,.mechanics strong{display:block;margin-top:8px;color:#fff}.mechanics{grid-template-columns:repeat(4,1fr);text-align:center}.mechanics strong{font-size:22px}.foot{padding:16px 26px;border-top:1px solid #334155;color:#64748b;font-size:12px}@media(max-width:620px){body{padding:8px}.hero{grid-template-columns:76px 1fr;padding:18px;gap:14px}.portrait{width:76px;height:76px}h1{font-size:25px}.content{padding:18px}.grid,.featured{grid-template-columns:1fr}.mechanics{grid-template-columns:repeat(2,1fr)}}</style></head><body><main class="sheet"><header class="hero"><div class="portrait">${portrait}</div><div><div class="kicker">Perfil de personaje</div><h1>${escapePresentationHtml(charInfo.name || 'Personaje sin nombre')}</h1><div class="identity">${identity}</div>${presentation?.tagline ? `<blockquote class="quote">“${escapePresentationHtml(presentation.tagline)}”</blockquote>` : ''}</div></header><div class="content">${(narrative.appearance || narrative.history) ? `<section class="story"><h2>Quién es</h2>${narrative.appearance ? `<p>${escapePresentationHtml(narrative.appearance)}</p>` : ''}${narrative.history ? `<p>${escapePresentationHtml(narrative.history)}</p>` : ''}</section>` : ''}${narrativeCards.length ? `<section><h2>Identidad narrativa</h2><div class="grid">${narrativeCards.map(([label,value]) => card(label,value)).join('')}</div></section>` : ''}${featuredCards.length ? `<section><h2>Señas del personaje</h2><div class="featured">${featuredCards.map(([label,title,description]) => `<article><small>${escapePresentationHtml(label)}</small><strong>${escapePresentationHtml(title)}</strong>${description ? `<p>${escapePresentationHtml(description)}</p>` : ''}</article>`).join('')}</div></section>` : ''}${mechanics}</div><footer class="foot">Presentación de ${escapePresentationHtml(charInfo.name || 'personaje')} · Ficha RPG</footer></main></body></html>`;
            };
            const sharePresentation = async () => {
                const text = buildPresentationText();
                const html = buildPresentationHtml();
                const safeName = (charInfo.name || 'personaje').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase() || 'personaje';
                const file = new File([html], `${safeName}-perfil.html`, { type: 'text/html' });
                try {
                    if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare({ files: [file] }))) await navigator.share({ title: charInfo.name || 'Perfil de personaje', text: `Perfil de ${charInfo.name || 'personaje'}`, files: [file] });
                    else {
                        const url = URL.createObjectURL(file), link = document.createElement('a');
                        link.href = url; link.download = file.name; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
                        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text).catch(() => {});
                        showAlert('Perfil visual descargado. Ya puedes enviarlo o abrirlo en cualquier navegador.');
                    }
                } catch (error) { if (error?.name !== 'AbortError') showAlert('No se pudo compartir el perfil.'); }
            };
            const renderPresentationPreview = () => {
                const narrativeCards = [['Personalidad', narrative.personality], ['Ideales', narrative.ideals], ['Vínculos', narrative.bonds], ['Defectos', narrative.flaws], ['Objetivos', narrative.goals], ['Deidad o filosofía', narrative.faith]].filter(([, value]) => String(value || '').trim());
                const featuredCards = [['Rasgo emblemático', featuredPresentationTrait?.title, featuredPresentationTrait?.desc], ['Objeto emblemático', featuredPresentationItem?.name, featuredPresentationItem?.notes || featuredPresentationItem?.description], ['Conjuro característico', featuredPresentationSpell?.name, featuredPresentationSpell ? (Number(featuredPresentationSpell.level) === 0 ? 'Truco' : `Conjuro de nivel ${featuredPresentationSpell.level}`) : '']].filter(([, title]) => title);
                return ReactDOM.createPortal(<div className="presentation-preview-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPresentationPreviewOpen(false); }}>
                    <article className="presentation-preview" data-accent={presentation?.accent || 'violet'} role="dialog" aria-modal="true" aria-labelledby="presentation-preview-title">
                        <header className="presentation-preview-hero">
                            <div className="presentation-preview-portrait">{isValidPortraitDataUrl(activeCharacter.meta.portrait) ? <img src={activeCharacter.meta.portrait} alt={`Retrato de ${charInfo.name || 'personaje'}`} /> : <span>{(charInfo.name || 'PJ').trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase()}</span>}<i>{(charInfo.cls || 'PJ').trim().slice(0,2).toLocaleUpperCase('es')}</i></div>
                            <div><small>Perfil de personaje</small><h2 id="presentation-preview-title">{charInfo.name || 'Personaje sin nombre'}</h2><p>{[charInfo.race, charInfo.cls, activeSrdSubclass?.name || characterBuild?.subclassName, `Nivel ${normalizedCharacterLevel}`].filter(Boolean).join(' · ')}</p>{presentation?.tagline && <blockquote>“{presentation.tagline}”</blockquote>}</div>
                            <button type="button" onClick={() => setPresentationPreviewOpen(false)} aria-label="Cerrar perfil">×</button>
                        </header>
                        <div className="presentation-preview-body">
                            {(narrative.appearance || narrative.history) && <section className="presentation-story"><span>Quién es</span>{narrative.appearance && <p>{narrative.appearance}</p>}{narrative.history && <p>{narrative.history}</p>}</section>}
                            {narrativeCards.length > 0 && <section className="presentation-narrative-grid">{narrativeCards.map(([label,value]) => <div key={label}><span>{label}</span><p>{value}</p></div>)}</section>}
                            {featuredCards.length > 0 && <section><h3>Señas del personaje</h3><div className="presentation-featured-grid">{featuredCards.map(([label,title,description]) => <div key={label}><span>{label}</span><strong>{title}</strong>{description && <p>{description}</p>}</div>)}</div></section>}
                            {presentation?.visibility === 'full' && <section><h3>Resumen de ficha</h3><div className="presentation-mechanics"><div><span>Puntos de golpe</span><strong>{hp.current || 0} / {hp.max || 0}</strong></div><div><span>CA</span><strong>{calculateAC()}</strong></div><div><span>Iniciativa</span><strong>{formatMod(getModNum(getEffectiveStat('des')) + (Number(initBonus) || 0))}</strong></div><div><span>Percepción pasiva</span><strong>{getPassivePerception()}</strong></div></div></section>}
                            {!narrativeCards.length && !featuredCards.length && !narrative.appearance && !narrative.history && <div className="presentation-empty"><span>✦</span><p>Completa el perfil narrativo o elige elementos emblemáticos para dar vida a esta presentación.</p></div>}
                        </div>
                        <footer><span>{presentation?.visibility === 'full' ? 'Perfil y estadísticas visibles' : 'Solo información narrativa'}</span><div><button type="button" onClick={() => { setPresentationPreviewOpen(false); setPresentationSettingsOpen(true); }}>Personalizar</button><button type="button" className="is-primary" onClick={sharePresentation}>Compartir perfil</button></div></footer>
                    </article>
                </div>, document.body);
            };

            const renderLevelUpCeremony = () => {
                const data = levelUpCeremony;
                const gains = [];
                if (data.proficiencyBefore !== data.proficiencyAfter) gains.push({ icon: '✦', label: 'Bono de competencia', value: `+${data.proficiencyBefore} → +${data.proficiencyAfter}`, tone: 'cyan' });
                gains.push({ icon: '◆', label: 'Dados de golpe', value: `+${data.hitDiceGain}${data.hitDie ? ` ${data.hitDie}` : ''}`, tone: 'red' });
                gains.push({ icon: '♥', label: 'Puntos de golpe', value: data.hpGain > 0 ? `+${data.hpGain} PV máximos` : 'Sin aumento introducido', tone: data.hpGain > 0 ? 'emerald' : 'muted' });
                data.features.forEach(feature => gains.push({ icon: '✧', label: `${feature.group} · Rasgo nuevo`, value: feature.name, tone: 'violet' }));
                data.resources.forEach(resource => gains.push({ icon: '◈', label: 'Recurso para revisar', value: `${resource.name}${resource.max ? ` · máx. ${resource.max}${resource.type ? ` ${resource.type}` : ''}` : ''}`, tone: 'amber' }));
                data.spellSlots.forEach(slot => gains.push({ icon: '◇', label: `Ranuras de nivel ${slot.level}`, value: `${slot.previous} → ${slot.current}`, tone: 'fuchsia' }));
                if (data.cantripsBefore !== data.cantripsAfter) gains.push({ icon: '◇', label: 'Trucos', value: `${data.cantripsBefore} → ${data.cantripsAfter}`, tone: 'fuchsia' });
                if (data.knownBefore !== data.knownAfter) gains.push({ icon: '◇', label: 'Conjuros conocidos', value: `${data.knownBefore} → ${data.knownAfter}`, tone: 'fuchsia' });
                if (data.preparedBefore !== data.preparedAfter) gains.push({ icon: '◇', label: 'Preparaciones', value: `${data.preparedBefore} → ${data.preparedAfter}`, tone: 'fuchsia' });
                data.improvements.forEach(improvementLevel => gains.push({ icon: '!', label: 'Decisión pendiente', value: `Mejora de característica o dote · nivel ${improvementLevel}`, tone: 'amber' }));
                if (data.classSkillChoices > 0) gains.push({ icon: '!', label: 'Elección pendiente', value: `${data.classSkillChoices} competencia${data.classSkillChoices === 1 ? '' : 's'} de clase`, tone: 'amber' });
                if (data.expertiseChoices > 0) gains.push({ icon: '!', label: 'Elección pendiente', value: `${data.expertiseChoices} opción${data.expertiseChoices === 1 ? '' : 'es'} de pericia`, tone: 'amber' });
                return ReactDOM.createPortal(<div className="level-up-ceremony" data-accent={presentation?.accent || 'violet'} role="dialog" aria-modal="true" aria-labelledby="level-up-ceremony-title">
                    <div className="level-up-atmosphere" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
                    <div className="level-up-stage">
                        <div className="level-up-crown" aria-hidden="true"><i></i><span>{(data.className || 'PJ').trim().slice(0,2).toLocaleUpperCase('es')}</span></div>
                        <div className="level-up-number" aria-label={`Nivel ${data.from} a nivel ${data.to}`}><span>{data.from}</span><i>→</i><strong>{data.to}</strong></div>
                        <div className="level-up-heading"><small>{data.className}</small><h2 id="level-up-ceremony-title">Nivel alcanzado</h2><p>{charInfo.name || 'Tu personaje'} ha avanzado hasta el nivel {data.to}</p></div>
                        <section className="level-up-gains" aria-label="Ganancias de nivel"><h3>Lo que cambia</h3><div>{gains.map((gain,index) => <article key={`${gain.label}_${index}`} data-tone={gain.tone} style={{'--gain-index':index}}><span>{gain.icon}</span><div><small>{gain.label}</small><strong>{gain.value}</strong></div></article>)}</div></section>
                        <p className="level-up-reminder">Las decisiones pendientes siguen en tus manos. La aplicación no elige dotes, atributos ni conjuros por ti.</p>
                        <button type="button" onClick={() => setLevelUpCeremony(null)}>Continuar la aventura</button>
                    </div>
                </div>, document.body);
            };

            const renderRestCeremony = () => {
                const data = restCeremony;
                const gains = [];
                if (data.hpBefore !== data.hpAfter) gains.push({ icon: '♥', label: 'Puntos de golpe', value: `${data.hpBefore} → ${data.hpAfter} / ${data.hpMax}` });
                if (data.hitDiceBefore !== data.hitDiceAfter) gains.push({ icon: '◆', label: 'Dados de golpe', value: `${data.hitDiceBefore} → ${data.hitDiceAfter}${data.hitDie ? ` ${data.hitDie}` : ''}` });
                data.resources.forEach(resource => gains.push({ icon: '✦', label: resource.name, value: `${resource.before} → ${resource.after} / ${resource.max}` }));
                data.slots.forEach(slot => gains.push({ icon: '◇', label: `Ranuras de nivel ${slot.level}`, value: `${slot.previous} → ${slot.current} / ${slot.max}` }));
                if (data.pact) gains.push({ icon: '⬡', label: 'Magia de pacto', value: `${data.pact.before} → ${data.pact.after} / ${data.pact.max}` });
                const isLong = data.type === 'long';
                return ReactDOM.createPortal(<div className={`rest-ceremony is-${data.type}`} role="dialog" aria-modal="true" aria-labelledby="rest-ceremony-title">
                    <div className="rest-ceremony-sky" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><span className="rest-orb"></span><span className="rest-horizon"></span></div>
                    <div className="rest-ceremony-stage">
                        <div className="rest-ceremony-emblem" aria-hidden="true"><i></i><span>{isLong ? '☾' : '♨'}</span></div>
                        <header>
                            <small>{isLong ? 'La noche deja paso a un nuevo día' : 'Un respiro antes de continuar'}</small>
                            <h2 id="rest-ceremony-title">{isLong ? 'Descanso largo completado' : 'Descanso corto completado'}</h2>
                            <p>{data.characterName} {isLong ? 'despierta con fuerzas renovadas.' : 'recupera el aliento y se prepara para seguir.'}</p>
                        </header>
                        <section className="rest-ceremony-results" aria-label="Recuperación del descanso">
                            <h3>Recuperación</h3>
                            {gains.length ? <div>{gains.map((gain, index) => <article key={`${gain.label}_${index}`} style={{'--rest-gain-index': index}}><span>{gain.icon}</span><div><small>{gain.label}</small><strong>{gain.value}</strong></div></article>)}</div> : <p className="rest-ceremony-complete">Todo estaba ya recuperado. El descanso queda registrado.</p>}
                        </section>
                        <p className="rest-ceremony-note">Las condiciones y decisiones manuales no se modifican automáticamente.</p>
                        <button type="button" onClick={() => setRestCeremony(null)}>{isLong ? 'Comenzar el nuevo día' : 'Continuar la aventura'}</button>
                    </div>
                </div>, document.body);
            };

            const renderDeathSaveOutcome = () => {
                const data = deathSaveOutcome;
                const stabilized = data.type === 'success';
                return ReactDOM.createPortal(<div className={`death-save-outcome is-${data.type}`} role="dialog" aria-modal="true" aria-labelledby="death-save-outcome-title">
                    <div className="death-save-outcome-vignette" aria-hidden="true"><i></i><i></i><i></i></div>
                    <article>
                        <div className="death-save-outcome-mark" aria-hidden="true"><i></i><span>{stabilized ? '✦' : '—'}</span></div>
                        <small>{stabilized ? 'Tres éxitos' : 'Tres fallos'}</small>
                        <h2 id="death-save-outcome-title">{stabilized ? 'Estabilizado' : 'El último aliento'}</h2>
                        <p>{stabilized ? `${data.characterName} recupera 1 punto de golpe y deja de realizar salvaciones contra muerte.` : `${data.characterName} ha marcado su tercer fallo contra muerte.`}</p>
                        {!stabilized && <p className="death-save-outcome-caution">Resuelve el estado del personaje con el resto de la mesa.</p>}
                        <button type="button" onClick={() => setDeathSaveOutcome(null)}>{stabilized ? 'Volver a la ficha' : 'Continuar'}</button>
                    </article>
                </div>, document.body);
            };

            const renderPrintPreview = () => {
                const pencilMode = printPreviewMode === 'pencil';
                const printCurrent = value => pencilMode ? '' : String(value ?? '');
                const printModifier = value => {
                    const numeric = Number(value) || 0;
                    return `${numeric >= 0 ? '+' : ''}${numeric}`;
                };
                const printSkillModifier = skill => {
                    const base = getModNum(getEffectiveStat(skill.stat));
                    const proficiency = hasSkillProficiency(skill.key) ? PROF_BONUS : 0;
                    const expertise = hasSkillExpertise(skill.key) ? PROF_BONUS : 0;
                    return printModifier(base + proficiency + expertise);
                };
                const printTrack = (current, max) => {
                    const count = Math.min(18, Math.max(0, Number(max) || 0));
                    const available = Math.max(0, Math.min(count, Number(current) || 0));
                    return <div className="print-track">{Array.from({ length: count }, (_, index) => <span key={index} className={!pencilMode && index < available ? 'is-filled' : ''}>{!pencilMode && index < available ? '●' : ''}</span>)}</div>;
                };
                const printableWeapons = weapons.filter(weapon => weapon.favorite).length ? weapons.filter(weapon => weapon.favorite) : weapons;
                const printableSpells = grimorioSpells.slice().sort((left, right) => Number(left.level) - Number(right.level) || String(left.name).localeCompare(String(right.name), 'es'));
                const printableTraits = displayedTraits.map(trait => trait.title).filter(Boolean);
                const printableFeats = feats.map(feat => feat.title).filter(Boolean);
                const spellSlotRows = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(slotLevel => Number(spellSlots?.[slotLevel]?.max) > 0);

                return ReactDOM.createPortal(
                    <div className="print-preview-root" role="dialog" aria-modal="true" aria-label="Vista imprimible de personaje">
                        <div className="print-preview-toolbar">
                            <div><p className="print-sheet-kicker">Vista previa</p><h2>Ficha imprimible</h2></div>
                            <div className="print-preview-toolbar-actions">
                                <button type="button" className={printPreviewMode === 'session' ? 'is-active' : ''} onClick={() => setPrintPreviewMode('session')}>Ficha de sesión</button>
                                <button type="button" className={printPreviewMode === 'pencil' ? 'is-active' : ''} onClick={() => setPrintPreviewMode('pencil')}>Ficha para lápiz</button>
                                <button type="button" className="print-primary" onClick={() => window.print()}>Imprimir / Guardar PDF</button>
                                <button type="button" onClick={() => setPrintPreviewOpen(false)} aria-label="Cerrar vista imprimible">×</button>
                            </div>
                        </div>
                        <div className="print-sheet-stack">
                            <article className="print-sheet">
                                <header className="print-sheet-heading">
                                    <div><p className="print-sheet-kicker">Ficha de personaje · Reglas 2014</p><h1>{charInfo.name || 'Personaje sin nombre'}</h1><p className="print-sheet-identity">{charInfo.race || 'Especie'} · {charInfo.cls || 'Clase'} · Nivel {normalizedCharacterLevel} · Competencia +{PROF_BONUS}</p></div>
                                    <div className="print-portrait">{isValidPortraitDataUrl(activeCharacter.meta.portrait) ? <img src={activeCharacter.meta.portrait} alt="Retrato del personaje" /> : <div className="print-portrait-placeholder">?</div>}</div>
                                </header>
                                <div className="print-grid stats">{[['FUE', 'fue'], ['DES', 'des'], ['CON', 'con'], ['INT', 'int'], ['SAB', 'sab'], ['CAR', 'car']].map(([label, key]) => <div key={key} className="print-box print-stat"><span className="print-box-label">{label}</span><strong className="print-box-value">{getEffectiveStat(key)} <small>({printModifier(getModNum(getEffectiveStat(key)))})</small></strong></div>)}</div>
                                <div className="print-grid metrics">
                                    <div className="print-box"><span className="print-box-label">Clase de armadura</span><strong className="print-box-value">{calculateAC()}</strong></div>
                                    <div className="print-box"><span className="print-box-label">Iniciativa</span><strong className="print-box-value">{printModifier(getModNum(getEffectiveStat('des')) + (Number(initBonus) || 0))}</strong></div>
                                    <div className="print-box"><span className="print-box-label">Velocidad</span><strong className="print-box-value">{speed || '—'} pies</strong></div>
                                    <div className="print-box"><span className="print-box-label">Percepción pasiva</span><strong className="print-box-value">{getPassivePerception()}</strong></div>
                                    <div className="print-box"><span className="print-box-label">Inspiración</span><strong className="print-box-value">{pencilMode ? '□' : inspiration ? 'Sí' : 'No'}</strong></div>
                                </div>
                                <section className="print-section"><h3>Salud</h3><div className="print-grid metrics"><div className="print-box"><span className="print-box-label">PV actuales</span><strong className="print-box-value">{printCurrent(curHp)}</strong></div><div className="print-box"><span className="print-box-label">PV máximos</span><strong className="print-box-value">{maxHp}</strong></div><div className="print-box"><span className="print-box-label">PV temporales</span><strong className="print-box-value">{printCurrent(tmpHp)}</strong></div><div className="print-box"><span className="print-box-label">Dados de golpe</span><strong className="print-box-value">{pencilMode ? '' : `${hitDice.current || 0} / `}{hitDice.type || '—'}</strong><div className="print-write-line"></div></div><div className="print-box"><span className="print-box-label">Salvaciones contra muerte</span><strong className="print-box-value">○ ○ ○ / ○ ○ ○</strong></div></div></section>
                                <div className="print-columns"><section className="print-section"><h3>Salvaciones</h3><ul className="print-list">{[['FUE', 'fue'], ['DES', 'des'], ['CON', 'con'], ['INT', 'int'], ['SAB', 'sab'], ['CAR', 'car']].map(([label, key]) => <li key={key}><span>{hasSavingThrowProficiency(key) ? '● ' : '○ '}{label}</span><span>{printModifier(getModNum(getEffectiveStat(key)) + (hasSavingThrowProficiency(key) ? PROF_BONUS : 0))}</span></li>)}</ul></section><section className="print-section"><h3>Habilidades</h3><ul className="print-list">{SKILLS.map(skill => <li key={skill.key}><span>{hasSkillExpertise(skill.key) ? '◆ ' : hasSkillProficiency(skill.key) ? '● ' : '○ '}{skill.name}</span><span>{printSkillModifier(skill)}</span></li>)}</ul></section></div>
                                <section className="print-section"><h3>Condiciones y efectos</h3>{pencilMode ? <div className="print-write-space"></div> : <div>{conditions.length ? conditions.map(condition => <span className="print-tag" key={condition}>{condition}</span>) : <span className="print-tag">Sin condiciones activas</span>}{timers.map(timer => <span className="print-tag" key={timer.id}>{timer.name}: {formatTimerRemaining(timer)}</span>)}</div>}</section>
                                <p className="print-page-number">Página 1</p>
                            </article>
                            <article className="print-sheet">
                                <header className="print-sheet-heading"><div><p className="print-sheet-kicker">Equipo y capacidades</p><h2>{charInfo.name || 'Personaje'}</h2></div><span className="print-sheet-identity">Nivel {normalizedCharacterLevel}</span></header>
                                <section className="print-section"><h3>Armas y ataques</h3>{printableWeapons.length ? <table className="print-table"><thead><tr><th>Arma</th><th>Ataque</th><th>Daño</th></tr></thead><tbody>{printableWeapons.flatMap(weapon => (weapon.attacks || []).length ? weapon.attacks.map((attack, index) => <tr key={`${weapon.id}-${index}`}><td>{weapon.name}{attack.name ? ` · ${attack.name}` : ''}</td><td>{getWeaponAttackBonus(attack, weapon) || '—'}</td><td>{attack.dmg || '—'}</td></tr>) : [<tr key={weapon.id}><td>{weapon.name}</td><td>—</td><td>—</td></tr>])}</tbody></table> : <div className="print-write-space"></div>}</section>
                                <section className="print-section"><h3>Recursos</h3>{resources.length ? <div className="print-grid metrics">{resources.map(resource => <div className="print-box" key={resource.id}><span className="print-box-label">{resource.name}</span><strong className="print-box-value">{pencilMode ? '' : `${resource.current} / ${resource.max}`}</strong>{printTrack(resource.current, resource.max)}</div>)}</div> : <div className="print-write-space"></div>}</section>
                                <div className="print-columns"><section className="print-section"><h3>Rasgos</h3>{printableTraits.length ? printableTraits.map(trait => <span className="print-tag" key={trait}>{trait}</span>) : <div className="print-write-space"></div>}</section><section className="print-section"><h3>Dotes</h3>{printableFeats.length ? printableFeats.map(feat => <span className="print-tag" key={feat}>{feat}</span>) : <div className="print-write-space"></div>}</section></div>
                                <section className="print-section"><h3>Inventario y moneda</h3>{inventory.length ? <table className="print-table"><thead><tr><th>Objeto</th><th>Cantidad</th></tr></thead><tbody>{inventory.map((item, index) => <tr key={`${item.name}-${index}`}><td>{item.name || 'Objeto'}</td><td>{pencilMode ? '' : item.qty || item.quantity || '1'}</td></tr>)}</tbody></table> : <div className="print-write-space"></div>}<p className="mt-2 text-xs">PC {pencilMode ? '____' : currency.pc || 0} · PP {pencilMode ? '____' : currency.plata || 0} · PE {pencilMode ? '____' : currency.electro || 0} · PO {pencilMode ? '____' : currency.po || 0} · PPL {pencilMode ? '____' : currency.platino || 0}</p></section>
                                <section className="print-section"><h3>Notas</h3><div className="print-write-space"></div></section><p className="print-page-number">Página 2</p>
                            </article>
                            {(grimorioSpells.length > 0 || srdProfileHasSpellcasting) && <article className="print-sheet"><header className="print-sheet-heading"><div><p className="print-sheet-kicker">Grimorio</p><h2>{charInfo.name || 'Personaje'}</h2><p className="print-sheet-identity">{spellcastingAbilityName || 'Característica manual'} · CD {spellSaveDc ?? '—'} · Ataque {spellAttackBonus === null ? '—' : printModifier(spellAttackBonus)}</p></div><span className="print-sheet-identity">Nivel {normalizedCharacterLevel}</span></header><section className="print-section"><h3>Ranuras de conjuro</h3>{spellSlotRows.length ? <div className="print-grid metrics">{spellSlotRows.map(slotLevel => <div key={slotLevel} className="print-box"><span className="print-box-label">Nivel {slotLevel}</span><strong className="print-box-value">{pencilMode ? '' : `${spellSlots[slotLevel].current} / ${spellSlots[slotLevel].max}`}</strong>{printTrack(spellSlots[slotLevel].current, spellSlots[slotLevel].max)}</div>)}</div> : <div className="print-write-space"></div>}</section><section className="print-section"><h3>Conjuros</h3>{printableSpells.length ? <table className="print-table"><thead><tr><th>Nivel</th><th>Conjuro</th><th>Estado</th></tr></thead><tbody>{printableSpells.map(spell => <tr key={spell.id}><td>{Number(spell.level) === 0 ? 'Truco' : spell.level}</td><td>{spell.name}</td><td>{spell.prepared ? 'Preparado' : spell.known ? 'Conocido' : ''}</td></tr>)}</tbody></table> : <div className="print-write-space"></div>}</section><section className="print-section"><h3>Notas de magia</h3><div className="print-write-space"></div></section><p className="print-page-number">Página 3</p></article>}
                        </div>
                    </div>, document.body
                );
            };

            return (
                <div className={`app-shell sheet-feedback-${sheetFeedback} h-[100dvh] overflow-hidden p-2 pb-20 md:p-6 md:pb-24 text-gray-200`}>
                    {printPreviewOpen && renderPrintPreview()}
                    {presentationPreviewOpen && renderPresentationPreview()}
                    {levelUpCeremony && renderLevelUpCeremony()}
                    {restCeremony && renderRestCeremony()}
                    {deathSavePulse && <div key={deathSavePulse.id} className={`death-save-screen-pulse is-${deathSavePulse.type}`} aria-hidden="true"><i></i></div>}
                    {deathSaveOutcome && renderDeathSaveOutcome()}
                    {sheetFeedbackMessage && <div className={`sheet-feedback-toast is-${sheetFeedback}`} role="status"><i></i><span>{sheetFeedbackMessage}</span></div>}
                    <div className="app-frame max-w-5xl h-full mx-auto flex flex-col gap-4">
                        
                        <main ref={tabScrollRef} data-active-tab={activeTab} data-combat-mode={combatMode ? 'true' : 'false'} data-transition-direction={transitionDirection} onScroll={() => { if (tabScrollRef.current) tabScrollPositions.current[activeTab] = tabScrollRef.current.scrollTop; }} onTouchStart={handleTabTouchStart} onTouchEnd={handleTabTouchEnd} onTouchCancel={() => { tabTouchStart.current = null; }} className="tab-viewport flex-1 min-h-0 overflow-y-auto pr-1 pb-4 space-y-6">
                        <div
                            data-direction={transitionDirection}
                            onAnimationEnd={handleTabTransitionEnd}
                            onTransitionEnd={handleTabTransitionEnd}
                            className={`tab-content-wrapper ${transitionPhase === 'exit' ? 'is-exiting' : transitionPhase === 'enter' ? `is-entering ${isEnterActive ? 'is-enter-active' : ''}` : ''}`}
                        >
                        <div data-tab="combat" className="combat-mode-panel tab-section space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/70 pb-3">
                                <div className="min-w-0">
                                    <p className="font-fantasy text-xs uppercase tracking-widest text-red-300">Modo Combate</p>
                                    <h1 className="font-fantasy text-xl font-bold text-white truncate">{charInfo.name || 'Personaje sin nombre'}</h1>
                                    <p className="text-sm text-purple-300 truncate">{charInfo.cls || 'Clase sin definir'} · Nivel {level || '1'}</p>
                                </div>
                                <button type="button" onClick={() => setCombatMode(false)} className="min-h-11 px-4 py-2 rounded border border-red-700 bg-red-950/40 text-red-100 hover:bg-red-900 text-xs font-fantasy uppercase tracking-wider">
                                    &#10005; Salir del combate
                                </button>
                            </div>

                            <div className="combat-mode-grid">
                                <section className="combat-mode-primary rpg-panel p-4">
                                    <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
                                        <span className="font-fantasy text-red-400 text-sm font-bold uppercase tracking-widest">Vida</span>
                                        <div className="flex items-center gap-1 font-sans">
                                            <input aria-label="Vida actual" type="number" placeholder="0" value={hp.current} onChange={e => setHp(p => ({ ...p, current: handleNumInput(e.target.value) }))} className="w-16 bg-transparent text-right text-3xl font-bold text-white outline-none" />
                                            <span className="text-gray-500 text-xl">/</span>
                                            <input aria-label="Vida maxima" type="number" placeholder="0" value={hp.max} onChange={e => setHp(p => ({ ...p, max: handleNumInput(e.target.value) }))} className="w-14 bg-transparent text-left text-xl text-gray-300 outline-none border-b border-gray-700 focus:border-red-500" />
                                        </div>
                                    </div>
                                    {renderVitalityBar(false, 'is-combat-mode')}
                                    <label className="mt-3 flex items-center justify-between gap-3 text-xs font-fantasy uppercase tracking-wider text-cyan-300">
                                        Vida temporal
                                        <input aria-label="Vida temporal" type="number" value={hp.temp || ''} placeholder="0" onChange={e => setHp(p => ({ ...p, temp: handleNumInput(e.target.value) }))} className="w-16 rounded border border-cyan-800 bg-gray-950 px-2 py-2 text-center font-sans font-bold text-cyan-200 outline-none focus:border-cyan-400" />
                                    </label>
                                </section>

                                <section className="rpg-panel p-4">
                                    <h2 className="font-fantasy text-sm font-bold uppercase tracking-widest text-purple-300 mb-3">Defensas</h2>
                                    <div className="combat-mode-stat-grid text-center">
                                        <div className="col-span-2 rounded border border-gray-700 bg-gray-900/70 p-2"><span className="block text-[10px] uppercase tracking-wider text-gray-400">CA</span><strong className="text-3xl text-white">{calculateAC()}</strong>{renderAcTemporaryControls()}{renderAcBreakdown()}</div>
                                        <div className="rounded border border-gray-700 bg-gray-900/70 p-2"><span className="block text-[10px] uppercase tracking-wider text-gray-400">Iniciativa</span><strong className="text-2xl text-white">{formatMod(getModNum(getEffectiveStat('des')) + (Number(initBonus) || 0))}</strong></div>
                                        <div className="rounded border border-gray-700 bg-gray-900/70 p-2"><span className="block text-[10px] uppercase tracking-wider text-gray-400">Velocidad</span><strong className="text-2xl text-white">{speed || '0'}</strong></div>
                                        <div className="rounded border border-gray-700 bg-gray-900/70 p-2"><span className="block text-[10px] uppercase tracking-wider text-gray-400">Percepcion</span><strong className="text-2xl text-white">{getPassivePerception()}</strong></div>
                                    </div>
                                </section>

                                <section className="rpg-panel p-4 flex items-center justify-between gap-4">
                                    <div><h2 className="font-fantasy text-sm font-bold uppercase tracking-widest text-yellow-300">Inspiracion</h2><p className={`mt-1 text-xs font-bold ${inspiration ? 'text-yellow-200' : 'text-gray-500'}`}>{inspiration ? 'Disponible' : 'Gastada'}</p></div>
                                    <button onClick={() => setInspiration(!inspiration)} className={`w-14 h-14 shrink-0 rounded-full transition-all duration-300 flex items-center justify-center border-2 ${inspiration ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 border-yellow-200 animate-pulse-glow text-yellow-900' : 'bg-gray-800 border-gray-600 text-gray-500 hover:border-yellow-600 hover:text-yellow-500'}`} title="Gastala antes de tirar para obtener ventaja en un ataque, prueba o salvacion." aria-label={`Inspiracion ${inspiration ? 'disponible' : 'gastada'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg></button>
                                </section>

                                <section className="rpg-panel p-4">
                                    <h2 className="font-fantasy text-sm font-bold uppercase tracking-widest text-purple-300 mb-3">Recursos</h2>
                                    <div className="combat-mode-list">
                                        {tacticalResources.map((resource, index) => <div key={resource.id} className="rounded border border-gray-700 bg-gray-900/70 p-2"><div className="flex flex-wrap items-center justify-between gap-2"><span className="min-w-0 text-sm font-semibold text-gray-100 truncate">{resource.name}</span>{renderUsageDots(resource.current, resource.max, 'text-purple-400')}<div className="flex items-center gap-2 shrink-0"><button aria-label={`Reducir ${resource.name}`} onClick={() => setResources(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, current: Math.max(0, Number(item.current) - 1) } : item))} className="w-10 h-10 rounded border border-gray-600 bg-gray-800 text-lg text-gray-200">−</button><span className="flex items-center w-14 text-center font-bold text-white"><input aria-label={`${resource.name} actuales`} type="number" min="0" value={resource.current} onChange={event => setResources(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, current: handleBoundedNumInput(event.target.value, item.max) } : item))} className="w-7 bg-transparent text-center outline-none"/><span>/{resource.max}</span></span><button aria-label={`Aumentar ${resource.name}`} onClick={() => setResources(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, current: Math.min(Number(item.max), Number(item.current) + 1) } : item))} className="w-10 h-10 rounded border border-gray-600 bg-gray-800 text-lg text-gray-200">+</button></div></div></div>)}
                                        {grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 && <div className="rounded border border-yellow-800/70 bg-yellow-950/20 p-2"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold text-yellow-100">Magia de pacto (N{grimoireConfig.pactSlots.level})</span>{renderUsageDots(grimoireConfig.pactSlots.current, grimoireConfig.pactSlots.max, 'text-yellow-300')}<div className="flex items-center gap-2"><button type="button" onClick={() => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: Math.max(0, Number(previous.pactSlots.current) - 1) } }))} className="w-10 h-10 rounded border border-yellow-700 bg-gray-900 text-yellow-100">−</button><span className="flex items-center w-14 font-bold text-yellow-100"><input aria-label="Ranuras de magia de pacto actuales" type="number" min="0" value={grimoireConfig.pactSlots.current} onChange={event => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: handleBoundedNumInput(event.target.value, previous.pactSlots.max) } }))} className="w-7 bg-transparent text-center outline-none"/><span>/{grimoireConfig.pactSlots.max}</span></span><button type="button" onClick={() => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: Math.min(Number(previous.pactSlots.max), Number(previous.pactSlots.current) + 1) } }))} className="w-10 h-10 rounded border border-yellow-700 bg-gray-900 text-yellow-100">+</button></div></div></div>}
                                        {!tacticalResources.length && !(grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0) && <p className="text-sm text-gray-500">No hay recursos de combate configurados.</p>}
                                    </div>
                                </section>

                                <section className="rpg-panel p-4">
                                    <h2 className="font-fantasy text-sm font-bold uppercase tracking-widest text-purple-300 mb-3">Armas</h2>
                                    <div className="combat-mode-list">{tacticalWeapons.length ? tacticalWeapons.map(weapon => <div key={weapon.id} className="rounded border border-gray-700 bg-gray-900/70 p-2"><strong className="block text-sm text-white">{weapon.name}</strong>{weapon.attacks?.slice(0, 2).map((attack, index) => <div key={`${weapon.id}-${index}`} className="mt-1 flex justify-between gap-3 text-xs"><span className="truncate text-gray-300">{attack.name}</span><span className="shrink-0 text-green-300">{getWeaponAttackBonus(attack, weapon) || '-'}</span><span className="shrink-0 text-red-300">{attack.dmg || '-'}</span></div>)}</div>) : <p className="text-sm text-gray-500">No hay armas configuradas.</p>}</div>
                                </section>

                                <section className="rpg-panel p-4">
                                    <h2 className="font-fantasy text-sm font-bold uppercase tracking-widest text-fuchsia-300 mb-3">Conjuros</h2>
                                    <div className="combat-mode-list">{tacticalSpells.length ? tacticalSpells.map(spell => <button key={spell.id} onClick={() => setCastSpell(spell)} className="min-h-11 flex items-center justify-between gap-3 rounded border border-fuchsia-900 bg-gray-900/70 px-3 py-2 text-left hover:border-fuchsia-500"><span className="truncate font-semibold text-gray-100">{spell.name}</span><span className="shrink-0 text-xs text-fuchsia-300">{spell.level === 0 ? 'Truco' : `N${spell.level}`}</span></button>) : <p className="text-sm text-gray-500">No hay conjuros disponibles.</p>}</div>
                                </section>

                                <section className="rpg-panel p-4">
                                    <h2 className="font-fantasy text-sm font-bold uppercase tracking-widest text-cyan-300 mb-3">Temporizadores</h2>
                                    {renderTimerList()}
                                </section>

                                <section className="rpg-panel p-4">
                                    <h2 className="font-fantasy text-sm font-bold uppercase tracking-widest text-purple-300 mb-3">Condiciones</h2>
                                    {conditions.length ? <div className="flex flex-wrap gap-2">{conditions.map(condition => <button key={condition} onClick={() => setConditions(previous => previous.filter(item => item !== condition))} className="min-h-10 px-3 rounded-full border border-red-400 bg-red-950/70 text-xs font-semibold text-red-100">{condition} ×</button>)}</div> : <p className="text-sm text-gray-500">Sin condiciones activas.</p>}
                                    <button type="button" onClick={() => setConditionsManagerOpen(value => !value)} className="mt-3 min-h-10 px-3 rounded border border-gray-600 bg-gray-900/70 text-xs text-gray-200 hover:border-purple-500">{conditionsManagerOpen ? 'Ocultar gestión' : 'Gestionar condiciones'}</button>
                                    {conditionsManagerOpen && <div className="mt-3 flex flex-wrap gap-2">{combatConditions.map(condition => <button key={condition} onClick={() => setConditions(previous => previous.includes(condition) ? previous.filter(item => item !== condition) : [...previous, condition])} className={`min-h-10 px-3 rounded border text-xs font-semibold transition-colors ${conditions.includes(condition) ? 'border-red-400 bg-red-950/70 text-red-100' : 'border-gray-700 bg-gray-900/70 text-gray-300 hover:border-purple-500'}`}>{condition}</button>)}</div>}
                                </section>
                            </div>
                        </div>

                        <div data-tab="combat" className="combat-dashboard tab-section space-y-5">
                            <nav className="combat-dashboard-tabs" aria-label="Secciones de combate">
                                {[
                                    ['summary', 'Resumen'],
                                    ['conditions', 'Condiciones'],
                                    ['timers', 'Temporizadores']
                                ].map(([section, label]) => (
                                    <button
                                        key={section}
                                        type="button"
                                        onClick={() => setCombatDashboardView(section)}
                                        className={`combat-dashboard-tab ${combatDashboardView === section ? 'is-active' : ''}`}
                                        aria-pressed={combatDashboardView === section}
                                    >
                                        <CombatSectionIcon section={section} />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </nav>

                            {activeConcentration && <section className="concentration-banner" role="status"><span className="concentration-banner-sigil" aria-hidden="true">C</span><div className="min-w-0 flex-1"><span className="concentration-banner-kicker">Concentración activa</span><strong>{activeConcentration.spellName}</strong><small>Desde {new Date(activeConcentration.startedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</small></div><button type="button" onClick={finishConcentration}>Finalizar concentración</button></section>}

                        {combatDashboardView === 'summary' && <>
                        {/* TOP BAR: STATS PRINCIPALES (BARRA DE VIDA, CA, ETC) */}
                        <div className="combat-summary-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                            
                            {/* BLOQUE DE VIDA ESTILO VIDEOJUEGO (Ocupa 2 columnas) */}
                            <div className="combat-health-card col-span-2 rpg-panel p-3 flex flex-col justify-center relative overflow-hidden">
                                <div className="flex justify-between items-end mb-1 z-10">
                                    <span className="font-fantasy text-red-400 text-[10px] md:text-sm font-bold uppercase tracking-widest">Salud</span>
                                    <div className="flex items-center space-x-1 font-sans">
                                        <input type="number" placeholder="0" value={hp.current} onChange={e => setHp(p => ({ ...p, current: handleNumInput(e.target.value) }))} className="w-12 bg-transparent text-right text-2xl font-bold text-white outline-none" />
                                        <span className="text-gray-500 text-lg">/</span>
                                        <input type="number" placeholder="0" value={hp.max} onChange={e => setHp(p => ({ ...p, max: handleNumInput(e.target.value) }))} className="w-10 bg-transparent text-left text-lg text-gray-400 outline-none border-b border-transparent hover:border-gray-600 focus:border-red-500" />
                                    </div>
                                </div>
                                
                                {/* Barra Visual Táctil (Draggable) */}
                                {renderVitalityBar(true, 'mt-1')}

                                {/* Vida Temporal Input */}
                                <div className="mt-2 flex items-center justify-between z-10">
                                    <span className="font-fantasy text-cyan-400 text-[10px] font-bold tracking-widest uppercase">Vida Temporal</span>
                                    <div className="flex items-center bg-gray-900/80 rounded-full border border-cyan-800/50 px-2 py-0.5">
                                        <button onClick={() => setHp(p => ({ ...p, temp: String(Math.max(0, (Number(p.temp)||0) - 1)) }))} className="text-gray-500 hover:text-cyan-400 px-1">-</button>
                                        <input type="number" value={hp.temp || ""} placeholder="0" onChange={e => setHp(p => ({ ...p, temp: handleNumInput(e.target.value) }))} className="w-8 bg-transparent text-center text-sm font-bold text-cyan-300 outline-none" />
                                        <button onClick={() => setHp(p => ({ ...p, temp: String((Number(p.temp)||0) + 1) }))} className="text-gray-500 hover:text-cyan-400 px-1">+</button>
                                    </div>
                                </div>
                            </div>

                            {}
                            {/* Dados de Golpe */}
                            <section className="combat-hit-dice-card combat-stat-card rpg-panel">
                                <header><span className="combat-stat-emblem is-die" aria-hidden="true"><i></i><b>{hitDice.type || 'd?'}</b></span><div><small>Recuperación</small><h3>Dados de golpe</h3></div></header>
                                <div className="combat-hit-dice-uses">{renderUsageDots(hitDice.current, level, 'text-cyan-400')}</div>
                                <div className="combat-stat-counter"><button type="button" aria-label="Gastar un dado de golpe" onClick={() => setHitDice(p => ({ ...p, current: String(Math.max(0, (Number(p.current)||0) - 1)) }))}>−</button><label><small>Disponibles</small><span><input aria-label="Dados de golpe actuales" type="number" placeholder="0" value={hitDice.current} onChange={e => setHitDice(p => ({ ...p, current: handleNumInput(e.target.value) }))}/><i>/</i><b>{Number(level)||0}</b></span></label><button type="button" aria-label="Recuperar un dado de golpe" onClick={() => setHitDice(p => ({ ...p, current: String(Math.min(Number(level)||0, (Number(p.current)||0) + 1)) }))}>+</button></div>
                                <label className="combat-hit-die-type"><span>Tipo de dado</span><input aria-label="Tipo de dado de golpe" type="text" placeholder="d8" title="Ej: d8" value={hitDice.type} onChange={e => setHitDice(p => ({...p, type: e.target.value}))}/></label>
                            </section>

                            {/* CA Calculada */}
                            <section className="combat-ac-card combat-stat-card rpg-panel">
                                <header><span className="combat-stat-emblem is-shield" aria-hidden="true"><CombatSectionIcon section="summary" /></span><div><small>Defensa total</small><h3>Clase de armadura</h3></div></header>
                                <div className="combat-ac-value"><small>CA final</small><strong>{calculateAC()}</strong><i></i></div>
                                {renderAcTemporaryControls()}
                                {renderAcBreakdown()}
                            </section>

                            {/* Iniciativa y Percepción (Columna apilada) */}
                            <div className="combat-initiative-stack">
                                <section className="combat-quick-stat is-initiative rpg-panel"><header><span aria-hidden="true">↯</span><div><small>Orden de turno</small><h3>Iniciativa</h3></div></header><div className="combat-quick-stat-value"><strong>{formatMod(getModNum(getEffectiveStat('des')) + (Number(initBonus)||0))}</strong><label><span>Bono adicional</span><input aria-label="Bono adicional de iniciativa" type="number" value={initBonus} onChange={e => setInitBonus(handleNumInput(e.target.value))}/></label></div></section>
                                <section className="combat-quick-stat is-perception rpg-panel"><header><span aria-hidden="true">◉</span><div><small>Atención constante</small><h3>Percepción pasiva</h3></div></header><div className="combat-quick-stat-value"><strong>{getPassivePerception()}</strong><p>10 + Sabiduría + competencia</p></div></section>
                            </div>

                            {/* INSPIRACIÓN D&D 5e (2014) */}
                            <section className={`combat-inspiration-card combat-stat-card rpg-panel ${inspiration ? 'is-active' : ''}`}>
                                <header><span className="combat-stat-emblem is-inspiration" aria-hidden="true">✦</span><div><small>Ventaja narrativa</small><h3>Inspiración</h3></div></header>
                                <button
                                    type="button"
                                    onClick={() => setInspiration(!inspiration)}
                                    className="combat-inspiration-toggle"
                                    title="Gástala antes de tirar para obtener ventaja en un ataque, prueba o salvación."
                                    aria-label={`Inspiración ${inspiration ? 'disponible' : 'gastada'}. Gástala antes de tirar para obtener ventaja en un ataque, prueba o salvación.`}
                                >
                                    <span aria-hidden="true"><i></i><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg></span><div><small>{inspiration ? 'Lista para usar' : 'No disponible'}</small><strong>{inspiration ? 'Inspiración disponible' : 'Marcar inspiración'}</strong></div><b>{inspiration ? '✓' : '+'}</b>
                                </button>
                                <p className="combat-inspiration-help">Úsala antes de tirar para obtener ventaja.</p>
                                <span className="sr-only">Gástala antes de tirar para obtener ventaja en un ataque, prueba o salvación.</span>
                            </section>

                        </div>

                        </>}

                        {combatDashboardView === 'conditions' && <div className="combat-conditions-panel rpg-panel">
                            <header className="combat-tracker-header"><div className="combat-tracker-heading"><span aria-hidden="true">✷</span><div><small>Estado del personaje</small><h2>Condiciones</h2><p>Registra recordatorios sin aplicar efectos automáticos.</p></div></div><button type="button" onClick={() => setConditionsManagerOpen(value => !value)} className={conditionsManagerOpen ? 'is-active' : ''}><span aria-hidden="true">{conditionsManagerOpen ? '✓' : '+'}</span>{conditionsManagerOpen ? 'Terminar' : 'Editar condiciones'}</button></header>
                            <div className="combat-conditions-body">
                                {conditions.length ? <div className="combat-condition-active-grid">{conditions.map(condition => <button key={condition} onClick={() => setConditions(previous => previous.filter(item => item !== condition))} className="combat-condition-active"><span aria-hidden="true">{conditionSymbols[condition] || '✷'}</span><div><small>Condición activa</small><strong>{condition}</strong></div><i aria-hidden="true">×</i></button>)}</div> : <div className="combat-tracker-empty is-condition"><span aria-hidden="true">◇</span><strong>Sin condiciones activas</strong><p>El personaje no tiene ningún estado adverso registrado.</p></div>}
                                {conditionsManagerOpen && <section className="combat-condition-manager"><header><div><small>Selector de estados</small><h3>Marca las condiciones activas</h3></div><span>{conditions.length} activa{conditions.length === 1 ? '' : 's'}</span></header><div>{combatConditions.map(condition => { const active = conditions.includes(condition); return <button type="button" key={condition} aria-pressed={active} onClick={() => setConditions(previous => active ? previous.filter(item => item !== condition) : [...previous, condition])} className={active ? 'is-active' : ''}><span aria-hidden="true">{conditionSymbols[condition] || '✷'}</span><strong>{condition}</strong><i aria-hidden="true">{active ? '✓' : '+'}</i></button>; })}</div></section>}
                            </div>
                        </div>}

                        {combatDashboardView === 'timers' && <div className="combat-timers-panel rpg-panel">
                            <header className="combat-tracker-header"><div className="combat-tracker-heading"><span aria-hidden="true">⌛</span><div><small>Seguimiento de duración</small><h2>Temporizadores</h2><p>Controla efectos por turnos, rondas o tiempo real.</p></div></div><button type="button" onClick={() => openTimerModal()}><span aria-hidden="true">+</span>Nuevo temporizador</button></header>
                            <div className="combat-timers-body">{renderTimerList(true)}</div>
                        </div>}

                        {onlineReconnectState.message && <div className={`flex flex-wrap items-center justify-between gap-3 rounded border px-3 py-2 text-sm ${onlineReconnectState.status === 'error' ? 'border-yellow-800 bg-yellow-950/30 text-yellow-100' : 'border-cyan-800 bg-cyan-950/25 text-cyan-100'}`}><span>{onlineReconnectState.message}</span>{onlineReconnectState.status === 'error' && <button type="button" onClick={retryRoomConnection} className="min-h-9 px-3 rounded border border-cyan-700 text-xs text-cyan-100">Reintentar conexión</button>}</div>}

                        </div>

                        <div data-tab="character" className="character-tab-intro tab-section">
                            {/* HEADER FANTASÍA */}
                            <div className={`character-header character-identity-hero rpg-panel p-4 flex flex-col gap-3 relative sheet-feedback-${sheetFeedback}`} data-accent={presentation?.accent || 'violet'}>
                                <div className="glass-overlay"></div>
                                <input ref={portraitFileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePortraitFile} className="hidden" />
                                <div className="character-header-menu z-30">
                                    <button type="button" onClick={() => setCharacterHeaderMenuOpen(value => !value)} className="character-header-menu-toggle" aria-expanded={characterHeaderMenuOpen} aria-label="Abrir acciones de personaje">⋯</button>
                                    {characterHeaderMenuOpen && ReactDOM.createPortal(<><button type="button" className="character-header-menu-scrim" onClick={() => setCharacterHeaderMenuOpen(false)} aria-label="Cerrar menú de personaje"></button><aside className="character-header-menu-panel" data-accent={presentation?.accent || 'violet'} role="menu" aria-label="Acciones de personaje">
                                        <header className="character-header-menu-profile"><div>{isValidPortraitDataUrl(activeCharacter.meta.portrait) ? <img src={activeCharacter.meta.portrait} alt="" /> : <span>{(charInfo.name || 'PJ').trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase()}</span>}<i>{(charInfo.cls || 'PJ').trim().slice(0,2).toUpperCase()}</i></div><section><small>Ficha activa</small><strong>{charInfo.name || 'Personaje sin nombre'}</strong><p>{[charInfo.race, charInfo.cls, `Nivel ${normalizedCharacterLevel}`].filter(Boolean).join(' · ')}</p></section><button type="button" onClick={() => setCharacterHeaderMenuOpen(false)} aria-label="Cerrar menú">×</button></header>
                                        <div className="character-header-menu-groups">
                                            <section><h3>Personaje</h3><div>
                                                <button type="button" role="menuitem" onClick={() => { setCharacterBuildOpen(true); setCharacterHeaderMenuOpen(false); }}><span>✦</span><div><strong>Personalizar personaje</strong><small>Clase, especie y construcción</small></div></button>
                                                <button type="button" role="menuitem" onClick={() => { setPresentationSettingsOpen(true); setCharacterHeaderMenuOpen(false); }}><span>◇</span><div><strong>Identidad visual</strong><small>Color, lema y presentación</small></div></button>
                                                <button type="button" role="menuitem" className={lastReviewedLevel < normalizedCharacterLevel ? 'has-notice' : ''} onClick={() => { setLevelReviewHpGain(''); setLevelReviewChecks({}); setLevelReviewOpen(true); setCharacterHeaderMenuOpen(false); }}><span>↑</span><div><strong>{lastReviewedLevel < normalizedCharacterLevel ? `Revisar nivel ${normalizedCharacterLevel}` : 'Nivel revisado'}</strong><small>{lastReviewedLevel < normalizedCharacterLevel ? 'Hay cambios pendientes' : 'Progreso comprobado'}</small></div>{lastReviewedLevel < normalizedCharacterLevel && <i></i>}</button>
                                            </div></section>
                                            <section><h3>Sesión</h3><div>
                                                <button type="button" role="menuitem" onClick={() => { setRestModalOpen(true); setRestType(null); setCharacterHeaderMenuOpen(false); }}><span>☾</span><div><strong>Descansar</strong><small>Recuperar vida y recursos</small></div></button>
                                                <button type="button" role="menuitem" onClick={() => { setActivityHistoryOpen(true); setCharacterHeaderMenuOpen(false); }}><span>≡</span><div><strong>Historial</strong><small>Consultar cambios recientes</small></div></button>
                                                <button type="button" role="menuitem" onClick={() => { setAppSettingsOpen(true); setCharacterHeaderMenuOpen(false); }}><span>⚙</span><div><strong>Configuración</strong><small>Tema, idioma y accesibilidad</small></div></button>
                                            </div></section>
                                            <section><h3>Compartir y consultar</h3><div>
                                                <button type="button" role="menuitem" onClick={() => { setPresentationPreviewOpen(true); setCharacterHeaderMenuOpen(false); }}><span>◎</span><div><strong>Perfil compartible</strong><small>Presentación del personaje</small></div></button>
                                                <button type="button" role="menuitem" onClick={() => { setPrintPreviewOpen(true); setCharacterHeaderMenuOpen(false); }}><span>▤</span><div><strong>Vista imprimible</strong><small>Ficha preparada para papel</small></div></button>
                                            </div></section>
                                        </div>
                                        <footer><button type="button" role="menuitem" onClick={() => { setCharacterManagerOpen(true); setCharacterHeaderMenuOpen(false); }} className="character-header-menu-primary"><span>⇄</span><div><strong>Cambiar personaje</strong><small>{characterList.length} ficha{characterList.length === 1 ? '' : 's'} disponible{characterList.length === 1 ? '' : 's'}</small></div><b>→</b></button></footer>
                                    </aside></>, document.body)}
                                </div>
                                <div className="character-header-content z-10 flex flex-1 min-w-0 w-full flex-row items-start gap-3 pr-12">
                                    <div className="character-portrait-stack shrink-0 flex flex-col items-center gap-2">
                                        <span className="character-class-sigil" aria-hidden="true">{(charInfo.cls || 'PJ').trim().slice(0, 2).toLocaleUpperCase('es')}</span>
                                        {isValidPortraitDataUrl(activeCharacter.meta.portrait) ? <button type="button" onClick={() => setPortraitViewerOpen(true)} className="character-portrait w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-purple-500/70 bg-gray-900 shadow-[0_0_16px_rgba(168,85,247,0.25)] hover:border-purple-300 focus-visible:outline-purple-300" aria-label={`Ampliar retrato de ${charInfo.name || 'personaje'}`}><img src={activeCharacter.meta.portrait} alt={`Retrato de ${charInfo.name || 'personaje'}`} className="w-full h-full object-cover" /></button> : <div className="character-portrait w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-purple-500/70 bg-gray-900 shadow-[0_0_16px_rgba(168,85,247,0.25)] flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-purple-400/70" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.8-3.8 3.2-5.8 7.5-5.8s6.7 2 7.5 5.8"/></svg></div>}
                                        {isValidPortraitDataUrl(activeCharacter.meta.portrait) ? <div className="character-portrait-actions flex gap-2"><button type="button" title="Cambiar retrato" aria-label="Cambiar retrato" onClick={() => portraitFileRef.current?.click()} className="is-change min-h-9 px-2 py-1 rounded border border-purple-700 bg-purple-950/50 hover:bg-purple-900 text-purple-100 text-[9px] font-fantasy uppercase tracking-wider"><span>Cambiar</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 16v4h4M20 8V4h-4M5.5 9A7 7 0 0 1 17 5.5L20 8M18.5 15A7 7 0 0 1 7 18.5L4 16"/></svg></button><button type="button" title="Eliminar retrato" aria-label="Eliminar retrato" onClick={removePortrait} className="is-remove min-h-9 px-2 py-1 rounded border border-red-800 bg-red-950/50 hover:bg-red-900 text-red-200 text-[9px] font-fantasy uppercase tracking-wider"><span>Eliminar</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6"/></svg></button></div> : <button type="button" onClick={() => portraitFileRef.current?.click()} className="character-portrait-add min-h-9 px-3 py-1 rounded border border-purple-700 bg-purple-950/50 hover:bg-purple-900 text-purple-100 text-[9px] font-fantasy uppercase tracking-wider">Añadir retrato</button>}
                                    </div>
                                    <div className="character-identity flex-1 min-w-0 w-full">
                                        <span className="character-identity-kicker">Ficha de personaje</span>
                                        <input type="text" placeholder="Ej: Kael Velosombrío" value={charInfo.name} onChange={e => setCharInfo({...charInfo, name: e.target.value})} className="character-name-input font-fantasy text-3xl md:text-4xl font-bold text-transparent placeholder:text-gray-500 bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 tracking-wider bg-transparent border-b border-transparent hover:border-gray-600 focus:border-purple-500 outline-none w-full max-w-[400px] transition-colors" />
                                        <div className="character-meta flex items-center flex-wrap text-purple-400 font-medium text-sm md:text-base mt-2 font-fantasy tracking-widest gap-2">
                                            <span className="character-meta-item min-w-16 uppercase text-purple-300">{charInfo.race || 'Especie'}</span>
                                            <span className="character-meta-separator text-gray-500">|</span>
                                            <span className="character-meta-item min-w-20 uppercase text-purple-300">{charInfo.cls || 'Clase'}</span>
                                            <span className="character-meta-separator text-gray-500">|</span>
                                            <span className="character-meta-level-group">
                                                <span className="character-meta-item character-level uppercase flex items-center">
                                                    Nivel <input type="number" min="1" max="20" value={levelDraft} onChange={event => setLevelDraft(event.target.value.replace(/\D/g,''))} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); requestLevelChange(); event.currentTarget.blur(); } if (event.key === 'Escape') { setLevelDraft(String(level)); event.currentTarget.blur(); } }} className="w-10 mx-1 bg-transparent border-b border-purple-500 text-center outline-none text-white focus:bg-gray-800 rounded font-sans" />
                                                    {String(levelDraft || '') !== String(level || '') && <button type="button" onClick={requestLevelChange} className="character-level-confirm" aria-label={`Confirmar nivel ${levelDraft || level}`}>Confirmar</button>}
                                                </span>
                                                <span className="character-proficiency-badge bg-purple-900/40 border border-purple-500 text-fuchsia-300 px-2 py-0.5 text-xs font-bold font-sans shadow-inner whitespace-nowrap">
                                                    Competencia +{PROF_BONUS}
                                                </span>
                                            </span>
                                        </div>
                                        {presentation?.tagline && <p className="character-tagline">“{presentation.tagline}”</p>}
                                        <div className="character-live-summary" aria-label="Estado actual del personaje">
                                            <span><b>{hp.current || 0}</b>/{hp.max || 0} PV{Number(hp.temp) > 0 ? ` · ${hp.temp} temporales` : ''}</span>
                                            {activeConcentration && <button type="button" onClick={() => requestTabChange('combat')}><i>C</i>{activeConcentration.spellName}</button>}
                                            {conditions.slice(0, 2).map(condition => <button type="button" key={typeof condition === 'string' ? condition : condition.name} onClick={() => { setCombatDashboardView('conditions'); requestTabChange('combat'); }}>{typeof condition === 'string' ? condition : condition.name}</button>)}
                                            {conditions.length > 2 && <button type="button" onClick={() => { setCombatDashboardView('conditions'); requestTabChange('combat'); }}>+{conditions.length - 2}</button>}
                                            <button type="button" className="character-presentation-shortcut" onClick={() => setPresentationPreviewOpen(true)}>✦ Ver presentación</button>
                                        </div>
                                        <CharacterBuildModal
                                            isOpen={characterBuildOpen}
                                            onClose={() => setCharacterBuildOpen(false)}
                                            normalizedCharacterLevel={normalizedCharacterLevel}
                                            remainingClassSkillChoices={remainingClassSkillChoices}
                                            remainingExpertiseChoices={remainingExpertiseChoices}
                                            characterBuild={characterBuild}
                                            charInfo={charInfo}
                                            srdCharacterRules={srdCharacterRules}
                                            selectedSrdClass={selectedSrdClass}
                                            activeSrdSubclass={activeSrdSubclass}
                                            selectedSrdSpecies={selectedSrdSpecies}
                                            selectedSrdBackground={selectedSrdBackground}
                                            originSkillProficiencies={originSkillProficiencies}
                                            skillProficiencySources={skillProficiencySources}
                                            automaticSavingThrows={automaticSavingThrows}
                                            automaticExpertiseChoices={automaticExpertiseChoices}
                                            proficiencyBonus={PROF_BONUS}
                                            automaticSkillProficiencies={automaticSkillProficiencies}
                                            availableAutomaticRuleTraits={availableAutomaticRuleTraits}
                                            skills={SKILLS}
                                            requiredClassSkillChoices={requiredClassSkillChoices}
                                            selectedClassSkillChoiceCount={selectedClassSkillChoiceCount}
                                            automaticExpertiseLimit={automaticExpertiseLimit}
                                            selectedExpertiseChoiceCount={selectedExpertiseChoiceCount}
                                            hasSkillProficiency={hasSkillProficiency}
                                            createDefaultCharacterBuild={createDefaultCharacterBuild}
                                            setCharInfo={setCharInfo}
                                            setCharacterBuild={setCharacterBuild}
                                        />
                                        {CharacterCreationWizard && <CharacterCreationWizard
                                            key={`character-creation-${activeCharacter.meta.id}`}
                                            isOpen={characterCreationWizardOpen}
                                            onClose={() => setCharacterCreationWizardOpen(false)}
                                            charInfo={charInfo}
                                            level={level}
                                            characterBuild={characterBuild}
                                            srdCharacterRules={srdCharacterRules}
                                            selectedSrdClass={selectedSrdClass}
                                            activeSrdSubclass={activeSrdSubclass}
                                            selectedSrdSpecies={selectedSrdSpecies}
                                            selectedSrdBackground={selectedSrdBackground}
                                            originSkillProficiencies={originSkillProficiencies}
                                            skillProficiencySources={skillProficiencySources}
                                            automaticSavingThrows={automaticSavingThrows}
                                            automaticExpertiseChoices={automaticExpertiseChoices}
                                            proficiencyBonus={PROF_BONUS}
                                            hp={hp}
                                            hitDice={hitDice}
                                            speed={speed}
                                            size={size}
                                            initBonus={initBonus}
                                            stats={stats}
                                            srdProfileHasSpellcasting={srdProfileHasSpellcasting}
                                            srdSpellcastingProfile={srdSpellcastingProfile}
                                            srdProfileCantrips={srdProfileCantrips}
                                            srdProfileKnownLimit={srdProfileKnownLimit}
                                            srdProfilePreparedLimit={srdProfilePreparedLimit}
                                            srdProfileMaxSpellLevel={srdProfileMaxSpellLevel}
                                            onOpenGrimoire={() => { setCharacterCreationWizardOpen(false); setActiveTab('grimoire'); }}
                                            skills={SKILLS}
                                            remainingClassSkillChoices={remainingClassSkillChoices}
                                            remainingExpertiseChoices={remainingExpertiseChoices}
                                            requiredClassSkillChoices={requiredClassSkillChoices}
                                            selectedClassSkillChoiceCount={selectedClassSkillChoiceCount}
                                            automaticExpertiseLimit={automaticExpertiseLimit}
                                            selectedExpertiseChoiceCount={selectedExpertiseChoiceCount}
                                            automaticSkillProficiencies={automaticSkillProficiencies}
                                            availableAutomaticRuleTraits={availableAutomaticRuleTraits}
                                            hasSkillProficiency={hasSkillProficiency}
                                            createDefaultCharacterBuild={createDefaultCharacterBuild}
                                            normalizeNumberInput={handleNumInput}
                                            setCharInfo={setCharInfo}
                                            setLevel={setLevel}
                                            setCharacterBuild={setCharacterBuild}
                                            setHp={setHp}
                                            setHitDice={setHitDice}
                                            setSpeed={setSpeed}
                                            setSize={setSize}
                                            setInitBonus={setInitBonus}
                                            setStats={setStats}
                                        />}
                                        {levelReviewOpen && ReactDOM.createPortal(<div className="character-build-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeLevelReview(); }}>
                                            <section className="rpg-panel level-review-modal border border-cyan-700" role="dialog" aria-modal="true" aria-labelledby="level-review-title">
                                                <header className="level-review-heading flex items-start justify-between gap-3 border-b border-cyan-900/70 px-4 py-3 sm:px-5">
                                                    <div><p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">{pendingLevelChange ? 'Confirmar subida' : 'Subida guiada'}</p><h3 id="level-review-title" className="mt-1 font-fantasy text-lg font-bold uppercase tracking-wider text-white">{pendingLevelChange ? `Nivel ${levelReviewStart} → ${levelReviewTarget}` : `Revisión de nivel ${levelReviewTarget}`}</h3><p className="mt-1 text-xs text-gray-400">{levelReviewDelta ? `Cambios desde el nivel ${levelReviewStart || 'inicial'}. Revisa cada apartado antes de confirmar.` : 'Este nivel ya está revisado. Puedes consultar de nuevo su estado sin aplicar cambios.'}</p></div>
                                                    <div className="level-review-heading-actions">{levelReviewDelta > 0 && <div className="level-review-progress" aria-label={`${levelReviewChecklist.filter(item => levelReviewChecks[item.key]).length} de ${levelReviewChecklist.length} apartados revisados`}><span><i style={{width: `${levelReviewChecklist.length ? (levelReviewChecklist.filter(item => levelReviewChecks[item.key]).length / levelReviewChecklist.length) * 100 : 0}%`}}></i></span><strong>{levelReviewChecklist.filter(item => levelReviewChecks[item.key]).length}/{levelReviewChecklist.length}</strong><small>revisados</small></div>}<button type="button" onClick={closeLevelReview} className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-600 text-xl text-gray-200" aria-label="Cerrar revisión de nivel">×</button></div>
                                                </header>
                                                <div className="level-review-body space-y-3 p-4 sm:p-5">
                                                    {levelReviewDelta > 0 && <section className="level-review-checklist rounded border border-cyan-800 bg-cyan-950/15 p-3"><h4 className="text-xs font-bold uppercase tracking-wider text-cyan-200">Lista de confirmación</h4><p className="mt-1 text-xs text-gray-400">Marca cada apartado después de revisarlo. Marcarlo no aplica elecciones automáticamente.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{levelReviewChecklist.map(item => <label key={item.key} className={`flex min-h-10 items-center gap-2 rounded border px-3 py-2 text-xs ${levelReviewChecks[item.key] ? 'border-emerald-700 bg-emerald-950/20 text-emerald-100' : 'border-gray-700 bg-gray-950/40 text-gray-300'}`}><input type="checkbox" checked={!!levelReviewChecks[item.key]} onChange={event => setLevelReviewChecks(previous => ({ ...previous, [item.key]: event.target.checked }))}/><span>{item.label}</span></label>)}</div></section>}
                                                    <section className="level-review-metrics grid gap-2 sm:grid-cols-3">
                                                        <div className={`rounded border p-3 ${proficiencyChanged ? 'border-cyan-700 bg-cyan-950/20' : 'border-gray-700 bg-gray-900/50'}`}><span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bono de competencia</span><strong className="mt-1 block text-lg text-white">+{levelReviewProficiencyBonus}</strong><p className="mt-1 text-xs text-gray-400">{proficiencyChanged && levelReviewStart > 0 ? `Antes: +${previousProficiencyBonus}.` : 'Calculado por el nivel.'}</p></div>
                                                        <div className="rounded border border-cyan-800 bg-cyan-950/15 p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Dados de golpe</span><strong className="mt-1 block text-lg text-white">{levelReviewTarget}{selectedSrdClass?.hitDie || hitDice.type || ' dados'}</strong><p className="mt-1 text-xs text-gray-400">{levelReviewDelta ? `Al confirmar se añaden ${levelReviewDelta} dado${levelReviewDelta === 1 ? '' : 's'} disponible${levelReviewDelta === 1 ? '' : 's'}, sin superar el máximo.` : 'Sin dados nuevos pendientes.'}</p></div>
                                                        <label className="rounded border border-red-800 bg-red-950/15 p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-red-200">Aumento de PV</span><input type="number" min="0" inputMode="numeric" value={levelReviewHpGain} onChange={event => setLevelReviewHpGain(event.target.value === '' ? '' : String(Math.max(0, Math.trunc(Number(event.target.value) || 0))))} placeholder="0" className="mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-center text-lg font-bold text-white outline-none focus:border-red-500"/><p className="mt-1 text-xs text-gray-400">Escribe el total acordado. Solo se suma al confirmar.</p></label>
                                                    </section>
                                                    {levelReviewFeatureGroups.length > 0 ? <section className="rounded border border-purple-800 bg-purple-950/15 p-3"><h4 className="text-xs font-bold uppercase tracking-wider text-purple-200">Rasgos nuevos</h4><div className="mt-2 space-y-2">{levelReviewFeatureGroups.map(group => <div key={group.label}><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{group.label}</p><div className="mt-1 flex flex-wrap gap-1.5">{group.features.map(feature => <span key={feature.id} className="rounded border border-purple-700 bg-purple-950/25 px-2 py-1 text-xs text-purple-100">Nv. {feature.level} · {feature.name}</span>)}</div></div>)}</div><p className="mt-3 text-xs text-gray-400">{characterBuild?.autoFeatures !== false ? 'Los rasgos registrados ya aparecen automáticamente en la ficha.' : 'Los rasgos automáticos están en pausa; actívalos desde Personalizar si quieres mostrarlos.'}</p></section> : <section className="rounded border border-gray-700 bg-gray-900/50 p-3 text-sm text-gray-400">No hay rasgos nuevos registrados entre estos niveles.</section>}
                                                    <section className={`rounded border p-3 ${pendingResourceSuggestions.length ? 'border-yellow-800 bg-yellow-950/20' : 'border-gray-700 bg-gray-900/50'}`}><div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="text-xs font-bold uppercase tracking-wider text-yellow-200">Recursos y usos máximos</h4><p className="mt-1 text-xs text-gray-400">{pendingResourceSuggestions.length ? `${pendingResourceSuggestions.length} recurso${pendingResourceSuggestions.length === 1 ? '' : 's'} necesita revisión.` : 'Los recursos sugeridos ya coinciden con este nivel.'}</p></div>{pendingResourceSuggestions.length > 0 && <button type="button" onClick={addSuggestedClassResources} className="min-h-10 rounded border border-yellow-700 px-3 text-xs font-bold text-yellow-100">Revisar recursos</button>}</div>{pendingResourceSuggestions.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{pendingResourceSuggestions.map(resource => <span key={resource.key} className="rounded border border-yellow-800 px-2 py-1 text-xs text-yellow-100">{resource.name}: máx. {resource.max}{resource.type ? ` ${resource.type}` : ''}</span>)}</div>}</section>
                                                    {levelReviewHasSpellcasting && <section className="rounded border border-fuchsia-800 bg-fuchsia-950/15 p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="text-xs font-bold uppercase tracking-wider text-fuchsia-200">Ranuras y conjuros</h4><p className="mt-1 text-sm text-gray-200">{srdSpellcastingProfile?.mode === 'prepared' ? `Preparados: ${previousSpellProgression.prepared} → ${currentSpellProgression.prepared}` : `Conocidos: ${previousSpellProgression.known} → ${currentSpellProgression.known}`} · Trucos: {previousSpellProgression.cantrips} → {currentSpellProgression.cantrips}.</p></div><button type="button" onClick={() => { setLevelReviewOpen(false); requestTabChange('grimoire'); }} className="min-h-10 rounded border border-fuchsia-700 px-3 text-xs font-bold text-fuchsia-100">Abrir Grimorio</button></div><div className="mt-2 flex flex-wrap gap-1.5">{spellSlotChanges.map(slot => <span key={slot.level} className="rounded border border-fuchsia-800 px-2 py-1 text-xs text-fuchsia-100">Nivel {slot.level}: {slot.previous} → {slot.current}</span>)}{currentSpellProgression.pact && <span className="rounded border border-yellow-800 px-2 py-1 text-xs text-yellow-100">Pacto: {previousSpellProgression.pact?.[0] || 0} ranuras N{previousSpellProgression.pact?.[1] || '—'} → {currentSpellProgression.pact[0]} ranuras N{currentSpellProgression.pact[1]}</span>}{!spellSlotChanges.length && !currentSpellProgression.pact && <span className="text-xs text-gray-400">Sin cambios de ranuras en este tramo.</span>}</div><p className="mt-2 text-xs text-gray-400">Los límites y máximos técnicos se sincronizan; tú decides qué conjuros aprender o preparar.</p></section>}
                                                    <section className={`rounded border p-3 ${pendingAbilityImprovementLevels.length ? 'border-amber-700 bg-amber-950/20' : 'border-gray-700 bg-gray-900/50'}`}><h4 className="text-xs font-bold uppercase tracking-wider text-amber-200">Mejoras de característica o dotes</h4>{pendingAbilityImprovementLevels.length ? <><p className="mt-1 text-sm text-white">Decisión pendiente en nivel{pendingAbilityImprovementLevels.length === 1 ? '' : 'es'} {pendingAbilityImprovementLevels.join(', ')}.</p><p className="mt-1 text-xs text-gray-400">La app no elegirá ni aplicará ninguna mejora o dote. Haz tu elección en Atributos o Dotes y confirma después.</p></> : <p className="mt-1 text-xs text-gray-400">No se cruza ningún nivel de mejora en esta revisión.</p>}</section>
                                                    {(remainingClassSkillChoices > 0 || levelReviewRemainingExpertiseChoices > 0) && <section className="rounded border border-yellow-800 bg-yellow-950/20 p-3"><h4 className="text-xs font-bold uppercase tracking-wider text-yellow-200">Otras elecciones pendientes</h4><p className="mt-1 text-sm text-gray-200">{[remainingClassSkillChoices > 0 && `${remainingClassSkillChoices} competencia${remainingClassSkillChoices === 1 ? '' : 's'} de clase`, levelReviewRemainingExpertiseChoices > 0 && `${levelReviewRemainingExpertiseChoices} opción${levelReviewRemainingExpertiseChoices === 1 ? '' : 'es'} de pericia`].filter(Boolean).join(' · ')}.</p></section>}
                                                </div>
                                                <footer className="level-review-footer flex flex-wrap items-center justify-between gap-2 border-t border-gray-700 px-4 py-3 sm:px-5"><p className="text-xs text-gray-500">Confirmar aplica el nuevo nivel, los PV escritos y los dados de golpe disponibles; las decisiones siguen siendo manuales.</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setLevelReviewOpen(false); setCharacterBuildOpen(true); }} className="min-h-11 rounded border border-gray-600 px-4 text-sm text-gray-200">Personalizar</button><button type="button" onClick={confirmLevelReview} disabled={!levelReviewDelta || !levelReviewChecklistComplete} className="min-h-11 rounded border border-cyan-700 bg-cyan-950/30 px-4 text-sm font-bold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40">{levelReviewChecklistComplete ? (pendingLevelChange ? `Subir a nivel ${levelReviewTarget}` : 'Confirmar revisión') : `Revisa ${levelReviewChecklist.filter(item => !levelReviewChecks[item.key]).length} apartado${levelReviewChecklist.filter(item => !levelReviewChecks[item.key]).length === 1 ? '' : 's'}`}</button></div></footer>
                                            </section>
                                        </div>, document.body)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div data-tab="character" data-accent={presentation?.accent || 'violet'} className="character-physical-profile tab-section">
                            <label className="character-physical-stat is-speed">
                                <span className="character-physical-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17h5l2-3 2 2 3-5 4-2M5 12h4M3 8h7"/><path d="m17 5 3 4-4 2"/></svg></span>
                                <span className="character-physical-copy"><small>Movimiento</small><strong>Velocidad</strong><em>Distancia por turno</em></span>
                                <span className="character-physical-value"><input aria-label="Velocidad en pies" type="number" inputMode="numeric" placeholder="30" title="Ejemplo: 30 pies" value={speed} onChange={e => setSpeed(handleNumInput(e.target.value))}/><b>ft</b></span>
                            </label>
                            <label className="character-physical-stat is-size">
                                <span className="character-physical-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"/><circle cx="12" cy="9" r="2.5"/><path d="M7.5 18c.6-3.1 2-4.5 4.5-4.5s3.9 1.4 4.5 4.5"/></svg></span>
                                <span className="character-physical-copy"><small>Físico</small><strong>Tamaño</strong><em>Categoría corporal</em></span>
                                <span className="character-physical-value is-text"><input aria-label="Tamaño del personaje" type="text" placeholder="Mediano" title="Ejemplo: Mediano" value={size} onChange={e => setSize(e.target.value)}/></span>
                            </label>
                        </div>

                        {}
                        {/* TIRADAS DE MUERTE */}
                        <div data-tab="combat" className="tab-section">
                        {((Number(hp.current)||0) <= 0) && (
                            <section className="death-save-panel" aria-labelledby="death-save-title">
                                <div className="death-save-ambient" aria-hidden="true"><i></i><i></i><i></i></div>
                                <header className="death-save-heading"><div className="death-save-symbol" aria-hidden="true"><i></i><span>†</span></div><div><small>0 puntos de golpe</small><h3 id="death-save-title">Salvaciones contra muerte</h3><p>Marca manualmente el resultado de cada tirada.</p></div></header>
                                <div className="death-save-tracks">
                                    <section className="death-save-track is-success"><div><span>Resistir</span><strong>Éxitos</strong></div><div className="death-save-marks">{[1,2,3].map(mark => <button type="button" key={`success_${mark}`} aria-label={`${deathSaves.successes >= mark ? 'Desmarcar' : 'Marcar'} éxito ${mark}`} aria-pressed={deathSaves.successes >= mark} onClick={() => markDeathSave('success', mark)} className={deathSaves.successes >= mark ? 'is-filled' : ''}><i></i><span>{deathSaves.successes >= mark ? '✦' : mark}</span></button>)}</div></section>
                                    <div className="death-save-divider" aria-hidden="true"><span></span></div>
                                    <section className="death-save-track is-failure"><div><span>Ceder</span><strong>Fallos</strong></div><div className="death-save-marks">{[1,2,3].map(mark => <button type="button" key={`failure_${mark}`} aria-label={`${deathSaves.failures >= mark ? 'Desmarcar' : 'Marcar'} fallo ${mark}`} aria-pressed={deathSaves.failures >= mark} onClick={() => markDeathSave('failure', mark)} className={deathSaves.failures >= mark ? 'is-filled' : ''}><i></i><span>{deathSaves.failures >= mark ? '×' : mark}</span></button>)}</div></section>
                                </div>
                                <footer className="death-save-footer"><p><span></span>{Number(deathSaves.successes) >= 3 ? 'Estabilizado' : Number(deathSaves.failures) >= 3 ? 'Tres fallos marcados' : 'El resultado sigue abierto'}</p><button type="button" onClick={resetDeathSaves}>Estabilizar manualmente</button></footer>
                            </section>
                        )}

                        </div>

                        <div className="character-workspace space-y-6">
                            
                            {}
                            {/* COLUMNA IZQ: ATRIBUTOS Y HABILIDADES */}
                            <div data-tab="character" className="character-core-column tab-section space-y-6">
                                
                                {/* ATRIBUTOS BASE */}
                                <div className="rpg-panel p-4 character-attributes-panel">
                                    <div className="character-section-header is-attributes">
                                        <div className="character-section-heading">
                                            <span className="character-section-emblem"><CharacterSectionGlyph section="attributes" /></span>
                                            <div><p>Base y temporal</p><h2>Atributos</h2></div>
                                        </div>
                                        <span className="character-section-note">Valores y modificadores</span>
                                    </div>
                                    <div className="character-attributes-grid">
                                        {Object.entries(stats).map(([key, val]) => {
                                            const total = getEffectiveStat(key);
                                            const mod = getModNum(total);
                                            return (
                                                <div key={key} data-ability={key} className="character-attribute-card">
                                                    <div className="character-attribute-summary">
                                                        <span className="character-attribute-orb"><AbilityGlyph ability={key} /></span>
                                                        <span className="character-attribute-label">{key}</span>
                                                        <strong className="character-attribute-total">{total}</strong>
                                                        <span className="character-attribute-modifier">{formatMod(mod)}</span>
                                                    </div>
                                                    <div className="character-attribute-inputs">
                                                        <label>Base<input aria-label={`Atributo base ${key}`} type="number" placeholder="10" value={val} onChange={(e) => setStats({...stats, [key]: handleNumInput(e.target.value)})} /></label>
                                                        <label>Temp<input aria-label={`Modificador temporal ${key}`} type="number" placeholder="+0" value={tempStats[key] ?? '0'} onChange={(e) => setTempStats({...tempStats, [key]: handleNumInput(e.target.value)})} /></label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* TIRADAS DE SALVACIÓN */}
                                <div className="rpg-panel p-4">
                                    <div className="character-section-header is-saves">
                                        <div className="character-section-heading">
                                            <span className="character-section-emblem"><CharacterSectionGlyph section="saves" /></span>
                                            <div><p>Defensa de atributos</p><h2>Salvaciones</h2></div>
                                        </div>
                                        <span className="character-section-note">Competencias marcadas</span>
                                    </div>
                                    <div className="saving-throws-grid">
                                        {Object.entries(stats).map(([key, val]) => {
                                            const isProf = hasSavingThrowProficiency(key);
                                            const totalMod = getModNum(getEffectiveStat(key)) + (isProf ? PROF_BONUS : 0);
                                            const statNames = { fue: 'Fuerza', des: 'Destreza', con: 'Constitución', int: 'Inteligencia', sab: 'Sabiduría', car: 'Carisma' };
                                            return (
                                                <button
                                                    key={`save-${key}`}
                                                    type="button"
                                                    onClick={() => toggleSavingThrow(key)}
                                                    title={`${statNames[key]}${isProf ? ' · Competente' : ''}`}
                                                    aria-label={`Salvación de ${statNames[key]}${isProf ? ', competente' : ''}`}
                                                    data-ability={key}
                                                    className={`saving-throw-tile ${isProf ? 'is-proficient' : ''}`}
                                                >
                                                    <span className="saving-throw-mark" aria-hidden="true"></span>
                                                    <span className="saving-throw-icon"><AbilityGlyph ability={key} /></span>
                                                    <span className="saving-throw-label">{key.toUpperCase()}</span>
                                                    <strong className="saving-throw-value">{formatMod(totalMod)}</strong>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* HABILIDADES */}
                                <div className="rpg-panel p-4">
                                    <div className="character-section-header is-skills">
                                        <div className="character-section-heading">
                                            <span className="character-section-emblem"><CharacterSectionGlyph section="skills" /></span>
                                            <div><p>Competencias y pericias</p><h2>Habilidades</h2></div>
                                        </div>
                                        <span className="character-section-note">Toca para ajustar</span>
                                    </div>
                                    <div className="space-y-1">
                                        {SKILLS.map(skill => {
                                            const isExp = hasSkillExpertise(skill.key);
                                            const isProf = hasSkillProficiency(skill.key);
                                            const totalMod = getModNum(getEffectiveStat(skill.stat)) + (isExp ? PROF_BONUS * 2 : isProf ? PROF_BONUS : 0);
                                            
                                            return (
                                                <div key={skill.key}
                                                    data-ability={skill.stat}
                                                    onClick={() => setSkillModal({ isOpen: true, skillKey: skill.key, skillName: skill.name })}
                                                    className="character-skill-row flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 px-2 rounded transition-colors cursor-pointer group">
                                                    <div className="flex items-center space-x-3">
                                                        <span className={`character-skill-icon ${isExp ? 'is-expert' : isProf ? 'is-proficient' : ''}`}><AbilityGlyph ability={skill.stat} /></span>
                                                        <span className={`text-[13px] font-medium transition-colors ${isExp || isProf ? 'text-gray-100' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                                            {skill.name} 
                                                            <span className="text-[9px] text-gray-600 ml-1 uppercase">({skill.stat})</span>
                                                            {skill.key === 'sigilo' && isStealthDisadvantaged && <button type="button" onClick={(event) => { event.stopPropagation(); showAlert(`La armadura equipada ${stealthDisadvantageArmor.name} impone desventaja en Sigilo.`); }} className="ml-2 inline-flex max-w-full items-center rounded border border-red-800 bg-red-950/50 px-1.5 py-0.5 text-[10px] font-bold text-red-300 hover:border-red-400" aria-label={`Explicación de desventaja en Sigilo por ${stealthDisadvantageArmor.name}`}>⚠ Desventaja ({stealthDisadvantageArmor.name})</button>}
                                                        </span>
                                                    </div>
                                                    <span className={`font-mono font-bold text-sm transition-colors ${isExp ? 'text-amber-300' : isProf ? 'text-cyan-300' : 'text-gray-600'}`}>{formatMod(totalMod)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 flex gap-4 text-[10px] text-gray-500 justify-center font-fantasy tracking-wider uppercase">
                                        <span className="flex items-center text-cyan-200"><div className="w-2 h-2 rounded-full bg-cyan-400 mr-1 border border-cyan-200"></div> Competencia</span>
                                        <span className="flex items-center text-amber-200"><div className="w-2 h-2 rounded-full bg-amber-400 mr-1 shadow-[0_0_5px_rgba(251,191,36,0.8)] border border-amber-200"></div> Pericia</span>
                                    </div>
                                </div>

                                {/* COMPETENCIAS E IDIOMAS */}
                                <details className="proficiency-catalog rpg-panel overflow-hidden">
                                    <summary className="proficiency-catalog-summary cursor-pointer list-none border-b border-gray-800 p-4">
                                        <div className="character-section-header is-skills mb-0">
                                            <div className="character-section-heading">
                                                <span className="character-section-emblem"><CharacterSectionGlyph section="skills" /></span>
                                                <div><p>Consulta rápida y procedencia</p><h2>Competencias e idiomas</h2></div>
                                            </div>
                                            <span className="character-section-note">Plegar / desplegar</span>
                                        </div>
                                    </summary>
                                    <div className="p-4">
                                        <div className="proficiency-catalog-grid grid gap-3 sm:grid-cols-2">
                                            {Object.entries(proficiencyCategoryLabels).map(([category, label]) => {
                                                const entries = proficiencyEntries.filter(entry => entry.category === category && !entry.hidden);
                                                return <section key={category} data-category={category} className="proficiency-category-card">
                                                    <div className="proficiency-category-header"><span className="proficiency-category-mark" aria-hidden="true"></span><h3>{label}</h3><span className="proficiency-category-count">{entries.length}</span><button type="button" onClick={() => addProficiencyEntryToCategory(category)} className="proficiency-category-add" aria-label={`Añadir en ${label}`}>+ Añadir</button></div>
                                                    <div className="proficiency-entry-list">{entries.map(entry => <div key={entry.id} className="proficiency-entry-card">
                                                        <div className="proficiency-entry-fields"><input aria-label={`Nombre en ${label}`} value={entry.name} placeholder={`Nueva entrada de ${label.toLowerCase()}`} onChange={event => updateProficiencyEntry(entry.id, { name: event.target.value, nameEdited: true })} className="proficiency-entry-name"/><label className="proficiency-entry-source"><span>Origen</span><input aria-label={`Procedencia de ${entry.name || label}`} value={entry.source || ''} placeholder="Sin indicar" onChange={event => updateProficiencyEntry(entry.id, { source: event.target.value, sourceEdited: true })}/></label></div>
                                                        <button type="button" onClick={() => removeProficiencyEntry(entry)} className="proficiency-entry-delete" aria-label={`Borrar ${entry.name || label}`}>×</button>
                                                    </div>)}{entries.length === 0 && <button type="button" onClick={() => addProficiencyEntryToCategory(category)} className="proficiency-category-empty">Añadir la primera competencia</button>}</div>
                                                </section>;
                                            })}
                                        </div>
                                    </div>
                                </details>
                            </div>

                            {}
                            <div className="character-secondary-column space-y-6">
                                
                                {/* RECURSOS DE CLASE */}
                                <div data-tab="combat" hidden={activeTab === 'combat' && combatDashboardView !== 'summary'} className="combat-resources-panel combat-collection-panel tab-section rpg-panel">
                                    <header className="combat-collection-header"><div className="combat-collection-heading"><span className="combat-collection-emblem"><CombatSectionIcon section="resources" /></span><div><p>Usos, cargas y capacidades</p><h2>Recursos</h2><span>Controla lo que gastas durante la aventura.</span></div></div><div className="combat-collection-actions">{suggestedClassResources.length > 0 && <button type="button" className="is-secondary" onClick={addSuggestedClassResources}>Sugerir recursos</button>}<button type="button" className="is-primary" onClick={() => setAddModal({isOpen: true, type: 'resource', data: {}})}><span>+</span> Añadir recurso</button></div></header>
                                    <div className="combat-collection-summary"><span><b>{resources.length + (grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 ? 1 : 0)}</b> {(resources.length + (grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 ? 1 : 0)) === 1 ? 'recurso activo' : 'recursos activos'}</span><small>Mantén pulsada una tarjeta para reordenarla</small></div>
                                    <div ref={resourceGridRef} className="resource-reorder-grid grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {resources.map((res, idx) => (
                                            <article key={res.id} ref={element => { if (element) resourceCardRefs.current.set(res.id, element); else resourceCardRefs.current.delete(res.id); }} data-resource-id={res.id} onPointerDown={event => handleResourcePointerDown(event, res.id)} onPointerMove={handleResourcePointerMove} onPointerUp={handleResourcePointerEnd} onPointerCancel={handleResourcePointerEnd} onContextMenu={event => { if (resourceDrag.id === res.id) event.preventDefault(); }} style={resourceDrag.id === res.id ? { '--resource-drag-x': `${resourceDrag.x}px`, '--resource-drag-y': `${resourceDrag.y}px`, '--resource-drag-left': `${resourceDrag.left}px`, '--resource-drag-top': `${resourceDrag.top}px`, '--resource-drag-width': `${resourceDrag.width}px`, '--resource-drag-height': `${resourceDrag.height}px` } : undefined} className={`resource-card combat-resource-card group ${resourceDrag.id === res.id ? 'is-dragging' : ''} ${resourcePressRef.current?.id === res.id && !resourceDrag.id ? 'is-drag-pending' : ''} ${resourceDrag.id && resourceDrag.targetId === res.id && resourceDrag.id !== res.id ? 'is-drop-target' : ''}`}>
                                                <div className="combat-resource-card-top"><span className="combat-resource-grip" aria-hidden="true">⠿</span><div><small>{res.recoveryRest === 'short' ? 'Descanso corto' : res.recoveryRest === 'long' ? 'Descanso largo' : 'Recuperación manual'}</small><h3>{res.name}</h3></div>{res.type && <b>{res.type}</b>}</div>
                                                <div className="combat-resource-uses">{renderUsageDots(res.current, res.max, 'text-purple-400')}</div>
                                                <div className="combat-resource-counter"><button type="button" aria-label={`Reducir ${res.name}`} onClick={() => setResources(previous => previous.map((resource, resourceIndex) => resourceIndex === idx ? { ...resource, current: Math.max(0, Number(resource.current) - 1) } : resource))}>−</button><label><small>Disponibles</small><span><input aria-label={`${res.name} actuales`} type="number" min="0" value={res.current} onChange={event => setResources(previous => previous.map((resource, resourceIndex) => resourceIndex === idx ? { ...resource, current: handleBoundedNumInput(event.target.value, Number(resource.max) > 0 ? resource.max : null) } : resource))}/>{Number(res.max) > 0 && <><i>/</i><b>{res.max}</b></>}</span></label><button type="button" aria-label={`Aumentar ${res.name}`} onClick={() => setResources(previous => previous.map((resource, resourceIndex) => resourceIndex === idx ? { ...resource, current: Number(resource.max) > 0 ? Math.min(Number(resource.max), (Number(resource.current) || 0) + 1) : (Number(resource.current) || 0) + 1 } : resource))}>+</button></div>
                                                <button type="button" onClick={() => confirmDelete(`¿Borrar el recurso "${res.name}"?`, () => setResources(resources.filter(r => r.id !== res.id)))} className="combat-card-delete" aria-label={`Borrar ${res.name}`}>×</button>
                                            </article>
                                        ))}
                                        {grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 && <article className="combat-resource-card is-pact"><div className="combat-resource-card-top"><span className="combat-resource-sigil">⬡</span><div><small>Se recupera con descanso corto</small><h3>Magia de pacto</h3></div><b>N{grimoireConfig.pactSlots.level}</b></div><div className="combat-resource-uses">{renderUsageDots(grimoireConfig.pactSlots.current, grimoireConfig.pactSlots.max, 'text-yellow-300')}</div><div className="combat-resource-counter"><button type="button" aria-label="Reducir magia de pacto" onClick={() => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: Math.max(0, Number(previous.pactSlots.current) - 1) } }))}>−</button><label><small>Ranuras</small><span><input aria-label="Ranuras de magia de pacto actuales" type="number" min="0" value={grimoireConfig.pactSlots.current} onChange={event => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: handleBoundedNumInput(event.target.value, previous.pactSlots.max) } }))}/><i>/</i><b>{grimoireConfig.pactSlots.max}</b></span></label><button type="button" aria-label="Aumentar magia de pacto" onClick={() => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: Math.min(Number(previous.pactSlots.max), Number(previous.pactSlots.current) + 1) } }))}>+</button></div></article>}
                                        {resources.length === 0 && !(grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0) && <button type="button" onClick={() => setAddModal({isOpen:true,type:'resource',data:{}})} className="combat-collection-empty"><span><CombatSectionIcon section="resources" /></span><strong>Aún no hay recursos</strong><small>Añade dados, cargas o usos limitados para tenerlos a mano durante el combate.</small><b>Crear el primero</b></button>}
                                    </div>
                                </div>

                                {/* COMBATE Y ARMAS */}
                                <div data-tab="combat" hidden={activeTab === 'combat' && combatDashboardView !== 'summary'} className="combat-arsenal-panel combat-collection-panel tab-section rpg-panel">
                                    <header className="combat-collection-header is-arsenal"><div className="combat-collection-heading"><span className="combat-collection-emblem"><CombatSectionIcon section="arsenal" /></span><div><p>Equipo preparado</p><h2>Arsenal</h2><span>Ataques, daño y munición a un vistazo.</span></div></div><div className="combat-collection-actions"><button type="button" className="is-primary" onClick={() => setAddModal({isOpen: true, type: 'weapon', data: {}})}><span>+</span> Nueva arma</button></div></header>
                                    
                                    <nav className="arsenal-weapon-tabs" aria-label="Armas del arsenal">
                                        {weapons.map(w => (
                                            <div key={w.id} className={`arsenal-weapon-tab group ${selectedWeaponId === w.id ? 'is-active' : ''}`}>
                                                <button type="button" onClick={() => { setSelectedWeaponId(w.id); setAmmoSettingsOpen(false); }} aria-pressed={selectedWeaponId === w.id}><span><CombatSectionIcon section="arsenal" /></span><strong>{w.name}</strong>{w.usesAmmo && <small>Munición</small>}</button>
                                                <button onClick={(e) => { e.stopPropagation(); confirmDelete(`¿Borrar "${w.name}"?`, () => {
                                                    const newW = weapons.filter(x => x.id !== w.id); setWeapons(newW); if(selectedWeaponId===w.id) setSelectedWeaponId(newW[0]?.id||null);
                                                })}} className="combat-card-delete" aria-label={`Borrar ${w.name}`}>×</button>
                                            </div>
                                        ))}
                                    </nav>

                                    <div className="arsenal-workbench">
                                        {selectedWeapon ? (
                                            <div className="arsenal-selected-weapon">
                                                <div className="arsenal-selected-heading"><div><small>Arma preparada</small><h3>{selectedWeapon.name}</h3></div><div className="arsenal-selected-heading-actions"><span>{selectedWeapon.attacks.length} acci{selectedWeapon.attacks.length === 1 ? 'ón' : 'ones'}</span><button type="button" onClick={() => setAmmoSettingsOpen(true)} className={selectedWeapon.usesAmmo ? 'is-active' : ''}><i aria-hidden="true">➤</i><span><small>{selectedWeapon.usesAmmo ? 'Munición' : 'Proyectiles'}</small><strong>{selectedWeapon.usesAmmo ? selectedWeaponAmmo ? `${Math.max(0,Number(selectedWeaponAmmo.qty)||0)} disponibles` : 'Sin vincular' : 'Configurar'}</strong></span><b aria-hidden="true">⚙</b></button></div></div>
                                                <div className="arsenal-attacks-grid">
                                                    {selectedWeapon.attacks.map((act, i) => (
                                                        <article key={`${selectedWeaponId}-${i}`} className="arsenal-attack-card animate-attack group">
                                                            <header><span><CombatSectionIcon section="arsenal" /></span><h3>{act.name}</h3></header>
                                                            <div className="arsenal-attack-values"><div><small>Ataque</small><strong>{getWeaponAttackBonus(act, selectedWeapon) || '—'}</strong>{getWeaponAttackFormula(act, selectedWeapon) && <em>{getWeaponAttackFormula(act, selectedWeapon)}</em>}</div><i></i><div><small>Daño</small><strong>{act.dmg || '—'}</strong></div></div>
                                                            {act.notes && <p>{act.notes}</p>}
                                                            {selectedWeapon.usesAmmo && <button type="button" disabled={!selectedWeaponAmmo || Number(selectedWeaponAmmo.qty) < Math.max(1, Number(selectedWeapon.ammoPerShot) || 1)} onClick={() => spendWeaponAmmo(selectedWeapon.id)} className="arsenal-attack-fire"><span>➤</span>{selectedWeaponAmmo ? `Disparar · ${selectedWeaponAmmo.qty} disponibles` : 'Munición sin vincular'}</button>}
                                                            <button onClick={() => confirmDelete(`¿Borrar ataque "${act.name}"?`, () => {
                                                                setWeapons(weapons.map(w => w.id === selectedWeaponId ? {...w, attacks: w.attacks.filter((_,idx)=>idx!==i)} : w));
                                                            })} className="combat-card-delete" aria-label={`Borrar ataque ${act.name}`}>×</button>
                                                        </article>
                                                    ))}
                                                </div>
                                                <button type="button" onClick={openAddWeaponAttack} className="arsenal-add-action"><span>+</span><div><strong>Añadir acción</strong><small>Registra otra forma de atacar con esta arma.</small></div></button>
                                            </div>
                                        ) : <button type="button" onClick={() => setAddModal({isOpen:true,type:'weapon',data:{}})} className="combat-collection-empty"><span><CombatSectionIcon section="arsenal" /></span><strong>Aún no hay armas</strong><small>Añade un arma y organiza aquí sus ataques y munición.</small><b>Crear la primera</b></button>}
                                    </div>
                                </div>
                                {ammoSettingsOpen && selectedWeapon && ReactDOM.createPortal(<div className="ammo-settings-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setAmmoSettingsOpen(false); }}>
                                    <section className="ammo-settings-dialog" role="dialog" aria-modal="true" aria-labelledby="ammo-settings-title">
                                        <header><span className="ammo-settings-emblem" aria-hidden="true">➤</span><div><small>Arsenal · {selectedWeapon.name}</small><h3 id="ammo-settings-title">Configurar munición</h3><p>Vincula una reserva de la mochila y define cuánto consume cada disparo.</p></div><button type="button" onClick={() => setAmmoSettingsOpen(false)} aria-label="Cerrar configuración de munición">×</button></header>
                                        <div className="ammo-settings-body">
                                            <label className="ammo-settings-toggle"><input type="checkbox" checked={selectedWeapon.usesAmmo === true} onChange={event => updateWeaponAmmo(selectedWeapon.id, { usesAmmo: event.target.checked })}/><span><i></i></span><div><small>Control de proyectiles</small><strong>Esta arma utiliza munición</strong><p>Actívalo para descontar unidades al registrar cada disparo.</p></div><b>{selectedWeapon.usesAmmo ? 'Activo' : 'Inactivo'}</b></label>
                                            {selectedWeapon.usesAmmo && <div className="ammo-settings-fields"><label><span>Reserva vinculada</span><small>Objeto de la mochila que contiene la munición</small><select value={selectedWeapon.ammoItemId || ''} onChange={event => updateWeaponAmmo(selectedWeapon.id, { ammoItemId: event.target.value })}><option value="">Sin vincular</option>{inventory.map(item => <option key={item.id} value={item.id}>{item.name} · {Math.max(0, Number(item.qty) || 0)}</option>)}</select></label><label><span>Consumo</span><small>Unidades gastadas por disparo</small><div><input type="number" min="1" value={selectedWeapon.ammoPerShot || 1} onChange={event => updateWeaponAmmo(selectedWeapon.id, { ammoPerShot: Math.max(1, Math.trunc(Number(event.target.value) || 1)) })}/><b>por disparo</b></div></label></div>}
                                            {selectedWeapon.usesAmmo && <div className={`ammo-settings-reserve ${selectedWeaponAmmo ? Number(selectedWeaponAmmo.qty) > 0 ? 'is-ready' : 'is-empty' : 'is-unlinked'}`}><span aria-hidden="true">{selectedWeaponAmmo ? '◆' : '◇'}</span><div><small>Estado de la reserva</small><strong>{selectedWeaponAmmo ? `${selectedWeaponAmmo.name} · ${Math.max(0,Number(selectedWeaponAmmo.qty)||0)} unidades` : 'Ningún objeto vinculado'}</strong><p>{selectedWeaponAmmo ? 'La cantidad se comparte con la mochila y se actualiza al disparar.' : 'Selecciona arriba una pila de flechas, virotes u otra munición.'}</p></div></div>}
                                        </div>
                                        <footer><p>El disparo se registra desde la tarjeta de ataque.</p><button type="button" onClick={() => setAmmoSettingsOpen(false)}>Guardar y cerrar</button></footer>
                                    </section>
                                </div>, document.body)}

                                <section data-tab="combat" hidden={activeTab === 'combat' && combatDashboardView !== 'summary'} className="combat-table-hub tab-section rpg-panel">
                                    <header className="combat-table-hub-header"><div><span className="combat-table-hub-emblem" aria-hidden="true"><i></i><b>✦</b></span><div><p>Herramientas de sesión</p><h2>Mesa de juego</h2><small>Conecta al grupo o prepara las criaturas del encuentro.</small></div></div><span className="combat-table-hub-rule" aria-hidden="true"></span></header>
                                    <div className="combat-table-hub-grid">
                                        <button type="button" onClick={openOnlineTable} className="combat-table-card is-online">
                                            <span className="combat-table-card-art" aria-hidden="true"><i></i><i></i><b>◉</b></span>
                                            <span className="combat-table-card-copy"><small>{currentRoom?.code ? 'Conexión activa' : 'Juego compartido'}</small><strong>Mesa Online</strong><em>{currentRoom?.code ? `Sala ${currentRoom.code} · ${roomParticipants.length} participante${roomParticipants.length === 1 ? '' : 's'}` : 'Crea una sala o únete al código de tus compañeros.'}</em><span>{currentRoom?.code ? <><i className="is-live"></i> Abrir mesa</> : 'Crear o unirse'}</span></span>
                                            <b className="combat-table-card-arrow" aria-hidden="true">→</b>
                                        </button>
                                        {(!currentRoom || isCurrentRoomMaster) && <button type="button" onClick={() => setBestiaryCompendiumOpen(true)} className="combat-table-card is-bestiary">
                                            <span className="combat-table-card-art" aria-hidden="true"><i></i><i></i><b>♜</b></span>
                                            <span className="combat-table-card-copy"><small>Catálogo unificado</small><strong>Compendio de criaturas</strong><em>Consulta el SRD, gestiona tus criaturas y prepara enemigos para la mesa.</em><span>{srdMonsterCompendium.monsters.length} SRD · {bestiary.monsters.length} propia{bestiary.monsters.length === 1 ? '' : 's'}</span></span>
                                            <b className="combat-table-card-arrow" aria-hidden="true">→</b>
                                        </button>}
                                    </div>
                                    <footer className="combat-table-hub-footer"><span>✦</span><p>Estas herramientas apoyan la sesión sin automatizar las decisiones ni las tiradas del personaje.</p></footer>
                                </section>

                                <section data-tab="inventory" className="inventory-hero tab-section">
                                    <div className="inventory-hero-title">
                                        <span className="inventory-hero-emblem" aria-hidden="true"><InventoryGlyph section="backpack" /></span>
                                        <div>
                                            <p>Equipo y memoria</p>
                                            <h1>Inventario / Lore</h1>
                                            <span>Todo lo que llevas y la historia que acompaña a tu personaje.</span>
                                        </div>
                                    </div>
                                </section>

                                <div data-tab="inventory" className="inventory-board tab-section">
                                    <div className="inventory-board-column inventory-board-left">
                                {/* ARMADURAS, COMPETENCIAS Y HERRAMIENTAS */}
                                <div data-tab="inventory" className="inventory-equipment-panel inventory-overview-panel tab-section rpg-panel p-4">
                                    <div className="inventory-equipment-header">
                                        <div className="inventory-equipment-heading">
                                            <span className="inventory-equipment-emblem" aria-hidden="true"><InventoryGlyph section="equipment" /></span>
                                            <div>
                                                <p>Protección y utilidad</p>
                                                <h2>Equipo en uso</h2>
                                            </div>
                                        </div>
                                        <div className="inventory-equipment-actions">
                                            <button onClick={() => setAddModal({isOpen: true, type: 'armor', data: {type: 'light'}})} className="inventory-equipment-add" aria-label="Añadir armadura"><InventoryGlyph section="equipment" /><span>Armadura</span></button>
                                            <button onClick={() => setAddModal({isOpen: true, type: 'tool', data: {}})} className="inventory-equipment-add" aria-label="Añadir utilidad o herramienta"><InventoryGlyph section="treasure" /><span>Utilidad</span></button>
                                        </div>
                                    </div>
                                    <div className="inventory-equipment-columns">
                                    <section className="inventory-equipment-group">
                                    <h3 className="inventory-equipment-group-title"><InventoryGlyph section="equipment" /> Armadura</h3>
                                    {/* Lista de Armaduras y Escudos */}
                                    <div className="space-y-2">
                                        {armors.map(arm => (
                                            <div key={arm.id} className={`inventory-equipment-entry inventory-armor-entry group ${arm.equipped ? 'is-equipped' : ''}`}>
                                                <button type="button" onClick={() => toggleArmorEquip(arm.id)} className="inventory-armor-toggle" aria-label={arm.equipped ? `Desequipar ${arm.name}` : `Equipar ${arm.name}`}>
                                                    <span className={`w-5 h-5 rounded border ${arm.equipped ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-600'} flex items-center justify-center transition-colors shadow-sm`}>
                                                            {arm.equipped && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                                    </span>
                                                </button>
                                                <div className="inventory-equipment-entry-copy">
                                                    <strong>{arm.name}</strong>
                                                    <span>{arm.type === 'light' ? 'Armadura ligera' : arm.type === 'medium' ? 'Armadura media' : arm.type === 'heavy' ? 'Armadura pesada' : 'Escudo'}</span>
                                                    <small>{getArmorFormula(arm)}</small>
                                                </div>
                                                <div className="inventory-equipment-entry-actions">
                                                    <span>{arm.type === 'shield' ? `+${arm.ac || 2} CA` : `CA ${arm.ac}`}</span>
                                                    {arm.stealthDis && <i>Sigilo −</i>}
                                                    <button type="button" onClick={() => confirmDelete(`¿Borrar "${arm.name}"?`, () => setArmors(armors.filter(a => a.id !== arm.id)))} aria-label={`Borrar ${arm.name}`}>×</button>
                                                </div>
                                            </div>
                                        ))}
                                        {armors.length === 0 && <span className="text-gray-600 text-xs italic">Sin armaduras registradas.</span>}
                                    </div>
                                    </section>

                                    {/* Lista de Herramientas */}
                                    <section className="inventory-equipment-group">
                                    <h3 className="inventory-equipment-group-title"><InventoryGlyph section="treasure" /> Utilidad y herramientas</h3>
                                    <div className="space-y-2">
                                        {tools.map(tool => (
                                            <div key={tool.id} className="inventory-equipment-entry inventory-tool-entry group">
                                                <div className="inventory-equipment-entry-copy">
                                                    <strong>{tool.name}</strong>
                                                    <small>{tool.desc}</small>
                                                </div>
                                                <button type="button" onClick={() => confirmDelete(`¿Borrar "${tool.name}"?`, () => setTools(tools.filter(t => t.id !== tool.id)))} aria-label={`Borrar ${tool.name}`}>×</button>
                                            </div>
                                        ))}
                                        {tools.length === 0 && <span className="text-gray-600 text-xs italic">Sin herramientas registradas.</span>}
                                    </div>
                                    </section>
                                    </div>
                                </div>

                                <section data-tab="inventory" className="inventory-currency-panel tab-section rpg-panel p-4">
                                    <div className="inventory-resource-header">
                                        <div><p>Recursos</p><h2>Monedas</h2></div>
                                        <InventoryGlyph section="coins" />
                                    </div>
                                    <div className="inventory-currency-wallet">
                                        {DND_CURRENCIES.map(coin => (
                                            <div key={coin.key} className={`inventory-currency-card inventory-currency-${coin.key}`}>
                                                <span className="inventory-currency-token" aria-hidden="true">{coin.symbol}</span>
                                                <span className="inventory-currency-label">{coin.label}<small>{coin.short} · 1 = {coin.copperValue} PC</small></span>
                                                <div className="inventory-currency-controls">
                                                    <button type="button" onClick={() => addCurrency(coin.key, -1)} aria-label={`Restar una pieza de ${coin.label}`}>−</button>
                                                    <input aria-label={`Cantidad de ${coin.label}`} type="number" min="0" value={currency[coin.key] ?? ''} onChange={e => updateCurrencyAmount(coin.key, e.target.value)} />
                                                    <button type="button" onClick={() => addCurrency(coin.key, 1)} aria-label={`Sumar una pieza de ${coin.label}`}>+</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="inventory-currency-total"><span>Valor total</span><strong>{formatCurrencyEquivalent(currency)}</strong><small>{getCurrencyCopperValue(currency)} PC</small></div>
                                </section>
                                    </div>

                                    <div className="inventory-board-column inventory-board-right">

                                {/* MERCADO Y TESORO */}
                                <div data-tab="inventory" className="inventory-market-panel inventory-market-card tab-section rpg-panel border border-amber-900/70 p-4">
                                    <div className="inventory-market-access">
                                        <div className="inventory-market-copy">
                                            <h2>Mercado y tesoro</h2>
                                            <p>Equipo, consumibles y objetos mágicos.</p>
                                        </div>
                                        <button type="button" onClick={() => setEquipmentCompendiumOpen(true)}>Abrir catálogo</button>
                                    </div>
                                </div>

                                {/* INVENTARIO DE CONSUMIBLES */}
                                <div data-tab="inventory" className="inventory-backpack-panel inventory-backpack-card tab-section rpg-panel p-4">
                                    <div className="inventory-backpack-header">
                                        <div className="inventory-backpack-heading">
                                            <span className="inventory-backpack-emblem" aria-hidden="true"><InventoryGlyph section="backpack" /></span>
                                            <div>
                                                <p>Equipo transportado</p>
                                                <h2>Mochila</h2>
                                            </div>
                                        </div>
                                        <button onClick={() => setAddModal({isOpen: true, type: 'item', data: {}})} className="inventory-backpack-add"><span aria-hidden="true">+</span> Objeto</button>
                                    </div>
                                    <div className="inventory-backpack-list space-y-2">
                                        {inventory.map((item, idx) => (
                                            <div key={item.id} className="inventory-item-row flex justify-between items-start bg-gray-900/40 p-2.5 rounded group border border-gray-800 hover:border-gray-600 transition-colors">
                                                <div className="flex-1 pr-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-bold text-gray-200">{item.name}</span>
                                                        <span className="text-[10px] font-mono bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-purple-300 font-bold shadow-inner">x{item.qty}</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-400 mt-1 leading-tight">{item.desc}</p>
                                                </div>
                                                
                                                <div className="inventory-item-controls flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button type="button" onClick={() => adjustInvQty(item.id, -1)} className="inventory-item-adjust" aria-label={`Quitar una unidad de ${item.name}`}>−</button>
                                                    <button type="button" onClick={() => adjustInvQty(item.id, 1)} className="inventory-item-adjust" aria-label={`Añadir una unidad de ${item.name}`}>+</button>
                                                    <span className="inventory-item-divider" aria-hidden="true"></span>
                                                    <button type="button" onClick={() => confirmDelete(`¿Borrar "${item.name}"?`, () => setInventory(inventory.filter(x => x.id !== item.id)))} className="inventory-item-delete" aria-label={`Borrar ${item.name}`}>×</button>
                                                </div>
                                            </div>
                                        ))}
                                        {inventory.length === 0 && <span className="text-gray-600 text-xs italic">Tu inventario está vacío. Pulsa + Objeto para añadir el primero.</span>}
                                    </div>
                                </div>
                                    </div>
                                </div>

                                <section data-tab="inventory" className="inventory-diary-panel inventory-diary-card tab-section rpg-panel">
                                    <div className="inventory-diary-header">
                                        <div className="inventory-diary-heading">
                                            <span className="inventory-diary-emblem" aria-hidden="true"><InventoryGlyph section="journal" /></span>
                                            <div>
                                                <p>Crónica de campaña</p>
                                                <h2>Diario</h2>
                                            </div>
                                        </div>
                                        <div className="inventory-diary-actions">
                                            {diaryOpen && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const entry = { id: 'note_' + Date.now(), title: '', date: new Date().toISOString().slice(0, 10), text: '', category: diaryCategory === 'all' ? 'sessions' : diaryCategory, tags: [], relations: [] };
                                                        setSessionNotes([entry, ...sessionNotes]);
                                                        setEditingDiaryEntry(entry.id);
                                                    }}
                                                    className="inventory-diary-new"
                                                >
                                                    + Nueva entrada
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setDiaryOpen(value => !value)}
                                                className="inventory-diary-toggle"
                                                aria-label={diaryOpen ? 'Contraer diario' : 'Desplegar diario'}
                                                aria-expanded={diaryOpen}
                                            >
                                                {diaryOpen ? '−' : '+'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="inventory-diary-summary">
                                        <span>{sessionNotes.length === 0 ? 'Aún no hay entradas de campaña.' : `${sessionNotes.length} ${sessionNotes.length === 1 ? 'entrada guardada' : 'entradas guardadas'}.`}</span>
                                        <button type="button" onClick={() => setDiaryOpen(value => !value)}>{diaryOpen ? 'Ocultar entradas' : 'Ver diario'}</button>
                                    </div>
                                    {diaryOpen && (
                                        <div className="campaign-journal-shell">
                                            {(() => {
                                                const categories = [['sessions','Sesiones'],['active-quests','Misiones activas'],['completed-quests','Misiones completadas'],['npcs','PNJ'],['places','Lugares'],['clues','Pistas'],['debts','Deudas'],['promises','Promesas'],['loot','Botín pendiente']];
                                                const categoryLabel = id => categories.find(([key]) => key === id)?.[1] || 'Sesiones';
                                                const query = diarySearch.trim().toLocaleLowerCase('es');
                                                const filteredNotes = sessionNotes.filter(note => {
                                                    const searchable = [note.title || note.date, note.text, ...(note.tags || [])].join(' ').toLocaleLowerCase('es');
                                                    return (diaryCategory === 'all' || (note.category || 'sessions') === diaryCategory) && (!query || searchable.includes(query));
                                                });
                                                const updateNote = (id, patch) => setSessionNotes(previous => previous.map(note => note.id === id ? { ...note, ...patch } : note));
                                                return <div className="campaign-journal">
                                                    <div className="campaign-journal-tools"><label><span>⌕</span><input type="search" value={diarySearch} onChange={event => setDiarySearch(event.target.value)} placeholder="Buscar en el diario…" /></label><small>{filteredNotes.length} {filteredNotes.length === 1 ? 'entrada' : 'entradas'}</small></div>
                                                    <nav className="campaign-journal-categories" aria-label="Categorías del diario">
                                                        <button type="button" className={diaryCategory === 'all' ? 'is-active' : ''} onClick={() => setDiaryCategory('all')}><span>Todas</span><small>{sessionNotes.length}</small></button>
                                                        {categories.map(([id,label]) => { const count = sessionNotes.filter(note => (note.category || 'sessions') === id).length; return <button type="button" key={id} className={diaryCategory === id ? 'is-active' : ''} onClick={() => setDiaryCategory(id)}><span>{label}</span>{count > 0 && <small>{count}</small>}</button>; })}
                                                    </nav>
                                                    <div className="campaign-journal-list">
                                                        {filteredNotes.map(note => {
                                                            const isEditing = editingDiaryEntry === note.id;
                                                            const title = note.title || (!note.category ? note.date : '') || 'Entrada sin título';
                                                            const related = (note.relations || []).map(id => sessionNotes.find(entry => entry.id === id)).filter(Boolean);
                                                            return <article key={note.id} className={`campaign-journal-card ${isEditing ? 'is-editing' : ''}`}>
                                                                <div className="campaign-journal-card-accent"></div>
                                                                {!isEditing ? <><header><div><span>{categoryLabel(note.category || 'sessions')}</span><h3>{title}</h3></div><time>{note.category ? (note.date || 'Sin fecha') : 'Nota anterior'}</time></header><p>{note.text || 'Esta entrada todavía no tiene contenido.'}</p>{((note.tags || []).length > 0 || related.length > 0) && <footer><div>{(note.tags || []).map(tag => <span key={tag}>#{tag}</span>)}</div>{related.length > 0 && <small>↗ {related.map(entry => entry.title || entry.date || 'Entrada').join(' · ')}</small>}</footer>}<button type="button" className="campaign-journal-edit" onClick={() => setEditingDiaryEntry(note.id)}>Editar</button></> :
                                                                <div className="campaign-journal-editor">
                                                                    <div className="campaign-journal-editor-heading"><div><small>Editando entrada</small><strong>{title}</strong></div><button type="button" onClick={() => setEditingDiaryEntry(null)}>Cerrar</button></div>
                                                                    <div className="campaign-journal-editor-meta"><label><span>Categoría</span><select value={note.category || 'sessions'} onChange={event => updateNote(note.id,{category:event.target.value})}>{categories.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label><label><span>Fecha</span><input type="date" value={note.category ? (note.date || '') : ''} onChange={event => updateNote(note.id,{date:event.target.value})} /></label></div>
                                                                    <label className="campaign-journal-field"><span>Título</span><input type="text" value={note.title || (!note.category ? note.date : '') || ''} onChange={event => updateNote(note.id,{title:event.target.value,...(!note.category ? {date:new Date().toISOString().slice(0,10)} : {})})} placeholder="¿Qué quieres recordar?" /></label>
                                                                    <label className="campaign-journal-field"><span>Notas</span><textarea value={note.text || ''} onChange={event => updateNote(note.id,{text:event.target.value})} placeholder="Escribe libremente: sucesos, decisiones, detalles…" /></label>
                                                                    <label className="campaign-journal-field"><span>Etiquetas <small>separadas por comas</small></span><input type="text" value={(note.tags || []).join(', ')} onChange={event => updateNote(note.id,{tags:event.target.value.split(',').map(tag => tag.trim()).filter(Boolean)})} placeholder="urgente, ciudad, grupo…" /></label>
                                                                    <div className="campaign-journal-field"><span>Relacionar con</span><div className="campaign-journal-relations">{sessionNotes.filter(entry => entry.id !== note.id).map(entry => { const selected = (note.relations || []).includes(entry.id); return <button type="button" key={entry.id} className={selected ? 'is-selected' : ''} onClick={() => updateNote(note.id,{relations:selected ? (note.relations || []).filter(id => id !== entry.id) : [...(note.relations || []),entry.id]})}>{selected ? '✓ ' : '+ '}{entry.title || entry.date || 'Entrada sin título'}</button>; })}{sessionNotes.length <= 1 && <small>No hay otras entradas que relacionar.</small>}</div></div>
                                                                    <div className="campaign-journal-editor-actions"><button type="button" className="is-danger" onClick={() => confirmDelete(`¿Borrar la entrada "${title}"?`,() => { setSessionNotes(sessionNotes.filter(entry => entry.id !== note.id)); setEditingDiaryEntry(null); })}>Eliminar</button><button type="button" className="is-primary" onClick={() => setEditingDiaryEntry(null)}>Guardar entrada</button></div>
                                                                </div>}
                                                            </article>;
                                                        })}
                                                        {!filteredNotes.length && <div className="campaign-journal-empty"><span>✦</span><strong>{sessionNotes.length ? 'No hay coincidencias' : 'La crónica aún está en blanco'}</strong><p>{sessionNotes.length ? 'Prueba otra búsqueda o cambia de categoría.' : 'Crea una entrada para guardar el primer hilo de la aventura.'}</p></div>}
                                                    </div>
                                                </div>;
                                            })()}
                                            <div className="inventory-diary-body hidden">
                                            {sessionNotes.map(note => (
                                                <article key={note.id} className="inventory-diary-entry">
                                                    <div className="inventory-diary-entry-header">
                                                        <input
                                                            type="text"
                                                            placeholder="Ej: Sesión 1"
                                                            value={note.date}
                                                            onChange={e => setSessionNotes(sessionNotes.map(item => item.id === note.id ? { ...item, date: e.target.value } : item))}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDelete(`¿Borrar las notas de la sesión \"${note.date}\"?`, () => setSessionNotes(sessionNotes.filter(item => item.id !== note.id)))}
                                                            aria-label={`Borrar entrada ${note.date}`}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        placeholder="Ej: PNJs, botín y sucesos..."
                                                        value={note.text}
                                                        onChange={e => setSessionNotes(sessionNotes.map(item => item.id === note.id ? { ...item, text: e.target.value } : item))}
                                                    />
                                                </article>
                                            ))}
                                            {sessionNotes.length === 0 && <p className="inventory-diary-empty">El diario está vacío. Pulsa + Nueva entrada para comenzar la crónica.</p>}
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* PERFIL NARRATIVO */}
                                <details data-tab="character" className="narrative-profile-panel tab-section rpg-panel">
                                    <summary className="narrative-profile-summary">
                                        <span className="character-section-emblem"><CharacterSectionGlyph section="traits" /></span>
                                        <span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase tracking-wider text-purple-300">Identidad e historia</span><strong className="mt-0.5 block font-fantasy text-base uppercase tracking-wider text-white">Perfil narrativo</strong></span>
                                        <span className="narrative-profile-progress">{narrativeFilledCount}/15 campos</span>
                                    </summary>
                                    <div className="narrative-profile-body">
                                        <p className="narrative-profile-intro">Información interpretativa del personaje. No modifica ninguna regla ni cálculo de la ficha.</p>
                                        <section className="narrative-profile-section is-identity"><header><span aria-hidden="true">I</span><div><h3>Identidad</h3><p>Datos visibles y presencia física</p></div></header><div className="narrative-profile-grid is-compact">
                                            <label>Alineamiento<input type="text" value={narrative.alignment} onChange={event => setNarrative(previous => ({ ...previous, alignment: event.target.value }))} placeholder="Ej: Neutral bueno" /></label><label>Edad<input type="text" value={narrative.age} onChange={event => setNarrative(previous => ({ ...previous, age: event.target.value }))} placeholder="Ej: 27 años" /></label><label>Altura<input type="text" value={narrative.height} onChange={event => setNarrative(previous => ({ ...previous, height: event.target.value }))} placeholder="Ej: 1,78 m" /></label><label>Peso<input type="text" value={narrative.weight} onChange={event => setNarrative(previous => ({ ...previous, weight: event.target.value }))} placeholder="Ej: 74 kg" /></label><label className="is-wide">Apariencia<textarea value={narrative.appearance} onChange={event => setNarrative(previous => ({ ...previous, appearance: event.target.value }))} placeholder="Rasgos físicos, vestimenta, voz, gestos y detalles reconocibles…" /></label>
                                        </div></section>
                                        <section className="narrative-profile-section"><header><span aria-hidden="true">II</span><div><h3>Carácter</h3><p>La brújula interior del personaje</p></div></header><div className="narrative-profile-grid">
                                            <label>Personalidad<textarea value={narrative.personality} onChange={event => setNarrative(previous => ({ ...previous, personality: event.target.value }))} placeholder="Cómo se comporta, hábitos y forma de relacionarse…" /></label><label>Ideales<textarea value={narrative.ideals} onChange={event => setNarrative(previous => ({ ...previous, ideals: event.target.value }))} placeholder="Principios que guían sus decisiones…" /></label><label>Vínculos<textarea value={narrative.bonds} onChange={event => setNarrative(previous => ({ ...previous, bonds: event.target.value }))} placeholder="Personas, lugares u objetos importantes…" /></label><label>Defectos<textarea value={narrative.flaws} onChange={event => setNarrative(previous => ({ ...previous, flaws: event.target.value }))} placeholder="Miedos, debilidades o comportamientos problemáticos…" /></label>
                                        </div></section>
                                        <section className="narrative-profile-section"><header><span aria-hidden="true">III</span><div><h3>Relaciones y propósito</h3><p>Lazos con el mundo y motivos para avanzar</p></div></header><div className="narrative-profile-grid">
                                            <label>Organizaciones<textarea value={narrative.organizations} onChange={event => setNarrative(previous => ({ ...previous, organizations: event.target.value }))} placeholder="Gremios, facciones, órdenes o grupos…" /></label><label>Aliados<textarea value={narrative.allies} onChange={event => setNarrative(previous => ({ ...previous, allies: event.target.value }))} placeholder="Contactos y personas de confianza…" /></label><label>Enemigos<textarea value={narrative.enemies} onChange={event => setNarrative(previous => ({ ...previous, enemies: event.target.value }))} placeholder="Rivales, perseguidores y amenazas personales…" /></label><label>Objetivos personales<textarea value={narrative.goals} onChange={event => setNarrative(previous => ({ ...previous, goals: event.target.value }))} placeholder="Metas inmediatas y aspiraciones a largo plazo…" /></label><label className="is-wide">Deidad o filosofía<textarea value={narrative.faith} onChange={event => setNarrative(previous => ({ ...previous, faith: event.target.value }))} placeholder="Fe, código moral, tradición o visión del mundo…" /></label>
                                        </div></section>
                                        <section className="narrative-profile-section is-history"><header><span aria-hidden="true">IV</span><div><h3>Crónica</h3><p>El camino recorrido hasta la aventura</p></div></header><div className="narrative-profile-grid"><label className="is-wide">Historia del personaje<textarea className="is-history" value={narrative.history} onChange={event => setNarrative(previous => ({ ...previous, history: event.target.value }))} placeholder="Origen, acontecimientos importantes y camino hasta la aventura actual…" /></label></div></section>
                                    </div>
                                </details>

                                {/* RASGOS Y DOTES */}
                                <div data-tab="character" className="tab-section grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="rpg-panel p-4 character-traits-panel">
                                        <div className="character-section-header is-traits">
                                            <div className="character-section-heading">
                                                <span className="character-section-emblem"><CharacterSectionGlyph section="traits" /></span>
                                                <div><p>Capacidades del personaje</p><h2>Rasgos</h2></div>
                                            </div>
                                            <button onClick={() => setAddModal({isOpen: true, type: 'trait', data: {}})} className="character-section-action">+ Rasgo</button>
                                        </div>
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                            {displayedTraits.map((t, idx) => (
                                                <div key={t.id || idx} className={`bg-gray-900/40 border-l-2 p-3 rounded border border-gray-800 relative group shadow-sm ${t.automatic ? 'border-l-cyan-500' : 'border-l-purple-500'}`}>
                                                    <h3 className="font-bold text-purple-200 text-sm pr-4 font-fantasy tracking-wide">{t.title}</h3>
                                                    <p className={`text-[11px] mt-1 leading-tight whitespace-pre-wrap ${t.automatic ? 'text-cyan-100/80' : 'text-gray-400'}`}>{t.automatic ? t.description : t.desc}</p>
                                                    {!t.automatic && <button onClick={() => confirmDelete(`¿Borrar rasgo "${t.title}"?`, () => setTraits(traits.filter((_, i) => i !== t.manualIndex)))} className="absolute top-1 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 font-bold text-lg">×</button>}
                                                </div>
                                            ))}
                                            {displayedTraits.length === 0 && <p className="text-sm text-gray-500">Aún no hay rasgos. Pulsa + Rasgo para añadir uno.</p>}
                                        </div>
                                    </div>

                                    <div className="rpg-panel p-4 character-feats-panel">
                                        <div className="character-section-header is-feats">
                                            <div className="character-section-heading">
                                                <span className="character-section-emblem"><CharacterSectionGlyph section="feats" /></span>
                                                <div><p>Mejoras y talentos</p><h2>Dotes</h2></div>
                                            </div>
                                            <div className="character-section-actions">
                                                <button onClick={() => setFeatCompendiumOpen(true)} className="character-section-action is-compendium">Compendio</button>
                                                <button onClick={() => setAddModal({isOpen: true, type: 'feat', data: {}})} className="character-section-action">+ Dote</button>
                                            </div>
                                        </div>
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                            {feats.map((t, idx) => (
                                                <div key={idx} className="bg-gray-900/40 border-l-2 border-yellow-600 p-3 rounded border border-gray-800 border-l-yellow-600 relative group shadow-sm">
                                                    <h3 className="font-bold text-yellow-200 text-sm pr-4 font-fantasy tracking-wide">{t.title}</h3>
                                                    <p className="text-[11px] text-gray-400 mt-1 leading-tight whitespace-pre-wrap">{t.desc}</p>
                                                    <button onClick={() => confirmDelete(`¿Borrar dote "${t.title}"?`, () => setFeats(feats.filter((_, i) => i !== idx)))} className="absolute top-1 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 font-bold text-lg">×</button>
                                                </div>
                                            ))}
                                            {feats.length === 0 && <p className="text-sm text-gray-500">Aún no hay dotes. Pulsa + Dote para añadir una.</p>}
                                        </div>
                                    </div>
                                </div>

                                {}
                                {/* HECHIZOS (Magia) */}
                                <div data-tab="grimoire" className="grimoire-panel tab-section rpg-panel p-4 border border-fuchsia-900/50">
                                    <div className="grimoire-toolbar flex flex-wrap justify-between items-center mb-4 rpg-panel-header !border-l-fuchsia-500 pb-3 px-4 gap-4">
                                        <div className="grimoire-heading">
                                            <span className="grimoire-heading-emblem" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 4.5A3.5 3.5 0 0 1 8.5 2H19v17H8.5A3.5 3.5 0 0 0 5 22Z"/><path d="M5 4.5V22M9 7h6M9 11h6"/></svg></span>
                                            <div><p>Magia y preparación</p><h2>Libro de conjuros</h2></div>
                                        </div>
                                        
                                        <div className="grimoire-summary flex gap-4 items-center flex-wrap flex-1 justify-end">
                                            {automaticSpells.length > 0 && <span className="text-xs text-cyan-200">Concedidos {automaticSpells.length}</span>}
                                            {grimoireConfig.useCantripLimit && <span className="text-xs text-fuchsia-200">Trucos {cantripCount}/{grimoireConfig.cantripLimit || 0}</span>}
                                            {grimoireConfig.useKnownLimit && <span className="text-xs text-fuchsia-200">Conocidos {knownSpellCount}/{grimoireConfig.knownLimit || 0}</span>}
                                            {grimoireConfig.usePrepared && <span className="text-xs text-fuchsia-200">Preparados {preparedSpellCount}/{grimoireConfig.preparedLimit || 0}</span>}
                                            {spellSaveDc !== null && <span className="text-xs text-cyan-200">{spellcastingAbilityName}: CD {spellSaveDc} · Ataque {formatMod(spellAttackBonus)}</span>}
                                            <div className="grimoire-actions flex items-center gap-2">
                                                <button onClick={() => setGrimoireView('srd')} className="grimoire-action is-compendium min-h-11 text-xs font-fantasy uppercase tracking-wider bg-purple-950/50 border border-purple-700 hover:bg-purple-700 text-purple-100 hover:text-white px-4 py-2 rounded transition-colors shadow-md">{spellWorkflowCopy.compendium}</button>
                                                <button onClick={() => setAddModal({isOpen: true, type: 'spell', data: {}})} className="grimoire-action is-add min-h-11 text-xs font-fantasy uppercase tracking-wider bg-fuchsia-900/50 border border-fuchsia-700 hover:bg-fuchsia-600 text-fuchsia-100 hover:text-white px-4 py-2 rounded transition-colors shadow-md">+ Conjuro</button>
                                            </div>
                                        </div>
                                    </div>
                                    {activeConcentration && <section className="concentration-banner" role="status"><span className="concentration-banner-sigil" aria-hidden="true">C</span><div className="min-w-0 flex-1"><span className="concentration-banner-kicker">Concentración activa</span><strong>{activeConcentration.spellName}</strong><small>Desde {new Date(activeConcentration.startedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</small></div><button type="button" onClick={finishConcentration}>Finalizar concentración</button></section>}
                                    
                                    <div className="grimoire-utility-row mb-3">
                                        <button type="button" onClick={() => setGrimoireSettingsOpen(value => !value)} className={`grimoire-settings-toggle ${grimoireSettingsOpen ? 'is-open' : ''}`} aria-expanded={grimoireSettingsOpen}>
                                            <span aria-hidden="true">✦</span> Configuración de lanzamiento
                                            <span className="grimoire-settings-toggle-state">{grimoireSettingsOpen ? 'Ocultar' : 'Ajustar'}</span>
                                        </button>
                                        <button type="button" onClick={() => setGrimoireGuideOpen(true)} className="grimoire-guide-toggle" aria-haspopup="dialog">
                                            <span aria-hidden="true">?</span> Cómo empezar
                                        </button>
                                    </div>
                                    {grimoireSettingsOpen && <section className="grimoire-settings mb-4 text-xs">
                                        {srdSpellcastingProfile && <div className="grimoire-profile-card">
                                            <div className="grimoire-profile-sigil" aria-hidden="true">✦</div>
                                            <div className="min-w-0">
                                                <p className="grimoire-profile-eyebrow">Perfil de lanzamiento activo</p>
                                                <strong className="grimoire-profile-title">{srdSpellcastingProfile.name} <span>· Nivel {srdSpellcastingLevel}</span></strong>
                                                <p className="grimoire-profile-summary">{!srdProfileHasSpellcasting ? 'Esta progresión obtiene lanzamiento de conjuros en un nivel posterior.' : <>{srdSpellcastingProfile.mode === 'prepared' ? `Prepara hasta ${srdProfilePreparedLimit} conjuros` : `Conoce hasta ${srdProfileKnownLimit} conjuros`}{srdProfileCantrips > 0 ? ` · ${srdProfileCantrips} trucos` : ''}{srdSpellcastingProfile.mode === 'known-pact' ? ` · Magia de pacto de nivel ${srdProfileMaxSpellLevel}` : ` · Ranuras hasta nivel ${srdProfileMaxSpellLevel}`}</>}</p>
                                                {srdSpellcastingProfile.listNote && <p className="mt-1 text-[11px] text-yellow-200/80">{srdSpellcastingProfile.listNote}</p>}
                                            </div>
                                            <button type="button" onClick={() => setGrimoireConfig(previous => ({ ...previous, srdProfileKey: '' }))} className="grimoire-profile-recalculate">Recalcular</button>
                                        </div>}
                                        {!srdSpellcastingProfile && String(charInfo.cls || '').trim() && <p className="grimoire-manual-notice">No hay un perfil automático para esta clase. La configuración manual del Grimorio sigue disponible.</p>}
                                        <div className="grimoire-settings-grid">
                                            <label className="grimoire-ability-card">
                                                <span className="grimoire-setting-kicker">Canalización</span>
                                                <span className="grimoire-setting-title">Característica de lanzamiento</span>
                                                <select value={spellcastingAbility} onChange={event => setGrimoireConfig(previous => ({ ...previous, spellcastingAbility: event.target.value }))} className="grimoire-setting-select">
                                                    <option value="">Sin configurar</option>
                                                    {SPELLCASTING_ABILITIES.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                                                </select>
                                                {spellcastingModifier !== null && <span className="grimoire-ability-result">Mod. {formatMod(spellcastingModifier)} <i /> CD {spellSaveDc} <i /> Ataque {formatMod(spellAttackBonus)}</span>}
                                            </label>
                                            {[['useKnownLimit','Conjuros conocidos','knownLimit',`Conocidos ${knownSpellCount} / ${grimoireConfig.knownLimit || 0}`],['usePrepared','Conjuros preparados','preparedLimit',`Preparados ${preparedSpellCount} / ${grimoireConfig.preparedLimit || 0}`],['useCantripLimit','Trucos conocidos','cantripLimit',`Trucos ${cantripCount} / ${grimoireConfig.cantripLimit || 0}`]].map(([key,label,limit,labelCount]) => <label key={key} className={`grimoire-setting-card ${grimoireConfig[key] ? 'is-enabled' : ''}`}>
                                                <span className="grimoire-setting-heading"><input type="checkbox" checked={!!grimoireConfig[key]} onChange={e => setGrimoireConfig(prev => ({ ...prev, [key]: e.target.checked }))} /><span>{label}</span></span>
                                                <span className="grimoire-setting-description">{grimoireConfig[key] ? 'Límite activo' : 'Sin límite'}</span>
                                                {grimoireConfig[key] && <span className="grimoire-setting-values"><input type="number" min="0" placeholder="0" value={grimoireConfig[limit]} onChange={e => setGrimoireConfig(prev => ({ ...prev, [limit]: handleNumInput(e.target.value) }))} /><span>{labelCount}</span></span>}
                                            </label>)}
                                            <label className={`grimoire-setting-card grimoire-pact-card ${grimoireConfig.usePactMagic ? 'is-enabled' : ''}`}>
                                                <span className="grimoire-setting-heading"><input type="checkbox" checked={!!grimoireConfig.usePactMagic} onChange={e => setGrimoireConfig(prev => ({ ...prev, usePactMagic: e.target.checked }))} /><span>Magia de pacto</span></span>
                                                <span className="grimoire-setting-description">{grimoireConfig.usePactMagic ? 'Ranuras que se recuperan con descanso corto' : 'No utilizada'}</span>
                                                {grimoireConfig.usePactMagic && <span className="grimoire-setting-values grimoire-pact-values"><input aria-label="Ranuras actuales de magia de pacto" type="number" min="0" value={grimoireConfig.pactSlots.current} onChange={e => setGrimoireConfig(prev => ({ ...prev, pactSlots: { ...prev.pactSlots, current: handleNumInput(e.target.value) } }))} /><b>/</b><input aria-label="Ranuras máximas de magia de pacto" type="number" min="0" value={grimoireConfig.pactSlots.max} onChange={e => setGrimoireConfig(prev => ({ ...prev, pactSlots: { ...prev.pactSlots, max: handleNumInput(e.target.value) } }))} /><span>Nivel</span><input aria-label="Nivel de ranura de magia de pacto" type="number" min="1" max="9" value={grimoireConfig.pactSlots.level} onChange={e => setGrimoireConfig(prev => ({ ...prev, pactSlots: { ...prev.pactSlots, level: handleNumInput(e.target.value) } }))} /></span>}
                                            </label>
                                        </div>
                                    </section>}
                                    <div className="grimoire-navigation mb-4">
                                        <div className="grimoire-view-tabs">
                                            <button onClick={() => setGrimoireView('available')} className={`grimoire-view-tab ${grimoireView === 'available' ? 'is-active' : ''}`}>{spellWorkflowCopy.ready}</button>
                                            <button onClick={() => setGrimoireView('library')} className={`grimoire-view-tab ${grimoireView === 'library' ? 'is-active' : ''}`}>{spellWorkflowCopy.collection}</button>
                                            <button onClick={() => setGrimoireView('srd')} className={`grimoire-view-tab is-compendium ${grimoireView === 'srd' ? 'is-active' : ''}`}>{spellWorkflowCopy.compendium}</button>
                                        </div>
                                        {grimoireView !== 'srd' && <>
                                            <div className="grimoire-list-controls">
                                                <input value={spellSearch} onChange={e => setSpellSearch(e.target.value)} placeholder="Buscar por nombre…" className="min-w-[10rem] flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm"/>
                                                <select value={spellFilter} onChange={e => setSpellFilter(e.target.value)} className="bg-gray-950 border border-gray-700 rounded px-2 text-sm"><option value="all">Todos</option><option value="cantrip">Trucos</option><option value="prepared">Preparados</option><option value="ritual">Rituales</option><option value="concentration">Concentración</option><option value="favorite">Favoritos</option>{[...new Set(grimorioSpells.map(spell => spell.level))].sort((a,b)=>a-b).map(level => <option key={level} value={level}>{level === 0 ? 'Trucos' : `Nivel ${level}`}</option>)}</select>
                                            </div>
                                        </>}
                                    </div>
                                    {grimoireView === 'srd' ? (
                                        <ArcaneCompendiumView
                                            spellLibrary={srdSpellLibrary}
                                            displayedSpells={displayedSrdSpells}
                                            addedSpells={grimorioSpells}
                                            profile={srdSpellcastingProfile}
                                            profileMaxSpellLevel={srdProfileMaxSpellLevel}
                                            classFilterActive={isSrdClassFilterActive}
                                            workflow={spellWorkflow}
                                            workflowDescription={spellWorkflowCopy.description}
                                            actionLabel={spellWorkflowCopy.action}
                                            search={srdSpellSearch}
                                            level={srdSpellLevel}
                                            school={srdSpellSchool}
                                            classFilter={srdSpellClassFilter}
                                            trait={srdSpellTrait}
                                            schools={srdSpellSchools}
                                            onSearchChange={setSrdSpellSearch}
                                            onLevelChange={setSrdSpellLevel}
                                            onSchoolChange={setSrdSpellSchool}
                                            onClassFilterChange={setSrdSpellClassFilter}
                                            onTraitChange={setSrdSpellTrait}
                                            onShowDetail={setSrdSpellDetail}
                                            onChooseSpell={addSpellFromSrdLibrary}
                                            getSpellIcon={getSpellIconPath}
                                            getSpellIconColor={getSpellIconColor}
                                        />
                                    ) : <>
                                    {/* Ranuras (Slots) */}
                                    <div className="grimoire-slot-bar flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-gray-800"><span className="grimoire-slot-label">Ranuras</span>{[1,2,3,4,5,6,7,8,9].filter(level => showEmptySlots || Number(spellSlots[level].max) > 0).map(level => <button key={level} onClick={() => setEditingSlotLevel(level)} className="grimoire-slot-chip px-3 py-2 rounded border border-gray-700 bg-gray-900 text-xs font-mono hover:border-fuchsia-500"><b className="text-fuchsia-300">N{level}</b> {spellSlots[level].current}/{spellSlots[level].max}</button>)}<button onClick={() => setShowEmptySlots(value => !value)} className="grimoire-empty-slots-toggle px-3 py-2 text-xs text-gray-400">{showEmptySlots ? 'Ocultar niveles vacíos' : 'Mostrar niveles vacíos'}</button></div>

                                    {/* Lista de Conjuros */}
                                    <div className="grimoire-collection-heading"><div><span>Archivo arcano</span><strong>{grimoireView === 'available' ? 'Conjuros listos' : 'Colección de conjuros'}</strong></div><small>{displayedSpells.length} {displayedSpells.length === 1 ? 'conjuro' : 'conjuros'}</small></div>
                                    <div className="spell-library-grid grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                                        {displayedSpells.map(sp => {
                                            const compStr = [sp.compV ? 'V' : null, sp.compS ? 'S' : null, sp.compM ? 'M' : null].filter(Boolean).join(', ');
                                            const mDesc = sp.compM && sp.compMDesc ? ` (${sp.compMDesc})` : '';
                                            const sourceSpell = sp.sourceId ? srdSpellLibrary.find(librarySpell => librarySpell.id === sp.sourceId) : null;
                                            const grantSummary = getSpellGrantSummary(sp);
                                            const spellIcon = getSpellIconPath(sp);
                                            const spellIconColor = getSpellIconColor(sp);
                                            return (
                                                <article key={sp.id} style={spellIconColor ? { '--spell-art-rgb': spellIconColor } : undefined} className={`spell-card flex flex-col p-3 rounded-lg border transition-all duration-300 ${sp.prepared ? 'is-prepared' : ''} ${sp.grantType !== 'standard' ? 'is-granted' : ''} ${sp.concentration ? 'is-concentration' : ''} ${spellIcon ? 'has-spell-art' : ''} relative group`}>
                                                    <div className="spell-card-hero">
                                                        <div className="spell-card-hero-copy">
                                                            <div className="spell-card-title flex justify-between items-center mb-2">
                                                                <div className="flex items-center space-x-3">
                                                                    <span className="spell-level-seal">{sp.level === 0 ? 'T' : sp.level}<small>{sp.level === 0 ? 'Truco' : 'Nivel'}</small></span>
                                                                    <div><span className="spell-card-name">{sp.name}</span><span className="spell-card-traits">{sp.prepared && <i>Preparado</i>}{sp.concentration && <i>Concentración</i>}{sp.ritual && <i>Ritual</i>}</span></div>
                                                                </div>
                                                            </div>
                                                            <div className={`spell-origin-block ${sp.grantType !== 'standard' ? 'is-granted' : ''}`}><strong>{grantSummary.type}</strong>{grantSummary.source && <span>{grantSummary.source}</span>}<div><small>{grantSummary.preparation}</small><small>{grantSummary.knownLimit}</small><small>{grantSummary.resource}</small>{sp.castingResource === 'independent' && Number(sp.ownUsesCurrent) < Number(sp.ownUsesMax) && <button type="button" onClick={() => restoreSpellOwnUses(sp)}>Restablecer usos</button>}</div></div>
                                                        </div>
                                                        {spellIcon && <figure className="spell-card-art"><img src={spellIcon} alt={`Icono de ${sp.name}`} loading="lazy" /></figure>}
                                                    </div>
                                                    <div className="spell-card-details flex flex-col text-[10px] text-gray-400 font-medium mb-2 bg-gray-950/50 p-2 rounded border border-gray-800/50">
                                                        <div className="flex space-x-3">
                                                            {sp.range && sp.range !== '-' && <span><span className="text-gray-500">Alc:</span> {sp.range}</span>}
                                                            {(sp.shape && sp.shape !== '-' || sp.size && sp.size !== '-') && <span><span className="text-gray-500">Área:</span> {sp.shape} {sp.size}</span>}
                                                        </div>
                                                        {compStr && <span className="mt-1"><span className="text-gray-500">Comp:</span> <span className="text-purple-300">{compStr}</span>{mDesc}</span>}
                                                    </div>
                                                    <p className="spell-card-description text-[11px] text-gray-400 mt-1 leading-snug whitespace-pre-wrap">{sp.description || sp.notes}</p>
                                                    <div className="spell-card-actions flex flex-wrap gap-2 mt-3">{sourceSpell && <button type="button" onClick={() => setSrdSpellDetail(sourceSpell)} className="spell-card-detail min-h-9 rounded border border-purple-700 px-3 text-xs text-purple-100 hover:bg-purple-950/50">Consultar</button>}<button onClick={() => setCastSpell(sp)} className="spell-card-cast min-h-9 px-3 py-1.5 rounded bg-fuchsia-800 hover:bg-fuchsia-700 text-xs text-white">Lanzar</button>{!sp.automatic && grimoireConfig.useKnownLimit && sp.level > 0 && <button onClick={() => toggleSpellKnown(sp)} className="min-h-9 px-3 py-1.5 rounded border border-gray-600 text-xs text-gray-200">{sp.known ? 'Dejar de conocer' : 'Conocer'}</button>}{!sp.automatic && grimoireConfig.usePrepared && sp.level > 0 && <button onClick={() => toggleSpellPreparation(sp)} className="spell-card-prepare min-h-9 px-3 py-1.5 rounded border border-fuchsia-700 text-xs text-fuchsia-200">{sp.prepared ? 'Dejar de preparar' : 'Preparar'}</button>}{!sp.automatic && <button onClick={() => setSpells(spells.map(item => item.id === sp.id ? {...item,favorite:!item.favorite} : item))} className="spell-card-favorite min-h-9 px-2 py-1.5 text-xs text-yellow-300" aria-label={sp.favorite ? `Quitar ${sp.name} de favoritos` : `Añadir ${sp.name} a favoritos`}>{sp.favorite ? '★' : '☆'}</button>}</div>
                                                    {!sp.automatic && <button onClick={(e) => { e.stopPropagation(); confirmDelete(`¿Borrar hechizo "${sp.name}"?`, () => setSpells(spells.filter(s => s.id !== sp.id))); }} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 text-lg transition-opacity">×</button>}
                                                </article>
                                            )
                                        })}
                                        {grimorioSpells.length === 0 && <div className="grimoire-empty-state col-span-1 md:col-span-2 p-8 border-2 border-dashed border-gray-800 rounded-lg text-center"><span className="text-gray-500 text-sm italic font-fantasy tracking-widest uppercase">El grimorio está vacío.</span><p className="mt-2 text-xs text-gray-500 normal-case tracking-normal">Abre el Compendio Arcano o usa + Conjuro para empezar.</p></div>}
                                    </div>
                                    </>}
                                </div>

                            </div>
                        </div>

                        </div>

                        </main>

                        <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 gap-1 border-t border-gray-700 bg-gray-950/95 p-1 backdrop-blur-md" aria-label="Navegacion principal">
                            <button type="button" onClick={() => requestTabChange('character')} className={`bottom-nav-button flex flex-col items-center justify-center gap-1 rounded-md text-[10px] font-fantasy uppercase tracking-wider transition-colors ${activeTab === 'character' ? 'bg-purple-950/70 text-purple-300 shadow-inner' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'}`} aria-current={activeTab === 'character' ? 'page' : undefined}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6"/></svg><span>{t('character')}</span>
                            </button>
                            <button type="button" onClick={() => requestTabChange('combat')} className={`bottom-nav-button flex flex-col items-center justify-center gap-1 rounded-md text-[10px] font-fantasy uppercase tracking-wider transition-colors ${activeTab === 'combat' ? 'bg-red-950/70 text-red-300 shadow-inner' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'}`} aria-current={activeTab === 'combat' ? 'page' : undefined}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m14.5 4.5 5 5-9 9H5.5v-5l9-9Z"/><path d="m13 6 5 5"/><path d="m4 20 3-3"/></svg><span>{t('combat')}</span>
                            </button>
                            <button type="button" onClick={() => requestTabChange('grimoire')} className={`bottom-nav-button flex flex-col items-center justify-center gap-1 rounded-md text-[10px] font-fantasy uppercase tracking-wider transition-colors ${activeTab === 'grimoire' ? 'bg-fuchsia-950/70 text-fuchsia-300 shadow-inner' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'}`} aria-current={activeTab === 'grimoire' ? 'page' : undefined}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 4.5A3.5 3.5 0 0 1 8.5 2H19v17H8.5A3.5 3.5 0 0 0 5 22Z"/><path d="M5 4.5V22M9 7h6M9 11h6"/></svg><span>{t('spellbook')}</span>
                            </button>
                            <button type="button" onClick={() => requestTabChange('inventory')} className={`bottom-nav-button flex flex-col items-center justify-center gap-1 rounded-md text-[10px] font-fantasy uppercase tracking-wider transition-colors ${activeTab === 'inventory' ? 'bg-amber-950/70 text-amber-300 shadow-inner' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'}`} aria-current={activeTab === 'inventory' ? 'page' : undefined}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg><span>{t('inventory')}</span>
                            </button>
                        </nav>

                        {grimoireGuideOpen && ReactDOM.createPortal(
                            <div
                                className="grimoire-guide-backdrop"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Guía para empezar con la magia"
                                onMouseDown={event => {
                                    if (event.target === event.currentTarget) setGrimoireGuideOpen(false);
                                }}
                            >
                                <article className="grimoire-guide-dialog">
                                    <header className="grimoire-guide-header">
                                        <div className="min-w-0">
                                            <span>Guía rápida</span>
                                            <h3>Empieza con la magia</h3>
                                            <p>{spellWorkflowCopy.description}</p>
                                        </div>
                                        <button type="button" onClick={() => setGrimoireGuideOpen(false)} aria-label="Cerrar guía de magia">×</button>
                                    </header>
                                    <div className="grimoire-guide-content">
                                        <section className="grimoire-guide-profile">
                                            <span>Tu forma de lanzar magia</span>
                                            <h4>{spellGuideProfile.title}</h4>
                                            <p>{spellGuideProfile.explanation}</p>
                                            <div>
                                                <strong>{spellGuideProfile.limitLabel}<b>{spellGuideProfile.limitValue}</b></strong>
                                                <strong>Trucos<b>{srdProfileCantrips || 0}</b></strong>
                                                <strong>{spellGuideProfile.recovery}</strong>
                                            </div>
                                        </section>
                                        <ol className="grimoire-guide-steps">
                                            {spellGuideSteps.map(([title, description], index) => (
                                                <li key={title}>
                                                    <span aria-hidden="true">{index + 1}</span>
                                                    <div><strong>{title}</strong><p>{description}</p></div>
                                                </li>
                                            ))}
                                        </ol>
                                        <section className="grimoire-guide-notes">
                                            <h4>Qué significa cada zona</h4>
                                            <p><strong>Compendio Arcano:</strong> sirve para buscar y consultar; un conjuro no entra en tu ficha hasta que pulses su acción de añadir, aprender o preparar.</p>
                                            <p><strong>Conjuros listos:</strong> es la vista rápida para jugar. Contiene preparados, conocidos o concedidos, según tu tipo de lanzador.</p>
                                            <p><strong>Trucos y ranuras:</strong> los trucos no gastan ranuras. Las ranuras son los usos para conjuros de nivel 1 o superior.</p>
                                            <p><strong>Nivel superior:</strong> puedes elegir una ranura mayor si el conjuro mejora al lanzarse con ella.</p>
                                        </section>
                                    </div>
                                    <footer className="grimoire-guide-footer">
                                        <button type="button" onClick={() => setGrimoireGuideOpen(false)}>Cerrar</button>
                                        <button type="button" onClick={() => { setGrimoireView('srd'); setGrimoireGuideOpen(false); }}>Abrir {spellWorkflowCopy.compendium}</button>
                                    </footer>
                                </article>
                            </div>,
                            document.body
                        )}

                        {featCompendiumOpen && ReactDOM.createPortal(
                            <div
                                className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Compendio de dotes"
                                onMouseDown={event => {
                                    if (event.target === event.currentTarget) {
                                        setFeatCompendiumOpen(false);
                                        setFeatCompendiumDetail(null);
                                    }
                                }}
                            >
                                <article className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded border border-yellow-700 bg-gray-900 shadow-2xl">
                                    <header className="flex items-start justify-between gap-3 border-b border-yellow-900/70 bg-yellow-950/20 px-4 py-3">
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300">Colección de opciones</span>
                                            <h3 className="mt-1 font-fantasy text-xl font-bold text-yellow-100">Compendio de dotes</h3>
                                            <p className="mt-1 text-xs text-yellow-100/70">Consulta una dote antes de añadir una copia editable a este personaje.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setFeatCompendiumOpen(false); setFeatCompendiumDetail(null); }}
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-600 text-xl text-gray-200 hover:border-yellow-400"
                                            aria-label="Cerrar compendio de dotes"
                                        >×</button>
                                    </header>
                                    <div className="min-h-0 overflow-y-auto p-4">
                                        <div className="flex flex-wrap gap-2">
                                            <input
                                                value={featCompendiumSearch}
                                                onChange={event => setFeatCompendiumSearch(event.target.value)}
                                                placeholder="Buscar, ej.: Telepático"
                                                className="min-h-11 min-w-[12rem] flex-1 rounded border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none focus:border-yellow-500"
                                            />
                                            <select
                                                value={featCompendiumSource}
                                                onChange={event => setFeatCompendiumSource(event.target.value)}
                                                className="min-h-11 rounded border border-gray-700 bg-gray-950 px-3 text-sm text-gray-100 outline-none focus:border-yellow-500"
                                            >
                                                <option value="all">Todas las fuentes</option>
                                                <option value="SRD 5.1">SRD 5.1</option>
                                                <option value="Caldero de Tasha">Caldero de Tasha</option>
                                            </select>
                                        </div>

                                        {featCompendiumDetail && <section className="mt-4 rounded border border-yellow-700/70 bg-yellow-950/20 p-4">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300">{featCompendiumDetail.source}</span>
                                                    <h4 className="mt-1 font-fantasy text-lg font-bold text-yellow-100">{featCompendiumDetail.name}</h4>
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={feats.some(feat => feat.sourceId === featCompendiumDetail.id || String(feat.title || '').trim().toLocaleLowerCase('es') === featCompendiumDetail.name.toLocaleLowerCase('es'))}
                                                    onClick={() => addFeatFromCompendium(featCompendiumDetail)}
                                                    className="min-h-11 rounded border border-yellow-600 bg-yellow-800 px-4 text-sm font-semibold text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-500"
                                                >{feats.some(feat => feat.sourceId === featCompendiumDetail.id || String(feat.title || '').trim().toLocaleLowerCase('es') === featCompendiumDetail.name.toLocaleLowerCase('es')) ? 'Ya añadida' : 'Añadir a la ficha'}</button>
                                            </div>
                                            {featCompendiumDetail.prerequisites && <p className="mt-3 text-xs text-cyan-200"><strong>Prerrequisito:</strong> {featCompendiumDetail.prerequisites}</p>}
                                            <p className="mt-3 text-sm leading-relaxed text-gray-200">{featCompendiumDetail.summary}</p>
                                        </section>}

                                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                            {displayedCompendiumFeats.map(feat => {
                                                const added = feats.some(characterFeat => characterFeat.sourceId === feat.id || String(characterFeat.title || '').trim().toLocaleLowerCase('es') === feat.name.toLocaleLowerCase('es'));
                                                return <article key={feat.id} className="rounded border border-gray-800 bg-gray-950/45 p-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <h4 className="font-fantasy text-sm font-bold text-yellow-100">{feat.name}</h4>
                                                        </div>
                                                        <button type="button" onClick={() => setFeatCompendiumDetail(feat)} className="min-h-9 shrink-0 rounded border border-gray-600 px-2 text-xs text-gray-200 hover:border-yellow-500">Ver</button>
                                                    </div>
                                                    {feat.prerequisites && <p className="mt-2 text-[11px] text-cyan-200">{feat.prerequisites}</p>}
                                                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400">{feat.summary}</p>
                                                    <button type="button" disabled={added} onClick={() => addFeatFromCompendium(feat)} className="mt-3 min-h-10 w-full rounded border border-yellow-800 bg-yellow-950/30 px-3 text-xs font-semibold text-yellow-100 hover:bg-yellow-800 disabled:cursor-not-allowed disabled:border-gray-800 disabled:text-gray-600">{added ? 'Ya añadida' : 'Añadir'}</button>
                                                </article>;
                                            })}
                                            {!displayedCompendiumFeats.length && <p className="py-8 text-center text-sm text-gray-500 sm:col-span-2">No hay dotes que coincidan con la búsqueda.</p>}
                                        </div>
                                    </div>
                                </article>
                            </div>,
                            document.body
                        )}

                        {srdSpellDetail && (() => {
                            const components = [srdSpellDetail.compV ? 'V' : null, srdSpellDetail.compS ? 'S' : null, srdSpellDetail.compM ? 'M' : null].filter(Boolean).join(', ');
                            const diceDetails = getSrdSpellDiceDetails(srdSpellDetail);
                            const spellResolution = getSpellResolution(srdSpellDetail);
                            const storedSpell = spells.find(spell => spell.sourceId === srdSpellDetail.id);
                            const canPrepareStoredSpell = spellWorkflow === 'prepared'
                                && Number(srdSpellDetail.level) > 0
                                && storedSpell
                                && !storedSpell.prepared;
                            const alreadyAdded = automaticSpellSourceIds.has(srdSpellDetail.id) || (!!storedSpell && !canPrepareStoredSpell);
                            const spellIcon = getSpellIconPath(srdSpellDetail);
                            const spellIconColor = getSpellIconColor(srdSpellDetail);
                            const descriptionSentences = String(srdSpellDetail.description || '')
                                .trim()
                                .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/)
                                .filter(Boolean);
                            const descriptionParagraphs = descriptionSentences.reduce((paragraphs, sentence) => {
                                const startsSection = /^(?:A niveles superiores|Opciones?|Efectos?|Crear agua|Destruir agua)\b/i.test(sentence);
                                const current = paragraphs[paragraphs.length - 1];
                                if (!current || startsSection || current.length + sentence.length > 285) paragraphs.push(sentence);
                                else paragraphs[paragraphs.length - 1] = `${current} ${sentence}`;
                                return paragraphs;
                            }, []);
                            return <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Ficha de ${srdSpellDetail.name}`} onMouseDown={event => { if (event.target === event.currentTarget) setSrdSpellDetail(null); }}>
                                <article style={spellIconColor ? { '--spell-art-rgb': spellIconColor } : undefined} className={`spell-detail-modal flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded border border-purple-700 bg-gray-900 shadow-2xl ${spellIcon ? 'has-spell-art' : ''}`}>
                                    <header className="spell-detail-header flex items-start justify-between gap-3 border-b border-purple-900/70 bg-purple-950/30 px-4 py-3">
                                        {spellIcon && <figure className="spell-detail-art"><img src={spellIcon} alt={`Icono de ${srdSpellDetail.name}`} /></figure>}
                                        <div className="min-w-0"><span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">{srdSpellDetail.level === 0 ? 'Truco' : `Conjuro de nivel ${srdSpellDetail.level}`} · {srdSpellDetail.school}</span><h3 className="mt-1 font-fantasy text-xl font-bold text-purple-100">{srdSpellDetail.name}</h3></div>
                                        <button type="button" onClick={() => setSrdSpellDetail(null)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-600 text-xl text-gray-200 hover:border-purple-400" aria-label="Cerrar ficha de conjuro">×</button>
                                    </header>
                                    <div className="min-h-0 overflow-y-auto p-4">
                                        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2"><div className="rounded border border-gray-800 bg-gray-950/50 p-2"><dt className="text-[10px] uppercase text-gray-500">Lanzamiento</dt><dd className="mt-1 text-gray-200">{srdSpellDetail.castingTime}</dd></div><div className="rounded border border-gray-800 bg-gray-950/50 p-2"><dt className="text-[10px] uppercase text-gray-500">Alcance</dt><dd className="mt-1 text-gray-200">{srdSpellDetail.range}</dd></div><div className="rounded border border-gray-800 bg-gray-950/50 p-2"><dt className="text-[10px] uppercase text-gray-500">Duración</dt><dd className="mt-1 text-gray-200">{srdSpellDetail.duration}</dd></div><div className="rounded border border-gray-800 bg-gray-950/50 p-2"><dt className="text-[10px] uppercase text-gray-500">Componentes</dt><dd className="mt-1 text-gray-200">{components || 'Ninguno'}{srdSpellDetail.compMDesc ? ` (${srdSpellDetail.compMDesc})` : ''}</dd></div></dl>
                                        {(srdSpellDetail.ritual || srdSpellDetail.concentration) && <p className="mt-3 text-xs text-purple-200">{srdSpellDetail.ritual ? 'Ritual' : ''}{srdSpellDetail.ritual && srdSpellDetail.concentration ? ' · ' : ''}{srdSpellDetail.concentration ? 'Concentración' : ''}</p>}
                                        {(spellResolution.usesSpellAttack || spellResolution.savingAbility) && <section className="mt-4 rounded border border-cyan-900/60 bg-cyan-950/15 p-3"><h4 className="text-xs font-bold uppercase tracking-wider text-cyan-200">Tirada y salvación</h4>{spellcastingModifier === null ? <p className="mt-2 text-sm text-gray-400">Configura la característica de lanzamiento para calcular la CD y el ataque.</p> : <div className="mt-2 flex flex-wrap gap-2 text-sm">{spellResolution.usesSpellAttack && <span className="rounded border border-cyan-700 bg-gray-950/50 px-2 py-1 text-cyan-100">Ataque de conjuro {formatMod(spellAttackBonus)}</span>}{spellResolution.savingAbility && <span className="rounded border border-cyan-700 bg-gray-950/50 px-2 py-1 text-cyan-100">Salvación de {spellResolution.savingAbility} · CD {spellSaveDc}</span>}</div>}</section>}
                                        <section className="mt-4 rounded border border-purple-900/60 bg-purple-950/15 p-3"><h4 className="text-xs font-bold uppercase tracking-wider text-purple-200">Dados</h4>{diceDetails.length ? <div className="mt-2 flex flex-wrap gap-2">{diceDetails.map((detail, index) => {
                                            const tone = detail.kind === 'healing' || detail.kind === 'benefit'
                                                ? 'border-emerald-700/80 bg-emerald-950/25 text-emerald-100'
                                                : detail.kind === 'damage'
                                                    ? 'border-red-800/80 bg-red-950/25 text-red-100'
                                                    : 'border-cyan-700/80 bg-cyan-950/25 text-cyan-100';
                                            const labelTone = detail.kind === 'healing' || detail.kind === 'benefit'
                                                ? 'text-emerald-300'
                                                : detail.kind === 'damage' ? 'text-red-300' : 'text-cyan-300';
                                            return <span key={`${detail.value}_${detail.label}_${index}`} className={`inline-flex min-h-9 items-center gap-2 rounded border px-2.5 text-xs ${tone}`}><strong className="font-mono text-sm text-white">{detail.value}</strong><span className={labelTone}>{detail.label}</span></span>;
                                        })}</div> : <p className="mt-2 text-sm text-gray-400">Sin tirada de daño o curación con dados.</p>}</section>
                                        <section className="spell-detail-description mt-4"><header><span aria-hidden="true">✦</span><div><small>Texto completo</small><h4>Descripción</h4></div></header><div className="spell-detail-reading">{descriptionParagraphs.map((paragraph, index) => <p key={`${srdSpellDetail.id}_description_${index}`} className={/^(?:A niveles superiores|Opciones?|Efectos?)\b/i.test(paragraph) ? 'is-scaling' : ''}>{paragraph}</p>)}</div></section>
                                    </div>
                                    <footer className="flex flex-wrap justify-end gap-2 border-t border-gray-800 bg-gray-950/60 p-3"><button type="button" onClick={() => setSrdSpellDetail(null)} className="min-h-11 rounded border border-gray-600 px-4 text-sm text-gray-200">Cerrar</button><button type="button" disabled={alreadyAdded} onClick={() => addSpellFromSrdLibrary(srdSpellDetail)} className={`min-h-11 rounded border px-4 text-sm font-semibold ${alreadyAdded ? 'cursor-not-allowed border-gray-700 text-gray-500' : 'border-purple-600 bg-purple-800 text-white hover:bg-purple-700'}`}>{alreadyAdded ? getSpellCompendiumAddedLabel(srdSpellDetail) : getSpellCompendiumActionLabel(srdSpellDetail)}</button></footer>
                                </article>
                            </div>;
                        })()}

                        {/* ================= MODALES ================= */}

                        {onlineTableOpen && ReactDOM.createPortal(
                            <div className="online-table-overlay fixed inset-0 z-[60] bg-black/80 backdrop-blur-md">
                                <div className="online-table-screen online-table-panel" onClick={event => event.stopPropagation()}>
                                    <header className="online-table-header flex items-center justify-between gap-3 border-b border-gray-700 bg-gray-950/95 px-3 py-3 backdrop-blur-md sm:px-4">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-lg font-fantasy font-bold uppercase tracking-wider text-cyan-200 sm:text-xl">{onlineTableView === 'encounter' ? 'Iniciativa' : 'Mesa Online'}{currentRoom?.code ? <span className="text-gray-400"> · {currentRoom.code}</span> : ''}</h3>
                                            <p className="mt-1 truncate text-xs text-gray-400">
                                                {roomData?.status === 'active' || roomData?.status === 'paused'
                                                    ? `Ronda ${roomData?.round || 1} · Turno de ${participantName(roomData?.currentTurnId)}`
                                                    : roomData?.status === 'closed' ? 'Sala cerrada' : currentRoom ? 'Lobby' : 'Preparando conexión'}
                                                {' · '}{firebaseConnectionLabel}{currentRoom ? ` · ${isCurrentRoomMaster ? 'Máster' : 'Jugador'}` : ''}
                                            </p>
                                        </div>
                                        <div className="relative flex shrink-0 items-center gap-2">
                                            {currentRoom && onlineTableView !== 'closed' && <button type="button" onClick={() => setOnlineTableMenuOpen(previous => !previous)} className="h-11 w-11 rounded border border-gray-600 text-xl leading-none text-gray-200 hover:border-cyan-400 hover:bg-gray-800" aria-label="Más acciones de Mesa online" aria-expanded={onlineTableMenuOpen}>⋯</button>}
                                            {onlineTableMenuOpen && currentRoom && onlineTableView !== 'closed' && <div className="absolute right-12 top-12 z-30 w-52 rounded border border-gray-600 bg-gray-950 p-1.5 shadow-xl">
                                                <button type="button" onClick={() => { copyRoomCode(currentRoom.code); setOnlineTableMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">Copiar código</button>
                                                <button type="button" onClick={() => { shareRoomLink(currentRoom.code); setOnlineTableMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">Compartir enlace</button>
                                                {isCurrentRoomMaster && roomData?.status !== 'closed' ? <button type="button" onClick={() => { closeOnlineRoom(); setOnlineTableMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm text-red-200 hover:bg-red-950/40">Cerrar sala</button> : <button type="button" onClick={() => { leaveOnlineRoom(); setOnlineTableMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">Salir de sala</button>}
                                            </div>}
                                            <button type="button" onClick={() => setOnlineTableOpen(false)} className="h-11 w-11 rounded border border-gray-600 text-2xl leading-none text-gray-300 hover:bg-gray-800" aria-label="Cerrar Mesa online">&times;</button>
                                        </div>
                                    </header>
                                    {onlineTableView === 'encounter' && <nav className="online-table-nav flex flex-wrap gap-2 border-b border-gray-800 px-3 py-2 sm:px-4" aria-label="Vistas del encuentro"><button type="button" onClick={() => setOnlineEncounterView('encounter')} className={`min-h-10 rounded border px-3 text-xs ${onlineEncounterView === 'encounter' ? 'border-cyan-500 bg-cyan-950/35 text-cyan-100' : 'border-gray-700 text-gray-300'}`}>Encuentro</button>{isCurrentRoomMaster && <button type="button" onClick={() => setOnlineEncounterView('participants')} className={`min-h-10 rounded border px-3 text-xs ${onlineEncounterView === 'participants' ? 'border-purple-500 bg-purple-950/30 text-purple-100' : 'border-gray-700 text-gray-300'}`}>Participantes</button>}<button type="button" onClick={() => setOnlineEncounterView('effects')} className={`min-h-10 rounded border px-3 text-xs ${onlineEncounterView === 'effects' ? 'border-cyan-500 bg-cyan-950/35 text-cyan-100' : 'border-gray-700 text-gray-300'}`}>Efectos</button></nav>}
                                    <div ref={onlineTableContentRef} onScroll={event => { const previous = onlineTableScrollPositionsRef.current[onlineTableView] || {}; onlineTableScrollPositionsRef.current[onlineTableView] = { ...previous, outer: event.currentTarget.scrollTop }; }} className="online-table-content px-3 py-3 sm:px-4">
                                    {onlineTableError && <p className="mb-3 rounded border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-200">{onlineTableError}</p>}
                                    {onlineTableNotice && <p className="mb-3 rounded border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">{onlineTableNotice}</p>}
                                    <div ref={onlineTableViewContentRef} onScroll={saveOnlineTableViewScroll} data-online-table-view={onlineTableView}>

                                    {onlineTableView === 'start' && onlineTableScreen === 'menu' && <div className="mt-5 space-y-3">
                                        <button type="button" disabled={onlineTableBusy} onClick={createOnlineRoom} className="min-h-14 w-full rounded border border-cyan-600 bg-cyan-950/35 px-4 text-left text-cyan-100 hover:bg-cyan-900/40 disabled:cursor-not-allowed disabled:opacity-50"><strong className="block">Crear sala</strong><span className="mt-1 block text-xs text-cyan-200/70">Crearás una mesa como Máster.</span></button>
                                        <button type="button" disabled={onlineTableBusy} onClick={() => { setOnlineTableError(''); setOnlineTableNotice(''); setOnlineTableScreen('join'); }} className="min-h-14 w-full rounded border border-gray-600 bg-gray-900/70 px-4 text-left text-gray-100 hover:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"><strong className="block">Unirse a sala</strong><span className="mt-1 block text-xs text-gray-400">Introduce el código de seis caracteres.</span></button>
                                        {lastOnlineRoom && <button type="button" disabled={onlineTableBusy} onClick={() => joinOnlineRoom(lastOnlineRoom.code)} className="min-h-11 w-full rounded border border-purple-800 bg-purple-950/25 px-4 text-sm text-purple-100 hover:bg-purple-900/30 disabled:opacity-50">Reentrar en {lastOnlineRoom.code}</button>}
                                    </div>}

                                    {onlineTableView === 'start' && onlineTableScreen === 'created' && <div className="mt-5 space-y-4 text-center">
                                        <p className="text-sm text-emerald-200">Sala creada</p>
                                        <div className="rounded border border-cyan-900/70 bg-gray-950/50 p-4"><span className="block text-xs uppercase tracking-widest text-gray-500">Código</span><strong className="mt-1 block font-mono text-3xl tracking-[0.25em] text-cyan-200">{createdRoomCode}</strong></div>
                                        <div className="flex flex-wrap justify-center gap-2"><button type="button" onClick={() => copyRoomCode(createdRoomCode)} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200 hover:border-cyan-400">Copiar código</button><button type="button" onClick={() => shareRoomLink(createdRoomCode)} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200 hover:border-cyan-400">Compartir enlace</button></div>
                                        <div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setOnlineTableOpen(false)} className="min-h-10 px-4 rounded border border-gray-600 text-gray-300">Cerrar</button><button type="button" disabled={onlineTableBusy} onClick={() => { joinOnlineRoom(createdRoomCode); setCreatedRoomCode(''); }} className="min-h-10 px-4 rounded border border-cyan-600 bg-cyan-800 text-white disabled:opacity-50">Entrar en sala</button></div>
                                    </div>}

                                    {onlineTableView === 'start' && onlineTableScreen === 'join' && <div className="mt-5 space-y-4">
                                        <label className="block text-sm text-gray-300">Código de sala
                                            <input autoFocus type="text" inputMode="text" autoComplete="off" maxLength="6" value={roomCodeInput} onChange={event => setRoomCodeInput(normalizeRoomCode(event.target.value))} placeholder="ABC234" className="mt-2 w-full rounded border border-gray-700 bg-gray-950 p-3 text-center font-mono text-xl font-bold tracking-[0.25em] text-white outline-none focus:border-cyan-400" />
                                        </label>
                                        <div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setOnlineTableScreen('menu')} className="min-h-10 px-4 rounded border border-gray-600 text-gray-300">Volver</button><button type="button" disabled={onlineTableBusy} onClick={() => joinOnlineRoom()} className="min-h-10 px-4 rounded border border-cyan-600 bg-cyan-800 text-white disabled:opacity-50">{onlineTableBusy ? 'Conectando…' : 'Entrar en sala'}</button></div>
                                    </div>}

                                    {onlineTableView === 'lobby' && shareCharacterOpen && <div className="mt-5 space-y-4">
                                        <div><h4 className="font-fantasy text-lg font-bold text-cyan-200">Selecciona el personaje que quieres compartir</h4><p className="mt-1 text-sm text-gray-400">Solo se mostrarán nombre, clase, nivel, vida, CA y condiciones activas.</p></div>
                                        <div className="space-y-3">{Object.values(manager.characters).map(character => { const data = character.data; const name = data.charInfo?.name || character.meta.name || 'Personaje sin nombre'; const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'PJ'; return <div key={character.meta.id} className={`flex flex-wrap items-center gap-3 rounded border p-3 ${sharedCharacterId === character.meta.id ? 'border-cyan-500 bg-cyan-950/20' : 'border-gray-700 bg-gray-900/60'}`}><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-purple-700 bg-purple-950/40 text-sm font-bold text-purple-200">{initials}</div><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{name}</strong><span className="block text-xs text-purple-300">{data.charInfo?.cls || 'Sin clase'} · Nivel {data.level || '1'}</span><span className="mt-1 block text-xs text-gray-400">PV {data.hp?.current || '0'} / {data.hp?.max || '0'} · CA {calculateCharacterArmorClass(data)}</span></div><button type="button" disabled={sharingCharacter} onClick={() => shareLocalCharacter(character.meta.id)} className="min-h-10 shrink-0 px-3 rounded border border-cyan-600 bg-cyan-950/35 text-xs text-cyan-100 hover:bg-cyan-900/40 disabled:opacity-50">{sharingCharacter ? 'Compartiendo personaje…' : 'Compartir este personaje'}</button></div>; })}</div>
                                        <div className="flex justify-end"><button type="button" onClick={() => setShareCharacterOpen(false)} className="min-h-10 px-4 rounded border border-gray-600 text-gray-300">Volver al lobby</button></div>
                                    </div>}

                                    {((onlineTableView === 'lobby' && !shareCharacterOpen) || onlineTableView === 'preparation' || onlineTableView === 'encounter') && <div className="mt-5 space-y-4">
                                        {onlineTableView === 'lobby' && <div className="rounded border border-cyan-900/70 bg-gray-950/50 p-4 text-center">
                                            <span className="block text-xs uppercase tracking-widest text-gray-500">Código de sala</span>
                                            <strong className="mt-1 block font-mono text-3xl tracking-[0.25em] text-cyan-200">{currentRoom.code}</strong>
                                            <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs ${roomData?.status === 'closed' ? 'border-red-800 bg-red-950/40 text-red-200' : roomData?.status === 'paused' ? 'border-yellow-800 bg-yellow-950/30 text-yellow-200' : 'border-emerald-800 bg-emerald-950/30 text-emerald-200'}`}>{roomData?.status === 'closed' ? 'Sala cerrada' : roomData?.status === 'active' ? 'Encuentro activo' : roomData?.status === 'paused' ? 'Encuentro pausado' : roomData ? 'Lobby' : 'Conectando con la sala…'}</span>
                                        </div>}
                                        {onlineTableView === 'preparation' && (() => {
                                            const missingInitiative = encounterCombatants.filter(participant => !hasInitiativeValue(participant.initiative));
                                            return <section className="rounded border border-cyan-800/70 bg-cyan-950/15 p-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-cyan-200">Preparar encuentro</h4><p className="mt-1 text-xs text-gray-400">Ajusta el orden antes de comenzar. Las iniciativas no cambian.</p></div><button type="button" onClick={() => setEncounterSetupOpen(false)} className="min-h-9 px-3 rounded border border-gray-600 text-xs text-gray-300">Cancelar</button></div>
                                                {missingInitiative.length > 0 && <p className="mt-3 rounded border border-yellow-800 bg-yellow-950/30 px-3 py-2 text-xs text-yellow-100">Falta iniciativa: {missingInitiative.map(participant => participant.name || 'Participante').join(', ')}.</p>}
                                                <div className="mt-3 space-y-2">{preparedTurnOrder.map((id, index) => { const participant = getCombatant(id); if (!participant) return null; return <div key={id} className="flex items-center gap-2 rounded border border-gray-700 bg-gray-900/70 px-2 py-2"><span className="w-6 text-center text-xs font-bold text-cyan-300">{index + 1}</span><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{participant.name || 'Combatiente'}</strong><span className="text-xs text-gray-400">{participant.type === 'enemy' ? 'Enemigo · ' : ''}Iniciativa: {participant.initiative}</span></div><div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => movePreparedParticipant(id, -1)} className="w-9 h-9 rounded border border-gray-600 text-sm text-gray-200 disabled:opacity-30" aria-label={`Subir a ${participant.name}`}>↑</button><button type="button" disabled={index === preparedTurnOrder.length - 1} onClick={() => movePreparedParticipant(id, 1)} className="w-9 h-9 rounded border border-gray-600 text-sm text-gray-200 disabled:opacity-30" aria-label={`Bajar a ${participant.name}`}>↓</button></div></div>; })}</div>
                                                <button type="button" disabled={encounterBusy || missingInitiative.length > 0 || !preparedTurnOrder.length} onClick={startEncounter} className="mt-3 min-h-11 w-full rounded border border-cyan-500 bg-cyan-800 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45">{encounterBusy ? 'Iniciando…' : 'Iniciar encuentro'}</button>
                                            </section>;
                                        })()}
                                        {onlineTableView === 'encounter' && onlineEncounterView === 'encounter' && (() => {
                                            const order = Array.isArray(roomData?.turnOrder) ? roomData.turnOrder : [];
                                            const currentIndex = Math.max(0, Math.min(Number(roomData?.turnIndex) || 0, Math.max(0, order.length - 1)));
                                            const currentId = roomData?.currentTurnId || order[currentIndex];
                                            const nextId = order.length > 1 ? order[(currentIndex + 1) % order.length] : null;
                                            const currentCombatant = getCombatant(currentId);
                                            const selected = getCombatant(selectedCombatantId || currentId);
                                            const selectedIsEnemy = selected?.type === 'enemy';
                                            const selectedPrivate = selectedIsEnemy && canManageEnemies ? privateEnemies.find(item => item.id === selected.id) : null;
                                            const selectedHp = selected ? getHpValues(selectedPrivate || selected) : null;
                                            const canSeeSelectedHp = !!selected && (!selectedIsEnemy ? (isCurrentRoomMaster || selected.ownerUid === firebaseUser?.uid) : !!selectedPrivate);
                                            const canEditSelected = !!selected && (selectedIsEnemy ? canManageEnemies : (isCurrentRoomMaster || selected.ownerUid === firebaseUser?.uid));
                                            const selectedConditions = normalizeOnlineConditions(selectedIsEnemy ? selected?.conditionsVisible : selected?.conditions);
                                            const currentConditions = normalizeOnlineConditions(currentCombatant?.type === 'enemy' ? currentCombatant?.conditionsVisible : currentCombatant?.conditions);
                                            const selectedEffects = encounterEffects.filter(effect => !effect.expired && (effect.targetId === selected?.id || effect.targetId === selected?.ownerUid || effect.targetType === 'global'));
                                            const currentEffects = encounterEffects.filter(effect => !effect.expired && (effect.targetId === currentCombatant?.id || effect.targetId === currentCombatant?.ownerUid || effect.targetType === 'global')).slice(0, 3);
                                            const hpPercent = selectedHp?.maxHp > 0 ? Math.min(100, (selectedHp.currentHp / selectedHp.maxHp) * 100) : 0;
                                            const roster = encounterCombatants.slice().sort((left, right) => {
                                                const leftIndex = order.indexOf(left.id);
                                                const rightIndex = order.indexOf(right.id);
                                                const normalizedLeft = leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex;
                                                const normalizedRight = rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex;
                                                return normalizedLeft - normalizedRight || String(left.name || '').localeCompare(String(right.name || ''));
                                            });
                                            return (
                                                <section className="tactical-encounter-grid" data-mobile-panel={onlineEncounterPanel}>
                                                    <nav className="online-encounter-panel-nav" aria-label="Panel de encuentro"><button type="button" onClick={() => setOnlineEncounterPanel('turn')} className={onlineEncounterPanel === 'turn' ? 'is-active' : ''}>Turno</button><button type="button" onClick={() => setOnlineEncounterPanel('order')} className={onlineEncounterPanel === 'order' ? 'is-active' : ''}>Orden</button><button type="button" onClick={() => { if (!isCurrentRoomMaster && ownRoomParticipant) setSelectedCombatantId(ownRoomParticipant.id); setOnlineEncounterPanel('detail'); }} className={onlineEncounterPanel === 'detail' ? 'is-active' : ''}>{isCurrentRoomMaster ? 'Detalle' : 'Mi PJ'}</button></nav>
                                                <div className="online-encounter-panels">
                                                <div className="tactical-turn-panel rounded border border-purple-700 bg-purple-950/25 p-3">
                                                    <div className="flex items-start gap-3">
                                                        <OnlineCombatantAvatar combatant={currentCombatant} className="h-12 w-12 text-lg" />
                                                        <div className="min-w-0 flex-1">
                                                            <span className="text-[10px] font-bold uppercase text-purple-200">Turno actual - Ronda {roomData?.round || 1}</span>
                                                            <strong className="mt-1 block truncate text-xl text-white">{currentCombatant?.name || 'Sin turno'}</strong>
                                                            <p className="mt-1 text-xs text-gray-400">Siguiente: {nextId ? participantName(nextId) : '-'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-1">
                                                        {currentConditions.map(condition => <span key={condition.id} className="rounded border border-red-900 px-1.5 py-0.5 text-[10px] text-red-100">{condition.name}</span>)}
                                                        {!currentConditions.length && <span className="text-xs text-gray-500">Sin condiciones activas.</span>}
                                                    </div>
                                                    {currentEffects.length > 0 && <div className="mt-2 space-y-1">{currentEffects.map(effect => <div key={effect.id} className="flex justify-between gap-2 text-xs text-gray-300"><span className="truncate">{effect.name}</span><span>{effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType}`}</span></div>)}</div>}
                                                    <div className="mt-4 border-t border-purple-900/70 pt-3">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-purple-100">Orden de iniciativa</h4>
                                                            <span className="text-[10px] text-gray-500">{order.length} combatientes</span>
                                                        </div>
                                                        <div className="tactical-initiative-list mt-2 space-y-1.5">
                                                            {order.map((id, index) => {
                                                                const combatant = getCombatant(id);
                                                                const isCurrent = id === currentId;
                                                                const isOwn = combatant?.ownerUid === firebaseUser?.uid;
                                                                return <button type="button" key={`initiative-${id}-${index}`} onClick={() => setSelectedCombatantId(id)} className={`tactical-initiative-row flex w-full items-center gap-2 rounded border border-gray-700 bg-gray-900/60 px-2 text-left ${isCurrent ? 'tactical-initiative-row--current' : selected?.id === id ? 'border-purple-500 bg-purple-950/25' : ''}`}><span className="w-5 text-center text-xs font-bold text-gray-500">{index + 1}</span><OnlineCombatantAvatar combatant={combatant} className="h-8 w-8 text-xs" /><span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{combatant?.name || 'Combatiente'}{isOwn ? ' - Tu' : ''}</span><span className="shrink-0 text-xs text-cyan-200">{hasInitiativeValue(combatant?.initiative) ? combatant.initiative : '-'}</span></button>;
                                                            })}
                                                            {!order.length && <p className="text-xs text-gray-500">Aun no hay orden de iniciativa.</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isCurrentRoomMaster && <div className="tactical-controls rounded border border-gray-700 bg-gray-950/45 p-3"><div className="flex flex-wrap gap-2">{isCurrentRoomMaster && <button type="button" onClick={() => openEnemyModal()} className="tactical-add-enemy min-h-11 rounded border border-purple-700 px-3 text-xs font-bold text-purple-100">+ Añadir enemigo</button>}<button type="button" disabled={encounterBusy || roomData?.status !== 'active'} onClick={() => changeEncounterTurn(-1)} className="min-h-11 flex-1 rounded border border-gray-600 px-3 text-xs text-gray-200 disabled:opacity-40">Anterior</button><button type="button" disabled={encounterBusy || roomData?.status !== 'active'} onClick={() => changeEncounterTurn(1)} className="min-h-11 flex-[1.35] rounded border border-cyan-700 bg-cyan-950/30 px-3 text-xs font-bold text-cyan-100 disabled:opacity-40">Siguiente</button><div className="relative"><button type="button" onClick={() => setEncounterActionsOpen(previous => !previous)} className="min-h-11 w-11 rounded border border-gray-600 text-lg text-gray-200" aria-label="Más controles de encuentro" aria-expanded={encounterActionsOpen}>...</button>{encounterActionsOpen && <div className="absolute right-0 top-12 z-20 w-48 rounded border border-gray-600 bg-gray-950 p-1.5 shadow-xl"><button type="button" disabled={encounterBusy || roomData?.status !== 'active'} onClick={() => { setPostponeOpen(true); setEncounterActionsOpen(false); }} className="w-full rounded px-3 py-2 text-left text-xs text-purple-100 hover:bg-purple-950/30 disabled:opacity-40">Postergar</button><button type="button" disabled={encounterBusy} onClick={() => { setEncounterStatus(roomData?.status === 'active' ? 'paused' : 'active'); setEncounterActionsOpen(false); }} className="w-full rounded px-3 py-2 text-left text-xs text-yellow-100 hover:bg-yellow-950/30 disabled:opacity-40">{roomData?.status === 'active' ? 'Pausar' : 'Reanudar'}</button><button type="button" disabled={encounterBusy} onClick={() => { setFinishEncounterPrompt(true); setEncounterActionsOpen(false); }} className="w-full rounded px-3 py-2 text-left text-xs text-red-200 hover:bg-red-950/30 disabled:opacity-40">Finalizar encuentro</button></div>}</div></div></div>}
                                                </div>
                                                <div className="tactical-order-panel rounded border border-gray-700 bg-gray-950/40 p-3">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div>
                                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-gray-300">Combatientes</h4>
                                                            <p className="mt-1 text-[10px] text-gray-500">Jugadores y enemigos</p>
                                                        </div>
                                                        {isCurrentRoomMaster && <button type="button" onClick={() => openEnemyModal()} className="min-h-9 px-2 rounded border border-orange-700 text-[10px] text-orange-100">+ A&ntilde;adir entidad</button>}
                                                    </div>
                                                    <div className="tactical-roster-list mt-3 space-y-1.5 pr-1">
                                                        {roster.map(combatant => {
                                                            const isEnemy = combatant.type === 'enemy';
                                                            const isCurrent = combatant.id === currentId;
                                                            const isSelected = combatant.id === selected?.id;
                                                            const isOwn = combatant.ownerUid === firebaseUser?.uid;
                                                            const connected = isEnemy || combatant.connected !== false;
                                                            const state = isEnemy ? (combatant.defeated ? 'Derrotado' : combatant.visibleState || 'oculto') : (connected ? 'Conectado' : 'Desconectado');
                                                            return <button type="button" key={`roster-${combatant.id}`} onClick={() => setSelectedCombatantId(combatant.id)} className={`tactical-roster-row flex w-full items-center gap-2 rounded border bg-gray-900/60 px-2 text-left ${isEnemy ? 'tactical-roster-row--enemy' : 'tactical-roster-row--player'} ${combatant.defeated ? 'tactical-roster-row--defeated' : ''} ${isCurrent ? 'border-cyan-400 bg-cyan-950/30' : isSelected ? 'border-purple-500 bg-purple-950/25' : ''}`}><OnlineCombatantAvatar combatant={combatant} className="h-9 w-9 text-xs" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{combatant.name || 'Combatiente'}{isOwn ? ' - Tu' : ''}</strong><span className={`block truncate text-[10px] ${isEnemy ? 'text-orange-200' : 'text-cyan-200'}`}>{isEnemy ? 'Enemigo' : 'Jugador'} - {state}</span></span><span className="shrink-0 text-right text-xs text-gray-300"><span className="block text-[9px] uppercase text-gray-500">Ini</span>{hasInitiativeValue(combatant.initiative) ? combatant.initiative : '-'}</span></button>;
                                                        })}
                                                        {!roster.length && <p className="text-xs text-gray-500">No hay combatientes.</p>}
                                                    </div>
                                                </div>
                                                <div className="tactical-detail-panel rounded border border-cyan-800 bg-cyan-950/15 p-3"><span className="text-[10px] font-bold uppercase text-cyan-300">Detalle</span>{selected && <div className="mt-2 flex justify-center"><OnlineCombatantAvatar combatant={selected} className="h-20 w-20 text-2xl" /></div>}{selected ? <><div className="mt-1 flex flex-wrap items-start justify-between gap-2"><div><strong className="block text-lg text-white">{selected.name}</strong><span className="text-xs text-gray-400">Iniciativa {selected.initiative ?? '—'}{selectedIsEnemy ? ` · ${selected.visibleState || 'oculto'}` : ` · ${selected.ownerUid === firebaseUser?.uid ? 'Tú' : 'Jugador'}`}</span></div>{selectedIsEnemy && canManageEnemies && <div className="flex gap-1"><button type="button" onClick={() => openEnemyModal(selected)} className="min-h-9 px-2 rounded border border-gray-600 text-[10px] text-gray-200">Editar</button><button type="button" onClick={() => confirmDelete(`¿Eliminar a ${selected.name}?`, () => deleteEnemy(selected.id))} className="min-h-9 px-2 rounded border border-red-900 text-[10px] text-red-200">Eliminar</button></div>}</div>{canSeeSelectedHp && selectedHp && <div className="mt-3 rounded border border-red-900/70 bg-red-950/15 p-2"><div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-200"><span>PV <b>{selectedHp.currentHp}</b> / {selectedHp.maxHp}{selectedHp.tempHp > 0 ? ` · Temporal ${selectedHp.tempHp}` : ''}</span>{selectedIsEnemy && selectedPrivate && <span>CA {selectedPrivate.armorClass ?? '—'}</span>}{!selectedIsEnemy && <span>CA {selected.armorClass ?? '—'}</span>}</div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-950"><div className="h-full bg-red-500" style={{ width: `${hpPercent}%` }}></div></div>{canEditSelected && <div className="mt-2 flex flex-wrap gap-1">{selectedIsEnemy ? <><button type="button" onClick={() => setEnemyHpModal({ isOpen: true, enemyId: selected.id, mode: 'damage', amount: '' })} className="min-h-9 px-2 rounded border border-red-800 text-[10px] text-red-100">Modificar vida</button><button type="button" onClick={() => updateEnemyHp(selected, { currentHp: 0 }).catch(() => setOnlineTableError('No se pudo marcar el enemigo como derrotado.'))} className="min-h-9 px-2 rounded border border-orange-800 text-[10px] text-orange-100">Derrotado</button></> : <><button type="button" onClick={() => updateParticipantHp(selected, { currentHp: Math.max(0, selectedHp.currentHp - 1) }, isCurrentRoomMaster ? 'master' : 'player').catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.'))} className="w-9 h-9 rounded border border-gray-600 text-gray-200">-</button><button type="button" onClick={() => openParticipantHpModal(selected)} className="min-h-9 px-2 rounded border border-red-800 text-[10px] text-red-100">Modificar vida</button><button type="button" onClick={() => updateParticipantHp(selected, { currentHp: Math.min(selectedHp.maxHp, selectedHp.currentHp + 1) }, isCurrentRoomMaster ? 'master' : 'player').catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.'))} className="w-9 h-9 rounded border border-gray-600 text-gray-200">+</button></>}</div>}</div>}{selectedIsEnemy && canManageEnemies && selectedPrivate?.notes && <p className="mt-2 whitespace-pre-wrap text-xs text-gray-500">{selectedPrivate.notes}</p>}<div className="mt-3"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase text-purple-200">Condiciones</span>{canEditSelected && <button type="button" onClick={() => openConditionModal(selected)} className="min-h-8 px-2 rounded border border-purple-700 text-[10px] text-purple-100">Añadir</button>}</div><div className="mt-1 flex flex-wrap gap-1">{selectedConditions.map(condition => <span key={condition.id} className="inline-flex items-center gap-1 rounded border border-red-900 px-1.5 py-0.5 text-[10px] text-red-100">{condition.name}{canEditSelected && <button type="button" onClick={() => removeOnlineCondition(selected, condition.id)} aria-label={`Quitar ${condition.name}`}>×</button>}</span>)}{!selectedConditions.length && <span className="text-xs text-gray-500">Sin condiciones.</span>}</div></div><div className="mt-3"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase text-cyan-300">Efectos</span>{canEditSelected && <button type="button" onClick={() => openEffectModal()} className="min-h-8 px-2 rounded border border-cyan-700 text-[10px] text-cyan-100">Añadir</button>}</div><div className="mt-1 space-y-1">{selectedEffects.map(effect => <div key={effect.id} className="flex items-center justify-between gap-2 text-xs text-gray-300"><span className="min-w-0 flex-1 truncate">{effect.name}</span><span className="shrink-0">{effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType}`}</span>{canManageEffect(effect) && <span className="flex shrink-0 gap-1">{effect.remaining !== null && <><button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.remaining) - 1)} className="h-8 w-8 rounded border border-gray-600 text-gray-200">-</button><button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.remaining) + 1)} className="h-8 w-8 rounded border border-gray-600 text-gray-200">+</button></>}<button type="button" onClick={() => deleteEffect(effect)} className="min-h-8 px-2 rounded border border-red-800 text-[10px] text-red-100">Finalizar</button></span>}</div>)}{!selectedEffects.length && <span className="text-xs text-gray-500">Sin efectos activos.</span>}</div></div></> : <p className="mt-2 text-sm text-gray-500">Selecciona un combatiente.</p>}</div>
                                                </section>
                                            );
                                        })()}
                                        {onlineTableView === 'encounter' && onlineEncounterView === 'participants' && isCurrentRoomMaster && (
                                            <section className="rounded border border-purple-800 bg-purple-950/15 p-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div><h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-purple-200">Participantes</h4><p className="mt-1 text-xs text-gray-500">Estado administrativo de la mesa.</p></div>
                                                    <button type="button" onClick={() => openEnemyModal()} className="min-h-10 px-3 rounded border border-orange-700 text-xs text-orange-100">Añadir enemigo</button>
                                                </div>
                                                <div className="mt-3 space-y-1.5">
                                                    {roomMembers.map(member => {
                                                        const participant = roomParticipants.find(item => item.ownerUid === member.uid);
                                                        const name = participant?.name || member.displayName || (member.role === 'master' ? 'Máster' : 'Jugador');
                                                        const connection = member.active && (participant ? participant.connected !== false : true) ? 'Conectado' : 'Desconectado';
                                                        return (
                                                            <div key={member.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-700 bg-gray-900/60 px-3 py-2">
                                                                <div className="min-w-0"><strong className="block truncate text-sm text-white">{name}</strong><span className="text-xs text-gray-400">{member.role === 'master' ? 'Máster' : 'Jugador'} · {participant ? 'Personaje compartido' : 'Sin personaje'} · {connection}</span></div>
                                                                {participant && <button type="button" onClick={() => { setSelectedCombatantId(participant.id); setOnlineEncounterView('encounter'); }} className="min-h-9 px-2 rounded border border-gray-600 text-[10px] text-gray-200">Ver detalle</button>}
                                                            </div>
                                                        );
                                                    })}
                                                    {!roomMembers.length && <p className="text-sm text-gray-500">No hay miembros activos.</p>}
                                                </div>
                                                <div className="mt-4 border-t border-orange-900/60 pt-3">
                                                    <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-orange-200">Enemigos</h4>
                                                    <div className="mt-2 space-y-1.5">
                                                        {publicCombatants.map(enemy => (
                                                            <div key={enemy.id} className="flex items-center justify-between gap-2 rounded border border-gray-700 bg-gray-900/60 px-3 py-2">
                                                                <div className="min-w-0"><strong className="block truncate text-sm text-white">{enemy.name}</strong><span className="text-xs text-gray-400">Iniciativa {enemy.initiative ?? '—'} · {enemy.visibleState || 'oculto'}</span></div>
                                                                <div className="flex gap-1"><button type="button" onClick={() => { setSelectedCombatantId(enemy.id); setOnlineEncounterView('encounter'); }} className="min-h-9 px-2 rounded border border-orange-700 text-[10px] text-orange-100">Gestionar</button><button type="button" onClick={() => openEnemyDuplicateModal(enemy)} className="min-h-9 px-2 rounded border border-purple-700 text-[10px] text-purple-100">Duplicar</button></div>
                                                            </div>
                                                        ))}
                                                        {!publicCombatants.length && <p className="text-sm text-gray-500">No hay enemigos añadidos.</p>}
                                                    </div>
                                                </div>
                                            </section>
                                        )}
                                        {onlineTableView === 'encounter' && onlineEncounterView === 'effects' && (() => {
                                            const activeEffects = encounterEffects.filter(effect => !effect.expired).slice().sort((left, right) => (left.remaining ?? Infinity) - (right.remaining ?? Infinity));
                                            const expiredEffects = encounterEffects.filter(effect => effect.expired);
                                            const canAddEffect = isCurrentRoomMaster || !!ownRoomParticipant;
                                            const renderEffect = effect => { const target = effect.targetType === 'global' ? null : getCombatant(effect.targetId); const canEdit = canManageEffect(effect); return <div key={effect.id} className="rounded border border-gray-700 bg-gray-900/60 p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><strong className="block text-sm text-white">{effect.name}{(effect.requiresConcentration || effect.concentration) && <span className="ml-2 text-[10px] uppercase text-purple-200">Concentración</span>}</strong><span className="block text-xs text-gray-400">{target?.name || (effect.targetType === 'global' ? 'Global' : 'Objetivo eliminado')} · {effect.expired ? 'Expirado' : effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType}`}</span>{effect.notesPublic && <span className="block text-xs text-gray-500">{effect.notesPublic}</span>}</div>{canEdit && <div className="flex flex-wrap gap-1">{effect.remaining !== null && <><button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.remaining) - 1)} className="h-9 w-9 rounded border border-gray-600 text-gray-200">-</button><button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.remaining) + 1)} className="h-9 w-9 rounded border border-gray-600 text-gray-200">+</button></>}{effect.expired && Number.isFinite(Number(effect.maximum)) && <button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.maximum))} className="min-h-9 px-2 rounded border border-cyan-700 text-[10px] text-cyan-100">Reiniciar</button>}<button type="button" onClick={() => deleteEffect(effect)} className="min-h-9 px-2 rounded border border-red-800 px-2 text-[10px] text-red-100">Finalizar</button>{effect.expired && <button type="button" onClick={() => confirmDelete(`¿Eliminar el efecto ${effect.name}?`, () => permanentlyDeleteEffect(effect))} className="min-h-9 px-2 rounded border border-gray-600 text-[10px] text-gray-300">Eliminar</button>}</div>}</div></div>; };
                                            return <section className="rounded border border-cyan-800 bg-cyan-950/15 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-cyan-200">Efectos</h4><p className="mt-1 text-xs text-gray-500">Activos primero; los expirados permanecen plegados.</p></div>{canAddEffect && <button type="button" onClick={() => openEffectModal()} className="min-h-10 px-3 rounded border border-cyan-700 text-xs text-cyan-100">Añadir efecto</button>}</div><div className="mt-3 space-y-2">{activeEffects.map(renderEffect)}{!activeEffects.length && <p className="text-sm text-gray-500">No hay efectos activos.</p>}</div><div className="mt-4 border-t border-gray-700 pt-3"><button type="button" onClick={() => setExpiredEffectsOpen(previous => !previous)} className="min-h-10 w-full rounded border border-gray-700 px-3 text-left text-xs text-gray-300" aria-expanded={expiredEffectsOpen}>Efectos expirados ({expiredEffects.length})</button>{expiredEffectsOpen && <div className="mt-2 space-y-2">{expiredEffects.map(renderEffect)}{!expiredEffects.length && <p className="text-xs text-gray-500">No hay efectos expirados.</p>}</div>}</div></section>
                                        ;})()}
                                        {false && onlineTableView === 'encounter' && (() => {
                                            const order = Array.isArray(roomData?.turnOrder) ? roomData.turnOrder : [];
                                            const currentIndex = Math.max(0, Math.min(Number(roomData?.turnIndex) || 0, Math.max(0, order.length - 1)));
                                            const currentId = roomData?.currentTurnId || order[currentIndex];
                                            const nextId = order.length > 1 ? order[(currentIndex + 1) % order.length] : null;
                                            return <section className="rounded border border-purple-700 bg-purple-950/25 p-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-purple-200">Encuentro · Ronda {roomData?.round || 1}</h4><p className="mt-1 text-xs text-gray-400">{roomData?.status === 'paused' ? 'Pausado · ' : ''}Turno: {participantName(currentId)}{nextId ? ` · Siguiente: ${participantName(nextId)}` : ''}</p></div><span className={`rounded border px-2 py-1 text-[10px] font-bold uppercase ${roomData?.status === 'paused' ? 'border-yellow-800 bg-yellow-950/30 text-yellow-200' : 'border-emerald-800 bg-emerald-950/30 text-emerald-200'}`}>{roomData?.status === 'paused' ? 'Pausado' : 'Activo'}</span></div>
                                                {(() => { const selected = getCombatant(selectedCombatantId || currentId); const selectedEffects = encounterEffects.filter(effect => effect.targetId === selected?.id || effect.targetId === selected?.ownerUid); return <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]"><div className="rounded border border-cyan-800 bg-cyan-950/20 p-3"><span className="text-[10px] font-bold uppercase text-cyan-300">Combatiente seleccionado</span><strong className="mt-1 block text-lg text-white">{selected?.name || 'Selecciona un combatiente'}</strong>{selected && <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-300"><span>Iniciativa {selected.initiative ?? '—'}</span>{selected.type === 'enemy' ? <span className="capitalize text-orange-200">{selected.visibleState || 'oculto'}</span> : <span>{selected.ownerUid === firebaseUser?.uid ? 'Tú' : 'Jugador'}</span>}</div>}<div className="mt-2 flex flex-wrap gap-1">{normalizeOnlineConditions(selected?.type === 'enemy' ? selected?.conditionsVisible : selected?.conditions).map(condition => <span key={condition.id} className="rounded border border-red-900 px-1.5 py-0.5 text-[10px] text-red-100">{condition.name}</span>)}</div></div><div className="rounded border border-gray-700 bg-gray-950/40 p-3"><span className="text-[10px] font-bold uppercase text-gray-400">Efectos relevantes</span><div className="mt-2 space-y-1">{selectedEffects.filter(effect => !effect.expired).slice(0, 3).map(effect => <div key={effect.id} className="flex justify-between gap-2 text-xs text-gray-300"><span className="truncate">{effect.name}</span><span>{effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType}`}</span></div>)}{!selectedEffects.filter(effect => !effect.expired).length && <p className="text-xs text-gray-500">Sin efectos activos.</p>}</div></div></div>; })()}
                                                <div className="online-turn-order mt-3 space-y-1.5 overflow-y-auto pr-1">{order.map((id, index) => { const participant = getCombatant(id); const active = id === currentId; return <button type="button" key={`${id}-${index}`} onClick={() => setSelectedCombatantId(id)} className={`flex w-full items-center gap-3 rounded border px-3 py-2 text-left ${active ? 'border-cyan-400 bg-cyan-950/45 shadow-[0_0_12px_rgba(34,211,238,0.16)]' : selectedCombatantId === id ? 'border-purple-500 bg-purple-950/25' : 'border-gray-700 bg-gray-900/60'}`}><span className={`w-6 text-center text-xs font-bold ${active ? 'text-cyan-200' : 'text-gray-500'}`}>{index + 1}</span><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{participant?.name || 'Participante'}{participant?.ownerUid === firebaseUser?.uid ? ' (Tú)' : ''}</strong><span className="text-xs text-gray-400">{participant?.type === 'enemy' ? `${participant.visibleState || 'oculto'} · ` : ''}Iniciativa: {hasInitiativeValue(participant?.initiative) ? participant.initiative : '—'}</span></div>{active && <span className="shrink-0 text-[10px] font-bold uppercase text-cyan-200">Turno actual</span>}</button>; })}</div>
                                                {isCurrentRoomMaster && <div className="mt-3 flex flex-wrap gap-2 border-t border-purple-900/70 pt-3"><button type="button" disabled={encounterBusy || roomData?.status !== 'active'} onClick={() => changeEncounterTurn(-1)} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200 disabled:opacity-40">Turno anterior</button><button type="button" disabled={encounterBusy || roomData?.status !== 'active'} onClick={() => changeEncounterTurn(1)} className="min-h-10 px-3 rounded border border-cyan-700 bg-cyan-950/30 text-xs text-cyan-100 disabled:opacity-40">Siguiente turno</button><button type="button" disabled={encounterBusy || roomData?.status !== 'active'} onClick={() => setPostponeOpen(true)} className="min-h-10 px-3 rounded border border-purple-700 text-xs text-purple-100 disabled:opacity-40">Postergar</button>{roomData?.status === 'active' ? <button type="button" disabled={encounterBusy} onClick={() => setEncounterStatus('paused')} className="min-h-10 px-3 rounded border border-yellow-800 text-xs text-yellow-100 disabled:opacity-40">Pausar</button> : <button type="button" disabled={encounterBusy} onClick={() => setEncounterStatus('active')} className="min-h-10 px-3 rounded border border-emerald-800 text-xs text-emerald-100 disabled:opacity-40">Reanudar</button>}<button type="button" disabled={encounterBusy} onClick={() => setFinishEncounterPrompt(true)} className="min-h-10 px-3 rounded border border-red-800 text-xs text-red-200 disabled:opacity-40">Finalizar encuentro</button></div>}
                                            </section>
                                        })()}
                                        {postponeOpen && roomData?.status === 'active' && <section className="rounded border border-purple-700 bg-gray-950/70 p-3"><div className="flex items-center justify-between gap-3"><h4 className="font-fantasy text-sm font-bold text-purple-200">Postergar turno</h4><button type="button" onClick={() => setPostponeOpen(false)} className="w-9 h-9 rounded border border-gray-600 text-gray-300" aria-label="Cerrar">×</button></div><p className="mt-1 text-xs text-gray-400">Elige la nueva posición de {participantName(roomData?.currentTurnId)}.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={encounterBusy} onClick={() => postponeCurrentTurn('after-next')} className="min-h-10 px-3 rounded border border-purple-700 text-xs text-purple-100">Después del siguiente</button><button type="button" disabled={encounterBusy} onClick={() => postponeCurrentTurn('end')} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200">Al final de la ronda</button></div><div className="mt-3 grid grid-cols-1 gap-1">{(roomData?.turnOrder || []).filter(id => id !== roomData?.currentTurnId).map(id => <button key={id} type="button" disabled={encounterBusy} onClick={() => postponeCurrentTurn('before', id)} className="min-h-9 rounded border border-gray-700 px-3 text-left text-xs text-gray-300 hover:border-purple-500">Antes de {participantName(id)}</button>)}</div></section>}
                                        {onlineTableView === 'encounter' && onlineEncounterView === 'encounter' && isCurrentRoomMaster && (() => {
                                            const turnOrder = Array.isArray(roomData?.turnOrder) ? roomData.turnOrder : [];
                                            const outsideEnemies = publicCombatants.filter(enemy => !turnOrder.includes(enemy.id));
                                            const selectedEnemyIds = outsideEncounterEnemyIds.filter(id => outsideEnemies.some(enemy => enemy.id === id && !enemy.defeated));
                                            if (!outsideEnemies.length) return null;
                                            const toggleEnemy = (enemyId, checked) => setOutsideEncounterEnemyIds(previous => checked ? [...new Set([...previous, enemyId])] : previous.filter(id => id !== enemyId));
                                            return (
                                                <section className="rounded border border-orange-800 bg-orange-950/15 p-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div>
                                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-orange-200">Fuera del encuentro</h4>
                                                            <p className="mt-1 text-xs text-gray-400">Enemigos creados que todavía no forman parte del orden.</p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                type="button"
                                                                disabled={encounterBusy || !selectedEnemyIds.length}
                                                                onClick={() => addEnemyIdsAfterCurrent(selectedEnemyIds)}
                                                                className="min-h-10 rounded border border-orange-700 px-3 text-xs text-orange-100 disabled:opacity-40"
                                                            >
                                                                Añadir después del turno
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={encounterBusy || !selectedEnemyIds.length}
                                                                onClick={() => addEnemyIdsAtEnd(selectedEnemyIds)}
                                                                className="min-h-10 rounded border border-gray-600 px-3 text-xs text-gray-200 disabled:opacity-40"
                                                            >
                                                                Añadir al final
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 space-y-2">
                                                        {outsideEnemies.map(enemy => (
                                                            <div key={enemy.id} className="flex flex-wrap items-center gap-2 rounded border border-gray-700 bg-gray-900/60 px-3 py-2">
                                                                <label className="flex min-h-10 min-w-10 items-center justify-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedEnemyIds.includes(enemy.id)}
                                                                        disabled={enemy.defeated}
                                                                        onChange={event => toggleEnemy(enemy.id, event.target.checked)}
                                                                        aria-label={`Seleccionar ${enemy.name}`}
                                                                    />
                                                                </label>
                                                                <div className="min-w-0 flex-1">
                                                                    <strong className="block truncate text-sm text-white">{enemy.name}</strong>
                                                                    <span className="text-xs text-gray-400">Iniciativa {enemy.initiative ?? '—'} · {enemy.defeated ? 'Derrotado' : enemy.visibleState || 'oculto'}</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {!enemy.defeated && <><button type="button" disabled={encounterBusy} onClick={() => addEnemyIdsAfterCurrent([enemy.id])} className="min-h-9 rounded border border-orange-700 px-2 text-[10px] text-orange-100 disabled:opacity-40">Después del turno</button>
                                                                    <button type="button" disabled={encounterBusy} onClick={() => addEnemyIdsAtEnd([enemy.id])} className="min-h-9 rounded border border-gray-600 px-2 text-[10px] text-gray-200 disabled:opacity-40">Al final</button></>}
                                                                    {enemy.defeated && <button type="button" disabled={encounterBusy} onClick={() => { const privateData = privateEnemies.find(item => item.id === enemy.id); if (privateData) updateEnemyHp(enemy, { currentHp: getHpValues(privateData).maxHp }).catch(() => setOnlineTableError('No se pudo curar el enemigo.')); }} className="min-h-9 rounded border border-emerald-800 px-2 text-[10px] text-emerald-100 disabled:opacity-40">Curar</button>}
                                                                    <button type="button" onClick={() => openEnemyModal(enemy)} className="min-h-9 rounded border border-gray-600 px-2 text-[10px] text-gray-200">Editar</button>
                                                                    <button type="button" onClick={() => confirmDelete(`¿Eliminar a ${enemy.name}?`, () => deleteEnemy(enemy.id))} className="min-h-9 rounded border border-red-900 px-2 text-[10px] text-red-200">Eliminar</button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            );
                                        })()}
                                        {onlineTableView === 'lobby' && <section>
                                            <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-gray-300">Miembros de la mesa</h4><p className="mt-1 text-xs text-gray-500">Personaje, conexión e iniciativa en una sola lista.</p></div>{isCurrentRoomMaster && <button type="button" disabled={!encounterCombatants.length} onClick={buildPreparedTurnOrder} className="min-h-10 px-3 rounded border border-cyan-700 bg-cyan-950/30 text-xs text-cyan-100 disabled:opacity-40">Preparar encuentro</button>}</div>
                                            <div className="mt-3 space-y-2">{roomMembers.map(member => { const participant = roomParticipants.find(item => item.ownerUid === member.uid); const isMaster = member.role === 'master'; const connected = !!(member.active && (participant ? participant.connected !== false : true)); const hasInitiative = participant && hasInitiativeValue(participant.initiative); const canEditInitiative = !!participant && (isCurrentRoomMaster || participant.ownerUid === firebaseUser?.uid); const displayName = participant?.name || member.displayName || (isMaster ? 'Máster' : 'Jugador'); return <div key={member.id} className={`rounded border p-3 ${connected ? 'border-gray-700 bg-gray-900/60' : 'border-gray-800 bg-gray-950/40 text-gray-500'}`}><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{displayName}{member.uid === firebaseUser?.uid ? ' (Tú)' : ''}</strong><div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs"><span className={`font-bold ${isMaster ? 'text-yellow-300' : 'text-cyan-300'}`}>{isMaster ? 'Máster' : 'Jugador'}</span><span className="text-gray-400">{participant ? 'Personaje compartido' : 'Sin personaje'}</span><span className={connected ? 'text-emerald-300' : 'text-gray-500'}>{connected ? 'Conectado' : 'Desconectado'}</span><span className={hasInitiative ? 'text-cyan-300' : 'text-yellow-300'}>{hasInitiative ? `Iniciativa ${participant.initiative} · Listo` : 'Sin iniciativa · No listo'}</span></div></div>{canEditInitiative && <label className="flex shrink-0 items-center gap-2 text-xs text-gray-400">Iniciativa<input type="number" inputMode="numeric" value={participantInitiativeDrafts[participant.id] ?? participant.initiative ?? ''} onChange={event => setParticipantInitiativeDrafts(previous => ({ ...previous, [participant.id]: event.target.value }))} onBlur={() => commitParticipantInitiative(participant)} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} className="h-10 w-20 rounded border border-gray-600 bg-gray-950 px-2 text-center text-base font-bold text-white outline-none focus:border-cyan-400" aria-label={`Iniciativa de ${participant.name || 'participante'}`} /></label>}</div></div>; })}{!roomMembers.length && <p className="text-sm text-gray-500">Cargando miembros…</p>}</div>
                                        </section>}
                                        {false && onlineTableView === 'encounter' && <section className="rounded border border-purple-900/70 bg-purple-950/10 p-3">
                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-purple-200">Condiciones</h4>
                                            <div className="mt-3 space-y-2">{encounterCombatants.map(target => { const isEnemy = target.type === 'enemy'; const items = normalizeOnlineConditions(isEnemy ? target.conditionsVisible : target.conditions); const canEdit = canManageEnemies || (!isEnemy && target.ownerUid === firebaseUser?.uid); return <div key={`conditions-${target.id}`} className="rounded border border-gray-700 bg-gray-900/50 p-2"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs text-gray-200">{target.name}</strong>{canEdit && <button type="button" onClick={() => openConditionModal(target)} className="min-h-8 px-2 rounded border border-purple-700 text-[10px] text-purple-100">Añadir condición</button>}</div><div className="mt-2 flex flex-wrap gap-1">{items.map(condition => <span key={condition.id} className="inline-flex items-center gap-1 rounded border border-red-900 bg-red-950/40 px-1.5 py-0.5 text-[10px] text-red-100">{condition.name}{canEdit && <button type="button" onClick={() => removeOnlineCondition(target, condition.id)} className="text-red-200" aria-label={`Quitar ${condition.name}`}>×</button>}</span>)}{!items.length && <span className="text-xs text-gray-500">Sin condiciones</span>}</div></div>; })}</div>
                                        </section>}
                                        {false && onlineTableView === 'encounter' && <section className="rounded border border-cyan-900/70 bg-cyan-950/10 p-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-cyan-200">Efectos activos</h4><p className="mt-1 text-xs text-gray-500">Duraciones compartidas del encuentro.</p></div><button type="button" onClick={() => openEffectModal()} className="min-h-10 px-3 rounded border border-cyan-700 text-xs text-cyan-100">Añadir efecto</button></div>
                                            <div className="mt-3 space-y-2">{encounterEffects.slice().sort((a, b) => Number(a.expired) - Number(b.expired) || (a.remaining ?? Infinity) - (b.remaining ?? Infinity)).map(effect => { const target = effect.targetType === 'global' ? null : getCombatant(effect.targetId); const canEdit = canManageEffect(effect); const hasMaximum = Number.isFinite(Number(effect.maximum)) && Number(effect.maximum) >= 0; return <div key={effect.id} className={`rounded border p-3 ${effect.expired ? 'border-gray-800 bg-gray-950/40 text-gray-500' : 'border-cyan-900 bg-gray-900/60'}`}><div className="flex flex-wrap items-start justify-between gap-2"><div><strong className="block text-sm text-white">{effect.name}{(effect.requiresConcentration || effect.concentration) && <span className="ml-2 text-[10px] uppercase text-purple-200">Concentración</span>}</strong><span className="text-xs text-gray-400">{target?.name || (effect.targetType === 'global' ? 'Global' : 'Objetivo eliminado')} · {effect.expired ? 'Expirado' : effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType} restantes`}</span>{effect.notesPublic && <span className="block text-xs text-gray-500">{effect.notesPublic}</span>}</div>{canEdit && <div className="flex flex-wrap items-center gap-1">{effect.remaining !== null && <><button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.remaining) - 1)} className="w-8 h-8 rounded border border-gray-600 text-gray-200">−</button><span className="min-w-10 text-center text-xs">{effect.remaining}</span><button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.remaining) + 1)} className="w-8 h-8 rounded border border-gray-600 text-gray-200">+</button></>}{effect.expired && hasMaximum && <button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.maximum))} className="min-h-8 px-2 rounded border border-cyan-700 text-[10px] text-cyan-100">Reiniciar</button>}<button type="button" onClick={() => deleteEffect(effect)} className="min-h-8 px-2 rounded border border-red-800 text-[10px] text-red-100">{(effect.requiresConcentration || effect.concentration) ? 'Finalizar concentración' : 'Finalizar'}</button>{effect.expired && <button type="button" onClick={() => confirmDelete(`¿Eliminar el efecto ${effect.name}?`, () => permanentlyDeleteEffect(effect))} className="min-h-8 px-2 rounded border border-gray-700 text-[10px] text-gray-300">Eliminar</button>}</div>}</div></div>; })}{!encounterEffects.length && <p className="text-sm text-gray-500">No hay efectos activos.</p>}</div>
                                        </section>}
                                        {onlineTableView === 'preparation' && <section className="rounded border border-orange-900/70 bg-orange-950/10 p-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-orange-200">Enemigos</h4><p className="mt-1 text-xs text-gray-500">{canManageEnemies ? 'Datos privados visibles solo para el Máster.' : 'Estado visible del encuentro.'}</p></div>{canManageEnemies && <button type="button" onClick={() => openEnemyModal()} className="min-h-10 px-3 rounded border border-orange-700 bg-orange-950/30 text-xs text-orange-100">Añadir enemigo</button>}</div>
                                            <div className="mt-3 space-y-2">{publicCombatants.map(enemy => { const privateData = canManageEnemies ? privateEnemies.find(item => item.id === enemy.id) : null; const values = privateData ? getHpValues(privateData) : null; const percent = values?.maxHp > 0 ? Math.min(100, (values.currentHp / values.maxHp) * 100) : 0; return <div key={enemy.id} className="rounded border border-gray-700 bg-gray-900/60 p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><strong className="block truncate text-sm text-white">{enemy.name}</strong><span className="block text-xs text-gray-400">Iniciativa: {enemy.initiative} · <b className="capitalize text-orange-200">{enemy.visibleState || 'oculto'}</b></span>{Array.isArray(enemy.conditionsVisible) && enemy.conditionsVisible.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{normalizeOnlineConditions(enemy.conditionsVisible).map(condition => <span key={condition.id} className="rounded border border-yellow-800 px-1.5 py-0.5 text-[10px] text-yellow-200">{condition.name}</span>)}</div>}</div>{canManageEnemies && <div className="flex flex-wrap gap-1"><button type="button" onClick={() => setEnemyHpModal({ isOpen: true, enemyId: enemy.id, mode: 'damage', amount: '' })} className="min-h-9 px-2 rounded border border-red-800 text-xs text-red-100">Modificar vida</button>{!enemy.defeated && <button type="button" onClick={() => updateEnemyHp(enemy, { currentHp: 0 }).catch(() => setOnlineTableError('No se pudo marcar el enemigo como derrotado.'))} className="min-h-9 px-2 rounded border border-orange-800 text-xs text-orange-100">Derrotado</button>}<button type="button" onClick={() => openEnemyModal(enemy)} className="min-h-9 px-2 rounded border border-gray-600 text-xs text-gray-200">Editar</button><button type="button" onClick={() => confirmDelete(`¿Eliminar a ${enemy.name}?`, () => deleteEnemy(enemy.id))} className="min-h-9 px-2 rounded border border-red-900 text-xs text-red-200">Eliminar</button></div>}</div>{canManageEnemies && values && <div className="mt-2"><div className="flex flex-wrap justify-between gap-2 text-xs text-gray-300"><span>PV {values.currentHp} / {values.maxHp}{values.tempHp > 0 ? ` · Temporal ${values.tempHp}` : ''}</span><span>CA {privateData.armorClass ?? '—'}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-950"><div className="h-full rounded-full bg-orange-500" style={{ width: `${percent}%` }}></div></div>{privateData.notes && <p className="mt-2 whitespace-pre-wrap text-xs text-gray-500">{privateData.notes}</p>}</div>}</div>; })}{!publicCombatants.length && <p className="text-sm text-gray-500">No hay enemigos añadidos.</p>}</div>
                                        </section>}
                                        {false && onlineTableView === 'encounter' && <section className="rounded border border-red-900/70 bg-red-950/10 p-3">
                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-red-200">Vida compartida</h4>
                                            <div className="mt-3 space-y-2">{roomParticipants.map(participant => { const values = getHpValues(participant); const canEdit = isCurrentRoomMaster || participant.ownerUid === firebaseUser?.uid; const percent = values.maxHp > 0 ? Math.min(100, (values.currentHp / values.maxHp) * 100) : 0; return <div key={`hp-${participant.id}`} className="rounded border border-gray-700 bg-gray-900/60 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div className="min-w-0"><strong className="block truncate text-sm text-white">{participant.name || 'Personaje sin nombre'}{participant.ownerUid === firebaseUser?.uid ? ' (Tú)' : ''}</strong><span className="text-xs text-gray-400">PV {values.currentHp} / {values.maxHp}{values.tempHp > 0 ? ` · Temporal ${values.tempHp}` : ''}</span></div>{canEdit && <div className="flex flex-wrap items-center gap-1"><button type="button" onClick={() => updateParticipantHp(participant, { currentHp: Math.max(0, values.currentHp - 1) }, isCurrentRoomMaster ? 'master' : 'player').catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.'))} className="w-9 h-9 rounded border border-gray-600 text-gray-200" aria-label={`Reducir vida de ${participant.name}`}>−</button><button type="button" onClick={() => openParticipantHpModal(participant)} className="min-h-9 px-3 rounded border border-red-800 text-xs text-red-100">Modificar vida</button><button type="button" onClick={() => updateParticipantHp(participant, { currentHp: Math.min(values.maxHp, values.currentHp + 1) }, isCurrentRoomMaster ? 'master' : 'player').catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.'))} className="w-9 h-9 rounded border border-gray-600 text-gray-200" aria-label={`Aumentar vida de ${participant.name}`}>+</button></div>}</div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-950"><div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${percent}%` }}></div></div></div>; })}{!roomParticipants.length && <p className="text-sm text-gray-500">No hay personajes compartidos.</p>}</div>
                                            {ownRoomParticipant && <div className={`mt-2 flex flex-wrap items-center justify-between gap-2 text-xs ${hpSyncStatus === 'failed' ? 'text-red-300' : hpSyncStatus === 'pending' ? 'text-yellow-300' : hpSyncStatus === 'syncing' ? 'text-cyan-300' : 'text-emerald-300'}`}><span>{hpSyncStatus === 'failed' ? 'No se pudo sincronizar la vida' : hpSyncStatus === 'pending' ? 'Vida pendiente de sincronizar' : hpSyncStatus === 'syncing' ? 'Sincronizando vida…' : 'Vida sincronizada'}</span>{hpSyncStatus === 'failed' && <button type="button" onClick={retryPendingHpSync} className="min-h-8 px-2 rounded border border-red-700 text-[10px] text-red-100">Reintentar</button>}</div>}
                                        </section>}
                                        {onlineTableView === 'lobby' && <><p className="text-center text-xs text-gray-500">Tu rol: <b className="text-gray-300">{currentRoom.role === 'master' ? 'Máster' : 'Jugador'}</b></p>
                                        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-800 pt-4">
                                            {roomData?.status !== 'closed' && <>{sharedCharacterId ? <><button type="button" disabled={sharingCharacter} onClick={updateSharedCharacter} className="min-h-10 px-3 rounded border border-cyan-700 text-xs text-cyan-100 hover:bg-cyan-950/30 disabled:opacity-50">{sharingCharacter ? 'Actualizando…' : 'Actualizar mis datos'}</button><button type="button" onClick={openCharacterSelector} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200 hover:border-purple-400">Cambiar personaje compartido</button></> : <button type="button" onClick={openCharacterSelector} className="min-h-10 px-3 rounded border border-cyan-700 text-xs text-cyan-100 hover:bg-cyan-950/30">{isCurrentRoomMaster ? 'También controlo un personaje' : 'Compartir personaje'}</button>}</>}
                                            {isCurrentRoomMaster && <><button type="button" onClick={() => copyRoomCode(currentRoom.code)} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200 hover:border-cyan-400">Copiar código</button><button type="button" onClick={() => shareRoomLink(currentRoom.code)} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200 hover:border-cyan-400">Compartir enlace</button>{roomData?.status !== 'closed' && <button type="button" onClick={closeOnlineRoom} className="min-h-10 px-3 rounded border border-red-800 bg-red-950/30 text-xs text-red-200 hover:bg-red-900/50">Cerrar sala</button>}</>}
                                            {(!isCurrentRoomMaster || roomData?.status === 'closed') && <button type="button" onClick={leaveOnlineRoom} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200 hover:border-red-400">Salir de sala</button>}
                                            <button type="button" onClick={() => setOnlineTableOpen(false)} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-300">Cerrar</button>
                                        </div></>}
                                    </div>}
                                    {onlineTableView === 'closed' && <div className="mt-5 space-y-4 rounded border border-red-800 bg-red-950/25 p-4 text-center">
                                        <h4 className="font-fantasy text-lg font-bold text-red-200">Sala cerrada</h4>
                                        <p className="text-sm text-gray-300">El Máster ha cerrado esta sala. Puedes salir cuando quieras.</p>
                                        <button type="button" onClick={leaveOnlineRoom} className="min-h-11 px-4 rounded border border-gray-600 text-sm text-gray-200 hover:border-red-400">Salir de sala</button>
                                    </div>}
                                    </div>
                                    </div>
                                </div>
                            </div>,
                            document.body
                        )}

                        <OnlineConditionModal
                            modal={conditionModal}
                            conditions={ONLINE_CONDITIONS}
                            onChange={setConditionModal}
                            onClose={() => setConditionModal({ isOpen: false, target: null, name: '', source: '', notes: '' })}
                            onSave={() => saveOnlineCondition().catch(() => setOnlineTableError('No se pudo guardar la condición.'))}
                        />
                        <OnlineEffectModal
                            modal={effectModal}
                            combatants={encounterCombatants}
                            canManageEnemies={canManageEnemies}
                            currentUid={firebaseUser?.uid}
                            onChange={setEffectModal}
                            onClose={() => setEffectModal({ isOpen: false, effectId: null, data: {} })}
                            onSave={() => saveEffect().catch(() => setOnlineTableError('No se pudo guardar el efecto.'))}
                        />
                        <EnemyModal
                            modal={enemyModal}
                            onChange={setEnemyModal}
                            onClose={() => setEnemyModal({ isOpen: false, mode: 'create', enemyId: null, data: {} })}
                            onSave={saveEnemy}
                        />

                        {reinforcementEntry.isOpen && isCurrentRoomMaster && <div className="fixed inset-0 z-[82] flex items-center justify-center bg-black/80 p-4">
                            <div className="rpg-panel w-full max-w-sm border border-orange-700 p-5">
                                <h3 className="font-fantasy text-lg font-bold text-orange-200">¿Cómo entran en el encuentro?</h3>
                                <p className="mt-2 text-sm text-gray-400">{reinforcementEntry.enemyIds.length} {reinforcementEntry.enemyIds.length === 1 ? 'enemigo creado' : 'enemigos creados'}.</p>
                                <div className="mt-5 grid gap-2">
                                    <button type="button" disabled={encounterBusy} onClick={() => confirmReinforcementEntry('after-current')} className="min-h-12 rounded border border-orange-700 bg-orange-950/30 px-3 text-left text-sm text-orange-100 disabled:opacity-40">Después del turno actual</button>
                                    <button type="button" disabled={encounterBusy} onClick={() => confirmReinforcementEntry('end')} className="min-h-12 rounded border border-gray-600 px-3 text-left text-sm text-gray-200 disabled:opacity-40">Al final del orden</button>
                                    <button type="button" disabled={encounterBusy} onClick={() => confirmReinforcementEntry('outside')} className="min-h-12 rounded border border-gray-700 px-3 text-left text-sm text-gray-300 disabled:opacity-40">No añadir todavía</button>
                                </div>
                            </div>
                        </div>}

                        <OnlineHpModal
                            modal={enemyHpModal}
                            entity={(() => {
                                const enemy = publicCombatants.find(item => item.id === enemyHpModal.enemyId);
                                const privateData = privateEnemies.find(item => item.id === enemyHpModal.enemyId);
                                return enemy && privateData ? { ...privateData, name: enemy.name } : null;
                            })()}
                            onChange={setEnemyHpModal}
                            onClose={() => setEnemyHpModal({ isOpen: false, enemyId: null, mode: 'damage', amount: '' })}
                            onConfirm={applyEnemyHpModal}
                            busy={onlineTableBusy}
                            allowMax={true}
                            accent="orange"
                        />
                        {finishEncounterPrompt && <div className="fixed inset-0 z-[74] flex items-center justify-center bg-black/80 p-4"><div className="rpg-panel w-full max-w-sm border border-red-700 p-5"><h3 className="font-fantasy text-lg font-bold text-red-200">Finalizar encuentro</h3><p className="mt-2 text-sm text-gray-300">Elige qué hacer con los enemigos de esta sala.</p><div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setFinishEncounterPrompt(false)} className="min-h-10 px-3 rounded border border-gray-600 text-gray-300">Cancelar</button><button type="button" onClick={() => finishEncounter(false)} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200">Conservar enemigos</button><button type="button" onClick={() => finishEncounter(true)} className="min-h-10 px-3 rounded border border-red-700 bg-red-950/40 text-xs text-red-100">Eliminar enemigos</button></div></div></div>}

                        <OnlineHpModal
                            modal={hpModal}
                            entity={roomParticipants.find(item => item.id === hpModal.participantId) || null}
                            onChange={setHpModal}
                            onClose={() => setHpModal({ isOpen: false, participantId: null, mode: 'damage', amount: '' })}
                            onConfirm={applyParticipantHpModal}
                            busy={onlineTableBusy}
                        />
                        {hpConflict && <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 p-4"><div className="rpg-panel w-full max-w-sm border border-yellow-700 p-5"><h3 className="font-fantasy text-lg font-bold text-yellow-200">Hay diferencias en los puntos de golpe</h3><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded border border-gray-700 bg-gray-950/60 p-3"><span className="block text-xs uppercase text-gray-500">Local</span><b>{hpConflict.local.currentHp} / {hpConflict.local.maxHp}</b>{hpConflict.local.tempHp > 0 && <span className="block text-xs text-cyan-200">Temporal {hpConflict.local.tempHp}</span>}</div><div className="rounded border border-cyan-800 bg-cyan-950/25 p-3"><span className="block text-xs uppercase text-gray-500">Mesa</span><b>{hpConflict.remote.currentHp} / {hpConflict.remote.maxHp}</b>{hpConflict.remote.tempHp > 0 && <span className="block text-xs text-cyan-200">Temporal {hpConflict.remote.tempHp}</span>}</div></div><div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={useRemoteHpConflict} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200">Usar datos de la mesa</button><button type="button" onClick={shareLocalHpConflict} className="min-h-10 px-3 rounded border border-cyan-700 bg-cyan-950/30 text-xs text-cyan-100">Compartir mis datos locales</button></div></div></div>}

                        {restModalOpen && (
                            <div className="rest-planner-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) closeRestPlanner(); }}>
                                <div className="rest-planner" data-rest-type={restType || 'choose'} role="dialog" aria-modal="true" aria-labelledby="rest-planner-title">
                                    <header className="rest-planner-header">
                                        <div className="rest-planner-mark" aria-hidden="true"><span>{restType === 'short' ? '♨' : '☾'}</span></div>
                                        <div><small>{restType ? 'Preparar recuperación' : 'Finalizar una jornada'}</small><h3 id="rest-planner-title">{restType === 'short' ? 'Descanso corto' : restType === 'long' ? 'Descanso largo' : 'Descansar'}</h3><p>{restType ? 'Revisa qué cambiará antes de continuar.' : 'Elige cómo recuperará fuerzas tu personaje.'}</p></div>
                                        <button type="button" className="rest-planner-close" onClick={closeRestPlanner} aria-label="Cerrar">×</button>
                                    </header>
                                    {!restType ? <>
                                        <div className="rest-current-state"><div><span>Vida actual</span><strong>{hp.current || 0} <i>/ {hp.max || 0}</i></strong></div><div><span>Dados de golpe</span><strong>{hitDice.current || 0} <i>{hitDice.type || ''}</i></strong></div><div><span>Constitución</span><strong>{formatMod(getModNum(getEffectiveStat('con')))}</strong></div></div>
                                        <div className="rest-choice-grid">
                                            <button type="button" className="rest-choice is-short" onClick={() => chooseRestType('short')}><span className="rest-choice-icon">♨</span><span className="rest-choice-copy"><small>Una pausa en el camino</small><strong>Descanso corto</strong><em>Gasta dados de golpe manualmente y recupera los recursos configurados para descansos cortos.</em><span><i>Dados de golpe</i><i>Recursos cortos</i><i>Magia de pacto</i></span></span><b aria-hidden="true">→</b></button>
                                            <button type="button" className="rest-choice is-long" onClick={() => chooseRestType('long')}><span className="rest-choice-icon">☾</span><span className="rest-choice-copy"><small>Recuperar fuerzas</small><strong>Descanso largo</strong><em>Restaura la vida, las ranuras y los recursos que se recuperan tras una noche completa.</em><span><i>Puntos de golpe</i><i>Ranuras</i><i>Recursos</i></span></span><b aria-hidden="true">→</b></button>
                                        </div>
                                        <p className="rest-planner-footnote">La aplicación no elimina condiciones ni toma decisiones por el personaje.</p>
                                    </> : <>
                                        <div className="rest-planner-toolbar"><button type="button" onClick={() => chooseRestType(null)}>← Cambiar tipo</button><span>{restType === 'short' ? 'Pausa breve' : 'Noche completa'}</span></div>
                                        {restType === 'short' && <section className="rest-hit-dice-panel">
                                            <div className="rest-section-heading"><div><small>Recuperación manual</small><h4>Dados de golpe</h4></div><span>{hitDice.current || 0} {hitDice.type || ''} disponibles</span></div>
                                            <div className="rest-dice-controls"><button type="button" onClick={() => setRestSpentDice(value => Math.max(0, Number(value) - 1))} disabled={!Number(restSpentDice)} aria-label="Gastar un dado menos">−</button><div><small>Dados que gastarás</small><strong>{restSpentDice}</strong><span>{hitDice.type || 'dados'}</span></div><button type="button" disabled={(Number(hp.current) || 0) >= (Number(hp.max) || 0) || Number(restSpentDice) >= (Number(hitDice.current) || 0)} onClick={() => setRestSpentDice(value => Math.min(Number(hitDice.current) || 0, Number(value) + 1))} aria-label="Gastar un dado más">+</button></div>
                                            <label className="rest-healing-field"><span><small>Resultado total</small><strong>Puntos de golpe recuperados</strong></span><input disabled={!Number(restSpentDice)} min="0" inputMode="numeric" type="number" value={restHealing} onChange={event => setRestHealing(event.target.value === '' ? '' : Math.max(0, Number(event.target.value) || 0))}/></label>
                                            <p className="rest-manual-note"><span>!</span> Tira tus dados fuera de la aplicación, suma los modificadores correspondientes e introduce aquí el total.</p>
                                        </section>}
                                        <section className="rest-preview-panel">
                                            <div className="rest-section-heading"><div><small>Antes de confirmar</small><h4>Así quedará la ficha</h4></div><span>{restPreviewChangeCount} cambio{restPreviewChangeCount === 1 ? '' : 's'}</span></div>
                                            <div className="rest-preview-primary"><article><span>♥</span><div><small>Puntos de golpe</small><strong>{hp.current || 0} <i>→</i> {restPreview.data.hp?.current || 0} <em>/ {hp.max || 0}</em></strong></div></article><article><span>◆</span><div><small>Dados de golpe</small><strong>{hitDice.current || 0} <i>→</i> {restPreview.data.hitDice?.current || 0} <em>{hitDice.type || ''}</em></strong></div></article></div>
                                            {(restPreviewResources.length > 0 || restPreviewSlots.length > 0 || restPreviewPact) ? <div className="rest-recovery-list">{restPreviewResources.map(resource => <div key={resource.name}><span>✦</span><p><small>{resource.name}</small><strong>{resource.before} → {resource.after} / {resource.max}</strong></p></div>)}{restPreviewSlots.map(slot => <div key={`slot_${slot.level}`}><span>◇</span><p><small>Ranuras de nivel {slot.level}</small><strong>{slot.before} → {slot.after} / {slot.max}</strong></p></div>)}{restPreviewPact && <div><span>⬡</span><p><small>Magia de pacto</small><strong>{restPreviewPact.before} → {restPreviewPact.after} / {restPreviewPact.max}</strong></p></div>}</div> : <p className="rest-no-changes">No hay otros recursos que necesiten recuperarse.</p>}
                                            {restPreview.unchanged.length > 0 && <details className="rest-unchanged"><summary>Recursos sin cambios ({restPreview.unchanged.length})</summary><p>{restPreview.unchanged.join(' · ')}</p></details>}
                                        </section>
                                        <footer className="rest-planner-actions"><button type="button" onClick={() => chooseRestType(null)}>Volver</button><button type="button" className="is-primary" onClick={confirmRest}><span>{restType === 'short' ? '♨' : '☾'}</span> Comenzar {restType === 'short' ? 'descanso corto' : 'descanso largo'}</button></footer>
                                    </>}
                                </div>
                            </div>
                        )}

                        {appSettingsOpen && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setAppSettingsOpen(false)}>
                                <div className="rpg-panel w-full max-w-lg max-h-[85vh] overflow-y-auto p-5" onClick={event => event.stopPropagation()}>
                                    <div className="flex items-center justify-between gap-4 border-b border-gray-700 pb-3">
                                        <h3 className="text-xl font-fantasy font-bold text-purple-200 tracking-widest uppercase">⚙ {t('settings')}</h3>
                                        <button type="button" onClick={() => setAppSettingsOpen(false)} className="w-10 h-10 rounded border border-gray-600 text-gray-300 hover:bg-gray-800 text-2xl leading-none" aria-label={t('close')}>&times;</button>
                                    </div>
                                    <div className="mt-5 space-y-5">
                                        <section>
                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-gray-300 mb-2">{t('theme')}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {['classic', 'parchment', 'arcane', 'contrast'].map(theme => <button key={theme} type="button" onClick={() => setAppSettings(previous => ({ ...previous, theme }))} aria-pressed={appSettings.theme === theme} className={`min-h-11 rounded border px-3 py-2 text-left text-sm transition-colors ${appSettings.theme === theme ? 'border-purple-400 bg-purple-900/40 text-white' : 'border-gray-700 bg-gray-900/60 text-gray-300 hover:border-gray-500'}`}>{t(theme)}</button>)}
                                            </div>
                                        </section>
                                        <section>
                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-gray-300 mb-2">{t('language')}</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[['es', 'Español'], ['en', 'English']].map(([language, label]) => <button key={language} type="button" onClick={() => setAppSettings(previous => ({ ...previous, language }))} aria-pressed={appSettings.language === language} className={`min-h-11 rounded border px-3 py-2 text-sm transition-colors ${appSettings.language === language ? 'border-purple-400 bg-purple-900/40 text-white' : 'border-gray-700 bg-gray-900/60 text-gray-300 hover:border-gray-500'}`}>{label}</button>)}
                                            </div>
                                        </section>
                                        <section>
                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-gray-300 mb-2">{t('textSize')}</h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['small', 'normal', 'large'].map(size => <button key={size} type="button" onClick={() => setAppSettings(previous => ({ ...previous, textSize: size }))} aria-pressed={appSettings.textSize === size} className={`min-h-11 rounded border px-2 py-2 text-sm transition-colors ${appSettings.textSize === size ? 'border-purple-400 bg-purple-900/40 text-white' : 'border-gray-700 bg-gray-900/60 text-gray-300 hover:border-gray-500'}`}>{t(size)}</button>)}
                                            </div>
                                        </section>
                                        <section>
                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-gray-300 mb-2">Conexión</h4>
                                            <div role="status" className={`rounded border px-3 py-2 text-sm ${firebaseConnectionClass}`}>
                                                <span className="font-semibold">Firebase: {firebaseConnectionLabel}</span>
                                                {firebaseError && <span className="mt-1 block text-xs opacity-80">La ficha local sigue disponible.</span>}
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ActivityHistoryModal
                            open={activityHistoryOpen}
                            entries={activityLog}
                            onClose={() => setActivityHistoryOpen(false)}
                            onClear={() => confirmDelete('¿Limpiar todo el historial de este personaje?', () => setActivityLog([]))}
                        />
                        {bestiaryOpen && !bestiaryEditor && <div className="local-bestiary-transfer-bar"><input ref={bestiaryImportRef} type="file" accept="application/json,.json" onChange={handleBestiaryImportFile} className="hidden"/><button type="button" onClick={exportBestiary}>Exportar</button><button type="button" onClick={() => bestiaryImportRef.current?.click()}>Importar</button>{window.localStorage.getItem(LOCAL_BESTIARY_BACKUP_KEY) && <button type="button" onClick={restoreBestiaryBackup}>Restaurar copia</button>}</div>}

                        <BestiaryImportPreviewModal
                            preview={bestiaryImportPreview}
                            importMode={bestiaryImportMode}
                            duplicateMode={bestiaryDuplicateMode}
                            selectedIds={bestiarySelectedImportIds}
                            onImportModeChange={setBestiaryImportMode}
                            onDuplicateModeChange={setBestiaryDuplicateMode}
                            onSelectedIdsChange={setBestiarySelectedImportIds}
                            onClose={() => setBestiaryImportPreview(null)}
                            onConfirm={applyBestiaryImport}
                        />
                        <SrdMonsterCompendiumModal
                            open={bestiaryCompendiumOpen}
                            compendium={srdMonsterCompendium}
                            localMonsters={bestiary.monsters}
                            query={bestiaryCompendiumQuery}
                            type={bestiaryCompendiumType}
                            challenge={bestiaryCompendiumChallenge}
                            preview={bestiaryCompendiumPreview}
                            onClose={() => setBestiaryCompendiumOpen(false)}
                            onQueryChange={setBestiaryCompendiumQuery}
                            onTypeChange={setBestiaryCompendiumType}
                            onChallengeChange={setBestiaryCompendiumChallenge}
                            onPreviewChange={setBestiaryCompendiumPreview}
                            onAddMonster={addSrdMonsterToBestiary}
                            canUseInTable={Boolean(currentRoom && isCurrentRoomMaster)}
                            onUseMonster={useSrdMonsterInOnlineTable}
                            onOpenLocalBestiary={() => { setBestiaryCompendiumOpen(false); setBestiaryOpen(true); }}
                        />
                        <LocalBestiaryModal
                            open={bestiaryOpen}
                            editor={bestiaryEditor}
                            warning={bestiary.warning}
                            notice={bestiaryNotice}
                            query={bestiaryQuery}
                            tag={bestiaryTag}
                            sort={bestiarySort}
                            tags={[...new Set(bestiary.monsters.flatMap(monster => monster.tags))].sort((left, right) => left.localeCompare(right, 'es'))}
                            monsters={(() => {
                                const query = bestiaryQuery.trim().toLocaleLowerCase('es');
                                return bestiary.monsters
                                    .filter(monster => (
                                        (!query || monster.name.toLocaleLowerCase('es').includes(query) || monster.tags.some(item => item.toLocaleLowerCase('es').includes(query))) &&
                                        (!bestiaryTag || monster.tags.includes(bestiaryTag))
                                    ))
                                    .slice()
                                    .sort((left, right) => bestiarySort === 'updated'
                                        ? String(right.updatedAt).localeCompare(String(left.updatedAt))
                                        : left.name.localeCompare(right.name, 'es'));
                            })()}
                            avatarInputRef={bestiaryAvatarRef}
                            onClose={() => setBestiaryOpen(false)}
                            onOpenCompendium={() => { setBestiaryOpen(false); setBestiaryCompendiumOpen(true); }}
                            onCreate={() => openBestiaryEditor()}
                            onQueryChange={setBestiaryQuery}
                            onTagChange={setBestiaryTag}
                            onSortChange={setBestiarySort}
                            onUseMonster={monster => {
                                if (!isCurrentRoomMaster) {
                                    setBestiaryNotice('Abre una sala como Máster para usar una plantilla.');
                                    return;
                                }
                                setEnemyModal({
                                    isOpen: true,
                                    mode: 'create',
                                    enemyId: null,
                                    data: {
                                        name: monster.name,
                                        initiative: '',
                                        currentHp: monster.maxHp,
                                        maxHp: monster.maxHp,
                                        tempHp: 0,
                                        armorClass: monster.armorClass ?? '',
                                        notes: monster.privateNotes,
                                        visibleStateMode: monster.defaultVisibleStateMode,
                                        manualVisibleState: monster.defaultManualVisibleState || 'herido',
                                        conditionsVisible: cloneData(monster.defaultPublicConditions)
                                    }
                                });
                                setBestiaryOpen(false);
                            }}
                            onEditMonster={openBestiaryEditor}
                            onDuplicateMonster={duplicateBestiaryMonster}
                            onDeleteMonster={monster => confirmDelete(`¿Eliminar la plantilla ${monster.name}? Los enemigos ya creados no cambiarán.`, () => deleteBestiaryMonster(monster.id))}
                            onAvatarChange={handleBestiaryAvatar}
                            onEditorChange={setBestiaryEditor}
                            onPickAvatar={() => bestiaryAvatarRef.current?.click()}
                            onCancelEditor={() => setBestiaryEditor(null)}
                            onSaveEditor={saveBestiaryEditor}
                        />
                        {portraitViewerOpen && isValidPortraitDataUrl(activeCharacter.meta.portrait) && (
                            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" onClick={() => setPortraitViewerOpen(false)}>
                                <div className="relative flex max-h-[85vh] max-w-3xl items-center justify-center" onClick={event => event.stopPropagation()}>
                                    <img src={activeCharacter.meta.portrait} alt={`Retrato ampliado de ${charInfo.name || 'personaje'}`} className="max-h-[80vh] max-w-full rounded-lg border border-purple-400/70 bg-gray-950 object-contain shadow-2xl" />
                                    <button type="button" onClick={() => setPortraitViewerOpen(false)} className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded border border-gray-500 bg-gray-950/90 text-2xl leading-none text-gray-100 hover:border-purple-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300" aria-label="Cerrar visor de retrato">&times;</button>
                                </div>
                            </div>
                        )}

                        {onlineAvatarViewer && isValidPortraitDataUrl(onlineAvatarViewer.src) && (
                            <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" onClick={() => setOnlineAvatarViewer(null)}>
                                <div className="flex max-h-[85vh] max-w-2xl flex-col items-end gap-3" onClick={event => event.stopPropagation()}>
                                    <button type="button" onClick={() => setOnlineAvatarViewer(null)} className="flex h-11 w-11 items-center justify-center rounded border border-gray-500 bg-gray-950/90 text-2xl leading-none text-gray-100 hover:border-purple-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300" aria-label="Cerrar visor de avatar">&times;</button>
                                    <img src={onlineAvatarViewer.src} alt={`Avatar ampliado de ${onlineAvatarViewer.name}`} className="max-h-[76vh] max-w-full rounded-lg border border-purple-400/70 bg-gray-950 object-contain shadow-2xl" />
                                </div>
                            </div>
                        )}

                        <TimerModal
                            modal={timerModal}
                            realTimerUnits={REAL_TIMER_UNITS}
                            onChange={setTimerModal}
                            onClose={setTimerModal}
                            onSave={saveTimer}
                            normalizeNumberInput={handleNumInput}
                        />
                        {presentationSettingsOpen && ReactDOM.createPortal(<div className="presentation-settings-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPresentationSettingsOpen(false); }}>
                            <section className="presentation-settings rpg-panel" role="dialog" aria-modal="true" aria-labelledby="presentation-settings-title">
                                <header><div><small>Identidad del personaje</small><h3 id="presentation-settings-title">Presentación</h3><p>Define cómo se reconoce y qué se muestra al compartirlo.</p></div><button type="button" onClick={() => setPresentationSettingsOpen(false)} aria-label="Cerrar">×</button></header>
                                <div className="presentation-settings-body">
                                    <fieldset><legend>Color de acento</legend><div className="presentation-accent-options">{[['violet','Violeta'],['crimson','Carmesí'],['azure','Azul'],['emerald','Esmeralda'],['amber','Ámbar'],['silver','Plata']].map(([id,label]) => <button type="button" key={id} data-accent={id} className={(presentation?.accent || 'violet') === id ? 'is-selected' : ''} onClick={() => setPresentation(previous => ({ ...previous, accent: id }))}><i></i><span>{label}</span></button>)}</div></fieldset>
                                    <label className="presentation-settings-field"><span>Lema o frase</span><input type="text" maxLength="120" value={presentation?.tagline || ''} onChange={event => setPresentation(previous => ({ ...previous, tagline: event.target.value }))} placeholder="Una frase breve que defina al personaje" /><small>{(presentation?.tagline || '').length}/120</small></label>
                                    <fieldset><legend>Información compartida</legend><div className="presentation-privacy-options"><button type="button" className={(presentation?.visibility || 'profile') === 'profile' ? 'is-selected' : ''} onClick={() => setPresentation(previous => ({ ...previous, visibility: 'profile' }))}><strong>Perfil narrativo</strong><small>Identidad, historia y elementos emblemáticos.</small></button><button type="button" className={presentation?.visibility === 'full' ? 'is-selected' : ''} onClick={() => setPresentation(previous => ({ ...previous, visibility: 'full' }))}><strong>Ficha completa</strong><small>Añade PV, CA, iniciativa y percepción.</small></button></div></fieldset>
                                    <fieldset><legend>Elementos emblemáticos</legend><p className="presentation-settings-hint">Son opcionales y solo destacan información que ya existe en la ficha.</p><div className="presentation-feature-selects"><label><span>Rasgo</span><select value={presentation?.featuredTraitId || ''} onChange={event => setPresentation(previous => ({ ...previous, featuredTraitId: event.target.value }))}><option value="">Ninguno</option>{traits.map(trait => <option key={trait.id || trait.title} value={trait.id || trait.title}>{trait.title || 'Rasgo sin nombre'}</option>)}</select></label><label><span>Objeto</span><select value={presentation?.featuredItemId || ''} onChange={event => setPresentation(previous => ({ ...previous, featuredItemId: event.target.value }))}><option value="">Ninguno</option>{inventory.map(item => <option key={item.id} value={item.id}>{item.name || 'Objeto sin nombre'}</option>)}</select></label><label><span>Conjuro</span><select value={presentation?.featuredSpellId || ''} onChange={event => setPresentation(previous => ({ ...previous, featuredSpellId: event.target.value }))}><option value="">Ninguno</option>{grimorioSpells.map(spell => <option key={spell.id || spell.sourceId} value={spell.id || spell.sourceId}>{spell.name || 'Conjuro sin nombre'}</option>)}</select></label></div></fieldset>
                                </div>
                                <footer><button type="button" onClick={() => { setPresentationSettingsOpen(false); setPresentationPreviewOpen(true); }}>Vista previa</button><button type="button" className="is-primary" onClick={() => setPresentationSettingsOpen(false)}>Guardar</button></footer>
                            </section>
                        </div>, document.body)}
                        <CharacterManagerModal
                            open={characterManagerOpen}
                            characters={characterList}
                            activeCharacterId={manager.activeCharacterId}
                            onClose={() => setCharacterManagerOpen(false)}
                            onCreate={createManagedCharacter}
                            onImport={() => importFileRef.current?.click()}
                            onSelect={selectManagedCharacter}
                            onDuplicate={duplicateCharacter}
                            onExport={exportCharacter}
                            onShare={shareCharacterFile}
                            onDelete={deleteManagedCharacter}
                            hasPortrait={isValidPortraitDataUrl}
                        />
                        <input ref={importFileRef} type="file" accept="application/json,.json" onChange={handleImportFile} className="hidden" />
                        {/* MODAL DIARIO DE SESIÓN */}
                        {pendingImport && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                                <div className="rpg-panel border border-purple-500 rounded-lg p-6 max-w-md w-full shadow-2xl">
                                    <h3 className="text-xl font-fantasy font-bold text-purple-200 tracking-widest uppercase">Importar personaje</h3>
                                    <p className="text-sm text-gray-300 mt-3 leading-relaxed">Se creará una ficha nueva para <strong className="text-white">{pendingImport.meta.name || 'Personaje importado'}</strong>. Ningún personaje existente será reemplazado.</p>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button type="button" onClick={() => setPendingImport(null)} className="min-h-10 px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white text-xs font-fantasy uppercase tracking-wider">Cancelar</button>
                                        <button type="button" onClick={confirmImportCharacter} className="min-h-10 px-4 py-2 rounded bg-purple-700 hover:bg-purple-600 border border-purple-500 text-white text-xs font-fantasy uppercase tracking-wider">Importar</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {castSpell && (
                            <div className="cast-spell-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setCastSpell(null)}>
                                <div className="cast-spell-dialog rpg-panel p-5 max-w-md w-full" onClick={event => event.stopPropagation()}>
                                    <div className="cast-spell-title"><span>{castSpell.level === 0 ? 'T' : castSpell.level}<small>{castSpell.level === 0 ? 'Truco' : 'Nivel'}</small></span><div><small>Preparar lanzamiento</small><h3>{castSpell.name}</h3><p>{castSpell.concentration ? 'Requiere concentración' : 'Selecciona el recurso que quieres consumir'}</p></div><button type="button" onClick={() => setCastSpell(null)} aria-label="Cerrar">×</button></div>
                                    {(() => {
                                        const resolution = getSpellResolution(castSpell);
                                        const diceDetails = getSrdSpellDiceDetails(castSpell);
                                        return Boolean(resolution.usesSpellAttack || resolution.savingAbility || diceDetails.length) && <div className="mt-3 flex flex-wrap gap-2 text-xs">{resolution.usesSpellAttack && <span className="rounded border border-cyan-700 bg-cyan-950/20 px-2 py-1 text-cyan-100">Ataque {spellAttackBonus === null ? 'sin configurar' : formatMod(spellAttackBonus)}</span>}{resolution.savingAbility && <span className="rounded border border-cyan-700 bg-cyan-950/20 px-2 py-1 text-cyan-100">Salvación de {resolution.savingAbility}{spellSaveDc === null ? '' : ` · CD ${spellSaveDc}`}</span>}{diceDetails.map((detail, index) => <span key={`${detail.value}_${index}`} className={`rounded border px-2 py-1 ${detail.kind === 'healing' || detail.kind === 'benefit' ? 'border-emerald-700 text-emerald-200' : detail.kind === 'damage' ? 'border-red-800 text-red-200' : 'border-cyan-700 text-cyan-200'}`}>{detail.value} {detail.label}</span>)}</div>;
                                    })()}
                                    {castSpell.castingResource === 'independent' ? <div className="cast-resource-panel"><span>Usos propios</span><strong>{castSpell.ownUsesCurrent}<small>/ {castSpell.ownUsesMax}</small></strong><p>No consume ranuras de conjuro.</p><button disabled={Number(castSpell.ownUsesCurrent) <= 0} onClick={() => castWithSlot(0)} className="cast-confirm-button">Usar conjuro</button></div> : castSpell.castingResource === 'at-will' || castSpell.level === 0 ? <div className="cast-resource-panel"><span>Lanzamiento a voluntad</span><strong>∞</strong><p>No consume ranuras de conjuro.</p><button onClick={() => castWithSlot(0)} className="cast-confirm-button">Lanzar ahora</button></div> : <div className="cast-slot-picker"><div className="cast-slot-picker-heading"><div><span>Recurso de lanzamiento</span><strong>Elige una ranura</strong></div><small>Nivel mínimo {castSpell.level}</small></div>{[1,2,3,4,5,6,7,8,9].filter(level => level >= castSpell.level && Number(spellSlots[level].current) > 0).map(level => <button key={level} onClick={() => castWithSlot(level)} className="cast-slot-option"><span>{level}<small>Nivel</small></span><div><strong>Ranura arcana</strong><small>{level === castSpell.level ? 'Potencia base' : `Potenciada +${level - castSpell.level}`}</small></div><div className="cast-slot-status"><span>{Array.from({ length: Math.max(0, Number(spellSlots[level].max) || 0) }, (_, index) => <i key={index} className={index < Number(spellSlots[level].current) ? 'is-filled' : ''}></i>)}</span><small>{spellSlots[level].current} disponibles</small></div></button>)}{grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.current) > 0 && Number(grimoireConfig.pactSlots.level) >= castSpell.level && <button onClick={() => castWithSlot(grimoireConfig.pactSlots.level, true)} className="cast-slot-option is-pact"><span>{grimoireConfig.pactSlots.level}<small>Pacto</small></span><div><strong>Magia de pacto</strong><small>Recuperación corta</small></div><div className="cast-slot-status"><span>{Array.from({ length: Math.max(0, Number(grimoireConfig.pactSlots.max) || 0) }, (_, index) => <i key={index} className={index < Number(grimoireConfig.pactSlots.current) ? 'is-filled' : ''}></i>)}</span><small>{grimoireConfig.pactSlots.current} disponibles</small></div></button>}<button onClick={() => setCastSpell(null)} className="cast-cancel-button">Cancelar lanzamiento</button></div>}
                                </div>
                            </div>
                        )}

                        {spellCastAnimation && (() => {
                            const { spell, slotLevel, pact, schoolText, schoolKey } = spellCastAnimation;
                            const components = [spell.compV && 'V', spell.compS && 'S', spell.compM && 'M'].filter(Boolean);
                            const resourceLabel = spell.castingResource === 'independent' ? 'Uso propio consumido' : spell.castingResource === 'at-will' || Number(spell.level) === 0 ? 'Lanzamiento a voluntad' : pact ? `Ranura de pacto · nivel ${slotLevel}` : `Ranura arcana · nivel ${slotLevel}`;
                            return <div className="spell-cast-ceremony" data-school={schoolKey} role="dialog" aria-modal="true" aria-label={`Lanzando ${spell.name}`} onClick={() => setSpellCastAnimation(null)}>
                                <div className="spell-cast-particles" aria-hidden="true">{Array.from({length:14},(_,index) => <i key={index}></i>)}</div>
                                <div className="spell-cast-stage" onClick={event => event.stopPropagation()}>
                                    <div className="spell-cast-sigil" aria-hidden="true"><i className="ring-one"></i><i className="ring-two"></i><i className="ring-three"></i><span>{schoolText.trim().slice(0,1).toLocaleUpperCase('es')}</span></div>
                                    <div className="spell-cast-copy"><small>{schoolText}</small><h2>{spell.name}</h2><p>{Number(spell.level) === 0 ? 'Truco' : `Conjuro de nivel ${spell.level}`}{slotLevel > Number(spell.level) ? ` · Potenciado a nivel ${slotLevel}` : ''}</p></div>
                                    <div className="spell-cast-details"><span className="spell-cast-resource">{resourceLabel}</span>{components.length > 0 && <span className="spell-cast-components">{components.map(component => <i key={component}>{component}</i>)}</span>}{spell.concentration && <span className="spell-cast-concentration">Concentración activa</span>}</div>
                                    <div className="spell-cast-progress" aria-hidden="true"><i></i></div>
                                    <div className="spell-cast-phase" aria-hidden="true"><span>Canalizando poder</span><strong>Conjuro lanzado</strong></div>
                                    <button type="button" onClick={() => setSpellCastAnimation(null)}>Continuar</button>
                                </div>
                            </div>;
                        })()}

                        {editingSlotLevel && (() => {
                            const slot = spellSlots[editingSlotLevel] || { current: 0, max: 0 };
                            const maximum = Math.max(0, Number(slot.max) || 0);
                            const available = Math.max(0, Math.min(maximum, Number(slot.current) || 0));
                            const updateSlot = (nextCurrent, nextMaximum = maximum) => setSpellSlots(previous => ({
                                ...previous,
                                [editingSlotLevel]: {
                                    ...previous[editingSlotLevel],
                                    max: Math.max(0, nextMaximum),
                                    current: Math.max(0, Math.min(Math.max(0, nextMaximum), nextCurrent))
                                }
                            }));
                            return <div className="slot-editor-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setEditingSlotLevel(null)}>
                                <div className="slot-editor-dialog rpg-panel w-full max-w-sm" onClick={event => event.stopPropagation()}>
                                    <header className="slot-editor-heading">
                                        <span>{editingSlotLevel}<small>Nivel</small></span>
                                        <div><small>Gestión de ranuras</small><h3>Magia de nivel {editingSlotLevel}</h3></div>
                                        <button type="button" onClick={() => setEditingSlotLevel(null)} aria-label="Cerrar">×</button>
                                    </header>
                                    <section className="slot-editor-body">
                                        <div className="slot-editor-summary"><span>Ranuras disponibles</span><strong>{available}<small> de {maximum}</small></strong><p>{maximum ? `${maximum - available} ${maximum - available === 1 ? 'ranura gastada' : 'ranuras gastadas'}` : 'Este nivel todavía no tiene ranuras.'}</p></div>
                                        <div className="slot-editor-diamonds" aria-label={`${available} de ${maximum} ranuras disponibles`}>
                                            {Array.from({ length: maximum }, (_, index) => <button type="button" key={index} className={index < available ? 'is-filled' : ''} onClick={() => updateSlot(index < available ? index : index + 1)} aria-label={`Dejar ${index + 1} ranuras disponibles`}><i></i></button>)}
                                            {!maximum && <span>Define un máximo para comenzar</span>}
                                        </div>
                                        <div className="slot-editor-actions">
                                            <button type="button" disabled={!available} onClick={() => updateSlot(available - 1)}><b>−</b><span>Gastar una</span></button>
                                            <button type="button" disabled={available >= maximum} onClick={() => updateSlot(available + 1)}><b>+</b><span>Recuperar una</span></button>
                                        </div>
                                        <button type="button" className="slot-editor-restore" disabled={!maximum || available === maximum} onClick={() => updateSlot(maximum)}>Restaurar todas las ranuras</button>
                                        <div className="slot-editor-maximum"><div><span>Máximo de ranuras</span><small>Cámbialo solo si tu progresión lo requiere.</small></div><button type="button" disabled={!maximum} onClick={() => updateSlot(Math.min(available, maximum - 1), maximum - 1)}>−</button><strong>{maximum}</strong><button type="button" onClick={() => updateSlot(available, maximum + 1)}>+</button></div>
                                    </section>
                                    <button type="button" className="slot-editor-done" onClick={() => setEditingSlotLevel(null)}>Guardar y cerrar</button>
                                </div>
                            </div>;
                        })()}

                        {notesModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setNotesModalOpen(false)}>
                                <div className="rpg-panel p-6 max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl animate-attack border border-purple-500/50" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                                        <h3 className="text-2xl font-fantasy font-bold text-purple-200 flex items-center tracking-widest"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> Diario de Campaña</h3>
                                        <div className="flex space-x-4 items-center">
                                            <button onClick={() => setSessionNotes([{ id: 'note_' + Date.now(), date: new Date().toLocaleDateString(), text: "" }, ...sessionNotes])} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded font-bold shadow-md transition-colors font-fantasy uppercase tracking-wider text-xs border border-purple-500">+ Nueva Entrada</button>
                                            <button onClick={() => setNotesModalOpen(false)} className="text-gray-400 hover:text-white text-3xl leading-none transition-colors">&times;</button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                                        {sessionNotes.map((note) => (
                                            <div key={note.id} className="bg-gray-900/60 p-5 rounded-lg border border-gray-700 relative group shadow-inner">
                                                <input type="text" placeholder="Ej: Sesión 1" value={note.date} onChange={e => setSessionNotes(sessionNotes.map(n => n.id === note.id ? {...n, date: e.target.value} : n))} className="bg-transparent border-b border-gray-600 text-purple-300 font-bold mb-4 outline-none focus:border-purple-400 w-1/2 font-fantasy tracking-wider" />
                                                <textarea value={note.text} onChange={e => setSessionNotes(sessionNotes.map(n => n.id === note.id ? {...n, text: e.target.value} : n))} placeholder="Ej: PNJs, botín y sucesos..." className="w-full bg-gray-950 border border-gray-800 rounded p-4 text-gray-300 text-sm outline-none focus:border-purple-500 min-h-[200px] resize-y leading-relaxed" />
                                                <button onClick={() => confirmDelete(`¿Borrar las notas de la sesión "${note.date}"?`, () => setSessionNotes(sessionNotes.filter(n => n.id !== note.id)))} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 font-bold transition-opacity text-xl">×</button>
                                            </div>
                                        ))}
                                        {sessionNotes.length === 0 && <div className="text-center text-gray-600 italic mt-10 font-fantasy text-lg tracking-widest uppercase">El diario está vacío.</div>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONFIRMAR BORRADO */}
                        {enemySourceChoiceOpen && <div className="fixed inset-0 z-[78] flex items-center justify-center bg-black/80 p-4"><div className="rpg-panel w-full max-w-sm border border-orange-700 p-5"><h3 className="font-fantasy text-lg font-bold text-orange-200">Añadir enemigo</h3><p className="mt-2 text-sm text-gray-400">Elige el origen de la aparición.</p><div className="mt-5 grid gap-2"><button type="button" onClick={() => { setEnemySourceChoiceOpen(false); setBestiaryEnemySelectorOpen(true); }} className="min-h-12 rounded border border-orange-700 bg-orange-950/30 px-3 text-left text-sm text-orange-100">Seleccionar del Bestiario</button><button type="button" onClick={openDirectEnemyModal} className="min-h-12 rounded border border-gray-600 px-3 text-left text-sm text-gray-200">Crear enemigo puntual</button><button type="button" onClick={() => setEnemySourceChoiceOpen(false)} className="min-h-10 rounded border border-gray-700 text-sm text-gray-400">Cancelar</button></div></div></div>}

                        {bestiaryEnemySelectorOpen && (() => { const tags = [...new Set(bestiary.monsters.flatMap(monster => monster.tags))].sort(); const query = bestiaryEnemyQuery.trim().toLocaleLowerCase('es'); const monsters = bestiary.monsters.filter(monster => (!query || monster.name.toLocaleLowerCase('es').includes(query) || monster.tags.some(tag => tag.toLocaleLowerCase('es').includes(query))) && (!bestiaryEnemyTag || monster.tags.includes(bestiaryEnemyTag))); return <div className="fixed inset-0 z-[79] flex items-center justify-center bg-black/80 p-4"><div className="rpg-panel flex max-h-[90vh] w-full max-w-lg flex-col border border-orange-700 p-5"><div className="flex items-center justify-between gap-2"><h3 className="font-fantasy text-lg font-bold text-orange-200">Seleccionar del Bestiario</h3><button type="button" onClick={() => setBestiaryEnemySelectorOpen(false)} className="h-10 w-10 rounded border border-gray-600 text-xl text-gray-200">×</button></div><div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]"><input autoFocus value={bestiaryEnemyQuery} onChange={event => setBestiaryEnemyQuery(event.target.value)} placeholder="Buscar criatura" className="min-h-10 rounded border border-gray-600 bg-gray-950 px-3 text-white"/><select value={bestiaryEnemyTag} onChange={event => setBestiaryEnemyTag(event.target.value)} className="min-h-10 rounded border border-gray-600 bg-gray-950 px-2 text-white"><option value="">Todas las etiquetas</option>{tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}</select></div><div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">{monsters.map(monster => <button key={monster.id} type="button" onClick={() => openBestiaryEnemyDraft(monster)} className="flex w-full items-center gap-3 rounded border border-gray-700 bg-gray-900/60 p-3 text-left hover:border-orange-500"><span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded border border-orange-800 text-orange-100">{monster.avatarDataUrl ? <img src={monster.avatarDataUrl} alt="" className="h-full w-full object-cover"/> : monster.name.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{monster.name}</strong><span className="text-xs text-gray-400">PV {monster.maxHp} · CA {monster.armorClass ?? '—'}</span></span></button>)}{!monsters.length && <p className="py-6 text-center text-sm text-gray-500">No hay plantillas disponibles.</p>}</div></div></div>; })()}

                        {bestiaryEnemyDraft && (
                            <div className="fixed inset-0 z-[82] flex items-center justify-center bg-black/80 p-3 sm:p-4">
                                <div className="rpg-panel flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden border border-orange-700">
                                    <div className="flex items-center justify-between gap-3 border-b border-orange-900/70 px-4 py-3 sm:px-5 sm:py-4">
                                        <div>
                                            <h3 className="font-fantasy text-lg font-bold text-orange-200">Preparar enemigos del Bestiario</h3>
                                            <p className="mt-1 text-xs text-gray-400">Configura las copias antes de crearlas.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setBestiaryEnemyDraft(null)}
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-600 text-xl text-gray-200"
                                            aria-label="Cerrar configuración del Bestiario"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
                                        <section className="rounded border border-gray-700 bg-gray-950/35 p-3 sm:p-4">
                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-orange-100">Datos de la aparición</h4>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                <label className="text-sm text-gray-300">
                                                    Nombre base
                                                    <input
                                                        value={bestiaryEnemyDraft.name}
                                                        onChange={event => setBestiaryEnemyDraft(previous => ({ ...previous, name: event.target.value }))}
                                                        className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-white"
                                                    />
                                                </label>
                                                <label className="text-sm text-gray-300">
                                                    PV máximos
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        inputMode="numeric"
                                                        value={bestiaryEnemyDraft.maxHp}
                                                        onChange={event => setBestiaryEnemyDraft(previous => ({ ...previous, maxHp: event.target.value }))}
                                                        className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
                                                    />
                                                </label>
                                                <label className="text-sm text-gray-300">
                                                    CA
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        inputMode="numeric"
                                                        value={bestiaryEnemyDraft.armorClass}
                                                        onChange={event => setBestiaryEnemyDraft(previous => ({ ...previous, armorClass: event.target.value }))}
                                                        className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
                                                    />
                                                </label>
                                            </div>
                                            <p className="mt-3 text-xs text-gray-400">Cada copia empieza con {bestiaryEnemyDraft.maxHp || 0}/{bestiaryEnemyDraft.maxHp || 0} PV y 0 PV temporales.</p>
                                        </section>

                                        <section className="rounded border border-gray-700 bg-gray-950/35 p-3 sm:p-4">
                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-orange-100">Copias y nombres</h4>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                <label className="text-sm text-gray-300">
                                                    Cantidad
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="50"
                                                        inputMode="numeric"
                                                        value={bestiaryEnemyDraft.quantity}
                                                        onChange={event => updateBestiaryEnemyCopies({ quantity: event.target.value })}
                                                        onBlur={() => {
                                                            if (bestiaryEnemyDraft.quantity === '') updateBestiaryEnemyCopies({ quantity: 1 });
                                                        }}
                                                        className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
                                                    />
                                                </label>
                                                <label className="text-sm text-gray-300">
                                                    Nombres
                                                    <select
                                                        value={bestiaryEnemyDraft.nameMode}
                                                        onChange={event => updateBestiaryEnemyCopies({ nameMode: event.target.value })}
                                                        className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-white"
                                                    >
                                                        <option value="letters">Letras</option>
                                                        <option value="numbers">Números</option>
                                                        <option value="manual">Manual</option>
                                                        <option value="same">Mismo nombre</option>
                                                    </select>
                                                </label>
                                            </div>
                                            <div className="mt-3 space-y-2">
                                                {bestiaryEnemyDraft.copyNames.map((copyName, index) => (
                                                    <label key={index} className="flex min-h-10 items-center gap-2 text-sm text-gray-400">
                                                        <span className="w-7 shrink-0 text-right text-xs">{index + 1}</span>
                                                        <input
                                                            disabled={bestiaryEnemyDraft.nameMode !== 'manual'}
                                                            value={copyName}
                                                            onChange={event => setBestiaryEnemyDraft(previous => ({
                                                                ...previous,
                                                                copyNames: previous.copyNames.map((item, itemIndex) => itemIndex === index ? event.target.value : item)
                                                            }))}
                                                            className="min-h-10 min-w-0 flex-1 rounded border border-gray-700 bg-gray-900 px-3 text-white disabled:cursor-default disabled:opacity-70"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </section>

                                        <section className="rounded border border-cyan-800/70 bg-cyan-950/15 p-3 sm:p-4">
                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-cyan-100">Iniciativas</h4>
                                            {Number(bestiaryEnemyDraft.quantity) > 1 && (
                                                <label className="mt-3 block text-sm text-gray-300">
                                                    Modo de iniciativa
                                                    <select
                                                        value={bestiaryEnemyDraft.initiativeMode}
                                                        onChange={event => setBestiaryEnemyDraft(previous => ({ ...previous, initiativeMode: event.target.value }))}
                                                        className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-white"
                                                    >
                                                        <option value="same">Misma para todas</option>
                                                        <option value="manual">Manual por copia</option>
                                                        <option value="none">Dejar sin iniciativa</option>
                                                    </select>
                                                </label>
                                            )}

                                            {bestiaryEnemyDraft.initiativeMode === 'same' && (
                                                <div className="mt-3">
                                                    <label className="text-sm text-gray-300">
                                                        Iniciativa
                                                        <input
                                                            type="number"
                                                            inputMode="numeric"
                                                            value={bestiaryEnemyDraft.initiative}
                                                            onChange={event => setBestiaryEnemyDraft(previous => ({
                                                                ...previous,
                                                                initiative: event.target.value,
                                                                copyInitiatives: previous.copyInitiatives.map(() => event.target.value)
                                                            }))}
                                                            placeholder="Ej. 14"
                                                            className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
                                                        />
                                                    </label>
                                                </div>
                                            )}

                                            {Number(bestiaryEnemyDraft.quantity) > 1 && bestiaryEnemyDraft.initiativeMode === 'manual' && (
                                                <div className="mt-3 space-y-2">
                                                    {bestiaryEnemyDraft.copyNames.map((copyName, index) => (
                                                        <label key={index} className="grid min-h-10 grid-cols-[minmax(0,1fr)_7rem] items-center gap-2 text-sm text-gray-300">
                                                            <span className="truncate">{copyName}</span>
                                                            <input
                                                                type="number"
                                                                inputMode="numeric"
                                                                value={bestiaryEnemyDraft.copyInitiatives?.[index] ?? ''}
                                                                onChange={event => setBestiaryEnemyDraft(previous => ({
                                                                    ...previous,
                                                                    copyInitiatives: previous.copyInitiatives.map((value, valueIndex) => valueIndex === index ? event.target.value : value)
                                                                }))}
                                                                placeholder="Iniciativa"
                                                                className="min-h-10 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
                                                            />
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {Number(bestiaryEnemyDraft.quantity) > 1 && bestiaryEnemyDraft.initiativeMode === 'none' && (
                                                <p className="mt-3 rounded border border-yellow-800 bg-yellow-950/30 px-3 py-2 text-xs text-yellow-100">Se crearán sin iniciativa y no se podrá iniciar el encuentro hasta completarlas.</p>
                                            )}
                                        </section>
                                    </div>

                                    <div className="flex flex-wrap justify-end gap-2 border-t border-gray-700 px-4 py-3 sm:px-5 sm:py-4">
                                        <button type="button" onClick={() => setBestiaryEnemyDraft(null)} className="min-h-11 rounded border border-gray-600 px-4 text-sm text-gray-300">Cancelar</button>
                                        <button type="button" disabled={creatingEnemy} onClick={createEnemyFromBestiaryDraft} className="min-h-11 rounded border border-orange-700 bg-orange-950/30 px-4 text-sm font-bold text-orange-100 disabled:opacity-50">{creatingEnemy ? 'Creando…' : 'Crear enemigo'}</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {confirmDialog.isOpen && (
                            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                                <div className={`rpg-panel border ${confirmDialog.isAlert ? 'border-fuchsia-600' : 'border-red-600'} rounded-lg p-6 max-w-sm w-full shadow-2xl animate-attack`}>
                                    <h3 className="text-xl font-fantasy font-bold text-white mb-2 tracking-widest uppercase">{confirmDialog.isAlert ? 'Aviso del Sistema' : 'Confirmar Acción'}</h3>
                                    <p className="text-gray-300 text-sm mb-8 leading-relaxed">{confirmDialog.message}</p>
                                    <div className="flex justify-end space-x-3">
                                        {!confirmDialog.isAlert && (
                                            <button onClick={closeConfirm} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded font-bold transition-colors text-xs uppercase tracking-wider">Cancelar</button>
                                        )}
                                        <button onClick={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); closeConfirm(); }} className={`px-4 py-2 text-white rounded font-bold transition-colors text-xs uppercase tracking-wider border ${confirmDialog.isAlert || confirmDialog.confirmTone === 'primary' ? 'bg-fuchsia-700 hover:bg-fuchsia-600 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-red-700 hover:bg-red-600 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]'}`}>
                                            {confirmDialog.confirmLabel || (confirmDialog.isAlert ? 'Entendido' : 'Eliminar')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MODAL HABILIDADES */}
                        {skillModal.isOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setSkillModal({ isOpen: false, skillKey: null, skillName: "" })}>
                                <div className="rpg-panel border border-purple-500/50 rounded-lg p-6 max-w-sm w-full shadow-2xl animate-attack" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                                        <h3 className="text-xl font-fantasy font-bold text-white tracking-widest">{skillModal.skillName}</h3>
                                        <button onClick={() => setSkillModal({ isOpen: false, skillKey: null, skillName: "" })} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
                                    </div>
                                    <div className="space-y-3">
                                        <button onClick={() => updateSkillProficiency('none')} className={`w-full py-3 rounded border text-sm font-bold font-fantasy tracking-wider uppercase transition-colors ${!proficiencies.expertise.includes(skillModal.skillKey) && !proficiencies.proficient.includes(skillModal.skillKey) ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'}`}>
                                            Sin Competencia
                                        </button>
                                        <button onClick={() => updateSkillProficiency('proficient')} className={`w-full py-3 rounded border text-sm font-bold font-fantasy tracking-wider uppercase transition-colors flex items-center justify-center space-x-3 ${proficiencies.proficient.includes(skillModal.skillKey) ? 'bg-purple-900/40 border-purple-500 text-purple-300' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-purple-500/50'}`}>
                                            <div className="w-3 h-3 rounded-full bg-purple-500 border border-purple-300"></div><span>Competencia</span>
                                        </button>
                                        <button onClick={() => updateSkillProficiency('expertise')} className={`w-full py-3 rounded border text-sm font-bold font-fantasy tracking-wider uppercase transition-colors flex items-center justify-center space-x-3 ${proficiencies.expertise.includes(skillModal.skillKey) ? 'bg-fuchsia-900/40 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-fuchsia-500/50'}`}>
                                            <div className="w-3 h-3 rounded-full bg-fuchsia-500 border border-fuchsia-300 shadow-[0_0_8px_rgba(217,70,239,0.8)]"></div><span>Pericia</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MODAL GENÉRICO AÑADIR */}
                        <EquipmentCompendiumModal
                            open={equipmentCompendiumOpen}
                            items={marketCompendiumItems}
                            query={equipmentCompendiumQuery}
                            category={equipmentCompendiumCategory}
                            onQueryChange={setEquipmentCompendiumQuery}
                            onCategoryChange={setEquipmentCompendiumCategory}
                            onClose={() => setEquipmentCompendiumOpen(false)}
                            onChoose={item => {
                                const magicDetails = [
                                    item.data?.desc,
                                    item.rarity && `Rareza: ${item.rarity}`,
                                    item.attunement && 'Requiere sintonización.'
                                ].filter(Boolean).join('\n');
                                const itemData = { name: item.name, ...item.data, desc: magicDetails, sourceId: item.id, weaponCategory: item.category };
                                if (item.type === 'weapon') {
                                    const magicBonuses = [...String(`${item.name} ${item.data?.desc || ''}`).matchAll(/\+([123])\b/g)].map(match => Number(match[1]));
                                    const magicBonus = [...new Set(magicBonuses)].length === 1 ? magicBonuses[0] : 0;
                                    const proficient = hasWeaponProficiency(item.name, item.category);
                                    itemData.attacks = (item.data?.attacks || []).map(attack => {
                                        const attackAbility = inferWeaponAbility(attack);
                                        const prepared = { ...attack, autoAttack: true, attackAbility, proficient, autoProficiency: true, weaponName: item.name, weaponCategory: item.category, magicBonus };
                                        return { ...prepared, atk: getWeaponAttackBonus(prepared) };
                                    });
                                }
                                setAddModal({ isOpen: true, type: item.type, data: itemData });
                                setEquipmentCompendiumOpen(false);
                            }}
                        />
                        {addModal.isOpen && (
                            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 ${(addModal.type === 'weapon' || addModal.type === 'attack') ? 'arsenal-editor-backdrop' : ''}`} onClick={() => setAddModal({isOpen:false, type:null, data:{}})}>
                                <div className={`rpg-panel border border-purple-500/50 rounded-lg p-6 max-w-md w-full shadow-2xl animate-attack ${(addModal.type === 'weapon' || addModal.type === 'attack') ? `arsenal-editor-dialog is-${addModal.type}` : ''}`} onClick={e => e.stopPropagation()}>
                                    <div className={`flex justify-between items-center mb-6 border-b border-gray-700 pb-3 ${(addModal.type === 'weapon' || addModal.type === 'attack') ? 'arsenal-editor-header' : ''}`}>
                                        {(addModal.type === 'weapon' || addModal.type === 'attack') ? <><span className="arsenal-editor-emblem" aria-hidden="true"><CombatSectionIcon section="arsenal" /></span><div><small>{addModal.type === 'weapon' ? 'Preparar equipo' : `Acción para ${selectedWeapon?.name || 'el arma'}`}</small><h3>{addModal.type === 'weapon' ? 'Nueva arma' : 'Nueva acción'}</h3><p>{addModal.type === 'weapon' ? 'Añádela al arsenal y revisa su configuración antes de usarla.' : 'Define cómo impacta, qué daño causa y cualquier propiedad útil.'}</p></div></> : <h3 className="text-xl font-fantasy font-bold text-white tracking-widest uppercase">Creación</h3>}
                                        <button onClick={() => setAddModal({isOpen:false, type:null, data:{}})} className={(addModal.type === 'weapon' || addModal.type === 'attack') ? 'arsenal-editor-close' : 'text-gray-500 hover:text-white text-3xl leading-none'} aria-label="Cerrar">&times;</button>
                                    </div>

                                    <div className={`space-y-5 ${(addModal.type === 'weapon' || addModal.type === 'attack') ? 'arsenal-editor-body' : ''}`}>
                                        {(addModal.type === 'item' || addModal.type === 'armor' || addModal.type === 'tool' || addModal.type === 'weapon' || addModal.type === 'resource' || addModal.type === 'spell' || addModal.type === 'attack') && (
                                            <div className={(addModal.type === 'weapon' || addModal.type === 'attack') ? 'arsenal-editor-name' : ''}>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Nombre del Elemento</label>
                                                <input type="text" autoFocus placeholder={addNamePlaceholders[addModal.type] || 'Nombre'} value={addModal.data.name || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, name: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none" />
                                            </div>
                                        )}

                                        {addModal.type === 'item' && (
                                            <div className="flex gap-4">
                                                <div className="w-1/3">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Cant.</label>
                                                    <input type="number" placeholder="1" value={addModal.data.qty || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, qty: handleNumInput(e.target.value)}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none text-center" />
                                                </div>
                                                <div className="w-2/3">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Breve Desc.</label>
                                                    <input type="text" placeholder="Ej: 50 pies de cuerda" value={addModal.data.desc || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, desc: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none" />
                                                </div>
                                            </div>
                                        )}

                                        {addModal.type === 'armor' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Categoría</label>
                                                    <select value={addModal.data.type || 'light'} onChange={e => setAddModal({...addModal, data: {...addModal.data, type: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none appearance-none">
                                                        <option value="light">Armadura Ligera</option>
                                                        <option value="medium">Armadura Media</option>
                                                        <option value="heavy">Armadura Pesada</option>
                                                        <option value="shield">Escudo</option>
                                                    </select>
                                                </div>
                                                <div className="rounded border border-purple-900/70 bg-purple-950/20 px-3 py-2 text-xs text-purple-200">Cálculo de CA: <b>{getArmorFormula({ type: addModal.data.type || 'light', ac: addModal.data.ac })}</b></div>
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Clase de Armadura (CA) que otorga</label>
                                                    <input type="number" placeholder="Ej: 11" value={addModal.data.ac || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, ac: handleNumInput(e.target.value)}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none" />
                                                </div>
                                                <label className="flex items-center space-x-3 text-sm text-gray-300 cursor-pointer pt-2 bg-gray-900/50 p-3 rounded border border-gray-800">
                                                    <input type="checkbox" checked={addModal.data.stealthDis || false} onChange={e => setAddModal({...addModal, data: {...addModal.data, stealthDis: e.target.checked}})} className="w-5 h-5 accent-red-600 bg-gray-950 border-gray-700 rounded" />
                                                    <span className="font-medium">Impone Desventaja en Sigilo</span>
                                                </label>
                                            </div>
                                        )}

                                        {addModal.type === 'tool' && (
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Para qué sirve</label>
                                                <textarea placeholder="Ej: Abrir cerraduras y desarmar trampas." value={addModal.data.desc || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, desc: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none h-24 resize-y leading-relaxed" />
                                            </div>
                                        )}

                                        {addModal.type === 'weapon' && (
                                            <div className="arsenal-weapon-form space-y-3 rounded border border-cyan-900/70 bg-cyan-950/15 p-3">
                                                {Array.isArray(addModal.data.attacks) && addModal.data.attacks.length > 0 && <div className="weapon-import-preview"><header><span>Cálculo de ataque</span><small>Se actualizará con tu ficha</small></header>{addModal.data.attacks.map((attack, attackIndex) => <div key={`${attack.name}-${attackIndex}`} className="weapon-import-attack"><div><strong>{attack.name || addModal.data.name}</strong><small>{attack.dmg || 'Daño sin indicar'}</small></div><label><span>Característica</span><select value={attack.attackAbility || 'fue'} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, attacks: previous.data.attacks.map((item, index) => index === attackIndex ? { ...item, attackAbility: event.target.value, autoAttack: true } : item) } }))}><option value="fue">Fuerza</option><option value="des">Destreza</option><option value="finesse">Mejor entre FUE/DES</option></select></label><label className="weapon-import-proficiency" title={attack.autoProficiency ? 'Detectado a partir de las competencias de la ficha' : 'Ajustado manualmente'}><input type="checkbox" checked={getWeaponAttackProficiency(attack)} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, attacks: previous.data.attacks.map((item, index) => index === attackIndex ? { ...item, proficient: event.target.checked, autoProficiency: false, autoAttack: true } : item) } }))}/><span>Competente</span></label><div className="weapon-import-result"><small>A impactar</small><strong>{getWeaponAttackBonus(attack)}</strong></div></div>)}</div>}
                                                <label className="flex items-center gap-3 text-sm font-semibold text-cyan-100"><input type="checkbox" checked={addModal.data.usesAmmo === true || (addModal.data.usesAmmo === undefined && Array.isArray(addModal.data.attacks) && addModal.data.attacks.some(attack => /munici[oó]n/i.test(String(attack.notes || ''))))} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, usesAmmo: event.target.checked } }))} className="h-5 w-5 accent-cyan-600"/><span>Usa munición del inventario</span></label>
                                                {(addModal.data.usesAmmo === true || (addModal.data.usesAmmo === undefined && Array.isArray(addModal.data.attacks) && addModal.data.attacks.some(attack => /munici[oó]n/i.test(String(attack.notes || ''))))) && <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pila de munición<select value={addModal.data.ammoItemId || ''} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, ammoItemId: event.target.value } }))} className="mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case tracking-normal text-white"><option value="">Vincular más tarde</option>{inventory.map(item => <option key={item.id} value={item.id}>{item.name} · {Math.max(0, Number(item.qty) || 0)}</option>)}</select></label>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Por disparo<input type="number" min="1" value={addModal.data.ammoPerShot || 1} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, ammoPerShot: Math.max(1, Math.trunc(Number(event.target.value) || 1)) } }))} className="mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-center text-sm text-white"/></label>
                                                </div>}
                                                <p className="text-xs text-gray-400">La cantidad del objeto elegido será la reserva única para esta arma y la mochila.</p>
                                            </div>
                                        )}
                                        
                                        {(addModal.type === 'trait' || addModal.type === 'feat') && (
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Título</label>
                                                <input type="text" autoFocus placeholder={addModal.type === 'trait' ? 'Ej: Visión en la oscuridad' : 'Ej: Alerta'} value={addModal.data.title || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, title: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none" />
                                            </div>
                                        )}

                                        {(addModal.type === 'trait' || addModal.type === 'feat') && (
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Descripción Detallada</label>
                                                <textarea placeholder="Ej: Describe el beneficio o cómo se usa." value={addModal.data.desc || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, desc: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none h-32 resize-y leading-relaxed" />
                                            </div>
                                        )}

                                        {addModal.type === 'attack' && (
                                            <div className="arsenal-action-fields">
                                                <section className="arsenal-action-attack"><header><div><small>Cálculo para impactar</small><strong>{addModal.data.autoAttack ? 'Automático desde la ficha' : 'Valor manual'}</strong></div><label><input type="checkbox" checked={addModal.data.autoAttack === true} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, autoAttack: event.target.checked } }))}/><span><i></i></span></label></header>{addModal.data.autoAttack ? <div className="arsenal-action-auto"><label><span>Característica</span><select value={addModal.data.attackAbility || 'fue'} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, attackAbility: event.target.value } }))}><option value="fue">Fuerza</option><option value="des">Destreza</option><option value="finesse">Mejor FUE/DES</option></select></label><label className="is-proficient"><input type="checkbox" checked={getWeaponAttackProficiency(addModal.data, selectedWeapon)} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, proficient: event.target.checked, autoProficiency: false } }))}/><span>Sumar competencia</span></label><div><small>A impactar</small><strong>{getWeaponAttackBonus(addModal.data, selectedWeapon)}</strong></div></div> : <label className="arsenal-action-manual"><span>Bono de ataque</span><input type="text" placeholder="Ej: +6" value={addModal.data.atk || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, atk: e.target.value}})}/></label>}</section>
                                                <label className="arsenal-action-damage"><span>Daño y tipo</span><small>Dados, modificador y naturaleza del daño</small><input type="text" placeholder="Ej: 1d8 + 4 cortante" value={addModal.data.dmg || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, dmg: e.target.value}})}/></label>
                                            </div>
                                        )}

                                        {(addModal.type === 'attack' || addModal.type === 'spell') && (
                                            <div className={addModal.type === 'attack' ? 'arsenal-action-notes' : ''}>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Notas / Efectos Adicionales</label>
                                                <textarea placeholder="Ej: Efecto, condición o nota útil." value={addModal.data.notes || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, notes: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none h-28 resize-y leading-relaxed" />
                                            </div>
                                        )}

                                        {addModal.type === 'spell' && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Nivel (0 = Truco)</label>
                                                        <input type="number" min="0" max="9" placeholder="3" value={addModal.data.level ?? ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, level: handleNumInput(e.target.value)}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none text-center font-mono" />
                                                        {Number(addModal.data.level) === 0 && <span className="text-[10px] text-fuchsia-300">Truco: no consume ranuras ni se prepara.</span>}
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Alcance</label>
                                                        <input type="text" placeholder="Ej: 150 pies" value={addModal.data.range || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, range: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Forma de Área</label>
                                                        <input type="text" placeholder="Ej: Esfera" value={addModal.data.shape || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, shape: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Tamaño Área</label>
                                                        <input type="text" placeholder="Ej: 20 pies" value={addModal.data.size || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, size: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3 mt-2 bg-gray-900/50 p-4 rounded border border-gray-800">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 block font-fantasy border-b border-gray-700 pb-1">Componentes Requeridos</label>
                                                    <div className="flex gap-6">
                                                        <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer font-bold">
                                                            <input type="checkbox" checked={addModal.data.compV || false} onChange={e => setAddModal({...addModal, data: {...addModal.data, compV: e.target.checked}})} className="w-4 h-4 accent-fuchsia-600 bg-gray-950 border-gray-700 rounded" />
                                                            <span>V <span className="text-[10px] font-normal text-gray-500">(Verbal)</span></span>
                                                        </label>
                                                        <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer font-bold">
                                                            <input type="checkbox" checked={addModal.data.compS || false} onChange={e => setAddModal({...addModal, data: {...addModal.data, compS: e.target.checked}})} className="w-4 h-4 accent-fuchsia-600 bg-gray-950 border-gray-700 rounded" />
                                                            <span>S <span className="text-[10px] font-normal text-gray-500">(Gestos)</span></span>
                                                        </label>
                                                        <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer font-bold">
                                                            <input type="checkbox" checked={addModal.data.compM || false} onChange={e => setAddModal({...addModal, data: {...addModal.data, compM: e.target.checked}})} className="w-4 h-4 accent-fuchsia-600 bg-gray-950 border-gray-700 rounded" />
                                                            <span>M <span className="text-[10px] font-normal text-gray-500">(Objeto)</span></span>
                                                        </label>
                                                    </div>
                                                    {addModal.data.compM && (
                                                        <input type="text" placeholder="Ej: polvo de diamante" value={addModal.data.compMDesc || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, compMDesc: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none text-sm mt-2" />
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <label className="flex min-h-11 items-center gap-3 rounded border border-purple-900/70 bg-purple-950/20 px-3 text-sm text-purple-100"><input type="checkbox" checked={addModal.data.concentration || false} onChange={e => setAddModal({...addModal, data: {...addModal.data, concentration: e.target.checked}})} className="h-5 w-5 accent-purple-600"/><span>Concentración</span></label>
                                                    <label className="flex min-h-11 items-center gap-3 rounded border border-gray-700 bg-gray-900/50 px-3 text-sm text-gray-200"><input type="checkbox" checked={addModal.data.ritual || false} onChange={e => setAddModal({...addModal, data: {...addModal.data, ritual: e.target.checked}})} className="h-5 w-5 accent-purple-600"/><span>Ritual</span></label>
                                                </div>
                                                <div className="space-y-3 rounded border border-cyan-900/60 bg-cyan-950/10 p-3">
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-cyan-200">Origen y funcionamiento<select value={addModal.data.grantType || 'standard'} onChange={e => setAddModal({...addModal, data: {...addModal.data, grantType: e.target.value, countsPreparation: false, countsKnownLimit: e.target.value === 'standard'}})} className="mt-1 min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case text-white"><option value="standard">Conjuro normal</option><option value="species">Concedido por especie</option><option value="class">Concedido por clase</option><option value="subclass">Concedido por subclase</option><option value="feat">Concedido por dote</option><option value="item">Concedido por objeto</option></select></label>
                                                    {(addModal.data.grantType || 'standard') !== 'standard' && <input value={addModal.data.grantSource || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, grantSource: e.target.value}})} placeholder="Nombre del rasgo, dote u objeto" className="min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-3 text-sm text-white"/>}
                                                    <div className="grid gap-2 sm:grid-cols-2"><label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={addModal.data.countsPreparation ?? false} onChange={e => setAddModal({...addModal, data: {...addModal.data, countsPreparation: e.target.checked}})} className="h-4 w-4 accent-cyan-600"/>Consume preparación</label><label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={addModal.data.countsKnownLimit ?? (addModal.data.grantType || 'standard') === 'standard'} onChange={e => setAddModal({...addModal, data: {...addModal.data, countsKnownLimit: e.target.checked}})} className="h-4 w-4 accent-cyan-600"/>Cuenta contra conocidos</label></div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Recurso de lanzamiento<select value={addModal.data.castingResource || 'slots'} onChange={e => setAddModal({...addModal, data: {...addModal.data, castingResource: e.target.value}})} className="mt-1 min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case text-white"><option value="slots">Ranuras normales</option><option value="independent">Usos propios independientes</option><option value="at-will">A voluntad</option></select></label>
                                                    {addModal.data.castingResource === 'independent' && <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Usos máximos<input type="number" min="1" value={addModal.data.ownUsesMax || 1} onChange={e => setAddModal({...addModal, data: {...addModal.data, ownUsesMax: Math.max(1, Number(e.target.value) || 1), ownUsesCurrent: Math.max(1, Number(e.target.value) || 1)}})} className="mt-1 min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-center text-sm text-white"/></label>}
                                                </div>
                                            </>
                                        )}

                                        {addModal.type === 'resource' && (
                                            <div className="space-y-3">
                                            <div className="flex gap-4">
                                                <div className="w-1/2">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Usos Máximos</label>
                                                    <input type="number" placeholder="3" value={addModal.data.max || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, max: handleNumInput(e.target.value)}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none text-center font-mono" />
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Tipo de Dado</label>
                                                    <input type="text" placeholder="Ej: d8" value={addModal.data.dice || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, dice: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none text-center font-mono" />
                                                </div>
                                            </div>
                                            <label className="block text-sm text-gray-300">Se recupera con<select value={addModal.data.recoveryRest || 'manual'} onChange={e => setAddModal({...addModal, data:{...addModal.data,recoveryRest:e.target.value}})} className="block mt-1 w-full bg-gray-950 border border-gray-700 rounded p-2"><option value="short">Descanso corto (también largo)</option><option value="long">Descanso largo</option><option value="manual">Solo manualmente</option></select></label>
                                            {addModal.data.recoveryRest !== 'manual' && <label className="block text-sm text-gray-300">Cantidad recuperada<select value={addModal.data.recoveryMode || 'full'} onChange={e => setAddModal({...addModal, data:{...addModal.data,recoveryMode:e.target.value}})} className="block mt-1 w-full bg-gray-950 border border-gray-700 rounded p-2"><option value="full">Completa</option><option value="fixed">Cantidad fija</option><option value="half">Mitad</option><option value="manual">Manual</option></select></label>}
                                            </div>
                                        )}

                                    </div>
                                    <div className={`flex justify-end space-x-4 mt-8 pt-5 border-t border-gray-700 ${(addModal.type === 'weapon' || addModal.type === 'attack') ? 'arsenal-editor-footer' : ''}`}>
                                        <button onClick={() => setAddModal({isOpen:false, type:null, data:{}})} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded font-bold transition-colors font-fantasy uppercase tracking-wider text-xs">Cancelar</button>
                                        <button onClick={handleAddSubmit} className="px-6 py-2 bg-purple-700 hover:bg-purple-600 border border-purple-500 text-white rounded font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all transform hover:scale-105 font-fantasy uppercase tracking-wider text-xs">{addModal.type === 'weapon' ? 'Añadir al arsenal' : addModal.type === 'attack' ? 'Añadir acción' : 'Registrar'}</button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<KaelCharacterSheet />);
