(() => {
  (() => {
    function CompendiumDialogs({
      model
    }) {
      const {
        addFeatFromCompendium,
        addSpellFromSrdLibrary,
        automaticSpellSourceIds,
        displayedCompendiumFeats,
        featCompendiumDetail,
        featCompendiumOpen,
        featCompendiumSearch,
        featCompendiumSource,
        feats,
        formatMod,
        getSpellCompendiumActionLabel,
        getSpellCompendiumAddedLabel,
        getSpellIconColor,
        getSpellIconPath,
        getSpellResolution,
        getSrdSpellDiceDetails,
        grimoireGuideOpen,
        launchDamageOrHealingRoll,
        requestSpellAttackRoll,
        setFeatCompendiumDetail,
        setFeatCompendiumOpen,
        setFeatCompendiumSearch,
        setFeatCompendiumSource,
        setGrimoireGuideOpen,
        setGrimoireView,
        setSrdSpellDetail,
        spellAttackBonus,
        spellGuideProfile,
        spellGuideSteps,
        spellSaveDc,
        spellWorkflow,
        spellWorkflowCopy,
        spellcastingModifier,
        spells,
        srdProfileCantrips,
        srdSpellDetail
      } = model;
      return /*#__PURE__*/React.createElement(React.Fragment, null, grimoireGuideOpen && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
        className: "grimoire-guide-backdrop",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Guía para empezar con la magia",
        onMouseDown: event => {
          if (event.target === event.currentTarget) setGrimoireGuideOpen(false);
        }
      }, /*#__PURE__*/React.createElement("article", {
        className: "grimoire-guide-dialog"
      }, /*#__PURE__*/React.createElement("header", {
        className: "grimoire-guide-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "min-w-0"
      }, /*#__PURE__*/React.createElement("span", null, "Guía rápida"), /*#__PURE__*/React.createElement("h3", null, "Empieza con la magia"), /*#__PURE__*/React.createElement("p", null, spellWorkflowCopy.description)), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setGrimoireGuideOpen(false),
        "aria-label": "Cerrar guía de magia"
      }, "×")), /*#__PURE__*/React.createElement("div", {
        className: "grimoire-guide-content"
      }, /*#__PURE__*/React.createElement("section", {
        className: "grimoire-guide-profile"
      }, /*#__PURE__*/React.createElement("span", null, "Tu forma de lanzar magia"), /*#__PURE__*/React.createElement("h4", null, spellGuideProfile.title), /*#__PURE__*/React.createElement("p", null, spellGuideProfile.explanation), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, spellGuideProfile.limitLabel, /*#__PURE__*/React.createElement("b", null, spellGuideProfile.limitValue)), /*#__PURE__*/React.createElement("strong", null, "Trucos", /*#__PURE__*/React.createElement("b", null, srdProfileCantrips || 0)), /*#__PURE__*/React.createElement("strong", null, spellGuideProfile.recovery))), /*#__PURE__*/React.createElement("ol", {
        className: "grimoire-guide-steps"
      }, spellGuideSteps.map(([title, description], index) => /*#__PURE__*/React.createElement("li", {
        key: title
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, index + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, title), /*#__PURE__*/React.createElement("p", null, description))))), /*#__PURE__*/React.createElement("section", {
        className: "grimoire-guide-notes"
      }, /*#__PURE__*/React.createElement("h4", null, "Qué significa cada zona"), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Compendio Arcano:"), " sirve para buscar y consultar; un conjuro no entra en tu ficha hasta que pulses su acción de añadir, aprender o preparar."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Conjuros listos:"), " es la vista rápida para jugar. Contiene preparados, conocidos o concedidos, según tu tipo de lanzador."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Trucos y ranuras:"), " los trucos no gastan ranuras. Las ranuras son los usos para conjuros de nivel 1 o superior."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Nivel superior:"), " puedes elegir una ranura mayor si el conjuro mejora al lanzarse con ella."))), /*#__PURE__*/React.createElement("footer", {
        className: "grimoire-guide-footer"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setGrimoireGuideOpen(false)
      }, "Cerrar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          setGrimoireView('srd');
          setGrimoireGuideOpen(false);
        }
      }, "Abrir ", spellWorkflowCopy.compendium)))), document.body), featCompendiumOpen && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
        className: "fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Compendio de dotes",
        onMouseDown: event => {
          if (event.target === event.currentTarget) {
            setFeatCompendiumOpen(false);
            setFeatCompendiumDetail(null);
          }
        }
      }, /*#__PURE__*/React.createElement("article", {
        className: "flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded border border-yellow-700 bg-gray-900 shadow-2xl"
      }, /*#__PURE__*/React.createElement("header", {
        className: "flex items-start justify-between gap-3 border-b border-yellow-900/70 bg-yellow-950/20 px-4 py-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "min-w-0"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-bold uppercase tracking-wider text-yellow-300"
      }, "Colección de opciones"), /*#__PURE__*/React.createElement("h3", {
        className: "mt-1 font-fantasy text-xl font-bold text-yellow-100"
      }, "Compendio de dotes"), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-yellow-100/70"
      }, "Consulta una dote antes de añadir una copia editable a este personaje.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          setFeatCompendiumOpen(false);
          setFeatCompendiumDetail(null);
        },
        className: "flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-600 text-xl text-gray-200 hover:border-yellow-400",
        "aria-label": "Cerrar compendio de dotes"
      }, "×")), /*#__PURE__*/React.createElement("div", {
        className: "min-h-0 overflow-y-auto p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap gap-2"
      }, /*#__PURE__*/React.createElement("input", {
        value: featCompendiumSearch,
        onChange: event => setFeatCompendiumSearch(event.target.value),
        placeholder: "Buscar, ej.: Telepático",
        className: "min-h-11 min-w-[12rem] flex-1 rounded border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none focus:border-yellow-500"
      }), /*#__PURE__*/React.createElement("select", {
        value: featCompendiumSource,
        onChange: event => setFeatCompendiumSource(event.target.value),
        className: "min-h-11 rounded border border-gray-700 bg-gray-950 px-3 text-sm text-gray-100 outline-none focus:border-yellow-500"
      }, /*#__PURE__*/React.createElement("option", {
        value: "all"
      }, "Todas las fuentes"), /*#__PURE__*/React.createElement("option", {
        value: "SRD 5.1"
      }, "SRD 5.1"), /*#__PURE__*/React.createElement("option", {
        value: "Caldero de Tasha"
      }, "Caldero de Tasha"))), featCompendiumDetail && /*#__PURE__*/React.createElement("section", {
        className: "mt-4 rounded border border-yellow-700/70 bg-yellow-950/20 p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap items-start justify-between gap-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "min-w-0"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-bold uppercase tracking-wider text-yellow-300"
      }, featCompendiumDetail.source), /*#__PURE__*/React.createElement("h4", {
        className: "mt-1 font-fantasy text-lg font-bold text-yellow-100"
      }, featCompendiumDetail.name)), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: feats.some(feat => feat.sourceId === featCompendiumDetail.id || String(feat.title || '').trim().toLocaleLowerCase('es') === featCompendiumDetail.name.toLocaleLowerCase('es')),
        onClick: () => addFeatFromCompendium(featCompendiumDetail),
        className: "min-h-11 rounded border border-yellow-600 bg-yellow-800 px-4 text-sm font-semibold text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-500"
      }, feats.some(feat => feat.sourceId === featCompendiumDetail.id || String(feat.title || '').trim().toLocaleLowerCase('es') === featCompendiumDetail.name.toLocaleLowerCase('es')) ? 'Ya añadida' : 'Añadir a la ficha')), featCompendiumDetail.prerequisites && /*#__PURE__*/React.createElement("p", {
        className: "mt-3 text-xs text-cyan-200"
      }, /*#__PURE__*/React.createElement("strong", null, "Prerrequisito:"), " ", featCompendiumDetail.prerequisites), /*#__PURE__*/React.createElement("p", {
        className: "mt-3 text-sm leading-relaxed text-gray-200"
      }, featCompendiumDetail.summary)), /*#__PURE__*/React.createElement("div", {
        className: "mt-4 grid gap-2 sm:grid-cols-2"
      }, displayedCompendiumFeats.map(feat => {
        const added = feats.some(characterFeat => characterFeat.sourceId === feat.id || String(characterFeat.title || '').trim().toLocaleLowerCase('es') === feat.name.toLocaleLowerCase('es'));
        return /*#__PURE__*/React.createElement("article", {
          key: feat.id,
          className: "rounded border border-gray-800 bg-gray-950/45 p-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex items-start justify-between gap-2"
        }, /*#__PURE__*/React.createElement("div", {
          className: "min-w-0"
        }, /*#__PURE__*/React.createElement("h4", {
          className: "font-fantasy text-sm font-bold text-yellow-100"
        }, feat.name)), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setFeatCompendiumDetail(feat),
          className: "min-h-9 shrink-0 rounded border border-gray-600 px-2 text-xs text-gray-200 hover:border-yellow-500"
        }, "Ver")), feat.prerequisites && /*#__PURE__*/React.createElement("p", {
          className: "mt-2 text-[11px] text-cyan-200"
        }, feat.prerequisites), /*#__PURE__*/React.createElement("p", {
          className: "mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400"
        }, feat.summary), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: added,
          onClick: () => addFeatFromCompendium(feat),
          className: "mt-3 min-h-10 w-full rounded border border-yellow-800 bg-yellow-950/30 px-3 text-xs font-semibold text-yellow-100 hover:bg-yellow-800 disabled:cursor-not-allowed disabled:border-gray-800 disabled:text-gray-600"
        }, added ? 'Ya añadida' : 'Añadir'));
      }), !displayedCompendiumFeats.length && /*#__PURE__*/React.createElement("p", {
        className: "py-8 text-center text-sm text-gray-500 sm:col-span-2"
      }, "No hay dotes que coincidan con la búsqueda."))))), document.body), srdSpellDetail && (() => {
        const components = [srdSpellDetail.compV ? 'V' : null, srdSpellDetail.compS ? 'S' : null, srdSpellDetail.compM ? 'M' : null].filter(Boolean).join(', ');
        const diceDetails = getSrdSpellDiceDetails(srdSpellDetail);
        const spellResolution = getSpellResolution(srdSpellDetail);
        const storedSpell = spells.find(spell => spell.sourceId === srdSpellDetail.id);
        const canPrepareStoredSpell = spellWorkflow === 'prepared' && Number(srdSpellDetail.level) > 0 && storedSpell && !storedSpell.prepared;
        const alreadyAdded = automaticSpellSourceIds.has(srdSpellDetail.id) || !!storedSpell && !canPrepareStoredSpell;
        const spellIcon = getSpellIconPath(srdSpellDetail);
        const spellIconColor = getSpellIconColor(srdSpellDetail);
        const descriptionSentences = String(srdSpellDetail.description || '').trim().split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/).filter(Boolean);
        const descriptionParagraphs = descriptionSentences.reduce((paragraphs, sentence) => {
          const startsSection = /^(?:A niveles superiores|Opciones?|Efectos?|Crear agua|Destruir agua)\b/i.test(sentence);
          const current = paragraphs[paragraphs.length - 1];
          if (!current || startsSection || current.length + sentence.length > 285) paragraphs.push(sentence);else paragraphs[paragraphs.length - 1] = `${current} ${sentence}`;
          return paragraphs;
        }, []);
        return /*#__PURE__*/React.createElement("div", {
          className: "fixed inset-0 z-[55] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": `Ficha de ${srdSpellDetail.name}`,
          onMouseDown: event => {
            if (event.target === event.currentTarget) setSrdSpellDetail(null);
          }
        }, /*#__PURE__*/React.createElement("article", {
          style: spellIconColor ? {
            '--spell-art-rgb': spellIconColor
          } : undefined,
          className: `spell-detail-modal flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded border border-purple-700 bg-gray-900 shadow-2xl ${spellIcon ? 'has-spell-art' : ''}`
        }, /*#__PURE__*/React.createElement("header", {
          className: "spell-detail-header flex items-start justify-between gap-3 border-b border-purple-900/70 bg-purple-950/30 px-4 py-3"
        }, spellIcon && /*#__PURE__*/React.createElement("figure", {
          className: "spell-detail-art"
        }, /*#__PURE__*/React.createElement("img", {
          src: spellIcon,
          alt: `Icono de ${srdSpellDetail.name}`
        })), /*#__PURE__*/React.createElement("div", {
          className: "min-w-0"
        }, /*#__PURE__*/React.createElement("span", {
          className: "text-[10px] font-bold uppercase tracking-wider text-purple-300"
        }, srdSpellDetail.level === 0 ? 'Truco' : `Conjuro de nivel ${srdSpellDetail.level}`, " · ", srdSpellDetail.school), /*#__PURE__*/React.createElement("h3", {
          className: "mt-1 font-fantasy text-xl font-bold text-purple-100"
        }, srdSpellDetail.name)), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setSrdSpellDetail(null),
          className: "flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-600 text-xl text-gray-200 hover:border-purple-400",
          "aria-label": "Cerrar ficha de conjuro"
        }, "×")), /*#__PURE__*/React.createElement("div", {
          className: "min-h-0 overflow-y-auto p-4"
        }, /*#__PURE__*/React.createElement("dl", {
          className: "grid grid-cols-1 gap-2 text-sm sm:grid-cols-2"
        }, /*#__PURE__*/React.createElement("div", {
          className: "rounded border border-gray-800 bg-gray-950/50 p-2"
        }, /*#__PURE__*/React.createElement("dt", {
          className: "text-[10px] uppercase text-gray-500"
        }, "Lanzamiento"), /*#__PURE__*/React.createElement("dd", {
          className: "mt-1 text-gray-200"
        }, srdSpellDetail.castingTime)), /*#__PURE__*/React.createElement("div", {
          className: "rounded border border-gray-800 bg-gray-950/50 p-2"
        }, /*#__PURE__*/React.createElement("dt", {
          className: "text-[10px] uppercase text-gray-500"
        }, "Alcance"), /*#__PURE__*/React.createElement("dd", {
          className: "mt-1 text-gray-200"
        }, srdSpellDetail.range)), /*#__PURE__*/React.createElement("div", {
          className: "rounded border border-gray-800 bg-gray-950/50 p-2"
        }, /*#__PURE__*/React.createElement("dt", {
          className: "text-[10px] uppercase text-gray-500"
        }, "Duración"), /*#__PURE__*/React.createElement("dd", {
          className: "mt-1 text-gray-200"
        }, srdSpellDetail.duration)), /*#__PURE__*/React.createElement("div", {
          className: "rounded border border-gray-800 bg-gray-950/50 p-2"
        }, /*#__PURE__*/React.createElement("dt", {
          className: "text-[10px] uppercase text-gray-500"
        }, "Componentes"), /*#__PURE__*/React.createElement("dd", {
          className: "mt-1 text-gray-200"
        }, components || 'Ninguno', srdSpellDetail.compMDesc ? ` (${srdSpellDetail.compMDesc})` : ''))), (srdSpellDetail.ritual || srdSpellDetail.concentration) && /*#__PURE__*/React.createElement("p", {
          className: "mt-3 text-xs text-purple-200"
        }, srdSpellDetail.ritual ? 'Ritual' : '', srdSpellDetail.ritual && srdSpellDetail.concentration ? ' · ' : '', srdSpellDetail.concentration ? 'Concentración' : ''), (spellResolution.usesSpellAttack || spellResolution.savingAbility) && /*#__PURE__*/React.createElement("section", {
          className: "mt-4 rounded border border-cyan-900/60 bg-cyan-950/15 p-3"
        }, /*#__PURE__*/React.createElement("h4", {
          className: "text-xs font-bold uppercase tracking-wider text-cyan-200"
        }, "Tirada y salvación"), spellcastingModifier === null ? /*#__PURE__*/React.createElement("p", {
          className: "mt-2 text-sm text-gray-400"
        }, "Configura la característica de lanzamiento para calcular la CD y el ataque.") : /*#__PURE__*/React.createElement("div", {
          className: "mt-2 flex flex-wrap gap-2 text-sm"
        }, spellResolution.usesSpellAttack && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => requestSpellAttackRoll(srdSpellDetail),
          className: "rounded border border-cyan-700 bg-gray-950/50 px-2 py-1 text-cyan-100 hover:border-cyan-300"
        }, "Tirar ataque de conjuro ", formatMod(spellAttackBonus)), spellResolution.savingAbility && /*#__PURE__*/React.createElement("span", {
          className: "rounded border border-cyan-700 bg-gray-950/50 px-2 py-1 text-cyan-100"
        }, "Salvación de ", spellResolution.savingAbility, " · CD ", spellSaveDc))), /*#__PURE__*/React.createElement("section", {
          className: "mt-4 rounded border border-purple-900/60 bg-purple-950/15 p-3"
        }, /*#__PURE__*/React.createElement("h4", {
          className: "text-xs font-bold uppercase tracking-wider text-purple-200"
        }, "Dados"), diceDetails.length ? /*#__PURE__*/React.createElement("div", {
          className: "mt-2 flex flex-wrap gap-2"
        }, diceDetails.map((detail, index) => {
          const tone = detail.kind === 'healing' || detail.kind === 'benefit' ? 'border-emerald-700/80 bg-emerald-950/25 text-emerald-100' : detail.kind === 'damage' ? 'border-red-800/80 bg-red-950/25 text-red-100' : 'border-cyan-700/80 bg-cyan-950/25 text-cyan-100';
          const labelTone = detail.kind === 'healing' || detail.kind === 'benefit' ? 'text-emerald-300' : detail.kind === 'damage' ? 'text-red-300' : 'text-cyan-300';
          return /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => launchDamageOrHealingRoll(detail.value, `${srdSpellDetail.name} · ${detail.label}`, detail.kind),
            key: `${detail.value}_${detail.label}_${index}`,
            className: `inline-flex min-h-9 items-center gap-2 rounded border px-2.5 text-xs hover:brightness-125 ${tone}`
          }, /*#__PURE__*/React.createElement("strong", {
            className: "font-mono text-sm text-white"
          }, detail.value), /*#__PURE__*/React.createElement("span", {
            className: labelTone
          }, detail.label), /*#__PURE__*/React.createElement("small", {
            className: "text-[9px] uppercase opacity-70"
          }, "Tirar"));
        })) : /*#__PURE__*/React.createElement("p", {
          className: "mt-2 text-sm text-gray-400"
        }, "Sin tirada de daño o curación con dados.")), /*#__PURE__*/React.createElement("section", {
          className: "spell-detail-description mt-4"
        }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "✦"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Texto completo"), /*#__PURE__*/React.createElement("h4", null, "Descripción"))), /*#__PURE__*/React.createElement("div", {
          className: "spell-detail-reading"
        }, descriptionParagraphs.map((paragraph, index) => /*#__PURE__*/React.createElement("p", {
          key: `${srdSpellDetail.id}_description_${index}`,
          className: /^(?:A niveles superiores|Opciones?|Efectos?)\b/i.test(paragraph) ? 'is-scaling' : ''
        }, paragraph))))), /*#__PURE__*/React.createElement("footer", {
          className: "flex flex-wrap justify-end gap-2 border-t border-gray-800 bg-gray-950/60 p-3"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setSrdSpellDetail(null),
          className: "min-h-11 rounded border border-gray-600 px-4 text-sm text-gray-200"
        }, "Cerrar"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: alreadyAdded,
          onClick: () => addSpellFromSrdLibrary(srdSpellDetail),
          className: `min-h-11 rounded border px-4 text-sm font-semibold ${alreadyAdded ? 'cursor-not-allowed border-gray-700 text-gray-500' : 'border-purple-600 bg-purple-800 text-white hover:bg-purple-700'}`
        }, alreadyAdded ? getSpellCompendiumAddedLabel(srdSpellDetail) : getSpellCompendiumActionLabel(srdSpellDetail)))));
      })());
    }
    window.DndCompendiumDialogComponents = {
      CompendiumDialogs
    };
  })();
})();