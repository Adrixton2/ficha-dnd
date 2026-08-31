(() => {
    const { AbilityGlyph, CharacterSectionGlyph, CombatSectionIcon } = window.DndCharacterSheetComponents;
    const { COMPANION_CATEGORY_LABELS, COMPANION_INITIATIVE_LABELS, CompanionAvatar } = window.DndCompanionComponents;
    const { InventoryView } = window.DndInventoryViewComponents;
    const { ArcaneCompendiumView } = window.DndSpellbookComponents;

    function CharacterWorkspace({ model }) {
        const {
            ABILITY_NAMES,
            PROF_BONUS,
            SKILLS,
            SPELLCASTING_ABILITIES,
            activeConcentration,
            activeTab,
            addCurrency,
            addSpellFromSrdLibrary,
            addSuggestedClassResources,
            adjustCompanionHp,
            adjustInvQty,
            ammoSettingsOpen,
            armors,
            automaticSpells,
            bestiary,
            cantripCount,
            charInfo,
            combatDashboardView,
            companions,
            confirmDelete,
            currency,
            currentRoom,
            deathSaves,
            diaryCategory,
            diaryOpen,
            diarySearch,
            displayedSpells,
            displayedSrdSpells,
            displayedTraits,
            editingDiaryEntry,
            feats,
            finishConcentration,
            formatMod,
            getEffectiveStat,
            getModNum,
            getSpellGrantSummary,
            getSpellIconColor,
            getSpellIconPath,
            getWeaponAttackBonus,
            getWeaponAttackFormula,
            grimoireConfig,
            grimoireSettingsOpen,
            grimoireView,
            grimorioSpells,
            handleBoundedNumInput,
            handleNumInput,
            handleResourcePointerDown,
            handleResourcePointerEnd,
            handleResourcePointerMove,
            hasSavingThrowProficiency,
            hasSkillExpertise,
            hasSkillProficiency,
            hp,
            inventory,
            isCurrentRoomMaster,
            isSrdClassFilterActive,
            isStealthDisadvantaged,
            knownSpellCount,
            markDeathSave,
            openAddWeaponAttack,
            openCompanionManager,
            openOnlineTable,
            preparedSpellCount,
            renderUsageDots,
            requestAbilityCheckRoll,
            requestSavingThrowRoll,
            requestSkillRoll,
            requestWeaponAttackRoll,
            requestWeaponDamageRoll,
            resetDeathSaves,
            resourceCardRefs,
            resourceDrag,
            resourceGridRef,
            resourcePressRef,
            resources,
            restoreSpellOwnUses,
            roomParticipants,
            selectedWeapon,
            selectedWeaponAmmo,
            selectedWeaponId,
            sessionNotes,
            setAddModal,
            setAmmoSettingsOpen,
            setArmors,
            setBestiaryCompendiumOpen,
            setCastSpell,
            setDiaryCategory,
            setDiaryOpen,
            setDiarySearch,
            setDiceRollerOpen,
            setEditingDiaryEntry,
            setEditingSlotLevel,
            setEquipmentCompendiumOpen,
            setFeatCompendiumOpen,
            setFeats,
            setGrimoireConfig,
            setGrimoireGuideOpen,
            setGrimoireSettingsOpen,
            setGrimoireView,
            setInventory,
            setResources,
            setSelectedWeaponId,
            setSessionNotes,
            setShowEmptySlots,
            setSize,
            setSkillModal,
            setSpeed,
            setSpellFilter,
            setSpellSearch,
            setSpells,
            setSrdSpellClassFilter,
            setSrdSpellDetail,
            setSrdSpellLevel,
            setSrdSpellSchool,
            setSrdSpellSearch,
            setSrdSpellTrait,
            setStats,
            setTempStats,
            setTools,
            setTraits,
            setWeapons,
            showAlert,
            showEmptySlots,
            size,
            speed,
            spellAttackBonus,
            spellFilter,
            spellSaveDc,
            spellSearch,
            spellSlots,
            spellWorkflow,
            spellWorkflowCopy,
            spellcastingAbility,
            spellcastingAbilityName,
            spellcastingModifier,
            spells,
            spendWeaponAmmo,
            srdMonsterCompendium,
            srdProfileCantrips,
            srdProfileHasSpellcasting,
            srdProfileKnownLimit,
            srdProfileMaxSpellLevel,
            srdProfilePreparedLimit,
            srdSpellClassFilter,
            srdSpellLevel,
            srdSpellLibrary,
            srdSpellSchool,
            srdSpellSchools,
            srdSpellSearch,
            srdSpellTrait,
            srdSpellcastingLevel,
            srdSpellcastingProfile,
            stats,
            stealthDisadvantageArmor,
            suggestedClassResources,
            tempStats,
            toggleArmorEquip,
            toggleSavingThrow,
            toggleSpellKnown,
            toggleSpellPreparation,
            tools,
            traits,
            updateCompanion,
            updateCurrencyAmount,
            updateWeaponAmmo,
            weapons
        } = model;

        return <>
<div data-tab="character" data-accent="violet" className="character-physical-profile tab-section">
                            <label className="character-physical-stat is-speed">
                                <span className="character-physical-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17h5l2-3 2 2 3-5 4-2M5 12h4M3 8h7"/><path d="m17 5 3 4-4 2"/></svg></span>
                                <span className="character-physical-copy"><small>Movimiento</small><strong>Velocidad</strong><em>Distancia por turno</em></span>
                                <span className="character-physical-value"><input aria-label="Velocidad en pies" type="number" inputMode="numeric" placeholder="30" title="Ejemplo: 30 pies" value={speed} onChange={e => setSpeed(handleNumInput(e.target.value))}/><b>ft</b></span>
                            </label>
                            <label className="character-physical-stat is-size">
                                <span className="character-physical-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"/><circle cx="12" cy="9" r="2.5"/><path d="M7.5 18c.6-3.1 2-4.5 4.5-4.5s3.9 1.4 4.5 4.5"/></svg></span>
                                <span className="character-physical-copy"><small>Físico</small><strong>Tamaño</strong><em>Categoría corporal</em></span>
                                <span className="character-physical-value is-text"><input aria-label="Tamaño del personaje" type="text" placeholder="Mediano" title="Ejemplo: Mediano" value={size} onChange={e => setSize(e.target.value)}/></span>
                            </label>
                        </div>

                        {}
                        {/* TIRADAS DE MUERTE */}
                        <div data-tab="combat" className="tab-section">
                        {((Number(hp.current)||0) <= 0) && (
                            <section className="death-save-panel" aria-labelledby="death-save-title">
                                <div className="death-save-ambient" aria-hidden="true"><i></i><i></i><i></i></div>
                                <header className="death-save-heading"><div className="death-save-symbol" aria-hidden="true"><i></i><span>†</span></div><div><small>0 puntos de golpe</small><h3 id="death-save-title">Salvaciones contra muerte</h3><p>Marca manualmente el resultado de cada tirada.</p></div></header>
                                <div className="death-save-tracks">
                                    <section className="death-save-track is-success"><div><span>Resistir</span><strong>Éxitos</strong></div><div className="death-save-marks">{[1,2,3].map(mark => <button type="button" key={`success_${mark}`} aria-label={`${deathSaves.successes >= mark ? 'Desmarcar' : 'Marcar'} éxito ${mark}`} aria-pressed={deathSaves.successes >= mark} onClick={() => markDeathSave('success', mark)} className={deathSaves.successes >= mark ? 'is-filled' : ''}><i></i><span>{deathSaves.successes >= mark ? '✦' : mark}</span></button>)}</div></section>
                                    <div className="death-save-divider" aria-hidden="true"><span></span></div>
                                    <section className="death-save-track is-failure"><div><span>Ceder</span><strong>Fallos</strong></div><div className="death-save-marks">{[1,2,3].map(mark => <button type="button" key={`failure_${mark}`} aria-label={`${deathSaves.failures >= mark ? 'Desmarcar' : 'Marcar'} fallo ${mark}`} aria-pressed={deathSaves.failures >= mark} onClick={() => markDeathSave('failure', mark)} className={deathSaves.failures >= mark ? 'is-filled' : ''}><i></i><span>{deathSaves.failures >= mark ? '×' : mark}</span></button>)}</div></section>
                                </div>
                                <footer className="death-save-footer"><p><span></span>{Number(deathSaves.successes) >= 3 ? 'Estabilizado' : Number(deathSaves.failures) >= 3 ? 'Tres fallos marcados' : 'El resultado sigue abierto'}</p><button type="button" onClick={resetDeathSaves}>Estabilizar manualmente</button></footer>
                            </section>
                        )}

                        </div>

                        <div className="character-workspace space-y-6">
                            
                            {}
                            {/* COLUMNA IZQ: ATRIBUTOS Y HABILIDADES */}
                            <div data-tab="character" className="character-core-column tab-section space-y-6">
                                
                                {/* ATRIBUTOS BASE */}
                                <div className="rpg-panel p-4 character-attributes-panel">
                                    <div className="character-section-header is-attributes">
                                        <div className="character-section-heading">
                                            <span className="character-section-emblem"><CharacterSectionGlyph section="attributes" /></span>
                                            <div><p>Base y temporal</p><h2>Atributos</h2></div>
                                        </div>
                                        <span className="character-section-note">Valores y modificadores</span>
                                    </div>
                                    <div className="character-attributes-grid">
                                        {Object.entries(stats).map(([key, val]) => {
                                            const total = getEffectiveStat(key);
                                            const mod = getModNum(total);
                                            return (
                                                <div key={key} data-ability={key} className="character-attribute-card">
                                                    <div className="character-attribute-summary">
                                                        <span className="character-attribute-orb"><AbilityGlyph ability={key} /></span>
                                                        <span className="character-attribute-heading"><strong>{ABILITY_NAMES[key]}</strong><small>{key.toUpperCase()}</small></span>
                                                        <strong className="character-attribute-modifier">{formatMod(mod)}<small>mod.</small></strong>
                                                        <span className="character-attribute-total"><small>Puntuación</small>{total}</span>
                                                    </div>
                                                    <div className="character-attribute-inputs">
                                                        <label>Base<input aria-label={`Atributo base ${key}`} type="number" placeholder="10" value={val} onChange={(e) => setStats({...stats, [key]: handleNumInput(e.target.value)})} /></label>
                                                        <label>Temp<input aria-label={`Modificador temporal ${key}`} type="number" placeholder="+0" value={tempStats[key] ?? '0'} onChange={(e) => setTempStats({...tempStats, [key]: handleNumInput(e.target.value)})} /></label>
                                                    </div>
                                                    <button type="button" className="character-attribute-roll" onClick={() => requestAbilityCheckRoll(key)}><span aria-hidden="true">20</span>Tirar prueba</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* TIRADAS DE SALVACIÓN */}
                                <div className="rpg-panel p-4">
                                    <div className="character-section-header is-saves">
                                        <div className="character-section-heading">
                                            <span className="character-section-emblem"><CharacterSectionGlyph section="saves" /></span>
                                            <div><p>Defensa de atributos</p><h2>Salvaciones</h2></div>
                                        </div>
                                        <span className="character-section-note">Toca para tirar · ⚙ para editar</span>
                                    </div>
                                    <div className="saving-throws-grid">
                                        {Object.entries(stats).map(([key, val]) => {
                                            const isProf = hasSavingThrowProficiency(key);
                                            const totalMod = getModNum(getEffectiveStat(key)) + (isProf ? PROF_BONUS : 0);
                                            return (
                                                <div
                                                    key={`save-${key}`}
                                                    onClick={() => requestSavingThrowRoll(key)}
                                                    onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); requestSavingThrowRoll(key); } }}
                                                    title={`Tirar salvación de ${ABILITY_NAMES[key]}${isProf ? ' · Competente' : ''}`}
                                                    aria-label={`Tirar salvación de ${ABILITY_NAMES[key]}${isProf ? ', competente' : ''}`}
                                                    role="button"
                                                    tabIndex="0"
                                                    data-ability={key}
                                                    className={`saving-throw-tile ${isProf ? 'is-proficient' : ''}`}
                                                >
                                                    <span className="saving-throw-mark" aria-hidden="true"></span>
                                                    <span className="saving-throw-icon"><AbilityGlyph ability={key} /></span>
                                                    <span className="saving-throw-label"><strong>{ABILITY_NAMES[key]}</strong><small>{key.toUpperCase()}</small></span>
                                                    <strong className="saving-throw-value">{formatMod(totalMod)}</strong>
                                                    <span className="saving-throw-status">{isProf ? `Competente · +${PROF_BONUS}` : 'Sin competencia'}</span>
                                                    <button type="button" className="saving-throw-edit" onClick={event => { event.stopPropagation(); toggleSavingThrow(key); }} onKeyDown={event => event.stopPropagation()} aria-label={`Editar competencia en salvación de ${ABILITY_NAMES[key]}`} title="Editar competencia">⚙</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* HABILIDADES */}
                                <div className="rpg-panel p-4">
                                    <div className="character-section-header is-skills">
                                        <div className="character-section-heading">
                                            <span className="character-section-emblem"><CharacterSectionGlyph section="skills" /></span>
                                            <div><p>Competencias y pericias</p><h2>Habilidades</h2></div>
                                        </div>
                                        <span className="character-section-note">Toca para tirar · ⚙ para editar</span>
                                    </div>
                                    <div className="space-y-1">
                                        {SKILLS.map(skill => {
                                            const isExp = hasSkillExpertise(skill.key);
                                            const isProf = hasSkillProficiency(skill.key);
                                            const totalMod = getModNum(getEffectiveStat(skill.stat)) + (isExp ? PROF_BONUS * 2 : isProf ? PROF_BONUS : 0);
                                            
                                            return (
                                                <div key={skill.key}
                                                    data-ability={skill.stat}
                                                    onClick={() => requestSkillRoll(skill)}
                                                    onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); requestSkillRoll(skill); } }}
                                                    role="button"
                                                    tabIndex="0"
                                                    aria-label={`${skill.name}: ${formatMod(totalMod)}. ${isExp ? 'Pericia' : isProf ? 'Competencia' : 'Sin competencia'}`}
                                                    className="character-skill-row group">
                                                    <div className="character-skill-main">
                                                        <span className={`character-skill-icon ${isExp ? 'is-expert' : isProf ? 'is-proficient' : ''}`}><AbilityGlyph ability={skill.stat} /></span>
                                                        <span className="character-skill-copy">
                                                            <strong>{skill.name}</strong>
                                                            <small>{skill.stat.toUpperCase()}</small>
                                                            {skill.key === 'sigilo' && isStealthDisadvantaged && <button type="button" onClick={(event) => { event.stopPropagation(); showAlert(`La armadura equipada ${stealthDisadvantageArmor.name} impone desventaja en Sigilo.`); }} onKeyDown={(event) => event.stopPropagation()} className="ml-2 inline-flex max-w-full items-center rounded border border-red-800 bg-red-950/50 px-1.5 py-0.5 text-[10px] font-bold text-red-300 hover:border-red-400" aria-label={`Explicación de desventaja en Sigilo por ${stealthDisadvantageArmor.name}`}>⚠ Desventaja ({stealthDisadvantageArmor.name})</button>}
                                                        </span>
                                                    </div>
                                                    <div className={`character-skill-result ${isExp ? 'is-expert' : isProf ? 'is-proficient' : ''}`}>
                                                        <span className={`character-skill-rank ${isExp ? 'is-expert' : isProf ? 'is-proficient' : ''}`}>{isExp ? 'Pericia' : isProf ? 'Competencia' : 'Normal'}</span>
                                                        <strong>{formatMod(totalMod)}</strong>
                                                        <button type="button" className="character-skill-edit" onClick={event => { event.stopPropagation(); setSkillModal({ isOpen: true, skillKey: skill.key, skillName: skill.name }); }} onKeyDown={event => event.stopPropagation()} aria-label={`Editar competencia de ${skill.name}`} title="Editar competencia">⚙</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 flex gap-4 text-[10px] text-gray-500 justify-center font-fantasy tracking-wider uppercase">
                                        <span className="flex items-center text-cyan-200"><div className="w-2 h-2 rounded-full bg-cyan-400 mr-1 border border-cyan-200"></div> Competencia</span>
                                        <span className="flex items-center text-amber-200"><div className="w-2 h-2 rounded-full bg-amber-400 mr-1 shadow-[0_0_5px_rgba(251,191,36,0.8)] border border-amber-200"></div> Pericia</span>
                                    </div>
                                </div>

                            </div>

                            {}
                            <div className="character-secondary-column space-y-6">
                                <section data-tab="character" className="companion-panel rpg-panel">
                                    <header className="companion-panel-header"><span className="companion-panel-emblem" aria-hidden="true">✦</span><div><small>Vínculos y aliados</small><h2>Compañeros</h2><p>Familiares, monturas e invocaciones ligados a este personaje.</p></div><button type="button" onClick={() => openCompanionManager()}>{companions.length ? 'Gestionar' : '＋ Añadir'}</button></header>
                                    {companions.length ? <div className="companion-panel-list">{companions.slice(0, 3).map(companion => <button type="button" key={companion.id} onClick={() => openCompanionManager(companion.id)}><CompanionAvatar companion={companion}/><span><small>{COMPANION_CATEGORY_LABELS[companion.category]}</small><strong>{companion.name}</strong><em>PV {companion.currentHp}/{companion.maxHp} · CA {companion.armorClass ?? '—'}</em></span><b className={companion.participates ? 'is-active' : ''}>{companion.participates ? 'Preparado' : 'Disponible'}</b></button>)}{companions.length > 3 && <button type="button" className="companion-panel-more" onClick={() => openCompanionManager()}>Ver {companions.length - 3} más</button>}</div> : <button type="button" className="companion-panel-empty" onClick={() => openCompanionManager()}><span aria-hidden="true">◇</span><div><strong>No hay compañeros vinculados</strong><p>Puedes importar una bestia con todos sus datos desde el compendio.</p></div><b>Empezar →</b></button>}
                                </section>

                                {companions.length > 0 && <section data-tab="combat" hidden={activeTab === 'combat' && combatDashboardView !== 'summary'} className="companion-combat-panel rpg-panel">
                                    <header><span aria-hidden="true">✦</span><div><small>Aliados bajo tu control</small><h2>Compañeros en combate</h2><p>Elige quién entra en la escena y consulta su estado.</p></div><button type="button" onClick={() => openCompanionManager()}>Gestionar</button></header>
                                    <div>{companions.map(companion => { const hpPercent = companion.maxHp > 0 ? Math.max(0, Math.min(100, companion.currentHp / companion.maxHp * 100)) : 0; return <article key={companion.id} className={companion.participates ? 'is-participating' : ''}><button type="button" className="companion-combat-identity" onClick={() => openCompanionManager(companion.id)}><CompanionAvatar companion={companion}/><span><small>{COMPANION_CATEGORY_LABELS[companion.category]}</small><strong>{companion.name}</strong><em>CA {companion.armorClass ?? '—'} · {COMPANION_INITIATIVE_LABELS[companion.initiativeMode]}</em></span></button><div className="companion-combat-health"><span><small>Puntos de golpe</small><strong>{companion.currentHp}<i>/ {companion.maxHp}</i>{companion.tempHp > 0 && <em>+{companion.tempHp}</em>}</strong></span><i><b style={{width:`${hpPercent}%`}}/></i><nav><button type="button" disabled={companion.currentHp <= 0} onClick={() => adjustCompanionHp(companion.id,-1)}>−1</button><button type="button" onClick={() => openCompanionManager(companion.id)}>Ficha</button><button type="button" disabled={companion.currentHp >= companion.maxHp} onClick={() => adjustCompanionHp(companion.id,1)}>+1</button></nav></div><button type="button" className={`companion-participation-toggle ${companion.participates ? 'is-active' : ''}`} onClick={() => updateCompanion(companion.id,{participates:!companion.participates})}><i/><span><small>{companion.participates ? 'Incluido' : 'Fuera de iniciativa'}</small><strong>{companion.participates ? 'Participa' : 'No participa'}</strong></span></button></article>; })}</div>
                                    <footer>La acción disponible depende del conjuro o rasgo que haya creado al compañero.</footer>
                                </section>}
                                
                                {/* RECURSOS DE CLASE */}
                                <div data-tab="combat" hidden={activeTab === 'combat' && combatDashboardView !== 'summary'} className="combat-resources-panel combat-collection-panel tab-section rpg-panel">
                                    <header className="combat-collection-header"><div className="combat-collection-heading"><span className="combat-collection-emblem"><CombatSectionIcon section="resources" /></span><div><p>Usos, cargas y capacidades</p><h2>Recursos</h2><span>Controla lo que gastas durante la aventura.</span></div></div><div className="combat-collection-actions">{suggestedClassResources.length > 0 && <button type="button" className="is-secondary" onClick={addSuggestedClassResources}>Sugerir recursos</button>}<button type="button" className="is-primary" onClick={() => setAddModal({isOpen: true, type: 'resource', data: {}})}><span>+</span> Añadir recurso</button></div></header>
                                    <div className="combat-collection-summary"><span><b>{resources.length + (grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 ? 1 : 0)}</b> {(resources.length + (grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 ? 1 : 0)) === 1 ? 'recurso activo' : 'recursos activos'}</span><small>Mantén pulsada una tarjeta para reordenarla</small></div>
                                    <div ref={resourceGridRef} className="resource-reorder-grid grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {resources.map((res, idx) => (
                                            <article key={res.id} ref={element => { if (element) resourceCardRefs.current.set(res.id, element); else resourceCardRefs.current.delete(res.id); }} data-resource-id={res.id} onPointerDown={event => handleResourcePointerDown(event, res.id)} onPointerMove={handleResourcePointerMove} onPointerUp={handleResourcePointerEnd} onPointerCancel={handleResourcePointerEnd} onContextMenu={event => { if (resourceDrag.id === res.id) event.preventDefault(); }} style={resourceDrag.id === res.id ? { '--resource-drag-x': `${resourceDrag.x}px`, '--resource-drag-y': `${resourceDrag.y}px`, '--resource-drag-left': `${resourceDrag.left}px`, '--resource-drag-top': `${resourceDrag.top}px`, '--resource-drag-width': `${resourceDrag.width}px`, '--resource-drag-height': `${resourceDrag.height}px` } : undefined} className={`resource-card combat-resource-card group ${resourceDrag.id === res.id ? 'is-dragging' : ''} ${resourcePressRef.current?.id === res.id && !resourceDrag.id ? 'is-drag-pending' : ''} ${resourceDrag.id && resourceDrag.targetId === res.id && resourceDrag.id !== res.id ? 'is-drop-target' : ''}`}>
                                                <div className="combat-resource-card-top"><span className="combat-resource-grip" aria-hidden="true">⠿</span><div><small>{res.recoveryRest === 'short' ? 'Descanso corto' : res.recoveryRest === 'long' ? 'Descanso largo' : 'Recuperación manual'}</small><h3>{res.name}</h3></div>{res.type && <b>{res.type}</b>}</div>
                                                <div className="combat-resource-uses">{renderUsageDots(res.current, res.max, 'text-purple-400')}</div>
                                                <div className="combat-resource-counter"><button type="button" aria-label={`Reducir ${res.name}`} onClick={() => setResources(previous => previous.map((resource, resourceIndex) => resourceIndex === idx ? { ...resource, current: Math.max(0, Number(resource.current) - 1) } : resource))}>−</button><label><small>Disponibles</small><span><input aria-label={`${res.name} actuales`} type="number" min="0" value={res.current} onChange={event => setResources(previous => previous.map((resource, resourceIndex) => resourceIndex === idx ? { ...resource, current: handleBoundedNumInput(event.target.value, Number(resource.max) > 0 ? resource.max : null) } : resource))}/>{Number(res.max) > 0 && <><i>/</i><b>{res.max}</b></>}</span></label><button type="button" aria-label={`Aumentar ${res.name}`} onClick={() => setResources(previous => previous.map((resource, resourceIndex) => resourceIndex === idx ? { ...resource, current: Number(resource.max) > 0 ? Math.min(Number(resource.max), (Number(resource.current) || 0) + 1) : (Number(resource.current) || 0) + 1 } : resource))}>+</button></div>
                                                <button type="button" onClick={() => confirmDelete(`¿Borrar el recurso "${res.name}"?`, () => setResources(resources.filter(r => r.id !== res.id)))} className="combat-card-delete" aria-label={`Borrar ${res.name}`}>×</button>
                                            </article>
                                        ))}
                                        {grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 && <article className="combat-resource-card is-pact"><div className="combat-resource-card-top"><span className="combat-resource-sigil">⬡</span><div><small>Se recupera con descanso corto</small><h3>Magia de pacto</h3></div><b>N{grimoireConfig.pactSlots.level}</b></div><div className="combat-resource-uses">{renderUsageDots(grimoireConfig.pactSlots.current, grimoireConfig.pactSlots.max, 'text-yellow-300')}</div><div className="combat-resource-counter"><button type="button" aria-label="Reducir magia de pacto" onClick={() => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: Math.max(0, Number(previous.pactSlots.current) - 1) } }))}>−</button><label><small>Ranuras</small><span><input aria-label="Ranuras de magia de pacto actuales" type="number" min="0" value={grimoireConfig.pactSlots.current} onChange={event => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: handleBoundedNumInput(event.target.value, previous.pactSlots.max) } }))}/><i>/</i><b>{grimoireConfig.pactSlots.max}</b></span></label><button type="button" aria-label="Aumentar magia de pacto" onClick={() => setGrimoireConfig(previous => ({ ...previous, pactSlots: { ...previous.pactSlots, current: Math.min(Number(previous.pactSlots.max), Number(previous.pactSlots.current) + 1) } }))}>+</button></div></article>}
                                        {resources.length === 0 && !(grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0) && <button type="button" onClick={() => setAddModal({isOpen:true,type:'resource',data:{}})} className="combat-collection-empty"><span><CombatSectionIcon section="resources" /></span><strong>Aún no hay recursos</strong><small>Añade dados, cargas o usos limitados para tenerlos a mano durante el combate.</small><b>Crear el primero</b></button>}
                                    </div>
                                </div>

                                {/* COMBATE Y ARMAS */}
                                <div data-tab="combat" hidden={activeTab === 'combat' && combatDashboardView !== 'summary'} className="combat-arsenal-panel combat-collection-panel tab-section rpg-panel">
                                    <header className="combat-collection-header is-arsenal"><div className="combat-collection-heading"><span className="combat-collection-emblem"><CombatSectionIcon section="arsenal" /></span><div><p>Equipo preparado</p><h2>Arsenal</h2><span>Ataques, daño y munición a un vistazo.</span></div></div><div className="combat-collection-actions"><button type="button" className="is-primary" onClick={() => setAddModal({isOpen: true, type: 'weapon', data: {}})}><span>+</span> Nueva arma</button></div></header>
                                    
                                    <nav className="arsenal-weapon-tabs" aria-label="Armas del arsenal">
                                        {weapons.map(w => (
                                            <div key={w.id} className={`arsenal-weapon-tab group ${selectedWeaponId === w.id ? 'is-active' : ''}`}>
                                                <button type="button" onClick={() => { setSelectedWeaponId(w.id); setAmmoSettingsOpen(false); }} aria-pressed={selectedWeaponId === w.id}><span><CombatSectionIcon section="arsenal" /></span><strong>{w.name}</strong>{w.usesAmmo && <small>Munición</small>}</button>
                                                <button onClick={(e) => { e.stopPropagation(); confirmDelete(`¿Borrar "${w.name}"?`, () => {
                                                    const newW = weapons.filter(x => x.id !== w.id); setWeapons(newW); if(selectedWeaponId===w.id) setSelectedWeaponId(newW[0]?.id||null);
                                                })}} className="combat-card-delete" aria-label={`Borrar ${w.name}`}>×</button>
                                            </div>
                                        ))}
                                    </nav>

                                    <div className="arsenal-workbench">
                                        {selectedWeapon ? (
                                            <div className="arsenal-selected-weapon">
                                                <div className="arsenal-selected-heading"><div><small>Arma preparada</small><h3>{selectedWeapon.name}</h3></div><div className="arsenal-selected-heading-actions"><span>{selectedWeapon.attacks.length} acci{selectedWeapon.attacks.length === 1 ? 'ón' : 'ones'}</span><button type="button" onClick={() => setAmmoSettingsOpen(true)} className={selectedWeapon.usesAmmo ? 'is-active' : ''}><i aria-hidden="true">➤</i><span><small>{selectedWeapon.usesAmmo ? 'Munición' : 'Proyectiles'}</small><strong>{selectedWeapon.usesAmmo ? selectedWeaponAmmo ? `${Math.max(0,Number(selectedWeaponAmmo.qty)||0)} disponibles` : 'Sin vincular' : 'Configurar'}</strong></span><b aria-hidden="true">⚙</b></button></div></div>
                                                <div className="arsenal-attacks-grid">
                                                    {selectedWeapon.attacks.map((act, i) => (
                                                        <article key={`${selectedWeaponId}-${i}`} className="arsenal-attack-card animate-attack group">
                                                            <header><span><CombatSectionIcon section="arsenal" /></span><h3>{act.name}</h3></header>
                                                            <div className="arsenal-attack-values"><div><small>Ataque</small><strong>{getWeaponAttackBonus(act, selectedWeapon) || '—'}</strong>{getWeaponAttackFormula(act, selectedWeapon) && <em>{getWeaponAttackFormula(act, selectedWeapon)}</em>}</div><i></i><div><small>Daño</small><strong>{act.dmg || '—'}</strong></div></div>
                                                            <div className="arsenal-roll-actions"><button type="button" onClick={() => requestWeaponAttackRoll(act, selectedWeapon, i)}><span aria-hidden="true">20</span>Tirar ataque</button><button type="button" disabled={!window.DndDiceEngine.extractDiceFormula(act.dmg)} onClick={() => requestWeaponDamageRoll(act, selectedWeapon)}><span aria-hidden="true">✦</span>Tirar daño</button></div>
                                                            {act.notes && <p>{act.notes}</p>}
                                                            {selectedWeapon.usesAmmo && <button type="button" disabled={!selectedWeaponAmmo || Number(selectedWeaponAmmo.qty) < Math.max(1, Number(selectedWeapon.ammoPerShot) || 1)} onClick={() => spendWeaponAmmo(selectedWeapon.id)} className="arsenal-attack-fire"><span>➤</span>{selectedWeaponAmmo ? `Disparar · ${selectedWeaponAmmo.qty} disponibles` : 'Munición sin vincular'}</button>}
                                                            <button onClick={() => confirmDelete(`¿Borrar ataque "${act.name}"?`, () => {
                                                                setWeapons(weapons.map(w => w.id === selectedWeaponId ? {...w, attacks: w.attacks.filter((_,idx)=>idx!==i)} : w));
                                                            })} className="combat-card-delete" aria-label={`Borrar ataque ${act.name}`}>×</button>
                                                        </article>
                                                    ))}
                                                </div>
                                                <button type="button" onClick={openAddWeaponAttack} className="arsenal-add-action"><span>+</span><div><strong>Añadir acción</strong><small>Registra otra forma de atacar con esta arma.</small></div></button>
                                            </div>
                                        ) : <button type="button" onClick={() => setAddModal({isOpen:true,type:'weapon',data:{}})} className="combat-collection-empty"><span><CombatSectionIcon section="arsenal" /></span><strong>Aún no hay armas</strong><small>Añade un arma y organiza aquí sus ataques y munición.</small><b>Crear la primera</b></button>}
                                    </div>
                                </div>
                                {ammoSettingsOpen && selectedWeapon && ReactDOM.createPortal(<div className="ammo-settings-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setAmmoSettingsOpen(false); }}>
                                    <section className="ammo-settings-dialog" role="dialog" aria-modal="true" aria-labelledby="ammo-settings-title">
                                        <header><span className="ammo-settings-emblem" aria-hidden="true">➤</span><div><small>Arsenal · {selectedWeapon.name}</small><h3 id="ammo-settings-title">Configurar munición</h3><p>Vincula una reserva de la mochila y define cuánto consume cada disparo.</p></div><button type="button" onClick={() => setAmmoSettingsOpen(false)} aria-label="Cerrar configuración de munición">×</button></header>
                                        <div className="ammo-settings-body">
                                            <label className="ammo-settings-toggle"><input type="checkbox" checked={selectedWeapon.usesAmmo === true} onChange={event => updateWeaponAmmo(selectedWeapon.id, { usesAmmo: event.target.checked })}/><span><i></i></span><div><small>Control de proyectiles</small><strong>Esta arma utiliza munición</strong><p>Actívalo para descontar unidades al registrar cada disparo.</p></div><b>{selectedWeapon.usesAmmo ? 'Activo' : 'Inactivo'}</b></label>
                                            {selectedWeapon.usesAmmo && <div className="ammo-settings-fields"><label><span>Reserva vinculada</span><small>Objeto de la mochila que contiene la munición</small><select value={selectedWeapon.ammoItemId || ''} onChange={event => updateWeaponAmmo(selectedWeapon.id, { ammoItemId: event.target.value })}><option value="">Sin vincular</option>{inventory.map(item => <option key={item.id} value={item.id}>{item.name} · {Math.max(0, Number(item.qty) || 0)}</option>)}</select></label><label><span>Consumo</span><small>Unidades gastadas por disparo</small><div><input type="number" min="1" value={selectedWeapon.ammoPerShot || 1} onChange={event => updateWeaponAmmo(selectedWeapon.id, { ammoPerShot: Math.max(1, Math.trunc(Number(event.target.value) || 1)) })}/><b>por disparo</b></div></label></div>}
                                            {selectedWeapon.usesAmmo && <div className={`ammo-settings-reserve ${selectedWeaponAmmo ? Number(selectedWeaponAmmo.qty) > 0 ? 'is-ready' : 'is-empty' : 'is-unlinked'}`}><span aria-hidden="true">{selectedWeaponAmmo ? '◆' : '◇'}</span><div><small>Estado de la reserva</small><strong>{selectedWeaponAmmo ? `${selectedWeaponAmmo.name} · ${Math.max(0,Number(selectedWeaponAmmo.qty)||0)} unidades` : 'Ningún objeto vinculado'}</strong><p>{selectedWeaponAmmo ? 'La cantidad se comparte con la mochila y se actualiza al disparar.' : 'Selecciona arriba una pila de flechas, virotes u otra munición.'}</p></div></div>}
                                        </div>
                                        <footer><p>El disparo se registra desde la tarjeta de ataque.</p><button type="button" onClick={() => setAmmoSettingsOpen(false)}>Guardar y cerrar</button></footer>
                                    </section>
                                </div>, document.body)}

                                <section data-tab="combat" hidden={activeTab === 'combat' && combatDashboardView !== 'summary'} className="combat-table-hub tab-section rpg-panel">
                                    <header className="combat-table-hub-header"><div><span className="combat-table-hub-emblem" aria-hidden="true"><i></i><b>✦</b></span><div><p>Herramientas de sesión</p><h2>Mesa de juego</h2><small>Conecta al grupo o prepara las criaturas del encuentro.</small></div></div><span className="combat-table-hub-rule" aria-hidden="true"></span></header>
                                    <div className="combat-table-hub-grid">
                                        <button type="button" onClick={openOnlineTable} className="combat-table-card is-online">
                                            <span className="combat-table-card-art" aria-hidden="true"><i></i><i></i><b>◉</b></span>
                                            <span className="combat-table-card-copy"><small>{currentRoom?.code ? 'Conexión activa' : 'Juego compartido'}</small><strong>Mesa Online</strong><em>{currentRoom?.code ? `Sala ${currentRoom.code} · ${roomParticipants.length} participante${roomParticipants.length === 1 ? '' : 's'}` : 'Crea una sala o únete al código de tus compañeros.'}</em><span>{currentRoom?.code ? <><i className="is-live"></i> Abrir mesa</> : 'Crear o unirse'}</span></span>
                                            <b className="combat-table-card-arrow" aria-hidden="true">→</b>
                                        </button>
                                        <button type="button" onClick={() => setDiceRollerOpen(true)} className="combat-table-card is-dice">
                                            <span className="combat-table-card-art" aria-hidden="true"><i></i><i></i><b>20</b></span>
                                            <span className="combat-table-card-copy"><small>Tiradas cinematográficas</small><strong>Lanzador de dados</strong><em>Combina dados, modificadores, ventaja, desventaja y dificultad.</em><span>Abrir lanzador</span></span>
                                            <b className="combat-table-card-arrow" aria-hidden="true">→</b>
                                        </button>
                                        {(!currentRoom || isCurrentRoomMaster) && <button type="button" onClick={() => setBestiaryCompendiumOpen(true)} className="combat-table-card is-bestiary">
                                            <span className="combat-table-card-art" aria-hidden="true"><i></i><i></i><b>♜</b></span>
                                            <span className="combat-table-card-copy"><small>Catálogo unificado</small><strong>Compendio de criaturas</strong><em>Consulta el SRD, gestiona tus criaturas y prepara enemigos para la mesa.</em><span>{srdMonsterCompendium.monsters.length} SRD · {bestiary.monsters.length} propia{bestiary.monsters.length === 1 ? '' : 's'}</span></span>
                                            <b className="combat-table-card-arrow" aria-hidden="true">→</b>
                                        </button>}
                                    </div>
                                    <footer className="combat-table-hub-footer"><span>✦</span><p>Estas herramientas apoyan la sesión sin tomar decisiones por el personaje.</p></footer>
                                </section>

                                <InventoryView model={{
                                    addCurrency,
                                    adjustInvQty,
                                    armors,
                                    confirmDelete,
                                    currency,
                                    diaryCategory,
                                    diaryOpen,
                                    diarySearch,
                                    editingDiaryEntry,
                                    inventory,
                                    sessionNotes,
                                    setAddModal,
                                    setArmors,
                                    setDiaryCategory,
                                    setDiaryOpen,
                                    setDiarySearch,
                                    setEditingDiaryEntry,
                                    setEquipmentCompendiumOpen,
                                    setInventory,
                                    setSessionNotes,
                                    setTools,
                                    toggleArmorEquip,
                                    tools,
                                    updateCurrencyAmount
                                }} />

                                {/* RASGOS Y DOTES */}
                                <div data-tab="character" className="tab-section grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="rpg-panel p-4 character-traits-panel">
                                        <div className="character-section-header is-traits">
                                            <div className="character-section-heading">
                                                <span className="character-section-emblem"><CharacterSectionGlyph section="traits" /></span>
                                                <div><p>Capacidades del personaje</p><h2>Rasgos</h2></div>
                                            </div>
                                            <button onClick={() => setAddModal({isOpen: true, type: 'trait', data: {}})} className="character-section-action">+ Rasgo</button>
                                        </div>
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                            {displayedTraits.map((t, idx) => (
                                                <div key={t.id || idx} className={`bg-gray-900/40 border-l-2 p-3 rounded border border-gray-800 relative group shadow-sm ${t.automatic ? 'border-l-cyan-500' : 'border-l-purple-500'}`}>
                                                    <h3 className="font-bold text-purple-200 text-sm pr-4 font-fantasy tracking-wide">{t.title}</h3>
                                                    <p className={`text-[11px] mt-1 leading-tight whitespace-pre-wrap ${t.automatic ? 'text-cyan-100/80' : 'text-gray-400'}`}>{t.automatic ? t.description : t.desc}</p>
                                                    {!t.automatic && <button onClick={() => confirmDelete(`¿Borrar rasgo "${t.title}"?`, () => setTraits(traits.filter((_, i) => i !== t.manualIndex)))} className="absolute top-1 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 font-bold text-lg">×</button>}
                                                </div>
                                            ))}
                                            {displayedTraits.length === 0 && <p className="text-sm text-gray-500">Aún no hay rasgos. Pulsa + Rasgo para añadir uno.</p>}
                                        </div>
                                    </div>

                                    <div className="rpg-panel p-4 character-feats-panel">
                                        <div className="character-section-header is-feats">
                                            <div className="character-section-heading">
                                                <span className="character-section-emblem"><CharacterSectionGlyph section="feats" /></span>
                                                <div><p>Mejoras y talentos</p><h2>Dotes</h2></div>
                                            </div>
                                            <div className="character-section-actions">
                                                <button onClick={() => setFeatCompendiumOpen(true)} className="character-section-action is-compendium">Compendio</button>
                                                <button onClick={() => setAddModal({isOpen: true, type: 'feat', data: {}})} className="character-section-action">+ Dote</button>
                                            </div>
                                        </div>
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                            {feats.map((t, idx) => (
                                                <div key={idx} className="bg-gray-900/40 border-l-2 border-yellow-600 p-3 rounded border border-gray-800 border-l-yellow-600 relative group shadow-sm">
                                                    <h3 className="font-bold text-yellow-200 text-sm pr-4 font-fantasy tracking-wide">{t.title}</h3>
                                                    <p className="text-[11px] text-gray-400 mt-1 leading-tight whitespace-pre-wrap">{t.desc}</p>
                                                    <button onClick={() => confirmDelete(`¿Borrar dote "${t.title}"?`, () => setFeats(feats.filter((_, i) => i !== idx)))} className="absolute top-1 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 font-bold text-lg">×</button>
                                                </div>
                                            ))}
                                            {feats.length === 0 && <p className="text-sm text-gray-500">Aún no hay dotes. Pulsa + Dote para añadir una.</p>}
                                        </div>
                                    </div>
                                </div>

                                {}
                                {/* HECHIZOS (Magia) */}
                                <div data-tab="grimoire" className="grimoire-panel tab-section rpg-panel p-4 border border-fuchsia-900/50">
                                    <div className="grimoire-toolbar flex flex-wrap justify-between items-center mb-4 rpg-panel-header !border-l-fuchsia-500 pb-3 px-4 gap-4">
                                        <div className="grimoire-heading">
                                            <span className="grimoire-heading-emblem" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 4.5A3.5 3.5 0 0 1 8.5 2H19v17H8.5A3.5 3.5 0 0 0 5 22Z"/><path d="M5 4.5V22M9 7h6M9 11h6"/></svg></span>
                                            <div><p>Magia y preparación</p><h2>Libro de conjuros</h2></div>
                                        </div>
                                        
                                        <div className="grimoire-summary flex gap-4 items-center flex-wrap flex-1 justify-end">
                                            {automaticSpells.length > 0 && <span className="text-xs text-cyan-200">Concedidos {automaticSpells.length}</span>}
                                            {grimoireConfig.useCantripLimit && <span className="text-xs text-fuchsia-200">Trucos {cantripCount}/{grimoireConfig.cantripLimit || 0}</span>}
                                            {grimoireConfig.useKnownLimit && <span className="text-xs text-fuchsia-200">Conocidos {knownSpellCount}/{grimoireConfig.knownLimit || 0}</span>}
                                            {grimoireConfig.usePrepared && <span className="text-xs text-fuchsia-200">Preparados {preparedSpellCount}/{grimoireConfig.preparedLimit || 0}</span>}
                                            {spellSaveDc !== null && <span className="text-xs text-cyan-200">{spellcastingAbilityName}: CD {spellSaveDc} · Ataque {formatMod(spellAttackBonus)}</span>}
                                            <div className="grimoire-actions flex items-center gap-2">
                                                <button onClick={() => setGrimoireView('srd')} className="grimoire-action is-compendium min-h-11 text-xs font-fantasy uppercase tracking-wider bg-purple-950/50 border border-purple-700 hover:bg-purple-700 text-purple-100 hover:text-white px-4 py-2 rounded transition-colors shadow-md">{spellWorkflowCopy.compendium}</button>
                                                <button onClick={() => setAddModal({isOpen: true, type: 'spell', data: {}})} className="grimoire-action is-add min-h-11 text-xs font-fantasy uppercase tracking-wider bg-fuchsia-900/50 border border-fuchsia-700 hover:bg-fuchsia-600 text-fuchsia-100 hover:text-white px-4 py-2 rounded transition-colors shadow-md">+ Conjuro</button>
                                            </div>
                                        </div>
                                    </div>
                                    {activeConcentration && <section className="concentration-banner" role="status"><span className="concentration-banner-sigil" aria-hidden="true">C</span><div className="min-w-0 flex-1"><span className="concentration-banner-kicker">Concentración activa</span><strong>{activeConcentration.spellName}</strong><small>Desde {new Date(activeConcentration.startedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</small></div><button type="button" onClick={finishConcentration}>Finalizar concentración</button></section>}
                                    
                                    <div className="grimoire-utility-row mb-3">
                                        <button type="button" onClick={() => setGrimoireSettingsOpen(value => !value)} className={`grimoire-settings-toggle ${grimoireSettingsOpen ? 'is-open' : ''}`} aria-expanded={grimoireSettingsOpen}>
                                            <span aria-hidden="true">✦</span> Configuración de lanzamiento
                                            <span className="grimoire-settings-toggle-state">{grimoireSettingsOpen ? 'Ocultar' : 'Ajustar'}</span>
                                        </button>
                                        <button type="button" onClick={() => setGrimoireGuideOpen(true)} className="grimoire-guide-toggle" aria-haspopup="dialog">
                                            <span aria-hidden="true">?</span> Cómo empezar
                                        </button>
                                    </div>
                                    {grimoireSettingsOpen && <section className="grimoire-settings mb-4 text-xs">
                                        {srdSpellcastingProfile && <div className="grimoire-profile-card">
                                            <div className="grimoire-profile-sigil" aria-hidden="true">✦</div>
                                            <div className="min-w-0">
                                                <p className="grimoire-profile-eyebrow">Perfil de lanzamiento activo</p>
                                                <strong className="grimoire-profile-title">{srdSpellcastingProfile.name} <span>· Nivel {srdSpellcastingLevel}</span></strong>
                                                <p className="grimoire-profile-summary">{!srdProfileHasSpellcasting ? 'Esta progresión obtiene lanzamiento de conjuros en un nivel posterior.' : <>{srdSpellcastingProfile.mode === 'prepared' ? `Prepara hasta ${srdProfilePreparedLimit} conjuros` : `Conoce hasta ${srdProfileKnownLimit} conjuros`}{srdProfileCantrips > 0 ? ` · ${srdProfileCantrips} trucos` : ''}{srdSpellcastingProfile.mode === 'known-pact' ? ` · Magia de pacto de nivel ${srdProfileMaxSpellLevel}` : ` · Ranuras hasta nivel ${srdProfileMaxSpellLevel}`}</>}</p>
                                                {srdSpellcastingProfile.listNote && <p className="mt-1 text-[11px] text-yellow-200/80">{srdSpellcastingProfile.listNote}</p>}
                                            </div>
                                            <button type="button" onClick={() => setGrimoireConfig(previous => ({ ...previous, srdProfileKey: '' }))} className="grimoire-profile-recalculate">Recalcular</button>
                                        </div>}
                                        {!srdSpellcastingProfile && String(charInfo.cls || '').trim() && <p className="grimoire-manual-notice">No hay un perfil automático para esta clase. La configuración manual del Grimorio sigue disponible.</p>}
                                        <div className="grimoire-settings-grid">
                                            <label className="grimoire-ability-card">
                                                <span className="grimoire-setting-kicker">Canalización</span>
                                                <span className="grimoire-setting-title">Característica de lanzamiento</span>
                                                <select value={spellcastingAbility} onChange={event => setGrimoireConfig(previous => ({ ...previous, spellcastingAbility: event.target.value }))} className="grimoire-setting-select">
                                                    <option value="">Sin configurar</option>
                                                    {SPELLCASTING_ABILITIES.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                                                </select>
                                                {spellcastingModifier !== null && <span className="grimoire-ability-result">Mod. {formatMod(spellcastingModifier)} <i /> CD {spellSaveDc} <i /> Ataque {formatMod(spellAttackBonus)}</span>}
                                            </label>
                                            {[['useKnownLimit','Conjuros conocidos','knownLimit',`Conocidos ${knownSpellCount} / ${grimoireConfig.knownLimit || 0}`],['usePrepared','Conjuros preparados','preparedLimit',`Preparados ${preparedSpellCount} / ${grimoireConfig.preparedLimit || 0}`],['useCantripLimit','Trucos conocidos','cantripLimit',`Trucos ${cantripCount} / ${grimoireConfig.cantripLimit || 0}`]].map(([key,label,limit,labelCount]) => <label key={key} className={`grimoire-setting-card ${grimoireConfig[key] ? 'is-enabled' : ''}`}>
                                                <span className="grimoire-setting-heading"><input type="checkbox" checked={!!grimoireConfig[key]} onChange={e => setGrimoireConfig(prev => ({ ...prev, [key]: e.target.checked }))} /><span>{label}</span></span>
                                                <span className="grimoire-setting-description">{grimoireConfig[key] ? 'Límite activo' : 'Sin límite'}</span>
                                                {grimoireConfig[key] && <span className="grimoire-setting-values"><input type="number" min="0" placeholder="0" value={grimoireConfig[limit]} onChange={e => setGrimoireConfig(prev => ({ ...prev, [limit]: handleNumInput(e.target.value) }))} /><span>{labelCount}</span></span>}
                                            </label>)}
                                            <label className={`grimoire-setting-card grimoire-pact-card ${grimoireConfig.usePactMagic ? 'is-enabled' : ''}`}>
                                                <span className="grimoire-setting-heading"><input type="checkbox" checked={!!grimoireConfig.usePactMagic} onChange={e => setGrimoireConfig(prev => ({ ...prev, usePactMagic: e.target.checked }))} /><span>Magia de pacto</span></span>
                                                <span className="grimoire-setting-description">{grimoireConfig.usePactMagic ? 'Ranuras que se recuperan con descanso corto' : 'No utilizada'}</span>
                                                {grimoireConfig.usePactMagic && <span className="grimoire-setting-values grimoire-pact-values"><input aria-label="Ranuras actuales de magia de pacto" type="number" min="0" value={grimoireConfig.pactSlots.current} onChange={e => setGrimoireConfig(prev => ({ ...prev, pactSlots: { ...prev.pactSlots, current: handleNumInput(e.target.value) } }))} /><b>/</b><input aria-label="Ranuras máximas de magia de pacto" type="number" min="0" value={grimoireConfig.pactSlots.max} onChange={e => setGrimoireConfig(prev => ({ ...prev, pactSlots: { ...prev.pactSlots, max: handleNumInput(e.target.value) } }))} /><span>Nivel</span><input aria-label="Nivel de ranura de magia de pacto" type="number" min="1" max="9" value={grimoireConfig.pactSlots.level} onChange={e => setGrimoireConfig(prev => ({ ...prev, pactSlots: { ...prev.pactSlots, level: handleNumInput(e.target.value) } }))} /></span>}
                                            </label>
                                        </div>
                                    </section>}
                                    <div className="grimoire-navigation mb-4">
                                        <div className="grimoire-view-tabs">
                                            <button onClick={() => setGrimoireView('available')} className={`grimoire-view-tab ${grimoireView === 'available' ? 'is-active' : ''}`}>{spellWorkflowCopy.ready}</button>
                                            <button onClick={() => setGrimoireView('library')} className={`grimoire-view-tab ${grimoireView === 'library' ? 'is-active' : ''}`}>{spellWorkflowCopy.collection}</button>
                                            <button onClick={() => setGrimoireView('srd')} className={`grimoire-view-tab is-compendium ${grimoireView === 'srd' ? 'is-active' : ''}`}>{spellWorkflowCopy.compendium}</button>
                                        </div>
                                        {grimoireView !== 'srd' && <>
                                            <div className="grimoire-list-controls">
                                                <input value={spellSearch} onChange={e => setSpellSearch(e.target.value)} placeholder="Buscar por nombre…" className="min-w-[10rem] flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm"/>
                                                <select value={spellFilter} onChange={e => setSpellFilter(e.target.value)} className="bg-gray-950 border border-gray-700 rounded px-2 text-sm"><option value="all">Todos</option><option value="cantrip">Trucos</option><option value="prepared">Preparados</option><option value="ritual">Rituales</option><option value="concentration">Concentración</option><option value="favorite">Favoritos</option>{[...new Set(grimorioSpells.map(spell => spell.level))].sort((a,b)=>a-b).map(level => <option key={level} value={level}>{level === 0 ? 'Trucos' : `Nivel ${level}`}</option>)}</select>
                                            </div>
                                        </>}
                                    </div>
                                    {grimoireView === 'srd' ? (
                                        <ArcaneCompendiumView
                                            spellLibrary={srdSpellLibrary}
                                            displayedSpells={displayedSrdSpells}
                                            addedSpells={grimorioSpells}
                                            profile={srdSpellcastingProfile}
                                            profileMaxSpellLevel={srdProfileMaxSpellLevel}
                                            classFilterActive={isSrdClassFilterActive}
                                            workflow={spellWorkflow}
                                            workflowDescription={spellWorkflowCopy.description}
                                            actionLabel={spellWorkflowCopy.action}
                                            search={srdSpellSearch}
                                            level={srdSpellLevel}
                                            school={srdSpellSchool}
                                            classFilter={srdSpellClassFilter}
                                            trait={srdSpellTrait}
                                            schools={srdSpellSchools}
                                            onSearchChange={setSrdSpellSearch}
                                            onLevelChange={setSrdSpellLevel}
                                            onSchoolChange={setSrdSpellSchool}
                                            onClassFilterChange={setSrdSpellClassFilter}
                                            onTraitChange={setSrdSpellTrait}
                                            onShowDetail={setSrdSpellDetail}
                                            onChooseSpell={addSpellFromSrdLibrary}
                                            getSpellIcon={getSpellIconPath}
                                            getSpellIconColor={getSpellIconColor}
                                        />
                                    ) : <>
                                    {/* Ranuras (Slots) */}
                                    <div className="grimoire-slot-bar flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-gray-800"><span className="grimoire-slot-label">Ranuras</span>{[1,2,3,4,5,6,7,8,9].filter(level => showEmptySlots || Number(spellSlots[level].max) > 0).map(level => <button key={level} onClick={() => setEditingSlotLevel(level)} className="grimoire-slot-chip px-3 py-2 rounded border border-gray-700 bg-gray-900 text-xs font-mono hover:border-fuchsia-500"><b className="text-fuchsia-300">N{level}</b> {spellSlots[level].current}/{spellSlots[level].max}</button>)}<button onClick={() => setShowEmptySlots(value => !value)} className="grimoire-empty-slots-toggle px-3 py-2 text-xs text-gray-400">{showEmptySlots ? 'Ocultar niveles vacíos' : 'Mostrar niveles vacíos'}</button></div>

                                    {/* Lista de Conjuros */}
                                    <div className="grimoire-collection-heading"><div><span>Archivo arcano</span><strong>{grimoireView === 'available' ? 'Conjuros listos' : 'Colección de conjuros'}</strong></div><small>{displayedSpells.length} {displayedSpells.length === 1 ? 'conjuro' : 'conjuros'}</small></div>
                                    <div className="spell-library-grid grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                                        {displayedSpells.map(sp => {
                                            const compStr = [sp.compV ? 'V' : null, sp.compS ? 'S' : null, sp.compM ? 'M' : null].filter(Boolean).join(', ');
                                            const mDesc = sp.compM && sp.compMDesc ? ` (${sp.compMDesc})` : '';
                                            const sourceSpell = sp.sourceId ? srdSpellLibrary.find(librarySpell => librarySpell.id === sp.sourceId) : null;
                                            const grantSummary = getSpellGrantSummary(sp);
                                            const spellIcon = getSpellIconPath(sp);
                                            const spellIconColor = getSpellIconColor(sp);
                                            return (
                                                <article key={sp.id} style={spellIconColor ? { '--spell-art-rgb': spellIconColor } : undefined} className={`spell-card flex flex-col p-3 rounded-lg border transition-all duration-300 ${sp.prepared ? 'is-prepared' : ''} ${sp.grantType !== 'standard' ? 'is-granted' : ''} ${sp.concentration ? 'is-concentration' : ''} ${spellIcon ? 'has-spell-art' : ''} relative group`}>
                                                    <div className="spell-card-hero">
                                                        <div className="spell-card-hero-copy">
                                                            <div className="spell-card-title flex justify-between items-center mb-2">
                                                                <div className="flex items-center space-x-3">
                                                                    <span className="spell-level-seal">{sp.level === 0 ? 'T' : sp.level}<small>{sp.level === 0 ? 'Truco' : 'Nivel'}</small></span>
                                                                    <div><span className="spell-card-name">{sp.name}</span><span className="spell-card-traits">{sp.prepared && <i>Preparado</i>}{sp.concentration && <i>Concentración</i>}{sp.ritual && <i>Ritual</i>}</span></div>
                                                                </div>
                                                            </div>
                                                            <div className={`spell-origin-block ${sp.grantType !== 'standard' ? 'is-granted' : ''}`}><strong>{grantSummary.type}</strong>{grantSummary.source && <span>{grantSummary.source}</span>}<div><small>{grantSummary.preparation}</small><small>{grantSummary.knownLimit}</small><small>{grantSummary.resource}</small>{sp.castingResource === 'independent' && Number(sp.ownUsesCurrent) < Number(sp.ownUsesMax) && <button type="button" onClick={() => restoreSpellOwnUses(sp)}>Restablecer usos</button>}</div></div>
                                                        </div>
                                                        {spellIcon && <figure className="spell-card-art"><img src={spellIcon} alt={`Icono de ${sp.name}`} loading="lazy" /></figure>}
                                                    </div>
                                                    <div className="spell-card-details flex flex-col text-[10px] text-gray-400 font-medium mb-2 bg-gray-950/50 p-2 rounded border border-gray-800/50">
                                                        <div className="flex space-x-3">
                                                            {sp.range && sp.range !== '-' && <span><span className="text-gray-500">Alc:</span> {sp.range}</span>}
                                                            {(sp.shape && sp.shape !== '-' || sp.size && sp.size !== '-') && <span><span className="text-gray-500">Área:</span> {sp.shape} {sp.size}</span>}
                                                        </div>
                                                        {compStr && <span className="mt-1"><span className="text-gray-500">Comp:</span> <span className="text-purple-300">{compStr}</span>{mDesc}</span>}
                                                    </div>
                                                    <p className="spell-card-description text-[11px] text-gray-400 mt-1 leading-snug whitespace-pre-wrap">{sp.description || sp.notes}</p>
                                                    <div className="spell-card-actions flex flex-wrap gap-2 mt-3">{sourceSpell && <button type="button" onClick={() => setSrdSpellDetail(sourceSpell)} className="spell-card-detail min-h-9 rounded border border-purple-700 px-3 text-xs text-purple-100 hover:bg-purple-950/50">Consultar</button>}<button onClick={() => setCastSpell(sp)} className="spell-card-cast min-h-9 px-3 py-1.5 rounded bg-fuchsia-800 hover:bg-fuchsia-700 text-xs text-white">Lanzar</button>{!sp.automatic && grimoireConfig.useKnownLimit && sp.level > 0 && <button onClick={() => toggleSpellKnown(sp)} className="min-h-9 px-3 py-1.5 rounded border border-gray-600 text-xs text-gray-200">{sp.known ? 'Dejar de conocer' : 'Conocer'}</button>}{!sp.automatic && grimoireConfig.usePrepared && sp.level > 0 && <button onClick={() => toggleSpellPreparation(sp)} className="spell-card-prepare min-h-9 px-3 py-1.5 rounded border border-fuchsia-700 text-xs text-fuchsia-200">{sp.prepared ? 'Dejar de preparar' : 'Preparar'}</button>}{!sp.automatic && <button onClick={() => setSpells(spells.map(item => item.id === sp.id ? {...item,favorite:!item.favorite} : item))} className="spell-card-favorite min-h-9 px-2 py-1.5 text-xs text-yellow-300" aria-label={sp.favorite ? `Quitar ${sp.name} de favoritos` : `Añadir ${sp.name} a favoritos`}>{sp.favorite ? '★' : '☆'}</button>}</div>
                                                    {!sp.automatic && <button onClick={(e) => { e.stopPropagation(); confirmDelete(`¿Borrar hechizo "${sp.name}"?`, () => setSpells(spells.filter(s => s.id !== sp.id))); }} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 text-lg transition-opacity">×</button>}
                                                </article>
                                            )
                                        })}
                                        {grimorioSpells.length === 0 && <div className="grimoire-empty-state col-span-1 md:col-span-2 p-8 border-2 border-dashed border-gray-800 rounded-lg text-center"><span className="text-gray-500 text-sm italic font-fantasy tracking-widest uppercase">El grimorio está vacío.</span><p className="mt-2 text-xs text-gray-500 normal-case tracking-normal">Abre el Compendio Arcano o usa + Conjuro para empezar.</p></div>}
                                    </div>
                                    </>}
                                </div>

                            </div>
                        </div>
        </>;
    }

    window.DndCharacterWorkspaceComponents = { CharacterWorkspace };
})();
