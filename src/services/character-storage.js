/* Character profile state, local cache and owner-only Firestore sync. Depends on window.DndAppUtils. */
(function () {
    const { useState, useEffect, useRef } = React;
    const {
        CHARACTER_MANAGER_KEY,
        CHARACTER_MANAGER_VERSION,
        loadCharacterManager,
        normalizeStoredManager,
        createUniqueCharacterRecord,
        createBlankCharacterData,
        normalizeGrimoireData,
        cloneData,
        isValidPortraitDataUrl
    } = window.DndAppUtils;

    const LEGACY_CLAIM_KEY = 'dnd_character_manager_legacy_claim_v1';
    const currentUid = () => window.firebaseConnectionState?.user?.uid || '';
    const scopedCharacterKey = uid => uid ? `${CHARACTER_MANAGER_KEY}:${uid}` : CHARACTER_MANAGER_KEY;
    const createEmptyManager = () => {
        const record = createUniqueCharacterRecord(createBlankCharacterData(), 'Personaje sin nombre', '', {});
        return { version: CHARACTER_MANAGER_VERSION, activeCharacterId: record.meta.id, characters: { [record.meta.id]: record } };
    };
    const readJson = key => {
        try {
            const raw = window.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    };
    const writeJson = (key, value) => {
        try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
    };
    const loadScopedCharacterManager = uid => {
        if (!uid) return createEmptyManager();
        const scoped = readJson(scopedCharacterKey(uid));
        if (scoped) return normalizeStoredManager(scoped);
        const claimedBy = (() => { try { return window.localStorage.getItem(LEGACY_CLAIM_KEY) || ''; } catch (error) { return ''; } })();
        const legacy = !claimedBy || claimedBy === uid ? readJson(CHARACTER_MANAGER_KEY) : null;
        if (legacy) {
            const migrated = normalizeStoredManager(legacy);
            writeJson(scopedCharacterKey(uid), migrated);
            try { window.localStorage.setItem(LEGACY_CLAIM_KEY, uid); } catch (error) {}
            return migrated;
        }
        return createEmptyManager();
    };
    const moveScopedCharacterCache = (sourceUid, targetUid) => {
        if (!sourceUid || !targetUid || sourceUid === targetUid) return;
        const source = readJson(scopedCharacterKey(sourceUid));
        const target = readJson(scopedCharacterKey(targetUid));
        if (!source) return;
        const sourceManager = normalizeStoredManager(source);
        const targetManager = target ? normalizeStoredManager(target) : null;
        const mergedCharacters = { ...(targetManager?.characters || {}), ...sourceManager.characters };
        const merged = {
            version: CHARACTER_MANAGER_VERSION,
            activeCharacterId: sourceManager.activeCharacterId || targetManager?.activeCharacterId || Object.keys(mergedCharacters)[0],
            characters: mergedCharacters
        };
        writeJson(scopedCharacterKey(targetUid), merged);
        try {
            window.localStorage.removeItem(scopedCharacterKey(sourceUid));
            window.localStorage.setItem(LEGACY_CLAIM_KEY, targetUid);
        } catch (error) {}
    };
    const parseCloudCharacter = snapshot => {
        try {
            const payload = snapshot.data();
            const record = JSON.parse(payload.recordJson);
            if (!record?.meta || !record?.data || String(record.meta.id) !== snapshot.id) return null;
            return { ...record, meta: { ...record.meta, id: snapshot.id } };
        } catch (error) {
            return null;
        }
    };
    const recordUpdatedAt = record => {
        const value = Date.parse(record?.meta?.updatedAt || '');
        return Number.isFinite(value) ? value : 0;
    };

    function useCharacterManager() {
        const uid = currentUid();
        const [manager, setManager] = useState(() => loadScopedCharacterManager(uid));
        const activeCharacter = manager.characters[manager.activeCharacterId];
        const cloudReadyRef = useRef(false);
        const remoteHashesRef = useRef(new Map());
        const uploadTimerRef = useRef(null);
        const pendingDeletesRef = useRef(new Set());

        useEffect(() => {
            writeJson(scopedCharacterKey(uid), manager);
        }, [manager, uid]);

        useEffect(() => {
            if (!uid || !window.firebaseServices?.firestore || !window.firebaseFirestore) return undefined;
            const { firestore } = window.firebaseServices;
            const api = window.firebaseFirestore;
            const charactersQuery = api.query(api.collection(firestore, 'characters'), api.where('ownerUid', '==', uid));
            cloudReadyRef.current = false;
            const unsubscribe = api.onSnapshot(charactersQuery, { includeMetadataChanges: true }, snapshot => {
                const remoteRecords = new Map();
                snapshot.docs.forEach(documentSnapshot => {
                    const record = parseCloudCharacter(documentSnapshot);
                    if (record) remoteRecords.set(documentSnapshot.id, record);
                });
                setManager(previous => {
                    const characters = { ...previous.characters };
                    remoteRecords.forEach((remote, id) => {
                        const local = characters[id];
                        if (!local || recordUpdatedAt(remote) > recordUpdatedAt(local)) characters[id] = remote;
                        remoteHashesRef.current.set(id, JSON.stringify(remote));
                    });
                    if (cloudReadyRef.current) {
                        snapshot.docChanges().filter(change => change.type === 'removed').forEach(change => {
                            if (!pendingDeletesRef.current.has(change.doc.id)) delete characters[change.doc.id];
                        });
                    }
                    const ids = Object.keys(characters);
                    if (!ids.length) {
                        const empty = createEmptyManager();
                        return empty;
                    }
                    return {
                        ...previous,
                        version: CHARACTER_MANAGER_VERSION,
                        activeCharacterId: characters[previous.activeCharacterId] ? previous.activeCharacterId : ids[0],
                        characters
                    };
                });
                cloudReadyRef.current = true;
                window.dispatchEvent(new CustomEvent('character-sync-state', { detail: { status: snapshot.metadata.fromCache ? 'offline' : 'synced' } }));
            }, error => {
                console.warn('[Personajes] Sincronización remota no disponible; se mantiene la copia local.', error);
                window.dispatchEvent(new CustomEvent('character-sync-state', { detail: { status: 'error', error } }));
            });
            return () => {
                cloudReadyRef.current = false;
                unsubscribe();
            };
        }, [uid]);

        useEffect(() => {
            if (!uid || !cloudReadyRef.current || !window.firebaseServices?.firestore || !window.firebaseFirestore) return undefined;
            if (uploadTimerRef.current) window.clearTimeout(uploadTimerRef.current);
            uploadTimerRef.current = window.setTimeout(async () => {
                const { firestore } = window.firebaseServices;
                const api = window.firebaseFirestore;
                const changed = Object.values(manager.characters).filter(record => remoteHashesRef.current.get(record.meta.id) !== JSON.stringify(record));
                if (!changed.length) return;
                try {
                    window.dispatchEvent(new CustomEvent('character-sync-state', { detail: { status: 'syncing' } }));
                    const batch = api.writeBatch(firestore);
                    changed.forEach(record => batch.set(api.doc(firestore, 'characters', record.meta.id), {
                        ownerUid: uid,
                        schemaVersion: 1,
                        name: String(record.meta?.name || record.data?.charInfo?.name || 'Personaje sin nombre').slice(0, 120),
                        recordJson: JSON.stringify(record),
                        clientUpdatedAt: record.meta?.updatedAt || new Date().toISOString(),
                        updatedAt: api.serverTimestamp()
                    }));
                    await batch.commit();
                    changed.forEach(record => remoteHashesRef.current.set(record.meta.id, JSON.stringify(record)));
                    window.dispatchEvent(new CustomEvent('character-sync-state', { detail: { status: 'synced' } }));
                } catch (error) {
                    console.warn('[Personajes] Escritura remota pendiente.', error);
                    window.dispatchEvent(new CustomEvent('character-sync-state', { detail: { status: 'error', error } }));
                }
            }, 900);
            return () => {
                if (uploadTimerRef.current) window.clearTimeout(uploadTimerRef.current);
            };
        }, [manager, uid]);

        useEffect(() => {
            const clear = () => {
                if (uploadTimerRef.current) window.clearTimeout(uploadTimerRef.current);
                cloudReadyRef.current = false;
                remoteHashesRef.current.clear();
            };
            window.addEventListener('firebase-before-signout', clear);
            return () => window.removeEventListener('firebase-before-signout', clear);
        }, []);

        const updateActiveData = update => {
            setManager(previous => {
                const current = previous.characters[previous.activeCharacterId];
                const nextData = typeof update === 'function' ? update(current.data) : update;
                const updatedAt = new Date().toISOString();
                const nextName = nextData.charInfo?.name || 'Personaje sin nombre';
                return {
                    ...previous,
                    characters: {
                        ...previous.characters,
                        [previous.activeCharacterId]: { ...current, meta: { ...current.meta, name: nextName, updatedAt }, data: nextData }
                    }
                };
            });
        };
        const updateCharacterData = (id, update) => {
            setManager(previous => {
                const current = previous.characters[id];
                if (!current) return previous;
                const nextData = typeof update === 'function' ? update(current.data) : update;
                const updatedAt = new Date().toISOString();
                const nextName = nextData.charInfo?.name || 'Personaje sin nombre';
                return { ...previous, characters: { ...previous.characters, [id]: { ...current, meta: { ...current.meta, name: nextName, updatedAt }, data: nextData } } };
            });
        };
        const createCharacter = () => {
            setManager(previous => {
                const record = createUniqueCharacterRecord(createBlankCharacterData(), 'Personaje sin nombre', '', previous.characters);
                return { ...previous, activeCharacterId: record.meta.id, characters: { ...previous.characters, [record.meta.id]: record } };
            });
        };
        const duplicateCharacter = id => {
            setManager(previous => {
                const source = previous.characters[id];
                if (!source) return previous;
                const copyName = `${source.meta.name || 'Personaje'} (copia)`;
                const copyData = normalizeGrimoireData(cloneData(source.data));
                copyData.charInfo = { ...copyData.charInfo, name: copyName };
                const record = createUniqueCharacterRecord(copyData, copyName, source.meta.portrait || '', previous.characters);
                return { ...previous, activeCharacterId: record.meta.id, characters: { ...previous.characters, [record.meta.id]: record } };
            });
        };
        const importCharacter = character => {
            setManager(previous => {
                const usedNames = new Set(Object.values(previous.characters).map(item => item.meta.name.trim().toLocaleLowerCase()));
                const baseName = character.meta.name.trim() || character.data.charInfo?.name.trim() || 'Personaje importado';
                let name = baseName;
                let copyNumber = 2;
                while (usedNames.has(name.toLocaleLowerCase())) {
                    name = `${baseName} (${copyNumber})`;
                    copyNumber += 1;
                }
                const data = normalizeGrimoireData(cloneData(character.data));
                data.charInfo = { ...data.charInfo, name };
                const record = createUniqueCharacterRecord(data, name, character.meta.portrait || '', previous.characters);
                return { ...previous, activeCharacterId: record.meta.id, characters: { ...previous.characters, [record.meta.id]: record } };
            });
        };
        const selectCharacter = id => setManager(previous => previous.characters[id] ? { ...previous, activeCharacterId: id } : previous);
        const deleteCharacter = id => {
            setManager(previous => {
                const ids = Object.keys(previous.characters);
                if (ids.length <= 1 || !previous.characters[id]) return previous;
                const characters = { ...previous.characters };
                delete characters[id];
                const activeCharacterId = previous.activeCharacterId === id ? Object.keys(characters)[0] : previous.activeCharacterId;
                return { ...previous, activeCharacterId, characters };
            });
            if (uid && window.firebaseServices?.firestore && window.firebaseFirestore) {
                pendingDeletesRef.current.add(id);
                const api = window.firebaseFirestore;
                api.deleteDoc(api.doc(window.firebaseServices.firestore, 'characters', id))
                    .then(() => remoteHashesRef.current.delete(id))
                    .catch(error => console.warn('[Personajes] No se pudo eliminar todavía la copia remota.', error))
                    .finally(() => pendingDeletesRef.current.delete(id));
            }
        };
        const setPortrait = (id, portrait) => {
            if (portrait && !isValidPortraitDataUrl(portrait)) return;
            setManager(previous => {
                const character = previous.characters[id];
                if (!character) return previous;
                return { ...previous, characters: { ...previous.characters, [id]: { ...character, meta: { ...character.meta, portrait, updatedAt: new Date().toISOString() } } } };
            });
        };

        return { manager, activeCharacter, updateActiveData, updateCharacterData, createCharacter, duplicateCharacter, importCharacter, selectCharacter, deleteCharacter, setPortrait };
    }

    function useCharacterField(data, updateData, field) {
        const setValue = update => updateData(previous => ({ ...previous, [field]: typeof update === 'function' ? update(previous[field]) : update }));
        return [data[field], setValue];
    }

    window.DndCharacterManager = { useCharacterManager, useCharacterField, loadScopedCharacterManager, moveScopedCharacterCache, scopedCharacterKey };
}());
