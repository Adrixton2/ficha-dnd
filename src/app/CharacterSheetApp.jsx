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
            normalizeCompanion,
            normalizeRuleLookupText,
            repairSrdLineBreakHyphens,
            getSpellDicePlan,
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
        } = window.DndAppUtils;
        const {
            ONLINE_CONDITIONS,
            calculateEnemyVisibleState,
            createOnlineCompanionParticipant,
            createOnlinePlayerSheetSnapshot,
            createEnemyId,
            getHpValues,
            isValidOnlinePlayerName,
            normalizeHpValue,
            normalizeOnlineConditions,
            normalizeOnlinePlayerName,
            orderOnlineEncounterCombatants,
            serializeOnlinePlayerSheetSnapshot
        } = window.DndOnlineTableUtils;
        const {
            EnemyModal,
            OnlineConditionModal,
            OnlineEffectModal,
            OnlineHpModal,
            OnlinePartyOverview,
            OnlinePlayerSheetModal,
            OnlineRoomModuleSelector,
            OnlineTacticalDetailPanel,
            OnlineCombatantAvatar: OnlineCombatantAvatarView
        } = window.DndOnlineComponents;
        const { DiceRoller, SheetRollPrompt } = window.DndDiceComponents;
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
        const ABILITY_NAMES = Object.freeze({ fue: 'Fuerza', des: 'Destreza', con: 'Constitución', int: 'Inteligencia', sab: 'Sabiduría', car: 'Carisma' });
        const srdMonsterCompendium = window.DndSrdMonsterCompendium?.format === 'dnd-srd-monster-compendium'
            ? window.DndSrdMonsterCompendium
            : { monsters: [], attribution: '' };
        const MONSTER_ICON_REGISTRY = window.DndMonsterIconRegistry || {};
        const getMonsterIconPath = monster => MONSTER_ICON_REGISTRY[monster?.id] || '';

        const { useCharacterManager, useCharacterField } = window.DndCharacterManager;

        const {
            AbilityGlyph,
            CombatSectionIcon,
            CharacterSectionGlyph,
            InventoryGlyph,
            DND_CURRENCIES,
            getCurrencyCopperValue,
            formatCurrencyEquivalent
        } = window.DndCharacterSheetComponents;
        const {
            COMPANION_CATEGORY_LABELS,
            COMPANION_INITIATIVE_LABELS,
            getCompanionAvatar,
            companionConditionNames,
            CompanionAvatar,
            CompanionManagerModal
        } = window.DndCompanionComponents;
        const { SessionMode } = window.DndSessionModeComponents;
        const { InventoryView } = window.DndInventoryViewComponents;
        const { CharacterFooter } = window.DndCharacterFooterComponents;
        const { OnlineTableShell } = window.DndOnlineTableShellComponents;
        const { CombatDashboard } = window.DndCombatDashboardComponents;
        const { CharacterHeader } = window.DndCharacterHeaderComponents;
        const { CharacterWorkspace } = window.DndCharacterWorkspaceComponents;
        const { useOnlineTableController } = window.DndOnlineTableController;
        const { CompendiumDialogs } = window.DndCompendiumDialogComponents;
        const { ActionDialogs } = window.DndActionDialogComponents;
        const { EditorDialogs } = window.DndEditorDialogComponents;

        function KaelCharacterSheet() {
            /* ================= ESTADOS ================= */
            const { manager, activeCharacter, updateActiveData, updateCharacterData, createCharacter, duplicateCharacter, importCharacter, selectCharacter, deleteCharacter, setPortrait } = useCharacterManager();
            const [appSettings, setAppSettings] = useState(loadAppSettings);
            const [appSettingsOpen, setAppSettingsOpen] = useState(false);
            const [diceRollerOpen, setDiceRollerOpen] = useState(false);
            const [sheetRollPrompt, setSheetRollPrompt] = useState(null);
            const [firebaseReady, setFirebaseReady] = useState(false);
            const [firebaseUser, setFirebaseUser] = useState(null);
            const [firebaseError, setFirebaseError] = useState(null);
            const [onlineStatus, setOnlineStatus] = useState(() => navigator.onLine);
            const [onlineTableOpen, setOnlineTableOpen] = useState(false);
            const [onlineTableMotion, setOnlineTableMotion] = useState('idle');
            const [onlineTableDockPosition, setOnlineTableDockPosition] = useState(() => {
                try {
                    const stored = JSON.parse(window.localStorage.getItem('dnd_online_table_dock_position_v1') || 'null');
                    return Number.isFinite(stored?.left) && Number.isFinite(stored?.top) ? { left: stored.left, top: stored.top } : null;
                } catch (error) { return null; }
            });
            const [onlineTableDockDragging, setOnlineTableDockDragging] = useState(false);
            const [onlineTableScreen, setOnlineTableScreen] = useState('menu');
            const [roomCodeInput, setRoomCodeInput] = useState('');
            const [createdRoomCode, setCreatedRoomCode] = useState('');
            const [currentRoom, setCurrentRoom] = useState(null);
            const [roomData, setRoomData] = useState(null);
            const [roomMembers, setRoomMembers] = useState([]);
            const [roomParticipants, setRoomParticipants] = useState([]);
            const [roomPlayerSheets, setRoomPlayerSheets] = useState([]);
            const [onlinePlayerSheetId, setOnlinePlayerSheetId] = useState(null);
            const [publicCombatants, setPublicCombatants] = useState([]);
            const [privateEnemies, setPrivateEnemies] = useState([]);
            const [publicEffects, setPublicEffects] = useState([]);
            const [privateEffects, setPrivateEffects] = useState([]);
            const [conditionModal, setConditionModal] = useState({ isOpen: false, target: null, name: '', source: '', notes: '' });
            const [effectModal, setEffectModal] = useState({ isOpen: false, effectId: null, data: {} });
            const [selectedCombatantId, setSelectedCombatantId] = useState(null);
            const [onlineTableMenuOpen, setOnlineTableMenuOpen] = useState(false);
            const [onlineTableGuideOpen, setOnlineTableGuideOpen] = useState(true);
            const [onlineRoomModule, setOnlineRoomModule] = useState('room');
            const [roomInvite, setRoomInvite] = useState({ isOpen: false, code: '', url: '' });
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
            const [playerNameInput, setPlayerNameInput] = useState(() => loadOnlineTableSession()?.playerName || '');
            const [onlineReconnectState, setOnlineReconnectState] = useState({ status: 'idle', message: '' });
            const [onlinePresenceNow, setOnlinePresenceNow] = useState(() => Date.now());
            const [hpSyncStatus, setHpSyncStatus] = useState('idle');
            const [sheetSyncStatus, setSheetSyncStatus] = useState('idle');
            const [pendingHpSync, setPendingHpSync] = useState(loadPendingHpSync);
            const [hpModal, setHpModal] = useState({ isOpen: false, participantId: null, mode: 'damage', amount: '' });
            const [hpConflict, setHpConflict] = useState(null);
            const [participantsHavePendingWrites, setParticipantsHavePendingWrites] = useState(false);
            const [activityHistoryOpen, setActivityHistoryOpen] = useState(false);
            const [sheetReviewOpen, setSheetReviewOpen] = useState(false);
            const [portraitViewerOpen, setPortraitViewerOpen] = useState(false);
            const [onlineAvatarViewer, setOnlineAvatarViewer] = useState(null);
            const t = (key) => APP_TRANSLATIONS[appSettings.language]?.[key] || APP_TRANSLATIONS.es[key] || key;
            const firebaseConnectionLabel = firebaseError ? 'Error de conexión' : !onlineStatus ? 'Sin conexión' : firebaseReady && firebaseUser ? 'Online' : 'Conectando…';
            const firebaseConnectionClass = firebaseError ? 'border-red-800 bg-red-950/40 text-red-200' : !onlineStatus ? 'border-gray-700 bg-gray-900/70 text-gray-400' : firebaseReady && firebaseUser ? 'border-emerald-700 bg-emerald-950/30 text-emerald-200' : 'border-cyan-800 bg-cyan-950/25 text-cyan-200';
            const isCurrentRoomMaster = !!currentRoom && roomData?.ownerUid === firebaseUser?.uid;
            const canManageEnemies = roomData?.ownerUid === firebaseUser?.uid;
            useEffect(() => {
                if (!currentRoom || currentRoom.collection !== 'campaigns') return;
                setOnlinePresenceNow(Date.now());
                const timer = window.setInterval(() => setOnlinePresenceNow(Date.now()), 30000);
                return () => window.clearInterval(timer);
            }, [currentRoom?.id, currentRoom?.collection]);
            const presenceAwareRoomParticipants = useMemo(() => roomParticipants.map(participant => {
                const member = roomMembers.find(item => item.uid === participant.ownerUid);
                const lastSeenAt = Number(member?.lastSeen?.toMillis?.() || member?.lastSeen?.seconds * 1000 || 0);
                const presenceExpired = currentRoom?.collection === 'campaigns' && lastSeenAt > 0 && onlinePresenceNow - lastSeenAt > 150000;
                return presenceExpired && participant.connected !== false ? { ...participant, connected: false } : participant;
            }), [roomParticipants, roomMembers, currentRoom?.collection, onlinePresenceNow]);
            const playerRoomParticipants = useMemo(() => presenceAwareRoomParticipants.filter(participant => participant.type !== 'companion'), [presenceAwareRoomParticipants]);
            const companionRoomParticipants = useMemo(() => presenceAwareRoomParticipants.filter(participant => participant.type === 'companion'), [presenceAwareRoomParticipants]);
            const encounterParticipants = useMemo(() => {
                const encounterOrder = Array.isArray(roomData?.turnOrder) ? roomData.turnOrder : [];
                return presenceAwareRoomParticipants.filter(participant => {
                    const hasActiveMembership = roomMembers.some(member => member.uid === participant.ownerUid && member.active !== false);
                    const isInCurrentEncounter = encounterOrder.includes(participant.id);
                    return hasActiveMembership && (participant.connected !== false || isInCurrentEncounter);
                });
            }, [presenceAwareRoomParticipants, roomMembers, roomData?.turnOrder]);
            const encounterCombatants = [...encounterParticipants, ...publicCombatants];
            const encounterEffects = [...publicEffects, ...(canManageEnemies ? privateEffects : [])];
            const getCombatant = (id) => encounterCombatants.find(combatant => combatant.id === id || combatant.ownerUid === id)
                || presenceAwareRoomParticipants.find(combatant => combatant.id === id || combatant.ownerUid === id)
                || null;
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
            const ownRoomParticipant = playerRoomParticipants.find(participant => participant.ownerUid === firebaseUser?.uid && participant.characterId === sharedCharacterId) || null;
            const [charInfo, setCharInfo] = useCharacterField(activeCharacter.data, updateActiveData, 'charInfo');
            const [characterBuild, setCharacterBuild] = useCharacterField(activeCharacter.data, updateActiveData, 'characterBuild');
            const [characterHeaderMenuOpen, setCharacterHeaderMenuOpen] = useState(false);
            const [level, setLevel] = useCharacterField(activeCharacter.data, updateActiveData, 'level');
            const PROF_BONUS = Math.ceil((Number(level) || 1) / 4) + 1;

            const [inspiration, setInspiration] = useCharacterField(activeCharacter.data, updateActiveData, 'inspiration');
            const [guidance, setGuidance] = useCharacterField(activeCharacter.data, updateActiveData, 'guidance');

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
            const [companions = [], setCompanions] = useCharacterField(activeCharacter.data, updateActiveData, 'companions');
            const [companionManagerOpen, setCompanionManagerOpen] = useState(false);
            const [companionFocusId, setCompanionFocusId] = useState(null);
            const [companionFocusField, setCompanionFocusField] = useState(null);
            const [resourceDrag, setResourceDrag] = useState({ id: null, targetId: null, x: 0, y: 0, left: 0, top: 0, width: 0, height: 0 });
            const resourcePressRef = useRef(null);
            const resourceLongPressTimerRef = useRef(null);
            const resourceReorderTargetRef = useRef(null);
            const resourceCardRefs = useRef(new Map());
            const resourceGridRef = useRef(null);
            const resourceDragListenersRef = useRef(null);
            const roomListenersRef = useRef({ code: null, room: null, membership: null, members: null, participants: null, playerSheets: null, publicCombatants: null, privateEnemies: null, publicEffects: null, privateEffects: null });
            const leavingRoomRef = useRef(false);
            const onlineTableMotionTimerRef = useRef(null);
            const onlineTableDockRef = useRef(null);
            const onlineTableDockDragRef = useRef({ pointerId: null, moved: false, suppressClick: false, lastPosition: null });
            const roomRestoreAttemptedRef = useRef(false);
            const hpSyncTimerRef = useRef(null);
            const hpConfirmTimerRef = useRef(null);
            const applyingRemoteHpRef = useRef(null);
            const lastSentHpPayloadRef = useRef(null);
            const pendingHpSyncRef = useRef(loadPendingHpSync());
            const hpConflictHandledRef = useRef(null);
            const hpSyncContextRef = useRef(null);
            const conditionsSyncRef = useRef({ key: null, hash: null });
            const sheetSyncTimerRef = useRef(null);
            const lastSentSheetSnapshotRef = useRef({ key: null, hash: null });
            const companionSyncTimerRef = useRef(null);
            const appliedRemoteCompanionsRef = useRef(new Map());
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
            const [sessionReturnTab, setSessionReturnTab] = useState('character');
            const [sessionQuickNote, setSessionQuickNote] = useState('');
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
                const keepDockInsideViewport = () => {
                    const dock = onlineTableDockRef.current;
                    if (!dock) return;
                    setOnlineTableDockPosition(previous => {
                        if (!previous) return previous;
                        const margin = 8;
                        const width = dock.offsetWidth || 0;
                        const height = dock.offsetHeight || 0;
                        const next = {
                            left: Math.max(margin, Math.min(previous.left, Math.max(margin, window.innerWidth - width - margin))),
                            top: Math.max(margin, Math.min(previous.top, Math.max(margin, window.innerHeight - height - margin)))
                        };
                        if (next.left === previous.left && next.top === previous.top) return previous;
                        try { window.localStorage.setItem('dnd_online_table_dock_position_v1', JSON.stringify(next)); } catch (error) {}
                        return next;
                    });
                };
                const frame = window.requestAnimationFrame(keepDockInsideViewport);
                window.addEventListener('resize', keepDockInsideViewport);
                window.visualViewport?.addEventListener('resize', keepDockInsideViewport);
                return () => {
                    window.cancelAnimationFrame(frame);
                    window.removeEventListener('resize', keepDockInsideViewport);
                    window.visualViewport?.removeEventListener('resize', keepDockInsideViewport);
                };
            }, [onlineTableOpen, currentRoom?.code]);

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

            // The private Master view follows the shared local sheet. A debounce groups rapid
            // edits (slots, inspiration, resources, inventory...) into one Firestore update.
            useEffect(() => {
                if (sheetSyncTimerRef.current) window.clearTimeout(sheetSyncTimerRef.current);
                if (!currentRoom?.code || roomData?.status === 'closed' || !sharedCharacterId || !sharedCharacter || !ownRoomParticipant?.id || !firebaseUser?.uid || !onlineStatus || !firebaseReady) {
                    setSheetSyncStatus(currentRoom?.code && sharedCharacterId ? 'offline' : 'idle');
                    return;
                }
                const syncKey = `${currentRoom.code}:${firebaseUser.uid}:${sharedCharacterId}`;
                let snapshot;
                let serialized;
                let snapshotHash;
                try {
                    snapshot = createOnlinePlayerSheetSnapshot(sharedCharacter, {
                        armorClass: calculateCharacterArmorClass(sharedCharacter.data),
                        characterRules: window.DndSrdCharacterRules
                    });
                    serialized = serializeOnlinePlayerSheetSnapshot(snapshot);
                    snapshotHash = JSON.stringify({ ...snapshot, generatedAt: '' });
                } catch (error) {
                    setSheetSyncStatus('failed');
                    return;
                }
                if (lastSentSheetSnapshotRef.current.key === syncKey && lastSentSheetSnapshotRef.current.hash === snapshotHash) {
                    setSheetSyncStatus('synced');
                    return;
                }
                setSheetSyncStatus('pending');
                sheetSyncTimerRef.current = window.setTimeout(async () => {
                    try {
                        const { db, api, uid } = getOnlineServices();
                        const participantUpdate = {
                            name: String(snapshot.identity.name || 'Personaje sin nombre'),
                            className: String(snapshot.identity.className || ''),
                            level: Number(snapshot.identity.level) || 1,
                            armorClass: Number(snapshot.combat.armorClass) || 0,
                            updatedAt: api.serverTimestamp(),
                            lastUpdatedBy: String(uid),
                            updateSource: 'live-sheet-sync'
                        };
                        setSheetSyncStatus('syncing');
                        await Promise.all([
                            api.setDoc(api.doc(db, 'rooms', currentRoom.code, 'playerSheets', currentRoom.collection === 'campaigns' ? String(sharedCharacterId) : uid), {
                                ownerUid: String(uid),
                                characterId: String(sharedCharacterId),
                                schemaVersion: 1,
                                snapshotJson: serialized,
                                updatedAt: api.serverTimestamp()
                            }),
                            api.updateDoc(api.doc(db, 'rooms', currentRoom.code, 'participants', ownRoomParticipant.id), participantUpdate)
                        ]);
                        lastSentSheetSnapshotRef.current = { key: syncKey, hash: snapshotHash };
                        setSheetSyncStatus('synced');
                    } catch (error) {
                        console.error('[Mesa] No se pudo sincronizar la ficha completa:', error);
                        setSheetSyncStatus('failed');
                    }
                }, 900);
                return () => { if (sheetSyncTimerRef.current) window.clearTimeout(sheetSyncTimerRef.current); };
            }, [currentRoom?.code, roomData?.status, sharedCharacterId, sharedCharacter?.data, ownRoomParticipant?.id, firebaseUser?.uid, onlineStatus, firebaseReady]);

            // Companion combatants are public participants, while their full sheets remain in
            // the private player snapshot. Remote combat edits are first folded back into the
            // owner's local sheet so the next live-sheet update cannot overwrite the Master.
            useEffect(() => {
                if (!sharedCharacterId || !firebaseUser?.uid || !companionRoomParticipants.length) return;
                const remoteChanges = companionRoomParticipants.filter(participant => participant.ownerUid === firebaseUser.uid && participant.lastUpdatedBy && participant.lastUpdatedBy !== firebaseUser.uid);
                if (!remoteChanges.length) return;
                const pending = remoteChanges.filter(participant => {
                    const key = `${participant.id}:${participant.lastUpdatedBy}:${participant.currentHp}:${participant.maxHp}:${participant.tempHp}:${participant.initiative}:${JSON.stringify(participant.conditions || [])}`;
                    if (appliedRemoteCompanionsRef.current.get(participant.id) === key) return false;
                    appliedRemoteCompanionsRef.current.set(participant.id, key);
                    return true;
                });
                if (!pending.length) return;
                updateCharacterData(sharedCharacterId, previous => {
                    const localCompanions = Array.isArray(previous.companions) ? previous.companions : [];
                    let changed = false;
                    const nextCompanions = localCompanions.map(companion => {
                        const remote = pending.find(participant => participant.companionId === companion.id);
                        if (!remote) return companion;
                        const next = normalizeCompanion({
                            ...companion,
                            currentHp: remote.currentHp,
                            maxHp: remote.maxHp,
                            tempHp: remote.tempHp,
                            conditions: remote.conditions,
                            ...(remote.initiativeMode === 'own' ? { initiative: remote.initiative } : {})
                        });
                        const before = JSON.stringify([companion.currentHp, companion.maxHp, companion.tempHp, companion.initiative, companion.conditions]);
                        const after = JSON.stringify([next.currentHp, next.maxHp, next.tempHp, next.initiative, next.conditions]);
                        if (before !== after) changed = true;
                        return next;
                    });
                    return changed ? { ...previous, companions: nextCompanions } : previous;
                });
            }, [sharedCharacterId, firebaseUser?.uid, companionRoomParticipants]);

            useEffect(() => {
                if (companionSyncTimerRef.current) window.clearTimeout(companionSyncTimerRef.current);
                if (!currentRoom?.code || roomData?.status === 'closed' || !sharedCharacterId || !sharedCharacter || !ownRoomParticipant?.id || !firebaseUser?.uid || !onlineStatus || !firebaseReady) return;
                const localCompanions = Array.isArray(sharedCharacter.data?.companions) ? sharedCharacter.data.companions : [];
                const remoteCompanions = companionRoomParticipants.filter(participant => participant.ownerUid === firebaseUser.uid && participant.characterId === sharedCharacterId);
                const encounterRunning = roomData?.status === 'active' || roomData?.status === 'paused';
                const desiredCompanions = encounterRunning
                    ? localCompanions.filter(companion => remoteCompanions.some(remote => remote.companionId === companion.id))
                    : localCompanions.filter(companion => companion.participates);
                const comparable = participant => ({
                    id: participant.id, ownerUid: participant.ownerUid, type: participant.type, characterId: participant.characterId, companionId: participant.companionId,
                    name: participant.name, category: participant.category, currentHp: participant.currentHp, maxHp: participant.maxHp, tempHp: participant.tempHp,
                    armorClass: participant.armorClass, initiativeMode: participant.initiativeMode, initiative: participant.initiative, conditions: participant.conditions,
                    connected: participant.connected, avatarDataUrl: participant.avatarDataUrl || '', avatarPath: participant.avatarPath || ''
                });
                const desired = desiredCompanions.map(companion => createOnlineCompanionParticipant(companion, {
                    ownerUid: firebaseUser.uid,
                    characterId: sharedCharacterId,
                    ownerInitiative: ownRoomParticipant.initiative,
                    connected: ownRoomParticipant.connected !== false
                }));
                const writes = desired.filter(payload => {
                    const remote = remoteCompanions.find(participant => participant.id === payload.id);
                    return !remote || JSON.stringify(comparable(remote)) !== JSON.stringify(comparable(payload));
                });
                const removals = encounterRunning ? [] : remoteCompanions.filter(remote => !desired.some(payload => payload.id === remote.id));
                if (!writes.length && !removals.length) return;
                companionSyncTimerRef.current = window.setTimeout(async () => {
                    try {
                        const { db, api } = getOnlineServices();
                        await Promise.all([
                            ...writes.map(payload => {
                                const remote = remoteCompanions.find(participant => participant.id === payload.id);
                                const metadata = { updatedAt: api.serverTimestamp(), lastUpdatedBy: firebaseUser.uid, updateSource: 'live-companion-sync' };
                                return remote
                                    ? api.updateDoc(api.doc(db, 'rooms', currentRoom.code, 'participants', payload.id), { ...payload, ...metadata })
                                    : api.setDoc(api.doc(db, 'rooms', currentRoom.code, 'participants', payload.id), { ...payload, joinedAt: api.serverTimestamp(), ...metadata });
                            }),
                            ...removals.map(participant => api.deleteDoc(api.doc(db, 'rooms', currentRoom.code, 'participants', participant.id)))
                        ]);
                    } catch (error) {
                        console.error('[Mesa] No se pudieron sincronizar los compañeros:', error);
                        setOnlineTableError('No se pudo actualizar la participación de los compañeros.');
                    }
                }, 650);
                return () => { if (companionSyncTimerRef.current) window.clearTimeout(companionSyncTimerRef.current); };
            }, [currentRoom?.code, roomData?.status, sharedCharacterId, sharedCharacter?.data?.companions, ownRoomParticipant?.id, ownRoomParticipant?.initiative, ownRoomParticipant?.connected, firebaseUser?.uid, onlineStatus, firebaseReady, companionRoomParticipants]);

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
            const hasSneakAttack = selectedSrdClass?.id === 'rogue'
                || displayedTraits.some(trait => normalizeRuleLookupText(trait.title || trait.name).includes('ataque furtivo'));
            const sneakAttackFormula = hasSneakAttack ? `${Math.ceil(normalizedCharacterLevel / 2)}d6` : '';
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
            const canWeaponUseSneakAttack = (attack, weapon = null) => {
                const configuredAbility = attack?.attackAbility || inferWeaponAbility(attack);
                const rules = normalizeRuleLookupText(`${attack?.name || ''} ${attack?.notes || ''} ${weapon?.name || ''} ${weapon?.usesAmmo ? 'munición' : ''}`);
                return configuredAbility === 'finesse'
                    || configuredAbility === 'des'
                    || rules.includes('sutil')
                    || rules.includes('municion')
                    || rules.includes('ataque a distancia')
                    || rules.includes('cuchilla psiquica');
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
            const sheetReview = useMemo(() => reviewCharacterSheet(activeCharacter.data, { spellcastingExpected: srdProfileHasSpellcasting }), [activeCharacter.data, srdProfileHasSpellcasting]);
            const openSheetReviewIssue = issue => {
                const targetTab = issue?.section === 'grimoire' ? 'grimoire' : issue?.section === 'combat' || issue?.section === 'companions' ? 'combat' : issue?.section === 'inventory' ? 'inventory' : 'character';
                setSheetReviewOpen(false);
                if (targetTab === 'combat') setCombatDashboardView('summary');
                requestTabChange(targetTab);
                if (issue?.section === 'companions' && issue.companionId) {
                    window.setTimeout(() => openCompanionManager(issue.companionId, issue.field || null), targetTab === activeTab ? 0 : 220);
                    return;
                }
                if (issue?.id === 'race' || issue?.id === 'class') {
                    window.setTimeout(() => setCharacterBuildOpen(true), targetTab === activeTab ? 0 : 220);
                    return;
                }
                if (issue?.id === 'spells-empty') setGrimoireView('srd');
                if (issue?.id === 'spellcasting-ability') setGrimoireSettingsOpen(true);
                const slotLevel = /^slot-(\d+)$/.exec(String(issue?.id || ''))?.[1];
                if (slotLevel) {
                    window.setTimeout(() => setEditingSlotLevel(Number(slotLevel)), targetTab === activeTab ? 0 : 220);
                    return;
                }
                window.setTimeout(() => {
                    let control = null;
                    if (issue?.resourceId) control = resourceCardRefs.current.get(issue.resourceId)?.querySelector('input') || resourceCardRefs.current.get(issue.resourceId);
                    else {
                        const selectorByIssue = {
                            name: '.character-name-input',
                            level: '.character-meta-level-group input',
                            abilities: '[aria-label^="Atributo base"]',
                            'ability-range': '[aria-label^="Atributo base"]',
                            'max-hp': '.combat-health-card input:nth-of-type(2)',
                            'current-hp': '.combat-health-card input:nth-of-type(1)',
                            speed: '[aria-label="Velocidad en pies"]',
                            'hit-die': '[aria-label="Tipo de dado de golpe"]',
                            'hit-dice-current': '[aria-label="Dados de golpe actuales"]',
                            'spellcasting-ability': '.grimoire-ability-card select'
                        };
                        const selector = selectorByIssue[issue?.id];
                        if (selector) control = document.querySelector(selector);
                    }
                    if (!control) {
                        tabScrollRef.current?.scrollTo({ top: 0, behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
                        return;
                    }
                    control.scrollIntoView({ block: 'center', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
                    window.setTimeout(() => { control.focus?.(); control.select?.(); }, 260);
                }, targetTab === activeTab ? 30 : 340);
            };
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

            const formatSheetRollFormula = (formula, modifiers = []) => {
                const modifierTotal = modifiers.reduce((total, modifier) => total + (Number(modifier.value) || 0), 0);
                return `${formula}${modifierTotal ? `${modifierTotal > 0 ? '+' : ''}${modifierTotal}` : ''}`;
            };
            const launchSheetFormula = (formula, options = {}) => window.rollDice?.(formula, {
                ...options,
                displayFormula: options.displayFormula || formula
            });
            const requestSheetD20Roll = ({ label, rollType, modifiers = [], note = '', suggestedMode = '', allowGuidance = false, followUp = null, targetPrompt = false, dicePalette = null }) => {
                setSheetRollPrompt({
                    formula: '1d20',
                    label,
                    rollType,
                    modifiers,
                    note,
                    suggestedMode,
                    allowGuidance,
                    followUp,
                    targetPrompt,
                    dicePalette,
                    displayFormula: formatSheetRollFormula('1d20', modifiers)
                });
            };
            const chooseSheetRollMode = (mode, rollOptions = {}) => {
                if (!sheetRollPrompt) return;
                const request = sheetRollPrompt;
                setSheetRollPrompt(null);
                const useGuidance = request.allowGuidance && rollOptions.useGuidance === true;
                const targetLabel = String(rollOptions.targetLabel || '').trim().slice(0, 50);
                const formula = useGuidance ? `${request.formula}+1d4` : request.formula;
                launchSheetFormula(formula, {
                    label: `${request.label}${targetLabel ? ` → ${targetLabel}` : ''}`,
                    rollType: request.rollType,
                    modifiers: request.modifiers,
                    displayFormula: formatSheetRollFormula(formula, request.modifiers),
                    advantage: mode === 'advantage',
                    disadvantage: mode === 'disadvantage',
                    followUp: request.followUp ? { ...request.followUp, targetLabel } : null,
                    dicePalette: request.dicePalette
                });
            };
            const requestSkillRoll = skill => {
                const isExpert = hasSkillExpertise(skill.key);
                const isProficient = hasSkillProficiency(skill.key);
                const abilityModifier = getModNum(getEffectiveStat(skill.stat));
                const modifiers = [
                    { label: ABILITY_NAMES[skill.stat], value: abilityModifier },
                    ...(isExpert ? [{ label: 'Pericia', value: PROF_BONUS * 2 }] : isProficient ? [{ label: 'Competencia', value: PROF_BONUS }] : [])
                ];
                const stealthWarning = skill.key === 'sigilo' && isStealthDisadvantaged
                    ? `${stealthDisadvantageArmor.name} impone desventaja en esta prueba.`
                    : '';
                requestSheetD20Roll({
                    label: skill.name,
                    rollType: 'Prueba de habilidad',
                    modifiers,
                    suggestedMode: stealthWarning ? 'disadvantage' : '',
                    allowGuidance: guidance === true,
                    note: [stealthWarning, inspiration ? 'Tienes Inspiración disponible; puedes elegir ventaja si decides usarla.' : ''].filter(Boolean).join(' ')
                });
            };
            const requestAbilityCheckRoll = statKey => requestSheetD20Roll({
                label: `Prueba de ${ABILITY_NAMES[statKey]}`,
                rollType: 'Prueba de característica',
                modifiers: [{ label: ABILITY_NAMES[statKey], value: getModNum(getEffectiveStat(statKey)) }],
                allowGuidance: guidance === true,
                note: inspiration ? 'Tienes Inspiración disponible; puedes elegir ventaja si decides usarla.' : ''
            });
            const requestSavingThrowRoll = statKey => {
                const isProficient = hasSavingThrowProficiency(statKey);
                requestSheetD20Roll({
                    label: `Salvación de ${ABILITY_NAMES[statKey]}`,
                    rollType: 'Tirada de salvación',
                    modifiers: [
                        { label: ABILITY_NAMES[statKey], value: getModNum(getEffectiveStat(statKey)) },
                        ...(isProficient ? [{ label: 'Competencia', value: PROF_BONUS }] : [])
                    ],
                    note: inspiration ? 'Tienes Inspiración disponible; puedes elegir ventaja si decides usarla.' : ''
                });
            };
            const requestInitiativeRoll = () => requestSheetD20Roll({
                label: 'Iniciativa',
                rollType: 'Iniciativa',
                modifiers: [
                    { label: 'Destreza', value: getModNum(getEffectiveStat('des')) },
                    ...(Number(initBonus) ? [{ label: 'Bono adicional', value: Number(initBonus) }] : [])
                ],
                allowGuidance: guidance === true
            });
            const getWeaponDamageRollRequest = (attack, weapon = null) => {
                const formula = window.DndDiceEngine.extractDiceFormula(attack?.dmg);
                if (!formula) return null;
                const hasManualModifier = window.DndDiceEngine.parseDiceFormula(formula).terms.some(term => term.type === 'modifier');
                const automatic = getWeaponContext(attack, weapon).automatic;
                const ability = automatic ? getWeaponAttackAbility(attack) : '';
                const modifiers = automatic && !hasManualModifier ? [
                    { label: ABILITY_NAMES[ability], value: getModNum(getEffectiveStat(ability)) },
                    ...(Number(attack.magicBonus) ? [{ label: 'Bono mágico', value: Number(attack.magicBonus) }] : [])
                ] : [];
                return {
                    formula,
                    label: `${attack.name || weapon?.name || 'Ataque'} · Daño`,
                    modifiers,
                    displayFormula: formatSheetRollFormula(formula, modifiers)
                };
            };
            const getWeaponAttackRollRequest = (attack, weapon = null, attackIndex = 0) => {
                const automatic = getWeaponContext(attack, weapon).automatic;
                let modifiers;
                if (automatic) {
                    const ability = getWeaponAttackAbility(attack);
                    modifiers = [
                        { label: ABILITY_NAMES[ability], value: getModNum(getEffectiveStat(ability)) },
                        ...(getWeaponAttackProficiency(attack, weapon) ? [{ label: 'Competencia', value: PROF_BONUS }] : []),
                        ...(Number(attack.magicBonus) ? [{ label: 'Bono mágico', value: Number(attack.magicBonus) }] : [])
                    ];
                } else {
                    const manualMatches = String(getWeaponAttackBonus(attack, weapon) || '').match(/[+-]?\d+/g) || [];
                    const manualBonus = Number(manualMatches[manualMatches.length - 1] || 0);
                    modifiers = manualBonus ? [{ label: 'Bono de ataque', value: manualBonus }] : [];
                }
                const damageRequest = getWeaponDamageRollRequest(attack, weapon);
                const canAddSneakAttack = !!sneakAttackFormula && canWeaponUseSneakAttack(attack, weapon);
                const label = attack.name || weapon?.name || 'Ataque';
                return {
                    id: `${weapon?.id || 'weapon'}_${attackIndex}`,
                    weaponName: weapon?.name || 'Arma',
                    label,
                    formula: '1d20',
                    options: {
                        label,
                        rollType: 'Ataque',
                        modifiers,
                        displayFormula: formatSheetRollFormula('1d20', modifiers),
                        note: [
                        inspiration ? 'Tienes Inspiración disponible; puedes elegir ventaja si decides usarla.' : '',
                            canAddSneakAttack ? `Este ataque puede recibir Ataque furtivo (${sneakAttackFormula}) si cumple sus condiciones.` : ''
                        ].filter(Boolean).join(' '),
                        followUp: damageRequest ? {
                            type: 'weapon-damage',
                            ...damageRequest,
                            attackKey: `${weapon?.id || 'weapon'}_${attackIndex}`,
                            sneakAttackFormula: canAddSneakAttack ? sneakAttackFormula : ''
                        } : null
                    }
                };
            };
            const requestWeaponAttackRoll = (attack, weapon = null, attackIndex = 0) => {
                const request = getWeaponAttackRollRequest(attack, weapon, attackIndex);
                requestSheetD20Roll(request.options);
            };
            const requestSpellAttackRoll = (spell, suppliedPlan = null) => {
                if (spellcastingModifier === null) {
                    showAlert('Configura primero la característica de lanzamiento para calcular el ataque de conjuro.');
                    return;
                }
                const plan = suppliedPlan || getSpellDicePlan(spell, { slotLevel: spell?.level, characterLevel: normalizedCharacterLevel, spellcastingModifier });
                const attackKey = `spell_${spell?.sourceId || spell?.id || normalizeRuleLookupText(spell?.name || 'conjuro')}`;
                const attackCount = Math.max(1, Number(plan.attackCount) || 1);
                const baseAttackLabel = attackCount > 1 ? `${spell?.name || 'Conjuro'} · Rayo` : spell?.name || 'Ataque de conjuro';
                const attackModifiers = [
                    { label: spellcastingAbilityName || 'Característica', value: spellcastingModifier },
                    { label: 'Competencia', value: PROF_BONUS }
                ];
                const baseFollowUp = plan.canRoll ? {
                    type: 'spell-damage',
                    formula: plan.perAttackFormula,
                    modifiers: plan.modifiers,
                    displayFormula: formatSheetRollFormula(plan.perAttackFormula, plan.modifiers),
                    label: `${spell?.name || 'Conjuro'} · Daño`,
                    attackKey,
                    allowTargets: attackCount > 1,
                    contextLabel: 'Resolución de conjuro',
                    sequenceTitle: spell?.name || 'Ataques de conjuro'
                } : null;
                const sequenceOption = baseFollowUp ? {
                    id: attackKey,
                    weaponName: 'Conjuro',
                    label: attackCount > 1 ? `Rayo · ${plan.perAttackFormula}` : `${spell?.name || 'Ataque'} · ${plan.perAttackFormula}`,
                    sequenceLabel: baseAttackLabel,
                    maxUses: attackCount,
                    formula: '1d20',
                    options: {
                        label: baseAttackLabel,
                        rollType: 'Ataque de conjuro',
                        modifiers: attackModifiers,
                        displayFormula: formatSheetRollFormula('1d20', attackModifiers),
                        dicePalette: plan.palette?.rgb,
                        followUp: baseFollowUp
                    }
                } : null;
                requestSheetD20Roll({
                    label: `${baseAttackLabel}${attackCount > 1 ? ' 1' : ''}`,
                    rollType: 'Ataque de conjuro',
                    modifiers: attackModifiers,
                    note: attackCount > 1 ? `${attackCount} ataques separados. Puedes repartirlos entre objetivos y solo se sumará el daño de los impactos.` : '',
                    targetPrompt: attackCount > 1,
                    dicePalette: plan.palette?.rgb,
                    followUp: baseFollowUp ? { ...baseFollowUp, sequenceOptions: [sequenceOption] } : null
                });
            };
            const requestWeaponDamageRoll = (attack, weapon = null) => {
                const damageRequest = getWeaponDamageRollRequest(attack, weapon);
                if (!damageRequest) {
                    showAlert('No se ha encontrado una fórmula de dados válida en el daño de esta acción.');
                    return;
                }
                launchSheetFormula(damageRequest.formula, {
                    label: damageRequest.label,
                    rollType: 'Daño',
                    modifiers: damageRequest.modifiers,
                    displayFormula: damageRequest.displayFormula
                });
            };
            const launchDamageOrHealingRoll = (value, label, kind = 'damage') => {
                const formula = window.DndDiceEngine.extractDiceFormula(value);
                if (!formula) {
                    showAlert('No se ha encontrado una fórmula de dados válida en esta acción.');
                    return;
                }
                const rollType = kind === 'healing' || kind === 'benefit' ? 'Curación' : kind === 'damage' ? 'Daño' : 'Tirada';
                launchSheetFormula(formula, { label, rollType, displayFormula: formula });
            };

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
            const openCompanionManager = (companionId = null, focusField = null) => {
                setCompanionFocusId(companionId);
                setCompanionFocusField(focusField);
                setCompanionManagerOpen(true);
            };
            const updateCompanion = (companionId, changes) => setCompanions(previous => previous.map(companion => companion.id === companionId ? normalizeCompanion({ ...companion, ...changes, id: companion.id }) : companion));
            const adjustCompanionHp = (companionId, amount) => setCompanions(previous => previous.map(companion => companion.id === companionId ? normalizeCompanion({ ...companion, currentHp: Math.max(0, Math.min(Number(companion.maxHp) || 0, (Number(companion.currentHp) || 0) + amount)), id: companion.id }) : companion));
            const requestDeleteCompanion = companion => confirmDelete(`¿Eliminar a ${companion.name} de los compañeros de este personaje?`, () => {
                setCompanions(previous => previous.filter(item => item.id !== companion.id));
                setCompanionManagerOpen(false);
                setCompanionFocusId(null);
            });

            const {
                activateOnlineTableDock,
                addEnemyIdsAfterCurrent,
                addEnemyIdsAtEnd,
                addSrdMonsterToBestiary,
                applyBestiaryImport,
                applyEnemyHpModal,
                applyParticipantHpModal,
                buildPreparedTurnOrder,
                canManageEffect,
                changeEncounterTurn,
                cloudCampaigns,
                clearPendingHpSync,
                cleanupOnlineTableListeners,
                closeOnlineRoom,
                commitParticipantInitiative,
                confirmKickRoomPlayer,
                confirmReinforcementEntry,
                copyRoomCode,
                createEnemyFromBestiaryDraft,
                createOnlineRoom,
                createSrdBestiaryTemplate,
                deleteBestiaryMonster,
                deleteEffect,
                deleteEnemy,
                duplicateBestiaryMonster,
                exportBestiary,
                finishEncounter,
                finishOnlineTableDockDrag,
                getHpHash,
                getHpSyncKey,
                getOnlineServices,
                getPendingHpSync,
                handleBestiaryAvatar,
                handleBestiaryImportFile,
                joinOnlineRoom,
                isHpNetworkError,
                leaveOnlineRoom,
                minimizeOnlineTable,
                markPendingHpSync,
                moveOnlineTableDock,
                movePreparedParticipant,
                returnToCampaignHub,
                normalizeRoomCode,
                openBestiaryEditor,
                openBestiaryEnemyDraft,
                openCharacterSelector,
                openCloudCampaign,
                openConditionModal,
                openDirectEnemyModal,
                openEffectModal,
                openEnemyDuplicateModal,
                openEnemyModal,
                openOnlineTable,
                openOwnCharacterFromEncounter,
                openParticipantHpModal,
                permanentlyDeleteEffect,
                postponeCurrentTurn,
                removeOnlineCondition,
                resetOnlineTable,
                restoreBestiaryBackup,
                restoreOnlineTable,
                restoreRoomSession,
                retryPendingHpSync,
                retryRoomConnection,
                saveBestiaryEditor,
                saveEffect,
                saveEnemy,
                saveOnlineCondition,
                scheduleHpConfirmation,
                shareLocalCharacter,
                shareLocalHpConflict,
                shareRoomLink,
                shareRoomWithSystem,
                startEncounter,
                togglePreparedParticipant,
                startOnlineTableDockDrag,
                setEncounterStatus,
                updateBestiaryEnemyCopies,
                updateBestiaryMonster,
                updateEffectRemaining,
                updateEnemyHp,
                updateParticipantHp,
                updateSharedCharacter,
                useRemoteHpConflict,
                useSrdMonsterInOnlineTable
            } = useOnlineTableController({
                appliedRemoteCompanionsRef,
                applyingRemoteHpRef,
                bestiary,
                bestiaryDuplicateMode,
                bestiaryEditor,
                bestiaryEnemyDraft,
                bestiaryImportMode,
                bestiaryImportPreview,
                bestiarySelectedImportIds,
                canManageEnemies,
                companionRoomParticipants,
                companionSyncTimerRef,
                conditionModal,
                conditionsSyncRef,
                currentRoom,
                effectModal,
                encounterBusy,
                encounterCombatants,
                encounterEffects,
                encounterParticipants,
                encounterSetupOpen,
                enemyHpModal,
                enemyModal,
                firebaseReady,
                firebaseUser,
                getCombatant,
                getMonsterIconPath,
                hasInitiativeValue,
                hpConfirmTimerRef,
                hpConflict,
                hpConflictHandledRef,
                hpModal,
                hpSyncContextRef,
                hpSyncTimerRef,
                isCurrentRoomMaster,
                lastOnlineRoom,
                lastSentHpPayloadRef,
                lastSentSheetSnapshotRef,
                leavingRoomRef,
                manager,
                onlineStatus,
                onlineTableContentRef,
                onlineTableDockDragRef,
                onlineTableMotionTimerRef,
                onlineTableOpen,
                onlineTableScrollPositionsRef,
                onlineTableView,
                onlineTableViewContentRef,
                ownRoomParticipant,
                participantInitiativeDrafts,
                pendingHpSyncRef,
                playerNameInput,
                playerRoomParticipants,
                preparedTurnOrder,
                privateEnemies,
                publicCombatants,
                reinforcementEntry,
                roomCodeInput,
                roomData,
                roomInvite,
                roomListenersRef,
                roomMembers,
                roomParticipants,
                roomRestoreAttemptedRef,
                selectCharacter,
                selectedCombatantId,
                setBestiary,
                setBestiaryCompendiumOpen,
                setBestiaryCompendiumPreview,
                setBestiaryDuplicateMode,
                setBestiaryEditor,
                setBestiaryEnemyDraft,
                setBestiaryEnemySelectorOpen,
                setBestiaryImportMode,
                setBestiaryImportPreview,
                setBestiaryNotice,
                setBestiarySelectedImportIds,
                setConditionModal,
                setConditions,
                setConfirmDialog,
                setCreatedRoomCode,
                setCreatingEnemy,
                setCurrentRoom,
                setEffectModal,
                setEncounterBusy,
                setEncounterSetupOpen,
                setEnemyHpModal,
                setEnemyModal,
                setEnemySourceChoiceOpen,
                setFinishEncounterPrompt,
                setHpConflict,
                setHpModal,
                setHpSyncStatus,
                setLastOnlineRoom,
                setOnlineEncounterView,
                setOnlinePlayerSheetId,
                setOnlineReconnectState,
                setOnlineRoomModule,
                setOnlineTableBusy,
                setOnlineTableDockDragging,
                setOnlineTableDockPosition,
                setOnlineTableError,
                setOnlineTableMenuOpen,
                setOnlineTableMotion,
                setOnlineTableNotice,
                setOnlineTableOpen,
                setOnlineTableScreen,
                setOutsideEncounterEnemyIds,
                setParticipantInitiativeDrafts,
                setParticipantsHavePendingWrites,
                setPendingHpSync,
                setPlayerNameInput,
                setPostponeOpen,
                setPreparedTurnOrder,
                setPrivateEffects,
                setPrivateEnemies,
                setPublicCombatants,
                setPublicEffects,
                setReinforcementEntry,
                setRoomCodeInput,
                setRoomData,
                setRoomInvite,
                setRoomMembers,
                setRoomParticipants,
                setRoomPlayerSheets,
                setSelectedCombatantId,
                setShareCharacterOpen,
                setSharedCharacterId,
                setSharingCharacter,
                setSheetSyncStatus,
                sharedCharacterId,
                sheetSyncTimerRef,
                shouldShowEncounter,
                updateCharacterData
            });

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
                const rollPlan = getSpellDicePlan(spell, { slotLevel, characterLevel: normalizedCharacterLevel, spellcastingModifier });
                setSpellCastAnimation({ id: `cast_${Date.now()}`, spell, slotLevel, pact, schoolText, schoolKey, rollPlan });
                setCastSpell(null);
            };
            const resolveSpellCastDice = animation => {
                if (!animation?.spell || !animation.rollPlan?.canRoll) return;
                const { spell, rollPlan } = animation;
                setSpellCastAnimation(null);
                if (rollPlan.usesSpellAttack) {
                    requestSpellAttackRoll(spell, rollPlan);
                    return;
                }
                const saveLabel = rollPlan.savingAbility
                    ? ` · Salvación de ${rollPlan.savingAbility}${spellSaveDc === null ? '' : ` CD ${spellSaveDc}`}${rollPlan.partialOnSave ? ' · mitad al superar' : ''}`
                    : '';
                launchSheetFormula(rollPlan.formula, {
                    label: `${spell.name}${saveLabel}`,
                    rollType: rollPlan.kind === 'healing' ? 'Curación de conjuro' : 'Daño de conjuro',
                    modifiers: rollPlan.modifiers,
                    displayFormula: formatSheetRollFormula(rollPlan.formula, rollPlan.modifiers),
                    dicePalette: rollPlan.palette?.rgb
                });
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
            const restPreviewTempHpChanged = Boolean(restPreview && Number(hp.temp) !== Number(restPreview.data.hp?.temp));
            const restPreviewDeathSavesChanged = Boolean(restPreview && (Number(deathSaves.successes) !== Number(restPreview.data.deathSaves?.successes) || Number(deathSaves.failures) !== Number(restPreview.data.deathSaves?.failures)));
            const restPreviewChangeCount = restPreview?.changes?.length || 0;
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
                    tempHpBefore: Number(before.hp?.temp) || 0,
                    tempHpAfter: Number(after.hp?.temp) || 0,
                    deathSavesReset: Number(before.deathSaves?.successes) !== Number(after.deathSaves?.successes) || Number(before.deathSaves?.failures) !== Number(after.deathSaves?.failures),
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
            const sessionSpellSlots = Object.entries(spellSlots || {}).filter(([, slot]) => Number(slot?.max) > 0);
            const sessionCompanions = companions.filter(companion => companion.participates);
            const sessionInventory = inventory.filter(item => Number(item.qty ?? item.quantity ?? 1) > 0).slice(0, 6);
            const openSessionMode = () => {
                setSessionReturnTab(activeTab || 'character');
                setCombatMode(true);
                setCharacterHeaderMenuOpen(false);
                requestTabChange('combat');
            };
            const closeSessionMode = () => {
                setCombatMode(false);
                requestTabChange(sessionReturnTab || 'character');
            };
            const leaveSessionFor = (tab, setup) => {
                setCombatMode(false);
                if (typeof setup === 'function') setup();
                requestTabChange(tab);
            };
            const saveSessionQuickNote = () => {
                const text = sessionQuickNote.trim();
                if (!text) return;
                setSessionNotes(previous => [{ id: `note_${Date.now()}`, title: 'Nota rápida de sesión', date: new Date().toISOString().slice(0, 10), text, category: 'sessions', tags: ['sesión'], relations: [] }, ...previous]);
                setSessionQuickNote('');
            };
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
                const query = normalizeRuleLookupText(spell.name).includes(normalizeRuleLookupText(spellSearch));
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
                    const description = repairSrdLineBreakHyphens(spell.description).trim();
                    const leakedName = srdSpellNamesByLength.find(name => description.endsWith(` ${name}`));
                    return {
                        ...spell,
                        higherLevels: repairSrdLineBreakHyphens(spell.higherLevels).trim(),
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
                const query = normalizeRuleLookupText(spell.name).includes(normalizeRuleLookupText(srdSpellSearch));
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
                return ReactDOM.createPortal(<div className="level-up-ceremony" data-accent="violet" role="dialog" aria-modal="true" aria-labelledby="level-up-ceremony-title">
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
                if (data.tempHpBefore !== data.tempHpAfter) gains.push({ icon: '✧', label: 'PV temporales', value: `${data.tempHpBefore} → ${data.tempHpAfter}` });
                if (data.deathSavesReset) gains.push({ icon: '†', label: 'Salvaciones de muerte', value: 'Marcas reiniciadas' });
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
                    <div className={`print-preview-root ${pencilMode ? 'is-pencil-mode' : 'is-session-mode'}`} role="dialog" aria-modal="true" aria-label="Vista imprimible de personaje">
                        <div className="print-preview-toolbar">
                            <div><p className="print-sheet-kicker">Vista previa</p><h2>Ficha imprimible</h2><p className="print-preview-note">Diseño en blanco y negro · el retrato no se imprime para ahorrar tinta</p></div>
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
                                <section className="print-section"><h3>Armas y ataques</h3>{(printableWeapons.length || pencilMode) ? <table className="print-table"><thead><tr><th>Arma</th><th>Ataque</th><th>Daño</th></tr></thead><tbody>{printableWeapons.flatMap(weapon => (weapon.attacks || []).length ? weapon.attacks.map((attack, index) => <tr key={`${weapon.id}-${index}`}><td>{weapon.name}{attack.name ? ` · ${attack.name}` : ''}</td><td>{getWeaponAttackBonus(attack, weapon) || '—'}</td><td>{attack.dmg || '—'}</td></tr>) : [<tr key={weapon.id}><td>{weapon.name}</td><td>—</td><td>—</td></tr>])}{pencilMode && Array.from({ length: 4 }, (_, index) => <tr className="print-write-row" key={`weapon-write-${index}`}><td></td><td></td><td></td></tr>)}</tbody></table> : <div className="print-write-space"></div>}</section>
                                <section className="print-section"><h3>Recursos</h3>{resources.length ? <div className="print-grid metrics">{resources.map(resource => <div className="print-box" key={resource.id}><span className="print-box-label">{resource.name}</span><strong className="print-box-value">{pencilMode ? '' : `${resource.current} / ${resource.max}`}</strong>{printTrack(resource.current, resource.max)}</div>)}</div> : <div className="print-write-space"></div>}</section>
                                <div className="print-columns"><section className="print-section"><h3>Rasgos</h3>{printableTraits.length ? printableTraits.map(trait => <span className="print-tag" key={trait}>{trait}</span>) : <div className="print-write-space"></div>}</section><section className="print-section"><h3>Dotes</h3>{printableFeats.length ? printableFeats.map(feat => <span className="print-tag" key={feat}>{feat}</span>) : <div className="print-write-space"></div>}</section></div>
                                <section className="print-section"><h3>Inventario y moneda</h3>{(inventory.length || pencilMode) ? <table className="print-table print-inventory-table"><thead><tr><th>Objeto</th><th>Cantidad</th></tr></thead><tbody>{inventory.map((item, index) => <tr key={`${item.name}-${index}`}><td>{item.name || 'Objeto'}</td><td>{pencilMode ? <span className="print-pencil-line" aria-label="Cantidad para completar"></span> : item.qty || item.quantity || '1'}</td></tr>)}{pencilMode && Array.from({ length: 8 }, (_, index) => <tr className="print-write-row" key={`inventory-write-${index}`}><td></td><td></td></tr>)}</tbody></table> : <div className="print-write-space"></div>}<p className="print-currency-line">PC {pencilMode ? '____' : currency.pc || 0} · PP {pencilMode ? '____' : currency.plata || 0} · PE {pencilMode ? '____' : currency.electro || 0} · PO {pencilMode ? '____' : currency.po || 0} · PPL {pencilMode ? '____' : currency.platino || 0}</p></section>
                                <section className="print-section"><h3>Notas</h3><div className="print-write-space"></div></section><p className="print-page-number">Página 2</p>
                            </article>
                            {(grimorioSpells.length > 0 || srdProfileHasSpellcasting) && <article className="print-sheet"><header className="print-sheet-heading"><div><p className="print-sheet-kicker">Grimorio</p><h2>{charInfo.name || 'Personaje'}</h2><p className="print-sheet-identity">{spellcastingAbilityName || 'Característica manual'} · CD {spellSaveDc ?? '—'} · Ataque {spellAttackBonus === null ? '—' : printModifier(spellAttackBonus)}</p></div><span className="print-sheet-identity">Nivel {normalizedCharacterLevel}</span></header><section className="print-section"><h3>Ranuras de conjuro</h3>{spellSlotRows.length ? <div className="print-grid metrics">{spellSlotRows.map(slotLevel => <div key={slotLevel} className="print-box"><span className="print-box-label">Nivel {slotLevel}</span><strong className="print-box-value">{pencilMode ? '' : `${spellSlots[slotLevel].current} / ${spellSlots[slotLevel].max}`}</strong>{printTrack(spellSlots[slotLevel].current, spellSlots[slotLevel].max)}</div>)}</div> : <div className="print-write-space"></div>}</section><section className="print-section"><h3>Conjuros</h3>{(printableSpells.length || pencilMode) ? <table className="print-table"><thead><tr><th>Nivel</th><th>Conjuro</th><th>Estado</th></tr></thead><tbody>{printableSpells.map(spell => <tr key={spell.id}><td>{Number(spell.level) === 0 ? 'Truco' : spell.level}</td><td>{spell.name}</td><td>{spell.prepared ? 'Preparado' : spell.known ? 'Conocido' : ''}</td></tr>)}{pencilMode && Array.from({ length: 6 }, (_, index) => <tr className="print-write-row" key={`spell-write-${index}`}><td></td><td></td><td></td></tr>)}</tbody></table> : <div className="print-write-space"></div>}</section><section className="print-section"><h3>Notas de magia</h3><div className="print-write-space"></div></section><p className="print-page-number">Página 3</p></article>}
                        </div>
                    </div>, document.body
                );
            };

            const attackSequenceOptions = weapons.flatMap(weapon => (weapon.attacks || []).map((attack, attackIndex) => ({ attack, attackIndex, weapon })))
                .filter(({ attack, weapon }) => window.DndDiceEngine.extractDiceFormula(attack?.dmg)
                    && normalizeRuleLookupText(`${weapon?.name || ''} ${attack?.name || ''}`) !== 'ataque furtivo dano furtivo')
                .map(({ attack, attackIndex, weapon }) => getWeaponAttackRollRequest(attack, weapon, attackIndex));

            return (
                <div className={`app-shell sheet-feedback-${sheetFeedback} h-[100dvh] overflow-hidden p-2 pb-20 md:p-6 md:pb-24 text-gray-200`}>
                    <DiceRoller open={diceRollerOpen} onClose={() => setDiceRollerOpen(false)} attackOptions={attackSequenceOptions} />
                    <SheetRollPrompt request={sheetRollPrompt} onCancel={() => setSheetRollPrompt(null)} onChoose={chooseSheetRollMode} />
                    {printPreviewOpen && renderPrintPreview()}
                    {sheetReviewOpen && sheetReview.issues.length > 0 && ReactDOM.createPortal(<div className="sheet-review-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSheetReviewOpen(false); }}><section className={`sheet-review-dialog is-${sheetReview.status}`} role="dialog" aria-modal="true" aria-labelledby="sheet-review-title"><header className="sheet-review-dialog__header"><span aria-hidden="true">{sheetReview.status === 'ready' ? '✓' : sheetReview.status === 'attention' ? '!' : '◇'}</span><div><small>Revisión inteligente</small><h2 id="sheet-review-title">Estado de la ficha</h2><p>Comprueba datos esenciales y contadores sin modificar ninguna elección.</p></div><button type="button" onClick={() => setSheetReviewOpen(false)} aria-label="Cerrar revisión">×</button></header><div className="sheet-review-dialog__body"><section className="sheet-review-overview"><div><small>Resultado</small><strong>{sheetReview.status === 'ready' ? 'Sin avisos' : sheetReview.importantCount ? 'Necesita atención' : 'Conviene revisar'}</strong><p>{sheetReview.status === 'ready' ? 'No se han encontrado omisiones esenciales ni contadores incoherentes.' : 'La ficha puede seguir utilizándose; estos avisos no bloquean ninguna función.'}</p></div><span><b>{sheetReview.passedChecks}</b><small>de {sheetReview.totalChecks}<br/>esenciales</small></span></section>{sheetReview.issues.length ? <div className="sheet-review-issues">{sheetReview.issues.map(issue => <article key={issue.id} className={`is-${issue.severity}`}><span aria-hidden="true">{issue.severity === 'important' ? '!' : '◇'}</span><div><small>{issue.section === 'grimoire' ? 'Grimorio' : issue.section === 'combat' ? 'Combate' : issue.section === 'companions' ? 'Compañeros' : issue.section === 'inventory' ? 'Inventario' : 'Personaje'}</small><strong>{issue.title}</strong><p>{issue.detail}</p></div><button type="button" onClick={() => openSheetReviewIssue(issue)}>Ir a corregir <b aria-hidden="true">→</b></button></article>)}</div> : <div className="sheet-review-ready"><span aria-hidden="true">✦</span><strong>Todo lo esencial está en orden</strong><p>La revisión no ha encontrado datos obligatorios vacíos ni valores incompatibles entre sí.</p></div>}</div><footer className="sheet-review-dialog__footer"><p>Es una ayuda de consistencia, no una validación de reglas: las elecciones especiales y reglas de tu mesa siguen siendo válidas.</p><button type="button" onClick={() => setSheetReviewOpen(false)}>Cerrar</button></footer></section></div>, document.body)}
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
                        <SessionMode model={{
                            charInfo,
                            level,
                            currentRoom,
                            hp,
                            activeConcentration,
                            activateOnlineTableDock,
                            setDiceRollerOpen,
                            closeSessionMode,
                            conditions,
                            renderVitalityBar,
                            setHp,
                            handleNumInput,
                            calculateAC,
                            formatMod,
                            getModNum,
                            getEffectiveStat,
                            initBonus,
                            requestInitiativeRoll,
                            speed,
                            getPassivePerception,
                            inspiration,
                            setInspiration,
                            guidance,
                            setGuidance,
                            finishConcentration,
                            conditionSymbols,
                            setConditions,
                            leaveSessionFor,
                            setCombatDashboardView,
                            setRestType,
                            setRestModalOpen,
                            tacticalResources,
                            renderUsageDots,
                            setResources,
                            grimoireConfig,
                            setGrimoireConfig,
                            tacticalWeapons,
                            getWeaponAttackBonus,
                            requestWeaponAttackRoll,
                            sessionSpellSlots,
                            tacticalSpells,
                            setCastSpell,
                            companions,
                            openCompanionManager,
                            sessionCompanions,
                            adjustCompanionHp,
                            CompanionAvatar,
                            COMPANION_CATEGORY_LABELS,
                            sessionInventory,
                            adjustInvQty,
                            setDiaryOpen,
                            sessionQuickNote,
                            setSessionQuickNote,
                            saveSessionQuickNote,
                            sessionNotes,
                            openTimerModal,
                            renderTimerList
                        }} />

                        <CombatDashboard model={{
                            activeConcentration,
                            calculateAC,
                            combatConditions,
                            combatDashboardView,
                            conditionSymbols,
                            conditions,
                            conditionsManagerOpen,
                            finishConcentration,
                            formatMod,
                            getEffectiveStat,
                            getModNum,
                            getPassivePerception,
                            guidance,
                            handleNumInput,
                            hitDice,
                            hp,
                            initBonus,
                            inspiration,
                            level,
                            onlineReconnectState,
                            openTimerModal,
                            renderAcBreakdown,
                            renderAcTemporaryControls,
                            renderTimerList,
                            renderUsageDots,
                            renderVitalityBar,
                            requestInitiativeRoll,
                            retryRoomConnection,
                            setCombatDashboardView,
                            setConditions,
                            setConditionsManagerOpen,
                            setGuidance,
                            setHitDice,
                            setHp,
                            setInitBonus,
                            setInspiration
                        }} />

                        <CharacterHeader model={{
                            PROF_BONUS,
                            SKILLS,
                            activeCharacter,
                            activeConcentration,
                            activeSrdSubclass,
                            addSuggestedClassResources,
                            automaticExpertiseChoices,
                            automaticExpertiseLimit,
                            automaticSavingThrows,
                            automaticSkillProficiencies,
                            availableAutomaticRuleTraits,
                            charInfo,
                            characterBuild,
                            characterBuildOpen,
                            characterCreationWizardOpen,
                            characterHeaderMenuOpen,
                            characterList,
                            closeLevelReview,
                            companions,
                            conditions,
                            confirmLevelReview,
                            currentSpellProgression,
                            handleNumInput,
                            handlePortraitFile,
                            hasSkillProficiency,
                            hitDice,
                            hp,
                            initBonus,
                            lastReviewedLevel,
                            level,
                            levelDraft,
                            levelReviewChecklist,
                            levelReviewChecklistComplete,
                            levelReviewChecks,
                            levelReviewDelta,
                            levelReviewFeatureGroups,
                            levelReviewHasSpellcasting,
                            levelReviewHpGain,
                            levelReviewOpen,
                            levelReviewProficiencyBonus,
                            levelReviewRemainingExpertiseChoices,
                            levelReviewStart,
                            levelReviewTarget,
                            normalizedCharacterLevel,
                            openCompanionManager,
                            openSessionMode,
                            originSkillProficiencies,
                            pendingAbilityImprovementLevels,
                            pendingLevelChange,
                            pendingResourceSuggestions,
                            portraitFileRef,
                            previousProficiencyBonus,
                            previousSpellProgression,
                            proficiencyChanged,
                            remainingClassSkillChoices,
                            remainingExpertiseChoices,
                            removePortrait,
                            requestLevelChange,
                            requestTabChange,
                            requiredClassSkillChoices,
                            selectedClassSkillChoiceCount,
                            selectedExpertiseChoiceCount,
                            selectedSrdBackground,
                            selectedSrdClass,
                            selectedSrdSpecies,
                            setActiveTab,
                            setActivityHistoryOpen,
                            setAppSettingsOpen,
                            setCharInfo,
                            setCharacterBuild,
                            setCharacterBuildOpen,
                            setCharacterCreationWizardOpen,
                            setCharacterHeaderMenuOpen,
                            setCharacterManagerOpen,
                            setCombatDashboardView,
                            setHitDice,
                            setHp,
                            setInitBonus,
                            setLevel,
                            setLevelDraft,
                            setLevelReviewChecks,
                            setLevelReviewHpGain,
                            setLevelReviewOpen,
                            setPortraitViewerOpen,
                            setPrintPreviewOpen,
                            setRestModalOpen,
                            setRestType,
                            setSheetReviewOpen,
                            setSize,
                            setSpeed,
                            setStats,
                            sheetFeedback,
                            sheetReview,
                            size,
                            skillProficiencySources,
                            speed,
                            spellSlotChanges,
                            srdCharacterRules,
                            srdProfileCantrips,
                            srdProfileHasSpellcasting,
                            srdProfileKnownLimit,
                            srdProfileMaxSpellLevel,
                            srdProfilePreparedLimit,
                            srdSpellcastingProfile,
                            stats
                        }} />

                        <CharacterWorkspace model={{
                            ABILITY_NAMES,
                            PROF_BONUS,
                            SKILLS,
                            SPELLCASTING_ABILITIES,
                            activeConcentration,
                            activeTab,
                            addCurrency,
                            addSpellFromSrdLibrary,
                            addSuggestedClassResources,
                            adjustCompanionHp,
                            adjustInvQty,
                            ammoSettingsOpen,
                            armors,
                            automaticSpells,
                            bestiary,
                            cantripCount,
                            charInfo,
                            combatDashboardView,
                            companions,
                            confirmDelete,
                            currency,
                            currentRoom,
                            deathSaves,
                            diaryCategory,
                            diaryOpen,
                            diarySearch,
                            displayedSpells,
                            displayedSrdSpells,
                            displayedTraits,
                            editingDiaryEntry,
                            feats,
                            finishConcentration,
                            formatMod,
                            getEffectiveStat,
                            getModNum,
                            getSpellGrantSummary,
                            getSpellIconColor,
                            getSpellIconPath,
                            getWeaponAttackBonus,
                            getWeaponAttackFormula,
                            grimoireConfig,
                            grimoireSettingsOpen,
                            grimoireView,
                            grimorioSpells,
                            handleBoundedNumInput,
                            handleNumInput,
                            handleResourcePointerDown,
                            handleResourcePointerEnd,
                            handleResourcePointerMove,
                            hasSavingThrowProficiency,
                            hasSkillExpertise,
                            hasSkillProficiency,
                            hp,
                            inventory,
                            isCurrentRoomMaster,
                            isSrdClassFilterActive,
                            isStealthDisadvantaged,
                            knownSpellCount,
                            markDeathSave,
                            openAddWeaponAttack,
                            openCompanionManager,
                            openOnlineTable,
                            preparedSpellCount,
                            renderUsageDots,
                            requestAbilityCheckRoll,
                            requestSavingThrowRoll,
                            requestSkillRoll,
                            requestWeaponAttackRoll,
                            requestWeaponDamageRoll,
                            resetDeathSaves,
                            resourceCardRefs,
                            resourceDrag,
                            resourceGridRef,
                            resourcePressRef,
                            resources,
                            restoreSpellOwnUses,
                            roomParticipants,
                            selectedWeapon,
                            selectedWeaponAmmo,
                            selectedWeaponId,
                            sessionNotes,
                            setAddModal,
                            setAmmoSettingsOpen,
                            setArmors,
                            setBestiaryCompendiumOpen,
                            setCastSpell,
                            setDiaryCategory,
                            setDiaryOpen,
                            setDiarySearch,
                            setDiceRollerOpen,
                            setEditingDiaryEntry,
                            setEditingSlotLevel,
                            setEquipmentCompendiumOpen,
                            setFeatCompendiumOpen,
                            setFeats,
                            setGrimoireConfig,
                            setGrimoireGuideOpen,
                            setGrimoireSettingsOpen,
                            setGrimoireView,
                            setInventory,
                            setResources,
                            setSelectedWeaponId,
                            setSessionNotes,
                            setShowEmptySlots,
                            setSize,
                            setSkillModal,
                            setSpeed,
                            setSpellFilter,
                            setSpellSearch,
                            setSpells,
                            setSrdSpellClassFilter,
                            setSrdSpellDetail,
                            setSrdSpellLevel,
                            setSrdSpellSchool,
                            setSrdSpellSearch,
                            setSrdSpellTrait,
                            setStats,
                            setTempStats,
                            setTools,
                            setTraits,
                            setWeapons,
                            showAlert,
                            showEmptySlots,
                            size,
                            speed,
                            spellAttackBonus,
                            spellFilter,
                            spellSaveDc,
                            spellSearch,
                            spellSlots,
                            spellWorkflow,
                            spellWorkflowCopy,
                            spellcastingAbility,
                            spellcastingAbilityName,
                            spellcastingModifier,
                            spells,
                            spendWeaponAmmo,
                            srdMonsterCompendium,
                            srdProfileCantrips,
                            srdProfileHasSpellcasting,
                            srdProfileKnownLimit,
                            srdProfileMaxSpellLevel,
                            srdProfilePreparedLimit,
                            srdSpellClassFilter,
                            srdSpellLevel,
                            srdSpellLibrary,
                            srdSpellSchool,
                            srdSpellSchools,
                            srdSpellSearch,
                            srdSpellTrait,
                            srdSpellcastingLevel,
                            srdSpellcastingProfile,
                            stats,
                            stealthDisadvantageArmor,
                            suggestedClassResources,
                            tempStats,
                            toggleArmorEquip,
                            toggleSavingThrow,
                            toggleSpellKnown,
                            toggleSpellPreparation,
                            tools,
                            traits,
                            updateCompanion,
                            updateCurrencyAmount,
                            updateWeaponAmmo,
                            weapons
                        }} />

                        <CharacterFooter model={{
                            addProficiencyEntryToCategory,
                            narrative,
                            narrativeFilledCount,
                            proficiencyCategoryLabels,
                            proficiencyEntries,
                            removeProficiencyEntry,
                            setNarrative,
                            updateProficiencyEntry
                        }} />
                        </div>

                        </main>

                        <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 gap-1 border-t border-gray-700 bg-gray-950/95 p-1 backdrop-blur-md" aria-label="Navegacion principal">
                            <button type="button" onClick={() => requestTabChange('character')} className={`bottom-nav-button flex flex-col items-center justify-center gap-1 rounded-md text-[10px] font-fantasy uppercase tracking-wider transition-colors ${activeTab === 'character' ? 'bg-purple-950/70 text-purple-300 shadow-inner' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'}`} aria-current={activeTab === 'character' ? 'page' : undefined}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6"/></svg><span>{t('character')}</span>
                            </button>
                            <button type="button" onClick={() => requestTabChange('combat')} className={`bottom-nav-button flex flex-col items-center justify-center gap-1 rounded-md text-[10px] font-fantasy uppercase tracking-wider transition-colors ${activeTab === 'combat' ? 'bg-red-950/70 text-red-300 shadow-inner' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'}`} aria-current={activeTab === 'combat' ? 'page' : undefined}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m14.5 4.5 5 5-9 9H5.5v-5l9-9Z"/><path d="m13 6 5 5"/><path d="m4 20 3-3"/></svg><span>{t('combat')}</span>
                            </button>
                            <button type="button" onClick={() => setDiceRollerOpen(true)} className="bottom-nav-button is-dice-launch flex flex-col items-center justify-center gap-1 rounded-md text-[10px] font-fantasy uppercase tracking-wider transition-colors" aria-haspopup="dialog">
                                <span aria-hidden="true">20</span><small>Dados</small>
                            </button>
                            <button type="button" onClick={() => requestTabChange('grimoire')} className={`bottom-nav-button flex flex-col items-center justify-center gap-1 rounded-md text-[10px] font-fantasy uppercase tracking-wider transition-colors ${activeTab === 'grimoire' ? 'bg-fuchsia-950/70 text-fuchsia-300 shadow-inner' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'}`} aria-current={activeTab === 'grimoire' ? 'page' : undefined}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 4.5A3.5 3.5 0 0 1 8.5 2H19v17H8.5A3.5 3.5 0 0 0 5 22Z"/><path d="M5 4.5V22M9 7h6M9 11h6"/></svg><span>{t('spellbook')}</span>
                            </button>
                            <button type="button" onClick={() => requestTabChange('inventory')} className={`bottom-nav-button flex flex-col items-center justify-center gap-1 rounded-md text-[10px] font-fantasy uppercase tracking-wider transition-colors ${activeTab === 'inventory' ? 'bg-amber-950/70 text-amber-300 shadow-inner' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'}`} aria-current={activeTab === 'inventory' ? 'page' : undefined}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg><span>{t('inventory')}</span>
                            </button>
                        </nav>

                        <CompendiumDialogs model={{
                            addFeatFromCompendium,
                            addSpellFromSrdLibrary,
                            automaticSpellSourceIds,
                            displayedCompendiumFeats,
                            featCompendiumDetail,
                            featCompendiumOpen,
                            featCompendiumSearch,
                            featCompendiumSource,
                            feats,
                            formatMod,
                            getSpellCompendiumActionLabel,
                            getSpellCompendiumAddedLabel,
                            getSpellIconColor,
                            getSpellIconPath,
                            getSpellResolution,
                            getSrdSpellDiceDetails,
                            grimoireGuideOpen,
                            launchDamageOrHealingRoll,
                            requestSpellAttackRoll,
                            setFeatCompendiumDetail,
                            setFeatCompendiumOpen,
                            setFeatCompendiumSearch,
                            setFeatCompendiumSource,
                            setGrimoireGuideOpen,
                            setGrimoireView,
                            setSrdSpellDetail,
                            spellAttackBonus,
                            spellGuideProfile,
                            spellGuideSteps,
                            spellSaveDc,
                            spellWorkflow,
                            spellWorkflowCopy,
                            spellcastingModifier,
                            spells,
                            srdProfileCantrips,
                            srdSpellDetail
                        }} />

                        {/* ================= MODALES ================= */}

                        <OnlineTableShell model={{
                            OnlineCombatantAvatar,
                            activateOnlineTableDock,
                            addEnemyIdsAfterCurrent,
                            addEnemyIdsAtEnd,
                            buildPreparedTurnOrder,
                            canManageEffect,
                            canManageEnemies,
                            changeEncounterTurn,
                            cloudCampaigns,
                            closeOnlineRoom,
                            commitParticipantInitiative,
                            companionRoomParticipants,
                            confirmDelete,
                            confirmKickRoomPlayer,
                            copyRoomCode,
                            createOnlineRoom,
                            createdRoomCode,
                            currentRoom,
                            deleteEffect,
                            deleteEnemy,
                            encounterActionsOpen,
                            encounterBusy,
                            encounterCombatants,
                            encounterEffects,
                            expiredEffectsOpen,
                            finishOnlineTableDockDrag,
                            firebaseConnectionLabel,
                            firebaseError,
                            firebaseReady,
                            firebaseUser,
                            getCombatant,
                            hasInitiativeValue,
                            hpSyncStatus,
                            isCurrentRoomMaster,
                            joinOnlineRoom,
                            lastOnlineRoom,
                            leaveOnlineRoom,
                            manager,
                            minimizeOnlineTable,
                            moveOnlineTableDock,
                            movePreparedParticipant,
                            returnToCampaignHub,
                            onlineEncounterPanel,
                            onlineEncounterView,
                            onlineRoomModule,
                            onlineStatus,
                            onlineTableBusy,
                            onlineTableContentRef,
                            onlineTableDockDragRef,
                            onlineTableDockDragging,
                            onlineTableDockPosition,
                            onlineTableDockRef,
                            onlineTableError,
                            onlineTableGuideOpen,
                            onlineTableMenuOpen,
                            onlineTableMotion,
                            onlineTableNotice,
                            onlineTableOpen,
                            onlineTableScreen,
                            onlineTableScrollPositionsRef,
                            onlineTableView,
                            onlineTableViewContentRef,
                            openCharacterSelector,
                            openCloudCampaign,
                            openConditionModal,
                            openEffectModal,
                            openEnemyModal,
                            openOwnCharacterFromEncounter,
                            openParticipantHpModal,
                            outsideEncounterEnemyIds,
                            ownRoomParticipant,
                            participantInitiativeDrafts,
                            participantName,
                            permanentlyDeleteEffect,
                            playerNameInput,
                            playerRoomParticipants,
                            postponeCurrentTurn,
                            postponeOpen,
                            preparedTurnOrder,
                            privateEnemies,
                            publicCombatants,
                            removeOnlineCondition,
                            retryPendingHpSync,
                            roomCodeInput,
                            roomData,
                            roomInvite,
                            roomMembers,
                            roomParticipants,
                            roomPlayerSheets,
                            saveOnlineTableViewScroll,
                            selectedCombatantId,
                            setCreatedRoomCode,
                            setEncounterActionsOpen,
                            setEncounterSetupOpen,
                            setEncounterStatus,
                            setEnemyHpModal,
                            setExpiredEffectsOpen,
                            setFinishEncounterPrompt,
                            setOnlineAvatarViewer,
                            setOnlineEncounterPanel,
                            setOnlineEncounterView,
                            setOnlinePlayerSheetId,
                            setOnlineRoomModule,
                            setOnlineTableError,
                            setOnlineTableGuideOpen,
                            setOnlineTableMenuOpen,
                            setOnlineTableNotice,
                            setOnlineTableOpen,
                            setOnlineTableScreen,
                            setOutsideEncounterEnemyIds,
                            setParticipantInitiativeDrafts,
                            setPlayerNameInput,
                            setPostponeOpen,
                            setRoomCodeInput,
                            setRoomInvite,
                            setSelectedCombatantId,
                            setShareCharacterOpen,
                            shareCharacterOpen,
                            shareLocalCharacter,
                            shareRoomLink,
                            shareRoomWithSystem,
                            sharedCharacter,
                            sharedCharacterId,
                            sharingCharacter,
                            sheetSyncStatus,
                            shouldShowEncounter,
                            startEncounter,
                            togglePreparedParticipant,
                            startOnlineTableDockDrag,
                            updateEffectRemaining,
                            updateEnemyHp,
                            updateParticipantHp,
                            updateSharedCharacter
                        }} />
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
                        {isCurrentRoomMaster && onlinePlayerSheetId && <OnlinePlayerSheetModal
                            participant={playerRoomParticipants.find(participant => participant.ownerUid === onlinePlayerSheetId) || null}
                            sheetDocument={roomPlayerSheets.find(sheet => (sheet.ownerUid || sheet.id) === onlinePlayerSheetId) || null}
                            onClose={() => setOnlinePlayerSheetId(null)}
                            onAvatarPreview={setOnlineAvatarViewer}
                        />}
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
                                        <section className={`rest-intelligence ${restPreview.warnings.length ? 'has-warnings' : ''}`}>
                                            <header><span aria-hidden="true">✦</span><div><small>Resumen inteligente</small><strong>{restPreviewChangeCount ? `${restPreviewChangeCount} cambio${restPreviewChangeCount === 1 ? '' : 's'} automático${restPreviewChangeCount === 1 ? '' : 's'}` : 'Sin cambios automáticos pendientes'}</strong><p>{restPreview.manualActions.length ? `${restPreview.manualActions.length} punto${restPreview.manualActions.length === 1 ? '' : 's'} requiere${restPreview.manualActions.length === 1 ? '' : 'n'} tu atención.` : 'No quedan decisiones manuales detectadas.'}</p></div><b className={restPreview.warnings.some(item => item.tone === 'danger') ? 'is-danger' : restPreview.warnings.length ? 'is-warning' : 'is-ready'}>{restPreview.warnings.length ? 'Revisar' : 'Listo'}</b></header>
                                            {restPreview.warnings.length > 0 && <div className="rest-intelligence-warnings">{restPreview.warnings.map(warning => <p key={warning.id} className={`is-${warning.tone || 'warning'}`}><span>!</span>{warning.text}</p>)}</div>}
                                            {restPreview.manualActions.length > 0 && <div className="rest-manual-actions">{restPreview.manualActions.map(action => <article key={action.id}><span aria-hidden="true">◇</span><div><strong>{action.label}</strong><p>{action.detail}</p></div></article>)}</div>}
                                        </section>
                                        {restType === 'short' && <section className="rest-hit-dice-panel">
                                            <div className="rest-section-heading"><div><small>Recuperación manual</small><h4>Dados de golpe</h4></div><span>{hitDice.current || 0} {hitDice.type || ''} disponibles</span></div>
                                            <div className="rest-dice-controls"><button type="button" onClick={() => setRestSpentDice(value => Math.max(0, Number(value) - 1))} disabled={!Number(restSpentDice)} aria-label="Gastar un dado menos">−</button><div><small>Dados que gastarás</small><strong>{restSpentDice}</strong><span>{hitDice.type || 'dados'}</span></div><button type="button" disabled={(Number(hp.current) || 0) >= (Number(hp.max) || 0) || Number(restSpentDice) >= (Number(hitDice.current) || 0)} onClick={() => setRestSpentDice(value => Math.min(Number(hitDice.current) || 0, Number(value) + 1))} aria-label="Gastar un dado más">+</button></div>
                                            <label className="rest-healing-field"><span><small>Resultado total</small><strong>Puntos de golpe recuperados</strong></span><input disabled={!Number(restSpentDice)} min="0" inputMode="numeric" type="number" value={restHealing} onChange={event => setRestHealing(event.target.value === '' ? '' : Math.max(0, Number(event.target.value) || 0))}/></label>
                                            <p className="rest-manual-note"><span>!</span> Tira tus dados fuera de la aplicación, suma los modificadores correspondientes e introduce aquí el total.</p>
                                        </section>}
                                        <section className="rest-preview-panel">
                                            <div className="rest-section-heading"><div><small>Antes de confirmar</small><h4>Así quedará la ficha</h4></div><span>{restPreviewChangeCount} cambio{restPreviewChangeCount === 1 ? '' : 's'}</span></div>
                                            <div className="rest-preview-primary"><article><span>♥</span><div><small>Puntos de golpe</small><strong>{hp.current || 0} <i>→</i> {restPreview.data.hp?.current || 0} <em>/ {hp.max || 0}</em></strong></div></article><article><span>◆</span><div><small>Dados de golpe</small><strong>{hitDice.current || 0} <i>→</i> {restPreview.data.hitDice?.current || 0} <em>{hitDice.type || ''}</em></strong></div></article>{restPreviewTempHpChanged && <article><span>✧</span><div><small>PV temporales</small><strong>{hp.temp || 0} <i>→</i> {restPreview.data.hp?.temp || 0}</strong></div></article>}{restPreviewDeathSavesChanged && <article><span>†</span><div><small>Salvaciones de muerte</small><strong>{Number(deathSaves.successes) + Number(deathSaves.failures)} marcas <i>→</i> 0</strong></div></article>}</div>
                                            {(restPreviewResources.length > 0 || restPreviewSlots.length > 0 || restPreviewPact) ? <div className="rest-recovery-list">{restPreviewResources.map(resource => <div key={resource.name}><span>✦</span><p><small>{resource.name}</small><strong>{resource.before} → {resource.after} / {resource.max}</strong></p></div>)}{restPreviewSlots.map(slot => <div key={`slot_${slot.level}`}><span>◇</span><p><small>Ranuras de nivel {slot.level}</small><strong>{slot.before} → {slot.after} / {slot.max}</strong></p></div>)}{restPreviewPact && <div><span>⬡</span><p><small>Magia de pacto</small><strong>{restPreviewPact.before} → {restPreviewPact.after} / {restPreviewPact.max}</strong></p></div>}</div> : <p className="rest-no-changes">No hay otros recursos que necesiten recuperarse.</p>}
                                            {restPreview.unchanged.length > 0 && <details className="rest-unchanged"><summary>Recursos sin cambios ({restPreview.unchanged.length})</summary><p>{restPreview.unchanged.join(' · ')}</p></details>}
                                        </section>
                                        <footer className="rest-planner-actions"><button type="button" onClick={() => chooseRestType(null)}>Volver</button><button type="button" className="is-primary" disabled={restPreview.warnings.some(item => item.tone === 'danger')} onClick={confirmRest}><span>{restType === 'short' ? '♨' : '☾'}</span> Confirmar {restType === 'short' ? 'descanso corto' : 'descanso largo'}</button></footer>
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

                        <CompanionManagerModal
                            open={companionManagerOpen}
                            focusId={companionFocusId}
                            focusField={companionFocusField}
                            companions={companions}
                            srdMonsters={srdMonsterCompendium.monsters}
                            localMonsters={bestiary.monsters}
                            getMonsterIcon={getMonsterIconPath}
                            onChange={setCompanions}
                            onDelete={requestDeleteCompanion}
                            onClose={() => { setCompanionManagerOpen(false); setCompanionFocusId(null); setCompanionFocusField(null); }}
                        />
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
                            getMonsterIcon={getMonsterIconPath}
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

                        <ActionDialogs model={{
                            bestiary,
                            bestiaryEnemyDraft,
                            bestiaryEnemyQuery,
                            bestiaryEnemySelectorOpen,
                            bestiaryEnemyTag,
                            castSpell,
                            castWithSlot,
                            closeConfirm,
                            confirmDelete,
                            confirmDialog,
                            createEnemyFromBestiaryDraft,
                            creatingEnemy,
                            editingSlotLevel,
                            enemySourceChoiceOpen,
                            formatSheetRollFormula,
                            getSpellResolution,
                            getSrdSpellDiceDetails,
                            grimoireConfig,
                            notesModalOpen,
                            openBestiaryEnemyDraft,
                            openDirectEnemyModal,
                            resolveSpellCastDice,
                            sessionNotes,
                            setBestiaryCompendiumOpen,
                            setBestiaryCompendiumPreview,
                            setBestiaryEnemyDraft,
                            setBestiaryEnemyQuery,
                            setBestiaryEnemySelectorOpen,
                            setBestiaryEnemyTag,
                            setCastSpell,
                            setEditingSlotLevel,
                            setEnemySourceChoiceOpen,
                            setNotesModalOpen,
                            setSessionNotes,
                            setSpellCastAnimation,
                            setSpellSlots,
                            spellCastAnimation,
                            spellSaveDc,
                            spellSlots,
                            srdMonsterCompendium,
                            updateBestiaryEnemyCopies
                        }} />

                        <EditorDialogs model={{
                            addModal,
                            addNamePlaceholders,
                            equipmentCompendiumCategory,
                            equipmentCompendiumOpen,
                            equipmentCompendiumQuery,
                            getWeaponAttackBonus,
                            getWeaponAttackProficiency,
                            handleAddSubmit,
                            handleNumInput,
                            hasWeaponProficiency,
                            inferWeaponAbility,
                            inventory,
                            marketCompendiumItems,
                            proficiencies,
                            selectedWeapon,
                            setAddModal,
                            setEquipmentCompendiumCategory,
                            setEquipmentCompendiumOpen,
                            setEquipmentCompendiumQuery,
                            setSkillModal,
                            skillModal,
                            updateSkillProficiency
                        }} />


                    </div>
                </div>
            );
        }

        window.DndCharacterSheetApp = { KaelCharacterSheet };
