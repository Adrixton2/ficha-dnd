(() => {
  window.DndCharacterFooterComponents = (() => {
    const {
      CharacterSectionGlyph
    } = window.DndCharacterSheetComponents;
    const CharacterFooter = ({
      model
    }) => {
      const {
        addProficiencyEntryToCategory,
        narrative,
        narrativeFilledCount,
        proficiencyCategoryLabels,
        proficiencyEntries,
        removeProficiencyEntry,
        setNarrative,
        updateProficiencyEntry
      } = model;
      return /*#__PURE__*/React.createElement("section", {
        "data-tab": "character",
        className: "character-sheet-footer tab-section space-y-6",
        "aria-label": "Información complementaria del personaje"
      }, /*#__PURE__*/React.createElement("details", {
        className: "proficiency-catalog rpg-panel overflow-hidden"
      }, /*#__PURE__*/React.createElement("summary", {
        className: "proficiency-catalog-summary cursor-pointer list-none border-b border-gray-800 p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-section-header is-skills mb-0"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-section-heading"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-section-emblem"
      }, /*#__PURE__*/React.createElement(CharacterSectionGlyph, {
        section: "skills"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Consulta rápida y procedencia"), /*#__PURE__*/React.createElement("h2", null, "Competencias e idiomas"))), /*#__PURE__*/React.createElement("span", {
        className: "character-section-note"
      }, "Plegar / desplegar"))), /*#__PURE__*/React.createElement("div", {
        className: "p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "proficiency-catalog-grid grid gap-3 sm:grid-cols-2"
      }, Object.entries(proficiencyCategoryLabels).map(([category, label]) => {
        const entries = proficiencyEntries.filter(entry => entry.category === category && !entry.hidden);
        return /*#__PURE__*/React.createElement("section", {
          key: category,
          "data-category": category,
          className: "proficiency-category-card"
        }, /*#__PURE__*/React.createElement("div", {
          className: "proficiency-category-header"
        }, /*#__PURE__*/React.createElement("span", {
          className: "proficiency-category-mark",
          "aria-hidden": "true"
        }), /*#__PURE__*/React.createElement("h3", null, label), /*#__PURE__*/React.createElement("span", {
          className: "proficiency-category-count"
        }, entries.length), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => addProficiencyEntryToCategory(category),
          className: "proficiency-category-add",
          "aria-label": `Añadir en ${label}`
        }, "+ Añadir")), /*#__PURE__*/React.createElement("div", {
          className: "proficiency-entry-list"
        }, entries.map(entry => /*#__PURE__*/React.createElement("div", {
          key: entry.id,
          className: "proficiency-entry-card"
        }, /*#__PURE__*/React.createElement("div", {
          className: "proficiency-entry-fields"
        }, /*#__PURE__*/React.createElement("input", {
          "aria-label": `Nombre en ${label}`,
          value: entry.name,
          placeholder: `Nueva entrada de ${label.toLowerCase()}`,
          onChange: event => updateProficiencyEntry(entry.id, {
            name: event.target.value,
            nameEdited: true
          }),
          className: "proficiency-entry-name"
        }), /*#__PURE__*/React.createElement("label", {
          className: "proficiency-entry-source"
        }, /*#__PURE__*/React.createElement("span", null, "Origen"), /*#__PURE__*/React.createElement("input", {
          "aria-label": `Procedencia de ${entry.name || label}`,
          value: entry.source || '',
          placeholder: "Sin indicar",
          onChange: event => updateProficiencyEntry(entry.id, {
            source: event.target.value,
            sourceEdited: true
          })
        }))), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => removeProficiencyEntry(entry),
          className: "proficiency-entry-delete",
          "aria-label": `Borrar ${entry.name || label}`
        }, "×"))), entries.length === 0 && /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => addProficiencyEntryToCategory(category),
          className: "proficiency-category-empty"
        }, "Añadir la primera competencia")));
      })))), /*#__PURE__*/React.createElement("details", {
        className: "narrative-profile-panel rpg-panel"
      }, /*#__PURE__*/React.createElement("summary", {
        className: "narrative-profile-summary"
      }, /*#__PURE__*/React.createElement("span", {
        className: "character-section-emblem"
      }, /*#__PURE__*/React.createElement(CharacterSectionGlyph, {
        section: "traits"
      })), /*#__PURE__*/React.createElement("span", {
        className: "min-w-0 flex-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "narrative-profile-kicker"
      }, "Identidad e historia"), /*#__PURE__*/React.createElement("strong", {
        className: "mt-0.5 block font-fantasy text-base uppercase tracking-wider text-white"
      }, "Perfil narrativo")), /*#__PURE__*/React.createElement("span", {
        className: "narrative-profile-progress"
      }, narrativeFilledCount, "/15 campos")), /*#__PURE__*/React.createElement("div", {
        className: "narrative-profile-body"
      }, /*#__PURE__*/React.createElement("p", {
        className: "narrative-profile-intro"
      }, "Información interpretativa del personaje. No modifica ninguna regla ni cálculo de la ficha."), /*#__PURE__*/React.createElement("section", {
        className: "narrative-profile-section is-identity"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "I"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Identidad"), /*#__PURE__*/React.createElement("p", null, "Datos visibles y presencia física"))), /*#__PURE__*/React.createElement("div", {
        className: "narrative-profile-grid is-compact"
      }, /*#__PURE__*/React.createElement("label", null, "Alineamiento", /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: narrative.alignment,
        onChange: event => setNarrative(previous => ({
          ...previous,
          alignment: event.target.value
        })),
        placeholder: "Ej: Neutral bueno"
      })), /*#__PURE__*/React.createElement("label", null, "Edad", /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: narrative.age,
        onChange: event => setNarrative(previous => ({
          ...previous,
          age: event.target.value
        })),
        placeholder: "Ej: 27 años"
      })), /*#__PURE__*/React.createElement("label", null, "Altura", /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: narrative.height,
        onChange: event => setNarrative(previous => ({
          ...previous,
          height: event.target.value
        })),
        placeholder: "Ej: 1,78 m"
      })), /*#__PURE__*/React.createElement("label", null, "Peso", /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: narrative.weight,
        onChange: event => setNarrative(previous => ({
          ...previous,
          weight: event.target.value
        })),
        placeholder: "Ej: 74 kg"
      })), /*#__PURE__*/React.createElement("label", {
        className: "is-wide"
      }, "Apariencia", /*#__PURE__*/React.createElement("textarea", {
        value: narrative.appearance,
        onChange: event => setNarrative(previous => ({
          ...previous,
          appearance: event.target.value
        })),
        placeholder: "Rasgos físicos, vestimenta, voz, gestos y detalles reconocibles…"
      })))), /*#__PURE__*/React.createElement("section", {
        className: "narrative-profile-section"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "II"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Carácter"), /*#__PURE__*/React.createElement("p", null, "La brújula interior del personaje"))), /*#__PURE__*/React.createElement("div", {
        className: "narrative-profile-grid"
      }, /*#__PURE__*/React.createElement("label", null, "Personalidad", /*#__PURE__*/React.createElement("textarea", {
        value: narrative.personality,
        onChange: event => setNarrative(previous => ({
          ...previous,
          personality: event.target.value
        })),
        placeholder: "Cómo se comporta, hábitos y forma de relacionarse…"
      })), /*#__PURE__*/React.createElement("label", null, "Ideales", /*#__PURE__*/React.createElement("textarea", {
        value: narrative.ideals,
        onChange: event => setNarrative(previous => ({
          ...previous,
          ideals: event.target.value
        })),
        placeholder: "Principios que guían sus decisiones…"
      })), /*#__PURE__*/React.createElement("label", null, "Vínculos", /*#__PURE__*/React.createElement("textarea", {
        value: narrative.bonds,
        onChange: event => setNarrative(previous => ({
          ...previous,
          bonds: event.target.value
        })),
        placeholder: "Personas, lugares u objetos importantes…"
      })), /*#__PURE__*/React.createElement("label", null, "Defectos", /*#__PURE__*/React.createElement("textarea", {
        value: narrative.flaws,
        onChange: event => setNarrative(previous => ({
          ...previous,
          flaws: event.target.value
        })),
        placeholder: "Miedos, debilidades o comportamientos problemáticos…"
      })))), /*#__PURE__*/React.createElement("section", {
        className: "narrative-profile-section"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "III"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Relaciones y propósito"), /*#__PURE__*/React.createElement("p", null, "Lazos con el mundo y motivos para avanzar"))), /*#__PURE__*/React.createElement("div", {
        className: "narrative-profile-grid"
      }, /*#__PURE__*/React.createElement("label", null, "Organizaciones", /*#__PURE__*/React.createElement("textarea", {
        value: narrative.organizations,
        onChange: event => setNarrative(previous => ({
          ...previous,
          organizations: event.target.value
        })),
        placeholder: "Gremios, facciones, órdenes o grupos…"
      })), /*#__PURE__*/React.createElement("label", null, "Aliados", /*#__PURE__*/React.createElement("textarea", {
        value: narrative.allies,
        onChange: event => setNarrative(previous => ({
          ...previous,
          allies: event.target.value
        })),
        placeholder: "Contactos y personas de confianza…"
      })), /*#__PURE__*/React.createElement("label", null, "Enemigos", /*#__PURE__*/React.createElement("textarea", {
        value: narrative.enemies,
        onChange: event => setNarrative(previous => ({
          ...previous,
          enemies: event.target.value
        })),
        placeholder: "Rivales, perseguidores y amenazas personales…"
      })), /*#__PURE__*/React.createElement("label", null, "Objetivos personales", /*#__PURE__*/React.createElement("textarea", {
        value: narrative.goals,
        onChange: event => setNarrative(previous => ({
          ...previous,
          goals: event.target.value
        })),
        placeholder: "Metas inmediatas y aspiraciones a largo plazo…"
      })), /*#__PURE__*/React.createElement("label", {
        className: "is-wide"
      }, "Deidad o filosofía", /*#__PURE__*/React.createElement("textarea", {
        value: narrative.faith,
        onChange: event => setNarrative(previous => ({
          ...previous,
          faith: event.target.value
        })),
        placeholder: "Fe, código moral, tradición o visión del mundo…"
      })))), /*#__PURE__*/React.createElement("section", {
        className: "narrative-profile-section is-history"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "IV"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Crónica"), /*#__PURE__*/React.createElement("p", null, "El camino recorrido hasta la aventura"))), /*#__PURE__*/React.createElement("div", {
        className: "narrative-profile-grid"
      }, /*#__PURE__*/React.createElement("label", {
        className: "is-wide"
      }, "Historia del personaje", /*#__PURE__*/React.createElement("textarea", {
        className: "is-history",
        value: narrative.history,
        onChange: event => setNarrative(previous => ({
          ...previous,
          history: event.target.value
        })),
        placeholder: "Origen, acontecimientos importantes y camino hasta la aventura actual…"
      })))))));
    };
    return {
      CharacterFooter
    };
  })();
})();