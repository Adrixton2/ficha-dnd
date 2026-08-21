window.DndSpellbookComponents = (() => {
    const ArcaneCompendiumView = ({
        spellLibrary,
        displayedSpells,
        addedSpells,
        profile,
        profileMaxSpellLevel,
        classFilterActive,
        workflow,
        workflowDescription,
        actionLabel,
        search,
        level,
        school,
        classFilter,
        trait,
        schools,
        onSearchChange,
        onLevelChange,
        onSchoolChange,
        onClassFilterChange,
        onTraitChange,
        onShowDetail,
        onChooseSpell,
        getSpellIcon = () => '',
        getSpellIconColor = () => ''
    }) => (
        <section className="space-y-4">
            <div className="rounded border border-purple-800/70 bg-purple-950/20 p-3 text-xs text-purple-100">
                <strong className="font-fantasy tracking-wide">Compendio Arcano</strong>
                <p className="mt-1 text-purple-200/80">{spellLibrary.length} conjuros y trucos para reglas de D&amp;D 5e (2014). Consulta la ficha y usa la acción adecuada para este personaje.</p>
                {classFilterActive && <p className="mt-2 text-cyan-200">Mostrando los conjuros de {profile.name} disponibles hasta nivel {profileMaxSpellLevel || '0'} para este personaje.</p>}
                {profile && <p className="mt-2 text-cyan-100">{workflow === 'prepared' ? 'Prepararás directamente los conjuros que elijas.' : workflow === 'spellbook' ? 'Los conjuros se añadirán a tu libro; después podrás prepararlos.' : `Al elegirlos, los ${actionLabel?.toLocaleLowerCase('es') || 'aprenderás'} y quedarán listos.`} {workflowDescription}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
                <input value={search} onChange={event => onSearchChange(event.target.value)} placeholder="Buscar, ej.: Bola de fuego" className="min-w-[12rem] flex-1 rounded border border-gray-700 bg-gray-950 px-3 py-2 text-sm" />
                <select value={level} onChange={event => onLevelChange(event.target.value)} className="rounded border border-gray-700 bg-gray-950 px-2 text-sm"><option value="all">Todos los niveles</option>{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(item => <option key={item} value={item}>{item === 0 ? 'Trucos' : `Nivel ${item}`}</option>)}</select>
                <select value={school} onChange={event => onSchoolChange(event.target.value)} className="rounded border border-gray-700 bg-gray-950 px-2 text-sm"><option value="all">Todas las escuelas</option>{schools.map(item => <option key={item} value={item}>{item}</option>)}</select>
                <select value={classFilter} onChange={event => onClassFilterChange(event.target.value)} className="min-h-10 rounded border border-cyan-800 bg-gray-950 px-2 text-sm text-cyan-100" disabled={!profile}><option value="auto">{profile ? `Mi clase: ${profile.name}` : 'Mi clase no tiene perfil automático'}</option><option value="all">Todo el compendio</option></select>
            </div>
            <div className="flex flex-wrap gap-2"><select value={trait} onChange={event => onTraitChange(event.target.value)} className="min-h-10 rounded border border-gray-700 bg-gray-950 px-2 text-sm"><option value="all">Todos los rasgos</option><option value="ritual">Rituales</option><option value="concentration">Concentración</option><option value="damage">Con daño</option><option value="healing">Con curación</option></select></div>

            <div className="arcane-compendium-grid grid max-h-[34rem] grid-cols-1 gap-3 overflow-y-auto pr-2 md:grid-cols-2">
                {displayedSpells.map(spell => {
                    const components = [spell.compV ? 'V' : null, spell.compS ? 'S' : null, spell.compM ? 'M' : null].filter(Boolean).join(', ');
                    const storedSpell = addedSpells.find(currentSpell => currentSpell.sourceId === spell.id);
                    const canPrepareStoredSpell = workflow === 'prepared'
                        && spell.level > 0
                        && storedSpell
                        && !storedSpell.prepared
                        && !storedSpell.automatic;
                    const alreadyAdded = !!storedSpell && !canPrepareStoredSpell;
                    const directAction = spell.level === 0 ? 'Aprender truco' : actionLabel;
                    const spellIcon = getSpellIcon(spell);
                    const spellIconColor = getSpellIconColor(spell);
                    return <article key={spell.id} style={spellIconColor ? { '--spell-art-rgb': spellIconColor } : undefined} className={`arcane-compendium-card flex flex-col rounded border border-gray-800 bg-gray-900/50 p-3 ${spellIcon ? 'has-spell-art' : ''}`}><div className="arcane-compendium-card-heading flex items-start justify-between gap-3"><div><span className="mr-2 inline-flex rounded border border-purple-700 bg-purple-950/60 px-2 py-1 text-[10px] font-bold text-purple-100">{spell.level === 0 ? 'Truco' : `Nv ${spell.level}`}</span><strong className="font-fantasy text-sm text-purple-100">{spell.name}</strong></div><span className="arcane-compendium-school text-[10px] text-gray-400">{spell.school}</span></div>{spellIcon && <figure className="arcane-compendium-card-art"><img src={spellIcon} alt={`Icono de ${spell.name}`} loading="lazy" /></figure>}<p className="mt-2 text-[11px] text-gray-400">{spell.castingTime} · {spell.range} · {spell.duration}</p>{components && <p className="mt-1 text-[11px] text-gray-500">Componentes: {components}{spell.compMDesc ? ` (${spell.compMDesc})` : ''}</p>}<div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] text-gray-500">{spell.ritual ? 'Ritual' : ''}{spell.ritual && spell.concentration ? ' · ' : ''}{spell.concentration ? 'Concentración' : ''}</span><div className="flex flex-wrap gap-2"><button type="button" onClick={() => onShowDetail(spell)} className="min-h-10 rounded border border-gray-600 px-3 text-xs font-semibold text-gray-200 hover:border-purple-500 hover:text-purple-100">Consultar</button>{!alreadyAdded && <button type="button" onClick={() => onChooseSpell(spell)} className="min-h-10 rounded border border-cyan-600 bg-cyan-950/50 px-3 text-xs font-semibold text-cyan-100 hover:bg-cyan-800">{directAction}</button>}{alreadyAdded && <span className="inline-flex min-h-10 items-center rounded border border-gray-700 px-3 text-xs text-gray-500">{storedSpell?.automatic ? 'Concedido' : workflow === 'prepared' ? 'Preparado' : 'Añadido'}</span>}</div></div></article>;
                })}
                {!displayedSpells.length && <p className="col-span-1 p-6 text-center text-sm text-gray-500 md:col-span-2">No hay conjuros que coincidan con los filtros.</p>}
            </div>
            <p className="text-[10px] leading-relaxed text-gray-500">{window.DndSrdSpellLibrary?.attribution} <a href={window.DndSrdSpellLibrary?.sourceUrl} target="_blank" rel="noreferrer" className="text-purple-300 underline">Fuente oficial</a> · <a href={window.DndSrdSpellLibrary?.licenseUrl} target="_blank" rel="noreferrer" className="text-purple-300 underline">CC BY 4.0</a>.</p>
        </section>
    );

    return { ArcaneCompendiumView };
})();
