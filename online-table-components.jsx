/* Presentation-only components for Mesa Online. */
const { isValidPortraitDataUrl } = window.DndAppUtils;

const OnlineCombatantAvatar = ({ combatant, className = '', onAvatarPreview }) => {
    const name = combatant?.name || 'Combatiente';
    const initial = name.trim().slice(0, 1).toUpperCase() || '?';
    const hasAvatar = isValidPortraitDataUrl(combatant?.avatarDataUrl);
    const isDetailAvatar = className.split(/\s+/).includes('h-20');

    if (hasAvatar && isDetailAvatar) {
        return (
            <button
                type="button"
                onClick={() => onAvatarPreview?.({ name, src: combatant.avatarDataUrl })}
                className={`online-combatant-avatar overflow-hidden object-cover cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300 ${className}`}
                aria-label={`Ampliar avatar de ${name}`}
            >
                <img src={combatant.avatarDataUrl} alt="" className="h-full w-full object-cover" />
            </button>
        );
    }

    return hasAvatar
        ? <img src={combatant.avatarDataUrl} alt="" className={`online-combatant-avatar object-cover ${className}`} />
        : <span aria-hidden="true" className={`online-combatant-avatar online-combatant-avatar--fallback ${className}`}>{initial}</span>;
};

const OnlinePartyOverview = ({ participants = [], members = [], sheets = [], onOpenSheet, onAvatarPreview }) => {
    const sheetsByOwner = new Map(sheets.map(document => [document.ownerUid || document.id, {
        document,
        snapshot: window.DndOnlineTableUtils.parseOnlinePlayerSheetSnapshot(document.snapshotJson)
    }]));
    const playerMembers = members.filter(member => member.role !== 'master' || participants.some(participant => participant.ownerUid === member.uid));

    return (
        <section className="online-party-hub" aria-labelledby="online-party-title">
            <header className="online-party-hub__header">
                <div><small>Vista del Máster</small><h4 id="online-party-title">Grupo de aventureros</h4><p>Consulta lo esencial de cada ficha sin abandonar la mesa.</p></div>
                <span>{participants.length} {participants.length === 1 ? 'ficha' : 'fichas'}</span>
            </header>
            <div className="online-party-grid">
                {playerMembers.map(member => {
                    const participant = participants.find(item => item.ownerUid === member.uid);
                    const sheetEntry = sheetsByOwner.get(member.uid);
                    const snapshot = sheetEntry?.snapshot;
                    const hp = window.DndOnlineTableUtils.getHpValues(participant || snapshot?.combat);
                    const hpPercent = hp.maxHp > 0 ? Math.min(100, hp.currentHp / hp.maxHp * 100) : 0;
                    const conditions = window.DndOnlineTableUtils.normalizeOnlineConditions(participant?.conditions);
                    const connected = member.active !== false && participant?.connected !== false;
                    return <article key={member.id} className={`online-party-card ${connected ? '' : 'is-offline'}`}>
                        <div className="online-party-card__identity">
                            {participant ? <OnlineCombatantAvatar combatant={participant} className="h-12 w-12 text-sm" onAvatarPreview={onAvatarPreview} /> : <span className="online-party-card__empty-avatar">?</span>}
                            <div><strong>{participant?.name || member.displayName || 'Jugador'}</strong><span>{snapshot?.identity?.className || participant?.className || 'Sin clase'} · Nivel {snapshot?.identity?.level || participant?.level || '—'}</span></div>
                            <i className={connected ? 'is-connected' : ''} title={connected ? 'Conectado' : 'Desconectado'} />
                        </div>
                        {participant ? <>
                            <div className="online-party-card__vitals"><span><small>PV</small><b>{hp.currentHp}/{hp.maxHp}</b></span><span><small>CA</small><b>{participant.armorClass ?? snapshot?.combat?.armorClass ?? '—'}</b></span><span><small>Pasiva</small><b>{snapshot?.passives?.perception ?? '—'}</b></span><span><small>Iniciativa</small><b>{participant.initiative ?? '—'}</b></span></div>
                            <div className="online-party-card__hp"><span style={{ width: `${hpPercent}%` }} /></div>
                            <div className="online-party-card__status">
                                {snapshot?.combat?.concentration && <span className="is-concentration">Concentración: {snapshot.combat.concentration}</span>}
                                {conditions.slice(0, 3).map(condition => <span key={condition.id} className="is-condition">{condition.name}</span>)}
                                {!snapshot?.combat?.concentration && !conditions.length && <span>Sin estados activos</span>}
                            </div>
                            <button type="button" disabled={!snapshot} onClick={() => onOpenSheet?.(participant.ownerUid)} className="online-party-card__open">{snapshot ? 'Abrir ficha del jugador' : 'Esperando actualización de ficha'}</button>
                        </> : <div className="online-party-card__missing"><p>Aún no ha compartido ningún personaje.</p></div>}
                    </article>;
                })}
                {!playerMembers.length && <div className="online-party-empty"><span aria-hidden="true">♙</span><strong>Aún no hay jugadores</strong><p>Invítalos con el código de la sala. Sus fichas aparecerán aquí al compartirlas.</p></div>}
            </div>
        </section>
    );
};

