(() => {
    const { createDefaultCharacterBuild, isValidPortraitDataUrl } = window.DndAppUtils;
    const { CharacterBuildModal, CharacterCreationWizard } = window.DndCharacterBuilderComponents;

    function CharacterHeader({ model }) {
        const {
            PROF_BONUS,
            SKILLS,
            activeCharacter,
            activeConcentration,
            activeSrdSubclass,
            addSuggestedClassResources,
            automaticExpertiseChoices,
            automaticExpertiseLimit,
            automaticSavingThrows,
            automaticSkillProficiencies,
            availableAutomaticRuleTraits,
            charInfo,
            characterBuild,
            characterBuildOpen,
            characterCreationWizardOpen,
            closeCharacterCreationWizard,
            characterHeaderMenuOpen,
            characterList,
            closeLevelReview,
            companions,
            conditions,
            confirmLevelReview,
            currentSpellProgression,
            handleNumInput,
            handlePortraitFile,
            hasSkillProficiency,
            hitDice,
            hp,
            initBonus,
            lastReviewedLevel,
            level,
            levelDraft,
            levelReviewChecklist,
            levelReviewChecklistComplete,
            levelReviewChecks,
            levelReviewDelta,
            levelReviewFeatureGroups,
            levelReviewHasSpellcasting,
            levelReviewHpGain,
            levelReviewOpen,
            levelReviewProficiencyBonus,
            levelReviewRemainingExpertiseChoices,
            levelReviewStart,
            levelReviewTarget,
            normalizedCharacterLevel,
            openCompanionManager,
            openSessionMode,
            originSkillProficiencies,
            pendingAbilityImprovementLevels,
            pendingLevelChange,
            pendingResourceSuggestions,
            portraitFileRef,
            previousProficiencyBonus,
            previousSpellProgression,
            proficiencyChanged,
            remainingClassSkillChoices,
            remainingExpertiseChoices,
            removePortrait,
            requestLevelChange,
            requestTabChange,
            requiredClassSkillChoices,
            selectedClassSkillChoiceCount,
            selectedExpertiseChoiceCount,
            selectedSrdBackground,
            selectedSrdClass,
            selectedSrdSpecies,
            setActiveTab,
            setActivityHistoryOpen,
            setAppSettingsOpen,
            setCharInfo,
            setCharacterBuild,
            setCharacterBuildOpen,
            setCharacterHeaderMenuOpen,
            setCharacterManagerOpen,
            setCombatDashboardView,
            setHitDice,
            setHp,
            setInitBonus,
            setLevel,
            setLevelDraft,
            setLevelReviewChecks,
            setLevelReviewHpGain,
            setLevelReviewOpen,
            setPortraitViewerOpen,
            setPrintPreviewOpen,
            setRestModalOpen,
            setRestType,
            setSheetReviewOpen,
            setSize,
            setSpeed,
            setStats,
            sheetFeedback,
            sheetReview,
            size,
            skillProficiencySources,
            speed,
            spellSlotChanges,
            srdCharacterRules,
            srdProfileCantrips,
            srdProfileHasSpellcasting,
            srdProfileKnownLimit,
            srdProfileMaxSpellLevel,
            srdProfilePreparedLimit,
            srdSpellcastingProfile,
            stats
        } = model;
        const accountUser = window.firebaseConnectionState?.user;
        const accountIsGuest = accountUser?.isAnonymous !== false;
        const openAccountPanel = () => {
            setCharacterHeaderMenuOpen(false);
            window.dispatchEvent(new CustomEvent('dnd-open-account-panel'));
        };

        return <>
<div data-tab="character" className="character-tab-intro tab-section">
                            {/* HEADER FANTASÍA */}
                            <div className={`character-header character-identity-hero rpg-panel p-4 flex flex-col gap-3 relative sheet-feedback-${sheetFeedback}`} data-accent="violet">
                                <div className="glass-overlay"></div>
                                <input ref={portraitFileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePortraitFile} className="hidden" />
                                <div className="character-header-menu z-30">
                                    <button type="button" onClick={() => setCharacterHeaderMenuOpen(value => !value)} className="character-header-menu-toggle" aria-expanded={characterHeaderMenuOpen} aria-label="Abrir acciones de personaje">⋯</button>
                                    {characterHeaderMenuOpen && ReactDOM.createPortal(<><button type="button" className="character-header-menu-scrim" onClick={() => setCharacterHeaderMenuOpen(false)} aria-label="Cerrar menú de personaje"></button><aside className="character-header-menu-panel" data-accent="violet" role="menu" aria-label="Acciones de personaje">
                                        <header className="character-header-menu-profile"><div>{isValidPortraitDataUrl(activeCharacter.meta.portrait) ? <img src={activeCharacter.meta.portrait} alt="" /> : <span>{(charInfo.name || 'PJ').trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase()}</span>}<i>{(charInfo.cls || 'PJ').trim().slice(0,2).toUpperCase()}</i></div><section><small>Ficha activa</small><strong>{charInfo.name || 'Personaje sin nombre'}</strong><p>{[charInfo.race, charInfo.cls, `Nivel ${normalizedCharacterLevel}`].filter(Boolean).join(' · ')}</p></section><button type="button" onClick={() => setCharacterHeaderMenuOpen(false)} aria-label="Cerrar menú">×</button></header>
                                        <div className="character-header-menu-groups">
                                            <section><h3>Personaje</h3><div>
                                                <button type="button" role="menuitem" onClick={() => { setCharacterBuildOpen(true); setCharacterHeaderMenuOpen(false); }}><span>✦</span><div><strong>Personalizar personaje</strong><small>Clase, especie y construcción</small></div></button>
                                                <button type="button" role="menuitem" className={lastReviewedLevel < normalizedCharacterLevel ? 'has-notice' : ''} onClick={() => { setLevelReviewHpGain(''); setLevelReviewChecks({}); setLevelReviewOpen(true); setCharacterHeaderMenuOpen(false); }}><span>↑</span><div><strong>{lastReviewedLevel < normalizedCharacterLevel ? `Revisar nivel ${normalizedCharacterLevel}` : 'Nivel revisado'}</strong><small>{lastReviewedLevel < normalizedCharacterLevel ? 'Hay cambios pendientes' : 'Progreso comprobado'}</small></div>{lastReviewedLevel < normalizedCharacterLevel && <i></i>}</button>
                                                <button type="button" role="menuitem" className={sheetReview.importantCount ? 'has-notice' : ''} onClick={() => { setSheetReviewOpen(true); setCharacterHeaderMenuOpen(false); }}><span>✓</span><div><strong>Revisar ficha completa</strong><small>{sheetReview.issues.length ? `${sheetReview.issues.length} aviso${sheetReview.issues.length === 1 ? '' : 's'} detectado${sheetReview.issues.length === 1 ? '' : 's'}` : 'Sin avisos detectados'}</small></div>{sheetReview.importantCount > 0 && <i></i>}</button>
                                            </div></section>
                                            <section><h3>Sesión</h3><div>
                                                <button type="button" role="menuitem" className="character-header-menu-primary" onClick={openSessionMode}><span>◆</span><div><strong>Abrir modo sesión</strong><small>Todo lo necesario para jugar</small></div><b>→</b></button>
                                                <button type="button" role="menuitem" onClick={() => { setRestModalOpen(true); setRestType(null); setCharacterHeaderMenuOpen(false); }}><span>☾</span><div><strong>Descansar</strong><small>Recuperar vida y recursos</small></div></button>
                                                <button type="button" role="menuitem" onClick={() => { setActivityHistoryOpen(true); setCharacterHeaderMenuOpen(false); }}><span>≡</span><div><strong>Historial</strong><small>Consultar cambios recientes</small></div></button>
                                                <button type="button" role="menuitem" onClick={() => { setAppSettingsOpen(true); setCharacterHeaderMenuOpen(false); }}><span>⚙</span><div><strong>Configuración</strong><small>Tema, idioma y accesibilidad</small></div></button>
                                            </div></section>
                                            <section><h3>Herramientas</h3><div>
                                                <button type="button" role="menuitem" onClick={() => { setPrintPreviewOpen(true); setCharacterHeaderMenuOpen(false); }}><span>▤</span><div><strong>Vista imprimible</strong><small>Ficha preparada para papel</small></div></button>
                                                <button type="button" role="menuitem" className={`character-header-account-action ${accountIsGuest ? 'is-guest' : 'is-synced'}`} onClick={openAccountPanel}><span>{accountIsGuest ? '◇' : '✓'}</span><div><strong>Cuenta y privacidad</strong><small>{accountIsGuest ? 'Invitado · Solo en este dispositivo' : 'Sincronizado · Cuenta protegida'}</small></div></button>
                                            </div></section>
                                        </div>
                                        <footer><button type="button" role="menuitem" onClick={() => { setCharacterManagerOpen(true); setCharacterHeaderMenuOpen(false); }} className="character-header-menu-primary"><span>⇄</span><div><strong>Cambiar personaje</strong><small>{characterList.length} ficha{characterList.length === 1 ? '' : 's'} disponible{characterList.length === 1 ? '' : 's'}</small></div><b>→</b></button></footer>
                                    </aside></>, document.body)}
                                </div>
                                <div className="character-header-content z-10 flex flex-1 min-w-0 w-full flex-row items-start gap-3 pr-12">
                                    <div className="character-portrait-stack shrink-0 flex flex-col items-center gap-2">
                                        <span className="character-class-sigil" aria-hidden="true">{(charInfo.cls || 'PJ').trim().slice(0, 2).toLocaleUpperCase('es')}</span>
                                        {isValidPortraitDataUrl(activeCharacter.meta.portrait) ? <button type="button" onClick={() => setPortraitViewerOpen(true)} className="character-portrait w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-purple-500/70 bg-gray-900 shadow-[0_0_16px_rgba(168,85,247,0.25)] hover:border-purple-300 focus-visible:outline-purple-300" aria-label={`Ampliar retrato de ${charInfo.name || 'personaje'}`}><img src={activeCharacter.meta.portrait} alt={`Retrato de ${charInfo.name || 'personaje'}`} className="w-full h-full object-cover" /></button> : <div className="character-portrait w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-purple-500/70 bg-gray-900 shadow-[0_0_16px_rgba(168,85,247,0.25)] flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-purple-400/70" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.8-3.8 3.2-5.8 7.5-5.8s6.7 2 7.5 5.8"/></svg></div>}
                                        {isValidPortraitDataUrl(activeCharacter.meta.portrait) ? <div className="character-portrait-actions flex gap-2"><button type="button" title="Cambiar retrato" aria-label="Cambiar retrato" onClick={() => portraitFileRef.current?.click()} className="is-change min-h-9 px-2 py-1 rounded border border-purple-700 bg-purple-950/50 hover:bg-purple-900 text-purple-100 text-[9px] font-fantasy uppercase tracking-wider"><span>Cambiar</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 16v4h4M20 8V4h-4M5.5 9A7 7 0 0 1 17 5.5L20 8M18.5 15A7 7 0 0 1 7 18.5L4 16"/></svg></button><button type="button" title="Eliminar retrato" aria-label="Eliminar retrato" onClick={removePortrait} className="is-remove min-h-9 px-2 py-1 rounded border border-red-800 bg-red-950/50 hover:bg-red-900 text-red-200 text-[9px] font-fantasy uppercase tracking-wider"><span>Eliminar</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6"/></svg></button></div> : <button type="button" onClick={() => portraitFileRef.current?.click()} className="character-portrait-add min-h-9 px-3 py-1 rounded border border-purple-700 bg-purple-950/50 hover:bg-purple-900 text-purple-100 text-[9px] font-fantasy uppercase tracking-wider">Añadir retrato</button>}
                                    </div>
                                    <div className="character-identity flex-1 min-w-0 w-full">
                                        <span className="character-identity-kicker">Ficha de personaje</span>
                                        <input type="text" placeholder="Ej: Kael Velosombrío" value={charInfo.name} onChange={e => setCharInfo({...charInfo, name: e.target.value})} className="character-name-input font-fantasy text-3xl md:text-4xl font-bold text-transparent placeholder:text-gray-500 bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 tracking-wider bg-transparent border-b border-transparent hover:border-gray-600 focus:border-purple-500 outline-none w-full max-w-[400px] transition-colors" />
                                        <div className="character-meta flex items-center flex-wrap text-purple-400 font-medium text-sm md:text-base mt-2 font-fantasy tracking-widest gap-2">
                                            <span className="character-meta-item character-meta-tooltip min-w-16 uppercase text-purple-300" tabIndex="0" data-tooltip={charInfo.race || 'Especie'} aria-label={`Especie: ${charInfo.race || 'Sin especificar'}`}><small>Especie</small><strong>{charInfo.race || 'Sin definir'}</strong></span>
                                            <span className="character-meta-separator text-gray-500">|</span>
                                            <span className="character-meta-item character-meta-tooltip is-class min-w-20 uppercase text-purple-300" tabIndex="0" data-tooltip={charInfo.cls || 'Clase'} aria-label={`Clase y subclase: ${charInfo.cls || 'Sin especificar'}`}><small>Clase</small><strong>{charInfo.cls || 'Sin definir'}</strong></span>
                                            <span className="character-meta-separator text-gray-500">|</span>
                                            <span className="character-meta-level-group">
                                                <span className="character-meta-item character-level uppercase flex items-center">
                                                    <small>Nivel</small><input type="number" min="1" max="20" value={levelDraft} onChange={event => setLevelDraft(event.target.value.replace(/\D/g,''))} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); requestLevelChange(); event.currentTarget.blur(); } if (event.key === 'Escape') { setLevelDraft(String(level)); event.currentTarget.blur(); } }} className="w-10 mx-1 bg-transparent border-b border-purple-500 text-center outline-none text-white focus:bg-gray-800 rounded font-sans" />
                                                    {String(levelDraft || '') !== String(level || '') && <button type="button" onClick={requestLevelChange} className="character-level-confirm" aria-label={`Confirmar nivel ${levelDraft || level}`}>Confirmar</button>}
                                                </span>
                                                <span className="character-proficiency-badge bg-purple-900/40 border border-purple-500 text-fuchsia-300 px-2 py-0.5 text-xs font-bold font-sans shadow-inner whitespace-nowrap">
                                                    <small>Competencia</small><strong>+{PROF_BONUS}</strong>
                                                </span>
                                            </span>
                                        </div>
                                        <div className="character-live-summary" aria-label="Estado actual del personaje">
                                            <span><b>{hp.current || 0}</b>/{hp.max || 0} PV{Number(hp.temp) > 0 ? ` · ${hp.temp} temporales` : ''}</span>
                                            {activeConcentration && <button type="button" onClick={() => requestTabChange('combat')}><i>C</i>{activeConcentration.spellName}</button>}
                                            {conditions.slice(0, 2).map(condition => <button type="button" key={typeof condition === 'string' ? condition : condition.name} onClick={() => { setCombatDashboardView('conditions'); requestTabChange('combat'); }}>{typeof condition === 'string' ? condition : condition.name}</button>)}
                                            {conditions.length > 2 && <button type="button" onClick={() => { setCombatDashboardView('conditions'); requestTabChange('combat'); }}>+{conditions.length - 2}</button>}
                                            {companions.length > 0 && <button type="button" className="character-companion-shortcut" onClick={() => openCompanionManager()}><i>✦</i>{companions.length} compañero{companions.length === 1 ? '' : 's'}</button>}
                                            <button type="button" className="character-session-shortcut" onClick={openSessionMode}><i>◆</i>Modo sesión</button>
                                        </div>
                                        <CharacterBuildModal
                                            isOpen={characterBuildOpen}
                                            onClose={() => setCharacterBuildOpen(false)}
                                            normalizedCharacterLevel={normalizedCharacterLevel}
                                            remainingClassSkillChoices={remainingClassSkillChoices}
                                            remainingExpertiseChoices={remainingExpertiseChoices}
                                            characterBuild={characterBuild}
                                            charInfo={charInfo}
                                            srdCharacterRules={srdCharacterRules}
                                            selectedSrdClass={selectedSrdClass}
                                            activeSrdSubclass={activeSrdSubclass}
                                            selectedSrdSpecies={selectedSrdSpecies}
                                            selectedSrdBackground={selectedSrdBackground}
                                            originSkillProficiencies={originSkillProficiencies}
                                            skillProficiencySources={skillProficiencySources}
                                            automaticSavingThrows={automaticSavingThrows}
                                            automaticExpertiseChoices={automaticExpertiseChoices}
                                            proficiencyBonus={PROF_BONUS}
                                            automaticSkillProficiencies={automaticSkillProficiencies}
                                            availableAutomaticRuleTraits={availableAutomaticRuleTraits}
                                            skills={SKILLS}
                                            requiredClassSkillChoices={requiredClassSkillChoices}
                                            selectedClassSkillChoiceCount={selectedClassSkillChoiceCount}
                                            automaticExpertiseLimit={automaticExpertiseLimit}
                                            selectedExpertiseChoiceCount={selectedExpertiseChoiceCount}
                                            hasSkillProficiency={hasSkillProficiency}
                                            createDefaultCharacterBuild={createDefaultCharacterBuild}
                                            setCharInfo={setCharInfo}
                                            setCharacterBuild={setCharacterBuild}
                                        />
                                        {CharacterCreationWizard && <CharacterCreationWizard
                                            key={`character-creation-${activeCharacter.meta.id}`}
                                            isOpen={characterCreationWizardOpen}
                                            onClose={closeCharacterCreationWizard}
                                            charInfo={charInfo}
                                            level={level}
                                            characterBuild={characterBuild}
                                            srdCharacterRules={srdCharacterRules}
                                            selectedSrdClass={selectedSrdClass}
                                            activeSrdSubclass={activeSrdSubclass}
                                            selectedSrdSpecies={selectedSrdSpecies}
                                            selectedSrdBackground={selectedSrdBackground}
                                            originSkillProficiencies={originSkillProficiencies}
                                            skillProficiencySources={skillProficiencySources}
                                            automaticSavingThrows={automaticSavingThrows}
                                            automaticExpertiseChoices={automaticExpertiseChoices}
                                            proficiencyBonus={PROF_BONUS}
                                            hp={hp}
                                            hitDice={hitDice}
                                            speed={speed}
                                            size={size}
                                            initBonus={initBonus}
                                            stats={stats}
                                            srdProfileHasSpellcasting={srdProfileHasSpellcasting}
                                            srdSpellcastingProfile={srdSpellcastingProfile}
                                            srdProfileCantrips={srdProfileCantrips}
                                            srdProfileKnownLimit={srdProfileKnownLimit}
                                            srdProfilePreparedLimit={srdProfilePreparedLimit}
                                            srdProfileMaxSpellLevel={srdProfileMaxSpellLevel}
                                            onOpenGrimoire={() => { closeCharacterCreationWizard(); setActiveTab('grimoire'); }}
                                            skills={SKILLS}
                                            remainingClassSkillChoices={remainingClassSkillChoices}
                                            remainingExpertiseChoices={remainingExpertiseChoices}
                                            requiredClassSkillChoices={requiredClassSkillChoices}
                                            selectedClassSkillChoiceCount={selectedClassSkillChoiceCount}
                                            automaticExpertiseLimit={automaticExpertiseLimit}
                                            selectedExpertiseChoiceCount={selectedExpertiseChoiceCount}
                                            automaticSkillProficiencies={automaticSkillProficiencies}
                                            availableAutomaticRuleTraits={availableAutomaticRuleTraits}
                                            hasSkillProficiency={hasSkillProficiency}
                                            createDefaultCharacterBuild={createDefaultCharacterBuild}
                                            normalizeNumberInput={handleNumInput}
                                            setCharInfo={setCharInfo}
                                            setLevel={setLevel}
                                            setCharacterBuild={setCharacterBuild}
                                            setHp={setHp}
                                            setHitDice={setHitDice}
                                            setSpeed={setSpeed}
                                            setSize={setSize}
                                            setInitBonus={setInitBonus}
                                            setStats={setStats}
                                        />}
                                        {levelReviewOpen && ReactDOM.createPortal(<div className="character-build-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeLevelReview(); }}>
                                            <section className="rpg-panel level-review-modal border border-cyan-700" role="dialog" aria-modal="true" aria-labelledby="level-review-title">
                                                <header className="level-review-heading flex items-start justify-between gap-3 border-b border-cyan-900/70 px-4 py-3 sm:px-5">
                                                    <div><p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">{pendingLevelChange ? 'Confirmar subida' : 'Subida guiada'}</p><h3 id="level-review-title" className="mt-1 font-fantasy text-lg font-bold uppercase tracking-wider text-white">{pendingLevelChange ? `Nivel ${levelReviewStart} → ${levelReviewTarget}` : `Revisión de nivel ${levelReviewTarget}`}</h3><p className="mt-1 text-xs text-gray-400">{levelReviewDelta ? `Cambios desde el nivel ${levelReviewStart || 'inicial'}. Revisa cada apartado antes de confirmar.` : 'Este nivel ya está revisado. Puedes consultar de nuevo su estado sin aplicar cambios.'}</p></div>
                                                    <div className="level-review-heading-actions">{levelReviewDelta > 0 && <div className="level-review-progress" aria-label={`${levelReviewChecklist.filter(item => levelReviewChecks[item.key]).length} de ${levelReviewChecklist.length} apartados revisados`}><span><i style={{width: `${levelReviewChecklist.length ? (levelReviewChecklist.filter(item => levelReviewChecks[item.key]).length / levelReviewChecklist.length) * 100 : 0}%`}}></i></span><strong>{levelReviewChecklist.filter(item => levelReviewChecks[item.key]).length}/{levelReviewChecklist.length}</strong><small>revisados</small></div>}<button type="button" onClick={closeLevelReview} className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-600 text-xl text-gray-200" aria-label="Cerrar revisión de nivel">×</button></div>
                                                </header>
                                                <div className="level-review-body space-y-3 p-4 sm:p-5">
                                                    {levelReviewDelta > 0 && <section className="level-review-checklist rounded border border-cyan-800 bg-cyan-950/15 p-3"><h4 className="text-xs font-bold uppercase tracking-wider text-cyan-200">Lista de confirmación</h4><p className="mt-1 text-xs text-gray-400">Marca cada apartado después de revisarlo. Marcarlo no aplica elecciones automáticamente.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{levelReviewChecklist.map(item => <label key={item.key} className={`flex min-h-10 items-center gap-2 rounded border px-3 py-2 text-xs ${levelReviewChecks[item.key] ? 'border-emerald-700 bg-emerald-950/20 text-emerald-100' : 'border-gray-700 bg-gray-950/40 text-gray-300'}`}><input type="checkbox" checked={!!levelReviewChecks[item.key]} onChange={event => setLevelReviewChecks(previous => ({ ...previous, [item.key]: event.target.checked }))}/><span>{item.label}</span></label>)}</div></section>}
                                                    <section className="level-review-metrics grid gap-2 sm:grid-cols-3">
                                                        <div className={`rounded border p-3 ${proficiencyChanged ? 'border-cyan-700 bg-cyan-950/20' : 'border-gray-700 bg-gray-900/50'}`}><span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bono de competencia</span><strong className="mt-1 block text-lg text-white">+{levelReviewProficiencyBonus}</strong><p className="mt-1 text-xs text-gray-400">{proficiencyChanged && levelReviewStart > 0 ? `Antes: +${previousProficiencyBonus}.` : 'Calculado por el nivel.'}</p></div>
                                                        <div className="rounded border border-cyan-800 bg-cyan-950/15 p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Dados de golpe</span><strong className="mt-1 block text-lg text-white">{levelReviewTarget}{selectedSrdClass?.hitDie || hitDice.type || ' dados'}</strong><p className="mt-1 text-xs text-gray-400">{levelReviewDelta ? `Al confirmar se añaden ${levelReviewDelta} dado${levelReviewDelta === 1 ? '' : 's'} disponible${levelReviewDelta === 1 ? '' : 's'}, sin superar el máximo.` : 'Sin dados nuevos pendientes.'}</p></div>
                                                        <label className="rounded border border-red-800 bg-red-950/15 p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-red-200">Aumento de PV</span><input type="number" min="0" inputMode="numeric" value={levelReviewHpGain} onChange={event => setLevelReviewHpGain(event.target.value === '' ? '' : String(Math.max(0, Math.trunc(Number(event.target.value) || 0))))} placeholder="0" className="mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-center text-lg font-bold text-white outline-none focus:border-red-500"/><p className="mt-1 text-xs text-gray-400">Escribe el total acordado. Solo se suma al confirmar.</p></label>
                                                    </section>
                                                    {levelReviewFeatureGroups.length > 0 ? <section className="rounded border border-purple-800 bg-purple-950/15 p-3"><h4 className="text-xs font-bold uppercase tracking-wider text-purple-200">Rasgos nuevos</h4><div className="mt-2 space-y-2">{levelReviewFeatureGroups.map(group => <div key={group.label}><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{group.label}</p><div className="mt-1 flex flex-wrap gap-1.5">{group.features.map(feature => <span key={feature.id} className="rounded border border-purple-700 bg-purple-950/25 px-2 py-1 text-xs text-purple-100">Nv. {feature.level} · {feature.name}</span>)}</div></div>)}</div><p className="mt-3 text-xs text-gray-400">{characterBuild?.autoFeatures !== false ? 'Los rasgos registrados ya aparecen automáticamente en la ficha.' : 'Los rasgos automáticos están en pausa; actívalos desde Personalizar si quieres mostrarlos.'}</p></section> : <section className="rounded border border-gray-700 bg-gray-900/50 p-3 text-sm text-gray-400">No hay rasgos nuevos registrados entre estos niveles.</section>}
                                                    <section className={`rounded border p-3 ${pendingResourceSuggestions.length ? 'border-yellow-800 bg-yellow-950/20' : 'border-gray-700 bg-gray-900/50'}`}><div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="text-xs font-bold uppercase tracking-wider text-yellow-200">Recursos y usos máximos</h4><p className="mt-1 text-xs text-gray-400">{pendingResourceSuggestions.length ? `${pendingResourceSuggestions.length} recurso${pendingResourceSuggestions.length === 1 ? '' : 's'} necesita revisión.` : 'Los recursos sugeridos ya coinciden con este nivel.'}</p></div>{pendingResourceSuggestions.length > 0 && <button type="button" onClick={addSuggestedClassResources} className="min-h-10 rounded border border-yellow-700 px-3 text-xs font-bold text-yellow-100">Revisar recursos</button>}</div>{pendingResourceSuggestions.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{pendingResourceSuggestions.map(resource => <span key={resource.key} className="rounded border border-yellow-800 px-2 py-1 text-xs text-yellow-100">{resource.name}: máx. {resource.max}{resource.type ? ` ${resource.type}` : ''}</span>)}</div>}</section>
                                                    {levelReviewHasSpellcasting && <section className="rounded border border-fuchsia-800 bg-fuchsia-950/15 p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="text-xs font-bold uppercase tracking-wider text-fuchsia-200">Ranuras y conjuros</h4><p className="mt-1 text-sm text-gray-200">{srdSpellcastingProfile?.mode === 'prepared' ? `Preparados: ${previousSpellProgression.prepared} → ${currentSpellProgression.prepared}` : `Conocidos: ${previousSpellProgression.known} → ${currentSpellProgression.known}`} · Trucos: {previousSpellProgression.cantrips} → {currentSpellProgression.cantrips}.</p></div><button type="button" onClick={() => { setLevelReviewOpen(false); requestTabChange('grimoire'); }} className="min-h-10 rounded border border-fuchsia-700 px-3 text-xs font-bold text-fuchsia-100">Abrir Grimorio</button></div><div className="mt-2 flex flex-wrap gap-1.5">{spellSlotChanges.map(slot => <span key={slot.level} className="rounded border border-fuchsia-800 px-2 py-1 text-xs text-fuchsia-100">Nivel {slot.level}: {slot.previous} → {slot.current}</span>)}{currentSpellProgression.pact && <span className="rounded border border-yellow-800 px-2 py-1 text-xs text-yellow-100">Pacto: {previousSpellProgression.pact?.[0] || 0} ranuras N{previousSpellProgression.pact?.[1] || '—'} → {currentSpellProgression.pact[0]} ranuras N{currentSpellProgression.pact[1]}</span>}{!spellSlotChanges.length && !currentSpellProgression.pact && <span className="text-xs text-gray-400">Sin cambios de ranuras en este tramo.</span>}</div><p className="mt-2 text-xs text-gray-400">Los límites y máximos técnicos se sincronizan; tú decides qué conjuros aprender o preparar.</p></section>}
                                                    <section className={`rounded border p-3 ${pendingAbilityImprovementLevels.length ? 'border-amber-700 bg-amber-950/20' : 'border-gray-700 bg-gray-900/50'}`}><h4 className="text-xs font-bold uppercase tracking-wider text-amber-200">Mejoras de característica o dotes</h4>{pendingAbilityImprovementLevels.length ? <><p className="mt-1 text-sm text-white">Decisión pendiente en nivel{pendingAbilityImprovementLevels.length === 1 ? '' : 'es'} {pendingAbilityImprovementLevels.join(', ')}.</p><p className="mt-1 text-xs text-gray-400">La app no elegirá ni aplicará ninguna mejora o dote. Haz tu elección en Atributos o Dotes y confirma después.</p></> : <p className="mt-1 text-xs text-gray-400">No se cruza ningún nivel de mejora en esta revisión.</p>}</section>
                                                    {(remainingClassSkillChoices > 0 || levelReviewRemainingExpertiseChoices > 0) && <section className="rounded border border-yellow-800 bg-yellow-950/20 p-3"><h4 className="text-xs font-bold uppercase tracking-wider text-yellow-200">Otras elecciones pendientes</h4><p className="mt-1 text-sm text-gray-200">{[remainingClassSkillChoices > 0 && `${remainingClassSkillChoices} competencia${remainingClassSkillChoices === 1 ? '' : 's'} de clase`, levelReviewRemainingExpertiseChoices > 0 && `${levelReviewRemainingExpertiseChoices} opción${levelReviewRemainingExpertiseChoices === 1 ? '' : 'es'} de pericia`].filter(Boolean).join(' · ')}.</p></section>}
                                                </div>
                                                <footer className="level-review-footer flex flex-wrap items-center justify-between gap-2 border-t border-gray-700 px-4 py-3 sm:px-5"><p className="text-xs text-gray-500">Confirmar aplica el nuevo nivel, los PV escritos y los dados de golpe disponibles; las decisiones siguen siendo manuales.</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setLevelReviewOpen(false); setCharacterBuildOpen(true); }} className="min-h-11 rounded border border-gray-600 px-4 text-sm text-gray-200">Personalizar</button><button type="button" onClick={confirmLevelReview} disabled={!levelReviewDelta || !levelReviewChecklistComplete} className="min-h-11 rounded border border-cyan-700 bg-cyan-950/30 px-4 text-sm font-bold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40">{levelReviewChecklistComplete ? (pendingLevelChange ? `Subir a nivel ${levelReviewTarget}` : 'Confirmar revisión') : `Revisa ${levelReviewChecklist.filter(item => !levelReviewChecks[item.key]).length} apartado${levelReviewChecklist.filter(item => !levelReviewChecks[item.key]).length === 1 ? '' : 's'}`}</button></div></footer>
                                            </section>
                                        </div>, document.body)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {sheetReview.issues.length > 0 && <button type="button" data-tab="character" onClick={() => setSheetReviewOpen(true)} className={`sheet-review-strip tab-section is-${sheetReview.status}`} aria-label={`Abrir revisión de ficha: ${sheetReview.issues.length} avisos`}>
                            <span className="sheet-review-strip__emblem" aria-hidden="true">{sheetReview.status === 'ready' ? '✓' : sheetReview.status === 'attention' ? '!' : '◇'}</span>
                            <span className="sheet-review-strip__copy"><small>Comprobación de ficha</small><strong>{sheetReview.status === 'ready' ? 'Sin avisos detectados' : sheetReview.importantCount ? `${sheetReview.importantCount} dato${sheetReview.importantCount === 1 ? '' : 's'} importante${sheetReview.importantCount === 1 ? '' : 's'} por revisar` : `${sheetReview.noticeCount} recordatorio${sheetReview.noticeCount === 1 ? '' : 's'}`}</strong><em>{sheetReview.status === 'ready' ? 'Los datos esenciales y contadores son coherentes.' : 'Pulsa para ver cada aviso y llegar directamente a su sección.'}</em></span>
                            <span className="sheet-review-strip__progress"><i><b style={{ width: `${sheetReview.totalChecks ? sheetReview.passedChecks / sheetReview.totalChecks * 100 : 100}%` }}/></i><small>{sheetReview.passedChecks}/{sheetReview.totalChecks} esenciales</small></span>
                            <b className="sheet-review-strip__arrow" aria-hidden="true">→</b>
                        </button>}
        </>;
    }

    window.DndCharacterHeaderComponents = { CharacterHeader };
})();
