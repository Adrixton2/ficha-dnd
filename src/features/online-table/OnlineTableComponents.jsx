/* Presentation-only components for Mesa Online. */
const { isValidPortraitDataUrl } = window.DndAppUtils;

const OnlineCombatantAvatar = ({ combatant, className = '', onAvatarPreview }) => {
    const name = combatant?.name || 'Combatiente';
    const initial = name.trim().slice(0, 1).toUpperCase() || '?';
    const safeAvatarPath = typeof combatant?.avatarPath === 'string' && /^(?:\.\/)?assets\/[a-z0-9_./-]+$/i.test(combatant.avatarPath) ? combatant.avatarPath : '';
    const avatarSource = isValidPortraitDataUrl(combatant?.avatarDataUrl) ? combatant.avatarDataUrl : safeAvatarPath;
    const hasAvatar = Boolean(avatarSource);
    const isDetailAvatar = className.split(/\s+/).includes('h-20');

    if (isValidPortraitDataUrl(avatarSource) && isDetailAvatar) {
        return (
            <button
                type="button"
                onClick={() => onAvatarPreview?.({ name, src: avatarSource })}
                className={`online-combatant-avatar overflow-hidden object-cover cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300 ${className}`}
                aria-label={`Ampliar avatar de ${name}`}
            >
                <img src={avatarSource} alt="" className="h-full w-full object-cover" />
            </button>
        );
    }

    return hasAvatar
        ? <img src={avatarSource} alt="" className={`online-combatant-avatar object-cover ${className}`} />
        : <span aria-hidden="true" className={`online-combatant-avatar online-combatant-avatar--fallback ${className}`}>{initial}</span>;
};

