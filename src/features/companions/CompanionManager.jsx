window.DndCompanionComponents = (() => {
    const { useState, useEffect } = React;
    const { LOCAL_BESTIARY_STORAGE_KEY, cloneData, normalizeCompanion, normalizeRuleLookupText, isValidPortraitDataUrl } = window.DndAppUtils;

    const COMPANION_CATEGORY_LABELS = Object.freeze({ familiar: 'Familiar', animal: 'Compañero animal', construct: 'Compañero artificial', mount: 'Montura', summon: 'Invocación', other: 'Otro aliado' });
    const COMPANION_INITIATIVE_LABELS = Object.freeze({ 'after-owner': 'Actúa después de mi turno', own: 'Iniciativa propia', shared: 'Comparte mi iniciativa' });
    let companionBestiaryAvatarCache = { raw: null, avatars: new Map() };
    const getCompanionAvatar = companion => {
        if (companion?.avatarDataUrl || companion?.avatarPath) return companion.avatarDataUrl || companion.avatarPath;
        if (companion?.sourceKind !== 'bestiary' || !companion?.sourceId) return '';
        try {
            const raw = window.localStorage.getItem(LOCAL_BESTIARY_STORAGE_KEY) || '';
            if (raw !== companionBestiaryAvatarCache.raw) {
                const parsed = raw ? JSON.parse(raw) : null;
                companionBestiaryAvatarCache = { raw, avatars: new Map((Array.isArray(parsed?.monsters) ? parsed.monsters : []).map(monster => [monster.id, isValidPortraitDataUrl(monster.avatarDataUrl) ? monster.avatarDataUrl : ''])) };
            }
            return companionBestiaryAvatarCache.avatars.get(companion.sourceId) || '';
        } catch (error) { return ''; }
    };
    const companionConditionNames = companion => (Array.isArray(companion?.conditions) ? companion.conditions : []).map(condition => typeof condition === 'string' ? condition : condition?.name).filter(Boolean);

    function CompanionAvatar({ companion, avatar: avatarOverride = '', className = '' }) {
        const avatar = avatarOverride || getCompanionAvatar(companion);
        return <span className={`companion-avatar ${className}`}>{avatar ? <img src={avatar} alt="" /> : <b>{String(companion?.name || '?').slice(0, 1).toLocaleUpperCase('es')}</b>}</span>;
    }

    function CompanionManagerModal({ open, focusId, focusField, companions, srdMonsters, localMonsters, getMonsterIcon, onChange, onDelete, onClose }) {
        const [view, setView] = useState('list');
        const [selectedId, setSelectedId] = useState(null);
        const [editor, setEditor] = useState(null);
        const [sourceKind, setSourceKind] = useState('srd');
        const [sourceScope, setSourceScope] = useState('beasts');
        const [query, setQuery] = useState('');
        useEffect(() => {
            if (!open) return;
            const focusedCompanion = focusId ? companions.find(companion => companion.id === focusId) : null;
            if (focusedCompanion && focusField) { setSelectedId(focusId); setEditor(cloneData(focusedCompanion)); setView('editor'); }
            else if (focusedCompanion) { setSelectedId(focusId); setEditor(null); setView('detail'); }
            else { setSelectedId(null); setEditor(null); setView('list'); }
        }, [open, focusId, focusField]);
        useEffect(() => {
            if (!open || view !== 'editor' || !focusField) return;
            const selector = focusField === 'initiative'
                ? '.companion-editor-combat input[type="number"]'
                : focusField === 'maxHp'
                    ? '.companion-editor-stats label:nth-of-type(2) input'
                    : '';
            if (!selector) return;
            const focusTimer = window.setTimeout(() => {
                const input = document.querySelector(selector);
                input?.focus();
                input?.select?.();
                input?.scrollIntoView({ block: 'center', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
            }, 40);
            return () => window.clearTimeout(focusTimer);
        }, [open, view, focusField]);
        if (!open) return null;
        const selected = companions.find(companion => companion.id === selectedId) || null;
        const sourceMonsters = sourceKind === 'srd' ? srdMonsters : localMonsters;
        const normalizedQuery = String(query || '').trim().toLocaleLowerCase('es');
        const matches = sourceMonsters.filter(monster => {
            const details = sourceKind === 'srd' ? monster.details : monster.srdDetails || {};
            const type = normalizeRuleLookupText(details.type || monster.tags?.join(' ') || '');
            const searchable = `${monster.name || ''} ${details.type || ''} ${(monster.tags || []).join(' ')}`.toLocaleLowerCase('es');
            return (sourceScope !== 'beasts' || type.includes('bestia')) && (!normalizedQuery || searchable.includes(normalizedQuery));
        }).slice(0, 120);
        const startManual = () => {
            setEditor(normalizeCompanion({ name: '', category: 'familiar', sourceKind: 'manual', maxHp: 1, currentHp: 1, armorClass: 10, initiativeMode: 'own', participates: false, details: { abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }, speedText: '', senses: '', languages: '', traits: [], actions: [], bonusActions: [], reactions: [] } }));
            setView('editor');
        };
        const importMonster = monster => {
            const details = cloneData(sourceKind === 'srd' ? monster.details || {} : monster.srdDetails || {});
            setEditor(normalizeCompanion({
                name: monster.name,
                category: 'familiar',
                sourceKind: sourceKind === 'srd' ? 'srd' : 'bestiary',
                sourceId: monster.id,
                sourceLabel: sourceKind === 'srd' ? 'Compendio SRD 5.1' : 'Bestiario personal',
                avatarDataUrl: '',
                avatarPath: sourceKind === 'srd' ? getMonsterIcon(monster) : '',
                maxHp: monster.maxHp,
                currentHp: monster.maxHp,
                armorClass: monster.armorClass,
                initiativeMode: 'own',
                details,
                notes: sourceKind === 'bestiary' ? monster.privateNotes || '' : ''
            }));
            setView('editor');
        };
        const saveEditor = () => {
            const normalized = normalizeCompanion(editor);
            if (!normalized.name) return;
            onChange(previous => previous.some(item => item.id === normalized.id) ? previous.map(item => item.id === normalized.id ? normalized : item) : [...previous, normalized]);
            setSelectedId(normalized.id);
            setView('detail');
        };
        const updateEditor = changes => setEditor(previous => normalizeCompanion({ ...previous, ...changes }));
        const updateDetails = changes => setEditor(previous => normalizeCompanion({ ...previous, details: { ...(previous.details || {}), ...changes } }));
        const statEntries = companion => Object.entries({ FUE: companion?.details?.abilities?.str, DES: companion?.details?.abilities?.dex, CON: companion?.details?.abilities?.con, INT: companion?.details?.abilities?.int, SAB: companion?.details?.abilities?.wis, CAR: companion?.details?.abilities?.cha });
        const goBack = () => { if (view === 'list') onClose(); else { setEditor(null); setView('list'); } };
        return ReactDOM.createPortal(<div className="companion-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
            <section className="companion-dialog" role="dialog" aria-modal="true" aria-labelledby="companion-dialog-title">
                <header className="companion-dialog-header"><span className="companion-dialog-emblem" aria-hidden="true">✦</span><div><small>Vínculos del personaje</small><h3 id="companion-dialog-title">{view === 'source' ? 'Elegir criatura' : view === 'editor' ? (companions.some(item => item.id === editor?.id) ? 'Editar compañero' : 'Vincular compañero') : view === 'detail' && selected ? selected.name : 'Compañeros'}</h3><p>{view === 'source' ? 'Importa una criatura como copia independiente de su ficha.' : view === 'editor' ? 'Ajusta su identidad y cómo participa en combate.' : view === 'detail' ? `${COMPANION_CATEGORY_LABELS[selected?.category] || 'Compañero'} · ${selected?.sourceLabel || 'Ficha personalizada'}` : 'Familiares, aliados, monturas e invocaciones vinculadas.'}</p></div><button type="button" onClick={onClose} aria-label="Cerrar">×</button></header>
                {view !== 'list' && <nav className="companion-dialog-back"><button type="button" onClick={goBack}>← Volver a compañeros</button></nav>}
                <div className="companion-dialog-body">
                    {view === 'list' && <><div className="companion-manager-intro"><div><small>{companions.length ? 'Vínculos registrados' : 'Tu grupo cercano'}</small><strong>{companions.length ? `${companions.length} compañero${companions.length === 1 ? '' : 's'}` : 'Aún no hay compañeros'}</strong><p>Sus PV, condiciones y participación pertenecen a este personaje.</p></div><button type="button" onClick={() => setView('source')}>＋ Añadir compañero</button></div><div className="companion-manager-grid">{companions.map(companion => { const hpPercent = companion.maxHp > 0 ? Math.max(0, Math.min(100, companion.currentHp / companion.maxHp * 100)) : 0; return <article key={companion.id} className={companion.participates ? 'is-participating' : ''}><button type="button" className="companion-manager-card-main" onClick={() => { setSelectedId(companion.id); setView('detail'); }}><CompanionAvatar companion={companion}/><span><small>{COMPANION_CATEGORY_LABELS[companion.category]}</small><strong>{companion.name}</strong><em>CA {companion.armorClass ?? '—'} · PV {companion.currentHp}/{companion.maxHp}</em><i><b style={{width:`${hpPercent}%`}} /></i></span><span className="companion-manager-state">{companion.participates ? 'En combate' : 'Disponible'}</span></button><div><button type="button" onClick={() => { setEditor(cloneData(companion)); setView('editor'); }}>Editar</button><button type="button" onClick={() => onDelete(companion)}>Eliminar</button></div></article>; })}{!companions.length && <button type="button" className="companion-manager-empty" onClick={() => setView('source')}><span aria-hidden="true">◇</span><strong>Añade tu primer compañero</strong><p>Elige una bestia del compendio, usa tu bestiario o crea una ficha manual.</p><b>Comenzar →</b></button>}</div></>}
                    {view === 'source' && <><div className="companion-source-options"><button type="button" className={sourceKind === 'srd' ? 'is-active' : ''} onClick={() => setSourceKind('srd')}><span>♜</span><strong>Compendio SRD</strong><small>{srdMonsters.length} criaturas</small></button><button type="button" className={sourceKind === 'local' ? 'is-active' : ''} onClick={() => setSourceKind('local')}><span>◇</span><strong>Mi bestiario</strong><small>{localMonsters.length} criaturas</small></button><button type="button" onClick={startManual}><span>＋</span><strong>Crear manualmente</strong><small>Ficha personalizada</small></button></div><div className="companion-source-filters"><label><span>⌕</span><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nombre o tipo…" /></label><select value={sourceScope} onChange={event => setSourceScope(event.target.value)}><option value="beasts">Bestias recomendadas</option><option value="all">Todas las criaturas</option></select></div><div className="companion-source-results">{matches.map(monster => { const details = sourceKind === 'srd' ? monster.details || {} : monster.srdDetails || {}; const avatar = monster.avatarDataUrl || (sourceKind === 'srd' ? getMonsterIcon(monster) : ''); return <button key={monster.id} type="button" onClick={() => importMonster(monster)}><span className="companion-source-avatar">{avatar ? <img src={avatar} alt="" loading="lazy"/> : String(monster.name).slice(0,1)}</span><span><small>{details.type || monster.tags?.[0] || 'Criatura'} · CR {String(details.challengeRating || '—').split(' ')[0]}</small><strong>{monster.name}</strong><em>PV {monster.maxHp} · CA {monster.armorClass ?? '—'}</em></span><b>Vincular →</b></button>; })}{!matches.length && <div className="companion-source-empty"><strong>Sin coincidencias</strong><p>{sourceScope === 'beasts' ? 'Prueba a mostrar todas las criaturas.' : 'Cambia la búsqueda o crea una ficha manual.'}</p></div>}</div></>}
                    {view === 'editor' && editor && <div className="companion-editor"><section className="companion-editor-identity"><CompanionAvatar companion={editor}/><label><span>Nombre del compañero</span><input autoFocus value={editor.name} onChange={event => updateEditor({name:event.target.value})} placeholder="Ej. Nimbo"/></label><label><span>Tipo de vínculo</span><select value={editor.category} onChange={event => updateEditor({category:event.target.value})}>{Object.entries(COMPANION_CATEGORY_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label></section><section className="companion-editor-stats"><label><span>PV actuales</span><input type="number" min="0" value={editor.currentHp} onChange={event => updateEditor({currentHp:event.target.value})}/></label><label><span>PV máximos</span><input type="number" min="0" value={editor.maxHp} onChange={event => updateEditor({maxHp:event.target.value})}/></label><label><span>PV temporales</span><input type="number" min="0" value={editor.tempHp} onChange={event => updateEditor({tempHp:event.target.value})}/></label><label><span>Clase de armadura</span><input type="number" min="0" value={editor.armorClass ?? ''} onChange={event => updateEditor({armorClass:event.target.value})}/></label></section><section className="companion-editor-combat"><header><div><small>Comportamiento táctico</small><strong>Participación en combate</strong></div><button type="button" className={editor.participates ? 'is-active' : ''} onClick={() => updateEditor({participates:!editor.participates})}><i/>{editor.participates ? 'Participará' : 'No participa'}</button></header><label><span>Cuándo actúa</span><select value={editor.initiativeMode} onChange={event => updateEditor({initiativeMode:event.target.value})}>{Object.entries(COMPANION_INITIATIVE_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>{editor.initiativeMode === 'own' && <label><span>Iniciativa</span><input type="number" value={editor.initiative ?? ''} onChange={event => updateEditor({initiative:event.target.value})} placeholder="Pendiente"/></label>}<p>La aplicación organiza el turno, pero no decide qué puede hacer el compañero.</p></section>{editor.category === 'familiar' && <aside className="companion-rules-note"><span>SRD 5.1</span><p><strong>Familiar clásico:</strong> tira su propia iniciativa y actúa en su turno. No puede atacar, aunque sí puede realizar otras acciones; una capacidad concreta puede modificar estas reglas.</p></aside>}{editor.sourceKind === 'manual' && <section className="companion-editor-details"><label><span>Velocidad</span><input value={editor.details?.speedText || ''} onChange={event => updateDetails({speedText:event.target.value})} placeholder="Ej. 9 m, volar 18 m"/></label><label><span>Sentidos</span><input value={editor.details?.senses || ''} onChange={event => updateDetails({senses:event.target.value})}/></label><label><span>Idiomas</span><input value={editor.details?.languages || ''} onChange={event => updateDetails({languages:event.target.value})}/></label></section>}<label className="companion-editor-notes"><span>Condiciones activas</span><input value={companionConditionNames(editor).join(', ')} onChange={event => updateEditor({conditions:event.target.value.split(',').map(value => value.trim()).filter(Boolean)})} placeholder="Invisible, envenenado…"/></label><label className="companion-editor-notes"><span>Notas del jugador</span><textarea value={editor.notes || ''} onChange={event => updateEditor({notes:event.target.value})} placeholder="Órdenes habituales, vínculo, recordatorios…"/></label><footer><button type="button" onClick={goBack}>Cancelar</button><button type="button" className="is-primary" disabled={!editor.name.trim()} onClick={saveEditor}>Guardar compañero</button></footer></div>}
                    {view === 'detail' && selected && <div className="companion-sheet"><section className="companion-sheet-hero"><CompanionAvatar companion={selected}/><div><small>{COMPANION_CATEGORY_LABELS[selected.category]}</small><h4>{selected.name}</h4><p>{selected.details?.subtitle || selected.details?.type || selected.sourceLabel || 'Compañero personalizado'}</p><span className={selected.participates ? 'is-active' : ''}>{selected.participates ? 'Preparado para combatir' : 'Fuera del combate'}</span></div><button type="button" onClick={() => { setEditor(cloneData(selected)); setView('editor'); }}>Editar ficha</button></section><div className="companion-sheet-vitals"><span><small>PV</small><strong>{selected.currentHp}/{selected.maxHp}</strong>{selected.tempHp > 0 && <em>+{selected.tempHp} temporales</em>}</span><span><small>CA</small><strong>{selected.armorClass ?? '—'}</strong></span><span><small>Movimiento</small><strong>{selected.details?.speedText || '—'}</strong></span><span><small>Turno</small><strong>{COMPANION_INITIATIVE_LABELS[selected.initiativeMode]}</strong></span></div>{statEntries(selected).some(([,value]) => value !== undefined) && <div className="companion-sheet-abilities">{statEntries(selected).map(([label,value]) => <span key={label}><small>{label}</small><strong>{value ?? '—'}</strong><em>{Number.isFinite(Number(value)) ? `${Math.floor((Number(value)-10)/2) >= 0 ? '+' : ''}${Math.floor((Number(value)-10)/2)}` : ''}</em></span>)}</div>}<div className="companion-sheet-info">{[['Sentidos',selected.details?.senses],['Idiomas',selected.details?.languages],['Salvaciones',selected.details?.saves],['Habilidades',selected.details?.skills],['Resistencias',selected.details?.resistances],['Inmunidades',selected.details?.immunities],['Vulnerabilidades',selected.details?.vulnerabilities]].filter(([,value]) => value).map(([label,value]) => <p key={label}><strong>{label}</strong>{value}</p>)}</div><div className="companion-sheet-sections">{[['Rasgos',selected.details?.traits],['Acciones',selected.details?.actions],['Acciones adicionales',selected.details?.bonusActions],['Reacciones',selected.details?.reactions]].map(([title,entries]) => Array.isArray(entries) && entries.length > 0 && <section key={title}><header><h5>{title}</h5><span>{entries.length}</span></header>{entries.map((entry,index) => <article key={`${entry?.name || title}-${index}`}><strong>{entry?.name || 'Detalle'}</strong><p>{entry?.desc || ''}</p>{Array.isArray(entry?.dice) && entry.dice.length > 0 && <div>{entry.dice.map((die,dieIndex) => <span key={`${die}-${dieIndex}`}>{die}</span>)}</div>}</article>)}</section>)}</div>{companionConditionNames(selected).length > 0 && <section className="companion-sheet-conditions"><h5>Condiciones</h5><div>{companionConditionNames(selected).map(name => <span key={name}>{name}</span>)}</div></section>}{selected.notes && <section className="companion-sheet-notes"><h5>Notas</h5><p>{selected.notes}</p></section>}</div>}
                </div>
            </section>
        </div>, document.body);
    }

    return { COMPANION_CATEGORY_LABELS, COMPANION_INITIATIVE_LABELS, getCompanionAvatar, companionConditionNames, CompanionAvatar, CompanionManagerModal };
})();
