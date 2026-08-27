window.DndBestiaryComponents = (() => {
    const BestiaryImportPreviewModal = ({
        preview,
        importMode,
        duplicateMode,
        selectedIds,
        onImportModeChange,
        onDuplicateModeChange,
        onSelectedIdsChange,
        onClose,
        onConfirm
    }) => {
        if (!preview) return null;

        return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4">
                <div className="rpg-panel max-h-[90vh] w-full max-w-xl overflow-y-auto border border-orange-700 p-5">
                    <h3 className="font-fantasy text-lg font-bold text-orange-200">Vista previa de importacion</h3>
                    <p className="mt-2 text-sm text-gray-300">
                        {preview.monsters.length} criaturas validas · {preview.duplicates.length} posibles duplicados · {preview.invalid} invalidas · {preview.monsters.filter(monster => monster.avatarDataUrl).length} con avatar · {Math.ceil(preview.size / 1024)} KB
                    </p>
                    {preview.avatarsRemoved && <p className="mt-2 text-xs text-yellow-200">Los avatares se han excluido por exceder el limite total.</p>}

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <label className="text-sm text-gray-300">
                            Modo
                            <select value={importMode} onChange={event => onImportModeChange(event.target.value)} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white">
                                <option value="merge">Combinar</option>
                                <option value="replace">Reemplazar todo</option>
                            </select>
                        </label>
                        <label className="text-sm text-gray-300">
                            Duplicados
                            <select value={duplicateMode} onChange={event => onDuplicateModeChange(event.target.value)} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white">
                                <option value="skip">Omitir</option>
                                <option value="replace">Reemplazar</option>
                                <option value="copy">Importar como copia</option>
                            </select>
                        </label>
                    </div>

                    <div className="mt-4 max-h-64 space-y-1 overflow-y-auto pr-1">
                        {preview.monsters.map(monster => (
                            <label key={monster.id} className="flex items-center gap-2 rounded border border-gray-700 bg-gray-900/60 px-3 py-2 text-sm text-gray-200">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(monster.id)}
                                    onChange={event => onSelectedIdsChange(previous => event.target.checked ? [...previous, monster.id] : previous.filter(id => id !== monster.id))}
                                />
                                <span className="min-w-0 flex-1 truncate">{monster.name} · PV {monster.maxHp} · CA {monster.armorClass ?? '—'}</span>
                                {preview.duplicates.includes(monster.id) && <span className="text-[10px] text-yellow-200">Duplicado</span>}
                            </label>
                        ))}
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="min-h-10 rounded border border-gray-600 px-3 text-sm text-gray-300">Cancelar</button>
                        <button type="button" onClick={onConfirm} className="min-h-10 rounded border border-orange-700 bg-orange-950/30 px-4 text-sm font-bold text-orange-100">Confirmar importacion</button>
                    </div>
                </div>
            </div>
        );
    };

    const LocalBestiaryModal = ({
        open,
        editor,
        warning,
        notice,
        query,
        tag,
        sort,
        tags,
        monsters,
        avatarInputRef,
        onClose,
        onOpenCompendium,
        onCreate,
        onQueryChange,
        onTagChange,
        onSortChange,
        onUseMonster,
        onEditMonster,
        onDuplicateMonster,
        onDeleteMonster,
        onAvatarChange,
        onEditorChange,
        onPickAvatar,
        onCancelEditor,
        onSaveEditor
    }) => {
        if (!open) return null;

        return (
            <div className="local-bestiary-backdrop" onClick={() => { if (!editor) onClose(); }}>
                <div className="local-bestiary" onClick={event => event.stopPropagation()}>
                    <div className="local-bestiary-header">
                        <div>
                            <small>Biblioteca personal</small><h3>Mis criaturas</h3>
                            <p>Variantes guardadas, plantillas propias e importaciones.</p>
                        </div>
                        <div>
                            <button type="button" onClick={onOpenCompendium}>Compendio SRD</button>
                            <button type="button" onClick={onCreate} className="is-primary">+ Nueva criatura</button>
                            <button type="button" onClick={onClose} className="local-bestiary-close" aria-label="Cerrar Mis criaturas">×</button>
                        </div>
                    </div>

                    {(warning || notice) && <p className="mt-3 rounded border border-yellow-800 bg-yellow-950/30 px-3 py-2 text-xs text-yellow-100">{notice || warning}</p>}

                    {!editor ? (
                        <>
                            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                                <input value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Buscar criatura o etiqueta" className="min-h-10 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white" />
                                <select value={tag} onChange={event => onTagChange(event.target.value)} className="min-h-10 rounded border border-gray-600 bg-gray-950 px-2 text-sm text-white">
                                    <option value="">Todas las etiquetas</option>
                                    {tags.map(item => <option key={item} value={item}>{item}</option>)}
                                </select>
                                <select value={sort} onChange={event => onSortChange(event.target.value)} className="min-h-10 rounded border border-gray-600 bg-gray-950 px-2 text-sm text-white">
                                    <option value="name">Nombre</option>
                                    <option value="updated">Actualizacion</option>
                                </select>
                            </div>

                            <div className="local-bestiary-list">
                                {monsters.map(monster => (
                                    <div key={monster.id} className="local-bestiary-card">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded border border-orange-700 bg-orange-950/30 text-sm font-bold text-orange-100">
                                            {monster.avatarDataUrl ? <img src={monster.avatarDataUrl} alt="" className="h-full w-full object-cover" /> : monster.name.slice(0, 1).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <strong className="block truncate text-sm text-white">{monster.name}</strong>
                                            <span className="text-xs text-gray-400">PV {monster.maxHp} · CA {monster.armorClass ?? '—'}</span>
                                            {monster.tags.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{monster.tags.map(item => <span key={item} className="rounded border border-orange-900 px-1.5 py-0.5 text-[10px] text-orange-200">{item}</span>)}</div>}
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            <button type="button" onClick={() => onUseMonster(monster)} className="min-h-9 rounded border border-orange-700 px-2 text-[10px] text-orange-100">Usar</button>
                                            <button type="button" onClick={() => onEditMonster(monster)} className="min-h-9 rounded border border-gray-600 px-2 text-[10px] text-gray-200">Editar</button>
                                            <button type="button" onClick={() => onDuplicateMonster(monster.id)} className="min-h-9 rounded border border-purple-700 px-2 text-[10px] text-purple-100">Duplicar</button>
                                            <button type="button" onClick={() => onDeleteMonster(monster)} className="min-h-9 rounded border border-red-800 px-2 text-[10px] text-red-100">Eliminar</button>
                                        </div>
                                    </div>
                                ))}
                                {!monsters.length && <p className="py-8 text-center text-sm text-gray-500">No hay criaturas que coincidan.</p>}
                            </div>
                        </>
                    ) : (
                        <div className="mt-4 flex-1 overflow-y-auto pr-1">
                            <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onAvatarChange} className="hidden" />
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <label className="text-sm text-gray-300">Nombre<input autoFocus value={editor.name} onChange={event => onEditorChange(previous => ({ ...previous, name: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                                <label className="text-sm text-gray-300">PV maximos<input type="number" min="0" value={editor.maxHp} onChange={event => onEditorChange(previous => ({ ...previous, maxHp: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                                <label className="text-sm text-gray-300">CA<input type="number" min="0" value={editor.armorClass ?? ''} onChange={event => onEditorChange(previous => ({ ...previous, armorClass: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                                <label className="text-sm text-gray-300">Estado visible<select value={editor.defaultVisibleStateMode} onChange={event => onEditorChange(previous => ({ ...previous, defaultVisibleStateMode: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="automatic">Automatico</option><option value="manual">Manual</option><option value="hidden">Oculto</option></select></label>
                                {editor.defaultVisibleStateMode === 'manual' && <label className="text-sm text-gray-300">Estado manual<input value={editor.defaultManualVisibleState || ''} onChange={event => onEditorChange(previous => ({ ...previous, defaultManualVisibleState: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>}
                                <label className="text-sm text-gray-300">Etiquetas<input value={editor.tags.join(', ')} onChange={event => onEditorChange(previous => ({ ...previous, tags: event.target.value.split(',').map(item => item.trim()).filter(Boolean) }))} placeholder="no-muerto, bosque" className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                            </div>
                            <label className="mt-3 block text-sm text-gray-300">Condiciones publicas iniciales<input value={editor.defaultPublicConditions.map(item => typeof item === 'string' ? item : item.name).join(', ')} onChange={event => onEditorChange(previous => ({ ...previous, defaultPublicConditions: event.target.value.split(',').map(item => item.trim()).filter(Boolean) }))} placeholder="envenenado, invisible" className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                            <label className="mt-3 block text-sm text-gray-300">Notas privadas<textarea value={editor.privateNotes} onChange={event => onEditorChange(previous => ({ ...previous, privateNotes: event.target.value }))} className="mt-1 min-h-24 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                            <div className="mt-3 flex items-center gap-3">
                                {editor.avatarDataUrl ? <img src={editor.avatarDataUrl} alt="" className="h-12 w-12 rounded border border-orange-700 object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded border border-gray-700 text-orange-200">?</span>}
                                <button type="button" onClick={onPickAvatar} className="min-h-10 rounded border border-orange-700 px-3 text-xs text-orange-100">Avatar</button>
                                {editor.avatarDataUrl && <button type="button" onClick={() => onEditorChange(previous => ({ ...previous, avatarDataUrl: '' }))} className="min-h-10 rounded border border-red-800 px-3 text-xs text-red-100">Quitar</button>}
                            </div>
                            <div className="mt-5 flex justify-end gap-2">
                                <button type="button" onClick={onCancelEditor} className="min-h-10 rounded border border-gray-600 px-3 text-sm text-gray-300">Cancelar</button>
                                <button type="button" onClick={onSaveEditor} className="min-h-10 rounded border border-orange-700 bg-orange-950/30 px-4 text-sm font-bold text-orange-100">Guardar plantilla</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const SrdMonsterCompendiumModal = ({
        open,
        compendium,
        localMonsters,
        query,
        type,
        challenge,
        preview,
        onClose,
        onQueryChange,
        onTypeChange,
        onChallengeChange,
        onPreviewChange,
        onAddMonster,
        canUseInTable,
        onUseMonster,
        onOpenLocalBestiary,
        getMonsterIcon = () => ''
    }) => {
        const [expandedMonsterArt, setExpandedMonsterArt] = React.useState(false);
        React.useEffect(() => { setExpandedMonsterArt(false); }, [preview?.id, open]);
        if (!open) return null;

        const normalizedQuery = query.trim().toLocaleLowerCase('es');
        const types = [...new Set(compendium.monsters.map(monster => monster.details?.type).filter(Boolean))].sort((left, right) => left.localeCompare(right, 'es'));
        const challenges = [...new Set(compendium.monsters.map(monster => monster.details?.challengeRating).filter(Boolean))].sort((left, right) => Number.parseFloat(left) - Number.parseFloat(right));
        const matches = compendium.monsters
            .filter(monster => (
                (!normalizedQuery || monster.name.toLocaleLowerCase('es').includes(normalizedQuery) || monster.details?.type?.toLocaleLowerCase('es').includes(normalizedQuery)) &&
                (!type || monster.details?.type === type) &&
                (!challenge || monster.details?.challengeRating === challenge)
            ))
            .slice()
            .sort((left, right) => left.name.localeCompare(right.name, 'es'));
        const details = preview?.details || {};
        const statEntries = [['FUE', details.abilities?.str], ['DES', details.abilities?.dex], ['CON', details.abilities?.con], ['INT', details.abilities?.int], ['SAB', details.abilities?.wis], ['CAR', details.abilities?.cha]];
        const added = monster => localMonsters.some(item => item.compendiumSource === monster.id);

        return (
            <>
                <div className="monster-compendium-backdrop" onClick={onClose}>
                    <div className="monster-compendium" onClick={event => event.stopPropagation()}>
                        <header className="monster-compendium-header">
                            <div className="monster-compendium-title"><span aria-hidden="true"><i></i><b>♜</b></span><div><small>SRD 5.1 · Biblioteca de encuentro</small><h3>Compendio de criaturas</h3><p>Consulta fichas, guarda variantes o prepara enemigos directamente para la Mesa Online.</p></div></div>
                            <div className="monster-compendium-header-actions"><button type="button" onClick={onOpenLocalBestiary}><span>{localMonsters.length}</span> Mis criaturas</button><button type="button" onClick={onClose} className="monster-compendium-close" aria-label="Cerrar compendio">×</button></div>
                        </header>
                        <div className="monster-compendium-status"><span><b>{compendium.monsters.length}</b> criaturas SRD</span><span><b>{localMonsters.length}</b> guardadas</span><span className={canUseInTable ? 'is-online' : ''}><i></i>{canUseInTable ? 'Máster conectado' : 'Mesa no disponible'}</span></div>
                        <div className="monster-compendium-filters">
                            <label className="monster-compendium-search"><span>⌕</span><input value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Buscar por nombre o tipo..." /></label>
                            <label><span>Tipo</span><select value={type} onChange={event => onTypeChange(event.target.value)}><option value="">Todos</option>{types.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
                            <label><span>Desafío</span><select value={challenge} onChange={event => onChallengeChange(event.target.value)}><option value="">Todos</option>{challenges.map(item => <option key={item} value={item}>CR {item}</option>)}</select></label>
                        </div>
                        <div className="monster-compendium-results">
                            <div className="monster-compendium-results-heading"><p><b>{matches.length}</b> resultados</p><span>Selecciona una criatura para consultar su ficha completa.</span></div>
                            <div className="monster-compendium-grid">
                                {matches.map(monster => (
                                    <article key={monster.id} className={`monster-compendium-card ${getMonsterIcon(monster) ? 'has-monster-art' : ''} ${added(monster) ? 'is-saved' : ''}`}>
                                        <header><span className="monster-compendium-card-mark">{getMonsterIcon(monster) ? <img src={getMonsterIcon(monster)} alt="" loading="lazy" /> : monster.name.slice(0,1).toUpperCase()}</span><div><small>{monster.details?.type || 'Criatura'} · CR {String(monster.details?.challengeRating || '—').split(' ')[0]}</small><strong>{monster.name}</strong><p>{monster.details?.subtitle || `${monster.details?.size || ''} ${monster.details?.type || ''}`.trim()}</p></div>{added(monster) && <i>Guardada</i>}</header>
                                        <div className="monster-compendium-card-stats"><span><small>Desafío</small><strong>{String(monster.details?.challengeRating || '—').split(' ')[0]}</strong></span><span><small>Vida</small><strong>{monster.maxHp}</strong></span><span><small>Defensa</small><strong>{monster.armorClass}</strong></span></div>
                                        <footer><button type="button" onClick={() => onPreviewChange(monster)}>Consultar</button><button type="button" disabled={added(monster)} onClick={() => onAddMonster(monster)}>{added(monster) ? 'Guardada' : 'Guardar'}</button>{canUseInTable && <button type="button" className="is-table" onClick={() => onUseMonster(monster)}><span>＋</span> Usar en mesa</button>}</footer>
                                    </article>
                                ))}
                            </div>
                            {!matches.length && <div className="monster-compendium-empty"><span>⌕</span><strong>Sin coincidencias</strong><p>Prueba con otro nombre, tipo o valor de desafío.</p></div>}
                        </div>
                        <p className="monster-compendium-attribution">{compendium.attribution}</p>
                    </div>
                </div>

                {preview && <div className="monster-preview-backdrop" onClick={() => onPreviewChange(null)}>
                    <div className="monster-preview" onClick={event => event.stopPropagation()}>
                        <header className={`monster-preview-header ${getMonsterIcon(preview) ? 'has-monster-art' : ''}`}>{getMonsterIcon(preview) && <button type="button" className="monster-preview-portrait" onClick={() => setExpandedMonsterArt(true)} aria-label={`Ampliar imagen de ${preview.name}`}><img src={getMonsterIcon(preview)} alt={`Icono de ${preview.name}`} /><span>Ampliar</span></button>}<div><small>SRD 5.1 · Expediente de criatura</small><h4>{preview.name}</h4><p>{details.subtitle || `${details.size || ''} ${details.type || ''}`.trim()}</p><div className="monster-preview-tags"><span>CR {String(details.challengeRating || '—').split(' ')[0]}</span><span>{details.type || 'Criatura'}</span>{added(preview) && <span className="is-saved">Guardada</span>}</div></div><button type="button" className="monster-preview-close" onClick={() => onPreviewChange(null)} aria-label="Cerrar ficha">×</button></header>
                        <div className="monster-preview-body">
                            <section className="monster-preview-vitals"><div className="is-armor"><span>Clase de armadura</span><strong>{preview.armorClass}</strong><small>{details.armorText || 'Defensa'}</small></div><div className="is-health"><span>Puntos de golpe</span><strong>{preview.maxHp}</strong><small>{details.hitDice || '—'}</small></div><div className="is-speed"><span>Movimiento</span><strong>{details.speedText || Object.entries(details.speed || {}).filter(([, value]) => value !== null && value !== undefined).map(([kind, value]) => `${kind} ${value} ft.`).join(' · ') || '—'}</strong><small>Velocidad</small></div></section>
                            {statEntries.some(([, value]) => value !== undefined) && <section className="monster-preview-abilities">{statEntries.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value ?? '—'}</strong></div>)}</section>}
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">{details.senses && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Sentidos:</strong> {details.senses}</p>}{details.languages && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Idiomas:</strong> {details.languages}</p>}{details.resistances && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Resistencias:</strong> {details.resistances}</p>}{details.immunities && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Inmunidades:</strong> {details.immunities}</p>}{details.skills && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Habilidades:</strong> {details.skills}</p>}{details.saves && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Salvaciones:</strong> {details.saves}</p>}{details.vulnerabilities && <p className="rounded border border-red-900 bg-red-950/20 p-3 text-xs text-gray-300"><strong className="text-red-100">Vulnerabilidades:</strong> {details.vulnerabilities}</p>}{details.conditionImmunities && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Inmunidades de condición:</strong> {details.conditionImmunities}</p>}</div>
                            <div className="monster-preview-sections">{[['Rasgos', details.traits, 'traits'], ['Acciones', details.actions, 'actions'], ['Acciones adicionales', details.bonusActions, 'actions'], ['Reacciones', details.reactions, 'reactions'], ['Acciones legendarias', details.legendaryActions, 'legendary']].map(([title, entries, tone]) => Array.isArray(entries) && entries.length > 0 && <section key={title} className={`monster-preview-section is-${tone}`}><h5><span></span>{title}<small>{entries.length}</small></h5><div>{entries.map((entry, index) => <article key={`${entry?.name || title}-${index}`}><header><strong>{entry?.name || 'Detalle'}</strong>{Array.isArray(entry?.dice) && entry.dice.length > 0 && <div>{entry.dice.map((die, dieIndex) => <span key={`${die}-${dieIndex}`}>{die}</span>)}</div>}</header><p>{entry?.desc || ''}</p></article>)}</div></section>)}</div>
                        </div>
                        <footer className="monster-preview-actions"><button type="button" onClick={() => onPreviewChange(null)}>Volver</button><button type="button" disabled={added(preview)} onClick={() => onAddMonster(preview)}>{added(preview) ? 'Guardada en mis criaturas' : 'Guardar en mis criaturas'}</button>{canUseInTable && <button type="button" className="is-table" onClick={() => onUseMonster(preview)}>＋ Usar en mesa</button>}</footer>
                    </div>
                </div>}
                {preview && expandedMonsterArt && getMonsterIcon(preview) && <div className="monster-art-viewer" onClick={() => setExpandedMonsterArt(false)}><button type="button" onClick={() => setExpandedMonsterArt(false)} aria-label="Cerrar imagen ampliada">×</button><figure onClick={event => event.stopPropagation()}><img src={getMonsterIcon(preview)} alt={`Ilustración ampliada de ${preview.name}`} /><figcaption><strong>{preview.name}</strong><span>{details.subtitle || details.type || 'Criatura'}</span></figcaption></figure></div>}
            </>
        );
    };

    return { BestiaryImportPreviewModal, LocalBestiaryModal, SrdMonsterCompendiumModal };
})();
