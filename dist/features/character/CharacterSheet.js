(() => {
  (() => {
    const {
      AbilityGlyph,
      CharacterSectionGlyph,
      CombatSectionIcon
    } = window.DndCharacterSheetComponents;
    const {
      COMPANION_CATEGORY_LABELS,
      COMPANION_INITIATIVE_LABELS,
      CompanionAvatar
    } = window.DndCompanionComponents;
    const {
      InventoryView
    } = window.DndInventoryViewComponents;
    const {
      ArcaneCompendiumView
    } = window.DndSpellbookComponents;
    function CharacterWorkspace({
      model
    }) {
      const {
        ABILITY_NAMES,
        PROF_BONUS,
        SKILLS,
        SPELLCASTING_ABILITIES,
        activeConcentration,
        activeTab,
        addCurrency,
        addSpellFromSrdLibrary,
        addSuggestedClassResources,
        adjustCompanionHp,
        adjustInvQty,
        ammoSettingsOpen,
        armors,
        automaticSpells,
        bestiary,
        cantripCount,
        charInfo,
        combatDashboardView,
        companions,
        confirmDelete,
        currency,
        currentRoom,
        deathSaves,
        diaryCategory,
        diaryOpen,
        diarySearch,
        displayedSpells,
        displayedSrdSpells,
        displayedTraits,
        editingDiaryEntry,
        feats,
        finishConcentration,
        formatMod,
        getEffectiveStat,
        getModNum,
        getSpellGrantSummary,
        getSpellIconColor,
        getSpellIconPath,
        getWeaponAttackBonus,
        getWeaponAttackFormula,
        grimoireConfig,
        grimoireSettingsOpen,
        grimoireView,
        grimorioSpells,
        handleBoundedNumInput,
        handleNumInput,
        handleResourcePointerDown,
        handleResourcePointerEnd,
        handleResourcePointerMove,
        hasSavingThrowProficiency,
        hasSkillExpertise,
        hasSkillProficiency,
        hp,
        inventory,
        isCurrentRoomMaster,
        isSrdClassFilterActive,
        isStealthDisadvantaged,
        knownSpellCount,
        markDeathSave,
        openAddWeaponAttack,
        openCompanionManager,
        openOnlineTable,
        preparedSpellCount,
        renderUsageDots,
        requestAbilityCheckRoll,
        requestSavingThrowRoll,
        requestSkillRoll,
        requestWeaponAttackRoll,
        requestWeaponDamageRoll,
        resetDeathSaves,
        resourceCardRefs,
        resourceDrag,
        resourceGridRef,
        resourcePressRef,
        resources,
        restoreSpellOwnUses,
        roomParticipants,
        selectedWeapon,
        selectedWeaponAmmo,
        selectedWeaponId,
        sessionNotes,
        setAddModal,
        setAmmoSettingsOpen,
        setArmors,
        setBestiaryCompendiumOpen,
        setCastSpell,
        setDiaryCategory,
        setDiaryOpen,
        setDiarySearch,
        setDiceRollerOpen,
        setEditingDiaryEntry,
        setEditingSlotLevel,
        setEquipmentCompendiumOpen,
        setFeatCompendiumOpen,
        setFeats,
        setGrimoireConfig,
        setGrimoireGuideOpen,
        setGrimoireSettingsOpen,
        setGrimoireView,
        setInventory,
        setResources,
        setSelectedWeaponId,
        setSessionNotes,
        setShowEmptySlots,
        setSize,
        setSkillModal,
        setSpeed,
        setSpellFilter,
        setSpellSearch,
        setSpells,
        setSrdSpellClassFilter,
        setSrdSpellDetail,
        setSrdSpellLevel,
        setSrdSpellSchool,
        setSrdSpellSearch,
        setSrdSpellTrait,
        setStats,
        setTempStats,
        setTools,
        setTraits,
        setWeapons,
        showAlert,
        showEmptySlots,
        size,
        speed,
        spellAttackBonus,
        spellFilter,
        spellSaveDc,
        spellSearch,
        spellSlots,
        spellWorkflow,
        spellWorkflowCopy,
        spellcastingAbility,
        spellcastingAbilityName,
        spellcastingModifier,
        spells,
        spendWeaponAmmo,
        srdMonsterCompendium,
        srdProfileCantrips,
        srdProfileHasSpellcasting,
        srdProfileKnownLimit,
        srdProfileMaxSpellLevel,
        srdProfilePreparedLimit,
        srdSpellClassFilter,
        srdSpellLevel,
        srdSpellLibrary,
        srdSpellSchool,
        srdSpellSchools,
        srdSpellSearch,
        srdSpellTrait,
        srdSpellcastingLevel,
        srdSpellcastingProfile,
        stats,
        stealthDisadvantageArmor,
        suggestedClassResources,
        tempStats,
        toggleArmorEquip,
        toggleSavingThrow,
        toggleSpellKnown,
        toggleSpellPreparation,
        tools,
        traits,
        updateCompanion,
        updateCurrencyAmount,
        updateWeaponAmmo,
        weapons
      } = model;
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        "data-tab": "character",
        "data-accent": "violet",
        className: "character-physical-profile tab-section"
      }, /*#__PURE__*/React.createElement("label", {
        className: "character-physical-stat is-speed"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-physical-icon",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M4 17h5l2-3 2 2 3-5 4-2M5 12h4M3 8h7"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m17 5 3 4-4 2"
      }))), /*#__PURE__*/React.createElement("span", {
        className: "character-physical-copy"
      }, /*#__PURE__*/React.createElement("small", null, "Movimiento"), /*#__PURE__*/React.createElement("strong", null, "Velocidad"), /*#__PURE__*/React.createElement("em", null, "Distancia por turno")), /*#__PURE__*/React.createElement("span", {
        className: "character-physical-value"
      }, /*#__PURE__*/React.createElement("input", {
        "aria-label": "Velocidad en pies",
        type: "number",
        inputMode: "numeric",
        placeholder: "30",
        title: "Ejemplo: 30 pies",
        value: speed,
        onChange: e => setSpeed(handleNumInput(e.target.value))
      }), /*#__PURE__*/React.createElement("b", null, "ft"))), /*#__PURE__*/React.createElement("label", {
        className: "character-physical-stat is-size"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-physical-icon",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "9",
        r: "2.5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M7.5 18c.6-3.1 2-4.5 4.5-4.5s3.9 1.4 4.5 4.5"
      }))), /*#__PURE__*/React.createElement("span", {
        className: "character-physical-copy"
      }, /*#__PURE__*/React.createElement("small", null, "Físico"), /*#__PURE__*/React.createElement("strong", null, "Tamaño"), /*#__PURE__*/React.createElement("em", null, "Categoría corporal")), /*#__PURE__*/React.createElement("span", {
        className: "character-physical-value is-text"
      }, /*#__PURE__*/React.createElement("input", {
        "aria-label": "Tamaño del personaje",
        type: "text",
        placeholder: "Mediano",
        title: "Ejemplo: Mediano",
        value: size,
        onChange: e => setSize(e.target.value)
      })))), /*#__PURE__*/React.createElement("div", {
        "data-tab": "combat",
        className: "tab-section"
      }, (Number(hp.current) || 0) <= 0 && /*#__PURE__*/React.createElement("section", {
        className: "death-save-panel",
        "aria-labelledby": "death-save-title"
      }, /*#__PURE__*/React.createElement("div", {
        className: "death-save-ambient",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("header", {
        className: "death-save-heading"
      }, /*#__PURE__*/React.createElement("div", {
        className: "death-save-symbol",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("span", null, "†")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "0 puntos de golpe"), /*#__PURE__*/React.createElement("h3", {
        id: "death-save-title"
      }, "Salvaciones contra muerte"), /*#__PURE__*/React.createElement("p", null, "Marca manualmente el resultado de cada tirada."))), /*#__PURE__*/React.createElement("div", {
        className: "death-save-tracks"
      }, /*#__PURE__*/React.createElement("section", {
        className: "death-save-track is-success"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Resistir"), /*#__PURE__*/React.createElement("strong", null, "Éxitos")), /*#__PURE__*/React.createElement("div", {
        className: "death-save-marks"
      }, [1, 2, 3].map(mark => /*#__PURE__*/React.createElement("button", {
        type: "button",
        key: `success_${mark}`,
        "aria-label": `${deathSaves.successes >= mark ? 'Desmarcar' : 'Marcar'} éxito ${mark}`,
        "aria-pressed": deathSaves.successes >= mark,
        onClick: () => markDeathSave('success', mark),
        className: deathSaves.successes >= mark ? 'is-filled' : ''
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("span", null, deathSaves.successes >= mark ? '✦' : mark))))), /*#__PURE__*/React.createElement("div", {
        className: "death-save-divider",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("span", null)), /*#__PURE__*/React.createElement("section", {
        className: "death-save-track is-failure"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Ceder"), /*#__PURE__*/React.createElement("strong", null, "Fallos")), /*#__PURE__*/React.createElement("div", {
        className: "death-save-marks"
      }, [1, 2, 3].map(mark => /*#__PURE__*/React.createElement("button", {
        type: "button",
        key: `failure_${mark}`,
        "aria-label": `${deathSaves.failures >= mark ? 'Desmarcar' : 'Marcar'} fallo ${mark}`,
        "aria-pressed": deathSaves.failures >= mark,
        onClick: () => markDeathSave('failure', mark),
        className: deathSaves.failures >= mark ? 'is-filled' : ''
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("span", null, deathSaves.failures >= mark ? '×' : mark)))))), /*#__PURE__*/React.createElement("footer", {
        className: "death-save-footer"
      }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", null), Number(deathSaves.successes) >= 3 ? 'Estabilizado' : Number(deathSaves.failures) >= 3 ? 'Tres fallos marcados' : 'El resultado sigue abierto'), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: resetDeathSaves
      }, "Estabilizar manualmente")))), /*#__PURE__*/React.createElement("div", {
        className: "character-workspace space-y-6"
      }, /*#__PURE__*/React.createElement("div", {
        "data-tab": "character",
        className: "character-core-column tab-section space-y-6"
      }, /*#__PURE__*/React.createElement("div", {
        className: "rpg-panel p-4 character-attributes-panel"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-section-header is-attributes"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-section-heading"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-section-emblem"
      }, /*#__PURE__*/React.createElement(CharacterSectionGlyph, {
        section: "attributes"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Base y temporal"), /*#__PURE__*/React.createElement("h2", null, "Atributos"))), /*#__PURE__*/React.createElement("span", {
        className: "character-section-note"
      }, "Valores y modificadores")), /*#__PURE__*/React.createElement("div", {
        className: "character-attributes-grid"
      }, Object.entries(stats).map(([key, val]) => {
        const total = getEffectiveStat(key);
        const mod = getModNum(total);
        return /*#__PURE__*/React.createElement("div", {
          key: key,
          "data-ability": key,
          className: "character-attribute-card"
        }, /*#__PURE__*/React.createElement("div", {
          className: "character-attribute-summary"
        }, /*#__PURE__*/React.createElement("span", {
          className: "character-attribute-orb"
        }, /*#__PURE__*/React.createElement(AbilityGlyph, {
          ability: key
        })), /*#__PURE__*/React.createElement("span", {
          className: "character-attribute-heading"
        }, /*#__PURE__*/React.createElement("strong", null, ABILITY_NAMES[key]), /*#__PURE__*/React.createElement("small", null, key.toUpperCase())), /*#__PURE__*/React.createElement("strong", {
          className: "character-attribute-modifier"
        }, formatMod(mod), /*#__PURE__*/React.createElement("small", null, "mod.")), /*#__PURE__*/React.createElement("span", {
          className: "character-attribute-total"
        }, /*#__PURE__*/React.createElement("small", null, "Puntuación"), total)), /*#__PURE__*/React.createElement("div", {
          className: "character-attribute-inputs"
        }, /*#__PURE__*/React.createElement("label", null, "Base", /*#__PURE__*/React.createElement("input", {
          "aria-label": `Atributo base ${key}`,
          type: "number",
          placeholder: "10",
          value: val,
          onChange: e => setStats({
            ...stats,
            [key]: handleNumInput(e.target.value)
          })
        })), /*#__PURE__*/React.createElement("label", null, "Temp", /*#__PURE__*/React.createElement("input", {
          "aria-label": `Modificador temporal ${key}`,
          type: "number",
          placeholder: "+0",
          value: tempStats[key] ?? '0',
          onChange: e => setTempStats({
            ...tempStats,
            [key]: handleNumInput(e.target.value)
          })
        }))), /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "character-attribute-roll",
          onClick: () => requestAbilityCheckRoll(key)
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "20"), "Tirar prueba"));
      }))), /*#__PURE__*/React.createElement("div", {
        className: "rpg-panel p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-section-header is-saves"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-section-heading"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-section-emblem"
      }, /*#__PURE__*/React.createElement(CharacterSectionGlyph, {
        section: "saves"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Defensa de atributos"), /*#__PURE__*/React.createElement("h2", null, "Salvaciones"))), /*#__PURE__*/React.createElement("span", {
        className: "character-section-note"
      }, "Toca para tirar · ⚙ para editar")), /*#__PURE__*/React.createElement("div", {
        className: "saving-throws-grid"
      }, Object.entries(stats).map(([key, val]) => {
        const isProf = hasSavingThrowProficiency(key);
        const totalMod = getModNum(getEffectiveStat(key)) + (isProf ? PROF_BONUS : 0);
        return /*#__PURE__*/React.createElement("div", {
          key: `save-${key}`,
          onClick: () => requestSavingThrowRoll(key),
          onKeyDown: event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              requestSavingThrowRoll(key);
            }
          },
          title: `Tirar salvación de ${ABILITY_NAMES[key]}${isProf ? ' · Competente' : ''}`,
          "aria-label": `Tirar salvación de ${ABILITY_NAMES[key]}${isProf ? ', competente' : ''}`,
          role: "button",
          tabIndex: "0",
          "data-ability": key,
          className: `saving-throw-tile ${isProf ? 'is-proficient' : ''}`
        }, /*#__PURE__*/React.createElement("span", {
          className: "saving-throw-mark",
          "aria-hidden": "true"
        }), /*#__PURE__*/React.createElement("span", {
          className: "saving-throw-icon"
        }, /*#__PURE__*/React.createElement(AbilityGlyph, {
          ability: key
        })), /*#__PURE__*/React.createElement("span", {
          className: "saving-throw-label"
        }, /*#__PURE__*/React.createElement("strong", null, ABILITY_NAMES[key]), /*#__PURE__*/React.createElement("small", null, key.toUpperCase())), /*#__PURE__*/React.createElement("strong", {
          className: "saving-throw-value"
        }, formatMod(totalMod)), /*#__PURE__*/React.createElement("span", {
          className: "saving-throw-status"
        }, isProf ? `Competente · +${PROF_BONUS}` : 'Sin competencia'), /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "saving-throw-edit",
          onClick: event => {
            event.stopPropagation();
            toggleSavingThrow(key);
          },
          onKeyDown: event => event.stopPropagation(),
          "aria-label": `Editar competencia en salvación de ${ABILITY_NAMES[key]}`,
          title: "Editar competencia"
        }, "⚙"));
      }))), /*#__PURE__*/React.createElement("div", {
        className: "rpg-panel p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-section-header is-skills"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-section-heading"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-section-emblem"
      }, /*#__PURE__*/React.createElement(CharacterSectionGlyph, {
        section: "skills"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Competencias y pericias"), /*#__PURE__*/React.createElement("h2", null, "Habilidades"))), /*#__PURE__*/React.createElement("span", {
        className: "character-section-note"
      }, "Toca para tirar · ⚙ para editar")), /*#__PURE__*/React.createElement("div", {
        className: "space-y-1"
      }, SKILLS.map(skill => {
        const isExp = hasSkillExpertise(skill.key);
        const isProf = hasSkillProficiency(skill.key);
        const totalMod = getModNum(getEffectiveStat(skill.stat)) + (isExp ? PROF_BONUS * 2 : isProf ? PROF_BONUS : 0);
        return /*#__PURE__*/React.createElement("div", {
          key: skill.key,
          "data-ability": skill.stat,
          onClick: () => requestSkillRoll(skill),
          onKeyDown: event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              requestSkillRoll(skill);
            }
          },
          role: "button",
          tabIndex: "0",
          "aria-label": `${skill.name}: ${formatMod(totalMod)}. ${isExp ? 'Pericia' : isProf ? 'Competencia' : 'Sin competencia'}`,
          className: "character-skill-row group"
        }, /*#__PURE__*/React.createElement("div", {
          className: "character-skill-main"
        }, /*#__PURE__*/React.createElement("span", {
          className: `character-skill-icon ${isExp ? 'is-expert' : isProf ? 'is-proficient' : ''}`
        }, /*#__PURE__*/React.createElement(AbilityGlyph, {
          ability: skill.stat
        })), /*#__PURE__*/React.createElement("span", {
          className: "character-skill-copy"
        }, /*#__PURE__*/React.createElement("strong", null, skill.name), /*#__PURE__*/React.createElement("small", null, skill.stat.toUpperCase()), skill.key === 'sigilo' && isStealthDisadvantaged && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: event => {
            event.stopPropagation();
            showAlert(`La armadura equipada ${stealthDisadvantageArmor.name} impone desventaja en Sigilo.`);
          },
          onKeyDown: event => event.stopPropagation(),
          className: "ml-2 inline-flex max-w-full items-center rounded border border-red-800 bg-red-950/50 px-1.5 py-0.5 text-[10px] font-bold text-red-300 hover:border-red-400",
          "aria-label": `Explicación de desventaja en Sigilo por ${stealthDisadvantageArmor.name}`
        }, "⚠ Desventaja (", stealthDisadvantageArmor.name, ")"))), /*#__PURE__*/React.createElement("div", {
          className: `character-skill-result ${isExp ? 'is-expert' : isProf ? 'is-proficient' : ''}`
        }, /*#__PURE__*/React.createElement("span", {
          className: `character-skill-rank ${isExp ? 'is-expert' : isProf ? 'is-proficient' : ''}`
        }, isExp ? 'Pericia' : isProf ? 'Competencia' : 'Normal'), /*#__PURE__*/React.createElement("strong", null, formatMod(totalMod)), /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "character-skill-edit",
          onClick: event => {
            event.stopPropagation();
            setSkillModal({
              isOpen: true,
              skillKey: skill.key,
              skillName: skill.name
            });
          },
          onKeyDown: event => event.stopPropagation(),
          "aria-label": `Editar competencia de ${skill.name}`,
          title: "Editar competencia"
        }, "⚙")));
      })), /*#__PURE__*/React.createElement("div", {
        className: "mt-4 flex gap-4 text-[10px] text-gray-500 justify-center font-fantasy tracking-wider uppercase"
      }, /*#__PURE__*/React.createElement("span", {
        className: "flex items-center text-cyan-200"
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-2 h-2 rounded-full bg-cyan-400 mr-1 border border-cyan-200"
      }), " Competencia"), /*#__PURE__*/React.createElement("span", {
        className: "flex items-center text-amber-200"
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-2 h-2 rounded-full bg-amber-400 mr-1 shadow-[0_0_5px_rgba(251,191,36,0.8)] border border-amber-200"
      }), " Pericia")))), /*#__PURE__*/React.createElement("div", {
        className: "character-secondary-column space-y-6"
      }, /*#__PURE__*/React.createElement("section", {
        "data-tab": "character",
        className: "companion-panel rpg-panel"
      }, /*#__PURE__*/React.createElement("header", {
        className: "companion-panel-header"
      }, /*#__PURE__*/React.createElement("span", {
        className: "companion-panel-emblem",
        "aria-hidden": "true"
      }, "✦"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Vínculos y aliados"), /*#__PURE__*/React.createElement("h2", null, "Compañeros"), /*#__PURE__*/React.createElement("p", null, "Familiares, monturas e invocaciones ligados a este personaje.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => openCompanionManager()
      }, companions.length ? 'Gestionar' : '＋ Añadir')), companions.length ? /*#__PURE__*/React.createElement("div", {
        className: "companion-panel-list"
      }, companions.slice(0, 3).map(companion => /*#__PURE__*/React.createElement("button", {
        type: "button",
        key: companion.id,
        onClick: () => openCompanionManager(companion.id)
      }, /*#__PURE__*/React.createElement(CompanionAvatar, {
        companion: companion
      }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, COMPANION_CATEGORY_LABELS[companion.category]), /*#__PURE__*/React.createElement("strong", null, companion.name), /*#__PURE__*/React.createElement("em", null, "PV ", companion.currentHp, "/", companion.maxHp, " · CA ", companion.armorClass ?? '—')), /*#__PURE__*/React.createElement("b", {
        className: companion.participates ? 'is-active' : ''
      }, companion.participates ? 'Preparado' : 'Disponible'))), companions.length > 3 && /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "companion-panel-more",
        onClick: () => openCompanionManager()
      }, "Ver ", companions.length - 3, " más")) : /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "companion-panel-empty",
        onClick: () => openCompanionManager()
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "◇"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "No hay compañeros vinculados"), /*#__PURE__*/React.createElement("p", null, "Puedes importar una bestia con todos sus datos desde el compendio.")), /*#__PURE__*/React.createElement("b", null, "Empezar →"))), companions.length > 0 && /*#__PURE__*/React.createElement("section", {
        "data-tab": "combat",
        hidden: activeTab === 'combat' && combatDashboardView !== 'summary',
        className: "companion-combat-panel rpg-panel"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "✦"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Aliados bajo tu control"), /*#__PURE__*/React.createElement("h2", null, "Compañeros en combate"), /*#__PURE__*/React.createElement("p", null, "Elige quién entra en la escena y consulta su estado.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => openCompanionManager()
      }, "Gestionar")), /*#__PURE__*/React.createElement("div", null, companions.map(companion => {
        const hpPercent = companion.maxHp > 0 ? Math.max(0, Math.min(100, companion.currentHp / companion.maxHp * 100)) : 0;
        return /*#__PURE__*/React.createElement("article", {
          key: companion.id,
          className: companion.participates ? 'is-participating' : ''
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "companion-combat-identity",
          onClick: () => openCompanionManager(companion.id)
        }, /*#__PURE__*/React.createElement(CompanionAvatar, {
          companion: companion
        }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, COMPANION_CATEGORY_LABELS[companion.category]), /*#__PURE__*/React.createElement("strong", null, companion.name), /*#__PURE__*/React.createElement("em", null, "CA ", companion.armorClass ?? '—', " · ", COMPANION_INITIATIVE_LABELS[companion.initiativeMode]))), /*#__PURE__*/React.createElement("div", {
          className: "companion-combat-health"
        }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Puntos de golpe"), /*#__PURE__*/React.createElement("strong", null, companion.currentHp, /*#__PURE__*/React.createElement("i", null, "/ ", companion.maxHp), companion.tempHp > 0 && /*#__PURE__*/React.createElement("em", null, "+", companion.tempHp))), /*#__PURE__*/React.createElement("i", null, /*#__PURE__*/React.createElement("b", {
          style: {
            width: `${hpPercent}%`
          }
        })), /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: companion.currentHp <= 0,
          onClick: () => adjustCompanionHp(companion.id, -1)
        }, "−1"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => openCompanionManager(companion.id)
        }, "Ficha"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: companion.currentHp >= companion.maxHp,
          onClick: () => adjustCompanionHp(companion.id, 1)
        }, "+1"))), /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: `companion-participation-toggle ${companion.participates ? 'is-active' : ''}`,
          onClick: () => updateCompanion(companion.id, {
            participates: !companion.participates
          })
        }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, companion.participates ? 'Incluido' : 'Fuera de iniciativa'), /*#__PURE__*/React.createElement("strong", null, companion.participates ? 'Participa' : 'No participa'))));
      })), /*#__PURE__*/React.createElement("footer", null, "La acción disponible depende del conjuro o rasgo que haya creado al compañero.")), /*#__PURE__*/React.createElement("div", {
        "data-tab": "combat",
        hidden: activeTab === 'combat' && combatDashboardView !== 'summary',
        className: "combat-resources-panel combat-collection-panel tab-section rpg-panel"
      }, /*#__PURE__*/React.createElement("header", {
        className: "combat-collection-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "combat-collection-heading"
      }, /*#__PURE__*/React.createElement("span", {
        className: "combat-collection-emblem"
      }, /*#__PURE__*/React.createElement(CombatSectionIcon, {
        section: "resources"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Usos, cargas y capacidades"), /*#__PURE__*/React.createElement("h2", null, "Recursos"), /*#__PURE__*/React.createElement("span", null, "Controla lo que gastas durante la aventura."))), /*#__PURE__*/React.createElement("div", {
        className: "combat-collection-actions"
      }, suggestedClassResources.length > 0 && /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-secondary",
        onClick: addSuggestedClassResources
      }, "Sugerir recursos"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-primary",
        onClick: () => setAddModal({
          isOpen: true,
          type: 'resource',
          data: {}
        })
      }, /*#__PURE__*/React.createElement("span", null, "+"), " Añadir recurso"))), /*#__PURE__*/React.createElement("div", {
        className: "combat-collection-summary"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, resources.length + (grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 ? 1 : 0)), " ", resources.length + (grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 ? 1 : 0) === 1 ? 'recurso activo' : 'recursos activos'), /*#__PURE__*/React.createElement("small", null, "Mantén pulsada una tarjeta para reordenarla")), /*#__PURE__*/React.createElement("div", {
        ref: resourceGridRef,
        className: "resource-reorder-grid grid grid-cols-2 md:grid-cols-4 gap-4"
      }, resources.map((res, idx) => /*#__PURE__*/React.createElement("article", {
        key: res.id,
        ref: element => {
          if (element) resourceCardRefs.current.set(res.id, element);else resourceCardRefs.current.delete(res.id);
        },
        "data-resource-id": res.id,
        onPointerDown: event => handleResourcePointerDown(event, res.id),
        onPointerMove: handleResourcePointerMove,
        onPointerUp: handleResourcePointerEnd,
        onPointerCancel: handleResourcePointerEnd,
        onContextMenu: event => {
          if (resourceDrag.id === res.id) event.preventDefault();
        },
        style: resourceDrag.id === res.id ? {
          '--resource-drag-x': `${resourceDrag.x}px`,
          '--resource-drag-y': `${resourceDrag.y}px`,
          '--resource-drag-left': `${resourceDrag.left}px`,
          '--resource-drag-top': `${resourceDrag.top}px`,
          '--resource-drag-width': `${resourceDrag.width}px`,
          '--resource-drag-height': `${resourceDrag.height}px`
        } : undefined,
        className: `resource-card combat-resource-card group ${resourceDrag.id === res.id ? 'is-dragging' : ''} ${resourcePressRef.current?.id === res.id && !resourceDrag.id ? 'is-drag-pending' : ''} ${resourceDrag.id && resourceDrag.targetId === res.id && resourceDrag.id !== res.id ? 'is-drop-target' : ''}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "combat-resource-card-top"
      }, /*#__PURE__*/React.createElement("span", {
        className: "combat-resource-grip",
        "aria-hidden": "true"
      }, "⠿"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, res.recoveryRest === 'short' ? 'Descanso corto' : res.recoveryRest === 'long' ? 'Descanso largo' : 'Recuperación manual'), /*#__PURE__*/React.createElement("h3", null, res.name)), res.type && /*#__PURE__*/React.createElement("b", null, res.type)), /*#__PURE__*/React.createElement("div", {
        className: "combat-resource-uses"
      }, renderUsageDots(res.current, res.max, 'text-purple-400')), /*#__PURE__*/React.createElement("div", {
        className: "combat-resource-counter"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        "aria-label": `Reducir ${res.name}`,
        onClick: () => setResources(previous => previous.map((resource, resourceIndex) => resourceIndex === idx ? {
          ...resource,
          current: Math.max(0, Number(resource.current) - 1)
        } : resource))
      }, "−"), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("small", null, "Disponibles"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("input", {
        "aria-label": `${res.name} actuales`,
        type: "number",
        min: "0",
        value: res.current,
        onChange: event => setResources(previous => previous.map((resource, resourceIndex) => resourceIndex === idx ? {
          ...resource,
          current: handleBoundedNumInput(event.target.value, Number(resource.max) > 0 ? resource.max : null)
        } : resource))
      }), Number(res.max) > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", null, "/"), /*#__PURE__*/React.createElement("b", null, res.max)))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        "aria-label": `Aumentar ${res.name}`,
        onClick: () => setResources(previous => previous.map((resource, resourceIndex) => resourceIndex === idx ? {
          ...resource,
          current: Number(resource.max) > 0 ? Math.min(Number(resource.max), (Number(resource.current) || 0) + 1) : (Number(resource.current) || 0) + 1
        } : resource))
      }, "+")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => confirmDelete(`¿Borrar el recurso "${res.name}"?`, () => setResources(resources.filter(r => r.id !== res.id))),
        className: "combat-card-delete",
        "aria-label": `Borrar ${res.name}`
      }, "×"))), grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0 && /*#__PURE__*/React.createElement("article", {
        className: "combat-resource-card is-pact"
      }, /*#__PURE__*/React.createElement("div", {
        className: "combat-resource-card-top"
      }, /*#__PURE__*/React.createElement("span", {
        className: "combat-resource-sigil"
      }, "⬡"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Se recupera con descanso corto"), /*#__PURE__*/React.createElement("h3", null, "Magia de pacto")), /*#__PURE__*/React.createElement("b", null, "N", grimoireConfig.pactSlots.level)), /*#__PURE__*/React.createElement("div", {
        className: "combat-resource-uses"
      }, renderUsageDots(grimoireConfig.pactSlots.current, grimoireConfig.pactSlots.max, 'text-yellow-300')), /*#__PURE__*/React.createElement("div", {
        className: "combat-resource-counter"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        "aria-label": "Reducir magia de pacto",
        onClick: () => setGrimoireConfig(previous => ({
          ...previous,
          pactSlots: {
            ...previous.pactSlots,
            current: Math.max(0, Number(previous.pactSlots.current) - 1)
          }
        }))
      }, "−"), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("small", null, "Ranuras"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("input", {
        "aria-label": "Ranuras de magia de pacto actuales",
        type: "number",
        min: "0",
        value: grimoireConfig.pactSlots.current,
        onChange: event => setGrimoireConfig(previous => ({
          ...previous,
          pactSlots: {
            ...previous.pactSlots,
            current: handleBoundedNumInput(event.target.value, previous.pactSlots.max)
          }
        }))
      }), /*#__PURE__*/React.createElement("i", null, "/"), /*#__PURE__*/React.createElement("b", null, grimoireConfig.pactSlots.max))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        "aria-label": "Aumentar magia de pacto",
        onClick: () => setGrimoireConfig(previous => ({
          ...previous,
          pactSlots: {
            ...previous.pactSlots,
            current: Math.min(Number(previous.pactSlots.max), Number(previous.pactSlots.current) + 1)
          }
        }))
      }, "+"))), resources.length === 0 && !(grimoireConfig.usePactMagic && Number(grimoireConfig.pactSlots.max) > 0) && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setAddModal({
          isOpen: true,
          type: 'resource',
          data: {}
        }),
        className: "combat-collection-empty"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(CombatSectionIcon, {
        section: "resources"
      })), /*#__PURE__*/React.createElement("strong", null, "Aún no hay recursos"), /*#__PURE__*/React.createElement("small", null, "Añade dados, cargas o usos limitados para tenerlos a mano durante el combate."), /*#__PURE__*/React.createElement("b", null, "Crear el primero")))), /*#__PURE__*/React.createElement("div", {
        "data-tab": "combat",
        hidden: activeTab === 'combat' && combatDashboardView !== 'summary',
        className: "combat-arsenal-panel combat-collection-panel tab-section rpg-panel"
      }, /*#__PURE__*/React.createElement("header", {
        className: "combat-collection-header is-arsenal"
      }, /*#__PURE__*/React.createElement("div", {
        className: "combat-collection-heading"
      }, /*#__PURE__*/React.createElement("span", {
        className: "combat-collection-emblem"
      }, /*#__PURE__*/React.createElement(CombatSectionIcon, {
        section: "arsenal"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Equipo preparado"), /*#__PURE__*/React.createElement("h2", null, "Arsenal"), /*#__PURE__*/React.createElement("span", null, "Ataques, daño y munición a un vistazo."))), /*#__PURE__*/React.createElement("div", {
        className: "combat-collection-actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-primary",
        onClick: () => setAddModal({
          isOpen: true,
          type: 'weapon',
          data: {}
        })
      }, /*#__PURE__*/React.createElement("span", null, "+"), " Nueva arma"))), /*#__PURE__*/React.createElement("nav", {
        className: "arsenal-weapon-tabs",
        "aria-label": "Armas del arsenal"
      }, weapons.map(w => /*#__PURE__*/React.createElement("div", {
        key: w.id,
        className: `arsenal-weapon-tab group ${selectedWeaponId === w.id ? 'is-active' : ''}`
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          setSelectedWeaponId(w.id);
          setAmmoSettingsOpen(false);
        },
        "aria-pressed": selectedWeaponId === w.id
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(CombatSectionIcon, {
        section: "arsenal"
      })), /*#__PURE__*/React.createElement("strong", null, w.name), w.usesAmmo && /*#__PURE__*/React.createElement("small", null, "Munición")), /*#__PURE__*/React.createElement("button", {
        onClick: e => {
          e.stopPropagation();
          confirmDelete(`¿Borrar "${w.name}"?`, () => {
            const newW = weapons.filter(x => x.id !== w.id);
            setWeapons(newW);
            if (selectedWeaponId === w.id) setSelectedWeaponId(newW[0]?.id || null);
          });
        },
        className: "combat-card-delete",
        "aria-label": `Borrar ${w.name}`
      }, "×")))), /*#__PURE__*/React.createElement("div", {
        className: "arsenal-workbench"
      }, selectedWeapon ? /*#__PURE__*/React.createElement("div", {
        className: "arsenal-selected-weapon"
      }, /*#__PURE__*/React.createElement("div", {
        className: "arsenal-selected-heading"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Arma preparada"), /*#__PURE__*/React.createElement("h3", null, selectedWeapon.name)), /*#__PURE__*/React.createElement("div", {
        className: "arsenal-selected-heading-actions"
      }, /*#__PURE__*/React.createElement("span", null, selectedWeapon.attacks.length, " acci", selectedWeapon.attacks.length === 1 ? 'ón' : 'ones'), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setAmmoSettingsOpen(true),
        className: selectedWeapon.usesAmmo ? 'is-active' : ''
      }, /*#__PURE__*/React.createElement("i", {
        "aria-hidden": "true"
      }, "➤"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, selectedWeapon.usesAmmo ? 'Munición' : 'Proyectiles'), /*#__PURE__*/React.createElement("strong", null, selectedWeapon.usesAmmo ? selectedWeaponAmmo ? `${Math.max(0, Number(selectedWeaponAmmo.qty) || 0)} disponibles` : 'Sin vincular' : 'Configurar')), /*#__PURE__*/React.createElement("b", {
        "aria-hidden": "true"
      }, "⚙")))), /*#__PURE__*/React.createElement("div", {
        className: "arsenal-attacks-grid"
      }, selectedWeapon.attacks.map((act, i) => /*#__PURE__*/React.createElement("article", {
        key: `${selectedWeaponId}-${i}`,
        className: "arsenal-attack-card animate-attack group"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(CombatSectionIcon, {
        section: "arsenal"
      })), /*#__PURE__*/React.createElement("h3", null, act.name)), /*#__PURE__*/React.createElement("div", {
        className: "arsenal-attack-values"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Ataque"), /*#__PURE__*/React.createElement("strong", null, getWeaponAttackBonus(act, selectedWeapon) || '—'), getWeaponAttackFormula(act, selectedWeapon) && /*#__PURE__*/React.createElement("em", null, getWeaponAttackFormula(act, selectedWeapon))), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Daño"), /*#__PURE__*/React.createElement("strong", null, act.dmg || '—'))), /*#__PURE__*/React.createElement("div", {
        className: "arsenal-roll-actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => requestWeaponAttackRoll(act, selectedWeapon, i)
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "20"), "Tirar ataque"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: !window.DndDiceEngine.extractDiceFormula(act.dmg),
        onClick: () => requestWeaponDamageRoll(act, selectedWeapon)
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "✦"), "Tirar daño")), act.notes && /*#__PURE__*/React.createElement("p", null, act.notes), selectedWeapon.usesAmmo && /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: !selectedWeaponAmmo || Number(selectedWeaponAmmo.qty) < Math.max(1, Number(selectedWeapon.ammoPerShot) || 1),
        onClick: () => spendWeaponAmmo(selectedWeapon.id),
        className: "arsenal-attack-fire"
      }, /*#__PURE__*/React.createElement("span", null, "➤"), selectedWeaponAmmo ? `Disparar · ${selectedWeaponAmmo.qty} disponibles` : 'Munición sin vincular'), /*#__PURE__*/React.createElement("button", {
        onClick: () => confirmDelete(`¿Borrar ataque "${act.name}"?`, () => {
          setWeapons(weapons.map(w => w.id === selectedWeaponId ? {
            ...w,
            attacks: w.attacks.filter((_, idx) => idx !== i)
          } : w));
        }),
        className: "combat-card-delete",
        "aria-label": `Borrar ataque ${act.name}`
      }, "×")))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: openAddWeaponAttack,
        className: "arsenal-add-action"
      }, /*#__PURE__*/React.createElement("span", null, "+"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Añadir acción"), /*#__PURE__*/React.createElement("small", null, "Registra otra forma de atacar con esta arma.")))) : /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setAddModal({
          isOpen: true,
          type: 'weapon',
          data: {}
        }),
        className: "combat-collection-empty"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(CombatSectionIcon, {
        section: "arsenal"
      })), /*#__PURE__*/React.createElement("strong", null, "Aún no hay armas"), /*#__PURE__*/React.createElement("small", null, "Añade un arma y organiza aquí sus ataques y munición."), /*#__PURE__*/React.createElement("b", null, "Crear la primera")))), ammoSettingsOpen && selectedWeapon && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
        className: "ammo-settings-backdrop",
        onMouseDown: event => {
          if (event.target === event.currentTarget) setAmmoSettingsOpen(false);
        }
      }, /*#__PURE__*/React.createElement("section", {
        className: "ammo-settings-dialog",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "ammo-settings-title"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        className: "ammo-settings-emblem",
        "aria-hidden": "true"
      }, "➤"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Arsenal · ", selectedWeapon.name), /*#__PURE__*/React.createElement("h3", {
        id: "ammo-settings-title"
      }, "Configurar munición"), /*#__PURE__*/React.createElement("p", null, "Vincula una reserva de la mochila y define cuánto consume cada disparo.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setAmmoSettingsOpen(false),
        "aria-label": "Cerrar configuración de munición"
      }, "×")), /*#__PURE__*/React.createElement("div", {
        className: "ammo-settings-body"
      }, /*#__PURE__*/React.createElement("label", {
        className: "ammo-settings-toggle"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: selectedWeapon.usesAmmo === true,
        onChange: event => updateWeaponAmmo(selectedWeapon.id, {
          usesAmmo: event.target.checked
        })
      }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Control de proyectiles"), /*#__PURE__*/React.createElement("strong", null, "Esta arma utiliza munición"), /*#__PURE__*/React.createElement("p", null, "Actívalo para descontar unidades al registrar cada disparo.")), /*#__PURE__*/React.createElement("b", null, selectedWeapon.usesAmmo ? 'Activo' : 'Inactivo')), selectedWeapon.usesAmmo && /*#__PURE__*/React.createElement("div", {
        className: "ammo-settings-fields"
      }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Reserva vinculada"), /*#__PURE__*/React.createElement("small", null, "Objeto de la mochila que contiene la munición"), /*#__PURE__*/React.createElement("select", {
        value: selectedWeapon.ammoItemId || '',
        onChange: event => updateWeaponAmmo(selectedWeapon.id, {
          ammoItemId: event.target.value
        })
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Sin vincular"), inventory.map(item => /*#__PURE__*/React.createElement("option", {
        key: item.id,
        value: item.id
      }, item.name, " · ", Math.max(0, Number(item.qty) || 0))))), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Consumo"), /*#__PURE__*/React.createElement("small", null, "Unidades gastadas por disparo"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "1",
        value: selectedWeapon.ammoPerShot || 1,
        onChange: event => updateWeaponAmmo(selectedWeapon.id, {
          ammoPerShot: Math.max(1, Math.trunc(Number(event.target.value) || 1))
        })
      }), /*#__PURE__*/React.createElement("b", null, "por disparo")))), selectedWeapon.usesAmmo && /*#__PURE__*/React.createElement("div", {
        className: `ammo-settings-reserve ${selectedWeaponAmmo ? Number(selectedWeaponAmmo.qty) > 0 ? 'is-ready' : 'is-empty' : 'is-unlinked'}`
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, selectedWeaponAmmo ? '◆' : '◇'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Estado de la reserva"), /*#__PURE__*/React.createElement("strong", null, selectedWeaponAmmo ? `${selectedWeaponAmmo.name} · ${Math.max(0, Number(selectedWeaponAmmo.qty) || 0)} unidades` : 'Ningún objeto vinculado'), /*#__PURE__*/React.createElement("p", null, selectedWeaponAmmo ? 'La cantidad se comparte con la mochila y se actualiza al disparar.' : 'Selecciona arriba una pila de flechas, virotes u otra munición.')))), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("p", null, "El disparo se registra desde la tarjeta de ataque."), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setAmmoSettingsOpen(false)
      }, "Guardar y cerrar")))), document.body), /*#__PURE__*/React.createElement("section", {
        "data-tab": "combat",
        hidden: activeTab === 'combat' && combatDashboardView !== 'summary',
        className: "combat-table-hub tab-section rpg-panel"
      }, /*#__PURE__*/React.createElement("header", {
        className: "combat-table-hub-header"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
        className: "combat-table-hub-emblem",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("b", null, "✦")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Herramientas de sesión"), /*#__PURE__*/React.createElement("h2", null, "Mesa de juego"), /*#__PURE__*/React.createElement("small", null, "Conecta al grupo o prepara las criaturas del encuentro."))), /*#__PURE__*/React.createElement("span", {
        className: "combat-table-hub-rule",
        "aria-hidden": "true"
      })), /*#__PURE__*/React.createElement("div", {
        className: "combat-table-hub-grid"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: openOnlineTable,
        className: "combat-table-card is-online"
      }, /*#__PURE__*/React.createElement("span", {
        className: "combat-table-card-art",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("b", null, "◉")), /*#__PURE__*/React.createElement("span", {
        className: "combat-table-card-copy"
      }, /*#__PURE__*/React.createElement("small", null, currentRoom?.code ? 'Conexión activa' : 'Juego compartido'), /*#__PURE__*/React.createElement("strong", null, "Mesa Online"), /*#__PURE__*/React.createElement("em", null, currentRoom?.code ? `Sala ${currentRoom.code} · ${roomParticipants.length} participante${roomParticipants.length === 1 ? '' : 's'}` : 'Crea una sala o únete al código de tus compañeros.'), /*#__PURE__*/React.createElement("span", null, currentRoom?.code ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
        className: "is-live"
      }), " Abrir mesa") : 'Crear o unirse')), /*#__PURE__*/React.createElement("b", {
        className: "combat-table-card-arrow",
        "aria-hidden": "true"
      }, "→")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setDiceRollerOpen(true),
        className: "combat-table-card is-dice"
      }, /*#__PURE__*/React.createElement("span", {
        className: "combat-table-card-art",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("b", null, "20")), /*#__PURE__*/React.createElement("span", {
        className: "combat-table-card-copy"
      }, /*#__PURE__*/React.createElement("small", null, "Tiradas cinematográficas"), /*#__PURE__*/React.createElement("strong", null, "Lanzador de dados"), /*#__PURE__*/React.createElement("em", null, "Combina dados, modificadores, ventaja, desventaja y dificultad."), /*#__PURE__*/React.createElement("span", null, "Abrir lanzador")), /*#__PURE__*/React.createElement("b", {
        className: "combat-table-card-arrow",
        "aria-hidden": "true"
      }, "→")), (!currentRoom || isCurrentRoomMaster) && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setBestiaryCompendiumOpen(true),
        className: "combat-table-card is-bestiary"
      }, /*#__PURE__*/React.createElement("span", {
        className: "combat-table-card-art",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("b", null, "♜")), /*#__PURE__*/React.createElement("span", {
        className: "combat-table-card-copy"
      }, /*#__PURE__*/React.createElement("small", null, "Catálogo unificado"), /*#__PURE__*/React.createElement("strong", null, "Compendio de criaturas"), /*#__PURE__*/React.createElement("em", null, "Consulta el SRD, gestiona tus criaturas y prepara enemigos para la mesa."), /*#__PURE__*/React.createElement("span", null, srdMonsterCompendium.monsters.length, " SRD · ", bestiary.monsters.length, " propia", bestiary.monsters.length === 1 ? '' : 's')), /*#__PURE__*/React.createElement("b", {
        className: "combat-table-card-arrow",
        "aria-hidden": "true"
      }, "→"))), /*#__PURE__*/React.createElement("footer", {
        className: "combat-table-hub-footer"
      }, /*#__PURE__*/React.createElement("span", null, "✦"), /*#__PURE__*/React.createElement("p", null, "Estas herramientas apoyan la sesión sin tomar decisiones por el personaje."))), /*#__PURE__*/React.createElement(InventoryView, {
        model: {
          addCurrency,
          adjustInvQty,
          armors,
          confirmDelete,
          currency,
          diaryCategory,
          diaryOpen,
          diarySearch,
          editingDiaryEntry,
          inventory,
          sessionNotes,
          setAddModal,
          setArmors,
          setDiaryCategory,
          setDiaryOpen,
          setDiarySearch,
          setEditingDiaryEntry,
          setEquipmentCompendiumOpen,
          setInventory,
          setSessionNotes,
          setTools,
          toggleArmorEquip,
          tools,
          updateCurrencyAmount
        }
      }), /*#__PURE__*/React.createElement("div", {
        "data-tab": "character",
        className: "tab-section grid grid-cols-1 md:grid-cols-2 gap-6"
      }, /*#__PURE__*/React.createElement("div", {
        className: "rpg-panel p-4 character-traits-panel"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-section-header is-traits"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-section-heading"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-section-emblem"
      }, /*#__PURE__*/React.createElement(CharacterSectionGlyph, {
        section: "traits"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Capacidades del personaje"), /*#__PURE__*/React.createElement("h2", null, "Rasgos"))), /*#__PURE__*/React.createElement("button", {
        onClick: () => setAddModal({
          isOpen: true,
          type: 'trait',
          data: {}
        }),
        className: "character-section-action"
      }, "+ Rasgo")), /*#__PURE__*/React.createElement("div", {
        className: "space-y-3 max-h-60 overflow-y-auto pr-2"
      }, displayedTraits.map((t, idx) => /*#__PURE__*/React.createElement("div", {
        key: t.id || idx,
        className: `bg-gray-900/40 border-l-2 p-3 rounded border border-gray-800 relative group shadow-sm ${t.automatic ? 'border-l-cyan-500' : 'border-l-purple-500'}`
      }, /*#__PURE__*/React.createElement("h3", {
        className: "font-bold text-purple-200 text-sm pr-4 font-fantasy tracking-wide"
      }, t.title), /*#__PURE__*/React.createElement("p", {
        className: `text-[11px] mt-1 leading-tight whitespace-pre-wrap ${t.automatic ? 'text-cyan-100/80' : 'text-gray-400'}`
      }, t.automatic ? t.description : t.desc), !t.automatic && /*#__PURE__*/React.createElement("button", {
        onClick: () => confirmDelete(`¿Borrar rasgo "${t.title}"?`, () => setTraits(traits.filter((_, i) => i !== t.manualIndex))),
        className: "absolute top-1 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 font-bold text-lg"
      }, "×"))), displayedTraits.length === 0 && /*#__PURE__*/React.createElement("p", {
        className: "text-sm text-gray-500"
      }, "Aún no hay rasgos. Pulsa + Rasgo para añadir uno."))), /*#__PURE__*/React.createElement("div", {
        className: "rpg-panel p-4 character-feats-panel"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-section-header is-feats"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-section-heading"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-section-emblem"
      }, /*#__PURE__*/React.createElement(CharacterSectionGlyph, {
        section: "feats"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Mejoras y talentos"), /*#__PURE__*/React.createElement("h2", null, "Dotes"))), /*#__PURE__*/React.createElement("div", {
        className: "character-section-actions"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setFeatCompendiumOpen(true),
        className: "character-section-action is-compendium"
      }, "Compendio"), /*#__PURE__*/React.createElement("button", {
        onClick: () => setAddModal({
          isOpen: true,
          type: 'feat',
          data: {}
        }),
        className: "character-section-action"
      }, "+ Dote"))), /*#__PURE__*/React.createElement("div", {
        className: "space-y-3 max-h-60 overflow-y-auto pr-2"
      }, feats.map((t, idx) => /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "bg-gray-900/40 border-l-2 border-yellow-600 p-3 rounded border border-gray-800 border-l-yellow-600 relative group shadow-sm"
      }, /*#__PURE__*/React.createElement("h3", {
        className: "font-bold text-yellow-200 text-sm pr-4 font-fantasy tracking-wide"
      }, t.title), /*#__PURE__*/React.createElement("p", {
        className: "text-[11px] text-gray-400 mt-1 leading-tight whitespace-pre-wrap"
      }, t.desc), /*#__PURE__*/React.createElement("button", {
        onClick: () => confirmDelete(`¿Borrar dote "${t.title}"?`, () => setFeats(feats.filter((_, i) => i !== idx))),
        className: "absolute top-1 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 font-bold text-lg"
      }, "×"))), feats.length === 0 && /*#__PURE__*/React.createElement("p", {
        className: "text-sm text-gray-500"
      }, "Aún no hay dotes. Pulsa + Dote para añadir una.")))), /*#__PURE__*/React.createElement("div", {
        "data-tab": "grimoire",
        className: "grimoire-panel tab-section rpg-panel p-4 border border-fuchsia-900/50"
      }, /*#__PURE__*/React.createElement("div", {
        className: "grimoire-toolbar flex flex-wrap justify-between items-center mb-4 rpg-panel-header !border-l-fuchsia-500 pb-3 px-4 gap-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "grimoire-heading"
      }, /*#__PURE__*/React.createElement("span", {
        className: "grimoire-heading-emblem",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.6"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M5 4.5A3.5 3.5 0 0 1 8.5 2H19v17H8.5A3.5 3.5 0 0 0 5 22Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M5 4.5V22M9 7h6M9 11h6"
      }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Magia y preparación"), /*#__PURE__*/React.createElement("h2", null, "Libro de conjuros"))), /*#__PURE__*/React.createElement("div", {
        className: "grimoire-summary flex gap-4 items-center flex-wrap flex-1 justify-end"
      }, automaticSpells.length > 0 && /*#__PURE__*/React.createElement("span", {
        className: "text-xs text-cyan-200"
      }, "Concedidos ", automaticSpells.length), grimoireConfig.useCantripLimit && /*#__PURE__*/React.createElement("span", {
        className: "text-xs text-fuchsia-200"
      }, "Trucos ", cantripCount, "/", grimoireConfig.cantripLimit || 0), grimoireConfig.useKnownLimit && /*#__PURE__*/React.createElement("span", {
        className: "text-xs text-fuchsia-200"
      }, "Conocidos ", knownSpellCount, "/", grimoireConfig.knownLimit || 0), grimoireConfig.usePrepared && /*#__PURE__*/React.createElement("span", {
        className: "text-xs text-fuchsia-200"
      }, "Preparados ", preparedSpellCount, "/", grimoireConfig.preparedLimit || 0), spellSaveDc !== null && /*#__PURE__*/React.createElement("span", {
        className: "text-xs text-cyan-200"
      }, spellcastingAbilityName, ": CD ", spellSaveDc, " · Ataque ", formatMod(spellAttackBonus)), /*#__PURE__*/React.createElement("div", {
        className: "grimoire-actions flex items-center gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setGrimoireView('srd'),
        className: "grimoire-action is-compendium min-h-11 text-xs font-fantasy uppercase tracking-wider bg-purple-950/50 border border-purple-700 hover:bg-purple-700 text-purple-100 hover:text-white px-4 py-2 rounded transition-colors shadow-md"
      }, spellWorkflowCopy.compendium), /*#__PURE__*/React.createElement("button", {
        onClick: () => setAddModal({
          isOpen: true,
          type: 'spell',
          data: {}
        }),
        className: "grimoire-action is-add min-h-11 text-xs font-fantasy uppercase tracking-wider bg-fuchsia-900/50 border border-fuchsia-700 hover:bg-fuchsia-600 text-fuchsia-100 hover:text-white px-4 py-2 rounded transition-colors shadow-md"
      }, "+ Conjuro")))), activeConcentration && /*#__PURE__*/React.createElement("section", {
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
      }, "Finalizar concentración")), /*#__PURE__*/React.createElement("div", {
        className: "grimoire-utility-row mb-3"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setGrimoireSettingsOpen(value => !value),
        className: `grimoire-settings-toggle ${grimoireSettingsOpen ? 'is-open' : ''}`,
        "aria-expanded": grimoireSettingsOpen
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "✦"), " Configuración de lanzamiento", /*#__PURE__*/React.createElement("span", {
        className: "grimoire-settings-toggle-state"
      }, grimoireSettingsOpen ? 'Ocultar' : 'Ajustar')), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setGrimoireGuideOpen(true),
        className: "grimoire-guide-toggle",
        "aria-haspopup": "dialog"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "?"), " Cómo empezar")), grimoireSettingsOpen && /*#__PURE__*/React.createElement("section", {
        className: "grimoire-settings mb-4 text-xs"
      }, srdSpellcastingProfile && /*#__PURE__*/React.createElement("div", {
        className: "grimoire-profile-card"
      }, /*#__PURE__*/React.createElement("div", {
        className: "grimoire-profile-sigil",
        "aria-hidden": "true"
      }, "✦"), /*#__PURE__*/React.createElement("div", {
        className: "min-w-0"
      }, /*#__PURE__*/React.createElement("p", {
        className: "grimoire-profile-eyebrow"
      }, "Perfil de lanzamiento activo"), /*#__PURE__*/React.createElement("strong", {
        className: "grimoire-profile-title"
      }, srdSpellcastingProfile.name, " ", /*#__PURE__*/React.createElement("span", null, "· Nivel ", srdSpellcastingLevel)), /*#__PURE__*/React.createElement("p", {
        className: "grimoire-profile-summary"
      }, !srdProfileHasSpellcasting ? 'Esta progresión obtiene lanzamiento de conjuros en un nivel posterior.' : /*#__PURE__*/React.createElement(React.Fragment, null, srdSpellcastingProfile.mode === 'prepared' ? `Prepara hasta ${srdProfilePreparedLimit} conjuros` : `Conoce hasta ${srdProfileKnownLimit} conjuros`, srdProfileCantrips > 0 ? ` · ${srdProfileCantrips} trucos` : '', srdSpellcastingProfile.mode === 'known-pact' ? ` · Magia de pacto de nivel ${srdProfileMaxSpellLevel}` : ` · Ranuras hasta nivel ${srdProfileMaxSpellLevel}`)), srdSpellcastingProfile.listNote && /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-[11px] text-yellow-200/80"
      }, srdSpellcastingProfile.listNote)), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setGrimoireConfig(previous => ({
          ...previous,
          srdProfileKey: ''
        })),
        className: "grimoire-profile-recalculate"
      }, "Recalcular")), !srdSpellcastingProfile && String(charInfo.cls || '').trim() && /*#__PURE__*/React.createElement("p", {
        className: "grimoire-manual-notice"
      }, "No hay un perfil automático para esta clase. La configuración manual del Grimorio sigue disponible."), /*#__PURE__*/React.createElement("div", {
        className: "grimoire-settings-grid"
      }, /*#__PURE__*/React.createElement("label", {
        className: "grimoire-ability-card"
      }, /*#__PURE__*/React.createElement("span", {
        className: "grimoire-setting-kicker"
      }, "Canalización"), /*#__PURE__*/React.createElement("span", {
        className: "grimoire-setting-title"
      }, "Característica de lanzamiento"), /*#__PURE__*/React.createElement("select", {
        value: spellcastingAbility,
        onChange: event => setGrimoireConfig(previous => ({
          ...previous,
          spellcastingAbility: event.target.value
        })),
        className: "grimoire-setting-select"
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Sin configurar"), SPELLCASTING_ABILITIES.map(([key, name]) => /*#__PURE__*/React.createElement("option", {
        key: key,
        value: key
      }, name))), spellcastingModifier !== null && /*#__PURE__*/React.createElement("span", {
        className: "grimoire-ability-result"
      }, "Mod. ", formatMod(spellcastingModifier), " ", /*#__PURE__*/React.createElement("i", null), " CD ", spellSaveDc, " ", /*#__PURE__*/React.createElement("i", null), " Ataque ", formatMod(spellAttackBonus))), [['useKnownLimit', 'Conjuros conocidos', 'knownLimit', `Conocidos ${knownSpellCount} / ${grimoireConfig.knownLimit || 0}`], ['usePrepared', 'Conjuros preparados', 'preparedLimit', `Preparados ${preparedSpellCount} / ${grimoireConfig.preparedLimit || 0}`], ['useCantripLimit', 'Trucos conocidos', 'cantripLimit', `Trucos ${cantripCount} / ${grimoireConfig.cantripLimit || 0}`]].map(([key, label, limit, labelCount]) => /*#__PURE__*/React.createElement("label", {
        key: key,
        className: `grimoire-setting-card ${grimoireConfig[key] ? 'is-enabled' : ''}`
      }, /*#__PURE__*/React.createElement("span", {
        className: "grimoire-setting-heading"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: !!grimoireConfig[key],
        onChange: e => setGrimoireConfig(prev => ({
          ...prev,
          [key]: e.target.checked
        }))
      }), /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("span", {
        className: "grimoire-setting-description"
      }, grimoireConfig[key] ? 'Límite activo' : 'Sin límite'), grimoireConfig[key] && /*#__PURE__*/React.createElement("span", {
        className: "grimoire-setting-values"
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        placeholder: "0",
        value: grimoireConfig[limit],
        onChange: e => setGrimoireConfig(prev => ({
          ...prev,
          [limit]: handleNumInput(e.target.value)
        }))
      }), /*#__PURE__*/React.createElement("span", null, labelCount)))), /*#__PURE__*/React.createElement("label", {
        className: `grimoire-setting-card grimoire-pact-card ${grimoireConfig.usePactMagic ? 'is-enabled' : ''}`
      }, /*#__PURE__*/React.createElement("span", {
        className: "grimoire-setting-heading"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: !!grimoireConfig.usePactMagic,
        onChange: e => setGrimoireConfig(prev => ({
          ...prev,
          usePactMagic: e.target.checked
        }))
      }), /*#__PURE__*/React.createElement("span", null, "Magia de pacto")), /*#__PURE__*/React.createElement("span", {
        className: "grimoire-setting-description"
      }, grimoireConfig.usePactMagic ? 'Ranuras que se recuperan con descanso corto' : 'No utilizada'), grimoireConfig.usePactMagic && /*#__PURE__*/React.createElement("span", {
        className: "grimoire-setting-values grimoire-pact-values"
      }, /*#__PURE__*/React.createElement("input", {
        "aria-label": "Ranuras actuales de magia de pacto",
        type: "number",
        min: "0",
        value: grimoireConfig.pactSlots.current,
        onChange: e => setGrimoireConfig(prev => ({
          ...prev,
          pactSlots: {
            ...prev.pactSlots,
            current: handleNumInput(e.target.value)
          }
        }))
      }), /*#__PURE__*/React.createElement("b", null, "/"), /*#__PURE__*/React.createElement("input", {
        "aria-label": "Ranuras máximas de magia de pacto",
        type: "number",
        min: "0",
        value: grimoireConfig.pactSlots.max,
        onChange: e => setGrimoireConfig(prev => ({
          ...prev,
          pactSlots: {
            ...prev.pactSlots,
            max: handleNumInput(e.target.value)
          }
        }))
      }), /*#__PURE__*/React.createElement("span", null, "Nivel"), /*#__PURE__*/React.createElement("input", {
        "aria-label": "Nivel de ranura de magia de pacto",
        type: "number",
        min: "1",
        max: "9",
        value: grimoireConfig.pactSlots.level,
        onChange: e => setGrimoireConfig(prev => ({
          ...prev,
          pactSlots: {
            ...prev.pactSlots,
            level: handleNumInput(e.target.value)
          }
        }))
      }))))), /*#__PURE__*/React.createElement("div", {
        className: "grimoire-navigation mb-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "grimoire-view-tabs"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setGrimoireView('available'),
        className: `grimoire-view-tab ${grimoireView === 'available' ? 'is-active' : ''}`
      }, spellWorkflowCopy.ready), /*#__PURE__*/React.createElement("button", {
        onClick: () => setGrimoireView('library'),
        className: `grimoire-view-tab ${grimoireView === 'library' ? 'is-active' : ''}`
      }, spellWorkflowCopy.collection), /*#__PURE__*/React.createElement("button", {
        onClick: () => setGrimoireView('srd'),
        className: `grimoire-view-tab is-compendium ${grimoireView === 'srd' ? 'is-active' : ''}`
      }, spellWorkflowCopy.compendium)), grimoireView !== 'srd' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "grimoire-list-controls"
      }, /*#__PURE__*/React.createElement("input", {
        value: spellSearch,
        onChange: e => setSpellSearch(e.target.value),
        placeholder: "Buscar por nombre…",
        className: "min-w-[10rem] flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm"
      }), /*#__PURE__*/React.createElement("select", {
        value: spellFilter,
        onChange: e => setSpellFilter(e.target.value),
        className: "bg-gray-950 border border-gray-700 rounded px-2 text-sm"
      }, /*#__PURE__*/React.createElement("option", {
        value: "all"
      }, "Todos"), /*#__PURE__*/React.createElement("option", {
        value: "cantrip"
      }, "Trucos"), /*#__PURE__*/React.createElement("option", {
        value: "prepared"
      }, "Preparados"), /*#__PURE__*/React.createElement("option", {
        value: "ritual"
      }, "Rituales"), /*#__PURE__*/React.createElement("option", {
        value: "concentration"
      }, "Concentración"), /*#__PURE__*/React.createElement("option", {
        value: "favorite"
      }, "Favoritos"), [...new Set(grimorioSpells.map(spell => spell.level))].sort((a, b) => a - b).map(level => /*#__PURE__*/React.createElement("option", {
        key: level,
        value: level
      }, level === 0 ? 'Trucos' : `Nivel ${level}`)))))), grimoireView === 'srd' ? /*#__PURE__*/React.createElement(ArcaneCompendiumView, {
        spellLibrary: srdSpellLibrary,
        displayedSpells: displayedSrdSpells,
        addedSpells: grimorioSpells,
        profile: srdSpellcastingProfile,
        profileMaxSpellLevel: srdProfileMaxSpellLevel,
        classFilterActive: isSrdClassFilterActive,
        workflow: spellWorkflow,
        workflowDescription: spellWorkflowCopy.description,
        actionLabel: spellWorkflowCopy.action,
        search: srdSpellSearch,
        level: srdSpellLevel,
        school: srdSpellSchool,
        classFilter: srdSpellClassFilter,
        trait: srdSpellTrait,
        schools: srdSpellSchools,
        onSearchChange: setSrdSpellSearch,
        onLevelChange: setSrdSpellLevel,
        onSchoolChange: setSrdSpellSchool,
        onClassFilterChange: setSrdSpellClassFilter,
        onTraitChange: setSrdSpellTrait,
        onShowDetail: setSrdSpellDetail,
        onChooseSpell: addSpellFromSrdLibrary,
        getSpellIcon: getSpellIconPath,
        getSpellIconColor: getSpellIconColor
      }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "grimoire-slot-bar flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-gray-800"
      }, /*#__PURE__*/React.createElement("span", {
        className: "grimoire-slot-label"
      }, "Ranuras"), [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(level => showEmptySlots || Number(spellSlots[level].max) > 0).map(level => /*#__PURE__*/React.createElement("button", {
        key: level,
        onClick: () => setEditingSlotLevel(level),
        className: "grimoire-slot-chip px-3 py-2 rounded border border-gray-700 bg-gray-900 text-xs font-mono hover:border-fuchsia-500"
      }, /*#__PURE__*/React.createElement("b", {
        className: "text-fuchsia-300"
      }, "N", level), " ", spellSlots[level].current, "/", spellSlots[level].max)), /*#__PURE__*/React.createElement("button", {
        onClick: () => setShowEmptySlots(value => !value),
        className: "grimoire-empty-slots-toggle px-3 py-2 text-xs text-gray-400"
      }, showEmptySlots ? 'Ocultar niveles vacíos' : 'Mostrar niveles vacíos')), /*#__PURE__*/React.createElement("div", {
        className: "grimoire-collection-heading"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Archivo arcano"), /*#__PURE__*/React.createElement("strong", null, grimoireView === 'available' ? 'Conjuros listos' : 'Colección de conjuros')), /*#__PURE__*/React.createElement("small", null, displayedSpells.length, " ", displayedSpells.length === 1 ? 'conjuro' : 'conjuros')), /*#__PURE__*/React.createElement("div", {
        className: "spell-library-grid grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2"
      }, displayedSpells.map(sp => {
        const compStr = [sp.compV ? 'V' : null, sp.compS ? 'S' : null, sp.compM ? 'M' : null].filter(Boolean).join(', ');
        const mDesc = sp.compM && sp.compMDesc ? ` (${sp.compMDesc})` : '';
        const sourceSpell = sp.sourceId ? srdSpellLibrary.find(librarySpell => librarySpell.id === sp.sourceId) : null;
        const grantSummary = getSpellGrantSummary(sp);
        const spellIcon = getSpellIconPath(sp);
        const spellIconColor = getSpellIconColor(sp);
        return /*#__PURE__*/React.createElement("article", {
          key: sp.id,
          style: spellIconColor ? {
            '--spell-art-rgb': spellIconColor
          } : undefined,
          className: `spell-card flex flex-col p-3 rounded-lg border transition-all duration-300 ${sp.prepared ? 'is-prepared' : ''} ${sp.grantType !== 'standard' ? 'is-granted' : ''} ${sp.concentration ? 'is-concentration' : ''} ${spellIcon ? 'has-spell-art' : ''} relative group`
        }, /*#__PURE__*/React.createElement("div", {
          className: "spell-card-hero"
        }, /*#__PURE__*/React.createElement("div", {
          className: "spell-card-hero-copy"
        }, /*#__PURE__*/React.createElement("div", {
          className: "spell-card-title flex justify-between items-center mb-2"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex items-center space-x-3"
        }, /*#__PURE__*/React.createElement("span", {
          className: "spell-level-seal"
        }, sp.level === 0 ? 'T' : sp.level, /*#__PURE__*/React.createElement("small", null, sp.level === 0 ? 'Truco' : 'Nivel')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
          className: "spell-card-name"
        }, sp.name), /*#__PURE__*/React.createElement("span", {
          className: "spell-card-traits"
        }, sp.prepared && /*#__PURE__*/React.createElement("i", null, "Preparado"), sp.concentration && /*#__PURE__*/React.createElement("i", null, "Concentración"), sp.ritual && /*#__PURE__*/React.createElement("i", null, "Ritual"))))), /*#__PURE__*/React.createElement("div", {
          className: `spell-origin-block ${sp.grantType !== 'standard' ? 'is-granted' : ''}`
        }, /*#__PURE__*/React.createElement("strong", null, grantSummary.type), grantSummary.source && /*#__PURE__*/React.createElement("span", null, grantSummary.source), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, grantSummary.preparation), /*#__PURE__*/React.createElement("small", null, grantSummary.knownLimit), /*#__PURE__*/React.createElement("small", null, grantSummary.resource), sp.castingResource === 'independent' && Number(sp.ownUsesCurrent) < Number(sp.ownUsesMax) && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => restoreSpellOwnUses(sp)
        }, "Restablecer usos")))), spellIcon && /*#__PURE__*/React.createElement("figure", {
          className: "spell-card-art"
        }, /*#__PURE__*/React.createElement("img", {
          src: spellIcon,
          alt: `Icono de ${sp.name}`,
          loading: "lazy"
        }))), /*#__PURE__*/React.createElement("div", {
          className: "spell-card-details flex flex-col text-[10px] text-gray-400 font-medium mb-2 bg-gray-950/50 p-2 rounded border border-gray-800/50"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex space-x-3"
        }, sp.range && sp.range !== '-' && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
          className: "text-gray-500"
        }, "Alc:"), " ", sp.range), (sp.shape && sp.shape !== '-' || sp.size && sp.size !== '-') && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
          className: "text-gray-500"
        }, "Área:"), " ", sp.shape, " ", sp.size)), compStr && /*#__PURE__*/React.createElement("span", {
          className: "mt-1"
        }, /*#__PURE__*/React.createElement("span", {
          className: "text-gray-500"
        }, "Comp:"), " ", /*#__PURE__*/React.createElement("span", {
          className: "text-purple-300"
        }, compStr), mDesc)), /*#__PURE__*/React.createElement("p", {
          className: "spell-card-description text-[11px] text-gray-400 mt-1 leading-snug whitespace-pre-wrap"
        }, sp.description || sp.notes), /*#__PURE__*/React.createElement("div", {
          className: "spell-card-actions flex flex-wrap gap-2 mt-3"
        }, sourceSpell && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setSrdSpellDetail(sourceSpell),
          className: "spell-card-detail min-h-9 rounded border border-purple-700 px-3 text-xs text-purple-100 hover:bg-purple-950/50"
        }, "Consultar"), /*#__PURE__*/React.createElement("button", {
          onClick: () => setCastSpell(sp),
          className: "spell-card-cast min-h-9 px-3 py-1.5 rounded bg-fuchsia-800 hover:bg-fuchsia-700 text-xs text-white"
        }, "Lanzar"), !sp.automatic && grimoireConfig.useKnownLimit && sp.level > 0 && /*#__PURE__*/React.createElement("button", {
          onClick: () => toggleSpellKnown(sp),
          className: "min-h-9 px-3 py-1.5 rounded border border-gray-600 text-xs text-gray-200"
        }, sp.known ? 'Dejar de conocer' : 'Conocer'), !sp.automatic && grimoireConfig.usePrepared && sp.level > 0 && /*#__PURE__*/React.createElement("button", {
          onClick: () => toggleSpellPreparation(sp),
          className: "spell-card-prepare min-h-9 px-3 py-1.5 rounded border border-fuchsia-700 text-xs text-fuchsia-200"
        }, sp.prepared ? 'Dejar de preparar' : 'Preparar'), !sp.automatic && /*#__PURE__*/React.createElement("button", {
          onClick: () => setSpells(spells.map(item => item.id === sp.id ? {
            ...item,
            favorite: !item.favorite
          } : item)),
          className: "spell-card-favorite min-h-9 px-2 py-1.5 text-xs text-yellow-300",
          "aria-label": sp.favorite ? `Quitar ${sp.name} de favoritos` : `Añadir ${sp.name} a favoritos`
        }, sp.favorite ? '★' : '☆')), !sp.automatic && /*#__PURE__*/React.createElement("button", {
          onClick: e => {
            e.stopPropagation();
            confirmDelete(`¿Borrar hechizo "${sp.name}"?`, () => setSpells(spells.filter(s => s.id !== sp.id)));
          },
          className: "absolute top-2 right-2 text-gray-600 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 text-lg transition-opacity"
        }, "×"));
      }), grimorioSpells.length === 0 && /*#__PURE__*/React.createElement("div", {
        className: "grimoire-empty-state col-span-1 md:col-span-2 p-8 border-2 border-dashed border-gray-800 rounded-lg text-center"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-gray-500 text-sm italic font-fantasy tracking-widest uppercase"
      }, "El grimorio está vacío."), /*#__PURE__*/React.createElement("p", {
        className: "mt-2 text-xs text-gray-500 normal-case tracking-normal"
      }, "Abre el Compendio Arcano o usa + Conjuro para empezar."))))))));
    }
    window.DndCharacterWorkspaceComponents = {
      CharacterWorkspace
    };
  })();
})();