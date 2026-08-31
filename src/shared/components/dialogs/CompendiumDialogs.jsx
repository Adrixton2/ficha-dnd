(() => {
    function CompendiumDialogs({ model }) {
        const {
            addFeatFromCompendium,
            addSpellFromSrdLibrary,
            automaticSpellSourceIds,
            displayedCompendiumFeats,
            featCompendiumDetail,
            featCompendiumOpen,
            featCompendiumSearch,
            featCompendiumSource,
            feats,
            formatMod,
            getSpellCompendiumActionLabel,
            getSpellCompendiumAddedLabel,
            getSpellIconColor,
            getSpellIconPath,
            getSpellResolution,
            getSrdSpellDiceDetails,
            grimoireGuideOpen,
            launchDamageOrHealingRoll,
            requestSpellAttackRoll,
            setFeatCompendiumDetail,
            setFeatCompendiumOpen,
            setFeatCompendiumSearch,
            setFeatCompendiumSource,
            setGrimoireGuideOpen,
            setGrimoireView,
            setSrdSpellDetail,
            spellAttackBonus,
            spellGuideProfile,
            spellGuideSteps,
            spellSaveDc,
            spellWorkflow,
            spellWorkflowCopy,
            spellcastingModifier,
            spells,
            srdProfileCantrips,
            srdSpellDetail
        } = model;

        return <>
{grimoireGuideOpen && ReactDOM.createPortal(
                            <div
                                className="grimoire-guide-backdrop"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Guía para empezar con la magia"
                                onMouseDown={event => {
                                    if (event.target === event.currentTarget) setGrimoireGuideOpen(false);
                                }}
                            >
                                <article className="grimoire-guide-dialog">
                                    <header className="grimoire-guide-header">
                                        <div className="min-w-0">
                                            <span>Guía rápida</span>
                                            <h3>Empieza con la magia</h3>
                                            <p>{spellWorkflowCopy.description}</p>
                                        </div>
                                        <button type="button" onClick={() => setGrimoireGuideOpen(false)} aria-label="Cerrar guía de magia">×</button>
                                    </header>
                                    <div className="grimoire-guide-content">
                                        <section className="grimoire-guide-profile">
                                            <span>Tu forma de lanzar magia</span>
                                            <h4>{spellGuideProfile.title}</h4>
                                            <p>{spellGuideProfile.explanation}</p>
                                            <div>
                                                <strong>{spellGuideProfile.limitLabel}<b>{spellGuideProfile.limitValue}</b></strong>
                                                <strong>Trucos<b>{srdProfileCantrips || 0}</b></strong>
                                                <strong>{spellGuideProfile.recovery}</strong>
                                            </div>
                                        </section>
                                        <ol className="grimoire-guide-steps">
                                            {spellGuideSteps.map(([title, description], index) => (
                                                <li key={title}>
                                                    <span aria-hidden="true">{index + 1}</span>
                                                    <div><strong>{title}</strong><p>{description}</p></div>
                                                </li>
                                            ))}
                                        </ol>
                                        <section className="grimoire-guide-notes">
                                            <h4>Qué significa cada zona</h4>
                                            <p><strong>Compendio Arcano:</strong> sirve para buscar y consultar; un conjuro no entra en tu ficha hasta que pulses su acción de añadir, aprender o preparar.</p>
                                            <p><strong>Conjuros listos:</strong> es la vista rápida para jugar. Contiene preparados, conocidos o concedidos, según tu tipo de lanzador.</p>
                                            <p><strong>Trucos y ranuras:</strong> los trucos no gastan ranuras. Las ranuras son los usos para conjuros de nivel 1 o superior.</p>
                                            <p><strong>Nivel superior:</strong> puedes elegir una ranura mayor si el conjuro mejora al lanzarse con ella.</p>
                                        </section>
                                    </div>
                                    <footer className="grimoire-guide-footer">
                                        <button type="button" onClick={() => setGrimoireGuideOpen(false)}>Cerrar</button>
                                        <button type="button" onClick={() => { setGrimoireView('srd'); setGrimoireGuideOpen(false); }}>Abrir {spellWorkflowCopy.compendium}</button>
                                    </footer>
                                </article>
                            </div>,
                            document.body
                        )}

                        {featCompendiumOpen && ReactDOM.createPortal(
                            <div
                                className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Compendio de dotes"
                                onMouseDown={event => {
                                    if (event.target === event.currentTarget) {
                                        setFeatCompendiumOpen(false);
                                        setFeatCompendiumDetail(null);
                                    }
                                }}
                            >
                                <article className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded border border-yellow-700 bg-gray-900 shadow-2xl">
                                    <header className="flex items-start justify-between gap-3 border-b border-yellow-900/70 bg-yellow-950/20 px-4 py-3">
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300">Colección de opciones</span>
                                            <h3 className="mt-1 font-fantasy text-xl font-bold text-yellow-100">Compendio de dotes</h3>
                                            <p className="mt-1 text-xs text-yellow-100/70">Consulta una dote antes de añadir una copia editable a este personaje.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setFeatCompendiumOpen(false); setFeatCompendiumDetail(null); }}
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-600 text-xl text-gray-200 hover:border-yellow-400"
                                            aria-label="Cerrar compendio de dotes"
                                        >×</button>
                                    </header>
                                    <div className="min-h-0 overflow-y-auto p-4">
                                        <div className="flex flex-wrap gap-2">
                                            <input
                                                value={featCompendiumSearch}
                                                onChange={event => setFeatCompendiumSearch(event.target.value)}
                                                placeholder="Buscar, ej.: Telepático"
                                                className="min-h-11 min-w-[12rem] flex-1 rounded border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none focus:border-yellow-500"
                                            />
                                            <select
                                                value={featCompendiumSource}
                                                onChange={event => setFeatCompendiumSource(event.target.value)}
                                                className="min-h-11 rounded border border-gray-700 bg-gray-950 px-3 text-sm text-gray-100 outline-none focus:border-yellow-500"
                                            >
                                                <option value="all">Todas las fuentes</option>
                                                <option value="SRD 5.1">SRD 5.1</option>
                                                <option value="Caldero de Tasha">Caldero de Tasha</option>
                                            </select>
                                        </div>

                                        {featCompendiumDetail && <section className="mt-4 rounded border border-yellow-700/70 bg-yellow-950/20 p-4">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300">{featCompendiumDetail.source}</span>
                                                    <h4 className="mt-1 font-fantasy text-lg font-bold text-yellow-100">{featCompendiumDetail.name}</h4>
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={feats.some(feat => feat.sourceId === featCompendiumDetail.id || String(feat.title || '').trim().toLocaleLowerCase('es') === featCompendiumDetail.name.toLocaleLowerCase('es'))}
                                                    onClick={() => addFeatFromCompendium(featCompendiumDetail)}
                                                    className="min-h-11 rounded border border-yellow-600 bg-yellow-800 px-4 text-sm font-semibold text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-500"
                                                >{feats.some(feat => feat.sourceId === featCompendiumDetail.id || String(feat.title || '').trim().toLocaleLowerCase('es') === featCompendiumDetail.name.toLocaleLowerCase('es')) ? 'Ya añadida' : 'Añadir a la ficha'}</button>
                                            </div>
                                            {featCompendiumDetail.prerequisites && <p className="mt-3 text-xs text-cyan-200"><strong>Prerrequisito:</strong> {featCompendiumDetail.prerequisites}</p>}
                                            <p className="mt-3 text-sm leading-relaxed text-gray-200">{featCompendiumDetail.summary}</p>
                                        </section>}

                                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                            {displayedCompendiumFeats.map(feat => {
                                                const added = feats.some(characterFeat => characterFeat.sourceId === feat.id || String(characterFeat.title || '').trim().toLocaleLowerCase('es') === feat.name.toLocaleLowerCase('es'));
                                                return <article key={feat.id} className="rounded border border-gray-800 bg-gray-950/45 p-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <h4 className="font-fantasy text-sm font-bold text-yellow-100">{feat.name}</h4>
                                                        </div>
                                                        <button type="button" onClick={() => setFeatCompendiumDetail(feat)} className="min-h-9 shrink-0 rounded border border-gray-600 px-2 text-xs text-gray-200 hover:border-yellow-500">Ver</button>
                                                    </div>
                                                    {feat.prerequisites && <p className="mt-2 text-[11px] text-cyan-200">{feat.prerequisites}</p>}
                                                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400">{feat.summary}</p>
                                                    <button type="button" disabled={added} onClick={() => addFeatFromCompendium(feat)} className="mt-3 min-h-10 w-full rounded border border-yellow-800 bg-yellow-950/30 px-3 text-xs font-semibold text-yellow-100 hover:bg-yellow-800 disabled:cursor-not-allowed disabled:border-gray-800 disabled:text-gray-600">{added ? 'Ya añadida' : 'Añadir'}</button>
                                                </article>;
                                            })}
                                            {!displayedCompendiumFeats.length && <p className="py-8 text-center text-sm text-gray-500 sm:col-span-2">No hay dotes que coincidan con la búsqueda.</p>}
                                        </div>
                                    </div>
                                </article>
                            </div>,
                            document.body
                        )}

                        {srdSpellDetail && (() => {
                            const components = [srdSpellDetail.compV ? 'V' : null, srdSpellDetail.compS ? 'S' : null, srdSpellDetail.compM ? 'M' : null].filter(Boolean).join(', ');
                            const diceDetails = getSrdSpellDiceDetails(srdSpellDetail);
                            const spellResolution = getSpellResolution(srdSpellDetail);
                            const storedSpell = spells.find(spell => spell.sourceId === srdSpellDetail.id);
                            const canPrepareStoredSpell = spellWorkflow === 'prepared'
                                && Number(srdSpellDetail.level) > 0
                                && storedSpell
                                && !storedSpell.prepared;
                            const alreadyAdded = automaticSpellSourceIds.has(srdSpellDetail.id) || (!!storedSpell && !canPrepareStoredSpell);
                            const spellIcon = getSpellIconPath(srdSpellDetail);
                            const spellIconColor = getSpellIconColor(srdSpellDetail);
                            const descriptionSentences = String(srdSpellDetail.description || '')
                                .trim()
                                .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/)
                                .filter(Boolean);
                            const descriptionParagraphs = descriptionSentences.reduce((paragraphs, sentence) => {
                                const startsSection = /^(?:A niveles superiores|Opciones?|Efectos?|Crear agua|Destruir agua)\b/i.test(sentence);
                                const current = paragraphs[paragraphs.length - 1];
                                if (!current || startsSection || current.length + sentence.length > 285) paragraphs.push(sentence);
                                else paragraphs[paragraphs.length - 1] = `${current} ${sentence}`;
                                return paragraphs;
                            }, []);
                            return <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Ficha de ${srdSpellDetail.name}`} onMouseDown={event => { if (event.target === event.currentTarget) setSrdSpellDetail(null); }}>
                                <article style={spellIconColor ? { '--spell-art-rgb': spellIconColor } : undefined} className={`spell-detail-modal flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded border border-purple-700 bg-gray-900 shadow-2xl ${spellIcon ? 'has-spell-art' : ''}`}>
                                    <header className="spell-detail-header flex items-start justify-between gap-3 border-b border-purple-900/70 bg-purple-950/30 px-4 py-3">
                                        {spellIcon && <figure className="spell-detail-art"><img src={spellIcon} alt={`Icono de ${srdSpellDetail.name}`} /></figure>}
                                        <div className="min-w-0"><span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">{srdSpellDetail.level === 0 ? 'Truco' : `Conjuro de nivel ${srdSpellDetail.level}`} · {srdSpellDetail.school}</span><h3 className="mt-1 font-fantasy text-xl font-bold text-purple-100">{srdSpellDetail.name}</h3></div>
                                        <button type="button" onClick={() => setSrdSpellDetail(null)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-600 text-xl text-gray-200 hover:border-purple-400" aria-label="Cerrar ficha de conjuro">×</button>
                                    </header>
                                    <div className="min-h-0 overflow-y-auto p-4">
                                        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2"><div className="rounded border border-gray-800 bg-gray-950/50 p-2"><dt className="text-[10px] uppercase text-gray-500">Lanzamiento</dt><dd className="mt-1 text-gray-200">{srdSpellDetail.castingTime}</dd></div><div className="rounded border border-gray-800 bg-gray-950/50 p-2"><dt className="text-[10px] uppercase text-gray-500">Alcance</dt><dd className="mt-1 text-gray-200">{srdSpellDetail.range}</dd></div><div className="rounded border border-gray-800 bg-gray-950/50 p-2"><dt className="text-[10px] uppercase text-gray-500">Duración</dt><dd className="mt-1 text-gray-200">{srdSpellDetail.duration}</dd></div><div className="rounded border border-gray-800 bg-gray-950/50 p-2"><dt className="text-[10px] uppercase text-gray-500">Componentes</dt><dd className="mt-1 text-gray-200">{components || 'Ninguno'}{srdSpellDetail.compMDesc ? ` (${srdSpellDetail.compMDesc})` : ''}</dd></div></dl>
                                        {(srdSpellDetail.ritual || srdSpellDetail.concentration) && <p className="mt-3 text-xs text-purple-200">{srdSpellDetail.ritual ? 'Ritual' : ''}{srdSpellDetail.ritual && srdSpellDetail.concentration ? ' · ' : ''}{srdSpellDetail.concentration ? 'Concentración' : ''}</p>}
                                        {(spellResolution.usesSpellAttack || spellResolution.savingAbility) && <section className="mt-4 rounded border border-cyan-900/60 bg-cyan-950/15 p-3"><h4 className="text-xs font-bold uppercase tracking-wider text-cyan-200">Tirada y salvación</h4>{spellcastingModifier === null ? <p className="mt-2 text-sm text-gray-400">Configura la característica de lanzamiento para calcular la CD y el ataque.</p> : <div className="mt-2 flex flex-wrap gap-2 text-sm">{spellResolution.usesSpellAttack && <button type="button" onClick={() => requestSpellAttackRoll(srdSpellDetail)} className="rounded border border-cyan-700 bg-gray-950/50 px-2 py-1 text-cyan-100 hover:border-cyan-300">Tirar ataque de conjuro {formatMod(spellAttackBonus)}</button>}{spellResolution.savingAbility && <span className="rounded border border-cyan-700 bg-gray-950/50 px-2 py-1 text-cyan-100">Salvación de {spellResolution.savingAbility} · CD {spellSaveDc}</span>}</div>}</section>}
                                        <section className="mt-4 rounded border border-purple-900/60 bg-purple-950/15 p-3"><h4 className="text-xs font-bold uppercase tracking-wider text-purple-200">Dados</h4>{diceDetails.length ? <div className="mt-2 flex flex-wrap gap-2">{diceDetails.map((detail, index) => {
                                            const tone = detail.kind === 'healing' || detail.kind === 'benefit'
                                                ? 'border-emerald-700/80 bg-emerald-950/25 text-emerald-100'
                                                : detail.kind === 'damage'
                                                    ? 'border-red-800/80 bg-red-950/25 text-red-100'
                                                    : 'border-cyan-700/80 bg-cyan-950/25 text-cyan-100';
                                            const labelTone = detail.kind === 'healing' || detail.kind === 'benefit'
                                                ? 'text-emerald-300'
                                                : detail.kind === 'damage' ? 'text-red-300' : 'text-cyan-300';
                                            return <button type="button" onClick={() => launchDamageOrHealingRoll(detail.value, `${srdSpellDetail.name} · ${detail.label}`, detail.kind)} key={`${detail.value}_${detail.label}_${index}`} className={`inline-flex min-h-9 items-center gap-2 rounded border px-2.5 text-xs hover:brightness-125 ${tone}`}><strong className="font-mono text-sm text-white">{detail.value}</strong><span className={labelTone}>{detail.label}</span><small className="text-[9px] uppercase opacity-70">Tirar</small></button>;
                                        })}</div> : <p className="mt-2 text-sm text-gray-400">Sin tirada de daño o curación con dados.</p>}</section>
                                        <section className="spell-detail-description mt-4"><header><span aria-hidden="true">✦</span><div><small>Texto completo</small><h4>Descripción</h4></div></header><div className="spell-detail-reading">{descriptionParagraphs.map((paragraph, index) => <p key={`${srdSpellDetail.id}_description_${index}`} className={/^(?:A niveles superiores|Opciones?|Efectos?)\b/i.test(paragraph) ? 'is-scaling' : ''}>{paragraph}</p>)}</div></section>
                                    </div>
                                    <footer className="flex flex-wrap justify-end gap-2 border-t border-gray-800 bg-gray-950/60 p-3"><button type="button" onClick={() => setSrdSpellDetail(null)} className="min-h-11 rounded border border-gray-600 px-4 text-sm text-gray-200">Cerrar</button><button type="button" disabled={alreadyAdded} onClick={() => addSpellFromSrdLibrary(srdSpellDetail)} className={`min-h-11 rounded border px-4 text-sm font-semibold ${alreadyAdded ? 'cursor-not-allowed border-gray-700 text-gray-500' : 'border-purple-600 bg-purple-800 text-white hover:bg-purple-700'}`}>{alreadyAdded ? getSpellCompendiumAddedLabel(srdSpellDetail) : getSpellCompendiumActionLabel(srdSpellDetail)}</button></footer>
                                </article>
                            </div>;
                        })()}
        </>;
    }

    window.DndCompendiumDialogComponents = { CompendiumDialogs };
})();
