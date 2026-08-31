(() => {
  window.DndSessionModeComponents = (() => {
    const SessionMode = ({
      model
    }) => {
      const {
        charInfo,
        level,
        currentRoom,
        hp,
        activeConcentration,
        activateOnlineTableDock,
        setDiceRollerOpen,
        closeSessionMode,
        conditions,
        renderVitalityBar,
        setHp,
        handleNumInput,
        calculateAC,
        formatMod,
        getModNum,
        getEffectiveStat,
        initBonus,
        requestInitiativeRoll,
        speed,
        getPassivePerception,
        inspiration,
        setInspiration,
        guidance,
        setGuidance,
        finishConcentration,
        conditionSymbols,
        setConditions,
        leaveSessionFor,
        setCombatDashboardView,
        setRestType,
        setRestModalOpen,
        tacticalResources,
        renderUsageDots,
        setResources,
        grimoireConfig,
        setGrimoireConfig,
        tacticalWeapons,
        getWeaponAttackBonus,
        requestWeaponAttackRoll,
        sessionSpellSlots,
        tacticalSpells,
        setCastSpell,
        companions,
        openCompanionManager,
        sessionCompanions,
        adjustCompanionHp,
        CompanionAvatar,
        COMPANION_CATEGORY_LABELS,
        sessionInventory,
        adjustInvQty,
        setDiaryOpen,
        sessionQuickNote,
        setSessionQuickNote,
        saveSessionQuickNote,
        sessionNotes,
        openTimerModal,
        renderTimerList
      } = model;
      return /*#__PURE__*/React.createElement("div", {
        "data-tab": "combat",
        className: "combat-mode-panel session-mode tab-section"
      }, /*#__PURE__*/React.createElement("header", {
        className: "session-mode-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "session-mode-emblem",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("span", null, "◆"), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("div", {
        className: "session-mode-identity"
      }, /*#__PURE__*/React.createElement("small", null, "Centro de juego"), /*#__PURE__*/React.createElement("h1", null, charInfo.name || 'Personaje sin nombre'), /*#__PURE__*/React.createElement("p", null, charInfo.cls || 'Clase sin definir', " · Nivel ", level || '1', currentRoom ? ` · Mesa ${currentRoom.code}` : '')), /*#__PURE__*/React.createElement("div", {
        className: "session-mode-header-state"
      }, /*#__PURE__*/React.createElement("span", {
        className: Number(hp.current) > 0 ? 'is-ready' : 'is-danger'
      }, /*#__PURE__*/React.createElement("i", null), Number(hp.current) > 0 ? 'En aventura' : 'Inconsciente'), activeConcentration && /*#__PURE__*/React.createElement("span", {
        className: "is-concentrating"
      }, "C · ", activeConcentration.spellName)), /*#__PURE__*/React.createElement("nav", {
        className: "session-mode-header-actions",
        "aria-label": "Acciones del modo sesión"
      }, currentRoom && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: activateOnlineTableDock
      }, /*#__PURE__*/React.createElement("span", null, "◇"), "Mesa online"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setDiceRollerOpen(true)
      }, /*#__PURE__*/React.createElement("span", null, "20"), "Dados"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-exit",
        onClick: closeSessionMode
      }, /*#__PURE__*/React.createElement("span", null, "↙"), "Volver a la ficha"))), /*#__PURE__*/React.createElement("nav", {
        className: "session-mode-jumpbar",
        "aria-label": "Secciones del modo sesión"
      }, [['vitals', 'Estado'], ['resources', 'Recursos'], ['actions', 'Acciones'], ['magic', 'Magia'], ['companions', 'Compañeros'], ['inventory', 'Mochila'], ['notes', 'Notas']].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
        type: "button",
        key: id,
        onClick: () => document.getElementById(`session-${id}`)?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        })
      }, label))), /*#__PURE__*/React.createElement("div", {
        className: "session-mode-layout"
      }, /*#__PURE__*/React.createElement("section", {
        id: "session-vitals",
        className: "session-mode-card session-mode-vitals"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Estado inmediato"), /*#__PURE__*/React.createElement("h2", null, "Tu personaje ahora")), /*#__PURE__*/React.createElement("span", null, conditions.length ? `${conditions.length} estado${conditions.length === 1 ? '' : 's'}` : 'Sin condiciones')), /*#__PURE__*/React.createElement("div", {
        className: "session-health"
      }, /*#__PURE__*/React.createElement("div", {
        className: "session-health-heading"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Puntos de golpe"), /*#__PURE__*/React.createElement("strong", null, hp.current || 0, /*#__PURE__*/React.createElement("i", null, "/ ", hp.max || 0))), Number(hp.temp) > 0 && /*#__PURE__*/React.createElement("b", null, "+", hp.temp, " temporales")), renderVitalityBar(false, 'session-health-bar'), /*#__PURE__*/React.createElement("div", {
        className: "session-health-controls"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setHp(previous => ({
          ...previous,
          current: String(Math.max(0, (Number(previous.current) || 0) - 1))
        })),
        "aria-label": "Perder un punto de golpe"
      }, "−1"), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("small", null, "Actuales"), /*#__PURE__*/React.createElement("input", {
        "aria-label": "Puntos de golpe actuales",
        type: "number",
        value: hp.current,
        onChange: event => setHp(previous => ({
          ...previous,
          current: handleNumInput(event.target.value)
        }))
      })), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setHp(previous => ({
          ...previous,
          current: String(Math.min(Number(previous.max) || 0, (Number(previous.current) || 0) + 1))
        })),
        "aria-label": "Recuperar un punto de golpe"
      }, "+1"), /*#__PURE__*/React.createElement("label", {
        className: "is-temporary"
      }, /*#__PURE__*/React.createElement("small", null, "Temporales"), /*#__PURE__*/React.createElement("input", {
        "aria-label": "Puntos de golpe temporales",
        type: "number",
        value: hp.temp || '',
        placeholder: "0",
        onChange: event => setHp(previous => ({
          ...previous,
          temp: handleNumInput(event.target.value)
        }))
      })))), /*#__PURE__*/React.createElement("div", {
        className: "session-stat-strip"
      }, /*#__PURE__*/React.createElement("article", null, /*#__PURE__*/React.createElement("small", null, "CA"), /*#__PURE__*/React.createElement("strong", null, calculateAC()), /*#__PURE__*/React.createElement("span", null, "Defensa")), /*#__PURE__*/React.createElement("article", null, /*#__PURE__*/React.createElement("small", null, "Iniciativa"), /*#__PURE__*/React.createElement("strong", null, formatMod(getModNum(getEffectiveStat('des')) + (Number(initBonus) || 0))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: requestInitiativeRoll
      }, "Tirar")), /*#__PURE__*/React.createElement("article", null, /*#__PURE__*/React.createElement("small", null, "Velocidad"), /*#__PURE__*/React.createElement("strong", null, speed || '0'), /*#__PURE__*/React.createElement("span", null, "metros")), /*#__PURE__*/React.createElement("article", null, /*#__PURE__*/React.createElement("small", null, "Percepción"), /*#__PURE__*/React.createElement("strong", null, getPassivePerception()), /*#__PURE__*/React.createElement("span", null, "pasiva"))), /*#__PURE__*/React.createElement("div", {
        className: "session-support-strip"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: inspiration ? 'is-active is-inspiration' : 'is-inspiration',
        onClick: () => setInspiration(!inspiration)
      }, /*#__PURE__*/React.createElement("span", null, "✦"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Inspiración"), /*#__PURE__*/React.createElement("strong", null, inspiration ? 'Disponible' : 'No disponible')), /*#__PURE__*/React.createElement("b", null, inspiration ? '✓' : '+')), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: guidance ? 'is-active is-guidance' : 'is-guidance',
        onClick: () => setGuidance(!guidance)
      }, /*#__PURE__*/React.createElement("span", null, "1d4"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Guía"), /*#__PURE__*/React.createElement("strong", null, guidance ? 'Activa' : 'No activa')), /*#__PURE__*/React.createElement("b", null, guidance ? '✓' : '+'))), (activeConcentration || conditions.length > 0) && /*#__PURE__*/React.createElement("div", {
        className: "session-active-states"
      }, activeConcentration && /*#__PURE__*/React.createElement("article", {
        className: "is-concentration"
      }, /*#__PURE__*/React.createElement("span", null, "C"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Concentración"), /*#__PURE__*/React.createElement("strong", null, activeConcentration.spellName)), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: finishConcentration
      }, "Finalizar")), conditions.map(condition => {
        const name = typeof condition === 'string' ? condition : condition.name;
        return /*#__PURE__*/React.createElement("article", {
          key: name,
          className: "is-condition"
        }, /*#__PURE__*/React.createElement("span", null, conditionSymbols[name] || '✷'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Condición"), /*#__PURE__*/React.createElement("strong", null, name)), /*#__PURE__*/React.createElement("button", {
          type: "button",
          "aria-label": `Quitar ${name}`,
          onClick: () => setConditions(previous => previous.filter(item => (typeof item === 'string' ? item : item.name) !== name))
        }, "×"));
      })), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => leaveSessionFor('combat', () => setCombatDashboardView('conditions'))
      }, "Gestionar condiciones"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          setRestType(null);
          setRestModalOpen(true);
        }
      }, "Descansar"))), /*#__PURE__*/React.createElement("section", {
        id: "session-resources",
        className: "session-mode-card session-mode-resources"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Usos y cargas"), /*#__PURE__*/React.createElement("h2", null, "Recursos")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => leaveSessionFor('combat', () => setCombatDashboardView('summary'))
      }, "Ver todos")), /*#__PURE__*/React.createElement("div", {
        className: "session-resource-list"
      }, tacticalResources.map(resource => /*#__PURE__*/React.createElement("article", {
        key: resource.id
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, resource.recoveryRest === 'short' ? 'Descanso corto' : resource.recoveryRest === 'long' ? 'Descanso largo' : 'Manual'), /*#__PURE__*/React.createElement("strong", null, resource.name), renderUsageDots(resource.current, resource.max, 'text-purple-400')), /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        "aria-label": `Reducir ${resource.name}`,
        onClick: () => setResources(previous => previous.map(item => item.id === resource.id ? {
          ...item,
          current: Math.max(0, Number(item.current) - 1)
        } : item))
      }, "−"), /*#__PURE__*/React.createElement("span", null, resource.current, /*#__PURE__*/React.createElement("i", null, "/"), resource.max), /*#__PURE__*/React.createElement("button", {
        type: "button",
        "aria-label": `Aumentar ${resource.name}`,
        onClick: () => setResources(previous => previous.map(item => item.id === resource.id ? {
          ...item,
          current: Math.min(Number(item.max), Number(item.current) + 1)
        } : item))
      }, "+")))), grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 && /*#__PURE__*/React.createElement("article", {
        className: "is-pact"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Descanso corto · Nivel ", grimoireConfig.pactSlots.level), /*#__PURE__*/React.createElement("strong", null, "Magia de pacto"), renderUsageDots(grimoireConfig.pactSlots.current, grimoireConfig.pactSlots.max, 'text-yellow-300')), /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setGrimoireConfig(previous => ({
          ...previous,
          pactSlots: {
            ...previous.pactSlots,
            current: Math.max(0, Number(previous.pactSlots.current) - 1)
          }
        }))
      }, "−"), /*#__PURE__*/React.createElement("span", null, grimoireConfig.pactSlots.current, /*#__PURE__*/React.createElement("i", null, "/"), grimoireConfig.pactSlots.max), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setGrimoireConfig(previous => ({
          ...previous,
          pactSlots: {
            ...previous.pactSlots,
            current: Math.min(Number(previous.pactSlots.max), Number(previous.pactSlots.current) + 1)
          }
        }))
      }, "+"))), !tacticalResources.length && !(grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0) && /*#__PURE__*/React.createElement("div", {
        className: "session-mode-empty"
      }, /*#__PURE__*/React.createElement("span", null, "◇"), /*#__PURE__*/React.createElement("strong", null, "Sin recursos configurados"), /*#__PURE__*/React.createElement("p", null, "Añade usos de clase desde la pestaña de combate.")))), /*#__PURE__*/React.createElement("section", {
        id: "session-actions",
        className: "session-mode-card session-mode-actions"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Arsenal preparado"), /*#__PURE__*/React.createElement("h2", null, "Acciones y ataques")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => leaveSessionFor('combat', () => setCombatDashboardView('summary'))
      }, "Abrir arsenal")), /*#__PURE__*/React.createElement("div", {
        className: "session-action-list"
      }, tacticalWeapons.flatMap(weapon => (weapon.attacks || []).slice(0, 3).map((attack, attackIndex) => /*#__PURE__*/React.createElement("article", {
        key: `${weapon.id}_${attackIndex}`
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, weapon.name), /*#__PURE__*/React.createElement("strong", null, attack.name || 'Ataque'), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", null, "Ataque ", getWeaponAttackBonus(attack, weapon) || '—'), /*#__PURE__*/React.createElement("span", null, "Daño ", attack.dmg || '—'))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => requestWeaponAttackRoll(attack, weapon, attackIndex)
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "20"), "Tirar ataque")))), !tacticalWeapons.some(weapon => weapon.attacks?.length) && /*#__PURE__*/React.createElement("div", {
        className: "session-mode-empty"
      }, /*#__PURE__*/React.createElement("span", null, "⚔"), /*#__PURE__*/React.createElement("strong", null, "No hay ataques preparados"), /*#__PURE__*/React.createElement("p", null, "Configura un ataque en el arsenal para usarlo aquí.")))), /*#__PURE__*/React.createElement("section", {
        id: "session-magic",
        className: "session-mode-card session-mode-magic"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Conjuros disponibles"), /*#__PURE__*/React.createElement("h2", null, "Magia preparada")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => leaveSessionFor('grimoire')
      }, "Abrir grimorio")), sessionSpellSlots.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: "session-slot-strip"
      }, sessionSpellSlots.map(([slotLevel, slot]) => /*#__PURE__*/React.createElement("span", {
        key: slotLevel
      }, /*#__PURE__*/React.createElement("small", null, "N", slotLevel), /*#__PURE__*/React.createElement("strong", null, slot.current, "/", slot.max)))), /*#__PURE__*/React.createElement("div", {
        className: "session-spell-list"
      }, tacticalSpells.slice(0, 8).map(spell => /*#__PURE__*/React.createElement("button", {
        type: "button",
        key: spell.id,
        onClick: () => setCastSpell(spell)
      }, /*#__PURE__*/React.createElement("span", {
        className: "session-spell-level"
      }, spell.level === 0 ? 'T' : spell.level), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, spell.concentration ? 'Concentración' : spell.ritual ? 'Ritual' : spell.school || 'Conjuro'), /*#__PURE__*/React.createElement("strong", null, spell.name)), /*#__PURE__*/React.createElement("b", null, "Lanzar →"))), !tacticalSpells.length && /*#__PURE__*/React.createElement("div", {
        className: "session-mode-empty"
      }, /*#__PURE__*/React.createElement("span", null, "✦"), /*#__PURE__*/React.createElement("strong", null, "Sin magia disponible"), /*#__PURE__*/React.createElement("p", null, "Prepara o aprende conjuros desde el grimorio.")))), /*#__PURE__*/React.createElement("section", {
        id: "session-companions",
        className: "session-mode-card session-mode-companions"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Aliados vinculados"), /*#__PURE__*/React.createElement("h2", null, "Compañeros activos")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => openCompanionManager()
      }, companions.length ? 'Gestionar' : 'Añadir')), /*#__PURE__*/React.createElement("div", {
        className: "session-companion-list"
      }, (sessionCompanions.length ? sessionCompanions : companions.slice(0, 2)).map(companion => {
        const hpPercent = companion.maxHp > 0 ? Math.max(0, Math.min(100, companion.currentHp / companion.maxHp * 100)) : 0;
        return /*#__PURE__*/React.createElement("article", {
          key: companion.id,
          className: companion.participates ? 'is-active' : ''
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "session-companion-identity",
          onClick: () => openCompanionManager(companion.id)
        }, /*#__PURE__*/React.createElement(CompanionAvatar, {
          companion: companion
        }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, COMPANION_CATEGORY_LABELS[companion.category]), /*#__PURE__*/React.createElement("strong", null, companion.name), /*#__PURE__*/React.createElement("em", null, "CA ", companion.armorClass ?? '—', " · PV ", companion.currentHp, "/", companion.maxHp))), /*#__PURE__*/React.createElement("i", null, /*#__PURE__*/React.createElement("b", {
          style: {
            width: `${hpPercent}%`
          }
        })), /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => adjustCompanionHp(companion.id, -1)
        }, "−1"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openCompanionManager(companion.id)
        }, "Ficha"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => adjustCompanionHp(companion.id, 1)
        }, "+1")));
      }), !companions.length && /*#__PURE__*/React.createElement("div", {
        className: "session-mode-empty"
      }, /*#__PURE__*/React.createElement("span", null, "♙"), /*#__PURE__*/React.createElement("strong", null, "Sin compañeros"), /*#__PURE__*/React.createElement("p", null, "Vincula un familiar, montura o aliado para tenerlo a mano.")))), /*#__PURE__*/React.createElement("section", {
        id: "session-inventory",
        className: "session-mode-card session-mode-inventory"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Objetos a mano"), /*#__PURE__*/React.createElement("h2", null, "Mochila rápida")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => leaveSessionFor('inventory')
      }, "Abrir mochila")), /*#__PURE__*/React.createElement("div", {
        className: "session-inventory-list"
      }, sessionInventory.map(item => /*#__PURE__*/React.createElement("article", {
        key: item.id
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Cantidad"), /*#__PURE__*/React.createElement("strong", null, item.name || 'Objeto'), /*#__PURE__*/React.createElement("p", null, item.desc || item.description || 'Sin notas')), /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => adjustInvQty(item.id, -1),
        "aria-label": `Reducir ${item.name}`
      }, "−"), /*#__PURE__*/React.createElement("span", null, item.qty ?? item.quantity ?? 1), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => adjustInvQty(item.id, 1),
        "aria-label": `Aumentar ${item.name}`
      }, "+")))), !sessionInventory.length && /*#__PURE__*/React.createElement("div", {
        className: "session-mode-empty"
      }, /*#__PURE__*/React.createElement("span", null, "◇"), /*#__PURE__*/React.createElement("strong", null, "La mochila está vacía"), /*#__PURE__*/React.createElement("p", null, "Añade objetos desde Inventario.")))), /*#__PURE__*/React.createElement("section", {
        id: "session-notes",
        className: "session-mode-card session-mode-notes"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Memoria de la partida"), /*#__PURE__*/React.createElement("h2", null, "Nota rápida")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => leaveSessionFor('inventory', () => setDiaryOpen(true))
      }, "Abrir diario")), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", {
        className: "sr-only"
      }, "Nueva nota rápida de sesión"), /*#__PURE__*/React.createElement("textarea", {
        value: sessionQuickNote,
        onChange: event => setSessionQuickNote(event.target.value),
        placeholder: "PNJ, pista, decisión, botín pendiente…"
      })), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "session-note-save",
        disabled: !sessionQuickNote.trim(),
        onClick: saveSessionQuickNote
      }, "Guardar en el diario"), sessionNotes.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: "session-recent-notes"
      }, /*#__PURE__*/React.createElement("small", null, "Últimas entradas"), sessionNotes.slice(0, 2).map(note => /*#__PURE__*/React.createElement("article", {
        key: note.id
      }, /*#__PURE__*/React.createElement("strong", null, note.title || note.date || 'Entrada sin título'), /*#__PURE__*/React.createElement("p", null, note.text || 'Sin contenido'))))), /*#__PURE__*/React.createElement("section", {
        className: "session-mode-card session-mode-timers"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Seguimiento activo"), /*#__PURE__*/React.createElement("h2", null, "Temporizadores")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => openTimerModal()
      }, "＋ Añadir")), renderTimerList())));
    };
    return {
      SessionMode
    };
  })();
})();