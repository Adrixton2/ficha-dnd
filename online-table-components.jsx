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

const OnlinePartyOverview = ({ participants = [], members = [], sheets = [], onOpenSheet, onAvatarPreview, onKickMember }) => {
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
                            <div><strong>{participant?.name || 'Personaje sin compartir'}</strong><span>{snapshot?.identity?.className || participant?.className || 'Sin clase'} · Nivel {snapshot?.identity?.level || participant?.level || '—'}</span><em>Jugador: {member.displayName || 'Sin identificar'}</em></div>
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
                            <div className="online-party-card__actions"><button type="button" disabled={!snapshot} onClick={() => onOpenSheet?.(participant.ownerUid)} className="online-party-card__open">{snapshot ? 'Abrir ficha del jugador' : 'Esperando actualización de ficha'}</button>{onKickMember && member.role !== 'master' && <button type="button" onClick={() => onKickMember(member)} className="online-party-card__kick">Expulsar de la sala</button>}</div>
                        </> : <div className="online-party-card__missing"><p>Aún no ha compartido ningún personaje.</p></div>}
                    </article>;
                })}
                {!playerMembers.length && <div className="online-party-empty"><span aria-hidden="true">♙</span><strong>Aún no hay jugadores</strong><p>Invítalos con el código de la sala. Sus fichas aparecerán aquí al compartirlas.</p></div>}
            </div>
        </section>
    );
};

