(() => {
    function ActionDialogs({ model }) {
        const {
            bestiary,
            bestiaryEnemyDraft,
            bestiaryEnemyQuery,
            bestiaryEnemySelectorOpen,
            bestiaryEnemyTag,
            castSpell,
            castWithSlot,
            closeConfirm,
            confirmDelete,
            confirmDialog,
            createEnemyFromBestiaryDraft,
            creatingEnemy,
            editingSlotLevel,
            enemySourceChoiceOpen,
            formatSheetRollFormula,
            getSpellResolution,
            getSrdSpellDiceDetails,
            grimoireConfig,
            notesModalOpen,
            openBestiaryEnemyDraft,
            openDirectEnemyModal,
            resolveSpellCastDice,
            sessionNotes,
            setBestiaryCompendiumOpen,
            setBestiaryCompendiumPreview,
            setBestiaryEnemyDraft,
            setBestiaryEnemyQuery,
            setBestiaryEnemySelectorOpen,
            setBestiaryEnemyTag,
            setCastSpell,
            setEditingSlotLevel,
            setEnemySourceChoiceOpen,
            setNotesModalOpen,
            setSessionNotes,
            setSpellCastAnimation,
            setSpellSlots,
            spellCastAnimation,
            spellSaveDc,
            spellSlots,
            srdMonsterCompendium,
            updateBestiaryEnemyCopies
        } = model;

        return <>
{castSpell && (
                            <div className="cast-spell-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setCastSpell(null)}>
                                <div className="cast-spell-dialog rpg-panel p-5 max-w-md w-full" onClick={event => event.stopPropagation()}>
                                    <div className="cast-spell-title"><span>{castSpell.level === 0 ? 'T' : castSpell.level}<small>{castSpell.level === 0 ? 'Truco' : 'Nivel'}</small></span><div><small>Preparar lanzamiento</small><h3>{castSpell.name}</h3><p>{castSpell.concentration ? 'Requiere concentración' : 'Selecciona el recurso que quieres consumir'}</p></div><button type="button" onClick={() => setCastSpell(null)} aria-label="Cerrar">×</button></div>
                                    {(() => {
                                        const resolution = getSpellResolution(castSpell);
                                        const diceDetails = getSrdSpellDiceDetails(castSpell);
                                        return Boolean(resolution.usesSpellAttack || resolution.savingAbility || diceDetails.length) && <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded border border-purple-700 bg-purple-950/20 px-2 py-1 text-purple-100">La tirada opcional aparecerá después del lanzamiento y se ajustará a la ranura elegida.</span>{resolution.savingAbility && <span className="rounded border border-cyan-700 bg-cyan-950/20 px-2 py-1 text-cyan-100">Salvación de {resolution.savingAbility}{spellSaveDc === null ? '' : ` · CD ${spellSaveDc}`}</span>}</div>;
                                    })()}
                                    {castSpell.castingResource === 'independent' ? <div className="cast-resource-panel"><span>Usos propios</span><strong>{castSpell.ownUsesCurrent}<small>/ {castSpell.ownUsesMax}</small></strong><p>No consume ranuras de conjuro.</p><button disabled={Number(castSpell.ownUsesCurrent) <= 0} onClick={() => castWithSlot(0)} className="cast-confirm-button">Usar conjuro</button></div> : castSpell.castingResource === 'at-will' || castSpell.level === 0 ? <div className="cast-resource-panel"><span>Lanzamiento a voluntad</span><strong>∞</strong><p>No consume ranuras de conjuro.</p><button onClick={() => castWithSlot(0)} className="cast-confirm-button">Lanzar ahora</button></div> : <div className="cast-slot-picker"><div className="cast-slot-picker-heading"><div><span>Recurso de lanzamiento</span><strong>Elige una ranura</strong></div><small>Nivel mínimo {castSpell.level}</small></div>{[1,2,3,4,5,6,7,8,9].filter(level => level >= castSpell.level && Number(spellSlots[level].current) > 0).map(level => <button key={level} onClick={() => castWithSlot(level)} className="cast-slot-option"><span>{level}<small>Nivel</small></span><div><strong>Ranura arcana</strong><small>{level === castSpell.level ? 'Potencia base' : `Potenciada +${level - castSpell.level}`}</small></div><div className="cast-slot-status"><span>{Array.from({ length: Math.max(0, Number(spellSlots[level].max) || 0) }, (_, index) => <i key={index} className={index < Number(spellSlots[level].current) ? 'is-filled' : ''}></i>)}</span><small>{spellSlots[level].current} disponibles</small></div></button>)}{grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.current) > 0 && Number(grimoireConfig.pactSlots.level) >= castSpell.level && <button onClick={() => castWithSlot(grimoireConfig.pactSlots.level, true)} className="cast-slot-option is-pact"><span>{grimoireConfig.pactSlots.level}<small>Pacto</small></span><div><strong>Magia de pacto</strong><small>Recuperación corta</small></div><div className="cast-slot-status"><span>{Array.from({ length: Math.max(0, Number(grimoireConfig.pactSlots.max) || 0) }, (_, index) => <i key={index} className={index < Number(grimoireConfig.pactSlots.current) ? 'is-filled' : ''}></i>)}</span><small>{grimoireConfig.pactSlots.current} disponibles</small></div></button>}<button onClick={() => setCastSpell(null)} className="cast-cancel-button">Cancelar lanzamiento</button></div>}
                                </div>
                            </div>
                        )}

                        {spellCastAnimation && (() => {
                            const { spell, slotLevel, pact, schoolText, schoolKey, rollPlan } = spellCastAnimation;
                            const components = [spell.compV && 'V', spell.compS && 'S', spell.compM && 'M'].filter(Boolean);
                            const resourceLabel = spell.castingResource === 'independent' ? 'Uso propio consumido' : spell.castingResource === 'at-will' || Number(spell.level) === 0 ? 'Lanzamiento a voluntad' : pact ? `Ranura de pacto · nivel ${slotLevel}` : `Ranura arcana · nivel ${slotLevel}`;
                            return <div className="spell-cast-ceremony" data-school={schoolKey} role="dialog" aria-modal="true" aria-label={`Lanzando ${spell.name}`} onClick={() => setSpellCastAnimation(null)}>
                                <div className="spell-cast-particles" aria-hidden="true">{Array.from({length:14},(_,index) => <i key={index}></i>)}</div>
                                <div className="spell-cast-stage" onClick={event => event.stopPropagation()}>
                                    <div className="spell-cast-sigil" aria-hidden="true"><i className="ring-one"></i><i className="ring-two"></i><i className="ring-three"></i><span>{schoolText.trim().slice(0,1).toLocaleUpperCase('es')}</span></div>
                                    <div className="spell-cast-copy"><small>{schoolText}</small><h2>{spell.name}</h2><p>{Number(spell.level) === 0 ? 'Truco' : `Conjuro de nivel ${spell.level}`}{slotLevel > Number(spell.level) ? ` · Potenciado a nivel ${slotLevel}` : ''}</p></div>
                                    <div className="spell-cast-details"><span className="spell-cast-resource">{resourceLabel}</span>{components.length > 0 && <span className="spell-cast-components">{components.map(component => <i key={component}>{component}</i>)}</span>}{spell.concentration && <span className="spell-cast-concentration">Concentración activa</span>}</div>
                                    <div className="spell-cast-progress" aria-hidden="true"><i></i></div>
                                    <div className="spell-cast-phase" aria-hidden="true"><span>Canalizando poder</span><strong>Conjuro lanzado</strong></div>
                                    <div className="spell-cast-actions">
                                        {rollPlan?.canRoll && <button type="button" className="is-roll" onClick={() => resolveSpellCastDice(spellCastAnimation)}><span aria-hidden="true">✦</span>{rollPlan.usesSpellAttack && rollPlan.attackCount > 1 ? `Resolver ${rollPlan.attackCount} ataques` : `Tirar ${formatSheetRollFormula(rollPlan.formula, rollPlan.modifiers)}`}</button>}
                                        <button type="button" onClick={() => setSpellCastAnimation(null)}>{rollPlan?.canRoll ? 'Continuar sin tirar' : 'Continuar'}</button>
                                    </div>
                                </div>
                            </div>;
                        })()}

                        {editingSlotLevel && (() => {
                            const slot = spellSlots[editingSlotLevel] || { current: 0, max: 0 };
                            const maximum = Math.max(0, Number(slot.max) || 0);
                            const available = Math.max(0, Math.min(maximum, Number(slot.current) || 0));
                            const updateSlot = (nextCurrent, nextMaximum = maximum) => setSpellSlots(previous => ({
                                ...previous,
                                [editingSlotLevel]: {
                                    ...previous[editingSlotLevel],
                                    max: Math.max(0, nextMaximum),
                                    current: Math.max(0, Math.min(Math.max(0, nextMaximum), nextCurrent))
                                }
                            }));
                            return <div className="slot-editor-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setEditingSlotLevel(null)}>
                                <div className="slot-editor-dialog rpg-panel w-full max-w-sm" onClick={event => event.stopPropagation()}>
                                    <header className="slot-editor-heading">
                                        <span>{editingSlotLevel}<small>Nivel</small></span>
                                        <div><small>Gestión de ranuras</small><h3>Magia de nivel {editingSlotLevel}</h3></div>
                                        <button type="button" onClick={() => setEditingSlotLevel(null)} aria-label="Cerrar">×</button>
                                    </header>
                                    <section className="slot-editor-body">
                                        <div className="slot-editor-summary"><span>Ranuras disponibles</span><strong>{available}<small> de {maximum}</small></strong><p>{maximum ? `${maximum - available} ${maximum - available === 1 ? 'ranura gastada' : 'ranuras gastadas'}` : 'Este nivel todavía no tiene ranuras.'}</p></div>
                                        <div className="slot-editor-diamonds" aria-label={`${available} de ${maximum} ranuras disponibles`}>
                                            {Array.from({ length: maximum }, (_, index) => <button type="button" key={index} className={index < available ? 'is-filled' : ''} onClick={() => updateSlot(index < available ? index : index + 1)} aria-label={`Dejar ${index + 1} ranuras disponibles`}><i></i></button>)}
                                            {!maximum && <span>Define un máximo para comenzar</span>}
                                        </div>
                                        <div className="slot-editor-actions">
                                            <button type="button" disabled={!available} onClick={() => updateSlot(available - 1)}><b>−</b><span>Gastar una</span></button>
                                            <button type="button" disabled={available >= maximum} onClick={() => updateSlot(available + 1)}><b>+</b><span>Recuperar una</span></button>
                                        </div>
                                        <button type="button" className="slot-editor-restore" disabled={!maximum || available === maximum} onClick={() => updateSlot(maximum)}>Restaurar todas las ranuras</button>
                                        <div className="slot-editor-maximum"><div><span>Máximo de ranuras</span><small>Cámbialo solo si tu progresión lo requiere.</small></div><button type="button" disabled={!maximum} onClick={() => updateSlot(Math.min(available, maximum - 1), maximum - 1)}>−</button><strong>{maximum}</strong><button type="button" onClick={() => updateSlot(available, maximum + 1)}>+</button></div>
                                    </section>
                                    <button type="button" className="slot-editor-done" onClick={() => setEditingSlotLevel(null)}>Guardar y cerrar</button>
                                </div>
                            </div>;
                        })()}

                        {notesModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setNotesModalOpen(false)}>
                                <div className="rpg-panel p-6 max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl animate-attack border border-purple-500/50" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                                        <h3 className="text-2xl font-fantasy font-bold text-purple-200 flex items-center tracking-widest"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> Diario de Campaña</h3>
                                        <div className="flex space-x-4 items-center">
                                            <button onClick={() => setSessionNotes([{ id: 'note_' + Date.now(), date: new Date().toLocaleDateString(), text: "" }, ...sessionNotes])} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded font-bold shadow-md transition-colors font-fantasy uppercase tracking-wider text-xs border border-purple-500">+ Nueva Entrada</button>
                                            <button onClick={() => setNotesModalOpen(false)} className="text-gray-400 hover:text-white text-3xl leading-none transition-colors">&times;</button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                                        {sessionNotes.map((note) => (
                                            <div key={note.id} className="bg-gray-900/60 p-5 rounded-lg border border-gray-700 relative group shadow-inner">
                                                <input type="text" placeholder="Ej: Sesión 1" value={note.date} onChange={e => setSessionNotes(sessionNotes.map(n => n.id === note.id ? {...n, date: e.target.value} : n))} className="bg-transparent border-b border-gray-600 text-purple-300 font-bold mb-4 outline-none focus:border-purple-400 w-1/2 font-fantasy tracking-wider" />
                                                <textarea value={note.text} onChange={e => setSessionNotes(sessionNotes.map(n => n.id === note.id ? {...n, text: e.target.value} : n))} placeholder="Ej: PNJs, botín y sucesos..." className="w-full bg-gray-950 border border-gray-800 rounded p-4 text-gray-300 text-sm outline-none focus:border-purple-500 min-h-[200px] resize-y leading-relaxed" />
                                                <button onClick={() => confirmDelete(`¿Borrar las notas de la sesión "${note.date}"?`, () => setSessionNotes(sessionNotes.filter(n => n.id !== note.id)))} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 font-bold transition-opacity text-xl">×</button>
                                            </div>
                                        ))}
                                        {sessionNotes.length === 0 && <div className="text-center text-gray-600 italic mt-10 font-fantasy text-lg tracking-widest uppercase">El diario está vacío.</div>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONFIRMAR BORRADO */}
                        {enemySourceChoiceOpen && <div className="enemy-source-overlay" onClick={() => setEnemySourceChoiceOpen(false)}><article className="enemy-source-dialog" role="dialog" aria-modal="true" aria-labelledby="enemy-source-title" onClick={event => event.stopPropagation()}><header><span aria-hidden="true">♞</span><div><small>Preparación del encuentro</small><h3 id="enemy-source-title">Añadir enemigos</h3><p>Elige de dónde quieres obtener la criatura.</p></div><button type="button" onClick={() => setEnemySourceChoiceOpen(false)} aria-label="Cerrar">×</button></header><div className="enemy-source-options"><button type="button" className="is-compendium" onClick={() => { setEnemySourceChoiceOpen(false); setBestiaryCompendiumPreview(null); setBestiaryCompendiumOpen(true); }}><span aria-hidden="true">◈</span><span><small>Biblioteca oficial</small><strong>Compendio de criaturas</strong><em>Elige entre {srdMonsterCompendium.monsters.length} criaturas SRD y añádela directamente.</em></span><b>Explorar →</b></button><button type="button" className="is-bestiary" onClick={() => { setEnemySourceChoiceOpen(false); setBestiaryEnemyQuery(''); setBestiaryEnemyTag(''); setBestiaryEnemySelectorOpen(true); }}><span aria-hidden="true">♜</span><span><small>Tu colección</small><strong>Bestiario personal</strong><em>{bestiary.monsters.length ? `${bestiary.monsters.length} plantillas guardadas y personalizadas.` : 'Todavía no tienes plantillas guardadas.'}</em></span><b>Abrir →</b></button><button type="button" className="is-manual" onClick={openDirectEnemyModal}><span aria-hidden="true">＋</span><span><small>Creación rápida</small><strong>Enemigo puntual</strong><em>Introduce solo los datos necesarios para esta escena.</em></span><b>Crear →</b></button></div><footer><p>Las criaturas del compendio no se guardan en tu bestiario salvo que tú lo decidas.</p><button type="button" onClick={() => setEnemySourceChoiceOpen(false)}>Cancelar</button></footer></article></div>}

                        {bestiaryEnemySelectorOpen && (() => { const tags = [...new Set(bestiary.monsters.flatMap(monster => monster.tags))].sort(); const query = bestiaryEnemyQuery.trim().toLocaleLowerCase('es'); const monsters = bestiary.monsters.filter(monster => (!query || monster.name.toLocaleLowerCase('es').includes(query) || monster.tags.some(tag => tag.toLocaleLowerCase('es').includes(query))) && (!bestiaryEnemyTag || monster.tags.includes(bestiaryEnemyTag))); return <div className="enemy-library-overlay" onClick={() => setBestiaryEnemySelectorOpen(false)}><article className="enemy-library-dialog" role="dialog" aria-modal="true" aria-labelledby="enemy-library-title" onClick={event => event.stopPropagation()}><header><span aria-hidden="true">♜</span><div><small>Tu colección · {bestiary.monsters.length} plantillas</small><h3 id="enemy-library-title">Bestiario personal</h3><p>Selecciona una plantilla y configura después sus copias e iniciativas.</p></div><button type="button" onClick={() => setBestiaryEnemySelectorOpen(false)} aria-label="Cerrar">×</button></header><div className="enemy-library-filters"><label><span>⌕</span><input autoFocus value={bestiaryEnemyQuery} onChange={event => setBestiaryEnemyQuery(event.target.value)} placeholder="Buscar por nombre o etiqueta…" /></label><select value={bestiaryEnemyTag} onChange={event => setBestiaryEnemyTag(event.target.value)}><option value="">Todas las etiquetas</option>{tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}</select></div><div className="enemy-library-results">{monsters.map(monster => <button key={monster.id} type="button" onClick={() => openBestiaryEnemyDraft(monster)}><span className="enemy-library-results__avatar">{monster.avatarDataUrl ? <img src={monster.avatarDataUrl} alt="" /> : monster.name.slice(0, 1).toUpperCase()}</span><span><small>{monster.tags?.slice(0, 2).join(' · ') || 'Criatura personalizada'}</small><strong>{monster.name}</strong><em>PV {monster.maxHp} · CA {monster.armorClass ?? '—'}</em></span><b>Preparar →</b></button>)}{!monsters.length && <div className="enemy-library-empty"><span aria-hidden="true">◇</span><strong>{bestiary.monsters.length ? 'Sin coincidencias' : 'Tu bestiario está vacío'}</strong><p>{bestiary.monsters.length ? 'Prueba con otro nombre o etiqueta.' : 'Puedes usar el Compendio SRD o crear un enemigo puntual.'}</p>{!bestiary.monsters.length && <button type="button" onClick={() => { setBestiaryEnemySelectorOpen(false); setBestiaryCompendiumOpen(true); }}>Abrir compendio</button>}</div>}</div></article></div>; })()}

                        {bestiaryEnemyDraft && (
                            <div className="enemy-template-overlay">
                                <article className="enemy-template-dialog" role="dialog" aria-modal="true" aria-labelledby="enemy-template-title">
                                    <header className="enemy-template-header">
                                        <span className="enemy-template-emblem" aria-hidden="true">♞<i /></span>
                                        <div>
                                            <small>{bestiaryEnemyDraft.sourceLabel || 'Bestiario'} · Incorporación a la mesa</small>
                                            <h3 id="enemy-template-title">Preparar aparición</h3>
                                            <p>Define cuántas copias entran, cómo se llaman y su posición inicial.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setBestiaryEnemyDraft(null)}
                                            aria-label="Cerrar configuración de la aparición"
                                        >
                                            ×
                                        </button>
                                    </header>
                                    <div className="enemy-template-summary"><span><small>Plantilla</small><strong>{bestiaryEnemyDraft.name || 'Sin nombre'}</strong></span><span><small>Copias</small><strong>{bestiaryEnemyDraft.quantity || 1}</strong></span><span><small>PV por copia</small><strong>{bestiaryEnemyDraft.maxHp || 0}</strong></span><span><small>Defensa</small><strong>CA {bestiaryEnemyDraft.armorClass || '—'}</strong></span></div>

                                    <div className="enemy-template-body">
                                        <section className="enemy-template-section is-identity">
                                            <header><span>1</span><div><small>Identidad y defensa</small><h4>Datos de la aparición</h4></div></header>
                                            <div className="enemy-template-fields is-identity">
                                                <label className="text-sm text-gray-300">
                                                    Nombre base
                                                    <input
                                                        value={bestiaryEnemyDraft.name}
                                                        onChange={event => setBestiaryEnemyDraft(previous => ({ ...previous, name: event.target.value }))}
                                                        className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-white"
                                                    />
                                                </label>
                                                <label className="text-sm text-gray-300">
                                                    PV máximos
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        inputMode="numeric"
                                                        value={bestiaryEnemyDraft.maxHp}
                                                        onChange={event => setBestiaryEnemyDraft(previous => ({ ...previous, maxHp: event.target.value }))}
                                                        className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
                                                    />
                                                </label>
                                                <label className="text-sm text-gray-300">
                                                    CA
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        inputMode="numeric"
                                                        value={bestiaryEnemyDraft.armorClass}
                                                        onChange={event => setBestiaryEnemyDraft(previous => ({ ...previous, armorClass: event.target.value }))}
                                                        className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
                                                    />
                                                </label>
                                            </div>
                                            <p className="enemy-template-hint">Cada copia empieza con todos sus PV y sin puntos de golpe temporales.</p>
                                        </section>

                                        <section className="enemy-template-section is-copies">
                                            <header><span>2</span><div><small>Composición del grupo</small><h4>Copias y nombres</h4></div></header>
                                            <div className="enemy-template-fields">
                                                <label className="text-sm text-gray-300">
                                                    Cantidad
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="50"
                                                        inputMode="numeric"
                                                        value={bestiaryEnemyDraft.quantity}
                                                        onChange={event => updateBestiaryEnemyCopies({ quantity: event.target.value })}
                                                        onBlur={() => {
                                                            if (bestiaryEnemyDraft.quantity === '') updateBestiaryEnemyCopies({ quantity: 1 });
                                                        }}
                                                        className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
                                                    />
                                                </label>
                                                <label className="text-sm text-gray-300">
                                                    Nombres
                                                    <select
                                                        value={bestiaryEnemyDraft.nameMode}
                                                        onChange={event => updateBestiaryEnemyCopies({ nameMode: event.target.value })}
                                                        className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-white"
                                                    >
                                                        <option value="letters">Letras</option>
                                                        <option value="numbers">Números</option>
                                                        <option value="manual">Manual</option>
                                                        <option value="same">Mismo nombre</option>
                                                    </select>
                                                </label>
                                            </div>
                                            <div className="enemy-template-copy-list">
                                                {bestiaryEnemyDraft.copyNames.map((copyName, index) => (
                                                    <label key={index}>
                                                        <span>{index + 1}</span>
                                                        <input
                                                            disabled={bestiaryEnemyDraft.nameMode !== 'manual'}
                                                            value={copyName}
                                                            onChange={event => setBestiaryEnemyDraft(previous => ({
                                                                ...previous,
                                                                copyNames: previous.copyNames.map((item, itemIndex) => itemIndex === index ? event.target.value : item)
                                                            }))}
                                                            className="min-h-10 min-w-0 flex-1 rounded border border-gray-700 bg-gray-900 px-3 text-white disabled:cursor-default disabled:opacity-70"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </section>

                                        <section className="enemy-template-section is-initiative">
                                            <header><span>3</span><div><small>Entrada en combate</small><h4>Iniciativas</h4></div></header>
                                            <div className="enemy-template-dexterity"><span>DES</span><strong>{bestiaryEnemyDraft.dexterity ?? 10}</strong><small>Modificador {window.DndOnlineTableUtils.formatOnlineModifier(window.DndOnlineTableUtils.calculateAbilityModifier(bestiaryEnemyDraft.dexterity ?? 10))}</small></div>
                                            <label className="enemy-template-mode">
                                                Modo de iniciativa
                                                <select
                                                    value={bestiaryEnemyDraft.initiativeMode}
                                                    onChange={event => setBestiaryEnemyDraft(previous => ({ ...previous, initiativeMode: event.target.value }))}
                                                    className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-white"
                                                >
                                                    <option value="none">Tirar después en Preparar encuentro</option>
                                                    <option value="same">Introducir una iniciativa manual</option>
                                                    {Number(bestiaryEnemyDraft.quantity) > 1 && <option value="manual">Manual por copia</option>}
                                                </select>
                                            </label>

                                            {bestiaryEnemyDraft.initiativeMode === 'same' && (
                                                <div className="enemy-template-single-initiative">
                                                    <label>
                                                        Iniciativa
                                                        <input
                                                            type="number"
                                                            inputMode="numeric"
                                                            value={bestiaryEnemyDraft.initiative}
                                                            onChange={event => setBestiaryEnemyDraft(previous => ({
                                                                ...previous,
                                                                initiative: event.target.value,
                                                                copyInitiatives: previous.copyInitiatives.map(() => event.target.value)
                                                            }))}
                                                            placeholder="Ej. 14"
                                                            className="mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
                                                        />
                                                    </label>
                                                </div>
                                            )}

                                            {Number(bestiaryEnemyDraft.quantity) > 1 && bestiaryEnemyDraft.initiativeMode === 'manual' && (
                                                <div className="enemy-template-initiative-list">
                                                    {bestiaryEnemyDraft.copyNames.map((copyName, index) => (
                                                        <label key={index}>
                                                            <span className="truncate">{copyName}</span>
                                                            <input
                                                                type="number"
                                                                inputMode="numeric"
                                                                value={bestiaryEnemyDraft.copyInitiatives?.[index] ?? ''}
                                                                onChange={event => setBestiaryEnemyDraft(previous => ({
                                                                    ...previous,
                                                                    copyInitiatives: previous.copyInitiatives.map((value, valueIndex) => valueIndex === index ? event.target.value : value)
                                                                }))}
                                                                placeholder="Iniciativa"
                                                                className="min-h-10 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
                                                            />
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {bestiaryEnemyDraft.initiativeMode === 'none' && (
                                                <p className="enemy-template-warning">Se crearán sin iniciativa. En Preparar encuentro podrás tirar un d20 común o uno por enemigo; la app sumará su modificador de DES.</p>
                                            )}
                                        </section>
                                    </div>

                                    <footer className="enemy-template-footer"><p><span aria-hidden="true">◆</span> Se añadirán a esta sala; la plantilla original no se modificará.</p><button type="button" onClick={() => setBestiaryEnemyDraft(null)}>Cancelar</button><button type="button" className="is-primary" disabled={creatingEnemy} onClick={createEnemyFromBestiaryDraft}>{creatingEnemy ? <><i /> Creando aparición…</> : <>Añadir {Number(bestiaryEnemyDraft.quantity) > 1 ? `${bestiaryEnemyDraft.quantity} enemigos` : 'enemigo'} <b aria-hidden="true">→</b></>}</button></footer>
                                </article>
                            </div>
                        )}

                        {confirmDialog.isOpen && (
                            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                                <div className={`rpg-panel border ${confirmDialog.isAlert ? 'border-fuchsia-600' : 'border-red-600'} rounded-lg p-6 max-w-sm w-full shadow-2xl animate-attack`}>
                                    <h3 className="text-xl font-fantasy font-bold text-white mb-2 tracking-widest uppercase">{confirmDialog.isAlert ? 'Aviso del Sistema' : 'Confirmar Acción'}</h3>
                                    <p className="text-gray-300 text-sm mb-8 leading-relaxed">{confirmDialog.message}</p>
                                    <div className="flex justify-end space-x-3">
                                        {!confirmDialog.isAlert && (
                                            <button onClick={closeConfirm} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded font-bold transition-colors text-xs uppercase tracking-wider">Cancelar</button>
                                        )}
                                        <button onClick={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); closeConfirm(); }} className={`px-4 py-2 text-white rounded font-bold transition-colors text-xs uppercase tracking-wider border ${confirmDialog.isAlert || confirmDialog.confirmTone === 'primary' ? 'bg-fuchsia-700 hover:bg-fuchsia-600 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-red-700 hover:bg-red-600 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]'}`}>
                                            {confirmDialog.confirmLabel || (confirmDialog.isAlert ? 'Entendido' : 'Eliminar')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MODAL HABILIDADES */}
        </>;
    }

    window.DndActionDialogComponents = { ActionDialogs };
})();
