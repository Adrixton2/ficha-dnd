window.DndSessionModeComponents = (() => {
    const SessionMode = ({ model }) => {
        const { charInfo, level, currentRoom, hp, activeConcentration, activateOnlineTableDock, setDiceRollerOpen, closeSessionMode, conditions, renderVitalityBar, setHp, handleNumInput, calculateAC, formatMod, getModNum, getEffectiveStat, initBonus, requestInitiativeRoll, speed, getPassivePerception, inspiration, setInspiration, guidance, setGuidance, finishConcentration, conditionSymbols, setConditions, leaveSessionFor, setCombatDashboardView, setRestType, setRestModalOpen, tacticalResources, renderUsageDots, setResources, grimoireConfig, setGrimoireConfig, tacticalWeapons, getWeaponAttackBonus, requestWeaponAttackRoll, sessionSpellSlots, tacticalSpells, setCastSpell, companions, openCompanionManager, sessionCompanions, adjustCompanionHp, CompanionAvatar, COMPANION_CATEGORY_LABELS, sessionInventory, adjustInvQty, setDiaryOpen, sessionQuickNote, setSessionQuickNote, saveSessionQuickNote, sessionNotes, openTimerModal, renderTimerList } = model;
        return (
<div data-tab="combat" className="combat-mode-panel session-mode tab-section">
            <header className="session-mode-header">
                <div className="session-mode-emblem" aria-hidden="true"><span>◆</span><i></i></div>
                <div className="session-mode-identity">
                    <small>Centro de juego</small>
                    <h1>{charInfo.name || 'Personaje sin nombre'}</h1>
                    <p>{charInfo.cls || 'Clase sin definir'} · Nivel {level || '1'}{currentRoom ? ` · Mesa ${currentRoom.code}` : ''}</p>
                </div>
                <div className="session-mode-header-state">
                    <span className={Number(hp.current) > 0 ? 'is-ready' : 'is-danger'}><i></i>{Number(hp.current) > 0 ? 'En aventura' : 'Inconsciente'}</span>
                    {activeConcentration && <span className="is-concentrating">C · {activeConcentration.spellName}</span>}
                </div>
                <nav className="session-mode-header-actions" aria-label="Acciones del modo sesión">
                    {currentRoom && <button type="button" onClick={activateOnlineTableDock}><span>◇</span>Mesa online</button>}
                    <button type="button" onClick={() => setDiceRollerOpen(true)}><span>20</span>Dados</button>
                    <button type="button" className="is-exit" onClick={closeSessionMode}><span>↙</span>Volver a la ficha</button>
                </nav>
            </header>

            <nav className="session-mode-jumpbar" aria-label="Secciones del modo sesión">
                {[['vitals','Estado'],['resources','Recursos'],['actions','Acciones'],['magic','Magia'],['companions','Compañeros'],['inventory','Mochila'],['notes','Notas']].map(([id,label]) => <button type="button" key={id} onClick={() => document.getElementById(`session-${id}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })}>{label}</button>)}
            </nav>

            <div className="session-mode-layout">
                <section id="session-vitals" className="session-mode-card session-mode-vitals">
                    <header><div><small>Estado inmediato</small><h2>Tu personaje ahora</h2></div><span>{conditions.length ? `${conditions.length} estado${conditions.length === 1 ? '' : 's'}` : 'Sin condiciones'}</span></header>
                    <div className="session-health">
                        <div className="session-health-heading"><span><small>Puntos de golpe</small><strong>{hp.current || 0}<i>/ {hp.max || 0}</i></strong></span>{Number(hp.temp) > 0 && <b>+{hp.temp} temporales</b>}</div>
                        {renderVitalityBar(false, 'session-health-bar')}
                        <div className="session-health-controls">
                            <button type="button" onClick={() => setHp(previous => ({ ...previous, current: String(Math.max(0, (Number(previous.current) || 0) - 1)) }))} aria-label="Perder un punto de golpe">−1</button>
                            <label><small>Actuales</small><input aria-label="Puntos de golpe actuales" type="number" value={hp.current} onChange={event => setHp(previous => ({ ...previous, current: handleNumInput(event.target.value) }))}/></label>
                            <button type="button" onClick={() => setHp(previous => ({ ...previous, current: String(Math.min(Number(previous.max) || 0, (Number(previous.current) || 0) + 1)) }))} aria-label="Recuperar un punto de golpe">+1</button>
                            <label className="is-temporary"><small>Temporales</small><input aria-label="Puntos de golpe temporales" type="number" value={hp.temp || ''} placeholder="0" onChange={event => setHp(previous => ({ ...previous, temp: handleNumInput(event.target.value) }))}/></label>
                        </div>
                    </div>
                    <div className="session-stat-strip">
                        <article><small>CA</small><strong>{calculateAC()}</strong><span>Defensa</span></article>
                        <article><small>Iniciativa</small><strong>{formatMod(getModNum(getEffectiveStat('des')) + (Number(initBonus) || 0))}</strong><button type="button" onClick={requestInitiativeRoll}>Tirar</button></article>
                        <article><small>Velocidad</small><strong>{speed || '0'}</strong><span>metros</span></article>
                        <article><small>Percepción</small><strong>{getPassivePerception()}</strong><span>pasiva</span></article>
                    </div>
                    <div className="session-support-strip">
                        <button type="button" className={inspiration ? 'is-active is-inspiration' : 'is-inspiration'} onClick={() => setInspiration(!inspiration)}><span>✦</span><div><small>Inspiración</small><strong>{inspiration ? 'Disponible' : 'No disponible'}</strong></div><b>{inspiration ? '✓' : '+'}</b></button>
                        <button type="button" className={guidance ? 'is-active is-guidance' : 'is-guidance'} onClick={() => setGuidance(!guidance)}><span>1d4</span><div><small>Guía</small><strong>{guidance ? 'Activa' : 'No activa'}</strong></div><b>{guidance ? '✓' : '+'}</b></button>
                    </div>
                    {(activeConcentration || conditions.length > 0) && <div className="session-active-states">
                        {activeConcentration && <article className="is-concentration"><span>C</span><div><small>Concentración</small><strong>{activeConcentration.spellName}</strong></div><button type="button" onClick={finishConcentration}>Finalizar</button></article>}
                        {conditions.map(condition => { const name = typeof condition === 'string' ? condition : condition.name; return <article key={name} className="is-condition"><span>{conditionSymbols[name] || '✷'}</span><div><small>Condición</small><strong>{name}</strong></div><button type="button" aria-label={`Quitar ${name}`} onClick={() => setConditions(previous => previous.filter(item => (typeof item === 'string' ? item : item.name) !== name))}>×</button></article>; })}
                    </div>}
                    <footer><button type="button" onClick={() => leaveSessionFor('combat', () => setCombatDashboardView('conditions'))}>Gestionar condiciones</button><button type="button" onClick={() => { setRestType(null); setRestModalOpen(true); }}>Descansar</button></footer>
                </section>

                <section id="session-resources" className="session-mode-card session-mode-resources">
                    <header><div><small>Usos y cargas</small><h2>Recursos</h2></div><button type="button" onClick={() => leaveSessionFor('combat', () => setCombatDashboardView('summary'))}>Ver todos</button></header>
                    <div className="session-resource-list">
                        {tacticalResources.map(resource => <article key={resource.id}><div><small>{resource.recoveryRest === 'short' ? 'Descanso corto' : resource.recoveryRest === 'long' ? 'Descanso largo' : 'Manual'}</small><strong>{resource.name}</strong>{renderUsageDots(resource.current, resource.max, 'text-purple-400')}</div><nav><button type="button" aria-label={`Reducir ${resource.name}`} onClick={() => setResources(previous => previous.map(item => item.id === resource.id ? { ...item, current: Math.max(0, Number(item.current) - 1) } : item))}>−</button><span>{resource.current}<i>/</i>{resource.max}</span><button type="button" aria-label={`Aumentar ${resource.name}`} onClick={() => setResources(previous => previous.map(item => item.id === resource.id ? { ...item, current: Math.min(Number(item.max), Number(item.current) + 1) } : item))}>+</button></nav></article>)}
                        {grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 && <article className="is-pact"><div><small>Descanso corto · Nivel {grimoireConfig.pactSlots.level}</small><strong>Magia de pacto</strong>{renderUsageDots(grimoireConfig.pactSlots.current, grimoireConfig.pactSlots.max, 'text-yellow-300')}</div><nav><button type="button" onClick={() => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: Math.max(0, Number(previous.pactSlots.current) - 1) } }))}>−</button><span>{grimoireConfig.pactSlots.current}<i>/</i>{grimoireConfig.pactSlots.max}</span><button type="button" onClick={() => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: Math.min(Number(previous.pactSlots.max), Number(previous.pactSlots.current) + 1) } }))}>+</button></nav></article>}
                        {!tacticalResources.length && !(grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0) && <div className="session-mode-empty"><span>◇</span><strong>Sin recursos configurados</strong><p>Añade usos de clase desde la pestaña de combate.</p></div>}
                    </div>
                </section>

                <section id="session-actions" className="session-mode-card session-mode-actions">
                    <header><div><small>Arsenal preparado</small><h2>Acciones y ataques</h2></div><button type="button" onClick={() => leaveSessionFor('combat', () => setCombatDashboardView('summary'))}>Abrir arsenal</button></header>
                    <div className="session-action-list">
                        {tacticalWeapons.flatMap(weapon => (weapon.attacks || []).slice(0, 3).map((attack, attackIndex) => <article key={`${weapon.id}_${attackIndex}`}><div><small>{weapon.name}</small><strong>{attack.name || 'Ataque'}</strong><p><span>Ataque {getWeaponAttackBonus(attack, weapon) || '—'}</span><span>Daño {attack.dmg || '—'}</span></p></div><button type="button" onClick={() => requestWeaponAttackRoll(attack, weapon, attackIndex)}><span aria-hidden="true">20</span>Tirar ataque</button></article>))}
                        {!tacticalWeapons.some(weapon => weapon.attacks?.length) && <div className="session-mode-empty"><span>⚔</span><strong>No hay ataques preparados</strong><p>Configura un ataque en el arsenal para usarlo aquí.</p></div>}
                    </div>
                </section>

                <section id="session-magic" className="session-mode-card session-mode-magic">
                    <header><div><small>Conjuros disponibles</small><h2>Magia preparada</h2></div><button type="button" onClick={() => leaveSessionFor('grimoire')}>Abrir grimorio</button></header>
                    {sessionSpellSlots.length > 0 && <div className="session-slot-strip">{sessionSpellSlots.map(([slotLevel,slot]) => <span key={slotLevel}><small>N{slotLevel}</small><strong>{slot.current}/{slot.max}</strong></span>)}</div>}
                    <div className="session-spell-list">
                        {tacticalSpells.slice(0, 8).map(spell => <button type="button" key={spell.id} onClick={() => setCastSpell(spell)}><span className="session-spell-level">{spell.level === 0 ? 'T' : spell.level}</span><span><small>{spell.concentration ? 'Concentración' : spell.ritual ? 'Ritual' : spell.school || 'Conjuro'}</small><strong>{spell.name}</strong></span><b>Lanzar →</b></button>)}
                        {!tacticalSpells.length && <div className="session-mode-empty"><span>✦</span><strong>Sin magia disponible</strong><p>Prepara o aprende conjuros desde el grimorio.</p></div>}
                    </div>
                </section>

                <section id="session-companions" className="session-mode-card session-mode-companions">
                    <header><div><small>Aliados vinculados</small><h2>Compañeros activos</h2></div><button type="button" onClick={() => openCompanionManager()}>{companions.length ? 'Gestionar' : 'Añadir'}</button></header>
                    <div className="session-companion-list">
                        {(sessionCompanions.length ? sessionCompanions : companions.slice(0, 2)).map(companion => { const hpPercent = companion.maxHp > 0 ? Math.max(0, Math.min(100, companion.currentHp / companion.maxHp * 100)) : 0; return <article key={companion.id} className={companion.participates ? 'is-active' : ''}><button type="button" className="session-companion-identity" onClick={() => openCompanionManager(companion.id)}><CompanionAvatar companion={companion}/><span><small>{COMPANION_CATEGORY_LABELS[companion.category]}</small><strong>{companion.name}</strong><em>CA {companion.armorClass ?? '—'} · PV {companion.currentHp}/{companion.maxHp}</em></span></button><i><b style={{ width: `${hpPercent}%` }}/></i><nav><button type="button" onClick={() => adjustCompanionHp(companion.id,-1)}>−1</button><button type="button" onClick={() => openCompanionManager(companion.id)}>Ficha</button><button type="button" onClick={() => adjustCompanionHp(companion.id,1)}>+1</button></nav></article>; })}
                        {!companions.length && <div className="session-mode-empty"><span>♙</span><strong>Sin compañeros</strong><p>Vincula un familiar, montura o aliado para tenerlo a mano.</p></div>}
                    </div>
                </section>

                <section id="session-inventory" className="session-mode-card session-mode-inventory">
                    <header><div><small>Objetos a mano</small><h2>Mochila rápida</h2></div><button type="button" onClick={() => leaveSessionFor('inventory')}>Abrir mochila</button></header>
                    <div className="session-inventory-list">
                        {sessionInventory.map(item => <article key={item.id}><div><small>Cantidad</small><strong>{item.name || 'Objeto'}</strong><p>{item.desc || item.description || 'Sin notas'}</p></div><nav><button type="button" onClick={() => adjustInvQty(item.id,-1)} aria-label={`Reducir ${item.name}`}>−</button><span>{item.qty ?? item.quantity ?? 1}</span><button type="button" onClick={() => adjustInvQty(item.id,1)} aria-label={`Aumentar ${item.name}`}>+</button></nav></article>)}
                        {!sessionInventory.length && <div className="session-mode-empty"><span>◇</span><strong>La mochila está vacía</strong><p>Añade objetos desde Inventario.</p></div>}
                    </div>
                </section>

                <section id="session-notes" className="session-mode-card session-mode-notes">
                    <header><div><small>Memoria de la partida</small><h2>Nota rápida</h2></div><button type="button" onClick={() => leaveSessionFor('inventory', () => setDiaryOpen(true))}>Abrir diario</button></header>
                    <label><span className="sr-only">Nueva nota rápida de sesión</span><textarea value={sessionQuickNote} onChange={event => setSessionQuickNote(event.target.value)} placeholder="PNJ, pista, decisión, botín pendiente…" /></label>
                    <button type="button" className="session-note-save" disabled={!sessionQuickNote.trim()} onClick={saveSessionQuickNote}>Guardar en el diario</button>
                    {sessionNotes.length > 0 && <div className="session-recent-notes"><small>Últimas entradas</small>{sessionNotes.slice(0, 2).map(note => <article key={note.id}><strong>{note.title || note.date || 'Entrada sin título'}</strong><p>{note.text || 'Sin contenido'}</p></article>)}</div>}
                </section>

                <section className="session-mode-card session-mode-timers">
                    <header><div><small>Seguimiento activo</small><h2>Temporizadores</h2></div><button type="button" onClick={() => openTimerModal()}>＋ Añadir</button></header>
                    {renderTimerList()}
                </section>
            </div>
        </div>
        );
    };

    return { SessionMode };
})();
