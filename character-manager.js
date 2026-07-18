/* Character profile state and persistence. Depends on window.DndAppUtils. */
(function () {
    const { useState, useEffect } = React;
    const {
        CHARACTER_MANAGER_KEY,
        loadCharacterManager,
        createUniqueCharacterRecord,
        createBlankCharacterData,
        normalizeGrimoireData,
        cloneData,
        isValidPortraitDataUrl
    } = window.DndAppUtils;

        function useCharacterManager() {
            const [manager, setManager] = useState(loadCharacterManager);
            const activeCharacter = manager.characters[manager.activeCharacterId];

            useEffect(() => {
                try { window.localStorage.setItem(CHARACTER_MANAGER_KEY, JSON.stringify(manager)); } catch (error) {}
            }, [manager]);

            const updateActiveData = (update) => {
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

            const duplicateCharacter = (id) => {
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

            const importCharacter = (character) => {
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

            const selectCharacter = (id) => {
                setManager(previous => previous.characters[id] ? { ...previous, activeCharacterId: id } : previous);
            };

            const deleteCharacter = (id) => {
                setManager(previous => {
                    const ids = Object.keys(previous.characters);
                    if (ids.length <= 1 || !previous.characters[id]) return previous;
                    const characters = { ...previous.characters };
                    delete characters[id];
                    const activeCharacterId = previous.activeCharacterId === id ? Object.keys(characters)[0] : previous.activeCharacterId;
                    return { ...previous, activeCharacterId, characters };
                });
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
            const setValue = (update) => updateData(previous => ({ ...previous, [field]: typeof update === 'function' ? update(previous[field]) : update }));
            return [data[field], setValue];
        }


    window.DndCharacterManager = { useCharacterManager, useCharacterField };
}());
