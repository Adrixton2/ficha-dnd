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
  const OnlinePartyOverview = ({
    participants = [],
    members = [],
    sheets = [],
    onOpenSheet,
    onAvatarPreview
  }) => {
    const sheetsByOwner = new Map(sheets.map(document => [document.ownerUid || document.id, {
      document,
      snapshot: window.DndOnlineTableUtils.parseOnlinePlayerSheetSnapshot(document.snapshotJson)
    }]));
    const playerMembers = members.filter(member => member.role !== 'master' || participants.some(participant => participant.ownerUid === member.uid));
    return /*#__PURE__*/React.createElement("section", {
      className: "online-party-hub",
      "aria-labelledby": "online-party-title"
    }, /*#__PURE__*/React.createElement("header", {
      className: "online-party-hub__header"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Vista del Máster"), /*#__PURE__*/React.createElement("h4", {
      id: "online-party-title"
    }, "Grupo de aventureros"), /*#__PURE__*/React.createElement("p", null, "Consulta lo esencial de cada ficha sin abandonar la mesa.")), /*#__PURE__*/React.createElement("span", null, participants.length, " ", participants.length === 1 ? 'ficha' : 'fichas')), /*#__PURE__*/React.createElement("div", {
      className: "online-party-grid"
    }, playerMembers.map(member => {
      const participant = participants.find(item => item.ownerUid === member.uid);
      const sheetEntry = sheetsByOwner.get(member.uid);
      const snapshot = sheetEntry?.snapshot;
      const hp = window.DndOnlineTableUtils.getHpValues(participant || snapshot?.combat);
      const hpPercent = hp.maxHp > 0 ? Math.min(100, hp.currentHp / hp.maxHp * 100) : 0;
      const conditions = window.DndOnlineTableUtils.normalizeOnlineConditions(participant?.conditions);
      const connected = member.active !== false && participant?.connected !== false;
      return /*#__PURE__*/React.createElement("article", {
        key: member.id,
        className: `online-party-card ${connected ? '' : 'is-offline'}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "online-party-card__identity"
      }, participant ? /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
        combatant: participant,
        className: "h-12 w-12 text-sm",
        onAvatarPreview: onAvatarPreview
      }) : /*#__PURE__*/React.createElement("span", {
        className: "online-party-card__empty-avatar"
      }, "?"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, participant?.name || member.displayName || 'Jugador'), /*#__PURE__*/React.createElement("span", null, snapshot?.identity?.className || participant?.className || 'Sin clase', " · Nivel ", snapshot?.identity?.level || participant?.level || '—')), /*#__PURE__*/React.createElement("i", {
        className: connected ? 'is-connected' : '',
        title: connected ? 'Conectado' : 'Desconectado'
      })), participant ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "online-party-card__vitals"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV"), /*#__PURE__*/React.createElement("b", null, hp.currentHp, "/", hp.maxHp)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "CA"), /*#__PURE__*/React.createElement("b", null, participant.armorClass ?? snapshot?.combat?.armorClass ?? '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Pasiva"), /*#__PURE__*/React.createElement("b", null, snapshot?.passives?.perception ?? '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Iniciativa"), /*#__PURE__*/React.createElement("b", null, participant.initiative ?? '—'))), /*#__PURE__*/React.createElement("div", {
        className: "online-party-card__hp"
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: `${hpPercent}%`
        }
      })), /*#__PURE__*/React.createElement("div", {
        className: "online-party-card__status"
      }, snapshot?.combat?.concentration && /*#__PURE__*/React.createElement("span", {
        className: "is-concentration"
      }, "Concentración: ", snapshot.combat.concentration), conditions.slice(0, 3).map(condition => /*#__PURE__*/React.createElement("span", {
        key: condition.id,
        className: "is-condition"
      }, condition.name)), !snapshot?.combat?.concentration && !conditions.length && /*#__PURE__*/React.createElement("span", null, "Sin estados activos")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: !snapshot,
        onClick: () => onOpenSheet?.(participant.ownerUid),
        className: "online-party-card__open"
      }, snapshot ? 'Abrir ficha del jugador' : 'Esperando actualización de ficha')) : /*#__PURE__*/React.createElement("div", {
        className: "online-party-card__missing"
      }, /*#__PURE__*/React.createElement("p", null, "Aún no ha compartido ningún personaje.")));
    }), !playerMembers.length && /*#__PURE__*/React.createElement("div", {
      className: "online-party-empty"
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "♙"), /*#__PURE__*/React.createElement("strong", null, "Aún no hay jugadores"), /*#__PURE__*/React.createElement("p", null, "Invítalos con el código de la sala. Sus fichas aparecerán aquí al compartirlas."))));
  };
  const OnlinePlayerSheetModal = ({
    participant,
    sheetDocument,
    onClose,
    onAvatarPreview
  }) => {
    const [tab, setTab] = React.useState('summary');
    const snapshot = window.DndOnlineTableUtils.parseOnlinePlayerSheetSnapshot(sheetDocument?.snapshotJson);
    React.useEffect(() => setTab('summary'), [participant?.ownerUid]);
    if (!participant || !snapshot) return null;
    const liveHp = window.DndOnlineTableUtils.getHpValues(participant, snapshot.combat);
    const formatModifier = window.DndOnlineTableUtils.formatOnlineModifier;
    const conditions = window.DndOnlineTableUtils.normalizeOnlineConditions(participant.conditions);
    const spellsByLevel = snapshot.spells.reduce((groups, spell) => {
      const level = Number(spell.level) || 0;
      (groups[level] ||= []).push(spell);
      return groups;
    }, {});
    const currency = [['PC', snapshot.currency.pc], ['PP', snapshot.currency.plata], ['PE', snapshot.currency.electro], ['PO', snapshot.currency.po], ['PL', snapshot.currency.platino]];
    const Section = ({
      title,
      children,
      empty
    }) => /*#__PURE__*/React.createElement("section", {
      className: "online-sheet-section"
    }, /*#__PURE__*/React.createElement("h5", null, title), empty ? /*#__PURE__*/React.createElement("p", {
      className: "online-sheet-empty"
    }, empty) : children);
    return /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-overlay",
      role: "presentation",
      onMouseDown: event => {
        if (event.target === event.currentTarget) onClose?.();
      }
    }, /*#__PURE__*/React.createElement("article", {
      className: "online-sheet-dialog",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "online-sheet-title"
    }, /*#__PURE__*/React.createElement("header", {
      className: "online-sheet-header"
    }, /*#__PURE__*/React.createElement(OnlineCombatantAvatar, {
      combatant: participant,
      className: "h-16 w-16 text-xl",
      onAvatarPreview: onAvatarPreview
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Ficha compartida · Solo lectura"), /*#__PURE__*/React.createElement("h4", {
      id: "online-sheet-title"
    }, snapshot.identity.name), /*#__PURE__*/React.createElement("p", null, [snapshot.identity.race, snapshot.identity.className, `Nivel ${snapshot.identity.level}`].filter(Boolean).join(' · '))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose,
      "aria-label": "Cerrar ficha"
    }, "×")), /*#__PURE__*/React.createElement("nav", {
      className: "online-sheet-tabs",
      "aria-label": "Secciones de la ficha"
    }, [['summary', 'Resumen'], ['combat', 'Combate'], ['spells', 'Conjuros'], ['inventory', 'Mochila']].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
      key: id,
      type: "button",
      onClick: () => setTab(id),
      className: tab === id ? 'is-active' : ''
    }, label))), /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-content"
    }, tab === 'summary' && /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-layout"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-main"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-metrics"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV actuales"), /*#__PURE__*/React.createElement("b", null, liveHp.currentHp, "/", liveHp.maxHp), liveHp.tempHp > 0 && /*#__PURE__*/React.createElement("em", null, "+", liveHp.tempHp, " temporales")), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Clase de armadura"), /*#__PURE__*/React.createElement("b", null, participant.armorClass ?? snapshot.combat.armorClass)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Iniciativa"), /*#__PURE__*/React.createElement("b", null, participant.initiative ?? formatModifier(snapshot.combat.initiativeBonus))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Velocidad"), /*#__PURE__*/React.createElement("b", null, snapshot.identity.speed || '—'))), /*#__PURE__*/React.createElement(Section, {
      title: "Características y salvaciones"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-abilities"
    }, snapshot.abilities.map(ability => /*#__PURE__*/React.createElement("div", {
      key: ability.key
    }, /*#__PURE__*/React.createElement("small", null, ability.label), /*#__PURE__*/React.createElement("strong", null, ability.score), /*#__PURE__*/React.createElement("span", null, "Mod. ", formatModifier(ability.modifier)), /*#__PURE__*/React.createElement("span", {
      className: ability.saveProficient ? 'is-proficient' : ''
    }, "Salv. ", formatModifier(ability.saveBonus)))))), /*#__PURE__*/React.createElement(Section, {
      title: "Competencias"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-skills"
    }, snapshot.skills.map(skill => /*#__PURE__*/React.createElement("span", {
      key: skill.key,
      className: skill.expertise ? 'is-expert' : skill.proficient ? 'is-proficient' : ''
    }, /*#__PURE__*/React.createElement("i", null), skill.name, /*#__PURE__*/React.createElement("b", null, formatModifier(skill.bonus))))))), /*#__PURE__*/React.createElement("aside", {
      className: "online-sheet-aside"
    }, /*#__PURE__*/React.createElement(Section, {
      title: "Percepciones pasivas"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-passives"
    }, /*#__PURE__*/React.createElement("span", null, "Percepción ", /*#__PURE__*/React.createElement("b", null, snapshot.passives.perception)), /*#__PURE__*/React.createElement("span", null, "Investigación ", /*#__PURE__*/React.createElement("b", null, snapshot.passives.investigation)), /*#__PURE__*/React.createElement("span", null, "Perspicacia ", /*#__PURE__*/React.createElement("b", null, snapshot.passives.insight)))), /*#__PURE__*/React.createElement(Section, {
      title: "Rasgos",
      empty: !snapshot.traits.length ? 'Sin rasgos registrados.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-list"
    }, snapshot.traits.map((trait, index) => /*#__PURE__*/React.createElement("details", {
      key: `${trait.name}-${index}`
    }, /*#__PURE__*/React.createElement("summary", null, trait.name), trait.description && /*#__PURE__*/React.createElement("p", null, trait.description))))), /*#__PURE__*/React.createElement(Section, {
      title: "Dotes",
      empty: !snapshot.feats.length ? 'Sin dotes registradas.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-list"
    }, snapshot.feats.map((feat, index) => /*#__PURE__*/React.createElement("details", {
      key: `${feat.name}-${index}`
    }, /*#__PURE__*/React.createElement("summary", null, feat.name), feat.description && /*#__PURE__*/React.createElement("p", null, feat.description))))), /*#__PURE__*/React.createElement(Section, {
      title: "Otras competencias",
      empty: !snapshot.proficiencies.length ? 'Sin datos registrados.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-tags"
    }, snapshot.proficiencies.map((entry, index) => /*#__PURE__*/React.createElement("span", {
      key: `${entry.name}-${index}`
    }, entry.name)))))), tab === 'combat' && /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-layout"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-main"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-metrics"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV"), /*#__PURE__*/React.createElement("b", null, liveHp.currentHp, "/", liveHp.maxHp)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "CA"), /*#__PURE__*/React.createElement("b", null, participant.armorClass ?? snapshot.combat.armorClass)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Competencia"), /*#__PURE__*/React.createElement("b", null, formatModifier(snapshot.combat.proficiencyBonus))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Dados de golpe"), /*#__PURE__*/React.createElement("b", null, snapshot.combat.hitDice.current || '—', " ", snapshot.combat.hitDice.type))), /*#__PURE__*/React.createElement(Section, {
      title: "Ataques",
      empty: !snapshot.weapons.length ? 'No hay ataques registrados.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-attacks"
    }, snapshot.weapons.map((weapon, index) => /*#__PURE__*/React.createElement("article", {
      key: `${weapon.name}-${index}`
    }, /*#__PURE__*/React.createElement("strong", null, weapon.name), weapon.attacks.map((attack, attackIndex) => /*#__PURE__*/React.createElement("div", {
      key: `${attack.name}-${attackIndex}`
    }, /*#__PURE__*/React.createElement("span", null, attack.name || 'Ataque'), /*#__PURE__*/React.createElement("b", null, attack.attack || '—'), /*#__PURE__*/React.createElement("em", null, attack.damage || '—'), attack.notes && /*#__PURE__*/React.createElement("small", null, attack.notes))))))), /*#__PURE__*/React.createElement(Section, {
      title: "Recursos",
      empty: !snapshot.resources.length ? 'No hay recursos registrados.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-resources"
    }, snapshot.resources.map((resource, index) => /*#__PURE__*/React.createElement("span", {
      key: `${resource.name}-${index}`
    }, /*#__PURE__*/React.createElement("strong", null, resource.name), /*#__PURE__*/React.createElement("b", null, resource.current, "/", resource.max), /*#__PURE__*/React.createElement("small", null, resource.recovery || resource.type)))))), /*#__PURE__*/React.createElement("aside", {
      className: "online-sheet-aside"
    }, /*#__PURE__*/React.createElement(Section, {
      title: "Estado actual"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-status-list"
    }, /*#__PURE__*/React.createElement("span", null, "Inspiración ", /*#__PURE__*/React.createElement("b", null, snapshot.combat.inspiration ? 'Sí' : 'No')), /*#__PURE__*/React.createElement("span", null, "Concentración ", /*#__PURE__*/React.createElement("b", null, snapshot.combat.concentration || 'Ninguna')), /*#__PURE__*/React.createElement("span", null, "Salvaciones de muerte ", /*#__PURE__*/React.createElement("b", null, snapshot.combat.deathSaves.successes, " éxitos · ", snapshot.combat.deathSaves.failures, " fallos")), conditions.map(condition => /*#__PURE__*/React.createElement("span", {
      key: condition.id,
      className: "is-condition"
    }, condition.name)))), /*#__PURE__*/React.createElement(Section, {
      title: "Armaduras",
      empty: !snapshot.armors.length ? 'No hay armaduras registradas.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-list"
    }, snapshot.armors.map((armor, index) => /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-armor",
      key: `${armor.name}-${index}`
    }, /*#__PURE__*/React.createElement("strong", null, armor.name), /*#__PURE__*/React.createElement("span", null, "CA ", armor.armorClass || '—', " · ", armor.type || 'Armadura'), armor.equipped && /*#__PURE__*/React.createElement("b", null, "Equipada"))))))), tab === 'spells' && /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-spells"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-metrics"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Aptitud mágica"), /*#__PURE__*/React.createElement("b", null, snapshot.spellcasting.abilityName || '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "CD de salvación"), /*#__PURE__*/React.createElement("b", null, snapshot.spellcasting.saveDc ?? '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Ataque de conjuro"), /*#__PURE__*/React.createElement("b", null, snapshot.spellcasting.attackBonus === null ? '—' : formatModifier(snapshot.spellcasting.attackBonus))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Concentración"), /*#__PURE__*/React.createElement("b", null, snapshot.combat.concentration || 'Ninguna'))), /*#__PURE__*/React.createElement(Section, {
      title: "Espacios"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-slots"
    }, snapshot.spellcasting.slots.map(slot => /*#__PURE__*/React.createElement("span", {
      key: slot.level
    }, /*#__PURE__*/React.createElement("small", null, "Nivel ", slot.level), /*#__PURE__*/React.createElement("b", null, slot.current, "/", slot.max))), snapshot.spellcasting.pactSlots && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Pacto N. ", snapshot.spellcasting.pactSlots.level), /*#__PURE__*/React.createElement("b", null, snapshot.spellcasting.pactSlots.current, "/", snapshot.spellcasting.pactSlots.max)), !snapshot.spellcasting.slots.length && !snapshot.spellcasting.pactSlots && /*#__PURE__*/React.createElement("p", {
      className: "online-sheet-empty"
    }, "Sin espacios registrados."))), /*#__PURE__*/React.createElement(Section, {
      title: "Lista de conjuros",
      empty: !snapshot.spells.length ? 'No hay conjuros registrados.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-spell-groups"
    }, Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b)).map(level => /*#__PURE__*/React.createElement("section", {
      key: level
    }, /*#__PURE__*/React.createElement("h6", null, Number(level) === 0 ? 'Trucos' : `Nivel ${level}`), /*#__PURE__*/React.createElement("div", null, spellsByLevel[level].map((spell, index) => /*#__PURE__*/React.createElement("article", {
      key: `${spell.name}-${index}`
    }, /*#__PURE__*/React.createElement("strong", null, spell.name), /*#__PURE__*/React.createElement("span", null, spell.school || 'Sin escuela'), /*#__PURE__*/React.createElement("div", null, spell.prepared && /*#__PURE__*/React.createElement("b", null, "Preparado"), spell.ritual && /*#__PURE__*/React.createElement("b", null, "Ritual"), spell.concentration && /*#__PURE__*/React.createElement("b", null, "Concentración")), /*#__PURE__*/React.createElement("small", null, [spell.castingTime, spell.range, spell.duration].filter(Boolean).join(' · ')))))))))), tab === 'inventory' && /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-layout"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-main"
    }, /*#__PURE__*/React.createElement(Section, {
      title: "Monedas"
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-currency"
    }, currency.map(([label, amount]) => /*#__PURE__*/React.createElement("span", {
      key: label
    }, /*#__PURE__*/React.createElement("small", null, label), /*#__PURE__*/React.createElement("b", null, amount))))), /*#__PURE__*/React.createElement(Section, {
      title: "Contenido de la mochila",
      empty: !snapshot.inventory.length ? 'La mochila está vacía.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-inventory"
    }, snapshot.inventory.map((item, index) => /*#__PURE__*/React.createElement("article", {
      key: `${item.name}-${index}`
    }, /*#__PURE__*/React.createElement("span", null, item.quantity || 0), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, item.name), item.description && /*#__PURE__*/React.createElement("p", null, item.description))))))), /*#__PURE__*/React.createElement("aside", {
      className: "online-sheet-aside"
    }, /*#__PURE__*/React.createElement(Section, {
      title: "Herramientas",
      empty: !snapshot.tools.length ? 'Sin herramientas registradas.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-list"
    }, snapshot.tools.map((tool, index) => /*#__PURE__*/React.createElement("details", {
      key: `${tool.name}-${index}`
    }, /*#__PURE__*/React.createElement("summary", null, tool.name), tool.description && /*#__PURE__*/React.createElement("p", null, tool.description))))), /*#__PURE__*/React.createElement(Section, {
      title: "Equipo defensivo",
      empty: !snapshot.armors.length ? 'Sin equipo defensivo registrado.' : ''
    }, /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-list"
    }, snapshot.armors.map((armor, index) => /*#__PURE__*/React.createElement("div", {
      className: "online-sheet-armor",
      key: `${armor.name}-${index}`
    }, /*#__PURE__*/React.createElement("strong", null, armor.name), /*#__PURE__*/React.createElement("span", null, armor.type || 'Armadura', " · CA ", armor.armorClass || '—'), armor.equipped && /*#__PURE__*/React.createElement("b", null, "Equipada")))))))), /*#__PURE__*/React.createElement("footer", {
      className: "online-sheet-footer"
    }, /*#__PURE__*/React.createElement("span", null, "Las notas personales y el historial no se comparten."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClose
    }, "Volver a la mesa"))));
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
    OnlineCombatantAvatar,
    OnlinePartyOverview,
    OnlinePlayerSheetModal
  };
})();