(() => {
  window.DndInventoryViewComponents = (() => {
    const {
      getArmorFormula
    } = window.DndAppUtils;
    const {
      InventoryGlyph,
      DND_CURRENCIES,
      getCurrencyCopperValue,
      formatCurrencyEquivalent
    } = window.DndCharacterSheetComponents;
    const InventoryView = ({
      model
    }) => {
      const {
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
      } = model;
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
        "data-tab": "inventory",
        className: "inventory-hero tab-section"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-hero-title"
      }, /*#__PURE__*/React.createElement("span", {
        className: "inventory-hero-emblem",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement(InventoryGlyph, {
        section: "backpack"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Equipo y memoria"), /*#__PURE__*/React.createElement("h1", null, "Inventario / Lore"), /*#__PURE__*/React.createElement("span", null, "Todo lo que llevas y la historia que acompaña a tu personaje.")))), /*#__PURE__*/React.createElement("div", {
        "data-tab": "inventory",
        className: "inventory-board tab-section"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-board-column inventory-board-left"
      }, /*#__PURE__*/React.createElement("div", {
        "data-tab": "inventory",
        className: "inventory-equipment-panel inventory-overview-panel tab-section rpg-panel p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-equipment-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-equipment-heading"
      }, /*#__PURE__*/React.createElement("span", {
        className: "inventory-equipment-emblem",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement(InventoryGlyph, {
        section: "equipment"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Protección y utilidad"), /*#__PURE__*/React.createElement("h2", null, "Equipo en uso"))), /*#__PURE__*/React.createElement("div", {
        className: "inventory-equipment-actions"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setAddModal({
          isOpen: true,
          type: 'armor',
          data: {
            type: 'light'
          }
        }),
        className: "inventory-equipment-add",
        "aria-label": "Añadir armadura"
      }, /*#__PURE__*/React.createElement(InventoryGlyph, {
        section: "equipment"
      }), /*#__PURE__*/React.createElement("span", null, "Armadura")), /*#__PURE__*/React.createElement("button", {
        onClick: () => setAddModal({
          isOpen: true,
          type: 'tool',
          data: {}
        }),
        className: "inventory-equipment-add",
        "aria-label": "Añadir utilidad o herramienta"
      }, /*#__PURE__*/React.createElement(InventoryGlyph, {
        section: "treasure"
      }), /*#__PURE__*/React.createElement("span", null, "Utilidad")))), /*#__PURE__*/React.createElement("div", {
        className: "inventory-equipment-columns"
      }, /*#__PURE__*/React.createElement("section", {
        className: "inventory-equipment-group"
      }, /*#__PURE__*/React.createElement("h3", {
        className: "inventory-equipment-group-title"
      }, /*#__PURE__*/React.createElement(InventoryGlyph, {
        section: "equipment"
      }), " Armadura"), /*#__PURE__*/React.createElement("div", {
        className: "space-y-2"
      }, armors.map(arm => /*#__PURE__*/React.createElement("div", {
        key: arm.id,
        className: `inventory-equipment-entry inventory-armor-entry group ${arm.equipped ? 'is-equipped' : ''}`
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => toggleArmorEquip(arm.id),
        className: "inventory-armor-toggle",
        "aria-label": arm.equipped ? `Desequipar ${arm.name}` : `Equipar ${arm.name}`
      }, /*#__PURE__*/React.createElement("span", {
        className: `w-5 h-5 rounded border ${arm.equipped ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-600'} flex items-center justify-center transition-colors shadow-sm`
      }, arm.equipped && /*#__PURE__*/React.createElement("svg", {
        className: "w-3 h-3 text-white",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor"
      }, /*#__PURE__*/React.createElement("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "3",
        d: "M5 13l4 4L19 7"
      })))), /*#__PURE__*/React.createElement("div", {
        className: "inventory-equipment-entry-copy"
      }, /*#__PURE__*/React.createElement("strong", null, arm.name), /*#__PURE__*/React.createElement("span", null, arm.type === 'light' ? 'Armadura ligera' : arm.type === 'medium' ? 'Armadura media' : arm.type === 'heavy' ? 'Armadura pesada' : 'Escudo'), /*#__PURE__*/React.createElement("small", null, getArmorFormula(arm))), /*#__PURE__*/React.createElement("div", {
        className: "inventory-equipment-entry-actions"
      }, /*#__PURE__*/React.createElement("span", null, arm.type === 'shield' ? `+${arm.ac || 2} CA` : `CA ${arm.ac}`), arm.stealthDis && /*#__PURE__*/React.createElement("i", null, "Sigilo −"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => confirmDelete(`¿Borrar "${arm.name}"?`, () => setArmors(armors.filter(a => a.id !== arm.id))),
        "aria-label": `Borrar ${arm.name}`
      }, "×")))), armors.length === 0 && /*#__PURE__*/React.createElement("span", {
        className: "text-gray-600 text-xs italic"
      }, "Sin armaduras registradas."))), /*#__PURE__*/React.createElement("section", {
        className: "inventory-equipment-group"
      }, /*#__PURE__*/React.createElement("h3", {
        className: "inventory-equipment-group-title"
      }, /*#__PURE__*/React.createElement(InventoryGlyph, {
        section: "treasure"
      }), " Utilidad y herramientas"), /*#__PURE__*/React.createElement("div", {
        className: "space-y-2"
      }, tools.map(tool => /*#__PURE__*/React.createElement("div", {
        key: tool.id,
        className: "inventory-equipment-entry inventory-tool-entry group"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-equipment-entry-copy"
      }, /*#__PURE__*/React.createElement("strong", null, tool.name), /*#__PURE__*/React.createElement("small", null, tool.desc)), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => confirmDelete(`¿Borrar "${tool.name}"?`, () => setTools(tools.filter(t => t.id !== tool.id))),
        "aria-label": `Borrar ${tool.name}`
      }, "×"))), tools.length === 0 && /*#__PURE__*/React.createElement("span", {
        className: "text-gray-600 text-xs italic"
      }, "Sin herramientas registradas."))))), /*#__PURE__*/React.createElement("section", {
        "data-tab": "inventory",
        className: "inventory-currency-panel tab-section rpg-panel p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-resource-header"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Recursos"), /*#__PURE__*/React.createElement("h2", null, "Monedas")), /*#__PURE__*/React.createElement(InventoryGlyph, {
        section: "coins"
      })), /*#__PURE__*/React.createElement("div", {
        className: "inventory-currency-wallet"
      }, DND_CURRENCIES.map(coin => /*#__PURE__*/React.createElement("div", {
        key: coin.key,
        className: `inventory-currency-card inventory-currency-${coin.key}`
      }, /*#__PURE__*/React.createElement("span", {
        className: "inventory-currency-token",
        "aria-hidden": "true"
      }, coin.symbol), /*#__PURE__*/React.createElement("span", {
        className: "inventory-currency-label"
      }, coin.label, /*#__PURE__*/React.createElement("small", null, coin.short, " · 1 = ", coin.copperValue, " PC")), /*#__PURE__*/React.createElement("div", {
        className: "inventory-currency-controls"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => addCurrency(coin.key, -1),
        "aria-label": `Restar una pieza de ${coin.label}`
      }, "−"), /*#__PURE__*/React.createElement("input", {
        "aria-label": `Cantidad de ${coin.label}`,
        type: "number",
        min: "0",
        value: currency[coin.key] ?? '',
        onChange: e => updateCurrencyAmount(coin.key, e.target.value)
      }), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => addCurrency(coin.key, 1),
        "aria-label": `Sumar una pieza de ${coin.label}`
      }, "+"))))), /*#__PURE__*/React.createElement("div", {
        className: "inventory-currency-total"
      }, /*#__PURE__*/React.createElement("span", null, "Valor total"), /*#__PURE__*/React.createElement("strong", null, formatCurrencyEquivalent(currency)), /*#__PURE__*/React.createElement("small", null, getCurrencyCopperValue(currency), " PC")))), /*#__PURE__*/React.createElement("div", {
        className: "inventory-board-column inventory-board-right"
      }, /*#__PURE__*/React.createElement("div", {
        "data-tab": "inventory",
        className: "inventory-market-panel inventory-market-card tab-section rpg-panel border border-amber-900/70 p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-market-access"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-market-copy"
      }, /*#__PURE__*/React.createElement("h2", null, "Mercado y tesoro"), /*#__PURE__*/React.createElement("p", null, "Equipo, consumibles y objetos mágicos.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setEquipmentCompendiumOpen(true)
      }, "Abrir catálogo"))), /*#__PURE__*/React.createElement("div", {
        "data-tab": "inventory",
        className: "inventory-backpack-panel inventory-backpack-card tab-section rpg-panel p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-backpack-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-backpack-heading"
      }, /*#__PURE__*/React.createElement("span", {
        className: "inventory-backpack-emblem",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement(InventoryGlyph, {
        section: "backpack"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Equipo transportado"), /*#__PURE__*/React.createElement("h2", null, "Mochila"))), /*#__PURE__*/React.createElement("button", {
        onClick: () => setAddModal({
          isOpen: true,
          type: 'item',
          data: {}
        }),
        className: "inventory-backpack-add"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "+"), " Objeto")), /*#__PURE__*/React.createElement("div", {
        className: "inventory-backpack-list space-y-2"
      }, inventory.map((item, idx) => /*#__PURE__*/React.createElement("div", {
        key: item.id,
        className: "inventory-item-row flex justify-between items-start bg-gray-900/40 p-2.5 rounded group border border-gray-800 hover:border-gray-600 transition-colors"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex-1 pr-2"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center space-x-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-sm font-bold text-gray-200"
      }, item.name), /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-mono bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-purple-300 font-bold shadow-inner"
      }, "x", item.qty)), /*#__PURE__*/React.createElement("p", {
        className: "text-[11px] text-gray-400 mt-1 leading-tight"
      }, item.desc)), /*#__PURE__*/React.createElement("div", {
        className: "inventory-item-controls flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => adjustInvQty(item.id, -1),
        className: "inventory-item-adjust",
        "aria-label": `Quitar una unidad de ${item.name}`
      }, "−"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => adjustInvQty(item.id, 1),
        className: "inventory-item-adjust",
        "aria-label": `Añadir una unidad de ${item.name}`
      }, "+"), /*#__PURE__*/React.createElement("span", {
        className: "inventory-item-divider",
        "aria-hidden": "true"
      }), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => confirmDelete(`¿Borrar "${item.name}"?`, () => setInventory(inventory.filter(x => x.id !== item.id))),
        className: "inventory-item-delete",
        "aria-label": `Borrar ${item.name}`
      }, "×")))), inventory.length === 0 && /*#__PURE__*/React.createElement("span", {
        className: "text-gray-600 text-xs italic"
      }, "Tu inventario está vacío. Pulsa + Objeto para añadir el primero."))))), /*#__PURE__*/React.createElement("section", {
        "data-tab": "inventory",
        className: "inventory-diary-panel inventory-diary-card tab-section rpg-panel"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-diary-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-diary-heading"
      }, /*#__PURE__*/React.createElement("span", {
        className: "inventory-diary-emblem",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement(InventoryGlyph, {
        section: "journal"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Crónica de campaña"), /*#__PURE__*/React.createElement("h2", null, "Diario"))), /*#__PURE__*/React.createElement("div", {
        className: "inventory-diary-actions"
      }, diaryOpen && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          const entry = {
            id: 'note_' + Date.now(),
            title: '',
            date: new Date().toISOString().slice(0, 10),
            text: '',
            category: diaryCategory === 'all' ? 'sessions' : diaryCategory,
            tags: [],
            relations: []
          };
          setSessionNotes([entry, ...sessionNotes]);
          setEditingDiaryEntry(entry.id);
        },
        className: "inventory-diary-new"
      }, "+ Nueva entrada"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setDiaryOpen(value => !value),
        className: "inventory-diary-toggle",
        "aria-label": diaryOpen ? 'Contraer diario' : 'Desplegar diario',
        "aria-expanded": diaryOpen
      }, diaryOpen ? '−' : '+'))), /*#__PURE__*/React.createElement("div", {
        className: "inventory-diary-summary"
      }, /*#__PURE__*/React.createElement("span", null, sessionNotes.length === 0 ? 'Aún no hay entradas de campaña.' : `${sessionNotes.length} ${sessionNotes.length === 1 ? 'entrada guardada' : 'entradas guardadas'}.`), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setDiaryOpen(value => !value)
      }, diaryOpen ? 'Ocultar entradas' : 'Ver diario')), diaryOpen && /*#__PURE__*/React.createElement("div", {
        className: "campaign-journal-shell"
      }, (() => {
        const categories = [['sessions', 'Sesiones'], ['active-quests', 'Misiones activas'], ['completed-quests', 'Misiones completadas'], ['npcs', 'PNJ'], ['places', 'Lugares'], ['clues', 'Pistas'], ['debts', 'Deudas'], ['promises', 'Promesas'], ['loot', 'Botín pendiente']];
        const categoryLabel = id => categories.find(([key]) => key === id)?.[1] || 'Sesiones';
        const query = diarySearch.trim().toLocaleLowerCase('es');
        const filteredNotes = sessionNotes.filter(note => {
          const searchable = [note.title || note.date, note.text, ...(note.tags || [])].join(' ').toLocaleLowerCase('es');
          return (diaryCategory === 'all' || (note.category || 'sessions') === diaryCategory) && (!query || searchable.includes(query));
        });
        const updateNote = (id, patch) => setSessionNotes(previous => previous.map(note => note.id === id ? {
          ...note,
          ...patch
        } : note));
        return /*#__PURE__*/React.createElement("div", {
          className: "campaign-journal"
        }, /*#__PURE__*/React.createElement("div", {
          className: "campaign-journal-tools"
        }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "⌕"), /*#__PURE__*/React.createElement("input", {
          type: "search",
          value: diarySearch,
          onChange: event => setDiarySearch(event.target.value),
          placeholder: "Buscar en el diario…"
        })), /*#__PURE__*/React.createElement("small", null, filteredNotes.length, " ", filteredNotes.length === 1 ? 'entrada' : 'entradas')), /*#__PURE__*/React.createElement("nav", {
          className: "campaign-journal-categories",
          "aria-label": "Categorías del diario"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: diaryCategory === 'all' ? 'is-active' : '',
          onClick: () => setDiaryCategory('all')
        }, /*#__PURE__*/React.createElement("span", null, "Todas"), /*#__PURE__*/React.createElement("small", null, sessionNotes.length)), categories.map(([id, label]) => {
          const count = sessionNotes.filter(note => (note.category || 'sessions') === id).length;
          return /*#__PURE__*/React.createElement("button", {
            type: "button",
            key: id,
            className: diaryCategory === id ? 'is-active' : '',
            onClick: () => setDiaryCategory(id)
          }, /*#__PURE__*/React.createElement("span", null, label), count > 0 && /*#__PURE__*/React.createElement("small", null, count));
        })), /*#__PURE__*/React.createElement("div", {
          className: "campaign-journal-list"
        }, filteredNotes.map(note => {
          const isEditing = editingDiaryEntry === note.id;
          const title = note.title || (!note.category ? note.date : '') || 'Entrada sin título';
          const related = (note.relations || []).map(id => sessionNotes.find(entry => entry.id === id)).filter(Boolean);
          return /*#__PURE__*/React.createElement("article", {
            key: note.id,
            className: `campaign-journal-card ${isEditing ? 'is-editing' : ''}`
          }, /*#__PURE__*/React.createElement("div", {
            className: "campaign-journal-card-accent"
          }), !isEditing ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, categoryLabel(note.category || 'sessions')), /*#__PURE__*/React.createElement("h3", null, title)), /*#__PURE__*/React.createElement("time", null, note.category ? note.date || 'Sin fecha' : 'Nota anterior')), /*#__PURE__*/React.createElement("p", null, note.text || 'Esta entrada todavía no tiene contenido.'), ((note.tags || []).length > 0 || related.length > 0) && /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("div", null, (note.tags || []).map(tag => /*#__PURE__*/React.createElement("span", {
            key: tag
          }, "#", tag))), related.length > 0 && /*#__PURE__*/React.createElement("small", null, "↗ ", related.map(entry => entry.title || entry.date || 'Entrada').join(' · '))), /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "campaign-journal-edit",
            onClick: () => setEditingDiaryEntry(note.id)
          }, "Editar")) : /*#__PURE__*/React.createElement("div", {
            className: "campaign-journal-editor"
          }, /*#__PURE__*/React.createElement("div", {
            className: "campaign-journal-editor-heading"
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Editando entrada"), /*#__PURE__*/React.createElement("strong", null, title)), /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setEditingDiaryEntry(null)
          }, "Cerrar")), /*#__PURE__*/React.createElement("div", {
            className: "campaign-journal-editor-meta"
          }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Categoría"), /*#__PURE__*/React.createElement("select", {
            value: note.category || 'sessions',
            onChange: event => updateNote(note.id, {
              category: event.target.value
            })
          }, categories.map(([id, label]) => /*#__PURE__*/React.createElement("option", {
            key: id,
            value: id
          }, label)))), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Fecha"), /*#__PURE__*/React.createElement("input", {
            type: "date",
            value: note.category ? note.date || '' : '',
            onChange: event => updateNote(note.id, {
              date: event.target.value
            })
          }))), /*#__PURE__*/React.createElement("label", {
            className: "campaign-journal-field"
          }, /*#__PURE__*/React.createElement("span", null, "Título"), /*#__PURE__*/React.createElement("input", {
            type: "text",
            value: note.title || (!note.category ? note.date : '') || '',
            onChange: event => updateNote(note.id, {
              title: event.target.value,
              ...(!note.category ? {
                date: new Date().toISOString().slice(0, 10)
              } : {})
            }),
            placeholder: "¿Qué quieres recordar?"
          })), /*#__PURE__*/React.createElement("label", {
            className: "campaign-journal-field"
          }, /*#__PURE__*/React.createElement("span", null, "Notas"), /*#__PURE__*/React.createElement("textarea", {
            value: note.text || '',
            onChange: event => updateNote(note.id, {
              text: event.target.value
            }),
            placeholder: "Escribe libremente: sucesos, decisiones, detalles…"
          })), /*#__PURE__*/React.createElement("label", {
            className: "campaign-journal-field"
          }, /*#__PURE__*/React.createElement("span", null, "Etiquetas ", /*#__PURE__*/React.createElement("small", null, "separadas por comas")), /*#__PURE__*/React.createElement("input", {
            type: "text",
            value: (note.tags || []).join(', '),
            onChange: event => updateNote(note.id, {
              tags: event.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            }),
            placeholder: "urgente, ciudad, grupo…"
          })), /*#__PURE__*/React.createElement("div", {
            className: "campaign-journal-field"
          }, /*#__PURE__*/React.createElement("span", null, "Relacionar con"), /*#__PURE__*/React.createElement("div", {
            className: "campaign-journal-relations"
          }, sessionNotes.filter(entry => entry.id !== note.id).map(entry => {
            const selected = (note.relations || []).includes(entry.id);
            return /*#__PURE__*/React.createElement("button", {
              type: "button",
              key: entry.id,
              className: selected ? 'is-selected' : '',
              onClick: () => updateNote(note.id, {
                relations: selected ? (note.relations || []).filter(id => id !== entry.id) : [...(note.relations || []), entry.id]
              })
            }, selected ? '✓ ' : '+ ', entry.title || entry.date || 'Entrada sin título');
          }), sessionNotes.length <= 1 && /*#__PURE__*/React.createElement("small", null, "No hay otras entradas que relacionar."))), /*#__PURE__*/React.createElement("div", {
            className: "campaign-journal-editor-actions"
          }, /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "is-danger",
            onClick: () => confirmDelete(`¿Borrar la entrada "${title}"?`, () => {
              setSessionNotes(sessionNotes.filter(entry => entry.id !== note.id));
              setEditingDiaryEntry(null);
            })
          }, "Eliminar"), /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "is-primary",
            onClick: () => setEditingDiaryEntry(null)
          }, "Guardar entrada"))));
        }), !filteredNotes.length && /*#__PURE__*/React.createElement("div", {
          className: "campaign-journal-empty"
        }, /*#__PURE__*/React.createElement("span", null, "✦"), /*#__PURE__*/React.createElement("strong", null, sessionNotes.length ? 'No hay coincidencias' : 'La crónica aún está en blanco'), /*#__PURE__*/React.createElement("p", null, sessionNotes.length ? 'Prueba otra búsqueda o cambia de categoría.' : 'Crea una entrada para guardar el primer hilo de la aventura.'))));
      })(), /*#__PURE__*/React.createElement("div", {
        className: "inventory-diary-body hidden"
      }, sessionNotes.map(note => /*#__PURE__*/React.createElement("article", {
        key: note.id,
        className: "inventory-diary-entry"
      }, /*#__PURE__*/React.createElement("div", {
        className: "inventory-diary-entry-header"
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Ej: Sesión 1",
        value: note.date,
        onChange: e => setSessionNotes(sessionNotes.map(item => item.id === note.id ? {
          ...item,
          date: e.target.value
        } : item))
      }), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => confirmDelete(`¿Borrar las notas de la sesión \"${note.date}\"?`, () => setSessionNotes(sessionNotes.filter(item => item.id !== note.id))),
        "aria-label": `Borrar entrada ${note.date}`
      }, "×")), /*#__PURE__*/React.createElement("textarea", {
        placeholder: "Ej: PNJs, botín y sucesos...",
        value: note.text,
        onChange: e => setSessionNotes(sessionNotes.map(item => item.id === note.id ? {
          ...item,
          text: e.target.value
        } : item))
      }))), sessionNotes.length === 0 && /*#__PURE__*/React.createElement("p", {
        className: "inventory-diary-empty"
      }, "El diario está vacío. Pulsa + Nueva entrada para comenzar la crónica.")))));
    };
    return {
      InventoryView
    };
  })();
})();