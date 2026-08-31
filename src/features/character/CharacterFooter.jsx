window.DndCharacterFooterComponents = (() => {
    const { CharacterSectionGlyph } = window.DndCharacterSheetComponents;

    const CharacterFooter = ({ model }) => {
        const { addProficiencyEntryToCategory, narrative, narrativeFilledCount, proficiencyCategoryLabels, proficiencyEntries, removeProficiencyEntry, setNarrative, updateProficiencyEntry } = model;
        return (
<section data-tab="character" className="character-sheet-footer tab-section space-y-6" aria-label="Información complementaria del personaje">
            {/* COMPETENCIAS E IDIOMAS */}
            <details className="proficiency-catalog rpg-panel overflow-hidden">
                <summary className="proficiency-catalog-summary cursor-pointer list-none border-b border-gray-800 p-4">
                    <div className="character-section-header is-skills mb-0">
                        <div className="character-section-heading">
                            <span className="character-section-emblem"><CharacterSectionGlyph section="skills" /></span>
                            <div><p>Consulta rápida y procedencia</p><h2>Competencias e idiomas</h2></div>
                        </div>
                        <span className="character-section-note">Plegar / desplegar</span>
                    </div>
                </summary>
                <div className="p-4">
                    <div className="proficiency-catalog-grid grid gap-3 sm:grid-cols-2">
                        {Object.entries(proficiencyCategoryLabels).map(([category, label]) => {
                            const entries = proficiencyEntries.filter(entry => entry.category === category && !entry.hidden);
                            return <section key={category} data-category={category} className="proficiency-category-card">
                                <div className="proficiency-category-header"><span className="proficiency-category-mark" aria-hidden="true"></span><h3>{label}</h3><span className="proficiency-category-count">{entries.length}</span><button type="button" onClick={() => addProficiencyEntryToCategory(category)} className="proficiency-category-add" aria-label={`Añadir en ${label}`}>+ Añadir</button></div>
                                <div className="proficiency-entry-list">{entries.map(entry => <div key={entry.id} className="proficiency-entry-card">
                                    <div className="proficiency-entry-fields"><input aria-label={`Nombre en ${label}`} value={entry.name} placeholder={`Nueva entrada de ${label.toLowerCase()}`} onChange={event => updateProficiencyEntry(entry.id, { name: event.target.value, nameEdited: true })} className="proficiency-entry-name"/><label className="proficiency-entry-source"><span>Origen</span><input aria-label={`Procedencia de ${entry.name || label}`} value={entry.source || ''} placeholder="Sin indicar" onChange={event => updateProficiencyEntry(entry.id, { source: event.target.value, sourceEdited: true })}/></label></div>
                                    <button type="button" onClick={() => removeProficiencyEntry(entry)} className="proficiency-entry-delete" aria-label={`Borrar ${entry.name || label}`}>×</button>
                                </div>)}{entries.length === 0 && <button type="button" onClick={() => addProficiencyEntryToCategory(category)} className="proficiency-category-empty">Añadir la primera competencia</button>}</div>
                            </section>;
                        })}
                    </div>
                </div>
            </details>

            {/* PERFIL NARRATIVO */}
            <details className="narrative-profile-panel rpg-panel">
                <summary className="narrative-profile-summary">
                    <span className="character-section-emblem"><CharacterSectionGlyph section="traits" /></span>
                    <span className="min-w-0 flex-1"><span className="narrative-profile-kicker">Identidad e historia</span><strong className="mt-0.5 block font-fantasy text-base uppercase tracking-wider text-white">Perfil narrativo</strong></span>
                    <span className="narrative-profile-progress">{narrativeFilledCount}/15 campos</span>
                </summary>
                <div className="narrative-profile-body">
                    <p className="narrative-profile-intro">Información interpretativa del personaje. No modifica ninguna regla ni cálculo de la ficha.</p>
                    <section className="narrative-profile-section is-identity"><header><span aria-hidden="true">I</span><div><h3>Identidad</h3><p>Datos visibles y presencia física</p></div></header><div className="narrative-profile-grid is-compact">
                        <label>Alineamiento<input type="text" value={narrative.alignment} onChange={event => setNarrative(previous => ({ ...previous, alignment: event.target.value }))} placeholder="Ej: Neutral bueno" /></label><label>Edad<input type="text" value={narrative.age} onChange={event => setNarrative(previous => ({ ...previous, age: event.target.value }))} placeholder="Ej: 27 años" /></label><label>Altura<input type="text" value={narrative.height} onChange={event => setNarrative(previous => ({ ...previous, height: event.target.value }))} placeholder="Ej: 1,78 m" /></label><label>Peso<input type="text" value={narrative.weight} onChange={event => setNarrative(previous => ({ ...previous, weight: event.target.value }))} placeholder="Ej: 74 kg" /></label><label className="is-wide">Apariencia<textarea value={narrative.appearance} onChange={event => setNarrative(previous => ({ ...previous, appearance: event.target.value }))} placeholder="Rasgos físicos, vestimenta, voz, gestos y detalles reconocibles…" /></label>
                    </div></section>
                    <section className="narrative-profile-section"><header><span aria-hidden="true">II</span><div><h3>Carácter</h3><p>La brújula interior del personaje</p></div></header><div className="narrative-profile-grid">
                        <label>Personalidad<textarea value={narrative.personality} onChange={event => setNarrative(previous => ({ ...previous, personality: event.target.value }))} placeholder="Cómo se comporta, hábitos y forma de relacionarse…" /></label><label>Ideales<textarea value={narrative.ideals} onChange={event => setNarrative(previous => ({ ...previous, ideals: event.target.value }))} placeholder="Principios que guían sus decisiones…" /></label><label>Vínculos<textarea value={narrative.bonds} onChange={event => setNarrative(previous => ({ ...previous, bonds: event.target.value }))} placeholder="Personas, lugares u objetos importantes…" /></label><label>Defectos<textarea value={narrative.flaws} onChange={event => setNarrative(previous => ({ ...previous, flaws: event.target.value }))} placeholder="Miedos, debilidades o comportamientos problemáticos…" /></label>
                    </div></section>
                    <section className="narrative-profile-section"><header><span aria-hidden="true">III</span><div><h3>Relaciones y propósito</h3><p>Lazos con el mundo y motivos para avanzar</p></div></header><div className="narrative-profile-grid">
                        <label>Organizaciones<textarea value={narrative.organizations} onChange={event => setNarrative(previous => ({ ...previous, organizations: event.target.value }))} placeholder="Gremios, facciones, órdenes o grupos…" /></label><label>Aliados<textarea value={narrative.allies} onChange={event => setNarrative(previous => ({ ...previous, allies: event.target.value }))} placeholder="Contactos y personas de confianza…" /></label><label>Enemigos<textarea value={narrative.enemies} onChange={event => setNarrative(previous => ({ ...previous, enemies: event.target.value }))} placeholder="Rivales, perseguidores y amenazas personales…" /></label><label>Objetivos personales<textarea value={narrative.goals} onChange={event => setNarrative(previous => ({ ...previous, goals: event.target.value }))} placeholder="Metas inmediatas y aspiraciones a largo plazo…" /></label><label className="is-wide">Deidad o filosofía<textarea value={narrative.faith} onChange={event => setNarrative(previous => ({ ...previous, faith: event.target.value }))} placeholder="Fe, código moral, tradición o visión del mundo…" /></label>
                    </div></section>
                    <section className="narrative-profile-section is-history"><header><span aria-hidden="true">IV</span><div><h3>Crónica</h3><p>El camino recorrido hasta la aventura</p></div></header><div className="narrative-profile-grid"><label className="is-wide">Historia del personaje<textarea className="is-history" value={narrative.history} onChange={event => setNarrative(previous => ({ ...previous, history: event.target.value }))} placeholder="Origen, acontecimientos importantes y camino hasta la aventura actual…" /></label></div></section>
                </div>
            </details>
        </section>
        );
    };

    return { CharacterFooter };
})();
