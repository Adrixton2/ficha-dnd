window.DndLocalModalComponents = (() => {
    const ActivityHistoryModal = ({ open, entries, onClose, onClear }) => {
        if (!open) return null;

        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onClick={onClose}>
                <div className="rpg-panel flex max-h-[85vh] w-full max-w-2xl flex-col p-5" onClick={event => event.stopPropagation()}>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700 pb-3">
                        <h3 className="font-fantasy text-xl font-bold uppercase tracking-widest text-purple-200">Historial</h3>
                        <div className="flex items-center gap-2">
                            <button type="button" disabled={!entries.length} onClick={onClear} className="min-h-9 rounded border border-red-800 px-3 text-xs text-red-200 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600">Limpiar</button>
                            <button type="button" onClick={onClose} className="h-10 w-10 rounded border border-gray-600 text-2xl leading-none text-gray-300" aria-label="Cerrar historial">×</button>
                        </div>
                    </div>
                    {entries.length ? (
                        <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
                            {entries.map(entry => (
                                <div key={entry.id} className="flex gap-3 rounded border border-gray-800 bg-gray-900/50 px-3 py-2">
                                    <time dateTime={entry.timestamp} className="shrink-0 text-xs text-purple-300">{new Date(entry.timestamp).toLocaleDateString('es-ES')} {new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</time>
                                    <span className="text-sm text-gray-200">{entry.description}</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="mt-4 text-sm text-gray-500">Aun no hay cambios importantes registrados.</p>}
                </div>
            </div>
        );
    };

    const TimerModal = ({ modal, realTimerUnits, onChange, onClose, onSave, normalizeNumberInput }) => {
        if (!modal.isOpen) return null;
        const close = () => onClose({ isOpen: false, id: null, data: { name: '', current: '1', max: '', type: 'turns' } });

        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onClick={close}>
                <div className="rpg-panel w-full max-w-md p-5" onClick={event => event.stopPropagation()}>
                    <div className="flex items-center justify-between gap-4 border-b border-gray-700 pb-3">
                        <h3 className="font-fantasy text-xl font-bold text-cyan-200">{modal.id ? 'Editar temporizador' : 'Nuevo temporizador'}</h3>
                        <button type="button" onClick={close} className="h-10 w-10 rounded border border-gray-600 text-2xl leading-none text-gray-300">×</button>
                    </div>
                    <div className="mt-4 space-y-4">
                        <label className="block text-sm text-gray-300">Nombre<input autoFocus type="text" placeholder="Ej: Escudo de la Fe" value={modal.data.name} onChange={event => onChange(previous => ({ ...previous, data: { ...previous.data, name: event.target.value } }))} className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2.5 text-white outline-none focus:border-cyan-400" /></label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block text-sm text-gray-300">Actual<input type="number" min="0" value={modal.data.current} onChange={event => onChange(previous => ({ ...previous, data: { ...previous.data, current: normalizeNumberInput(event.target.value) } }))} className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2.5 text-center text-white outline-none focus:border-cyan-400" /></label>
                            <label className="block text-sm text-gray-300">Maximo opcional<input type="number" min="0" placeholder="Ej: 10" value={modal.data.max} onChange={event => onChange(previous => ({ ...previous, data: { ...previous.data, max: normalizeNumberInput(event.target.value) } }))} className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2.5 text-center text-white outline-none focus:border-cyan-400" /></label>
                        </div>
                        <label className="block text-sm text-gray-300">Tipo<select value={modal.data.type} onChange={event => onChange(previous => ({ ...previous, data: { ...previous.data, type: event.target.value } }))} className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2.5 text-white outline-none focus:border-cyan-400"><option value="turns">Turnos</option><option value="rounds">Rondas</option><option value="minutes">Minutos</option><option value="hours">Horas</option><option value="days">Dias</option></select>{realTimerUnits[modal.data.type] && <span className="mt-1 block text-xs text-cyan-300">Este temporizador avanza con el tiempo real.</span>}</label>
                    </div>
                    <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={close} className="min-h-10 rounded border border-gray-600 px-4 text-gray-300">Cancelar</button><button type="button" onClick={onSave} className="min-h-10 rounded border border-cyan-500 bg-cyan-700 px-4 text-white">Guardar</button></div>
                </div>
            </div>
        );
    };

    const CharacterManagerModal = ({ open, characters, activeCharacterId, onClose, onCreate, onSelect, onDuplicate, onDelete, hasPortrait }) => {
        if (!open) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onClick={onClose}>
                <div className="rpg-panel flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg border border-purple-500/50 p-4 shadow-2xl md:p-6" onClick={event => event.stopPropagation()}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-700 pb-4">
                        <div><h3 className="font-fantasy text-xl font-bold uppercase tracking-widest text-purple-200">Personajes</h3><p className="mt-1 text-xs text-gray-500">{characters.length} ficha{characters.length === 1 ? '' : 's'} guardada{characters.length === 1 ? '' : 's'}</p></div>
                        <div className="flex items-center gap-2"><button type="button" onClick={onCreate} className="min-h-10 rounded border border-purple-500 bg-purple-700 px-3 py-2 text-xs font-fantasy uppercase tracking-wider text-white">+ Nuevo personaje</button><button type="button" onClick={onClose} className="h-10 w-10 rounded border border-gray-600 text-2xl leading-none text-gray-400" aria-label="Cerrar gestión de personajes">×</button></div>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                        {characters.map(character => {
                            const isActive = activeCharacterId === character.meta.id;
                            return <div key={character.meta.id} className={`flex flex-col gap-3 rounded border p-3 sm:flex-row sm:items-center ${isActive ? 'border-purple-500 bg-purple-950/30' : 'border-gray-700 bg-gray-900/50'}`}>
                                <button type="button" onClick={() => onSelect(character.meta.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                                    {hasPortrait(character.meta.portrait) ? <img src={character.meta.portrait} alt="" className="h-11 w-11 rounded border border-purple-500/60 bg-gray-900 object-cover" /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-600 bg-gray-800 font-fantasy text-lg text-purple-300">{(character.meta.name || '?').slice(0, 1).toUpperCase()}</span>}
                                    <span className="min-w-0"><span className="flex flex-wrap items-center gap-2 text-sm font-bold tracking-wider text-white font-fantasy"><span className="truncate">{character.meta.name || 'Personaje sin nombre'}</span>{isActive && <span className="rounded-full border border-purple-400 bg-purple-900/50 px-2 py-0.5 text-[9px] uppercase text-purple-200">Activo</span>}</span><span className="mt-1 block text-[11px] text-gray-500">Actualizado {new Date(character.meta.updatedAt).toLocaleDateString()}</span></span>
                                </button>
                                <div className="flex shrink-0 gap-2"><button type="button" onClick={() => onDuplicate(character.meta.id)} className="min-h-9 rounded border border-gray-600 bg-gray-800 px-3 py-2 text-[10px] font-fantasy uppercase tracking-wider text-gray-200">Duplicar</button><button type="button" onClick={() => onDelete(character.meta.id)} className="min-h-9 rounded border border-red-800 bg-red-950/50 px-3 py-2 text-[10px] font-fantasy uppercase tracking-wider text-red-200">Eliminar</button></div>
                            </div>;
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const EquipmentCompendiumModal = ({ open, items, query, category, onQueryChange, onCategoryChange, onClose, onChoose }) => {
        if (!open) return null;
        const normalizedQuery = query.trim().toLocaleLowerCase('es');
        const categories = [...new Set(items.map(item => item.category))].sort((left, right) => left.localeCompare(right, 'es'));
        const rarityStyles = {
            'común': 'border-slate-500 bg-slate-900/70 text-slate-100',
            'infrecuente': 'border-emerald-700 bg-emerald-950/40 text-emerald-100',
            'raro': 'border-sky-700 bg-sky-950/45 text-sky-100',
            'muy raro': 'border-violet-700 bg-violet-950/45 text-violet-100',
            'legendario': 'border-amber-500 bg-amber-950/55 text-amber-100 shadow-[0_0_14px_rgba(245,158,11,0.16)]',
            'rareza variable': 'border-fuchsia-700 bg-fuchsia-950/45 text-fuchsia-100'
        };
        const matches = items.filter(item => (!normalizedQuery || item.name.toLocaleLowerCase('es').includes(normalizedQuery) || item.category.toLocaleLowerCase('es').includes(normalizedQuery)) && (!category || item.category === category));
        return <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/85 p-4" onClick={onClose}><div className="rpg-panel flex max-h-[90dvh] w-full max-w-3xl flex-col border border-amber-700 p-4" onClick={event => event.stopPropagation()}><div className="flex items-center justify-between gap-3 border-b border-gray-700 pb-3"><div><h3 className="font-fantasy text-xl font-bold uppercase tracking-wider text-amber-200">Equipo de aventurero</h3><p className="mt-1 text-xs text-gray-400">Catálogo SRD 5.1. Puedes revisar y editar cada dato antes de guardarlo.</p></div><button type="button" onClick={onClose} className="h-11 w-11 rounded border border-gray-600 text-xl text-gray-200">×</button></div><div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem]"><input value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Buscar equipo" className="min-h-11 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white" /><select value={category} onChange={event => onCategoryChange(event.target.value)} className="min-h-11 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white"><option value="">Todas las categorías</option>{categories.map(item => <option key={item} value={item}>{item}</option>)}</select></div><div className="mt-3 grid flex-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">{matches.map(item => <article key={item.id} className="flex flex-col rounded border border-gray-700 bg-gray-900/60 p-3"><div><strong className="text-sm text-white">{item.name}</strong><span className="mt-1 block text-[10px] uppercase text-amber-300">{item.category}</span>{item.data.desc && <p className="mt-2 text-xs text-gray-400">{item.data.desc}</p>}{item.type === 'armor' && <p className="mt-2 text-xs text-cyan-200">CA {item.data.type === 'shield' ? `+${item.data.ac}` : item.data.ac} · {item.data.type}</p>}{item.type === 'weapon' && <p className="mt-2 text-xs text-red-200">{item.data.attacks?.[0]?.dmg}</p>}</div><button type="button" onClick={() => onChoose(item)} className="mt-auto min-h-10 rounded border border-amber-700 bg-amber-950/30 px-3 text-xs font-bold text-amber-100">Usar como plantilla</button></article>)}{!matches.length && <p className="py-8 text-center text-sm text-gray-500 sm:col-span-2">No hay equipo que coincida.</p>}</div></div></div>;
    };

    const EquipmentMarketModal = ({ open, items, query, category, onQueryChange, onCategoryChange, onClose, onChoose }) => {
        const [selectedItem, setSelectedItem] = React.useState(null);
        if (!open) return null;

        const normalizedQuery = query.trim().toLocaleLowerCase('es');
        const categories = [...new Set(items.map(item => item.category))].sort((left, right) => left.localeCompare(right, 'es'));
        const rarityStyles = {
            'común': 'border-slate-500 bg-slate-900/70 text-slate-100',
            'infrecuente': 'border-emerald-700 bg-emerald-950/40 text-emerald-100',
            'raro': 'border-sky-700 bg-sky-950/45 text-sky-100',
            'muy raro': 'border-violet-700 bg-violet-950/45 text-violet-100',
            'legendario': 'border-amber-500 bg-amber-950/55 text-amber-100 shadow-[0_0_14px_rgba(245,158,11,0.16)]',
            'rareza variable': 'border-fuchsia-700 bg-fuchsia-950/45 text-fuchsia-100'
        };
        const matches = items.filter(item => {
            const searchable = [item.name, item.category, item.rarity, item.data?.desc, item.data?.details, item.price].filter(Boolean).join(' ').toLocaleLowerCase('es');
            return (!normalizedQuery || searchable.includes(normalizedQuery)) && (!category || item.category === category);
        });
        const getItemFacts = item => {
            const armorClass = item.type === 'armor'
                ? (item.data.type === 'shield' ? `+${item.data.ac} CA` : `CA ${item.data.ac}`)
                : null;
            return {
                armorClass,
                weaponDamage: item.type === 'weapon' ? item.data.attacks?.[0]?.dmg : null,
                isMagicItem: Boolean(item.rarity),
                rarityClass: rarityStyles[item.rarity] || rarityStyles['rareza variable']
            };
        };
        const formatRarity = rarity => rarity
            ? `${rarity.charAt(0).toLocaleUpperCase('es')}${rarity.slice(1)}`
            : '';

        const renderItemBadges = item => {
            const { armorClass, weaponDamage, rarityClass } = getItemFacts(item);
            return (
                <div className="flex flex-wrap gap-1.5">
                    {item.rarity && <span className={`rounded border px-2 py-1 text-[10px] font-bold shadow-sm ${rarityClass}`}>{formatRarity(item.rarity)}</span>}
                    {item.attunement && <span className="rounded border border-indigo-800 bg-indigo-950/35 px-2 py-1 text-[10px] font-bold text-indigo-100">Requiere sintonización</span>}
                    {armorClass && <span className="rounded border border-cyan-800 bg-cyan-950/25 px-2 py-1 text-[10px] font-bold text-cyan-100">{armorClass}</span>}
                    {item.data?.stealthDis && <span className="rounded border border-red-800 bg-red-950/25 px-2 py-1 text-[10px] font-bold text-red-100">Desventaja en Sigilo</span>}
                    {weaponDamage && <span className="rounded border border-red-800 bg-red-950/25 px-2 py-1 font-mono text-[10px] font-bold text-red-100">{weaponDamage}</span>}
                </div>
            );
        };

        const selectedFacts = selectedItem ? getItemFacts(selectedItem) : null;
        const handleClose = () => {
            setSelectedItem(null);
            onClose();
        };

        return (
            <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-4" onClick={handleClose}>
                <section className="rpg-panel flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden border border-amber-700/80 p-4 sm:p-5" role="dialog" aria-modal="true" aria-labelledby="equipment-market-title" onClick={event => event.stopPropagation()}>
                    <header className="grid grid-cols-[minmax(0,1fr)_2.75rem] items-start gap-3 border-b border-amber-900/60 pb-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Catálogo SRD 5.1</p>
                            <h3 id="equipment-market-title" className="mt-1 font-fantasy text-xl font-bold uppercase tracking-wider text-amber-100">{selectedItem ? selectedItem.name : 'Mercado y tesoro'}</h3>
                            <p className="mt-1 text-xs text-gray-400">{selectedItem ? selectedItem.category : 'Un inventario de suministros y tesoros. Abre cada ficha para consultar su uso completo.'}</p>
                        </div>
                        <button type="button" onClick={handleClose} className="flex h-11 w-11 items-center justify-center rounded border border-gray-600 text-xl text-gray-200 hover:border-amber-500 hover:text-amber-100" aria-label="Cerrar mercado de equipo">×</button>
                    </header>

                    {selectedItem ? (
                        <div className="mt-4 flex min-h-0 flex-1 flex-col">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <button type="button" onClick={() => setSelectedItem(null)} className="min-h-11 rounded border border-gray-600 px-3 text-xs font-bold text-gray-200 hover:border-amber-500 hover:text-amber-100">← Volver al catálogo</button>
                                {!selectedFacts.isMagicItem && <span className="rounded border border-amber-700 bg-amber-950/35 px-3 py-2 text-sm font-bold text-amber-100">{selectedItem.price || 'Precio a consultar'}</span>}
                            </div>
                            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                                <div className={`rounded border p-4 ${selectedFacts.isMagicItem ? 'border-fuchsia-800/70 bg-fuchsia-950/10' : 'border-amber-900/70 bg-amber-950/10'}`}>
                                    <p className="text-sm leading-relaxed text-gray-200">{selectedItem.data?.desc || 'Objeto de uso aventurero.'}</p>
                                    <div className="mt-4">{renderItemBadges(selectedItem)}</div>
                                </div>
                                <section className="mt-4 rounded border border-gray-700 bg-gray-950/45 p-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200">Uso y propiedades</h4>
                                    <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{selectedItem.data?.details || selectedItem.data?.desc || 'No hay una descripción adicional disponible.'}</div>
                                </section>
                                {selectedFacts.isMagicItem && <p className="mt-3 rounded border border-indigo-900/70 bg-indigo-950/20 px-3 py-2 text-xs leading-relaxed text-indigo-100">Los efectos se aplican manualmente durante la partida. Esta ficha resume cuándo puede usarse el objeto y qué hace.</p>}
                            </div>
                            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-gray-800 pt-3">
                                <button type="button" onClick={() => setSelectedItem(null)} className="min-h-11 rounded border border-gray-600 px-4 text-sm text-gray-200">Volver</button>
                                <button type="button" onClick={() => { onChoose(selectedItem); setSelectedItem(null); }} className="min-h-11 rounded border border-amber-700 bg-amber-950/30 px-4 text-sm font-bold text-amber-100 hover:bg-amber-900/45">Añadir a la ficha</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_13rem]">
                                <input value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Buscar objeto o categoría" className="min-h-11 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white outline-none focus:border-amber-500" />
                                <select value={category} onChange={event => onCategoryChange(event.target.value)} className="min-h-11 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white outline-none focus:border-amber-500">
                                    <option value="">Todas las categorías</option>
                                    {categories.map(item => <option key={item} value={item}>{item}</option>)}
                                </select>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3 border-b border-gray-800 pb-2 text-xs text-gray-400">
                                <span>{matches.length} objeto{matches.length === 1 ? '' : 's'} disponible{matches.length === 1 ? '' : 's'} en el catálogo</span>
                                <span className="shrink-0 text-amber-300">Suministros y objetos mágicos</span>
                            </div>
                            <div className="mt-3 grid min-h-0 flex-1 auto-rows-[18rem] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                                {matches.map(item => {
                                    const { isMagicItem } = getItemFacts(item);
                                    const priceClass = item.price?.includes(' po')
                                        ? 'border-yellow-600/80 bg-yellow-950/45 text-yellow-100'
                                        : item.price?.includes(' pp')
                                            ? 'border-slate-500 bg-slate-800/80 text-slate-100'
                                            : 'border-orange-700/80 bg-orange-950/40 text-orange-100';

                                    return (
                                        <article key={item.id} className={`flex h-full min-h-0 flex-col overflow-hidden rounded border bg-gray-900/60 p-3 transition-colors ${isMagicItem ? 'border-fuchsia-800/70 hover:border-fuchsia-600' : 'border-amber-900/70 hover:border-amber-600'}`}>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h4 className="min-h-10 text-sm font-bold leading-snug text-white">{item.name}</h4>
                                                    <p className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${isMagicItem ? 'text-fuchsia-300' : 'text-amber-300'}`}>{item.category}</p>
                                                </div>
                                                {!isMagicItem && <span className={`shrink-0 rounded border px-2 py-1 text-xs font-bold shadow-sm ${priceClass}`}>{item.price || 'Consultar'}</span>}
                                            </div>
                                            <p className="mt-3 h-[4.5rem] overflow-hidden text-xs leading-relaxed text-gray-300">{item.data?.desc || 'Equipo de uso común.'}</p>
                                            <div className="mt-3">{renderItemBadges(item)}</div>
                                            <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
                                                <button type="button" onClick={() => setSelectedItem(item)} className="min-h-11 rounded border border-gray-600 bg-gray-950/40 px-2 text-xs font-bold text-gray-100 hover:border-fuchsia-600">Ver ficha</button>
                                                <button type="button" onClick={() => onChoose(item)} className="min-h-11 rounded border border-amber-700 bg-amber-950/30 px-2 text-xs font-bold text-amber-100 hover:bg-amber-900/45">Añadir a la ficha</button>
                                            </div>
                                        </article>
                                    );
                                })}
                                {!matches.length && <p className="py-10 text-center text-sm text-gray-500 sm:col-span-2 lg:col-span-3">No hay objetos que coincidan con la búsqueda.</p>}
                            </div>
                        </>
                    )}
                </section>
            </div>
        );
    };

    return { ActivityHistoryModal, TimerModal, CharacterManagerModal, EquipmentCompendiumModal: EquipmentMarketModal };
})();
