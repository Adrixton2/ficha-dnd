(() => {
  /* Presentation-only components for Mesa Online. */
  const {
    isValidPortraitDataUrl
  } = window.DndAppUtils;
  const OnlineCombatantAvatar = ({
    combatant,
    className = '',
    onAvatarPreview
  }) => {
    const name = combatant?.name || 'Combatiente';
    const initial = name.trim().slice(0, 1).toUpperCase() || '?';
    const safeAvatarPath = typeof combatant?.avatarPath === 'string' && /^(?:\.\/)?assets\/[a-z0-9_./-]+$/i.test(combatant.avatarPath) ? combatant.avatarPath : '';
    const avatarSource = isValidPortraitDataUrl(combatant?.avatarDataUrl) ? combatant.avatarDataUrl : safeAvatarPath;
    const hasAvatar = Boolean(avatarSource);
    const isDetailAvatar = className.split(/\s+/).includes('h-20');
    if (isValidPortraitDataUrl(avatarSource) && isDetailAvatar) {
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onAvatarPreview?.({
          name,
          src: avatarSource
        }),
        className: `online-combatant-avatar overflow-hidden object-cover cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300 ${className}`,
        "aria-label": `Ampliar avatar de ${name}`
      }, /*#__PURE__*/React.createElement("img", {
        src: avatarSource,
        alt: "",
        className: "h-full w-full object-cover"
      }));
    }
    return hasAvatar ? /*#__PURE__*/React.createElement("img", {
      src: avatarSource,
      alt: "",
      className: `online-combatant-avatar object-cover ${className}`
    }) : /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      className: `online-combatant-avatar online-combatant-avatar--fallback ${className}`
    }, initial);
  };
  const OnlinePartyOverview = ({
    participants = [],
    members = [],
    sheets = [],
    onOpenSheet,
    onAvatarPreview,
    onKickMember
  }) => {
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
      return `Sincronizada el ${new Intl.DateTimeFormat('es', {
        day: 'numeric',
        month: 'short'
      }).format(new Date(timestamp))}`;
    };
    return /*#__PURE__*/React.createElement("section", {
      className: "online-party-hub",
      "aria-labelledby": "online-party-title"
    }, /*#__PURE__*/React.createElement("header", {
      className: "online-party-hub__header"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Vista del Máster"), /*#__PURE__*/React.createElement("h4", {
      id: "online-party-title"
    }, "Grupo de aventureros"), /*#__PURE__*/React.createElement("p", null, "Consulta lo esencial de cada ficha sin abandonar la mesa.")), /*#__PURE__*/React.createElement("span", null, participants.length, " ", participants.length === 1 ? 'ficha' : 'fichas')), /*#__PURE__*/React.createElement("div", {
      className: "online-party-grid"
    }, playerMembers.map(member => {
      const participant = participants.find(item => item.ownerUid === member.uid);
      const sheetEntry = sheetsByOwner.get(member.uid);
      const snapshot = sheetEntry?.snapshot;
      const hp = window.DndOnlineTableUtils.getHpValues(participant || snapshot?.combat);
      const hpPercent = hp.maxHp > 0 ? Math.min(100, hp.currentHp / hp.maxHp * 100) : 0;
      const conditions = window.DndOnlineTableUtils.normalizeOnlineConditions(participant?.conditions);
      const presenceStatus = participant?.presenceStatus || 'offline';
      const presenceLabel = participant?.presenceLabel || 'Desconectado';
      const connected = presenceStatus === 'online';
      const syncLabel = formatSyncTime(sheetEntry?.document?.updatedAt || participant?.updatedAt);
      return /*#__PURE__*/React.createElement("article", {
        key: member.id,
        className: `online-party-card ${presenceStatus === 'away' ? 'is-away' : connected ? '' : 'is-offline'}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "online-party-card__identity"
      }, participant ? /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
        combatant: participant,
        className: "h-12 w-12 text-sm",
        onAvatarPreview: onAvatarPreview
      }) : /*#__PURE__*/React.createElement("span", {
        className: "online-party-card__empty-avatar"
      }, "?"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, participant?.name || 'Personaje sin compartir'), /*#__PURE__*/React.createElement("span", null, snapshot?.identity?.className || participant?.className || 'Sin clase', " · Nivel ", snapshot?.identity?.level || participant?.level || '—'), /*#__PURE__*/React.createElement("em", null, "Jugador: ", member.displayName || 'Sin identificar'), /*#__PURE__*/React.createElement("small", {
        className: "online-party-card__sync"
      }, presenceLabel, " · ", syncLabel)), /*#__PURE__*/React.createElement("i", {
        className: presenceStatus === 'online' ? 'is-connected' : presenceStatus === 'away' ? 'is-away' : '',
        title: presenceLabel
      })), participant ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "online-party-card__vitals"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV"), /*#__PURE__*/React.createElement("b", null, hp.currentHp, "/", hp.maxHp)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "CA"), /*#__PURE__*/React.createElement("b", null, participant.armorClass ?? snapshot?.combat?.armorClass ?? '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Pasiva"), /*#__PURE__*/React.createElement("b", null, snapshot?.passives?.perception ?? '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Iniciativa"), /*#__PURE__*/React.createElement("b", null, participant.initiative ?? '—'))), /*#__PURE__*/React.createElement("div", {
        className: "online-party-card__hp"
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: `${hpPercent}%`
        }
      })), /*#__PURE__*/React.createElement("div", {
        className: "online-party-card__status"
      }, snapshot?.combat?.concentration && /*#__PURE__*/React.createElement("span", {
        className: "is-concentration"
      }, "Concentración: ", snapshot.combat.concentration), snapshot?.companions?.length > 0 && /*#__PURE__*/React.createElement("span", {
        className: "is-companion"
      }, "✦ ", snapshot.companions.length, " compañero", snapshot.companions.length === 1 ? '' : 's', " · ", snapshot.companions.filter(companion => companion.participates).length, " en combate"), conditions.slice(0, 3).map(condition => /*#__PURE__*/React.createElement("span", {
        key: condition.id,
        className: "is-condition"
      }, condition.name)), !snapshot?.combat?.concentration && !snapshot?.companions?.length && !conditions.length && /*#__PURE__*/React.createElement("span", null, "Sin estados activos")), /*#__PURE__*/React.createElement("div", {
        className: "online-party-card__actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: !snapshot,
        onClick: () => onOpenSheet?.(participant.ownerUid),
        className: "online-party-card__open"
      }, snapshot ? 'Abrir ficha del jugador' : 'Esperando actualización de ficha'), onKickMember && member.role !== 'master' && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onKickMember(member),
        className: "online-party-card__kick"
      }, "Expulsar de la sala"))) : /*#__PURE__*/React.createElement("div", {
        className: "online-party-card__missing"
      }, /*#__PURE__*/React.createElement("p", null, "Aún no ha compartido ningún personaje.")));
    }), !playerMembers.length && /*#__PURE__*/React.createElement("div", {
      className: "online-party-empty"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "♙"), /*#__PURE__*/React.createElement("strong", null, "Aún no hay jugadores"), /*#__PURE__*/React.createElement("p", null, "Invítalos con el código de la sala. Sus fichas aparecerán aquí al compartirlas."))));
  };
  const OnlineGroupRoster = ({
    participants = [],
    members = [],
    compact = false,
    onOpenGroup
  }) => {
    const playerMembers = members.filter(member => member.role !== 'master');
    const visibleMembers = compact ? playerMembers.slice(0, 4) : playerMembers;
    return /*#__PURE__*/React.createElement("section", {
      className: `online-group-roster ${compact ? 'is-compact' : ''}`
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, compact ? 'Compañeros de aventura' : 'Miembros de la campaña'), /*#__PURE__*/React.createElement("h4", null, compact ? 'El grupo de hoy' : 'Grupo de aventureros'), /*#__PURE__*/React.createElement("p", null, compact ? 'Consulta de un vistazo quién está disponible.' : 'Información compartida con toda la mesa, sin mostrar datos privados de las fichas.')), /*#__PURE__*/React.createElement("span", null, playerMembers.length, " ", playerMembers.length === 1 ? 'jugador' : 'jugadores')), /*#__PURE__*/React.createElement("div", {
      className: "online-group-roster__grid"
    }, visibleMembers.map(member => {
      const participant = participants.find(item => item.ownerUid === member.uid && item.type !== 'companion');
      const presenceStatus = participant?.presenceStatus || 'offline';
      const presenceLabel = participant?.presenceLabel || (participant ? 'Desconectado' : 'Sin personaje');
      const connected = presenceStatus === 'online';
      const hp = window.DndOnlineTableUtils.getHpValues(participant);
      const hpPercent = hp.maxHp > 0 ? Math.min(100, hp.currentHp / hp.maxHp * 100) : 0;
      const conditions = window.DndOnlineTableUtils.normalizeOnlineConditions(participant?.conditions);
      return /*#__PURE__*/React.createElement("article", {
        key: member.id,
        className: connected ? 'is-online' : presenceStatus === 'away' ? 'is-away' : 'is-offline'
      }, /*#__PURE__*/React.createElement("div", {
        className: "online-group-roster__identity"
      }, participant ? /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
        combatant: participant,
        className: "h-12 w-12 text-sm"
      }) : /*#__PURE__*/React.createElement("span", {
        className: "online-group-roster__empty"
      }, "?"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, presenceLabel), /*#__PURE__*/React.createElement("strong", null, participant?.name || member.displayName || 'Jugador'), /*#__PURE__*/React.createElement("p", null, participant ? `${participant.className || 'Sin clase'} · Nivel ${participant.level || '—'}` : `Jugador: ${member.displayName || 'Sin identificar'}`)), /*#__PURE__*/React.createElement("i", null)), !compact && participant && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "online-group-roster__vitals"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV"), /*#__PURE__*/React.createElement("strong", null, hp.currentHp, "/", hp.maxHp)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "CA"), /*#__PURE__*/React.createElement("strong", null, participant.armorClass ?? '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Iniciativa"), /*#__PURE__*/React.createElement("strong", null, participant.initiative ?? '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Estados"), /*#__PURE__*/React.createElement("strong", null, conditions.length || '—'))), /*#__PURE__*/React.createElement("div", {
        className: "online-group-roster__hp"
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: `${hpPercent}%`
        }
      }))));
    }), !playerMembers.length && /*#__PURE__*/React.createElement("div", {
      className: "online-group-roster__empty-state"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◇"), /*#__PURE__*/React.createElement("strong", null, "La compañía aún está vacía"), /*#__PURE__*/React.createElement("p", null, "Cuando entren jugadores aparecerán aquí con sus personajes."))), compact && playerMembers.length > 0 && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "online-group-roster__open",
      onClick: onOpenGroup
    }, "Ver grupo completo ", /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "→")));
  };
  const OnlineCampaignLobby = ({
    roomData,
    isMaster,
    members = [],
    participants = [],
    sheets = [],
    enemies = [],
    ownParticipant,
    onSelect,
    onInvite,
    onShareCharacter
  }) => {
    const playerMembers = members.filter(member => member.role !== 'master');
    const playerParticipants = participants.filter(participant => participant.type !== 'companion' && playerMembers.some(member => member.uid === participant.ownerUid));
    const connectedPlayers = playerParticipants.filter(participant => participant.presenceStatus === 'online').length;
    const awayPlayers = playerParticipants.filter(participant => participant.presenceStatus === 'away').length;
    const offlinePlayers = playerParticipants.filter(participant => participant.presenceStatus === 'offline').length;
    const sharedSheets = isMaster ? playerMembers.filter(member => sheets.some(sheet => (sheet.ownerUid || sheet.id) === member.uid)).length : playerParticipants.length;
    const readyInitiatives = playerParticipants.filter(participant => participant.initiative !== null && participant.initiative !== undefined && participant.initiative !== '').length;
    const campaignStatus = roomData?.status === 'paused' ? 'Encuentro pausado' : roomData?.status === 'active' ? `Ronda ${roomData.round || 1}` : 'En el campamento';
    const attentionCount = isMaster ? Math.max(0, playerMembers.length - sharedSheets) : ownParticipant ? 0 : 1;
    return /*#__PURE__*/React.createElement("section", {
      className: `online-lobby-home ${isMaster ? 'is-master' : 'is-player'}`
    }, /*#__PURE__*/React.createElement("header", {
      className: "online-lobby-home__hero"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-lobby-home__sigil",
      "aria-hidden": "true"
    }, isMaster ? '♜' : '✦', /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("div", {
      className: "online-lobby-home__welcome"
    }, /*#__PURE__*/React.createElement("small", null, isMaster ? 'Centro de dirección' : 'Campamento del aventurero'), /*#__PURE__*/React.createElement("h4", null, isMaster ? 'La mesa está preparada' : `Bienvenido${ownParticipant?.name ? `, ${ownParticipant.name}` : ''}`), /*#__PURE__*/React.createElement("p", null, isMaster ? 'Consulta al grupo, prepara el encuentro o invita a alguien sin salir de esta portada.' : 'Revisa a tus compañeros, confirma tu personaje y entra al asistente de combate cuando lo necesites.'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "is-online"
    }, /*#__PURE__*/React.createElement("i", null), "Campaña conectada"), /*#__PURE__*/React.createElement("span", null, campaignStatus), awayPlayers > 0 && /*#__PURE__*/React.createElement("span", {
      className: "is-warning"
    }, awayPlayers, " ausente", awayPlayers === 1 ? '' : 's'), offlinePlayers > 0 && /*#__PURE__*/React.createElement("span", null, offlinePlayers, " desconectado", offlinePlayers === 1 ? '' : 's'))), /*#__PURE__*/React.createElement("div", {
      className: "online-lobby-home__primary"
    }, isMaster ? /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onInvite
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "＋"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Acción rápida"), /*#__PURE__*/React.createElement("strong", null, "Invitar jugadores"))) : /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => ownParticipant ? onSelect?.('sheets') : onShareCharacter?.()
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, ownParticipant ? '✓' : '＋'), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, ownParticipant ? 'Ficha sincronizada' : 'Paso necesario'), /*#__PURE__*/React.createElement("strong", null, ownParticipant ? 'Ver mi personaje' : 'Compartir personaje'))))), /*#__PURE__*/React.createElement("div", {
      className: "online-lobby-home__metrics"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Jugadores"), /*#__PURE__*/React.createElement("strong", null, playerMembers.length), /*#__PURE__*/React.createElement("p", null, connectedPlayers, " conectados · ", awayPlayers, " ausentes · ", offlinePlayers, " fuera")), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Fichas compartidas"), /*#__PURE__*/React.createElement("strong", null, sharedSheets, /*#__PURE__*/React.createElement("em", null, "/", playerMembers.length)), /*#__PURE__*/React.createElement("p", null, sharedSheets === playerMembers.length && playerMembers.length ? 'Información disponible' : 'Pendientes de compartir')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Iniciativas"), /*#__PURE__*/React.createElement("strong", null, readyInitiatives, /*#__PURE__*/React.createElement("em", null, "/", playerParticipants.length)), /*#__PURE__*/React.createElement("p", null, readyInitiatives === playerParticipants.length && playerParticipants.length ? 'Grupo preparado' : 'Completar en Combate')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Oposición"), /*#__PURE__*/React.createElement("strong", null, enemies.length), /*#__PURE__*/React.createElement("p", null, enemies.length ? 'Enemigos preparados' : 'Encuentro sin enemigos'))), attentionCount > 0 && /*#__PURE__*/React.createElement("aside", {
      className: "online-lobby-home__attention"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "!"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Requiere atención"), /*#__PURE__*/React.createElement("strong", null, isMaster ? `${attentionCount} ${attentionCount === 1 ? 'ficha pendiente' : 'fichas pendientes'} de compartir` : 'Todavía no has compartido un personaje'), /*#__PURE__*/React.createElement("p", null, isMaster ? 'En Grupo puedes comprobar quién todavía no ha compartido su personaje.' : 'El Máster necesita una copia sincronizada para consultar tu personaje y añadirlo al combate.')), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => isMaster ? onSelect?.('sheets') : onShareCharacter?.()
    }, isMaster ? 'Revisar grupo' : 'Elegir personaje')), playerMembers.length > 0 ? /*#__PURE__*/React.createElement(OnlineGroupRoster, {
      participants: participants,
      members: members,
      compact: true,
      onOpenGroup: () => onSelect?.('sheets')
    }) : /*#__PURE__*/React.createElement("aside", {
      className: "online-lobby-home__empty-party"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◇"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Compañía vacía"), /*#__PURE__*/React.createElement("strong", null, "Aún no se ha unido ningún jugador"), /*#__PURE__*/React.createElement("p", null, "Invita al grupo y sus personajes aparecerán aquí automáticamente.")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onInvite
    }, "Invitar al primero")));
  };
  const OnlineRoomModuleSelector = ({
    active,
    onSelect,
    isMaster,
    encounterActive
  }) => {
    const modules = [{
      id: 'home',
      icon: '✦',
      eyebrow: 'Resumen de campaña',
      title: 'Inicio',
      description: 'Estado del grupo y accesos principales.'
    }, {
      id: 'sheets',
      icon: '◇',
      eyebrow: isMaster ? 'Información del grupo' : 'Compañeros de equipo',
      title: 'Grupo',
      description: isMaster ? 'Fichas, recursos, conjuros y mochilas.' : 'Tu personaje compartido y el resto del grupo.'
    }, {
      id: 'combat',
      icon: '⚔',
      eyebrow: encounterActive ? 'Encuentro en curso' : 'Preparación táctica',
      title: 'Combate',
      description: 'Iniciativas, enemigos, turnos, condiciones y efectos.'
    }, {
      id: 'room',
      icon: '◈',
      eyebrow: 'Acceso y opciones',
      title: 'Campaña',
      description: 'Invitaciones, código y administración.'
    }];
    return /*#__PURE__*/React.createElement("nav", {
      className: "online-room-modules",
      "aria-label": "Funciones de la Mesa Online"
    }, modules.map(module => /*#__PURE__*/React.createElement("button", {
      key: module.id,
      type: "button",
      onClick: () => onSelect?.(module.id),
      className: active === module.id ? 'is-active' : '',
      "aria-current": active === module.id ? 'page' : undefined
    }, /*#__PURE__*/React.createElement("span", {
      className: "online-room-modules__icon",
      "aria-hidden": "true"
    }, module.icon), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, module.eyebrow), /*#__PURE__*/React.createElement("strong", null, module.title), /*#__PURE__*/React.createElement("em", null, module.description)), /*#__PURE__*/React.createElement("b", {
      "aria-hidden": "true"
    }, active === module.id ? '•' : '→'))));
  };
  const OnlinePlayerSheetModal = ({
    participant,
    sheetDocument,
    onClose,
    onAvatarPreview
  }) => {
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
    const Section = ({
      title,
      children,
      empty
    }) => /*#__PURE__*/React.createElement("section", {
      className: "online-sheet-section"
    }, /*#__PURE__*/React.createElement("h5", null, title), empty ? /*#__PURE__*/React.createElement("p", {
      className: "online-sheet-empty"
    }, empty) : children);
    return /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-overlay",
      role: "presentation",
      onMouseDown: event => {
        if (event.target === event.currentTarget) onClose?.();
      }
    }, /*#__PURE__*/React.createElement("article", {
      className: "online-sheet-dialog",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "online-sheet-title"
    }, /*#__PURE__*/React.createElement("header", {
      className: "online-sheet-header"
    }, /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
      combatant: participant,
      className: "h-16 w-16 text-xl",
      onAvatarPreview: onAvatarPreview
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Ficha compartida · Solo lectura"), /*#__PURE__*/React.createElement("h4", {
      id: "online-sheet-title"
    }, snapshot.identity.name), /*#__PURE__*/React.createElement("p", null, [snapshot.identity.race, snapshot.identity.className, `Nivel ${snapshot.identity.level}`].filter(Boolean).join(' · '))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose,
      "aria-label": "Cerrar ficha"
    }, "×")), /*#__PURE__*/React.createElement("nav", {
      className: "online-sheet-tabs",
      "aria-label": "Secciones de la ficha"
    }, [['summary', 'Resumen'], ['combat', 'Combate'], ['companions', `Compañeros${companions.length ? ` (${companions.length})` : ''}`], ['spells', 'Conjuros'], ['inventory', 'Mochila']].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
      key: id,
      type: "button",
      onClick: () => setTab(id),
      className: tab === id ? 'is-active' : ''
    }, label))), /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-content"
    }, tab === 'summary' && /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-layout"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-main"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-metrics"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV actuales"), /*#__PURE__*/React.createElement("b", null, liveHp.currentHp, "/", liveHp.maxHp), liveHp.tempHp > 0 && /*#__PURE__*/React.createElement("em", null, "+", liveHp.tempHp, " temporales")), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Clase de armadura"), /*#__PURE__*/React.createElement("b", null, participant.armorClass ?? snapshot.combat.armorClass)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Iniciativa"), /*#__PURE__*/React.createElement("b", null, participant.initiative ?? formatModifier(snapshot.combat.initiativeBonus))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Velocidad"), /*#__PURE__*/React.createElement("b", null, snapshot.identity.speed || '—'))), /*#__PURE__*/React.createElement(Section, {
      title: "Características y salvaciones"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-abilities"
    }, snapshot.abilities.map(ability => /*#__PURE__*/React.createElement("div", {
      key: ability.key
    }, /*#__PURE__*/React.createElement("small", null, ability.label), /*#__PURE__*/React.createElement("strong", null, ability.score), /*#__PURE__*/React.createElement("span", null, "Mod. ", formatModifier(ability.modifier)), /*#__PURE__*/React.createElement("span", {
      className: ability.saveProficient ? 'is-proficient' : ''
    }, "Salv. ", formatModifier(ability.saveBonus)))))), /*#__PURE__*/React.createElement(Section, {
      title: "Competencias"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-skills"
    }, snapshot.skills.map(skill => /*#__PURE__*/React.createElement("span", {
      key: skill.key,
      className: skill.expertise ? 'is-expert' : skill.proficient ? 'is-proficient' : ''
    }, /*#__PURE__*/React.createElement("i", null), skill.name, /*#__PURE__*/React.createElement("b", null, formatModifier(skill.bonus))))))), /*#__PURE__*/React.createElement("aside", {
      className: "online-sheet-aside"
    }, /*#__PURE__*/React.createElement(Section, {
      title: "Percepciones pasivas"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-passives"
    }, /*#__PURE__*/React.createElement("span", null, "Percepción ", /*#__PURE__*/React.createElement("b", null, snapshot.passives.perception)), /*#__PURE__*/React.createElement("span", null, "Investigación ", /*#__PURE__*/React.createElement("b", null, snapshot.passives.investigation)), /*#__PURE__*/React.createElement("span", null, "Perspicacia ", /*#__PURE__*/React.createElement("b", null, snapshot.passives.insight)))), /*#__PURE__*/React.createElement(Section, {
      title: "Rasgos",
      empty: !snapshot.traits.length ? 'Sin rasgos registrados.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-list"
    }, snapshot.traits.map((trait, index) => /*#__PURE__*/React.createElement("details", {
      key: `${trait.name}-${index}`
    }, /*#__PURE__*/React.createElement("summary", null, trait.name), trait.description && /*#__PURE__*/React.createElement("p", null, trait.description))))), /*#__PURE__*/React.createElement(Section, {
      title: "Dotes",
      empty: !snapshot.feats.length ? 'Sin dotes registradas.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-list"
    }, snapshot.feats.map((feat, index) => /*#__PURE__*/React.createElement("details", {
      key: `${feat.name}-${index}`
    }, /*#__PURE__*/React.createElement("summary", null, feat.name), feat.description && /*#__PURE__*/React.createElement("p", null, feat.description))))), /*#__PURE__*/React.createElement(Section, {
      title: "Otras competencias",
      empty: !snapshot.proficiencies.length ? 'Sin datos registrados.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-tags"
    }, snapshot.proficiencies.map((entry, index) => /*#__PURE__*/React.createElement("span", {
      key: `${entry.name}-${index}`
    }, entry.name)))))), tab === 'combat' && /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-layout"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-main"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-metrics"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV"), /*#__PURE__*/React.createElement("b", null, liveHp.currentHp, "/", liveHp.maxHp)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "CA"), /*#__PURE__*/React.createElement("b", null, participant.armorClass ?? snapshot.combat.armorClass)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Competencia"), /*#__PURE__*/React.createElement("b", null, formatModifier(snapshot.combat.proficiencyBonus))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Dados de golpe"), /*#__PURE__*/React.createElement("b", null, snapshot.combat.hitDice.current || '—', " ", snapshot.combat.hitDice.type))), /*#__PURE__*/React.createElement(Section, {
      title: "Ataques",
      empty: !snapshot.weapons.length ? 'No hay ataques registrados.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-attacks"
    }, snapshot.weapons.map((weapon, index) => /*#__PURE__*/React.createElement("article", {
      key: `${weapon.name}-${index}`
    }, /*#__PURE__*/React.createElement("strong", null, weapon.name), weapon.attacks.map((attack, attackIndex) => /*#__PURE__*/React.createElement("div", {
      key: `${attack.name}-${attackIndex}`
    }, /*#__PURE__*/React.createElement("span", null, attack.name || 'Ataque'), /*#__PURE__*/React.createElement("b", null, attack.attack || '—'), /*#__PURE__*/React.createElement("em", null, attack.damage || '—'), attack.notes && /*#__PURE__*/React.createElement("small", null, attack.notes))))))), /*#__PURE__*/React.createElement(Section, {
      title: "Recursos",
      empty: !snapshot.resources.length ? 'No hay recursos registrados.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-resources"
    }, snapshot.resources.map((resource, index) => /*#__PURE__*/React.createElement("span", {
      key: `${resource.name}-${index}`
    }, /*#__PURE__*/React.createElement("strong", null, resource.name), /*#__PURE__*/React.createElement("b", null, resource.current, "/", resource.max), /*#__PURE__*/React.createElement("small", null, resource.recovery || resource.type)))))), /*#__PURE__*/React.createElement("aside", {
      className: "online-sheet-aside"
    }, /*#__PURE__*/React.createElement(Section, {
      title: "Estado actual"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-status-list"
    }, /*#__PURE__*/React.createElement("span", null, "Inspiración ", /*#__PURE__*/React.createElement("b", null, snapshot.combat.inspiration ? 'Sí' : 'No')), /*#__PURE__*/React.createElement("span", null, "Guía ", /*#__PURE__*/React.createElement("b", null, snapshot.combat.guidance ? 'Activa' : 'No')), /*#__PURE__*/React.createElement("span", null, "Concentración ", /*#__PURE__*/React.createElement("b", null, snapshot.combat.concentration || 'Ninguna')), /*#__PURE__*/React.createElement("span", null, "Salvaciones de muerte ", /*#__PURE__*/React.createElement("b", null, snapshot.combat.deathSaves.successes, " éxitos · ", snapshot.combat.deathSaves.failures, " fallos")), conditions.map(condition => /*#__PURE__*/React.createElement("span", {
      key: condition.id,
      className: "is-condition"
    }, condition.name)))), /*#__PURE__*/React.createElement(Section, {
      title: "Armaduras",
      empty: !snapshot.armors.length ? 'No hay armaduras registradas.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-list"
    }, snapshot.armors.map((armor, index) => /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-armor",
      key: `${armor.name}-${index}`
    }, /*#__PURE__*/React.createElement("strong", null, armor.name), /*#__PURE__*/React.createElement("span", null, "CA ", armor.armorClass || '—', " · ", armor.type || 'Armadura'), armor.equipped && /*#__PURE__*/React.createElement("b", null, "Equipada"))))))), tab === 'companions' && /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-companions"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Vínculos compartidos en tiempo real"), /*#__PURE__*/React.createElement("h5", null, "Compañeros de ", snapshot.identity.name)), /*#__PURE__*/React.createElement("span", null, companions.filter(companion => companion.participates).length, " en combate")), companions.map(companion => /*#__PURE__*/React.createElement("article", {
      key: companion.id || companion.name,
      className: companion.participates ? 'is-participating' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-companion-hero"
    }, /*#__PURE__*/React.createElement("span", null, companion.avatarPath ? /*#__PURE__*/React.createElement("img", {
      src: companion.avatarPath,
      alt: ""
    }) : String(companion.name).slice(0, 1)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, companion.category || 'Compañero', " · ", companion.sourceLabel || 'Ficha personalizada'), /*#__PURE__*/React.createElement("strong", null, companion.name), /*#__PURE__*/React.createElement("p", null, companion.details?.subtitle || companion.details?.type || 'Aliado vinculado')), /*#__PURE__*/React.createElement("b", null, companion.participates ? 'Participa' : 'Fuera del combate')), /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-companion-vitals"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV"), /*#__PURE__*/React.createElement("strong", null, companion.currentHp, "/", companion.maxHp), companion.tempHp > 0 && /*#__PURE__*/React.createElement("em", null, "+", companion.tempHp)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "CA"), /*#__PURE__*/React.createElement("strong", null, companion.armorClass ?? '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Movimiento"), /*#__PURE__*/React.createElement("strong", null, companion.details?.speedText || '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Turno"), /*#__PURE__*/React.createElement("strong", null, companion.initiativeMode === 'own' ? `Propio${companion.initiative !== null ? ` · ${companion.initiative}` : ''}` : companion.initiativeMode === 'shared' ? 'Comparte iniciativa' : 'Después del PJ'))), companion.conditions?.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-companion-conditions"
    }, companion.conditions.map(condition => /*#__PURE__*/React.createElement("span", {
      key: condition
    }, condition))), /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, "Consultar ficha de criatura"), /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-companion-details"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-companion-abilities"
    }, Object.entries({
      FUE: companion.details?.abilities?.str,
      DES: companion.details?.abilities?.dex,
      CON: companion.details?.abilities?.con,
      INT: companion.details?.abilities?.int,
      SAB: companion.details?.abilities?.wis,
      CAR: companion.details?.abilities?.cha
    }).map(([label, value]) => /*#__PURE__*/React.createElement("span", {
      key: label
    }, /*#__PURE__*/React.createElement("small", null, label), /*#__PURE__*/React.createElement("strong", null, value ?? '—')))), [['Sentidos', companion.details?.senses], ['Idiomas', companion.details?.languages], ['Habilidades', companion.details?.skills], ['Salvaciones', companion.details?.saves], ['Resistencias', companion.details?.resistances], ['Inmunidades', companion.details?.immunities]].filter(([, value]) => value).map(([label, value]) => /*#__PURE__*/React.createElement("p", {
      key: label
    }, /*#__PURE__*/React.createElement("strong", null, label, ":"), " ", value)), [['Rasgos', companion.details?.traits], ['Acciones', companion.details?.actions], ['Acciones adicionales', companion.details?.bonusActions], ['Reacciones', companion.details?.reactions]].map(([title, entries]) => Array.isArray(entries) && entries.length > 0 && /*#__PURE__*/React.createElement("section", {
      key: title
    }, /*#__PURE__*/React.createElement("h6", null, title), entries.map((entry, index) => /*#__PURE__*/React.createElement("div", {
      key: `${entry.name}-${index}`
    }, /*#__PURE__*/React.createElement("strong", null, entry.name), entry.description && /*#__PURE__*/React.createElement("p", null, entry.description))))))), companion.notes && /*#__PURE__*/React.createElement("p", {
      className: "online-sheet-companion-notes"
    }, /*#__PURE__*/React.createElement("strong", null, "Nota:"), " ", companion.notes))), !companions.length && /*#__PURE__*/React.createElement("p", {
      className: "online-sheet-empty"
    }, "Este personaje no tiene compañeros vinculados.")), tab === 'spells' && /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-spells"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-metrics"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Aptitud mágica"), /*#__PURE__*/React.createElement("b", null, snapshot.spellcasting.abilityName || '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "CD de salvación"), /*#__PURE__*/React.createElement("b", null, snapshot.spellcasting.saveDc ?? '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Ataque de conjuro"), /*#__PURE__*/React.createElement("b", null, snapshot.spellcasting.attackBonus === null ? '—' : formatModifier(snapshot.spellcasting.attackBonus))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Concentración"), /*#__PURE__*/React.createElement("b", null, snapshot.combat.concentration || 'Ninguna'))), /*#__PURE__*/React.createElement(Section, {
      title: "Espacios"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-slots"
    }, snapshot.spellcasting.slots.map(slot => /*#__PURE__*/React.createElement("span", {
      key: slot.level
    }, /*#__PURE__*/React.createElement("small", null, "Nivel ", slot.level), /*#__PURE__*/React.createElement("b", null, slot.current, "/", slot.max))), snapshot.spellcasting.pactSlots && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Pacto N. ", snapshot.spellcasting.pactSlots.level), /*#__PURE__*/React.createElement("b", null, snapshot.spellcasting.pactSlots.current, "/", snapshot.spellcasting.pactSlots.max)), !snapshot.spellcasting.slots.length && !snapshot.spellcasting.pactSlots && /*#__PURE__*/React.createElement("p", {
      className: "online-sheet-empty"
    }, "Sin espacios registrados."))), /*#__PURE__*/React.createElement(Section, {
      title: "Lista de conjuros",
      empty: !snapshot.spells.length ? 'No hay conjuros registrados.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-spell-groups"
    }, Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b)).map(level => /*#__PURE__*/React.createElement("section", {
      key: level
    }, /*#__PURE__*/React.createElement("h6", null, Number(level) === 0 ? 'Trucos' : `Nivel ${level}`), /*#__PURE__*/React.createElement("div", null, spellsByLevel[level].map((spell, index) => /*#__PURE__*/React.createElement("article", {
      key: `${spell.name}-${index}`
    }, /*#__PURE__*/React.createElement("strong", null, spell.name), /*#__PURE__*/React.createElement("span", null, spell.school || 'Sin escuela'), /*#__PURE__*/React.createElement("div", null, spell.prepared && /*#__PURE__*/React.createElement("b", null, "Preparado"), spell.ritual && /*#__PURE__*/React.createElement("b", null, "Ritual"), spell.concentration && /*#__PURE__*/React.createElement("b", null, "Concentración")), /*#__PURE__*/React.createElement("small", null, [spell.castingTime, spell.range, spell.duration].filter(Boolean).join(' · ')))))))))), tab === 'inventory' && /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-layout"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-main"
    }, /*#__PURE__*/React.createElement(Section, {
      title: "Monedas"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-currency"
    }, currency.map(([label, amount]) => /*#__PURE__*/React.createElement("span", {
      key: label
    }, /*#__PURE__*/React.createElement("small", null, label), /*#__PURE__*/React.createElement("b", null, amount))))), /*#__PURE__*/React.createElement(Section, {
      title: "Contenido de la mochila",
      empty: !snapshot.inventory.length ? 'La mochila está vacía.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-inventory"
    }, snapshot.inventory.map((item, index) => /*#__PURE__*/React.createElement("article", {
      key: `${item.name}-${index}`
    }, /*#__PURE__*/React.createElement("span", null, item.quantity || 0), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, item.name), item.description && /*#__PURE__*/React.createElement("p", null, item.description))))))), /*#__PURE__*/React.createElement("aside", {
      className: "online-sheet-aside"
    }, /*#__PURE__*/React.createElement(Section, {
      title: "Herramientas",
      empty: !snapshot.tools.length ? 'Sin herramientas registradas.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-list"
    }, snapshot.tools.map((tool, index) => /*#__PURE__*/React.createElement("details", {
      key: `${tool.name}-${index}`
    }, /*#__PURE__*/React.createElement("summary", null, tool.name), tool.description && /*#__PURE__*/React.createElement("p", null, tool.description))))), /*#__PURE__*/React.createElement(Section, {
      title: "Equipo defensivo",
      empty: !snapshot.armors.length ? 'Sin equipo defensivo registrado.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-list"
    }, snapshot.armors.map((armor, index) => /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-armor",
      key: `${armor.name}-${index}`
    }, /*#__PURE__*/React.createElement("strong", null, armor.name), /*#__PURE__*/React.createElement("span", null, armor.type || 'Armadura', " · CA ", armor.armorClass || '—'), armor.equipped && /*#__PURE__*/React.createElement("b", null, "Equipada")))))))), /*#__PURE__*/React.createElement("footer", {
      className: "online-sheet-footer"
    }, /*#__PURE__*/React.createElement("span", null, "Las notas personales y el historial no se comparten."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose
    }, "Volver a la mesa"))));
  };
  const EnemyModal = ({
    modal,
    onChange,
    onClose,
    onSave
  }) => {
    if (!modal?.isOpen) return null;
    const updateData = changes => onChange(previous => ({
      ...previous,
      data: {
        ...previous.data,
        ...changes
      }
    }));
    const close = () => onClose();
    const publicState = window.DndOnlineTableUtils.calculateEnemyVisibleState(modal.data.currentHp, modal.data.maxHp, modal.data.visibleStateMode, modal.data.manualVisibleState);
    const title = modal.mode === 'create' ? 'Enemigo puntual' : modal.mode === 'duplicate' ? 'Duplicar enemigo' : 'Editar enemigo';
    return /*#__PURE__*/React.createElement("div", {
      className: "enemy-editor-overlay",
      onClick: close
    }, /*#__PURE__*/React.createElement("article", {
      className: "enemy-editor",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "enemy-editor-title",
      onClick: event => event.stopPropagation()
    }, /*#__PURE__*/React.createElement("header", {
      className: "enemy-editor__header"
    }, /*#__PURE__*/React.createElement("span", {
      className: "enemy-editor__emblem",
      "aria-hidden": "true"
    }, "♞"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Mesa Online · Herramienta del Máster"), /*#__PURE__*/React.createElement("h3", {
      id: "enemy-editor-title"
    }, title), /*#__PURE__*/React.createElement("p", null, modal.mode === 'create' ? 'Crea una aparición rápida sin guardarla en tu biblioteca.' : 'Ajusta sus datos para este encuentro.')), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: close,
      "aria-label": "Cerrar editor"
    }, "×")), /*#__PURE__*/React.createElement("div", {
      className: "enemy-editor__body"
    }, /*#__PURE__*/React.createElement("section", {
      className: "enemy-editor__identity"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Nombre en el encuentro"), /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      value: modal.data.name || '',
      onChange: event => updateData({
        name: event.target.value
      }),
      placeholder: "Ej. Guardia de la torre"
    })), /*#__PURE__*/React.createElement("div", {
      className: "enemy-editor__quick-stats"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "DES"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "1",
      max: "30",
      inputMode: "numeric",
      value: modal.data.dexterity ?? 10,
      onChange: event => updateData({
        dexterity: event.target.value
      })
    })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Iniciativa manual"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      inputMode: "numeric",
      value: modal.data.initiative ?? '',
      onChange: event => updateData({
        initiative: event.target.value
      }),
      placeholder: "Sin tirar"
    })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "CA"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      inputMode: "numeric",
      value: modal.data.armorClass ?? '',
      onChange: event => updateData({
        armorClass: event.target.value
      }),
      placeholder: "—"
    }))), /*#__PURE__*/React.createElement("p", {
      className: "enemy-editor__initiative-hint"
    }, "DES ", modal.data.dexterity ?? 10, " · modificador ", window.DndOnlineTableUtils.formatOnlineModifier(window.DndOnlineTableUtils.calculateAbilityModifier(modal.data.dexterity ?? 10)), ". Puedes dejar la iniciativa vacía y tirarla después desde Preparar encuentro.")), /*#__PURE__*/React.createElement("section", {
      className: "enemy-editor__section is-health"
    }, /*#__PURE__*/React.createElement("div", {
      className: "enemy-editor__section-heading"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "♥"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Puntos de golpe"), /*#__PURE__*/React.createElement("p", null, "La vida exacta solo será visible para el Máster."))), /*#__PURE__*/React.createElement("div", {
      className: "enemy-editor__health-line"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Actuales"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      inputMode: "numeric",
      value: modal.data.currentHp ?? 0,
      onChange: event => updateData({
        currentHp: event.target.value
      })
    })), /*#__PURE__*/React.createElement("i", {
      "aria-hidden": "true"
    }, "/"), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Máximos"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      inputMode: "numeric",
      value: modal.data.maxHp ?? 0,
      onChange: event => {
        const nextMax = event.target.value;
        const shouldFillCurrent = modal.mode === 'create' && (Number(modal.data.currentHp) === 0 || String(modal.data.currentHp) === String(modal.data.maxHp));
        updateData({
          maxHp: nextMax,
          ...(shouldFillCurrent ? {
            currentHp: nextMax
          } : {})
        });
      }
    })), /*#__PURE__*/React.createElement("label", {
      className: "is-temporary"
    }, /*#__PURE__*/React.createElement("span", null, "Temporales"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      inputMode: "numeric",
      value: modal.data.tempHp ?? 0,
      onChange: event => updateData({
        tempHp: event.target.value
      })
    })))), /*#__PURE__*/React.createElement("section", {
      className: "enemy-editor__section is-visibility"
    }, /*#__PURE__*/React.createElement("div", {
      className: "enemy-editor__section-heading"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◉"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Información para los jugadores"), /*#__PURE__*/React.createElement("p", null, "Decide cómo se describe su estado sin revelar sus PV."))), /*#__PURE__*/React.createElement("div", {
      className: "enemy-editor__visibility-controls"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Estado visible"), /*#__PURE__*/React.createElement("select", {
      value: modal.data.visibleStateMode || 'automatic',
      onChange: event => updateData({
        visibleStateMode: event.target.value
      })
    }, /*#__PURE__*/React.createElement("option", {
      value: "automatic"
    }, "Automático según sus PV"), /*#__PURE__*/React.createElement("option", {
      value: "manual"
    }, "Elegido por el Máster"), /*#__PURE__*/React.createElement("option", {
      value: "hidden"
    }, "Siempre oculto"))), modal.data.visibleStateMode === 'manual' && /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Mostrar como"), /*#__PURE__*/React.createElement("select", {
      value: modal.data.manualVisibleState || 'herido',
      onChange: event => updateData({
        manualVisibleState: event.target.value
      })
    }, /*#__PURE__*/React.createElement("option", {
      value: "intacto"
    }, "Intacto"), /*#__PURE__*/React.createElement("option", {
      value: "herido"
    }, "Herido"), /*#__PURE__*/React.createElement("option", {
      value: "muy-herido"
    }, "Muy herido"), /*#__PURE__*/React.createElement("option", {
      value: "derrotado"
    }, "Derrotado"), /*#__PURE__*/React.createElement("option", {
      value: "oculto"
    }, "Oculto"))), /*#__PURE__*/React.createElement("div", {
      className: "enemy-editor__public-preview"
    }, /*#__PURE__*/React.createElement("small", null, "Los jugadores verán"), /*#__PURE__*/React.createElement("strong", null, publicState)))), /*#__PURE__*/React.createElement("label", {
      className: "enemy-editor__notes"
    }, /*#__PURE__*/React.createElement("span", null, "Notas privadas del Máster"), /*#__PURE__*/React.createElement("small", null, "No se comparten con los jugadores."), /*#__PURE__*/React.createElement("textarea", {
      value: modal.data.notes || '',
      onChange: event => updateData({
        notes: event.target.value
      }),
      placeholder: "Táctica, capacidades pendientes, recordatorios…"
    }))), /*#__PURE__*/React.createElement("footer", {
      className: "enemy-editor__footer"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: close
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "is-primary",
      onClick: onSave
    }, modal.mode === 'create' ? 'Añadir al encuentro' : modal.mode === 'duplicate' ? 'Crear copia' : 'Guardar cambios'))));
  };
  const OnlineConditionModal = ({
    modal,
    conditions,
    onChange,
    onClose,
    onSave
  }) => {
    if (!modal?.isOpen) return null;
    const selectedName = String(modal.name || '');
    const targetName = modal.target?.name || 'Combatiente';
    return /*#__PURE__*/React.createElement("div", {
      className: "online-combat-modal-overlay is-condition",
      onMouseDown: event => {
        if (event.target === event.currentTarget) onClose?.();
      }
    }, /*#__PURE__*/React.createElement("article", {
      className: "online-combat-modal condition-editor",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "condition-editor-title"
    }, /*#__PURE__*/React.createElement("header", {
      className: "online-combat-modal__header"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◈"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Estado del combatiente"), /*#__PURE__*/React.createElement("h3", {
      id: "condition-editor-title"
    }, "Añadir condición"), /*#__PURE__*/React.createElement("p", null, "Marca un estado conocido o escribe uno propio.")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose,
      "aria-label": "Cerrar"
    }, "×")), /*#__PURE__*/React.createElement("div", {
      className: "online-combat-modal__target"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◎"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Se aplicará a"), /*#__PURE__*/React.createElement("strong", null, targetName)), /*#__PURE__*/React.createElement("b", null, modal.target?.type === 'enemy' ? 'Enemigo' : 'Personaje')), /*#__PURE__*/React.createElement("div", {
      className: "online-combat-modal__body"
    }, /*#__PURE__*/React.createElement("section", {
      className: "condition-editor__presets"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Condiciones habituales"), /*#__PURE__*/React.createElement("strong", null, "Selección rápida")), selectedName && /*#__PURE__*/React.createElement("span", null, "Elegida: ", selectedName)), /*#__PURE__*/React.createElement("div", null, conditions.map(name => /*#__PURE__*/React.createElement("button", {
      key: name,
      type: "button",
      onClick: () => onChange(previous => ({
        ...previous,
        name
      })),
      className: selectedName === name ? 'is-selected' : ''
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, selectedName === name ? '✓' : '◇'), name)))), /*#__PURE__*/React.createElement("label", {
      className: "online-combat-field is-wide"
    }, /*#__PURE__*/React.createElement("span", null, "Condición personalizada"), /*#__PURE__*/React.createElement("input", {
      value: selectedName,
      onChange: event => onChange(previous => ({
        ...previous,
        name: event.target.value
      })),
      placeholder: "Ej. Marcado por el cazador"
    })), /*#__PURE__*/React.createElement("div", {
      className: "online-combat-fields"
    }, /*#__PURE__*/React.createElement("label", {
      className: "online-combat-field"
    }, /*#__PURE__*/React.createElement("span", null, "Fuente ", /*#__PURE__*/React.createElement("em", null, "opcional")), /*#__PURE__*/React.createElement("input", {
      value: modal.source || '',
      onChange: event => onChange(previous => ({
        ...previous,
        source: event.target.value
      })),
      placeholder: "Conjuro, criatura, objeto…"
    })), modal.target?.type !== 'enemy' && /*#__PURE__*/React.createElement("label", {
      className: "online-combat-field"
    }, /*#__PURE__*/React.createElement("span", null, "Nota para la mesa ", /*#__PURE__*/React.createElement("em", null, "opcional")), /*#__PURE__*/React.createElement("input", {
      value: modal.notes || '',
      onChange: event => onChange(previous => ({
        ...previous,
        notes: event.target.value
      })),
      placeholder: "Recordatorio breve"
    })))), /*#__PURE__*/React.createElement("footer", {
      className: "online-combat-modal__footer"
    }, /*#__PURE__*/React.createElement("p", null, selectedName.trim() ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◆"), " Se añadirá ", /*#__PURE__*/React.createElement("strong", null, selectedName.trim())) : 'Elige o escribe una condición para continuar.'), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: !selectedName.trim(),
      onClick: onSave,
      className: "is-primary"
    }, "Aplicar condición"))));
  };
  const OnlineEffectModal = ({
    modal,
    combatants,
    canManageEnemies,
    currentUid,
    onChange,
    onClose,
    onSave
  }) => {
    if (!modal?.isOpen) return null;
    const update = changes => onChange(previous => ({
      ...previous,
      data: {
        ...previous.data,
        ...changes
      }
    }));
    const visibleTargets = combatants.filter(target => canManageEnemies || target.ownerUid === currentUid);
    const durationOptions = [['turns', 'Turnos', 'Se mide por actuaciones'], ['rounds', 'Rondas', 'Se mide por vueltas completas'], ['minutes', 'Minutos', 'Duración narrativa'], ['manual', 'Manual', 'Finaliza cuando lo indiques']];
    const selectedTarget = modal.data.targetType === 'global' ? null : combatants.find(item => item.id === modal.data.targetId);
    const isManual = modal.data.durationType === 'manual';
    const canSave = String(modal.data.name || '').trim() && (modal.data.targetType === 'global' || selectedTarget);
    return /*#__PURE__*/React.createElement("div", {
      className: "online-combat-modal-overlay is-effect",
      onMouseDown: event => {
        if (event.target === event.currentTarget) onClose?.();
      }
    }, /*#__PURE__*/React.createElement("article", {
      className: "online-combat-modal effect-editor",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "effect-editor-title"
    }, /*#__PURE__*/React.createElement("header", {
      className: "online-combat-modal__header"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "✦"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Control temporal del encuentro"), /*#__PURE__*/React.createElement("h3", {
      id: "effect-editor-title"
    }, modal.effectId ? 'Editar efecto' : 'Añadir efecto'), /*#__PURE__*/React.createElement("p", null, "Define quién lo recibe, cuánto dura y cuándo disminuye.")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose,
      "aria-label": "Cerrar"
    }, "×")), /*#__PURE__*/React.createElement("div", {
      className: "online-combat-modal__body"
    }, /*#__PURE__*/React.createElement("section", {
      className: "effect-editor__section"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", null, "1"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Identidad y objetivo"), /*#__PURE__*/React.createElement("strong", null, "¿Qué efecto está activo?"))), /*#__PURE__*/React.createElement("div", {
      className: "online-combat-fields"
    }, /*#__PURE__*/React.createElement("label", {
      className: "online-combat-field"
    }, /*#__PURE__*/React.createElement("span", null, "Nombre del efecto"), /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      value: modal.data.name || '',
      onChange: event => update({
        name: event.target.value
      }),
      placeholder: "Ej. Bendición"
    })), /*#__PURE__*/React.createElement("label", {
      className: "online-combat-field"
    }, /*#__PURE__*/React.createElement("span", null, "Objetivo"), /*#__PURE__*/React.createElement("select", {
      value: modal.data.targetType === 'global' ? 'global' : modal.data.targetId || '',
      onChange: event => {
        const value = event.target.value;
        const target = combatants.find(item => item.id === value);
        update({
          targetId: value === 'global' ? 'global' : value,
          targetType: value === 'global' ? 'global' : target?.type === 'enemy' ? 'enemy' : 'player'
        });
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Selecciona un combatiente"), canManageEnemies && /*#__PURE__*/React.createElement("option", {
      value: "global"
    }, "Toda la escena (global)"), visibleTargets.map(target => /*#__PURE__*/React.createElement("option", {
      key: target.id,
      value: target.id
    }, target.name, " · ", target.type === 'enemy' ? 'Enemigo' : 'Personaje')))))), /*#__PURE__*/React.createElement("section", {
      className: "effect-editor__section"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", null, "2"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Seguimiento"), /*#__PURE__*/React.createElement("strong", null, "¿Cómo se mide su duración?"))), /*#__PURE__*/React.createElement("div", {
      className: "effect-editor__duration"
    }, durationOptions.map(([value, label, help]) => /*#__PURE__*/React.createElement("button", {
      key: value,
      type: "button",
      onClick: () => update({
        durationType: value,
        ...(value === 'manual' ? {
          decrementMoment: 'manual'
        } : {})
      }),
      className: modal.data.durationType === value ? 'is-selected' : ''
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, modal.data.durationType === value ? '◆' : '◇'), /*#__PURE__*/React.createElement("strong", null, label), /*#__PURE__*/React.createElement("small", null, help)))), !isManual && /*#__PURE__*/React.createElement("div", {
      className: "online-combat-fields effect-editor__timing"
    }, /*#__PURE__*/React.createElement("label", {
      className: "online-combat-field"
    }, /*#__PURE__*/React.createElement("span", null, "Cantidad inicial"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      inputMode: "numeric",
      min: "0",
      value: modal.data.remaining ?? 0,
      onChange: event => update({
        remaining: event.target.value,
        maximum: event.target.value
      })
    })), /*#__PURE__*/React.createElement("label", {
      className: "online-combat-field"
    }, /*#__PURE__*/React.createElement("span", null, "Reducir automáticamente"), /*#__PURE__*/React.createElement("select", {
      value: modal.data.decrementMoment || 'manual',
      onChange: event => update({
        decrementMoment: event.target.value
      })
    }, /*#__PURE__*/React.createElement("option", {
      value: "manual"
    }, "Solo manualmente"), /*#__PURE__*/React.createElement("option", {
      value: "start-of-target-turn"
    }, "Al inicio del turno del objetivo"), /*#__PURE__*/React.createElement("option", {
      value: "end-of-target-turn"
    }, "Al final del turno del objetivo"), /*#__PURE__*/React.createElement("option", {
      value: "start-of-round"
    }, "Al inicio de la ronda"), /*#__PURE__*/React.createElement("option", {
      value: "end-of-round"
    }, "Al final de la ronda"))))), /*#__PURE__*/React.createElement("section", {
      className: "effect-editor__section"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", null, "3"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Comportamiento y visibilidad"), /*#__PURE__*/React.createElement("strong", null, "Detalles que debe recordar la mesa"))), /*#__PURE__*/React.createElement("div", {
      className: "effect-editor__toggles"
    }, canManageEnemies ? /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => update({
        visibleToPlayers: !modal.data.visibleToPlayers
      }),
      className: modal.data.visibleToPlayers ? 'is-active' : ''
    }, /*#__PURE__*/React.createElement("i", {
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Visible para jugadores"), /*#__PURE__*/React.createElement("small", null, modal.data.visibleToPlayers ? 'Aparecerá en sus paneles' : 'Solo lo verá el Máster'))) : /*#__PURE__*/React.createElement("div", {
      className: "is-locked"
    }, /*#__PURE__*/React.createElement("i", {
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Visible en la mesa"), /*#__PURE__*/React.createElement("small", null, "Tus efectos se comparten con el Máster"))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => update({
        concentration: !modal.data.concentration
      }),
      className: modal.data.concentration ? 'is-active is-concentration' : ''
    }, /*#__PURE__*/React.createElement("i", {
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Requiere concentración"), /*#__PURE__*/React.createElement("small", null, "Impide mantener otro efecto concentrado")))), /*#__PURE__*/React.createElement("label", {
      className: "online-combat-field is-wide"
    }, /*#__PURE__*/React.createElement("span", null, modal.data.visibleToPlayers || !canManageEnemies ? 'Nota pública' : 'Nota privada del Máster', " ", /*#__PURE__*/React.createElement("em", null, "opcional")), /*#__PURE__*/React.createElement("textarea", {
      value: modal.data.visibleToPlayers || !canManageEnemies ? modal.data.notesPublic || '' : modal.data.notesPrivate || '',
      onChange: event => update(modal.data.visibleToPlayers || !canManageEnemies ? {
        notesPublic: event.target.value
      } : {
        notesPrivate: event.target.value
      }),
      placeholder: "Describe el recordatorio importante del efecto…"
    })))), /*#__PURE__*/React.createElement("footer", {
      className: "online-combat-modal__footer"
    }, /*#__PURE__*/React.createElement("p", null, canSave ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "✦"), " ", modal.data.targetType === 'global' ? 'Efecto global' : `Objetivo: ${selectedTarget?.name}`) : 'Completa el nombre y el objetivo para continuar.'), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: !canSave,
      onClick: onSave,
      className: "is-primary"
    }, modal.effectId ? 'Guardar cambios' : 'Añadir efecto'))));
  };
  const OnlineHpModal = ({
    modal,
    entity,
    onChange,
    onClose,
    onConfirm,
    busy,
    allowMax = false,
    accent = 'red'
  }) => {
    if (!modal?.isOpen || !entity) return null;
    const current = window.DndOnlineTableUtils.getHpValues(entity);
    const amount = Math.max(0, Number(modal.amount) || 0);
    let preview = {
      ...current
    };
    if (modal.mode === 'damage') {
      const absorbed = Math.min(current.tempHp, amount);
      preview = {
        ...current,
        tempHp: current.tempHp - absorbed,
        currentHp: Math.max(0, current.currentHp - (amount - absorbed))
      };
    } else if (modal.mode === 'healing') preview = {
      ...current,
      currentHp: Math.min(current.maxHp, current.currentHp + amount)
    };else if (modal.mode === 'temp') preview = {
      ...current,
      tempHp: amount
    };else if (modal.mode === 'max') preview = {
      ...current,
      maxHp: amount,
      currentHp: Math.min(current.currentHp, amount)
    };else preview = {
      ...current,
      currentHp: Math.min(current.maxHp, amount)
    };
    const modes = [['damage', '↓', 'Daño', 'Resta PV y absorbe vida temporal'], ['healing', '+', 'Curación', 'Recupera sin superar el máximo'], ['temp', '◇', 'Vida temporal', 'Sustituye el valor temporal'], ['exact', '=', 'Valor exacto', 'Fija directamente los PV actuales'], ...(allowMax ? [['max', '◆', 'Vida máxima', 'Cambia el límite de PV']] : [])];
    const currentPercent = current.maxHp > 0 ? Math.min(100, current.currentHp / current.maxHp * 100) : 0;
    const previewPercent = preview.maxHp > 0 ? Math.min(100, preview.currentHp / preview.maxHp * 100) : 0;
    const suggestedAmounts = [...new Set([1, 5, 10, modal.mode === 'healing' ? Math.max(0, current.maxHp - current.currentHp) : modal.mode === 'exact' ? current.maxHp : modal.mode === 'max' ? current.maxHp : null].filter(value => Number.isFinite(value) && value > 0))];
    const setAmount = value => onChange(previous => ({
      ...previous,
      amount: String(Math.max(0, Number(value) || 0))
    }));
    return /*#__PURE__*/React.createElement("div", {
      className: `online-combat-modal-overlay is-health is-${accent}`,
      onMouseDown: event => {
        if (event.target === event.currentTarget) onClose?.();
      }
    }, /*#__PURE__*/React.createElement("article", {
      className: "online-combat-modal health-editor",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "health-editor-title"
    }, /*#__PURE__*/React.createElement("header", {
      className: "online-combat-modal__header"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "♥"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Control de puntos de golpe"), /*#__PURE__*/React.createElement("h3", {
      id: "health-editor-title"
    }, "Modificar vida"), /*#__PURE__*/React.createElement("p", null, entity.name || 'Personaje')), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose,
      "aria-label": "Cerrar"
    }, "×")), /*#__PURE__*/React.createElement("div", {
      className: "health-editor__current"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Estado actual"), /*#__PURE__*/React.createElement("strong", null, current.currentHp, /*#__PURE__*/React.createElement("em", null, "/ ", current.maxHp, " PV"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Temporales"), /*#__PURE__*/React.createElement("strong", {
      className: "is-temp"
    }, current.tempHp)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      style: {
        width: `${currentPercent}%`
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "online-combat-modal__body"
    }, /*#__PURE__*/React.createElement("section", {
      className: "health-editor__modes"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("small", null, "Tipo de cambio"), /*#__PURE__*/React.createElement("strong", null, "¿Qué ha ocurrido?")), /*#__PURE__*/React.createElement("div", null, modes.map(([mode, icon, label, help]) => /*#__PURE__*/React.createElement("button", {
      key: mode,
      type: "button",
      onClick: () => onChange(previous => ({
        ...previous,
        mode
      })),
      className: modal.mode === mode ? 'is-selected' : ''
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, label), /*#__PURE__*/React.createElement("small", null, help)), /*#__PURE__*/React.createElement("b", {
      "aria-hidden": "true"
    }, modal.mode === mode ? '◆' : ''))))), /*#__PURE__*/React.createElement("section", {
      className: "health-editor__amount"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Cantidad"), /*#__PURE__*/React.createElement("strong", null, "Introduce el valor")), /*#__PURE__*/React.createElement("div", {
      className: "health-editor__quick"
    }, suggestedAmounts.map(value => /*#__PURE__*/React.createElement("button", {
      key: value,
      type: "button",
      onClick: () => setAmount(value)
    }, value, modal.mode === 'healing' && value === current.maxHp - current.currentHp ? ' (todo)' : '')))), /*#__PURE__*/React.createElement("div", {
      className: "health-editor__stepper"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setAmount(amount - 1),
      "aria-label": "Reducir cantidad"
    }, "−"), /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      type: "number",
      inputMode: "numeric",
      min: "0",
      value: modal.amount,
      onChange: event => onChange(previous => ({
        ...previous,
        amount: event.target.value
      })),
      "aria-label": "Cantidad de puntos de golpe"
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setAmount(amount + 1),
      "aria-label": "Aumentar cantidad"
    }, "+"))), /*#__PURE__*/React.createElement("section", {
      className: "health-editor__preview"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("small", null, "Resultado antes de confirmar"), /*#__PURE__*/React.createElement("strong", null, current.currentHp === preview.currentHp && current.tempHp === preview.tempHp && current.maxHp === preview.maxHp ? 'Sin cambios' : 'Vista previa')), /*#__PURE__*/React.createElement("div", {
      className: "health-editor__comparison"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Antes"), /*#__PURE__*/React.createElement("strong", null, current.currentHp, "/", current.maxHp), current.tempHp > 0 && /*#__PURE__*/React.createElement("em", null, "+", current.tempHp, " temporal")), /*#__PURE__*/React.createElement("b", {
      "aria-hidden": "true"
    }, "→"), /*#__PURE__*/React.createElement("span", {
      className: "is-result"
    }, /*#__PURE__*/React.createElement("small", null, "Después"), /*#__PURE__*/React.createElement("strong", null, preview.currentHp, "/", preview.maxHp), preview.tempHp > 0 && /*#__PURE__*/React.createElement("em", null, "+", preview.tempHp, " temporal"))), /*#__PURE__*/React.createElement("div", {
      className: "health-editor__preview-bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: `${previewPercent}%`
      }
    })))), /*#__PURE__*/React.createElement("footer", {
      className: "online-combat-modal__footer"
    }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "♥"), " El cambio se sincronizará con la ficha compartida."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy,
      onClick: onConfirm,
      className: "is-primary"
    }, busy ? 'Actualizando…' : 'Confirmar cambio'))));
  };
  const OnlineTacticalDetailPanel = ({
    selected,
    isEnemy,
    privateData,
    hp,
    hpPercent = 0,
    canSeeHp,
    canEdit,
    conditions = [],
    effects = [],
    currentUid,
    onAvatarPreview,
    onEditEnemy,
    onDeleteEnemy,
    onOpenHealth,
    onQuickHp,
    onDefeat,
    onAddCondition,
    onRemoveCondition,
    onAddEffect,
    onAdjustEffect,
    onFinishEffect,
    canManageEffect
  }) => {
    const [referenceOpen, setReferenceOpen] = React.useState(false);
    React.useEffect(() => setReferenceOpen(false), [selected?.id]);
    React.useEffect(() => {
      if (!referenceOpen) return undefined;
      const closeOnEscape = event => {
        if (event.key === 'Escape') setReferenceOpen(false);
      };
      window.addEventListener('keydown', closeOnEscape);
      return () => window.removeEventListener('keydown', closeOnEscape);
    }, [referenceOpen]);
    if (!selected) return /*#__PURE__*/React.createElement("aside", {
      className: "tactical-detail-panel online-tactical-detail is-empty"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◇"), /*#__PURE__*/React.createElement("strong", null, "Selecciona un combatiente"), /*#__PURE__*/React.createElement("p", null, "Elige a alguien en el orden para consultar su estado y las acciones disponibles."));
    const armorClass = isEnemy ? privateData?.armorClass : selected.armorClass;
    const isCompanion = selected.type === 'companion';
    const companionLabels = {
      familiar: 'Familiar',
      animal: 'Compañero animal',
      construct: 'Constructo',
      mount: 'Montura',
      summon: 'Invocación',
      other: 'Compañero'
    };
    const typeLabel = isEnemy ? 'Enemigo' : isCompanion ? `${companionLabels[selected.category] || 'Compañero'}${selected.ownerUid === currentUid ? ' bajo tu control' : ' del grupo'}` : selected.ownerUid === currentUid ? 'Tu personaje' : 'Personaje del grupo';
    const hpTone = hp?.maxHp > 0 && hp.currentHp / hp.maxHp <= .25 ? 'is-critical' : hp?.maxHp > 0 && hp.currentHp / hp.maxHp <= .5 ? 'is-wounded' : '';
    const hasPrivateReference = isEnemy && canEdit && Boolean(String(privateData?.notes || '').trim());
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("aside", {
      className: `tactical-detail-panel online-tactical-detail ${isEnemy ? 'is-enemy' : isCompanion ? 'is-companion' : 'is-player'} ${hpTone}`,
      "aria-label": `Detalle de ${selected.name || 'combatiente'}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-tactical-detail__frame-label"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      "aria-hidden": "true"
    }), "Detalle del combatiente"), /*#__PURE__*/React.createElement("b", null, "Seleccionado")), /*#__PURE__*/React.createElement("header", {
      className: "online-tactical-detail__hero"
    }, /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
      combatant: selected,
      className: "h-20 w-20 text-2xl",
      onAvatarPreview: onAvatarPreview
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, typeLabel), /*#__PURE__*/React.createElement("h4", null, selected.name || 'Combatiente'), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", null, "Iniciativa ", selected.initiative ?? '—'), /*#__PURE__*/React.createElement("span", null, isEnemy ? selected.visibleState || 'Estado oculto' : selected.presenceLabel || 'Desconectado'))), isEnemy && canEdit && /*#__PURE__*/React.createElement("div", {
      className: "online-tactical-detail__enemy-actions"
    }, hasPrivateReference && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setReferenceOpen(true),
      className: "is-reference"
    }, "Ver ficha"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onEditEnemy
    }, "Editar"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onDeleteEnemy,
      className: "is-danger"
    }, "Eliminar"))), /*#__PURE__*/React.createElement("div", {
      className: "online-tactical-detail__body"
    }, /*#__PURE__*/React.createElement("section", {
      className: "online-tactical-detail__vitals"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Estado de combate"), /*#__PURE__*/React.createElement("strong", null, "Resumen táctico")), /*#__PURE__*/React.createElement("span", {
      className: `online-tactical-detail__health-state ${hpTone}`
    }, canSeeHp && hp ? hpPercent <= 0 ? 'Sin puntos de golpe' : hpPercent <= 25 ? 'Estado crítico' : hpPercent <= 50 ? 'Herido' : 'Estable' : 'Vida oculta')), /*#__PURE__*/React.createElement("div", {
      className: "online-tactical-detail__health-display"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-tactical-detail__health-orb",
      style: {
        '--health-progress': `${Math.max(0, Math.min(100, hpPercent)) * 3.6}deg`
      }
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV"), /*#__PURE__*/React.createElement("strong", null, canSeeHp && hp ? hp.currentHp : '—'), /*#__PURE__*/React.createElement("em", null, canSeeHp && hp ? `/ ${hp.maxHp}` : 'ocultos'))), /*#__PURE__*/React.createElement("div", {
      className: "online-tactical-detail__health-summary"
    }, /*#__PURE__*/React.createElement("small", null, "Reserva de vitalidad"), /*#__PURE__*/React.createElement("strong", null, canSeeHp && hp ? `${hp.currentHp} de ${hp.maxHp} puntos de golpe` : 'El Máster mantiene esta información oculta'), /*#__PURE__*/React.createElement("div", {
      className: "online-tactical-detail__hp",
      role: "progressbar",
      "aria-label": `Puntos de golpe de ${selected.name}`,
      "aria-valuemin": "0",
      "aria-valuemax": canSeeHp && hp ? hp.maxHp : undefined,
      "aria-valuenow": canSeeHp && hp ? hp.currentHp : undefined
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: `${hpPercent}%`
      }
    })), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", null, canSeeHp && hp && hp.tempHp > 0 ? `+${hp.tempHp} PV temporales` : 'Sin PV temporales'), /*#__PURE__*/React.createElement("b", null, canSeeHp && hp ? `${Math.round(hpPercent)}%` : '—')))), /*#__PURE__*/React.createElement("div", {
      className: "online-tactical-detail__metrics is-compact"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Clase de armadura"), /*#__PURE__*/React.createElement("strong", null, armorClass ?? '—'), /*#__PURE__*/React.createElement("em", null, "CA")), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Orden de turno"), /*#__PURE__*/React.createElement("strong", null, selected.initiative ?? '—'), /*#__PURE__*/React.createElement("em", null, "Iniciativa"))), canEdit && canSeeHp && hp && /*#__PURE__*/React.createElement("div", {
      className: "online-tactical-detail__health-controls"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => onQuickHp?.(-1),
      className: "is-damage",
      "aria-label": `Restar un punto de golpe a ${selected.name}`
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "−"), /*#__PURE__*/React.createElement("strong", null, "Restar 1"), /*#__PURE__*/React.createElement("small", null, "Daño rápido")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onOpenHealth,
      className: "is-primary"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "♥"), /*#__PURE__*/React.createElement("strong", null, "Modificar PV"), /*#__PURE__*/React.createElement("small", null, "Abrir control completo")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => onQuickHp?.(1),
      className: "is-healing",
      "aria-label": `Sumar un punto de golpe a ${selected.name}`
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "+"), /*#__PURE__*/React.createElement("strong", null, "Sumar 1"), /*#__PURE__*/React.createElement("small", null, "Curación rápida")), isEnemy && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onDefeat,
      className: "is-defeat"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◇"), /*#__PURE__*/React.createElement("strong", null, "Marcar como derrotado")))), /*#__PURE__*/React.createElement("div", {
      className: "online-tactical-detail__status-grid"
    }, /*#__PURE__*/React.createElement("section", {
      className: "online-tactical-detail__conditions"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Estados aplicados"), /*#__PURE__*/React.createElement("strong", null, "Condiciones ", /*#__PURE__*/React.createElement("b", null, conditions.length))), canEdit && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onAddCondition
    }, "+\xA0 Añadir")), /*#__PURE__*/React.createElement("div", null, conditions.map(condition => /*#__PURE__*/React.createElement("span", {
      key: condition.id
    }, /*#__PURE__*/React.createElement("i", {
      "aria-hidden": "true"
    }), condition.name, canEdit && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => onRemoveCondition?.(condition.id),
      "aria-label": `Quitar ${condition.name}`
    }, "×"))), !conditions.length && /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "✓"), " Sin condiciones activas"))), /*#__PURE__*/React.createElement("section", {
      className: "online-tactical-detail__effects"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Duraciones y recordatorios"), /*#__PURE__*/React.createElement("strong", null, "Efectos ", /*#__PURE__*/React.createElement("b", null, effects.length))), canEdit && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onAddEffect
    }, "+\xA0 Añadir")), /*#__PURE__*/React.createElement("div", null, effects.map(effect => {
      const manageable = canManageEffect?.(effect);
      return /*#__PURE__*/React.createElement("article", {
        key: effect.id
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, effect.name), /*#__PURE__*/React.createElement("span", null, effect.remaining === null ? 'Duración manual' : `${effect.remaining} ${effect.durationType}`, effect.requiresConcentration || effect.concentration ? ' · Concentración' : '')), manageable && /*#__PURE__*/React.createElement("nav", {
        "aria-label": `Controles de ${effect.name}`
      }, effect.remaining !== null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onAdjustEffect?.(effect, -1),
        "aria-label": "Reducir duración"
      }, "−"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onAdjustEffect?.(effect, 1),
        "aria-label": "Aumentar duración"
      }, "+")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onFinishEffect?.(effect),
        className: "is-finish"
      }, "Finalizar")));
    }), !effects.length && /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◇"), " Sin efectos activos")))))), referenceOpen && hasPrivateReference && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
      className: "online-combat-modal-overlay is-enemy-reference",
      onMouseDown: event => {
        if (event.target === event.currentTarget) setReferenceOpen(false);
      }
    }, /*#__PURE__*/React.createElement("article", {
      className: "online-combat-modal enemy-reference-modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "enemy-reference-title"
    }, /*#__PURE__*/React.createElement("header", {
      className: "online-combat-modal__header"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◈"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Consulta privada del Máster"), /*#__PURE__*/React.createElement("h3", {
      id: "enemy-reference-title"
    }, selected.name || 'Ficha del enemigo'), /*#__PURE__*/React.createElement("p", null, "Información de referencia fuera del panel operativo del combate.")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setReferenceOpen(false),
      "aria-label": "Cerrar ficha"
    }, "×")), /*#__PURE__*/React.createElement("div", {
      className: "online-combat-modal__body enemy-reference-modal__body"
    }, /*#__PURE__*/React.createElement("section", {
      className: "enemy-reference-modal__stats"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV máximos"), /*#__PURE__*/React.createElement("strong", null, privateData?.maxHp ?? '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Clase de armadura"), /*#__PURE__*/React.createElement("strong", null, privateData?.armorClass ?? '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Iniciativa"), /*#__PURE__*/React.createElement("strong", null, selected.initiative ?? '—'))), /*#__PURE__*/React.createElement("section", {
      className: "enemy-reference-modal__notes"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("small", null, "Ficha y notas privadas"), /*#__PURE__*/React.createElement("strong", null, "Datos del monstruo")), /*#__PURE__*/React.createElement("pre", null, privateData.notes))), /*#__PURE__*/React.createElement("footer", {
      className: "online-combat-modal__footer"
    }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◈"), " Esta información solo es visible para el Máster."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setReferenceOpen(false)
    }, "Cerrar"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "is-primary",
      onClick: () => {
        setReferenceOpen(false);
        onEditEnemy?.();
      }
    }, "Editar enemigo")))), document.body));
  };
  window.DndOnlineComponents = {
    EnemyModal,
    OnlineCampaignLobby,
    OnlineConditionModal,
    OnlineEffectModal,
    OnlineGroupRoster,
    OnlineHpModal,
    OnlineCombatantAvatar,
    OnlinePartyOverview,
    OnlinePlayerSheetModal,
    OnlineRoomModuleSelector,
    OnlineTacticalDetailPanel
  };
})();