window.DndInventoryViewComponents = (() => {
    const { getArmorFormula } = window.DndAppUtils;
    const { InventoryGlyph, DND_CURRENCIES, getCurrencyCopperValue, formatCurrencyEquivalent } = window.DndCharacterSheetComponents;

    const InventoryView = ({ model }) => {
        const { addCurrency, adjustInvQty, armors, confirmDelete, currency, diaryCategory, diaryOpen, diarySearch, editingDiaryEntry, inventory, sessionNotes, setAddModal, setArmors, setDiaryCategory, setDiaryOpen, setDiarySearch, setEditingDiaryEntry, setEquipmentCompendiumOpen, setInventory, setSessionNotes, setTools, toggleArmorEquip, tools, updateCurrencyAmount } = model;
        return (
        <>
<section data-tab="inventory" className="inventory-hero tab-section">
            <div className="inventory-hero-title">
                <span className="inventory-hero-emblem" aria-hidden="true"><InventoryGlyph section="backpack" /></span>
                <div>
                    <p>Equipo y memoria</p>
                    <h1>Inventario / Lore</h1>
                    <span>Todo lo que llevas y la historia que acompaña a tu personaje.</span>
                </div>
            </div>
        </section>

        <div data-tab="inventory" className="inventory-board tab-section">
            <div className="inventory-board-column inventory-board-left">
        {/* ARMADURAS, COMPETENCIAS Y HERRAMIENTAS */}
        <div data-tab="inventory" className="inventory-equipment-panel inventory-overview-panel tab-section rpg-panel p-4">
            <div className="inventory-equipment-header">
                <div className="inventory-equipment-heading">
                    <span className="inventory-equipment-emblem" aria-hidden="true"><InventoryGlyph section="equipment" /></span>
                    <div>
                        <p>Protección y utilidad</p>
                        <h2>Equipo en uso</h2>
                    </div>
                </div>
                <div className="inventory-equipment-actions">
                    <button onClick={() => setAddModal({isOpen: true, type: 'armor', data: {type: 'light'}})} className="inventory-equipment-add" aria-label="Añadir armadura"><InventoryGlyph section="equipment" /><span>Armadura</span></button>
                    <button onClick={() => setAddModal({isOpen: true, type: 'tool', data: {}})} className="inventory-equipment-add" aria-label="Añadir utilidad o herramienta"><InventoryGlyph section="treasure" /><span>Utilidad</span></button>
                </div>
            </div>
            <div className="inventory-equipment-columns">
            <section className="inventory-equipment-group">
            <h3 className="inventory-equipment-group-title"><InventoryGlyph section="equipment" /> Armadura</h3>
            {/* Lista de Armaduras y Escudos */}
            <div className="space-y-2">
                {armors.map(arm => (
                    <div key={arm.id} className={`inventory-equipment-entry inventory-armor-entry group ${arm.equipped ? 'is-equipped' : ''}`}>
                        <button type="button" onClick={() => toggleArmorEquip(arm.id)} className="inventory-armor-toggle" aria-label={arm.equipped ? `Desequipar ${arm.name}` : `Equipar ${arm.name}`}>
                            <span className={`w-5 h-5 rounded border ${arm.equipped ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-600'} flex items-center justify-center transition-colors shadow-sm`}>
                                    {arm.equipped && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            </span>
                        </button>
                        <div className="inventory-equipment-entry-copy">
                            <strong>{arm.name}</strong>
                            <span>{arm.type === 'light' ? 'Armadura ligera' : arm.type === 'medium' ? 'Armadura media' : arm.type === 'heavy' ? 'Armadura pesada' : 'Escudo'}</span>
                            <small>{getArmorFormula(arm)}</small>
                        </div>
                        <div className="inventory-equipment-entry-actions">
                            <span>{arm.type === 'shield' ? `+${arm.ac || 2} CA` : `CA ${arm.ac}`}</span>
                            {arm.stealthDis && <i>Sigilo −</i>}
                            <button type="button" onClick={() => confirmDelete(`¿Borrar "${arm.name}"?`, () => setArmors(armors.filter(a => a.id !== arm.id)))} aria-label={`Borrar ${arm.name}`}>×</button>
                        </div>
                    </div>
                ))}
                {armors.length === 0 && <span className="text-gray-600 text-xs italic">Sin armaduras registradas.</span>}
            </div>
            </section>

            {/* Lista de Herramientas */}
            <section className="inventory-equipment-group">
            <h3 className="inventory-equipment-group-title"><InventoryGlyph section="treasure" /> Utilidad y herramientas</h3>
            <div className="space-y-2">
                {tools.map(tool => (
                    <div key={tool.id} className="inventory-equipment-entry inventory-tool-entry group">
                        <div className="inventory-equipment-entry-copy">
                            <strong>{tool.name}</strong>
                            <small>{tool.desc}</small>
                        </div>
                        <button type="button" onClick={() => confirmDelete(`¿Borrar "${tool.name}"?`, () => setTools(tools.filter(t => t.id !== tool.id)))} aria-label={`Borrar ${tool.name}`}>×</button>
                    </div>
                ))}
                {tools.length === 0 && <span className="text-gray-600 text-xs italic">Sin herramientas registradas.</span>}
            </div>
            </section>
            </div>
        </div>

        <section data-tab="inventory" className="inventory-currency-panel tab-section rpg-panel p-4">
            <div className="inventory-resource-header">
                <div><p>Recursos</p><h2>Monedas</h2></div>
                <InventoryGlyph section="coins" />
            </div>
            <div className="inventory-currency-wallet">
                {DND_CURRENCIES.map(coin => (
                    <div key={coin.key} className={`inventory-currency-card inventory-currency-${coin.key}`}>
                        <span className="inventory-currency-token" aria-hidden="true">{coin.symbol}</span>
                        <span className="inventory-currency-label">{coin.label}<small>{coin.short} · 1 = {coin.copperValue} PC</small></span>
                        <div className="inventory-currency-controls">
                            <button type="button" onClick={() => addCurrency(coin.key, -1)} aria-label={`Restar una pieza de ${coin.label}`}>−</button>
                            <input aria-label={`Cantidad de ${coin.label}`} type="number" min="0" value={currency[coin.key] ?? ''} onChange={e => updateCurrencyAmount(coin.key, e.target.value)} />
                            <button type="button" onClick={() => addCurrency(coin.key, 1)} aria-label={`Sumar una pieza de ${coin.label}`}>+</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="inventory-currency-total"><span>Valor total</span><strong>{formatCurrencyEquivalent(currency)}</strong><small>{getCurrencyCopperValue(currency)} PC</small></div>
        </section>
            </div>

            <div className="inventory-board-column inventory-board-right">

        {/* MERCADO Y TESORO */}
        <div data-tab="inventory" className="inventory-market-panel inventory-market-card tab-section rpg-panel border border-amber-900/70 p-4">
            <div className="inventory-market-access">
                <div className="inventory-market-copy">
                    <h2>Mercado y tesoro</h2>
                    <p>Equipo, consumibles y objetos mágicos.</p>
                </div>
                <button type="button" onClick={() => setEquipmentCompendiumOpen(true)}>Abrir catálogo</button>
            </div>
        </div>

        {/* INVENTARIO DE CONSUMIBLES */}
        <div data-tab="inventory" className="inventory-backpack-panel inventory-backpack-card tab-section rpg-panel p-4">
            <div className="inventory-backpack-header">
                <div className="inventory-backpack-heading">
                    <span className="inventory-backpack-emblem" aria-hidden="true"><InventoryGlyph section="backpack" /></span>
                    <div>
                        <p>Equipo transportado</p>
                        <h2>Mochila</h2>
                    </div>
                </div>
                <button onClick={() => setAddModal({isOpen: true, type: 'item', data: {}})} className="inventory-backpack-add"><span aria-hidden="true">+</span> Objeto</button>
            </div>
            <div className="inventory-backpack-list space-y-2">
                {inventory.map((item, idx) => (
                    <div key={item.id} className="inventory-item-row flex justify-between items-start bg-gray-900/40 p-2.5 rounded group border border-gray-800 hover:border-gray-600 transition-colors">
                        <div className="flex-1 pr-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-gray-200">{item.name}</span>
                                <span className="text-[10px] font-mono bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-purple-300 font-bold shadow-inner">x{item.qty}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1 leading-tight">{item.desc}</p>
                        </div>
                        
                        <div className="inventory-item-controls flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => adjustInvQty(item.id, -1)} className="inventory-item-adjust" aria-label={`Quitar una unidad de ${item.name}`}>−</button>
                            <button type="button" onClick={() => adjustInvQty(item.id, 1)} className="inventory-item-adjust" aria-label={`Añadir una unidad de ${item.name}`}>+</button>
                            <span className="inventory-item-divider" aria-hidden="true"></span>
                            <button type="button" onClick={() => confirmDelete(`¿Borrar "${item.name}"?`, () => setInventory(inventory.filter(x => x.id !== item.id)))} className="inventory-item-delete" aria-label={`Borrar ${item.name}`}>×</button>
                        </div>
                    </div>
                ))}
                {inventory.length === 0 && <span className="text-gray-600 text-xs italic">Tu inventario está vacío. Pulsa + Objeto para añadir el primero.</span>}
            </div>
        </div>
            </div>
        </div>

        <section data-tab="inventory" className="inventory-diary-panel inventory-diary-card tab-section rpg-panel">
            <div className="inventory-diary-header">
                <div className="inventory-diary-heading">
                    <span className="inventory-diary-emblem" aria-hidden="true"><InventoryGlyph section="journal" /></span>
                    <div>
                        <p>Crónica de campaña</p>
                        <h2>Diario</h2>
                    </div>
                </div>
                <div className="inventory-diary-actions">
                    {diaryOpen && (
                        <button
                            type="button"
                            onClick={() => {
                                const entry = { id: 'note_' + Date.now(), title: '', date: new Date().toISOString().slice(0, 10), text: '', category: diaryCategory === 'all' ? 'sessions' : diaryCategory, tags: [], relations: [] };
                                setSessionNotes([entry, ...sessionNotes]);
                                setEditingDiaryEntry(entry.id);
                            }}
                            className="inventory-diary-new"
                        >
                            + Nueva entrada
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setDiaryOpen(value => !value)}
                        className="inventory-diary-toggle"
                        aria-label={diaryOpen ? 'Contraer diario' : 'Desplegar diario'}
                        aria-expanded={diaryOpen}
                    >
                        {diaryOpen ? '−' : '+'}
                    </button>
                </div>
            </div>
            <div className="inventory-diary-summary">
                <span>{sessionNotes.length === 0 ? 'Aún no hay entradas de campaña.' : `${sessionNotes.length} ${sessionNotes.length === 1 ? 'entrada guardada' : 'entradas guardadas'}.`}</span>
                <button type="button" onClick={() => setDiaryOpen(value => !value)}>{diaryOpen ? 'Ocultar entradas' : 'Ver diario'}</button>
            </div>
            {diaryOpen && (
                <div className="campaign-journal-shell">
                    {(() => {
                        const categories = [['sessions','Sesiones'],['active-quests','Misiones activas'],['completed-quests','Misiones completadas'],['npcs','PNJ'],['places','Lugares'],['clues','Pistas'],['debts','Deudas'],['promises','Promesas'],['loot','Botín pendiente']];
                        const categoryLabel = id => categories.find(([key]) => key === id)?.[1] || 'Sesiones';
                        const query = diarySearch.trim().toLocaleLowerCase('es');
                        const filteredNotes = sessionNotes.filter(note => {
                            const searchable = [note.title || note.date, note.text, ...(note.tags || [])].join(' ').toLocaleLowerCase('es');
                            return (diaryCategory === 'all' || (note.category || 'sessions') === diaryCategory) && (!query || searchable.includes(query));
                        });
                        const updateNote = (id, patch) => setSessionNotes(previous => previous.map(note => note.id === id ? { ...note, ...patch } : note));
                        return <div className="campaign-journal">
                            <div className="campaign-journal-tools"><label><span>⌕</span><input type="search" value={diarySearch} onChange={event => setDiarySearch(event.target.value)} placeholder="Buscar en el diario…" /></label><small>{filteredNotes.length} {filteredNotes.length === 1 ? 'entrada' : 'entradas'}</small></div>
                            <nav className="campaign-journal-categories" aria-label="Categorías del diario">
                                <button type="button" className={diaryCategory === 'all' ? 'is-active' : ''} onClick={() => setDiaryCategory('all')}><span>Todas</span><small>{sessionNotes.length}</small></button>
                                {categories.map(([id,label]) => { const count = sessionNotes.filter(note => (note.category || 'sessions') === id).length; return <button type="button" key={id} className={diaryCategory === id ? 'is-active' : ''} onClick={() => setDiaryCategory(id)}><span>{label}</span>{count > 0 && <small>{count}</small>}</button>; })}
                            </nav>
                            <div className="campaign-journal-list">
                                {filteredNotes.map(note => {
                                    const isEditing = editingDiaryEntry === note.id;
                                    const title = note.title || (!note.category ? note.date : '') || 'Entrada sin título';
                                    const related = (note.relations || []).map(id => sessionNotes.find(entry => entry.id === id)).filter(Boolean);
                                    return <article key={note.id} className={`campaign-journal-card ${isEditing ? 'is-editing' : ''}`}>
                                        <div className="campaign-journal-card-accent"></div>
                                        {!isEditing ? <><header><div><span>{categoryLabel(note.category || 'sessions')}</span><h3>{title}</h3></div><time>{note.category ? (note.date || 'Sin fecha') : 'Nota anterior'}</time></header><p>{note.text || 'Esta entrada todavía no tiene contenido.'}</p>{((note.tags || []).length > 0 || related.length > 0) && <footer><div>{(note.tags || []).map(tag => <span key={tag}>#{tag}</span>)}</div>{related.length > 0 && <small>↗ {related.map(entry => entry.title || entry.date || 'Entrada').join(' · ')}</small>}</footer>}<button type="button" className="campaign-journal-edit" onClick={() => setEditingDiaryEntry(note.id)}>Editar</button></> :
                                        <div className="campaign-journal-editor">
                                            <div className="campaign-journal-editor-heading"><div><small>Editando entrada</small><strong>{title}</strong></div><button type="button" onClick={() => setEditingDiaryEntry(null)}>Cerrar</button></div>
                                            <div className="campaign-journal-editor-meta"><label><span>Categoría</span><select value={note.category || 'sessions'} onChange={event => updateNote(note.id,{category:event.target.value})}>{categories.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label><label><span>Fecha</span><input type="date" value={note.category ? (note.date || '') : ''} onChange={event => updateNote(note.id,{date:event.target.value})} /></label></div>
                                            <label className="campaign-journal-field"><span>Título</span><input type="text" value={note.title || (!note.category ? note.date : '') || ''} onChange={event => updateNote(note.id,{title:event.target.value,...(!note.category ? {date:new Date().toISOString().slice(0,10)} : {})})} placeholder="¿Qué quieres recordar?" /></label>
                                            <label className="campaign-journal-field"><span>Notas</span><textarea value={note.text || ''} onChange={event => updateNote(note.id,{text:event.target.value})} placeholder="Escribe libremente: sucesos, decisiones, detalles…" /></label>
                                            <label className="campaign-journal-field"><span>Etiquetas <small>separadas por comas</small></span><input type="text" value={(note.tags || []).join(', ')} onChange={event => updateNote(note.id,{tags:event.target.value.split(',').map(tag => tag.trim()).filter(Boolean)})} placeholder="urgente, ciudad, grupo…" /></label>
                                            <div className="campaign-journal-field"><span>Relacionar con</span><div className="campaign-journal-relations">{sessionNotes.filter(entry => entry.id !== note.id).map(entry => { const selected = (note.relations || []).includes(entry.id); return <button type="button" key={entry.id} className={selected ? 'is-selected' : ''} onClick={() => updateNote(note.id,{relations:selected ? (note.relations || []).filter(id => id !== entry.id) : [...(note.relations || []),entry.id]})}>{selected ? '✓ ' : '+ '}{entry.title || entry.date || 'Entrada sin título'}</button>; })}{sessionNotes.length <= 1 && <small>No hay otras entradas que relacionar.</small>}</div></div>
                                            <div className="campaign-journal-editor-actions"><button type="button" className="is-danger" onClick={() => confirmDelete(`¿Borrar la entrada "${title}"?`,() => { setSessionNotes(sessionNotes.filter(entry => entry.id !== note.id)); setEditingDiaryEntry(null); })}>Eliminar</button><button type="button" className="is-primary" onClick={() => setEditingDiaryEntry(null)}>Guardar entrada</button></div>
                                        </div>}
                                    </article>;
                                })}
                                {!filteredNotes.length && <div className="campaign-journal-empty"><span>✦</span><strong>{sessionNotes.length ? 'No hay coincidencias' : 'La crónica aún está en blanco'}</strong><p>{sessionNotes.length ? 'Prueba otra búsqueda o cambia de categoría.' : 'Crea una entrada para guardar el primer hilo de la aventura.'}</p></div>}
                            </div>
                        </div>;
                    })()}
                    <div className="inventory-diary-body hidden">
                    {sessionNotes.map(note => (
                        <article key={note.id} className="inventory-diary-entry">
                            <div className="inventory-diary-entry-header">
                                <input
                                    type="text"
                                    placeholder="Ej: Sesión 1"
                                    value={note.date}
                                    onChange={e => setSessionNotes(sessionNotes.map(item => item.id === note.id ? { ...item, date: e.target.value } : item))}
                                />
                                <button
                                    type="button"
                                    onClick={() => confirmDelete(`¿Borrar las notas de la sesión \"${note.date}\"?`, () => setSessionNotes(sessionNotes.filter(item => item.id !== note.id)))}
                                    aria-label={`Borrar entrada ${note.date}`}
                                >
                                    ×
                                </button>
                            </div>
                            <textarea
                                placeholder="Ej: PNJs, botín y sucesos..."
                                value={note.text}
                                onChange={e => setSessionNotes(sessionNotes.map(item => item.id === note.id ? { ...item, text: e.target.value } : item))}
                            />
                        </article>
                    ))}
                    {sessionNotes.length === 0 && <p className="inventory-diary-empty">El diario está vacío. Pulsa + Nueva entrada para comenzar la crónica.</p>}
                    </div>
                </div>
            )}
        </section>
        </>
        );
    };

    return { InventoryView };
})();
