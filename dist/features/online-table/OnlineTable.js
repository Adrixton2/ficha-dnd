(() => {
  (() => {
    const {
      calculateCharacterArmorClass,
      isValidPortraitDataUrl
    } = window.DndAppUtils;
    const {
      getHpValues,
      isValidOnlinePlayerName,
      normalizeOnlineConditions,
      normalizeOnlinePlayerName
    } = window.DndOnlineTableUtils;
    const {
      OnlineCampaignLobby,
      OnlineGroupRoster,
      OnlinePartyOverview,
      OnlineRoomModuleSelector,
      OnlineTacticalDetailPanel
    } = window.DndOnlineComponents;
    const {
      COMPANION_CATEGORY_LABELS
    } = window.DndCompanionComponents;
    const formatCampaignActivity = value => {
      const timestamp = Number(value) || 0;
      if (!timestamp) return 'Sin actividad reciente';
      const elapsedMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
      if (elapsedMinutes < 2) return 'Actualizada ahora';
      if (elapsedMinutes < 60) return `Actualizada hace ${elapsedMinutes} min`;
      const elapsedHours = Math.round(elapsedMinutes / 60);
      if (elapsedHours < 24) return `Actualizada hace ${elapsedHours} h`;
      return new Intl.DateTimeFormat('es', {
        day: 'numeric',
        month: 'short'
      }).format(new Date(timestamp));
    };
    const campaignStatusLabel = campaign => campaign.status === 'active' ? `Combate · Ronda ${campaign.round || 1}` : campaign.status === 'paused' ? `Combate pausado · Ronda ${campaign.round || 1}` : 'Campaña disponible';
    function OnlineTableShell({
      model
    }) {
      const {
        OnlineCombatantAvatar,
        activateOnlineTableDock,
        addEnemyIdsAfterCurrent,
        addEnemyIdsAtEnd,
        buildPreparedTurnOrder,
        canManageEffect,
        canManageEnemies,
        changeEncounterTurn,
        cloudCampaigns,
        closeOnlineRoom,
        commitParticipantInitiative,
        companionRoomParticipants,
        confirmDelete,
        confirmKickRoomPlayer,
        copyRoomCode,
        createOnlineRoom,
        createdRoomCode,
        currentRoom,
        deleteEffect,
        deleteEnemy,
        encounterActionsOpen,
        encounterBusy,
        encounterCombatants,
        encounterEffects,
        expiredEffectsOpen,
        finishOnlineTableDockDrag,
        firebaseConnectionLabel,
        firebaseError,
        firebaseReady,
        firebaseUser,
        getCombatant,
        hasInitiativeValue,
        hpSyncStatus,
        isCurrentRoomMaster,
        joinOnlineRoom,
        lastOnlineRoom,
        leaveOnlineRoom,
        manager,
        minimizeOnlineTable,
        moveOnlineTableDock,
        movePreparedParticipant,
        onlineEncounterPanel,
        onlineEncounterView,
        onlineRoomModule,
        onlineStatus,
        onlineTableBusy,
        onlineTableContentRef,
        onlineTableDockDragRef,
        onlineTableDockDragging,
        onlineTableDockPosition,
        onlineTableDockRef,
        onlineTableError,
        onlineTableGuideOpen,
        onlineTableMenuOpen,
        onlineTableMotion,
        onlineTableNotice,
        onlineTableOpen,
        onlineTableScreen,
        onlineTableScrollPositionsRef,
        onlineTableView,
        onlineTableViewContentRef,
        openCharacterSelector,
        openCloudCampaign,
        openConditionModal,
        openEffectModal,
        openEnemyModal,
        openOwnCharacterFromEncounter,
        openParticipantHpModal,
        outsideEncounterEnemyIds,
        ownRoomParticipant,
        participantInitiativeDrafts,
        participantName,
        permanentlyDeleteEffect,
        playerNameInput,
        playerRoomParticipants,
        postponeCurrentTurn,
        postponeOpen,
        preparedTurnOrder,
        privateEnemies,
        publicCombatants,
        removeOnlineCondition,
        returnToCampaignHub,
        retryPendingHpSync,
        roomCodeInput,
        roomData,
        roomInvite,
        roomMembers,
        roomParticipants,
        roomPlayerSheets,
        saveOnlineTableViewScroll,
        selectedCombatantId,
        setCreatedRoomCode,
        setEncounterActionsOpen,
        setEncounterSetupOpen,
        setEncounterStatus,
        setEnemyHpModal,
        setExpiredEffectsOpen,
        setFinishEncounterPrompt,
        setOnlineAvatarViewer,
        setOnlineEncounterPanel,
        setOnlineEncounterView,
        setOnlinePlayerSheetId,
        setOnlineRoomModule,
        setOnlineTableError,
        setOnlineTableGuideOpen,
        setOnlineTableMenuOpen,
        setOnlineTableNotice,
        setOnlineTableOpen,
        setOnlineTableScreen,
        setOutsideEncounterEnemyIds,
        setParticipantInitiativeDrafts,
        setPlayerNameInput,
        setPostponeOpen,
        setRoomCodeInput,
        setRoomInvite,
        setSelectedCombatantId,
        setShareCharacterOpen,
        shareCharacterOpen,
        shareLocalCharacter,
        shareRoomLink,
        shareRoomWithSystem,
        sharedCharacter,
        sharedCharacterId,
        sharingCharacter,
        sheetSyncStatus,
        shouldShowEncounter,
        startEncounter,
        startOnlineTableDockDrag,
        togglePreparedParticipant,
        updateEffectRemaining,
        updateEnemyHp,
        updateParticipantHp,
        updateSharedCharacter
      } = model;
      const [campaignNameInput, setCampaignNameInput] = React.useState('');
      return /*#__PURE__*/React.createElement(React.Fragment, null, currentRoom && roomData && roomData.status !== 'closed' && !onlineTableOpen && ReactDOM.createPortal(/*#__PURE__*/React.createElement("button", {
        ref: onlineTableDockRef,
        type: "button",
        onClick: activateOnlineTableDock,
        onPointerDown: startOnlineTableDockDrag,
        onPointerMove: moveOnlineTableDock,
        onPointerUp: finishOnlineTableDockDrag,
        onPointerCancel: event => {
          finishOnlineTableDockDrag(event);
          onlineTableDockDragRef.current.suppressClick = false;
        },
        onDragStart: event => event.preventDefault(),
        style: onlineTableDockPosition ? {
          left: `${onlineTableDockPosition.left}px`,
          top: `${onlineTableDockPosition.top}px`,
          right: 'auto',
          bottom: 'auto'
        } : undefined,
        className: `online-table-dock ${onlineTableDockDragging ? 'is-dragging' : ''} ${onlineTableDockPosition ? 'is-positioned' : ''}`,
        "aria-label": `Maximizar Mesa Online, sala ${currentRoom.code}. También puedes arrastrar este botón para moverlo.`,
        title: "Arrastra para mover · pulsa para volver a la Mesa Online"
      }, /*#__PURE__*/React.createElement("span", {
        className: "online-table-dock__drag-hint",
        "aria-hidden": "true"
      }, "⠿"), /*#__PURE__*/React.createElement("span", {
        className: `online-table-dock__emblem ${shouldShowEncounter ? 'is-encounter' : ''} ${!onlineStatus ? 'is-offline' : ''}`,
        "aria-hidden": "true"
      }, shouldShowEncounter ? '⚔' : '◆', /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("span", {
        className: "online-table-dock__copy"
      }, /*#__PURE__*/React.createElement("small", null, !onlineStatus ? 'Sin conexión · datos locales' : roomData.status === 'paused' ? 'Encuentro pausado' : shouldShowEncounter ? `Ronda ${roomData.round || 1}` : 'Sala conectada'), /*#__PURE__*/React.createElement("strong", null, "Mesa ", currentRoom.code), /*#__PURE__*/React.createElement("em", null, isCurrentRoomMaster ? 'Máster' : 'Jugador', " · Pulsa para volver · Arrastra para mover")), /*#__PURE__*/React.createElement("span", {
        className: "online-table-dock__expand",
        "aria-hidden": "true"
      }, "↗")), document.body), onlineTableOpen && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
        onMouseDown: event => {
          if (event.target === event.currentTarget && onlineTableView === 'start' && onlineTableScreen === 'menu') setOnlineTableOpen(false);
        },
        className: `online-table-overlay fixed inset-0 z-[60] bg-black/80 backdrop-blur-md ${onlineTableView === 'start' && onlineTableScreen === 'menu' ? 'is-launcher' : 'is-session'} is-${onlineTableMotion}`
      }, /*#__PURE__*/React.createElement("div", {
        className: `online-table-screen online-table-panel ${onlineTableView === 'start' && onlineTableScreen === 'menu' ? 'is-launcher' : 'is-session'}`,
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("header", {
        className: "online-table-header flex items-center justify-between gap-3 border-b border-gray-700 bg-gray-950/95 px-3 py-3 backdrop-blur-md sm:px-4"
      }, (() => {
        const isJoining = onlineTableView === 'start' && onlineTableScreen === 'join';
        const isCreating = onlineTableView === 'start' && onlineTableScreen === 'create';
        const isCreated = onlineTableView === 'start' && onlineTableScreen === 'created';
        const isEncounter = onlineTableView === 'encounter';
        const headerIcon = isJoining ? '↳' : isCreating ? '✦' : isCreated ? '✓' : isEncounter ? '⚔' : currentRoom ? '◆' : '◈';
        const eyebrow = isJoining ? 'Acceso de jugador' : isCreating ? 'Nueva aventura' : isCreated ? 'Creación completada' : isEncounter ? `Ronda ${roomData?.round || 1}` : currentRoom ? 'Campaña conectada' : 'Tus partidas compartidas';
        const title = isJoining ? 'Unirse a una campaña' : isCreating ? 'Crear campaña' : isCreated ? 'Campaña lista para jugar' : isEncounter ? onlineEncounterView === 'participants' ? 'Fichas del grupo' : onlineEncounterView === 'effects' ? 'Efectos del encuentro' : 'Mesa de iniciativa' : currentRoom ? roomData?.name || `Mesa ${currentRoom.code}` : 'Mesa Online';
        const description = isJoining ? 'Introduce el código que te ha enviado el Máster' : isCreating ? 'Ponle un nombre reconocible para encontrarla después' : isCreated ? `Comparte el código ${createdRoomCode} y entra como Máster` : isEncounter ? onlineEncounterView === 'participants' ? 'Consulta la información compartida por los jugadores' : onlineEncounterView === 'effects' ? 'Controla condiciones, concentración y duraciones' : `Turno de ${participantName(roomData?.currentTurnId)}` : currentRoom ? isCurrentRoomMaster ? 'Gestionando la partida como Máster' : 'Participando como jugador' : 'Elige una campaña o comienza una nueva';
        return /*#__PURE__*/React.createElement("div", {
          className: "online-table-header-identity"
        }, /*#__PURE__*/React.createElement("span", {
          className: `online-table-header-emblem ${isCreated ? 'is-success' : isEncounter ? 'is-encounter' : ''}`,
          "aria-hidden": "true"
        }, headerIcon), /*#__PURE__*/React.createElement("div", {
          className: "online-table-header-copy"
        }, /*#__PURE__*/React.createElement("small", null, eyebrow), /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("p", null, description)), /*#__PURE__*/React.createElement("div", {
          className: "online-table-header-status",
          "aria-label": "Estado de la Mesa Online"
        }, /*#__PURE__*/React.createElement("span", {
          className: firebaseReady && firebaseUser ? 'is-online' : firebaseError ? 'is-error' : ''
        }, /*#__PURE__*/React.createElement("i", null), firebaseConnectionLabel), currentRoom && /*#__PURE__*/React.createElement("span", {
          className: isCurrentRoomMaster ? 'is-master' : 'is-player'
        }, isCurrentRoomMaster ? 'Máster' : 'Jugador'), roomData?.status === 'paused' && /*#__PURE__*/React.createElement("span", {
          className: "is-paused"
        }, "Pausada")));
      })(), /*#__PURE__*/React.createElement("div", {
        className: "relative flex shrink-0 items-center gap-2"
      }, currentRoom && onlineTableView !== 'closed' && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setOnlineTableMenuOpen(previous => !previous),
        className: "h-11 w-11 rounded border border-gray-600 text-xl leading-none text-gray-200 hover:border-cyan-400 hover:bg-gray-800",
        "aria-label": "Más acciones de Mesa online",
        "aria-expanded": onlineTableMenuOpen
      }, "⋯"), onlineTableMenuOpen && currentRoom && onlineTableView !== 'closed' && /*#__PURE__*/React.createElement("div", {
        className: "absolute right-0 top-12 z-30 w-52 rounded border border-gray-600 bg-gray-950 p-1.5 shadow-xl"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          copyRoomCode(currentRoom.code);
          setOnlineTableMenuOpen(false);
        },
        className: "w-full rounded px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
      }, "Copiar código"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          shareRoomLink(currentRoom.code);
          setOnlineTableMenuOpen(false);
        },
        className: "w-full rounded px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
      }, "Compartir enlace"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          returnToCampaignHub();
          setOnlineTableMenuOpen(false);
        },
        className: "w-full rounded px-3 py-2 text-left text-sm text-cyan-100 hover:bg-cyan-950/30"
      }, "Cambiar de campaña"), isCurrentRoomMaster && roomData?.status !== 'closed' ? /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          closeOnlineRoom();
          setOnlineTableMenuOpen(false);
        },
        className: "w-full rounded px-3 py-2 text-left text-sm text-red-200 hover:bg-red-950/40"
      }, "Cerrar campaña definitivamente") : /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          confirmDelete('¿Abandonar esta campaña? Dejará de aparecer en tu lista y necesitarás otra invitación para volver.', leaveOnlineRoom);
          setOnlineTableMenuOpen(false);
        },
        className: "w-full rounded px-3 py-2 text-left text-sm text-red-200 hover:bg-red-950/40"
      }, "Abandonar campaña")), currentRoom ? /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: minimizeOnlineTable,
        className: "online-table-dismiss is-session",
        "aria-label": "Minimizar Mesa Online y volver a la ficha; la sala seguirá activa",
        title: "Minimizar; la sala seguirá activa"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "↙"), /*#__PURE__*/React.createElement("strong", {
        className: "is-full"
      }, "Volver a la ficha"), /*#__PURE__*/React.createElement("strong", {
        className: "is-compact"
      }, "Ficha")) : /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setOnlineTableOpen(false),
        className: "online-table-dismiss is-close",
        "aria-label": "Cerrar Mesa online"
      }, "×"))), onlineTableView === 'encounter' && /*#__PURE__*/React.createElement("nav", {
        className: "online-encounter-modules",
        "aria-label": "Funciones del encuentro"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setOnlineEncounterView('encounter'),
        className: onlineEncounterView === 'encounter' ? 'is-active' : ''
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "⚔"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Turnos e iniciativa"), /*#__PURE__*/React.createElement("strong", null, "Combate"))), isCurrentRoomMaster && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setOnlineEncounterView('participants'),
        className: onlineEncounterView === 'participants' ? 'is-active' : ''
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "◇"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Información del grupo"), /*#__PURE__*/React.createElement("strong", null, "Fichas"))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setOnlineEncounterView('effects'),
        className: onlineEncounterView === 'effects' ? 'is-active' : ''
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "✦"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Estados y duraciones"), /*#__PURE__*/React.createElement("strong", null, "Efectos")))), /*#__PURE__*/React.createElement("div", {
        ref: onlineTableContentRef,
        onScroll: event => {
          const previous = onlineTableScrollPositionsRef.current[onlineTableView] || {};
          onlineTableScrollPositionsRef.current[onlineTableView] = {
            ...previous,
            outer: event.currentTarget.scrollTop
          };
        },
        className: `online-table-content is-${onlineTableView} px-3 py-3 sm:px-4`
      }, onlineTableError && /*#__PURE__*/React.createElement("p", {
        className: "online-table-feedback is-error"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "!"), onlineTableError), onlineTableNotice && /*#__PURE__*/React.createElement("p", {
        className: "online-table-feedback is-notice"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "✓"), onlineTableNotice), /*#__PURE__*/React.createElement("div", {
        ref: onlineTableViewContentRef,
        onScroll: saveOnlineTableViewScroll,
        "data-online-table-view": onlineTableView
      }, onlineTableView === 'start' && onlineTableScreen === 'menu' && /*#__PURE__*/React.createElement("div", {
        className: "online-table-launcher-body is-campaign-hub"
      }, /*#__PURE__*/React.createElement("div", {
        className: "online-table-launcher-intro"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "⚔"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Centro de campañas"), /*#__PURE__*/React.createElement("h4", null, "Tus mesas de juego"), /*#__PURE__*/React.createElement("p", null, "Las campañas permanecen vinculadas a tu cuenta. Entrar solo indica que estás disponible para esta sesión."))), /*#__PURE__*/React.createElement("section", {
        className: "online-cloud-campaigns is-hub",
        "aria-labelledby": "online-campaigns-title"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Guardadas en tu cuenta"), /*#__PURE__*/React.createElement("strong", {
        id: "online-campaigns-title"
      }, "Mis campañas")), /*#__PURE__*/React.createElement("span", null, cloudCampaigns.length, " ", cloudCampaigns.length === 1 ? 'campaña' : 'campañas')), cloudCampaigns.length > 0 ? /*#__PURE__*/React.createElement("div", {
        className: "online-campaign-grid"
      }, cloudCampaigns.map(campaign => /*#__PURE__*/React.createElement("button", {
        key: campaign.id,
        type: "button",
        disabled: onlineTableBusy,
        onClick: () => openCloudCampaign(campaign),
        className: `online-campaign-card is-${campaign.status}`
      }, /*#__PURE__*/React.createElement("span", {
        className: "online-campaign-card__crest",
        "aria-hidden": "true"
      }, campaign.role === 'master' ? '♜' : '♟'), /*#__PURE__*/React.createElement("span", {
        className: "online-campaign-card__copy"
      }, /*#__PURE__*/React.createElement("small", null, campaign.role === 'master' ? 'Diriges esta campaña' : `Juegas como ${campaign.playerName || 'jugador'}`), /*#__PURE__*/React.createElement("strong", null, campaign.name), /*#__PURE__*/React.createElement("em", null, /*#__PURE__*/React.createElement("i", {
        className: campaign.status === 'active' ? 'is-active' : ''
      }), campaignStatusLabel(campaign)), /*#__PURE__*/React.createElement("span", null, formatCampaignActivity(campaign.updatedAt), " · Código ", campaign.code)), /*#__PURE__*/React.createElement("b", {
        "aria-hidden": "true"
      }, "Abrir ", /*#__PURE__*/React.createElement("i", null, "→"))))) : /*#__PURE__*/React.createElement("div", {
        className: "online-campaign-empty"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "◇"), /*#__PURE__*/React.createElement("strong", null, "Aún no tienes campañas"), /*#__PURE__*/React.createElement("p", null, "Crea una para dirigir o únete con el código de tu Máster. Después aparecerá siempre aquí."))), lastOnlineRoom && !cloudCampaigns.some(campaign => campaign.id === lastOnlineRoom.id) && /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: onlineTableBusy,
        onClick: () => {
          if (lastOnlineRoom.role === 'player') {
            setRoomCodeInput(lastOnlineRoom.code);
            setPlayerNameInput(lastOnlineRoom.playerName || '');
            setOnlineTableError('');
            setOnlineTableScreen('join');
          } else joinOnlineRoom(lastOnlineRoom.code);
        },
        className: "online-table-rejoin"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Mesa anterior"), /*#__PURE__*/React.createElement("strong", null, "Sala ", lastOnlineRoom.code)), /*#__PURE__*/React.createElement("b", null, "Recuperar acceso")), /*#__PURE__*/React.createElement("div", {
        className: "online-campaign-actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: onlineTableBusy,
        onClick: () => {
          setCampaignNameInput('');
          setOnlineTableError('');
          setOnlineTableScreen('create');
        },
        className: "online-table-launcher-option is-master"
      }, /*#__PURE__*/React.createElement("span", {
        className: "online-table-launcher-option__icon",
        "aria-hidden": "true"
      }, "＋"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Nueva aventura"), /*#__PURE__*/React.createElement("strong", null, "Crear campaña"), /*#__PURE__*/React.createElement("em", null, "Serás el Máster y podrás invitar al grupo.")), /*#__PURE__*/React.createElement("b", {
        "aria-hidden": "true"
      }, "→")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: onlineTableBusy,
        onClick: () => {
          setOnlineTableError('');
          setOnlineTableNotice('');
          setRoomCodeInput('');
          setOnlineTableScreen('join');
        },
        className: "online-table-launcher-option is-player"
      }, /*#__PURE__*/React.createElement("span", {
        className: "online-table-launcher-option__icon",
        "aria-hidden": "true"
      }, "↳"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Tengo un código"), /*#__PURE__*/React.createElement("strong", null, "Unirme a campaña"), /*#__PURE__*/React.createElement("em", null, "Quedará guardada en tu cuenta al entrar.")), /*#__PURE__*/React.createElement("b", {
        "aria-hidden": "true"
      }, "→")))), onlineTableView === 'start' && onlineTableScreen === 'create' && /*#__PURE__*/React.createElement("div", {
        className: "online-create-flow"
      }, /*#__PURE__*/React.createElement("section", {
        className: "online-create-card"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          setOnlineTableError('');
          setOnlineTableScreen('menu');
        },
        className: "online-join-back"
      }, "← Volver a mis campañas"), /*#__PURE__*/React.createElement("div", {
        className: "online-create-heading"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "♜"), /*#__PURE__*/React.createElement("small", null, "Nueva campaña"), /*#__PURE__*/React.createElement("h4", null, "¿Cómo se llama vuestra aventura?"), /*#__PURE__*/React.createElement("p", null, "Usa un nombre que el grupo reconozca. Podrás distinguirla fácilmente de tus otras mesas.")), /*#__PURE__*/React.createElement("label", {
        className: "online-campaign-name-field"
      }, /*#__PURE__*/React.createElement("span", null, "Nombre de la campaña"), /*#__PURE__*/React.createElement("input", {
        autoFocus: true,
        type: "text",
        maxLength: "100",
        value: campaignNameInput,
        onChange: event => setCampaignNameInput(event.target.value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 100)),
        onKeyDown: event => {
          if (event.key === 'Enter' && campaignNameInput.trim().length >= 2 && !onlineTableBusy) createOnlineRoom(campaignNameInput);
        },
        placeholder: "Ej. La maldición de Strahd"
      }), /*#__PURE__*/React.createElement("small", null, "Entre 2 y 100 caracteres.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: onlineTableBusy || campaignNameInput.trim().length < 2,
        onClick: () => createOnlineRoom(campaignNameInput),
        className: "online-create-submit"
      }, onlineTableBusy ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        className: "online-button-spinner"
      }), " Creando campaña…") : /*#__PURE__*/React.createElement(React.Fragment, null, "Crear campaña ", /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "→"))))), onlineTableView === 'start' && onlineTableScreen === 'created' && /*#__PURE__*/React.createElement("div", {
        className: "online-created-flow"
      }, /*#__PURE__*/React.createElement("section", {
        className: "online-created-card",
        "aria-labelledby": "online-created-title"
      }, /*#__PURE__*/React.createElement("div", {
        className: "online-created-success",
        "aria-hidden": "true"
      }, "✓"), /*#__PURE__*/React.createElement("span", {
        className: "online-created-eyebrow"
      }, "Mesa preparada"), /*#__PURE__*/React.createElement("h4", {
        id: "online-created-title"
      }, "La sala ya está lista"), /*#__PURE__*/React.createElement("p", {
        className: "online-created-copy"
      }, "Comparte este código con los jugadores. Después entra como Máster para preparar personajes, enemigos e iniciativa."), /*#__PURE__*/React.createElement("div", {
        className: "online-created-code",
        "aria-label": `Código de sala ${createdRoomCode}`
      }, /*#__PURE__*/React.createElement("small", null, "Código de invitación"), /*#__PURE__*/React.createElement("div", {
        className: "online-created-code__characters",
        "aria-hidden": "true"
      }, createdRoomCode.split('').map((character, index) => /*#__PURE__*/React.createElement("span", {
        key: `${character}-${index}`
      }, character))), /*#__PURE__*/React.createElement("strong", null, createdRoomCode)), /*#__PURE__*/React.createElement("div", {
        className: "online-created-share-actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => copyRoomCode(createdRoomCode)
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "▣"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Copiar código"), /*#__PURE__*/React.createElement("small", null, "Solo los 6 caracteres"))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => shareRoomLink(createdRoomCode)
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "↗"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Invitar jugadores"), /*#__PURE__*/React.createElement("small", null, "Compartir enlace directo")))), /*#__PURE__*/React.createElement("div", {
        className: "online-created-next"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "1"), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Siguiente paso"), " Entra en la sala y espera a que los jugadores compartan sus personajes.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: onlineTableBusy,
        onClick: () => {
          joinOnlineRoom(createdRoomCode);
          setCreatedRoomCode('');
        },
        className: "online-created-enter"
      }, onlineTableBusy ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        className: "online-button-spinner"
      }), " Entrando como Máster…") : /*#__PURE__*/React.createElement(React.Fragment, null, "Entrar como Máster ", /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "→"))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setOnlineTableOpen(false),
        className: "online-created-later"
      }, "Cerrar y entrar más tarde"))), onlineTableView === 'start' && onlineTableScreen === 'join' && /*#__PURE__*/React.createElement("div", {
        className: "online-join-flow"
      }, /*#__PURE__*/React.createElement("section", {
        className: "online-join-card"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          setOnlineTableError('');
          setOnlineTableScreen('menu');
        },
        className: "online-join-back"
      }, "← Volver"), /*#__PURE__*/React.createElement("div", {
        className: "online-join-heading"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "♟"), /*#__PURE__*/React.createElement("small", null, "Entrar como jugador"), /*#__PURE__*/React.createElement("h4", null, "Identifícate y entra en la sala"), /*#__PURE__*/React.createElement("p", null, "El Máster verá tu nombre junto al personaje que compartas.")), /*#__PURE__*/React.createElement("label", {
        className: "online-player-name-field"
      }, /*#__PURE__*/React.createElement("span", null, "Tu nombre de jugador"), /*#__PURE__*/React.createElement("input", {
        autoFocus: true,
        type: "text",
        autoComplete: "nickname",
        maxLength: "40",
        value: playerNameInput,
        onChange: event => {
          setOnlineTableError('');
          setPlayerNameInput(event.target.value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 40));
        },
        onBlur: () => setPlayerNameInput(normalizeOnlinePlayerName(playerNameInput)),
        onKeyDown: event => {
          if (event.key === 'Enter' && isValidOnlinePlayerName(playerNameInput) && [6, 8, 12].includes(roomCodeInput.length) && !onlineTableBusy) joinOnlineRoom();
        },
        placeholder: "Ej. Adrián"
      }), /*#__PURE__*/React.createElement("small", null, "Usa el nombre por el que te conoce el grupo.")), /*#__PURE__*/React.createElement("label", {
        className: "online-room-code-field"
      }, /*#__PURE__*/React.createElement("span", {
        className: "sr-only"
      }, "Código de sala"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        inputMode: "text",
        autoComplete: "off",
        autoCapitalize: "characters",
        spellCheck: "false",
        maxLength: "12",
        value: roomCodeInput,
        onChange: event => {
          setOnlineTableError('');
          setRoomCodeInput(normalizeRoomCode(event.target.value));
        },
        onKeyDown: event => {
          if (event.key === 'Enter' && isValidOnlinePlayerName(playerNameInput) && [6, 8, 12].includes(roomCodeInput.length) && !onlineTableBusy) joinOnlineRoom();
        },
        placeholder: "ABCD2345WXYZ",
        "aria-describedby": "online-room-code-help"
      }), /*#__PURE__*/React.createElement("span", {
        className: "online-room-code-count"
      }, roomCodeInput.length, "/12")), /*#__PURE__*/React.createElement("p", {
        id: "online-room-code-help",
        className: "online-room-code-help"
      }, "Puedes escribirlo o pegarlo. No distingue entre mayúsculas y minúsculas."), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: onlineTableBusy || !isValidOnlinePlayerName(playerNameInput) || ![6, 8, 12].includes(roomCodeInput.length),
        onClick: () => joinOnlineRoom(),
        className: "online-join-submit"
      }, onlineTableBusy ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        className: "online-button-spinner"
      }), " Conectando con la mesa…") : /*#__PURE__*/React.createElement(React.Fragment, null, "Entrar en la sala ", /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "→"))), playerNameInput.length > 0 && !isValidOnlinePlayerName(playerNameInput) && /*#__PURE__*/React.createElement("p", {
        className: "online-room-code-pending"
      }, "El nombre debe tener al menos 2 caracteres."), roomCodeInput.length > 0 && ![6, 8, 12].includes(roomCodeInput.length) && /*#__PURE__*/React.createElement("p", {
        className: "online-room-code-pending"
      }, "El código debe tener 6, 8 o 12 caracteres."))), onlineTableView === 'lobby' && shareCharacterOpen && (() => {
        const characters = Object.values(manager.characters);
        return /*#__PURE__*/React.createElement("section", {
          className: "online-character-picker"
        }, /*#__PURE__*/React.createElement("header", {
          className: "online-character-picker__header"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "♙"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Tu identidad en esta mesa"), /*#__PURE__*/React.createElement("h4", null, "Elige el personaje que vas a compartir"), /*#__PURE__*/React.createElement("p", null, "El Máster podrá consultar su resumen, combate, conjuros y mochila en tiempo real.")), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setShareCharacterOpen(false)
        }, "Volver a la sala")), /*#__PURE__*/React.createElement("div", {
          className: "online-character-picker__privacy"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "◆"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Compartición segura y en tiempo real"), /*#__PURE__*/React.createElement("p", null, "Las notas personales y el historial no se envían. Inspiración, recursos, espacios de conjuro, vida e inventario se actualizarán automáticamente."))), /*#__PURE__*/React.createElement("div", {
          className: "online-character-picker__grid"
        }, characters.map((character, index) => {
          const data = character.data;
          const name = data.charInfo?.name || character.meta.name || 'Personaje sin nombre';
          const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'PJ';
          const selected = sharedCharacterId === character.meta.id;
          const portrait = isValidPortraitDataUrl(character.meta?.portrait) ? character.meta.portrait : '';
          const hpCurrent = Math.max(0, Number(data.hp?.current) || 0);
          const hpMax = Math.max(0, Number(data.hp?.max) || 0);
          const hpPercent = hpMax > 0 ? Math.min(100, hpCurrent / hpMax * 100) : 0;
          return /*#__PURE__*/React.createElement("article", {
            key: character.meta.id,
            className: `online-character-picker__card ${selected ? 'is-selected' : ''} ${data.inspiration ? 'is-inspired' : ''}`,
            style: {
              '--picker-delay': `${Math.min(index, 8) * 45}ms`
            }
          }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
            className: "online-character-picker__portrait"
          }, portrait ? /*#__PURE__*/React.createElement("img", {
            src: portrait,
            alt: ""
          }) : initials, data.inspiration && /*#__PURE__*/React.createElement("i", {
            "aria-label": "Inspiración disponible"
          }, "✦")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, data.charInfo?.race || 'Linaje sin indicar'), /*#__PURE__*/React.createElement("strong", null, name), /*#__PURE__*/React.createElement("p", null, data.charInfo?.cls || 'Sin clase', " · Nivel ", data.level || '1')), selected && /*#__PURE__*/React.createElement("b", null, "Compartido")), /*#__PURE__*/React.createElement("div", {
            className: "online-character-picker__stats"
          }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV"), /*#__PURE__*/React.createElement("strong", null, hpCurrent, "/", hpMax)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "CA"), /*#__PURE__*/React.createElement("strong", null, calculateCharacterArmorClass(data))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Estado"), /*#__PURE__*/React.createElement("strong", null, data.conditions?.length ? `${data.conditions.length} estados` : 'Disponible'))), /*#__PURE__*/React.createElement("div", {
            className: "online-character-picker__hp"
          }, /*#__PURE__*/React.createElement("span", {
            style: {
              width: `${hpPercent}%`
            }
          })), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("span", null, selected ? 'Esta es la ficha visible para el Máster' : 'Puedes cambiarla más adelante'), /*#__PURE__*/React.createElement("button", {
            type: "button",
            disabled: sharingCharacter || selected,
            onClick: () => shareLocalCharacter(character.meta.id)
          }, sharingCharacter ? 'Compartiendo…' : selected ? 'Personaje compartido' : 'Usar este personaje', /*#__PURE__*/React.createElement("b", {
            "aria-hidden": "true"
          }, selected ? '✓' : '→'))));
        }), !characters.length && /*#__PURE__*/React.createElement("div", {
          className: "online-character-picker__empty"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "◇"), /*#__PURE__*/React.createElement("strong", null, "No tienes personajes disponibles"), /*#__PURE__*/React.createElement("p", null, "Crea primero un personaje en la ficha para poder compartirlo con la mesa."))));
      })(), (onlineTableView === 'lobby' && !shareCharacterOpen || onlineTableView === 'preparation' || onlineTableView === 'encounter') && /*#__PURE__*/React.createElement("div", {
        className: "online-table-session-flow mt-5 space-y-4"
      }, onlineTableView === 'lobby' && /*#__PURE__*/React.createElement(OnlineRoomModuleSelector, {
        active: onlineRoomModule,
        onSelect: setOnlineRoomModule,
        isMaster: isCurrentRoomMaster,
        encounterActive: shouldShowEncounter
      }), onlineTableView === 'lobby' && onlineRoomModule === 'home' && /*#__PURE__*/React.createElement(OnlineCampaignLobby, {
        roomData: roomData,
        isMaster: isCurrentRoomMaster,
        members: roomMembers,
        participants: [...playerRoomParticipants, ...companionRoomParticipants],
        sheets: roomPlayerSheets,
        enemies: publicCombatants,
        ownParticipant: ownRoomParticipant,
        onSelect: setOnlineRoomModule,
        onInvite: () => shareRoomLink(currentRoom.code),
        onShareCharacter: openCharacterSelector
      }), onlineTableView === 'encounter' && onlineEncounterView === 'encounter' && (() => {
        const connectedPlayers = roomMembers.filter(member => member.role !== 'master' && member.active).length;
        const sharedPlayers = playerRoomParticipants.filter(participant => participant.connected !== false).length;
        const currentCombatant = getCombatant(roomData?.currentTurnId);
        const isOwnTurn = !!currentCombatant && (currentCombatant.ownerUid === firebaseUser?.uid || currentCombatant.id === ownRoomParticipant?.id);
        const lobbySteps = isCurrentRoomMaster ? [{
          label: 'Invitar jugadores',
          done: connectedPlayers > 0,
          detail: connectedPlayers ? `${connectedPlayers} conectados` : 'Comparte el código o enlace'
        }, {
          label: 'Compartir personajes',
          done: sharedPlayers > 0,
          detail: sharedPlayers ? `${sharedPlayers} fichas en la mesa` : 'Cada jugador elige su ficha'
        }, {
          label: 'Elegir una función',
          done: onlineRoomModule !== 'room',
          detail: 'Abre Fichas o Combate cuando lo necesites'
        }] : [{
          label: 'Compartir tu personaje',
          done: !!ownRoomParticipant,
          detail: ownRoomParticipant ? ownRoomParticipant.name || 'Ficha compartida' : 'Elige la ficha que usarás'
        }, {
          label: 'Mantener la ficha sincronizada',
          done: sheetSyncStatus === 'synced',
          detail: sheetSyncStatus === 'synced' ? 'Los cambios llegan al Máster' : 'Revisa el módulo Mi ficha'
        }, {
          label: 'Esperar al Máster',
          done: roomData?.status === 'active',
          detail: 'El encuentro comenzará para todos'
        }];
        const completedSteps = lobbySteps.filter(step => step.done).length;
        const guideTitle = onlineTableView === 'lobby' ? isCurrentRoomMaster ? 'Preparación de la sesión' : 'Antes de empezar' : isOwnTurn ? 'Es tu turno' : isCurrentRoomMaster ? `Dirigiendo el turno de ${currentCombatant?.name || 'un combatiente'}` : `Turno de ${currentCombatant?.name || 'otro combatiente'}`;
        const guideText = onlineTableView === 'lobby' ? isCurrentRoomMaster ? 'Completa estos pasos y prepara el orden cuando todos estén listos.' : 'La mesa te avisará cuando sea tu turno. Puedes dejar preparada tu ficha mientras esperas.' : isOwnTurn ? 'Revisa tus condiciones y efectos, realiza tus acciones en la ficha y avisa al Máster al terminar.' : isCurrentRoomMaster ? 'Gestiona vida, condiciones y efectos; después avanza al siguiente turno.' : 'Puedes consultar el orden, tu personaje y los efectos activos mientras esperas.';
        return /*#__PURE__*/React.createElement("aside", {
          className: `online-session-guide ${isOwnTurn ? 'is-own-turn' : ''}`,
          "aria-label": "Guía de la Mesa Online"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "online-session-guide__toggle",
          onClick: () => setOnlineTableGuideOpen(previous => !previous),
          "aria-expanded": onlineTableGuideOpen
        }, /*#__PURE__*/React.createElement("span", {
          className: "online-session-guide__icon",
          "aria-hidden": "true"
        }, onlineTableView === 'lobby' ? isCurrentRoomMaster ? '◆' : '✓' : isOwnTurn ? '!' : isCurrentRoomMaster ? '♜' : '◷'), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, isCurrentRoomMaster ? 'Panel del Máster' : 'Panel del jugador'), /*#__PURE__*/React.createElement("strong", null, guideTitle)), /*#__PURE__*/React.createElement("span", {
          className: "online-session-guide__chevron",
          "aria-hidden": "true"
        }, onlineTableGuideOpen ? '−' : '+')), onlineTableGuideOpen && /*#__PURE__*/React.createElement("div", {
          className: "online-session-guide__body"
        }, /*#__PURE__*/React.createElement("p", null, guideText), onlineTableView === 'lobby' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
          className: "online-session-progress",
          "aria-label": `${completedSteps} de ${lobbySteps.length} pasos completados`
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            width: `${completedSteps / lobbySteps.length * 100}%`
          }
        })), /*#__PURE__*/React.createElement("ol", {
          className: "online-session-checklist"
        }, lobbySteps.map((step, index) => /*#__PURE__*/React.createElement("li", {
          key: step.label,
          className: step.done ? 'is-done' : ''
        }, /*#__PURE__*/React.createElement("span", null, step.done ? '✓' : index + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, step.label), /*#__PURE__*/React.createElement("small", null, step.detail))))), /*#__PURE__*/React.createElement("div", {
          className: "online-session-actions"
        }, isCurrentRoomMaster ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => shareRoomLink(currentRoom.code)
        }, "Invitar jugadores"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setOnlineRoomModule('combat'),
          className: "is-primary"
        }, "Abrir Combate")) : /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setOnlineRoomModule(ownRoomParticipant ? 'combat' : 'sheets'),
          className: "is-primary"
        }, ownRoomParticipant ? 'Abrir Combate' : 'Compartir mi personaje'))) : /*#__PURE__*/React.createElement("div", {
          className: "online-session-actions"
        }, !isCurrentRoomMaster && ownRoomParticipant && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: openOwnCharacterFromEncounter,
          className: "is-primary"
        }, "Abrir mi personaje"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setOnlineEncounterView('effects')
        }, "Ver efectos"), isCurrentRoomMaster && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setOnlineEncounterView('participants')
        }, "Gestionar participantes"), roomData?.status === 'active' ? /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy,
          onClick: () => changeEncounterTurn(1),
          className: "is-primary"
        }, "Terminar turno y avanzar") : /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy,
          onClick: () => setEncounterStatus('active'),
          className: "is-primary"
        }, "Reanudar encuentro")))));
      })(), onlineTableView === 'preparation' && (() => {
        const preparedCombatants = preparedTurnOrder.map(getCombatant).filter(Boolean);
        const missingInitiative = preparedCombatants.filter(participant => !hasInitiativeValue(participant.initiative));
        const availableCombatants = [...playerRoomParticipants, ...companionRoomParticipants, ...publicCombatants].filter((participant, index, list) => list.findIndex(item => item.id === participant.id) === index).filter(participant => participant.type === 'enemy' || roomMembers.some(member => member.uid === participant.ownerUid && member.active !== false)).filter(participant => !preparedTurnOrder.includes(participant.id));
        const playersInOrder = preparedTurnOrder.filter(id => getCombatant(id)?.type === 'player').length;
        const companionsInOrder = preparedTurnOrder.filter(id => getCombatant(id)?.type === 'companion').length;
        const enemiesInOrder = preparedTurnOrder.filter(id => getCombatant(id)?.type === 'enemy').length;
        return /*#__PURE__*/React.createElement("section", {
          className: "online-preparation"
        }, /*#__PURE__*/React.createElement("header", {
          className: "online-preparation__header"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "⚔"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Paso final antes del combate"), /*#__PURE__*/React.createElement("h4", null, "Preparar encuentro"), /*#__PURE__*/React.createElement("p", null, "El grupo conectado se incluye por defecto. Puedes dejar a alguien en reserva o usar la última ficha de un jugador ausente.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openEnemyModal()
        }, "＋ Añadir enemigo"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setEncounterSetupOpen(false)
        }, "Volver"))), /*#__PURE__*/React.createElement("div", {
          className: "online-preparation__summary"
        }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Combatientes"), /*#__PURE__*/React.createElement("strong", null, preparedTurnOrder.length)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Personajes"), /*#__PURE__*/React.createElement("strong", null, playersInOrder)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Compañeros"), /*#__PURE__*/React.createElement("strong", null, companionsInOrder)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Enemigos"), /*#__PURE__*/React.createElement("strong", null, enemiesInOrder)), /*#__PURE__*/React.createElement("span", {
          className: missingInitiative.length ? 'is-warning' : 'is-ready'
        }, /*#__PURE__*/React.createElement("small", null, "Iniciativas"), /*#__PURE__*/React.createElement("strong", null, missingInitiative.length ? `${missingInitiative.length} pendientes` : 'Completas'))), /*#__PURE__*/React.createElement("div", {
          className: "online-preparation__layout"
        }, /*#__PURE__*/React.createElement("section", {
          className: "online-preparation__order"
        }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Secuencia de actuación"), /*#__PURE__*/React.createElement("h5", null, "Orden de iniciativa")), /*#__PURE__*/React.createElement("span", null, "Usa las flechas para ajustar el orden.")), missingInitiative.length > 0 && /*#__PURE__*/React.createElement("div", {
          className: "online-preparation__warning"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "!"), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "No se puede iniciar todavía."), " Falta iniciativa para ", missingInitiative.map(participant => participant.name || 'Participante').join(', '), ".")), /*#__PURE__*/React.createElement("div", {
          className: "online-preparation__list"
        }, preparedTurnOrder.map((id, index) => {
          const participant = getCombatant(id);
          if (!participant) return null;
          const isEnemy = participant.type === 'enemy';
          const isAbsent = !isEnemy && participant.connected === false;
          const ready = hasInitiativeValue(participant.initiative);
          const ownerName = isEnemy ? 'Máster' : roomMembers.find(member => member.uid === participant.ownerUid)?.displayName || 'Jugador';
          return /*#__PURE__*/React.createElement("article", {
            key: id,
            className: `${isEnemy ? 'is-enemy' : 'is-player'} ${isAbsent ? 'is-absent' : ''} ${ready ? '' : 'is-missing'}`
          }, /*#__PURE__*/React.createElement("span", {
            className: "online-preparation__position"
          }, index + 1), /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
            combatant: participant,
            className: "h-11 w-11 text-xs"
          }), /*#__PURE__*/React.createElement("div", {
            className: "online-preparation__identity"
          }, /*#__PURE__*/React.createElement("small", null, isEnemy ? 'Enemigo' : isAbsent ? `Ausente · lo controla el Máster` : `Personaje de ${ownerName}`), /*#__PURE__*/React.createElement("strong", null, participant.name || 'Combatiente'), isAbsent && /*#__PURE__*/React.createElement("em", null, "Últimos datos sincronizados")), /*#__PURE__*/React.createElement("div", {
            className: "online-preparation__initiative"
          }, /*#__PURE__*/React.createElement("small", null, "Iniciativa"), isEnemy ? /*#__PURE__*/React.createElement("strong", null, ready ? participant.initiative : 'Pendiente') : /*#__PURE__*/React.createElement("input", {
            type: "number",
            inputMode: "numeric",
            value: participantInitiativeDrafts[participant.id] ?? participant.initiative ?? '',
            onChange: event => setParticipantInitiativeDrafts(previous => ({
              ...previous,
              [participant.id]: event.target.value
            })),
            onBlur: () => commitParticipantInitiative(participant),
            onKeyDown: event => {
              if (event.key === 'Enter') event.currentTarget.blur();
            },
            placeholder: "—",
            "aria-label": `Iniciativa de ${participant.name}`
          })), isEnemy && /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "online-preparation__edit",
            onClick: () => openEnemyModal(participant)
          }, "Editar"), /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "online-preparation__remove",
            onClick: () => togglePreparedParticipant(id),
            "aria-label": `Dejar a ${participant.name} en reserva`
          }, "Reserva"), /*#__PURE__*/React.createElement("div", {
            className: "online-preparation__move"
          }, /*#__PURE__*/React.createElement("button", {
            type: "button",
            disabled: index === 0,
            onClick: () => movePreparedParticipant(id, -1),
            "aria-label": `Subir a ${participant.name}`
          }, "↑"), /*#__PURE__*/React.createElement("button", {
            type: "button",
            disabled: index === preparedTurnOrder.length - 1,
            onClick: () => movePreparedParticipant(id, 1),
            "aria-label": `Bajar a ${participant.name}`
          }, "↓")));
        }), !preparedTurnOrder.length && /*#__PURE__*/React.createElement("div", {
          className: "online-preparation__empty"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "◇"), /*#__PURE__*/React.createElement("strong", null, "No hay combatientes"), /*#__PURE__*/React.createElement("p", null, "Añade combatientes desde la reserva o crea un enemigo.")))), /*#__PURE__*/React.createElement("aside", {
          className: "online-preparation__launch"
        }, /*#__PURE__*/React.createElement("span", {
          className: missingInitiative.length ? 'is-blocked' : '',
          "aria-hidden": "true"
        }, missingInitiative.length ? '!' : '✓'), /*#__PURE__*/React.createElement("small", null, "Comprobación del Máster"), /*#__PURE__*/React.createElement("h5", null, missingInitiative.length ? 'Faltan datos' : 'Encuentro listo'), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", {
          className: playersInOrder ? 'is-done' : ''
        }, "Personajes incluidos ", /*#__PURE__*/React.createElement("b", null, playersInOrder)), /*#__PURE__*/React.createElement("li", {
          className: enemiesInOrder ? 'is-done' : ''
        }, "Enemigos incluidos ", /*#__PURE__*/React.createElement("b", null, enemiesInOrder)), /*#__PURE__*/React.createElement("li", {
          className: !missingInitiative.length ? 'is-done' : ''
        }, "Iniciativas completas ", /*#__PURE__*/React.createElement("b", null, preparedTurnOrder.length - missingInitiative.length, "/", preparedTurnOrder.length))), /*#__PURE__*/React.createElement("p", null, "Los ausentes incluidos usarán su última copia sincronizada y quedarán bajo control del Máster durante este encuentro."), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy || missingInitiative.length > 0 || !preparedTurnOrder.length,
          onClick: startEncounter
        }, encounterBusy ? 'Iniciando encuentro…' : /*#__PURE__*/React.createElement(React.Fragment, null, "Iniciar encuentro ", /*#__PURE__*/React.createElement("b", {
          "aria-hidden": "true"
        }, "→"))))), availableCombatants.length > 0 && /*#__PURE__*/React.createElement("section", {
          className: "online-preparation__reserve"
        }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Fuera del encuentro"), /*#__PURE__*/React.createElement("h5", null, "Reserva de combatientes")), /*#__PURE__*/React.createElement("span", null, "Los jugadores ausentes nunca entran automáticamente.")), /*#__PURE__*/React.createElement("div", null, availableCombatants.map(participant => {
          const isAbsent = participant.type !== 'enemy' && participant.connected === false;
          const ownerName = roomMembers.find(member => member.uid === participant.ownerUid)?.displayName || 'Jugador';
          return /*#__PURE__*/React.createElement("article", {
            key: `reserve-${participant.id}`,
            className: isAbsent ? 'is-absent' : ''
          }, /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
            combatant: participant,
            className: "h-10 w-10 text-xs"
          }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, participant.type === 'enemy' ? 'Enemigo en reserva' : isAbsent ? `${ownerName} no está conectado` : 'Disponible'), /*#__PURE__*/React.createElement("strong", null, participant.name || 'Combatiente'), /*#__PURE__*/React.createElement("span", null, isAbsent ? 'Se usará la última ficha sincronizada' : 'Listo para participar')), /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => togglePreparedParticipant(participant.id)
          }, isAbsent ? 'Incluir y controlar' : 'Incluir'));
        }))));
      })(), onlineTableView === 'encounter' && onlineEncounterView === 'encounter' && (() => {
        const order = Array.isArray(roomData?.turnOrder) ? roomData.turnOrder : [];
        const currentIndex = Math.max(0, Math.min(Number(roomData?.turnIndex) || 0, Math.max(0, order.length - 1)));
        const currentId = roomData?.currentTurnId || order[currentIndex];
        const nextId = order.length > 1 ? order[(currentIndex + 1) % order.length] : null;
        const currentCombatant = getCombatant(currentId);
        const selected = getCombatant(selectedCombatantId || currentId);
        const selectedIsEnemy = selected?.type === 'enemy';
        const selectedPrivate = selectedIsEnemy && canManageEnemies ? privateEnemies.find(item => item.id === selected.id) : null;
        const selectedHp = selected ? getHpValues(selectedPrivate || selected) : null;
        const canSeeSelectedHp = !!selected && (!selectedIsEnemy ? isCurrentRoomMaster || selected.ownerUid === firebaseUser?.uid : !!selectedPrivate);
        const canEditSelected = !!selected && (selectedIsEnemy ? canManageEnemies : isCurrentRoomMaster || selected.ownerUid === firebaseUser?.uid);
        const selectedConditions = normalizeOnlineConditions(selectedIsEnemy ? selected?.conditionsVisible : selected?.conditions);
        const currentConditions = normalizeOnlineConditions(currentCombatant?.type === 'enemy' ? currentCombatant?.conditionsVisible : currentCombatant?.conditions);
        const selectedEffects = encounterEffects.filter(effect => !effect.expired && (effect.targetId === selected?.id || effect.targetType === 'global'));
        const currentEffects = encounterEffects.filter(effect => !effect.expired && (effect.targetId === currentCombatant?.id || effect.targetType === 'global')).slice(0, 3);
        const isOwnTurn = currentCombatant?.ownerUid === firebaseUser?.uid;
        const currentController = currentCombatant?.type === 'enemy' || currentCombatant?.connected === false ? 'Máster' : roomMembers.find(member => member.uid === currentCombatant?.ownerUid)?.displayName || 'Jugador sin identificar';
        const nextCombatant = getCombatant(nextId);
        const nextController = nextCombatant?.type === 'enemy' || nextCombatant?.connected === false ? 'Máster' : roomMembers.find(member => member.uid === nextCombatant?.ownerUid)?.displayName || 'Jugador';
        const hpPercent = selectedHp?.maxHp > 0 ? Math.min(100, selectedHp.currentHp / selectedHp.maxHp * 100) : 0;
        const roster = encounterCombatants.slice().sort((left, right) => {
          const leftIndex = order.indexOf(left.id);
          const rightIndex = order.indexOf(right.id);
          const normalizedLeft = leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex;
          const normalizedRight = rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex;
          return normalizedLeft - normalizedRight || String(left.name || '').localeCompare(String(right.name || ''));
        });
        return /*#__PURE__*/React.createElement("section", {
          className: "tactical-encounter-grid",
          "data-mobile-panel": onlineEncounterPanel
        }, /*#__PURE__*/React.createElement("nav", {
          className: "online-encounter-panel-nav",
          "aria-label": "Panel de encuentro"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setOnlineEncounterPanel('turn'),
          className: onlineEncounterPanel === 'turn' ? 'is-active' : ''
        }, /*#__PURE__*/React.createElement("small", null, "Ahora"), /*#__PURE__*/React.createElement("strong", null, "Turno")), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setOnlineEncounterPanel('order'),
          className: onlineEncounterPanel === 'order' ? 'is-active' : ''
        }, /*#__PURE__*/React.createElement("small", null, "Secuencia"), /*#__PURE__*/React.createElement("strong", null, "Orden")), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => {
            if (!isCurrentRoomMaster && ownRoomParticipant) setSelectedCombatantId(ownRoomParticipant.id);
            setOnlineEncounterPanel('detail');
          },
          className: onlineEncounterPanel === 'detail' ? 'is-active' : ''
        }, /*#__PURE__*/React.createElement("small", null, "Información"), /*#__PURE__*/React.createElement("strong", null, isCurrentRoomMaster ? 'Detalle' : 'Mi PJ'))), /*#__PURE__*/React.createElement("div", {
          className: "online-encounter-panels"
        }, /*#__PURE__*/React.createElement("div", {
          className: "tactical-turn-panel rounded border border-purple-700 bg-purple-950/25 p-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: `online-combat-command ${roomData?.status === 'paused' ? 'is-paused' : ''} ${isOwnTurn ? 'is-own-turn' : ''}`
        }, /*#__PURE__*/React.createElement("div", {
          className: "online-combat-command__status"
        }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", null), roomData?.status === 'paused' ? 'Combate pausado' : 'Combate activo'), /*#__PURE__*/React.createElement("b", null, "Ronda ", roomData?.round || 1), /*#__PURE__*/React.createElement("em", null, "Turno ", order.length ? currentIndex + 1 : 0, " de ", order.length)), /*#__PURE__*/React.createElement("div", {
          className: "online-combat-command__current"
        }, /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
          combatant: currentCombatant,
          className: "h-16 w-16 text-xl"
        }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, isOwnTurn ? 'Es tu turno' : isCurrentRoomMaster ? 'Turno que diriges' : 'Está actuando'), /*#__PURE__*/React.createElement("h4", null, currentCombatant?.name || 'Sin combatiente activo'), /*#__PURE__*/React.createElement("p", null, currentCombatant ? `${currentCombatant.type === 'enemy' ? 'Enemigo' : currentCombatant.type === 'companion' ? COMPANION_CATEGORY_LABELS[currentCombatant.category] || 'Compañero' : 'Personaje'} · Controla ${currentController}` : 'El Máster todavía no ha asignado el turno.'))), /*#__PURE__*/React.createElement("div", {
          className: "online-combat-command__guidance"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, isOwnTurn ? '!' : isCurrentRoomMaster ? '◆' : '…'), /*#__PURE__*/React.createElement("p", null, roomData?.status === 'paused' ? 'El encuentro está en pausa. Espera a que el Máster lo reanude.' : isOwnTurn ? 'Haz tus acciones y avisa al Máster cuando hayas terminado.' : isCurrentRoomMaster ? `Gestiona las acciones de ${currentCombatant?.name || 'este combatiente'} y avanza cuando termine.` : `Espera mientras actúa ${currentCombatant?.name || 'el combatiente actual'}.`)), /*#__PURE__*/React.createElement("div", {
          className: "online-combat-command__next"
        }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Después actúa"), /*#__PURE__*/React.createElement("strong", null, nextCombatant?.name || 'Sin siguiente turno'), /*#__PURE__*/React.createElement("em", null, nextCombatant ? `Controla ${nextController}` : '—')), isCurrentRoomMaster && /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy || roomData?.status !== 'active' || !order.length,
          onClick: () => changeEncounterTurn(1)
        }, "Terminar turno ", /*#__PURE__*/React.createElement("b", {
          "aria-hidden": "true"
        }, "→")))), /*#__PURE__*/React.createElement("div", {
          className: "mt-3 flex flex-wrap gap-1"
        }, currentConditions.map(condition => /*#__PURE__*/React.createElement("span", {
          key: condition.id,
          className: "rounded border border-red-900 px-1.5 py-0.5 text-[10px] text-red-100"
        }, condition.name)), !currentConditions.length && /*#__PURE__*/React.createElement("span", {
          className: "text-xs text-gray-500"
        }, "Sin condiciones activas.")), currentEffects.length > 0 && /*#__PURE__*/React.createElement("div", {
          className: "mt-2 space-y-1"
        }, currentEffects.map(effect => /*#__PURE__*/React.createElement("div", {
          key: effect.id,
          className: "flex justify-between gap-2 text-xs text-gray-300"
        }, /*#__PURE__*/React.createElement("span", {
          className: "truncate"
        }, effect.name), /*#__PURE__*/React.createElement("span", null, effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType}`)))), /*#__PURE__*/React.createElement("div", {
          className: "mt-4 border-t border-purple-900/70 pt-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: "online-initiative-heading"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "⚔"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Secuencia del encuentro"), /*#__PURE__*/React.createElement("h4", null, "Orden de iniciativa"), /*#__PURE__*/React.createElement("p", null, "Selecciona un combatiente para consultar su detalle.")), /*#__PURE__*/React.createElement("b", null, order.length, /*#__PURE__*/React.createElement("small", null, "combatientes"))), /*#__PURE__*/React.createElement("div", {
          className: "tactical-initiative-list mt-2 space-y-1.5"
        }, order.map((id, index) => {
          const combatant = getCombatant(id);
          const isCurrent = id === currentId;
          const isOwn = combatant?.ownerUid === firebaseUser?.uid;
          const isNext = id === nextId;
          const isEnemy = combatant?.type === 'enemy';
          const isCompanion = combatant?.type === 'companion';
          const controller = isEnemy ? 'Máster' : roomMembers.find(member => member.uid === combatant?.ownerUid)?.displayName || 'Jugador';
          const conditionCount = normalizeOnlineConditions(isEnemy ? combatant?.conditionsVisible : combatant?.conditions).length;
          const effectCount = encounterEffects.filter(effect => !effect.expired && effect.targetId === combatant?.id).length;
          return /*#__PURE__*/React.createElement("button", {
            type: "button",
            key: `initiative-${id}-${index}`,
            onClick: () => setSelectedCombatantId(id),
            className: `tactical-initiative-row online-initiative-card ${isEnemy ? 'is-enemy' : isCompanion ? 'is-companion' : 'is-player'} ${isCurrent ? 'tactical-initiative-row--current is-current' : ''} ${selected?.id === id ? 'is-selected' : ''} ${isNext ? 'is-next' : ''}`,
            "aria-current": isCurrent ? 'step' : undefined
          }, /*#__PURE__*/React.createElement("span", {
            className: "online-initiative-card__position"
          }, /*#__PURE__*/React.createElement("small", null, "#"), /*#__PURE__*/React.createElement("strong", null, index + 1)), /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
            combatant: combatant,
            className: "h-10 w-10 text-xs"
          }), /*#__PURE__*/React.createElement("span", {
            className: "online-initiative-card__identity"
          }, /*#__PURE__*/React.createElement("small", null, isEnemy ? 'Enemigo' : isCompanion ? `${COMPANION_CATEGORY_LABELS[combatant?.category] || 'Compañero'} · ${controller}` : `Controla ${controller}`), /*#__PURE__*/React.createElement("strong", null, combatant?.name || 'Combatiente', isOwn ? ' · Tú' : ''), /*#__PURE__*/React.createElement("em", null, conditionCount ? `${conditionCount} ${conditionCount === 1 ? 'condición' : 'condiciones'}` : 'Sin condiciones', effectCount ? ` · ${effectCount} ${effectCount === 1 ? 'efecto' : 'efectos'}` : '')), /*#__PURE__*/React.createElement("span", {
            className: "online-initiative-card__state"
          }, isCurrent ? 'En turno' : isNext ? 'Siguiente' : selected?.id === id ? 'Consultando' : ''), /*#__PURE__*/React.createElement("span", {
            className: "online-initiative-card__score"
          }, /*#__PURE__*/React.createElement("small", null, "Ini"), /*#__PURE__*/React.createElement("strong", null, hasInitiativeValue(combatant?.initiative) ? combatant.initiative : '—')));
        }), !order.length && /*#__PURE__*/React.createElement("p", {
          className: "text-xs text-gray-500"
        }, "Aun no hay orden de iniciativa.")))), isCurrentRoomMaster && /*#__PURE__*/React.createElement("div", {
          className: "tactical-controls rounded border border-gray-700 bg-gray-950/45 p-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap gap-2"
        }, isCurrentRoomMaster && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openEnemyModal(),
          className: "tactical-add-enemy min-h-11 rounded border border-purple-700 px-3 text-xs font-bold text-purple-100"
        }, "+ Añadir enemigo"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy || roomData?.status !== 'active',
          onClick: () => changeEncounterTurn(-1),
          className: "min-h-11 flex-1 rounded border border-gray-600 px-3 text-xs text-gray-200 disabled:opacity-40"
        }, "Anterior"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy || roomData?.status !== 'active',
          onClick: () => changeEncounterTurn(1),
          className: "min-h-11 flex-[1.35] rounded border border-cyan-700 bg-cyan-950/30 px-3 text-xs font-bold text-cyan-100 disabled:opacity-40"
        }, "Siguiente"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy,
          onClick: () => setFinishEncounterPrompt(true),
          className: "tactical-finish-encounter min-h-11 rounded border border-red-800 px-3 text-xs font-bold text-red-200 disabled:opacity-40"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "×"), " Finalizar encuentro"), /*#__PURE__*/React.createElement("div", {
          className: "relative"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setEncounterActionsOpen(previous => !previous),
          className: "min-h-11 w-11 rounded border border-gray-600 text-lg text-gray-200",
          "aria-label": "Más controles de encuentro",
          "aria-expanded": encounterActionsOpen
        }, "..."), encounterActionsOpen && /*#__PURE__*/React.createElement("div", {
          className: "absolute right-0 top-12 z-20 w-48 rounded border border-gray-600 bg-gray-950 p-1.5 shadow-xl"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy || roomData?.status !== 'active',
          onClick: () => {
            setPostponeOpen(true);
            setEncounterActionsOpen(false);
          },
          className: "w-full rounded px-3 py-2 text-left text-xs text-purple-100 hover:bg-purple-950/30 disabled:opacity-40"
        }, "Postergar"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy,
          onClick: () => {
            setEncounterStatus(roomData?.status === 'active' ? 'paused' : 'active');
            setEncounterActionsOpen(false);
          },
          className: "w-full rounded px-3 py-2 text-left text-xs text-yellow-100 hover:bg-yellow-950/30 disabled:opacity-40"
        }, roomData?.status === 'active' ? 'Pausar' : 'Reanudar')))))), /*#__PURE__*/React.createElement("div", {
          className: "tactical-order-panel rounded border border-gray-700 bg-gray-950/40 p-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: "tactical-roster-header"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "☷"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Vista compacta"), /*#__PURE__*/React.createElement("h4", null, "Orden del encuentro"), /*#__PURE__*/React.createElement("p", null, "Jugadores y enemigos en la escena.")), isCurrentRoomMaster && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openEnemyModal()
        }, "+\xA0 Enemigo")), /*#__PURE__*/React.createElement("div", {
          className: "tactical-roster-list mt-3 space-y-1.5 pr-1"
        }, roster.map(combatant => {
          const isEnemy = combatant.type === 'enemy';
          const isCurrent = combatant.id === currentId;
          const isSelected = combatant.id === selected?.id;
          const isOwn = combatant.ownerUid === firebaseUser?.uid;
          const connected = isEnemy || combatant.connected !== false;
          const state = isEnemy ? combatant.defeated ? 'Derrotado' : combatant.visibleState || 'oculto' : connected ? 'Conectado' : 'Desconectado';
          const controller = isEnemy ? 'Máster' : roomMembers.find(member => member.uid === combatant.ownerUid)?.displayName || 'Sin identificar';
          const position = order.indexOf(combatant.id);
          return /*#__PURE__*/React.createElement("button", {
            type: "button",
            key: `roster-${combatant.id}`,
            onClick: () => setSelectedCombatantId(combatant.id),
            className: `tactical-roster-row online-roster-card ${isEnemy ? 'tactical-roster-row--enemy is-enemy' : 'tactical-roster-row--player is-player'} ${combatant.defeated ? 'tactical-roster-row--defeated is-defeated' : ''} ${isCurrent ? 'is-current' : ''} ${isSelected ? 'is-selected' : ''}`
          }, /*#__PURE__*/React.createElement("span", {
            className: "online-roster-card__position"
          }, position >= 0 ? position + 1 : '—'), /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
            combatant: combatant,
            className: "h-10 w-10 text-xs"
          }), /*#__PURE__*/React.createElement("span", {
            className: "online-roster-card__identity"
          }, /*#__PURE__*/React.createElement("small", null, isEnemy ? 'Enemigo' : controller), /*#__PURE__*/React.createElement("strong", null, combatant.name || 'Combatiente', isOwn ? ' · Tú' : ''), /*#__PURE__*/React.createElement("em", null, isCurrent ? 'Actuando ahora' : state)), /*#__PURE__*/React.createElement("span", {
            className: "online-roster-card__score"
          }, /*#__PURE__*/React.createElement("small", null, "Ini"), /*#__PURE__*/React.createElement("strong", null, hasInitiativeValue(combatant.initiative) ? combatant.initiative : '—')));
        }), !roster.length && /*#__PURE__*/React.createElement("p", {
          className: "text-xs text-gray-500"
        }, "No hay combatientes."))), /*#__PURE__*/React.createElement(OnlineTacticalDetailPanel, {
          selected: selected,
          isEnemy: selectedIsEnemy,
          privateData: selectedPrivate,
          hp: selectedHp,
          hpPercent: hpPercent,
          canSeeHp: canSeeSelectedHp,
          canEdit: canEditSelected,
          conditions: selectedConditions,
          effects: selectedEffects,
          currentUid: firebaseUser?.uid,
          onAvatarPreview: setOnlineAvatarViewer,
          onEditEnemy: () => openEnemyModal(selected),
          onDeleteEnemy: () => confirmDelete(`¿Eliminar a ${selected?.name}?`, () => deleteEnemy(selected?.id)),
          onOpenHealth: () => selectedIsEnemy ? setEnemyHpModal({
            isOpen: true,
            enemyId: selected.id,
            mode: 'damage',
            amount: ''
          }) : openParticipantHpModal(selected),
          onQuickHp: delta => {
            if (!selectedHp || !selected) return;
            const nextHp = Math.max(0, Math.min(selectedHp.maxHp, selectedHp.currentHp + delta));
            const update = selectedIsEnemy ? updateEnemyHp(selected, {
              currentHp: nextHp
            }) : updateParticipantHp(selected, {
              currentHp: nextHp
            }, isCurrentRoomMaster ? 'master' : 'player');
            update.catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.'));
          },
          onDefeat: () => updateEnemyHp(selected, {
            currentHp: 0
          }).catch(() => setOnlineTableError('No se pudo marcar el enemigo como derrotado.')),
          onAddCondition: () => openConditionModal(selected),
          onRemoveCondition: conditionId => removeOnlineCondition(selected, conditionId),
          onAddEffect: () => openEffectModal(null, selected),
          onAdjustEffect: (effect, delta) => updateEffectRemaining(effect, Number(effect.remaining) + delta),
          onFinishEffect: deleteEffect,
          canManageEffect: canManageEffect
        }), /*#__PURE__*/React.createElement("div", {
          className: "tactical-detail-panel rounded border border-cyan-800 bg-cyan-950/15 p-3"
        }, /*#__PURE__*/React.createElement("span", {
          className: "text-[10px] font-bold uppercase text-cyan-300"
        }, "Detalle"), selected && /*#__PURE__*/React.createElement("div", {
          className: "mt-2 flex justify-center"
        }, /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
          combatant: selected,
          className: "h-20 w-20 text-2xl"
        })), selected ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
          className: "mt-1 flex flex-wrap items-start justify-between gap-2"
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
          className: "block text-lg text-white"
        }, selected.name), /*#__PURE__*/React.createElement("span", {
          className: "text-xs text-gray-400"
        }, "Iniciativa ", selected.initiative ?? '—', selectedIsEnemy ? ` · ${selected.visibleState || 'oculto'}` : ` · ${selected.ownerUid === firebaseUser?.uid ? 'Tú' : 'Jugador'}`)), selectedIsEnemy && canManageEnemies && /*#__PURE__*/React.createElement("div", {
          className: "flex gap-1"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openEnemyModal(selected),
          className: "min-h-9 px-2 rounded border border-gray-600 text-[10px] text-gray-200"
        }, "Editar"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => confirmDelete(`¿Eliminar a ${selected.name}?`, () => deleteEnemy(selected.id)),
          className: "min-h-9 px-2 rounded border border-red-900 text-[10px] text-red-200"
        }, "Eliminar"))), canSeeSelectedHp && selectedHp && /*#__PURE__*/React.createElement("div", {
          className: "mt-3 rounded border border-red-900/70 bg-red-950/15 p-2"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap items-center justify-between gap-2 text-sm text-gray-200"
        }, /*#__PURE__*/React.createElement("span", null, "PV ", /*#__PURE__*/React.createElement("b", null, selectedHp.currentHp), " / ", selectedHp.maxHp, selectedHp.tempHp > 0 ? ` · Temporal ${selectedHp.tempHp}` : ''), selectedIsEnemy && selectedPrivate && /*#__PURE__*/React.createElement("span", null, "CA ", selectedPrivate.armorClass ?? '—'), !selectedIsEnemy && /*#__PURE__*/React.createElement("span", null, "CA ", selected.armorClass ?? '—')), /*#__PURE__*/React.createElement("div", {
          className: "mt-2 h-2 overflow-hidden rounded-full bg-gray-950"
        }, /*#__PURE__*/React.createElement("div", {
          className: "h-full bg-red-500",
          style: {
            width: `${hpPercent}%`
          }
        })), canEditSelected && /*#__PURE__*/React.createElement("div", {
          className: "mt-2 flex flex-wrap gap-1"
        }, selectedIsEnemy ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setEnemyHpModal({
            isOpen: true,
            enemyId: selected.id,
            mode: 'damage',
            amount: ''
          }),
          className: "min-h-9 px-2 rounded border border-red-800 text-[10px] text-red-100"
        }, "Modificar vida"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => updateEnemyHp(selected, {
            currentHp: 0
          }).catch(() => setOnlineTableError('No se pudo marcar el enemigo como derrotado.')),
          className: "min-h-9 px-2 rounded border border-orange-800 text-[10px] text-orange-100"
        }, "Derrotado")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => updateParticipantHp(selected, {
            currentHp: Math.max(0, selectedHp.currentHp - 1)
          }, isCurrentRoomMaster ? 'master' : 'player').catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.')),
          className: "w-9 h-9 rounded border border-gray-600 text-gray-200"
        }, "-"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openParticipantHpModal(selected),
          className: "min-h-9 px-2 rounded border border-red-800 text-[10px] text-red-100"
        }, "Modificar vida"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => updateParticipantHp(selected, {
            currentHp: Math.min(selectedHp.maxHp, selectedHp.currentHp + 1)
          }, isCurrentRoomMaster ? 'master' : 'player').catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.')),
          className: "w-9 h-9 rounded border border-gray-600 text-gray-200"
        }, "+")))), /*#__PURE__*/React.createElement("div", {
          className: "mt-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex items-center justify-between gap-2"
        }, /*#__PURE__*/React.createElement("span", {
          className: "text-[10px] font-bold uppercase text-purple-200"
        }, "Condiciones"), canEditSelected && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openConditionModal(selected),
          className: "min-h-8 px-2 rounded border border-purple-700 text-[10px] text-purple-100"
        }, "Añadir")), /*#__PURE__*/React.createElement("div", {
          className: "mt-1 flex flex-wrap gap-1"
        }, selectedConditions.map(condition => /*#__PURE__*/React.createElement("span", {
          key: condition.id,
          className: "inline-flex items-center gap-1 rounded border border-red-900 px-1.5 py-0.5 text-[10px] text-red-100"
        }, condition.name, canEditSelected && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => removeOnlineCondition(selected, condition.id),
          "aria-label": `Quitar ${condition.name}`
        }, "×"))), !selectedConditions.length && /*#__PURE__*/React.createElement("span", {
          className: "text-xs text-gray-500"
        }, "Sin condiciones."))), /*#__PURE__*/React.createElement("div", {
          className: "mt-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex items-center justify-between gap-2"
        }, /*#__PURE__*/React.createElement("span", {
          className: "text-[10px] font-bold uppercase text-cyan-300"
        }, "Efectos"), canEditSelected && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openEffectModal(),
          className: "min-h-8 px-2 rounded border border-cyan-700 text-[10px] text-cyan-100"
        }, "Añadir")), /*#__PURE__*/React.createElement("div", {
          className: "mt-1 space-y-1"
        }, selectedEffects.map(effect => /*#__PURE__*/React.createElement("div", {
          key: effect.id,
          className: "flex items-center justify-between gap-2 text-xs text-gray-300"
        }, /*#__PURE__*/React.createElement("span", {
          className: "min-w-0 flex-1 truncate"
        }, effect.name), /*#__PURE__*/React.createElement("span", {
          className: "shrink-0"
        }, effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType}`), canManageEffect(effect) && /*#__PURE__*/React.createElement("span", {
          className: "flex shrink-0 gap-1"
        }, effect.remaining !== null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => updateEffectRemaining(effect, Number(effect.remaining) - 1),
          className: "h-8 w-8 rounded border border-gray-600 text-gray-200"
        }, "-"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => updateEffectRemaining(effect, Number(effect.remaining) + 1),
          className: "h-8 w-8 rounded border border-gray-600 text-gray-200"
        }, "+")), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => deleteEffect(effect),
          className: "min-h-8 px-2 rounded border border-red-800 text-[10px] text-red-100"
        }, "Finalizar")))), !selectedEffects.length && /*#__PURE__*/React.createElement("span", {
          className: "text-xs text-gray-500"
        }, "Sin efectos activos.")))) : /*#__PURE__*/React.createElement("p", {
          className: "mt-2 text-sm text-gray-500"
        }, "Selecciona un combatiente.")));
      })(), onlineTableView === 'encounter' && onlineEncounterView === 'participants' && isCurrentRoomMaster && /*#__PURE__*/React.createElement(OnlinePartyOverview, {
        participants: playerRoomParticipants,
        members: roomMembers,
        sheets: roomPlayerSheets,
        onOpenSheet: setOnlinePlayerSheetId,
        onAvatarPreview: setOnlineAvatarViewer,
        onKickMember: confirmKickRoomPlayer
      }), onlineTableView === 'encounter' && onlineEncounterView === 'effects' && (() => {
        const activeEffects = encounterEffects.filter(effect => !effect.expired).slice().sort((left, right) => (left.remaining ?? Infinity) - (right.remaining ?? Infinity));
        const expiredEffects = encounterEffects.filter(effect => effect.expired);
        const canAddEffect = isCurrentRoomMaster || !!ownRoomParticipant;
        const renderEffect = effect => {
          const target = effect.targetType === 'global' ? null : getCombatant(effect.targetId);
          const canEdit = canManageEffect(effect);
          return /*#__PURE__*/React.createElement("div", {
            key: effect.id,
            className: "rounded border border-gray-700 bg-gray-900/60 p-3"
          }, /*#__PURE__*/React.createElement("div", {
            className: "flex flex-wrap items-start justify-between gap-2"
          }, /*#__PURE__*/React.createElement("div", {
            className: "min-w-0"
          }, /*#__PURE__*/React.createElement("strong", {
            className: "block text-sm text-white"
          }, effect.name, (effect.requiresConcentration || effect.concentration) && /*#__PURE__*/React.createElement("span", {
            className: "ml-2 text-[10px] uppercase text-purple-200"
          }, "Concentración")), /*#__PURE__*/React.createElement("span", {
            className: "block text-xs text-gray-400"
          }, target?.name || (effect.targetType === 'global' ? 'Global' : 'Objetivo eliminado'), " · ", effect.expired ? 'Expirado' : effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType}`), effect.notesPublic && /*#__PURE__*/React.createElement("span", {
            className: "block text-xs text-gray-500"
          }, effect.notesPublic)), canEdit && /*#__PURE__*/React.createElement("div", {
            className: "flex flex-wrap gap-1"
          }, effect.remaining !== null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => updateEffectRemaining(effect, Number(effect.remaining) - 1),
            className: "h-9 w-9 rounded border border-gray-600 text-gray-200"
          }, "-"), /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => updateEffectRemaining(effect, Number(effect.remaining) + 1),
            className: "h-9 w-9 rounded border border-gray-600 text-gray-200"
          }, "+")), effect.expired && Number.isFinite(Number(effect.maximum)) && /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => updateEffectRemaining(effect, Number(effect.maximum)),
            className: "min-h-9 px-2 rounded border border-cyan-700 text-[10px] text-cyan-100"
          }, "Reiniciar"), /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => deleteEffect(effect),
            className: "min-h-9 px-2 rounded border border-red-800 px-2 text-[10px] text-red-100"
          }, "Finalizar"), effect.expired && /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => confirmDelete(`¿Eliminar el efecto ${effect.name}?`, () => permanentlyDeleteEffect(effect)),
            className: "min-h-9 px-2 rounded border border-gray-600 text-[10px] text-gray-300"
          }, "Eliminar"))));
        };
        return /*#__PURE__*/React.createElement("section", {
          className: "rounded border border-cyan-800 bg-cyan-950/15 p-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap items-center justify-between gap-2"
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
          className: "font-fantasy text-sm font-bold uppercase tracking-wider text-cyan-200"
        }, "Efectos"), /*#__PURE__*/React.createElement("p", {
          className: "mt-1 text-xs text-gray-500"
        }, "Activos primero; los expirados permanecen plegados.")), canAddEffect && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openEffectModal(),
          className: "min-h-10 px-3 rounded border border-cyan-700 text-xs text-cyan-100"
        }, "Añadir efecto")), /*#__PURE__*/React.createElement("div", {
          className: "mt-3 space-y-2"
        }, activeEffects.map(renderEffect), !activeEffects.length && /*#__PURE__*/React.createElement("p", {
          className: "text-sm text-gray-500"
        }, "No hay efectos activos.")), /*#__PURE__*/React.createElement("div", {
          className: "mt-4 border-t border-gray-700 pt-3"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setExpiredEffectsOpen(previous => !previous),
          className: "min-h-10 w-full rounded border border-gray-700 px-3 text-left text-xs text-gray-300",
          "aria-expanded": expiredEffectsOpen
        }, "Efectos expirados (", expiredEffects.length, ")"), expiredEffectsOpen && /*#__PURE__*/React.createElement("div", {
          className: "mt-2 space-y-2"
        }, expiredEffects.map(renderEffect), !expiredEffects.length && /*#__PURE__*/React.createElement("p", {
          className: "text-xs text-gray-500"
        }, "No hay efectos expirados."))));
      })(), false && onlineTableView === 'encounter' && (() => {
        const order = Array.isArray(roomData?.turnOrder) ? roomData.turnOrder : [];
        const currentIndex = Math.max(0, Math.min(Number(roomData?.turnIndex) || 0, Math.max(0, order.length - 1)));
        const currentId = roomData?.currentTurnId || order[currentIndex];
        const nextId = order.length > 1 ? order[(currentIndex + 1) % order.length] : null;
        return /*#__PURE__*/React.createElement("section", {
          className: "rounded border border-purple-700 bg-purple-950/25 p-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap items-center justify-between gap-2"
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
          className: "font-fantasy text-sm font-bold uppercase tracking-wider text-purple-200"
        }, "Encuentro · Ronda ", roomData?.round || 1), /*#__PURE__*/React.createElement("p", {
          className: "mt-1 text-xs text-gray-400"
        }, roomData?.status === 'paused' ? 'Pausado · ' : '', "Turno: ", participantName(currentId), nextId ? ` · Siguiente: ${participantName(nextId)}` : '')), /*#__PURE__*/React.createElement("span", {
          className: `rounded border px-2 py-1 text-[10px] font-bold uppercase ${roomData?.status === 'paused' ? 'border-yellow-800 bg-yellow-950/30 text-yellow-200' : 'border-emerald-800 bg-emerald-950/30 text-emerald-200'}`
        }, roomData?.status === 'paused' ? 'Pausado' : 'Activo')), (() => {
          const selected = getCombatant(selectedCombatantId || currentId);
          const selectedEffects = encounterEffects.filter(effect => effect.targetId === selected?.id || effect.targetId === selected?.ownerUid);
          return /*#__PURE__*/React.createElement("div", {
            className: "mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]"
          }, /*#__PURE__*/React.createElement("div", {
            className: "rounded border border-cyan-800 bg-cyan-950/20 p-3"
          }, /*#__PURE__*/React.createElement("span", {
            className: "text-[10px] font-bold uppercase text-cyan-300"
          }, "Combatiente seleccionado"), /*#__PURE__*/React.createElement("strong", {
            className: "mt-1 block text-lg text-white"
          }, selected?.name || 'Selecciona un combatiente'), selected && /*#__PURE__*/React.createElement("div", {
            className: "mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-300"
          }, /*#__PURE__*/React.createElement("span", null, "Iniciativa ", selected.initiative ?? '—'), selected.type === 'enemy' ? /*#__PURE__*/React.createElement("span", {
            className: "capitalize text-orange-200"
          }, selected.visibleState || 'oculto') : /*#__PURE__*/React.createElement("span", null, selected.ownerUid === firebaseUser?.uid ? 'Tú' : 'Jugador')), /*#__PURE__*/React.createElement("div", {
            className: "mt-2 flex flex-wrap gap-1"
          }, normalizeOnlineConditions(selected?.type === 'enemy' ? selected?.conditionsVisible : selected?.conditions).map(condition => /*#__PURE__*/React.createElement("span", {
            key: condition.id,
            className: "rounded border border-red-900 px-1.5 py-0.5 text-[10px] text-red-100"
          }, condition.name)))), /*#__PURE__*/React.createElement("div", {
            className: "rounded border border-gray-700 bg-gray-950/40 p-3"
          }, /*#__PURE__*/React.createElement("span", {
            className: "text-[10px] font-bold uppercase text-gray-400"
          }, "Efectos relevantes"), /*#__PURE__*/React.createElement("div", {
            className: "mt-2 space-y-1"
          }, selectedEffects.filter(effect => !effect.expired).slice(0, 3).map(effect => /*#__PURE__*/React.createElement("div", {
            key: effect.id,
            className: "flex justify-between gap-2 text-xs text-gray-300"
          }, /*#__PURE__*/React.createElement("span", {
            className: "truncate"
          }, effect.name), /*#__PURE__*/React.createElement("span", null, effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType}`))), !selectedEffects.filter(effect => !effect.expired).length && /*#__PURE__*/React.createElement("p", {
            className: "text-xs text-gray-500"
          }, "Sin efectos activos."))));
        })(), /*#__PURE__*/React.createElement("div", {
          className: "online-turn-order mt-3 space-y-1.5 overflow-y-auto pr-1"
        }, order.map((id, index) => {
          const participant = getCombatant(id);
          const active = id === currentId;
          return /*#__PURE__*/React.createElement("button", {
            type: "button",
            key: `${id}-${index}`,
            onClick: () => setSelectedCombatantId(id),
            className: `flex w-full items-center gap-3 rounded border px-3 py-2 text-left ${active ? 'border-cyan-400 bg-cyan-950/45 shadow-[0_0_12px_rgba(34,211,238,0.16)]' : selectedCombatantId === id ? 'border-purple-500 bg-purple-950/25' : 'border-gray-700 bg-gray-900/60'}`
          }, /*#__PURE__*/React.createElement("span", {
            className: `w-6 text-center text-xs font-bold ${active ? 'text-cyan-200' : 'text-gray-500'}`
          }, index + 1), /*#__PURE__*/React.createElement("div", {
            className: "min-w-0 flex-1"
          }, /*#__PURE__*/React.createElement("strong", {
            className: "block truncate text-sm text-white"
          }, participant?.name || 'Participante', participant?.ownerUid === firebaseUser?.uid ? ' (Tú)' : ''), /*#__PURE__*/React.createElement("span", {
            className: "text-xs text-gray-400"
          }, participant?.type === 'enemy' ? `${participant.visibleState || 'oculto'} · ` : '', "Iniciativa: ", hasInitiativeValue(participant?.initiative) ? participant.initiative : '—')), active && /*#__PURE__*/React.createElement("span", {
            className: "shrink-0 text-[10px] font-bold uppercase text-cyan-200"
          }, "Turno actual"));
        })), isCurrentRoomMaster && /*#__PURE__*/React.createElement("div", {
          className: "mt-3 flex flex-wrap gap-2 border-t border-purple-900/70 pt-3"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy || roomData?.status !== 'active',
          onClick: () => changeEncounterTurn(-1),
          className: "min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200 disabled:opacity-40"
        }, "Turno anterior"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy || roomData?.status !== 'active',
          onClick: () => changeEncounterTurn(1),
          className: "min-h-10 px-3 rounded border border-cyan-700 bg-cyan-950/30 text-xs text-cyan-100 disabled:opacity-40"
        }, "Siguiente turno"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy || roomData?.status !== 'active',
          onClick: () => setPostponeOpen(true),
          className: "min-h-10 px-3 rounded border border-purple-700 text-xs text-purple-100 disabled:opacity-40"
        }, "Postergar"), roomData?.status === 'active' ? /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy,
          onClick: () => setEncounterStatus('paused'),
          className: "min-h-10 px-3 rounded border border-yellow-800 text-xs text-yellow-100 disabled:opacity-40"
        }, "Pausar") : /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy,
          onClick: () => setEncounterStatus('active'),
          className: "min-h-10 px-3 rounded border border-emerald-800 text-xs text-emerald-100 disabled:opacity-40"
        }, "Reanudar"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy,
          onClick: () => setFinishEncounterPrompt(true),
          className: "min-h-10 px-3 rounded border border-red-800 text-xs text-red-200 disabled:opacity-40"
        }, "Finalizar encuentro")));
      })(), postponeOpen && roomData?.status === 'active' && /*#__PURE__*/React.createElement("section", {
        className: "rounded border border-purple-700 bg-gray-950/70 p-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center justify-between gap-3"
      }, /*#__PURE__*/React.createElement("h4", {
        className: "font-fantasy text-sm font-bold text-purple-200"
      }, "Postergar turno"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setPostponeOpen(false),
        className: "w-9 h-9 rounded border border-gray-600 text-gray-300",
        "aria-label": "Cerrar"
      }, "×")), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-gray-400"
      }, "Elige la nueva posición de ", participantName(roomData?.currentTurnId), "."), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 flex flex-wrap gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: encounterBusy,
        onClick: () => postponeCurrentTurn('after-next'),
        className: "min-h-10 px-3 rounded border border-purple-700 text-xs text-purple-100"
      }, "Después del siguiente"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: encounterBusy,
        onClick: () => postponeCurrentTurn('end'),
        className: "min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200"
      }, "Al final de la ronda")), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 grid grid-cols-1 gap-1"
      }, (roomData?.turnOrder || []).filter(id => id !== roomData?.currentTurnId).map(id => /*#__PURE__*/React.createElement("button", {
        key: id,
        type: "button",
        disabled: encounterBusy,
        onClick: () => postponeCurrentTurn('before', id),
        className: "min-h-9 rounded border border-gray-700 px-3 text-left text-xs text-gray-300 hover:border-purple-500"
      }, "Antes de ", participantName(id))))), onlineTableView === 'encounter' && onlineEncounterView === 'encounter' && isCurrentRoomMaster && (() => {
        const turnOrder = Array.isArray(roomData?.turnOrder) ? roomData.turnOrder : [];
        const outsideEnemies = publicCombatants.filter(enemy => !turnOrder.includes(enemy.id));
        const selectedEnemyIds = outsideEncounterEnemyIds.filter(id => outsideEnemies.some(enemy => enemy.id === id && !enemy.defeated));
        if (!outsideEnemies.length) return null;
        const toggleEnemy = (enemyId, checked) => setOutsideEncounterEnemyIds(previous => checked ? [...new Set([...previous, enemyId])] : previous.filter(id => id !== enemyId));
        return /*#__PURE__*/React.createElement("section", {
          className: "rounded border border-orange-800 bg-orange-950/15 p-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap items-center justify-between gap-2"
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
          className: "font-fantasy text-sm font-bold uppercase tracking-wider text-orange-200"
        }, "Fuera del encuentro"), /*#__PURE__*/React.createElement("p", {
          className: "mt-1 text-xs text-gray-400"
        }, "Enemigos creados que todavía no forman parte del orden.")), /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap gap-2"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy || !selectedEnemyIds.length,
          onClick: () => addEnemyIdsAfterCurrent(selectedEnemyIds),
          className: "min-h-10 rounded border border-orange-700 px-3 text-xs text-orange-100 disabled:opacity-40"
        }, "Añadir después del turno"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy || !selectedEnemyIds.length,
          onClick: () => addEnemyIdsAtEnd(selectedEnemyIds),
          className: "min-h-10 rounded border border-gray-600 px-3 text-xs text-gray-200 disabled:opacity-40"
        }, "Añadir al final"))), /*#__PURE__*/React.createElement("div", {
          className: "mt-3 space-y-2"
        }, outsideEnemies.map(enemy => /*#__PURE__*/React.createElement("div", {
          key: enemy.id,
          className: "flex flex-wrap items-center gap-2 rounded border border-gray-700 bg-gray-900/60 px-3 py-2"
        }, /*#__PURE__*/React.createElement("label", {
          className: "flex min-h-10 min-w-10 items-center justify-center"
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          checked: selectedEnemyIds.includes(enemy.id),
          disabled: enemy.defeated,
          onChange: event => toggleEnemy(enemy.id, event.target.checked),
          "aria-label": `Seleccionar ${enemy.name}`
        })), /*#__PURE__*/React.createElement("div", {
          className: "min-w-0 flex-1"
        }, /*#__PURE__*/React.createElement("strong", {
          className: "block truncate text-sm text-white"
        }, enemy.name), /*#__PURE__*/React.createElement("span", {
          className: "text-xs text-gray-400"
        }, "Iniciativa ", enemy.initiative ?? '—', " · ", enemy.defeated ? 'Derrotado' : enemy.visibleState || 'oculto')), /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap gap-1"
        }, !enemy.defeated && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy,
          onClick: () => addEnemyIdsAfterCurrent([enemy.id]),
          className: "min-h-9 rounded border border-orange-700 px-2 text-[10px] text-orange-100 disabled:opacity-40"
        }, "Después del turno"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy,
          onClick: () => addEnemyIdsAtEnd([enemy.id]),
          className: "min-h-9 rounded border border-gray-600 px-2 text-[10px] text-gray-200 disabled:opacity-40"
        }, "Al final")), enemy.defeated && /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: encounterBusy,
          onClick: () => {
            const privateData = privateEnemies.find(item => item.id === enemy.id);
            if (privateData) updateEnemyHp(enemy, {
              currentHp: getHpValues(privateData).maxHp
            }).catch(() => setOnlineTableError('No se pudo curar el enemigo.'));
          },
          className: "min-h-9 rounded border border-emerald-800 px-2 text-[10px] text-emerald-100 disabled:opacity-40"
        }, "Curar"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openEnemyModal(enemy),
          className: "min-h-9 rounded border border-gray-600 px-2 text-[10px] text-gray-200"
        }, "Editar"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => confirmDelete(`¿Eliminar a ${enemy.name}?`, () => deleteEnemy(enemy.id)),
          className: "min-h-9 rounded border border-red-900 px-2 text-[10px] text-red-200"
        }, "Eliminar"))))));
      })(), onlineTableView === 'lobby' && onlineRoomModule === 'sheets' && isCurrentRoomMaster && /*#__PURE__*/React.createElement(OnlinePartyOverview, {
        participants: playerRoomParticipants,
        members: roomMembers,
        sheets: roomPlayerSheets,
        onOpenSheet: setOnlinePlayerSheetId,
        onAvatarPreview: setOnlineAvatarViewer,
        onKickMember: confirmKickRoomPlayer
      }), onlineTableView === 'lobby' && onlineRoomModule === 'sheets' && isCurrentRoomMaster && /*#__PURE__*/React.createElement("div", {
        className: "online-module-actions"
      }, /*#__PURE__*/React.createElement("span", null, sharedCharacterId ? `Tu personaje también está compartido · ${sheetSyncStatus === 'synced' ? 'sincronizado' : 'actualizando'}` : 'Como Máster también puedes compartir un personaje propio.'), sharedCharacterId ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: sharingCharacter,
        onClick: updateSharedCharacter
      }, "Sincronizar ahora"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: openCharacterSelector
      }, "Cambiar mi personaje")) : /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: openCharacterSelector
      }, "Compartir mi personaje")), onlineTableView === 'lobby' && onlineRoomModule === 'sheets' && !isCurrentRoomMaster && /*#__PURE__*/React.createElement("section", {
        className: "online-shared-sheet-status"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Ficha que ve el Máster"), /*#__PURE__*/React.createElement("h4", null, sharedCharacter?.data?.charInfo?.name || sharedCharacter?.meta?.name || 'Ningún personaje compartido'), /*#__PURE__*/React.createElement("p", null, sharedCharacter ? `${sharedCharacter.data?.charInfo?.cls || 'Sin clase'} · Nivel ${sharedCharacter.data?.level || 1}` : 'Selecciona la ficha que usarás en esta mesa.')), /*#__PURE__*/React.createElement("span", {
        className: `is-${sheetSyncStatus}`
      }, sheetSyncStatus === 'synced' ? 'Sincronizada' : sheetSyncStatus === 'syncing' ? 'Sincronizando…' : sheetSyncStatus === 'pending' ? 'Cambios pendientes' : sheetSyncStatus === 'failed' ? 'Error de sincronización' : sheetSyncStatus === 'offline' ? 'Sin conexión' : 'Sin compartir')), /*#__PURE__*/React.createElement("div", {
        className: "online-shared-sheet-status__body"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "↻"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Actualización automática"), /*#__PURE__*/React.createElement("p", null, "Inspiración, espacios de conjuro, recursos, equipo, mochila y el resto de datos compartidos se envían al Máster unos instantes después de cambiar."))), /*#__PURE__*/React.createElement("footer", null, sharedCharacter ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: sharingCharacter || sheetSyncStatus === 'syncing',
        onClick: updateSharedCharacter
      }, sharingCharacter ? 'Actualizando…' : 'Sincronizar ahora'), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: openCharacterSelector
      }, "Cambiar personaje")) : /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: openCharacterSelector,
        className: "is-primary"
      }, "Compartir mi personaje"))), onlineTableView === 'lobby' && onlineRoomModule === 'sheets' && !isCurrentRoomMaster && /*#__PURE__*/React.createElement(OnlineGroupRoster, {
        participants: playerRoomParticipants,
        members: roomMembers
      }), onlineTableView === 'lobby' && onlineRoomModule === 'combat' && (() => {
        const playerMembers = roomMembers.filter(member => member.role === 'player');
        const sharedPlayers = playerMembers.filter(member => playerRoomParticipants.some(participant => participant.ownerUid === member.uid));
        const readyPlayers = sharedPlayers.filter(member => {
          const participant = playerRoomParticipants.find(item => item.ownerUid === member.uid);
          return participant && hasInitiativeValue(participant.initiative);
        });
        const preparationReady = encounterCombatants.length > 0 && encounterCombatants.every(combatant => hasInitiativeValue(combatant.initiative));
        return /*#__PURE__*/React.createElement("section", {
          className: "online-combat-lobby"
        }, /*#__PURE__*/React.createElement("header", {
          className: "online-combat-lobby__hero"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "⚔"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Centro de preparación"), /*#__PURE__*/React.createElement("h4", null, "Preparar el próximo combate"), /*#__PURE__*/React.createElement("p", null, "Comprueba quién está conectado, completa las iniciativas y reúne a los enemigos antes de ordenar los turnos.")), isCurrentRoomMaster && /*#__PURE__*/React.createElement("div", {
          className: "online-combat-lobby__hero-actions"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openEnemyModal()
        }, "＋ Añadir enemigo"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "is-primary",
          disabled: !encounterCombatants.length,
          onClick: buildPreparedTurnOrder
        }, "Preparar encuentro ", /*#__PURE__*/React.createElement("b", null, "→")))), /*#__PURE__*/React.createElement("div", {
          className: "online-combat-lobby__summary"
        }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Jugadores"), /*#__PURE__*/React.createElement("strong", null, playerMembers.length), /*#__PURE__*/React.createElement("em", null, sharedPlayers.length, " con personaje")), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Iniciativas"), /*#__PURE__*/React.createElement("strong", null, readyPlayers.length, "/", sharedPlayers.length), /*#__PURE__*/React.createElement("em", null, preparationReady ? 'Todo listo' : 'Pendientes')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Enemigos"), /*#__PURE__*/React.createElement("strong", null, publicCombatants.length), /*#__PURE__*/React.createElement("em", null, publicCombatants.filter(enemy => hasInitiativeValue(enemy.initiative)).length, " preparados")), /*#__PURE__*/React.createElement("span", {
          className: preparationReady ? 'is-ready' : ''
        }, /*#__PURE__*/React.createElement("small", null, "Estado"), /*#__PURE__*/React.createElement("strong", null, preparationReady ? 'Listo' : 'En preparación'), /*#__PURE__*/React.createElement("em", null, preparationReady ? 'Puedes ordenar turnos' : 'Revisa los avisos'))), companionRoomParticipants.length > 0 && /*#__PURE__*/React.createElement("section", {
          className: "online-combat-companions"
        }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Aliados vinculados"), /*#__PURE__*/React.createElement("h5", null, "Compañeros que participarán")), /*#__PURE__*/React.createElement("span", null, companionRoomParticipants.length, " incluidos por sus jugadores")), /*#__PURE__*/React.createElement("div", null, companionRoomParticipants.map(companion => {
          const owner = playerRoomParticipants.find(participant => participant.ownerUid === companion.ownerUid);
          const ownerName = roomMembers.find(member => member.uid === companion.ownerUid)?.displayName || owner?.name || 'Jugador';
          const ownInitiative = companion.initiativeMode === 'own';
          const canEdit = isCurrentRoomMaster || companion.ownerUid === firebaseUser?.uid;
          return /*#__PURE__*/React.createElement("article", {
            key: companion.id,
            className: hasInitiativeValue(companion.initiative) ? 'is-ready' : 'is-pending'
          }, /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
            combatant: companion,
            className: "h-10 w-10 text-xs"
          }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, COMPANION_CATEGORY_LABELS[companion.category] || 'Compañero', " de ", ownerName), /*#__PURE__*/React.createElement("strong", null, companion.name), /*#__PURE__*/React.createElement("p", null, "PV ", companion.currentHp, "/", companion.maxHp, " · CA ", companion.armorClass || '—')), ownInitiative && canEdit ? /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Iniciativa propia"), /*#__PURE__*/React.createElement("input", {
            type: "number",
            inputMode: "numeric",
            value: participantInitiativeDrafts[companion.id] ?? companion.initiative ?? '',
            onChange: event => setParticipantInitiativeDrafts(previous => ({
              ...previous,
              [companion.id]: event.target.value
            })),
            onBlur: () => commitParticipantInitiative(companion),
            onKeyDown: event => {
              if (event.key === 'Enter') event.currentTarget.blur();
            },
            placeholder: "—"
          })) : /*#__PURE__*/React.createElement("span", {
            className: "online-combat-companions__turn"
          }, /*#__PURE__*/React.createElement("small", null, ownInitiative ? 'Iniciativa' : 'Turno'), /*#__PURE__*/React.createElement("strong", null, ownInitiative ? companion.initiative ?? 'Pendiente' : `Con ${owner?.name || 'su dueño'}`)));
        }))), /*#__PURE__*/React.createElement("div", {
          className: "online-combat-lobby__layout"
        }, /*#__PURE__*/React.createElement("section", {
          className: "online-combat-party"
        }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Participantes"), /*#__PURE__*/React.createElement("h5", null, "Miembros de la mesa")), /*#__PURE__*/React.createElement("span", null, roomMembers.length, " conectados")), /*#__PURE__*/React.createElement("div", {
          className: "online-combat-party__list"
        }, roomMembers.map(member => {
          const participant = roomParticipants.find(item => item.ownerUid === member.uid);
          const memberIsMaster = member.role === 'master';
          const connected = !!(member.active && (participant ? participant.connected !== false : true));
          const initiativeReady = participant && hasInitiativeValue(participant.initiative);
          const canEditInitiative = !!participant && (isCurrentRoomMaster || participant.ownerUid === firebaseUser?.uid);
          const displayName = member.displayName || (memberIsMaster ? 'Máster' : 'Jugador sin identificar');
          return /*#__PURE__*/React.createElement("article", {
            key: member.id,
            className: `${connected ? 'is-connected' : 'is-offline'} ${initiativeReady ? 'is-ready' : ''}`
          }, /*#__PURE__*/React.createElement("div", {
            className: "online-combat-party__avatar"
          }, participant ? /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
            combatant: participant,
            className: "h-12 w-12 text-sm"
          }) : /*#__PURE__*/React.createElement("span", {
            "aria-hidden": "true"
          }, memberIsMaster ? '♜' : '?'), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("div", {
            className: "online-combat-party__identity"
          }, /*#__PURE__*/React.createElement("small", null, memberIsMaster ? 'Director de juego' : `Jugador · ${displayName}`, member.uid === firebaseUser?.uid ? ' · Tú' : ''), /*#__PURE__*/React.createElement("strong", null, participant?.name || (memberIsMaster ? displayName : 'Sin personaje compartido')), /*#__PURE__*/React.createElement("p", null, participant ? `${participant.className || 'Sin clase'} · Nivel ${participant.level || '—'}` : memberIsMaster ? 'Organiza y dirige el encuentro' : 'Debe compartir una ficha antes del combate')), /*#__PURE__*/React.createElement("div", {
            className: "online-combat-party__state"
          }, /*#__PURE__*/React.createElement("span", {
            className: connected ? 'is-online' : ''
          }, connected ? 'Conectado' : 'Desconectado'), participant && /*#__PURE__*/React.createElement("span", {
            className: initiativeReady ? 'is-ready' : 'is-pending'
          }, initiativeReady ? 'Iniciativa lista' : 'Falta iniciativa')), canEditInitiative ? /*#__PURE__*/React.createElement("label", {
            className: "online-combat-party__initiative"
          }, /*#__PURE__*/React.createElement("span", null, "Iniciativa"), /*#__PURE__*/React.createElement("input", {
            type: "number",
            inputMode: "numeric",
            value: participantInitiativeDrafts[participant.id] ?? participant.initiative ?? '',
            onChange: event => setParticipantInitiativeDrafts(previous => ({
              ...previous,
              [participant.id]: event.target.value
            })),
            onBlur: () => commitParticipantInitiative(participant),
            onKeyDown: event => {
              if (event.key === 'Enter') event.currentTarget.blur();
            },
            placeholder: "—",
            "aria-label": `Iniciativa de ${participant.name || 'participante'}`
          })) : participant ? /*#__PURE__*/React.createElement("div", {
            className: "online-combat-party__initiative is-readonly"
          }, /*#__PURE__*/React.createElement("span", null, "Iniciativa"), /*#__PURE__*/React.createElement("strong", null, participant.initiative ?? '—')) : null, isCurrentRoomMaster && !memberIsMaster && /*#__PURE__*/React.createElement("button", {
            type: "button",
            disabled: onlineTableBusy,
            onClick: () => confirmKickRoomPlayer(member),
            className: "online-combat-party__kick",
            "aria-label": `Expulsar a ${displayName} de la sala`
          }, "Expulsar"));
        }), !roomMembers.length && /*#__PURE__*/React.createElement("div", {
          className: "online-combat-party__empty"
        }, "No hay miembros activos."))), isCurrentRoomMaster ? /*#__PURE__*/React.createElement("aside", {
          className: "online-combat-enemies"
        }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Oposición"), /*#__PURE__*/React.createElement("h5", null, "Enemigos preparados")), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openEnemyModal(),
          "aria-label": "Añadir enemigo"
        }, "＋")), /*#__PURE__*/React.createElement("div", {
          className: "online-combat-enemies__list"
        }, publicCombatants.map(enemy => {
          const privateData = privateEnemies.find(item => item.id === enemy.id);
          return /*#__PURE__*/React.createElement("article", {
            key: enemy.id
          }, /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
            combatant: enemy,
            className: "h-10 w-10 text-xs"
          }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, enemy.name), /*#__PURE__*/React.createElement("span", null, "PV ", privateData?.currentHp ?? '—', "/", privateData?.maxHp ?? '—', " · CA ", privateData?.armorClass ?? '—')), /*#__PURE__*/React.createElement("b", {
            className: hasInitiativeValue(enemy.initiative) ? '' : 'is-missing'
          }, hasInitiativeValue(enemy.initiative) ? `Ini ${enemy.initiative}` : 'Sin ini.'), /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => openEnemyModal(enemy)
          }, "Editar"));
        }), !publicCombatants.length && /*#__PURE__*/React.createElement("div", {
          className: "online-combat-enemies__empty"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "♞"), /*#__PURE__*/React.createElement("strong", null, "Aún no hay enemigos"), /*#__PURE__*/React.createElement("p", null, "Añade criaturas del compendio, de tu bestiario o crea una aparición puntual."), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openEnemyModal()
        }, "Añadir el primero")))) : /*#__PURE__*/React.createElement("aside", {
          className: "online-combat-waiting"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "◇"), /*#__PURE__*/React.createElement("strong", null, preparationReady ? 'El grupo está preparado' : 'Preparación en curso'), /*#__PURE__*/React.createElement("p", null, "El Máster organizará el orden cuando personajes y enemigos tengan su iniciativa."))));
      })(), false && onlineTableView === 'encounter' && /*#__PURE__*/React.createElement("section", {
        className: "rounded border border-purple-900/70 bg-purple-950/10 p-3"
      }, /*#__PURE__*/React.createElement("h4", {
        className: "font-fantasy text-sm font-bold uppercase tracking-wider text-purple-200"
      }, "Condiciones"), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 space-y-2"
      }, encounterCombatants.map(target => {
        const isEnemy = target.type === 'enemy';
        const items = normalizeOnlineConditions(isEnemy ? target.conditionsVisible : target.conditions);
        const canEdit = canManageEnemies || !isEnemy && target.ownerUid === firebaseUser?.uid;
        return /*#__PURE__*/React.createElement("div", {
          key: `conditions-${target.id}`,
          className: "rounded border border-gray-700 bg-gray-900/50 p-2"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap items-center justify-between gap-2"
        }, /*#__PURE__*/React.createElement("strong", {
          className: "text-xs text-gray-200"
        }, target.name), canEdit && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openConditionModal(target),
          className: "min-h-8 px-2 rounded border border-purple-700 text-[10px] text-purple-100"
        }, "Añadir condición")), /*#__PURE__*/React.createElement("div", {
          className: "mt-2 flex flex-wrap gap-1"
        }, items.map(condition => /*#__PURE__*/React.createElement("span", {
          key: condition.id,
          className: "inline-flex items-center gap-1 rounded border border-red-900 bg-red-950/40 px-1.5 py-0.5 text-[10px] text-red-100"
        }, condition.name, canEdit && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => removeOnlineCondition(target, condition.id),
          className: "text-red-200",
          "aria-label": `Quitar ${condition.name}`
        }, "×"))), !items.length && /*#__PURE__*/React.createElement("span", {
          className: "text-xs text-gray-500"
        }, "Sin condiciones")));
      }))), false && onlineTableView === 'encounter' && /*#__PURE__*/React.createElement("section", {
        className: "rounded border border-cyan-900/70 bg-cyan-950/10 p-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap items-center justify-between gap-2"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
        className: "font-fantasy text-sm font-bold uppercase tracking-wider text-cyan-200"
      }, "Efectos activos"), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-gray-500"
      }, "Duraciones compartidas del encuentro.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => openEffectModal(),
        className: "min-h-10 px-3 rounded border border-cyan-700 text-xs text-cyan-100"
      }, "Añadir efecto")), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 space-y-2"
      }, encounterEffects.slice().sort((a, b) => Number(a.expired) - Number(b.expired) || (a.remaining ?? Infinity) - (b.remaining ?? Infinity)).map(effect => {
        const target = effect.targetType === 'global' ? null : getCombatant(effect.targetId);
        const canEdit = canManageEffect(effect);
        const hasMaximum = Number.isFinite(Number(effect.maximum)) && Number(effect.maximum) >= 0;
        return /*#__PURE__*/React.createElement("div", {
          key: effect.id,
          className: `rounded border p-3 ${effect.expired ? 'border-gray-800 bg-gray-950/40 text-gray-500' : 'border-cyan-900 bg-gray-900/60'}`
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap items-start justify-between gap-2"
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
          className: "block text-sm text-white"
        }, effect.name, (effect.requiresConcentration || effect.concentration) && /*#__PURE__*/React.createElement("span", {
          className: "ml-2 text-[10px] uppercase text-purple-200"
        }, "Concentración")), /*#__PURE__*/React.createElement("span", {
          className: "text-xs text-gray-400"
        }, target?.name || (effect.targetType === 'global' ? 'Global' : 'Objetivo eliminado'), " · ", effect.expired ? 'Expirado' : effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType} restantes`), effect.notesPublic && /*#__PURE__*/React.createElement("span", {
          className: "block text-xs text-gray-500"
        }, effect.notesPublic)), canEdit && /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap items-center gap-1"
        }, effect.remaining !== null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => updateEffectRemaining(effect, Number(effect.remaining) - 1),
          className: "w-8 h-8 rounded border border-gray-600 text-gray-200"
        }, "−"), /*#__PURE__*/React.createElement("span", {
          className: "min-w-10 text-center text-xs"
        }, effect.remaining), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => updateEffectRemaining(effect, Number(effect.remaining) + 1),
          className: "w-8 h-8 rounded border border-gray-600 text-gray-200"
        }, "+")), effect.expired && hasMaximum && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => updateEffectRemaining(effect, Number(effect.maximum)),
          className: "min-h-8 px-2 rounded border border-cyan-700 text-[10px] text-cyan-100"
        }, "Reiniciar"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => deleteEffect(effect),
          className: "min-h-8 px-2 rounded border border-red-800 text-[10px] text-red-100"
        }, effect.requiresConcentration || effect.concentration ? 'Finalizar concentración' : 'Finalizar'), effect.expired && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => confirmDelete(`¿Eliminar el efecto ${effect.name}?`, () => permanentlyDeleteEffect(effect)),
          className: "min-h-8 px-2 rounded border border-gray-700 text-[10px] text-gray-300"
        }, "Eliminar"))));
      }), !encounterEffects.length && /*#__PURE__*/React.createElement("p", {
        className: "text-sm text-gray-500"
      }, "No hay efectos activos."))), false && onlineTableView === 'encounter' && /*#__PURE__*/React.createElement("section", {
        className: "rounded border border-red-900/70 bg-red-950/10 p-3"
      }, /*#__PURE__*/React.createElement("h4", {
        className: "font-fantasy text-sm font-bold uppercase tracking-wider text-red-200"
      }, "Vida compartida"), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 space-y-2"
      }, roomParticipants.map(participant => {
        const values = getHpValues(participant);
        const canEdit = isCurrentRoomMaster || participant.ownerUid === firebaseUser?.uid;
        const percent = values.maxHp > 0 ? Math.min(100, values.currentHp / values.maxHp * 100) : 0;
        return /*#__PURE__*/React.createElement("div", {
          key: `hp-${participant.id}`,
          className: "rounded border border-gray-700 bg-gray-900/60 p-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap items-center justify-between gap-2"
        }, /*#__PURE__*/React.createElement("div", {
          className: "min-w-0"
        }, /*#__PURE__*/React.createElement("strong", {
          className: "block truncate text-sm text-white"
        }, participant.name || 'Personaje sin nombre', participant.ownerUid === firebaseUser?.uid ? ' (Tú)' : ''), /*#__PURE__*/React.createElement("span", {
          className: "text-xs text-gray-400"
        }, "PV ", values.currentHp, " / ", values.maxHp, values.tempHp > 0 ? ` · Temporal ${values.tempHp}` : '')), canEdit && /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap items-center gap-1"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => updateParticipantHp(participant, {
            currentHp: Math.max(0, values.currentHp - 1)
          }, isCurrentRoomMaster ? 'master' : 'player').catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.')),
          className: "w-9 h-9 rounded border border-gray-600 text-gray-200",
          "aria-label": `Reducir vida de ${participant.name}`
        }, "−"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openParticipantHpModal(participant),
          className: "min-h-9 px-3 rounded border border-red-800 text-xs text-red-100"
        }, "Modificar vida"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => updateParticipantHp(participant, {
            currentHp: Math.min(values.maxHp, values.currentHp + 1)
          }, isCurrentRoomMaster ? 'master' : 'player').catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.')),
          className: "w-9 h-9 rounded border border-gray-600 text-gray-200",
          "aria-label": `Aumentar vida de ${participant.name}`
        }, "+"))), /*#__PURE__*/React.createElement("div", {
          className: "mt-2 h-2 overflow-hidden rounded-full bg-gray-950"
        }, /*#__PURE__*/React.createElement("div", {
          className: "h-full rounded-full bg-red-500 transition-all",
          style: {
            width: `${percent}%`
          }
        })));
      }), !roomParticipants.length && /*#__PURE__*/React.createElement("p", {
        className: "text-sm text-gray-500"
      }, "No hay personajes compartidos.")), ownRoomParticipant && /*#__PURE__*/React.createElement("div", {
        className: `mt-2 flex flex-wrap items-center justify-between gap-2 text-xs ${hpSyncStatus === 'failed' ? 'text-red-300' : hpSyncStatus === 'pending' ? 'text-yellow-300' : hpSyncStatus === 'syncing' ? 'text-cyan-300' : 'text-emerald-300'}`
      }, /*#__PURE__*/React.createElement("span", null, hpSyncStatus === 'failed' ? 'No se pudo sincronizar la vida' : hpSyncStatus === 'pending' ? 'Vida pendiente de sincronizar' : hpSyncStatus === 'syncing' ? 'Sincronizando vida…' : 'Vida sincronizada'), hpSyncStatus === 'failed' && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: retryPendingHpSync,
        className: "min-h-8 px-2 rounded border border-red-700 text-[10px] text-red-100"
      }, "Reintentar"))), onlineTableView === 'lobby' && onlineRoomModule === 'room' && /*#__PURE__*/React.createElement("section", {
        className: "online-campaign-control"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "◈"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Acceso a la aventura"), /*#__PURE__*/React.createElement("h4", null, roomData?.name || 'Campaña Online'), /*#__PURE__*/React.createElement("p", null, "Invita al grupo y administra la conexión sin mezclar estas opciones con el resto del lobby.")), /*#__PURE__*/React.createElement("b", {
        className: isCurrentRoomMaster ? 'is-master' : ''
      }, isCurrentRoomMaster ? 'Máster' : 'Jugador')), /*#__PURE__*/React.createElement("div", {
        className: "online-campaign-control__access"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Código de invitación"), /*#__PURE__*/React.createElement("strong", null, currentRoom.code), /*#__PURE__*/React.createElement("p", null, "Solo quienes tengan este código podrán solicitar acceso.")), /*#__PURE__*/React.createElement("div", {
        className: "online-campaign-control__access-actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => copyRoomCode(currentRoom.code)
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "▣"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Copiar código"), /*#__PURE__*/React.createElement("small", null, "Al portapapeles"))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-primary",
        onClick: () => shareRoomLink(currentRoom.code)
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "↗"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Invitar jugadores"), /*#__PURE__*/React.createElement("small", null, "WhatsApp, Telegram o enlace"))))), /*#__PURE__*/React.createElement("div", {
        className: "online-campaign-control__status"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
        className: "is-online"
      }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Conexión"), /*#__PURE__*/React.createElement("strong", null, "Campaña activa"))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Estado"), /*#__PURE__*/React.createElement("strong", null, roomData?.status === 'paused' ? 'Combate pausado' : roomData?.status === 'active' ? `Ronda ${roomData.round || 1}` : 'En el lobby'))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Miembros"), /*#__PURE__*/React.createElement("strong", null, roomMembers.length, " en la campaña")))), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Navegación"), /*#__PURE__*/React.createElement("strong", null, "La campaña seguirá guardada en tu cuenta.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: returnToCampaignHub
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "⌂"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Cambiar de campaña"), /*#__PURE__*/React.createElement("small", null, "Volver a tus mesas"))), isCurrentRoomMaster && roomData?.status !== 'closed' && /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-danger",
        onClick: () => confirmDelete('¿Cerrar esta campaña definitivamente? Los jugadores perderán el acceso y esta acción no se puede deshacer.', closeOnlineRoom)
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "×"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Cerrar campaña"), /*#__PURE__*/React.createElement("small", null, "Acción definitiva")))))), onlineTableView === 'closed' && /*#__PURE__*/React.createElement("div", {
        className: "mt-5 space-y-4 rounded border border-red-800 bg-red-950/25 p-4 text-center"
      }, /*#__PURE__*/React.createElement("h4", {
        className: "font-fantasy text-lg font-bold text-red-200"
      }, "Sala cerrada"), /*#__PURE__*/React.createElement("p", {
        className: "text-sm text-gray-300"
      }, "El Máster ha cerrado esta sala. Puedes salir cuando quieras."), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: returnToCampaignHub,
        className: "min-h-11 px-4 rounded border border-gray-600 text-sm text-gray-200 hover:border-cyan-400"
      }, "Volver a mis campañas"))))), roomInvite.isOpen && (() => {
        const message = `Únete a mi Mesa Online de D&D · Sala ${roomInvite.code}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${message}\n${roomInvite.url}`)}`;
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(roomInvite.url)}&text=${encodeURIComponent(message)}`;
        return /*#__PURE__*/React.createElement("div", {
          className: "online-invite-overlay",
          role: "presentation",
          onMouseDown: event => {
            if (event.target === event.currentTarget) setRoomInvite({
              isOpen: false,
              code: '',
              url: ''
            });
          }
        }, /*#__PURE__*/React.createElement("section", {
          className: "online-invite-dialog",
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "online-invite-title"
        }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Invitar jugadores"), /*#__PURE__*/React.createElement("h4", {
          id: "online-invite-title"
        }, "Compartir sala ", roomInvite.code)), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setRoomInvite({
            isOpen: false,
            code: '',
            url: ''
          }),
          "aria-label": "Cerrar opciones de invitación"
        }, "×")), /*#__PURE__*/React.createElement("p", null, "Elige dónde enviar el enlace. Los jugadores abrirán directamente la pantalla para unirse a esta sala."), /*#__PURE__*/React.createElement("div", {
          className: "online-invite-options"
        }, /*#__PURE__*/React.createElement("a", {
          href: whatsappUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "is-whatsapp"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "W"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "WhatsApp"), /*#__PURE__*/React.createElement("small", null, "Abrir conversación o grupo")), /*#__PURE__*/React.createElement("b", {
          "aria-hidden": "true"
        }, "→")), /*#__PURE__*/React.createElement("a", {
          href: telegramUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "is-telegram"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "T"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Telegram"), /*#__PURE__*/React.createElement("small", null, "Elegir chat o canal")), /*#__PURE__*/React.createElement("b", {
          "aria-hidden": "true"
        }, "→")), navigator.share && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: shareRoomWithSystem,
          className: "is-system"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "↗"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Más aplicaciones"), /*#__PURE__*/React.createElement("small", null, "Abrir el menú del dispositivo")), /*#__PURE__*/React.createElement("b", {
          "aria-hidden": "true"
        }, "→")), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: async () => {
            if (await copyRoomCode(roomInvite.url, `Enlace de invitación copiado · Sala ${roomInvite.code}`)) setRoomInvite({
              isOpen: false,
              code: '',
              url: ''
            });
          },
          className: "is-copy"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "▣"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Copiar enlace"), /*#__PURE__*/React.createElement("small", null, "Pegarlo donde quieras")), /*#__PURE__*/React.createElement("b", {
          "aria-hidden": "true"
        }, "→"))), /*#__PURE__*/React.createElement("div", {
          className: "online-invite-code"
        }, /*#__PURE__*/React.createElement("span", null, "Código alternativo"), /*#__PURE__*/React.createElement("strong", null, roomInvite.code), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => copyRoomCode(roomInvite.code)
        }, "Copiar código"))));
      })()), document.body));
    }
    window.DndOnlineTableShellComponents = {
      OnlineTableShell
    };
  })();
})();