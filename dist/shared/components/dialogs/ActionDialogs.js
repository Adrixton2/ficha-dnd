(() => {
  (() => {
    function ActionDialogs({
      model
    }) {
      const {
        bestiary,
        bestiaryEnemyDraft,
        bestiaryEnemyQuery,
        bestiaryEnemySelectorOpen,
        bestiaryEnemyTag,
        castSpell,
        castWithSlot,
        closeConfirm,
        confirmDelete,
        confirmDialog,
        createEnemyFromBestiaryDraft,
        creatingEnemy,
        editingSlotLevel,
        enemySourceChoiceOpen,
        formatSheetRollFormula,
        getSpellResolution,
        getSrdSpellDiceDetails,
        grimoireConfig,
        notesModalOpen,
        openBestiaryEnemyDraft,
        openDirectEnemyModal,
        resolveSpellCastDice,
        sessionNotes,
        setBestiaryCompendiumOpen,
        setBestiaryCompendiumPreview,
        setBestiaryEnemyDraft,
        setBestiaryEnemyQuery,
        setBestiaryEnemySelectorOpen,
        setBestiaryEnemyTag,
        setCastSpell,
        setEditingSlotLevel,
        setEnemySourceChoiceOpen,
        setNotesModalOpen,
        setSessionNotes,
        setSpellCastAnimation,
        setSpellSlots,
        spellCastAnimation,
        spellSaveDc,
        spellSlots,
        srdMonsterCompendium,
        updateBestiaryEnemyCopies
      } = model;
      return /*#__PURE__*/React.createElement(React.Fragment, null, castSpell && /*#__PURE__*/React.createElement("div", {
        className: "cast-spell-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4",
        onClick: () => setCastSpell(null)
      }, /*#__PURE__*/React.createElement("div", {
        className: "cast-spell-dialog rpg-panel p-5 max-w-md w-full",
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("div", {
        className: "cast-spell-title"
      }, /*#__PURE__*/React.createElement("span", null, castSpell.level === 0 ? 'T' : castSpell.level, /*#__PURE__*/React.createElement("small", null, castSpell.level === 0 ? 'Truco' : 'Nivel')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Preparar lanzamiento"), /*#__PURE__*/React.createElement("h3", null, castSpell.name), /*#__PURE__*/React.createElement("p", null, castSpell.concentration ? 'Requiere concentración' : 'Selecciona el recurso que quieres consumir')), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setCastSpell(null),
        "aria-label": "Cerrar"
      }, "×")), (() => {
        const resolution = getSpellResolution(castSpell);
        const diceDetails = getSrdSpellDiceDetails(castSpell);
        return Boolean(resolution.usesSpellAttack || resolution.savingAbility || diceDetails.length) && /*#__PURE__*/React.createElement("div", {
          className: "mt-3 flex flex-wrap gap-2 text-xs"
        }, /*#__PURE__*/React.createElement("span", {
          className: "rounded border border-purple-700 bg-purple-950/20 px-2 py-1 text-purple-100"
        }, "La tirada opcional aparecerá después del lanzamiento y se ajustará a la ranura elegida."), resolution.savingAbility && /*#__PURE__*/React.createElement("span", {
          className: "rounded border border-cyan-700 bg-cyan-950/20 px-2 py-1 text-cyan-100"
        }, "Salvación de ", resolution.savingAbility, spellSaveDc === null ? '' : ` · CD ${spellSaveDc}`));
      })(), castSpell.castingResource === 'independent' ? /*#__PURE__*/React.createElement("div", {
        className: "cast-resource-panel"
      }, /*#__PURE__*/React.createElement("span", null, "Usos propios"), /*#__PURE__*/React.createElement("strong", null, castSpell.ownUsesCurrent, /*#__PURE__*/React.createElement("small", null, "/ ", castSpell.ownUsesMax)), /*#__PURE__*/React.createElement("p", null, "No consume ranuras de conjuro."), /*#__PURE__*/React.createElement("button", {
        disabled: Number(castSpell.ownUsesCurrent) <= 0,
        onClick: () => castWithSlot(0),
        className: "cast-confirm-button"
      }, "Usar conjuro")) : castSpell.castingResource === 'at-will' || castSpell.level === 0 ? /*#__PURE__*/React.createElement("div", {
        className: "cast-resource-panel"
      }, /*#__PURE__*/React.createElement("span", null, "Lanzamiento a voluntad"), /*#__PURE__*/React.createElement("strong", null, "∞"), /*#__PURE__*/React.createElement("p", null, "No consume ranuras de conjuro."), /*#__PURE__*/React.createElement("button", {
        onClick: () => castWithSlot(0),
        className: "cast-confirm-button"
      }, "Lanzar ahora")) : /*#__PURE__*/React.createElement("div", {
        className: "cast-slot-picker"
      }, /*#__PURE__*/React.createElement("div", {
        className: "cast-slot-picker-heading"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Recurso de lanzamiento"), /*#__PURE__*/React.createElement("strong", null, "Elige una ranura")), /*#__PURE__*/React.createElement("small", null, "Nivel mínimo ", castSpell.level)), [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(level => level >= castSpell.level && Number(spellSlots[level].current) > 0).map(level => /*#__PURE__*/React.createElement("button", {
        key: level,
        onClick: () => castWithSlot(level),
        className: "cast-slot-option"
      }, /*#__PURE__*/React.createElement("span", null, level, /*#__PURE__*/React.createElement("small", null, "Nivel")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Ranura arcana"), /*#__PURE__*/React.createElement("small", null, level === castSpell.level ? 'Potencia base' : `Potenciada +${level - castSpell.level}`)), /*#__PURE__*/React.createElement("div", {
        className: "cast-slot-status"
      }, /*#__PURE__*/React.createElement("span", null, Array.from({
        length: Math.max(0, Number(spellSlots[level].max) || 0)
      }, (_, index) => /*#__PURE__*/React.createElement("i", {
        key: index,
        className: index < Number(spellSlots[level].current) ? 'is-filled' : ''
      }))), /*#__PURE__*/React.createElement("small", null, spellSlots[level].current, " disponibles")))), grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.current) > 0 && Number(grimoireConfig.pactSlots.level) >= castSpell.level && /*#__PURE__*/React.createElement("button", {
        onClick: () => castWithSlot(grimoireConfig.pactSlots.level, true),
        className: "cast-slot-option is-pact"
      }, /*#__PURE__*/React.createElement("span", null, grimoireConfig.pactSlots.level, /*#__PURE__*/React.createElement("small", null, "Pacto")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Magia de pacto"), /*#__PURE__*/React.createElement("small", null, "Recuperación corta")), /*#__PURE__*/React.createElement("div", {
        className: "cast-slot-status"
      }, /*#__PURE__*/React.createElement("span", null, Array.from({
        length: Math.max(0, Number(grimoireConfig.pactSlots.max) || 0)
      }, (_, index) => /*#__PURE__*/React.createElement("i", {
        key: index,
        className: index < Number(grimoireConfig.pactSlots.current) ? 'is-filled' : ''
      }))), /*#__PURE__*/React.createElement("small", null, grimoireConfig.pactSlots.current, " disponibles"))), /*#__PURE__*/React.createElement("button", {
        onClick: () => setCastSpell(null),
        className: "cast-cancel-button"
      }, "Cancelar lanzamiento")))), spellCastAnimation && (() => {
        const {
          spell,
          slotLevel,
          pact,
          schoolText,
          schoolKey,
          rollPlan
        } = spellCastAnimation;
        const components = [spell.compV && 'V', spell.compS && 'S', spell.compM && 'M'].filter(Boolean);
        const resourceLabel = spell.castingResource === 'independent' ? 'Uso propio consumido' : spell.castingResource === 'at-will' || Number(spell.level) === 0 ? 'Lanzamiento a voluntad' : pact ? `Ranura de pacto · nivel ${slotLevel}` : `Ranura arcana · nivel ${slotLevel}`;
        return /*#__PURE__*/React.createElement("div", {
          className: "spell-cast-ceremony",
          "data-school": schoolKey,
          role: "dialog",
          "aria-modal": "true",
          "aria-label": `Lanzando ${spell.name}`,
          onClick: () => setSpellCastAnimation(null)
        }, /*#__PURE__*/React.createElement("div", {
          className: "spell-cast-particles",
          "aria-hidden": "true"
        }, Array.from({
          length: 14
        }, (_, index) => /*#__PURE__*/React.createElement("i", {
          key: index
        }))), /*#__PURE__*/React.createElement("div", {
          className: "spell-cast-stage",
          onClick: event => event.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          className: "spell-cast-sigil",
          "aria-hidden": "true"
        }, /*#__PURE__*/React.createElement("i", {
          className: "ring-one"
        }), /*#__PURE__*/React.createElement("i", {
          className: "ring-two"
        }), /*#__PURE__*/React.createElement("i", {
          className: "ring-three"
        }), /*#__PURE__*/React.createElement("span", null, schoolText.trim().slice(0, 1).toLocaleUpperCase('es'))), /*#__PURE__*/React.createElement("div", {
          className: "spell-cast-copy"
        }, /*#__PURE__*/React.createElement("small", null, schoolText), /*#__PURE__*/React.createElement("h2", null, spell.name), /*#__PURE__*/React.createElement("p", null, Number(spell.level) === 0 ? 'Truco' : `Conjuro de nivel ${spell.level}`, slotLevel > Number(spell.level) ? ` · Potenciado a nivel ${slotLevel}` : '')), /*#__PURE__*/React.createElement("div", {
          className: "spell-cast-details"
        }, /*#__PURE__*/React.createElement("span", {
          className: "spell-cast-resource"
        }, resourceLabel), components.length > 0 && /*#__PURE__*/React.createElement("span", {
          className: "spell-cast-components"
        }, components.map(component => /*#__PURE__*/React.createElement("i", {
          key: component
        }, component))), spell.concentration && /*#__PURE__*/React.createElement("span", {
          className: "spell-cast-concentration"
        }, "Concentración activa")), /*#__PURE__*/React.createElement("div", {
          className: "spell-cast-progress",
          "aria-hidden": "true"
        }, /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("div", {
          className: "spell-cast-phase",
          "aria-hidden": "true"
        }, /*#__PURE__*/React.createElement("span", null, "Canalizando poder"), /*#__PURE__*/React.createElement("strong", null, "Conjuro lanzado")), /*#__PURE__*/React.createElement("div", {
          className: "spell-cast-actions"
        }, rollPlan?.canRoll && /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "is-roll",
          onClick: () => resolveSpellCastDice(spellCastAnimation)
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "✦"), rollPlan.usesSpellAttack && rollPlan.attackCount > 1 ? `Resolver ${rollPlan.attackCount} ataques` : `Tirar ${formatSheetRollFormula(rollPlan.formula, rollPlan.modifiers)}`), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setSpellCastAnimation(null)
        }, rollPlan?.canRoll ? 'Continuar sin tirar' : 'Continuar'))));
      })(), editingSlotLevel && (() => {
        const slot = spellSlots[editingSlotLevel] || {
          current: 0,
          max: 0
        };
        const maximum = Math.max(0, Number(slot.max) || 0);
        const available = Math.max(0, Math.min(maximum, Number(slot.current) || 0));
        const updateSlot = (nextCurrent, nextMaximum = maximum) => setSpellSlots(previous => ({
          ...previous,
          [editingSlotLevel]: {
            ...previous[editingSlotLevel],
            max: Math.max(0, nextMaximum),
            current: Math.max(0, Math.min(Math.max(0, nextMaximum), nextCurrent))
          }
        }));
        return /*#__PURE__*/React.createElement("div", {
          className: "slot-editor-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4",
          onClick: () => setEditingSlotLevel(null)
        }, /*#__PURE__*/React.createElement("div", {
          className: "slot-editor-dialog rpg-panel w-full max-w-sm",
          onClick: event => event.stopPropagation()
        }, /*#__PURE__*/React.createElement("header", {
          className: "slot-editor-heading"
        }, /*#__PURE__*/React.createElement("span", null, editingSlotLevel, /*#__PURE__*/React.createElement("small", null, "Nivel")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Gestión de ranuras"), /*#__PURE__*/React.createElement("h3", null, "Magia de nivel ", editingSlotLevel)), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setEditingSlotLevel(null),
          "aria-label": "Cerrar"
        }, "×")), /*#__PURE__*/React.createElement("section", {
          className: "slot-editor-body"
        }, /*#__PURE__*/React.createElement("div", {
          className: "slot-editor-summary"
        }, /*#__PURE__*/React.createElement("span", null, "Ranuras disponibles"), /*#__PURE__*/React.createElement("strong", null, available, /*#__PURE__*/React.createElement("small", null, " de ", maximum)), /*#__PURE__*/React.createElement("p", null, maximum ? `${maximum - available} ${maximum - available === 1 ? 'ranura gastada' : 'ranuras gastadas'}` : 'Este nivel todavía no tiene ranuras.')), /*#__PURE__*/React.createElement("div", {
          className: "slot-editor-diamonds",
          "aria-label": `${available} de ${maximum} ranuras disponibles`
        }, Array.from({
          length: maximum
        }, (_, index) => /*#__PURE__*/React.createElement("button", {
          type: "button",
          key: index,
          className: index < available ? 'is-filled' : '',
          onClick: () => updateSlot(index < available ? index : index + 1),
          "aria-label": `Dejar ${index + 1} ranuras disponibles`
        }, /*#__PURE__*/React.createElement("i", null))), !maximum && /*#__PURE__*/React.createElement("span", null, "Define un máximo para comenzar")), /*#__PURE__*/React.createElement("div", {
          className: "slot-editor-actions"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: !available,
          onClick: () => updateSlot(available - 1)
        }, /*#__PURE__*/React.createElement("b", null, "−"), /*#__PURE__*/React.createElement("span", null, "Gastar una")), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: available >= maximum,
          onClick: () => updateSlot(available + 1)
        }, /*#__PURE__*/React.createElement("b", null, "+"), /*#__PURE__*/React.createElement("span", null, "Recuperar una"))), /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "slot-editor-restore",
          disabled: !maximum || available === maximum,
          onClick: () => updateSlot(maximum)
        }, "Restaurar todas las ranuras"), /*#__PURE__*/React.createElement("div", {
          className: "slot-editor-maximum"
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Máximo de ranuras"), /*#__PURE__*/React.createElement("small", null, "Cámbialo solo si tu progresión lo requiere.")), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: !maximum,
          onClick: () => updateSlot(Math.min(available, maximum - 1), maximum - 1)
        }, "−"), /*#__PURE__*/React.createElement("strong", null, maximum), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => updateSlot(available, maximum + 1)
        }, "+"))), /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "slot-editor-done",
          onClick: () => setEditingSlotLevel(null)
        }, "Guardar y cerrar")));
      })(), notesModalOpen && /*#__PURE__*/React.createElement("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4",
        onClick: () => setNotesModalOpen(false)
      }, /*#__PURE__*/React.createElement("div", {
        className: "rpg-panel p-6 max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl animate-attack border border-purple-500/50",
        onClick: e => e.stopPropagation()
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center mb-6 border-b border-gray-700 pb-4"
      }, /*#__PURE__*/React.createElement("h3", {
        className: "text-2xl font-fantasy font-bold text-purple-200 flex items-center tracking-widest"
      }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 mr-3 text-purple-500",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: "2"
      }, /*#__PURE__*/React.createElement("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      })), " Diario de Campaña"), /*#__PURE__*/React.createElement("div", {
        className: "flex space-x-4 items-center"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setSessionNotes([{
          id: 'note_' + Date.now(),
          date: new Date().toLocaleDateString(),
          text: ""
        }, ...sessionNotes]),
        className: "px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded font-bold shadow-md transition-colors font-fantasy uppercase tracking-wider text-xs border border-purple-500"
      }, "+ Nueva Entrada"), /*#__PURE__*/React.createElement("button", {
        onClick: () => setNotesModalOpen(false),
        className: "text-gray-400 hover:text-white text-3xl leading-none transition-colors"
      }, "×"))), /*#__PURE__*/React.createElement("div", {
        className: "flex-1 overflow-y-auto space-y-6 pr-2"
      }, sessionNotes.map(note => /*#__PURE__*/React.createElement("div", {
        key: note.id,
        className: "bg-gray-900/60 p-5 rounded-lg border border-gray-700 relative group shadow-inner"
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Ej: Sesión 1",
        value: note.date,
        onChange: e => setSessionNotes(sessionNotes.map(n => n.id === note.id ? {
          ...n,
          date: e.target.value
        } : n)),
        className: "bg-transparent border-b border-gray-600 text-purple-300 font-bold mb-4 outline-none focus:border-purple-400 w-1/2 font-fantasy tracking-wider"
      }), /*#__PURE__*/React.createElement("textarea", {
        value: note.text,
        onChange: e => setSessionNotes(sessionNotes.map(n => n.id === note.id ? {
          ...n,
          text: e.target.value
        } : n)),
        placeholder: "Ej: PNJs, botín y sucesos...",
        className: "w-full bg-gray-950 border border-gray-800 rounded p-4 text-gray-300 text-sm outline-none focus:border-purple-500 min-h-[200px] resize-y leading-relaxed"
      }), /*#__PURE__*/React.createElement("button", {
        onClick: () => confirmDelete(`¿Borrar las notas de la sesión "${note.date}"?`, () => setSessionNotes(sessionNotes.filter(n => n.id !== note.id))),
        className: "absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 font-bold transition-opacity text-xl"
      }, "×"))), sessionNotes.length === 0 && /*#__PURE__*/React.createElement("div", {
        className: "text-center text-gray-600 italic mt-10 font-fantasy text-lg tracking-widest uppercase"
      }, "El diario está vacío.")))), enemySourceChoiceOpen && /*#__PURE__*/React.createElement("div", {
        className: "enemy-source-overlay",
        onClick: () => setEnemySourceChoiceOpen(false)
      }, /*#__PURE__*/React.createElement("article", {
        className: "enemy-source-dialog",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "enemy-source-title",
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "♞"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Preparación del encuentro"), /*#__PURE__*/React.createElement("h3", {
        id: "enemy-source-title"
      }, "Añadir enemigos"), /*#__PURE__*/React.createElement("p", null, "Elige de dónde quieres obtener la criatura.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setEnemySourceChoiceOpen(false),
        "aria-label": "Cerrar"
      }, "×")), /*#__PURE__*/React.createElement("div", {
        className: "enemy-source-options"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-compendium",
        onClick: () => {
          setEnemySourceChoiceOpen(false);
          setBestiaryCompendiumPreview(null);
          setBestiaryCompendiumOpen(true);
        }
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "◈"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Biblioteca oficial"), /*#__PURE__*/React.createElement("strong", null, "Compendio de criaturas"), /*#__PURE__*/React.createElement("em", null, "Elige entre ", srdMonsterCompendium.monsters.length, " criaturas SRD y añádela directamente.")), /*#__PURE__*/React.createElement("b", null, "Explorar →")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-bestiary",
        onClick: () => {
          setEnemySourceChoiceOpen(false);
          setBestiaryEnemyQuery('');
          setBestiaryEnemyTag('');
          setBestiaryEnemySelectorOpen(true);
        }
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "♜"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Tu colección"), /*#__PURE__*/React.createElement("strong", null, "Bestiario personal"), /*#__PURE__*/React.createElement("em", null, bestiary.monsters.length ? `${bestiary.monsters.length} plantillas guardadas y personalizadas.` : 'Todavía no tienes plantillas guardadas.')), /*#__PURE__*/React.createElement("b", null, "Abrir →")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-manual",
        onClick: openDirectEnemyModal
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "＋"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Creación rápida"), /*#__PURE__*/React.createElement("strong", null, "Enemigo puntual"), /*#__PURE__*/React.createElement("em", null, "Introduce solo los datos necesarios para esta escena.")), /*#__PURE__*/React.createElement("b", null, "Crear →"))), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("p", null, "Las criaturas del compendio no se guardan en tu bestiario salvo que tú lo decidas."), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setEnemySourceChoiceOpen(false)
      }, "Cancelar")))), bestiaryEnemySelectorOpen && (() => {
        const tags = [...new Set(bestiary.monsters.flatMap(monster => monster.tags))].sort();
        const query = bestiaryEnemyQuery.trim().toLocaleLowerCase('es');
        const monsters = bestiary.monsters.filter(monster => (!query || monster.name.toLocaleLowerCase('es').includes(query) || monster.tags.some(tag => tag.toLocaleLowerCase('es').includes(query))) && (!bestiaryEnemyTag || monster.tags.includes(bestiaryEnemyTag)));
        return /*#__PURE__*/React.createElement("div", {
          className: "enemy-library-overlay",
          onClick: () => setBestiaryEnemySelectorOpen(false)
        }, /*#__PURE__*/React.createElement("article", {
          className: "enemy-library-dialog",
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "enemy-library-title",
          onClick: event => event.stopPropagation()
        }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "♜"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Tu colección · ", bestiary.monsters.length, " plantillas"), /*#__PURE__*/React.createElement("h3", {
          id: "enemy-library-title"
        }, "Bestiario personal"), /*#__PURE__*/React.createElement("p", null, "Selecciona una plantilla y configura después sus copias e iniciativas.")), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setBestiaryEnemySelectorOpen(false),
          "aria-label": "Cerrar"
        }, "×")), /*#__PURE__*/React.createElement("div", {
          className: "enemy-library-filters"
        }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "⌕"), /*#__PURE__*/React.createElement("input", {
          autoFocus: true,
          value: bestiaryEnemyQuery,
          onChange: event => setBestiaryEnemyQuery(event.target.value),
          placeholder: "Buscar por nombre o etiqueta…"
        })), /*#__PURE__*/React.createElement("select", {
          value: bestiaryEnemyTag,
          onChange: event => setBestiaryEnemyTag(event.target.value)
        }, /*#__PURE__*/React.createElement("option", {
          value: ""
        }, "Todas las etiquetas"), tags.map(tag => /*#__PURE__*/React.createElement("option", {
          key: tag,
          value: tag
        }, tag)))), /*#__PURE__*/React.createElement("div", {
          className: "enemy-library-results"
        }, monsters.map(monster => /*#__PURE__*/React.createElement("button", {
          key: monster.id,
          type: "button",
          onClick: () => openBestiaryEnemyDraft(monster)
        }, /*#__PURE__*/React.createElement("span", {
          className: "enemy-library-results__avatar"
        }, monster.avatarDataUrl ? /*#__PURE__*/React.createElement("img", {
          src: monster.avatarDataUrl,
          alt: ""
        }) : monster.name.slice(0, 1).toUpperCase()), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, monster.tags?.slice(0, 2).join(' · ') || 'Criatura personalizada'), /*#__PURE__*/React.createElement("strong", null, monster.name), /*#__PURE__*/React.createElement("em", null, "PV ", monster.maxHp, " · CA ", monster.armorClass ?? '—')), /*#__PURE__*/React.createElement("b", null, "Preparar →"))), !monsters.length && /*#__PURE__*/React.createElement("div", {
          className: "enemy-library-empty"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "◇"), /*#__PURE__*/React.createElement("strong", null, bestiary.monsters.length ? 'Sin coincidencias' : 'Tu bestiario está vacío'), /*#__PURE__*/React.createElement("p", null, bestiary.monsters.length ? 'Prueba con otro nombre o etiqueta.' : 'Puedes usar el Compendio SRD o crear un enemigo puntual.'), !bestiary.monsters.length && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => {
            setBestiaryEnemySelectorOpen(false);
            setBestiaryCompendiumOpen(true);
          }
        }, "Abrir compendio")))));
      })(), bestiaryEnemyDraft && /*#__PURE__*/React.createElement("div", {
        className: "enemy-template-overlay"
      }, /*#__PURE__*/React.createElement("article", {
        className: "enemy-template-dialog",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "enemy-template-title"
      }, /*#__PURE__*/React.createElement("header", {
        className: "enemy-template-header"
      }, /*#__PURE__*/React.createElement("span", {
        className: "enemy-template-emblem",
        "aria-hidden": "true"
      }, "♞", /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, bestiaryEnemyDraft.sourceLabel || 'Bestiario', " · Incorporación a la mesa"), /*#__PURE__*/React.createElement("h3", {
        id: "enemy-template-title"
      }, "Preparar aparición"), /*#__PURE__*/React.createElement("p", null, "Define cuántas copias entran, cómo se llaman y su posición inicial.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setBestiaryEnemyDraft(null),
        "aria-label": "Cerrar configuración de la aparición"
      }, "×")), /*#__PURE__*/React.createElement("div", {
        className: "enemy-template-summary"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Plantilla"), /*#__PURE__*/React.createElement("strong", null, bestiaryEnemyDraft.name || 'Sin nombre')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Copias"), /*#__PURE__*/React.createElement("strong", null, bestiaryEnemyDraft.quantity || 1)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV por copia"), /*#__PURE__*/React.createElement("strong", null, bestiaryEnemyDraft.maxHp || 0)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Defensa"), /*#__PURE__*/React.createElement("strong", null, "CA ", bestiaryEnemyDraft.armorClass || '—'))), /*#__PURE__*/React.createElement("div", {
        className: "enemy-template-body"
      }, /*#__PURE__*/React.createElement("section", {
        className: "enemy-template-section is-identity"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", null, "1"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Identidad y defensa"), /*#__PURE__*/React.createElement("h4", null, "Datos de la aparición"))), /*#__PURE__*/React.createElement("div", {
        className: "enemy-template-fields is-identity"
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "Nombre base", /*#__PURE__*/React.createElement("input", {
        value: bestiaryEnemyDraft.name,
        onChange: event => setBestiaryEnemyDraft(previous => ({
          ...previous,
          name: event.target.value
        })),
        className: "mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-white"
      })), /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "PV máximos", /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        inputMode: "numeric",
        value: bestiaryEnemyDraft.maxHp,
        onChange: event => setBestiaryEnemyDraft(previous => ({
          ...previous,
          maxHp: event.target.value
        })),
        className: "mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
      })), /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "CA", /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        inputMode: "numeric",
        value: bestiaryEnemyDraft.armorClass,
        onChange: event => setBestiaryEnemyDraft(previous => ({
          ...previous,
          armorClass: event.target.value
        })),
        className: "mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
      }))), /*#__PURE__*/React.createElement("p", {
        className: "enemy-template-hint"
      }, "Cada copia empieza con todos sus PV y sin puntos de golpe temporales.")), /*#__PURE__*/React.createElement("section", {
        className: "enemy-template-section is-copies"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", null, "2"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Composición del grupo"), /*#__PURE__*/React.createElement("h4", null, "Copias y nombres"))), /*#__PURE__*/React.createElement("div", {
        className: "enemy-template-fields"
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "Cantidad", /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "1",
        max: "50",
        inputMode: "numeric",
        value: bestiaryEnemyDraft.quantity,
        onChange: event => updateBestiaryEnemyCopies({
          quantity: event.target.value
        }),
        onBlur: () => {
          if (bestiaryEnemyDraft.quantity === '') updateBestiaryEnemyCopies({
            quantity: 1
          });
        },
        className: "mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
      })), /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "Nombres", /*#__PURE__*/React.createElement("select", {
        value: bestiaryEnemyDraft.nameMode,
        onChange: event => updateBestiaryEnemyCopies({
          nameMode: event.target.value
        }),
        className: "mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-white"
      }, /*#__PURE__*/React.createElement("option", {
        value: "letters"
      }, "Letras"), /*#__PURE__*/React.createElement("option", {
        value: "numbers"
      }, "Números"), /*#__PURE__*/React.createElement("option", {
        value: "manual"
      }, "Manual"), /*#__PURE__*/React.createElement("option", {
        value: "same"
      }, "Mismo nombre")))), /*#__PURE__*/React.createElement("div", {
        className: "enemy-template-copy-list"
      }, bestiaryEnemyDraft.copyNames.map((copyName, index) => /*#__PURE__*/React.createElement("label", {
        key: index
      }, /*#__PURE__*/React.createElement("span", null, index + 1), /*#__PURE__*/React.createElement("input", {
        disabled: bestiaryEnemyDraft.nameMode !== 'manual',
        value: copyName,
        onChange: event => setBestiaryEnemyDraft(previous => ({
          ...previous,
          copyNames: previous.copyNames.map((item, itemIndex) => itemIndex === index ? event.target.value : item)
        })),
        className: "min-h-10 min-w-0 flex-1 rounded border border-gray-700 bg-gray-900 px-3 text-white disabled:cursor-default disabled:opacity-70"
      }))))), /*#__PURE__*/React.createElement("section", {
        className: "enemy-template-section is-initiative"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", null, "3"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Entrada en combate"), /*#__PURE__*/React.createElement("h4", null, "Iniciativas"))), /*#__PURE__*/React.createElement("div", {
        className: "enemy-template-dexterity"
      }, /*#__PURE__*/React.createElement("span", null, "DES"), /*#__PURE__*/React.createElement("strong", null, bestiaryEnemyDraft.dexterity ?? 10), /*#__PURE__*/React.createElement("small", null, "Modificador ", window.DndOnlineTableUtils.formatOnlineModifier(window.DndOnlineTableUtils.calculateAbilityModifier(bestiaryEnemyDraft.dexterity ?? 10)))), /*#__PURE__*/React.createElement("label", {
        className: "enemy-template-mode"
      }, "Modo de iniciativa", /*#__PURE__*/React.createElement("select", {
        value: bestiaryEnemyDraft.initiativeMode,
        onChange: event => setBestiaryEnemyDraft(previous => ({
          ...previous,
          initiativeMode: event.target.value
        })),
        className: "mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-white"
      }, /*#__PURE__*/React.createElement("option", {
        value: "none"
      }, "Tirar después en Preparar encuentro"), /*#__PURE__*/React.createElement("option", {
        value: "same"
      }, "Introducir una iniciativa manual"), Number(bestiaryEnemyDraft.quantity) > 1 && /*#__PURE__*/React.createElement("option", {
        value: "manual"
      }, "Manual por copia"))), bestiaryEnemyDraft.initiativeMode === 'same' && /*#__PURE__*/React.createElement("div", {
        className: "enemy-template-single-initiative"
      }, /*#__PURE__*/React.createElement("label", null, "Iniciativa", /*#__PURE__*/React.createElement("input", {
        type: "number",
        inputMode: "numeric",
        value: bestiaryEnemyDraft.initiative,
        onChange: event => setBestiaryEnemyDraft(previous => ({
          ...previous,
          initiative: event.target.value,
          copyInitiatives: previous.copyInitiatives.map(() => event.target.value)
        })),
        placeholder: "Ej. 14",
        className: "mt-1 min-h-11 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
      }))), Number(bestiaryEnemyDraft.quantity) > 1 && bestiaryEnemyDraft.initiativeMode === 'manual' && /*#__PURE__*/React.createElement("div", {
        className: "enemy-template-initiative-list"
      }, bestiaryEnemyDraft.copyNames.map((copyName, index) => /*#__PURE__*/React.createElement("label", {
        key: index
      }, /*#__PURE__*/React.createElement("span", {
        className: "truncate"
      }, copyName), /*#__PURE__*/React.createElement("input", {
        type: "number",
        inputMode: "numeric",
        value: bestiaryEnemyDraft.copyInitiatives?.[index] ?? '',
        onChange: event => setBestiaryEnemyDraft(previous => ({
          ...previous,
          copyInitiatives: previous.copyInitiatives.map((value, valueIndex) => valueIndex === index ? event.target.value : value)
        })),
        placeholder: "Iniciativa",
        className: "min-h-10 w-full rounded border border-gray-600 bg-gray-950 px-3 text-center text-white"
      })))), bestiaryEnemyDraft.initiativeMode === 'none' && /*#__PURE__*/React.createElement("p", {
        className: "enemy-template-warning"
      }, "Se crearán sin iniciativa. En Preparar encuentro podrás tirar un d20 común o uno por enemigo; la app sumará su modificador de DES."))), /*#__PURE__*/React.createElement("footer", {
        className: "enemy-template-footer"
      }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "◆"), " Se añadirán a esta sala; la plantilla original no se modificará."), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setBestiaryEnemyDraft(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-primary",
        disabled: creatingEnemy,
        onClick: createEnemyFromBestiaryDraft
      }, creatingEnemy ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", null), " Creando aparición…") : /*#__PURE__*/React.createElement(React.Fragment, null, "Añadir ", Number(bestiaryEnemyDraft.quantity) > 1 ? `${bestiaryEnemyDraft.quantity} enemigos` : 'enemigo', " ", /*#__PURE__*/React.createElement("b", {
        "aria-hidden": "true"
      }, "→")))))), confirmDialog.isOpen && /*#__PURE__*/React.createElement("div", {
        className: "fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: `rpg-panel border ${confirmDialog.isAlert ? 'border-fuchsia-600' : 'border-red-600'} rounded-lg p-6 max-w-sm w-full shadow-2xl animate-attack`
      }, /*#__PURE__*/React.createElement("h3", {
        className: "text-xl font-fantasy font-bold text-white mb-2 tracking-widest uppercase"
      }, confirmDialog.isAlert ? 'Aviso del Sistema' : 'Confirmar Acción'), /*#__PURE__*/React.createElement("p", {
        className: "text-gray-300 text-sm mb-8 leading-relaxed"
      }, confirmDialog.message), /*#__PURE__*/React.createElement("div", {
        className: "flex justify-end space-x-3"
      }, !confirmDialog.isAlert && /*#__PURE__*/React.createElement("button", {
        onClick: closeConfirm,
        className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded font-bold transition-colors text-xs uppercase tracking-wider"
      }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          closeConfirm();
        },
        className: `px-4 py-2 text-white rounded font-bold transition-colors text-xs uppercase tracking-wider border ${confirmDialog.isAlert || confirmDialog.confirmTone === 'primary' ? 'bg-fuchsia-700 hover:bg-fuchsia-600 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-red-700 hover:bg-red-600 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]'}`
      }, confirmDialog.confirmLabel || (confirmDialog.isAlert ? 'Entendido' : 'Eliminar'))))));
    }
    window.DndActionDialogComponents = {
      ActionDialogs
    };
  })();
})();