const OnlineRoomModuleSelector = ({ active, onSelect, isMaster, encounterActive }) => {
    const modules = [
        { id: 'room', icon: '◈', eyebrow: 'Conexión y acceso', title: 'Sala', description: 'Código, invitaciones y estado de la sesión.' },
        { id: 'sheets', icon: '◇', eyebrow: isMaster ? 'Información del grupo' : 'Personaje compartido', title: isMaster ? 'Fichas' : 'Mi ficha', description: isMaster ? 'Resúmenes, recursos, conjuros y mochilas.' : 'Elige qué personaje ve el Máster y revisa su sincronización.' },
        { id: 'combat', icon: '⚔', eyebrow: encounterActive ? 'Encuentro en curso' : 'Preparación táctica', title: 'Combate', description: 'Iniciativas, enemigos, turnos, condiciones y efectos.' }
    ];
    return <nav className="online-room-modules" aria-label="Funciones de la Mesa Online">
        {modules.map(module => <button key={module.id} type="button" onClick={() => onSelect?.(module.id)} className={active === module.id ? 'is-active' : ''} aria-current={active === module.id ? 'page' : undefined}>
            <span className="online-room-modules__icon" aria-hidden="true">{module.icon}</span>
            <span><small>{module.eyebrow}</small><strong>{module.title}</strong><em>{module.description}</em></span>
            <b aria-hidden="true">{active === module.id ? '•' : '→'}</b>
        </button>)}
    </nav>;
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

    const publicState = window.DndOnlineTableUtils.calculateEnemyVisibleState(
        modal.data.currentHp,
        modal.data.maxHp,
        modal.data.visibleStateMode,
        modal.data.manualVisibleState
    );
    const title = modal.mode === 'create' ? 'Enemigo puntual' : modal.mode === 'duplicate' ? 'Duplicar enemigo' : 'Editar enemigo';

    return (
        <div className="enemy-editor-overlay" onClick={close}>
            <article className="enemy-editor" role="dialog" aria-modal="true" aria-labelledby="enemy-editor-title" onClick={event => event.stopPropagation()}>
                <header className="enemy-editor__header">
                    <span className="enemy-editor__emblem" aria-hidden="true">♞</span>
                    <div><small>Mesa Online · Herramienta del Máster</small><h3 id="enemy-editor-title">{title}</h3><p>{modal.mode === 'create' ? 'Crea una aparición rápida sin guardarla en tu biblioteca.' : 'Ajusta sus datos para este encuentro.'}</p></div>
                    <button type="button" onClick={close} aria-label="Cerrar editor">×</button>
                </header>

                <div className="enemy-editor__body">
                    <section className="enemy-editor__identity">
                        <label><span>Nombre en el encuentro</span><input autoFocus value={modal.data.name || ''} onChange={event => updateData({ name: event.target.value })} placeholder="Ej. Guardia de la torre" /></label>
                        <div className="enemy-editor__quick-stats">
                            <label><span>Iniciativa</span><input type="number" inputMode="numeric" value={modal.data.initiative ?? ''} onChange={event => updateData({ initiative: event.target.value })} placeholder="—" /></label>
                            <label><span>CA</span><input type="number" min="0" inputMode="numeric" value={modal.data.armorClass ?? ''} onChange={event => updateData({ armorClass: event.target.value })} placeholder="—" /></label>
                        </div>
                    </section>

                    <section className="enemy-editor__section is-health">
                        <div className="enemy-editor__section-heading"><span aria-hidden="true">♥</span><div><h4>Puntos de golpe</h4><p>La vida exacta solo será visible para el Máster.</p></div></div>
                        <div className="enemy-editor__health-line">
                            <label><span>Actuales</span><input type="number" min="0" inputMode="numeric" value={modal.data.currentHp ?? 0} onChange={event => updateData({ currentHp: event.target.value })} /></label>
                            <i aria-hidden="true">/</i>
                            <label><span>Máximos</span><input type="number" min="0" inputMode="numeric" value={modal.data.maxHp ?? 0} onChange={event => { const nextMax = event.target.value; const shouldFillCurrent = modal.mode === 'create' && (Number(modal.data.currentHp) === 0 || String(modal.data.currentHp) === String(modal.data.maxHp)); updateData({ maxHp: nextMax, ...(shouldFillCurrent ? { currentHp: nextMax } : {}) }); }} /></label>
                            <label className="is-temporary"><span>Temporales</span><input type="number" min="0" inputMode="numeric" value={modal.data.tempHp ?? 0} onChange={event => updateData({ tempHp: event.target.value })} /></label>
                        </div>
                    </section>

                    <section className="enemy-editor__section is-visibility">
                        <div className="enemy-editor__section-heading"><span aria-hidden="true">◉</span><div><h4>Información para los jugadores</h4><p>Decide cómo se describe su estado sin revelar sus PV.</p></div></div>
                        <div className="enemy-editor__visibility-controls">
                            <label><span>Estado visible</span><select value={modal.data.visibleStateMode || 'automatic'} onChange={event => updateData({ visibleStateMode: event.target.value })}><option value="automatic">Automático según sus PV</option><option value="manual">Elegido por el Máster</option><option value="hidden">Siempre oculto</option></select></label>
                            {modal.data.visibleStateMode === 'manual' && <label><span>Mostrar como</span><select value={modal.data.manualVisibleState || 'herido'} onChange={event => updateData({ manualVisibleState: event.target.value })}><option value="intacto">Intacto</option><option value="herido">Herido</option><option value="muy-herido">Muy herido</option><option value="derrotado">Derrotado</option><option value="oculto">Oculto</option></select></label>}
                            <div className="enemy-editor__public-preview"><small>Los jugadores verán</small><strong>{publicState}</strong></div>
                        </div>
                    </section>

                    <label className="enemy-editor__notes"><span>Notas privadas del Máster</span><small>No se comparten con los jugadores.</small><textarea value={modal.data.notes || ''} onChange={event => updateData({ notes: event.target.value })} placeholder="Táctica, capacidades pendientes, recordatorios…" /></label>
                </div>

                <footer className="enemy-editor__footer"><button type="button" onClick={close}>Cancelar</button><button type="button" className="is-primary" onClick={onSave}>{modal.mode === 'create' ? 'Añadir al encuentro' : modal.mode === 'duplicate' ? 'Crear copia' : 'Guardar cambios'}</button></footer>
            </article>
        </div>
    );
};

