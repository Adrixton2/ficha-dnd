(() => {
  window.DndSpellbookComponents = (() => {
    const ArcaneCompendiumView = ({
      spellLibrary,
      displayedSpells,
      addedSpells,
      profile,
      profileMaxSpellLevel,
      classFilterActive,
      workflow,
      workflowDescription,
      actionLabel,
      search,
      level,
      school,
      classFilter,
      trait,
      schools,
      onSearchChange,
      onLevelChange,
      onSchoolChange,
      onClassFilterChange,
      onTraitChange,
      onShowDetail,
      onChooseSpell,
      getSpellIcon = () => '',
      getSpellIconColor = () => ''
    }) => /*#__PURE__*/React.createElement("section", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "rounded border border-purple-800/70 bg-purple-950/20 p-3 text-xs text-purple-100"
    }, /*#__PURE__*/React.createElement("strong", {
      className: "font-fantasy tracking-wide"
    }, "Compendio Arcano"), /*#__PURE__*/React.createElement("p", {
      className: "mt-1 text-purple-200/80"
    }, spellLibrary.length, " conjuros y trucos para reglas de D&D 5e (2014). Consulta la ficha y usa la acción adecuada para este personaje."), classFilterActive && /*#__PURE__*/React.createElement("p", {
      className: "mt-2 text-cyan-200"
    }, "Mostrando los conjuros de ", profile.name, " disponibles hasta nivel ", profileMaxSpellLevel || '0', " para este personaje."), profile && /*#__PURE__*/React.createElement("p", {
      className: "mt-2 text-cyan-100"
    }, workflow === 'prepared' ? 'Prepararás directamente los conjuros que elijas.' : workflow === 'spellbook' ? 'Los conjuros se añadirán a tu libro; después podrás prepararlos.' : `Al elegirlos, los ${actionLabel?.toLocaleLowerCase('es') || 'aprenderás'} y quedarán listos.`, " ", workflowDescription)), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, /*#__PURE__*/React.createElement("input", {
      value: search,
      onChange: event => onSearchChange(event.target.value),
      placeholder: "Buscar, ej.: Bola de fuego",
      className: "min-w-[12rem] flex-1 rounded border border-gray-700 bg-gray-950 px-3 py-2 text-sm"
    }), /*#__PURE__*/React.createElement("select", {
      value: level,
      onChange: event => onLevelChange(event.target.value),
      className: "rounded border border-gray-700 bg-gray-950 px-2 text-sm"
    }, /*#__PURE__*/React.createElement("option", {
      value: "all"
    }, "Todos los niveles"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(item => /*#__PURE__*/React.createElement("option", {
      key: item,
      value: item
    }, item === 0 ? 'Trucos' : `Nivel ${item}`))), /*#__PURE__*/React.createElement("select", {
      value: school,
      onChange: event => onSchoolChange(event.target.value),
      className: "rounded border border-gray-700 bg-gray-950 px-2 text-sm"
    }, /*#__PURE__*/React.createElement("option", {
      value: "all"
    }, "Todas las escuelas"), schools.map(item => /*#__PURE__*/React.createElement("option", {
      key: item,
      value: item
    }, item))), /*#__PURE__*/React.createElement("select", {
      value: classFilter,
      onChange: event => onClassFilterChange(event.target.value),
      className: "min-h-10 rounded border border-cyan-800 bg-gray-950 px-2 text-sm text-cyan-100",
      disabled: !profile
    }, /*#__PURE__*/React.createElement("option", {
      value: "auto"
    }, profile ? `Mi clase: ${profile.name}` : 'Mi clase no tiene perfil automático'), /*#__PURE__*/React.createElement("option", {
      value: "all"
    }, "Todo el compendio"))), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, /*#__PURE__*/React.createElement("select", {
      value: trait,
      onChange: event => onTraitChange(event.target.value),
      className: "min-h-10 rounded border border-gray-700 bg-gray-950 px-2 text-sm"
    }, /*#__PURE__*/React.createElement("option", {
      value: "all"
    }, "Todos los rasgos"), /*#__PURE__*/React.createElement("option", {
      value: "ritual"
    }, "Rituales"), /*#__PURE__*/React.createElement("option", {
      value: "concentration"
    }, "Concentración"), /*#__PURE__*/React.createElement("option", {
      value: "damage"
    }, "Con daño"), /*#__PURE__*/React.createElement("option", {
      value: "healing"
    }, "Con curación"))), /*#__PURE__*/React.createElement("div", {
      className: "arcane-compendium-grid grid max-h-[34rem] grid-cols-1 gap-3 overflow-y-auto pr-2 md:grid-cols-2"
    }, displayedSpells.map(spell => {
      const components = [spell.compV ? 'V' : null, spell.compS ? 'S' : null, spell.compM ? 'M' : null].filter(Boolean).join(', ');
      const storedSpell = addedSpells.find(currentSpell => currentSpell.sourceId === spell.id);
      const canPrepareStoredSpell = workflow === 'prepared' && spell.level > 0 && storedSpell && !storedSpell.prepared && !storedSpell.automatic;
      const alreadyAdded = !!storedSpell && !canPrepareStoredSpell;
      const directAction = spell.level === 0 ? 'Aprender truco' : actionLabel;
      const spellIcon = getSpellIcon(spell);
      const spellIconColor = getSpellIconColor(spell);
      return /*#__PURE__*/React.createElement("article", {
        key: spell.id,
        style: spellIconColor ? {
          '--spell-art-rgb': spellIconColor
        } : undefined,
        className: `arcane-compendium-card flex flex-col rounded border border-gray-800 bg-gray-900/50 p-3 ${spellIcon ? 'has-spell-art' : ''}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "arcane-compendium-card-heading flex items-start justify-between gap-3"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
        className: "mr-2 inline-flex rounded border border-purple-700 bg-purple-950/60 px-2 py-1 text-[10px] font-bold text-purple-100"
      }, spell.level === 0 ? 'Truco' : `Nv ${spell.level}`), /*#__PURE__*/React.createElement("strong", {
        className: "font-fantasy text-sm text-purple-100"
      }, spell.name)), /*#__PURE__*/React.createElement("span", {
        className: "arcane-compendium-school text-[10px] text-gray-400"
      }, spell.school)), spellIcon && /*#__PURE__*/React.createElement("figure", {
        className: "arcane-compendium-card-art"
      }, /*#__PURE__*/React.createElement("img", {
        src: spellIcon,
        alt: `Icono de ${spell.name}`,
        loading: "lazy"
      })), /*#__PURE__*/React.createElement("p", {
        className: "mt-2 text-[11px] text-gray-400"
      }, spell.castingTime, " · ", spell.range, " · ", spell.duration), components && /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-[11px] text-gray-500"
      }, "Componentes: ", components, spell.compMDesc ? ` (${spell.compMDesc})` : ''), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 flex flex-wrap items-center justify-between gap-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] text-gray-500"
      }, spell.ritual ? 'Ritual' : '', spell.ritual && spell.concentration ? ' · ' : '', spell.concentration ? 'Concentración' : ''), /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onShowDetail(spell),
        className: "min-h-10 rounded border border-gray-600 px-3 text-xs font-semibold text-gray-200 hover:border-purple-500 hover:text-purple-100"
      }, "Consultar"), !alreadyAdded && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onChooseSpell(spell),
        className: "min-h-10 rounded border border-cyan-600 bg-cyan-950/50 px-3 text-xs font-semibold text-cyan-100 hover:bg-cyan-800"
      }, directAction), alreadyAdded && /*#__PURE__*/React.createElement("span", {
        className: "inline-flex min-h-10 items-center rounded border border-gray-700 px-3 text-xs text-gray-500"
      }, storedSpell?.automatic ? 'Concedido' : workflow === 'prepared' ? 'Preparado' : 'Añadido'))));
    }), !displayedSpells.length && /*#__PURE__*/React.createElement("p", {
      className: "col-span-1 p-6 text-center text-sm text-gray-500 md:col-span-2"
    }, "No hay conjuros que coincidan con los filtros.")), /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] leading-relaxed text-gray-500"
    }, window.DndSrdSpellLibrary?.attribution, " ", /*#__PURE__*/React.createElement("a", {
      href: window.DndSrdSpellLibrary?.sourceUrl,
      target: "_blank",
      rel: "noreferrer",
      className: "text-purple-300 underline"
    }, "Fuente oficial"), " · ", /*#__PURE__*/React.createElement("a", {
      href: window.DndSrdSpellLibrary?.licenseUrl,
      target: "_blank",
      rel: "noreferrer",
      className: "text-purple-300 underline"
    }, "CC BY 4.0"), "."));
    return {
      ArcaneCompendiumView
    };
  })();
})();