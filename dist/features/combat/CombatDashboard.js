(() => {
  (() => {
    const {
      CombatSectionIcon
    } = window.DndCharacterSheetComponents;
    function CombatDashboard({
      model
    }) {
      const {
        activeConcentration,
        calculateAC,
        combatConditions,
        combatDashboardView,
        conditionSymbols,
        conditions,
        conditionsManagerOpen,
        finishConcentration,
        formatMod,
        getEffectiveStat,
        getModNum,
        getPassivePerception,
        guidance,
        handleNumInput,
        hitDice,
        hp,
        initBonus,
        inspiration,
        level,
        onlineReconnectState,
        openTimerModal,
        renderAcBreakdown,
        renderAcTemporaryControls,
        renderTimerList,
        renderUsageDots,
        renderVitalityBar,
        requestInitiativeRoll,
        retryRoomConnection,
        setCombatDashboardView,
        setConditions,
        setConditionsManagerOpen,
        setGuidance,
        setHitDice,
        setHp,
        setInitBonus,
        setInspiration
      } = model;
      return /*#__PURE__*/React.createElement("div", {
        "data-tab": "combat",
        className: "combat-dashboard tab-section space-y-5"
      }, /*#__PURE__*/React.createElement("nav", {
        className: "combat-dashboard-tabs",
        "aria-label": "Secciones de combate"
      }, [['summary', 'Resumen'], ['conditions', 'Condiciones'], ['timers', 'Temporizadores']].map(([section, label]) => /*#__PURE__*/React.createElement("button", {
        key: section,
        type: "button",
        onClick: () => setCombatDashboardView(section),
        className: `combat-dashboard-tab ${combatDashboardView === section ? 'is-active' : ''}`,
        "aria-pressed": combatDashboardView === section
      }, /*#__PURE__*/React.createElement(CombatSectionIcon, {
        section: section
      }), /*#__PURE__*/React.createElement("span", null, label)))), activeConcentration && /*#__PURE__*/React.createElement("section", {
        className: "concentration-banner",
        role: "status"
      }, /*#__PURE__*/React.createElement("span", {
        className: "concentration-banner-sigil",
        "aria-hidden": "true"
      }, "C"), /*#__PURE__*/React.createElement("div", {
        className: "min-w-0 flex-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "concentration-banner-kicker"
      }, "Concentración activa"), /*#__PURE__*/React.createElement("strong", null, activeConcentration.spellName), /*#__PURE__*/React.createElement("small", null, "Desde ", new Date(activeConcentration.startedAt).toLocaleString('es-ES', {
        dateStyle: 'short',
        timeStyle: 'short'
      }))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: finishConcentration
      }, "Finalizar concentración")), combatDashboardView === 'summary' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "combat-summary-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "combat-health-card col-span-2 rpg-panel p-3 flex flex-col justify-center relative overflow-hidden"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-end mb-1 z-10"
      }, /*#__PURE__*/React.createElement("span", {
        className: "font-fantasy text-red-400 text-[10px] md:text-sm font-bold uppercase tracking-widest"
      }, "Salud"), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center space-x-1 font-sans"
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        placeholder: "0",
        value: hp.current,
        onChange: e => setHp(p => ({
          ...p,
          current: handleNumInput(e.target.value)
        })),
        className: "w-12 bg-transparent text-right text-2xl font-bold text-white outline-none"
      }), /*#__PURE__*/React.createElement("span", {
        className: "text-gray-500 text-lg"
      }, "/"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        placeholder: "0",
        value: hp.max,
        onChange: e => setHp(p => ({
          ...p,
          max: handleNumInput(e.target.value)
        })),
        className: "w-10 bg-transparent text-left text-lg text-gray-400 outline-none border-b border-transparent hover:border-gray-600 focus:border-red-500"
      }))), renderVitalityBar(true, 'mt-1'), /*#__PURE__*/React.createElement("div", {
        className: "mt-2 flex items-center justify-between z-10"
      }, /*#__PURE__*/React.createElement("span", {
        className: "font-fantasy text-cyan-400 text-[10px] font-bold tracking-widest uppercase"
      }, "Vida Temporal"), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center bg-gray-900/80 rounded-full border border-cyan-800/50 px-2 py-0.5"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setHp(p => ({
          ...p,
          temp: String(Math.max(0, (Number(p.temp) || 0) - 1))
        })),
        className: "text-gray-500 hover:text-cyan-400 px-1"
      }, "-"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        value: hp.temp || "",
        placeholder: "0",
        onChange: e => setHp(p => ({
          ...p,
          temp: handleNumInput(e.target.value)
        })),
        className: "w-8 bg-transparent text-center text-sm font-bold text-cyan-300 outline-none"
      }), /*#__PURE__*/React.createElement("button", {
        onClick: () => setHp(p => ({
          ...p,
          temp: String((Number(p.temp) || 0) + 1)
        })),
        className: "text-gray-500 hover:text-cyan-400 px-1"
      }, "+")))), /*#__PURE__*/React.createElement("section", {
        className: "combat-hit-dice-card combat-stat-card rpg-panel"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        className: "combat-stat-emblem is-die",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("b", null, hitDice.type || 'd?')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Recuperación"), /*#__PURE__*/React.createElement("h3", null, "Dados de golpe"))), /*#__PURE__*/React.createElement("div", {
        className: "combat-hit-dice-uses"
      }, renderUsageDots(hitDice.current, level, 'text-cyan-400')), /*#__PURE__*/React.createElement("div", {
        className: "combat-stat-counter"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        "aria-label": "Gastar un dado de golpe",
        onClick: () => setHitDice(p => ({
          ...p,
          current: String(Math.max(0, (Number(p.current) || 0) - 1))
        }))
      }, "−"), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("small", null, "Disponibles"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("input", {
        "aria-label": "Dados de golpe actuales",
        type: "number",
        placeholder: "0",
        value: hitDice.current,
        onChange: e => setHitDice(p => ({
          ...p,
          current: handleNumInput(e.target.value)
        }))
      }), /*#__PURE__*/React.createElement("i", null, "/"), /*#__PURE__*/React.createElement("b", null, Number(level) || 0))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        "aria-label": "Recuperar un dado de golpe",
        onClick: () => setHitDice(p => ({
          ...p,
          current: String(Math.min(Number(level) || 0, (Number(p.current) || 0) + 1))
        }))
      }, "+")), /*#__PURE__*/React.createElement("label", {
        className: "combat-hit-die-type"
      }, /*#__PURE__*/React.createElement("span", null, "Tipo de dado"), /*#__PURE__*/React.createElement("input", {
        "aria-label": "Tipo de dado de golpe",
        type: "text",
        placeholder: "d8",
        title: "Ej: d8",
        value: hitDice.type,
        onChange: e => setHitDice(p => ({
          ...p,
          type: e.target.value
        }))
      }))), /*#__PURE__*/React.createElement("section", {
        className: "combat-ac-card combat-stat-card rpg-panel"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        className: "combat-stat-emblem is-shield",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement(CombatSectionIcon, {
        section: "summary"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Defensa total"), /*#__PURE__*/React.createElement("h3", null, "Clase de armadura"))), /*#__PURE__*/React.createElement("div", {
        className: "combat-ac-value"
      }, /*#__PURE__*/React.createElement("small", null, "CA final"), /*#__PURE__*/React.createElement("strong", null, calculateAC()), /*#__PURE__*/React.createElement("i", null)), renderAcTemporaryControls(), renderAcBreakdown()), /*#__PURE__*/React.createElement("div", {
        className: "combat-initiative-stack"
      }, /*#__PURE__*/React.createElement("section", {
        className: "combat-quick-stat is-initiative rpg-panel"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "↯"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Orden de turno"), /*#__PURE__*/React.createElement("h3", null, "Iniciativa"))), /*#__PURE__*/React.createElement("div", {
        className: "combat-quick-stat-value"
      }, /*#__PURE__*/React.createElement("strong", null, formatMod(getModNum(getEffectiveStat('des')) + (Number(initBonus) || 0))), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Bono adicional"), /*#__PURE__*/React.createElement("input", {
        "aria-label": "Bono adicional de iniciativa",
        type: "number",
        value: initBonus,
        onChange: e => setInitBonus(handleNumInput(e.target.value))
      }))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "sheet-roll-trigger is-initiative",
        onClick: requestInitiativeRoll
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "20"), "Tirar iniciativa")), /*#__PURE__*/React.createElement("section", {
        className: "combat-quick-stat is-perception rpg-panel"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "◉"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Atención constante"), /*#__PURE__*/React.createElement("h3", null, "Percepción pasiva"))), /*#__PURE__*/React.createElement("div", {
        className: "combat-quick-stat-value"
      }, /*#__PURE__*/React.createElement("strong", null, getPassivePerception()), /*#__PURE__*/React.createElement("p", null, "10 + Sabiduría + competencia")))), /*#__PURE__*/React.createElement("section", {
        className: `combat-inspiration-card combat-support-card combat-stat-card rpg-panel ${inspiration ? 'is-active' : ''} ${guidance ? 'is-guided' : ''}`
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        className: "combat-stat-emblem is-inspiration",
        "aria-hidden": "true"
      }, "✦"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Efectos disponibles"), /*#__PURE__*/React.createElement("h3", null, "Ayudas de tirada"))), /*#__PURE__*/React.createElement("div", {
        className: "combat-support-options"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setInspiration(!inspiration),
        className: `combat-inspiration-toggle ${inspiration ? 'is-active' : ''}`,
        title: "Gástala antes de tirar para obtener ventaja en un ataque, prueba o salvación.",
        "aria-label": `Inspiración ${inspiration ? 'disponible' : 'gastada'}.`
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "currentColor",
        viewBox: "0 0 24 24"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"
      }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Ventaja narrativa"), /*#__PURE__*/React.createElement("strong", null, inspiration ? 'Inspiración disponible' : 'Marcar inspiración')), /*#__PURE__*/React.createElement("b", null, inspiration ? '✓' : '+')), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setGuidance(!guidance),
        className: `combat-inspiration-toggle combat-guidance-toggle ${guidance ? 'is-active' : ''}`,
        title: "Guía añade 1d4 a una prueba de característica.",
        "aria-label": `Guía ${guidance ? 'activa' : 'inactiva'}.`
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("strong", null, "1d4")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Apoyo mágico"), /*#__PURE__*/React.createElement("strong", null, guidance ? 'Guía activa' : 'Marcar Guía')), /*#__PURE__*/React.createElement("b", null, guidance ? '✓' : '+'))), /*#__PURE__*/React.createElement("p", {
        className: "combat-inspiration-help"
      }, "Al tirar, la ficha te preguntará si quieres aplicar cada ayuda compatible.")))), combatDashboardView === 'conditions' && /*#__PURE__*/React.createElement("div", {
        className: "combat-conditions-panel rpg-panel"
      }, /*#__PURE__*/React.createElement("header", {
        className: "combat-tracker-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "combat-tracker-heading"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "✷"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Estado del personaje"), /*#__PURE__*/React.createElement("h2", null, "Condiciones"), /*#__PURE__*/React.createElement("p", null, "Registra recordatorios sin aplicar efectos automáticos."))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setConditionsManagerOpen(value => !value),
        className: conditionsManagerOpen ? 'is-active' : ''
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, conditionsManagerOpen ? '✓' : '+'), conditionsManagerOpen ? 'Terminar' : 'Editar condiciones')), /*#__PURE__*/React.createElement("div", {
        className: "combat-conditions-body"
      }, conditions.length ? /*#__PURE__*/React.createElement("div", {
        className: "combat-condition-active-grid"
      }, conditions.map(condition => /*#__PURE__*/React.createElement("button", {
        key: condition,
        onClick: () => setConditions(previous => previous.filter(item => item !== condition)),
        className: "combat-condition-active"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, conditionSymbols[condition] || '✷'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Condición activa"), /*#__PURE__*/React.createElement("strong", null, condition)), /*#__PURE__*/React.createElement("i", {
        "aria-hidden": "true"
      }, "×")))) : /*#__PURE__*/React.createElement("div", {
        className: "combat-tracker-empty is-condition"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "◇"), /*#__PURE__*/React.createElement("strong", null, "Sin condiciones activas"), /*#__PURE__*/React.createElement("p", null, "El personaje no tiene ningún estado adverso registrado.")), conditionsManagerOpen && /*#__PURE__*/React.createElement("section", {
        className: "combat-condition-manager"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Selector de estados"), /*#__PURE__*/React.createElement("h3", null, "Marca las condiciones activas")), /*#__PURE__*/React.createElement("span", null, conditions.length, " activa", conditions.length === 1 ? '' : 's')), /*#__PURE__*/React.createElement("div", null, combatConditions.map(condition => {
        const active = conditions.includes(condition);
        return /*#__PURE__*/React.createElement("button", {
          type: "button",
          key: condition,
          "aria-pressed": active,
          onClick: () => setConditions(previous => active ? previous.filter(item => item !== condition) : [...previous, condition]),
          className: active ? 'is-active' : ''
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, conditionSymbols[condition] || '✷'), /*#__PURE__*/React.createElement("strong", null, condition), /*#__PURE__*/React.createElement("i", {
          "aria-hidden": "true"
        }, active ? '✓' : '+'));
      }))))), combatDashboardView === 'timers' && /*#__PURE__*/React.createElement("div", {
        className: "combat-timers-panel rpg-panel"
      }, /*#__PURE__*/React.createElement("header", {
        className: "combat-tracker-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "combat-tracker-heading"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "⌛"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Seguimiento de duración"), /*#__PURE__*/React.createElement("h2", null, "Temporizadores"), /*#__PURE__*/React.createElement("p", null, "Controla efectos por turnos, rondas o tiempo real."))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => openTimerModal()
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "+"), "Nuevo temporizador")), /*#__PURE__*/React.createElement("div", {
        className: "combat-timers-body"
      }, renderTimerList(true))), onlineReconnectState.message && /*#__PURE__*/React.createElement("div", {
        className: `flex flex-wrap items-center justify-between gap-3 rounded border px-3 py-2 text-sm ${onlineReconnectState.status === 'error' ? 'border-yellow-800 bg-yellow-950/30 text-yellow-100' : 'border-cyan-800 bg-cyan-950/25 text-cyan-100'}`
      }, /*#__PURE__*/React.createElement("span", null, onlineReconnectState.message), onlineReconnectState.status === 'error' && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: retryRoomConnection,
        className: "min-h-9 px-3 rounded border border-cyan-700 text-xs text-cyan-100"
      }, "Reintentar conexión")));
    }
    window.DndCombatDashboardComponents = {
      CombatDashboard
    };
  })();
})();