const OnlineConditionModal = ({ modal, conditions, onChange, onClose, onSave }) => {
    if (!modal?.isOpen) return null;
    const selectedName = String(modal.name || '');
    const targetName = modal.target?.name || 'Combatiente';

    return (
        <div className="online-combat-modal-overlay is-condition" onMouseDown={event => { if (event.target === event.currentTarget) onClose?.(); }}>
            <article className="online-combat-modal condition-editor" role="dialog" aria-modal="true" aria-labelledby="condition-editor-title">
                <header className="online-combat-modal__header"><span aria-hidden="true">◈</span><div><small>Estado del combatiente</small><h3 id="condition-editor-title">Añadir condición</h3><p>Marca un estado conocido o escribe uno propio.</p></div><button type="button" onClick={onClose} aria-label="Cerrar">×</button></header>
                <div className="online-combat-modal__target"><span aria-hidden="true">◎</span><div><small>Se aplicará a</small><strong>{targetName}</strong></div><b>{modal.target?.type === 'enemy' ? 'Enemigo' : 'Personaje'}</b></div>
                <div className="online-combat-modal__body">
                    <section className="condition-editor__presets"><header><div><small>Condiciones habituales</small><strong>Selección rápida</strong></div>{selectedName && <span>Elegida: {selectedName}</span>}</header><div>
                        {conditions.map(name => <button key={name} type="button" onClick={() => onChange(previous => ({ ...previous, name }))} className={selectedName === name ? 'is-selected' : ''}><span aria-hidden="true">{selectedName === name ? '✓' : '◇'}</span>{name}</button>)}
                    </div></section>
                    <label className="online-combat-field is-wide"><span>Condición personalizada</span><input value={selectedName} onChange={event => onChange(previous => ({ ...previous, name: event.target.value }))} placeholder="Ej. Marcado por el cazador" /></label>
                    <div className="online-combat-fields">
                        <label className="online-combat-field"><span>Fuente <em>opcional</em></span><input value={modal.source || ''} onChange={event => onChange(previous => ({ ...previous, source: event.target.value }))} placeholder="Conjuro, criatura, objeto…" /></label>
                        {modal.target?.type !== 'enemy' && <label className="online-combat-field"><span>Nota para la mesa <em>opcional</em></span><input value={modal.notes || ''} onChange={event => onChange(previous => ({ ...previous, notes: event.target.value }))} placeholder="Recordatorio breve" /></label>}
                    </div>
                </div>
                <footer className="online-combat-modal__footer"><p>{selectedName.trim() ? <><span aria-hidden="true">◆</span> Se añadirá <strong>{selectedName.trim()}</strong></> : 'Elige o escribe una condición para continuar.'}</p><button type="button" onClick={onClose}>Cancelar</button><button type="button" disabled={!selectedName.trim()} onClick={onSave} className="is-primary">Aplicar condición</button></footer>
            </article>
        </div>
    );
};

