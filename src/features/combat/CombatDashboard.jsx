(() => {
    const { CombatSectionIcon } = window.DndCharacterSheetComponents;

    function CombatDashboard({ model }) {
        const {
            activeConcentration,
            calculateAC,
            combatConditions,
            combatDashboardView,
            conditionSymbols,
            conditions,
            conditionsManagerOpen,
            finishConcentration,
            formatMod,
            getEffectiveStat,
            getModNum,
            getPassivePerception,
            guidance,
            handleNumInput,
            hitDice,
            hp,
            initBonus,
            inspiration,
            level,
            onlineReconnectState,
            openTimerModal,
            renderAcBreakdown,
            renderAcTemporaryControls,
            renderTimerList,
            renderUsageDots,
            renderVitalityBar,
            requestInitiativeRoll,
            retryRoomConnection,
            setCombatDashboardView,
            setConditions,
            setConditionsManagerOpen,
            setGuidance,
            setHitDice,
            setHp,
            setInitBonus,
            setInspiration
        } = model;

        return (
<div data-tab="combat" className="combat-dashboard tab-section space-y-5">
                            <nav className="combat-dashboard-tabs" aria-label="Secciones de combate">
                                {[
                                    ['summary', 'Resumen'],
                                    ['conditions', 'Condiciones'],
                                    ['timers', 'Temporizadores']
                                ].map(([section, label]) => (
                                    <button
                                        key={section}
                                        type="button"
                                        onClick={() => setCombatDashboardView(section)}
                                        className={`combat-dashboard-tab ${combatDashboardView === section ? 'is-active' : ''}`}
                                        aria-pressed={combatDashboardView === section}
                                    >
                                        <CombatSectionIcon section={section} />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </nav>

                            {activeConcentration && <section className="concentration-banner" role="status"><span className="concentration-banner-sigil" aria-hidden="true">C</span><div className="min-w-0 flex-1"><span className="concentration-banner-kicker">Concentración activa</span><strong>{activeConcentration.spellName}</strong><small>Desde {new Date(activeConcentration.startedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</small></div><button type="button" onClick={finishConcentration}>Finalizar concentración</button></section>}

                        {combatDashboardView === 'summary' && <>
                        {/* TOP BAR: STATS PRINCIPALES (BARRA DE VIDA, CA, ETC) */}
                        <div className="combat-summary-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                            
                            {/* BLOQUE DE VIDA ESTILO VIDEOJUEGO (Ocupa 2 columnas) */}
                            <div className="combat-health-card col-span-2 rpg-panel p-3 flex flex-col justify-center relative overflow-hidden">
                                <div className="flex justify-between items-end mb-1 z-10">
                                    <span className="font-fantasy text-red-400 text-[10px] md:text-sm font-bold uppercase tracking-widest">Salud</span>
                                    <div className="flex items-center space-x-1 font-sans">
                                        <input type="number" placeholder="0" value={hp.current} onChange={e => setHp(p => ({ ...p, current: handleNumInput(e.target.value) }))} className="w-12 bg-transparent text-right text-2xl font-bold text-white outline-none" />
                                        <span className="text-gray-500 text-lg">/</span>
                                        <input type="number" placeholder="0" value={hp.max} onChange={e => setHp(p => ({ ...p, max: handleNumInput(e.target.value) }))} className="w-10 bg-transparent text-left text-lg text-gray-400 outline-none border-b border-transparent hover:border-gray-600 focus:border-red-500" />
                                    </div>
                                </div>
                                
                                {/* Barra Visual Táctil (Draggable) */}
                                {renderVitalityBar(true, 'mt-1')}

                                {/* Vida Temporal Input */}
                                <div className="mt-2 flex items-center justify-between z-10">
                                    <span className="font-fantasy text-cyan-400 text-[10px] font-bold tracking-widest uppercase">Vida Temporal</span>
                                    <div className="flex items-center bg-gray-900/80 rounded-full border border-cyan-800/50 px-2 py-0.5">
                                        <button onClick={() => setHp(p => ({ ...p, temp: String(Math.max(0, (Number(p.temp)||0) - 1)) }))} className="text-gray-500 hover:text-cyan-400 px-1">-</button>
                                        <input type="number" value={hp.temp || ""} placeholder="0" onChange={e => setHp(p => ({ ...p, temp: handleNumInput(e.target.value) }))} className="w-8 bg-transparent text-center text-sm font-bold text-cyan-300 outline-none" />
                                        <button onClick={() => setHp(p => ({ ...p, temp: String((Number(p.temp)||0) + 1) }))} className="text-gray-500 hover:text-cyan-400 px-1">+</button>
                                    </div>
                                </div>
                            </div>

                            {}
                            {/* Dados de Golpe */}
                            <section className="combat-hit-dice-card combat-stat-card rpg-panel">
                                <header><span className="combat-stat-emblem is-die" aria-hidden="true"><i></i><b>{hitDice.type || 'd?'}</b></span><div><small>Recuperación</small><h3>Dados de golpe</h3></div></header>
                                <div className="combat-hit-dice-uses">{renderUsageDots(hitDice.current, level, 'text-cyan-400')}</div>
                                <div className="combat-stat-counter"><button type="button" aria-label="Gastar un dado de golpe" onClick={() => setHitDice(p => ({ ...p, current: String(Math.max(0, (Number(p.current)||0) - 1)) }))}>−</button><label><small>Disponibles</small><span><input aria-label="Dados de golpe actuales" type="number" placeholder="0" value={hitDice.current} onChange={e => setHitDice(p => ({ ...p, current: handleNumInput(e.target.value) }))}/><i>/</i><b>{Number(level)||0}</b></span></label><button type="button" aria-label="Recuperar un dado de golpe" onClick={() => setHitDice(p => ({ ...p, current: String(Math.min(Number(level)||0, (Number(p.current)||0) + 1)) }))}>+</button></div>
                                <label className="combat-hit-die-type"><span>Tipo de dado</span><input aria-label="Tipo de dado de golpe" type="text" placeholder="d8" title="Ej: d8" value={hitDice.type} onChange={e => setHitDice(p => ({...p, type: e.target.value}))}/></label>
                            </section>

                            {/* CA Calculada */}
                            <section className="combat-ac-card combat-stat-card rpg-panel">
                                <header><span className="combat-stat-emblem is-shield" aria-hidden="true"><CombatSectionIcon section="summary" /></span><div><small>Defensa total</small><h3>Clase de armadura</h3></div></header>
                                <div className="combat-ac-value"><small>CA final</small><strong>{calculateAC()}</strong><i></i></div>
                                {renderAcTemporaryControls()}
                                {renderAcBreakdown()}
                            </section>

                            {/* Iniciativa y Percepción (Columna apilada) */}
                            <div className="combat-initiative-stack">
                                <section className="combat-quick-stat is-initiative rpg-panel"><header><span aria-hidden="true">↯</span><div><small>Orden de turno</small><h3>Iniciativa</h3></div></header><div className="combat-quick-stat-value"><strong>{formatMod(getModNum(getEffectiveStat('des')) + (Number(initBonus)||0))}</strong><label><span>Bono adicional</span><input aria-label="Bono adicional de iniciativa" type="number" value={initBonus} onChange={e => setInitBonus(handleNumInput(e.target.value))}/></label></div><button type="button" className="sheet-roll-trigger is-initiative" onClick={requestInitiativeRoll}><span aria-hidden="true">20</span>Tirar iniciativa</button></section>
                                <section className="combat-quick-stat is-perception rpg-panel"><header><span aria-hidden="true">◉</span><div><small>Atención constante</small><h3>Percepción pasiva</h3></div></header><div className="combat-quick-stat-value"><strong>{getPassivePerception()}</strong><p>10 + Sabiduría + competencia</p></div></section>
                            </div>

                            {/* AYUDAS DE TIRADA D&D 5e (2014) */}
                            <section className={`combat-inspiration-card combat-support-card combat-stat-card rpg-panel ${inspiration ? 'is-active' : ''} ${guidance ? 'is-guided' : ''}`}>
                                <header><span className="combat-stat-emblem is-inspiration" aria-hidden="true">✦</span><div><small>Efectos disponibles</small><h3>Ayudas de tirada</h3></div></header>
                                <div className="combat-support-options">
                                    <button type="button" onClick={() => setInspiration(!inspiration)} className={`combat-inspiration-toggle ${inspiration ? 'is-active' : ''}`} title="Gástala antes de tirar para obtener ventaja en un ataque, prueba o salvación." aria-label={`Inspiración ${inspiration ? 'disponible' : 'gastada'}.`}>
                                        <span aria-hidden="true"><i></i><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg></span><div><small>Ventaja narrativa</small><strong>{inspiration ? 'Inspiración disponible' : 'Marcar inspiración'}</strong></div><b>{inspiration ? '✓' : '+'}</b>
                                    </button>
                                    <button type="button" onClick={() => setGuidance(!guidance)} className={`combat-inspiration-toggle combat-guidance-toggle ${guidance ? 'is-active' : ''}`} title="Guía añade 1d4 a una prueba de característica." aria-label={`Guía ${guidance ? 'activa' : 'inactiva'}.`}>
                                        <span aria-hidden="true"><i></i><strong>1d4</strong></span><div><small>Apoyo mágico</small><strong>{guidance ? 'Guía activa' : 'Marcar Guía'}</strong></div><b>{guidance ? '✓' : '+'}</b>
                                    </button>
                                </div>
                                <p className="combat-inspiration-help">Al tirar, la ficha te preguntará si quieres aplicar cada ayuda compatible.</p>
                            </section>

                        </div>

                        </>}

                        {combatDashboardView === 'conditions' && <div className="combat-conditions-panel rpg-panel">
                            <header className="combat-tracker-header"><div className="combat-tracker-heading"><span aria-hidden="true">✷</span><div><small>Estado del personaje</small><h2>Condiciones</h2><p>Registra recordatorios sin aplicar efectos automáticos.</p></div></div><button type="button" onClick={() => setConditionsManagerOpen(value => !value)} className={conditionsManagerOpen ? 'is-active' : ''}><span aria-hidden="true">{conditionsManagerOpen ? '✓' : '+'}</span>{conditionsManagerOpen ? 'Terminar' : 'Editar condiciones'}</button></header>
                            <div className="combat-conditions-body">
                                {conditions.length ? <div className="combat-condition-active-grid">{conditions.map(condition => <button key={condition} onClick={() => setConditions(previous => previous.filter(item => item !== condition))} className="combat-condition-active"><span aria-hidden="true">{conditionSymbols[condition] || '✷'}</span><div><small>Condición activa</small><strong>{condition}</strong></div><i aria-hidden="true">×</i></button>)}</div> : <div className="combat-tracker-empty is-condition"><span aria-hidden="true">◇</span><strong>Sin condiciones activas</strong><p>El personaje no tiene ningún estado adverso registrado.</p></div>}
                                {conditionsManagerOpen && <section className="combat-condition-manager"><header><div><small>Selector de estados</small><h3>Marca las condiciones activas</h3></div><span>{conditions.length} activa{conditions.length === 1 ? '' : 's'}</span></header><div>{combatConditions.map(condition => { const active = conditions.includes(condition); return <button type="button" key={condition} aria-pressed={active} onClick={() => setConditions(previous => active ? previous.filter(item => item !== condition) : [...previous, condition])} className={active ? 'is-active' : ''}><span aria-hidden="true">{conditionSymbols[condition] || '✷'}</span><strong>{condition}</strong><i aria-hidden="true">{active ? '✓' : '+'}</i></button>; })}</div></section>}
                            </div>
                        </div>}

                        {combatDashboardView === 'timers' && <div className="combat-timers-panel rpg-panel">
                            <header className="combat-tracker-header"><div className="combat-tracker-heading"><span aria-hidden="true">⌛</span><div><small>Seguimiento de duración</small><h2>Temporizadores</h2><p>Controla efectos por turnos, rondas o tiempo real.</p></div></div><button type="button" onClick={() => openTimerModal()}><span aria-hidden="true">+</span>Nuevo temporizador</button></header>
                            <div className="combat-timers-body">{renderTimerList(true)}</div>
                        </div>}

                        {onlineReconnectState.message && <div className={`flex flex-wrap items-center justify-between gap-3 rounded border px-3 py-2 text-sm ${onlineReconnectState.status === 'error' ? 'border-yellow-800 bg-yellow-950/30 text-yellow-100' : 'border-cyan-800 bg-cyan-950/25 text-cyan-100'}`}><span>{onlineReconnectState.message}</span>{onlineReconnectState.status === 'error' && <button type="button" onClick={retryRoomConnection} className="min-h-9 px-3 rounded border border-cyan-700 text-xs text-cyan-100">Reintentar conexión</button>}</div>}

                        </div>
        );
    }

    window.DndCombatDashboardComponents = { CombatDashboard };
})();
