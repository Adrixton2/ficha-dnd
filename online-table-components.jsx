/* Presentation-only components for Mesa Online. */
const { isValidPortraitDataUrl } = window.DndAppUtils;

const OnlineCombatantAvatar = ({ combatant, className = '', onAvatarPreview }) => {
    const name = combatant?.name || 'Combatiente';
    const initial = name.trim().slice(0, 1).toUpperCase() || '?';
    const hasAvatar = isValidPortraitDataUrl(combatant?.avatarDataUrl);
    const isDetailAvatar = className.split(/\s+/).includes('h-20');

    if (hasAvatar && isDetailAvatar) {
        return (
            <button
                type="button"
                onClick={() => onAvatarPreview?.({ name, src: combatant.avatarDataUrl })}
                className={`online-combatant-avatar overflow-hidden object-cover cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300 ${className}`}
                aria-label={`Ampliar avatar de ${name}`}
            >
                <img src={combatant.avatarDataUrl} alt="" className="h-full w-full object-cover" />
            </button>
        );
    }

    return hasAvatar
        ? <img src={combatant.avatarDataUrl} alt="" className={`online-combatant-avatar object-cover ${className}`} />
        : <span aria-hidden="true" className={`online-combatant-avatar online-combatant-avatar--fallback ${className}`}>{initial}</span>;
};

