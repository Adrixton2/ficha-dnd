(() => {
    const { useEffect, useState } = React;
    const {
        LOCAL_BESTIARY_BACKUP_KEY, LOCAL_BESTIARY_SCHEMA_VERSION,
        MAX_BESTIARY_AVATAR_TOTAL, MAX_BESTIARY_IMPORT_SIZE, MAX_BESTIARY_MONSTERS,
        MAX_PORTRAIT_FILE_SIZE, MAX_SHARED_AVATAR_DATA_URL_LENGTH,
        ONLINE_TABLE_STORAGE_KEY, calculateCharacterArmorClass, cloneData,
        createBestiaryExportPayload, createBestiaryId, createSharedAvatar, isRecord,
        isValidPortraitDataUrl, normalizeBestiaryMonster, normalizeCompanion,
        saveLocalBestiary
    } = window.DndAppUtils;
    const {
        calculateEnemyVisibleState, createEnemyId, createOnlinePlayerSheetSnapshot,
        getHpValues, isValidOnlinePlayerName, normalizeHpValue,
        normalizeOnlineConditions, normalizeOnlinePlayerName,
        orderOnlineEncounterCombatants, serializeOnlinePlayerSheetSnapshot
    } = window.DndOnlineTableUtils;

    function useOnlineTableController(context) {
        const {
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
        } = context;

            const [cloudCampaigns, setCloudCampaigns] = useState([]);

            const ONLINE_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
            const normalizeRoomCode = (value) => String(value || '').toUpperCase().replace(/\s+/g, '').replace(/[^A-HJ-KM-NP-Z2-9]/g, '').slice(0, 12);
            const isSupportedRoomCode = code => [6, 8, 12].includes(code.length);
            const createSecureRoomCode = () => {
                const bytes = new Uint8Array(12);
                window.crypto.getRandomValues(bytes);
                return Array.from(bytes, value => ONLINE_CODE_ALPHABET[value % ONLINE_CODE_ALPHABET.length]).join('');
            };
            const roomCollection = room => room?.collection === 'campaigns' ? 'campaigns' : 'rooms';
            const roomDocumentId = room => room?.id || room?.code;
            const activeRoomDoc = (api, db, ...segments) => api.doc(db, roomCollection(currentRoom), roomDocumentId(currentRoom), ...segments);
            const activeRoomCollection = (api, db, ...segments) => api.collection(db, roomCollection(currentRoom), roomDocumentId(currentRoom), ...segments);
            // Connection gate: local sheet remains usable when Firebase is unavailable.
            const getOnlineServices = () => {
                if (!firebaseReady || !firebaseUser?.uid || !window.firebaseServices?.firestore || !window.firebaseFirestore) throw new Error('Firebase todavía no está disponible.');
                const baseApi = window.firebaseFirestore;
                const redirectActiveRoomPath = path => {
                    if (roomCollection(currentRoom) !== 'campaigns' || path[0] !== 'rooms' || path[1] !== currentRoom?.code) return path;
                    const redirected = ['campaigns', roomDocumentId(currentRoom), ...path.slice(2)];
                    if (redirected[2] === 'playerSheets') redirected[2] = 'characterSummaries';
                    return redirected;
                };
                const api = {
                    ...baseApi,
                    doc: (db, ...path) => baseApi.doc(db, ...redirectActiveRoomPath(path)),
                    collection: (db, ...path) => baseApi.collection(db, ...redirectActiveRoomPath(path))
                };
                return { db: window.firebaseServices.firestore, api, uid: firebaseUser.uid };
            };
            // Central cleanup prevents duplicate Firestore listeners across room changes and reconnects.
            const cleanupOnlineTableListeners = () => {
                roomListenersRef.current.room?.();
                roomListenersRef.current.membership?.();
                roomListenersRef.current.members?.();
                roomListenersRef.current.participants?.();
                roomListenersRef.current.playerSheets?.();
                roomListenersRef.current.publicCombatants?.();
                roomListenersRef.current.privateEnemies?.();
                roomListenersRef.current.publicEffects?.();
                roomListenersRef.current.privateEffects?.();
                roomListenersRef.current = { code: null, room: null, membership: null, members: null, participants: null, playerSheets: null, publicCombatants: null, privateEnemies: null, publicEffects: null, privateEffects: null };
            };
            const saveOnlineRoomSession = (room) => {
                const session = room ? { ...(currentRoom || {}), ...room } : null;
                setLastOnlineRoom(session);
                try {
                    if (session) window.localStorage.setItem(ONLINE_TABLE_STORAGE_KEY, JSON.stringify({ currentRoomCode: session.code, currentRoomId: session.id || session.code, currentRoomCollection: roomCollection(session), currentRoomRole: session.role, sharedCharacterId: session.sharedCharacterId || null, playerName: session.playerName || '' }));
                    else window.localStorage.removeItem(ONLINE_TABLE_STORAGE_KEY);
                } catch (error) {}
            };
            // One listener per room source; previous subscriptions are always cleared first.
            const attachRoomListeners = (roomSession, role) => {
                const { db, api } = getOnlineServices();
                const session = typeof roomSession === 'string'
                    ? { code: roomSession, id: roomSession, collection: 'rooms', schemaVersion: 1 }
                    : roomSession;
                const code = session.code;
                const collectionName = roomCollection(session);
                const documentId = roomDocumentId(session);
                const sheetCollectionName = collectionName === 'campaigns' ? 'characterSummaries' : 'playerSheets';
                cleanupOnlineTableListeners();
                roomListenersRef.current.code = code;
                roomListenersRef.current.id = documentId;
                roomListenersRef.current.collection = collectionName;
                setCurrentRoom({ ...session, code, id: documentId, collection: collectionName, role });
                setRoomData(null);
                setRoomMembers([]);
                setRoomParticipants([]);
                setRoomPlayerSheets([]);
                setOnlinePlayerSheetId(null);
                setPublicCombatants([]);
                setPrivateEnemies([]);
                setPublicEffects([]);
                setPrivateEffects([]);
                setParticipantsHavePendingWrites(false);
                setSharedCharacterId(null);
                setShareCharacterOpen(false);
                setOnlineRoomModule('room');
                setSheetSyncStatus('idle');
                lastSentSheetSnapshotRef.current = { key: null, hash: null };
                roomListenersRef.current.room = api.onSnapshot(api.doc(db, collectionName, documentId), snapshot => {
                    if (!snapshot.exists()) {
                        setOnlineTableError('Sala no encontrada.');
                        setRoomData(null);
                        return;
                    }
                    const nextRoom = { id: snapshot.id, ...snapshot.data() };
                    setRoomData(nextRoom);
                    if (nextRoom.ownerUid === firebaseUser?.uid && !roomListenersRef.current.privateEnemies && roomListenersRef.current.code === code) {
                        roomListenersRef.current.playerSheets = api.onSnapshot(api.collection(db, collectionName, documentId, sheetCollectionName), sheetSnapshot => {
                            setRoomPlayerSheets(sheetSnapshot.docs.map(sheet => ({ id: sheet.id, ...sheet.data() })));
                        }, error => setOnlineTableError('No se pudieron recibir las fichas privadas del grupo.'));
                        roomListenersRef.current.privateEnemies = api.onSnapshot(api.collection(db, collectionName, documentId, 'privateEnemies'), privateSnapshot => {
                            setPrivateEnemies(privateSnapshot.docs.map(enemy => ({ id: enemy.id, ...enemy.data() })));
                        }, error => setOnlineTableError('No se pudo recibir los datos privados de enemigos.'));
                        roomListenersRef.current.privateEffects = api.onSnapshot(api.collection(db, collectionName, documentId, 'effectsPrivate'), effectSnapshot => {
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
                roomListenersRef.current.membership = api.onSnapshot(api.doc(db, collectionName, documentId, 'members', firebaseUser.uid), snapshot => {
                    if (role !== 'player' || leavingRoomRef.current) return;
                    if (!snapshot.exists() || snapshot.data()?.active === false) {
                        resetOnlineTable();
                        setOnlineTableError('');
                        setOnlineTableNotice('El Máster te ha expulsado de la sala.');
                        setOnlineTableOpen(true);
                    }
                }, error => {
                    if (role === 'player' && !leavingRoomRef.current) setOnlineTableError('No se pudo comprobar tu acceso a la sala.');
                });
                roomListenersRef.current.members = api.onSnapshot(api.collection(db, collectionName, documentId, 'members'), snapshot => {
                    setRoomMembers(snapshot.docs.map(member => ({ id: member.id, ...member.data(), role: ['owner', 'master'].includes(member.data().role) ? 'master' : 'player' })).filter(member => member.active !== false).sort((a, b) => (a.role === 'master' ? -1 : b.role === 'master' ? 1 : String(a.displayName).localeCompare(String(b.displayName)))));
                }, error => setOnlineTableError('No se pudo escuchar a los miembros de la sala.'));
                roomListenersRef.current.participants = api.onSnapshot(api.collection(db, collectionName, documentId, 'participants'), snapshot => {
                    setRoomParticipants(snapshot.docs.map(participant => ({ id: participant.id, ...participant.data() })).sort((left, right) => Number(left.type === 'companion') - Number(right.type === 'companion')));
                    setParticipantsHavePendingWrites(!!snapshot.metadata?.hasPendingWrites);
                }, error => setOnlineTableError('No se pudo escuchar a los personajes compartidos.'));
                roomListenersRef.current.publicCombatants = api.onSnapshot(api.collection(db, collectionName, documentId, 'publicCombatants'), snapshot => {
                    setPublicCombatants(snapshot.docs.map(enemy => ({ id: enemy.id, ...enemy.data() })).sort((a, b) => Number(a.orderCreated || 0) - Number(b.orderCreated || 0)));
                }, error => setOnlineTableError('No se pudo escuchar a los enemigos del encuentro.'));
                roomListenersRef.current.publicEffects = api.onSnapshot(api.collection(db, collectionName, documentId, 'effectsPublic'), snapshot => {
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
            const resolveRoomMembership = async (code, allowNewMember, requestedPlayerName = '', sessionHint = null) => {
                const { db, api, uid } = getOnlineServices();
                let session = sessionHint?.collection === 'campaigns' && sessionHint?.id
                    ? { code, id: sessionHint.id, collection: 'campaigns', schemaVersion: 2 }
                    : null;
                if (!session && code.length === 12) session = { code, id: code, collection: 'campaigns', schemaVersion: 2 };
                if (!session && code.length === 8) {
                    const invitation = await api.getDoc(api.doc(db, 'campaignInvites', code));
                    if (!invitation.exists() || invitation.data().active !== true) throw new Error('ROOM_NOT_FOUND');
                    session = { code, id: invitation.data().campaignId, collection: 'campaigns', schemaVersion: 2 };
                }
                if (!session) session = { code, id: code, collection: 'rooms', schemaVersion: 1 };
                const collectionName = roomCollection(session);
                const documentId = roomDocumentId(session);
                const cleanPlayerName = normalizeOnlinePlayerName(requestedPlayerName);
                const memberRef = api.doc(db, collectionName, documentId, 'members', uid);
                let memberSnapshot = await api.getDoc(memberRef);

                if (!memberSnapshot.exists() && allowNewMember) {
                    if (!isValidOnlinePlayerName(cleanPlayerName)) throw new Error('PLAYER_NAME_REQUIRED');
                    const memberPayload = {
                        uid,
                        role: 'player',
                        displayName: cleanPlayerName,
                        active: true,
                        joinedAt: api.serverTimestamp(),
                        lastSeen: api.serverTimestamp(),
                        ...(collectionName === 'campaigns' ? { blocked: false, updatedAt: api.serverTimestamp() } : {})
                    };
                    if (collectionName === 'campaigns') {
                        const campaignSnapshot = await api.getDoc(api.doc(db, collectionName, documentId));
                        if (!campaignSnapshot.exists()) throw new Error('ROOM_NOT_FOUND');
                        if (campaignSnapshot.data().status === 'closed') throw new Error('ROOM_CLOSED');
                        const batch = api.writeBatch(db);
                        batch.set(memberRef, memberPayload);
                        batch.set(api.doc(db, 'users', uid, 'campaigns', documentId), {
                            campaignId: documentId,
                            role: 'player',
                            active: true,
                            name: String(campaignSnapshot.data().name || 'Mesa Online').slice(0, 100),
                            inviteCode: code,
                            updatedAt: api.serverTimestamp()
                        });
                        await batch.commit();
                    } else {
                        await api.setDoc(memberRef, memberPayload);
                    }
                    memberSnapshot = await api.getDoc(memberRef);
                }
                const roomRef = api.doc(db, collectionName, documentId);
                const roomSnapshot = await api.getDoc(roomRef);
                if (!roomSnapshot.exists()) throw new Error('ROOM_NOT_FOUND');
                const room = roomSnapshot.data();
                if (room.status === 'closed') throw new Error('ROOM_CLOSED');
                let role;
                let playerName = '';
                if (memberSnapshot.exists()) {
                    if (memberSnapshot.data().blocked === true && !['owner', 'master'].includes(memberSnapshot.data().role)) throw new Error('MEMBER_BLOCKED');
                    const storedRole = memberSnapshot.data().role;
                    role = ['owner', 'master'].includes(storedRole) ? 'master' : storedRole;
                    if (!['master', 'player'].includes(role)) throw new Error('INVALID_MEMBERSHIP');
                    const reconnectPayload = { active: true, lastSeen: api.serverTimestamp() };
                    if (role === 'player') {
                        playerName = cleanPlayerName;
                        if (!isValidOnlinePlayerName(playerName)) throw new Error('PLAYER_NAME_REQUIRED');
                        reconnectPayload.displayName = playerName;
                    }
                    console.log('[Mesa] Escritura member:', { operation: 'reconnect-member', roomCode: code, uid, payload: reconnectPayload });
                    try {
                        if (collectionName === 'campaigns') {
                            reconnectPayload.updatedAt = api.serverTimestamp();
                            const batch = api.writeBatch(db);
                            batch.update(memberRef, reconnectPayload);
                            batch.set(api.doc(db, 'users', uid, 'campaigns', documentId), {
                                campaignId: documentId,
                                role: storedRole,
                                active: true,
                                name: String(room.name || 'Mesa Online').slice(0, 100),
                                inviteCode: code,
                                updatedAt: api.serverTimestamp()
                            });
                            await batch.commit();
                        } else {
                            await api.updateDoc(memberRef, reconnectPayload);
                        }
                    } catch (error) {
                        console.error('[Mesa] Error member:', error.code, error.message, error);
                        throw error;
                    }
                } else {
                    throw new Error('MEMBER_NOT_FOUND');
                }
                const participantRef = api.doc(db, collectionName, documentId, 'participants', uid);
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
                return { room, role, sharedId, needsCharacterSelection, playerName, session };
            };
            const activateRoomSession = (code, membership) => {
                attachRoomListeners(membership.session || code, membership.role);
                setSharedCharacterId(membership.sharedId);
                setShareCharacterOpen(membership.needsCharacterSelection);
                if (membership.role === 'player' && membership.playerName) setPlayerNameInput(membership.playerName);
                saveOnlineRoomSession({ ...(membership.session || { code }), role: membership.role, sharedCharacterId: membership.sharedId, playerName: membership.role === 'player' ? membership.playerName : '' });
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
                    const previousCharacterId = existing.exists() ? String(existing.data().characterId || '') : '';
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
                    const sheetSnapshot = createOnlinePlayerSheetSnapshot(character, {
                        armorClass: normalizedArmorClass,
                        characterRules: window.DndSrdCharacterRules
                    });
                    let masterSheetShared = true;
                    try {
                        await api.setDoc(api.doc(db, 'rooms', currentRoom.code, 'playerSheets', currentRoom.collection === 'campaigns' ? String(character.meta?.id || characterId) : uid), {
                            ownerUid: String(uid),
                            characterId: String(character.meta?.id || characterId || ''),
                            schemaVersion: 1,
                            snapshotJson: serializeOnlinePlayerSheetSnapshot(sheetSnapshot),
                            updatedAt: api.serverTimestamp()
                        });
                        if (currentRoom.collection === 'campaigns' && previousCharacterId && previousCharacterId !== String(character.meta?.id || characterId)) {
                            await api.deleteDoc(activeRoomDoc(api, db, 'characterSummaries', previousCharacterId));
                        }
                        lastSentSheetSnapshotRef.current = {
                            key: `${currentRoom.code}:${uid}:${characterId}`,
                            hash: JSON.stringify({ ...sheetSnapshot, generatedAt: '' })
                        };
                        setSheetSyncStatus('synced');
                    } catch (sheetError) {
                        masterSheetShared = false;
                        console.error('[ShareCharacter] No se pudo compartir la ficha privada:', sheetError);
                    }
                    setSharedCharacterId(characterId);
                    setShareCharacterOpen(false);
                    saveOnlineRoomSession({ code: currentRoom.code, role: currentRoom.role, sharedCharacterId: characterId });
                    setOnlineTableNotice(masterSheetShared ? 'Ficha compartida y disponible para el Máster.' : 'Personaje compartido. La vista completa del Máster queda pendiente de sincronizar.');
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
                    await api.updateDoc(api.doc(db, 'rooms', currentRoom.code, 'participants', participant.id), { initiative: value, updatedAt: api.serverTimestamp(), lastUpdatedBy: firebaseUser.uid, updateSource: isCurrentRoomMaster ? 'master' : 'player' });
                    if (participant.type === 'companion' && participant.ownerUid === firebaseUser?.uid && sharedCharacterId) {
                        updateCharacterData(sharedCharacterId, previous => ({
                            ...previous,
                            companions: (Array.isArray(previous.companions) ? previous.companions : []).map(companion => companion.id === participant.companionId ? normalizeCompanion({ ...companion, initiative: value }) : companion)
                        }));
                    }
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
                    if (participant.type === 'companion' && participant.ownerUid === firebaseUser?.uid && sharedCharacterId) {
                        updateCharacterData(sharedCharacterId, previous => ({
                            ...previous,
                            companions: (Array.isArray(previous.companions) ? previous.companions : []).map(companion => companion.id === participant.companionId ? normalizeCompanion({ ...companion, ...next }) : companion)
                        }));
                    }
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
                setBestiaryEnemyDraft({ templateId: monster.id, sourceLabel: monster.compendiumSource ? 'Compendio SRD 5.1' : 'Bestiario personal', name: monster.name, initiative: '', maxHp: monster.maxHp, armorClass: monster.armorClass ?? '', visibleStateMode: monster.defaultVisibleStateMode, manualVisibleState: monster.defaultManualVisibleState || 'herido', conditionsVisible: cloneData(monster.defaultPublicConditions), notes: monster.privateNotes, avatarDataUrl: isValidPortraitDataUrl(monster.avatarDataUrl) ? monster.avatarDataUrl : '', quantity: 1, nameMode: 'letters', copyNames: buildNextEnemyNames(monster.name, 1, 'letters'), initiativeMode: 'same', copyInitiatives: [''] });
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
                        setOnlineTableNotice(`${quantity} ${quantity === 1 ? 'enemigo creado' : 'enemigos creados'} desde ${bestiaryEnemyDraft.sourceLabel || 'el Bestiario'}. Elige cómo entran en el encuentro.`);
                    } else {
                        setOnlineTableNotice(`${quantity} ${quantity === 1 ? 'enemigo creado' : 'enemigos creados'} desde ${bestiaryEnemyDraft.sourceLabel || 'el Bestiario'}.`);
                    }
                } catch (error) {
                    console.error('[BestiaryEnemy] error real', error);
                    setOnlineTableError(`No se pudo crear el enemigo desde ${bestiaryEnemyDraft.sourceLabel || 'el Bestiario'}.`);
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
            const createSrdMonsterSharedAvatar = async (sourceMonster) => {
                const iconPath = getMonsterIconPath(sourceMonster);
                if (!iconPath) return '';
                const response = await fetch(iconPath);
                if (!response.ok) throw new Error(`No se pudo cargar el icono (${response.status}).`);
                const blob = await response.blob();
                if (!blob.type.startsWith('image/')) throw new Error('El recurso del icono no es una imagen.');
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result || ''));
                    reader.onerror = () => reject(reader.error || new Error('No se pudo leer el icono.'));
                    reader.readAsDataURL(blob);
                });
                return createSharedAvatar(dataUrl);
            };
            const useSrdMonsterInOnlineTable = async (sourceMonster) => {
                if (!currentRoom || !isCurrentRoomMaster) {
                    setBestiaryNotice('Abre una sala como Máster para preparar esta criatura en la mesa.');
                    return;
                }
                const template = createSrdBestiaryTemplate(sourceMonster);
                const hasCompendiumIcon = !!getMonsterIconPath(sourceMonster);
                let avatarDataUrl = '';
                if (hasCompendiumIcon) {
                    try {
                        avatarDataUrl = await createSrdMonsterSharedAvatar(sourceMonster);
                    } catch (error) {
                        console.warn('[BestiaryEnemy] No se pudo preparar el icono del Compendio.', error);
                    }
                }
                openBestiaryEnemyDraft({ ...template, avatarDataUrl });
                setBestiaryCompendiumPreview(null);
                setBestiaryCompendiumOpen(false);
                if (hasCompendiumIcon && !avatarDataUrl) setOnlineTableNotice('La criatura se ha preparado, pero no se pudo cargar su imagen del Compendio.');
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
            const removeCombatantFromTurnOrder = async ({ roomCode, combatantId, additionalCombatantIds = [], reason = 'removed', removeEnemyDocuments = false, removePlayerUid = null }) => {
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
                    const removedIds = new Set([combatantId, ...additionalCombatantIds].filter(Boolean));
                    const removedIndexes = oldTurnOrder.map((id, index) => removedIds.has(id) ? index : -1).filter(index => index >= 0);
                    const oldRemovedIndex = removedIndexes.length ? Math.min(...removedIndexes) : -1;
                    if (reason === 'deleted') console.log('[DeleteEnemy] antes', { enemyId: combatantId, oldTurnOrder, oldCurrentTurnId, oldTurnIndex });

                    if (removeEnemyDocuments) {
                        transaction.delete(api.doc(db, 'rooms', roomCode, 'publicCombatants', combatantId));
                        transaction.delete(api.doc(db, 'rooms', roomCode, 'privateEnemies', combatantId));
                    }
                    if (removePlayerUid) {
                        removedIds.forEach(id => transaction.delete(api.doc(db, 'rooms', roomCode, 'participants', id)));
                        if (currentRoom.collection !== 'campaigns') {
                            transaction.delete(api.doc(db, 'rooms', roomCode, 'playerSheets', removePlayerUid));
                            transaction.delete(api.doc(db, 'rooms', roomCode, 'members', removePlayerUid));
                        }
                    }

                    if (oldRemovedIndex < 0) {
                        outcome = { removed: false, currentTurnId: oldCurrentTurnId, turnIndex: oldTurnIndex };
                        if (reason === 'deleted') console.log('[DeleteEnemy] después', { newTurnOrder: oldTurnOrder, newCurrentTurnId: oldCurrentTurnId, newTurnIndex: oldTurnIndex });
                        return;
                    }

                    const newTurnOrder = oldTurnOrder.filter(id => !removedIds.has(id));
                    let newCurrentTurnId = oldCurrentTurnId;
                    let newTurnIndex = 0;
                    let wrappedToNextRound = false;
                    if (!removedIds.has(oldCurrentTurnId) && newTurnOrder.includes(oldCurrentTurnId)) {
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
                        wrappedToNextRound = removedIds.has(oldCurrentTurnId);
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
                    if (target.ownerUid === firebaseUser?.uid && target.characterId === sharedCharacterId) {
                        if (target.type === 'companion') updateCharacterData(sharedCharacterId, previous => ({ ...previous, companions: (previous.companions || []).map(companion => companion.id === target.companionId ? normalizeCompanion({ ...companion, conditions: next }) : companion) }));
                        else setConditions(next.map(condition => condition.name));
                    }
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
                if (target.type !== 'enemy' && target.ownerUid === firebaseUser?.uid && target.characterId === sharedCharacterId) {
                    if (target.type === 'companion') updateCharacterData(sharedCharacterId, previous => ({ ...previous, companions: (previous.companions || []).map(companion => companion.id === target.companionId ? normalizeCompanion({ ...companion, conditions: next }) : companion) }));
                    else setConditions(next.map(condition => condition.name));
                }
            };
            const createEffectId = () => `effect_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
            const openEffectModal = (effect = null, preferredTarget = null) => {
                const defaultTarget = preferredTarget || getCombatant(selectedCombatantId) || ownRoomParticipant || encounterParticipants[0] || null;
                setEffectModal({ isOpen: true, effectId: effect?.id || null, data: effect ? { ...effect, concentration: Boolean(effect.concentration || effect.requiresConcentration) } : { name: '', targetId: defaultTarget?.id || (isCurrentRoomMaster ? 'global' : ''), targetType: defaultTarget?.type === 'enemy' ? 'enemy' : defaultTarget ? 'player' : isCurrentRoomMaster ? 'global' : 'player', durationType: 'rounds', remaining: 1, maximum: 1, decrementMoment: 'end-of-round', visibleToPlayers: true, concentration: false, notesPublic: '', notesPrivate: '' } });
            };
            const effectCollectionName = (effect) => effect.visibleToPlayers ? 'effectsPublic' : 'effectsPrivate';
            const canManageEffect = (effect) => roomData?.ownerUid === firebaseUser?.uid || (effect?.ownerUid === firebaseUser?.uid && effect?.targetType === 'player' && getCombatant(effect?.targetId)?.ownerUid === firebaseUser?.uid);
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
                const selectedTargetId = targetType === 'global' ? 'global' : selectedTarget.id;
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
                const affected = encounterEffects.filter(effect => !effect.expired && effect.remaining !== null && effect.decrementMoment === moment && (moment.includes('target-turn') ? effect.targetId === targetId : true));
                const { db, api } = getOnlineServices();
                await Promise.all(affected.map(effect => api.runTransaction(db, async transaction => { const ref = api.doc(db, 'rooms', currentRoom.code, effectCollectionName(effect), effect.id); const snapshot = await transaction.get(ref); if (!snapshot.exists()) return; const current = snapshot.data(); if (current.expired || current.remaining === null) return; const remaining = Math.max(0, Number(current.remaining) - 1); transaction.update(ref, { remaining, expired: remaining === 0, updatedAt: api.serverTimestamp() }); })));
            };
            const buildPreparedTurnOrder = () => {
                if (!isCurrentRoomMaster || roomData?.status !== 'lobby') return;
                const ordered = orderOnlineEncounterCombatants(encounterCombatants).map(participant => participant.id);
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
                if (sheetSyncTimerRef.current) window.clearTimeout(sheetSyncTimerRef.current);
                if (companionSyncTimerRef.current) window.clearTimeout(companionSyncTimerRef.current);
                hpSyncTimerRef.current = null;
                hpConfirmTimerRef.current = null;
                applyingRemoteHpRef.current = null;
                lastSentHpPayloadRef.current = null;
                hpConflictHandledRef.current = null;
                hpSyncContextRef.current = null;
                conditionsSyncRef.current = { key: null, hash: null };
                sheetSyncTimerRef.current = null;
                lastSentSheetSnapshotRef.current = { key: null, hash: null };
                companionSyncTimerRef.current = null;
                appliedRemoteCompanionsRef.current = new Map();
                setCurrentRoom(null);
                setRoomData(null);
                setRoomMembers([]);
                setRoomParticipants([]);
                setRoomPlayerSheets([]);
                setOnlinePlayerSheetId(null);
                setPublicCombatants([]);
                setPrivateEnemies([]);
                setPublicEffects([]);
                setPrivateEffects([]);
                setParticipantsHavePendingWrites(false);
                setSharedCharacterId(null);
                setShareCharacterOpen(false);
                setSharingCharacter(false);
                setSheetSyncStatus('idle');
                setOnlineRoomModule('room');
                setEncounterSetupOpen(false);
                setPreparedTurnOrder([]);
                setPostponeOpen(false);
                setEnemyModal({ isOpen: false, mode: 'create', enemyId: null, data: {} });
                setEnemyHpModal({ isOpen: false, enemyId: null, mode: 'damage', amount: '' });
                setFinishEncounterPrompt(false);
                setHpConflict(null);
                setHpSyncStatus('idle');
                setCreatedRoomCode('');
                setRoomInvite({ isOpen: false, code: '', url: '' });
                saveOnlineRoomSession(null);
                setOnlineTableScreen('menu');
            };
            const changeOnlineTableVisibility = (shouldOpen) => {
                if (onlineTableMotionTimerRef.current) window.clearTimeout(onlineTableMotionTimerRef.current);
                const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
                const commitVisibility = () => {
                    if (typeof ReactDOM.flushSync === 'function') ReactDOM.flushSync(() => setOnlineTableOpen(shouldOpen));
                    else setOnlineTableOpen(shouldOpen);
                };
                if (!reducedMotion && typeof document.startViewTransition === 'function') {
                    setOnlineTableMotion('idle');
                    document.startViewTransition(commitVisibility).finished.catch(() => {});
                    return;
                }
                if (!reducedMotion && !shouldOpen && onlineTableOpen) {
                    setOnlineTableMotion('minimizing');
                    onlineTableMotionTimerRef.current = window.setTimeout(() => {
                        setOnlineTableOpen(false);
                        setOnlineTableMotion('idle');
                        onlineTableMotionTimerRef.current = null;
                    }, 260);
                    return;
                }
                setOnlineTableOpen(shouldOpen);
                if (!reducedMotion && shouldOpen) {
                    setOnlineTableMotion('maximizing');
                    onlineTableMotionTimerRef.current = window.setTimeout(() => {
                        setOnlineTableMotion('idle');
                        onlineTableMotionTimerRef.current = null;
                    }, 360);
                } else setOnlineTableMotion('idle');
            };
            const minimizeOnlineTable = () => changeOnlineTableVisibility(false);
            const restoreOnlineTable = () => changeOnlineTableVisibility(true);
            const clampOnlineTableDockPosition = (left, top, width, height) => {
                const margin = 8;
                return {
                    left: Math.max(margin, Math.min(left, Math.max(margin, window.innerWidth - width - margin))),
                    top: Math.max(margin, Math.min(top, Math.max(margin, window.innerHeight - height - margin)))
                };
            };
            const startOnlineTableDockDrag = event => {
                if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
                const rect = event.currentTarget.getBoundingClientRect();
                const startPosition = { left: rect.left, top: rect.top };
                event.currentTarget.setPointerCapture?.(event.pointerId);
                onlineTableDockDragRef.current = {
                    pointerId: event.pointerId,
                    startX: event.clientX,
                    startY: event.clientY,
                    startLeft: rect.left,
                    startTop: rect.top,
                    width: rect.width,
                    height: rect.height,
                    moved: false,
                    suppressClick: false,
                    lastPosition: startPosition
                };
            };
            const moveOnlineTableDock = event => {
                const drag = onlineTableDockDragRef.current;
                if (drag.pointerId !== event.pointerId) return;
                const deltaX = event.clientX - drag.startX;
                const deltaY = event.clientY - drag.startY;
                if (!drag.moved && Math.hypot(deltaX, deltaY) < 5) return;
                event.preventDefault();
                drag.moved = true;
                drag.suppressClick = true;
                drag.lastPosition = clampOnlineTableDockPosition(drag.startLeft + deltaX, drag.startTop + deltaY, drag.width, drag.height);
                setOnlineTableDockDragging(true);
                setOnlineTableDockPosition(drag.lastPosition);
            };
            const finishOnlineTableDockDrag = event => {
                const drag = onlineTableDockDragRef.current;
                if (drag.pointerId !== event.pointerId) return;
                try { event.currentTarget.releasePointerCapture?.(event.pointerId); } catch (error) {}
                if (drag.moved && drag.lastPosition) {
                    try { window.localStorage.setItem('dnd_online_table_dock_position_v1', JSON.stringify(drag.lastPosition)); } catch (error) {}
                }
                drag.pointerId = null;
                setOnlineTableDockDragging(false);
            };
            const activateOnlineTableDock = event => {
                if (onlineTableDockDragRef.current.suppressClick) {
                    event.preventDefault();
                    onlineTableDockDragRef.current.suppressClick = false;
                    return;
                }
                restoreOnlineTable();
            };
            const openOnlineTable = () => {
                setOnlineTableError('');
                setOnlineTableNotice('');
                setOnlineTableScreen(currentRoom ? 'lobby' : 'menu');
                if (currentRoom && !shouldShowEncounter) setOnlineRoomModule('room');
                if (currentRoom) restoreOnlineTable();
                else setOnlineTableOpen(true);
            };
            const openOwnCharacterFromEncounter = () => {
                const localCharacter = getLocalCharacter(ownRoomParticipant?.characterId || sharedCharacterId);
                if (!localCharacter) {
                    setOnlineTableError('No se encontró el personaje compartido en este dispositivo.');
                    return;
                }
                selectCharacter(localCharacter.meta.id);
                minimizeOnlineTable();
            };
            const createOnlineRoom = async () => {
                try {
                    const { db, api, uid } = getOnlineServices();
                    setOnlineTableBusy(true);
                    setOnlineTableError('');
                    let code = '';
                    for (let attempt = 0; attempt < 8 && !code; attempt += 1) {
                        const candidate = createSecureRoomCode();
                        try {
                            await api.runTransaction(db, async transaction => {
                                const campaignRef = api.doc(db, 'campaigns', candidate);
                                if ((await transaction.get(campaignRef)).exists()) throw new Error('ROOM_CODE_COLLISION');
                                transaction.set(campaignRef, {
                                    ownerUid: uid,
                                    name: 'Mesa Online',
                                    status: 'lobby',
                                    schemaVersion: 2,
                                    inviteCode: candidate,
                                    joinEnabled: true,
                                    round: 0,
                                    currentTurnId: null,
                                    turnOrder: [],
                                    turnIndex: 0,
                                    createdAt: api.serverTimestamp(),
                                    updatedAt: api.serverTimestamp()
                                });
                                transaction.set(api.doc(db, 'campaigns', candidate, 'members', uid), {
                                    uid,
                                    role: 'owner',
                                    displayName: 'Máster',
                                    active: true,
                                    blocked: false,
                                    joinedAt: api.serverTimestamp(),
                                    lastSeen: api.serverTimestamp(),
                                    updatedAt: api.serverTimestamp()
                                });
                                transaction.set(api.doc(db, 'users', uid, 'campaigns', candidate), {
                                    campaignId: candidate,
                                    role: 'owner',
                                    active: true,
                                    name: 'Mesa Online',
                                    inviteCode: candidate,
                                    updatedAt: api.serverTimestamp()
                                });
                            });
                            code = candidate;
                        } catch (error) {
                            if (error?.message !== 'ROOM_CODE_COLLISION') throw error;
                        }
                    }
                    if (!code) throw new Error('ROOM_CODE_COLLISION');
                    const session = { code, id: code, collection: 'campaigns', schemaVersion: 2, role: 'master', playerName: '' };
                    saveOnlineRoomSession(session);
                    setCreatedRoomCode(code);
                    setOnlineTableScreen('created');
                    setOnlineTableNotice('Campaña creada. Solo podrán entrar quienes conozcan el código.');
                } catch (error) {
                    setOnlineTableError(error.message === 'No hay conexión con Firebase.' ? error.message : 'No se pudo crear la sala.');
                } finally {
                    setOnlineTableBusy(false);
                }
            };
            const joinOnlineRoom = async (providedCode = roomCodeInput) => {
                const code = normalizeRoomCode(providedCode);
                if (!isSupportedRoomCode(code)) { setOnlineTableError('Código inválido.'); return; }
                try {
                    setOnlineTableBusy(true);
                    setOnlineTableError('');
                    const savedSession = lastOnlineRoom?.code === code ? lastOnlineRoom : null;
                    const membership = await resolveRoomMembership(code, true, playerNameInput, savedSession);
                    activateRoomSession(code, membership);
                    setOnlineReconnectState({ status: 'idle', message: '' });
                    setOnlineTableNotice(membership.role === 'master' ? 'Has vuelto a entrar como Máster.' : 'Te has unido a la sala.');
                } catch (error) {
                    const errorMessages = {
                        ROOM_NOT_FOUND: 'Sala no encontrada.',
                        ROOM_CLOSED: 'Sala cerrada.',
                        MEMBER_NOT_FOUND: 'Ya no eres miembro de esta sala.',
                        MEMBER_BLOCKED: 'El Máster te ha expulsado de esta campaña.',
                        INVALID_MEMBERSHIP: 'La membresía de la sala no es válida.',
                        PLAYER_NAME_REQUIRED: 'Escribe tu nombre de jugador antes de entrar.',
                        'permission-denied': 'Error de permisos al unirse a la sala.'
                    };
                    setOnlineTableError(errorMessages[error.code] || errorMessages[error.message] || (error.message === 'No hay conexión con Firebase.' ? error.message : 'No se pudo unir a la sala.'));
                } finally {
                    setOnlineTableBusy(false);
                }
            };
            const leaveOnlineRoom = async () => {
                if (!currentRoom) return;
                leavingRoomRef.current = true;
                try {
                    const { db, api, uid } = getOnlineServices();
                    const participantRef = activeRoomDoc(api, db, 'participants', uid);
                    if ((await api.getDoc(participantRef)).exists()) await api.updateDoc(participantRef, { connected: false, updatedAt: api.serverTimestamp() });
                    if (currentRoom.collection === 'campaigns') {
                        if (currentRoom.role === 'master') throw new Error('OWNER_MUST_CLOSE');
                        const batch = api.writeBatch(db);
                        batch.update(api.doc(db, 'campaigns', currentRoom.id, 'members', uid), { active: false, lastSeen: api.serverTimestamp(), updatedAt: api.serverTimestamp() });
                        batch.set(api.doc(db, 'users', uid, 'campaigns', currentRoom.id), {
                            campaignId: currentRoom.id,
                            role: 'player',
                            active: false,
                            name: String(roomData?.name || 'Mesa Online').slice(0, 100),
                            inviteCode: currentRoom.code,
                            updatedAt: api.serverTimestamp()
                        });
                        await batch.commit();
                    } else {
                        const leavePayload = { active: false };
                        console.log('[Mesa] Escritura member:', { operation: 'leave-member', roomCode: currentRoom.code, uid, payload: leavePayload });
                        await api.updateDoc(api.doc(db, 'rooms', currentRoom.code, 'members', uid), leavePayload);
                    }
                } catch (error) {
                    console.error('[Mesa] Error member:', error.code, error.message, error);
                    setOnlineTableError('No se pudo salir de la sala.');
                    leavingRoomRef.current = false;
                    return;
                }
                resetOnlineTable();
                leavingRoomRef.current = false;
            };
            const kickRoomPlayer = async (member) => {
                if (!currentRoom || !isCurrentRoomMaster || !member?.uid || member.role === 'master') return;
                const participant = playerRoomParticipants.find(item => item.ownerUid === member.uid);
                const companionIds = companionRoomParticipants.filter(item => item.ownerUid === member.uid).map(item => item.id);
                try {
                    setOnlineTableBusy(true);
                    setOnlineTableError('');
                    const participantId = participant?.id || member.uid;
                    const outcome = await removeCombatantFromTurnOrder({ roomCode: currentRoom.code, combatantId: participantId, additionalCombatantIds: companionIds, reason: 'kicked', removePlayerUid: member.uid });
                    if (currentRoom.collection === 'campaigns') {
                        if (participant?.characterId) await api.deleteDoc(activeRoomDoc(api, db, 'characterSummaries', String(participant.characterId))).catch(() => {});
                        await api.updateDoc(activeRoomDoc(api, db, 'members', member.uid), { active: false, blocked: true, updatedAt: api.serverTimestamp() });
                    }
                    setSelectedCombatantId(previous => previous === participantId || companionIds.includes(previous) ? outcome.currentTurnId : previous);
                    setPreparedTurnOrder(previous => previous.filter(id => id !== participantId && !companionIds.includes(id)));
                    setOnlineTableNotice(`${member.displayName || 'El jugador'} ha sido expulsado de la sala.`);
                } catch (error) {
                    console.error('[Mesa] No se pudo expulsar al jugador.', error);
                    setOnlineTableError('No se pudo expulsar al jugador de la sala.');
                } finally {
                    setOnlineTableBusy(false);
                }
            };
            const confirmKickRoomPlayer = (member) => setConfirmDialog({
                isOpen: true,
                message: `¿Expulsar a ${member.displayName || 'este jugador'}? Se retirarán su personaje y su ficha compartida de esta sala.`,
                onConfirm: () => kickRoomPlayer(member),
                isAlert: false,
                confirmLabel: 'Expulsar jugador',
                confirmTone: 'danger'
            });
            const closeOnlineRoom = async () => {
                if (!currentRoom || roomData?.ownerUid !== firebaseUser?.uid) return;
                try {
                    const { db, api } = getOnlineServices();
                    await api.updateDoc(activeRoomDoc(api, db), { status: 'closed', joinEnabled: false, updatedAt: api.serverTimestamp() });
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
            const copyTextToClipboard = async value => {
                const text = String(value || '');
                if (!text) return false;
                if (navigator.clipboard?.writeText && window.isSecureContext) {
                    try {
                        await navigator.clipboard.writeText(text);
                        return true;
                    } catch (error) {
                        console.warn('[Mesa] Clipboard API no disponible; usando copia compatible.', error);
                    }
                }
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                textarea.style.top = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                textarea.setSelectionRange(0, textarea.value.length);
                let copied = false;
                try { copied = document.execCommand('copy'); }
                catch (error) { console.warn('[Mesa] Copia compatible no disponible.', error); }
                textarea.remove();
                return copied;
            };
            const copyRoomCode = async (value, label = 'Código copiado.') => {
                setOnlineTableError('');
                if (await copyTextToClipboard(value)) {
                    setOnlineTableNotice(label);
                    return true;
                }
                setOnlineTableError(`No se pudo copiar automáticamente. Código: ${value}`);
                return false;
            };
            const shareRoomLink = async (code) => {
                const url = getRoomShareUrl(code);
                setRoomInvite({ isOpen: true, code, url });
                setOnlineTableError('');
            };
            const shareRoomWithSystem = async () => {
                if (!roomInvite.url || !navigator.share) return;
                if (navigator.share) {
                    try {
                        await navigator.share({ title: 'Mesa online D&D', text: `Únete a la sala ${roomInvite.code}`, url: roomInvite.url });
                        setRoomInvite({ isOpen: false, code: '', url: '' });
                        setOnlineTableNotice('Invitación compartida.');
                        return;
                    } catch (error) {
                        if (error?.name === 'AbortError') return;
                        console.warn('[Mesa] Compartir del sistema no disponible.', error);
                        setOnlineTableError('El sistema no pudo abrir el menú de compartir. Elige WhatsApp, Telegram o copia el enlace.');
                    }
                }
            };
            const restoreRoomSession = async (force = false) => {
                if (!lastOnlineRoom?.code || (!force && roomRestoreAttemptedRef.current)) return;
                roomRestoreAttemptedRef.current = true;
                if (lastOnlineRoom.role === 'player' && !isValidOnlinePlayerName(lastOnlineRoom.playerName || playerNameInput)) {
                    setRoomCodeInput(lastOnlineRoom.code);
                    setOnlineTableScreen('join');
                    setOnlineTableOpen(true);
                    setOnlineReconnectState({ status: 'idle', message: '' });
                    setOnlineTableNotice('Confirma tu nombre de jugador para volver a entrar.');
                    return;
                }
                try {
                    setOnlineReconnectState({ status: 'reconnecting', message: 'Reconectando a la mesa…' });
                    const membership = await resolveRoomMembership(lastOnlineRoom.code, false, lastOnlineRoom.playerName || playerNameInput, lastOnlineRoom);
                    activateRoomSession(lastOnlineRoom.code, membership);
                    setOnlineTableOpen(true);
                    setOnlineReconnectState({ status: 'idle', message: '' });
                } catch (error) {
                    console.error('[Mesa] Error al restaurar:', error.code, error);
                    const messageByCode = {
                        ROOM_NOT_FOUND: 'La sala anterior ya no existe.',
                        ROOM_CLOSED: 'La sala anterior fue cerrada.',
                        MEMBER_NOT_FOUND: 'Ya no eres miembro de esta sala.',
                        MEMBER_BLOCKED: 'El Máster te ha expulsado de esta campaña.',
                        INVALID_MEMBERSHIP: 'La membresía de la sala no es válida.',
                        'permission-denied': 'Error de permisos al restaurar la sesión.'
                    };
                    const message = messageByCode[error.code] || messageByCode[error.message];
                    if (message && ['ROOM_NOT_FOUND', 'ROOM_CLOSED', 'MEMBER_NOT_FOUND', 'MEMBER_BLOCKED', 'INVALID_MEMBERSHIP'].includes(error.code || error.message)) {
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

            const loadCloudCampaigns = async () => {
                if (!firebaseReady || !firebaseUser?.uid) return [];
                try {
                    const { db, api } = getOnlineServices();
                    const references = await api.getDocs(api.collection(db, 'users', firebaseUser.uid, 'campaigns'));
                    const active = references.docs
                        .map(item => ({ id: item.id, ...item.data() }))
                        .filter(item => item.active !== false)
                        .sort((left, right) => Number(right.updatedAt?.toMillis?.() || 0) - Number(left.updatedAt?.toMillis?.() || 0));
                    const sessions = [];
                    for (const reference of active) {
                        try {
                            const candidate = await api.getDoc(api.doc(db, 'campaigns', reference.campaignId || reference.id));
                            if (!candidate.exists() || candidate.data().status === 'closed') continue;
                            const member = await api.getDoc(api.doc(db, 'campaigns', candidate.id, 'members', firebaseUser.uid));
                            if (!member.exists() || member.data().active === false || member.data().blocked === true) continue;
                            const role = ['owner', 'master'].includes(member.data().role) ? 'master' : 'player';
                            sessions.push({
                                code: String(candidate.data().inviteCode || '').toUpperCase(),
                                id: candidate.id,
                                collection: 'campaigns',
                                schemaVersion: 2,
                                role,
                                playerName: role === 'player' ? normalizeOnlinePlayerName(member.data().displayName || '') : '',
                                name: String(candidate.data().name || reference.name || 'Campaña'),
                                status: candidate.data().status || 'lobby'
                            });
                        } catch (error) {
                            if (error?.code !== 'permission-denied') throw error;
                        }
                    }
                    setCloudCampaigns(sessions.filter(session => session.code));
                    return sessions.filter(session => session.code);
                } catch (error) {
                    console.warn('[Mesa] No se pudo descubrir la campaña sincronizada.', error);
                    return [];
                }
            };
            const discoverCloudCampaign = async () => {
                if (currentRoom || lastOnlineRoom) return;
                const campaigns = await loadCloudCampaigns();
                if (campaigns[0]) saveOnlineRoomSession(campaigns[0]);
            };
            const openCloudCampaign = async session => {
                if (!session?.code || !session?.id) return;
                if (session.role === 'player' && !isValidOnlinePlayerName(session.playerName)) {
                    saveOnlineRoomSession(session);
                    setRoomCodeInput(session.code);
                    setPlayerNameInput(session.playerName || '');
                    setOnlineTableScreen('join');
                    return;
                }
                try {
                    setOnlineTableBusy(true);
                    setOnlineTableError('');
                    const membership = await resolveRoomMembership(session.code, false, session.playerName || '', session);
                    activateRoomSession(session.code, membership);
                    setOnlineTableNotice('Campaña sincronizada abierta.');
                } catch (error) {
                    setOnlineTableError('No se pudo abrir la campaña sincronizada.');
                } finally {
                    setOnlineTableBusy(false);
                }
            };

            useEffect(() => {
                const roomFromUrl = normalizeRoomCode(new URLSearchParams(window.location.search).get('room'));
                if (!isSupportedRoomCode(roomFromUrl)) return;
                setRoomCodeInput(roomFromUrl);
                setOnlineTableScreen('join');
                setOnlineTableOpen(true);
            }, []);
            useEffect(() => {
                if (!firebaseReady || !firebaseUser?.uid || currentRoom || !lastOnlineRoom?.code) return;
                restoreRoomSession();
            }, [firebaseReady, firebaseUser?.uid, currentRoom, lastOnlineRoom?.code]);
            useEffect(() => {
                if (!firebaseReady || !firebaseUser?.uid || currentRoom || lastOnlineRoom) return;
                discoverCloudCampaign();
            }, [firebaseReady, firebaseUser?.uid, currentRoom, lastOnlineRoom]);
            useEffect(() => {
                if (!firebaseReady || !firebaseUser?.uid) { setCloudCampaigns([]); return; }
                loadCloudCampaigns();
            }, [firebaseReady, firebaseUser?.uid]);
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
            useEffect(() => () => {
                cleanupOnlineTableListeners();
                if (onlineTableMotionTimerRef.current) window.clearTimeout(onlineTableMotionTimerRef.current);
            }, []);
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

        return {
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
        };
    }

    window.DndOnlineTableController = { useOnlineTableController };
})();
