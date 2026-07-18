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
  window.DndOnlineComponents = {
    EnemyModal,
    OnlineCombatantAvatar
  };
})();