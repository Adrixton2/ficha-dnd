/* Presentation-only character construction modal. State remains in app.jsx. */
window.DndCharacterBuilderComponents = (() => {
    const SkillSourceSummary = ({ sources, skills }) => {
        if (!sources?.length) return null;
        const sourcesBySkill = sources.reduce((result, source) => {
            source.skills.forEach(skillKey => {
                result[skillKey] = [...(result[skillKey] || []), source.label];
            });
            return result;
        }, {});
        const duplicateSources = Object.entries(sourcesBySkill)
            .filter(([, labels]) => labels.length > 1)
            .map(([skillKey, labels]) => ({
                name: skills.find(skill => skill.key === skillKey)?.name || skillKey,
                labels
            }));
        return <div className="character-build-summary mt-3">
            <span className="character-build-summary-label">Competencias otorgadas</span>
            <div className="w-full space-y-1.5">
                {sources.map(source => <div key={source.label} className="flex flex-wrap items-center gap-2 text-xs"><span className="font-semibold text-cyan-200">{source.label}</span><div className="character-build-summary-chips">{source.skills.map(skillKey => <span key={`${source.label}-${skillKey}`}>{skills.find(skill => skill.key === skillKey)?.name || skillKey}</span>)}</div></div>)}
            </div>
            {duplicateSources.length > 0 && <p className="mt-2 text-[11px] text-yellow-200">Coinciden: {duplicateSources.map(entry => `${entry.name} (${entry.labels.join(' + ')})`).join(' · ')}. Cada habilidad cuenta una sola vez.</p>}
        </div>;
    };

    const ClassBenefitSummary = ({ savingThrows, expertiseSkills, proficiencyBonus, skills }) => {
        const abilityNames = { fue: 'Fuerza', des: 'Destreza', con: 'Constitución', int: 'Inteligencia', sab: 'Sabiduría', car: 'Carisma' };
        const expertiseNames = expertiseSkills.map(skillKey => skills.find(skill => skill.key === skillKey)?.name || skillKey);
        if (!savingThrows?.length && !expertiseNames.length && proficiencyBonus === undefined) return null;
        return <div className="character-build-summary mt-3">
            <span className="character-build-summary-label">Beneficios de clase</span>
            <div className="flex flex-wrap gap-2 text-xs">
                {proficiencyBonus !== undefined && <div className="flex items-center gap-1.5"><span className="font-semibold text-amber-200">Bono de competencia:</span><span className="rounded border border-amber-700/70 bg-amber-950/25 px-2 py-1 font-bold text-amber-100">+{proficiencyBonus}</span></div>}
                {savingThrows?.length > 0 && <div className="flex flex-wrap items-center gap-1.5"><span className="font-semibold text-purple-200">Salvaciones:</span><div className="character-build-summary-chips">{savingThrows.map(statKey => <span key={statKey}>{abilityNames[statKey] || statKey}</span>)}</div></div>}
                {expertiseNames.length > 0 && <div className="flex flex-wrap items-center gap-1.5"><span className="font-semibold text-fuchsia-200">Pericia:</span><div className="character-build-summary-chips">{expertiseNames.map(skillName => <span key={skillName}>{skillName}</span>)}</div></div>}
            </div>
        </div>;
    };

    const CharacterBuildModal = ({
        isOpen,
        onClose,
        normalizedCharacterLevel,
        remainingClassSkillChoices,
        remainingExpertiseChoices,
        characterBuild,
        charInfo,
        srdCharacterRules,
        selectedSrdClass,
        activeSrdSubclass,
        selectedSrdSpecies,
        selectedSrdBackground,
        originSkillProficiencies,
        skillProficiencySources,
        automaticSavingThrows,
        automaticExpertiseChoices,
        proficiencyBonus,
        automaticSkillProficiencies,
        availableAutomaticRuleTraits,
        skills,
        requiredClassSkillChoices,
        selectedClassSkillChoiceCount,
        automaticExpertiseLimit,
        selectedExpertiseChoiceCount,
        hasSkillProficiency,
        createDefaultCharacterBuild,
        setCharInfo,
        setCharacterBuild
    }) => {
        if (!isOpen) return null;

        const updateClass = value => {
            const nextClass = srdCharacterRules?.getClassForName?.(value);
            setCharInfo(previous => ({ ...previous, cls: value }));
            setCharacterBuild(previous => ({
                ...createDefaultCharacterBuild(),
                ...previous,
                classId: nextClass?.id || '',
                subclassId: '',
                subclassName: '',
                classSkillChoices: [],
                classExpertiseChoices: []
            }));
        };
        const updateSubclass = value => {
            const nextSubclass = srdCharacterRules?.getSubclassForName?.(value, selectedSrdClass?.id);
            setCharacterBuild(previous => ({
                ...createDefaultCharacterBuild(),
                ...previous,
                classId: selectedSrdClass?.id || '',
                subclassId: nextSubclass?.id || '',
                subclassName: value
            }));
        };
        const updateSpecies = value => {
            const nextSpecies = srdCharacterRules?.getSpeciesForName?.(value);
            setCharInfo(previous => ({ ...previous, race: value }));
            setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, speciesId: nextSpecies?.id || '' }));
        };
        const updateBackground = value => {
            const nextBackground = srdCharacterRules?.getBackgroundForName?.(value);
            setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, backgroundName: value, backgroundId: nextBackground?.id || '' }));
        };
        const toggleClassSkill = skillKey => {
            if (originSkillProficiencies.includes(skillKey)) return;
            const current = Array.isArray(characterBuild?.classSkillChoices) ? characterBuild.classSkillChoices : [];
            const selected = current.includes(skillKey);
            setCharacterBuild(previous => ({
                ...createDefaultCharacterBuild(),
                ...previous,
                classSkillChoices: selected ? current.filter(key => key !== skillKey) : [...current, skillKey]
            }));
        };
        const toggleExpertise = skillKey => {
            const current = Array.isArray(characterBuild?.classExpertiseChoices) ? characterBuild.classExpertiseChoices : [];
            const selected = current.includes(skillKey);
            setCharacterBuild(previous => ({
                ...createDefaultCharacterBuild(),
                ...previous,
                classExpertiseChoices: selected ? current.filter(key => key !== skillKey) : [...current, skillKey]
            }));
        };

        return ReactDOM.createPortal(
            <div
                className="character-build-modal-backdrop"
                role="presentation"
                onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
            >
                <section className="character-build-panel character-build-modal" role="dialog" aria-modal="true" aria-labelledby="character-build-title">
                    <div className="character-build-heading">
                        <div>
                            <h3 id="character-build-title">Personalizar personaje</h3>
                            <p>Selecciona opciones conocidas o escribe las tuyas.</p>
                        </div>
                        <div className="character-build-heading-actions">
                            <span>Nivel {normalizedCharacterLevel}</span>
                            <button type="button" onClick={onClose} aria-label="Cerrar personalización del personaje">×</button>
                        </div>
                    </div>

                    {(remainingClassSkillChoices > 0 || remainingExpertiseChoices > 0) && (
                        <div className="character-build-notice" role="status">
                            <strong>Faltan elecciones</strong>
                            <span>
                                {[
                                    remainingClassSkillChoices > 0 && `${remainingClassSkillChoices} competencia${remainingClassSkillChoices === 1 ? '' : 's'} de clase`,
                                    remainingExpertiseChoices > 0 && `${remainingExpertiseChoices} opción${remainingExpertiseChoices === 1 ? '' : 'es'} de pericia`
                                ].filter(Boolean).join(' · ')}
                            </span>
                        </div>
                    )}

                    <div className="character-build-fields grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <label className="character-build-field">
                            Clase
                            <input list="srd-class-suggestions" value={charInfo.cls} onChange={event => updateClass(event.target.value)} placeholder="Ej: Pícaro" className="mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-500" />
                            <datalist id="srd-class-suggestions">{Object.values(srdCharacterRules?.classes || {}).map(entry => <option key={entry.id} value={entry.name} />)}</datalist>
                        </label>
                        <label className="character-build-field">
                            Subclase
                            <input list="srd-subclass-suggestions" value={characterBuild?.subclassName || activeSrdSubclass?.name || ''} disabled={!selectedSrdClass} onChange={event => updateSubclass(event.target.value)} placeholder="Personalizada" className="mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50" />
                            <datalist id="srd-subclass-suggestions">{(srdCharacterRules?.getSubclassesForClass?.(selectedSrdClass?.id) || []).map(entry => <option key={entry.id} value={entry.name} />)}</datalist>
                        </label>
                        <label className="character-build-field">
                            Especie
                            <input list="srd-species-suggestions" value={charInfo.race} onChange={event => updateSpecies(event.target.value)} placeholder="Ej: Humano" className="mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-500" />
                            <datalist id="srd-species-suggestions">{Object.values(srdCharacterRules?.species || {}).map(entry => <option key={entry.id} value={entry.name} />)}</datalist>
                        </label>
                        <label className="character-build-field">
                            Trasfondo
                            <input list="srd-background-suggestions" value={characterBuild?.backgroundName || ''} onChange={event => updateBackground(event.target.value)} placeholder="Ej: Criminal" className="mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-500" />
                            <datalist id="srd-background-suggestions">{Object.values(srdCharacterRules?.backgrounds || {}).map(entry => <option key={entry.id} value={entry.name} />)}</datalist>
                        </label>
                    </div>

                    <div className="character-build-options mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-300">
                        <label className="inline-flex min-h-8 items-center gap-2"><input type="checkbox" checked={!!characterBuild?.applySpeciesAbilityBonuses} disabled={!selectedSrdSpecies} onChange={event => setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, applySpeciesAbilityBonuses: event.target.checked }))} /> Aplicar bonificadores de atributo de especie</label>
                        <label className="inline-flex min-h-8 items-center gap-2"><input type="checkbox" checked={characterBuild?.autoHitDie !== false} disabled={!selectedSrdClass} onChange={event => setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, autoHitDie: event.target.checked }))} /> Dado de golpe automático</label>
                        <label className="inline-flex min-h-8 items-center gap-2"><input type="checkbox" checked={characterBuild?.autoSpeedAndSize !== false} disabled={!selectedSrdSpecies} onChange={event => setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, autoSpeedAndSize: event.target.checked }))} /> Velocidad y tamaño automáticos</label>
                        <label className="inline-flex min-h-8 items-center gap-2"><input type="checkbox" checked={characterBuild?.autoFeatures !== false} onChange={event => setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, autoFeatures: event.target.checked }))} /> Rasgos automáticos</label>
                    </div>

                    <SkillSourceSummary sources={skillProficiencySources} skills={skills} />
                    <ClassBenefitSummary savingThrows={automaticSavingThrows} expertiseSkills={automaticExpertiseChoices} proficiencyBonus={proficiencyBonus} skills={skills} />

                    {availableAutomaticRuleTraits.length > 0 && (
                        <details className="character-build-auto-traits mt-3">
                            <summary><div className="character-build-auto-traits-heading"><strong>Rasgos automáticos</strong><span>{availableAutomaticRuleTraits.length} por nivel · {characterBuild?.autoFeatures !== false ? 'Aplicados' : 'En pausa'}</span></div></summary>
                            <div className="character-build-auto-traits-body"><div className="character-build-auto-traits-list">{availableAutomaticRuleTraits.map(trait => <span key={trait.id}>{trait.name}</span>)}</div><p>{characterBuild?.autoFeatures !== false ? 'Están visibles en la sección Rasgos. Los rasgos manuales no se modifican.' : 'Activa Rasgos automáticos para mostrarlos de nuevo sin modificar tus rasgos manuales.'}</p></div>
                        </details>
                    )}

                    {selectedSrdClass?.skillChoices && (
                        <div className="character-build-choices mt-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-200">Competencias de clase <span className="ml-1 normal-case font-normal text-gray-400">Elige {selectedSrdClass.skillChoices.count}</span><span className={`normal-case font-semibold ${remainingClassSkillChoices > 0 ? 'text-yellow-200' : 'text-cyan-200'}`}>{selectedClassSkillChoiceCount}/{requiredClassSkillChoices}</span></p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {selectedSrdClass.skillChoices.options.map(skillKey => {
                                    const skill = skills.find(entry => entry.key === skillKey);
                                    const grantedByOrigin = originSkillProficiencies.includes(skillKey);
                                    const grantedBy = skillProficiencySources.filter(source => source.skills.includes(skillKey)).map(source => source.label);
                                    const selected = !grantedByOrigin && (characterBuild?.classSkillChoices || []).includes(skillKey);
                                    const selectedChoices = (characterBuild?.classSkillChoices || []).filter(key => !originSkillProficiencies.includes(key));
                                    const selectionFull = selectedChoices.length >= selectedSrdClass.skillChoices.count;
                                    return <label key={skillKey} className={`inline-flex min-h-9 items-center gap-1.5 rounded border px-2 text-xs ${grantedByOrigin ? 'border-gray-800 bg-gray-950/35 text-gray-500' : selected ? 'border-cyan-500 bg-cyan-950/35 text-cyan-100' : 'border-gray-700 bg-gray-950/60 text-gray-300'}`}><input type="checkbox" checked={selected} disabled={grantedByOrigin || (!selected && selectionFull)} onChange={() => toggleClassSkill(skillKey)} /> {skill?.name || skillKey}{grantedByOrigin && <span className="text-[9px] text-gray-600">{grantedBy.join(' · ')}</span>}</label>;
                                })}
                            </div>
                        </div>
                    )}

                    {selectedSrdClass?.expertiseLevels && (
                        <div className="character-build-choices mt-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-200">Pericia <span className="ml-1 normal-case font-normal text-gray-400">Elige {automaticExpertiseLimit}. Solo se muestran competencias disponibles.</span><span className={`normal-case font-semibold ${remainingExpertiseChoices > 0 ? 'text-yellow-200' : 'text-fuchsia-200'}`}>{selectedExpertiseChoiceCount}/{automaticExpertiseLimit}</span></p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {skills.filter(skill => hasSkillProficiency(skill.key)).map(skill => {
                                    const selected = Array.isArray(characterBuild?.classExpertiseChoices) && characterBuild.classExpertiseChoices.includes(skill.key);
                                    const full = (characterBuild?.classExpertiseChoices || []).length >= automaticExpertiseLimit;
                                    return <label key={skill.key} className={`inline-flex min-h-9 items-center gap-1.5 rounded border px-2 text-xs ${selected ? 'border-fuchsia-500 bg-fuchsia-950/35 text-fuchsia-100' : 'border-gray-700 bg-gray-950/60 text-gray-300'}`}><input type="checkbox" checked={selected} disabled={!selected && full} onChange={() => toggleExpertise(skill.key)} /> {skill.name}</label>;
                                })}
                            </div>
                        </div>
                    )}
                </section>
            </div>,
            document.body
        );
    };

    const CharacterCreationWizard = ({
        isOpen,
        onClose,
        charInfo,
        level,
        characterBuild,
        srdCharacterRules,
        selectedSrdClass,
        activeSrdSubclass,
        selectedSrdSpecies,
        selectedSrdBackground,
        originSkillProficiencies,
        skillProficiencySources,
        automaticSavingThrows,
        automaticExpertiseChoices,
        proficiencyBonus,
        hp,
        hitDice,
        speed,
        size,
        initBonus,
        stats,
        srdProfileHasSpellcasting,
        srdSpellcastingProfile,
        srdProfileCantrips,
        srdProfileKnownLimit,
        srdProfilePreparedLimit,
        srdProfileMaxSpellLevel,
        onOpenGrimoire,
        skills,
        remainingClassSkillChoices,
        remainingExpertiseChoices,
        requiredClassSkillChoices,
        selectedClassSkillChoiceCount,
        automaticExpertiseLimit,
        selectedExpertiseChoiceCount,
        automaticSkillProficiencies,
        availableAutomaticRuleTraits,
        hasSkillProficiency,
        createDefaultCharacterBuild,
        normalizeNumberInput,
        setCharInfo,
        setLevel,
        setCharacterBuild,
        setHp,
        setHitDice,
        setSpeed,
        setSize,
        setInitBonus,
        setStats
    }) => {
        const [stepIndex, setStepIndex] = React.useState(0);
        if (!isOpen) return null;

        const steps = ['Identidad', 'Origen', 'Elecciones', 'Atributos', 'Combate', 'Magia', 'Resumen'];
        const isFirstStep = stepIndex === 0;
        const isLastStep = stepIndex === steps.length - 1;
        const abilityFields = [
            ['fue', 'Fuerza'], ['des', 'Destreza'], ['con', 'Constitución'],
            ['int', 'Inteligencia'], ['sab', 'Sabiduría'], ['car', 'Carisma']
        ];
        const spellcastingAbilityNames = { int: 'Inteligencia', sab: 'Sabiduría', car: 'Carisma' };
        const updateClass = value => {
            const nextClass = srdCharacterRules?.getClassForName?.(value);
            setCharInfo(previous => ({ ...previous, cls: value }));
            setCharacterBuild(previous => ({
                ...createDefaultCharacterBuild(),
                ...previous,
                classId: nextClass?.id || '',
                subclassId: '',
                subclassName: '',
                classSkillChoices: [],
                classExpertiseChoices: []
            }));
        };
        const updateSubclass = value => {
            const nextSubclass = srdCharacterRules?.getSubclassForName?.(value, selectedSrdClass?.id);
            setCharacterBuild(previous => ({
                ...createDefaultCharacterBuild(),
                ...previous,
                classId: selectedSrdClass?.id || '',
                subclassId: nextSubclass?.id || '',
                subclassName: value
            }));
        };
        const updateSpecies = value => {
            const nextSpecies = srdCharacterRules?.getSpeciesForName?.(value);
            setCharInfo(previous => ({ ...previous, race: value }));
            setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, speciesId: nextSpecies?.id || '' }));
        };
        const updateBackground = value => {
            const nextBackground = srdCharacterRules?.getBackgroundForName?.(value);
            setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, backgroundName: value, backgroundId: nextBackground?.id || '' }));
        };
        const toggleClassSkill = skillKey => {
            if (originSkillProficiencies.includes(skillKey)) return;
            const current = Array.isArray(characterBuild?.classSkillChoices) ? characterBuild.classSkillChoices : [];
            const selected = current.includes(skillKey);
            setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, classSkillChoices: selected ? current.filter(key => key !== skillKey) : [...current, skillKey] }));
        };
        const toggleExpertise = skillKey => {
            const current = Array.isArray(characterBuild?.classExpertiseChoices) ? characterBuild.classExpertiseChoices : [];
            const selected = current.includes(skillKey);
            setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, classExpertiseChoices: selected ? current.filter(key => key !== skillKey) : [...current, skillKey] }));
        };

        const renderStep = () => {
            if (stepIndex === 0) return <div className="creation-step-content">
                <p className="creation-step-intro">Empieza por los datos que identifican la ficha. Todo se puede editar más adelante.</p>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
                    <label className="character-build-field">Nombre del personaje
                        <input autoFocus type="text" value={charInfo.name} onChange={event => setCharInfo(previous => ({ ...previous, name: event.target.value }))} placeholder="Ej: Kael Velosombrío" className="mt-1 block min-h-11 w-full rounded border border-gray-700 bg-gray-950 px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-500" />
                    </label>
                    <label className="character-build-field">Nivel
                        <input type="number" min="1" max="20" value={level} onChange={event => setLevel(normalizeNumberInput(event.target.value))} placeholder="1" className="mt-1 block min-h-11 w-full rounded border border-gray-700 bg-gray-950 px-3 text-center text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-500" />
                    </label>
                </div>
            </div>;

            if (stepIndex === 1) return <div className="creation-step-content">
                <p className="creation-step-intro">Elige opciones del compendio o escribe una personalizada. La ficha seguirá siendo completamente manual.</p>
                <div className="character-build-fields grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="character-build-field">Clase
                        <input list="creation-class-suggestions" value={charInfo.cls} onChange={event => updateClass(event.target.value)} placeholder="Ej: Pícaro" className="mt-1 block min-h-11 w-full rounded border border-gray-700 bg-gray-950 px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-500" />
                        <datalist id="creation-class-suggestions">{Object.values(srdCharacterRules?.classes || {}).map(entry => <option key={entry.id} value={entry.name} />)}</datalist>
                    </label>
                    <label className="character-build-field">Subclase
                        <input list="creation-subclass-suggestions" value={characterBuild?.subclassName || activeSrdSubclass?.name || ''} disabled={!selectedSrdClass} onChange={event => updateSubclass(event.target.value)} placeholder={selectedSrdClass ? 'Opcional o personalizada' : 'Elige antes una clase'} className="mt-1 block min-h-11 w-full rounded border border-gray-700 bg-gray-950 px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50" />
                        <datalist id="creation-subclass-suggestions">{(srdCharacterRules?.getSubclassesForClass?.(selectedSrdClass?.id) || []).map(entry => <option key={entry.id} value={entry.name} />)}</datalist>
                    </label>
                    <label className="character-build-field">Especie
                        <input list="creation-species-suggestions" value={charInfo.race} onChange={event => updateSpecies(event.target.value)} placeholder="Ej: Humano" className="mt-1 block min-h-11 w-full rounded border border-gray-700 bg-gray-950 px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-500" />
                        <datalist id="creation-species-suggestions">{Object.values(srdCharacterRules?.species || {}).map(entry => <option key={entry.id} value={entry.name} />)}</datalist>
                    </label>
                    <label className="character-build-field">Trasfondo
                        <input list="creation-background-suggestions" value={characterBuild?.backgroundName || ''} onChange={event => updateBackground(event.target.value)} placeholder="Ej: Criminal" className="mt-1 block min-h-11 w-full rounded border border-gray-700 bg-gray-950 px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-500" />
                        <datalist id="creation-background-suggestions">{Object.values(srdCharacterRules?.backgrounds || {}).map(entry => <option key={entry.id} value={entry.name} />)}</datalist>
                    </label>
                </div>
                <SkillSourceSummary sources={skillProficiencySources} skills={skills} />
                <ClassBenefitSummary savingThrows={automaticSavingThrows} expertiseSkills={automaticExpertiseChoices} proficiencyBonus={proficiencyBonus} skills={skills} />
            </div>;

            if (stepIndex === 2) return <div className="creation-step-content space-y-4">
                <p className="creation-step-intro">Estas propuestas no sustituyen tus decisiones. Puedes saltarlas y completar la ficha cuando quieras.</p>
                <div className="character-build-options flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-300">
                    <label className="inline-flex min-h-9 items-center gap-2"><input type="checkbox" checked={!!characterBuild?.applySpeciesAbilityBonuses} disabled={!selectedSrdSpecies} onChange={event => setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, applySpeciesAbilityBonuses: event.target.checked }))} /> Aplicar bonificadores de atributo de especie</label>
                    <label className="inline-flex min-h-9 items-center gap-2"><input type="checkbox" checked={characterBuild?.autoHitDie !== false} disabled={!selectedSrdClass} onChange={event => setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, autoHitDie: event.target.checked }))} /> Dado de golpe automático</label>
                    <label className="inline-flex min-h-9 items-center gap-2"><input type="checkbox" checked={characterBuild?.autoSpeedAndSize !== false} disabled={!selectedSrdSpecies} onChange={event => setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, autoSpeedAndSize: event.target.checked }))} /> Velocidad y tamaño automáticos</label>
                    <label className="inline-flex min-h-9 items-center gap-2"><input type="checkbox" checked={characterBuild?.autoFeatures !== false} onChange={event => setCharacterBuild(previous => ({ ...createDefaultCharacterBuild(), ...previous, autoFeatures: event.target.checked }))} /> Rasgos automáticos</label>
                </div>
                {selectedSrdClass?.skillChoices && <div className="character-build-choices">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-200">Competencias de clase <span className="ml-1 normal-case font-normal text-gray-400">Elige {requiredClassSkillChoices}</span><span className={`normal-case font-semibold ${remainingClassSkillChoices > 0 ? 'text-yellow-200' : 'text-cyan-200'}`}>{selectedClassSkillChoiceCount}/{requiredClassSkillChoices}</span></p>
                    <div className="mt-2 flex flex-wrap gap-2">{selectedSrdClass.skillChoices.options.map(skillKey => {
                        const skill = skills.find(entry => entry.key === skillKey);
                        const grantedByOrigin = originSkillProficiencies.includes(skillKey);
                        const grantedBy = skillProficiencySources.filter(source => source.skills.includes(skillKey)).map(source => source.label);
                        const selected = !grantedByOrigin && (characterBuild?.classSkillChoices || []).includes(skillKey);
                        const selectedChoices = (characterBuild?.classSkillChoices || []).filter(key => !originSkillProficiencies.includes(key));
                        const full = selectedChoices.length >= requiredClassSkillChoices;
                        return <label key={skillKey} className={`inline-flex min-h-10 items-center gap-1.5 rounded border px-2 text-xs ${grantedByOrigin ? 'border-gray-800 bg-gray-950/35 text-gray-500' : selected ? 'border-cyan-500 bg-cyan-950/35 text-cyan-100' : 'border-gray-700 bg-gray-950/60 text-gray-300'}`}><input type="checkbox" checked={selected} disabled={grantedByOrigin || (!selected && full)} onChange={() => toggleClassSkill(skillKey)} /> {skill?.name || skillKey}{grantedByOrigin && <span className="text-[9px] text-gray-600">{grantedBy.join(' · ')}</span>}</label>;
                    })}</div>
                </div>}
                {selectedSrdClass?.expertiseLevels && automaticExpertiseLimit > 0 && <div className="character-build-choices">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-200">Pericia <span className="ml-1 normal-case font-normal text-gray-400">Elige {automaticExpertiseLimit}. Solo se muestran competencias disponibles.</span><span className={`normal-case font-semibold ${remainingExpertiseChoices > 0 ? 'text-yellow-200' : 'text-fuchsia-200'}`}>{selectedExpertiseChoiceCount}/{automaticExpertiseLimit}</span></p>
                    <div className="mt-2 flex flex-wrap gap-2">{skills.filter(skill => hasSkillProficiency(skill.key)).map(skill => {
                        const selected = (characterBuild?.classExpertiseChoices || []).includes(skill.key);
                        const full = (characterBuild?.classExpertiseChoices || []).length >= automaticExpertiseLimit;
                        return <label key={skill.key} className={`inline-flex min-h-10 items-center gap-1.5 rounded border px-2 text-xs ${selected ? 'border-fuchsia-500 bg-fuchsia-950/35 text-fuchsia-100' : 'border-gray-700 bg-gray-950/60 text-gray-300'}`}><input type="checkbox" checked={selected} disabled={!selected && full} onChange={() => toggleExpertise(skill.key)} /> {skill.name}</label>;
                    })}</div>
                </div>}
            </div>;

            if (stepIndex === 3) return <div className="creation-step-content space-y-4">
                <p className="creation-step-intro">Introduce los atributos base. Son valores iniciales: los modificadores temporales y cualquier ajuste manual siguen estando disponibles en la ficha.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {abilityFields.map(([key, label]) => <label key={key} className="character-build-field">{label}
                        <input type="number" value={stats?.[key] ?? ''} onChange={event => setStats(previous => ({ ...previous, [key]: normalizeNumberInput(event.target.value) }))} placeholder="10" className="mt-1 block min-h-12 w-full rounded border border-gray-700 bg-gray-950 px-3 text-center text-lg font-bold normal-case tracking-normal text-white outline-none focus:border-cyan-500" />
                    </label>)}
                </div>
                {selectedSrdSpecies?.abilityBonuses && Object.keys(selectedSrdSpecies.abilityBonuses).length > 0 && <div className="rounded border border-cyan-900/70 bg-cyan-950/15 p-3 text-sm text-gray-300"><strong className="text-cyan-200">Bonificadores de especie</strong><p className="mt-1 text-xs text-gray-400">{characterBuild?.applySpeciesAbilityBonuses ? 'Se aplicarán al total de atributos según la configuración actual.' : 'Puedes aplicarlos en el paso Elecciones o añadirlos manualmente a los valores base.'}</p></div>}
            </div>;

            if (stepIndex === 4) return <div className="creation-step-content space-y-4">
                <p className="creation-step-intro">Deja preparados los valores que más consultarás durante la partida. Puedes completarlos ahora o editarlos después desde la ficha.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="character-build-field">PV máximos
                        <input type="number" min="0" value={hp?.max ?? ''} onChange={event => { const max = normalizeNumberInput(event.target.value); setHp(previous => ({ ...previous, max, current: max })); }} placeholder="Ej: 12" className="mt-1 block min-h-11 w-full rounded border border-gray-700 bg-gray-950 px-3 text-center text-sm normal-case tracking-normal text-white outline-none focus:border-red-500" />
                        <span className="mt-1 block text-[11px] text-gray-500">Los PV actuales empiezan al máximo.</span>
                    </label>
                    <label className="character-build-field">Velocidad
                        <input type="number" min="0" value={speed ?? ''} onChange={event => setSpeed(normalizeNumberInput(event.target.value))} placeholder="Ej: 30" className="mt-1 block min-h-11 w-full rounded border border-gray-700 bg-gray-950 px-3 text-center text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-500" />
                    </label>
                    <label className="character-build-field">Tamaño
                        <input type="text" value={size ?? ''} onChange={event => setSize(event.target.value)} placeholder="Ej: Mediano" className="mt-1 block min-h-11 w-full rounded border border-gray-700 bg-gray-950 px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-500" />
                    </label>
                    <label className="character-build-field">Bono de iniciativa
                        <input type="number" value={initBonus ?? ''} onChange={event => setInitBonus(normalizeNumberInput(event.target.value))} placeholder="0" className="mt-1 block min-h-11 w-full rounded border border-gray-700 bg-gray-950 px-3 text-center text-sm normal-case tracking-normal text-white outline-none focus:border-yellow-500" />
                    </label>
                    <label className="character-build-field">Dado de golpe
                        <input type="text" value={hitDice?.type ?? ''} onChange={event => setHitDice(previous => ({ ...previous, type: event.target.value }))} placeholder="Ej: d8" className="mt-1 block min-h-11 w-full rounded border border-gray-700 bg-gray-950 px-3 text-center text-sm normal-case tracking-normal text-white outline-none focus:border-purple-500" />
                    </label>
                </div>
                <p className="text-xs text-gray-500">La CA y el equipo se configuran después en Combate, donde puedes elegir armadura, escudo y armas sin perder esta información.</p>
            </div>;

            if (stepIndex === 5) return <div className="creation-step-content space-y-4">
                {!srdProfileHasSpellcasting ? <div className="rounded border border-gray-700 bg-gray-900/50 p-4"><h4 className="font-fantasy text-base font-bold uppercase tracking-wider text-gray-200">Sin progresión de magia a este nivel</h4><p className="mt-2 text-sm text-gray-400">La clase seleccionada no obtiene conjuros por nivel todavía. Puedes añadir cualquier conjuro manualmente más adelante si tu mesa usa una regla especial.</p></div> : <><div className="rounded border border-fuchsia-800 bg-fuchsia-950/15 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-200">Grimorio preparado</p><h4 className="mt-1 font-fantasy text-lg font-bold text-white">{srdSpellcastingProfile?.mode === 'prepared' ? 'Conjuros preparados' : 'Conjuros conocidos'}</h4><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded border border-fuchsia-700/70 bg-gray-950/40 px-2 py-1 text-fuchsia-100">Característica: {spellcastingAbilityNames[srdSpellcastingProfile?.ability] || 'Manual'}</span>{srdProfileCantrips > 0 && <span className="rounded border border-fuchsia-700/70 bg-gray-950/40 px-2 py-1 text-fuchsia-100">{srdProfileCantrips} trucos</span>}{srdSpellcastingProfile?.mode === 'prepared' ? <span className="rounded border border-fuchsia-700/70 bg-gray-950/40 px-2 py-1 text-fuchsia-100">Hasta {srdProfilePreparedLimit} preparados</span> : <span className="rounded border border-fuchsia-700/70 bg-gray-950/40 px-2 py-1 text-fuchsia-100">Hasta {srdProfileKnownLimit} conocidos</span>}<span className="rounded border border-fuchsia-700/70 bg-gray-950/40 px-2 py-1 text-fuchsia-100">Ranuras hasta nivel {srdProfileMaxSpellLevel || '—'}</span></div></div><p className="text-sm text-gray-400">La configuración de límites y ranuras se aplica automáticamente. Al terminar podrás abrir el Compendio Arcano filtrado para esta clase y elegir tus conjuros.</p></>}
            </div>;

            return <div className="creation-step-content space-y-4">
                <p className="creation-step-intro">La ficha ya está lista para seguir rellenándola como prefieras.</p>
                <div className="creation-summary-grid">
                    <div><span>Personaje</span><strong>{charInfo.name || 'Sin nombre'}</strong></div>
                    <div><span>Nivel</span><strong>{level || '1'}</strong></div>
                    <div><span>Clase</span><strong>{charInfo.cls || 'Sin elegir'}</strong></div>
                    <div><span>Especie</span><strong>{charInfo.race || 'Sin elegir'}</strong></div>
                    <div><span>Trasfondo</span><strong>{characterBuild?.backgroundName || 'Sin elegir'}</strong></div>
                </div>
                <section className="rounded border border-gray-700 bg-gray-900/50 p-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-200">Ficha inicial</h4>
                    <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
                        <span className="rounded border border-gray-700 bg-gray-950/40 px-2 py-1.5 text-gray-300">PV: <b className="text-white">{hp?.current || '—'} / {hp?.max || '—'}</b></span>
                        <span className="rounded border border-gray-700 bg-gray-950/40 px-2 py-1.5 text-gray-300">Velocidad: <b className="text-white">{speed ? `${speed} pies` : '—'}</b></span>
                        <span className="rounded border border-gray-700 bg-gray-950/40 px-2 py-1.5 text-gray-300">Dados de golpe: <b className="text-white">{hitDice?.type || '—'}</b></span>
                    </div>
                </section>
                {(remainingClassSkillChoices > 0 || remainingExpertiseChoices > 0) && <div className="character-build-notice" role="status"><strong>Quedan decisiones</strong><span>{[remainingClassSkillChoices > 0 && `${remainingClassSkillChoices} competencia${remainingClassSkillChoices === 1 ? '' : 's'} de clase`, remainingExpertiseChoices > 0 && `${remainingExpertiseChoices} opción${remainingExpertiseChoices === 1 ? '' : 'es'} de pericia`].filter(Boolean).join(' · ')}</span></div>}
                <SkillSourceSummary sources={skillProficiencySources} skills={skills} />
                <ClassBenefitSummary savingThrows={automaticSavingThrows} expertiseSkills={automaticExpertiseChoices} proficiencyBonus={proficiencyBonus} skills={skills} />
                {availableAutomaticRuleTraits.length > 0 && <div className="character-build-auto-traits"><div className="character-build-auto-traits-body"><div className="character-build-auto-traits-heading"><strong>Rasgos por nivel</strong><span>{availableAutomaticRuleTraits.length} disponibles</span></div><div className="character-build-auto-traits-list">{availableAutomaticRuleTraits.map(trait => <span key={trait.id}>{trait.name}</span>)}</div></div></div>}
                {srdProfileHasSpellcasting && <button type="button" onClick={onOpenGrimoire} className="min-h-11 rounded border border-fuchsia-700 bg-fuchsia-950/30 px-4 text-sm font-semibold text-fuchsia-100">Continuar en el Grimorio</button>}
            </div>;
        };

        return ReactDOM.createPortal(
            <div className="character-build-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
                <section className="character-build-panel character-build-modal character-creation-wizard" role="dialog" aria-modal="true" aria-labelledby="character-creation-title">
                    <header className="character-build-heading">
                        <div><h3 id="character-creation-title">Crear personaje</h3><p>Una guía opcional para dejar lista tu nueva ficha.</p></div>
                        <div className="character-build-heading-actions"><span>Paso {stepIndex + 1} de {steps.length}</span><button type="button" onClick={onClose} aria-label="Cerrar asistente de creación">×</button></div>
                    </header>
                    <ol className="creation-stepper" aria-label="Progreso de creación">{steps.map((step, index) => <li key={step} className={index === stepIndex ? 'is-current' : index < stepIndex ? 'is-complete' : ''}><span>{index + 1}</span>{step}</li>)}</ol>
                    {renderStep()}
                    <footer className="creation-wizard-actions">
                        <button type="button" onClick={onClose} className="min-h-11 rounded border border-gray-700 px-3 text-xs text-gray-400">Omitir por ahora</button>
                        <div className="flex gap-2">{!isFirstStep && <button type="button" onClick={() => setStepIndex(previous => previous - 1)} className="min-h-11 rounded border border-gray-600 px-4 text-sm text-gray-200">Atrás</button>}<button type="button" onClick={() => isLastStep ? onClose() : setStepIndex(previous => previous + 1)} className="min-h-11 rounded border border-cyan-600 bg-cyan-950/40 px-4 text-sm font-semibold text-cyan-100 hover:bg-cyan-900/50">{isLastStep ? 'Terminar ficha' : 'Continuar'}</button></div>
                    </footer>
                </section>
            </div>,
            document.body
        );
    };

    return { CharacterBuildModal, CharacterCreationWizard };
})();
