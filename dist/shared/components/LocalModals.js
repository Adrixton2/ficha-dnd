(() => {
  window.DndLocalModalComponents = (() => {
    const ActivityHistoryModalLegacy = ({
      open,
      entries,
      onClose,
      onClear
    }) => {
      if (!open) return null;
      return /*#__PURE__*/React.createElement("div", {
        className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md",
        onClick: onClose
      }, /*#__PURE__*/React.createElement("div", {
        className: "rpg-panel flex max-h-[85vh] w-full max-w-2xl flex-col p-5",
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap items-center justify-between gap-3 border-b border-gray-700 pb-3"
      }, /*#__PURE__*/React.createElement("h3", {
        className: "font-fantasy text-xl font-bold uppercase tracking-widest text-purple-200"
      }, "Historial"), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: !entries.length,
        onClick: onClear,
        className: "min-h-9 rounded border border-red-800 px-3 text-xs text-red-200 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
      }, "Limpiar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClose,
        className: "h-10 w-10 rounded border border-gray-600 text-2xl leading-none text-gray-300",
        "aria-label": "Cerrar historial"
      }, "×"))), entries.length ? /*#__PURE__*/React.createElement("div", {
        className: "mt-4 flex-1 space-y-2 overflow-y-auto pr-1"
      }, entries.map(entry => /*#__PURE__*/React.createElement("div", {
        key: entry.id,
        className: "flex gap-3 rounded border border-gray-800 bg-gray-900/50 px-3 py-2"
      }, /*#__PURE__*/React.createElement("time", {
        dateTime: entry.timestamp,
        className: "shrink-0 text-xs text-purple-300"
      }, new Date(entry.timestamp).toLocaleDateString('es-ES'), " ", new Date(entry.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })), /*#__PURE__*/React.createElement("span", {
        className: "text-sm text-gray-200"
      }, entry.description)))) : /*#__PURE__*/React.createElement("p", {
        className: "mt-4 text-sm text-gray-500"
      }, "Aun no hay cambios importantes registrados.")));
    };
    const ActivityHistoryModal = ({
      open,
      entries,
      onClose,
      onClear
    }) => {
      if (!open) return null;
      const formatDay = timestamp => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const sameDay = (left, right) => left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
        if (sameDay(date, today)) return 'Hoy';
        if (sameDay(date, yesterday)) return 'Ayer';
        return date.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
      };
      const getEntryKind = description => {
        const value = String(description || '').toLocaleLowerCase('es-ES');
        if (value.includes('ranura')) return {
          id: 'slot',
          label: 'Ranura de conjuro',
          glyph: '◆'
        };
        if (value.includes('nivel')) return {
          id: 'level',
          label: 'Progreso',
          glyph: '↑'
        };
        if (value.includes('descanso')) return {
          id: 'rest',
          label: 'Descanso',
          glyph: '☾'
        };
        if (value.includes('concentración')) return {
          id: 'concentration',
          label: 'Concentración',
          glyph: '◇'
        };
        if (value.includes('pv') || value.includes('vida') || value.includes('salud')) return {
          id: 'health',
          label: 'Vitalidad',
          glyph: '+'
        };
        if (value.includes('conjuro') || value.includes('ranura')) return {
          id: 'spell',
          label: 'Grimorio',
          glyph: '✦'
        };
        if (value.includes('arma') || value.includes('objeto') || value.includes('equipo')) return {
          id: 'equipment',
          label: 'Equipo',
          glyph: '⌁'
        };
        return {
          id: 'general',
          label: 'Ficha',
          glyph: '•'
        };
      };
      const groupedEntries = entries.reduce((groups, entry) => {
        const label = formatDay(entry.timestamp);
        const current = groups[groups.length - 1];
        if (current?.label === label) current.entries.push(entry);else groups.push({
          label,
          entries: [entry]
        });
        return groups;
      }, []);
      return /*#__PURE__*/React.createElement("div", {
        className: "activity-history-backdrop",
        onClick: onClose
      }, /*#__PURE__*/React.createElement("section", {
        className: "activity-history-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "activity-history-title",
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("header", {
        className: "activity-history-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "activity-history-emblem",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("span", null, "≡")), /*#__PURE__*/React.createElement("div", {
        className: "activity-history-heading"
      }, /*#__PURE__*/React.createElement("small", null, "Crónica del personaje"), /*#__PURE__*/React.createElement("h3", {
        id: "activity-history-title"
      }, "Historial"), /*#__PURE__*/React.createElement("p", null, entries.length ? `${entries.length} cambio${entries.length === 1 ? '' : 's'} registrado${entries.length === 1 ? '' : 's'}` : 'La memoria de tu aventura')), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClose,
        className: "activity-history-close",
        "aria-label": "Cerrar historial"
      }, "×")), entries.length ? /*#__PURE__*/React.createElement("div", {
        className: "activity-history-scroll"
      }, groupedEntries.map(group => /*#__PURE__*/React.createElement("section", {
        className: "activity-history-day",
        key: group.label
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", null, group.label), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("small", null, group.entries.length)), /*#__PURE__*/React.createElement("div", {
        className: "activity-history-timeline"
      }, group.entries.map(entry => {
        const kind = getEntryKind(entry.description);
        const slotChange = String(entry.description || '').match(/Ranura(?: de)? nivel\s+(\d+)\s*:?\s*(\d+)\s*(?:→|->)\s*(\d+)(?:\s+disponibles)?(?:\s+de\s+(\d+))?/i);
        return /*#__PURE__*/React.createElement("article", {
          key: entry.id,
          className: `activity-history-entry is-${kind.id}`
        }, /*#__PURE__*/React.createElement("div", {
          className: "activity-history-marker",
          "aria-hidden": "true"
        }, /*#__PURE__*/React.createElement("span", null, kind.glyph)), /*#__PURE__*/React.createElement("div", {
          className: "activity-history-entry-copy"
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, slotChange ? `Ranura · Nivel ${slotChange[1]}` : kind.label), /*#__PURE__*/React.createElement("time", {
          dateTime: entry.timestamp
        }, new Date(entry.timestamp).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        }))), slotChange ? /*#__PURE__*/React.createElement("div", {
          className: "activity-history-slot-change",
          "aria-label": `Ranuras disponibles: antes ${slotChange[2]}, ahora ${slotChange[3]}${slotChange[4] ? ` de ${slotChange[4]}` : ''}`
        }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Antes"), /*#__PURE__*/React.createElement("strong", null, slotChange[2])), /*#__PURE__*/React.createElement("i", {
          "aria-hidden": "true"
        }, "→"), /*#__PURE__*/React.createElement("span", {
          className: "is-current"
        }, /*#__PURE__*/React.createElement("small", null, "Disponibles ahora"), /*#__PURE__*/React.createElement("strong", null, slotChange[3], slotChange[4] && /*#__PURE__*/React.createElement("em", null, "/ ", slotChange[4])))) : /*#__PURE__*/React.createElement("p", null, entry.description)));
      }))))) : /*#__PURE__*/React.createElement("div", {
        className: "activity-history-empty"
      }, /*#__PURE__*/React.createElement("div", {
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("span", null, "✦")), /*#__PURE__*/React.createElement("h4", null, "Una historia por escribir"), /*#__PURE__*/React.createElement("p", null, "Los descansos, cambios de nivel y otros momentos importantes aparecerán aquí.")), /*#__PURE__*/React.createElement("footer", {
        className: "activity-history-footer"
      }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "◆"), " Los cambios más recientes aparecen primero"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: !entries.length,
        onClick: onClear
      }, "Limpiar historial"))));
    };
    const TimerModal = ({
      modal,
      realTimerUnits,
      onChange,
      onClose,
      onSave,
      normalizeNumberInput
    }) => {
      if (!modal.isOpen) return null;
      const close = () => onClose({
        isOpen: false,
        id: null,
        data: {
          name: '',
          current: '1',
          max: '',
          type: 'turns'
        }
      });
      const timerTypes = [{
        id: 'turns',
        label: 'Turnos',
        icon: '→'
      }, {
        id: 'rounds',
        label: 'Rondas',
        icon: '↻'
      }, {
        id: 'minutes',
        label: 'Minutos',
        icon: '·'
      }, {
        id: 'hours',
        label: 'Horas',
        icon: '◔'
      }, {
        id: 'days',
        label: 'Días',
        icon: '☀'
      }];
      return /*#__PURE__*/React.createElement("div", {
        className: "timer-modal-backdrop",
        onClick: close
      }, /*#__PURE__*/React.createElement("section", {
        className: "timer-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "timer-modal-title",
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("header", {
        className: "timer-modal-header"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("i", null), "⌛"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, modal.id ? 'Ajustar seguimiento' : 'Nuevo seguimiento'), /*#__PURE__*/React.createElement("h3", {
        id: "timer-modal-title"
      }, modal.id ? 'Editar temporizador' : 'Crear temporizador'), /*#__PURE__*/React.createElement("p", null, "Define qué quieres vigilar y durante cuánto tiempo.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: close,
        "aria-label": "Cerrar temporizador"
      }, "×")), /*#__PURE__*/React.createElement("div", {
        className: "timer-modal-body"
      }, /*#__PURE__*/React.createElement("label", {
        className: "timer-modal-name"
      }, /*#__PURE__*/React.createElement("span", null, "Nombre del efecto"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Ej: Escudo de la fe",
        value: modal.data.name,
        onChange: event => onChange(previous => ({
          ...previous,
          data: {
            ...previous.data,
            name: event.target.value
          }
        }))
      })), /*#__PURE__*/React.createElement("fieldset", {
        className: "timer-modal-types"
      }, /*#__PURE__*/React.createElement("legend", null, "Unidad de seguimiento"), /*#__PURE__*/React.createElement("div", null, timerTypes.map(type => /*#__PURE__*/React.createElement("button", {
        key: type.id,
        type: "button",
        "aria-pressed": modal.data.type === type.id,
        className: modal.data.type === type.id ? 'is-active' : '',
        onClick: () => onChange(previous => ({
          ...previous,
          data: {
            ...previous.data,
            type: type.id
          }
        }))
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, type.icon), /*#__PURE__*/React.createElement("strong", null, type.label), /*#__PURE__*/React.createElement("i", {
        "aria-hidden": "true"
      }))))), /*#__PURE__*/React.createElement("div", {
        className: "timer-modal-values"
      }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Duración restante"), /*#__PURE__*/React.createElement("small", null, "Valor que queda ahora"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        value: modal.data.current,
        onChange: event => onChange(previous => ({
          ...previous,
          data: {
            ...previous.data,
            current: normalizeNumberInput(event.target.value)
          }
        }))
      })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Duración total"), /*#__PURE__*/React.createElement("small", null, "Opcional, muestra progreso"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        placeholder: "—",
        value: modal.data.max,
        onChange: event => onChange(previous => ({
          ...previous,
          data: {
            ...previous.data,
            max: normalizeNumberInput(event.target.value)
          }
        }))
      }))), /*#__PURE__*/React.createElement("div", {
        className: `timer-modal-note ${realTimerUnits[modal.data.type] ? 'is-realtime' : ''}`
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, realTimerUnits[modal.data.type] ? '⌛' : '↻'), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, realTimerUnits[modal.data.type] ? 'Avance en tiempo real' : 'Control manual'), realTimerUnits[modal.data.type] ? 'Seguirá descontando aunque cierres esta ventana.' : 'Podrás reducir o aumentar el contador desde Combate.'))), /*#__PURE__*/React.createElement("footer", {
        className: "timer-modal-footer"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: close
      }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-primary",
        onClick: onSave
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "✓"), modal.id ? 'Guardar cambios' : 'Crear temporizador'))));
    };
    const CharacterManagerModal = ({
      open,
      characters,
      activeCharacterId,
      onClose,
      onCreate,
      onImport,
      onSelect,
      onDuplicate,
      onExport,
      onShare,
      onDelete,
      hasPortrait
    }) => {
      if (!open) return null;
      return /*#__PURE__*/React.createElement("div", {
        className: "character-manager-backdrop",
        onClick: onClose
      }, /*#__PURE__*/React.createElement("section", {
        className: "character-manager",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "character-manager-title",
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("header", {
        className: "character-manager-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "character-manager-title"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("b", null, "✦")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Biblioteca de aventureros"), /*#__PURE__*/React.createElement("h3", {
        id: "character-manager-title"
      }, "Seleccionar personaje"), /*#__PURE__*/React.createElement("p", null, "Cambia de ficha o administra tus personajes guardados."))), /*#__PURE__*/React.createElement("div", {
        className: "character-manager-header-actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onImport,
        className: "is-import"
      }, /*#__PURE__*/React.createElement("span", null, "⇧"), " Importar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onCreate,
        className: "is-create"
      }, /*#__PURE__*/React.createElement("span", null, "＋"), " Nuevo personaje"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClose,
        className: "character-manager-close",
        "aria-label": "Cerrar selección de personajes"
      }, "×"))), /*#__PURE__*/React.createElement("div", {
        className: "character-manager-summary"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, characters.length), " ficha", characters.length === 1 ? '' : 's', " guardada", characters.length === 1 ? '' : 's'), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", null), "Guardado automático local")), /*#__PURE__*/React.createElement("div", {
        className: "character-manager-grid"
      }, characters.map(character => {
        const isActive = activeCharacterId === character.meta.id;
        const data = character.data || {};
        const info = data.charInfo || {};
        const currentHp = Math.max(0, Number(data.hp?.current) || 0);
        const maxHp = Math.max(0, Number(data.hp?.max) || 0);
        const hpPercent = maxHp > 0 ? Math.min(100, currentHp / maxHp * 100) : 0;
        const identity = [info.race, info.cls, `Nivel ${data.level || 1}`].filter(Boolean).join(' · ');
        const updated = new Date(character.meta.updatedAt).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        return /*#__PURE__*/React.createElement("article", {
          key: character.meta.id,
          "data-accent": data.presentation?.accent || 'violet',
          className: `character-manager-card ${isActive ? 'is-active' : ''}`
        }, /*#__PURE__*/React.createElement("div", {
          className: "character-manager-card-hero"
        }, /*#__PURE__*/React.createElement("div", {
          className: "character-manager-portrait"
        }, hasPortrait(character.meta.portrait) ? /*#__PURE__*/React.createElement("img", {
          src: character.meta.portrait,
          alt: ""
        }) : /*#__PURE__*/React.createElement("span", null, (character.meta.name || info.name || '?').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()), /*#__PURE__*/React.createElement("i", null, String(info.cls || 'PJ').slice(0, 2).toUpperCase())), /*#__PURE__*/React.createElement("div", {
          className: "character-manager-identity"
        }, /*#__PURE__*/React.createElement("small", null, isActive ? 'Personaje actual' : 'Ficha guardada'), /*#__PURE__*/React.createElement("h4", null, character.meta.name || info.name || 'Personaje sin nombre'), /*#__PURE__*/React.createElement("p", null, identity || 'Sin especie ni clase definidas')), isActive && /*#__PURE__*/React.createElement("span", {
          className: "character-manager-active"
        }, /*#__PURE__*/React.createElement("i", null), "Activo")), /*#__PURE__*/React.createElement("div", {
          className: "character-manager-vitals"
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "PV"), /*#__PURE__*/React.createElement("strong", null, currentHp, " ", /*#__PURE__*/React.createElement("i", null, "/ ", maxHp || '—'))), /*#__PURE__*/React.createElement("div", {
          className: "character-manager-hp-track"
        }, /*#__PURE__*/React.createElement("i", {
          style: {
            width: `${hpPercent}%`
          }
        })), Number(data.hp?.temp) > 0 && /*#__PURE__*/React.createElement("span", {
          className: "character-manager-temp"
        }, "+", data.hp.temp, " temporales")), /*#__PURE__*/React.createElement("div", {
          className: "character-manager-updated"
        }, /*#__PURE__*/React.createElement("span", null, "Última actualización"), /*#__PURE__*/React.createElement("strong", null, updated)), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => onSelect(character.meta.id),
          className: "character-manager-select"
        }, isActive ? 'Volver a la ficha' : 'Usar este personaje', " ", /*#__PURE__*/React.createElement("span", null, isActive ? '✓' : '→')), /*#__PURE__*/React.createElement("footer", {
          className: "character-manager-card-actions"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => onShare(character.meta.id)
        }, /*#__PURE__*/React.createElement("span", null, "◇"), "Compartir"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => onExport(character.meta.id)
        }, /*#__PURE__*/React.createElement("span", null, "↓"), "Exportar"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => onDuplicate(character.meta.id)
        }, /*#__PURE__*/React.createElement("span", null, "⧉"), "Duplicar"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "is-delete",
          onClick: () => onDelete(character.meta.id)
        }, /*#__PURE__*/React.createElement("span", null, "×"), "Eliminar")));
      }))));
    };
    const EquipmentCompendiumModal = ({
      open,
      items,
      query,
      category,
      onQueryChange,
      onCategoryChange,
      onClose,
      onChoose
    }) => {
      if (!open) return null;
      const normalizedQuery = query.trim().toLocaleLowerCase('es');
      const categories = [...new Set(items.map(item => item.category))].sort((left, right) => left.localeCompare(right, 'es'));
      const rarityStyles = {
        'común': 'border-slate-500 bg-slate-900/70 text-slate-100',
        'infrecuente': 'border-emerald-700 bg-emerald-950/40 text-emerald-100',
        'raro': 'border-sky-700 bg-sky-950/45 text-sky-100',
        'muy raro': 'border-violet-700 bg-violet-950/45 text-violet-100',
        'legendario': 'border-amber-500 bg-amber-950/55 text-amber-100 shadow-[0_0_14px_rgba(245,158,11,0.16)]',
        'rareza variable': 'border-fuchsia-700 bg-fuchsia-950/45 text-fuchsia-100'
      };
      const matches = items.filter(item => (!normalizedQuery || item.name.toLocaleLowerCase('es').includes(normalizedQuery) || item.category.toLocaleLowerCase('es').includes(normalizedQuery)) && (!category || item.category === category));
      return /*#__PURE__*/React.createElement("div", {
        className: "fixed inset-0 z-[65] flex items-center justify-center bg-black/85 p-4",
        onClick: onClose
      }, /*#__PURE__*/React.createElement("div", {
        className: "rpg-panel flex max-h-[90dvh] w-full max-w-3xl flex-col border border-amber-700 p-4",
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center justify-between gap-3 border-b border-gray-700 pb-3"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
        className: "font-fantasy text-xl font-bold uppercase tracking-wider text-amber-200"
      }, "Equipo de aventurero"), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-gray-400"
      }, "Catálogo SRD 5.1. Puedes revisar y editar cada dato antes de guardarlo.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClose,
        className: "h-11 w-11 rounded border border-gray-600 text-xl text-gray-200"
      }, "×")), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem]"
      }, /*#__PURE__*/React.createElement("input", {
        value: query,
        onChange: event => onQueryChange(event.target.value),
        placeholder: "Buscar equipo",
        className: "min-h-11 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white"
      }), /*#__PURE__*/React.createElement("select", {
        value: category,
        onChange: event => onCategoryChange(event.target.value),
        className: "min-h-11 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white"
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Todas las categorías"), categories.map(item => /*#__PURE__*/React.createElement("option", {
        key: item,
        value: item
      }, item)))), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 grid flex-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2"
      }, matches.map(item => /*#__PURE__*/React.createElement("article", {
        key: item.id,
        className: "flex flex-col rounded border border-gray-700 bg-gray-900/60 p-3"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
        className: "text-sm text-white"
      }, item.name), /*#__PURE__*/React.createElement("span", {
        className: "mt-1 block text-[10px] uppercase text-amber-300"
      }, item.category), item.data.desc && /*#__PURE__*/React.createElement("p", {
        className: "mt-2 text-xs text-gray-400"
      }, item.data.desc), item.type === 'armor' && /*#__PURE__*/React.createElement("p", {
        className: "mt-2 text-xs text-cyan-200"
      }, "CA ", item.data.type === 'shield' ? `+${item.data.ac}` : item.data.ac, " · ", item.data.type), item.type === 'weapon' && /*#__PURE__*/React.createElement("p", {
        className: "mt-2 text-xs text-red-200"
      }, item.data.attacks?.[0]?.dmg)), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onChoose(item),
        className: "mt-auto min-h-10 rounded border border-amber-700 bg-amber-950/30 px-3 text-xs font-bold text-amber-100"
      }, "Usar como plantilla"))), !matches.length && /*#__PURE__*/React.createElement("p", {
        className: "py-8 text-center text-sm text-gray-500 sm:col-span-2"
      }, "No hay equipo que coincida."))));
    };
    const EquipmentMarketModalLegacy = ({
      open,
      items,
      query,
      category,
      onQueryChange,
      onCategoryChange,
      onClose,
      onChoose
    }) => {
      const [selectedItem, setSelectedItem] = React.useState(null);
      if (!open) return null;
      const normalizedQuery = query.trim().toLocaleLowerCase('es');
      const categories = [...new Set(items.map(item => item.category))].sort((left, right) => left.localeCompare(right, 'es'));
      const rarityStyles = {
        'común': 'border-slate-500 bg-slate-900/70 text-slate-100',
        'infrecuente': 'border-emerald-700 bg-emerald-950/40 text-emerald-100',
        'raro': 'border-sky-700 bg-sky-950/45 text-sky-100',
        'muy raro': 'border-violet-700 bg-violet-950/45 text-violet-100',
        'legendario': 'border-amber-500 bg-amber-950/55 text-amber-100 shadow-[0_0_14px_rgba(245,158,11,0.16)]',
        'rareza variable': 'border-fuchsia-700 bg-fuchsia-950/45 text-fuchsia-100'
      };
      const matches = items.filter(item => {
        const searchable = [item.name, item.category, item.rarity, item.data?.desc, item.data?.details, item.price].filter(Boolean).join(' ').toLocaleLowerCase('es');
        return (!normalizedQuery || searchable.includes(normalizedQuery)) && (!category || item.category === category);
      });
      const getItemFacts = item => {
        const armorClass = item.type === 'armor' ? item.data.type === 'shield' ? `+${item.data.ac} CA` : `CA ${item.data.ac}` : null;
        return {
          armorClass,
          weaponDamage: item.type === 'weapon' ? item.data.attacks?.[0]?.dmg : null,
          isMagicItem: Boolean(item.rarity),
          rarityClass: rarityStyles[item.rarity] || rarityStyles['rareza variable']
        };
      };
      const formatRarity = rarity => rarity ? `${rarity.charAt(0).toLocaleUpperCase('es')}${rarity.slice(1)}` : '';
      const renderItemBadges = item => {
        const {
          armorClass,
          weaponDamage,
          rarityClass
        } = getItemFacts(item);
        return /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap gap-1.5"
        }, item.rarity && /*#__PURE__*/React.createElement("span", {
          className: `rounded border px-2 py-1 text-[10px] font-bold shadow-sm ${rarityClass}`
        }, formatRarity(item.rarity)), item.attunement && /*#__PURE__*/React.createElement("span", {
          className: "rounded border border-indigo-800 bg-indigo-950/35 px-2 py-1 text-[10px] font-bold text-indigo-100"
        }, "Requiere sintonización"), armorClass && /*#__PURE__*/React.createElement("span", {
          className: "rounded border border-cyan-800 bg-cyan-950/25 px-2 py-1 text-[10px] font-bold text-cyan-100"
        }, armorClass), item.data?.stealthDis && /*#__PURE__*/React.createElement("span", {
          className: "rounded border border-red-800 bg-red-950/25 px-2 py-1 text-[10px] font-bold text-red-100"
        }, "Desventaja en Sigilo"), weaponDamage && /*#__PURE__*/React.createElement("span", {
          className: "rounded border border-red-800 bg-red-950/25 px-2 py-1 font-mono text-[10px] font-bold text-red-100"
        }, weaponDamage));
      };
      const selectedFacts = selectedItem ? getItemFacts(selectedItem) : null;
      const handleClose = () => {
        setSelectedItem(null);
        onClose();
      };
      return /*#__PURE__*/React.createElement("div", {
        className: "fixed inset-0 z-[65] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-4",
        onClick: handleClose
      }, /*#__PURE__*/React.createElement("section", {
        className: "rpg-panel flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden border border-amber-700/80 p-4 sm:p-5",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "equipment-market-title",
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("header", {
        className: "grid grid-cols-[minmax(0,1fr)_2.75rem] items-start gap-3 border-b border-amber-900/60 pb-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "min-w-0"
      }, /*#__PURE__*/React.createElement("p", {
        className: "text-[10px] font-bold uppercase tracking-widest text-amber-400"
      }, "Catálogo SRD 5.1"), /*#__PURE__*/React.createElement("h3", {
        id: "equipment-market-title",
        className: "mt-1 font-fantasy text-xl font-bold uppercase tracking-wider text-amber-100"
      }, selectedItem ? selectedItem.name : 'Mercado y tesoro'), /*#__PURE__*/React.createElement("p", {
        className: "mt-1 text-xs text-gray-400"
      }, selectedItem ? selectedItem.category : 'Un inventario de suministros y tesoros. Abre cada ficha para consultar su uso completo.')), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: handleClose,
        className: "flex h-11 w-11 items-center justify-center rounded border border-gray-600 text-xl text-gray-200 hover:border-amber-500 hover:text-amber-100",
        "aria-label": "Cerrar mercado de equipo"
      }, "×")), selectedItem ? /*#__PURE__*/React.createElement("div", {
        className: "mt-4 flex min-h-0 flex-1 flex-col"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap items-center justify-between gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setSelectedItem(null),
        className: "min-h-11 rounded border border-gray-600 px-3 text-xs font-bold text-gray-200 hover:border-amber-500 hover:text-amber-100"
      }, "← Volver al catálogo"), !selectedFacts.isMagicItem && /*#__PURE__*/React.createElement("span", {
        className: "rounded border border-amber-700 bg-amber-950/35 px-3 py-2 text-sm font-bold text-amber-100"
      }, selectedItem.price || 'Precio a consultar')), /*#__PURE__*/React.createElement("div", {
        className: "mt-4 min-h-0 flex-1 overflow-y-auto pr-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: `rounded border p-4 ${selectedFacts.isMagicItem ? 'border-fuchsia-800/70 bg-fuchsia-950/10' : 'border-amber-900/70 bg-amber-950/10'}`
      }, /*#__PURE__*/React.createElement("p", {
        className: "text-sm leading-relaxed text-gray-200"
      }, selectedItem.data?.desc || 'Objeto de uso aventurero.'), /*#__PURE__*/React.createElement("div", {
        className: "mt-4"
      }, renderItemBadges(selectedItem))), /*#__PURE__*/React.createElement("section", {
        className: "mt-4 rounded border border-gray-700 bg-gray-950/45 p-4"
      }, /*#__PURE__*/React.createElement("h4", {
        className: "text-xs font-bold uppercase tracking-wider text-amber-200"
      }, "Uso y propiedades"), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-200"
      }, selectedItem.data?.details || selectedItem.data?.desc || 'No hay una descripción adicional disponible.')), selectedFacts.isMagicItem && /*#__PURE__*/React.createElement("p", {
        className: "mt-3 rounded border border-indigo-900/70 bg-indigo-950/20 px-3 py-2 text-xs leading-relaxed text-indigo-100"
      }, "Los efectos se aplican manualmente durante la partida. Esta ficha resume cuándo puede usarse el objeto y qué hace.")), /*#__PURE__*/React.createElement("div", {
        className: "mt-4 flex flex-wrap justify-end gap-2 border-t border-gray-800 pt-3"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setSelectedItem(null),
        className: "min-h-11 rounded border border-gray-600 px-4 text-sm text-gray-200"
      }, "Volver"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          onChoose(selectedItem);
          setSelectedItem(null);
        },
        className: "min-h-11 rounded border border-amber-700 bg-amber-950/30 px-4 text-sm font-bold text-amber-100 hover:bg-amber-900/45"
      }, "Añadir a la ficha"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_13rem]"
      }, /*#__PURE__*/React.createElement("input", {
        value: query,
        onChange: event => onQueryChange(event.target.value),
        placeholder: "Buscar objeto o categoría",
        className: "min-h-11 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white outline-none focus:border-amber-500"
      }), /*#__PURE__*/React.createElement("select", {
        value: category,
        onChange: event => onCategoryChange(event.target.value),
        className: "min-h-11 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white outline-none focus:border-amber-500"
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Todas las categorías"), categories.map(item => /*#__PURE__*/React.createElement("option", {
        key: item,
        value: item
      }, item)))), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 flex items-center justify-between gap-3 border-b border-gray-800 pb-2 text-xs text-gray-400"
      }, /*#__PURE__*/React.createElement("span", null, matches.length, " objeto", matches.length === 1 ? '' : 's', " disponible", matches.length === 1 ? '' : 's', " en el catálogo"), /*#__PURE__*/React.createElement("span", {
        className: "shrink-0 text-amber-300"
      }, "Suministros y objetos mágicos")), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 grid min-h-0 flex-1 auto-rows-[18rem] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3"
      }, matches.map(item => {
        const {
          isMagicItem
        } = getItemFacts(item);
        const priceClass = item.price?.includes(' po') ? 'border-yellow-600/80 bg-yellow-950/45 text-yellow-100' : item.price?.includes(' pp') ? 'border-slate-500 bg-slate-800/80 text-slate-100' : 'border-orange-700/80 bg-orange-950/40 text-orange-100';
        return /*#__PURE__*/React.createElement("article", {
          key: item.id,
          className: `flex h-full min-h-0 flex-col overflow-hidden rounded border bg-gray-900/60 p-3 transition-colors ${isMagicItem ? 'border-fuchsia-800/70 hover:border-fuchsia-600' : 'border-amber-900/70 hover:border-amber-600'}`
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex items-start justify-between gap-2"
        }, /*#__PURE__*/React.createElement("div", {
          className: "min-w-0"
        }, /*#__PURE__*/React.createElement("h4", {
          className: "min-h-10 text-sm font-bold leading-snug text-white"
        }, item.name), /*#__PURE__*/React.createElement("p", {
          className: `mt-1 text-[10px] font-bold uppercase tracking-wider ${isMagicItem ? 'text-fuchsia-300' : 'text-amber-300'}`
        }, item.category)), !isMagicItem && /*#__PURE__*/React.createElement("span", {
          className: `shrink-0 rounded border px-2 py-1 text-xs font-bold shadow-sm ${priceClass}`
        }, item.price || 'Consultar')), /*#__PURE__*/React.createElement("p", {
          className: "mt-3 h-[4.5rem] overflow-hidden text-xs leading-relaxed text-gray-300"
        }, item.data?.desc || 'Equipo de uso común.'), /*#__PURE__*/React.createElement("div", {
          className: "mt-3"
        }, renderItemBadges(item)), /*#__PURE__*/React.createElement("div", {
          className: "mt-auto grid grid-cols-2 gap-2 pt-3"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setSelectedItem(item),
          className: "min-h-11 rounded border border-gray-600 bg-gray-950/40 px-2 text-xs font-bold text-gray-100 hover:border-fuchsia-600"
        }, "Ver ficha"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => onChoose(item),
          className: "min-h-11 rounded border border-amber-700 bg-amber-950/30 px-2 text-xs font-bold text-amber-100 hover:bg-amber-900/45"
        }, "Añadir a la ficha")));
      }), !matches.length && /*#__PURE__*/React.createElement("p", {
        className: "py-10 text-center text-sm text-gray-500 sm:col-span-2 lg:col-span-3"
      }, "No hay objetos que coincidan con la búsqueda.")))));
    };
    const EquipmentMarketModal = ({
      open,
      items,
      query,
      category,
      onQueryChange,
      onCategoryChange,
      onClose,
      onChoose
    }) => {
      const [selectedItem, setSelectedItem] = React.useState(null);
      if (!open) return null;
      const normalizedQuery = query.trim().toLocaleLowerCase('es');
      const categories = [...new Set(items.map(item => item.category))].sort((left, right) => left.localeCompare(right, 'es'));
      const matches = items.filter(item => {
        const searchable = [item.name, item.category, item.rarity, item.data?.desc, item.data?.details, item.price].filter(Boolean).join(' ').toLocaleLowerCase('es');
        return (!normalizedQuery || searchable.includes(normalizedQuery)) && (!category || item.category === category);
      });
      const isMagicItem = item => Boolean(item?.rarity);
      const rarityTone = rarity => String(rarity || 'mundano').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
      const itemGlyph = item => {
        if (isMagicItem(item)) return '✦';
        if (item.type === 'weapon') return '†';
        if (item.type === 'armor') return '◇';
        if (String(item.category || '').toLocaleLowerCase('es').includes('herramient')) return '⌁';
        return '◆';
      };
      const itemFacts = item => [item.type === 'armor' && (item.data?.type === 'shield' ? `+${item.data?.ac} CA` : `CA ${item.data?.ac}`), item.type === 'weapon' && item.data?.attacks?.[0]?.dmg, item.attunement && 'Requiere sintonización', item.data?.stealthDis && 'Desventaja en Sigilo'].filter(Boolean);
      const formatRarity = rarity => rarity ? `${rarity.charAt(0).toLocaleUpperCase('es')}${rarity.slice(1)}` : '';
      const handleClose = () => {
        setSelectedItem(null);
        onClose();
      };
      const magicCount = matches.filter(isMagicItem).length;
      return /*#__PURE__*/React.createElement("div", {
        className: "treasure-catalog-backdrop",
        onClick: handleClose
      }, /*#__PURE__*/React.createElement("section", {
        className: `treasure-catalog ${selectedItem ? 'is-detail' : ''}`,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "treasure-catalog-title",
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("header", {
        className: "treasure-catalog-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "treasure-catalog-emblem",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("span", null, "✦"), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Archivo del aventurero"), /*#__PURE__*/React.createElement("h3", {
        id: "treasure-catalog-title"
      }, selectedItem ? selectedItem.name : 'Mercado y tesoro'), /*#__PURE__*/React.createElement("p", null, selectedItem ? selectedItem.category : 'Equipo, suministros y objetos extraordinarios para tu ficha.')), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => selectedItem ? setSelectedItem(null) : handleClose(),
        className: "treasure-catalog-close",
        "aria-label": selectedItem ? 'Cerrar ficha y volver al catálogo' : 'Cerrar mercado y tesoro'
      }, "×")), selectedItem ? /*#__PURE__*/React.createElement("div", {
        className: "treasure-detail"
      }, /*#__PURE__*/React.createElement("div", {
        className: `treasure-detail-hero is-${rarityTone(selectedItem.rarity)}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "treasure-detail-sigil",
        "aria-hidden": "true"
      }, itemGlyph(selectedItem)), /*#__PURE__*/React.createElement("div", {
        className: "treasure-detail-identity"
      }, /*#__PURE__*/React.createElement("small", null, isMagicItem(selectedItem) ? 'Tesoro mágico' : 'Equipo de aventurero'), /*#__PURE__*/React.createElement("h4", null, selectedItem.name), /*#__PURE__*/React.createElement("p", null, selectedItem.category)), /*#__PURE__*/React.createElement("div", {
        className: "treasure-detail-value"
      }, isMagicItem(selectedItem) ? /*#__PURE__*/React.createElement("span", {
        className: `treasure-rarity is-${rarityTone(selectedItem.rarity)}`
      }, formatRarity(selectedItem.rarity)) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("small", null, "Valor"), /*#__PURE__*/React.createElement("strong", null, selectedItem.price || 'Consultar')))), /*#__PURE__*/React.createElement("div", {
        className: "treasure-detail-scroll"
      }, /*#__PURE__*/React.createElement("section", {
        className: "treasure-detail-summary"
      }, /*#__PURE__*/React.createElement("span", null, "Descripción"), /*#__PURE__*/React.createElement("p", null, selectedItem.data?.desc || 'Objeto de uso aventurero.')), itemFacts(selectedItem).length > 0 && /*#__PURE__*/React.createElement("div", {
        className: "treasure-facts"
      }, itemFacts(selectedItem).map(fact => /*#__PURE__*/React.createElement("span", {
        key: fact
      }, fact))), /*#__PURE__*/React.createElement("section", {
        className: "treasure-detail-properties"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "◇"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Consulta de reglas"), /*#__PURE__*/React.createElement("h5", null, "Uso y propiedades"))), /*#__PURE__*/React.createElement("div", null, selectedItem.data?.details || selectedItem.data?.desc || 'No hay una descripción adicional disponible.')), isMagicItem(selectedItem) && /*#__PURE__*/React.createElement("aside", {
        className: "treasure-magic-note"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "✦"), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Objeto mágico"), " Sus efectos se aplican manualmente durante la partida; la ficha no toma decisiones por el jugador."))), /*#__PURE__*/React.createElement("footer", {
        className: "treasure-detail-actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-primary",
        onClick: () => {
          onChoose(selectedItem);
          setSelectedItem(null);
        }
      }, /*#__PURE__*/React.createElement("span", null, "＋"), "Añadir a la ficha"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "treasure-catalog-tools"
      }, /*#__PURE__*/React.createElement("label", {
        className: "treasure-search"
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("circle", {
        cx: "11",
        cy: "11",
        r: "6"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m16 16 4 4"
      })), /*#__PURE__*/React.createElement("input", {
        value: query,
        onChange: event => onQueryChange(event.target.value),
        placeholder: "Buscar por nombre, propiedad o categoría",
        "aria-label": "Buscar en mercado y tesoro"
      }), query && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onQueryChange(''),
        "aria-label": "Limpiar búsqueda"
      }, "×")), /*#__PURE__*/React.createElement("label", {
        className: "treasure-category"
      }, /*#__PURE__*/React.createElement("span", null, "Categoría"), /*#__PURE__*/React.createElement("select", {
        value: category,
        onChange: event => onCategoryChange(event.target.value)
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Todas"), categories.map(item => /*#__PURE__*/React.createElement("option", {
        key: item,
        value: item
      }, item))))), /*#__PURE__*/React.createElement("div", {
        className: "treasure-catalog-summary"
      }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, matches.length), " resultados"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
        className: "is-equipment"
      }), matches.length - magicCount, " de equipo"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
        className: "is-magic"
      }), magicCount, " mágicos"))), /*#__PURE__*/React.createElement("div", {
        className: "treasure-catalog-grid"
      }, matches.map(item => {
        const magic = isMagicItem(item);
        const facts = itemFacts(item).slice(0, 2);
        return /*#__PURE__*/React.createElement("article", {
          key: item.id,
          className: `treasure-card ${magic ? `is-magic is-${rarityTone(item.rarity)}` : 'is-equipment'}`
        }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
          className: "treasure-card-sigil",
          "aria-hidden": "true"
        }, itemGlyph(item)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, item.category), /*#__PURE__*/React.createElement("h4", null, item.name)), magic ? /*#__PURE__*/React.createElement("span", {
          className: `treasure-rarity is-${rarityTone(item.rarity)}`
        }, formatRarity(item.rarity)) : /*#__PURE__*/React.createElement("span", {
          className: "treasure-price"
        }, item.price || 'Consultar')), /*#__PURE__*/React.createElement("p", {
          className: "treasure-card-description"
        }, item.data?.desc || 'Equipo de uso común.'), facts.length > 0 && /*#__PURE__*/React.createElement("div", {
          className: "treasure-card-facts"
        }, facts.map(fact => /*#__PURE__*/React.createElement("span", {
          key: fact
        }, fact))), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setSelectedItem(item)
        }, "Consultar"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "is-add",
          onClick: () => onChoose(item),
          "aria-label": `Añadir ${item.name} a la ficha`
        }, "＋ ", /*#__PURE__*/React.createElement("span", null, "Añadir"))));
      }), !matches.length && /*#__PURE__*/React.createElement("div", {
        className: "treasure-catalog-empty"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "◇"), /*#__PURE__*/React.createElement("h4", null, "No aparece ningún objeto"), /*#__PURE__*/React.createElement("p", null, "Prueba otra búsqueda o selecciona una categoría diferente."), (query || category) && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          onQueryChange('');
          onCategoryChange('');
        }
      }, "Restablecer filtros"))))));
    };
    return {
      ActivityHistoryModal,
      TimerModal,
      CharacterManagerModal,
      EquipmentCompendiumModal: EquipmentMarketModal
    };
  })();
})();