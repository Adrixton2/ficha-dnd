(() => {
  (() => {
    const {
      createDefaultCharacterBuild,
      isValidPortraitDataUrl
    } = window.DndAppUtils;
    const {
      CharacterBuildModal,
      CharacterCreationWizard
    } = window.DndCharacterBuilderComponents;
    function CharacterHeader({
      model
    }) {
      const {
        PROF_BONUS,
        SKILLS,
        activeCharacter,
        activeConcentration,
        activeSrdSubclass,
        addSuggestedClassResources,
        automaticExpertiseChoices,
        automaticExpertiseLimit,
        automaticSavingThrows,
        automaticSkillProficiencies,
        availableAutomaticRuleTraits,
        charInfo,
        characterBuild,
        characterBuildOpen,
        characterCreationWizardOpen,
        characterHeaderMenuOpen,
        characterList,
        closeLevelReview,
        companions,
        conditions,
        confirmLevelReview,
        currentSpellProgression,
        handleNumInput,
        handlePortraitFile,
        hasSkillProficiency,
        hitDice,
        hp,
        initBonus,
        lastReviewedLevel,
        level,
        levelDraft,
        levelReviewChecklist,
        levelReviewChecklistComplete,
        levelReviewChecks,
        levelReviewDelta,
        levelReviewFeatureGroups,
        levelReviewHasSpellcasting,
        levelReviewHpGain,
        levelReviewOpen,
        levelReviewProficiencyBonus,
        levelReviewRemainingExpertiseChoices,
        levelReviewStart,
        levelReviewTarget,
        normalizedCharacterLevel,
        openCompanionManager,
        openSessionMode,
        originSkillProficiencies,
        pendingAbilityImprovementLevels,
        pendingLevelChange,
        pendingResourceSuggestions,
        portraitFileRef,
        previousProficiencyBonus,
        previousSpellProgression,
        proficiencyChanged,
        remainingClassSkillChoices,
        remainingExpertiseChoices,
        removePortrait,
        requestLevelChange,
        requestTabChange,
        requiredClassSkillChoices,
        selectedClassSkillChoiceCount,
        selectedExpertiseChoiceCount,
        selectedSrdBackground,
        selectedSrdClass,
        selectedSrdSpecies,
        setActiveTab,
        setActivityHistoryOpen,
        setAppSettingsOpen,
        setCharInfo,
        setCharacterBuild,
        setCharacterBuildOpen,
        setCharacterCreationWizardOpen,
        setCharacterHeaderMenuOpen,
        setCharacterManagerOpen,
        setCombatDashboardView,
        setHitDice,
        setHp,
        setInitBonus,
        setLevel,
        setLevelDraft,
        setLevelReviewChecks,
        setLevelReviewHpGain,
        setLevelReviewOpen,
        setPortraitViewerOpen,
        setPrintPreviewOpen,
        setRestModalOpen,
        setRestType,
        setSheetReviewOpen,
        setSize,
        setSpeed,
        setStats,
        sheetFeedback,
        sheetReview,
        size,
        skillProficiencySources,
        speed,
        spellSlotChanges,
        srdCharacterRules,
        srdProfileCantrips,
        srdProfileHasSpellcasting,
        srdProfileKnownLimit,
        srdProfileMaxSpellLevel,
        srdProfilePreparedLimit,
        srdSpellcastingProfile,
        stats
      } = model;
      const accountUser = window.firebaseConnectionState?.user;
      const accountIsGuest = accountUser?.isAnonymous !== false;
      const openAccountPanel = () => {
        setCharacterHeaderMenuOpen(false);
        window.dispatchEvent(new CustomEvent('dnd-open-account-panel'));
      };
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        "data-tab": "character",
        className: "character-tab-intro tab-section"
      }, /*#__PURE__*/React.createElement("div", {
        className: `character-header character-identity-hero rpg-panel p-4 flex flex-col gap-3 relative sheet-feedback-${sheetFeedback}`,
        "data-accent": "violet"
      }, /*#__PURE__*/React.createElement("div", {
        className: "glass-overlay"
      }), /*#__PURE__*/React.createElement("input", {
        ref: portraitFileRef,
        type: "file",
        accept: "image/png,image/jpeg,image/webp",
        onChange: handlePortraitFile,
        className: "hidden"
      }), /*#__PURE__*/React.createElement("div", {
        className: "character-header-menu z-30"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setCharacterHeaderMenuOpen(value => !value),
        className: "character-header-menu-toggle",
        "aria-expanded": characterHeaderMenuOpen,
        "aria-label": "Abrir acciones de personaje"
      }, "⋯"), characterHeaderMenuOpen && ReactDOM.createPortal(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "character-header-menu-scrim",
        onClick: () => setCharacterHeaderMenuOpen(false),
        "aria-label": "Cerrar menú de personaje"
      }), /*#__PURE__*/React.createElement("aside", {
        className: "character-header-menu-panel",
        "data-accent": "violet",
        role: "menu",
        "aria-label": "Acciones de personaje"
      }, /*#__PURE__*/React.createElement("header", {
        className: "character-header-menu-profile"
      }, /*#__PURE__*/React.createElement("div", null, isValidPortraitDataUrl(activeCharacter.meta.portrait) ? /*#__PURE__*/React.createElement("img", {
        src: activeCharacter.meta.portrait,
        alt: ""
      }) : /*#__PURE__*/React.createElement("span", null, (charInfo.name || 'PJ').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()), /*#__PURE__*/React.createElement("i", null, (charInfo.cls || 'PJ').trim().slice(0, 2).toUpperCase())), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("small", null, "Ficha activa"), /*#__PURE__*/React.createElement("strong", null, charInfo.name || 'Personaje sin nombre'), /*#__PURE__*/React.createElement("p", null, [charInfo.race, charInfo.cls, `Nivel ${normalizedCharacterLevel}`].filter(Boolean).join(' · '))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setCharacterHeaderMenuOpen(false),
        "aria-label": "Cerrar menú"
      }, "×")), /*#__PURE__*/React.createElement("div", {
        className: "character-header-menu-groups"
      }, /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h3", null, "Personaje"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        role: "menuitem",
        onClick: () => {
          setCharacterBuildOpen(true);
          setCharacterHeaderMenuOpen(false);
        }
      }, /*#__PURE__*/React.createElement("span", null, "✦"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Personalizar personaje"), /*#__PURE__*/React.createElement("small", null, "Clase, especie y construcción"))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        role: "menuitem",
        className: lastReviewedLevel < normalizedCharacterLevel ? 'has-notice' : '',
        onClick: () => {
          setLevelReviewHpGain('');
          setLevelReviewChecks({});
          setLevelReviewOpen(true);
          setCharacterHeaderMenuOpen(false);
        }
      }, /*#__PURE__*/React.createElement("span", null, "↑"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, lastReviewedLevel < normalizedCharacterLevel ? `Revisar nivel ${normalizedCharacterLevel}` : 'Nivel revisado'), /*#__PURE__*/React.createElement("small", null, lastReviewedLevel < normalizedCharacterLevel ? 'Hay cambios pendientes' : 'Progreso comprobado')), lastReviewedLevel < normalizedCharacterLevel && /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("button", {
        type: "button",
        role: "menuitem",
        className: sheetReview.importantCount ? 'has-notice' : '',
        onClick: () => {
          setSheetReviewOpen(true);
          setCharacterHeaderMenuOpen(false);
        }
      }, /*#__PURE__*/React.createElement("span", null, "✓"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Revisar ficha completa"), /*#__PURE__*/React.createElement("small", null, sheetReview.issues.length ? `${sheetReview.issues.length} aviso${sheetReview.issues.length === 1 ? '' : 's'} detectado${sheetReview.issues.length === 1 ? '' : 's'}` : 'Sin avisos detectados')), sheetReview.importantCount > 0 && /*#__PURE__*/React.createElement("i", null)))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h3", null, "Sesión"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        role: "menuitem",
        className: "character-header-menu-primary",
        onClick: openSessionMode
      }, /*#__PURE__*/React.createElement("span", null, "◆"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Abrir modo sesión"), /*#__PURE__*/React.createElement("small", null, "Todo lo necesario para jugar")), /*#__PURE__*/React.createElement("b", null, "→")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        role: "menuitem",
        onClick: () => {
          setRestModalOpen(true);
          setRestType(null);
          setCharacterHeaderMenuOpen(false);
        }
      }, /*#__PURE__*/React.createElement("span", null, "☾"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Descansar"), /*#__PURE__*/React.createElement("small", null, "Recuperar vida y recursos"))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        role: "menuitem",
        onClick: () => {
          setActivityHistoryOpen(true);
          setCharacterHeaderMenuOpen(false);
        }
      }, /*#__PURE__*/React.createElement("span", null, "≡"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Historial"), /*#__PURE__*/React.createElement("small", null, "Consultar cambios recientes"))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        role: "menuitem",
        onClick: () => {
          setAppSettingsOpen(true);
          setCharacterHeaderMenuOpen(false);
        }
      }, /*#__PURE__*/React.createElement("span", null, "⚙"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Configuración"), /*#__PURE__*/React.createElement("small", null, "Tema, idioma y accesibilidad"))))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h3", null, "Herramientas"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        role: "menuitem",
        onClick: () => {
          setPrintPreviewOpen(true);
          setCharacterHeaderMenuOpen(false);
        }
      }, /*#__PURE__*/React.createElement("span", null, "▤"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Vista imprimible"), /*#__PURE__*/React.createElement("small", null, "Ficha preparada para papel"))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        role: "menuitem",
        className: `character-header-account-action ${accountIsGuest ? 'is-guest' : 'is-synced'}`,
        onClick: openAccountPanel
      }, /*#__PURE__*/React.createElement("span", null, accountIsGuest ? '◇' : '✓'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Cuenta y privacidad"), /*#__PURE__*/React.createElement("small", null, accountIsGuest ? 'Invitado · Solo en este dispositivo' : 'Sincronizado · Cuenta protegida')))))), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        role: "menuitem",
        onClick: () => {
          setCharacterManagerOpen(true);
          setCharacterHeaderMenuOpen(false);
        },
        className: "character-header-menu-primary"
      }, /*#__PURE__*/React.createElement("span", null, "⇄"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Cambiar personaje"), /*#__PURE__*/React.createElement("small", null, characterList.length, " ficha", characterList.length === 1 ? '' : 's', " disponible", characterList.length === 1 ? '' : 's')), /*#__PURE__*/React.createElement("b", null, "→"))))), document.body)), /*#__PURE__*/React.createElement("div", {
        className: "character-header-content z-10 flex flex-1 min-w-0 w-full flex-row items-start gap-3 pr-12"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-portrait-stack shrink-0 flex flex-col items-center gap-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-class-sigil",
        "aria-hidden": "true"
      }, (charInfo.cls || 'PJ').trim().slice(0, 2).toLocaleUpperCase('es')), isValidPortraitDataUrl(activeCharacter.meta.portrait) ? /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setPortraitViewerOpen(true),
        className: "character-portrait w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-purple-500/70 bg-gray-900 shadow-[0_0_16px_rgba(168,85,247,0.25)] hover:border-purple-300 focus-visible:outline-purple-300",
        "aria-label": `Ampliar retrato de ${charInfo.name || 'personaje'}`
      }, /*#__PURE__*/React.createElement("img", {
        src: activeCharacter.meta.portrait,
        alt: `Retrato de ${charInfo.name || 'personaje'}`,
        className: "w-full h-full object-cover"
      })) : /*#__PURE__*/React.createElement("div", {
        className: "character-portrait w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-purple-500/70 bg-gray-900 shadow-[0_0_16px_rgba(168,85,247,0.25)] flex items-center justify-center"
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        className: "w-10 h-10 text-purple-400/70",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "8",
        r: "3.5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M4.5 20c.8-3.8 3.2-5.8 7.5-5.8s6.7 2 7.5 5.8"
      }))), isValidPortraitDataUrl(activeCharacter.meta.portrait) ? /*#__PURE__*/React.createElement("div", {
        className: "character-portrait-actions flex gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        title: "Cambiar retrato",
        "aria-label": "Cambiar retrato",
        onClick: () => portraitFileRef.current?.click(),
        className: "is-change min-h-9 px-2 py-1 rounded border border-purple-700 bg-purple-950/50 hover:bg-purple-900 text-purple-100 text-[9px] font-fantasy uppercase tracking-wider"
      }, /*#__PURE__*/React.createElement("span", null, "Cambiar"), /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M4 16v4h4M20 8V4h-4M5.5 9A7 7 0 0 1 17 5.5L20 8M18.5 15A7 7 0 0 1 7 18.5L4 16"
      }))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        title: "Eliminar retrato",
        "aria-label": "Eliminar retrato",
        onClick: removePortrait,
        className: "is-remove min-h-9 px-2 py-1 rounded border border-red-800 bg-red-950/50 hover:bg-red-900 text-red-200 text-[9px] font-fantasy uppercase tracking-wider"
      }, /*#__PURE__*/React.createElement("span", null, "Eliminar"), /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6"
      })))) : /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => portraitFileRef.current?.click(),
        className: "character-portrait-add min-h-9 px-3 py-1 rounded border border-purple-700 bg-purple-950/50 hover:bg-purple-900 text-purple-100 text-[9px] font-fantasy uppercase tracking-wider"
      }, "Añadir retrato")), /*#__PURE__*/React.createElement("div", {
        className: "character-identity flex-1 min-w-0 w-full"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-identity-kicker"
      }, "Ficha de personaje"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Ej: Kael Velosombrío",
        value: charInfo.name,
        onChange: e => setCharInfo({
          ...charInfo,
          name: e.target.value
        }),
        className: "character-name-input font-fantasy text-3xl md:text-4xl font-bold text-transparent placeholder:text-gray-500 bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 tracking-wider bg-transparent border-b border-transparent hover:border-gray-600 focus:border-purple-500 outline-none w-full max-w-[400px] transition-colors"
      }), /*#__PURE__*/React.createElement("div", {
        className: "character-meta flex items-center flex-wrap text-purple-400 font-medium text-sm md:text-base mt-2 font-fantasy tracking-widest gap-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-meta-item character-meta-tooltip min-w-16 uppercase text-purple-300",
        tabIndex: "0",
        "data-tooltip": charInfo.race || 'Especie',
        "aria-label": `Especie: ${charInfo.race || 'Sin especificar'}`
      }, /*#__PURE__*/React.createElement("small", null, "Especie"), /*#__PURE__*/React.createElement("strong", null, charInfo.race || 'Sin definir')), /*#__PURE__*/React.createElement("span", {
        className: "character-meta-separator text-gray-500"
      }, "|"), /*#__PURE__*/React.createElement("span", {
        className: "character-meta-item character-meta-tooltip is-class min-w-20 uppercase text-purple-300",
        tabIndex: "0",
        "data-tooltip": charInfo.cls || 'Clase',
        "aria-label": `Clase y subclase: ${charInfo.cls || 'Sin especificar'}`
      }, /*#__PURE__*/React.createElement("small", null, "Clase"), /*#__PURE__*/React.createElement("strong", null, charInfo.cls || 'Sin definir')), /*#__PURE__*/React.createElement("span", {
        className: "character-meta-separator text-gray-500"
      }, "|"), /*#__PURE__*/React.createElement("span", {
        className: "character-meta-level-group"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-meta-item character-level uppercase flex items-center"
      }, /*#__PURE__*/React.createElement("small", null, "Nivel"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "1",
        max: "20",
        value: levelDraft,
        onChange: event => setLevelDraft(event.target.value.replace(/\D/g, '')),
        onKeyDown: event => {
          if (event.key === 'Enter') {
            event.preventDefault();
            requestLevelChange();
            event.currentTarget.blur();
          }
          if (event.key === 'Escape') {
            setLevelDraft(String(level));
            event.currentTarget.blur();
          }
        },
        className: "w-10 mx-1 bg-transparent border-b border-purple-500 text-center outline-none text-white focus:bg-gray-800 rounded font-sans"
      }), String(levelDraft || '') !== String(level || '') && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: requestLevelChange,
        className: "character-level-confirm",
        "aria-label": `Confirmar nivel ${levelDraft || level}`
      }, "Confirmar")), /*#__PURE__*/React.createElement("span", {
        className: "character-proficiency-badge bg-purple-900/40 border border-purple-500 text-fuchsia-300 px-2 py-0.5 text-xs font-bold font-sans shadow-inner whitespace-nowrap"
      }, /*#__PURE__*/React.createElement("small", null, "Competencia"), /*#__PURE__*/React.createElement("strong", null, "+", PROF_BONUS)))), /*#__PURE__*/React.createElement("div", {
        className: "character-live-summary",
        "aria-label": "Estado actual del personaje"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, hp.current || 0), "/", hp.max || 0, " PV", Number(hp.temp) > 0 ? ` · ${hp.temp} temporales` : ''), activeConcentration && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => requestTabChange('combat')
      }, /*#__PURE__*/React.createElement("i", null, "C"), activeConcentration.spellName), conditions.slice(0, 2).map(condition => /*#__PURE__*/React.createElement("button", {
        type: "button",
        key: typeof condition === 'string' ? condition : condition.name,
        onClick: () => {
          setCombatDashboardView('conditions');
          requestTabChange('combat');
        }
      }, typeof condition === 'string' ? condition : condition.name)), conditions.length > 2 && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          setCombatDashboardView('conditions');
          requestTabChange('combat');
        }
      }, "+", conditions.length - 2), companions.length > 0 && /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "character-companion-shortcut",
        onClick: () => openCompanionManager()
      }, /*#__PURE__*/React.createElement("i", null, "✦"), companions.length, " compañero", companions.length === 1 ? '' : 's'), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "character-session-shortcut",
        onClick: openSessionMode
      }, /*#__PURE__*/React.createElement("i", null, "◆"), "Modo sesión")), /*#__PURE__*/React.createElement(CharacterBuildModal, {
        isOpen: characterBuildOpen,
        onClose: () => setCharacterBuildOpen(false),
        normalizedCharacterLevel: normalizedCharacterLevel,
        remainingClassSkillChoices: remainingClassSkillChoices,
        remainingExpertiseChoices: remainingExpertiseChoices,
        characterBuild: characterBuild,
        charInfo: charInfo,
        srdCharacterRules: srdCharacterRules,
        selectedSrdClass: selectedSrdClass,
        activeSrdSubclass: activeSrdSubclass,
        selectedSrdSpecies: selectedSrdSpecies,
        selectedSrdBackground: selectedSrdBackground,
        originSkillProficiencies: originSkillProficiencies,
        skillProficiencySources: skillProficiencySources,
        automaticSavingThrows: automaticSavingThrows,
        automaticExpertiseChoices: automaticExpertiseChoices,
        proficiencyBonus: PROF_BONUS,
        automaticSkillProficiencies: automaticSkillProficiencies,
        availableAutomaticRuleTraits: availableAutomaticRuleTraits,
        skills: SKILLS,
        requiredClassSkillChoices: requiredClassSkillChoices,
        selectedClassSkillChoiceCount: selectedClassSkillChoiceCount,
        automaticExpertiseLimit: automaticExpertiseLimit,
        selectedExpertiseChoiceCount: selectedExpertiseChoiceCount,
        hasSkillProficiency: hasSkillProficiency,
        createDefaultCharacterBuild: createDefaultCharacterBuild,
        setCharInfo: setCharInfo,
        setCharacterBuild: setCharacterBuild
      }), CharacterCreationWizard && /*#__PURE__*/React.createElement(CharacterCreationWizard, {
        key: `character-creation-${activeCharacter.meta.id}`,
        isOpen: characterCreationWizardOpen,
        onClose: () => setCharacterCreationWizardOpen(false),
        charInfo: charInfo,
        level: level,
        characterBuild: characterBuild,
        srdCharacterRules: srdCharacterRules,
        selectedSrdClass: selectedSrdClass,
        activeSrdSubclass: activeSrdSubclass,
        selectedSrdSpecies: selectedSrdSpecies,
        selectedSrdBackground: selectedSrdBackground,
        originSkillProficiencies: originSkillProficiencies,
        skillProficiencySources: skillProficiencySources,
        automaticSavingThrows: automaticSavingThrows,
        automaticExpertiseChoices: automaticExpertiseChoices,
        proficiencyBonus: PROF_BONUS,
        hp: hp,
        hitDice: hitDice,
        speed: speed,
        size: size,
        initBonus: initBonus,
        stats: stats,
        srdProfileHasSpellcasting: srdProfileHasSpellcasting,
        srdSpellcastingProfile: srdSpellcastingProfile,
        srdProfileCantrips: srdProfileCantrips,
        srdProfileKnownLimit: srdProfileKnownLimit,
        srdProfilePreparedLimit: srdProfilePreparedLimit,
        srdProfileMaxSpellLevel: srdProfileMaxSpellLevel,
        onOpenGrimoire: () => {
          setCharacterCreationWizardOpen(false);
          setActiveTab('grimoire');
        },
        skills: SKILLS,
        remainingClassSkillChoices: remainingClassSkillChoices,
        remainingExpertiseChoices: remainingExpertiseChoices,
        requiredClassSkillChoices: requiredClassSkillChoices,
        selectedClassSkillChoiceCount: selectedClassSkillChoiceCount,
        automaticExpertiseLimit: automaticExpertiseLimit,
        selectedExpertiseChoiceCount: selectedExpertiseChoiceCount,
        automaticSkillProficiencies: automaticSkillProficiencies,
        availableAutomaticRuleTraits: availableAutomaticRuleTraits,
        hasSkillProficiency: hasSkillProficiency,
        createDefaultCharacterBuild: createDefaultCharacterBuild,
        normalizeNumberInput: handleNumInput,
        setCharInfo: setCharInfo,
        setLevel: setLevel,
        setCharacterBuild: setCharacterBuild,
        setHp: setHp,
        setHitDice: setHitDice,
        setSpeed: setSpeed,
        setSize: setSize,
        setInitBonus: setInitBonus,
        setStats: setStats
      }), levelReviewOpen && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
        className: "character-build-modal-backdrop",
        role: "presentation",
        onMouseDown: event => {
          if (event.target === event.currentTarget) closeLevelReview();
        }
      }, /*#__PURE__*/React.createElement("section", {
        className: "rpg-panel level-review-modal border border-cyan-700",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "level-review-title"
      }, /*#__PURE__*/React.createElement("header", {
        className: "level-review-heading flex items-start justify-between gap-3 border-b border-cyan-900/70 px-4 py-3 sm:px-5"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
        className: "text-[10px] font-bold uppercase tracking-wider text-cyan-300"
      }, pendingLevelChange ? 'Confirmar subida' : 'Subida guiada'), /*#__PURE__*/React.createElement("h3", {
        id: "level-review-title",
        className: "mt-1 font-fantasy text-lg font-bold uppercase tracking-wider text-white"
      }, pendingLevelChange ? `Nivel ${levelReviewStart} → ${levelReviewTarget}` : `Revisión de nivel ${levelReviewTarget}`), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-gray-400"
      }, levelReviewDelta ? `Cambios desde el nivel ${levelReviewStart || 'inicial'}. Revisa cada apartado antes de confirmar.` : 'Este nivel ya está revisado. Puedes consultar de nuevo su estado sin aplicar cambios.')), /*#__PURE__*/React.createElement("div", {
        className: "level-review-heading-actions"
      }, levelReviewDelta > 0 && /*#__PURE__*/React.createElement("div", {
        className: "level-review-progress",
        "aria-label": `${levelReviewChecklist.filter(item => levelReviewChecks[item.key]).length} de ${levelReviewChecklist.length} apartados revisados`
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
        style: {
          width: `${levelReviewChecklist.length ? levelReviewChecklist.filter(item => levelReviewChecks[item.key]).length / levelReviewChecklist.length * 100 : 0}%`
        }
      })), /*#__PURE__*/React.createElement("strong", null, levelReviewChecklist.filter(item => levelReviewChecks[item.key]).length, "/", levelReviewChecklist.length), /*#__PURE__*/React.createElement("small", null, "revisados")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: closeLevelReview,
        className: "flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-600 text-xl text-gray-200",
        "aria-label": "Cerrar revisión de nivel"
      }, "×"))), /*#__PURE__*/React.createElement("div", {
        className: "level-review-body space-y-3 p-4 sm:p-5"
      }, levelReviewDelta > 0 && /*#__PURE__*/React.createElement("section", {
        className: "level-review-checklist rounded border border-cyan-800 bg-cyan-950/15 p-3"
      }, /*#__PURE__*/React.createElement("h4", {
        className: "text-xs font-bold uppercase tracking-wider text-cyan-200"
      }, "Lista de confirmación"), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-gray-400"
      }, "Marca cada apartado después de revisarlo. Marcarlo no aplica elecciones automáticamente."), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 grid gap-2 sm:grid-cols-2"
      }, levelReviewChecklist.map(item => /*#__PURE__*/React.createElement("label", {
        key: item.key,
        className: `flex min-h-10 items-center gap-2 rounded border px-3 py-2 text-xs ${levelReviewChecks[item.key] ? 'border-emerald-700 bg-emerald-950/20 text-emerald-100' : 'border-gray-700 bg-gray-950/40 text-gray-300'}`
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: !!levelReviewChecks[item.key],
        onChange: event => setLevelReviewChecks(previous => ({
          ...previous,
          [item.key]: event.target.checked
        }))
      }), /*#__PURE__*/React.createElement("span", null, item.label))))), /*#__PURE__*/React.createElement("section", {
        className: "level-review-metrics grid gap-2 sm:grid-cols-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: `rounded border p-3 ${proficiencyChanged ? 'border-cyan-700 bg-cyan-950/20' : 'border-gray-700 bg-gray-900/50'}`
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-bold uppercase tracking-wider text-gray-400"
      }, "Bono de competencia"), /*#__PURE__*/React.createElement("strong", {
        className: "mt-1 block text-lg text-white"
      }, "+", levelReviewProficiencyBonus), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-gray-400"
      }, proficiencyChanged && levelReviewStart > 0 ? `Antes: +${previousProficiencyBonus}.` : 'Calculado por el nivel.')), /*#__PURE__*/React.createElement("div", {
        className: "rounded border border-cyan-800 bg-cyan-950/15 p-3"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-bold uppercase tracking-wider text-gray-400"
      }, "Dados de golpe"), /*#__PURE__*/React.createElement("strong", {
        className: "mt-1 block text-lg text-white"
      }, levelReviewTarget, selectedSrdClass?.hitDie || hitDice.type || ' dados'), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-gray-400"
      }, levelReviewDelta ? `Al confirmar se añaden ${levelReviewDelta} dado${levelReviewDelta === 1 ? '' : 's'} disponible${levelReviewDelta === 1 ? '' : 's'}, sin superar el máximo.` : 'Sin dados nuevos pendientes.')), /*#__PURE__*/React.createElement("label", {
        className: "rounded border border-red-800 bg-red-950/15 p-3"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-bold uppercase tracking-wider text-red-200"
      }, "Aumento de PV"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        inputMode: "numeric",
        value: levelReviewHpGain,
        onChange: event => setLevelReviewHpGain(event.target.value === '' ? '' : String(Math.max(0, Math.trunc(Number(event.target.value) || 0)))),
        placeholder: "0",
        className: "mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-center text-lg font-bold text-white outline-none focus:border-red-500"
      }), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-gray-400"
      }, "Escribe el total acordado. Solo se suma al confirmar."))), levelReviewFeatureGroups.length > 0 ? /*#__PURE__*/React.createElement("section", {
        className: "rounded border border-purple-800 bg-purple-950/15 p-3"
      }, /*#__PURE__*/React.createElement("h4", {
        className: "text-xs font-bold uppercase tracking-wider text-purple-200"
      }, "Rasgos nuevos"), /*#__PURE__*/React.createElement("div", {
        className: "mt-2 space-y-2"
      }, levelReviewFeatureGroups.map(group => /*#__PURE__*/React.createElement("div", {
        key: group.label
      }, /*#__PURE__*/React.createElement("p", {
        className: "text-[10px] font-bold uppercase tracking-wider text-gray-400"
      }, group.label), /*#__PURE__*/React.createElement("div", {
        className: "mt-1 flex flex-wrap gap-1.5"
      }, group.features.map(feature => /*#__PURE__*/React.createElement("span", {
        key: feature.id,
        className: "rounded border border-purple-700 bg-purple-950/25 px-2 py-1 text-xs text-purple-100"
      }, "Nv. ", feature.level, " · ", feature.name)))))), /*#__PURE__*/React.createElement("p", {
        className: "mt-3 text-xs text-gray-400"
      }, characterBuild?.autoFeatures !== false ? 'Los rasgos registrados ya aparecen automáticamente en la ficha.' : 'Los rasgos automáticos están en pausa; actívalos desde Personalizar si quieres mostrarlos.')) : /*#__PURE__*/React.createElement("section", {
        className: "rounded border border-gray-700 bg-gray-900/50 p-3 text-sm text-gray-400"
      }, "No hay rasgos nuevos registrados entre estos niveles."), /*#__PURE__*/React.createElement("section", {
        className: `rounded border p-3 ${pendingResourceSuggestions.length ? 'border-yellow-800 bg-yellow-950/20' : 'border-gray-700 bg-gray-900/50'}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap items-start justify-between gap-2"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
        className: "text-xs font-bold uppercase tracking-wider text-yellow-200"
      }, "Recursos y usos máximos"), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-gray-400"
      }, pendingResourceSuggestions.length ? `${pendingResourceSuggestions.length} recurso${pendingResourceSuggestions.length === 1 ? '' : 's'} necesita revisión.` : 'Los recursos sugeridos ya coinciden con este nivel.')), pendingResourceSuggestions.length > 0 && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: addSuggestedClassResources,
        className: "min-h-10 rounded border border-yellow-700 px-3 text-xs font-bold text-yellow-100"
      }, "Revisar recursos")), pendingResourceSuggestions.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: "mt-2 flex flex-wrap gap-1.5"
      }, pendingResourceSuggestions.map(resource => /*#__PURE__*/React.createElement("span", {
        key: resource.key,
        className: "rounded border border-yellow-800 px-2 py-1 text-xs text-yellow-100"
      }, resource.name, ": máx. ", resource.max, resource.type ? ` ${resource.type}` : '')))), levelReviewHasSpellcasting && /*#__PURE__*/React.createElement("section", {
        className: "rounded border border-fuchsia-800 bg-fuchsia-950/15 p-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap items-start justify-between gap-2"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
        className: "text-xs font-bold uppercase tracking-wider text-fuchsia-200"
      }, "Ranuras y conjuros"), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-sm text-gray-200"
      }, srdSpellcastingProfile?.mode === 'prepared' ? `Preparados: ${previousSpellProgression.prepared} → ${currentSpellProgression.prepared}` : `Conocidos: ${previousSpellProgression.known} → ${currentSpellProgression.known}`, " · Trucos: ", previousSpellProgression.cantrips, " → ", currentSpellProgression.cantrips, ".")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          setLevelReviewOpen(false);
          requestTabChange('grimoire');
        },
        className: "min-h-10 rounded border border-fuchsia-700 px-3 text-xs font-bold text-fuchsia-100"
      }, "Abrir Grimorio")), /*#__PURE__*/React.createElement("div", {
        className: "mt-2 flex flex-wrap gap-1.5"
      }, spellSlotChanges.map(slot => /*#__PURE__*/React.createElement("span", {
        key: slot.level,
        className: "rounded border border-fuchsia-800 px-2 py-1 text-xs text-fuchsia-100"
      }, "Nivel ", slot.level, ": ", slot.previous, " → ", slot.current)), currentSpellProgression.pact && /*#__PURE__*/React.createElement("span", {
        className: "rounded border border-yellow-800 px-2 py-1 text-xs text-yellow-100"
      }, "Pacto: ", previousSpellProgression.pact?.[0] || 0, " ranuras N", previousSpellProgression.pact?.[1] || '—', " → ", currentSpellProgression.pact[0], " ranuras N", currentSpellProgression.pact[1]), !spellSlotChanges.length && !currentSpellProgression.pact && /*#__PURE__*/React.createElement("span", {
        className: "text-xs text-gray-400"
      }, "Sin cambios de ranuras en este tramo.")), /*#__PURE__*/React.createElement("p", {
        className: "mt-2 text-xs text-gray-400"
      }, "Los límites y máximos técnicos se sincronizan; tú decides qué conjuros aprender o preparar.")), /*#__PURE__*/React.createElement("section", {
        className: `rounded border p-3 ${pendingAbilityImprovementLevels.length ? 'border-amber-700 bg-amber-950/20' : 'border-gray-700 bg-gray-900/50'}`
      }, /*#__PURE__*/React.createElement("h4", {
        className: "text-xs font-bold uppercase tracking-wider text-amber-200"
      }, "Mejoras de característica o dotes"), pendingAbilityImprovementLevels.length ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-sm text-white"
      }, "Decisión pendiente en nivel", pendingAbilityImprovementLevels.length === 1 ? '' : 'es', " ", pendingAbilityImprovementLevels.join(', '), "."), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-gray-400"
      }, "La app no elegirá ni aplicará ninguna mejora o dote. Haz tu elección en Atributos o Dotes y confirma después.")) : /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-gray-400"
      }, "No se cruza ningún nivel de mejora en esta revisión.")), (remainingClassSkillChoices > 0 || levelReviewRemainingExpertiseChoices > 0) && /*#__PURE__*/React.createElement("section", {
        className: "rounded border border-yellow-800 bg-yellow-950/20 p-3"
      }, /*#__PURE__*/React.createElement("h4", {
        className: "text-xs font-bold uppercase tracking-wider text-yellow-200"
      }, "Otras elecciones pendientes"), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-sm text-gray-200"
      }, [remainingClassSkillChoices > 0 && `${remainingClassSkillChoices} competencia${remainingClassSkillChoices === 1 ? '' : 's'} de clase`, levelReviewRemainingExpertiseChoices > 0 && `${levelReviewRemainingExpertiseChoices} opción${levelReviewRemainingExpertiseChoices === 1 ? '' : 'es'} de pericia`].filter(Boolean).join(' · '), "."))), /*#__PURE__*/React.createElement("footer", {
        className: "level-review-footer flex flex-wrap items-center justify-between gap-2 border-t border-gray-700 px-4 py-3 sm:px-5"
      }, /*#__PURE__*/React.createElement("p", {
        className: "text-xs text-gray-500"
      }, "Confirmar aplica el nuevo nivel, los PV escritos y los dados de golpe disponibles; las decisiones siguen siendo manuales."), /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          setLevelReviewOpen(false);
          setCharacterBuildOpen(true);
        },
        className: "min-h-11 rounded border border-gray-600 px-4 text-sm text-gray-200"
      }, "Personalizar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: confirmLevelReview,
        disabled: !levelReviewDelta || !levelReviewChecklistComplete,
        className: "min-h-11 rounded border border-cyan-700 bg-cyan-950/30 px-4 text-sm font-bold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
      }, levelReviewChecklistComplete ? pendingLevelChange ? `Subir a nivel ${levelReviewTarget}` : 'Confirmar revisión' : `Revisa ${levelReviewChecklist.filter(item => !levelReviewChecks[item.key]).length} apartado${levelReviewChecklist.filter(item => !levelReviewChecks[item.key]).length === 1 ? '' : 's'}`))))), document.body))))), sheetReview.issues.length > 0 && /*#__PURE__*/React.createElement("button", {
        type: "button",
        "data-tab": "character",
        onClick: () => setSheetReviewOpen(true),
        className: `sheet-review-strip tab-section is-${sheetReview.status}`,
        "aria-label": `Abrir revisión de ficha: ${sheetReview.issues.length} avisos`
      }, /*#__PURE__*/React.createElement("span", {
        className: "sheet-review-strip__emblem",
        "aria-hidden": "true"
      }, sheetReview.status === 'ready' ? '✓' : sheetReview.status === 'attention' ? '!' : '◇'), /*#__PURE__*/React.createElement("span", {
        className: "sheet-review-strip__copy"
      }, /*#__PURE__*/React.createElement("small", null, "Comprobación de ficha"), /*#__PURE__*/React.createElement("strong", null, sheetReview.status === 'ready' ? 'Sin avisos detectados' : sheetReview.importantCount ? `${sheetReview.importantCount} dato${sheetReview.importantCount === 1 ? '' : 's'} importante${sheetReview.importantCount === 1 ? '' : 's'} por revisar` : `${sheetReview.noticeCount} recordatorio${sheetReview.noticeCount === 1 ? '' : 's'}`), /*#__PURE__*/React.createElement("em", null, sheetReview.status === 'ready' ? 'Los datos esenciales y contadores son coherentes.' : 'Pulsa para ver cada aviso y llegar directamente a su sección.')), /*#__PURE__*/React.createElement("span", {
        className: "sheet-review-strip__progress"
      }, /*#__PURE__*/React.createElement("i", null, /*#__PURE__*/React.createElement("b", {
        style: {
          width: `${sheetReview.totalChecks ? sheetReview.passedChecks / sheetReview.totalChecks * 100 : 100}%`
        }
      })), /*#__PURE__*/React.createElement("small", null, sheetReview.passedChecks, "/", sheetReview.totalChecks, " esenciales")), /*#__PURE__*/React.createElement("b", {
        className: "sheet-review-strip__arrow",
        "aria-hidden": "true"
      }, "→")));
    }
    window.DndCharacterHeaderComponents = {
      CharacterHeader
    };
  })();
})();