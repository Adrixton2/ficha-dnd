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

window.DndOnlineComponents = { EnemyModal, OnlineCombatantAvatar };