const OnlinePlayerSheetModal = ({ participant, sheetDocument, onClose, onAvatarPreview }) => {
    const [tab, setTab] = React.useState('summary');
    const snapshot = window.DndOnlineTableUtils.parseOnlinePlayerSheetSnapshot(sheetDocument?.snapshotJson);
    React.useEffect(() => setTab('summary'), [participant?.ownerUid]);
    if (!participant || !snapshot) return null;
    const liveHp = window.DndOnlineTableUtils.getHpValues(participant, snapshot.combat);
    const formatModifier = window.DndOnlineTableUtils.formatOnlineModifier;
    const conditions = window.DndOnlineTableUtils.normalizeOnlineConditions(participant.conditions);
    const spellsByLevel = snapshot.spells.reduce((groups, spell) => {
        const level = Number(spell.level) || 0;
        (groups[level] ||= []).push(spell);
        return groups;
    }, {});
    const currency = [['PC', snapshot.currency.pc], ['PP', snapshot.currency.plata], ['PE', snapshot.currency.electro], ['PO', snapshot.currency.po], ['PL', snapshot.currency.platino]];
    const Section = ({ title, children, empty }) => <section className="online-sheet-section"><h5>{title}</h5>{empty ? <p className="online-sheet-empty">{empty}</p> : children}</section>;

    return (
        <div className="online-sheet-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose?.(); }}>
            <article className="online-sheet-dialog" role="dialog" aria-modal="true" aria-labelledby="online-sheet-title">
                <header className="online-sheet-header">
                    <OnlineCombatantAvatar combatant={participant} className="h-16 w-16 text-xl" onAvatarPreview={onAvatarPreview} />
                    <div><small>Ficha compartida · Solo lectura</small><h4 id="online-sheet-title">{snapshot.identity.name}</h4><p>{[snapshot.identity.race, snapshot.identity.className, `Nivel ${snapshot.identity.level}`].filter(Boolean).join(' · ')}</p></div>
                    <button type="button" onClick={onClose} aria-label="Cerrar ficha">&times;</button>
                </header>
                <nav className="online-sheet-tabs" aria-label="Secciones de la ficha">
                    {[['summary', 'Resumen'], ['combat', 'Combate'], ['spells', 'Conjuros'], ['inventory', 'Mochila']].map(([id, label]) => <button key={id} type="button" onClick={() => setTab(id)} className={tab === id ? 'is-active' : ''}>{label}</button>)}
                </nav>
                <div className="online-sheet-content">
                    {tab === 'summary' && <div className="online-sheet-layout">
                        <div className="online-sheet-main">
                            <div className="online-sheet-metrics">
                                <span><small>PV actuales</small><b>{liveHp.currentHp}/{liveHp.maxHp}</b>{liveHp.tempHp > 0 && <em>+{liveHp.tempHp} temporales</em>}</span>
                                <span><small>Clase de armadura</small><b>{participant.armorClass ?? snapshot.combat.armorClass}</b></span>
                                <span><small>Iniciativa</small><b>{participant.initiative ?? formatModifier(snapshot.combat.initiativeBonus)}</b></span>
                                <span><small>Velocidad</small><b>{snapshot.identity.speed || '—'}</b></span>
                            </div>
                            <Section title="Características y salvaciones"><div className="online-sheet-abilities">{snapshot.abilities.map(ability => <div key={ability.key}><small>{ability.label}</small><strong>{ability.score}</strong><span>Mod. {formatModifier(ability.modifier)}</span><span className={ability.saveProficient ? 'is-proficient' : ''}>Salv. {formatModifier(ability.saveBonus)}</span></div>)}</div></Section>
                            <Section title="Competencias"><div className="online-sheet-skills">{snapshot.skills.map(skill => <span key={skill.key} className={skill.expertise ? 'is-expert' : skill.proficient ? 'is-proficient' : ''}><i />{skill.name}<b>{formatModifier(skill.bonus)}</b></span>)}</div></Section>
                        </div>
                        <aside className="online-sheet-aside">
                            <Section title="Percepciones pasivas"><div className="online-sheet-passives"><span>Percepción <b>{snapshot.passives.perception}</b></span><span>Investigación <b>{snapshot.passives.investigation}</b></span><span>Perspicacia <b>{snapshot.passives.insight}</b></span></div></Section>
                            <Section title="Rasgos" empty={!snapshot.traits.length ? 'Sin rasgos registrados.' : ''}><div className="online-sheet-list">{snapshot.traits.map((trait, index) => <details key={`${trait.name}-${index}`}><summary>{trait.name}</summary>{trait.description && <p>{trait.description}</p>}</details>)}</div></Section>
                            <Section title="Dotes" empty={!snapshot.feats.length ? 'Sin dotes registradas.' : ''}><div className="online-sheet-list">{snapshot.feats.map((feat, index) => <details key={`${feat.name}-${index}`}><summary>{feat.name}</summary>{feat.description && <p>{feat.description}</p>}</details>)}</div></Section>
                            <Section title="Otras competencias" empty={!snapshot.proficiencies.length ? 'Sin datos registrados.' : ''}><div className="online-sheet-tags">{snapshot.proficiencies.map((entry, index) => <span key={`${entry.name}-${index}`}>{entry.name}</span>)}</div></Section>
                        </aside>
                    </div>}
                    {tab === 'combat' && <div className="online-sheet-layout">
                        <div className="online-sheet-main">
                            <div className="online-sheet-metrics"><span><small>PV</small><b>{liveHp.currentHp}/{liveHp.maxHp}</b></span><span><small>CA</small><b>{participant.armorClass ?? snapshot.combat.armorClass}</b></span><span><small>Competencia</small><b>{formatModifier(snapshot.combat.proficiencyBonus)}</b></span><span><small>Dados de golpe</small><b>{snapshot.combat.hitDice.current || '—'} {snapshot.combat.hitDice.type}</b></span></div>
                            <Section title="Ataques" empty={!snapshot.weapons.length ? 'No hay ataques registrados.' : ''}><div className="online-sheet-attacks">{snapshot.weapons.map((weapon, index) => <article key={`${weapon.name}-${index}`}><strong>{weapon.name}</strong>{weapon.attacks.map((attack, attackIndex) => <div key={`${attack.name}-${attackIndex}`}><span>{attack.name || 'Ataque'}</span><b>{attack.attack || '—'}</b><em>{attack.damage || '—'}</em>{attack.notes && <small>{attack.notes}</small>}</div>)}</article>)}</div></Section>
                            <Section title="Recursos" empty={!snapshot.resources.length ? 'No hay recursos registrados.' : ''}><div className="online-sheet-resources">{snapshot.resources.map((resource, index) => <span key={`${resource.name}-${index}`}><strong>{resource.name}</strong><b>{resource.current}/{resource.max}</b><small>{resource.recovery || resource.type}</small></span>)}</div></Section>
                        </div>
                        <aside className="online-sheet-aside">
                            <Section title="Estado actual"><div className="online-sheet-status-list"><span>Inspiración <b>{snapshot.combat.inspiration ? 'Sí' : 'No'}</b></span><span>Concentración <b>{snapshot.combat.concentration || 'Ninguna'}</b></span><span>Salvaciones de muerte <b>{snapshot.combat.deathSaves.successes} éxitos · {snapshot.combat.deathSaves.failures} fallos</b></span>{conditions.map(condition => <span key={condition.id} className="is-condition">{condition.name}</span>)}</div></Section>
                            <Section title="Armaduras" empty={!snapshot.armors.length ? 'No hay armaduras registradas.' : ''}><div className="online-sheet-list">{snapshot.armors.map((armor, index) => <div className="online-sheet-armor" key={`${armor.name}-${index}`}><strong>{armor.name}</strong><span>CA {armor.armorClass || '—'} · {armor.type || 'Armadura'}</span>{armor.equipped && <b>Equipada</b>}</div>)}</div></Section>
                        </aside>
                    </div>}
                    {tab === 'spells' && <div className="online-sheet-spells">
                        <div className="online-sheet-metrics"><span><small>Aptitud mágica</small><b>{snapshot.spellcasting.abilityName || '—'}</b></span><span><small>CD de salvación</small><b>{snapshot.spellcasting.saveDc ?? '—'}</b></span><span><small>Ataque de conjuro</small><b>{snapshot.spellcasting.attackBonus === null ? '—' : formatModifier(snapshot.spellcasting.attackBonus)}</b></span><span><small>Concentración</small><b>{snapshot.combat.concentration || 'Ninguna'}</b></span></div>
                        <Section title="Espacios"><div className="online-sheet-slots">{snapshot.spellcasting.slots.map(slot => <span key={slot.level}><small>Nivel {slot.level}</small><b>{slot.current}/{slot.max}</b></span>)}{snapshot.spellcasting.pactSlots && <span><small>Pacto N. {snapshot.spellcasting.pactSlots.level}</small><b>{snapshot.spellcasting.pactSlots.current}/{snapshot.spellcasting.pactSlots.max}</b></span>}{!snapshot.spellcasting.slots.length && !snapshot.spellcasting.pactSlots && <p className="online-sheet-empty">Sin espacios registrados.</p>}</div></Section>
                        <Section title="Lista de conjuros" empty={!snapshot.spells.length ? 'No hay conjuros registrados.' : ''}><div className="online-sheet-spell-groups">{Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b)).map(level => <section key={level}><h6>{Number(level) === 0 ? 'Trucos' : `Nivel ${level}`}</h6><div>{spellsByLevel[level].map((spell, index) => <article key={`${spell.name}-${index}`}><strong>{spell.name}</strong><span>{spell.school || 'Sin escuela'}</span><div>{spell.prepared && <b>Preparado</b>}{spell.ritual && <b>Ritual</b>}{spell.concentration && <b>Concentración</b>}</div><small>{[spell.castingTime, spell.range, spell.duration].filter(Boolean).join(' · ')}</small></article>)}</div></section>)}</div></Section>
                    </div>}
                    {tab === 'inventory' && <div className="online-sheet-layout">
                        <div className="online-sheet-main">
                            <Section title="Monedas"><div className="online-sheet-currency">{currency.map(([label, amount]) => <span key={label}><small>{label}</small><b>{amount}</b></span>)}</div></Section>
                            <Section title="Contenido de la mochila" empty={!snapshot.inventory.length ? 'La mochila está vacía.' : ''}><div className="online-sheet-inventory">{snapshot.inventory.map((item, index) => <article key={`${item.name}-${index}`}><span>{item.quantity || 0}</span><div><strong>{item.name}</strong>{item.description && <p>{item.description}</p>}</div></article>)}</div></Section>
                        </div>
                        <aside className="online-sheet-aside">
                            <Section title="Herramientas" empty={!snapshot.tools.length ? 'Sin herramientas registradas.' : ''}><div className="online-sheet-list">{snapshot.tools.map((tool, index) => <details key={`${tool.name}-${index}`}><summary>{tool.name}</summary>{tool.description && <p>{tool.description}</p>}</details>)}</div></Section>
                            <Section title="Equipo defensivo" empty={!snapshot.armors.length ? 'Sin equipo defensivo registrado.' : ''}><div className="online-sheet-list">{snapshot.armors.map((armor, index) => <div className="online-sheet-armor" key={`${armor.name}-${index}`}><strong>{armor.name}</strong><span>{armor.type || 'Armadura'} · CA {armor.armorClass || '—'}</span>{armor.equipped && <b>Equipada</b>}</div>)}</div></Section>
                        </aside>
                    </div>}
                </div>
                <footer className="online-sheet-footer"><span>Las notas personales y el historial no se comparten.</span><button type="button" onClick={onClose}>Volver a la mesa</button></footer>
            </article>
        </div>
    );
};

