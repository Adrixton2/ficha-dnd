(() => {
    const { calculateCharacterArmorClass, isValidPortraitDataUrl } = window.DndAppUtils;
    const { getHpValues, isValidOnlinePlayerName, normalizeOnlineConditions, normalizeOnlinePlayerName, normalizeOnlineRoomCode } = window.DndOnlineTableUtils;
    const { OnlineCampaignLobby, OnlineGroupRoster, OnlinePartyOverview, OnlineRoomModuleSelector, OnlineTacticalDetailPanel } = window.DndOnlineComponents;
    const { COMPANION_CATEGORY_LABELS } = window.DndCompanionComponents;
    const formatCampaignActivity = value => {
        const timestamp = Number(value) || 0;
        if (!timestamp) return 'Sin actividad reciente';
        const elapsedMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
        if (elapsedMinutes < 2) return 'Actualizada ahora';
        if (elapsedMinutes < 60) return `Actualizada hace ${elapsedMinutes} min`;
        const elapsedHours = Math.round(elapsedMinutes / 60);
        if (elapsedHours < 24) return `Actualizada hace ${elapsedHours} h`;
        return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(timestamp));
    };
    const campaignStatusLabel = campaign => campaign.status === 'active'
        ? `Combate · Ronda ${campaign.round || 1}`
        : campaign.status === 'paused'
            ? `Combate pausado · Ronda ${campaign.round || 1}`
            : 'Campaña disponible';

    function OnlineTableShell({ model }) {
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
            updateEnemyInitiatives,
            updateEnemyHp,
            updateParticipantInitiative,
            updateParticipantHp,
            updateSharedCharacter
        } = model;
        const [campaignNameInput, setCampaignNameInput] = React.useState('');
        const roomCodeInputRef = React.useRef(null);
        const applyRoomCodeInput = value => {
            setOnlineTableError('');
            setRoomCodeInput(normalizeOnlineRoomCode(value));
        };
        const pasteRoomCode = async () => {
            try {
                const clipboardText = await navigator.clipboard.readText();
                if (!clipboardText) throw new Error('EMPTY_CLIPBOARD');
                applyRoomCodeInput(clipboardText);
                roomCodeInputRef.current?.focus();
            } catch (error) {
                setOnlineTableError('No se pudo leer el portapapeles. Mantén pulsado el campo y elige Pegar.');
                roomCodeInputRef.current?.focus();
            }
        };
        const getParticipantSheetSnapshot = participant => {
            if (!participant) return null;
            const sheetDocument = roomPlayerSheets.find(sheet => sheet.ownerUid === participant.ownerUid && (!participant.characterId || !sheet.characterId || sheet.characterId === participant.characterId));
            const remoteSnapshot = window.DndOnlineTableUtils.parseOnlinePlayerSheetSnapshot(sheetDocument?.snapshotJson);
            if (remoteSnapshot) return remoteSnapshot;
            if (participant.ownerUid !== firebaseUser?.uid || !sharedCharacter) return null;
            try {
                return window.DndOnlineTableUtils.createOnlinePlayerSheetSnapshot(sharedCharacter, {
                    armorClass: participant.armorClass || 0,
                    characterRules: window.DndSrdCharacterRules
                });
            } catch (error) {
                return null;
            }
        };
        const getParticipantInitiativeModifier = participant => {
            if (!participant) return 0;
            if (participant.type === 'enemy') {
                const privateData = privateEnemies.find(enemy => enemy.id === participant.id);
                return window.DndOnlineTableUtils.calculateAbilityModifier(privateData?.dexterity ?? 10);
            }
            const snapshot = getParticipantSheetSnapshot(participant);
            if (participant.type === 'companion') {
                const companion = snapshot?.companions?.find(item => item.id === participant.companionId);
                return window.DndOnlineTableUtils.calculateAbilityModifier(companion?.details?.abilities?.dex ?? 10);
            }
            return Math.trunc(Number(snapshot?.combat?.initiativeBonus) || 0);
        };
        const clearInitiativeDraft = participantId => setParticipantInitiativeDrafts(previous => {
            if (previous[participantId] === undefined) return previous;
            const next = { ...previous };
            delete next[participantId];
            return next;
        });
        const rollParticipantInitiative = participant => {
            if (!participant || (!isCurrentRoomMaster && participant.ownerUid !== firebaseUser?.uid)) return;
            const dice = window.DndDice;
            if (typeof dice?.rollInitiative !== 'function') {
                setOnlineTableError('El lanzador de dados todavía no está disponible.');
                return;
            }
            const modifier = getParticipantInitiativeModifier(participant);
            dice.rollInitiative([{ id: participant.id, name: participant.name || 'Combatiente', modifier }], {
                mode: 'individual',
                label: `Iniciativa · ${participant.name || 'Combatiente'}`,
                onComplete: assignments => {
                    const assignment = assignments?.[0];
                    if (!assignment) return;
                    updateParticipantInitiative(participant, assignment.total).then(saved => {
                        if (saved) clearInitiativeDraft(participant.id);
                    });
                }
            });
        };
        const rollEnemyInitiatives = (enemies, mode) => {
            const targets = (Array.isArray(enemies) ? enemies : []).filter(enemy => enemy?.type === 'enemy');
            if (!isCurrentRoomMaster || !targets.length) return;
            if (mode !== 'shared' && targets.length > 20) {
                setOnlineTableError('La tirada individual admite hasta 20 enemigos a la vez. Divide la oposición o usa una tirada común.');
                return;
            }
            const dice = window.DndDice;
            if (typeof dice?.rollInitiative !== 'function') {
                setOnlineTableError('El lanzador de dados todavía no está disponible.');
                return;
            }
            dice.rollInitiative(targets.map(enemy => ({ id: enemy.id, name: enemy.name || 'Enemigo', modifier: getParticipantInitiativeModifier(enemy) })), {
                mode,
                label: mode === 'shared' ? 'Iniciativa común de enemigos' : 'Iniciativas individuales de enemigos',
                onComplete: updateEnemyInitiatives
            });
        };

        return <>
{currentRoom && roomData && roomData.status !== 'closed' && !onlineTableOpen && ReactDOM.createPortal(
                            <button ref={onlineTableDockRef} type="button" onClick={activateOnlineTableDock} onPointerDown={startOnlineTableDockDrag} onPointerMove={moveOnlineTableDock} onPointerUp={finishOnlineTableDockDrag} onPointerCancel={event => { finishOnlineTableDockDrag(event); onlineTableDockDragRef.current.suppressClick = false; }} onDragStart={event => event.preventDefault()} style={onlineTableDockPosition ? { left: `${onlineTableDockPosition.left}px`, top: `${onlineTableDockPosition.top}px`, right: 'auto', bottom: 'auto' } : undefined} className={`online-table-dock ${onlineTableDockDragging ? 'is-dragging' : ''} ${onlineTableDockPosition ? 'is-positioned' : ''}`} aria-label={`Maximizar Mesa Online, sala ${currentRoom.code}. También puedes arrastrar este botón para moverlo.`} title="Arrastra para mover · pulsa para volver a la Mesa Online">
                                <span className="online-table-dock__drag-hint" aria-hidden="true">⠿</span>
                                <span className={`online-table-dock__emblem ${shouldShowEncounter ? 'is-encounter' : ''} ${!onlineStatus ? 'is-offline' : ''}`} aria-hidden="true">{shouldShowEncounter ? '⚔' : '◆'}<i /></span>
                                <span className="online-table-dock__copy"><small>{!onlineStatus ? 'Sin conexión · datos locales' : roomData.status === 'paused' ? 'Encuentro pausado' : shouldShowEncounter ? `Ronda ${roomData.round || 1}` : 'Sala conectada'}</small><strong>Mesa {currentRoom.code}</strong><em>{isCurrentRoomMaster ? 'Máster' : 'Jugador'} · Pulsa para volver · Arrastra para mover</em></span>
                                <span className="online-table-dock__expand" aria-hidden="true">↗</span>
                            </button>,
                            document.body
                        )}
                        {onlineTableOpen && ReactDOM.createPortal(
                            <div onMouseDown={event => { if (event.target === event.currentTarget && onlineTableView === 'start' && onlineTableScreen === 'menu') setOnlineTableOpen(false); }} className={`online-table-overlay fixed inset-0 z-[60] bg-black/80 backdrop-blur-md ${onlineTableView === 'start' && onlineTableScreen === 'menu' ? 'is-launcher' : 'is-session'} is-${onlineTableMotion}`}>
                                <div className={`online-table-screen online-table-panel ${onlineTableView === 'start' && onlineTableScreen === 'menu' ? 'is-launcher' : 'is-session'}`} onClick={event => event.stopPropagation()}>
                                    <header className="online-table-header flex items-center justify-between gap-3 border-b border-gray-700 bg-gray-950/95 px-3 py-3 backdrop-blur-md sm:px-4">
                                        {(() => {
                                            const isJoining = onlineTableView === 'start' && onlineTableScreen === 'join';
                                            const isCreating = onlineTableView === 'start' && onlineTableScreen === 'create';
                                            const isCreated = onlineTableView === 'start' && onlineTableScreen === 'created';
                                            const isEncounter = onlineTableView === 'encounter';
                                            const headerIcon = isJoining ? '↳' : isCreating ? '✦' : isCreated ? '✓' : isEncounter ? '⚔' : currentRoom ? '◆' : '◈';
                                            const eyebrow = isJoining ? 'Acceso de jugador' : isCreating ? 'Nueva aventura' : isCreated ? 'Creación completada' : isEncounter ? `Ronda ${roomData?.round || 1}` : currentRoom ? 'Campaña conectada' : 'Tus partidas compartidas';
                                            const title = isJoining ? 'Unirse a una campaña' : isCreating ? 'Crear campaña' : isCreated ? 'Campaña lista para jugar' : isEncounter ? (onlineEncounterView === 'participants' ? 'Fichas del grupo' : onlineEncounterView === 'effects' ? 'Efectos del encuentro' : 'Mesa de iniciativa') : currentRoom ? (roomData?.name || `Mesa ${currentRoom.code}`) : 'Mesa Online';
                                            const description = isJoining ? 'Introduce el código que te ha enviado el Máster' : isCreating ? 'Ponle un nombre reconocible para encontrarla después' : isCreated ? `Comparte el código ${createdRoomCode} y entra como Máster` : isEncounter ? (onlineEncounterView === 'participants' ? 'Consulta la información compartida por los jugadores' : onlineEncounterView === 'effects' ? 'Controla condiciones, concentración y duraciones' : `Turno de ${participantName(roomData?.currentTurnId)}`) : currentRoom ? (isCurrentRoomMaster ? 'Gestionando la partida como Máster' : 'Participando como jugador') : 'Elige una campaña o comienza una nueva';
                                            return <div className="online-table-header-identity">
                                                <span className={`online-table-header-emblem ${isCreated ? 'is-success' : isEncounter ? 'is-encounter' : ''}`} aria-hidden="true">{headerIcon}</span>
                                                <div className="online-table-header-copy"><small>{eyebrow}</small><h3>{title}</h3><p>{description}</p></div>
                                                <div className="online-table-header-status" aria-label="Estado de la Mesa Online"><span className={firebaseReady && firebaseUser ? 'is-online' : firebaseError ? 'is-error' : ''}><i />{firebaseConnectionLabel}</span>{currentRoom && <span className={isCurrentRoomMaster ? 'is-master' : 'is-player'}>{isCurrentRoomMaster ? 'Máster' : 'Jugador'}</span>}{roomData?.status === 'paused' && <span className="is-paused">Pausada</span>}</div>
                                            </div>;
                                        })()}
                                        <div className="relative flex shrink-0 items-center gap-2">
                                            {currentRoom && onlineTableView !== 'closed' && <button type="button" onClick={() => setOnlineTableMenuOpen(previous => !previous)} className="h-11 w-11 rounded border border-gray-600 text-xl leading-none text-gray-200 hover:border-cyan-400 hover:bg-gray-800" aria-label="Más acciones de Mesa online" aria-expanded={onlineTableMenuOpen}>⋯</button>}
                                            {onlineTableMenuOpen && currentRoom && onlineTableView !== 'closed' && <div className="absolute right-0 top-12 z-30 w-52 rounded border border-gray-600 bg-gray-950 p-1.5 shadow-xl">
                                                <button type="button" onClick={() => { copyRoomCode(currentRoom.code); setOnlineTableMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">Copiar código</button>
                                                <button type="button" onClick={() => { shareRoomLink(currentRoom.code); setOnlineTableMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">Compartir enlace</button>
                                                <button type="button" onClick={() => { returnToCampaignHub(); setOnlineTableMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm text-cyan-100 hover:bg-cyan-950/30">Cambiar de campaña</button>
                                                {isCurrentRoomMaster && roomData?.status !== 'closed'
                                                    ? <button type="button" onClick={() => { closeOnlineRoom(); setOnlineTableMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm text-red-200 hover:bg-red-950/40">Cerrar campaña definitivamente</button>
                                                    : <button type="button" onClick={() => { confirmDelete('¿Abandonar esta campaña? Dejará de aparecer en tu lista y necesitarás otra invitación para volver.', leaveOnlineRoom); setOnlineTableMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm text-red-200 hover:bg-red-950/40">Abandonar campaña</button>}
                                            </div>}
                                            {currentRoom
                                                ? <button type="button" onClick={minimizeOnlineTable} className="online-table-dismiss is-session" aria-label="Minimizar Mesa Online y volver a la ficha; la sala seguirá activa" title="Minimizar; la sala seguirá activa"><span aria-hidden="true">↙</span><strong className="is-full">Volver a la ficha</strong><strong className="is-compact">Ficha</strong></button>
                                                : <button type="button" onClick={() => setOnlineTableOpen(false)} className="online-table-dismiss is-close" aria-label="Cerrar Mesa online">&times;</button>}
                                        </div>
                                    </header>
                                    {onlineTableView === 'encounter' && <nav className="online-encounter-modules" aria-label="Funciones del encuentro"><button type="button" onClick={() => setOnlineEncounterView('encounter')} className={onlineEncounterView === 'encounter' ? 'is-active' : ''}><span aria-hidden="true">⚔</span><span><small>Turnos e iniciativa</small><strong>Combate</strong></span></button>{isCurrentRoomMaster && <button type="button" onClick={() => setOnlineEncounterView('participants')} className={onlineEncounterView === 'participants' ? 'is-active' : ''}><span aria-hidden="true">◇</span><span><small>Información del grupo</small><strong>Fichas</strong></span></button>}<button type="button" onClick={() => setOnlineEncounterView('effects')} className={onlineEncounterView === 'effects' ? 'is-active' : ''}><span aria-hidden="true">✦</span><span><small>Estados y duraciones</small><strong>Efectos</strong></span></button></nav>}
                                    <div ref={onlineTableContentRef} onScroll={event => { const previous = onlineTableScrollPositionsRef.current[onlineTableView] || {}; onlineTableScrollPositionsRef.current[onlineTableView] = { ...previous, outer: event.currentTarget.scrollTop }; }} className={`online-table-content is-${onlineTableView} px-3 py-3 sm:px-4`}>
                                    {onlineTableError && <p className="online-table-feedback is-error"><span aria-hidden="true">!</span>{onlineTableError}</p>}
                                    {onlineTableNotice && <p className="online-table-feedback is-notice"><span aria-hidden="true">✓</span>{onlineTableNotice}</p>}
                                    <div ref={onlineTableViewContentRef} onScroll={saveOnlineTableViewScroll} data-online-table-view={onlineTableView}>

                                    {onlineTableView === 'start' && onlineTableScreen === 'menu' && <div className="online-table-launcher-body is-campaign-hub">
                                        <div className="online-table-launcher-intro"><span aria-hidden="true">⚔</span><div><small>Centro de campañas</small><h4>Tus mesas de juego</h4><p>Las campañas permanecen vinculadas a tu cuenta. Entrar solo indica que estás disponible para esta sesión.</p></div></div>
                                        <section className="online-cloud-campaigns is-hub" aria-labelledby="online-campaigns-title">
                                            <header><div><small>Guardadas en tu cuenta</small><strong id="online-campaigns-title">Mis campañas</strong></div><span>{cloudCampaigns.length} {cloudCampaigns.length === 1 ? 'campaña' : 'campañas'}</span></header>
                                            {cloudCampaigns.length > 0 ? <div className="online-campaign-grid">{cloudCampaigns.map(campaign => <button key={campaign.id} type="button" disabled={onlineTableBusy} onClick={() => openCloudCampaign(campaign)} className={`online-campaign-card is-${campaign.status}`}>
                                                <span className="online-campaign-card__crest" aria-hidden="true">{campaign.role === 'master' ? '♜' : '♟'}</span>
                                                <span className="online-campaign-card__copy"><small>{campaign.role === 'master' ? 'Diriges esta campaña' : `Juegas como ${campaign.playerName || 'jugador'}`}</small><strong>{campaign.name}</strong><em><i className={campaign.status === 'active' ? 'is-active' : ''} />{campaignStatusLabel(campaign)}</em><span>{formatCampaignActivity(campaign.updatedAt)} · Código {campaign.code}</span></span>
                                                <b aria-hidden="true">Abrir <i>→</i></b>
                                            </button>)}</div> : <div className="online-campaign-empty"><span aria-hidden="true">◇</span><strong>Aún no tienes campañas</strong><p>Crea una para dirigir o únete con el código de tu Máster. Después aparecerá siempre aquí.</p></div>}
                                        </section>
                                        {lastOnlineRoom && !cloudCampaigns.some(campaign => campaign.id === lastOnlineRoom.id) && <button type="button" disabled={onlineTableBusy} onClick={() => { if (lastOnlineRoom.role === 'player') { setRoomCodeInput(lastOnlineRoom.code); setPlayerNameInput(lastOnlineRoom.playerName || ''); setOnlineTableError(''); setOnlineTableScreen('join'); } else joinOnlineRoom(lastOnlineRoom.code); }} className="online-table-rejoin"><span><small>Mesa anterior</small><strong>Sala {lastOnlineRoom.code}</strong></span><b>Recuperar acceso</b></button>}
                                        <div className="online-campaign-actions"><button type="button" disabled={onlineTableBusy} onClick={() => { setCampaignNameInput(''); setOnlineTableError(''); setOnlineTableScreen('create'); }} className="online-table-launcher-option is-master"><span className="online-table-launcher-option__icon" aria-hidden="true">＋</span><span><small>Nueva aventura</small><strong>Crear campaña</strong><em>Serás el Máster y podrás invitar al grupo.</em></span><b aria-hidden="true">→</b></button><button type="button" disabled={onlineTableBusy} onClick={() => { setOnlineTableError(''); setOnlineTableNotice(''); setRoomCodeInput(''); setOnlineTableScreen('join'); }} className="online-table-launcher-option is-player"><span className="online-table-launcher-option__icon" aria-hidden="true">↳</span><span><small>Tengo un código</small><strong>Unirme a campaña</strong><em>Quedará guardada en tu cuenta al entrar.</em></span><b aria-hidden="true">→</b></button></div>
                                    </div>}

                                    {onlineTableView === 'start' && onlineTableScreen === 'create' && <div className="online-create-flow"><section className="online-create-card"><button type="button" onClick={() => { setOnlineTableError(''); setOnlineTableScreen('menu'); }} className="online-join-back">← Volver a mis campañas</button><div className="online-create-heading"><span aria-hidden="true">♜</span><small>Nueva campaña</small><h4>¿Cómo se llama vuestra aventura?</h4><p>Usa un nombre que el grupo reconozca. Podrás distinguirla fácilmente de tus otras mesas.</p></div><label className="online-campaign-name-field"><span>Nombre de la campaña</span><input autoFocus type="text" maxLength="100" value={campaignNameInput} onChange={event => setCampaignNameInput(event.target.value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 100))} onKeyDown={event => { if (event.key === 'Enter' && campaignNameInput.trim().length >= 2 && !onlineTableBusy) createOnlineRoom(campaignNameInput); }} placeholder="Ej. La maldición de Strahd"/><small>Entre 2 y 100 caracteres.</small></label><button type="button" disabled={onlineTableBusy || campaignNameInput.trim().length < 2} onClick={() => createOnlineRoom(campaignNameInput)} className="online-create-submit">{onlineTableBusy ? <><span className="online-button-spinner"/> Creando campaña…</> : <>Crear campaña <span aria-hidden="true">→</span></>}</button></section></div>}

                                    {onlineTableView === 'start' && onlineTableScreen === 'created' && <div className="online-created-flow">
                                        <section className="online-created-card" aria-labelledby="online-created-title">
                                            <div className="online-created-success" aria-hidden="true">✓</div>
                                            <span className="online-created-eyebrow">Mesa preparada</span>
                                            <h4 id="online-created-title">La sala ya está lista</h4>
                                            <p className="online-created-copy">Comparte este código con los jugadores. Después entra como Máster para preparar personajes, enemigos e iniciativa.</p>
                                            <div className="online-created-code" aria-label={`Código de sala ${createdRoomCode}`}>
                                                <small>Código de invitación</small>
                                                <div className="online-created-code__characters" aria-hidden="true">{createdRoomCode.split('').map((character, index) => <span key={`${character}-${index}`}>{character}</span>)}</div>
                                                <strong>{createdRoomCode}</strong>
                                            </div>
                                            <div className="online-created-share-actions">
                                                <button type="button" onClick={() => copyRoomCode(createdRoomCode)}><span aria-hidden="true">▣</span><span><strong>Copiar código</strong><small>Solo los 6 caracteres</small></span></button>
                                                <button type="button" onClick={() => shareRoomLink(createdRoomCode)}><span aria-hidden="true">↗</span><span><strong>Invitar jugadores</strong><small>Compartir enlace directo</small></span></button>
                                            </div>
                                            <div className="online-created-next"><span aria-hidden="true">1</span><p><strong>Siguiente paso</strong> Entra en la sala y espera a que los jugadores compartan sus personajes.</p></div>
                                            <button type="button" disabled={onlineTableBusy} onClick={() => { joinOnlineRoom(createdRoomCode); setCreatedRoomCode(''); }} className="online-created-enter">{onlineTableBusy ? <><span className="online-button-spinner" /> Entrando como Máster…</> : <>Entrar como Máster <span aria-hidden="true">→</span></>}</button>
                                            <button type="button" onClick={() => setOnlineTableOpen(false)} className="online-created-later">Cerrar y entrar más tarde</button>
                                        </section>
                                    </div>}

                                    {onlineTableView === 'start' && onlineTableScreen === 'join' && <div className="online-join-flow">
                                        <section className="online-join-card">
                                            <button type="button" onClick={() => { setOnlineTableError(''); setOnlineTableScreen('menu'); }} className="online-join-back">← Volver</button>
                                            <div className="online-join-heading"><span aria-hidden="true">♟</span><small>Entrar como jugador</small><h4>Identifícate y entra en la sala</h4><p>El Máster verá tu nombre junto al personaje que compartas.</p></div>
                                            <label className="online-player-name-field"><span>Tu nombre de jugador</span>
                                                <input autoFocus type="text" autoComplete="nickname" maxLength="40" value={playerNameInput} onChange={event => { setOnlineTableError(''); setPlayerNameInput(event.target.value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 40)); }} onBlur={() => setPlayerNameInput(normalizeOnlinePlayerName(playerNameInput))} onKeyDown={event => { if (event.key === 'Enter' && isValidOnlinePlayerName(playerNameInput) && [6, 8, 12].includes(roomCodeInput.length) && !onlineTableBusy) joinOnlineRoom(); }} placeholder="Ej. Adrián" />
                                                <small>Usa el nombre por el que te conoce el grupo.</small>
                                            </label>
                                            <label className="online-room-code-field"><span className="sr-only">Código de sala</span>
                                                <input ref={roomCodeInputRef} type="text" inputMode="text" enterKeyHint="go" autoComplete="off" autoCapitalize="characters" spellCheck="false" maxLength="12" value={roomCodeInput} onChange={event => applyRoomCodeInput(event.currentTarget.value)} onPaste={event => { const pastedText = event.clipboardData?.getData('text'); if (pastedText) { event.preventDefault(); applyRoomCodeInput(pastedText); } }} onKeyDown={event => { if (event.key === 'Enter' && isValidOnlinePlayerName(playerNameInput) && [6, 8, 12].includes(roomCodeInput.length) && !onlineTableBusy) joinOnlineRoom(); }} placeholder="ABCD2345WXYZ" aria-describedby="online-room-code-help" />
                                                <span className="online-room-code-count">{roomCodeInput.length}/12</span>
                                            </label>
                                            <div className="online-room-code-actions"><button type="button" onClick={pasteRoomCode}><span aria-hidden="true">▣</span>Pegar código</button>{roomCodeInput && <button type="button" onClick={() => { applyRoomCodeInput(''); roomCodeInputRef.current?.focus(); }}>Limpiar</button>}</div>
                                            <p id="online-room-code-help" className="online-room-code-help">Puedes escribirlo o pegarlo. No distingue entre mayúsculas y minúsculas.</p>
                                            <button type="button" disabled={onlineTableBusy || !isValidOnlinePlayerName(playerNameInput) || ![6, 8, 12].includes(roomCodeInput.length)} onClick={() => joinOnlineRoom()} className="online-join-submit">{onlineTableBusy ? <><span className="online-button-spinner" /> Conectando con la mesa…</> : <>Entrar en la sala <span aria-hidden="true">→</span></>}</button>
                                            {playerNameInput.length > 0 && !isValidOnlinePlayerName(playerNameInput) && <p className="online-room-code-pending">El nombre debe tener al menos 2 caracteres.</p>}
                                            {roomCodeInput.length > 0 && ![6, 8, 12].includes(roomCodeInput.length) && <p className="online-room-code-pending">El código debe tener 6, 8 o 12 caracteres.</p>}
                                        </section>
                                    </div>}

                                    {onlineTableView === 'lobby' && shareCharacterOpen && (() => { const characters = Object.values(manager.characters); return <section className="online-character-picker">
                                        <header className="online-character-picker__header"><span aria-hidden="true">♙</span><div><small>Tu identidad en esta mesa</small><h4>Elige el personaje que vas a compartir</h4><p>El Máster podrá consultar su resumen, combate, conjuros y mochila en tiempo real.</p></div><button type="button" onClick={() => setShareCharacterOpen(false)}>Volver a la sala</button></header>
                                        <div className="online-character-picker__privacy"><span aria-hidden="true">◆</span><div><strong>Compartición segura y en tiempo real</strong><p>Las notas personales y el historial no se envían. Inspiración, recursos, espacios de conjuro, vida e inventario se actualizarán automáticamente.</p></div></div>
                                        <div className="online-character-picker__grid">{characters.map((character, index) => { const data = character.data; const name = data.charInfo?.name || character.meta.name || 'Personaje sin nombre'; const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'PJ'; const selected = sharedCharacterId === character.meta.id; const portrait = isValidPortraitDataUrl(character.meta?.portrait) ? character.meta.portrait : ''; const hpCurrent = Math.max(0, Number(data.hp?.current) || 0); const hpMax = Math.max(0, Number(data.hp?.max) || 0); const hpPercent = hpMax > 0 ? Math.min(100, hpCurrent / hpMax * 100) : 0; return <article key={character.meta.id} className={`online-character-picker__card ${selected ? 'is-selected' : ''} ${data.inspiration ? 'is-inspired' : ''}`} style={{ '--picker-delay': `${Math.min(index, 8) * 45}ms` }}><header><span className="online-character-picker__portrait">{portrait ? <img src={portrait} alt="" /> : initials}{data.inspiration && <i aria-label="Inspiración disponible">✦</i>}</span><div><small>{data.charInfo?.race || 'Linaje sin indicar'}</small><strong>{name}</strong><p>{data.charInfo?.cls || 'Sin clase'} · Nivel {data.level || '1'}</p></div>{selected && <b>Compartido</b>}</header><div className="online-character-picker__stats"><span><small>PV</small><strong>{hpCurrent}/{hpMax}</strong></span><span><small>CA</small><strong>{calculateCharacterArmorClass(data)}</strong></span><span><small>Estado</small><strong>{data.conditions?.length ? `${data.conditions.length} estados` : 'Disponible'}</strong></span></div><div className="online-character-picker__hp"><span style={{ width: `${hpPercent}%` }} /></div><footer><span>{selected ? 'Esta es la ficha visible para el Máster' : 'Puedes cambiarla más adelante'}</span><button type="button" disabled={sharingCharacter || selected} onClick={() => shareLocalCharacter(character.meta.id)}>{sharingCharacter ? 'Compartiendo…' : selected ? 'Personaje compartido' : 'Usar este personaje'}<b aria-hidden="true">{selected ? '✓' : '→'}</b></button></footer></article>; })}{!characters.length && <div className="online-character-picker__empty"><span aria-hidden="true">◇</span><strong>No tienes personajes disponibles</strong><p>Crea primero un personaje en la ficha para poder compartirlo con la mesa.</p></div>}</div>
                                    </section>; })()}

                                    {((onlineTableView === 'lobby' && !shareCharacterOpen) || onlineTableView === 'preparation' || onlineTableView === 'encounter') && <div className="online-table-session-flow mt-5 space-y-4">
                                        {onlineTableView === 'lobby' && <OnlineRoomModuleSelector active={onlineRoomModule} onSelect={setOnlineRoomModule} isMaster={isCurrentRoomMaster} encounterActive={shouldShowEncounter} />}
                                        {onlineTableView === 'lobby' && onlineRoomModule === 'home' && <OnlineCampaignLobby
                                            roomData={roomData}
                                            isMaster={isCurrentRoomMaster}
                                            members={roomMembers}
                                            participants={[...playerRoomParticipants, ...companionRoomParticipants]}
                                            sheets={roomPlayerSheets}
                                            enemies={publicCombatants}
                                            ownParticipant={ownRoomParticipant}
                                            onSelect={setOnlineRoomModule}
                                            onInvite={() => shareRoomLink(currentRoom.code)}
                                            onShareCharacter={openCharacterSelector}
                                        />}
                                        {onlineTableView === 'encounter' && onlineEncounterView === 'encounter' && (() => {
                                            const connectedPlayers = roomMembers.filter(member => member.role !== 'master' && member.active).length;
                                            const sharedPlayers = playerRoomParticipants.filter(participant => participant.connected !== false).length;
                                            const currentCombatant = getCombatant(roomData?.currentTurnId);
                                            const isOwnTurn = !!currentCombatant && (currentCombatant.ownerUid === firebaseUser?.uid || currentCombatant.id === ownRoomParticipant?.id);
                                            const lobbySteps = isCurrentRoomMaster
                                                ? [
                                                    { label: 'Invitar jugadores', done: connectedPlayers > 0, detail: connectedPlayers ? `${connectedPlayers} conectados` : 'Comparte el código o enlace' },
                                                    { label: 'Compartir personajes', done: sharedPlayers > 0, detail: sharedPlayers ? `${sharedPlayers} fichas en la mesa` : 'Cada jugador elige su ficha' },
                                                    { label: 'Elegir una función', done: onlineRoomModule !== 'room', detail: 'Abre Fichas o Combate cuando lo necesites' }
                                                ]
                                                : [
                                                    { label: 'Compartir tu personaje', done: !!ownRoomParticipant, detail: ownRoomParticipant ? ownRoomParticipant.name || 'Ficha compartida' : 'Elige la ficha que usarás' },
                                                    { label: 'Mantener la ficha sincronizada', done: sheetSyncStatus === 'synced', detail: sheetSyncStatus === 'synced' ? 'Los cambios llegan al Máster' : 'Revisa el módulo Mi ficha' },
                                                    { label: 'Esperar al Máster', done: roomData?.status === 'active', detail: 'El encuentro comenzará para todos' }
                                                ];
                                            const completedSteps = lobbySteps.filter(step => step.done).length;
                                            const guideTitle = onlineTableView === 'lobby'
                                                ? (isCurrentRoomMaster ? 'Preparación de la sesión' : 'Antes de empezar')
                                                : isOwnTurn ? 'Es tu turno' : isCurrentRoomMaster ? `Dirigiendo el turno de ${currentCombatant?.name || 'un combatiente'}` : `Turno de ${currentCombatant?.name || 'otro combatiente'}`;
                                            const guideText = onlineTableView === 'lobby'
                                                ? (isCurrentRoomMaster ? 'Completa estos pasos y prepara el orden cuando todos estén listos.' : 'La mesa te avisará cuando sea tu turno. Puedes dejar preparada tu ficha mientras esperas.')
                                                : isOwnTurn ? 'Revisa tus condiciones y efectos, realiza tus acciones en la ficha y avisa al Máster al terminar.' : isCurrentRoomMaster ? 'Gestiona vida, condiciones y efectos; después avanza al siguiente turno.' : 'Puedes consultar el orden, tu personaje y los efectos activos mientras esperas.';
                                            return <aside className={`online-session-guide ${isOwnTurn ? 'is-own-turn' : ''}`} aria-label="Guía de la Mesa Online">
                                                <button type="button" className="online-session-guide__toggle" onClick={() => setOnlineTableGuideOpen(previous => !previous)} aria-expanded={onlineTableGuideOpen}>
                                                    <span className="online-session-guide__icon" aria-hidden="true">{onlineTableView === 'lobby' ? (isCurrentRoomMaster ? '◆' : '✓') : isOwnTurn ? '!' : isCurrentRoomMaster ? '♜' : '◷'}</span>
                                                    <span><small>{isCurrentRoomMaster ? 'Panel del Máster' : 'Panel del jugador'}</small><strong>{guideTitle}</strong></span>
                                                    <span className="online-session-guide__chevron" aria-hidden="true">{onlineTableGuideOpen ? '−' : '+'}</span>
                                                </button>
                                                {onlineTableGuideOpen && <div className="online-session-guide__body">
                                                    <p>{guideText}</p>
                                                    {onlineTableView === 'lobby' ? <>
                                                        <div className="online-session-progress" aria-label={`${completedSteps} de ${lobbySteps.length} pasos completados`}><span style={{ width: `${(completedSteps / lobbySteps.length) * 100}%` }} /></div>
                                                        <ol className="online-session-checklist">{lobbySteps.map((step, index) => <li key={step.label} className={step.done ? 'is-done' : ''}><span>{step.done ? '✓' : index + 1}</span><div><strong>{step.label}</strong><small>{step.detail}</small></div></li>)}</ol>
                                                        <div className="online-session-actions">
                                                            {isCurrentRoomMaster ? <><button type="button" onClick={() => shareRoomLink(currentRoom.code)}>Invitar jugadores</button><button type="button" onClick={() => setOnlineRoomModule('combat')} className="is-primary">Abrir Combate</button></> : <button type="button" onClick={() => setOnlineRoomModule(ownRoomParticipant ? 'combat' : 'sheets')} className="is-primary">{ownRoomParticipant ? 'Abrir Combate' : 'Compartir mi personaje'}</button>}
                                                        </div>
                                                    </> : <div className="online-session-actions">
                                                        {!isCurrentRoomMaster && ownRoomParticipant && <button type="button" onClick={openOwnCharacterFromEncounter} className="is-primary">Abrir mi personaje</button>}
                                                        <button type="button" onClick={() => setOnlineEncounterView('effects')}>Ver efectos</button>
                                                        {isCurrentRoomMaster && <><button type="button" onClick={() => setOnlineEncounterView('participants')}>Gestionar participantes</button>{roomData?.status === 'active' ? <button type="button" disabled={encounterBusy} onClick={() => changeEncounterTurn(1)} className="is-primary">Terminar turno y avanzar</button> : <button type="button" disabled={encounterBusy} onClick={() => setEncounterStatus('active')} className="is-primary">Reanudar encuentro</button>}</>}
                                                    </div>}
                                                </div>}
                                            </aside>;
                                        })()}
                                        {onlineTableView === 'preparation' && (() => {
                                            const preparedCombatants = preparedTurnOrder.map(getCombatant).filter(Boolean);
                                            const missingInitiative = preparedCombatants.filter(participant => !hasInitiativeValue(participant.initiative));
                                            const availableCombatants = [...playerRoomParticipants, ...companionRoomParticipants, ...publicCombatants]
                                                .filter((participant, index, list) => list.findIndex(item => item.id === participant.id) === index)
                                                .filter(participant => participant.type === 'enemy' || roomMembers.some(member => member.uid === participant.ownerUid && member.active !== false))
                                                .filter(participant => !preparedTurnOrder.includes(participant.id));
                                            const playersInOrder = preparedTurnOrder.filter(id => getCombatant(id)?.type === 'player').length;
                                            const companionsInOrder = preparedTurnOrder.filter(id => getCombatant(id)?.type === 'companion').length;
                                            const enemiesInOrder = preparedTurnOrder.filter(id => getCombatant(id)?.type === 'enemy').length;
                                            return (
                                              <section className="online-preparation">
                                                <header className="online-preparation__header">
                                                  <span aria-hidden="true">
                                                    ⚔
                                                  </span>
                                                  <div>
                                                    <small>
                                                      Paso final antes del
                                                      combate
                                                    </small>
                                                    <h4>Preparar encuentro</h4>
                                                    <p>
                                                      El grupo conectado se
                                                      incluye por defecto.
                                                      Puedes dejar a alguien en
                                                      reserva o usar la última
                                                      ficha de un jugador
                                                      ausente.
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        openEnemyModal()
                                                      }
                                                    >
                                                      ＋ Añadir enemigo
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        setEncounterSetupOpen(
                                                          false,
                                                        )
                                                      }
                                                    >
                                                      Volver
                                                    </button>
                                                  </div>
                                                </header>
                                                <div className="online-preparation__summary">
                                                  <span>
                                                    <small>Combatientes</small>
                                                    <strong>
                                                      {preparedTurnOrder.length}
                                                    </strong>
                                                  </span>
                                                  <span>
                                                    <small>Personajes</small>
                                                    <strong>
                                                      {playersInOrder}
                                                    </strong>
                                                  </span>
                                                  <span>
                                                    <small>Compañeros</small>
                                                    <strong>
                                                      {companionsInOrder}
                                                    </strong>
                                                  </span>
                                                  <span>
                                                    <small>Enemigos</small>
                                                    <strong>
                                                      {enemiesInOrder}
                                                    </strong>
                                                  </span>
                                                  <span
                                                    className={
                                                      missingInitiative.length
                                                        ? "is-warning"
                                                        : "is-ready"
                                                    }
                                                  >
                                                    <small>Iniciativas</small>
                                                    <strong>
                                                      {missingInitiative.length
                                                        ? `${missingInitiative.length} pendientes`
                                                        : "Completas"}
                                                    </strong>
                                                  </span>
                                                </div>
                                                {enemiesInOrder > 0 && (
                                                  <section className="online-preparation__enemy-rolls">
                                                    <div>
                                                      <span aria-hidden="true">
                                                        20
                                                      </span>
                                                      <div>
                                                        <small>
                                                          Iniciativa de la
                                                          oposición
                                                        </small>
                                                        <strong>
                                                          ¿Cómo quieres tirar
                                                          los enemigos?
                                                        </strong>
                                                        <p>
                                                          La Destreza de cada
                                                          criatura se suma
                                                          automáticamente al
                                                          resultado natural.
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <nav>
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          rollEnemyInitiatives(
                                                            preparedCombatants.filter(
                                                              (participant) =>
                                                                participant.type ===
                                                                "enemy",
                                                            ),
                                                            "shared",
                                                          )
                                                        }
                                                      >
                                                        <strong>
                                                          Un d20 para todos
                                                        </strong>
                                                        <small>
                                                          Comparten resultado
                                                          natural · cada uno
                                                          suma su DES
                                                        </small>
                                                      </button>
                                                      <button
                                                        type="button"
                                                        disabled={
                                                          enemiesInOrder > 20
                                                        }
                                                        onClick={() =>
                                                          rollEnemyInitiatives(
                                                            preparedCombatants.filter(
                                                              (participant) =>
                                                                participant.type ===
                                                                "enemy",
                                                            ),
                                                            "individual",
                                                          )
                                                        }
                                                        title={
                                                          enemiesInOrder > 20
                                                            ? "Máximo 20 enemigos por tirada individual"
                                                            : ""
                                                        }
                                                      >
                                                        <strong>
                                                          Un d20 por enemigo
                                                        </strong>
                                                        <small>
                                                          {enemiesInOrder > 20
                                                            ? "Hay más de 20 · usa la tirada común o divide el grupo"
                                                            : `${enemiesInOrder} dados independientes con sus modificadores`}
                                                        </small>
                                                      </button>
                                                    </nav>
                                                  </section>
                                                )}
                                                <div className="online-preparation__layout">
                                                  <section className="online-preparation__order">
                                                    <header>
                                                      <div>
                                                        <small>
                                                          Secuencia de actuación
                                                        </small>
                                                        <h5>
                                                          Orden de iniciativa
                                                        </h5>
                                                      </div>
                                                      <span>
                                                        Usa las flechas para
                                                        ajustar el orden.
                                                      </span>
                                                    </header>
                                                    {missingInitiative.length >
                                                      0 && (
                                                      <div className="online-preparation__warning">
                                                        <span aria-hidden="true">
                                                          !
                                                        </span>
                                                        <p>
                                                          <strong>
                                                            No se puede iniciar
                                                            todavía.
                                                          </strong>{" "}
                                                          Falta iniciativa para{" "}
                                                          {missingInitiative
                                                            .map(
                                                              (participant) =>
                                                                participant.name ||
                                                                "Participante",
                                                            )
                                                            .join(", ")}
                                                          .
                                                        </p>
                                                      </div>
                                                    )}
                                                    <div className="online-preparation__list">
                                                      {preparedTurnOrder.map(
                                                        (id, index) => {
                                                          const participant =
                                                            getCombatant(id);
                                                          if (!participant)
                                                            return null;
                                                          const isEnemy =
                                                            participant.type ===
                                                            "enemy";
                                                          const isAbsent =
                                                            !isEnemy &&
                                                            participant.connected ===
                                                              false;
                                                          const ready =
                                                            hasInitiativeValue(
                                                              participant.initiative,
                                                            );
                                                          const initiativeModifier =
                                                            getParticipantInitiativeModifier(
                                                              participant,
                                                            );
                                                          const ownerName =
                                                            isEnemy
                                                              ? "Máster"
                                                              : roomMembers.find(
                                                                  (member) =>
                                                                    member.uid ===
                                                                    participant.ownerUid,
                                                                )
                                                                  ?.displayName ||
                                                                "Jugador";
                                                          return (
                                                            <article
                                                              key={id}
                                                              className={`${isEnemy ? "is-enemy" : "is-player"} ${isAbsent ? "is-absent" : ""} ${ready ? "" : "is-missing"}`}
                                                            >
                                                              <span className="online-preparation__position">
                                                                {index + 1}
                                                              </span>
                                                              <OnlineCombatantAvatar
                                                                combatant={
                                                                  participant
                                                                }
                                                                className="h-11 w-11 text-xs"
                                                              />
                                                              <div className="online-preparation__identity">
                                                                <small>
                                                                  {isEnemy
                                                                    ? "Enemigo"
                                                                    : isAbsent
                                                                      ? `Ausente · lo controla el Máster`
                                                                      : `Personaje de ${ownerName}`}
                                                                </small>
                                                                <strong>
                                                                  {participant.name ||
                                                                    "Combatiente"}
                                                                </strong>
                                                                {isAbsent && (
                                                                  <em>
                                                                    Últimos
                                                                    datos
                                                                    sincronizados
                                                                  </em>
                                                                )}
                                                              </div>
                                                              <div className="online-preparation__controls">
                                                                <div className="online-preparation__initiative">
                                                                  <small>
                                                                    Iniciativa ·{" "}
                                                                    {window.DndOnlineTableUtils.formatOnlineModifier(
                                                                      initiativeModifier,
                                                                    )}
                                                                  </small>
                                                                  {isEnemy ? (
                                                                    <strong>
                                                                      {ready
                                                                        ? participant.initiative
                                                                        : "Pendiente"}
                                                                    </strong>
                                                                  ) : (
                                                                    <input
                                                                      type="number"
                                                                      inputMode="numeric"
                                                                      value={
                                                                        participantInitiativeDrafts[
                                                                          participant
                                                                            .id
                                                                        ] ??
                                                                        participant.initiative ??
                                                                        ""
                                                                      }
                                                                      onChange={(
                                                                        event,
                                                                      ) =>
                                                                        setParticipantInitiativeDrafts(
                                                                          (
                                                                            previous,
                                                                          ) => ({
                                                                            ...previous,
                                                                            [participant.id]:
                                                                              event
                                                                                .target
                                                                                .value,
                                                                          }),
                                                                        )
                                                                      }
                                                                      onBlur={() =>
                                                                        commitParticipantInitiative(
                                                                          participant,
                                                                        )
                                                                      }
                                                                      onKeyDown={(
                                                                        event,
                                                                      ) => {
                                                                        if (
                                                                          event.key ===
                                                                          "Enter"
                                                                        )
                                                                          event.currentTarget.blur();
                                                                      }}
                                                                      placeholder="—"
                                                                      aria-label={`Iniciativa de ${participant.name}`}
                                                                    />
                                                                  )}
                                                                </div>
                                                                <div className="online-preparation__actions">
                                                                  {!isEnemy && (
                                                                    <button
                                                                      type="button"
                                                                      className="online-preparation__roll"
                                                                      onClick={() =>
                                                                        rollParticipantInitiative(
                                                                          participant,
                                                                        )
                                                                      }
                                                                    >
                                                                      <span aria-hidden="true">
                                                                        20
                                                                      </span>
                                                                      Tirar
                                                                    </button>
                                                                  )}
                                                                  {isEnemy && (
                                                                    <>
                                                                      <button
                                                                        type="button"
                                                                        className="online-preparation__edit"
                                                                        onClick={() =>
                                                                          openEnemyModal(
                                                                            participant,
                                                                          )
                                                                        }
                                                                      >
                                                                        <span aria-hidden="true">✎</span>
                                                                        Editar
                                                                      </button>
                                                                      <button
                                                                        type="button"
                                                                        className="online-preparation__delete"
                                                                        onClick={() =>
                                                                          confirmDelete(
                                                                            `¿Eliminar a ${participant.name}?`,
                                                                            () => deleteEnemy(participant.id),
                                                                          )
                                                                        }
                                                                      >
                                                                        <span aria-hidden="true">×</span>
                                                                        Eliminar
                                                                      </button>
                                                                    </>
                                                                  )}
                                                                  <button
                                                                    type="button"
                                                                    className="online-preparation__remove"
                                                                    onClick={() =>
                                                                      togglePreparedParticipant(
                                                                        id,
                                                                      )
                                                                    }
                                                                    aria-label={`Dejar a ${participant.name} en reserva`}
                                                                  >
                                                                    Reserva
                                                                  </button>
                                                                </div>
                                                                <div className="online-preparation__move">
                                                                  <button
                                                                    type="button"
                                                                    disabled={
                                                                      index ===
                                                                      0
                                                                    }
                                                                    onClick={() =>
                                                                      movePreparedParticipant(
                                                                        id,
                                                                        -1,
                                                                      )
                                                                    }
                                                                    aria-label={`Subir a ${participant.name}`}
                                                                  >
                                                                    ↑
                                                                  </button>
                                                                  <button
                                                                    type="button"
                                                                    disabled={
                                                                      index ===
                                                                      preparedTurnOrder.length -
                                                                        1
                                                                    }
                                                                    onClick={() =>
                                                                      movePreparedParticipant(
                                                                        id,
                                                                        1,
                                                                      )
                                                                    }
                                                                    aria-label={`Bajar a ${participant.name}`}
                                                                  >
                                                                    ↓
                                                                  </button>
                                                                </div>
                                                              </div>
                                                            </article>
                                                          );
                                                        },
                                                      )}
                                                      {!preparedTurnOrder.length && (
                                                        <div className="online-preparation__empty">
                                                          <span aria-hidden="true">
                                                            ◇
                                                          </span>
                                                          <strong>
                                                            No hay combatientes
                                                          </strong>
                                                          <p>
                                                            Añade combatientes
                                                            desde la reserva o
                                                            crea un enemigo.
                                                          </p>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </section>
                                                  <aside className="online-preparation__launch">
                                                    <span
                                                      className={
                                                        missingInitiative.length
                                                          ? "is-blocked"
                                                          : ""
                                                      }
                                                      aria-hidden="true"
                                                    >
                                                      {missingInitiative.length
                                                        ? "!"
                                                        : "✓"}
                                                    </span>
                                                    <small>
                                                      Comprobación del Máster
                                                    </small>
                                                    <h5>
                                                      {missingInitiative.length
                                                        ? "Faltan datos"
                                                        : "Encuentro listo"}
                                                    </h5>
                                                    <ul>
                                                      <li
                                                        className={
                                                          playersInOrder
                                                            ? "is-done"
                                                            : ""
                                                        }
                                                      >
                                                        Personajes incluidos{" "}
                                                        <b>{playersInOrder}</b>
                                                      </li>
                                                      <li
                                                        className={
                                                          enemiesInOrder
                                                            ? "is-done"
                                                            : ""
                                                        }
                                                      >
                                                        Enemigos incluidos{" "}
                                                        <b>{enemiesInOrder}</b>
                                                      </li>
                                                      <li
                                                        className={
                                                          !missingInitiative.length
                                                            ? "is-done"
                                                            : ""
                                                        }
                                                      >
                                                        Iniciativas completas{" "}
                                                        <b>
                                                          {preparedTurnOrder.length -
                                                            missingInitiative.length}
                                                          /
                                                          {
                                                            preparedTurnOrder.length
                                                          }
                                                        </b>
                                                      </li>
                                                    </ul>
                                                    <p>
                                                      Los ausentes incluidos
                                                      usarán su última copia
                                                      sincronizada y quedarán
                                                      bajo control del Máster
                                                      durante este encuentro.
                                                    </p>
                                                    <button
                                                      type="button"
                                                      disabled={
                                                        encounterBusy ||
                                                        missingInitiative.length >
                                                          0 ||
                                                        !preparedTurnOrder.length
                                                      }
                                                      onClick={startEncounter}
                                                    >
                                                      {encounterBusy ? (
                                                        "Iniciando encuentro…"
                                                      ) : (
                                                        <>
                                                          Iniciar encuentro{" "}
                                                          <b aria-hidden="true">
                                                            →
                                                          </b>
                                                        </>
                                                      )}
                                                    </button>
                                                  </aside>
                                                </div>
                                                {availableCombatants.length >
                                                  0 && (
                                                  <section className="online-preparation__reserve">
                                                    <header>
                                                      <div>
                                                        <small>
                                                          Fuera del encuentro
                                                        </small>
                                                        <h5>
                                                          Reserva de
                                                          combatientes
                                                        </h5>
                                                      </div>
                                                      <span>
                                                        Los jugadores ausentes
                                                        nunca entran
                                                        automáticamente.
                                                      </span>
                                                    </header>
                                                    <div>
                                                      {availableCombatants.map(
                                                        (participant) => {
                                                          const isEnemy =
                                                            participant.type ===
                                                            "enemy";
                                                          const isAbsent =
                                                            !isEnemy &&
                                                            participant.connected ===
                                                              false;
                                                          const ownerName =
                                                            roomMembers.find(
                                                              (member) =>
                                                                member.uid ===
                                                                participant.ownerUid,
                                                            )?.displayName ||
                                                            "Jugador";
                                                          return (
                                                            <article
                                                              key={`reserve-${participant.id}`}
                                                              className={`${isAbsent ? "is-absent" : ""} ${isEnemy ? "is-enemy" : ""}`}
                                                            >
                                                              <OnlineCombatantAvatar
                                                                combatant={
                                                                  participant
                                                                }
                                                                className="h-10 w-10 text-xs"
                                                              />
                                                              <div>
                                                                <small>
                                                                  {isEnemy
                                                                    ? "Enemigo en reserva"
                                                                    : isAbsent
                                                                      ? `${ownerName} no está conectado`
                                                                      : "Disponible"}
                                                                </small>
                                                                <strong>
                                                                  {participant.name ||
                                                                    "Combatiente"}
                                                                </strong>
                                                                <span>
                                                                  {isAbsent
                                                                    ? "Se usará la última ficha sincronizada"
                                                                    : "Listo para participar"}
                                                                </span>
                                                              </div>
                                                              <nav>
                                                                {isEnemy && (
                                                                  <>
                                                                    <button
                                                                      type="button"
                                                                      className="is-edit"
                                                                      onClick={() => openEnemyModal(participant)}
                                                                    >
                                                                      Editar
                                                                    </button>
                                                                    <button
                                                                      type="button"
                                                                      className="is-delete"
                                                                      onClick={() =>
                                                                        confirmDelete(
                                                                          `¿Eliminar a ${participant.name}?`,
                                                                          () => deleteEnemy(participant.id),
                                                                        )
                                                                      }
                                                                    >
                                                                      Eliminar
                                                                    </button>
                                                                  </>
                                                                )}
                                                                <button
                                                                  type="button"
                                                                  className="is-include"
                                                                  onClick={() =>
                                                                    togglePreparedParticipant(
                                                                      participant.id,
                                                                    )
                                                                  }
                                                                >
                                                                  {isAbsent
                                                                    ? "Incluir y controlar"
                                                                    : "Incluir"}
                                                                </button>
                                                              </nav>
                                                            </article>
                                                          );
                                                        },
                                                      )}
                                                    </div>
                                                  </section>
                                                )}
                                              </section>
                                            );
                                        })()}
                                        {onlineTableView === 'encounter' && onlineEncounterView === 'encounter' && (() => {
                                            const order = Array.isArray(roomData?.turnOrder) ? roomData.turnOrder : [];
                                            const currentIndex = Math.max(0, Math.min(Number(roomData?.turnIndex) || 0, Math.max(0, order.length - 1)));
                                            const currentId = roomData?.currentTurnId || order[currentIndex];
                                            const nextId = order.length > 1 ? order[(currentIndex + 1) % order.length] : null;
                                            const currentCombatant = getCombatant(currentId);
                                            const selected = getCombatant(selectedCombatantId || currentId);
                                            const selectedIsEnemy = selected?.type === 'enemy';
                                            const selectedPrivate = selectedIsEnemy && canManageEnemies ? privateEnemies.find(item => item.id === selected.id) : null;
                                            const selectedHp = selected ? getHpValues(selectedPrivate || selected) : null;
                                            const canSeeSelectedHp = !!selected && (!selectedIsEnemy ? (isCurrentRoomMaster || selected.ownerUid === firebaseUser?.uid) : !!selectedPrivate);
                                            const canEditSelected = !!selected && (selectedIsEnemy ? canManageEnemies : (isCurrentRoomMaster || selected.ownerUid === firebaseUser?.uid));
                                            const selectedConditions = normalizeOnlineConditions(selectedIsEnemy ? selected?.conditionsVisible : selected?.conditions);
                                            const currentConditions = normalizeOnlineConditions(currentCombatant?.type === 'enemy' ? currentCombatant?.conditionsVisible : currentCombatant?.conditions);
                                            const selectedEffects = encounterEffects.filter(effect => !effect.expired && (effect.targetId === selected?.id || effect.targetType === 'global'));
                                            const currentEffects = encounterEffects.filter(effect => !effect.expired && (effect.targetId === currentCombatant?.id || effect.targetType === 'global')).slice(0, 3);
                                            const isOwnTurn = currentCombatant?.ownerUid === firebaseUser?.uid;
                                            const currentController = currentCombatant?.type === 'enemy' || currentCombatant?.connected === false
                                                ? 'Máster'
                                                : roomMembers.find(member => member.uid === currentCombatant?.ownerUid)?.displayName || 'Jugador sin identificar';
                                            const nextCombatant = getCombatant(nextId);
                                            const nextController = nextCombatant?.type === 'enemy' || nextCombatant?.connected === false
                                                ? 'Máster'
                                                : roomMembers.find(member => member.uid === nextCombatant?.ownerUid)?.displayName || 'Jugador';
                                            const hpPercent = selectedHp?.maxHp > 0 ? Math.min(100, (selectedHp.currentHp / selectedHp.maxHp) * 100) : 0;
                                            const roster = encounterCombatants.slice().sort((left, right) => {
                                                const leftIndex = order.indexOf(left.id);
                                                const rightIndex = order.indexOf(right.id);
                                                const normalizedLeft = leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex;
                                                const normalizedRight = rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex;
                                                return normalizedLeft - normalizedRight || String(left.name || '').localeCompare(String(right.name || ''));
                                            });
                                            return (
                                                <section className="tactical-encounter-grid" data-mobile-panel={onlineEncounterPanel}>
                                                    <nav className="online-encounter-panel-nav" aria-label="Panel de encuentro"><button type="button" onClick={() => setOnlineEncounterPanel('turn')} className={onlineEncounterPanel === 'turn' ? 'is-active' : ''}><small>Ahora</small><strong>Turno</strong></button><button type="button" onClick={() => setOnlineEncounterPanel('order')} className={onlineEncounterPanel === 'order' ? 'is-active' : ''}><small>Secuencia</small><strong>Orden</strong></button><button type="button" onClick={() => { if (!isCurrentRoomMaster && ownRoomParticipant) setSelectedCombatantId(ownRoomParticipant.id); setOnlineEncounterPanel('detail'); }} className={onlineEncounterPanel === 'detail' ? 'is-active' : ''}><small>Información</small><strong>{isCurrentRoomMaster ? 'Detalle' : 'Mi PJ'}</strong></button></nav>
                                                <div className="online-encounter-panels">
                                                <div className="tactical-turn-panel rounded border border-purple-700 bg-purple-950/25 p-3">
                                                    <div className={`online-combat-command ${roomData?.status === 'paused' ? 'is-paused' : ''} ${isOwnTurn ? 'is-own-turn' : ''}`}>
                                                        <div className="online-combat-command__status"><span><i />{roomData?.status === 'paused' ? 'Combate pausado' : 'Combate activo'}</span><b>Ronda {roomData?.round || 1}</b><em>Turno {order.length ? currentIndex + 1 : 0} de {order.length}</em></div>
                                                        <div className="online-combat-command__current">
                                                            <OnlineCombatantAvatar combatant={currentCombatant} className="h-16 w-16 text-xl" />
                                                            <div><small>{isOwnTurn ? 'Es tu turno' : isCurrentRoomMaster ? 'Turno que diriges' : 'Está actuando'}</small><h4>{currentCombatant?.name || 'Sin combatiente activo'}</h4><p>{currentCombatant ? `${currentCombatant.type === 'enemy' ? 'Enemigo' : currentCombatant.type === 'companion' ? (COMPANION_CATEGORY_LABELS[currentCombatant.category] || 'Compañero') : 'Personaje'} · Controla ${currentController}` : 'El Máster todavía no ha asignado el turno.'}</p></div>
                                                        </div>
                                                        <div className="online-combat-command__guidance"><span aria-hidden="true">{isOwnTurn ? '!' : isCurrentRoomMaster ? '◆' : '…'}</span><p>{roomData?.status === 'paused' ? 'El encuentro está en pausa. Espera a que el Máster lo reanude.' : isOwnTurn ? 'Haz tus acciones y avisa al Máster cuando hayas terminado.' : isCurrentRoomMaster ? `Gestiona las acciones de ${currentCombatant?.name || 'este combatiente'} y avanza cuando termine.` : `Espera mientras actúa ${currentCombatant?.name || 'el combatiente actual'}.`}</p></div>
                                                        <div className="online-combat-command__next"><span><small>Después actúa</small><strong>{nextCombatant?.name || 'Sin siguiente turno'}</strong><em>{nextCombatant ? `Controla ${nextController}` : '—'}</em></span>{isCurrentRoomMaster && <button type="button" disabled={encounterBusy || roomData?.status !== 'active' || !order.length} onClick={() => changeEncounterTurn(1)}>Terminar turno <b aria-hidden="true">→</b></button>}</div>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-1">
                                                        {currentConditions.map(condition => <span key={condition.id} className="rounded border border-red-900 px-1.5 py-0.5 text-[10px] text-red-100">{condition.name}</span>)}
                                                        {!currentConditions.length && <span className="text-xs text-gray-500">Sin condiciones activas.</span>}
                                                    </div>
                                                    {currentEffects.length > 0 && <div className="mt-2 space-y-1">{currentEffects.map(effect => <div key={effect.id} className="flex justify-between gap-2 text-xs text-gray-300"><span className="truncate">{effect.name}</span><span>{effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType}`}</span></div>)}</div>}
                                                    <div className="mt-4 border-t border-purple-900/70 pt-3">
                                                        <div className="online-initiative-heading">
                                                            <span aria-hidden="true">⚔</span><div><small>Secuencia del encuentro</small><h4>Orden de iniciativa</h4><p>Selecciona un combatiente para consultar su detalle.</p></div>
                                                            <b>{order.length}<small>combatientes</small></b>
                                                        </div>
                                                        <div className="tactical-initiative-list mt-2 space-y-1.5">
                                                            {order.map((id, index) => {
                                                                const combatant = getCombatant(id);
                                                                const isCurrent = id === currentId;
                                                                const isOwn = combatant?.ownerUid === firebaseUser?.uid;
                                                                const isNext = id === nextId;
                                                                const isEnemy = combatant?.type === 'enemy';
                                                                const isCompanion = combatant?.type === 'companion';
                                                                const controller = isEnemy ? 'Máster' : roomMembers.find(member => member.uid === combatant?.ownerUid)?.displayName || 'Jugador';
                                                                const conditionCount = normalizeOnlineConditions(isEnemy ? combatant?.conditionsVisible : combatant?.conditions).length;
                                                                const effectCount = encounterEffects.filter(effect => !effect.expired && effect.targetId === combatant?.id).length;
                                                                return <button type="button" key={`initiative-${id}-${index}`} onClick={() => setSelectedCombatantId(id)} className={`tactical-initiative-row online-initiative-card ${isEnemy ? 'is-enemy' : isCompanion ? 'is-companion' : 'is-player'} ${isCurrent ? 'tactical-initiative-row--current is-current' : ''} ${selected?.id === id ? 'is-selected' : ''} ${isNext ? 'is-next' : ''}`} aria-current={isCurrent ? 'step' : undefined}><span className="online-initiative-card__position"><small>#</small><strong>{index + 1}</strong></span><OnlineCombatantAvatar combatant={combatant} className="h-10 w-10 text-xs" /><span className="online-initiative-card__identity"><small>{isEnemy ? 'Enemigo' : isCompanion ? `${COMPANION_CATEGORY_LABELS[combatant?.category] || 'Compañero'} · ${controller}` : `Controla ${controller}`}</small><strong>{combatant?.name || 'Combatiente'}{isOwn ? ' · Tú' : ''}</strong><em>{conditionCount ? `${conditionCount} ${conditionCount === 1 ? 'condición' : 'condiciones'}` : 'Sin condiciones'}{effectCount ? ` · ${effectCount} ${effectCount === 1 ? 'efecto' : 'efectos'}` : ''}</em></span><span className="online-initiative-card__state">{isCurrent ? 'En turno' : isNext ? 'Siguiente' : selected?.id === id ? 'Consultando' : ''}</span><span className="online-initiative-card__score"><small>Ini</small><strong>{hasInitiativeValue(combatant?.initiative) ? combatant.initiative : '—'}</strong></span></button>;
                                                            })}
                                                            {!order.length && <p className="text-xs text-gray-500">Aun no hay orden de iniciativa.</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isCurrentRoomMaster && <div className="tactical-controls rounded border border-gray-700 bg-gray-950/45 p-3"><div className="flex flex-wrap gap-2"><button type="button" disabled={encounterBusy || roomData?.status !== 'active'} onClick={() => changeEncounterTurn(-1)} className="min-h-11 flex-1 rounded border border-gray-600 px-3 text-xs text-gray-200 disabled:opacity-40">Anterior</button><button type="button" disabled={encounterBusy || roomData?.status !== 'active'} onClick={() => changeEncounterTurn(1)} className="min-h-11 flex-[1.35] rounded border border-cyan-700 bg-cyan-950/30 px-3 text-xs font-bold text-cyan-100 disabled:opacity-40">Siguiente</button><button type="button" disabled={encounterBusy} onClick={() => setFinishEncounterPrompt(true)} className="tactical-finish-encounter min-h-11 rounded border border-red-800 px-3 text-xs font-bold text-red-200 disabled:opacity-40"><span aria-hidden="true">×</span> Finalizar encuentro</button><div className="relative"><button type="button" onClick={() => setEncounterActionsOpen(previous => !previous)} className="min-h-11 w-11 rounded border border-gray-600 text-lg text-gray-200" aria-label="Más controles de encuentro" aria-expanded={encounterActionsOpen}>...</button>{encounterActionsOpen && <div className="absolute right-0 top-12 z-20 w-48 rounded border border-gray-600 bg-gray-950 p-1.5 shadow-xl"><button type="button" disabled={encounterBusy || roomData?.status !== 'active'} onClick={() => { setPostponeOpen(true); setEncounterActionsOpen(false); }} className="w-full rounded px-3 py-2 text-left text-xs text-purple-100 hover:bg-purple-950/30 disabled:opacity-40">Postergar</button><button type="button" disabled={encounterBusy} onClick={() => { setEncounterStatus(roomData?.status === 'active' ? 'paused' : 'active'); setEncounterActionsOpen(false); }} className="w-full rounded px-3 py-2 text-left text-xs text-yellow-100 hover:bg-yellow-950/30 disabled:opacity-40">{roomData?.status === 'active' ? 'Pausar' : 'Reanudar'}</button></div>}</div></div></div>}
                                                </div>
                                                <div className="tactical-order-panel rounded border border-gray-700 bg-gray-950/40 p-3">
                                                    <div className="tactical-roster-header">
                                                        <span aria-hidden="true">☷</span><div><small>Vista compacta</small><h4>Orden del encuentro</h4><p>Jugadores y enemigos en la escena.</p></div>
                                                    </div>
                                                    <div className="tactical-roster-list mt-3 space-y-1.5 pr-1">
                                                        {roster.map(combatant => {
                                                            const isEnemy = combatant.type === 'enemy';
                                                            const isCurrent = combatant.id === currentId;
                                                            const isSelected = combatant.id === selected?.id;
                                                            const isOwn = combatant.ownerUid === firebaseUser?.uid;
                                                            const connected = isEnemy || combatant.connected !== false;
                                                            const state = isEnemy ? (combatant.defeated ? 'Derrotado' : combatant.visibleState || 'oculto') : (connected ? 'Conectado' : 'Desconectado');
                                                            const controller = isEnemy ? 'Máster' : roomMembers.find(member => member.uid === combatant.ownerUid)?.displayName || 'Sin identificar';
                                                            const position = order.indexOf(combatant.id);
                                                            return <button type="button" key={`roster-${combatant.id}`} onClick={() => setSelectedCombatantId(combatant.id)} className={`tactical-roster-row online-roster-card ${isEnemy ? 'tactical-roster-row--enemy is-enemy' : 'tactical-roster-row--player is-player'} ${combatant.defeated ? 'tactical-roster-row--defeated is-defeated' : ''} ${isCurrent ? 'is-current' : ''} ${isSelected ? 'is-selected' : ''}`}><span className="online-roster-card__position">{position >= 0 ? position + 1 : '—'}</span><OnlineCombatantAvatar combatant={combatant} className="h-10 w-10 text-xs" /><span className="online-roster-card__identity"><small>{isEnemy ? 'Enemigo' : controller}</small><strong>{combatant.name || 'Combatiente'}{isOwn ? ' · Tú' : ''}</strong><em>{isCurrent ? 'Actuando ahora' : state}</em></span><span className="online-roster-card__score"><small>Ini</small><strong>{hasInitiativeValue(combatant.initiative) ? combatant.initiative : '—'}</strong></span></button>;
                                                        })}
                                                        {!roster.length && <p className="text-xs text-gray-500">No hay combatientes.</p>}
                                                    </div>
                                                </div>
                                                <OnlineTacticalDetailPanel
                                                    selected={selected}
                                                    isEnemy={selectedIsEnemy}
                                                    privateData={selectedPrivate}
                                                    hp={selectedHp}
                                                    hpPercent={hpPercent}
                                                    canSeeHp={canSeeSelectedHp}
                                                    canEdit={canEditSelected}
                                                    conditions={selectedConditions}
                                                    effects={selectedEffects}
                                                    currentUid={firebaseUser?.uid}
                                                    onAvatarPreview={setOnlineAvatarViewer}
                                                    onEditEnemy={() => openEnemyModal(selected)}
                                                    onDeleteEnemy={() => confirmDelete(`¿Eliminar a ${selected?.name}?`, () => deleteEnemy(selected?.id))}
                                                    onOpenHealth={() => selectedIsEnemy ? setEnemyHpModal({ isOpen: true, enemyId: selected.id, mode: 'damage', amount: '' }) : openParticipantHpModal(selected)}
                                                    onQuickHp={delta => {
                                                        if (!selectedHp || !selected) return;
                                                        const nextHp = Math.max(0, Math.min(selectedHp.maxHp, selectedHp.currentHp + delta));
                                                        const update = selectedIsEnemy
                                                            ? updateEnemyHp(selected, { currentHp: nextHp })
                                                            : updateParticipantHp(selected, { currentHp: nextHp }, isCurrentRoomMaster ? 'master' : 'player');
                                                        update.catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.'));
                                                    }}
                                                    onDefeat={() => updateEnemyHp(selected, { currentHp: 0 }).catch(() => setOnlineTableError('No se pudo marcar el enemigo como derrotado.'))}
                                                    onAddCondition={() => openConditionModal(selected)}
                                                    onRemoveCondition={conditionId => removeOnlineCondition(selected, conditionId)}
                                                    onAddEffect={() => openEffectModal(null, selected)}
                                                    onAdjustEffect={(effect, delta) => updateEffectRemaining(effect, Number(effect.remaining) + delta)}
                                                    onFinishEffect={deleteEffect}
                                                    canManageEffect={canManageEffect}
                                                />
                                                <div className="tactical-detail-panel rounded border border-cyan-800 bg-cyan-950/15 p-3"><span className="text-[10px] font-bold uppercase text-cyan-300">Detalle</span>{selected && <div className="mt-2 flex justify-center"><OnlineCombatantAvatar combatant={selected} className="h-20 w-20 text-2xl" /></div>}{selected ? <><div className="mt-1 flex flex-wrap items-start justify-between gap-2"><div><strong className="block text-lg text-white">{selected.name}</strong><span className="text-xs text-gray-400">Iniciativa {selected.initiative ?? '—'}{selectedIsEnemy ? ` · ${selected.visibleState || 'oculto'}` : ` · ${selected.ownerUid === firebaseUser?.uid ? 'Tú' : 'Jugador'}`}</span></div>{selectedIsEnemy && canManageEnemies && <div className="flex gap-1"><button type="button" onClick={() => openEnemyModal(selected)} className="min-h-9 px-2 rounded border border-gray-600 text-[10px] text-gray-200">Editar</button><button type="button" onClick={() => confirmDelete(`¿Eliminar a ${selected.name}?`, () => deleteEnemy(selected.id))} className="min-h-9 px-2 rounded border border-red-900 text-[10px] text-red-200">Eliminar</button></div>}</div>{canSeeSelectedHp && selectedHp && <div className="mt-3 rounded border border-red-900/70 bg-red-950/15 p-2"><div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-200"><span>PV <b>{selectedHp.currentHp}</b> / {selectedHp.maxHp}{selectedHp.tempHp > 0 ? ` · Temporal ${selectedHp.tempHp}` : ''}</span>{selectedIsEnemy && selectedPrivate && <span>CA {selectedPrivate.armorClass ?? '—'}</span>}{!selectedIsEnemy && <span>CA {selected.armorClass ?? '—'}</span>}</div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-950"><div className="h-full bg-red-500" style={{ width: `${hpPercent}%` }}></div></div>{canEditSelected && <div className="mt-2 flex flex-wrap gap-1">{selectedIsEnemy ? <><button type="button" onClick={() => setEnemyHpModal({ isOpen: true, enemyId: selected.id, mode: 'damage', amount: '' })} className="min-h-9 px-2 rounded border border-red-800 text-[10px] text-red-100">Modificar vida</button><button type="button" onClick={() => updateEnemyHp(selected, { currentHp: 0 }).catch(() => setOnlineTableError('No se pudo marcar el enemigo como derrotado.'))} className="min-h-9 px-2 rounded border border-orange-800 text-[10px] text-orange-100">Derrotado</button></> : <><button type="button" onClick={() => updateParticipantHp(selected, { currentHp: Math.max(0, selectedHp.currentHp - 1) }, isCurrentRoomMaster ? 'master' : 'player').catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.'))} className="w-9 h-9 rounded border border-gray-600 text-gray-200">-</button><button type="button" onClick={() => openParticipantHpModal(selected)} className="min-h-9 px-2 rounded border border-red-800 text-[10px] text-red-100">Modificar vida</button><button type="button" onClick={() => updateParticipantHp(selected, { currentHp: Math.min(selectedHp.maxHp, selectedHp.currentHp + 1) }, isCurrentRoomMaster ? 'master' : 'player').catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.'))} className="w-9 h-9 rounded border border-gray-600 text-gray-200">+</button></>}</div>}</div>}<div className="mt-3"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase text-purple-200">Condiciones</span>{canEditSelected && <button type="button" onClick={() => openConditionModal(selected)} className="min-h-8 px-2 rounded border border-purple-700 text-[10px] text-purple-100">Añadir</button>}</div><div className="mt-1 flex flex-wrap gap-1">{selectedConditions.map(condition => <span key={condition.id} className="inline-flex items-center gap-1 rounded border border-red-900 px-1.5 py-0.5 text-[10px] text-red-100">{condition.name}{canEditSelected && <button type="button" onClick={() => removeOnlineCondition(selected, condition.id)} aria-label={`Quitar ${condition.name}`}>×</button>}</span>)}{!selectedConditions.length && <span className="text-xs text-gray-500">Sin condiciones.</span>}</div></div><div className="mt-3"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase text-cyan-300">Efectos</span>{canEditSelected && <button type="button" onClick={() => openEffectModal()} className="min-h-8 px-2 rounded border border-cyan-700 text-[10px] text-cyan-100">Añadir</button>}</div><div className="mt-1 space-y-1">{selectedEffects.map(effect => <div key={effect.id} className="flex items-center justify-between gap-2 text-xs text-gray-300"><span className="min-w-0 flex-1 truncate">{effect.name}</span><span className="shrink-0">{effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType}`}</span>{canManageEffect(effect) && <span className="flex shrink-0 gap-1">{effect.remaining !== null && <><button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.remaining) - 1)} className="h-8 w-8 rounded border border-gray-600 text-gray-200">-</button><button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.remaining) + 1)} className="h-8 w-8 rounded border border-gray-600 text-gray-200">+</button></>}<button type="button" onClick={() => deleteEffect(effect)} className="min-h-8 px-2 rounded border border-red-800 text-[10px] text-red-100">Finalizar</button></span>}</div>)}{!selectedEffects.length && <span className="text-xs text-gray-500">Sin efectos activos.</span>}</div></div></> : <p className="mt-2 text-sm text-gray-500">Selecciona un combatiente.</p>}</div>
                                                </section>
                                            );
                                        })()}
                                        {onlineTableView === 'encounter' && onlineEncounterView === 'participants' && isCurrentRoomMaster && (
                                            <OnlinePartyOverview participants={playerRoomParticipants} members={roomMembers} sheets={roomPlayerSheets} onOpenSheet={setOnlinePlayerSheetId} onAvatarPreview={setOnlineAvatarViewer} onKickMember={confirmKickRoomPlayer} />
                                        )}
                                        {onlineTableView === 'encounter' && onlineEncounterView === 'effects' && (() => {
                                            const activeEffects = encounterEffects.filter(effect => !effect.expired).slice().sort((left, right) => (left.remaining ?? Infinity) - (right.remaining ?? Infinity));
                                            const expiredEffects = encounterEffects.filter(effect => effect.expired);
                                            const canAddEffect = isCurrentRoomMaster || !!ownRoomParticipant;
                                            const renderEffect = effect => { const target = effect.targetType === 'global' ? null : getCombatant(effect.targetId); const canEdit = canManageEffect(effect); return <div key={effect.id} className="rounded border border-gray-700 bg-gray-900/60 p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><strong className="block text-sm text-white">{effect.name}{(effect.requiresConcentration || effect.concentration) && <span className="ml-2 text-[10px] uppercase text-purple-200">Concentración</span>}</strong><span className="block text-xs text-gray-400">{target?.name || (effect.targetType === 'global' ? 'Global' : 'Objetivo eliminado')} · {effect.expired ? 'Expirado' : effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType}`}</span>{effect.notesPublic && <span className="block text-xs text-gray-500">{effect.notesPublic}</span>}</div>{canEdit && <div className="flex flex-wrap gap-1">{effect.remaining !== null && <><button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.remaining) - 1)} className="h-9 w-9 rounded border border-gray-600 text-gray-200">-</button><button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.remaining) + 1)} className="h-9 w-9 rounded border border-gray-600 text-gray-200">+</button></>}{effect.expired && Number.isFinite(Number(effect.maximum)) && <button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.maximum))} className="min-h-9 px-2 rounded border border-cyan-700 text-[10px] text-cyan-100">Reiniciar</button>}<button type="button" onClick={() => deleteEffect(effect)} className="min-h-9 px-2 rounded border border-red-800 px-2 text-[10px] text-red-100">Finalizar</button>{effect.expired && <button type="button" onClick={() => confirmDelete(`¿Eliminar el efecto ${effect.name}?`, () => permanentlyDeleteEffect(effect))} className="min-h-9 px-2 rounded border border-gray-600 text-[10px] text-gray-300">Eliminar</button>}</div>}</div></div>; };
                                            return <section className="rounded border border-cyan-800 bg-cyan-950/15 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-cyan-200">Efectos</h4><p className="mt-1 text-xs text-gray-500">Activos primero; los expirados permanecen plegados.</p></div>{canAddEffect && <button type="button" onClick={() => openEffectModal()} className="min-h-10 px-3 rounded border border-cyan-700 text-xs text-cyan-100">Añadir efecto</button>}</div><div className="mt-3 space-y-2">{activeEffects.map(renderEffect)}{!activeEffects.length && <p className="text-sm text-gray-500">No hay efectos activos.</p>}</div><div className="mt-4 border-t border-gray-700 pt-3"><button type="button" onClick={() => setExpiredEffectsOpen(previous => !previous)} className="min-h-10 w-full rounded border border-gray-700 px-3 text-left text-xs text-gray-300" aria-expanded={expiredEffectsOpen}>Efectos expirados ({expiredEffects.length})</button>{expiredEffectsOpen && <div className="mt-2 space-y-2">{expiredEffects.map(renderEffect)}{!expiredEffects.length && <p className="text-xs text-gray-500">No hay efectos expirados.</p>}</div>}</div></section>
                                        ;})()}
                                        {false && onlineTableView === 'encounter' && (() => {
                                            const order = Array.isArray(roomData?.turnOrder) ? roomData.turnOrder : [];
                                            const currentIndex = Math.max(0, Math.min(Number(roomData?.turnIndex) || 0, Math.max(0, order.length - 1)));
                                            const currentId = roomData?.currentTurnId || order[currentIndex];
                                            const nextId = order.length > 1 ? order[(currentIndex + 1) % order.length] : null;
                                            return <section className="rounded border border-purple-700 bg-purple-950/25 p-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-purple-200">Encuentro · Ronda {roomData?.round || 1}</h4><p className="mt-1 text-xs text-gray-400">{roomData?.status === 'paused' ? 'Pausado · ' : ''}Turno: {participantName(currentId)}{nextId ? ` · Siguiente: ${participantName(nextId)}` : ''}</p></div><span className={`rounded border px-2 py-1 text-[10px] font-bold uppercase ${roomData?.status === 'paused' ? 'border-yellow-800 bg-yellow-950/30 text-yellow-200' : 'border-emerald-800 bg-emerald-950/30 text-emerald-200'}`}>{roomData?.status === 'paused' ? 'Pausado' : 'Activo'}</span></div>
                                                {(() => { const selected = getCombatant(selectedCombatantId || currentId); const selectedEffects = encounterEffects.filter(effect => effect.targetId === selected?.id || effect.targetId === selected?.ownerUid); return <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]"><div className="rounded border border-cyan-800 bg-cyan-950/20 p-3"><span className="text-[10px] font-bold uppercase text-cyan-300">Combatiente seleccionado</span><strong className="mt-1 block text-lg text-white">{selected?.name || 'Selecciona un combatiente'}</strong>{selected && <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-300"><span>Iniciativa {selected.initiative ?? '—'}</span>{selected.type === 'enemy' ? <span className="capitalize text-orange-200">{selected.visibleState || 'oculto'}</span> : <span>{selected.ownerUid === firebaseUser?.uid ? 'Tú' : 'Jugador'}</span>}</div>}<div className="mt-2 flex flex-wrap gap-1">{normalizeOnlineConditions(selected?.type === 'enemy' ? selected?.conditionsVisible : selected?.conditions).map(condition => <span key={condition.id} className="rounded border border-red-900 px-1.5 py-0.5 text-[10px] text-red-100">{condition.name}</span>)}</div></div><div className="rounded border border-gray-700 bg-gray-950/40 p-3"><span className="text-[10px] font-bold uppercase text-gray-400">Efectos relevantes</span><div className="mt-2 space-y-1">{selectedEffects.filter(effect => !effect.expired).slice(0, 3).map(effect => <div key={effect.id} className="flex justify-between gap-2 text-xs text-gray-300"><span className="truncate">{effect.name}</span><span>{effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType}`}</span></div>)}{!selectedEffects.filter(effect => !effect.expired).length && <p className="text-xs text-gray-500">Sin efectos activos.</p>}</div></div></div>; })()}
                                                <div className="online-turn-order mt-3 space-y-1.5 overflow-y-auto pr-1">{order.map((id, index) => { const participant = getCombatant(id); const active = id === currentId; return <button type="button" key={`${id}-${index}`} onClick={() => setSelectedCombatantId(id)} className={`flex w-full items-center gap-3 rounded border px-3 py-2 text-left ${active ? 'border-cyan-400 bg-cyan-950/45 shadow-[0_0_12px_rgba(34,211,238,0.16)]' : selectedCombatantId === id ? 'border-purple-500 bg-purple-950/25' : 'border-gray-700 bg-gray-900/60'}`}><span className={`w-6 text-center text-xs font-bold ${active ? 'text-cyan-200' : 'text-gray-500'}`}>{index + 1}</span><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{participant?.name || 'Participante'}{participant?.ownerUid === firebaseUser?.uid ? ' (Tú)' : ''}</strong><span className="text-xs text-gray-400">{participant?.type === 'enemy' ? `${participant.visibleState || 'oculto'} · ` : ''}Iniciativa: {hasInitiativeValue(participant?.initiative) ? participant.initiative : '—'}</span></div>{active && <span className="shrink-0 text-[10px] font-bold uppercase text-cyan-200">Turno actual</span>}</button>; })}</div>
                                                {isCurrentRoomMaster && <div className="mt-3 flex flex-wrap gap-2 border-t border-purple-900/70 pt-3"><button type="button" disabled={encounterBusy || roomData?.status !== 'active'} onClick={() => changeEncounterTurn(-1)} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200 disabled:opacity-40">Turno anterior</button><button type="button" disabled={encounterBusy || roomData?.status !== 'active'} onClick={() => changeEncounterTurn(1)} className="min-h-10 px-3 rounded border border-cyan-700 bg-cyan-950/30 text-xs text-cyan-100 disabled:opacity-40">Siguiente turno</button><button type="button" disabled={encounterBusy || roomData?.status !== 'active'} onClick={() => setPostponeOpen(true)} className="min-h-10 px-3 rounded border border-purple-700 text-xs text-purple-100 disabled:opacity-40">Postergar</button>{roomData?.status === 'active' ? <button type="button" disabled={encounterBusy} onClick={() => setEncounterStatus('paused')} className="min-h-10 px-3 rounded border border-yellow-800 text-xs text-yellow-100 disabled:opacity-40">Pausar</button> : <button type="button" disabled={encounterBusy} onClick={() => setEncounterStatus('active')} className="min-h-10 px-3 rounded border border-emerald-800 text-xs text-emerald-100 disabled:opacity-40">Reanudar</button>}<button type="button" disabled={encounterBusy} onClick={() => setFinishEncounterPrompt(true)} className="min-h-10 px-3 rounded border border-red-800 text-xs text-red-200 disabled:opacity-40">Finalizar encuentro</button></div>}
                                            </section>
                                        })()}
                                        {postponeOpen && roomData?.status === 'active' && <section className="rounded border border-purple-700 bg-gray-950/70 p-3"><div className="flex items-center justify-between gap-3"><h4 className="font-fantasy text-sm font-bold text-purple-200">Postergar turno</h4><button type="button" onClick={() => setPostponeOpen(false)} className="w-9 h-9 rounded border border-gray-600 text-gray-300" aria-label="Cerrar">×</button></div><p className="mt-1 text-xs text-gray-400">Elige la nueva posición de {participantName(roomData?.currentTurnId)}.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={encounterBusy} onClick={() => postponeCurrentTurn('after-next')} className="min-h-10 px-3 rounded border border-purple-700 text-xs text-purple-100">Después del siguiente</button><button type="button" disabled={encounterBusy} onClick={() => postponeCurrentTurn('end')} className="min-h-10 px-3 rounded border border-gray-600 text-xs text-gray-200">Al final de la ronda</button></div><div className="mt-3 grid grid-cols-1 gap-1">{(roomData?.turnOrder || []).filter(id => id !== roomData?.currentTurnId).map(id => <button key={id} type="button" disabled={encounterBusy} onClick={() => postponeCurrentTurn('before', id)} className="min-h-9 rounded border border-gray-700 px-3 text-left text-xs text-gray-300 hover:border-purple-500">Antes de {participantName(id)}</button>)}</div></section>}
                                        {onlineTableView === 'encounter' && onlineEncounterView === 'encounter' && isCurrentRoomMaster && (() => {
                                            const turnOrder = Array.isArray(roomData?.turnOrder) ? roomData.turnOrder : [];
                                            const outsideEnemies = publicCombatants.filter(enemy => !turnOrder.includes(enemy.id));
                                            const selectedEnemyIds = outsideEncounterEnemyIds.filter(id => outsideEnemies.some(enemy => enemy.id === id && !enemy.defeated));
                                            if (!outsideEnemies.length) return null;
                                            const toggleEnemy = (enemyId, checked) => setOutsideEncounterEnemyIds(previous => checked ? [...new Set([...previous, enemyId])] : previous.filter(id => id !== enemyId));
                                            return (
                                                <section className="rounded border border-orange-800 bg-orange-950/15 p-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div>
                                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-orange-200">Fuera del encuentro</h4>
                                                            <p className="mt-1 text-xs text-gray-400">Enemigos creados que todavía no forman parte del orden.</p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                type="button"
                                                                disabled={encounterBusy || !selectedEnemyIds.length}
                                                                onClick={() => addEnemyIdsAfterCurrent(selectedEnemyIds)}
                                                                className="min-h-10 rounded border border-orange-700 px-3 text-xs text-orange-100 disabled:opacity-40"
                                                            >
                                                                Añadir después del turno
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={encounterBusy || !selectedEnemyIds.length}
                                                                onClick={() => addEnemyIdsAtEnd(selectedEnemyIds)}
                                                                className="min-h-10 rounded border border-gray-600 px-3 text-xs text-gray-200 disabled:opacity-40"
                                                            >
                                                                Añadir al final
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 space-y-2">
                                                        {outsideEnemies.map(enemy => (
                                                            <div key={enemy.id} className="flex flex-wrap items-center gap-2 rounded border border-gray-700 bg-gray-900/60 px-3 py-2">
                                                                <label className="flex min-h-10 min-w-10 items-center justify-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedEnemyIds.includes(enemy.id)}
                                                                        disabled={enemy.defeated}
                                                                        onChange={event => toggleEnemy(enemy.id, event.target.checked)}
                                                                        aria-label={`Seleccionar ${enemy.name}`}
                                                                    />
                                                                </label>
                                                                <div className="min-w-0 flex-1">
                                                                    <strong className="block truncate text-sm text-white">{enemy.name}</strong>
                                                                    <span className="text-xs text-gray-400">Iniciativa {enemy.initiative ?? '—'} · {enemy.defeated ? 'Derrotado' : enemy.visibleState || 'oculto'}</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {!enemy.defeated && <><button type="button" disabled={encounterBusy} onClick={() => addEnemyIdsAfterCurrent([enemy.id])} className="min-h-9 rounded border border-orange-700 px-2 text-[10px] text-orange-100 disabled:opacity-40">Después del turno</button>
                                                                    <button type="button" disabled={encounterBusy} onClick={() => addEnemyIdsAtEnd([enemy.id])} className="min-h-9 rounded border border-gray-600 px-2 text-[10px] text-gray-200 disabled:opacity-40">Al final</button></>}
                                                                    {enemy.defeated && <button type="button" disabled={encounterBusy} onClick={() => { const privateData = privateEnemies.find(item => item.id === enemy.id); if (privateData) updateEnemyHp(enemy, { currentHp: getHpValues(privateData).maxHp }).catch(() => setOnlineTableError('No se pudo curar el enemigo.')); }} className="min-h-9 rounded border border-emerald-800 px-2 text-[10px] text-emerald-100 disabled:opacity-40">Curar</button>}
                                                                    <button type="button" onClick={() => openEnemyModal(enemy)} className="min-h-9 rounded border border-gray-600 px-2 text-[10px] text-gray-200">Editar</button>
                                                                    <button type="button" onClick={() => confirmDelete(`¿Eliminar a ${enemy.name}?`, () => deleteEnemy(enemy.id))} className="min-h-9 rounded border border-red-900 px-2 text-[10px] text-red-200">Eliminar</button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            );
                                        })()}
                                        {onlineTableView === 'lobby' && onlineRoomModule === 'sheets' && isCurrentRoomMaster && <OnlinePartyOverview participants={playerRoomParticipants} members={roomMembers} sheets={roomPlayerSheets} onOpenSheet={setOnlinePlayerSheetId} onAvatarPreview={setOnlineAvatarViewer} onKickMember={confirmKickRoomPlayer} />}
                                        {onlineTableView === 'lobby' && onlineRoomModule === 'sheets' && isCurrentRoomMaster && <div className="online-module-actions"><span>{sharedCharacterId ? `Tu personaje también está compartido · ${sheetSyncStatus === 'synced' ? 'sincronizado' : 'actualizando'}` : 'Como Máster también puedes compartir un personaje propio.'}</span>{sharedCharacterId ? <><button type="button" disabled={sharingCharacter} onClick={updateSharedCharacter}>Sincronizar ahora</button><button type="button" onClick={openCharacterSelector}>Cambiar mi personaje</button></> : <button type="button" onClick={openCharacterSelector}>Compartir mi personaje</button>}</div>}
                                        {onlineTableView === 'lobby' && onlineRoomModule === 'sheets' && !isCurrentRoomMaster && <section className="online-shared-sheet-status">
                                            <header><div><small>Ficha que ve el Máster</small><h4>{sharedCharacter?.data?.charInfo?.name || sharedCharacter?.meta?.name || 'Ningún personaje compartido'}</h4><p>{sharedCharacter ? `${sharedCharacter.data?.charInfo?.cls || 'Sin clase'} · Nivel ${sharedCharacter.data?.level || 1}` : 'Selecciona la ficha que usarás en esta mesa.'}</p></div><span className={`is-${sheetSyncStatus}`}>{sheetSyncStatus === 'synced' ? 'Sincronizada' : sheetSyncStatus === 'syncing' ? 'Sincronizando…' : sheetSyncStatus === 'pending' ? 'Cambios pendientes' : sheetSyncStatus === 'failed' ? 'Error de sincronización' : sheetSyncStatus === 'offline' ? 'Sin conexión' : 'Sin compartir'}</span></header>
                                            <div className="online-shared-sheet-status__body"><span aria-hidden="true">↻</span><div><strong>Actualización automática</strong><p>Inspiración, espacios de conjuro, recursos, equipo, mochila y el resto de datos compartidos se envían al Máster unos instantes después de cambiar.</p></div></div>
                                            <footer>{sharedCharacter ? <><button type="button" disabled={sharingCharacter || sheetSyncStatus === 'syncing'} onClick={updateSharedCharacter}>{sharingCharacter ? 'Actualizando…' : 'Sincronizar ahora'}</button><button type="button" onClick={openCharacterSelector}>Cambiar personaje</button></> : <button type="button" onClick={openCharacterSelector} className="is-primary">Compartir mi personaje</button>}</footer>
                                        </section>}
                                        {onlineTableView === 'lobby' && onlineRoomModule === 'sheets' && !isCurrentRoomMaster && <OnlineGroupRoster participants={playerRoomParticipants} members={roomMembers} />}
                                        {onlineTableView === 'lobby' && onlineRoomModule === 'combat' && (() => {
                                            const playerMembers = roomMembers.filter(member => member.role === 'player');
                                            const sharedPlayers = playerMembers.filter(member => playerRoomParticipants.some(participant => participant.ownerUid === member.uid));
                                            const readyPlayers = sharedPlayers.filter(member => { const participant = playerRoomParticipants.find(item => item.ownerUid === member.uid); return participant && hasInitiativeValue(participant.initiative); });
                                            const preparationReady = encounterCombatants.length > 0 && encounterCombatants.every(combatant => hasInitiativeValue(combatant.initiative));
                                            return (
                                              <section className="online-combat-lobby">
                                                <header className="online-combat-lobby__hero">
                                                  <span aria-hidden="true">
                                                    ⚔
                                                  </span>
                                                  <div>
                                                    <small>
                                                      Centro de preparación
                                                    </small>
                                                    <h4>
                                                      Preparar el próximo
                                                      combate
                                                    </h4>
                                                    <p>
                                                      Comprueba quién está
                                                      conectado y abre la
                                                      preparación para reunir
                                                      enemigos y ordenar los
                                                      turnos.
                                                    </p>
                                                  </div>
                                                  {isCurrentRoomMaster && (
                                                    <div className="online-combat-lobby__hero-actions">
                                                      <button
                                                        type="button"
                                                        className="is-primary"
                                                        onClick={
                                                          buildPreparedTurnOrder
                                                        }
                                                      >
                                                        Preparar encuentro{" "}
                                                        <b>→</b>
                                                      </button>
                                                    </div>
                                                  )}
                                                </header>
                                                <div className="online-combat-lobby__summary">
                                                  <span>
                                                    <small>Jugadores</small>
                                                    <strong>
                                                      {playerMembers.length}
                                                    </strong>
                                                    <em>
                                                      {sharedPlayers.length} con
                                                      personaje
                                                    </em>
                                                  </span>
                                                  <span>
                                                    <small>Iniciativas</small>
                                                    <strong>
                                                      {readyPlayers.length}/
                                                      {sharedPlayers.length}
                                                    </strong>
                                                    <em>
                                                      {preparationReady
                                                        ? "Todo listo"
                                                        : "Pendientes"}
                                                    </em>
                                                  </span>
                                                  <span>
                                                    <small>Enemigos</small>
                                                    <strong>
                                                      {publicCombatants.length}
                                                    </strong>
                                                    <em>
                                                      {
                                                        publicCombatants.filter(
                                                          (enemy) =>
                                                            hasInitiativeValue(
                                                              enemy.initiative,
                                                            ),
                                                        ).length
                                                      }{" "}
                                                      preparados
                                                    </em>
                                                  </span>
                                                  <span
                                                    className={
                                                      preparationReady
                                                        ? "is-ready"
                                                        : ""
                                                    }
                                                  >
                                                    <small>Estado</small>
                                                    <strong>
                                                      {preparationReady
                                                        ? "Listo"
                                                        : "En preparación"}
                                                    </strong>
                                                    <em>
                                                      {preparationReady
                                                        ? "Puedes ordenar turnos"
                                                        : "Revisa los avisos"}
                                                    </em>
                                                  </span>
                                                </div>
                                                {companionRoomParticipants.length >
                                                  0 && (
                                                  <section className="online-combat-companions">
                                                    <header>
                                                      <div>
                                                        <small>
                                                          Aliados vinculados
                                                        </small>
                                                        <h5>
                                                          Compañeros que
                                                          participarán
                                                        </h5>
                                                      </div>
                                                      <span>
                                                        {
                                                          companionRoomParticipants.length
                                                        }{" "}
                                                        incluidos por sus
                                                        jugadores
                                                      </span>
                                                    </header>
                                                    <div>
                                                      {companionRoomParticipants.map(
                                                        (companion) => {
                                                          const owner =
                                                            playerRoomParticipants.find(
                                                              (participant) =>
                                                                participant.ownerUid ===
                                                                companion.ownerUid,
                                                            );
                                                          const ownerName =
                                                            roomMembers.find(
                                                              (member) =>
                                                                member.uid ===
                                                                companion.ownerUid,
                                                            )?.displayName ||
                                                            owner?.name ||
                                                            "Jugador";
                                                          const ownInitiative =
                                                            companion.initiativeMode ===
                                                            "own";
                                                          const canEdit =
                                                            isCurrentRoomMaster ||
                                                            companion.ownerUid ===
                                                              firebaseUser?.uid;
                                                          return (
                                                            <article
                                                              key={companion.id}
                                                              className={
                                                                hasInitiativeValue(
                                                                  companion.initiative,
                                                                )
                                                                  ? "is-ready"
                                                                  : "is-pending"
                                                              }
                                                            >
                                                              <OnlineCombatantAvatar
                                                                combatant={
                                                                  companion
                                                                }
                                                                className="h-10 w-10 text-xs"
                                                              />
                                                              <div>
                                                                <small>
                                                                  {COMPANION_CATEGORY_LABELS[
                                                                    companion
                                                                      .category
                                                                  ] ||
                                                                    "Compañero"}{" "}
                                                                  de {ownerName}
                                                                </small>
                                                                <strong>
                                                                  {
                                                                    companion.name
                                                                  }
                                                                </strong>
                                                                <p>
                                                                  PV{" "}
                                                                  {
                                                                    companion.currentHp
                                                                  }
                                                                  /
                                                                  {
                                                                    companion.maxHp
                                                                  }{" "}
                                                                  · CA{" "}
                                                                  {companion.armorClass ||
                                                                    "—"}
                                                                </p>
                                                              </div>
                                                              {ownInitiative &&
                                                              canEdit ? (
                                                                <label>
                                                                  <span>
                                                                    Iniciativa
                                                                    propia
                                                                  </span>
                                                                  <input
                                                                    type="number"
                                                                    inputMode="numeric"
                                                                    value={
                                                                      participantInitiativeDrafts[
                                                                        companion
                                                                          .id
                                                                      ] ??
                                                                      companion.initiative ??
                                                                      ""
                                                                    }
                                                                    onChange={(
                                                                      event,
                                                                    ) =>
                                                                      setParticipantInitiativeDrafts(
                                                                        (
                                                                          previous,
                                                                        ) => ({
                                                                          ...previous,
                                                                          [companion.id]:
                                                                            event
                                                                              .target
                                                                              .value,
                                                                        }),
                                                                      )
                                                                    }
                                                                    onBlur={() =>
                                                                      commitParticipantInitiative(
                                                                        companion,
                                                                      )
                                                                    }
                                                                    onKeyDown={(
                                                                      event,
                                                                    ) => {
                                                                      if (
                                                                        event.key ===
                                                                        "Enter"
                                                                      )
                                                                        event.currentTarget.blur();
                                                                    }}
                                                                    placeholder="—"
                                                                  />
                                                                </label>
                                                              ) : (
                                                                <span className="online-combat-companions__turn">
                                                                  <small>
                                                                    {ownInitiative
                                                                      ? "Iniciativa"
                                                                      : "Turno"}
                                                                  </small>
                                                                  <strong>
                                                                    {ownInitiative
                                                                      ? (companion.initiative ??
                                                                        "Pendiente")
                                                                      : `Con ${owner?.name || "su dueño"}`}
                                                                  </strong>
                                                                </span>
                                                              )}
                                                            </article>
                                                          );
                                                        },
                                                      )}
                                                    </div>
                                                  </section>
                                                )}
                                                <div className="online-combat-lobby__layout">
                                                  <section className="online-combat-party">
                                                    <header>
                                                      <div>
                                                        <small>
                                                          Participantes
                                                        </small>
                                                        <h5>
                                                          Miembros de la mesa
                                                        </h5>
                                                      </div>
                                                      <span>
                                                        {roomMembers.length}{" "}
                                                        conectados
                                                      </span>
                                                    </header>
                                                    <div className="online-combat-party__list">
                                                      {roomMembers.map(
                                                        (member) => {
                                                          const participant =
                                                            roomParticipants.find(
                                                              (item) =>
                                                                item.ownerUid ===
                                                                member.uid,
                                                            );
                                                          const memberIsMaster =
                                                            member.role ===
                                                            "master";
                                                          const connected = !!(
                                                            member.active &&
                                                            (participant
                                                              ? participant.connected !==
                                                                false
                                                              : true)
                                                          );
                                                          const initiativeReady =
                                                            participant &&
                                                            hasInitiativeValue(
                                                              participant.initiative,
                                                            );
                                                          const canEditInitiative =
                                                            !!participant &&
                                                            (isCurrentRoomMaster ||
                                                              participant.ownerUid ===
                                                                firebaseUser?.uid);
                                                          const displayName =
                                                            member.displayName ||
                                                            (memberIsMaster
                                                              ? "Máster"
                                                              : "Jugador sin identificar");
                                                          const initiativeModifier =
                                                            participant
                                                              ? getParticipantInitiativeModifier(
                                                                  participant,
                                                                )
                                                              : 0;
                                                          return (
                                                            <article
                                                              key={member.id}
                                                              className={`${connected ? "is-connected" : "is-offline"} ${initiativeReady ? "is-ready" : ""}`}
                                                            >
                                                              <div className="online-combat-party__avatar">
                                                                {participant ? (
                                                                  <OnlineCombatantAvatar
                                                                    combatant={
                                                                      participant
                                                                    }
                                                                    className="h-12 w-12 text-sm"
                                                                  />
                                                                ) : (
                                                                  <span aria-hidden="true">
                                                                    {memberIsMaster
                                                                      ? "♜"
                                                                      : "?"}
                                                                  </span>
                                                                )}
                                                                <i />
                                                              </div>
                                                              <div className="online-combat-party__identity">
                                                                <small>
                                                                  {memberIsMaster
                                                                    ? "Director de juego"
                                                                    : `Jugador · ${displayName}`}
                                                                  {member.uid ===
                                                                  firebaseUser?.uid
                                                                    ? " · Tú"
                                                                    : ""}
                                                                </small>
                                                                <strong>
                                                                  {participant?.name ||
                                                                    (memberIsMaster
                                                                      ? displayName
                                                                      : "Sin personaje compartido")}
                                                                </strong>
                                                                <p>
                                                                  {participant
                                                                    ? `${participant.className || "Sin clase"} · Nivel ${participant.level || "—"}`
                                                                    : memberIsMaster
                                                                      ? "Organiza y dirige el encuentro"
                                                                      : "Debe compartir una ficha antes del combate"}
                                                                </p>
                                                              </div>
                                                              <div className="online-combat-party__state">
                                                                <span
                                                                  className={
                                                                    connected
                                                                      ? "is-online"
                                                                      : ""
                                                                  }
                                                                >
                                                                  {connected
                                                                    ? "Conectado"
                                                                    : "Desconectado"}
                                                                </span>
                                                                {participant && (
                                                                  <span
                                                                    className={
                                                                      initiativeReady
                                                                        ? "is-ready"
                                                                        : "is-pending"
                                                                    }
                                                                  >
                                                                    {initiativeReady
                                                                      ? "Iniciativa lista"
                                                                      : "Falta iniciativa"}
                                                                  </span>
                                                                )}
                                                              </div>
                                                              {canEditInitiative ? (
                                                                <div className="online-combat-party__initiative-actions">
                                                                  <label className="online-combat-party__initiative">
                                                                    <span>
                                                                      Iniciativa
                                                                      ·{" "}
                                                                      {window.DndOnlineTableUtils.formatOnlineModifier(
                                                                        initiativeModifier,
                                                                      )}
                                                                    </span>
                                                                    <input
                                                                      type="number"
                                                                      inputMode="numeric"
                                                                      value={
                                                                        participantInitiativeDrafts[
                                                                          participant
                                                                            .id
                                                                        ] ??
                                                                        participant.initiative ??
                                                                        ""
                                                                      }
                                                                      onChange={(
                                                                        event,
                                                                      ) =>
                                                                        setParticipantInitiativeDrafts(
                                                                          (
                                                                            previous,
                                                                          ) => ({
                                                                            ...previous,
                                                                            [participant.id]:
                                                                              event
                                                                                .target
                                                                                .value,
                                                                          }),
                                                                        )
                                                                      }
                                                                      onBlur={() =>
                                                                        commitParticipantInitiative(
                                                                          participant,
                                                                        )
                                                                      }
                                                                      onKeyDown={(
                                                                        event,
                                                                      ) => {
                                                                        if (
                                                                          event.key ===
                                                                          "Enter"
                                                                        )
                                                                          event.currentTarget.blur();
                                                                      }}
                                                                      placeholder="—"
                                                                      aria-label={`Iniciativa de ${participant.name || "participante"}`}
                                                                    />
                                                                  </label>
                                                                  <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                      rollParticipantInitiative(
                                                                        participant,
                                                                      )
                                                                    }
                                                                  >
                                                                    <span aria-hidden="true">
                                                                      20
                                                                    </span>
                                                                    Tirar
                                                                  </button>
                                                                </div>
                                                              ) : participant ? (
                                                                <div className="online-combat-party__initiative is-readonly">
                                                                  <span>
                                                                    Iniciativa
                                                                  </span>
                                                                  <strong>
                                                                    {participant.initiative ??
                                                                      "—"}
                                                                  </strong>
                                                                </div>
                                                              ) : null}
                                                              {isCurrentRoomMaster &&
                                                                !memberIsMaster && (
                                                                  <button
                                                                    type="button"
                                                                    disabled={
                                                                      onlineTableBusy
                                                                    }
                                                                    onClick={() =>
                                                                      confirmKickRoomPlayer(
                                                                        member,
                                                                      )
                                                                    }
                                                                    className="online-combat-party__kick"
                                                                    aria-label={`Expulsar a ${displayName} de la sala`}
                                                                  >
                                                                    Expulsar
                                                                  </button>
                                                                )}
                                                            </article>
                                                          );
                                                        },
                                                      )}
                                                      {!roomMembers.length && (
                                                        <div className="online-combat-party__empty">
                                                          No hay miembros
                                                          activos.
                                                        </div>
                                                      )}
                                                    </div>
                                                  </section>
                                                  {isCurrentRoomMaster ? (
                                                    <aside className="online-combat-enemies">
                                                      <header>
                                                        <div>
                                                          <small>
                                                            Oposición
                                                          </small>
                                                          <h5>
                                                            Enemigos de la
                                                            campaña
                                                          </h5>
                                                        </div>
                                                        <span>
                                                          Se gestionan en
                                                          Preparar encuentro
                                                        </span>
                                                      </header>
                                                      <div className="online-combat-enemies__list">
                                                        {publicCombatants.map(
                                                          (enemy) => {
                                                            const privateData =
                                                              privateEnemies.find(
                                                                (item) =>
                                                                  item.id ===
                                                                  enemy.id,
                                                              );
                                                            const modifier =
                                                              getParticipantInitiativeModifier(
                                                                enemy,
                                                              );
                                                            const initiativeReady =
                                                              hasInitiativeValue(
                                                                enemy.initiative,
                                                              );
                                                            return (
                                                              <article
                                                                key={enemy.id}
                                                                className={
                                                                  initiativeReady
                                                                    ? "is-ready"
                                                                    : "is-missing"
                                                                }
                                                              >
                                                                <OnlineCombatantAvatar
                                                                  combatant={
                                                                    enemy
                                                                  }
                                                                  className="h-12 w-12 text-xs"
                                                                />
                                                                <div className="online-combat-enemies__identity">
                                                                  <small>
                                                                    Enemigo
                                                                    preparado
                                                                  </small>
                                                                  <strong>
                                                                    {enemy.name}
                                                                  </strong>
                                                                  <span>
                                                                    PV{" "}
                                                                    {privateData?.currentHp ??
                                                                      "—"}
                                                                    /
                                                                    {privateData?.maxHp ??
                                                                      "—"}{" "}
                                                                    · CA{" "}
                                                                    {privateData?.armorClass ??
                                                                      "—"}{" "}
                                                                  </span>
                                                                </div>
                                                                <div className="online-combat-enemies__initiative">
                                                                  <small>
                                                                    Iniciativa
                                                                  </small>
                                                                  <strong>
                                                                    {initiativeReady
                                                                      ? enemy.initiative
                                                                      : "—"}
                                                                  </strong>
                                                                  <span>
                                                                    DES{" "}
                                                                    {window.DndOnlineTableUtils.formatOnlineModifier(
                                                                      modifier,
                                                                    )}
                                                                  </span>
                                                                </div>
                                                                <nav className="online-combat-enemies__actions">
                                                                  <button
                                                                    type="button"
                                                                    className="is-edit"
                                                                    onClick={() =>
                                                                      openEnemyModal(
                                                                        enemy,
                                                                      )
                                                                    }
                                                                  >
                                                                    <span aria-hidden="true">✎</span>
                                                                    Editar
                                                                  </button>
                                                                  <button
                                                                    type="button"
                                                                    className="is-delete"
                                                                    onClick={() =>
                                                                      confirmDelete(
                                                                        `¿Eliminar a ${enemy.name}?`,
                                                                        () => deleteEnemy(enemy.id),
                                                                      )
                                                                    }
                                                                  >
                                                                    <span aria-hidden="true">×</span>
                                                                    Eliminar
                                                                  </button>
                                                                </nav>
                                                              </article>
                                                            );
                                                          },
                                                        )}
                                                        {!publicCombatants.length && (
                                                          <div className="online-combat-enemies__empty">
                                                            <span aria-hidden="true">
                                                              ♞
                                                            </span>
                                                            <strong>
                                                              Aún no hay
                                                              enemigos
                                                            </strong>
                                                            <p>
                                                              Entra en Preparar
                                                              encuentro para
                                                              añadir criaturas y
                                                              configurar su
                                                              iniciativa.
                                                            </p>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </aside>
                                                  ) : (
                                                    <aside className="online-combat-waiting">
                                                      <span aria-hidden="true">
                                                        ◇
                                                      </span>
                                                      <strong>
                                                        {preparationReady
                                                          ? "El grupo está preparado"
                                                          : "Preparación en curso"}
                                                      </strong>
                                                      <p>
                                                        El Máster organizará el
                                                        orden cuando personajes
                                                        y enemigos tengan su
                                                        iniciativa.
                                                      </p>
                                                    </aside>
                                                  )}
                                                </div>
                                              </section>
                                            );
                                        })()}
                                        {false && onlineTableView === 'encounter' && <section className="rounded border border-purple-900/70 bg-purple-950/10 p-3">
                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-purple-200">Condiciones</h4>
                                            <div className="mt-3 space-y-2">{encounterCombatants.map(target => { const isEnemy = target.type === 'enemy'; const items = normalizeOnlineConditions(isEnemy ? target.conditionsVisible : target.conditions); const canEdit = canManageEnemies || (!isEnemy && target.ownerUid === firebaseUser?.uid); return <div key={`conditions-${target.id}`} className="rounded border border-gray-700 bg-gray-900/50 p-2"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs text-gray-200">{target.name}</strong>{canEdit && <button type="button" onClick={() => openConditionModal(target)} className="min-h-8 px-2 rounded border border-purple-700 text-[10px] text-purple-100">Añadir condición</button>}</div><div className="mt-2 flex flex-wrap gap-1">{items.map(condition => <span key={condition.id} className="inline-flex items-center gap-1 rounded border border-red-900 bg-red-950/40 px-1.5 py-0.5 text-[10px] text-red-100">{condition.name}{canEdit && <button type="button" onClick={() => removeOnlineCondition(target, condition.id)} className="text-red-200" aria-label={`Quitar ${condition.name}`}>×</button>}</span>)}{!items.length && <span className="text-xs text-gray-500">Sin condiciones</span>}</div></div>; })}</div>
                                        </section>}
                                        {false && onlineTableView === 'encounter' && <section className="rounded border border-cyan-900/70 bg-cyan-950/10 p-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-cyan-200">Efectos activos</h4><p className="mt-1 text-xs text-gray-500">Duraciones compartidas del encuentro.</p></div><button type="button" onClick={() => openEffectModal()} className="min-h-10 px-3 rounded border border-cyan-700 text-xs text-cyan-100">Añadir efecto</button></div>
                                            <div className="mt-3 space-y-2">{encounterEffects.slice().sort((a, b) => Number(a.expired) - Number(b.expired) || (a.remaining ?? Infinity) - (b.remaining ?? Infinity)).map(effect => { const target = effect.targetType === 'global' ? null : getCombatant(effect.targetId); const canEdit = canManageEffect(effect); const hasMaximum = Number.isFinite(Number(effect.maximum)) && Number(effect.maximum) >= 0; return <div key={effect.id} className={`rounded border p-3 ${effect.expired ? 'border-gray-800 bg-gray-950/40 text-gray-500' : 'border-cyan-900 bg-gray-900/60'}`}><div className="flex flex-wrap items-start justify-between gap-2"><div><strong className="block text-sm text-white">{effect.name}{(effect.requiresConcentration || effect.concentration) && <span className="ml-2 text-[10px] uppercase text-purple-200">Concentración</span>}</strong><span className="text-xs text-gray-400">{target?.name || (effect.targetType === 'global' ? 'Global' : 'Objetivo eliminado')} · {effect.expired ? 'Expirado' : effect.remaining === null ? 'Manual' : `${effect.remaining} ${effect.durationType} restantes`}</span>{effect.notesPublic && <span className="block text-xs text-gray-500">{effect.notesPublic}</span>}</div>{canEdit && <div className="flex flex-wrap items-center gap-1">{effect.remaining !== null && <><button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.remaining) - 1)} className="w-8 h-8 rounded border border-gray-600 text-gray-200">−</button><span className="min-w-10 text-center text-xs">{effect.remaining}</span><button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.remaining) + 1)} className="w-8 h-8 rounded border border-gray-600 text-gray-200">+</button></>}{effect.expired && hasMaximum && <button type="button" onClick={() => updateEffectRemaining(effect, Number(effect.maximum))} className="min-h-8 px-2 rounded border border-cyan-700 text-[10px] text-cyan-100">Reiniciar</button>}<button type="button" onClick={() => deleteEffect(effect)} className="min-h-8 px-2 rounded border border-red-800 text-[10px] text-red-100">{(effect.requiresConcentration || effect.concentration) ? 'Finalizar concentración' : 'Finalizar'}</button>{effect.expired && <button type="button" onClick={() => confirmDelete(`¿Eliminar el efecto ${effect.name}?`, () => permanentlyDeleteEffect(effect))} className="min-h-8 px-2 rounded border border-gray-700 text-[10px] text-gray-300">Eliminar</button>}</div>}</div></div>; })}{!encounterEffects.length && <p className="text-sm text-gray-500">No hay efectos activos.</p>}</div>
                                        </section>}
                                        {false && onlineTableView === 'encounter' && <section className="rounded border border-red-900/70 bg-red-950/10 p-3">
                                            <h4 className="font-fantasy text-sm font-bold uppercase tracking-wider text-red-200">Vida compartida</h4>
                                            <div className="mt-3 space-y-2">{roomParticipants.map(participant => { const values = getHpValues(participant); const canEdit = isCurrentRoomMaster || participant.ownerUid === firebaseUser?.uid; const percent = values.maxHp > 0 ? Math.min(100, (values.currentHp / values.maxHp) * 100) : 0; return <div key={`hp-${participant.id}`} className="rounded border border-gray-700 bg-gray-900/60 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div className="min-w-0"><strong className="block truncate text-sm text-white">{participant.name || 'Personaje sin nombre'}{participant.ownerUid === firebaseUser?.uid ? ' (Tú)' : ''}</strong><span className="text-xs text-gray-400">PV {values.currentHp} / {values.maxHp}{values.tempHp > 0 ? ` · Temporal ${values.tempHp}` : ''}</span></div>{canEdit && <div className="flex flex-wrap items-center gap-1"><button type="button" onClick={() => updateParticipantHp(participant, { currentHp: Math.max(0, values.currentHp - 1) }, isCurrentRoomMaster ? 'master' : 'player').catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.'))} className="w-9 h-9 rounded border border-gray-600 text-gray-200" aria-label={`Reducir vida de ${participant.name}`}>−</button><button type="button" onClick={() => openParticipantHpModal(participant)} className="min-h-9 px-3 rounded border border-red-800 text-xs text-red-100">Modificar vida</button><button type="button" onClick={() => updateParticipantHp(participant, { currentHp: Math.min(values.maxHp, values.currentHp + 1) }, isCurrentRoomMaster ? 'master' : 'player').catch(() => setOnlineTableError('No se pudo actualizar la vida en la mesa.'))} className="w-9 h-9 rounded border border-gray-600 text-gray-200" aria-label={`Aumentar vida de ${participant.name}`}>+</button></div>}</div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-950"><div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${percent}%` }}></div></div></div>; })}{!roomParticipants.length && <p className="text-sm text-gray-500">No hay personajes compartidos.</p>}</div>
                                            {ownRoomParticipant && <div className={`mt-2 flex flex-wrap items-center justify-between gap-2 text-xs ${hpSyncStatus === 'failed' ? 'text-red-300' : hpSyncStatus === 'pending' ? 'text-yellow-300' : hpSyncStatus === 'syncing' ? 'text-cyan-300' : 'text-emerald-300'}`}><span>{hpSyncStatus === 'failed' ? 'No se pudo sincronizar la vida' : hpSyncStatus === 'pending' ? 'Vida pendiente de sincronizar' : hpSyncStatus === 'syncing' ? 'Sincronizando vida…' : 'Vida sincronizada'}</span>{hpSyncStatus === 'failed' && <button type="button" onClick={retryPendingHpSync} className="min-h-8 px-2 rounded border border-red-700 text-[10px] text-red-100">Reintentar</button>}</div>}
                                        </section>}
                                        {onlineTableView === 'lobby' && onlineRoomModule === 'room' && <section className="online-campaign-control">
                                            <header><span aria-hidden="true">◈</span><div><small>Acceso a la aventura</small><h4>{roomData?.name || 'Campaña Online'}</h4><p>Invita al grupo y administra la conexión sin mezclar estas opciones con el resto del lobby.</p></div><b className={isCurrentRoomMaster ? 'is-master' : ''}>{isCurrentRoomMaster ? 'Máster' : 'Jugador'}</b></header>
                                            <div className="online-campaign-control__access"><div><small>Código de invitación</small><strong>{currentRoom.code}</strong><p>Solo quienes tengan este código podrán solicitar acceso.</p></div><div className="online-campaign-control__access-actions"><button type="button" onClick={() => copyRoomCode(currentRoom.code)}><span aria-hidden="true">▣</span><span><strong>Copiar código</strong><small>Al portapapeles</small></span></button><button type="button" className="is-primary" onClick={() => shareRoomLink(currentRoom.code)}><span aria-hidden="true">↗</span><span><strong>Invitar jugadores</strong><small>WhatsApp, Telegram o enlace</small></span></button></div></div>
                                            <div className="online-campaign-control__status"><span><i className="is-online"/><span><small>Conexión</small><strong>Campaña activa</strong></span></span><span><i/><span><small>Estado</small><strong>{roomData?.status === 'paused' ? 'Combate pausado' : roomData?.status === 'active' ? `Ronda ${roomData.round || 1}` : 'En el lobby'}</strong></span></span><span><i/><span><small>Miembros</small><strong>{roomMembers.length} en la campaña</strong></span></span></div>
                                            <footer><div><small>Navegación</small><strong>La campaña seguirá guardada en tu cuenta.</strong></div><button type="button" onClick={returnToCampaignHub}><span aria-hidden="true">⌂</span><span><strong>Cambiar de campaña</strong><small>Volver a tus mesas</small></span></button>{isCurrentRoomMaster && roomData?.status !== 'closed' && <button type="button" className="is-danger" onClick={() => confirmDelete('¿Cerrar esta campaña definitivamente? Los jugadores perderán el acceso y esta acción no se puede deshacer.', closeOnlineRoom)}><span aria-hidden="true">×</span><span><strong>Cerrar campaña</strong><small>Acción definitiva</small></span></button>}</footer>
                                        </section>}
                                    </div>}
                                    {onlineTableView === 'closed' && <div className="mt-5 space-y-4 rounded border border-red-800 bg-red-950/25 p-4 text-center">
                                        <h4 className="font-fantasy text-lg font-bold text-red-200">Sala cerrada</h4>
                                        <p className="text-sm text-gray-300">El Máster ha cerrado esta sala. Puedes salir cuando quieras.</p>
                                        <button type="button" onClick={returnToCampaignHub} className="min-h-11 px-4 rounded border border-gray-600 text-sm text-gray-200 hover:border-cyan-400">Volver a mis campañas</button>
                                    </div>}
                                    </div>
                                    </div>
                                </div>
                                {roomInvite.isOpen && (() => {
                                    const message = `Únete a mi Mesa Online de D&D · Sala ${roomInvite.code}`;
                                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${message}\n${roomInvite.url}`)}`;
                                    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(roomInvite.url)}&text=${encodeURIComponent(message)}`;
                                    return <div className="online-invite-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setRoomInvite({ isOpen: false, code: '', url: '' }); }}>
                                        <section className="online-invite-dialog" role="dialog" aria-modal="true" aria-labelledby="online-invite-title">
                                            <header><div><small>Invitar jugadores</small><h4 id="online-invite-title">Compartir sala {roomInvite.code}</h4></div><button type="button" onClick={() => setRoomInvite({ isOpen: false, code: '', url: '' })} aria-label="Cerrar opciones de invitación">×</button></header>
                                            <p>Elige dónde enviar el enlace. Los jugadores abrirán directamente la pantalla para unirse a esta sala.</p>
                                            <div className="online-invite-options">
                                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="is-whatsapp"><span aria-hidden="true">W</span><span><strong>WhatsApp</strong><small>Abrir conversación o grupo</small></span><b aria-hidden="true">→</b></a>
                                                <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="is-telegram"><span aria-hidden="true">T</span><span><strong>Telegram</strong><small>Elegir chat o canal</small></span><b aria-hidden="true">→</b></a>
                                                {navigator.share && <button type="button" onClick={shareRoomWithSystem} className="is-system"><span aria-hidden="true">↗</span><span><strong>Más aplicaciones</strong><small>Abrir el menú del dispositivo</small></span><b aria-hidden="true">→</b></button>}
                                                <button type="button" onClick={async () => { if (await copyRoomCode(roomInvite.url, `Enlace de invitación copiado · Sala ${roomInvite.code}`)) setRoomInvite({ isOpen: false, code: '', url: '' }); }} className="is-copy"><span aria-hidden="true">▣</span><span><strong>Copiar enlace</strong><small>Pegarlo donde quieras</small></span><b aria-hidden="true">→</b></button>
                                            </div>
                                            <div className="online-invite-code"><span>Código alternativo</span><strong>{roomInvite.code}</strong><button type="button" onClick={() => copyRoomCode(roomInvite.code)}>Copiar código</button></div>
                                        </section>
                                    </div>;
                                })()}
                            </div>,
                            document.body
                        )}
        </>;
    }

    window.DndOnlineTableShellComponents = { OnlineTableShell };
})();
