window.DndLocalModalComponents = (() => {
    const ActivityHistoryModalLegacy = ({ open, entries, onClose, onClear }) => {
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

    const ActivityHistoryModal = ({ open, entries, onClose, onClear }) => {
        if (!open) return null;

        const formatDay = timestamp => {
            const date = new Date(timestamp);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const sameDay = (left, right) => left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
            if (sameDay(date, today)) return 'Hoy';
            if (sameDay(date, yesterday)) return 'Ayer';
            return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        };
        const getEntryKind = description => {
            const value = String(description || '').toLocaleLowerCase('es-ES');
            if (value.includes('ranura')) return { id: 'slot', label: 'Ranura de conjuro', glyph: '◆' };
            if (value.includes('nivel')) return { id: 'level', label: 'Progreso', glyph: '↑' };
            if (value.includes('descanso')) return { id: 'rest', label: 'Descanso', glyph: '☾' };
            if (value.includes('concentración')) return { id: 'concentration', label: 'Concentración', glyph: '◇' };
            if (value.includes('pv') || value.includes('vida') || value.includes('salud')) return { id: 'health', label: 'Vitalidad', glyph: '+' };
            if (value.includes('conjuro') || value.includes('ranura')) return { id: 'spell', label: 'Grimorio', glyph: '✦' };
            if (value.includes('arma') || value.includes('objeto') || value.includes('equipo')) return { id: 'equipment', label: 'Equipo', glyph: '⌁' };
            return { id: 'general', label: 'Ficha', glyph: '•' };
        };
        const groupedEntries = entries.reduce((groups, entry) => {
            const label = formatDay(entry.timestamp);
            const current = groups[groups.length - 1];
            if (current?.label === label) current.entries.push(entry);
            else groups.push({ label, entries: [entry] });
            return groups;
        }, []);

        return (
            <div className="activity-history-backdrop" onClick={onClose}>
                <section className="activity-history-modal" role="dialog" aria-modal="true" aria-labelledby="activity-history-title" onClick={event => event.stopPropagation()}>
                    <header className="activity-history-header">
                        <div className="activity-history-emblem" aria-hidden="true"><span>≡</span></div>
                        <div className="activity-history-heading">
                            <small>Crónica del personaje</small>
                            <h3 id="activity-history-title">Historial</h3>
                            <p>{entries.length ? `${entries.length} cambio${entries.length === 1 ? '' : 's'} registrado${entries.length === 1 ? '' : 's'}` : 'La memoria de tu aventura'}</p>
                        </div>
                        <button type="button" onClick={onClose} className="activity-history-close" aria-label="Cerrar historial">×</button>
                    </header>
                    {entries.length ? (
                        <div className="activity-history-scroll">
                            {groupedEntries.map(group => (
                                <section className="activity-history-day" key={group.label}>
                                    <header><span>{group.label}</span><i></i><small>{group.entries.length}</small></header>
                                    <div className="activity-history-timeline">
                                        {group.entries.map(entry => {
                                            const kind = getEntryKind(entry.description);
                                            const slotChange = String(entry.description || '').match(/Ranura(?: de)? nivel\s+(\d+)\s*:?\s*(\d+)\s*(?:→|->)\s*(\d+)(?:\s+disponibles)?(?:\s+de\s+(\d+))?/i);
                                            return <article key={entry.id} className={`activity-history-entry is-${kind.id}`}>
                                                <div className="activity-history-marker" aria-hidden="true"><span>{kind.glyph}</span></div>
                                                <div className="activity-history-entry-copy">
                                                    <div><span>{slotChange ? `Ranura · Nivel ${slotChange[1]}` : kind.label}</span><time dateTime={entry.timestamp}>{new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</time></div>
                                                    {slotChange ? <div className="activity-history-slot-change" aria-label={`Ranuras disponibles: antes ${slotChange[2]}, ahora ${slotChange[3]}${slotChange[4] ? ` de ${slotChange[4]}` : ''}`}>
                                                        <span><small>Antes</small><strong>{slotChange[2]}</strong></span>
                                                        <i aria-hidden="true">→</i>
                                                        <span className="is-current"><small>Disponibles ahora</small><strong>{slotChange[3]}{slotChange[4] && <em>/ {slotChange[4]}</em>}</strong></span>
                                                    </div> : <p>{entry.description}</p>}
                                                </div>
                                            </article>;
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    ) : <div className="activity-history-empty"><div aria-hidden="true"><span>✦</span></div><h4>Una historia por escribir</h4><p>Los descansos, cambios de nivel y otros momentos importantes aparecerán aquí.</p></div>}
                    <footer className="activity-history-footer">
                        <p><span aria-hidden="true">◆</span> Los cambios más recientes aparecen primero</p>
                        <button type="button" disabled={!entries.length} onClick={onClear}>Limpiar historial</button>
                    </footer>
                </section>
            </div>
        );
    };

    const TimerModal = ({ modal, realTimerUnits, onChange, onClose, onSave, normalizeNumberInput }) => {
        if (!modal.isOpen) return null;
        const close = () => onClose({ isOpen: false, id: null, data: { name: '', current: '1', max: '', type: 'turns' } });
        const timerTypes = [{ id: 'turns', label: 'Turnos', icon: '→' }, { id: 'rounds', label: 'Rondas', icon: '↻' }, { id: 'minutes', label: 'Minutos', icon: '·' }, { id: 'hours', label: 'Horas', icon: '◔' }, { id: 'days', label: 'Días', icon: '☀' }];

        return (
            <div className="timer-modal-backdrop" onClick={close}>
                <section className="timer-modal" role="dialog" aria-modal="true" aria-labelledby="timer-modal-title" onClick={event => event.stopPropagation()}>
                    <header className="timer-modal-header"><span aria-hidden="true"><i></i>⌛</span><div><small>{modal.id ? 'Ajustar seguimiento' : 'Nuevo seguimiento'}</small><h3 id="timer-modal-title">{modal.id ? 'Editar temporizador' : 'Crear temporizador'}</h3><p>Define qué quieres vigilar y durante cuánto tiempo.</p></div><button type="button" onClick={close} aria-label="Cerrar temporizador">×</button></header>
                    <div className="timer-modal-body">
                        <label className="timer-modal-name"><span>Nombre del efecto</span><input type="text" placeholder="Ej: Escudo de la fe" value={modal.data.name} onChange={event => onChange(previous => ({ ...previous, data: { ...previous.data, name: event.target.value } }))} /></label>
                        <fieldset className="timer-modal-types"><legend>Unidad de seguimiento</legend><div>{timerTypes.map(type => <button key={type.id} type="button" aria-pressed={modal.data.type === type.id} className={modal.data.type === type.id ? 'is-active' : ''} onClick={() => onChange(previous => ({ ...previous, data: { ...previous.data, type: type.id } }))}><span aria-hidden="true">{type.icon}</span><strong>{type.label}</strong><i aria-hidden="true"></i></button>)}</div></fieldset>
                        <div className="timer-modal-values"><label><span>Duración restante</span><small>Valor que queda ahora</small><input type="number" min="0" value={modal.data.current} onChange={event => onChange(previous => ({ ...previous, data: { ...previous.data, current: normalizeNumberInput(event.target.value) } }))} /></label><label><span>Duración total</span><small>Opcional, muestra progreso</small><input type="number" min="0" placeholder="—" value={modal.data.max} onChange={event => onChange(previous => ({ ...previous, data: { ...previous.data, max: normalizeNumberInput(event.target.value) } }))} /></label></div>
                        <div className={`timer-modal-note ${realTimerUnits[modal.data.type] ? 'is-realtime' : ''}`}><span aria-hidden="true">{realTimerUnits[modal.data.type] ? '⌛' : '↻'}</span><p><strong>{realTimerUnits[modal.data.type] ? 'Avance en tiempo real' : 'Control manual'}</strong>{realTimerUnits[modal.data.type] ? 'Seguirá descontando aunque cierres esta ventana.' : 'Podrás reducir o aumentar el contador desde Combate.'}</p></div>
                    </div>
                    <footer className="timer-modal-footer"><button type="button" onClick={close}>Cancelar</button><button type="button" className="is-primary" onClick={onSave}><span aria-hidden="true">✓</span>{modal.id ? 'Guardar cambios' : 'Crear temporizador'}</button></footer>
                </section>
            </div>
        );
    };

    const CharacterManagerModal = ({ open, characters, activeCharacterId, onClose, onCreate, onImport, onSelect, onDuplicate, onExport, onShare, onDelete, hasPortrait }) => {
        if (!open) return null;

        return (
            <div className="character-manager-backdrop" onClick={onClose}>
                <section className="character-manager" role="dialog" aria-modal="true" aria-labelledby="character-manager-title" onClick={event => event.stopPropagation()}>
                    <header className="character-manager-header">
                        <div className="character-manager-title"><span aria-hidden="true"><i></i><b>✦</b></span><div><small>Biblioteca de aventureros</small><h3 id="character-manager-title">Seleccionar personaje</h3><p>Cambia de ficha o administra tus personajes guardados.</p></div></div>
                        <div className="character-manager-header-actions"><button type="button" onClick={onImport} className="is-import"><span>⇧</span> Importar</button><button type="button" onClick={onCreate} className="is-create"><span>＋</span> Nuevo personaje</button><button type="button" onClick={onClose} className="character-manager-close" aria-label="Cerrar selección de personajes">×</button></div>
                    </header>
                    <div className="character-manager-summary"><span><b>{characters.length}</b> ficha{characters.length === 1 ? '' : 's'} guardada{characters.length === 1 ? '' : 's'}</span><span><i></i>Guardado automático local</span></div>
                    <div className="character-manager-grid">
                        {characters.map(character => {
                            const isActive = activeCharacterId === character.meta.id;
                            const data = character.data || {};
                            const info = data.charInfo || {};
                            const currentHp = Math.max(0, Number(data.hp?.current) || 0);
                            const maxHp = Math.max(0, Number(data.hp?.max) || 0);
                            const hpPercent = maxHp > 0 ? Math.min(100, (currentHp / maxHp) * 100) : 0;
                            const identity = [info.race, info.cls, `Nivel ${data.level || 1}`].filter(Boolean).join(' · ');
                            const updated = new Date(character.meta.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                            return <article key={character.meta.id} data-accent={data.presentation?.accent || 'violet'} className={`character-manager-card ${isActive ? 'is-active' : ''}`}>
                                <div className="character-manager-card-hero">
                                    <div className="character-manager-portrait">{hasPortrait(character.meta.portrait) ? <img src={character.meta.portrait} alt="" /> : <span>{(character.meta.name || info.name || '?').trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase()}</span>}<i>{String(info.cls || 'PJ').slice(0,2).toUpperCase()}</i></div>
                                    <div className="character-manager-identity"><small>{isActive ? 'Personaje actual' : 'Ficha guardada'}</small><h4>{character.meta.name || info.name || 'Personaje sin nombre'}</h4><p>{identity || 'Sin especie ni clase definidas'}</p></div>
                                    {isActive && <span className="character-manager-active"><i></i>Activo</span>}
                                </div>
                                <div className="character-manager-vitals"><div><span>PV</span><strong>{currentHp} <i>/ {maxHp || '—'}</i></strong></div><div className="character-manager-hp-track"><i style={{ width: `${hpPercent}%` }}></i></div>{Number(data.hp?.temp) > 0 && <span className="character-manager-temp">+{data.hp.temp} temporales</span>}</div>
                                <div className="character-manager-updated"><span>Última actualización</span><strong>{updated}</strong></div>
                                <button type="button" onClick={() => onSelect(character.meta.id)} className="character-manager-select">{isActive ? 'Volver a la ficha' : 'Usar este personaje'} <span>{isActive ? '✓' : '→'}</span></button>
                                <footer className="character-manager-card-actions"><button type="button" onClick={() => onShare(character.meta.id)}><span>◇</span>Compartir</button><button type="button" onClick={() => onExport(character.meta.id)}><span>↓</span>Exportar</button><button type="button" onClick={() => onDuplicate(character.meta.id)}><span>⧉</span>Duplicar</button><button type="button" className="is-delete" onClick={() => onDelete(character.meta.id)}><span>×</span>Eliminar</button></footer>
                            </article>;
                        })}
                    </div>
                </section>
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

    const EquipmentMarketModalLegacy = ({ open, items, query, category, onQueryChange, onCategoryChange, onClose, onChoose }) => {
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

    const EquipmentMarketModal = ({ open, items, query, category, onQueryChange, onCategoryChange, onClose, onChoose }) => {
        const [selectedItem, setSelectedItem] = React.useState(null);
        if (!open) return null;

        const normalizedQuery = query.trim().toLocaleLowerCase('es');
        const categories = [...new Set(items.map(item => item.category))].sort((left, right) => left.localeCompare(right, 'es'));
        const matches = items.filter(item => {
            const searchable = [item.name, item.category, item.rarity, item.data?.desc, item.data?.details, item.price].filter(Boolean).join(' ').toLocaleLowerCase('es');
            return (!normalizedQuery || searchable.includes(normalizedQuery)) && (!category || item.category === category);
        });
        const isMagicItem = item => Boolean(item?.rarity);
        const rarityTone = rarity => String(rarity || 'mundano').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
        const itemGlyph = item => {
            if (isMagicItem(item)) return '✦';
            if (item.type === 'weapon') return '†';
            if (item.type === 'armor') return '◇';
            if (String(item.category || '').toLocaleLowerCase('es').includes('herramient')) return '⌁';
            return '◆';
        };
        const itemFacts = item => [
            item.type === 'armor' && (item.data?.type === 'shield' ? `+${item.data?.ac} CA` : `CA ${item.data?.ac}`),
            item.type === 'weapon' && item.data?.attacks?.[0]?.dmg,
            item.attunement && 'Requiere sintonización',
            item.data?.stealthDis && 'Desventaja en Sigilo'
        ].filter(Boolean);
        const formatRarity = rarity => rarity ? `${rarity.charAt(0).toLocaleUpperCase('es')}${rarity.slice(1)}` : '';
        const handleClose = () => { setSelectedItem(null); onClose(); };
        const magicCount = matches.filter(isMagicItem).length;

        return <div className="treasure-catalog-backdrop" onClick={handleClose}>
            <section className={`treasure-catalog ${selectedItem ? 'is-detail' : ''}`} role="dialog" aria-modal="true" aria-labelledby="treasure-catalog-title" onClick={event => event.stopPropagation()}>
                <header className="treasure-catalog-header">
                    <div className="treasure-catalog-emblem" aria-hidden="true"><span>✦</span><i></i></div>
                    <div><small>Archivo del aventurero</small><h3 id="treasure-catalog-title">{selectedItem ? selectedItem.name : 'Mercado y tesoro'}</h3><p>{selectedItem ? selectedItem.category : 'Equipo, suministros y objetos extraordinarios para tu ficha.'}</p></div>
                    <button type="button" onClick={() => selectedItem ? setSelectedItem(null) : handleClose()} className="treasure-catalog-close" aria-label={selectedItem ? 'Cerrar ficha y volver al catálogo' : 'Cerrar mercado y tesoro'}>×</button>
                </header>

                {selectedItem ? <div className="treasure-detail">
                    <div className={`treasure-detail-hero is-${rarityTone(selectedItem.rarity)}`}>
                        <div className="treasure-detail-sigil" aria-hidden="true">{itemGlyph(selectedItem)}</div>
                        <div className="treasure-detail-identity"><small>{isMagicItem(selectedItem) ? 'Tesoro mágico' : 'Equipo de aventurero'}</small><h4>{selectedItem.name}</h4><p>{selectedItem.category}</p></div>
                        <div className="treasure-detail-value">{isMagicItem(selectedItem) ? <span className={`treasure-rarity is-${rarityTone(selectedItem.rarity)}`}>{formatRarity(selectedItem.rarity)}</span> : <><small>Valor</small><strong>{selectedItem.price || 'Consultar'}</strong></>}</div>
                    </div>
                    <div className="treasure-detail-scroll">
                        <section className="treasure-detail-summary"><span>Descripción</span><p>{selectedItem.data?.desc || 'Objeto de uso aventurero.'}</p></section>
                        {itemFacts(selectedItem).length > 0 && <div className="treasure-facts">{itemFacts(selectedItem).map(fact => <span key={fact}>{fact}</span>)}</div>}
                        <section className="treasure-detail-properties"><header><span aria-hidden="true">◇</span><div><small>Consulta de reglas</small><h5>Uso y propiedades</h5></div></header><div>{selectedItem.data?.details || selectedItem.data?.desc || 'No hay una descripción adicional disponible.'}</div></section>
                        {isMagicItem(selectedItem) && <aside className="treasure-magic-note"><span aria-hidden="true">✦</span><p><strong>Objeto mágico</strong> Sus efectos se aplican manualmente durante la partida; la ficha no toma decisiones por el jugador.</p></aside>}
                    </div>
                    <footer className="treasure-detail-actions"><button type="button" className="is-primary" onClick={() => { onChoose(selectedItem); setSelectedItem(null); }}><span>＋</span>Añadir a la ficha</button></footer>
                </div> : <>
                    <div className="treasure-catalog-tools">
                        <label className="treasure-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg><input value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Buscar por nombre, propiedad o categoría" aria-label="Buscar en mercado y tesoro"/>{query && <button type="button" onClick={() => onQueryChange('')} aria-label="Limpiar búsqueda">×</button>}</label>
                        <label className="treasure-category"><span>Categoría</span><select value={category} onChange={event => onCategoryChange(event.target.value)}><option value="">Todas</option>{categories.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
                    </div>
                    <div className="treasure-catalog-summary"><p><strong>{matches.length}</strong> resultados</p><div><span><i className="is-equipment"></i>{matches.length - magicCount} de equipo</span><span><i className="is-magic"></i>{magicCount} mágicos</span></div></div>
                    <div className="treasure-catalog-grid">
                        {matches.map(item => {
                            const magic = isMagicItem(item);
                            const facts = itemFacts(item).slice(0, 2);
                            return <article key={item.id} className={`treasure-card ${magic ? `is-magic is-${rarityTone(item.rarity)}` : 'is-equipment'}`}>
                                <header><span className="treasure-card-sigil" aria-hidden="true">{itemGlyph(item)}</span><div><small>{item.category}</small><h4>{item.name}</h4></div>{magic ? <span className={`treasure-rarity is-${rarityTone(item.rarity)}`}>{formatRarity(item.rarity)}</span> : <span className="treasure-price">{item.price || 'Consultar'}</span>}</header>
                                <p className="treasure-card-description">{item.data?.desc || 'Equipo de uso común.'}</p>
                                {facts.length > 0 && <div className="treasure-card-facts">{facts.map(fact => <span key={fact}>{fact}</span>)}</div>}
                                <footer><button type="button" onClick={() => setSelectedItem(item)}>Consultar</button><button type="button" className="is-add" onClick={() => onChoose(item)} aria-label={`Añadir ${item.name} a la ficha`}>＋ <span>Añadir</span></button></footer>
                            </article>;
                        })}
                        {!matches.length && <div className="treasure-catalog-empty"><span aria-hidden="true">◇</span><h4>No aparece ningún objeto</h4><p>Prueba otra búsqueda o selecciona una categoría diferente.</p>{(query || category) && <button type="button" onClick={() => { onQueryChange(''); onCategoryChange(''); }}>Restablecer filtros</button>}</div>}
                    </div>
                </>}
            </section>
        </div>;
    };

    return { ActivityHistoryModal, TimerModal, CharacterManagerModal, EquipmentCompendiumModal: EquipmentMarketModal };
})();