const OnlineEffectModal = ({ modal, combatants, canManageEnemies, currentUid, onChange, onClose, onSave }) => {
    if (!modal?.isOpen) return null;
    const update = changes => onChange(previous => ({ ...previous, data: { ...previous.data, ...changes } }));
    const visibleTargets = combatants.filter(target => canManageEnemies || target.ownerUid === currentUid);
    const durationOptions = [['turns', 'Turnos', 'Se mide por actuaciones'], ['rounds', 'Rondas', 'Se mide por vueltas completas'], ['minutes', 'Minutos', 'Duración narrativa'], ['manual', 'Manual', 'Finaliza cuando lo indiques']];
    const selectedTarget = modal.data.targetType === 'global' ? null : combatants.find(item => item.id === modal.data.targetId);
    const isManual = modal.data.durationType === 'manual';
    const canSave = String(modal.data.name || '').trim() && (modal.data.targetType === 'global' || selectedTarget);

    return (
        <div className="online-combat-modal-overlay is-effect" onMouseDown={event => { if (event.target === event.currentTarget) onClose?.(); }}>
            <article className="online-combat-modal effect-editor" role="dialog" aria-modal="true" aria-labelledby="effect-editor-title">
                <header className="online-combat-modal__header"><span aria-hidden="true">✦</span><div><small>Control temporal del encuentro</small><h3 id="effect-editor-title">{modal.effectId ? 'Editar efecto' : 'Añadir efecto'}</h3><p>Define quién lo recibe, cuánto dura y cuándo disminuye.</p></div><button type="button" onClick={onClose} aria-label="Cerrar">×</button></header>
                <div className="online-combat-modal__body">
                    <section className="effect-editor__section"><header><span>1</span><div><small>Identidad y objetivo</small><strong>¿Qué efecto está activo?</strong></div></header><div className="online-combat-fields">
                        <label className="online-combat-field"><span>Nombre del efecto</span><input autoFocus value={modal.data.name || ''} onChange={event => update({ name: event.target.value })} placeholder="Ej. Bendición" /></label>
                        <label className="online-combat-field"><span>Objetivo</span><select value={modal.data.targetType === 'global' ? 'global' : modal.data.targetId || ''} onChange={event => { const value = event.target.value; const target = combatants.find(item => item.id === value); update({ targetId: value === 'global' ? 'global' : value, targetType: value === 'global' ? 'global' : target?.type === 'enemy' ? 'enemy' : 'player' }); }}><option value="">Selecciona un combatiente</option>{canManageEnemies && <option value="global">Toda la escena (global)</option>}{visibleTargets.map(target => <option key={target.id} value={target.id}>{target.name} · {target.type === 'enemy' ? 'Enemigo' : 'Personaje'}</option>)}</select></label>
                    </div></section>
                    <section className="effect-editor__section"><header><span>2</span><div><small>Seguimiento</small><strong>¿Cómo se mide su duración?</strong></div></header><div className="effect-editor__duration">{durationOptions.map(([value, label, help]) => <button key={value} type="button" onClick={() => update({ durationType: value, ...(value === 'manual' ? { decrementMoment: 'manual' } : {}) })} className={modal.data.durationType === value ? 'is-selected' : ''}><span aria-hidden="true">{modal.data.durationType === value ? '◆' : '◇'}</span><strong>{label}</strong><small>{help}</small></button>)}</div>
                    {!isManual && <div className="online-combat-fields effect-editor__timing"><label className="online-combat-field"><span>Cantidad inicial</span><input type="number" inputMode="numeric" min="0" value={modal.data.remaining ?? 0} onChange={event => update({ remaining: event.target.value, maximum: event.target.value })} /></label><label className="online-combat-field"><span>Reducir automáticamente</span><select value={modal.data.decrementMoment || 'manual'} onChange={event => update({ decrementMoment: event.target.value })}><option value="manual">Solo manualmente</option><option value="start-of-target-turn">Al inicio del turno del objetivo</option><option value="end-of-target-turn">Al final del turno del objetivo</option><option value="start-of-round">Al inicio de la ronda</option><option value="end-of-round">Al final de la ronda</option></select></label></div>}
                    </section>
                    <section className="effect-editor__section"><header><span>3</span><div><small>Comportamiento y visibilidad</small><strong>Detalles que debe recordar la mesa</strong></div></header><div className="effect-editor__toggles">
                        {canManageEnemies ? <button type="button" onClick={() => update({ visibleToPlayers: !modal.data.visibleToPlayers })} className={modal.data.visibleToPlayers ? 'is-active' : ''}><i aria-hidden="true" /><span><strong>Visible para jugadores</strong><small>{modal.data.visibleToPlayers ? 'Aparecerá en sus paneles' : 'Solo lo verá el Máster'}</small></span></button> : <div className="is-locked"><i aria-hidden="true" /><span><strong>Visible en la mesa</strong><small>Tus efectos se comparten con el Máster</small></span></div>}
                        <button type="button" onClick={() => update({ concentration: !modal.data.concentration })} className={modal.data.concentration ? 'is-active is-concentration' : ''}><i aria-hidden="true" /><span><strong>Requiere concentración</strong><small>Impide mantener otro efecto concentrado</small></span></button>
                    </div><label className="online-combat-field is-wide"><span>{modal.data.visibleToPlayers || !canManageEnemies ? 'Nota pública' : 'Nota privada del Máster'} <em>opcional</em></span><textarea value={(modal.data.visibleToPlayers || !canManageEnemies) ? (modal.data.notesPublic || '') : (modal.data.notesPrivate || '')} onChange={event => update((modal.data.visibleToPlayers || !canManageEnemies) ? { notesPublic: event.target.value } : { notesPrivate: event.target.value })} placeholder="Describe el recordatorio importante del efecto…" /></label></section>
                </div>
                <footer className="online-combat-modal__footer"><p>{canSave ? <><span aria-hidden="true">✦</span> {modal.data.targetType === 'global' ? 'Efecto global' : `Objetivo: ${selectedTarget?.name}`}</> : 'Completa el nombre y el objetivo para continuar.'}</p><button type="button" onClick={onClose}>Cancelar</button><button type="button" disabled={!canSave} onClick={onSave} className="is-primary">{modal.effectId ? 'Guardar cambios' : 'Añadir efecto'}</button></footer>
            </article>
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
    const modes = [
        ['damage', '↓', 'Daño', 'Resta PV y absorbe vida temporal'],
        ['healing', '+', 'Curación', 'Recupera sin superar el máximo'],
        ['temp', '◇', 'Vida temporal', 'Sustituye el valor temporal'],
        ['exact', '=', 'Valor exacto', 'Fija directamente los PV actuales'],
        ...(allowMax ? [['max', '◆', 'Vida máxima', 'Cambia el límite de PV']] : [])
    ];
    const currentPercent = current.maxHp > 0 ? Math.min(100, current.currentHp / current.maxHp * 100) : 0;
    const previewPercent = preview.maxHp > 0 ? Math.min(100, preview.currentHp / preview.maxHp * 100) : 0;
    const suggestedAmounts = [...new Set([
        1,
        5,
        10,
        modal.mode === 'healing' ? Math.max(0, current.maxHp - current.currentHp) : modal.mode === 'exact' ? current.maxHp : modal.mode === 'max' ? current.maxHp : null
    ].filter(value => Number.isFinite(value) && value > 0))];
    const setAmount = value => onChange(previous => ({ ...previous, amount: String(Math.max(0, Number(value) || 0)) }));

    return (
        <div className={`online-combat-modal-overlay is-health is-${accent}`} onMouseDown={event => { if (event.target === event.currentTarget) onClose?.(); }}>
            <article className="online-combat-modal health-editor" role="dialog" aria-modal="true" aria-labelledby="health-editor-title">
                <header className="online-combat-modal__header"><span aria-hidden="true">♥</span><div><small>Control de puntos de golpe</small><h3 id="health-editor-title">Modificar vida</h3><p>{entity.name || 'Personaje'}</p></div><button type="button" onClick={onClose} aria-label="Cerrar">×</button></header>
                <div className="health-editor__current"><div><small>Estado actual</small><strong>{current.currentHp}<em>/ {current.maxHp} PV</em></strong></div><div><small>Temporales</small><strong className="is-temp">{current.tempHp}</strong></div><span><i style={{ width: `${currentPercent}%` }} /></span></div>
                <div className="online-combat-modal__body">
                    <section className="health-editor__modes"><header><small>Tipo de cambio</small><strong>¿Qué ha ocurrido?</strong></header><div>{modes.map(([mode, icon, label, help]) => <button key={mode} type="button" onClick={() => onChange(previous => ({ ...previous, mode }))} className={modal.mode === mode ? 'is-selected' : ''}><span aria-hidden="true">{icon}</span><div><strong>{label}</strong><small>{help}</small></div><b aria-hidden="true">{modal.mode === mode ? '◆' : ''}</b></button>)}</div></section>
                    <section className="health-editor__amount"><header><div><small>Cantidad</small><strong>Introduce el valor</strong></div><div className="health-editor__quick">{suggestedAmounts.map(value => <button key={value} type="button" onClick={() => setAmount(value)}>{value}{modal.mode === 'healing' && value === current.maxHp - current.currentHp ? ' (todo)' : ''}</button>)}</div></header><div className="health-editor__stepper"><button type="button" onClick={() => setAmount(amount - 1)} aria-label="Reducir cantidad">−</button><input autoFocus type="number" inputMode="numeric" min="0" value={modal.amount} onChange={event => onChange(previous => ({ ...previous, amount: event.target.value }))} aria-label="Cantidad de puntos de golpe" /><button type="button" onClick={() => setAmount(amount + 1)} aria-label="Aumentar cantidad">+</button></div></section>
                    <section className="health-editor__preview"><header><small>Resultado antes de confirmar</small><strong>{current.currentHp === preview.currentHp && current.tempHp === preview.tempHp && current.maxHp === preview.maxHp ? 'Sin cambios' : 'Vista previa'}</strong></header><div className="health-editor__comparison"><span><small>Antes</small><strong>{current.currentHp}/{current.maxHp}</strong>{current.tempHp > 0 && <em>+{current.tempHp} temporal</em>}</span><b aria-hidden="true">→</b><span className="is-result"><small>Después</small><strong>{preview.currentHp}/{preview.maxHp}</strong>{preview.tempHp > 0 && <em>+{preview.tempHp} temporal</em>}</span></div><div className="health-editor__preview-bar"><i style={{ width: `${previewPercent}%` }} /></div></section>
                </div>
                <footer className="online-combat-modal__footer"><p><span aria-hidden="true">♥</span> El cambio se sincronizará con la ficha compartida.</p><button type="button" onClick={onClose}>Cancelar</button><button type="button" disabled={busy} onClick={onConfirm} className="is-primary">{busy ? 'Actualizando…' : 'Confirmar cambio'}</button></footer>
            </article>
        </div>
    );
};

window.DndOnlineComponents = { EnemyModal, OnlineConditionModal, OnlineEffectModal, OnlineHpModal, OnlineCombatantAvatar, OnlinePartyOverview, OnlinePlayerSheetModal, OnlineRoomModuleSelector };
