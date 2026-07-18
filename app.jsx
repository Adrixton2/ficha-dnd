        const { useState, useEffect, useRef } = React;
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
            OnlineCombatantAvatar: OnlineCombatantAvatarView
        } = window.DndOnlineComponents;

        const { useCharacterManager, useCharacterField } = window.DndCharacterManager;

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
            const [bestiaryOpen, setBestiaryOpen] = useState(false);
            const [bestiaryQuery, setBestiaryQuery] = useState('');
            const [bestiaryTag, setBestiaryTag] = useState('');
            const [bestiarySort, setBestiarySort] = useState('name');
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
            const [level, setLevel] = useCharacterField(activeCharacter.data, updateActiveData, 'level');
            const PROF_BONUS = Math.ceil((Number(level) || 1) / 4) + 1;

            const [inspiration, setInspiration] = useCharacterField(activeCharacter.data, updateActiveData, 'inspiration');

            const [hp, setHp] = useCharacterField(activeCharacter.data, updateActiveData, 'hp');
            const [hitDice, setHitDice] = useCharacterField(activeCharacter.data, updateActiveData, 'hitDice');
            
            const [speed, setSpeed] = useCharacterField(activeCharacter.data, updateActiveData, 'speed');
            const [size, setSize] = useCharacterField(activeCharacter.data, updateActiveData, 'size');
            const [initBonus, setInitBonus] = useCharacterField(activeCharacter.data, updateActiveData, 'initBonus');
            const [deathSaves, setDeathSaves] = useCharacterField(activeCharacter.data, updateActiveData, 'deathSaves');

            const [stats, setStats] = useCharacterField(activeCharacter.data, updateActiveData, 'stats');
            const [tempStats, setTempStats] = useCharacterField(activeCharacter.data, updateActiveData, 'tempStats');
            const [savingThrows, setSavingThrows] = useCharacterField(activeCharacter.data, updateActiveData, 'savingThrows');

            const [proficiencies, setProficiencies] = useCharacterField(activeCharacter.data, updateActiveData, 'proficiencies');

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
            const [activeTab, setActiveTab] = useState("character");
            const [combatMode, setCombatMode] = useState(false);
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
            const [spells, setSpells] = useCharacterField(activeCharacter.data, updateActiveData, 'spells');
            const [spellLimits, setSpellLimits] = useCharacterField(activeCharacter.data, updateActiveData, 'spellLimits');
            const [spellSlots, setSpellSlots] = useCharacterField(activeCharacter.data, updateActiveData, 'spellSlots');
            const [grimoireConfig, setGrimoireConfig] = useCharacterField(activeCharacter.data, updateActiveData, 'grimoireConfig');
            const [conditions, setConditions] = useCharacterField(activeCharacter.data, updateActiveData, 'conditions');
            const [timers, setTimers] = useCharacterField(activeCharacter.data, updateActiveData, 'timers');
            const [activityLog, setActivityLog] = useCharacterField(activeCharacter.data, updateActiveData, 'activityLog');
            const [sessionNotes, setSessionNotes] = useCharacterField(activeCharacter.data, updateActiveData, 'sessionNotes');
            const [grimoireView, setGrimoireView] = useState('library');
            const [spellSearch, setSpellSearch] = useState('');
            const [spellFilter, setSpellFilter] = useState('all');
            const [castSpell, setCastSpell] = useState(null);
            const [grimoireSettingsOpen, setGrimoireSettingsOpen] = useState(false);
            const [showEmptySlots, setShowEmptySlots] = useState(false);
            const [editingSlotLevel, setEditingSlotLevel] = useState(null);
            const [restModalOpen, setRestModalOpen] = useState(false);
            const [restType, setRestType] = useState(null);
            const [restSpentDice, setRestSpentDice] = useState(0);
            const [restHealing, setRestHealing] = useState(0);
            const [timerModal, setTimerModal] = useState({ isOpen: false, id: null, data: { name: '', current: '1', max: '', type: 'turns' } });
            const [timerNow, setTimerNow] = useState(Date.now());

            // ESTADOS PARA MODALES
            const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null, isAlert: false });
            const [skillModal, setSkillModal] = useState({ isOpen: false, skillKey: null, skillName: "" });
            const [addModal, setAddModal] = useState({ isOpen: false, type: null, data: {} }); 
            const [notesModalOpen, setNotesModalOpen] = useState(false);
            const [diaryOpen, setDiaryOpen] = useState(false);
            const [characterManagerOpen, setCharacterManagerOpen] = useState(false);
            const [pendingImport, setPendingImport] = useState(null);
            const importFileRef = useRef(null);
            const portraitFileRef = useRef(null);

            // Ref para la barra de vida táctil
            const hpBarRef = useRef(null);
            const [isDraggingHp, setIsDraggingHp] = useState(false);
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
                    if (previous.snapshot.spellSlots[level] !== undefined && previous.snapshot.spellSlots[level] !== current) changes.push(`Ranura nivel ${level} ${previous.snapshot.spellSlots[level]} → ${current}`);
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

            const getModNum = (scoreStr) => {
                const score = Number(scoreStr) || 0;
                return Math.floor((score - 10) / 2);
            };
            const getEffectiveStat = (statKey) => (Number(stats[statKey]) || 0) + (Number(tempStats[statKey]) || 0);
            
            const formatMod = (mod) => (mod >= 0 ? `+${mod}` : mod);
            
            const getPassivePerception = () => {
                const isExp = proficiencies.expertise.includes('percepcion');
                const isProf = proficiencies.proficient.includes('percepcion');
                const baseMod = getModNum(getEffectiveStat('sab'));
                const totalMod = baseMod + (isExp ? PROF_BONUS * 2 : isProf ? PROF_BONUS : 0);
                return 10 + totalMod;
            };

            const calculateBaseAC = () => {
                const equippedArmor = armors.find(a => a.equipped && a.type !== 'shield');
                const equippedShield = armors.find(a => a.equipped && a.type === 'shield');
                
                let baseAc = 10;
                let dexLimit = Infinity;
                
                if (equippedArmor) {
                    baseAc = Number(equippedArmor.ac) || 0;
                    if (equippedArmor.type === 'medium') dexLimit = 2;
                    if (equippedArmor.type === 'heavy') dexLimit = 0;
                }
                
                let dexMod = getModNum(getEffectiveStat('des'));
                dexMod = Math.min(dexMod, dexLimit);
                
                let shieldBonus = 0;
                if (equippedShield) {
                    shieldBonus = Number(equippedShield.ac) || 2;
                }
                
                return baseAc + dexMod + shieldBonus;
            };

            const calculateAC = () => calculateBaseAC() + (Number(miscAc) || 0);

            const stealthDisadvantageArmor = armors.find(a => a.equipped && a.stealthDis);
            const isStealthDisadvantaged = !!stealthDisadvantageArmor;
            const getAcBreakdown = () => {
                const equippedArmor = armors.find(armor => armor.equipped && armor.type !== 'shield');
                const equippedShield = armors.find(armor => armor.equipped && armor.type === 'shield');
                const dexLimit = equippedArmor?.type === 'medium' ? 2 : equippedArmor?.type === 'heavy' ? 0 : Infinity;
                const dexApplied = Math.min(getModNum(getEffectiveStat('des')), dexLimit);
                return { armor: equippedArmor, shield: equippedShield, armorBase: equippedArmor ? (Number(equippedArmor.ac) || 0) : 10, dexApplied, shieldBonus: equippedShield ? (Number(equippedShield.ac) || 2) : 0, temporary: Number(miscAc) || 0 };
            };

            // Funciones de interacción rápida
            const toggleSavingThrow = (statKey) => {
                setSavingThrows(prev => prev.includes(statKey) ? prev.filter(s => s !== statKey) : [...prev, statKey]);
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
                    isAlert: false
                });
            };
            const showAlert = (message) => setConfirmDialog({ isOpen: true, message, onConfirm: null, isAlert: true });
            const closeConfirm = () => setConfirmDialog({ isOpen: false, message: "", onConfirm: null, isAlert: false });

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
            };
            const deleteManagedCharacter = (id) => {
                if (characterList.length <= 1) {
                    showAlert('No puedes eliminar el único personaje. Crea otro personaje antes de borrar esta ficha.');
                    return;
                }
                const name = manager.characters[id]?.meta.name || 'este personaje';
                confirmDelete(`¿Eliminar definitivamente a ${name}? Esta acción no se puede deshacer.`, () => deleteCharacter(id));
            };
            const buildActiveCharacterExport = () => {
                const payload = createExportPayload(activeCharacter);
                const content = JSON.stringify(payload, null, 2);
                const fileName = createSafeExportFileName(activeCharacter.meta.name);
                return { content, fileName, blob: new Blob([content], { type: 'application/json' }) };
            };
            const exportActiveCharacter = () => {
                const { blob, fileName } = buildActiveCharacterExport();
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
            const shareActiveCharacter = async () => {
                const { content, fileName } = buildActiveCharacterExport();
                const file = new File([content], fileName, { type: 'application/json' });
                if (!navigator.canShare({ files: [file] })) {
                    exportActiveCharacter();
                    return;
                }
                try {
                    await navigator.share({ title: activeCharacter.meta.name || 'Personaje D&D', files: [file] });
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
                    let po = Number(prev.po) || 0;
                    let pp = Number(prev.pp) || 0;
                    let pc = Number(prev.pc) || 0;
                    if (type === 'pc') pc += amount;
                    if (type === 'pp') pp += amount;
                    if (type === 'po') po += amount;
                    while (pc >= 10) { pc -= 10; pp += 1; }
                    while (pp >= 10) { pp -= 10; po += 1; }
                    while (pc < 0 && pp > 0) { pp -= 1; pc += 10; }
                    while (pp < 0 && po > 0) { po -= 1; pp += 10; }
                    if (pc < 0) pc = 0; if (pp < 0) pp = 0; if (po < 0) po = 0;
                    return { po: String(po), pp: String(pp), pc: String(pc) };
                });
            };

            const adjustInvQty = (id, delta) => {
                setInventory(prev => prev.map(item => {
                    if (item.id === id) {
                        return { ...item, qty: Math.max(0, (Number(item.qty)||0) + delta) };
                    }
                    return item;
                }));
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
                    const newWp = { id: 'wp_' + Date.now(), name: data.name, attacks: [] };
                    setWeapons([...weapons, newWp]);
                    setSelectedWeaponId(newWp.id);
                }
                if (type === 'attack' && data.name && selectedWeaponId) {
                    setWeapons(weapons.map(w => w.id === selectedWeaponId ? 
                        { ...w, attacks: [...w.attacks, { name: data.name, atk: data.atk, dmg: data.dmg, notes: data.notes }] } : w
                    ));
                }
                if (type === 'resource' && data.name) {
                    setResources([...resources, { id: 'res_' + Date.now(), name: data.name, current: Number(data.max)||0, max: Number(data.max)||0, type: data.dice || '', recoveryRest: data.recoveryRest || 'manual', recoveryMode: data.recoveryMode || 'full', recoveryAmount: Number(data.recoveryAmount) || 0 }]);
                }
                if (type === 'spell' && data.name) {
                    const level = Math.max(0, Math.min(9, Number(data.level)));
                    const knownCount = spells.filter(spell => spell.level > 0 && spell.known).length;
                    const cantripCount = spells.filter(spell => spell.level === 0 && spell.known).length;
                    if ((level === 0 && grimoireConfig.useCantripLimit && cantripCount >= (Number(grimoireConfig.cantripLimit) || 0)) || (level > 0 && grimoireConfig.useKnownLimit && knownCount >= (Number(grimoireConfig.knownLimit) || 0))) {
                        showAlert('Has alcanzado el límite configurado para ese tipo de conjuro.');
                    } else setSpells([...spells, normalizeSpell({ ...data, id: 'sp_' + Date.now(), level, known: true, prepared: false })]);
                }
                setAddModal({ isOpen: false, type: null, data: {} });
            };

            const toggleSpellPreparation = (sp) => {
                if (!grimoireConfig.usePrepared || sp.level === 0) return;
                if (!sp.prepared) {
                    const maxPrep = Number(grimoireConfig.preparedLimit) || 0;
                    const currentPrep = spells.filter(s => s.level > 0 && s.prepared).length;
                    if (currentPrep >= maxPrep) {
                        showAlert(`Has alcanzado tu límite máximo de ${maxPrep} hechizos preparados.`);
                        return;
                    }
                }
                setSpells(spells.map(s => s.id === sp.id ? {...s, prepared: !s.prepared} : s));
            };
            const toggleSpellKnown = (sp) => {
                if (sp.level === 0 || !grimoireConfig.useKnownLimit) return;
                if (!sp.known && knownSpellCount >= (Number(grimoireConfig.knownLimit) || 0)) { showAlert('Has alcanzado el límite de conjuros conocidos.'); return; }
                setSpells(spells.map(item => item.id === sp.id ? { ...item, known: !item.known, prepared: item.known ? false : item.prepared } : item));
            };

            const castWithSlot = (slotLevel, pact = false) => {
                if (!castSpell) return;
                if (castSpell.level === 0) { setCastSpell(null); return; }
                if (pact) setGrimoireConfig(prev => ({ ...prev, pactSlots: { ...prev.pactSlots, current: Math.max(0, Number(prev.pactSlots.current) - 1) } }));
                else setSpellSlots(prev => ({ ...prev, [slotLevel]: { ...prev[slotLevel], current: Math.max(0, Number(prev[slotLevel].current) - 1) } }));
                setCastSpell(null);
            };

            // Cálculos para la barra de vida de videojuego
            const curHp = Number(hp.current) || 0;
            const maxHp = Number(hp.max) || 1;
            const tmpHp = Number(hp.temp) || 0;
            
            const hpPercent = Math.min(100, Math.max(0, (curHp / maxHp) * 100));
            const tempHpPercent = Math.min(100, Math.max(0, (tmpHp / maxHp) * 100));

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
            useEffect(() => { setRestModalOpen(false); setRestType(null); }, [manager.activeCharacterId]);
            const restPreview = restType ? calculateRestPreview(restType, activeCharacter.data, restSpentDice, restHealing) : null;
            const confirmRest = () => {
                if (!restPreview) return;
                activitySnapshotRef.current = { characterId: manager.activeCharacterId, snapshot: createActivitySnapshot(restPreview.data) };
                updateActiveData(restPreview.data);
                appendActivity(restType === 'short' ? 'Descanso corto' : 'Descanso largo');
                setRestModalOpen(false); setRestType(null); setRestSpentDice(0); setRestHealing(0);
            };
            const knownSpellCount = spells.filter(spell => spell.level > 0 && spell.known).length;
            const preparedSpellCount = spells.filter(spell => spell.level > 0 && spell.prepared).length;
            const cantripCount = spells.filter(spell => spell.level === 0 && spell.known).length;
            const availableSpells = spells.filter(spell => spell.level === 0 || (grimoireConfig.usePrepared ? spell.prepared : grimoireConfig.useKnownLimit ? spell.known : true));
            const tacticalWeapons = (() => {
                const favorites = weapons.filter(weapon => weapon.favorite);
                return favorites.length ? favorites : weapons.slice(0, 3);
            })();
            const tacticalSpells = (() => {
                if (grimoireConfig.usePrepared) return spells.filter(spell => spell.prepared);
                const favorites = spells.filter(spell => spell.favorite);
                return favorites.length ? favorites : availableSpells.slice(0, 3);
            })();
            const tacticalResources = resources.filter(resource => Number(resource.max) > 0);
            const combatConditions = ['Derribado', 'Agarrado', 'Invisible', 'Asustado', 'Hechizado', 'Envenenado', 'Paralizado', 'Petrificado', 'Aturdido', 'Restringido'];
            const addNamePlaceholders = { item: 'Ej: Cuerda de cáñamo', armor: 'Ej: Armadura de cuero', tool: 'Ej: Herramientas de ladrón', weapon: 'Ej: Espada larga', resource: 'Ej: Puntos de Ki', spell: 'Ej: Bola de fuego', attack: 'Ej: Ataque con espada' };
            const renderAcTemporaryControls = () => (
                <div className="mt-2 flex flex-col items-center gap-1 z-10">
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">Base {calculateBaseAC()} · Temporal {formatMod(Number(miscAc) || 0)}</span>
                    <div className="flex items-center justify-center gap-1">
                        <button type="button" aria-label="Reducir modificador temporal de CA" onClick={() => setMiscAc(String((Number(miscAc) || 0) - 1))} className="w-8 h-8 rounded border border-gray-600 bg-gray-800 text-gray-200 hover:border-purple-400">−</button>
                        <input aria-label="Modificador temporal de CA" type="number" value={miscAc} onChange={e => setMiscAc(handleNumInput(e.target.value))} className="w-12 h-8 rounded border border-gray-600 bg-gray-950 text-center text-sm font-bold text-white outline-none focus:border-purple-500" />
                        <button type="button" aria-label="Aumentar modificador temporal de CA" onClick={() => setMiscAc(String((Number(miscAc) || 0) + 1))} className="w-8 h-8 rounded border border-gray-600 bg-gray-800 text-gray-200 hover:border-purple-400">+</button>
                    </div>
                    <button type="button" disabled={(Number(miscAc) || 0) === 0} onClick={() => { if ((Number(miscAc) || 0) !== 0) setMiscAc('0'); }} className="text-[10px] text-purple-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed">Reiniciar</button>
                </div>
            );
            const renderAcBreakdown = () => {
                const breakdown = getAcBreakdown();
                return <div className="mt-2 w-full rounded border border-gray-700/80 bg-gray-950/40 px-2 py-1.5 text-center text-[10px] leading-relaxed text-gray-400">
                    <span className="block text-gray-300">Armadura: <b>{breakdown.armor ? `${breakdown.armor.name} (${breakdown.armorBase})` : 'Sin armadura (10)'}</b></span>
                    <span>DES aplicada: <b className="text-purple-300">{formatMod(breakdown.dexApplied)}</b></span>
                    {breakdown.shield && <span> · Escudo: <b className="text-purple-300">+{breakdown.shieldBonus}</b></span>}
                    {breakdown.temporary !== 0 && <span> · Temporal: <b className="text-cyan-300">{formatMod(breakdown.temporary)}</b></span>}
                </div>;
            };
            const renderUsageDots = (current, max, colorClass = 'text-purple-400') => {
                const safeMax = Math.floor(Math.max(0, Number(max) || 0));
                const safeCurrent = Math.floor(Math.max(0, Math.min(safeMax, Number(current) || 0)));
                if (!safeMax) return null;
                if (safeMax > 12) return <span className={`text-xs font-mono ${colorClass}`} aria-label={`${safeCurrent} de ${safeMax} usos disponibles`}>● × {safeCurrent} / {safeMax}</span>;
                return <span className="flex flex-wrap justify-center gap-1" role="img" aria-label={`${safeCurrent} de ${safeMax} usos disponibles`}>{Array.from({ length: safeMax }, (_, index) => <span key={index} aria-hidden="true" className={`text-sm leading-none ${index < safeCurrent ? colorClass : 'text-gray-700'}`}>●</span>)}</span>;
            };
            const renderTimerList = (editable = false) => sortedTimers.length ? (
                <div className="space-y-2">
                    {sortedTimers.map(timer => {
                        const remaining = getTimerRemaining(timer);
                        const expired = remaining === 0;
                        const hasMax = timer.max !== '' && timer.max !== null && timer.max !== undefined;
                        return <div key={timer.id} className={`flex flex-wrap items-center justify-between gap-2 rounded border p-2.5 ${expired ? 'border-red-500 bg-red-950/40' : 'border-gray-700 bg-gray-900/60'}`}>
                            <div className="min-w-0"><strong className={`block text-sm truncate ${expired ? 'text-red-200' : 'text-gray-100'}`}>{timer.name}</strong><span className={`text-xs ${expired ? 'text-red-300' : 'text-purple-300'}`}>{expired ? 'Expirado' : `${formatTimerRemaining(timer)}${hasMax ? ` / ${timer.max}` : ''}`}</span></div>
                            {editable && <div className="flex items-center gap-1 shrink-0"><button type="button" aria-label={`Reducir ${timer.name}`} onClick={() => adjustTimer(timer.id, -1)} className="w-9 h-9 rounded border border-gray-600 bg-gray-800 text-gray-200">−</button><input aria-label={`Valor de ${timer.name}`} type="number" min="0" value={remaining} onChange={event => setTimerRemaining(timer.id, event.target.value)} className="w-12 h-9 rounded border border-gray-600 bg-gray-950 text-center text-sm text-white"/><button type="button" aria-label={`Aumentar ${timer.name}`} onClick={() => adjustTimer(timer.id, 1)} className="w-9 h-9 rounded border border-gray-600 bg-gray-800 text-gray-200">+</button><button type="button" onClick={() => openTimerModal(timer)} className="min-h-9 px-2 rounded border border-gray-600 text-xs text-gray-200">Editar</button><button type="button" onClick={() => confirmDelete(`¿Eliminar el temporizador "${timer.name}"?`, () => setTimers(previous => previous.filter(item => item.id !== timer.id)))} className="w-9 h-9 rounded border border-red-800 text-red-300">×</button></div>}
                        </div>;
                    })}
                </div>
            ) : <p className="text-sm text-gray-500">No hay temporizadores activos.</p>;
            const displayedSpells = (grimoireView === 'available' ? availableSpells : spells).filter(spell => {
                const query = spell.name.toLowerCase().includes(spellSearch.toLowerCase());
                const filter = spellFilter === 'all' || (spellFilter === 'cantrip' && spell.level === 0) || (spellFilter === 'prepared' && spell.prepared) || (spellFilter === 'ritual' && spell.ritual) || (spellFilter === 'concentration' && spell.concentration) || (spellFilter === 'favorite' && spell.favorite) || Number(spellFilter) === spell.level;
                return query && filter;
            }).slice().sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

            return (
                <div className="app-shell h-[100dvh] overflow-hidden p-2 pb-20 md:p-6 md:pb-24 text-gray-200">
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
                                    <div className="health-bar-container" data-no-tab-swipe onPointerDown={handleHpPointerDown} onPointerMove={handleHpPointerMove} onPointerUp={handleHpPointerUp} onPointerCancel={handleHpPointerUp}>
                                        <div className="glass-overlay"></div>
                                        <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-75" style={{ width: `${hpPercent}%` }}></div>
                                        {tmpHp > 0 && <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-300 opacity-80 transition-all duration-300 border-r border-white shadow-[0_0_8px_#22d3ee] pointer-events-none" style={{ width: `${tempHpPercent}%` }}></div>}
                                    </div>
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
                                    <div className="combat-mode-list">{tacticalWeapons.length ? tacticalWeapons.map(weapon => <div key={weapon.id} className="rounded border border-gray-700 bg-gray-900/70 p-2"><strong className="block text-sm text-white">{weapon.name}</strong>{weapon.attacks?.slice(0, 2).map((attack, index) => <div key={`${weapon.id}-${index}`} className="mt-1 flex justify-between gap-3 text-xs"><span className="truncate text-gray-300">{attack.name}</span><span className="shrink-0 text-green-300">{attack.atk || '-'}</span><span className="shrink-0 text-red-300">{attack.dmg || '-'}</span></div>)}</div>) : <p className="text-sm text-gray-500">No hay armas configuradas.</p>}</div>
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

                        <div data-tab="combat" className="tab-section space-y-6">
                        {/* TOP BAR: STATS PRINCIPALES (BARRA DE VIDA, CA, ETC) */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                            
                            {/* BLOQUE DE VIDA ESTILO VIDEOJUEGO (Ocupa 2 columnas) */}
                            <div className="col-span-2 rpg-panel p-3 flex flex-col justify-center relative overflow-hidden">
                                <div className="flex justify-between items-end mb-1 z-10">
                                    <span className="font-fantasy text-red-400 text-[10px] md:text-sm font-bold uppercase tracking-widest">Salud</span>
                                    <div className="flex items-center space-x-1 font-sans">
                                        <input type="number" placeholder="0" value={hp.current} onChange={e => setHp(p => ({ ...p, current: handleNumInput(e.target.value) }))} className="w-12 bg-transparent text-right text-2xl font-bold text-white outline-none" />
                                        <span className="text-gray-500 text-lg">/</span>
                                        <input type="number" placeholder="0" value={hp.max} onChange={e => setHp(p => ({ ...p, max: handleNumInput(e.target.value) }))} className="w-10 bg-transparent text-left text-lg text-gray-400 outline-none border-b border-transparent hover:border-gray-600 focus:border-red-500" />
                                    </div>
                                </div>
                                
                                {/* Barra Visual Táctil (Draggable) */}
                                <div 
                                    className="health-bar-container mt-1"
                                    data-no-tab-swipe
                                    ref={hpBarRef}
                                    onPointerDown={handleHpPointerDown}
                                    onPointerMove={handleHpPointerMove}
                                    onPointerUp={handleHpPointerUp}
                                    onPointerCancel={handleHpPointerUp}
                                >
                                    <div className="glass-overlay"></div>
                                    <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-75" style={{ width: `${hpPercent}%` }}></div>
                                    {tmpHp > 0 && (
                                        <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-300 opacity-80 transition-all duration-300 border-r border-white shadow-[0_0_8px_#22d3ee] pointer-events-none" style={{ width: `${tempHpPercent}%` }}></div>
                                    )}
                                </div>

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
                            <div className="rpg-panel p-3 flex flex-col items-center justify-center">
                                <span className="font-fantasy text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 text-center">Dados Golpe</span>
                                <div className="min-h-5 mb-2">{renderUsageDots(hitDice.current, level, 'text-cyan-400')}</div>
                                <div className="grid h-8 grid-cols-[2rem_3.25rem_2rem] items-center justify-center gap-1">
                                    <button onClick={() => setHitDice(p => ({ ...p, current: String(Math.max(0, (Number(p.current)||0) - 1)) }))} className="w-8 h-8 rounded bg-gray-800 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 flex items-center justify-center">−</button>
                                    <div className="grid h-8 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center text-sm font-bold leading-none text-white"><input aria-label="Dados de golpe actuales" type="number" placeholder="0" value={hitDice.current} onChange={e => setHitDice(p => ({ ...p, current: handleNumInput(e.target.value) }))} className="h-8 w-full bg-transparent text-center leading-8 outline-none" /><span className="flex h-8 items-center justify-center px-0.5 text-gray-500">/</span><span className="flex h-8 items-center justify-center text-gray-400">{Number(level)||0}</span></div>
                                    <button onClick={() => setHitDice(p => ({ ...p, current: String(Math.min(Number(level)||0, (Number(p.current)||0) + 1)) }))} className="w-8 h-8 rounded bg-gray-800 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 flex items-center justify-center">+</button>
                                </div>
                                <div className="text-gray-500 text-[10px] mt-2 flex items-center gap-1 border-t border-gray-700 pt-1 w-full justify-center"><span>Dado</span><input aria-label="Tipo de dado de golpe" type="text" placeholder="d8" title="Ej: d8" value={hitDice.type} onChange={e => setHitDice(p => ({...p, type: e.target.value}))} className="w-8 bg-transparent outline-none text-center text-purple-400 font-bold" /></div>
                            </div>

                            {/* CA Calculada */}
                            <div className="rpg-panel p-3 flex flex-col items-center justify-center relative">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDE2OCwgODUsIDI0NywgMC4xNSkiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEyIDIyczgtNCA4LTEwVjVsLTgtMy04IDN2N2MwIDYgOCAxMCA4IDEweiIvPjwvc3ZnPg==')] bg-center bg-no-repeat bg-contain opacity-50"></div>
                                <span className="font-fantasy text-purple-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 z-10 text-center">CA final</span>
                                <span className="text-4xl font-bold text-white z-10 drop-shadow-md">{calculateAC()}</span>
                                {renderAcTemporaryControls()}
                                {renderAcBreakdown()}
                            </div>

                            {/* Iniciativa y Percepción (Columna apilada) */}
                            <div className="flex flex-col gap-2">
                                <div className="rpg-panel p-2 flex flex-col items-center justify-center relative flex-1">
                                    <span className="font-fantasy text-yellow-500 text-[9px] font-bold uppercase tracking-widest mb-1">Iniciativa</span>
                                    <span className="text-2xl font-bold text-white leading-none">{formatMod(getModNum(getEffectiveStat('des')) + (Number(initBonus)||0))}</span>
                                    <div className="flex items-center text-[9px] text-gray-500 mt-1">
                                        Bono: <input type="number" value={initBonus} onChange={e => setInitBonus(handleNumInput(e.target.value))} className="w-6 bg-transparent border-b border-gray-700 text-center ml-1 outline-none focus:border-yellow-500" />
                                    </div>
                                </div>
                                <div className="rpg-panel p-2 flex flex-col items-center justify-center flex-1">
                                    <span className="font-fantasy text-blue-400 text-[9px] font-bold uppercase tracking-widest mb-1 text-center leading-tight">Percepción Pasiva</span>
                                    <span className="text-xl font-bold text-white leading-none shadow-[0_0_10px_rgba(96,165,250,0.3)] rounded-full w-8 h-8 flex items-center justify-center bg-gray-800 mt-1">{getPassivePerception()}</span>
                                </div>
                            </div>

                            {/* INSPIRACIÓN D&D 5e (2014) */}
                            <div className="rpg-panel p-3 flex flex-col items-center justify-center text-center min-h-[132px]">
                                <span className="font-fantasy text-yellow-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">Inspiración</span>
                                <button
                                    onClick={() => setInspiration(!inspiration)}
                                    className={`w-14 h-14 rounded-full transition-all duration-500 flex items-center justify-center border-2 ${inspiration ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 border-yellow-200 animate-pulse-glow text-yellow-900 scale-110' : 'bg-gray-800 border-gray-600 text-gray-500 hover:border-yellow-600 hover:text-yellow-500'}`}
                                    title="Gástala antes de tirar para obtener ventaja en un ataque, prueba o salvación."
                                    aria-label={`Inspiración ${inspiration ? 'disponible' : 'gastada'}. Gástala antes de tirar para obtener ventaja en un ataque, prueba o salvación.`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                                </button>
                                <span className={`mt-2 text-[10px] font-fantasy font-bold uppercase tracking-wider ${inspiration ? 'text-yellow-300' : 'text-gray-500'}`}>{inspiration ? 'Disponible' : 'Gastada'}</span>
                                <span className="sr-only">Gástala antes de tirar para obtener ventaja en un ataque, prueba o salvación.</span>
                            </div>

                        </div>

                        <div className="rpg-panel p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                <h2 className="font-fantasy text-sm font-bold uppercase tracking-widest text-purple-300">Condiciones</h2>
                                <button type="button" onClick={() => setConditionsManagerOpen(value => !value)} className="min-h-10 px-3 rounded border border-gray-600 bg-gray-900/70 text-xs text-gray-200 hover:border-purple-500">{conditionsManagerOpen ? 'Ocultar gestión' : 'Gestionar condiciones'}</button>
                            </div>
                            {conditions.length ? <div className="flex flex-wrap gap-2">{conditions.map(condition => <button key={condition} onClick={() => setConditions(previous => previous.filter(item => item !== condition))} className="min-h-10 px-3 rounded-full border border-red-400 bg-red-950/70 text-xs font-semibold text-red-100">{condition} ×</button>)}</div> : <p className="text-sm text-gray-500">Sin condiciones activas.</p>}
                            {conditionsManagerOpen && <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-800 pt-3">{combatConditions.map(condition => <button key={condition} onClick={() => setConditions(previous => previous.includes(condition) ? previous.filter(item => item !== condition) : [...previous, condition])} className={`min-h-10 px-3 rounded border text-xs font-semibold transition-colors ${conditions.includes(condition) ? 'border-red-400 bg-red-950/70 text-red-100' : 'border-gray-700 bg-gray-900/70 text-gray-300 hover:border-purple-500'}`}>{condition}</button>)}</div>}
                        </div>

                        <div className="rpg-panel p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                <h2 className="font-fantasy text-sm font-bold uppercase tracking-widest text-cyan-300">Temporizadores</h2>
                                <button type="button" onClick={() => openTimerModal()} className="min-h-10 px-3 rounded border border-cyan-700 bg-cyan-950/30 text-xs text-cyan-100 hover:bg-cyan-900/40">+ Temporizador</button>
                            </div>
                            {renderTimerList(true)}
                        </div>

                        {onlineReconnectState.message && <div className={`flex flex-wrap items-center justify-between gap-3 rounded border px-3 py-2 text-sm ${onlineReconnectState.status === 'error' ? 'border-yellow-800 bg-yellow-950/30 text-yellow-100' : 'border-cyan-800 bg-cyan-950/25 text-cyan-100'}`}><span>{onlineReconnectState.message}</span>{onlineReconnectState.status === 'error' && <button type="button" onClick={retryRoomConnection} className="min-h-9 px-3 rounded border border-cyan-700 text-xs text-cyan-100">Reintentar conexión</button>}</div>}
                        <div className="flex flex-wrap justify-end gap-3">
                            <button type="button" onClick={openOnlineTable} className="min-h-11 px-4 py-2 rounded border border-cyan-700 bg-cyan-950/30 text-cyan-100 hover:bg-cyan-900/40 transition-colors text-xs font-fantasy uppercase tracking-wider shadow-md">
                                Mesa online
                            </button>
                            {(!currentRoom || isCurrentRoomMaster) && <button type="button" onClick={() => setBestiaryOpen(true)} className="min-h-11 px-4 py-2 rounded border border-orange-700 bg-orange-950/30 text-orange-100 hover:bg-orange-900/40 transition-colors text-xs font-fantasy uppercase tracking-wider shadow-md">
                                Bestiario
                            </button>}
                            <button type="button" onClick={() => setCombatMode(true)} className="min-h-11 px-4 py-2 rounded border border-red-700 bg-red-950/40 text-red-100 hover:bg-red-900 transition-colors text-xs font-fantasy uppercase tracking-wider shadow-md">
                                &#9876; Modo Combate
                            </button>
                        </div>

                        </div>

                        <div data-tab="character" className="character-tab-intro tab-section">
                            {/* HEADER FANTASÍA */}
                            <div className="character-header rpg-panel p-4 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                                <div className="glass-overlay"></div>
                                <input ref={portraitFileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePortraitFile} className="hidden" />
                                <div className="z-10 flex flex-1 min-w-0 w-full flex-col sm:flex-row items-center sm:items-start gap-4">
                                    <div className="shrink-0 flex flex-col items-center gap-2">
                                        {isValidPortraitDataUrl(activeCharacter.meta.portrait) ? <button type="button" onClick={() => setPortraitViewerOpen(true)} className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border border-purple-500/70 bg-gray-900 shadow-[0_0_16px_rgba(168,85,247,0.25)] hover:border-purple-300 focus-visible:outline-purple-300" aria-label={`Ampliar retrato de ${charInfo.name || 'personaje'}`}><img src={activeCharacter.meta.portrait} alt={`Retrato de ${charInfo.name || 'personaje'}`} className="w-full h-full object-cover" /></button> : <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border border-purple-500/70 bg-gray-900 shadow-[0_0_16px_rgba(168,85,247,0.25)] flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-purple-400/70" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.8-3.8 3.2-5.8 7.5-5.8s6.7 2 7.5 5.8"/></svg></div>}
                                        {isValidPortraitDataUrl(activeCharacter.meta.portrait) ? <div className="flex gap-2"><button type="button" onClick={() => portraitFileRef.current?.click()} className="min-h-9 px-2 py-1 rounded border border-purple-700 bg-purple-950/50 hover:bg-purple-900 text-purple-100 text-[9px] font-fantasy uppercase tracking-wider">Cambiar</button><button type="button" onClick={removePortrait} className="min-h-9 px-2 py-1 rounded border border-red-800 bg-red-950/50 hover:bg-red-900 text-red-200 text-[9px] font-fantasy uppercase tracking-wider">Eliminar</button></div> : <button type="button" onClick={() => portraitFileRef.current?.click()} className="min-h-9 px-3 py-1 rounded border border-purple-700 bg-purple-950/50 hover:bg-purple-900 text-purple-100 text-[9px] font-fantasy uppercase tracking-wider">Añadir retrato</button>}
                                    </div>
                                    <div className="character-identity flex-1 min-w-0 w-full">
                                        <input type="text" placeholder="Ej: Kael Velosombrío" value={charInfo.name} onChange={e => setCharInfo({...charInfo, name: e.target.value})} className="font-fantasy text-3xl md:text-4xl font-bold text-transparent placeholder:text-gray-500 bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 tracking-wider bg-transparent border-b border-transparent hover:border-gray-600 focus:border-purple-500 outline-none w-full max-w-[400px] transition-colors" />
                                        <div className="character-meta flex items-center flex-wrap text-purple-400 font-medium text-sm md:text-base mt-2 font-fantasy tracking-widest gap-2">
                                            <input type="text" placeholder="Ej: Hum." title="Ejemplo: Humano" value={charInfo.race} onChange={e => setCharInfo({...charInfo, race: e.target.value})} className="bg-transparent w-28 border-b border-transparent hover:border-purple-500 outline-none uppercase" />
                                            <span className="text-gray-500">|</span>
                                            <input type="text" placeholder="Ej: Pícaro" value={charInfo.cls} onChange={e => setCharInfo({...charInfo, cls: e.target.value})} className="bg-transparent w-44 border-b border-transparent hover:border-purple-500 outline-none uppercase" />
                                            <span className="text-gray-500">|</span>
                                            <span className="uppercase flex items-center">
                                                Nvl <input type="number" value={level} onChange={(e) => setLevel(handleNumInput(e.target.value))} className="w-10 mx-1 bg-transparent border-b border-purple-500 text-center outline-none text-white focus:bg-gray-800 rounded font-sans" />
                                            </span>
                                            <span className="bg-purple-900/40 border border-purple-500 text-fuchsia-300 px-2 py-0.5 rounded-full text-xs font-bold font-sans shadow-inner whitespace-nowrap">
                                                Bono Comp. +{PROF_BONUS}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setCharacterManagerOpen(true)} className="z-10 shrink-0 min-h-10 px-3 py-2 rounded border border-purple-600 bg-purple-950/50 text-purple-200 hover:bg-purple-900 hover:text-white transition-colors text-xs font-fantasy uppercase tracking-wider">
                                    Cambiar personaje
                                </button>
                            </div>
                        </div>

                        <div data-tab="character" className="tab-section flex flex-wrap justify-end gap-2">
                            <button type="button" onClick={() => { setRestModalOpen(true); setRestType(null); }} className="min-h-10 px-3 py-2 rounded border border-cyan-700 bg-cyan-950/30 text-cyan-100 text-xs font-fantasy uppercase">Descansar</button>
                            <button type="button" onClick={() => setActivityHistoryOpen(true)} className="min-h-10 px-3 py-2 rounded border border-gray-600 bg-gray-900/60 text-gray-200 hover:border-purple-500 hover:text-white text-xs font-fantasy uppercase">Historial</button>
                            <button type="button" onClick={() => setAppSettingsOpen(true)} className="min-h-10 px-3 py-2 rounded border border-gray-600 bg-gray-900/60 text-gray-200 hover:border-purple-500 hover:text-white text-xs font-fantasy uppercase">⚙ {t('settings')}</button>
                        </div>

                        {/* Velocidad y Tamaño */}
                        <div data-tab="character" className="tab-section flex gap-4 border-t border-b border-gray-800 py-2">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="font-fantasy uppercase tracking-wider text-xs">Velocidad:</span>
                                <input type="number" placeholder="30" title="Ejemplo: 30 pies" value={speed} onChange={e => setSpeed(handleNumInput(e.target.value))} className="w-10 bg-transparent text-center font-bold text-white border-b border-gray-700 outline-none focus:border-purple-500" /> ft
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="font-fantasy uppercase tracking-wider text-xs">Tamaño:</span>
                                <input type="text" placeholder="Ej: Med." title="Ejemplo: Mediano" value={size} onChange={e => setSize(e.target.value)} className="w-20 bg-transparent text-center font-bold text-white border-b border-gray-700 outline-none focus:border-purple-500" />
                            </div>
                        </div>

                        {}
                        {/* TIRADAS DE MUERTE */}
                        <div data-tab="combat" className="tab-section">
                        {((Number(hp.current)||0) <= 0) && (
                            <div className="bg-gradient-to-r from-red-950 to-gray-900 border border-red-800 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-attack relative overflow-hidden">
                                <div className="absolute right-0 top-0 opacity-10 text-9xl pointer-events-none transform translate-x-4 -translate-y-8">☠️</div>
                                <div className="text-red-400 font-fantasy font-bold uppercase tracking-widest flex items-center mb-3 md:mb-0 z-10 text-lg">
                                    <span className="text-2xl mr-2">☠️</span> Lucha por tu alma
                                </div>
                                <div className="flex gap-8 z-10">
                                    <div className="flex flex-col items-center">
                                        <span className="text-green-400 text-[10px] font-bold tracking-widest uppercase mb-2">Éxitos</span>
                                        <div className="flex gap-3">
                                            {[1, 2, 3].map(num => (
                                                <button key={`succ-${num}`} onClick={() => setDeathSaves(p => ({...p, successes: p.successes === num ? num - 1 : num}))} className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${deathSaves.successes >= num ? 'bg-green-500 border-green-300 shadow-[0_0_15px_rgba(74,222,128,0.8)]' : 'bg-gray-900 border-gray-700'}`}></button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-red-500 text-[10px] font-bold tracking-widest uppercase mb-2">Fallos</span>
                                        <div className="flex gap-3">
                                            {[1, 2, 3].map(num => (
                                                <button key={`fail-${num}`} onClick={() => setDeathSaves(p => ({...p, failures: p.failures === num ? num - 1 : num}))} className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${deathSaves.failures >= num ? 'bg-red-600 border-red-300 shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'bg-gray-900 border-gray-700'}`}></button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setDeathSaves({successes: 0, failures: 0})} className="z-10 mt-4 md:mt-0 px-4 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-700 font-fantasy uppercase tracking-wider transition-colors">Estabilizar</button>
                            </div>
                        )}

                        </div>

                        <div className="space-y-6">
                            
                            {}
                            {/* COLUMNA IZQ: ATRIBUTOS Y HABILIDADES */}
                            <div data-tab="character" className="tab-section space-y-6">
                                
                                {/* ATRIBUTOS BASE */}
                                <div className="rpg-panel p-4">
                                    <h2 className="rpg-panel-header text-lg font-fantasy font-bold text-purple-300 mb-4 pb-2 px-2 tracking-widest uppercase">Atributos</h2>
                                    <div className="space-y-2">
                                        {Object.entries(stats).map(([key, val]) => {
                                            const total = getEffectiveStat(key);
                                            const mod = getModNum(total);
                                            return (
                                                <div key={key} className="grid grid-cols-[2.25rem_repeat(4,minmax(0,1fr))] items-center gap-1.5 bg-gray-900/60 p-2.5 rounded border border-gray-800">
                                                    <span className="uppercase font-bold text-gray-400 text-[13px] font-fantasy tracking-wider">{key}</span>
                                                    <label className="min-w-0 text-center text-[8px] uppercase tracking-wider text-gray-500">Base<input aria-label={`Atributo base ${key}`} type="number" placeholder="10" value={val} onChange={(e) => setStats({...stats, [key]: handleNumInput(e.target.value)})} className="mt-1 w-full text-center text-base bg-gray-800 text-white rounded p-1.5 outline-none border border-transparent focus:border-purple-500 font-bold" /></label>
                                                    <label className="min-w-0 text-center text-[8px] uppercase tracking-wider text-gray-500">Temp<input aria-label={`Modificador temporal ${key}`} type="number" placeholder="+0" value={tempStats[key] ?? '0'} onChange={(e) => setTempStats({...tempStats, [key]: handleNumInput(e.target.value)})} className="mt-1 w-full text-center text-base bg-gray-800 text-cyan-200 rounded p-1.5 outline-none border border-transparent focus:border-cyan-400 font-bold" /></label>
                                                    <div className="min-w-0 text-center text-[8px] uppercase tracking-wider text-gray-500">Total<strong className="mt-1 block rounded bg-gradient-to-br from-purple-900 to-gray-900 border border-purple-800/50 py-1.5 text-lg leading-none text-white shadow-inner">{total}</strong></div>
                                                    <div className="min-w-0 text-center text-[8px] uppercase tracking-wider text-gray-500">Mod.<strong className="mt-1 block rounded border border-cyan-900/70 bg-cyan-950/30 py-1.5 text-lg leading-none text-cyan-200 shadow-inner">{formatMod(mod)}</strong></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* TIRADAS DE SALVACIÓN */}
                                <div className="rpg-panel p-4">
                                    <h2 className="rpg-panel-header text-lg font-fantasy font-bold text-purple-300 mb-3 pb-2 px-2 tracking-widest uppercase">Salvaciones</h2>
                                    <div className="space-y-1">
                                        {Object.entries(stats).map(([key, val]) => {
                                            const isProf = savingThrows.includes(key);
                                            const totalMod = getModNum(getEffectiveStat(key)) + (isProf ? PROF_BONUS : 0);
                                            const statNames = { fue: 'Fuerza', des: 'Destreza', con: 'Constitución', int: 'Inteligencia', sab: 'Sabiduría', car: 'Carisma' };
                                            return (
                                                <div key={`save-${key}`} onClick={() => toggleSavingThrow(key)} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 px-2 rounded transition-colors cursor-pointer group">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-3 h-3 rounded-sm rotate-45 border transition-all duration-300 ${isProf ? 'bg-purple-500 border-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-transparent border-gray-600'}`}></div>
                                                        <span className={`text-sm font-medium transition-colors ${isProf ? 'text-gray-100' : 'text-gray-500 group-hover:text-gray-300'}`}>{statNames[key]}</span>
                                                    </div>
                                                    <span className={`font-mono font-bold transition-colors ${isProf ? 'text-purple-400' : 'text-gray-600'}`}>{formatMod(totalMod)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* HABILIDADES */}
                                <div className="rpg-panel p-4">
                                    <h2 className="rpg-panel-header text-lg font-fantasy font-bold text-purple-300 mb-3 pb-2 px-2 tracking-widest uppercase">Habilidades</h2>
                                    <div className="space-y-1">
                                        {SKILLS.map(skill => {
                                            const isExp = proficiencies.expertise.includes(skill.key);
                                            const isProf = proficiencies.proficient.includes(skill.key);
                                            const totalMod = getModNum(getEffectiveStat(skill.stat)) + (isExp ? PROF_BONUS * 2 : isProf ? PROF_BONUS : 0);
                                            
                                            return (
                                                <div key={skill.key} 
                                                    onClick={() => setSkillModal({ isOpen: true, skillKey: skill.key, skillName: skill.name })}
                                                    className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 px-2 rounded transition-colors cursor-pointer group">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-3 h-3 rounded-full border transition-all duration-300 ${isExp ? 'bg-fuchsia-500 border-fuchsia-300 shadow-[0_0_8px_rgba(217,70,239,0.8)]' : isProf ? 'bg-purple-600 border-purple-400 shadow-[0_0_5px_rgba(147,51,234,0.6)]' : 'bg-transparent border-gray-600'}`}></div>
                                                        <span className={`text-[13px] font-medium transition-colors ${isExp || isProf ? 'text-gray-100' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                                            {skill.name} 
                                                            <span className="text-[9px] text-gray-600 ml-1 uppercase">({skill.stat})</span>
                                                            {skill.key === 'sigilo' && isStealthDisadvantaged && <button type="button" onClick={(event) => { event.stopPropagation(); showAlert(`La armadura equipada ${stealthDisadvantageArmor.name} impone desventaja en Sigilo.`); }} className="ml-2 inline-flex max-w-full items-center rounded border border-red-800 bg-red-950/50 px-1.5 py-0.5 text-[10px] font-bold text-red-300 hover:border-red-400" aria-label={`Explicación de desventaja en Sigilo por ${stealthDisadvantageArmor.name}`}>⚠ Desventaja ({stealthDisadvantageArmor.name})</button>}
                                                        </span>
                                                    </div>
                                                    <span className={`font-mono font-bold text-sm transition-colors ${isExp ? 'text-fuchsia-400' : isProf ? 'text-purple-400' : 'text-gray-600'}`}>{formatMod(totalMod)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 flex gap-4 text-[10px] text-gray-500 justify-center font-fantasy tracking-wider uppercase">
                                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-purple-600 mr-1 border border-purple-400"></div> Competencia</span>
                                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-fuchsia-500 mr-1 shadow-[0_0_5px_rgba(217,70,239,0.8)] border border-fuchsia-300"></div> Pericia</span>
                                    </div>
                                </div>
                            </div>

                            {}
                            <div className="space-y-6">
                                
                                {/* RECURSOS DE CLASE */}
                                <div data-tab="combat" className="tab-section rpg-panel p-4">
                                    <div className="flex justify-between items-center mb-4 rpg-panel-header pb-2 px-2">
                                        <h2 className="text-lg font-fantasy font-bold text-purple-300 tracking-widest uppercase">Recursos</h2>
                                        <button onClick={() => setAddModal({isOpen: true, type: 'resource', data: {}})} className="text-[10px] font-fantasy uppercase tracking-wider bg-gray-800 border border-gray-600 hover:border-purple-500 hover:text-white px-2 py-1 rounded transition-colors shadow-md">+ Añadir</button>
                                    </div>
                                    <div ref={resourceGridRef} className="resource-reorder-grid grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {resources.map((res, idx) => (
                                            <div key={res.id} ref={element => { if (element) resourceCardRefs.current.set(res.id, element); else resourceCardRefs.current.delete(res.id); }} data-resource-id={res.id} onPointerDown={event => handleResourcePointerDown(event, res.id)} onPointerMove={handleResourcePointerMove} onPointerUp={handleResourcePointerEnd} onPointerCancel={handleResourcePointerEnd} onContextMenu={event => { if (resourceDrag.id === res.id) event.preventDefault(); }} style={resourceDrag.id === res.id ? { '--resource-drag-x': `${resourceDrag.x}px`, '--resource-drag-y': `${resourceDrag.y}px`, '--resource-drag-left': `${resourceDrag.left}px`, '--resource-drag-top': `${resourceDrag.top}px`, '--resource-drag-width': `${resourceDrag.width}px`, '--resource-drag-height': `${resourceDrag.height}px` } : undefined} className={`resource-card flex flex-col items-center bg-gray-900/80 p-3 rounded-lg border border-gray-700 relative group shadow-inner ${resourceDrag.id === res.id ? 'is-dragging' : ''} ${resourcePressRef.current?.id === res.id && !resourceDrag.id ? 'is-drag-pending' : ''} ${resourceDrag.id && resourceDrag.targetId === res.id && resourceDrag.id !== res.id ? 'is-drop-target' : ''}`}>
                                                <span className="text-gray-300 text-[10px] font-bold uppercase tracking-wider text-center h-6 overflow-hidden w-full px-2">{res.name}</span>
                                                <div className="min-h-5 mt-1">{renderUsageDots(res.current, res.max, 'text-purple-400')}</div>
                                                <div className="mt-2 grid h-8 grid-cols-[2rem_3.25rem_2rem] items-center justify-center gap-1">
                                                    <button onClick={() => setResources(previous => previous.map((resource, resourceIndex) => resourceIndex === idx ? { ...resource, current: Math.max(0, Number(resource.current) - 1) } : resource))} className="w-8 h-8 bg-gray-800 border border-gray-600 rounded flex items-center justify-center text-gray-300 hover:text-white hover:border-gray-400 transition-colors">−</button>
                                                    <div className="grid h-8 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center text-base font-bold leading-none text-white font-sans"><input aria-label={`${res.name} actuales`} type="number" min="0" value={res.current} onChange={event => setResources(previous => previous.map((resource, resourceIndex) => resourceIndex === idx ? { ...resource, current: handleBoundedNumInput(event.target.value, Number(resource.max) > 0 ? resource.max : null) } : resource))} className="h-8 w-full bg-transparent text-center text-lg leading-8 outline-none" />{Number(res.max) > 0 && <><span className="flex h-8 items-center justify-center px-0.5 text-gray-500">/</span><span className="flex h-8 items-center justify-center text-lg text-gray-400">{res.max}</span></>}</div>
                                                    <button onClick={() => setResources(previous => previous.map((resource, resourceIndex) => resourceIndex === idx ? { ...resource, current: Number(resource.max) > 0 ? Math.min(Number(resource.max), (Number(resource.current) || 0) + 1) : (Number(resource.current) || 0) + 1 } : resource))} className="w-8 h-8 bg-gray-800 border border-gray-600 rounded flex items-center justify-center text-gray-300 hover:text-white hover:border-gray-400 transition-colors">+</button>
                                                </div>
                                                {res.type && <span className="text-fuchsia-500 text-[10px] mt-1 font-bold font-sans">{res.type}</span>}
                                                <button onClick={() => confirmDelete(`¿Borrar el recurso "${res.name}"?`, () => setResources(resources.filter(r => r.id !== res.id)))} className="absolute -top-2 -right-2 bg-red-900 border border-red-500 text-red-200 hover:bg-red-600 hover:text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg transition-all">×</button>
                                            </div>
                                        ))}
                                        {grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 && <div className="flex flex-col items-center bg-yellow-950/20 p-3 rounded-lg border border-yellow-800/70 shadow-inner"><span className="text-yellow-100 text-[10px] font-bold uppercase tracking-wider text-center">Magia de pacto (N{grimoireConfig.pactSlots.level})</span><div className="min-h-5 mt-1">{renderUsageDots(grimoireConfig.pactSlots.current, grimoireConfig.pactSlots.max, 'text-yellow-300')}</div><div className="mt-2 grid h-8 grid-cols-[2rem_3.25rem_2rem] items-center justify-center gap-1"><button type="button" onClick={() => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: Math.max(0, Number(previous.pactSlots.current) - 1) } }))} className="w-8 h-8 bg-gray-900 border border-yellow-700 rounded text-yellow-100">−</button><span className="grid h-8 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center text-base font-bold leading-none text-yellow-100"><input aria-label="Ranuras de magia de pacto actuales" type="number" min="0" value={grimoireConfig.pactSlots.current} onChange={event => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: handleBoundedNumInput(event.target.value, previous.pactSlots.max) } }))} className="h-8 w-full bg-transparent text-center text-lg leading-8 outline-none"/><span className="flex h-8 items-center justify-center px-0.5 text-yellow-500">/</span><span className="flex h-8 items-center justify-center text-lg text-yellow-200">{grimoireConfig.pactSlots.max}</span></span><button type="button" onClick={() => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: Math.min(Number(previous.pactSlots.max), Number(previous.pactSlots.current) + 1) } }))} className="w-8 h-8 bg-gray-900 border border-yellow-700 rounded text-yellow-100">+</button></div></div>}
                                        {resources.length === 0 && !(grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0) && <p className="col-span-full text-sm text-gray-500">No hay recursos añadidos todavía. Pulsa + Añadir para crear el primero.</p>}
                                    </div>
                                </div>

                                {/* COMBATE Y ARMAS */}
                                <div data-tab="combat" className="tab-section rpg-panel p-4">
                                    <div className="flex justify-between items-center mb-4 rpg-panel-header pb-2 px-2">
                                        <h2 className="text-lg font-fantasy font-bold text-purple-300 tracking-widest uppercase">Arsenal</h2>
                                        <button onClick={() => setAddModal({isOpen: true, type: 'weapon', data: {}})} className="text-[10px] font-fantasy uppercase tracking-wider bg-gray-800 border border-gray-600 hover:border-purple-500 hover:text-white px-2 py-1 rounded transition-colors shadow-md">+ Nueva Arma</button>
                                    </div>
                                    
                                    <div className="flex space-x-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
                                        {weapons.map(w => (
                                            <div key={w.id} className="relative group flex-shrink-0">
                                                <button onClick={() => setSelectedWeaponId(w.id)} className={`px-4 py-1.5 rounded-sm whitespace-nowrap text-sm font-bold font-fantasy tracking-wider transition-all border-b-2 ${selectedWeaponId === w.id ? 'bg-gradient-to-t from-purple-900/50 to-transparent border-purple-500 text-purple-200' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'}`}>
                                                    {w.name}
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); confirmDelete(`¿Borrar "${w.name}"?`, () => {
                                                    const newW = weapons.filter(x => x.id !== w.id); setWeapons(newW); if(selectedWeaponId===w.id) setSelectedWeaponId(newW[0]?.id||null);
                                                })}} className="absolute -top-1 -right-1 bg-red-900 border border-red-500 text-red-200 w-4 h-4 rounded-full text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 hover:bg-red-600 hover:text-white shadow-md">×</button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="min-h-[100px] bg-gray-900/40 rounded-lg p-3 border border-gray-800">
                                        {weapons.find(w => w.id === selectedWeaponId) ? (
                                            <div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {weapons.find(w => w.id === selectedWeaponId).attacks.map((act, i) => (
                                                        <div key={`${selectedWeaponId}-${i}`} className="animate-attack bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 border-l-4 border-l-purple-600 p-3 rounded relative group shadow-md">
                                                            <h3 className="font-bold text-white text-sm pr-4 font-fantasy tracking-wider">{act.name}</h3>
                                                            <div className="flex justify-between items-center mt-2 bg-gray-950/50 p-1.5 rounded border border-gray-800">
                                                                <span className="text-green-400 font-mono text-xs font-bold">🎯 {act.atk}</span>
                                                                <span className="text-red-400 font-mono text-xs font-bold">🩸 {act.dmg}</span>
                                                            </div>
                                                            <p className="text-[11px] text-gray-400 mt-2 leading-tight whitespace-pre-wrap">{act.notes}</p>
                                                            <button onClick={() => confirmDelete(`¿Borrar ataque "${act.name}"?`, () => {
                                                                setWeapons(weapons.map(w => w.id === selectedWeaponId ? {...w, attacks: w.attacks.filter((_,idx)=>idx!==i)} : w));
                                                            })} className="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 font-bold">×</button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={() => setAddModal({isOpen: true, type: 'attack', data: {}})} className="mt-3 w-full border border-dashed border-gray-700 text-gray-500 hover:text-purple-300 hover:border-purple-500 hover:bg-purple-900/10 py-2 rounded text-xs transition-colors font-bold uppercase tracking-widest font-fantasy">
                                                    + Añadir Acción
                                                </button>
                                            </div>
                                        ) : <span className="text-gray-600 text-sm italic">No hay armas añadidas todavía. Pulsa + Nueva Arma para empezar.</span>}
                                    </div>
                                </div>

                                {/* ARMADURAS, COMPETENCIAS Y HERRAMIENTAS */}
                                <div data-tab="inventory" className="tab-section rpg-panel p-4">
                                    <div className="flex justify-between items-center mb-4 rpg-panel-header pb-2 px-2">
                                        <h2 className="text-lg font-fantasy font-bold text-purple-300 tracking-widest uppercase">Equipo en Uso</h2>
                                        <div className="flex gap-2">
                                            <button onClick={() => setAddModal({isOpen: true, type: 'armor', data: {type: 'light'}})} className="text-[10px] font-fantasy uppercase tracking-wider bg-gray-800 border border-gray-600 hover:border-purple-500 hover:text-white px-2 py-1 rounded transition-colors shadow-md">+ Armadura</button>
                                            <button onClick={() => setAddModal({isOpen: true, type: 'tool', data: {}})} className="text-[10px] font-fantasy uppercase tracking-wider bg-gray-800 border border-gray-600 hover:border-purple-500 hover:text-white px-2 py-1 rounded transition-colors shadow-md">+ Utilidad</button>
                                        </div>
                                    </div>
                                    {/* Lista de Armaduras y Escudos */}
                                    <div className="space-y-2 mb-6">
                                        {armors.map(arm => (
                                            <div key={arm.id} className={`flex flex-wrap justify-between items-center gap-2 bg-gray-900/40 p-3 rounded group border transition-colors ${arm.equipped ? 'border-purple-500/50 bg-purple-900/10 shadow-[inset_0_0_10px_rgba(168,85,247,0.1)]' : 'border-gray-800 hover:border-gray-600'}`}>
                                                <div className="flex min-w-0 items-center gap-3 flex-1">
                                                    <div className="relative flex items-center justify-center cursor-pointer" onClick={() => toggleArmorEquip(arm.id)}>
                                                        <div className={`w-5 h-5 rounded border ${arm.equipped ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-600'} flex items-center justify-center transition-colors shadow-sm`}>
                                                            {arm.equipped && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                    </div>
                                                    <div className="flex min-w-0 flex-col">
                                                        <span className={`text-sm font-bold ${arm.equipped ? 'text-purple-200' : 'text-gray-300'}`}>{arm.name}</span>
                                                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-fantasy">{arm.type === 'light' ? 'Ligera' : arm.type === 'medium' ? 'Media' : arm.type === 'heavy' ? 'Pesada' : 'Escudo'}</span>
                                                            {arm.stealthDis && <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-900 font-bold tracking-wider">⚠ Desv. Sigilo</span>}
                                                        </div>
                                                        <span className="mt-1 text-[11px] text-gray-400">CA: {getArmorFormula(arm)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-mono font-bold text-gray-300 bg-gray-800 border border-gray-700 px-2 py-1 rounded shadow-inner">{arm.type === 'shield' ? `+${arm.ac || 2}` : `CA ${arm.ac}`}</span>
                                                    <button onClick={() => confirmDelete(`¿Borrar "${arm.name}"?`, () => setArmors(armors.filter(a => a.id !== arm.id)))} className="text-gray-600 hover:text-red-500 font-bold text-lg leading-none opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                                </div>
                                            </div>
                                        ))}
                                        {armors.length === 0 && <span className="text-gray-600 text-xs italic">Sin armaduras registradas.</span>}
                                    </div>

                                    {/* Lista de Herramientas */}
                                    <h3 className="text-sm font-fantasy font-bold text-gray-400 mb-2 border-b border-gray-800 pb-1 uppercase tracking-widest">Utilidad y Herramientas</h3>
                                    <div className="space-y-2">
                                        {tools.map(tool => (
                                            <div key={tool.id} className="bg-gray-900/40 p-3 rounded group border border-gray-800 hover:border-gray-600 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-bold text-gray-200">{tool.name}</span>
                                                    <button onClick={() => confirmDelete(`¿Borrar "${tool.name}"?`, () => setTools(tools.filter(t => t.id !== tool.id)))} className="text-gray-600 hover:text-red-500 font-bold text-lg leading-none opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                                </div>
                                                <p className="text-[11px] text-gray-400 mt-1 whitespace-pre-wrap">{tool.desc}</p>
                                            </div>
                                        ))}
                                        {tools.length === 0 && <span className="text-gray-600 text-xs italic">Sin herramientas registradas.</span>}
                                    </div>
                                </div>

                                {}
                                {/* INVENTARIO DE CONSUMIBLES */}
                                <div data-tab="inventory" className="tab-section rpg-panel p-4">
                                    <div className="flex justify-between items-center mb-4 rpg-panel-header pb-2 px-2">
                                        <h2 className="text-lg font-fantasy font-bold text-purple-300 tracking-widest uppercase">Mochila</h2>
                                        <button onClick={() => setAddModal({isOpen: true, type: 'item', data: {}})} className="text-[10px] font-fantasy uppercase tracking-wider bg-gray-800 border border-gray-600 hover:border-purple-500 hover:text-white px-2 py-1 rounded transition-colors shadow-md">+ Objeto</button>
                                    </div>
                                    
                                    <div className="flex justify-center space-x-2 mb-4 bg-gray-900/60 p-3 rounded border border-gray-800 shadow-inner">
                                        {['po', 'pp', 'pc'].map(type => (
                                            <div key={type} className="flex flex-col items-center bg-gray-800 border border-gray-700 p-1.5 rounded flex-1 shadow-inner">
                                                <span className={`font-fantasy font-bold text-[10px] tracking-widest ${type==='po'?'text-yellow-400':type==='pp'?'text-gray-300':'text-orange-400'}`}>{type.toUpperCase()}</span>
                                                <div className="flex items-center w-full mt-1">
                                                    <button onClick={() => addCurrency(type, -1)} className="w-5 h-5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors border border-gray-600">-</button>
                                                    <input type="number" value={currency[type]} onChange={e => setCurrency(prev => ({ ...prev, [type]: handleNumInput(e.target.value) }))} className="w-full bg-transparent text-center font-mono font-bold text-sm outline-none text-white p-0 m-0 focus:text-purple-300" />
                                                    <button onClick={() => addCurrency(type, 1)} className="w-5 h-5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors border border-gray-600">+</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                        {inventory.map((item, idx) => (
                                            <div key={item.id} className="inventory-item-row flex justify-between items-start bg-gray-900/40 p-2.5 rounded group border border-gray-800 hover:border-gray-600 transition-colors">
                                                <div className="flex-1 pr-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-bold text-gray-200">{item.name}</span>
                                                        <span className="text-[10px] font-mono bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-purple-300 font-bold shadow-inner">x{item.qty}</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-400 mt-1 leading-tight">{item.desc}</p>
                                                </div>
                                                
                                                <div className="inventory-item-controls flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-950 p-1 rounded-lg border border-gray-700 shadow-md">
                                                    <button onClick={() => adjustInvQty(item.id, -1)} className="w-7 h-7 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 flex items-center justify-center text-sm hover:text-white transition-colors">-</button>
                                                    <button onClick={() => adjustInvQty(item.id, 1)} className="w-7 h-7 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 flex items-center justify-center text-sm hover:text-white ml-1 transition-colors">+</button>
                                                    <div className="w-px h-5 bg-gray-700 mx-3"></div>
                                                    <button onClick={() => confirmDelete(`¿Borrar "${item.name}"?`, () => setInventory(inventory.filter(x => x.id !== item.id)))} className="text-red-500 hover:text-red-400 text-xl font-bold pr-1 leading-none transition-colors">×</button>
                                                </div>
                                            </div>
                                        ))}
                                        {inventory.length === 0 && <span className="text-gray-600 text-xs italic">Tu inventario está vacío. Pulsa + Objeto para añadir el primero.</span>}
                                    </div>
                                </div>

                                {/* RASGOS Y DOTES */}
                                <div data-tab="character" className="tab-section grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="rpg-panel p-4">
                                        <div className="flex justify-between items-center mb-4 rpg-panel-header pb-2 px-2">
                                            <h2 className="text-lg font-fantasy font-bold text-purple-300 tracking-widest uppercase">Rasgos</h2>
                                            <button onClick={() => setAddModal({isOpen: true, type: 'trait', data: {}})} className="text-[10px] font-fantasy uppercase tracking-wider bg-gray-800 border border-gray-600 hover:border-purple-500 hover:text-white px-2 py-1 rounded transition-colors shadow-md">+ Rasgo</button>
                                        </div>
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                            {traits.map((t, idx) => (
                                                <div key={idx} className="bg-gray-900/40 border-l-2 border-purple-500 p-3 rounded border border-gray-800 border-l-purple-500 relative group shadow-sm">
                                                    <h3 className="font-bold text-purple-200 text-sm pr-4 font-fantasy tracking-wide">{t.title}</h3>
                                                    <p className="text-[11px] text-gray-400 mt-1 leading-tight whitespace-pre-wrap">{t.desc}</p>
                                                    <button onClick={() => confirmDelete(`¿Borrar rasgo "${t.title}"?`, () => setTraits(traits.filter((_, i) => i !== idx)))} className="absolute top-1 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 font-bold text-lg">×</button>
                                                </div>
                                            ))}
                                            {traits.length === 0 && <p className="text-sm text-gray-500">Aún no hay rasgos. Pulsa + Rasgo para añadir uno.</p>}
                                        </div>
                                    </div>

                                    <div className="rpg-panel p-4">
                                        <div className="flex justify-between items-center mb-4 rpg-panel-header pb-2 px-2">
                                            <h2 className="text-lg font-fantasy font-bold text-yellow-400 tracking-widest uppercase">Dotes</h2>
                                            <button onClick={() => setAddModal({isOpen: true, type: 'feat', data: {}})} className="text-[10px] font-fantasy uppercase tracking-wider bg-gray-800 border border-gray-600 hover:border-yellow-500 hover:text-white px-2 py-1 rounded transition-colors shadow-md">+ Dote</button>
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
                                <div data-tab="grimoire" className="tab-section rpg-panel p-4 border border-fuchsia-900/50">
                                    <div className="grimoire-toolbar flex flex-wrap justify-between items-center mb-4 rpg-panel-header !border-l-fuchsia-500 pb-3 px-4 gap-4">
                                        <h2 className="text-lg md:text-xl font-fantasy font-bold text-fuchsia-400 tracking-widest uppercase whitespace-nowrap">Libro de Conjuros</h2>
                                        
                                        <div className="grimoire-summary flex gap-4 items-center flex-wrap flex-1 justify-end">
                                            {grimoireConfig.useCantripLimit && <span className="text-xs text-fuchsia-200">Trucos {cantripCount}/{grimoireConfig.cantripLimit || 0}</span>}
                                            {grimoireConfig.useKnownLimit && <span className="text-xs text-fuchsia-200">Conocidos {knownSpellCount}/{grimoireConfig.knownLimit || 0}</span>}
                                            {grimoireConfig.usePrepared && <span className="text-xs text-fuchsia-200">Preparados {preparedSpellCount}/{grimoireConfig.preparedLimit || 0}</span>}
                                            <button onClick={() => setAddModal({isOpen: true, type: 'spell', data: {}})} className="text-xs font-fantasy uppercase tracking-wider bg-fuchsia-900/50 border border-fuchsia-700 hover:bg-fuchsia-600 text-fuchsia-100 hover:text-white px-4 py-2 rounded transition-colors shadow-md">+ Conjuro</button>
                                        </div>
                                    </div>
                                    
                                    <button type="button" onClick={() => setGrimoireSettingsOpen(value => !value)} className="mb-3 text-xs text-gray-400 hover:text-fuchsia-200">⚙ Configuración del Grimorio</button>
                                    {grimoireSettingsOpen && <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
                                        {[['useKnownLimit','Usa límite de conjuros conocidos','knownLimit',`Conocidos ${knownSpellCount} / ${grimoireConfig.knownLimit || 0}`],['usePrepared','Usa conjuros preparados','preparedLimit',`Preparados ${preparedSpellCount} / ${grimoireConfig.preparedLimit || 0}`],['useCantripLimit','Usa límite de trucos conocidos','cantripLimit',`Trucos ${cantripCount} / ${grimoireConfig.cantripLimit || 0}`]].map(([key,label,limit,labelCount]) => <label key={key} className="flex flex-wrap items-center gap-2 p-3 rounded border border-gray-700 bg-gray-900/50"><input type="checkbox" checked={!!grimoireConfig[key]} onChange={e => setGrimoireConfig(prev => ({...prev,[key]:e.target.checked}))} className="w-4 h-4 accent-fuchsia-600"/><span className="font-bold text-gray-200">{label}</span>{grimoireConfig[key] && <><input type="number" min="0" placeholder="0" value={grimoireConfig[limit]} onChange={e => setGrimoireConfig(prev => ({...prev,[limit]:handleNumInput(e.target.value)}))} className="w-14 bg-gray-950 border border-gray-700 rounded px-1 py-1 text-center text-white"/><span className="text-fuchsia-300">{labelCount}</span></>}</label>)}
                                        <label className="flex flex-wrap items-center gap-2 p-3 rounded border border-gray-700 bg-gray-900/50"><input type="checkbox" checked={!!grimoireConfig.usePactMagic} onChange={e => setGrimoireConfig(prev => ({...prev,usePactMagic:e.target.checked}))} className="w-4 h-4 accent-fuchsia-600"/><span className="font-bold text-gray-200">Usa Magia de pacto</span>{grimoireConfig.usePactMagic && <><input type="number" min="0" value={grimoireConfig.pactSlots.current} onChange={e => setGrimoireConfig(prev => ({...prev,pactSlots:{...prev.pactSlots,current:handleNumInput(e.target.value)}}))} className="w-12 bg-gray-950 border border-gray-700 rounded px-1 py-1 text-center text-white"/><span>/</span><input type="number" min="0" value={grimoireConfig.pactSlots.max} onChange={e => setGrimoireConfig(prev => ({...prev,pactSlots:{...prev.pactSlots,max:handleNumInput(e.target.value)}}))} className="w-12 bg-gray-950 border border-gray-700 rounded px-1 py-1 text-center text-white"/><span>Nivel</span><input type="number" min="1" max="9" value={grimoireConfig.pactSlots.level} onChange={e => setGrimoireConfig(prev => ({...prev,pactSlots:{...prev.pactSlots,level:handleNumInput(e.target.value)}}))} className="w-10 bg-gray-950 border border-gray-700 rounded px-1 py-1 text-center text-white"/></>}</label>
                                    </div>}
                                    <div className="flex flex-wrap gap-2 mb-4"><button onClick={() => setGrimoireView('library')} className={`px-3 py-2 text-xs rounded ${grimoireView === 'library' ? 'bg-fuchsia-700 text-white' : 'bg-gray-800 text-gray-300'}`}>Mis conjuros</button><button onClick={() => setGrimoireView('available')} className={`px-3 py-2 text-xs rounded ${grimoireView === 'available' ? 'bg-fuchsia-700 text-white' : 'bg-gray-800 text-gray-300'}`}>Disponibles ahora</button><input value={spellSearch} onChange={e => setSpellSearch(e.target.value)} placeholder="Ej: Bola de fuego" className="min-w-[10rem] flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm"/><select value={spellFilter} onChange={e => setSpellFilter(e.target.value)} className="bg-gray-950 border border-gray-700 rounded px-2 text-sm"><option value="all">Todos</option><option value="cantrip">Trucos</option><option value="prepared">Preparados</option><option value="ritual">Rituales</option><option value="concentration">Concentración</option><option value="favorite">Favoritos</option>{[...new Set(spells.map(spell => spell.level))].sort((a,b)=>a-b).map(level => <option key={level} value={level}>{level === 0 ? 'Trucos' : `Nivel ${level}`}</option>)}</select></div>
                                    {/* Ranuras (Slots) */}
                                    <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-gray-800">{[1,2,3,4,5,6,7,8,9].filter(level => showEmptySlots || Number(spellSlots[level].max) > 0).map(level => <button key={level} onClick={() => setEditingSlotLevel(level)} className="px-3 py-2 rounded border border-gray-700 bg-gray-900 text-xs font-mono hover:border-fuchsia-500"><b className="text-fuchsia-300">N{level}</b> {spellSlots[level].current}/{spellSlots[level].max}</button>)}<button onClick={() => setShowEmptySlots(value => !value)} className="px-3 py-2 text-xs text-gray-400">{showEmptySlots ? 'Ocultar niveles vacíos' : 'Mostrar niveles vacíos'}</button></div>

                                    {/* Lista de Conjuros */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                                        {displayedSpells.map(sp => {
                                            const compStr = [sp.compV ? 'V' : null, sp.compS ? 'S' : null, sp.compM ? 'M' : null].filter(Boolean).join(', ');
                                            const mDesc = sp.compM && sp.compMDesc ? ` (${sp.compMDesc})` : '';
                                            return (
                                                <div key={sp.id} className={`flex flex-col p-3 rounded-lg border transition-all duration-300 ${sp.prepared ? 'bg-gradient-to-br from-fuchsia-900/30 to-purple-900/10 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-gray-900/40 border-gray-800'} relative group`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center space-x-3">
                                                            <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded ${sp.prepared ? 'bg-fuchsia-600 text-white shadow-[0_0_8px_#d946ef]' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>{sp.level === 0 ? 'Truco' : `Nv ${sp.level}`}</span>
                                                            <span className={`font-bold text-sm font-fantasy tracking-wider ${sp.prepared ? 'text-fuchsia-200' : 'text-gray-300'}`}>{sp.name} {sp.prepared && '✨'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col text-[10px] text-gray-400 font-medium mb-2 bg-gray-950/50 p-2 rounded border border-gray-800/50">
                                                        <div className="flex space-x-3">
                                                            {sp.range && sp.range !== '-' && <span><span className="text-gray-500">Alc:</span> {sp.range}</span>}
                                                            {(sp.shape && sp.shape !== '-' || sp.size && sp.size !== '-') && <span><span className="text-gray-500">Área:</span> {sp.shape} {sp.size}</span>}
                                                        </div>
                                                        {compStr && <span className="mt-1"><span className="text-gray-500">Comp:</span> <span className="text-purple-300">{compStr}</span>{mDesc}</span>}
                                                    </div>
                                                    <p className="text-[11px] text-gray-400 mt-1 leading-snug whitespace-pre-wrap">{sp.description || sp.notes}</p>
                                                    <div className="flex flex-wrap gap-2 mt-3"><button onClick={() => setCastSpell(sp)} className="px-3 py-1.5 rounded bg-fuchsia-800 hover:bg-fuchsia-700 text-xs text-white">Lanzar</button>{grimoireConfig.useKnownLimit && sp.level > 0 && <button onClick={() => toggleSpellKnown(sp)} className="px-3 py-1.5 rounded border border-gray-600 text-xs text-gray-200">{sp.known ? 'Dejar de conocer' : 'Conocer'}</button>}{grimoireConfig.usePrepared && sp.level > 0 && <button onClick={() => toggleSpellPreparation(sp)} className="px-3 py-1.5 rounded border border-fuchsia-700 text-xs text-fuchsia-200">{sp.prepared ? 'Dejar de preparar' : 'Preparar'}</button>}<button onClick={() => setSpells(spells.map(item => item.id === sp.id ? {...item,favorite:!item.favorite} : item))} className="px-2 py-1.5 text-xs text-yellow-300">{sp.favorite ? '★' : '☆'}</button></div>
                                                    <button onClick={(e) => { e.stopPropagation(); confirmDelete(`¿Borrar hechizo "${sp.name}"?`, () => setSpells(spells.filter(s => s.id !== sp.id))); }} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 text-lg transition-opacity">×</button>
                                                </div>
                                            )
                                        })}
                                        {spells.length === 0 && <div className="col-span-1 md:col-span-2 p-8 border-2 border-dashed border-gray-800 rounded-lg text-center"><span className="text-gray-500 text-sm italic font-fantasy tracking-widest uppercase">El grimorio está vacío.</span><p className="mt-2 text-xs text-gray-500 normal-case tracking-normal">Pulsa + Conjuro para añadir el primero.</p></div>}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {}
                        <div data-tab="inventory" className="tab-section rpg-panel p-4">
                            <div className="flex flex-wrap justify-between items-center gap-3 rpg-panel-header pb-3 mb-3">
                                <h2 className="text-lg font-fantasy font-bold text-purple-300 tracking-widest uppercase">Diario</h2>
                                <div className="flex items-center gap-2">
                                    {diaryOpen && <button onClick={() => setSessionNotes([{ id: 'note_' + Date.now(), date: new Date().toLocaleDateString(), text: '' }, ...sessionNotes])} className="min-h-10 px-3 py-2 rounded border border-purple-600 bg-purple-950/40 text-purple-100 text-xs font-fantasy uppercase">+ Nueva entrada</button>}
                                    <button type="button" onClick={() => setDiaryOpen(value => !value)} className="w-11 h-11 rounded border border-purple-600 bg-purple-950/50 hover:bg-purple-900 text-purple-100 text-2xl leading-none" aria-label={diaryOpen ? 'Contraer diario' : 'Desplegar diario'}>{diaryOpen ? '−' : '+'}</button>
                                </div>
                            </div>
                            {diaryOpen && <div className="space-y-3">
                                {sessionNotes.map(note => <div key={note.id} className="relative border border-gray-800 bg-gray-900/50 p-3 rounded"><input type="text" placeholder="Ej: Sesión 1" value={note.date} onChange={e => setSessionNotes(sessionNotes.map(item => item.id === note.id ? {...item,date:e.target.value} : item))} className="w-full pr-8 bg-transparent border-b border-gray-700 text-purple-200 font-bold outline-none"/><textarea placeholder="Ej: PNJs, botín y sucesos..." value={note.text} onChange={e => setSessionNotes(sessionNotes.map(item => item.id === note.id ? {...item,text:e.target.value} : item))} className="mt-3 w-full min-h-24 bg-gray-950 border border-gray-800 rounded p-3 text-sm text-gray-300"/><button onClick={() => confirmDelete(`¿Borrar las notas de la sesión "${note.date}"?`, () => setSessionNotes(sessionNotes.filter(item => item.id !== note.id)))} className="absolute top-3 right-3 text-red-400">×</button></div>)}
                                {sessionNotes.length === 0 && <p className="text-sm text-gray-500">El diario está vacío. Pulsa + Nueva entrada para empezar.</p>}
                            </div>}
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

                        {conditionModal.isOpen && <div className="fixed inset-0 z-[72] flex items-center justify-center bg-black/80 p-4"><div className="rpg-panel w-full max-w-sm border border-purple-700 p-5"><h3 className="font-fantasy text-lg text-purple-200">Añadir condición</h3><div className="mt-4 flex flex-wrap gap-2">{ONLINE_CONDITIONS.map(name => <button key={name} type="button" onClick={() => setConditionModal(previous => ({ ...previous, name }))} className={`min-h-9 px-2 rounded border text-xs ${conditionModal.name === name ? 'border-purple-400 bg-purple-950/50 text-purple-100' : 'border-gray-700 text-gray-300'}`}>{name}</button>)}</div><label className="mt-4 block text-sm text-gray-300">Personalizada<input value={conditionModal.name} onChange={event => setConditionModal(previous => ({ ...previous, name: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label><label className="mt-3 block text-sm text-gray-300">Fuente<input value={conditionModal.source} onChange={event => setConditionModal(previous => ({ ...previous, source: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>{conditionModal.target?.type !== 'enemy' && <label className="mt-3 block text-sm text-gray-300">Notas<input value={conditionModal.notes} onChange={event => setConditionModal(previous => ({ ...previous, notes: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>}<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setConditionModal({ isOpen: false, target: null, name: '', source: '', notes: '' })} className="min-h-10 px-3 rounded border border-gray-600 text-gray-300">Cancelar</button><button type="button" onClick={() => saveOnlineCondition().catch(() => setOnlineTableError('No se pudo guardar la condición.'))} className="min-h-10 px-3 rounded border border-purple-700 text-purple-100">Guardar</button></div></div></div>}

                        {effectModal.isOpen && <div className="fixed inset-0 z-[73] flex items-center justify-center bg-black/80 p-4"><div className="rpg-panel max-h-[90vh] w-full max-w-lg overflow-y-auto border border-cyan-700 p-5"><h3 className="font-fantasy text-lg text-cyan-200">Efecto temporal</h3><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-sm text-gray-300">Nombre<input value={effectModal.data.name || ''} onChange={event => setEffectModal(previous => ({ ...previous, data: { ...previous.data, name: event.target.value } }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label><label className="text-sm text-gray-300">Objetivo<select value={effectModal.data.targetType === 'global' ? 'global' : effectModal.data.targetId || ''} onChange={event => { const value = event.target.value; const target = getCombatant(value); setEffectModal(previous => ({ ...previous, data: { ...previous.data, targetId: value === 'global' ? 'global' : value, targetType: value === 'global' ? 'global' : target?.type === 'enemy' ? 'enemy' : 'player' } })); }} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="">Selecciona</option><option value="global">Global</option>{encounterCombatants.filter(target => canManageEnemies || target.ownerUid === firebaseUser?.uid).map(target => <option key={target.id} value={target.id}>{target.name}</option>)}</select></label><label className="text-sm text-gray-300">Duración<select value={effectModal.data.durationType || 'manual'} onChange={event => setEffectModal(previous => ({ ...previous, data: { ...previous.data, durationType: event.target.value } }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="turns">Turnos</option><option value="rounds">Rondas</option><option value="minutes">Minutos</option><option value="manual">Manual</option></select></label>{effectModal.data.durationType !== 'manual' && <label className="text-sm text-gray-300">Restante<input type="number" min="0" value={effectModal.data.remaining ?? 0} onChange={event => setEffectModal(previous => ({ ...previous, data: { ...previous.data, remaining: event.target.value, maximum: event.target.value } }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>}{effectModal.data.durationType !== 'manual' && <label className="text-sm text-gray-300">Reducir<select value={effectModal.data.decrementMoment || 'manual'} onChange={event => setEffectModal(previous => ({ ...previous, data: { ...previous.data, decrementMoment: event.target.value } }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="manual">Manual</option><option value="start-of-target-turn">Inicio turno objetivo</option><option value="end-of-target-turn">Fin turno objetivo</option><option value="start-of-round">Inicio ronda</option><option value="end-of-round">Fin ronda</option></select></label>}</div><label className="mt-3 flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={!!effectModal.data.visibleToPlayers} onChange={event => setEffectModal(previous => ({ ...previous, data: { ...previous.data, visibleToPlayers: event.target.checked } }))} />Visible para jugadores</label><label className="mt-2 flex items-center gap-2 text-sm text-purple-200"><input type="checkbox" checked={!!effectModal.data.concentration} onChange={event => setEffectModal(previous => ({ ...previous, data: { ...previous.data, concentration: event.target.checked } }))} />Requiere concentración</label><label className="mt-3 block text-sm text-gray-300">Nota pública<input value={effectModal.data.notesPublic || ''} onChange={event => setEffectModal(previous => ({ ...previous, data: { ...previous.data, notesPublic: event.target.value } }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEffectModal({ isOpen: false, effectId: null, data: {} })} className="min-h-10 px-3 rounded border border-gray-600 text-gray-300">Cancelar</button><button type="button" onClick={() => saveEffect().catch(() => setOnlineTableError('No se pudo guardar el efecto.'))} className="min-h-10 px-3 rounded border border-cyan-700 text-cyan-100">Guardar</button></div></div></div>}

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

                        {enemyHpModal.isOpen && (() => { const enemy = publicCombatants.find(item => item.id === enemyHpModal.enemyId); const privateData = privateEnemies.find(item => item.id === enemyHpModal.enemyId); if (!enemy || !privateData) return null; const current = getHpValues(privateData); const amount = Math.max(0, Number(enemyHpModal.amount) || 0); let preview = { ...current }; if (enemyHpModal.mode === 'damage') { const absorbed = Math.min(current.tempHp, amount); preview = { ...current, tempHp: current.tempHp - absorbed, currentHp: Math.max(0, current.currentHp - (amount - absorbed)) }; } else if (enemyHpModal.mode === 'healing') preview = { ...current, currentHp: Math.min(current.maxHp, current.currentHp + amount) }; else if (enemyHpModal.mode === 'temp') preview = { ...current, tempHp: amount }; else if (enemyHpModal.mode === 'max') preview = { ...current, maxHp: amount, currentHp: Math.min(current.currentHp, amount) }; else preview = { ...current, currentHp: Math.min(current.maxHp, amount) }; return <div className="fixed inset-0 z-[73] flex items-center justify-center bg-black/80 p-4" onClick={() => setEnemyHpModal({ isOpen: false, enemyId: null, mode: 'damage', amount: '' })}><div className="rpg-panel w-full max-w-sm border border-orange-700 p-5" onClick={event => event.stopPropagation()}><div className="flex items-center justify-between gap-3"><h3 className="font-fantasy text-lg font-bold text-orange-200">Modificar vida</h3><button type="button" onClick={() => setEnemyHpModal({ isOpen: false, enemyId: null, mode: 'damage', amount: '' })} className="w-9 h-9 rounded border border-gray-600 text-gray-300">×</button></div><p className="mt-1 text-xs text-gray-400">{enemy.name}</p><div className="mt-4 grid grid-cols-2 gap-2">{[['damage','Daño'],['healing','Curación'],['temp','Vida temporal'],['exact','Valor exacto'],['max','Vida máxima']].map(([mode, label]) => <button key={mode} type="button" onClick={() => setEnemyHpModal(previous => ({ ...previous, mode }))} className={`min-h-10 rounded border px-2 text-xs ${enemyHpModal.mode === mode ? 'border-orange-500 bg-orange-950/50 text-orange-100' : 'border-gray-700 text-gray-300'}`}>{label}</button>)}</div><label className="mt-4 block text-sm text-gray-300">Cantidad<input autoFocus type="number" min="0" value={enemyHpModal.amount} onChange={event => setEnemyHpModal(previous => ({ ...previous, amount: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-3 text-center text-lg font-bold text-white" /></label><p className="mt-3 rounded border border-gray-700 bg-gray-950/50 p-3 text-sm text-gray-300">Vida: <b>{current.currentHp}</b> → <b>{preview.currentHp}</b> / {preview.maxHp}<br />Temporal: <b>{current.tempHp}</b> → <b>{preview.tempHp}</b></p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEnemyHpModal({ isOpen: false, enemyId: null, mode: 'damage', amount: '' })} className="min-h-10 px-3 rounded border border-gray-600 text-gray-300">Cancelar</button><button type="button" disabled={onlineTableBusy} onClick={applyEnemyHpModal} className="min-h-10 px-4 rounded border border-orange-600 bg-orange-800 text-white">Confirmar</button></div></div></div>; })()}

                        {finishEncounterPrompt && <div className="fixed inset-0 z-[74] flex items-center justify-center bg-black/80 p-4"><div className="rpg-panel w-full max-w-sm border border-red-700 p-5"><h3 className="font-fantasy text-lg font-bold text-red-200">Finalizar encuentro</h3><p className="mt-2 text-sm text-gray-300">Elige qué hacer con los enemigos de esta sala.</p><div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setFinishEncounterPrompt(false)} className="min-h-10 px-3 rounded border border-gray-600 text-gray-300">Cancelar</button><button type="button" onClick={() => finishEncounter(false)} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200">Conservar enemigos</button><button type="button" onClick={() => finishEncounter(true)} className="min-h-10 px-3 rounded border border-red-700 bg-red-950/40 text-xs text-red-100">Eliminar enemigos</button></div></div></div>}

                        {hpModal.isOpen && (() => {
                            const participant = roomParticipants.find(item => item.id === hpModal.participantId);
                            if (!participant) return null;
                            const current = getHpValues(participant);
                            const amount = Math.max(0, Number(hpModal.amount) || 0);
                            let preview = { ...current };
                            if (hpModal.mode === 'damage') { const absorbed = Math.min(current.tempHp, amount); preview = { ...current, tempHp: current.tempHp - absorbed, currentHp: Math.max(0, current.currentHp - (amount - absorbed)) }; }
                            else if (hpModal.mode === 'healing') preview = { ...current, currentHp: Math.min(current.maxHp, current.currentHp + amount) };
                            else if (hpModal.mode === 'temp') preview = { ...current, tempHp: amount };
                            else preview = { ...current, currentHp: Math.min(current.maxHp, amount) };
                            return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4" onClick={() => setHpModal({ isOpen: false, participantId: null, mode: 'damage', amount: '' })}><div className="rpg-panel w-full max-w-sm border border-red-700 p-5" onClick={event => event.stopPropagation()}><div className="flex items-center justify-between gap-3"><div><h3 className="font-fantasy text-lg font-bold text-red-200">Modificar vida</h3><p className="mt-1 text-xs text-gray-400">{participant.name || 'Personaje'}</p></div><button type="button" onClick={() => setHpModal({ isOpen: false, participantId: null, mode: 'damage', amount: '' })} className="w-9 h-9 rounded border border-gray-600 text-gray-300" aria-label="Cerrar">×</button></div><div className="mt-4 grid grid-cols-2 gap-2">{[['damage','Daño'],['healing','Curación'],['temp','Vida temporal'],['exact','Valor exacto']].map(([mode,label]) => <button key={mode} type="button" onClick={() => setHpModal(previous => ({ ...previous, mode }))} className={`min-h-10 rounded border px-2 text-xs ${hpModal.mode === mode ? 'border-red-500 bg-red-950/50 text-red-100' : 'border-gray-700 text-gray-300'}`}>{label}</button>)}</div><label className="mt-4 block text-sm text-gray-300">Cantidad<input autoFocus type="number" min="0" value={hpModal.amount} onChange={event => setHpModal(previous => ({ ...previous, amount: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-3 text-center text-lg font-bold text-white outline-none focus:border-red-400" /></label><div className="mt-4 rounded border border-gray-700 bg-gray-950/50 p-3 text-sm text-gray-300"><p>Vida: <b>{current.currentHp}</b> → <b>{preview.currentHp}</b> / {preview.maxHp}</p><p className="mt-1 text-cyan-200">Vida temporal: <b>{current.tempHp}</b> → <b>{preview.tempHp}</b></p></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setHpModal({ isOpen: false, participantId: null, mode: 'damage', amount: '' })} className="min-h-10 px-4 rounded border border-gray-600 text-gray-300">Cancelar</button><button type="button" disabled={onlineTableBusy} onClick={applyParticipantHpModal} className="min-h-10 px-4 rounded border border-red-600 bg-red-800 text-white disabled:opacity-50">Confirmar</button></div></div></div>;
                        })()}

                        {hpConflict && <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 p-4"><div className="rpg-panel w-full max-w-sm border border-yellow-700 p-5"><h3 className="font-fantasy text-lg font-bold text-yellow-200">Hay diferencias en los puntos de golpe</h3><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded border border-gray-700 bg-gray-950/60 p-3"><span className="block text-xs uppercase text-gray-500">Local</span><b>{hpConflict.local.currentHp} / {hpConflict.local.maxHp}</b>{hpConflict.local.tempHp > 0 && <span className="block text-xs text-cyan-200">Temporal {hpConflict.local.tempHp}</span>}</div><div className="rounded border border-cyan-800 bg-cyan-950/25 p-3"><span className="block text-xs uppercase text-gray-500">Mesa</span><b>{hpConflict.remote.currentHp} / {hpConflict.remote.maxHp}</b>{hpConflict.remote.tempHp > 0 && <span className="block text-xs text-cyan-200">Temporal {hpConflict.remote.tempHp}</span>}</div></div><div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={useRemoteHpConflict} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200">Usar datos de la mesa</button><button type="button" onClick={shareLocalHpConflict} className="min-h-10 px-3 rounded border border-cyan-700 bg-cyan-950/30 text-xs text-cyan-100">Compartir mis datos locales</button></div></div></div>}

                        {restModalOpen && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setRestModalOpen(false)}><div className="rpg-panel max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 border border-cyan-600" onClick={e => e.stopPropagation()}>
                                <h3 className="text-xl font-fantasy text-cyan-200">Descansar</h3>
                                {!restType ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5"><button onClick={() => setRestType('short')} className="min-h-20 p-4 rounded border border-cyan-700 text-left hover:bg-cyan-950/30"><b>Descanso corto</b><span className="block text-xs text-gray-400 mt-1">Recursos cortos y Magia de pacto.</span></button><button onClick={() => setRestType('long')} className="min-h-20 p-4 rounded border border-purple-700 text-left hover:bg-purple-950/30"><b>Descanso largo</b><span className="block text-xs text-gray-400 mt-1">Vida, ranuras y recursos.</span></button></div> : <div className="mt-4 space-y-4">{restType === 'short' && <div className="p-3 rounded bg-gray-900 border border-gray-700"><p className="text-sm">Dados disponibles: <b>{hitDice.current}{hitDice.type}</b> · Constitución: {formatMod(getModNum(getEffectiveStat('con')))}</p><div className="flex items-center gap-3 mt-3"><span>Dados gastados</span><button onClick={() => setRestSpentDice(value => Math.max(0, Number(value)-1))}>−</button><b>{restSpentDice}</b><button disabled={(Number(hp.current)||0) >= (Number(hp.max)||0)} onClick={() => setRestSpentDice(value => Math.min(Number(hitDice.current)||0, Number(value)+1))}>+</button></div><label className="block mt-3 text-sm">Puntos de golpe recuperados<input disabled={!restSpentDice} min="0" type="number" value={restHealing} onChange={e => setRestHealing(e.target.value === '' ? '' : Math.max(0, Number(e.target.value) || 0))} className="ml-2 w-20 bg-gray-950 border border-gray-700 rounded p-1"/></label></div>}<div className="p-3 rounded border border-gray-700"><b>Vista previa</b>{restPreview.changes.length ? <ul className="mt-2 text-sm space-y-1">{restPreview.changes.map((change,index)=><li key={index}>{change}</li>)}</ul> : <p className="text-sm text-gray-500 mt-2">No hay cambios calculables.</p>}<p className="text-xs text-gray-500 mt-3">Sin cambios: {restPreview.unchanged.join(', ') || 'ninguno'}</p></div><div className="flex justify-end gap-3"><button onClick={() => setRestType(null)}>Volver</button><button onClick={confirmRest} className="px-4 py-2 rounded bg-cyan-700 text-white">Confirmar descanso</button></div></div>}
                            </div></div>
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

                        {activityHistoryOpen && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setActivityHistoryOpen(false)}>
                                <div className="rpg-panel w-full max-w-2xl max-h-[85vh] flex flex-col p-5" onClick={event => event.stopPropagation()}>
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700 pb-3">
                                        <h3 className="text-xl font-fantasy font-bold text-purple-200 tracking-widest uppercase">Historial</h3>
                                        <div className="flex items-center gap-2"><button type="button" disabled={!activityLog.length} onClick={() => confirmDelete('¿Limpiar todo el historial de este personaje?', () => setActivityLog([]))} className="min-h-9 px-3 rounded border border-red-800 text-xs text-red-200 hover:bg-red-950 disabled:border-gray-700 disabled:text-gray-600 disabled:cursor-not-allowed">Limpiar</button><button type="button" onClick={() => setActivityHistoryOpen(false)} className="w-10 h-10 rounded border border-gray-600 text-gray-300 text-2xl leading-none" aria-label="Cerrar historial">&times;</button></div>
                                    </div>
                                    {activityLog.length ? <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-2">{activityLog.map(entry => <div key={entry.id} className="flex gap-3 rounded border border-gray-800 bg-gray-900/50 px-3 py-2"><time dateTime={entry.timestamp} className="shrink-0 text-xs text-purple-300">{new Date(entry.timestamp).toLocaleDateString('es-ES')} {new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</time><span className="text-sm text-gray-200">{entry.description}</span></div>)}</div> : <p className="mt-4 text-sm text-gray-500">Aún no hay cambios importantes registrados.</p>}
                                </div>
                            </div>
                        )}

                        {bestiaryOpen && !bestiaryEditor && <div className="fixed bottom-5 left-1/2 z-[76] flex -translate-x-1/2 flex-wrap justify-center gap-2 rounded border border-gray-600 bg-gray-950/95 p-2 shadow-xl"><input ref={bestiaryImportRef} type="file" accept="application/json,.json" onChange={handleBestiaryImportFile} className="hidden"/><button type="button" onClick={exportBestiary} className="min-h-10 rounded border border-cyan-700 px-3 text-xs text-cyan-100">Exportar bestiario</button><button type="button" onClick={() => bestiaryImportRef.current?.click()} className="min-h-10 rounded border border-orange-700 px-3 text-xs text-orange-100">Importar bestiario</button>{window.localStorage.getItem(LOCAL_BESTIARY_BACKUP_KEY) && <button type="button" onClick={restoreBestiaryBackup} className="min-h-10 rounded border border-purple-700 px-3 text-xs text-purple-100">Restaurar copia anterior</button>}</div>}

                        {bestiaryImportPreview && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"><div className="rpg-panel max-h-[90vh] w-full max-w-xl overflow-y-auto border border-orange-700 p-5"><h3 className="font-fantasy text-lg font-bold text-orange-200">Vista previa de importación</h3><p className="mt-2 text-sm text-gray-300">{bestiaryImportPreview.monsters.length} criaturas válidas · {bestiaryImportPreview.duplicates.length} posibles duplicados · {bestiaryImportPreview.invalid} inválidas · {bestiaryImportPreview.monsters.filter(monster => monster.avatarDataUrl).length} con avatar · {Math.ceil(bestiaryImportPreview.size / 1024)} KB</p>{bestiaryImportPreview.avatarsRemoved && <p className="mt-2 text-xs text-yellow-200">Los avatares se han excluido por exceder el límite total.</p>}<div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><label className="text-sm text-gray-300">Modo<select value={bestiaryImportMode} onChange={event => setBestiaryImportMode(event.target.value)} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="merge">Combinar</option><option value="replace">Reemplazar todo</option></select></label><label className="text-sm text-gray-300">Duplicados<select value={bestiaryDuplicateMode} onChange={event => setBestiaryDuplicateMode(event.target.value)} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="skip">Omitir</option><option value="replace">Reemplazar</option><option value="copy">Importar como copia</option></select></label></div><div className="mt-4 max-h-64 space-y-1 overflow-y-auto pr-1">{bestiaryImportPreview.monsters.map(monster => <label key={monster.id} className="flex items-center gap-2 rounded border border-gray-700 bg-gray-900/60 px-3 py-2 text-sm text-gray-200"><input type="checkbox" checked={bestiarySelectedImportIds.includes(monster.id)} onChange={event => setBestiarySelectedImportIds(previous => event.target.checked ? [...previous, monster.id] : previous.filter(id => id !== monster.id))}/><span className="min-w-0 flex-1 truncate">{monster.name} · PV {monster.maxHp} · CA {monster.armorClass ?? '—'}</span>{bestiaryImportPreview.duplicates.includes(monster.id) && <span className="text-[10px] text-yellow-200">Duplicado</span>}</label>)}</div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setBestiaryImportPreview(null)} className="min-h-10 rounded border border-gray-600 px-3 text-sm text-gray-300">Cancelar</button><button type="button" onClick={applyBestiaryImport} className="min-h-10 rounded border border-orange-700 bg-orange-950/30 px-4 text-sm font-bold text-orange-100">Confirmar importación</button></div></div></div>}

                        {bestiaryOpen && (() => {
                            const tags = [...new Set(bestiary.monsters.flatMap(monster => monster.tags))].sort((a, b) => a.localeCompare(b, 'es'));
                            const query = bestiaryQuery.trim().toLocaleLowerCase('es');
                            const monsters = bestiary.monsters.filter(monster => (!query || monster.name.toLocaleLowerCase('es').includes(query) || monster.tags.some(tag => tag.toLocaleLowerCase('es').includes(query))) && (!bestiaryTag || monster.tags.includes(bestiaryTag))).slice().sort((left, right) => bestiarySort === 'updated' ? String(right.updatedAt).localeCompare(String(left.updatedAt)) : left.name.localeCompare(right.name, 'es'));
                            return <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/85 p-4" onClick={() => { if (!bestiaryEditor) setBestiaryOpen(false); }}>
                                <div className="rpg-panel flex max-h-[92vh] w-full max-w-3xl flex-col border border-orange-700 p-4 sm:p-5" onClick={event => event.stopPropagation()}>
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700 pb-3"><div><h3 className="font-fantasy text-xl font-bold uppercase tracking-wider text-orange-200">Bestiario</h3><p className="mt-1 text-xs text-gray-500">Biblioteca local de plantillas. No se sincroniza con salas.</p></div><div className="flex gap-2"><button type="button" onClick={() => openBestiaryEditor()} className="min-h-10 rounded border border-orange-700 bg-orange-950/30 px-3 text-xs text-orange-100">+ Nueva criatura</button><button type="button" onClick={() => setBestiaryOpen(false)} className="h-10 w-10 rounded border border-gray-600 text-xl text-gray-200" aria-label="Cerrar Bestiario">×</button></div></div>
                                    {(bestiary.warning || bestiaryNotice) && <p className="mt-3 rounded border border-yellow-800 bg-yellow-950/30 px-3 py-2 text-xs text-yellow-100">{bestiaryNotice || bestiary.warning}</p>}
                                    {!bestiaryEditor ? <><div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"><input value={bestiaryQuery} onChange={event => setBestiaryQuery(event.target.value)} placeholder="Buscar criatura o etiqueta" className="min-h-10 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white"/><select value={bestiaryTag} onChange={event => setBestiaryTag(event.target.value)} className="min-h-10 rounded border border-gray-600 bg-gray-950 px-2 text-sm text-white"><option value="">Todas las etiquetas</option>{tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}</select><select value={bestiarySort} onChange={event => setBestiarySort(event.target.value)} className="min-h-10 rounded border border-gray-600 bg-gray-950 px-2 text-sm text-white"><option value="name">Nombre</option><option value="updated">Actualización</option></select></div><div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">{monsters.map(monster => <div key={monster.id} className="flex flex-wrap items-center gap-3 rounded border border-gray-700 bg-gray-900/60 p-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded border border-orange-700 bg-orange-950/30 text-sm font-bold text-orange-100">{monster.avatarDataUrl ? <img src={monster.avatarDataUrl} alt="" className="h-full w-full object-cover"/> : monster.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{monster.name}</strong><span className="text-xs text-gray-400">PV {monster.maxHp} · CA {monster.armorClass ?? '—'}</span>{monster.tags.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{monster.tags.map(tag => <span key={tag} className="rounded border border-orange-900 px-1.5 py-0.5 text-[10px] text-orange-200">{tag}</span>)}</div>}</div><div className="flex flex-wrap gap-1"><button type="button" onClick={() => { if (!isCurrentRoomMaster) { setBestiaryNotice('Abre una sala como Máster para usar una plantilla.'); return; } setEnemyModal({ isOpen: true, mode: 'create', enemyId: null, data: { name: monster.name, initiative: '', currentHp: monster.maxHp, maxHp: monster.maxHp, tempHp: 0, armorClass: monster.armorClass ?? '', notes: monster.privateNotes, visibleStateMode: monster.defaultVisibleStateMode, manualVisibleState: monster.defaultManualVisibleState || 'herido', conditionsVisible: cloneData(monster.defaultPublicConditions) } }); setBestiaryOpen(false); }} className="min-h-9 rounded border border-orange-700 px-2 text-[10px] text-orange-100">Usar</button><button type="button" onClick={() => openBestiaryEditor(monster)} className="min-h-9 rounded border border-gray-600 px-2 text-[10px] text-gray-200">Editar</button><button type="button" onClick={() => duplicateBestiaryMonster(monster.id)} className="min-h-9 rounded border border-purple-700 px-2 text-[10px] text-purple-100">Duplicar</button><button type="button" onClick={() => confirmDelete(`¿Eliminar la plantilla ${monster.name}? Los enemigos ya creados no cambiarán.`, () => deleteBestiaryMonster(monster.id))} className="min-h-9 rounded border border-red-800 px-2 text-[10px] text-red-100">Eliminar</button></div></div>)}{!monsters.length && <p className="py-8 text-center text-sm text-gray-500">No hay criaturas que coincidan.</p>}</div></> : <div className="mt-4 flex-1 overflow-y-auto pr-1"><input ref={bestiaryAvatarRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleBestiaryAvatar} className="hidden"/><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-sm text-gray-300">Nombre<input autoFocus value={bestiaryEditor.name} onChange={event => setBestiaryEditor(previous => ({ ...previous, name: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"/></label><label className="text-sm text-gray-300">PV máximos<input type="number" min="0" value={bestiaryEditor.maxHp} onChange={event => setBestiaryEditor(previous => ({ ...previous, maxHp: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"/></label><label className="text-sm text-gray-300">CA<input type="number" min="0" value={bestiaryEditor.armorClass ?? ''} onChange={event => setBestiaryEditor(previous => ({ ...previous, armorClass: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"/></label><label className="text-sm text-gray-300">Estado visible<select value={bestiaryEditor.defaultVisibleStateMode} onChange={event => setBestiaryEditor(previous => ({ ...previous, defaultVisibleStateMode: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="automatic">Automático</option><option value="manual">Manual</option><option value="hidden">Oculto</option></select></label>{bestiaryEditor.defaultVisibleStateMode === 'manual' && <label className="text-sm text-gray-300">Estado manual<input value={bestiaryEditor.defaultManualVisibleState || ''} onChange={event => setBestiaryEditor(previous => ({ ...previous, defaultManualVisibleState: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"/></label>}<label className="text-sm text-gray-300">Etiquetas<input value={bestiaryEditor.tags.join(', ')} onChange={event => setBestiaryEditor(previous => ({ ...previous, tags: event.target.value.split(',').map(tag => tag.trim()).filter(Boolean) }))} placeholder="no-muerto, bosque" className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"/></label></div><label className="mt-3 block text-sm text-gray-300">Condiciones públicas iniciales<input value={bestiaryEditor.defaultPublicConditions.map(item => typeof item === 'string' ? item : item.name).join(', ')} onChange={event => setBestiaryEditor(previous => ({ ...previous, defaultPublicConditions: event.target.value.split(',').map(item => item.trim()).filter(Boolean) }))} placeholder="envenenado, invisible" className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"/></label><label className="mt-3 block text-sm text-gray-300">Notas privadas<textarea value={bestiaryEditor.privateNotes} onChange={event => setBestiaryEditor(previous => ({ ...previous, privateNotes: event.target.value }))} className="mt-1 min-h-24 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"/></label><div className="mt-3 flex items-center gap-3">{bestiaryEditor.avatarDataUrl ? <img src={bestiaryEditor.avatarDataUrl} alt="" className="h-12 w-12 rounded border border-orange-700 object-cover"/> : <span className="flex h-12 w-12 items-center justify-center rounded border border-gray-700 text-orange-200">?</span>}<button type="button" onClick={() => bestiaryAvatarRef.current?.click()} className="min-h-10 rounded border border-orange-700 px-3 text-xs text-orange-100">Avatar</button>{bestiaryEditor.avatarDataUrl && <button type="button" onClick={() => setBestiaryEditor(previous => ({ ...previous, avatarDataUrl: '' }))} className="min-h-10 rounded border border-red-800 px-3 text-xs text-red-100">Quitar</button>}</div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setBestiaryEditor(null)} className="min-h-10 rounded border border-gray-600 px-3 text-sm text-gray-300">Cancelar</button><button type="button" onClick={saveBestiaryEditor} className="min-h-10 rounded border border-orange-700 bg-orange-950/30 px-4 text-sm font-bold text-orange-100">Guardar plantilla</button></div></div>}
                                </div>
                            </div>;
                        })()}

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

                        {timerModal.isOpen && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setTimerModal({ isOpen: false, id: null, data: { name: '', current: '1', max: '', type: 'turns' } })}>
                                <div className="rpg-panel w-full max-w-md p-5" onClick={event => event.stopPropagation()}>
                                    <div className="flex items-center justify-between gap-4 border-b border-gray-700 pb-3">
                                        <h3 className="text-xl font-fantasy font-bold text-cyan-200">{timerModal.id ? 'Editar temporizador' : 'Nuevo temporizador'}</h3>
                                        <button type="button" onClick={() => setTimerModal({ isOpen: false, id: null, data: { name: '', current: '1', max: '', type: 'turns' } })} className="w-10 h-10 rounded border border-gray-600 text-gray-300 text-2xl leading-none">&times;</button>
                                    </div>
                                    <div className="mt-4 space-y-4">
                                        <label className="block text-sm text-gray-300">Nombre<input autoFocus type="text" placeholder="Ej: Escudo de la Fe" value={timerModal.data.name} onChange={event => setTimerModal(previous => ({ ...previous, data: { ...previous.data, name: event.target.value } }))} className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2.5 text-white outline-none focus:border-cyan-400"/></label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="block text-sm text-gray-300">Actual<input type="number" min="0" value={timerModal.data.current} onChange={event => setTimerModal(previous => ({ ...previous, data: { ...previous.data, current: handleNumInput(event.target.value) } }))} className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2.5 text-center text-white outline-none focus:border-cyan-400"/></label>
                                            <label className="block text-sm text-gray-300">Máximo opcional<input type="number" min="0" placeholder="Ej: 10" value={timerModal.data.max} onChange={event => setTimerModal(previous => ({ ...previous, data: { ...previous.data, max: handleNumInput(event.target.value) } }))} className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2.5 text-center text-white outline-none focus:border-cyan-400"/></label>
                                        </div>
                                        <label className="block text-sm text-gray-300">Tipo<select value={timerModal.data.type} onChange={event => setTimerModal(previous => ({ ...previous, data: { ...previous.data, type: event.target.value } }))} className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2.5 text-white outline-none focus:border-cyan-400"><option value="turns">Turnos</option><option value="rounds">Rondas</option><option value="minutes">Minutos</option><option value="hours">Horas</option><option value="days">Días</option></select>{REAL_TIMER_UNITS[timerModal.data.type] && <span className="mt-1 block text-xs text-cyan-300">Este temporizador avanza con el tiempo real.</span>}</label>
                                    </div>
                                    <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setTimerModal({ isOpen: false, id: null, data: { name: '', current: '1', max: '', type: 'turns' } })} className="min-h-10 px-4 rounded border border-gray-600 text-gray-300">Cancelar</button><button type="button" onClick={saveTimer} className="min-h-10 px-4 rounded border border-cyan-500 bg-cyan-700 text-white">Guardar</button></div>
                                </div>
                            </div>
                        )}

                        {characterManagerOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setCharacterManagerOpen(false)}>
                                <div className="rpg-panel border border-purple-500/50 rounded-lg p-4 md:p-6 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl" onClick={event => event.stopPropagation()}>
                                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-700">
                                        <div>
                                            <h3 className="text-xl font-fantasy font-bold text-purple-200 tracking-widest uppercase">Personajes</h3>
                                            <p className="text-xs text-gray-500 mt-1">{characterList.length} ficha{characterList.length === 1 ? '' : 's'} guardada{characterList.length === 1 ? '' : 's'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={createManagedCharacter} className="min-h-10 px-3 py-2 rounded bg-purple-700 hover:bg-purple-600 border border-purple-500 text-white text-xs font-fantasy uppercase tracking-wider">+ Nuevo personaje</button>
                                            <button type="button" onClick={() => setCharacterManagerOpen(false)} className="w-10 h-10 rounded border border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800 text-2xl leading-none" aria-label="Cerrar gestión de personajes">&times;</button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                        {characterList.map(character => {
                                            const isActive = manager.activeCharacterId === character.meta.id;
                                            return (
                                                <div key={character.meta.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded border ${isActive ? 'border-purple-500 bg-purple-950/30' : 'border-gray-700 bg-gray-900/50'}`}>
                                                    <button type="button" onClick={() => selectManagedCharacter(character.meta.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                                                        {isValidPortraitDataUrl(character.meta.portrait) ? <img src={character.meta.portrait} alt="" className="w-11 h-11 rounded object-cover border border-purple-500/60 bg-gray-900" /> : <span className="w-11 h-11 shrink-0 rounded bg-gray-800 border border-gray-600 text-purple-300 flex items-center justify-center font-fantasy text-lg">{(character.meta.name || '?').slice(0, 1).toUpperCase()}</span>}
                                                        <span className="min-w-0">
                                                            <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-white font-fantasy tracking-wider"><span className="truncate">{character.meta.name || 'Personaje sin nombre'}</span>{isActive && <span className="text-[9px] px-2 py-0.5 rounded-full border border-purple-400 bg-purple-900/50 text-purple-200 uppercase">Activo</span>}</span>
                                                            <span className="block text-[11px] text-gray-500 mt-1">Actualizado {new Date(character.meta.updatedAt).toLocaleDateString()}</span>
                                                        </span>
                                                    </button>
                                                    <div className="flex shrink-0 gap-2">
                                                        <button type="button" onClick={() => duplicateCharacter(character.meta.id)} className="min-h-9 px-3 py-2 rounded border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200 text-[10px] font-fantasy uppercase tracking-wider">Duplicar</button>
                                                        <button type="button" onClick={() => deleteManagedCharacter(character.meta.id)} className="min-h-9 px-3 py-2 rounded border border-red-800 bg-red-950/50 hover:bg-red-900 text-red-200 text-[10px] font-fantasy uppercase tracking-wider">Eliminar</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-gray-700">
                                        <h4 className="text-xs font-fantasy font-bold text-gray-300 uppercase tracking-widest mb-3">Copia de seguridad</h4>
                                        <input ref={importFileRef} type="file" accept="application/json,.json" onChange={handleImportFile} className="hidden" />
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" onClick={exportActiveCharacter} className="min-h-10 px-3 py-2 rounded border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-100 text-[10px] font-fantasy uppercase tracking-wider">Exportar personaje</button>
                                            <button type="button" onClick={() => importFileRef.current?.click()} className="min-h-10 px-3 py-2 rounded border border-purple-700 bg-purple-950/40 hover:bg-purple-900 text-purple-100 text-[10px] font-fantasy uppercase tracking-wider">Importar personaje</button>
                                            {supportsFileSharing && <button type="button" onClick={shareActiveCharacter} className="min-h-10 px-3 py-2 rounded border border-fuchsia-700 bg-fuchsia-950/40 hover:bg-fuchsia-900 text-fuchsia-100 text-[10px] font-fantasy uppercase tracking-wider">Compartir personaje</button>}
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-gray-700">
                                        <p className="text-[11px] text-gray-500 leading-relaxed">El retrato se gestiona desde el encabezado de la ficha y se guarda optimizado dentro de este personaje.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
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
                            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
                                <div className="rpg-panel p-5 max-w-md w-full border border-fuchsia-500">
                                    <h3 className="font-fantasy text-lg text-fuchsia-200">Lanzar {castSpell.name}</h3>
                                    {castSpell.level === 0 ? <><p className="text-sm text-gray-300 mt-3">Truco: no consume ranuras.</p><button onClick={() => castWithSlot(0)} className="mt-4 px-4 py-2 bg-fuchsia-700 rounded text-white">Confirmar</button></> : <div className="mt-4 space-y-2">{[1,2,3,4,5,6,7,8,9].filter(level => level >= castSpell.level && Number(spellSlots[level].current) > 0).map(level => <button key={level} onClick={() => castWithSlot(level)} className="w-full p-3 text-left rounded border border-gray-700 hover:border-fuchsia-500">Ranura de nivel {level} ({spellSlots[level].current} disponible)</button>)}{grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.current) > 0 && Number(grimoireConfig.pactSlots.level) >= castSpell.level && <button onClick={() => castWithSlot(grimoireConfig.pactSlots.level, true)} className="w-full p-3 text-left rounded border border-yellow-700 text-yellow-200">Magia de pacto: nivel {grimoireConfig.pactSlots.level} ({grimoireConfig.pactSlots.current} disponible)</button>}<button onClick={() => setCastSpell(null)} className="px-4 py-2 text-gray-300">Cancelar</button></div>}
                                </div>
                            </div>
                        )}

                        {editingSlotLevel && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setEditingSlotLevel(null)}><div className="rpg-panel p-5 w-full max-w-xs" onClick={e => e.stopPropagation()}><h3 className="font-fantasy text-fuchsia-200">Ranura nivel {editingSlotLevel}</h3><label className="block mt-3 text-sm">Disponibles<input type="number" value={spellSlots[editingSlotLevel].current} onChange={e => setSpellSlots(prev => ({...prev,[editingSlotLevel]:{...prev[editingSlotLevel],current:handleNumInput(e.target.value)}}))} className="mt-1 w-full bg-gray-950 border border-gray-700 rounded p-2"/></label><label className="block mt-3 text-sm">Máximo<input type="number" value={spellSlots[editingSlotLevel].max} onChange={e => setSpellSlots(prev => ({...prev,[editingSlotLevel]:{...prev[editingSlotLevel],max:handleNumInput(e.target.value)}}))} className="mt-1 w-full bg-gray-950 border border-gray-700 rounded p-2"/></label><button onClick={() => setEditingSlotLevel(null)} className="mt-4 px-4 py-2 bg-fuchsia-700 rounded">Listo</button></div></div>}

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
                                        <button onClick={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); closeConfirm(); }} className={`px-4 py-2 text-white rounded font-bold transition-colors text-xs uppercase tracking-wider border ${confirmDialog.isAlert ? 'bg-fuchsia-700 hover:bg-fuchsia-600 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-red-700 hover:bg-red-600 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]'}`}>
                                            {confirmDialog.isAlert ? 'Entendido' : 'Eliminar'}
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
                        {addModal.isOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setAddModal({isOpen:false, type:null, data:{}})}>
                                <div className="rpg-panel border border-purple-500/50 rounded-lg p-6 max-w-md w-full shadow-2xl animate-attack" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                                        <h3 className="text-xl font-fantasy font-bold text-white tracking-widest uppercase">Creación</h3>
                                        <button onClick={() => setAddModal({isOpen:false, type:null, data:{}})} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
                                    </div>
                                    
                                    <div className="space-y-5">
                                        {(addModal.type === 'item' || addModal.type === 'armor' || addModal.type === 'tool' || addModal.type === 'weapon' || addModal.type === 'resource' || addModal.type === 'spell' || addModal.type === 'attack') && (
                                            <div>
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
                                            <div className="flex gap-4">
                                                <div className="w-1/3">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Atq (Ej. +8)</label>
                                                    <input type="text" placeholder="Ej: +6" value={addModal.data.atk || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, atk: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none font-mono" />
                                                </div>
                                                <div className="w-2/3">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Daño (Ej. 1d6+5 Psíq)</label>
                                                    <input type="text" placeholder="Ej: 1d8+4 cortante" value={addModal.data.dmg || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, dmg: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none font-mono" />
                                                </div>
                                            </div>
                                        )}

                                        {(addModal.type === 'attack' || addModal.type === 'spell') && (
                                            <div>
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
                                    <div className="flex justify-end space-x-4 mt-8 pt-5 border-t border-gray-700">
                                        <button onClick={() => setAddModal({isOpen:false, type:null, data:{}})} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded font-bold transition-colors font-fantasy uppercase tracking-wider text-xs">Cancelar</button>
                                        <button onClick={handleAddSubmit} className="px-6 py-2 bg-purple-700 hover:bg-purple-600 border border-purple-500 text-white rounded font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all transform hover:scale-105 font-fantasy uppercase tracking-wider text-xs">Registrar</button>
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