const OnlinePartyOverview = ({ participants = [], members = [], sheets = [], onOpenSheet, onAvatarPreview, onKickMember }) => {
    const sheetsByOwner = new Map(sheets.map(document => [document.ownerUid || document.id, {
        document,
        snapshot: window.DndOnlineTableUtils.parseOnlinePlayerSheetSnapshot(document.snapshotJson)
    }]));
    const playerMembers = members.filter(member => member.role !== 'master' || participants.some(participant => participant.ownerUid === member.uid));
    const formatSyncTime = value => {
        const timestamp = Number(value?.toMillis?.() || value?.seconds * 1000 || 0);
        if (!timestamp) return 'Sin sincronizar';
        const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
        if (minutes < 2) return 'Sincronizada ahora';
        if (minutes < 60) return `Sincronizada hace ${minutes} min`;
        const hours = Math.round(minutes / 60);
        if (hours < 24) return `Sincronizada hace ${hours} h`;
        return `Sincronizada el ${new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(timestamp))}`;
    };

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
                    const connected = Boolean(member.active !== false && participant && participant.connected !== false);
                    const syncLabel = formatSyncTime(sheetEntry?.document?.updatedAt || participant?.updatedAt);
                    return <article key={member.id} className={`online-party-card ${connected ? '' : 'is-offline'}`}>
                        <div className="online-party-card__identity">
                            {participant ? <OnlineCombatantAvatar combatant={participant} className="h-12 w-12 text-sm" onAvatarPreview={onAvatarPreview} /> : <span className="online-party-card__empty-avatar">?</span>}
                            <div><strong>{participant?.name || 'Personaje sin compartir'}</strong><span>{snapshot?.identity?.className || participant?.className || 'Sin clase'} · Nivel {snapshot?.identity?.level || participant?.level || '—'}</span><em>Jugador: {member.displayName || 'Sin identificar'}</em><small className="online-party-card__sync">{connected ? 'Conectado ahora' : `Ausente · ${syncLabel}`}</small></div>
                            <i className={connected ? 'is-connected' : ''} title={connected ? 'Conectado' : 'Desconectado'} />
                        </div>
                        {participant ? <>
                            <div className="online-party-card__vitals"><span><small>PV</small><b>{hp.currentHp}/{hp.maxHp}</b></span><span><small>CA</small><b>{participant.armorClass ?? snapshot?.combat?.armorClass ?? '—'}</b></span><span><small>Pasiva</small><b>{snapshot?.passives?.perception ?? '—'}</b></span><span><small>Iniciativa</small><b>{participant.initiative ?? '—'}</b></span></div>
                            <div className="online-party-card__hp"><span style={{ width: `${hpPercent}%` }} /></div>
                            <div className="online-party-card__status">
                                {snapshot?.combat?.concentration && <span className="is-concentration">Concentración: {snapshot.combat.concentration}</span>}
                                {snapshot?.companions?.length > 0 && <span className="is-companion">✦ {snapshot.companions.length} compañero{snapshot.companions.length === 1 ? '' : 's'} · {snapshot.companions.filter(companion => companion.participates).length} en combate</span>}
                                {conditions.slice(0, 3).map(condition => <span key={condition.id} className="is-condition">{condition.name}</span>)}
                                {!snapshot?.combat?.concentration && !snapshot?.companions?.length && !conditions.length && <span>Sin estados activos</span>}
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

const OnlineGroupRoster = ({ participants = [], members = [], compact = false, onOpenGroup }) => {
    const playerMembers = members.filter(member => member.role !== 'master');
    const visibleMembers = compact ? playerMembers.slice(0, 4) : playerMembers;
    return <section className={`online-group-roster ${compact ? 'is-compact' : ''}`}>
        <header><div><small>{compact ? 'Compañeros de aventura' : 'Miembros de la campaña'}</small><h4>{compact ? 'El grupo de hoy' : 'Grupo de aventureros'}</h4><p>{compact ? 'Consulta de un vistazo quién está disponible.' : 'Información compartida con toda la mesa, sin mostrar datos privados de las fichas.'}</p></div><span>{playerMembers.length} {playerMembers.length === 1 ? 'jugador' : 'jugadores'}</span></header>
        <div className="online-group-roster__grid">{visibleMembers.map(member => {
            const participant = participants.find(item => item.ownerUid === member.uid && item.type !== 'companion');
            const connected = Boolean(participant && participant.connected !== false);
            const hp = window.DndOnlineTableUtils.getHpValues(participant);
            const hpPercent = hp.maxHp > 0 ? Math.min(100, hp.currentHp / hp.maxHp * 100) : 0;
            const conditions = window.DndOnlineTableUtils.normalizeOnlineConditions(participant?.conditions);
            return <article key={member.id} className={connected ? 'is-online' : 'is-away'}>
                <div className="online-group-roster__identity">{participant ? <OnlineCombatantAvatar combatant={participant} className="h-12 w-12 text-sm"/> : <span className="online-group-roster__empty">?</span>}<div><small>{connected ? 'Conectado' : participant ? 'Ausente' : 'Sin personaje'}</small><strong>{participant?.name || member.displayName || 'Jugador'}</strong><p>{participant ? `${participant.className || 'Sin clase'} · Nivel ${participant.level || '—'}` : `Jugador: ${member.displayName || 'Sin identificar'}`}</p></div><i/></div>
                {!compact && participant && <><div className="online-group-roster__vitals"><span><small>PV</small><strong>{hp.currentHp}/{hp.maxHp}</strong></span><span><small>CA</small><strong>{participant.armorClass ?? '—'}</strong></span><span><small>Iniciativa</small><strong>{participant.initiative ?? '—'}</strong></span><span><small>Estados</small><strong>{conditions.length || '—'}</strong></span></div><div className="online-group-roster__hp"><span style={{ width: `${hpPercent}%` }}/></div></>}
            </article>;
        })}{!playerMembers.length && <div className="online-group-roster__empty-state"><span aria-hidden="true">◇</span><strong>La compañía aún está vacía</strong><p>Cuando entren jugadores aparecerán aquí con sus personajes.</p></div>}</div>
        {compact && playerMembers.length > 0 && <button type="button" className="online-group-roster__open" onClick={onOpenGroup}>Ver grupo completo <span aria-hidden="true">→</span></button>}
    </section>;
};

const OnlineCampaignLobby = ({ currentRoom, roomData, isMaster, members = [], participants = [], sheets = [], enemies = [], ownParticipant, sheetSyncStatus, onSelect, onInvite, onShareCharacter }) => {
    const playerMembers = members.filter(member => member.role !== 'master');
    const playerParticipants = participants.filter(participant => participant.type !== 'companion' && playerMembers.some(member => member.uid === participant.ownerUid));
    const connectedPlayers = playerParticipants.filter(participant => participant.connected !== false).length;
    const absentPlayers = playerParticipants.filter(participant => participant.connected === false).length;
    const sharedSheets = isMaster
        ? playerMembers.filter(member => sheets.some(sheet => (sheet.ownerUid || sheet.id) === member.uid)).length
        : playerParticipants.length;
    const readyInitiatives = playerParticipants.filter(participant => participant.initiative !== null && participant.initiative !== undefined && participant.initiative !== '').length;
    const campaignStatus = roomData?.status === 'paused' ? 'Encuentro pausado' : roomData?.status === 'active' ? `Ronda ${roomData.round || 1}` : 'En el campamento';
    const attentionCount = isMaster
        ? Math.max(0, playerMembers.length - sharedSheets) + absentPlayers
        : (ownParticipant ? 0 : 1);
    return <section className={`online-lobby-home ${isMaster ? 'is-master' : 'is-player'}`}>
        <header className="online-lobby-home__hero"><div className="online-lobby-home__sigil" aria-hidden="true">{isMaster ? '♜' : '✦'}<i/></div><div className="online-lobby-home__welcome"><small>{isMaster ? 'Centro de dirección' : 'Campamento del aventurero'}</small><h4>{isMaster ? 'La mesa está preparada' : `Bienvenido${ownParticipant?.name ? `, ${ownParticipant.name}` : ''}`}</h4><p>{isMaster ? 'Consulta al grupo, prepara el encuentro o invita a alguien sin salir de esta portada.' : 'Revisa a tus compañeros, confirma tu personaje y entra al asistente de combate cuando lo necesites.'}</p><div><span className="is-online"><i/>Campaña conectada</span><span>{campaignStatus}</span>{absentPlayers > 0 && <span className="is-warning">{absentPlayers} ausente{absentPlayers === 1 ? '' : 's'}</span>}</div></div><div className="online-lobby-home__primary">{isMaster ? <button type="button" onClick={onInvite}><span aria-hidden="true">＋</span><span><small>Acción rápida</small><strong>Invitar jugadores</strong></span></button> : <button type="button" onClick={() => ownParticipant ? onSelect?.('sheets') : onShareCharacter?.()}><span aria-hidden="true">{ownParticipant ? '✓' : '＋'}</span><span><small>{ownParticipant ? 'Ficha sincronizada' : 'Paso necesario'}</small><strong>{ownParticipant ? 'Ver mi personaje' : 'Compartir personaje'}</strong></span></button>}</div></header>
        <div className="online-lobby-home__metrics"><span><small>Jugadores</small><strong>{connectedPlayers}<em>/{playerMembers.length}</em></strong><p>{connectedPlayers === playerMembers.length && playerMembers.length ? 'Todo el grupo conectado' : `${absentPlayers} ausente${absentPlayers === 1 ? '' : 's'}`}</p></span><span><small>Fichas compartidas</small><strong>{sharedSheets}<em>/{playerMembers.length}</em></strong><p>{sharedSheets === playerMembers.length && playerMembers.length ? 'Información disponible' : 'Pendientes de compartir'}</p></span><span><small>Iniciativas</small><strong>{readyInitiatives}<em>/{playerParticipants.length}</em></strong><p>{readyInitiatives === playerParticipants.length && playerParticipants.length ? 'Grupo preparado' : 'Completar en Combate'}</p></span><span><small>Oposición</small><strong>{enemies.length}</strong><p>{enemies.length ? 'Enemigos preparados' : 'Encuentro sin enemigos'}</p></span></div>
        <div className="online-lobby-home__modules"><button type="button" onClick={() => onSelect?.('sheets')} className="is-group"><span className="online-lobby-home__module-icon" aria-hidden="true">◇</span><span><small>Compañía</small><strong>Grupo y personajes</strong><em>{isMaster ? 'Fichas, recursos, mochilas y estado del grupo.' : 'Compañeros, presencia y tu personaje compartido.'}</em></span><b><span className="online-lobby-home__avatar-stack">{playerParticipants.slice(0, 3).map(participant => <OnlineCombatantAvatar key={participant.id} combatant={participant} className="h-7 w-7 text-[9px]"/>)}{playerParticipants.length > 3 && <i>+{playerParticipants.length - 3}</i>}</span>Entrar →</b></button><button type="button" onClick={() => onSelect?.('combat')} className="is-combat"><span className="online-lobby-home__module-icon" aria-hidden="true">⚔</span><span><small>Asistente de turnos</small><strong>Combate</strong><em>Prepara participantes, enemigos e iniciativa.</em></span><b>{enemies.length ? `${enemies.length} enemigos` : 'Sin preparar'} <i>→</i></b></button><button type="button" onClick={() => onSelect?.('room')} className="is-campaign"><span className="online-lobby-home__module-icon" aria-hidden="true">◈</span><span><small>Acceso y administración</small><strong>Campaña</strong><em>Código, invitaciones y opciones de la mesa.</em></span><b>{currentRoom?.code?.slice(-4) || '····'} <i>→</i></b></button></div>
        {attentionCount > 0 && <aside className="online-lobby-home__attention"><span aria-hidden="true">!</span><div><small>Requiere atención</small><strong>{isMaster ? `${attentionCount} ${attentionCount === 1 ? 'detalle pendiente' : 'detalles pendientes'} antes de jugar` : 'Todavía no has compartido un personaje'}</strong><p>{isMaster ? 'En Grupo puedes comprobar fichas sin compartir y jugadores ausentes.' : 'El Máster necesita una copia sincronizada para consultar tu personaje y añadirlo al combate.'}</p></div><button type="button" onClick={() => isMaster ? onSelect?.('sheets') : onShareCharacter?.()}>{isMaster ? 'Revisar grupo' : 'Elegir personaje'}</button></aside>}
        <OnlineGroupRoster participants={participants} members={members} compact onOpenGroup={() => onSelect?.('sheets')}/>
    </section>;
};

const OnlineRoomModuleSelector = ({ active, onSelect, isMaster, encounterActive }) => {
    const modules = [
        { id: 'home', icon: '✦', eyebrow: 'Resumen de campaña', title: 'Inicio', description: 'Estado del grupo y accesos principales.' },
        { id: 'sheets', icon: '◇', eyebrow: isMaster ? 'Información del grupo' : 'Compañeros de equipo', title: 'Grupo', description: isMaster ? 'Fichas, recursos, conjuros y mochilas.' : 'Tu personaje compartido y el resto del grupo.' },
        { id: 'combat', icon: '⚔', eyebrow: encounterActive ? 'Encuentro en curso' : 'Preparación táctica', title: 'Combate', description: 'Iniciativas, enemigos, turnos, condiciones y efectos.' },
        { id: 'room', icon: '◈', eyebrow: 'Acceso y opciones', title: 'Campaña', description: 'Invitaciones, código y administración.' }
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
    const companions = Array.isArray(snapshot.companions) ? snapshot.companions : [];
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
                    {[['summary', 'Resumen'], ['combat', 'Combate'], ['companions', `Compañeros${companions.length ? ` (${companions.length})` : ''}`], ['spells', 'Conjuros'], ['inventory', 'Mochila']].map(([id, label]) => <button key={id} type="button" onClick={() => setTab(id)} className={tab === id ? 'is-active' : ''}>{label}</button>)}
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
                            <Section title="Estado actual"><div className="online-sheet-status-list"><span>Inspiración <b>{snapshot.combat.inspiration ? 'Sí' : 'No'}</b></span><span>Guía <b>{snapshot.combat.guidance ? 'Activa' : 'No'}</b></span><span>Concentración <b>{snapshot.combat.concentration || 'Ninguna'}</b></span><span>Salvaciones de muerte <b>{snapshot.combat.deathSaves.successes} éxitos · {snapshot.combat.deathSaves.failures} fallos</b></span>{conditions.map(condition => <span key={condition.id} className="is-condition">{condition.name}</span>)}</div></Section>
                            <Section title="Armaduras" empty={!snapshot.armors.length ? 'No hay armaduras registradas.' : ''}><div className="online-sheet-list">{snapshot.armors.map((armor, index) => <div className="online-sheet-armor" key={`${armor.name}-${index}`}><strong>{armor.name}</strong><span>CA {armor.armorClass || '—'} · {armor.type || 'Armadura'}</span>{armor.equipped && <b>Equipada</b>}</div>)}</div></Section>
                        </aside>
                    </div>}
                    {tab === 'companions' && <div className="online-sheet-companions">
                        <header><div><small>Vínculos compartidos en tiempo real</small><h5>Compañeros de {snapshot.identity.name}</h5></div><span>{companions.filter(companion => companion.participates).length} en combate</span></header>
                        {companions.map(companion => <article key={companion.id || companion.name} className={companion.participates ? 'is-participating' : ''}>
                            <div className="online-sheet-companion-hero"><span>{companion.avatarPath ? <img src={companion.avatarPath} alt=""/> : String(companion.name).slice(0,1)}</span><div><small>{companion.category || 'Compañero'} · {companion.sourceLabel || 'Ficha personalizada'}</small><strong>{companion.name}</strong><p>{companion.details?.subtitle || companion.details?.type || 'Aliado vinculado'}</p></div><b>{companion.participates ? 'Participa' : 'Fuera del combate'}</b></div>
                            <div className="online-sheet-companion-vitals"><span><small>PV</small><strong>{companion.currentHp}/{companion.maxHp}</strong>{companion.tempHp > 0 && <em>+{companion.tempHp}</em>}</span><span><small>CA</small><strong>{companion.armorClass ?? '—'}</strong></span><span><small>Movimiento</small><strong>{companion.details?.speedText || '—'}</strong></span><span><small>Turno</small><strong>{companion.initiativeMode === 'own' ? `Propio${companion.initiative !== null ? ` · ${companion.initiative}` : ''}` : companion.initiativeMode === 'shared' ? 'Comparte iniciativa' : 'Después del PJ'}</strong></span></div>
                            {companion.conditions?.length > 0 && <div className="online-sheet-companion-conditions">{companion.conditions.map(condition => <span key={condition}>{condition}</span>)}</div>}
                            <details><summary>Consultar ficha de criatura</summary><div className="online-sheet-companion-details"><div className="online-sheet-companion-abilities">{Object.entries({FUE:companion.details?.abilities?.str,DES:companion.details?.abilities?.dex,CON:companion.details?.abilities?.con,INT:companion.details?.abilities?.int,SAB:companion.details?.abilities?.wis,CAR:companion.details?.abilities?.cha}).map(([label,value]) => <span key={label}><small>{label}</small><strong>{value ?? '—'}</strong></span>)}</div>{[['Sentidos',companion.details?.senses],['Idiomas',companion.details?.languages],['Habilidades',companion.details?.skills],['Salvaciones',companion.details?.saves],['Resistencias',companion.details?.resistances],['Inmunidades',companion.details?.immunities]].filter(([,value]) => value).map(([label,value]) => <p key={label}><strong>{label}:</strong> {value}</p>)}{[['Rasgos',companion.details?.traits],['Acciones',companion.details?.actions],['Acciones adicionales',companion.details?.bonusActions],['Reacciones',companion.details?.reactions]].map(([title,entries]) => Array.isArray(entries) && entries.length > 0 && <section key={title}><h6>{title}</h6>{entries.map((entry,index) => <div key={`${entry.name}-${index}`}><strong>{entry.name}</strong>{entry.description && <p>{entry.description}</p>}</div>)}</section>)}</div></details>
                            {companion.notes && <p className="online-sheet-companion-notes"><strong>Nota:</strong> {companion.notes}</p>}
                        </article>)}
                        {!companions.length && <p className="online-sheet-empty">Este personaje no tiene compañeros vinculados.</p>}
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

const OnlineTacticalDetailPanel = ({ selected, isEnemy, privateData, hp, hpPercent = 0, canSeeHp, canEdit, conditions = [], effects = [], currentUid, onAvatarPreview, onEditEnemy, onDeleteEnemy, onOpenHealth, onQuickHp, onDefeat, onAddCondition, onRemoveCondition, onAddEffect, onAdjustEffect, onFinishEffect, canManageEffect }) => {
    if (!selected) return <aside className="tactical-detail-panel online-tactical-detail is-empty"><span aria-hidden="true">◇</span><strong>Selecciona un combatiente</strong><p>Elige a alguien en el orden para consultar su estado y las acciones disponibles.</p></aside>;
    const armorClass = isEnemy ? privateData?.armorClass : selected.armorClass;
    const isCompanion = selected.type === 'companion';
    const companionLabels = { familiar: 'Familiar', animal: 'Compañero animal', construct: 'Constructo', mount: 'Montura', summon: 'Invocación', other: 'Compañero' };
    const typeLabel = isEnemy ? 'Enemigo' : isCompanion ? `${companionLabels[selected.category] || 'Compañero'}${selected.ownerUid === currentUid ? ' bajo tu control' : ' del grupo'}` : selected.ownerUid === currentUid ? 'Tu personaje' : 'Personaje del grupo';
    const hpTone = hp?.maxHp > 0 && hp.currentHp / hp.maxHp <= .25 ? 'is-critical' : hp?.maxHp > 0 && hp.currentHp / hp.maxHp <= .5 ? 'is-wounded' : '';

    return <aside className={`tactical-detail-panel online-tactical-detail ${isEnemy ? 'is-enemy' : isCompanion ? 'is-companion' : 'is-player'} ${hpTone}`} aria-label={`Detalle de ${selected.name || 'combatiente'}`}>
        <header className="online-tactical-detail__hero">
            <OnlineCombatantAvatar combatant={selected} className="h-20 w-20 text-2xl" onAvatarPreview={onAvatarPreview} />
            <div><small>{typeLabel}</small><h4>{selected.name || 'Combatiente'}</h4><p><span>Iniciativa {selected.initiative ?? '—'}</span><span>{isEnemy ? selected.visibleState || 'Estado oculto' : selected.connected === false ? 'Desconectado' : 'Conectado'}</span></p></div>
            {isEnemy && canEdit && <div className="online-tactical-detail__enemy-actions"><button type="button" onClick={onEditEnemy}>Editar</button><button type="button" onClick={onDeleteEnemy} className="is-danger">Eliminar</button></div>}
        </header>
        <div className="online-tactical-detail__body">
            <section className="online-tactical-detail__vitals">
                <header><div><small>Estado de combate</small><strong>Resumen táctico</strong></div><span className={`online-tactical-detail__health-state ${hpTone}`}>{canSeeHp && hp ? hpPercent <= 0 ? 'Sin puntos de golpe' : hpPercent <= 25 ? 'Estado crítico' : hpPercent <= 50 ? 'Herido' : 'Estable' : 'Vida oculta'}</span></header>
                <div className="online-tactical-detail__health-display">
                    <div className="online-tactical-detail__health-orb" style={{ '--health-progress': `${Math.max(0, Math.min(100, hpPercent)) * 3.6}deg` }}><span><small>PV</small><strong>{canSeeHp && hp ? hp.currentHp : '—'}</strong><em>{canSeeHp && hp ? `/ ${hp.maxHp}` : 'ocultos'}</em></span></div>
                    <div className="online-tactical-detail__health-summary"><small>Reserva de vitalidad</small><strong>{canSeeHp && hp ? `${hp.currentHp} de ${hp.maxHp} puntos de golpe` : 'El Máster mantiene esta información oculta'}</strong><div className="online-tactical-detail__hp" role="progressbar" aria-label={`Puntos de golpe de ${selected.name}`} aria-valuemin="0" aria-valuemax={canSeeHp && hp ? hp.maxHp : undefined} aria-valuenow={canSeeHp && hp ? hp.currentHp : undefined}><i style={{ width: `${hpPercent}%` }} /></div><p><span>{canSeeHp && hp && hp.tempHp > 0 ? `+${hp.tempHp} PV temporales` : 'Sin PV temporales'}</span><b>{canSeeHp && hp ? `${Math.round(hpPercent)}%` : '—'}</b></p></div>
                </div>
                <div className="online-tactical-detail__metrics is-compact"><span><small>Clase de armadura</small><strong>{armorClass ?? '—'}</strong><em>CA</em></span><span><small>Orden de turno</small><strong>{selected.initiative ?? '—'}</strong><em>Iniciativa</em></span></div>
                {canEdit && canSeeHp && hp && <div className="online-tactical-detail__health-controls"><button type="button" onClick={() => onQuickHp?.(-1)} className="is-damage" aria-label={`Restar un punto de golpe a ${selected.name}`}><span aria-hidden="true">−</span><strong>Restar 1</strong><small>Daño rápido</small></button><button type="button" onClick={onOpenHealth} className="is-primary"><span aria-hidden="true">♥</span><strong>Modificar PV</strong><small>Abrir control completo</small></button><button type="button" onClick={() => onQuickHp?.(1)} className="is-healing" aria-label={`Sumar un punto de golpe a ${selected.name}`}><span aria-hidden="true">+</span><strong>Sumar 1</strong><small>Curación rápida</small></button>{isEnemy && <button type="button" onClick={onDefeat} className="is-defeat"><span aria-hidden="true">◇</span><strong>Marcar como derrotado</strong></button>}</div>}
            </section>
            {isEnemy && canEdit && privateData?.notes && <section className="online-tactical-detail__notes"><header><span aria-hidden="true">◈</span><strong>Notas privadas del Máster</strong></header><p>{privateData.notes}</p></section>}
            <div className="online-tactical-detail__status-grid">
                <section className="online-tactical-detail__conditions"><header><div><small>Estados aplicados</small><strong>Condiciones <b>{conditions.length}</b></strong></div>{canEdit && <button type="button" onClick={onAddCondition}>+  Añadir</button>}</header><div>{conditions.map(condition => <span key={condition.id}><i aria-hidden="true" />{condition.name}{canEdit && <button type="button" onClick={() => onRemoveCondition?.(condition.id)} aria-label={`Quitar ${condition.name}`}>×</button>}</span>)}{!conditions.length && <p><span aria-hidden="true">✓</span> Sin condiciones activas</p>}</div></section>
                <section className="online-tactical-detail__effects"><header><div><small>Duraciones y recordatorios</small><strong>Efectos <b>{effects.length}</b></strong></div>{canEdit && <button type="button" onClick={onAddEffect}>+  Añadir</button>}</header><div>{effects.map(effect => { const manageable = canManageEffect?.(effect); return <article key={effect.id}><div><strong>{effect.name}</strong><span>{effect.remaining === null ? 'Duración manual' : `${effect.remaining} ${effect.durationType}`}{(effect.requiresConcentration || effect.concentration) ? ' · Concentración' : ''}</span></div>{manageable && <nav aria-label={`Controles de ${effect.name}`}>{effect.remaining !== null && <><button type="button" onClick={() => onAdjustEffect?.(effect, -1)} aria-label="Reducir duración">−</button><button type="button" onClick={() => onAdjustEffect?.(effect, 1)} aria-label="Aumentar duración">+</button></>}<button type="button" onClick={() => onFinishEffect?.(effect)} className="is-finish">Finalizar</button></nav>}</article>})}{!effects.length && <p><span aria-hidden="true">◇</span> Sin efectos activos</p>}</div></section>
            </div>
        </div>
    </aside>;
};

window.DndOnlineComponents = { EnemyModal, OnlineCampaignLobby, OnlineConditionModal, OnlineEffectModal, OnlineGroupRoster, OnlineHpModal, OnlineCombatantAvatar, OnlinePartyOverview, OnlinePlayerSheetModal, OnlineRoomModuleSelector, OnlineTacticalDetailPanel };