const EnemyModal = ({ modal, onChange, onClose, onSave }) => {
    if (!modal?.isOpen) return null;

    const updateData = (changes) => onChange(previous => ({
        ...previous,
        data: { ...previous.data, ...changes }
    }));
    const close = () => onClose();

    return (
        <div className="fixed inset-0 z-[72] flex items-center justify-center bg-black/80 p-4" onClick={close}>
            <div className="rpg-panel max-h-[90vh] w-full max-w-lg overflow-y-auto border border-orange-700 p-5" onClick={event => event.stopPropagation()}>
                <div className="flex items-center justify-between gap-3">
                    <h3 className="font-fantasy text-lg font-bold text-orange-200">
                        {modal.mode === 'create' ? 'Añadir enemigo' : 'Editar enemigo'}
                    </h3>
                    <button type="button" onClick={close} className="h-9 w-9 rounded border border-gray-600 text-gray-300">×</button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm text-gray-300">
                        Nombre
                        <input
                            autoFocus
                            value={modal.data.name || ''}
                            onChange={event => updateData({ name: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        />
                    </label>
                    <label className="text-sm text-gray-300">
                        Iniciativa
                        <input
                            type="number"
                            value={modal.data.initiative ?? ''}
                            onChange={event => updateData({ initiative: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        />
                    </label>
                    <label className="text-sm text-gray-300">
                        Vida actual
                        <input
                            type="number"
                            min="0"
                            value={modal.data.currentHp ?? 0}
                            onChange={event => updateData({ currentHp: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        />
                    </label>
                    <label className="text-sm text-gray-300">
                        Vida máxima
                        <input
                            type="number"
                            min="0"
                            value={modal.data.maxHp ?? 0}
                            onChange={event => updateData({ maxHp: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        />
                    </label>
                    <label className="text-sm text-gray-300">
                        Vida temporal
                        <input
                            type="number"
                            min="0"
                            value={modal.data.tempHp ?? 0}
                            onChange={event => updateData({ tempHp: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        />
                    </label>
                    <label className="text-sm text-gray-300">
                        CA
                        <input
                            type="number"
                            min="0"
                            value={modal.data.armorClass ?? ''}
                            onChange={event => updateData({ armorClass: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        />
                    </label>
                    <label className="text-sm text-gray-300">
                        Estado visible
                        <select
                            value={modal.data.visibleStateMode || 'automatic'}
                            onChange={event => updateData({ visibleStateMode: event.target.value })}
                            className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                        >
                            <option value="automatic">Automática</option>
                            <option value="manual">Manual</option>
                            <option value="hidden">Oculta</option>
                        </select>
                    </label>
                    {modal.data.visibleStateMode === 'manual' && (
                        <label className="text-sm text-gray-300">
                            Estado manual
                            <select
                                value={modal.data.manualVisibleState || 'herido'}
                                onChange={event => updateData({ manualVisibleState: event.target.value })}
                                className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                            >
                                <option value="intacto">Intacto</option>
                                <option value="herido">Herido</option>
                                <option value="muy-herido">Muy herido</option>
                                <option value="derrotado">Derrotado</option>
                                <option value="oculto">Oculto</option>
                            </select>
                        </label>
                    )}
                </div>

                <label className="mt-3 block text-sm text-gray-300">
                    Notas privadas
                    <textarea
                        value={modal.data.notes || ''}
                        onChange={event => updateData({ notes: event.target.value })}
                        className="mt-1 min-h-20 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
                    />
                </label>

                <p className="mt-2 text-xs text-orange-200">
                    Vista pública: {window.DndOnlineTableUtils.calculateEnemyVisibleState(
                        modal.data.currentHp,
                        modal.data.maxHp,
                        modal.data.visibleStateMode,
                        modal.data.manualVisibleState
                    )}
                </p>

                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={close} className="min-h-10 px-3 rounded border border-gray-600 text-sm text-gray-300">Cancelar</button>
                    <button type="button" onClick={onSave} className="min-h-10 px-4 rounded border border-orange-600 bg-orange-800 text-sm font-bold text-white">Guardar enemigo</button>
                </div>
            </div>
        </div>
    );
};

const OnlineConditionModal = ({ modal, conditions, onChange, onClose, onSave }) => {
    if (!modal?.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[72] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div className="rpg-panel w-full max-w-sm border border-purple-700 p-5" onClick={event => event.stopPropagation()}>
                <h3 className="font-fantasy text-lg text-purple-200">Añadir condición</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                    {conditions.map(name => (
                        <button key={name} type="button" onClick={() => onChange(previous => ({ ...previous, name }))} className={`min-h-9 px-2 rounded border text-xs ${modal.name === name ? 'border-purple-400 bg-purple-950/50 text-purple-100' : 'border-gray-700 text-gray-300'}`}>{name}</button>
                    ))}
                </div>
                <label className="mt-4 block text-sm text-gray-300">Personalizada<input value={modal.name} onChange={event => onChange(previous => ({ ...previous, name: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                <label className="mt-3 block text-sm text-gray-300">Fuente<input value={modal.source} onChange={event => onChange(previous => ({ ...previous, source: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                {modal.target?.type !== 'enemy' && <label className="mt-3 block text-sm text-gray-300">Notas<input value={modal.notes} onChange={event => onChange(previous => ({ ...previous, notes: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>}
                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="min-h-10 px-3 rounded border border-gray-600 text-gray-300">Cancelar</button>
                    <button type="button" onClick={onSave} className="min-h-10 px-3 rounded border border-purple-700 text-purple-100">Guardar</button>
                </div>
            </div>
        </div>
    );
};

const OnlineEffectModal = ({ modal, combatants, canManageEnemies, currentUid, onChange, onClose, onSave }) => {
    if (!modal?.isOpen) return null;
    const update = changes => onChange(previous => ({ ...previous, data: { ...previous.data, ...changes } }));
    const visibleTargets = combatants.filter(target => canManageEnemies || target.ownerUid === currentUid);

    return (
        <div className="fixed inset-0 z-[73] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div className="rpg-panel max-h-[90vh] w-full max-w-lg overflow-y-auto border border-cyan-700 p-5" onClick={event => event.stopPropagation()}>
                <h3 className="font-fantasy text-lg text-cyan-200">Efecto temporal</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm text-gray-300">Nombre<input value={modal.data.name || ''} onChange={event => update({ name: event.target.value })} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                    <label className="text-sm text-gray-300">Objetivo<select value={modal.data.targetType === 'global' ? 'global' : modal.data.targetId || ''} onChange={event => { const value = event.target.value; const target = combatants.find(item => item.id === value); update({ targetId: value === 'global' ? 'global' : value, targetType: value === 'global' ? 'global' : target?.type === 'enemy' ? 'enemy' : 'player' }); }} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="">Selecciona</option><option value="global">Global</option>{visibleTargets.map(target => <option key={target.id} value={target.id}>{target.name}</option>)}</select></label>
                    <label className="text-sm text-gray-300">Duración<select value={modal.data.durationType || 'manual'} onChange={event => update({ durationType: event.target.value })} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="turns">Turnos</option><option value="rounds">Rondas</option><option value="minutes">Minutos</option><option value="manual">Manual</option></select></label>
                    {modal.data.durationType !== 'manual' && <label className="text-sm text-gray-300">Restante<input type="number" min="0" value={modal.data.remaining ?? 0} onChange={event => update({ remaining: event.target.value, maximum: event.target.value })} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>}
                    {modal.data.durationType !== 'manual' && <label className="text-sm text-gray-300">Reducir<select value={modal.data.decrementMoment || 'manual'} onChange={event => update({ decrementMoment: event.target.value })} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"><option value="manual">Manual</option><option value="start-of-target-turn">Inicio turno objetivo</option><option value="end-of-target-turn">Fin turno objetivo</option><option value="start-of-round">Inicio ronda</option><option value="end-of-round">Fin ronda</option></select></label>}
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={!!modal.data.visibleToPlayers} onChange={event => update({ visibleToPlayers: event.target.checked })} />Visible para jugadores</label>
                <label className="mt-2 flex items-center gap-2 text-sm text-purple-200"><input type="checkbox" checked={!!modal.data.concentration} onChange={event => update({ concentration: event.target.checked })} />Requiere concentración</label>
                <label className="mt-3 block text-sm text-gray-300">Nota pública<input value={modal.data.notesPublic || ''} onChange={event => update({ notesPublic: event.target.value })} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white" /></label>
                <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="min-h-10 px-3 rounded border border-gray-600 text-gray-300">Cancelar</button><button type="button" onClick={onSave} className="min-h-10 px-3 rounded border border-cyan-700 text-cyan-100">Guardar</button></div>
            </div>
        </div>
    );
};

const OnlineHpModal = ({ modal, entity, onChange, onClose, onConfirm, busy, allowMax = false, accent = 'red' }) => {
    if (!modal?.isOpen || !entity) return null;
    const current = window.DndOnlineTableUtils.getHpValues(entity);
    const amount = Math.max(0, Number(modal.amount) || 0);
    let preview = { ...current };
    if (modal.mode === 'damage') {
        const absorbed = Math.min(current.tempHp, amount);
        preview = { ...current, tempHp: current.tempHp - absorbed, currentHp: Math.max(0, current.currentHp - (amount - absorbed)) };
    } else if (modal.mode === 'healing') preview = { ...current, currentHp: Math.min(current.maxHp, current.currentHp + amount) };
    else if (modal.mode === 'temp') preview = { ...current, tempHp: amount };
    else if (modal.mode === 'max') preview = { ...current, maxHp: amount, currentHp: Math.min(current.currentHp, amount) };
    else preview = { ...current, currentHp: Math.min(current.maxHp, amount) };
    const modes = [['damage', 'Daño'], ['healing', 'Curación'], ['temp', 'Vida temporal'], ['exact', 'Valor exacto'], ...(allowMax ? [['max', 'Vida máxima']] : [])];
    const activeClasses = accent === 'orange' ? 'border-orange-500 bg-orange-950/50 text-orange-100' : 'border-red-500 bg-red-950/50 text-red-100';
    const confirmClasses = accent === 'orange' ? 'border-orange-600 bg-orange-800' : 'border-red-600 bg-red-800';

    return (
        <div className="fixed inset-0 z-[73] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div className={`rpg-panel w-full max-w-sm border p-5 ${accent === 'orange' ? 'border-orange-700' : 'border-red-700'}`} onClick={event => event.stopPropagation()}>
                <div className="flex items-center justify-between gap-3"><div><h3 className={`font-fantasy text-lg font-bold ${accent === 'orange' ? 'text-orange-200' : 'text-red-200'}`}>Modificar vida</h3><p className="mt-1 text-xs text-gray-400">{entity.name || 'Personaje'}</p></div><button type="button" onClick={onClose} className="h-9 w-9 rounded border border-gray-600 text-gray-300" aria-label="Cerrar">×</button></div>
                <div className="mt-4 grid grid-cols-2 gap-2">{modes.map(([mode, label]) => <button key={mode} type="button" onClick={() => onChange(previous => ({ ...previous, mode }))} className={`min-h-10 rounded border px-2 text-xs ${modal.mode === mode ? activeClasses : 'border-gray-700 text-gray-300'}`}>{label}</button>)}</div>
                <label className="mt-4 block text-sm text-gray-300">Cantidad<input autoFocus type="number" min="0" value={modal.amount} onChange={event => onChange(previous => ({ ...previous, amount: event.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-950 p-3 text-center text-lg font-bold text-white outline-none focus:border-red-400" /></label>
                <div className="mt-4 rounded border border-gray-700 bg-gray-950/50 p-3 text-sm text-gray-300"><p>Vida: <b>{current.currentHp}</b> → <b>{preview.currentHp}</b> / {preview.maxHp}</p><p className="mt-1 text-cyan-200">Vida temporal: <b>{current.tempHp}</b> → <b>{preview.tempHp}</b></p></div>
                <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="min-h-10 px-4 rounded border border-gray-600 text-gray-300">Cancelar</button><button type="button" disabled={busy} onClick={onConfirm} className={`min-h-10 px-4 rounded border text-white disabled:opacity-50 ${confirmClasses}`}>Confirmar</button></div>
            </div>
        </div>
    );
};

window.DndOnlineComponents = { EnemyModal, OnlineConditionModal, OnlineEffectModal, OnlineHpModal, OnlineCombatantAvatar, OnlinePartyOverview, OnlinePlayerSheetModal };
