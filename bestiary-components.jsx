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
            <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/85 p-4" onClick={() => { if (!editor) onClose(); }}>
                <div className="rpg-panel flex max-h-[92vh] w-full max-w-3xl flex-col border border-orange-700 p-4 sm:p-5" onClick={event => event.stopPropagation()}>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700 pb-3">
                        <div>
                            <h3 className="font-fantasy text-xl font-bold uppercase tracking-wider text-orange-200">Bestiario</h3>
                            <p className="mt-1 text-xs text-gray-500">Biblioteca local de plantillas. No se sincroniza con salas.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={onOpenCompendium} className="min-h-10 rounded border border-cyan-700 bg-cyan-950/30 px-3 text-xs text-cyan-100">Compendio de criaturas</button>
                            <button type="button" onClick={onCreate} className="min-h-10 rounded border border-orange-700 bg-orange-950/30 px-3 text-xs text-orange-100">+ Nueva criatura</button>
                            <button type="button" onClick={onClose} className="h-10 w-10 rounded border border-gray-600 text-xl text-gray-200" aria-label="Cerrar Bestiario">×</button>
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

                            <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
                                {monsters.map(monster => (
                                    <div key={monster.id} className="flex flex-wrap items-center gap-3 rounded border border-gray-700 bg-gray-900/60 p-3">
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
        onAddMonster
    }) => {
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
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-3 sm:p-4" onClick={onClose}>
                    <div className="rpg-panel flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden border border-cyan-700" onClick={event => event.stopPropagation()}>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/70 px-4 py-3 sm:px-5 sm:py-4">
                            <div><h3 className="font-fantasy text-xl font-bold uppercase tracking-wider text-cyan-100">Compendio de criaturas</h3><p className="mt-1 text-xs text-gray-400">{compendium.monsters.length} criaturas del SRD 5.1. Anade solo las que quieras a tu Bestiario local.</p></div>
                            <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded border border-gray-600 text-xl text-gray-200" aria-label="Cerrar compendio">×</button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 border-b border-gray-700 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_10rem_10rem] sm:px-5">
                            <input value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Buscar criatura o tipo" className="min-h-11 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white" />
                            <select value={type} onChange={event => onTypeChange(event.target.value)} className="min-h-11 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white"><option value="">Todos los tipos</option>{types.map(item => <option key={item} value={item}>{item}</option>)}</select>
                            <select value={challenge} onChange={event => onChallengeChange(event.target.value)} className="min-h-11 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white"><option value="">Todos los desafios</option>{challenges.map(item => <option key={item} value={item}>CR {item}</option>)}</select>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                            <p className="mb-3 text-xs text-gray-500">{matches.length} resultados. Las criaturas ya añadidas muestran su estado.</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {matches.map(monster => (
                                    <article key={monster.id} className="flex h-full flex-col rounded border border-gray-700 bg-gray-900/65 p-3">
                                        <div className="flex min-h-[3.75rem] items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{monster.name}</strong><span className="mt-1 block text-xs text-gray-400">{monster.details?.subtitle || `${monster.details?.size || ''} ${monster.details?.type || ''}`.trim()}</span></div>
                                            <div className="grid shrink-0 grid-cols-3 gap-1.5 text-center">
                                                <span className="flex min-w-11 flex-col rounded border border-purple-700 bg-purple-950/35 px-1.5 py-1"><small className="text-[9px] font-bold uppercase text-purple-300">CR</small><strong className="text-sm text-purple-100">{String(monster.details?.challengeRating || '—').split(' ')[0]}</strong></span>
                                                <span className="flex min-w-11 flex-col rounded border border-red-800 bg-red-950/25 px-1.5 py-1"><small className="text-[9px] font-bold uppercase text-red-300">PV</small><strong className="text-sm text-red-100">{monster.maxHp}</strong></span>
                                                <span className="flex min-w-11 flex-col rounded border border-cyan-800 bg-cyan-950/25 px-1.5 py-1"><small className="text-[9px] font-bold uppercase text-cyan-300">CA</small><strong className="text-sm text-cyan-100">{monster.armorClass}</strong></span>
                                            </div>
                                        </div>
                                        <div className="mt-auto grid grid-cols-2 gap-2 pt-3"><button type="button" onClick={() => onPreviewChange(monster)} className="min-h-10 rounded border border-gray-600 px-3 text-xs text-gray-200">Ver ficha</button><button type="button" disabled={added(monster)} onClick={() => onAddMonster(monster)} className="min-h-10 rounded border border-cyan-700 bg-cyan-950/30 px-3 text-xs font-bold text-cyan-100 disabled:cursor-default disabled:border-gray-700 disabled:text-gray-500">{added(monster) ? 'Ya añadida' : 'Añadir al Bestiario'}</button></div>
                                    </article>
                                ))}
                            </div>
                            {!matches.length && <p className="py-10 text-center text-sm text-gray-500">No hay criaturas que coincidan con los filtros.</p>}
                        </div>
                        <p className="border-t border-gray-700 px-4 py-3 text-[10px] leading-relaxed text-gray-500 sm:px-5">{compendium.attribution}</p>
                    </div>
                </div>

                {preview && <div className="fixed inset-0 z-[81] flex items-center justify-center bg-black/90 p-3 sm:p-4" onClick={() => onPreviewChange(null)}>
                    <div className="rpg-panel flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden border border-cyan-600" onClick={event => event.stopPropagation()}>
                        <div className="flex items-start justify-between gap-3 border-b border-cyan-900/70 px-4 py-3 sm:px-5 sm:py-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">SRD 5.1 · CR {details.challengeRating}</p><h4 className="mt-1 font-fantasy text-xl font-bold text-white">{preview.name}</h4><p className="mt-1 text-sm text-gray-400">{details.subtitle || `${details.size || ''} ${details.type || ''}`.trim()}</p></div><button type="button" onClick={() => onPreviewChange(null)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-600 text-xl text-gray-200" aria-label="Cerrar ficha">×</button></div>
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                            <div className="grid gap-2 sm:grid-cols-3"><div className="rounded border border-cyan-800 bg-cyan-950/20 p-3"><span className="text-[10px] uppercase text-gray-400">Defensa</span><strong className="mt-1 block text-lg text-cyan-100">CA {preview.armorClass}</strong></div><div className="rounded border border-red-900 bg-red-950/20 p-3"><span className="text-[10px] uppercase text-gray-400">Puntos de golpe</span><strong className="mt-1 block text-lg text-red-100">{preview.maxHp} <small className="text-xs font-normal text-gray-400">({details.hitDice || '—'})</small></strong></div><div className="rounded border border-gray-700 bg-gray-950/40 p-3"><span className="text-[10px] uppercase text-gray-400">Velocidad</span><strong className="mt-1 block text-sm text-white">{details.speedText || Object.entries(details.speed || {}).filter(([, value]) => value !== null && value !== undefined).map(([kind, value]) => `${kind} ${value} ft.`).join(' · ') || '—'}</strong></div></div>
                            {statEntries.some(([, value]) => value !== undefined) && <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">{statEntries.map(([label, value]) => <div key={label} className="rounded border border-gray-700 bg-gray-950/40 px-2 py-2 text-center"><span className="block text-[9px] uppercase text-gray-500">{label}</span><strong className="text-sm text-white">{value ?? '—'}</strong></div>)}</div>}
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">{details.senses && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Sentidos:</strong> {details.senses}</p>}{details.languages && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Idiomas:</strong> {details.languages}</p>}{details.resistances && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Resistencias:</strong> {details.resistances}</p>}{details.immunities && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Inmunidades:</strong> {details.immunities}</p>}{details.skills && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Habilidades:</strong> {details.skills}</p>}{details.saves && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Salvaciones:</strong> {details.saves}</p>}{details.vulnerabilities && <p className="rounded border border-red-900 bg-red-950/20 p-3 text-xs text-gray-300"><strong className="text-red-100">Vulnerabilidades:</strong> {details.vulnerabilities}</p>}{details.conditionImmunities && <p className="rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"><strong className="text-gray-100">Inmunidades de condición:</strong> {details.conditionImmunities}</p>}</div>
                            <div className="mt-4 space-y-3">{[['Rasgos', details.traits, 'border-purple-800'], ['Acciones', details.actions, 'border-orange-800'], ['Acciones adicionales', details.bonusActions, 'border-orange-800'], ['Reacciones', details.reactions, 'border-orange-800'], ['Acciones legendarias', details.legendaryActions, 'border-yellow-800']].map(([title, entries, accent]) => Array.isArray(entries) && entries.length > 0 && <section key={title} className={`rounded border ${accent} bg-gray-950/45 p-3`}><h5 className="text-xs font-bold uppercase tracking-wider text-gray-200">{title}</h5><div className="mt-2 space-y-2">{entries.map((entry, index) => <article key={`${entry?.name || title}-${index}`} className="rounded border border-gray-700 bg-gray-900/70 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-white">{entry?.name || 'Detalle'}</strong>{Array.isArray(entry?.dice) && entry.dice.length > 0 && <div className="flex flex-wrap gap-1">{entry.dice.map((die, dieIndex) => <span key={`${die}-${dieIndex}`} className="rounded border border-orange-800 bg-orange-950/30 px-1.5 py-0.5 font-mono text-[11px] font-bold text-orange-100">{die}</span>)}</div>}</div><p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-gray-300">{entry?.desc || ''}</p></article>)}</div></section>)}</div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-700 px-4 py-3 sm:px-5"><button type="button" onClick={() => onPreviewChange(null)} className="min-h-11 rounded border border-gray-600 px-4 text-sm text-gray-300">Volver</button><button type="button" disabled={added(preview)} onClick={() => onAddMonster(preview)} className="min-h-11 rounded border border-cyan-700 bg-cyan-950/30 px-4 text-sm font-bold text-cyan-100 disabled:border-gray-700 disabled:text-gray-500">Añadir al Bestiario</button></div>
                    </div>
                </div>}
            </>
        );
    };

    return { BestiaryImportPreviewModal, LocalBestiaryModal, SrdMonsterCompendiumModal };
})();