const EnemyModal = ({ modal, onChange, onClose, onSave }) => {
    if (!modal?.isOpen) return null;

    const updateData = (changes) => onChange(previous => ({
        ...previous,
        data: { ...previous.data, ...changes }
    }));
    const close = () => onClose();

    return (
        <div className="fixed inset-0 z-[72] flex items-center justify-center bg-black/80 p-4" onClick={close}>
            <div className="rpg-panel max-h-[90vh] w-full max-w-lg overflow-y-auto border border-orange-700 p-5" onClick={event => event.stopPropagation()}>
                <div className="flex items-center justify-between gap-3">
                    <h3 className="font-fantasy text-lg font-bold text-orange-200">
                        {modal.mode === 'create' ? 'Añadir enemigo' : 'Editar enemigo'}
                    </h3>
                    <button type="button" onClick={close} className="h-9 w-9 rounded border border-gray-600 text-gray-300">×</button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm text-gray-300">
                        Nombre
                        <input
                            autoFocus
                            value={modal.data.name || ''}
                            onChange={event => updateData({ name: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        />
                    </label>
                    <label className="text-sm text-gray-300">
                        Iniciativa
                        <input
                            type="number"
                            value={modal.data.initiative ?? ''}
                            onChange={event => updateData({ initiative: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        />
                    </label>
                    <label className="text-sm text-gray-300">
                        Vida actual
                        <input
                            type="number"
                            min="0"
                            value={modal.data.currentHp ?? 0}
                            onChange={event => updateData({ currentHp: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        />
                    </label>
                    <label className="text-sm text-gray-300">
                        Vida máxima
                        <input
                            type="number"
                            min="0"
                            value={modal.data.maxHp ?? 0}
                            onChange={event => updateData({ maxHp: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        />
                    </label>
                    <label className="text-sm text-gray-300">
                        Vida temporal
                        <input
                            type="number"
                            min="0"
                            value={modal.data.tempHp ?? 0}
                            onChange={event => updateData({ tempHp: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        />
                    </label>
                    <label className="text-sm text-gray-300">
                        CA
                        <input
                            type="number"
                            min="0"
                            value={modal.data.armorClass ?? ''}
                            onChange={event => updateData({ armorClass: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        />
                    </label>
                    <label className="text-sm text-gray-300">
                        Estado visible
                        <select
                            value={modal.data.visibleStateMode || 'automatic'}
                            onChange={event => updateData({ visibleStateMode: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        >
                            <option value="automatic">Automática</option>
                            <option value="manual">Manual</option>
                            <option value="hidden">Oculta</option>
                        </select>
                    </label>
                    {modal.data.visibleStateMode === 'manual' && (
                        <label className="text-sm text-gray-300">
                            Estado manual
                            <select
                                value={modal.data.manualVisibleState || 'herido'}
                                onChange={event => updateData({ manualVisibleState: event.target.value })}
                                className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                            >
                                <option value="intacto">Intacto</option>
                                <option value="herido">Herido</option>
                                <option value="muy-herido">Muy herido</option>
                                <option value="derrotado">Derrotado</option>
                                <option value="oculto">Oculto</option>
                            </select>
                        </label>
                    )}
                </div>

                <label className="mt-3 block text-sm text-gray-300">
                    Notas privadas
                    <textarea
                        value={modal.data.notes || ''}
                        onChange={event => updateData({ notes: event.target.value })}
                        className="mt-1 min-h-20 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                    />
                </label>

                <p className="mt-2 text-xs text-orange-200">
                    Vista pública: {window.DndOnlineTableUtils.calculateEnemyVisibleState(
                        modal.data.currentHp,
                        modal.data.maxHp,
                        modal.data.visibleStateMode,
                        modal.data.manualVisibleState
                    )}
                </p>

                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={close} className="min-h-10 px-3 rounded border border-gray-600 text-sm text-gray-300">Cancelar</button>
                    <button type="button" onClick={onSave} className="min-h-10 px-4 rounded border border-orange-600 bg-orange-800 text-sm font-bold text-white">Guardar enemigo</button>
                </div>
            </div>
        </div>
    );
};

const OnlineConditionModal = ({ modal, conditions, onChange, onClose, onSave }) => {
    if (!modal?.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[72] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div className="rpg-panel w-full max-w-sm border border-purple-700 p-5" onClick={event => event.stopPropagation()}>
                <h3 className="font-fantasy text-lg text-purple-200">Añadir condición</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                    {conditions.map(name => (
                        <button key={name} type="button" onClick={() => onChange(previous => ({ ...previous, name }))} className={`min-h-9 px-2 rounded border text-xs ${modal.name === name ? 'border-purple-400 bg-purple-950/50 text-purple-100' : 'border-gray-700 text-gray-300'}`}>{name}</button>
                    ))}
                </div>
                <label className="mt-4 block text-sm text-gray-300">Personalizada<input value={modal.name} onChange={event => onChange(previous => ({ ...previous, name: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                <label className="mt-3 block text-sm text-gray-300">Fuente<input value={modal.source} onChange={event => onChange(previous => ({ ...previous, source: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                {modal.target?.type !== 'enemy' && <label className="mt-3 block text-sm text-gray-300">Notas<input value={modal.notes} onChange={event => onChange(previous => ({ ...previous, notes: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>}
                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="min-h-10 px-3 rounded border border-gray-600 text-gray-300">Cancelar</button>
                    <button type="button" onClick={onSave} className="min-h-10 px-3 rounded border border-purple-700 text-purple-100">Guardar</button>
                </div>
            </div>
        </div>
    );
};

const OnlineEffectModal = ({ modal, combatants, canManageEnemies, currentUid, onChange, onClose, onSave }) => {
    if (!modal?.isOpen) return null;
    const update = changes => onChange(previous => ({ ...previous, data: { ...previous.data, ...changes } }));
    const visibleTargets = combatants.filter(target => canManageEnemies || target.ownerUid === currentUid);

    return (
        <div className="fixed inset-0 z-[73] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div className="rpg-panel max-h-[90vh] w-full max-w-lg overflow-y-auto border border-cyan-700 p-5" onClick={event => event.stopPropagation()}>
                <h3 className="font-fantasy text-lg text-cyan-200">Efecto temporal</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm text-gray-300">Nombre<input value={modal.data.name || ''} onChange={event => update({ name: event.target.value })} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                    <label className="text-sm text-gray-300">Objetivo<select value={modal.data.targetType === 'global' ? 'global' : modal.data.targetId || ''} onChange={event => { const value = event.target.value; const target = combatants.find(item => item.id === value); update({ targetId: value === 'global' ? 'global' : value, targetType: value === 'global' ? 'global' : target?.type === 'enemy' ? 'enemy' : 'player' }); }} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="">Selecciona</option><option value="global">Global</option>{visibleTargets.map(target => <option key={target.id} value={target.id}>{target.name}</option>)}</select></label>
                    <label className="text-sm text-gray-300">Duración<select value={modal.data.durationType || 'manual'} onChange={event => update({ durationType: event.target.value })} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="turns">Turnos</option><option value="rounds">Rondas</option><option value="minutes">Minutos</option><option value="manual">Manual</option></select></label>
                    {modal.data.durationType !== 'manual' && <label className="text-sm text-gray-300">Restante<input type="number" min="0" value={modal.data.remaining ?? 0} onChange={event => update({ remaining: event.target.value, maximum: event.target.value })} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>}
                    {modal.data.durationType !== 'manual' && <label className="text-sm text-gray-300">Reducir<select value={modal.data.decrementMoment || 'manual'} onChange={event => update({ decrementMoment: event.target.value })} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="manual">Manual</option><option value="start-of-target-turn">Inicio turno objetivo</option><option value="end-of-target-turn">Fin turno objetivo</option><option value="start-of-round">Inicio ronda</option><option value="end-of-round">Fin ronda</option></select></label>}
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={!!modal.data.visibleToPlayers} onChange={event => update({ visibleToPlayers: event.target.checked })} />Visible para jugadores</label>
                <label className="mt-2 flex items-center gap-2 text-sm text-purple-200"><input type="checkbox" checked={!!modal.data.concentration} onChange={event => update({ concentration: event.target.checked })} />Requiere concentración</label>
                <label className="mt-3 block text-sm text-gray-300">Nota pública<input value={modal.data.notesPublic || ''} onChange={event => update({ notesPublic: event.target.value })} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="min-h-10 px-3 rounded border border-gray-600 text-gray-300">Cancelar</button><button type="button" onClick={onSave} className="min-h-10 px-3 rounded border border-cyan-700 text-cyan-100">Guardar</button></div>
            </div>
        </div>
    );
};

const OnlineHpModal = ({ modal, entity, onChange, onClose, onConfirm, busy, allowMax = false, accent = 'red' }) => {
    if (!modal?.isOpen || !entity) return null;
    const current = window.DndOnlineTableUtils.getHpValues(entity);
    const amount = Math.max(0, Number(modal.amount) || 0);
    let preview = { ...current };
    if (modal.mode === 'damage') {
        const absorbed = Math.min(current.tempHp, amount);
        preview = { ...current, tempHp: current.tempHp - absorbed, currentHp: Math.max(0, current.currentHp - (amount - absorbed)) };
    } else if (modal.mode === 'healing') preview = { ...current, currentHp: Math.min(current.maxHp, current.currentHp + amount) };
    else if (modal.mode === 'temp') preview = { ...current, tempHp: amount };
    else if (modal.mode === 'max') preview = { ...current, maxHp: amount, currentHp: Math.min(current.currentHp, amount) };
    else preview = { ...current, currentHp: Math.min(current.maxHp, amount) };
    const modes = [['damage', 'Daño'], ['healing', 'Curación'], ['temp', 'Vida temporal'], ['exact', 'Valor exacto'], ...(allowMax ? [['max', 'Vida máxima']] : [])];
    const activeClasses = accent === 'orange' ? 'border-orange-500 bg-orange-950/50 text-orange-100' : 'border-red-500 bg-red-950/50 text-red-100';
    const confirmClasses = accent === 'orange' ? 'border-orange-600 bg-orange-800' : 'border-red-600 bg-red-800';

    return (
        <div className="fixed inset-0 z-[73] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div className={`rpg-panel w-full max-w-sm border p-5 ${accent === 'orange' ? 'border-orange-700' : 'border-red-700'}`} onClick={event => event.stopPropagation()}>
                <div className="flex items-center justify-between gap-3"><div><h3 className={`font-fantasy text-lg font-bold ${accent === 'orange' ? 'text-orange-200' : 'text-red-200'}`}>Modificar vida</h3><p className="mt-1 text-xs text-gray-400">{entity.name || 'Personaje'}</p></div><button type="button" onClick={onClose} className="h-9 w-9 rounded border border-gray-600 text-gray-300" aria-label="Cerrar">×</button></div>
                <div className="mt-4 grid grid-cols-2 gap-2">{modes.map(([mode, label]) => <button key={mode} type="button" onClick={() => onChange(previous => ({ ...previous, mode }))} className={`min-h-10 rounded border px-2 text-xs ${modal.mode === mode ? activeClasses : 'border-gray-700 text-gray-300'}`}>{label}</button>)}</div>
                <label className="mt-4 block text-sm text-gray-300">Cantidad<input autoFocus type="number" min="0" value={modal.amount} onChange={event => onChange(previous => ({ ...previous, amount: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-3 text-center text-lg font-bold text-white outline-none focus:border-red-400" /></label>
                <div className="mt-4 rounded border border-gray-700 bg-gray-950/50 p-3 text-sm text-gray-300"><p>Vida: <b>{current.currentHp}</b> → <b>{preview.currentHp}</b> / {preview.maxHp}</p><p className="mt-1 text-cyan-200">Vida temporal: <b>{current.tempHp}</b> → <b>{preview.tempHp}</b></p></div>
                <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="min-h-10 px-4 rounded border border-gray-600 text-gray-300">Cancelar</button><button type="button" disabled={busy} onClick={onConfirm} className={`min-h-10 px-4 rounded border text-white disabled:opacity-50 ${confirmClasses}`}>Confirmar</button></div>
            </div>
        </div>
    );
};

window.DndOnlineComponents = { EnemyModal, OnlineConditionModal, OnlineEffectModal, OnlineHpModal, OnlineCombatantAvatar };
