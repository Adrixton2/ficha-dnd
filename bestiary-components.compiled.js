(() => {
  window.DndBestiaryComponents = (() => {
    const BestiaryImportPreviewModal = ({
      preview,
      importMode,
      duplicateMode,
      selectedIds,
      onImportModeChange,
      onDuplicateModeChange,
      onSelectedIdsChange,
      onClose,
      onConfirm
    }) => {
      if (!preview) return null;
      return /*#__PURE__*/React.createElement("div", {
        className: "fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "rpg-panel max-h-[90vh] w-full max-w-xl overflow-y-auto border border-orange-700 p-5"
      }, /*#__PURE__*/React.createElement("h3", {
        className: "font-fantasy text-lg font-bold text-orange-200"
      }, "Vista previa de importacion"), /*#__PURE__*/React.createElement("p", {
        className: "mt-2 text-sm text-gray-300"
      }, preview.monsters.length, " criaturas validas · ", preview.duplicates.length, " posibles duplicados · ", preview.invalid, " invalidas · ", preview.monsters.filter(monster => monster.avatarDataUrl).length, " con avatar · ", Math.ceil(preview.size / 1024), " KB"), preview.avatarsRemoved && /*#__PURE__*/React.createElement("p", {
        className: "mt-2 text-xs text-yellow-200"
      }, "Los avatares se han excluido por exceder el limite total."), /*#__PURE__*/React.createElement("div", {
        className: "mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "Modo", /*#__PURE__*/React.createElement("select", {
        value: importMode,
        onChange: event => onImportModeChange(event.target.value),
        className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
      }, /*#__PURE__*/React.createElement("option", {
        value: "merge"
      }, "Combinar"), /*#__PURE__*/React.createElement("option", {
        value: "replace"
      }, "Reemplazar todo"))), /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "Duplicados", /*#__PURE__*/React.createElement("select", {
        value: duplicateMode,
        onChange: event => onDuplicateModeChange(event.target.value),
        className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
      }, /*#__PURE__*/React.createElement("option", {
        value: "skip"
      }, "Omitir"), /*#__PURE__*/React.createElement("option", {
        value: "replace"
      }, "Reemplazar"), /*#__PURE__*/React.createElement("option", {
        value: "copy"
      }, "Importar como copia")))), /*#__PURE__*/React.createElement("div", {
        className: "mt-4 max-h-64 space-y-1 overflow-y-auto pr-1"
      }, preview.monsters.map(monster => /*#__PURE__*/React.createElement("label", {
        key: monster.id,
        className: "flex items-center gap-2 rounded border border-gray-700 bg-gray-900/60 px-3 py-2 text-sm text-gray-200"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: selectedIds.includes(monster.id),
        onChange: event => onSelectedIdsChange(previous => event.target.checked ? [...previous, monster.id] : previous.filter(id => id !== monster.id))
      }), /*#__PURE__*/React.createElement("span", {
        className: "min-w-0 flex-1 truncate"
      }, monster.name, " · PV ", monster.maxHp, " · CA ", monster.armorClass ?? '—'), preview.duplicates.includes(monster.id) && /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] text-yellow-200"
      }, "Duplicado")))), /*#__PURE__*/React.createElement("div", {
        className: "mt-5 flex justify-end gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClose,
        className: "min-h-10 rounded border border-gray-600 px-3 text-sm text-gray-300"
      }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onConfirm,
        className: "min-h-10 rounded border border-orange-700 bg-orange-950/30 px-4 text-sm font-bold text-orange-100"
      }, "Confirmar importacion"))));
    };
    const LocalBestiaryModal = ({
      open,
      editor,
      warning,
      notice,
      query,
      tag,
      sort,
      tags,
      monsters,
      avatarInputRef,
      onClose,
      onOpenCompendium,
      onCreate,
      onQueryChange,
      onTagChange,
      onSortChange,
      onUseMonster,
      onEditMonster,
      onDuplicateMonster,
      onDeleteMonster,
      onAvatarChange,
      onEditorChange,
      onPickAvatar,
      onCancelEditor,
      onSaveEditor
    }) => {
      if (!open) return null;
      return /*#__PURE__*/React.createElement("div", {
        className: "local-bestiary-backdrop",
        onClick: () => {
          if (!editor) onClose();
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "local-bestiary",
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("div", {
        className: "local-bestiary-header"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Biblioteca personal"), /*#__PURE__*/React.createElement("h3", null, "Mis criaturas"), /*#__PURE__*/React.createElement("p", null, "Variantes guardadas, plantillas propias e importaciones.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onOpenCompendium
      }, "Compendio SRD"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onCreate,
        className: "is-primary"
      }, "+ Nueva criatura"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClose,
        className: "local-bestiary-close",
        "aria-label": "Cerrar Mis criaturas"
      }, "×"))), (warning || notice) && /*#__PURE__*/React.createElement("p", {
        className: "mt-3 rounded border border-yellow-800 bg-yellow-950/30 px-3 py-2 text-xs text-yellow-100"
      }, notice || warning), !editor ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
      }, /*#__PURE__*/React.createElement("input", {
        value: query,
        onChange: event => onQueryChange(event.target.value),
        placeholder: "Buscar criatura o etiqueta",
        className: "min-h-10 rounded border border-gray-600 bg-gray-950 px-3 text-sm text-white"
      }), /*#__PURE__*/React.createElement("select", {
        value: tag,
        onChange: event => onTagChange(event.target.value),
        className: "min-h-10 rounded border border-gray-600 bg-gray-950 px-2 text-sm text-white"
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Todas las etiquetas"), tags.map(item => /*#__PURE__*/React.createElement("option", {
        key: item,
        value: item
      }, item))), /*#__PURE__*/React.createElement("select", {
        value: sort,
        onChange: event => onSortChange(event.target.value),
        className: "min-h-10 rounded border border-gray-600 bg-gray-950 px-2 text-sm text-white"
      }, /*#__PURE__*/React.createElement("option", {
        value: "name"
      }, "Nombre"), /*#__PURE__*/React.createElement("option", {
        value: "updated"
      }, "Actualizacion"))), /*#__PURE__*/React.createElement("div", {
        className: "local-bestiary-list"
      }, monsters.map(monster => /*#__PURE__*/React.createElement("div", {
        key: monster.id,
        className: "local-bestiary-card"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded border border-orange-700 bg-orange-950/30 text-sm font-bold text-orange-100"
      }, monster.avatarDataUrl ? /*#__PURE__*/React.createElement("img", {
        src: monster.avatarDataUrl,
        alt: "",
        className: "h-full w-full object-cover"
      }) : monster.name.slice(0, 1).toUpperCase()), /*#__PURE__*/React.createElement("div", {
        className: "min-w-0 flex-1"
      }, /*#__PURE__*/React.createElement("strong", {
        className: "block truncate text-sm text-white"
      }, monster.name), /*#__PURE__*/React.createElement("span", {
        className: "text-xs text-gray-400"
      }, "PV ", monster.maxHp, " · CA ", monster.armorClass ?? '—'), monster.tags.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: "mt-1 flex flex-wrap gap-1"
      }, monster.tags.map(item => /*#__PURE__*/React.createElement("span", {
        key: item,
        className: "rounded border border-orange-900 px-1.5 py-0.5 text-[10px] text-orange-200"
      }, item)))), /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap gap-1"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onUseMonster(monster),
        className: "min-h-9 rounded border border-orange-700 px-2 text-[10px] text-orange-100"
      }, "Usar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onEditMonster(monster),
        className: "min-h-9 rounded border border-gray-600 px-2 text-[10px] text-gray-200"
      }, "Editar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onDuplicateMonster(monster.id),
        className: "min-h-9 rounded border border-purple-700 px-2 text-[10px] text-purple-100"
      }, "Duplicar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onDeleteMonster(monster),
        className: "min-h-9 rounded border border-red-800 px-2 text-[10px] text-red-100"
      }, "Eliminar")))), !monsters.length && /*#__PURE__*/React.createElement("p", {
        className: "py-8 text-center text-sm text-gray-500"
      }, "No hay criaturas que coincidan."))) : /*#__PURE__*/React.createElement("div", {
        className: "mt-4 flex-1 overflow-y-auto pr-1"
      }, /*#__PURE__*/React.createElement("input", {
        ref: avatarInputRef,
        type: "file",
        accept: "image/png,image/jpeg,image/webp",
        onChange: onAvatarChange,
        className: "hidden"
      }), /*#__PURE__*/React.createElement("div", {
        className: "grid grid-cols-1 gap-3 sm:grid-cols-2"
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "Nombre", /*#__PURE__*/React.createElement("input", {
        autoFocus: true,
        value: editor.name,
        onChange: event => onEditorChange(previous => ({
          ...previous,
          name: event.target.value
        })),
        className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
      })), /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "PV maximos", /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        value: editor.maxHp,
        onChange: event => onEditorChange(previous => ({
          ...previous,
          maxHp: event.target.value
        })),
        className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
      })), /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "CA", /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        value: editor.armorClass ?? '',
        onChange: event => onEditorChange(previous => ({
          ...previous,
          armorClass: event.target.value
        })),
        className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
      })), /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "Estado visible", /*#__PURE__*/React.createElement("select", {
        value: editor.defaultVisibleStateMode,
        onChange: event => onEditorChange(previous => ({
          ...previous,
          defaultVisibleStateMode: event.target.value
        })),
        className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
      }, /*#__PURE__*/React.createElement("option", {
        value: "automatic"
      }, "Automatico"), /*#__PURE__*/React.createElement("option", {
        value: "manual"
      }, "Manual"), /*#__PURE__*/React.createElement("option", {
        value: "hidden"
      }, "Oculto"))), editor.defaultVisibleStateMode === 'manual' && /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "Estado manual", /*#__PURE__*/React.createElement("input", {
        value: editor.defaultManualVisibleState || '',
        onChange: event => onEditorChange(previous => ({
          ...previous,
          defaultManualVisibleState: event.target.value
        })),
        className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
      })), /*#__PURE__*/React.createElement("label", {
        className: "text-sm text-gray-300"
      }, "Etiquetas", /*#__PURE__*/React.createElement("input", {
        value: editor.tags.join(', '),
        onChange: event => onEditorChange(previous => ({
          ...previous,
          tags: event.target.value.split(',').map(item => item.trim()).filter(Boolean)
        })),
        placeholder: "no-muerto, bosque",
        className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
      }))), /*#__PURE__*/React.createElement("label", {
        className: "mt-3 block text-sm text-gray-300"
      }, "Condiciones publicas iniciales", /*#__PURE__*/React.createElement("input", {
        value: editor.defaultPublicConditions.map(item => typeof item === 'string' ? item : item.name).join(', '),
        onChange: event => onEditorChange(previous => ({
          ...previous,
          defaultPublicConditions: event.target.value.split(',').map(item => item.trim()).filter(Boolean)
        })),
        placeholder: "envenenado, invisible",
        className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
      })), /*#__PURE__*/React.createElement("label", {
        className: "mt-3 block text-sm text-gray-300"
      }, "Notas privadas", /*#__PURE__*/React.createElement("textarea", {
        value: editor.privateNotes,
        onChange: event => onEditorChange(previous => ({
          ...previous,
          privateNotes: event.target.value
        })),
        className: "mt-1 min-h-24 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
      })), /*#__PURE__*/React.createElement("div", {
        className: "mt-3 flex items-center gap-3"
      }, editor.avatarDataUrl ? /*#__PURE__*/React.createElement("img", {
        src: editor.avatarDataUrl,
        alt: "",
        className: "h-12 w-12 rounded border border-orange-700 object-cover"
      }) : /*#__PURE__*/React.createElement("span", {
        className: "flex h-12 w-12 items-center justify-center rounded border border-gray-700 text-orange-200"
      }, "?"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onPickAvatar,
        className: "min-h-10 rounded border border-orange-700 px-3 text-xs text-orange-100"
      }, "Avatar"), editor.avatarDataUrl && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onEditorChange(previous => ({
          ...previous,
          avatarDataUrl: ''
        })),
        className: "min-h-10 rounded border border-red-800 px-3 text-xs text-red-100"
      }, "Quitar")), /*#__PURE__*/React.createElement("div", {
        className: "mt-5 flex justify-end gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onCancelEditor,
        className: "min-h-10 rounded border border-gray-600 px-3 text-sm text-gray-300"
      }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onSaveEditor,
        className: "min-h-10 rounded border border-orange-700 bg-orange-950/30 px-4 text-sm font-bold text-orange-100"
      }, "Guardar plantilla")))));
    };
    const SrdMonsterCompendiumModal = ({
      open,
      compendium,
      localMonsters,
      query,
      type,
      challenge,
      preview,
      onClose,
      onQueryChange,
      onTypeChange,
      onChallengeChange,
      onPreviewChange,
      onAddMonster,
      canUseInTable,
      onUseMonster,
      onOpenLocalBestiary
    }) => {
      if (!open) return null;
      const normalizedQuery = query.trim().toLocaleLowerCase('es');
      const types = [...new Set(compendium.monsters.map(monster => monster.details?.type).filter(Boolean))].sort((left, right) => left.localeCompare(right, 'es'));
      const challenges = [...new Set(compendium.monsters.map(monster => monster.details?.challengeRating).filter(Boolean))].sort((left, right) => Number.parseFloat(left) - Number.parseFloat(right));
      const matches = compendium.monsters.filter(monster => (!normalizedQuery || monster.name.toLocaleLowerCase('es').includes(normalizedQuery) || monster.details?.type?.toLocaleLowerCase('es').includes(normalizedQuery)) && (!type || monster.details?.type === type) && (!challenge || monster.details?.challengeRating === challenge)).slice().sort((left, right) => left.name.localeCompare(right.name, 'es'));
      const details = preview?.details || {};
      const statEntries = [['FUE', details.abilities?.str], ['DES', details.abilities?.dex], ['CON', details.abilities?.con], ['INT', details.abilities?.int], ['SAB', details.abilities?.wis], ['CAR', details.abilities?.cha]];
      const added = monster => localMonsters.some(item => item.compendiumSource === monster.id);
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "monster-compendium-backdrop",
        onClick: onClose
      }, /*#__PURE__*/React.createElement("div", {
        className: "monster-compendium",
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("header", {
        className: "monster-compendium-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "monster-compendium-title"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("b", null, "♜")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "SRD 5.1 · Biblioteca de encuentro"), /*#__PURE__*/React.createElement("h3", null, "Compendio de criaturas"), /*#__PURE__*/React.createElement("p", null, "Consulta fichas, guarda variantes o prepara enemigos directamente para la Mesa Online."))), /*#__PURE__*/React.createElement("div", {
        className: "monster-compendium-header-actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onOpenLocalBestiary
      }, /*#__PURE__*/React.createElement("span", null, localMonsters.length), " Mis criaturas"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClose,
        className: "monster-compendium-close",
        "aria-label": "Cerrar compendio"
      }, "×"))), /*#__PURE__*/React.createElement("div", {
        className: "monster-compendium-status"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, compendium.monsters.length), " criaturas SRD"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, localMonsters.length), " guardadas"), /*#__PURE__*/React.createElement("span", {
        className: canUseInTable ? 'is-online' : ''
      }, /*#__PURE__*/React.createElement("i", null), canUseInTable ? 'Máster conectado' : 'Mesa no disponible')), /*#__PURE__*/React.createElement("div", {
        className: "monster-compendium-filters"
      }, /*#__PURE__*/React.createElement("label", {
        className: "monster-compendium-search"
      }, /*#__PURE__*/React.createElement("span", null, "⌕"), /*#__PURE__*/React.createElement("input", {
        value: query,
        onChange: event => onQueryChange(event.target.value),
        placeholder: "Buscar por nombre o tipo..."
      })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Tipo"), /*#__PURE__*/React.createElement("select", {
        value: type,
        onChange: event => onTypeChange(event.target.value)
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Todos"), types.map(item => /*#__PURE__*/React.createElement("option", {
        key: item,
        value: item
      }, item)))), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Desafío"), /*#__PURE__*/React.createElement("select", {
        value: challenge,
        onChange: event => onChallengeChange(event.target.value)
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Todos"), challenges.map(item => /*#__PURE__*/React.createElement("option", {
        key: item,
        value: item
      }, "CR ", item))))), /*#__PURE__*/React.createElement("div", {
        className: "monster-compendium-results"
      }, /*#__PURE__*/React.createElement("div", {
        className: "monster-compendium-results-heading"
      }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, matches.length), " resultados"), /*#__PURE__*/React.createElement("span", null, "Selecciona una criatura para consultar su ficha completa.")), /*#__PURE__*/React.createElement("div", {
        className: "monster-compendium-grid"
      }, matches.map(monster => /*#__PURE__*/React.createElement("article", {
        key: monster.id,
        className: `monster-compendium-card ${added(monster) ? 'is-saved' : ''}`
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        className: "monster-compendium-card-mark"
      }, monster.name.slice(0, 1).toUpperCase()), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, monster.details?.type || 'Criatura', " · CR ", String(monster.details?.challengeRating || '—').split(' ')[0]), /*#__PURE__*/React.createElement("strong", null, monster.name), /*#__PURE__*/React.createElement("p", null, monster.details?.subtitle || `${monster.details?.size || ''} ${monster.details?.type || ''}`.trim())), added(monster) && /*#__PURE__*/React.createElement("i", null, "Guardada")), /*#__PURE__*/React.createElement("div", {
        className: "monster-compendium-card-stats"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Desafío"), /*#__PURE__*/React.createElement("strong", null, String(monster.details?.challengeRating || '—').split(' ')[0])), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Vida"), /*#__PURE__*/React.createElement("strong", null, monster.maxHp)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Defensa"), /*#__PURE__*/React.createElement("strong", null, monster.armorClass))), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onPreviewChange(monster)
      }, "Consultar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: added(monster),
        onClick: () => onAddMonster(monster)
      }, added(monster) ? 'Guardada' : 'Guardar'), canUseInTable && /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-table",
        onClick: () => onUseMonster(monster)
      }, /*#__PURE__*/React.createElement("span", null, "＋"), " Usar en mesa"))))), !matches.length && /*#__PURE__*/React.createElement("div", {
        className: "monster-compendium-empty"
      }, /*#__PURE__*/React.createElement("span", null, "⌕"), /*#__PURE__*/React.createElement("strong", null, "Sin coincidencias"), /*#__PURE__*/React.createElement("p", null, "Prueba con otro nombre, tipo o valor de desafío."))), /*#__PURE__*/React.createElement("p", {
        className: "monster-compendium-attribution"
      }, compendium.attribution))), preview && /*#__PURE__*/React.createElement("div", {
        className: "monster-preview-backdrop",
        onClick: () => onPreviewChange(null)
      }, /*#__PURE__*/React.createElement("div", {
        className: "monster-preview",
        onClick: event => event.stopPropagation()
      }, /*#__PURE__*/React.createElement("header", {
        className: "monster-preview-header"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "SRD 5.1 · CR ", details.challengeRating), /*#__PURE__*/React.createElement("h4", null, preview.name), /*#__PURE__*/React.createElement("p", null, details.subtitle || `${details.size || ''} ${details.type || ''}`.trim())), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onPreviewChange(null),
        "aria-label": "Cerrar ficha"
      }, "×")), /*#__PURE__*/React.createElement("div", {
        className: "monster-preview-body"
      }, /*#__PURE__*/React.createElement("div", {
        className: "grid gap-2 sm:grid-cols-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "rounded border border-cyan-800 bg-cyan-950/20 p-3"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] uppercase text-gray-400"
      }, "Defensa"), /*#__PURE__*/React.createElement("strong", {
        className: "mt-1 block text-lg text-cyan-100"
      }, "CA ", preview.armorClass)), /*#__PURE__*/React.createElement("div", {
        className: "rounded border border-red-900 bg-red-950/20 p-3"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] uppercase text-gray-400"
      }, "Puntos de golpe"), /*#__PURE__*/React.createElement("strong", {
        className: "mt-1 block text-lg text-red-100"
      }, preview.maxHp, " ", /*#__PURE__*/React.createElement("small", {
        className: "text-xs font-normal text-gray-400"
      }, "(", details.hitDice || '—', ")"))), /*#__PURE__*/React.createElement("div", {
        className: "rounded border border-gray-700 bg-gray-950/40 p-3"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] uppercase text-gray-400"
      }, "Velocidad"), /*#__PURE__*/React.createElement("strong", {
        className: "mt-1 block text-sm text-white"
      }, details.speedText || Object.entries(details.speed || {}).filter(([, value]) => value !== null && value !== undefined).map(([kind, value]) => `${kind} ${value} ft.`).join(' · ') || '—'))), statEntries.some(([, value]) => value !== undefined) && /*#__PURE__*/React.createElement("div", {
        className: "mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6"
      }, statEntries.map(([label, value]) => /*#__PURE__*/React.createElement("div", {
        key: label,
        className: "rounded border border-gray-700 bg-gray-950/40 px-2 py-2 text-center"
      }, /*#__PURE__*/React.createElement("span", {
        className: "block text-[9px] uppercase text-gray-500"
      }, label), /*#__PURE__*/React.createElement("strong", {
        className: "text-sm text-white"
      }, value ?? '—')))), /*#__PURE__*/React.createElement("div", {
        className: "mt-4 grid gap-2 sm:grid-cols-2"
      }, details.senses && /*#__PURE__*/React.createElement("p", {
        className: "rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"
      }, /*#__PURE__*/React.createElement("strong", {
        className: "text-gray-100"
      }, "Sentidos:"), " ", details.senses), details.languages && /*#__PURE__*/React.createElement("p", {
        className: "rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"
      }, /*#__PURE__*/React.createElement("strong", {
        className: "text-gray-100"
      }, "Idiomas:"), " ", details.languages), details.resistances && /*#__PURE__*/React.createElement("p", {
        className: "rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"
      }, /*#__PURE__*/React.createElement("strong", {
        className: "text-gray-100"
      }, "Resistencias:"), " ", details.resistances), details.immunities && /*#__PURE__*/React.createElement("p", {
        className: "rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"
      }, /*#__PURE__*/React.createElement("strong", {
        className: "text-gray-100"
      }, "Inmunidades:"), " ", details.immunities), details.skills && /*#__PURE__*/React.createElement("p", {
        className: "rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"
      }, /*#__PURE__*/React.createElement("strong", {
        className: "text-gray-100"
      }, "Habilidades:"), " ", details.skills), details.saves && /*#__PURE__*/React.createElement("p", {
        className: "rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"
      }, /*#__PURE__*/React.createElement("strong", {
        className: "text-gray-100"
      }, "Salvaciones:"), " ", details.saves), details.vulnerabilities && /*#__PURE__*/React.createElement("p", {
        className: "rounded border border-red-900 bg-red-950/20 p-3 text-xs text-gray-300"
      }, /*#__PURE__*/React.createElement("strong", {
        className: "text-red-100"
      }, "Vulnerabilidades:"), " ", details.vulnerabilities), details.conditionImmunities && /*#__PURE__*/React.createElement("p", {
        className: "rounded border border-gray-700 bg-gray-950/40 p-3 text-xs text-gray-300"
      }, /*#__PURE__*/React.createElement("strong", {
        className: "text-gray-100"
      }, "Inmunidades de condición:"), " ", details.conditionImmunities)), /*#__PURE__*/React.createElement("div", {
        className: "mt-4 space-y-3"
      }, [['Rasgos', details.traits, 'border-purple-800'], ['Acciones', details.actions, 'border-orange-800'], ['Acciones adicionales', details.bonusActions, 'border-orange-800'], ['Reacciones', details.reactions, 'border-orange-800'], ['Acciones legendarias', details.legendaryActions, 'border-yellow-800']].map(([title, entries, accent]) => Array.isArray(entries) && entries.length > 0 && /*#__PURE__*/React.createElement("section", {
        key: title,
        className: `rounded border ${accent} bg-gray-950/45 p-3`
      }, /*#__PURE__*/React.createElement("h5", {
        className: "text-xs font-bold uppercase tracking-wider text-gray-200"
      }, title), /*#__PURE__*/React.createElement("div", {
        className: "mt-2 space-y-2"
      }, entries.map((entry, index) => /*#__PURE__*/React.createElement("article", {
        key: `${entry?.name || title}-${index}`,
        className: "rounded border border-gray-700 bg-gray-900/70 p-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap items-center justify-between gap-2"
      }, /*#__PURE__*/React.createElement("strong", {
        className: "text-sm text-white"
      }, entry?.name || 'Detalle'), Array.isArray(entry?.dice) && entry.dice.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap gap-1"
      }, entry.dice.map((die, dieIndex) => /*#__PURE__*/React.createElement("span", {
        key: `${die}-${dieIndex}`,
        className: "rounded border border-orange-800 bg-orange-950/30 px-1.5 py-0.5 font-mono text-[11px] font-bold text-orange-100"
      }, die)))), /*#__PURE__*/React.createElement("p", {
        className: "mt-2 whitespace-pre-line text-xs leading-relaxed text-gray-300"
      }, entry?.desc || '')))))))), /*#__PURE__*/React.createElement("footer", {
        className: "monster-preview-actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onPreviewChange(null)
      }, "Volver"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: added(preview),
        onClick: () => onAddMonster(preview)
      }, added(preview) ? 'Guardada en mis criaturas' : 'Guardar en mis criaturas'), canUseInTable && /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-table",
        onClick: () => onUseMonster(preview)
      }, "＋ Usar en mesa")))));
    };
    return {
      BestiaryImportPreviewModal,
      LocalBestiaryModal,
      SrdMonsterCompendiumModal
    };
  })();
})();