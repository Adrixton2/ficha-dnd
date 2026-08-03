(() => {
  /* Presentation-only components for Mesa Online. */
  const {
    isValidPortraitDataUrl
  } = window.DndAppUtils;
  const OnlineCombatantAvatar = ({
    combatant,
    className = '',
    onAvatarPreview
  }) => {
    const name = combatant?.name || 'Combatiente';
    const initial = name.trim().slice(0, 1).toUpperCase() || '?';
    const hasAvatar = isValidPortraitDataUrl(combatant?.avatarDataUrl);
    const isDetailAvatar = className.split(/\s+/).includes('h-20');
    if (hasAvatar && isDetailAvatar) {
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => onAvatarPreview?.({
          name,
          src: combatant.avatarDataUrl
        }),
        className: `online-combatant-avatar overflow-hidden object-cover cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300 ${className}`,
        "aria-label": `Ampliar avatar de ${name}`
      }, /*#__PURE__*/React.createElement("img", {
        src: combatant.avatarDataUrl,
        alt: "",
        className: "h-full w-full object-cover"
      }));
    }
    return hasAvatar ? /*#__PURE__*/React.createElement("img", {
      src: combatant.avatarDataUrl,
      alt: "",
      className: `online-combatant-avatar object-cover ${className}`
    }) : /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      className: `online-combatant-avatar online-combatant-avatar--fallback ${className}`
    }, initial);
  };
  const EnemyModal = ({
    modal,
    onChange,
    onClose,
    onSave
  }) => {
    if (!modal?.isOpen) return null;
    const updateData = changes => onChange(previous => ({
      ...previous,
      data: {
        ...previous.data,
        ...changes
      }
    }));
    const close = () => onClose();
    return /*#__PURE__*/React.createElement("div", {
      className: "fixed inset-0 z-[72] flex items-center justify-center bg-black/80 p-4",
      onClick: close
    }, /*#__PURE__*/React.createElement("div", {
      className: "rpg-panel max-h-[90vh] w-full max-w-lg overflow-y-auto border border-orange-700 p-5",
      onClick: event => event.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-3"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "font-fantasy text-lg font-bold text-orange-200"
    }, modal.mode === 'create' ? 'Añadir enemigo' : 'Editar enemigo'), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: close,
      className: "h-9 w-9 rounded border border-gray-600 text-gray-300"
    }, "×")), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "Nombre", /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      value: modal.data.name || '',
      onChange: event => updateData({
        name: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "Iniciativa", /*#__PURE__*/React.createElement("input", {
      type: "number",
      value: modal.data.initiative ?? '',
      onChange: event => updateData({
        initiative: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "Vida actual", /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      value: modal.data.currentHp ?? 0,
      onChange: event => updateData({
        currentHp: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "Vida máxima", /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      value: modal.data.maxHp ?? 0,
      onChange: event => updateData({
        maxHp: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "Vida temporal", /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      value: modal.data.tempHp ?? 0,
      onChange: event => updateData({
        tempHp: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "CA", /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      value: modal.data.armorClass ?? '',
      onChange: event => updateData({
        armorClass: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "Estado visible", /*#__PURE__*/React.createElement("select", {
      value: modal.data.visibleStateMode || 'automatic',
      onChange: event => updateData({
        visibleStateMode: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    }, /*#__PURE__*/React.createElement("option", {
      value: "automatic"
    }, "Automática"), /*#__PURE__*/React.createElement("option", {
      value: "manual"
    }, "Manual"), /*#__PURE__*/React.createElement("option", {
      value: "hidden"
    }, "Oculta"))), modal.data.visibleStateMode === 'manual' && /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "Estado manual", /*#__PURE__*/React.createElement("select", {
      value: modal.data.manualVisibleState || 'herido',
      onChange: event => updateData({
        manualVisibleState: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    }, /*#__PURE__*/React.createElement("option", {
      value: "intacto"
    }, "Intacto"), /*#__PURE__*/React.createElement("option", {
      value: "herido"
    }, "Herido"), /*#__PURE__*/React.createElement("option", {
      value: "muy-herido"
    }, "Muy herido"), /*#__PURE__*/React.createElement("option", {
      value: "derrotado"
    }, "Derrotado"), /*#__PURE__*/React.createElement("option", {
      value: "oculto"
    }, "Oculto")))), /*#__PURE__*/React.createElement("label", {
      className: "mt-3 block text-sm text-gray-300"
    }, "Notas privadas", /*#__PURE__*/React.createElement("textarea", {
      value: modal.data.notes || '',
      onChange: event => updateData({
        notes: event.target.value
      }),
      className: "mt-1 min-h-20 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), /*#__PURE__*/React.createElement("p", {
      className: "mt-2 text-xs text-orange-200"
    }, "Vista pública: ", window.DndOnlineTableUtils.calculateEnemyVisibleState(modal.data.currentHp, modal.data.maxHp, modal.data.visibleStateMode, modal.data.manualVisibleState)), /*#__PURE__*/React.createElement("div", {
      className: "mt-5 flex justify-end gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: close,
      className: "min-h-10 px-3 rounded border border-gray-600 text-sm text-gray-300"
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onSave,
      className: "min-h-10 px-4 rounded border border-orange-600 bg-orange-800 text-sm font-bold text-white"
    }, "Guardar enemigo"))));
  };
  const OnlineConditionModal = ({
    modal,
    conditions,
    onChange,
    onClose,
    onSave
  }) => {
    if (!modal?.isOpen) return null;
    return /*#__PURE__*/React.createElement("div", {
      className: "fixed inset-0 z-[72] flex items-center justify-center bg-black/80 p-4",
      onClick: onClose
    }, /*#__PURE__*/React.createElement("div", {
      className: "rpg-panel w-full max-w-sm border border-purple-700 p-5",
      onClick: event => event.stopPropagation()
    }, /*#__PURE__*/React.createElement("h3", {
      className: "font-fantasy text-lg text-purple-200"
    }, "Añadir condición"), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 flex flex-wrap gap-2"
    }, conditions.map(name => /*#__PURE__*/React.createElement("button", {
      key: name,
      type: "button",
      onClick: () => onChange(previous => ({
        ...previous,
        name
      })),
      className: `min-h-9 px-2 rounded border text-xs ${modal.name === name ? 'border-purple-400 bg-purple-950/50 text-purple-100' : 'border-gray-700 text-gray-300'}`
    }, name))), /*#__PURE__*/React.createElement("label", {
      className: "mt-4 block text-sm text-gray-300"
    }, "Personalizada", /*#__PURE__*/React.createElement("input", {
      value: modal.name,
      onChange: event => onChange(previous => ({
        ...previous,
        name: event.target.value
      })),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), /*#__PURE__*/React.createElement("label", {
      className: "mt-3 block text-sm text-gray-300"
    }, "Fuente", /*#__PURE__*/React.createElement("input", {
      value: modal.source,
      onChange: event => onChange(previous => ({
        ...previous,
        source: event.target.value
      })),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), modal.target?.type !== 'enemy' && /*#__PURE__*/React.createElement("label", {
      className: "mt-3 block text-sm text-gray-300"
    }, "Notas", /*#__PURE__*/React.createElement("input", {
      value: modal.notes,
      onChange: event => onChange(previous => ({
        ...previous,
        notes: event.target.value
      })),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), /*#__PURE__*/React.createElement("div", {
      className: "mt-5 flex justify-end gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose,
      className: "min-h-10 px-3 rounded border border-gray-600 text-gray-300"
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onSave,
      className: "min-h-10 px-3 rounded border border-purple-700 text-purple-100"
    }, "Guardar"))));
  };
  const OnlineEffectModal = ({
    modal,
    combatants,
    canManageEnemies,
    currentUid,
    onChange,
    onClose,
    onSave
  }) => {
    if (!modal?.isOpen) return null;
    const update = changes => onChange(previous => ({
      ...previous,
      data: {
        ...previous.data,
        ...changes
      }
    }));
    const visibleTargets = combatants.filter(target => canManageEnemies || target.ownerUid === currentUid);
    return /*#__PURE__*/React.createElement("div", {
      className: "fixed inset-0 z-[73] flex items-center justify-center bg-black/80 p-4",
      onClick: onClose
    }, /*#__PURE__*/React.createElement("div", {
      className: "rpg-panel max-h-[90vh] w-full max-w-lg overflow-y-auto border border-cyan-700 p-5",
      onClick: event => event.stopPropagation()
    }, /*#__PURE__*/React.createElement("h3", {
      className: "font-fantasy text-lg text-cyan-200"
    }, "Efecto temporal"), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "Nombre", /*#__PURE__*/React.createElement("input", {
      value: modal.data.name || '',
      onChange: event => update({
        name: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "Objetivo", /*#__PURE__*/React.createElement("select", {
      value: modal.data.targetType === 'global' ? 'global' : modal.data.targetId || '',
      onChange: event => {
        const value = event.target.value;
        const target = combatants.find(item => item.id === value);
        update({
          targetId: value === 'global' ? 'global' : value,
          targetType: value === 'global' ? 'global' : target?.type === 'enemy' ? 'enemy' : 'player'
        });
      },
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Selecciona"), /*#__PURE__*/React.createElement("option", {
      value: "global"
    }, "Global"), visibleTargets.map(target => /*#__PURE__*/React.createElement("option", {
      key: target.id,
      value: target.id
    }, target.name)))), /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "Duración", /*#__PURE__*/React.createElement("select", {
      value: modal.data.durationType || 'manual',
      onChange: event => update({
        durationType: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    }, /*#__PURE__*/React.createElement("option", {
      value: "turns"
    }, "Turnos"), /*#__PURE__*/React.createElement("option", {
      value: "rounds"
    }, "Rondas"), /*#__PURE__*/React.createElement("option", {
      value: "minutes"
    }, "Minutos"), /*#__PURE__*/React.createElement("option", {
      value: "manual"
    }, "Manual"))), modal.data.durationType !== 'manual' && /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "Restante", /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      value: modal.data.remaining ?? 0,
      onChange: event => update({
        remaining: event.target.value,
        maximum: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), modal.data.durationType !== 'manual' && /*#__PURE__*/React.createElement("label", {
      className: "text-sm text-gray-300"
    }, "Reducir", /*#__PURE__*/React.createElement("select", {
      value: modal.data.decrementMoment || 'manual',
      onChange: event => update({
        decrementMoment: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    }, /*#__PURE__*/React.createElement("option", {
      value: "manual"
    }, "Manual"), /*#__PURE__*/React.createElement("option", {
      value: "start-of-target-turn"
    }, "Inicio turno objetivo"), /*#__PURE__*/React.createElement("option", {
      value: "end-of-target-turn"
    }, "Fin turno objetivo"), /*#__PURE__*/React.createElement("option", {
      value: "start-of-round"
    }, "Inicio ronda"), /*#__PURE__*/React.createElement("option", {
      value: "end-of-round"
    }, "Fin ronda")))), /*#__PURE__*/React.createElement("label", {
      className: "mt-3 flex items-center gap-2 text-sm text-gray-300"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: !!modal.data.visibleToPlayers,
      onChange: event => update({
        visibleToPlayers: event.target.checked
      })
    }), "Visible para jugadores"), /*#__PURE__*/React.createElement("label", {
      className: "mt-2 flex items-center gap-2 text-sm text-purple-200"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: !!modal.data.concentration,
      onChange: event => update({
        concentration: event.target.checked
      })
    }), "Requiere concentración"), /*#__PURE__*/React.createElement("label", {
      className: "mt-3 block text-sm text-gray-300"
    }, "Nota pública", /*#__PURE__*/React.createElement("input", {
      value: modal.data.notesPublic || '',
      onChange: event => update({
        notesPublic: event.target.value
      }),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-2 text-white"
    })), /*#__PURE__*/React.createElement("div", {
      className: "mt-5 flex justify-end gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose,
      className: "min-h-10 px-3 rounded border border-gray-600 text-gray-300"
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onSave,
      className: "min-h-10 px-3 rounded border border-cyan-700 text-cyan-100"
    }, "Guardar"))));
  };
  const OnlineHpModal = ({
    modal,
    entity,
    onChange,
    onClose,
    onConfirm,
    busy,
    allowMax = false,
    accent = 'red'
  }) => {
    if (!modal?.isOpen || !entity) return null;
    const current = window.DndOnlineTableUtils.getHpValues(entity);
    const amount = Math.max(0, Number(modal.amount) || 0);
    let preview = {
      ...current
    };
    if (modal.mode === 'damage') {
      const absorbed = Math.min(current.tempHp, amount);
      preview = {
        ...current,
        tempHp: current.tempHp - absorbed,
        currentHp: Math.max(0, current.currentHp - (amount - absorbed))
      };
    } else if (modal.mode === 'healing') preview = {
      ...current,
      currentHp: Math.min(current.maxHp, current.currentHp + amount)
    };else if (modal.mode === 'temp') preview = {
      ...current,
      tempHp: amount
    };else if (modal.mode === 'max') preview = {
      ...current,
      maxHp: amount,
      currentHp: Math.min(current.currentHp, amount)
    };else preview = {
      ...current,
      currentHp: Math.min(current.maxHp, amount)
    };
    const modes = [['damage', 'Daño'], ['healing', 'Curación'], ['temp', 'Vida temporal'], ['exact', 'Valor exacto'], ...(allowMax ? [['max', 'Vida máxima']] : [])];
    const activeClasses = accent === 'orange' ? 'border-orange-500 bg-orange-950/50 text-orange-100' : 'border-red-500 bg-red-950/50 text-red-100';
    const confirmClasses = accent === 'orange' ? 'border-orange-600 bg-orange-800' : 'border-red-600 bg-red-800';
    return /*#__PURE__*/React.createElement("div", {
      className: "fixed inset-0 z-[73] flex items-center justify-center bg-black/80 p-4",
      onClick: onClose
    }, /*#__PURE__*/React.createElement("div", {
      className: `rpg-panel w-full max-w-sm border p-5 ${accent === 'orange' ? 'border-orange-700' : 'border-red-700'}`,
      onClick: event => event.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: `font-fantasy text-lg font-bold ${accent === 'orange' ? 'text-orange-200' : 'text-red-200'}`
    }, "Modificar vida"), /*#__PURE__*/React.createElement("p", {
      className: "mt-1 text-xs text-gray-400"
    }, entity.name || 'Personaje')), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose,
      className: "h-9 w-9 rounded border border-gray-600 text-gray-300",
      "aria-label": "Cerrar"
    }, "×")), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 grid grid-cols-2 gap-2"
    }, modes.map(([mode, label]) => /*#__PURE__*/React.createElement("button", {
      key: mode,
      type: "button",
      onClick: () => onChange(previous => ({
        ...previous,
        mode
      })),
      className: `min-h-10 rounded border px-2 text-xs ${modal.mode === mode ? activeClasses : 'border-gray-700 text-gray-300'}`
    }, label))), /*#__PURE__*/React.createElement("label", {
      className: "mt-4 block text-sm text-gray-300"
    }, "Cantidad", /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      type: "number",
      min: "0",
      value: modal.amount,
      onChange: event => onChange(previous => ({
        ...previous,
        amount: event.target.value
      })),
      className: "mt-1 w-full rounded border border-gray-600 bg-gray-950 p-3 text-center text-lg font-bold text-white outline-none focus:border-red-400"
    })), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 rounded border border-gray-700 bg-gray-950/50 p-3 text-sm text-gray-300"
    }, /*#__PURE__*/React.createElement("p", null, "Vida: ", /*#__PURE__*/React.createElement("b", null, current.currentHp), " → ", /*#__PURE__*/React.createElement("b", null, preview.currentHp), " / ", preview.maxHp), /*#__PURE__*/React.createElement("p", {
      className: "mt-1 text-cyan-200"
    }, "Vida temporal: ", /*#__PURE__*/React.createElement("b", null, current.tempHp), " → ", /*#__PURE__*/React.createElement("b", null, preview.tempHp))), /*#__PURE__*/React.createElement("div", {
      className: "mt-5 flex justify-end gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose,
      className: "min-h-10 px-4 rounded border border-gray-600 text-gray-300"
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy,
      onClick: onConfirm,
      className: `min-h-10 px-4 rounded border text-white disabled:opacity-50 ${confirmClasses}`
    }, "Confirmar"))));
  };
  window.DndOnlineComponents = {
    EnemyModal,
    OnlineConditionModal,
    OnlineEffectModal,
    OnlineHpModal,
    OnlineCombatantAvatar
  };
})();