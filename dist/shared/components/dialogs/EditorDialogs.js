(() => {
  (() => {
    const {
      getArmorFormula
    } = window.DndAppUtils;
    const {
      CombatSectionIcon
    } = window.DndCharacterSheetComponents;
    const {
      EquipmentCompendiumModal
    } = window.DndLocalModalComponents;
    function EditorDialogs({
      model
    }) {
      const {
        addModal,
        addNamePlaceholders,
        equipmentCompendiumCategory,
        equipmentCompendiumOpen,
        equipmentCompendiumQuery,
        getWeaponAttackBonus,
        getWeaponAttackProficiency,
        handleAddSubmit,
        handleNumInput,
        hasWeaponProficiency,
        inferWeaponAbility,
        inventory,
        marketCompendiumItems,
        proficiencies,
        selectedWeapon,
        setAddModal,
        setEquipmentCompendiumCategory,
        setEquipmentCompendiumOpen,
        setEquipmentCompendiumQuery,
        setSkillModal,
        skillModal,
        updateSkillProficiency
      } = model;
      return /*#__PURE__*/React.createElement(React.Fragment, null, skillModal.isOpen && /*#__PURE__*/React.createElement("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4",
        onClick: () => setSkillModal({
          isOpen: false,
          skillKey: null,
          skillName: ""
        })
      }, /*#__PURE__*/React.createElement("div", {
        className: "rpg-panel border border-purple-500/50 rounded-lg p-6 max-w-sm w-full shadow-2xl animate-attack",
        onClick: e => e.stopPropagation()
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center mb-6 border-b border-gray-700 pb-3"
      }, /*#__PURE__*/React.createElement("h3", {
        className: "text-xl font-fantasy font-bold text-white tracking-widest"
      }, skillModal.skillName), /*#__PURE__*/React.createElement("button", {
        onClick: () => setSkillModal({
          isOpen: false,
          skillKey: null,
          skillName: ""
        }),
        className: "text-gray-500 hover:text-white text-3xl leading-none"
      }, "×")), /*#__PURE__*/React.createElement("div", {
        className: "space-y-3"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => updateSkillProficiency('none'),
        className: `w-full py-3 rounded border text-sm font-bold font-fantasy tracking-wider uppercase transition-colors ${!proficiencies.expertise.includes(skillModal.skillKey) && !proficiencies.proficient.includes(skillModal.skillKey) ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'}`
      }, "Sin Competencia"), /*#__PURE__*/React.createElement("button", {
        onClick: () => updateSkillProficiency('proficient'),
        className: `w-full py-3 rounded border text-sm font-bold font-fantasy tracking-wider uppercase transition-colors flex items-center justify-center space-x-3 ${proficiencies.proficient.includes(skillModal.skillKey) ? 'bg-purple-900/40 border-purple-500 text-purple-300' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-purple-500/50'}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-3 h-3 rounded-full bg-purple-500 border border-purple-300"
      }), /*#__PURE__*/React.createElement("span", null, "Competencia")), /*#__PURE__*/React.createElement("button", {
        onClick: () => updateSkillProficiency('expertise'),
        className: `w-full py-3 rounded border text-sm font-bold font-fantasy tracking-wider uppercase transition-colors flex items-center justify-center space-x-3 ${proficiencies.expertise.includes(skillModal.skillKey) ? 'bg-fuchsia-900/40 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-fuchsia-500/50'}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-3 h-3 rounded-full bg-fuchsia-500 border border-fuchsia-300 shadow-[0_0_8px_rgba(217,70,239,0.8)]"
      }), /*#__PURE__*/React.createElement("span", null, "Pericia"))))), /*#__PURE__*/React.createElement(EquipmentCompendiumModal, {
        open: equipmentCompendiumOpen,
        items: marketCompendiumItems,
        query: equipmentCompendiumQuery,
        category: equipmentCompendiumCategory,
        onQueryChange: setEquipmentCompendiumQuery,
        onCategoryChange: setEquipmentCompendiumCategory,
        onClose: () => setEquipmentCompendiumOpen(false),
        onChoose: item => {
          const magicDetails = [item.data?.desc, item.rarity && `Rareza: ${item.rarity}`, item.attunement && 'Requiere sintonización.'].filter(Boolean).join('\n');
          const itemData = {
            name: item.name,
            ...item.data,
            desc: magicDetails,
            sourceId: item.id,
            weaponCategory: item.category
          };
          if (item.type === 'weapon') {
            const magicBonuses = [...String(`${item.name} ${item.data?.desc || ''}`).matchAll(/\+([123])\b/g)].map(match => Number(match[1]));
            const magicBonus = [...new Set(magicBonuses)].length === 1 ? magicBonuses[0] : 0;
            const proficient = hasWeaponProficiency(item.name, item.category);
            itemData.attacks = (item.data?.attacks || []).map(attack => {
              const attackAbility = inferWeaponAbility(attack);
              const prepared = {
                ...attack,
                autoAttack: true,
                attackAbility,
                proficient,
                autoProficiency: true,
                weaponName: item.name,
                weaponCategory: item.category,
                magicBonus
              };
              return {
                ...prepared,
                atk: getWeaponAttackBonus(prepared)
              };
            });
          }
          setAddModal({
            isOpen: true,
            type: item.type,
            data: itemData
          });
          setEquipmentCompendiumOpen(false);
        }
      }), addModal.isOpen && /*#__PURE__*/React.createElement("div", {
        className: `fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 ${addModal.type === 'weapon' || addModal.type === 'attack' ? 'arsenal-editor-backdrop' : ''}`,
        onClick: () => setAddModal({
          isOpen: false,
          type: null,
          data: {}
        })
      }, /*#__PURE__*/React.createElement("div", {
        className: `rpg-panel border border-purple-500/50 rounded-lg p-6 max-w-md w-full shadow-2xl animate-attack ${addModal.type === 'weapon' || addModal.type === 'attack' ? `arsenal-editor-dialog is-${addModal.type}` : ''}`,
        onClick: e => e.stopPropagation()
      }, /*#__PURE__*/React.createElement("div", {
        className: `flex justify-between items-center mb-6 border-b border-gray-700 pb-3 ${addModal.type === 'weapon' || addModal.type === 'attack' ? 'arsenal-editor-header' : ''}`
      }, addModal.type === 'weapon' || addModal.type === 'attack' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        className: "arsenal-editor-emblem",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement(CombatSectionIcon, {
        section: "arsenal"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, addModal.type === 'weapon' ? 'Preparar equipo' : `Acción para ${selectedWeapon?.name || 'el arma'}`), /*#__PURE__*/React.createElement("h3", null, addModal.type === 'weapon' ? 'Nueva arma' : 'Nueva acción'), /*#__PURE__*/React.createElement("p", null, addModal.type === 'weapon' ? 'Añádela al arsenal y revisa su configuración antes de usarla.' : 'Define cómo impacta, qué daño causa y cualquier propiedad útil.'))) : /*#__PURE__*/React.createElement("h3", {
        className: "text-xl font-fantasy font-bold text-white tracking-widest uppercase"
      }, "Creación"), /*#__PURE__*/React.createElement("button", {
        onClick: () => setAddModal({
          isOpen: false,
          type: null,
          data: {}
        }),
        className: addModal.type === 'weapon' || addModal.type === 'attack' ? 'arsenal-editor-close' : 'text-gray-500 hover:text-white text-3xl leading-none',
        "aria-label": "Cerrar"
      }, "×")), /*#__PURE__*/React.createElement("div", {
        className: `space-y-5 ${addModal.type === 'weapon' || addModal.type === 'attack' ? 'arsenal-editor-body' : ''}`
      }, (addModal.type === 'item' || addModal.type === 'armor' || addModal.type === 'tool' || addModal.type === 'weapon' || addModal.type === 'resource' || addModal.type === 'spell' || addModal.type === 'attack') && /*#__PURE__*/React.createElement("div", {
        className: addModal.type === 'weapon' || addModal.type === 'attack' ? 'arsenal-editor-name' : ''
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Nombre del Elemento"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        autoFocus: true,
        placeholder: addNamePlaceholders[addModal.type] || 'Nombre',
        value: addModal.data.name || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            name: e.target.value
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none"
      })), addModal.type === 'item' && /*#__PURE__*/React.createElement("div", {
        className: "flex gap-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-1/3"
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Cant."), /*#__PURE__*/React.createElement("input", {
        type: "number",
        placeholder: "1",
        value: addModal.data.qty || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            qty: handleNumInput(e.target.value)
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none text-center"
      })), /*#__PURE__*/React.createElement("div", {
        className: "w-2/3"
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Breve Desc."), /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Ej: 50 pies de cuerda",
        value: addModal.data.desc || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            desc: e.target.value
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none"
      }))), addModal.type === 'armor' && /*#__PURE__*/React.createElement("div", {
        className: "space-y-4"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Categoría"), /*#__PURE__*/React.createElement("select", {
        value: addModal.data.type || 'light',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            type: e.target.value
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none appearance-none"
      }, /*#__PURE__*/React.createElement("option", {
        value: "light"
      }, "Armadura Ligera"), /*#__PURE__*/React.createElement("option", {
        value: "medium"
      }, "Armadura Media"), /*#__PURE__*/React.createElement("option", {
        value: "heavy"
      }, "Armadura Pesada"), /*#__PURE__*/React.createElement("option", {
        value: "shield"
      }, "Escudo"))), /*#__PURE__*/React.createElement("div", {
        className: "rounded border border-purple-900/70 bg-purple-950/20 px-3 py-2 text-xs text-purple-200"
      }, "Cálculo de CA: ", /*#__PURE__*/React.createElement("b", null, getArmorFormula({
        type: addModal.data.type || 'light',
        ac: addModal.data.ac
      }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Clase de Armadura (CA) que otorga"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        placeholder: "Ej: 11",
        value: addModal.data.ac || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            ac: handleNumInput(e.target.value)
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none"
      })), /*#__PURE__*/React.createElement("label", {
        className: "flex items-center space-x-3 text-sm text-gray-300 cursor-pointer pt-2 bg-gray-900/50 p-3 rounded border border-gray-800"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: addModal.data.stealthDis || false,
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            stealthDis: e.target.checked
          }
        }),
        className: "w-5 h-5 accent-red-600 bg-gray-950 border-gray-700 rounded"
      }), /*#__PURE__*/React.createElement("span", {
        className: "font-medium"
      }, "Impone Desventaja en Sigilo"))), addModal.type === 'tool' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Para qué sirve"), /*#__PURE__*/React.createElement("textarea", {
        placeholder: "Ej: Abrir cerraduras y desarmar trampas.",
        value: addModal.data.desc || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            desc: e.target.value
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none h-24 resize-y leading-relaxed"
      })), addModal.type === 'weapon' && /*#__PURE__*/React.createElement("div", {
        className: "arsenal-weapon-form space-y-3 rounded border border-cyan-900/70 bg-cyan-950/15 p-3"
      }, Array.isArray(addModal.data.attacks) && addModal.data.attacks.length > 0 && /*#__PURE__*/React.createElement("div", {
        className: "weapon-import-preview"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", null, "Cálculo de ataque"), /*#__PURE__*/React.createElement("small", null, "Se actualizará con tu ficha")), addModal.data.attacks.map((attack, attackIndex) => /*#__PURE__*/React.createElement("div", {
        key: `${attack.name}-${attackIndex}`,
        className: "weapon-import-attack"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, attack.name || addModal.data.name), /*#__PURE__*/React.createElement("small", null, attack.dmg || 'Daño sin indicar')), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Característica"), /*#__PURE__*/React.createElement("select", {
        value: attack.attackAbility || 'fue',
        onChange: event => setAddModal(previous => ({
          ...previous,
          data: {
            ...previous.data,
            attacks: previous.data.attacks.map((item, index) => index === attackIndex ? {
              ...item,
              attackAbility: event.target.value,
              autoAttack: true
            } : item)
          }
        }))
      }, /*#__PURE__*/React.createElement("option", {
        value: "fue"
      }, "Fuerza"), /*#__PURE__*/React.createElement("option", {
        value: "des"
      }, "Destreza"), /*#__PURE__*/React.createElement("option", {
        value: "finesse"
      }, "Mejor entre FUE/DES"))), /*#__PURE__*/React.createElement("label", {
        className: "weapon-import-proficiency",
        title: attack.autoProficiency ? 'Detectado a partir de las competencias de la ficha' : 'Ajustado manualmente'
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: getWeaponAttackProficiency(attack),
        onChange: event => setAddModal(previous => ({
          ...previous,
          data: {
            ...previous.data,
            attacks: previous.data.attacks.map((item, index) => index === attackIndex ? {
              ...item,
              proficient: event.target.checked,
              autoProficiency: false,
              autoAttack: true
            } : item)
          }
        }))
      }), /*#__PURE__*/React.createElement("span", null, "Competente")), /*#__PURE__*/React.createElement("div", {
        className: "weapon-import-result"
      }, /*#__PURE__*/React.createElement("small", null, "A impactar"), /*#__PURE__*/React.createElement("strong", null, getWeaponAttackBonus(attack)))))), /*#__PURE__*/React.createElement("label", {
        className: "flex items-center gap-3 text-sm font-semibold text-cyan-100"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: addModal.data.usesAmmo === true || addModal.data.usesAmmo === undefined && Array.isArray(addModal.data.attacks) && addModal.data.attacks.some(attack => /munici[oó]n/i.test(String(attack.notes || ''))),
        onChange: event => setAddModal(previous => ({
          ...previous,
          data: {
            ...previous.data,
            usesAmmo: event.target.checked
          }
        })),
        className: "h-5 w-5 accent-cyan-600"
      }), /*#__PURE__*/React.createElement("span", null, "Usa munición del inventario")), (addModal.data.usesAmmo === true || addModal.data.usesAmmo === undefined && Array.isArray(addModal.data.attacks) && addModal.data.attacks.some(attack => /munici[oó]n/i.test(String(attack.notes || '')))) && /*#__PURE__*/React.createElement("div", {
        className: "grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]"
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] font-bold uppercase tracking-wider text-gray-400"
      }, "Pila de munición", /*#__PURE__*/React.createElement("select", {
        value: addModal.data.ammoItemId || '',
        onChange: event => setAddModal(previous => ({
          ...previous,
          data: {
            ...previous.data,
            ammoItemId: event.target.value
          }
        })),
        className: "mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case tracking-normal text-white"
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Vincular más tarde"), inventory.map(item => /*#__PURE__*/React.createElement("option", {
        key: item.id,
        value: item.id
      }, item.name, " · ", Math.max(0, Number(item.qty) || 0))))), /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] font-bold uppercase tracking-wider text-gray-400"
      }, "Por disparo", /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "1",
        value: addModal.data.ammoPerShot || 1,
        onChange: event => setAddModal(previous => ({
          ...previous,
          data: {
            ...previous.data,
            ammoPerShot: Math.max(1, Math.trunc(Number(event.target.value) || 1))
          }
        })),
        className: "mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-center text-sm text-white"
      }))), /*#__PURE__*/React.createElement("p", {
        className: "text-xs text-gray-400"
      }, "La cantidad del objeto elegido será la reserva única para esta arma y la mochila.")), (addModal.type === 'trait' || addModal.type === 'feat') && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Título"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        autoFocus: true,
        placeholder: addModal.type === 'trait' ? 'Ej: Visión en la oscuridad' : 'Ej: Alerta',
        value: addModal.data.title || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            title: e.target.value
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none"
      })), (addModal.type === 'trait' || addModal.type === 'feat') && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Descripción Detallada"), /*#__PURE__*/React.createElement("textarea", {
        placeholder: "Ej: Describe el beneficio o cómo se usa.",
        value: addModal.data.desc || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            desc: e.target.value
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none h-32 resize-y leading-relaxed"
      })), addModal.type === 'attack' && /*#__PURE__*/React.createElement("div", {
        className: "arsenal-action-fields"
      }, /*#__PURE__*/React.createElement("section", {
        className: "arsenal-action-attack"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Cálculo para impactar"), /*#__PURE__*/React.createElement("strong", null, addModal.data.autoAttack ? 'Automático desde la ficha' : 'Valor manual')), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: addModal.data.autoAttack === true,
        onChange: event => setAddModal(previous => ({
          ...previous,
          data: {
            ...previous.data,
            autoAttack: event.target.checked
          }
        }))
      }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", null)))), addModal.data.autoAttack ? /*#__PURE__*/React.createElement("div", {
        className: "arsenal-action-auto"
      }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Característica"), /*#__PURE__*/React.createElement("select", {
        value: addModal.data.attackAbility || 'fue',
        onChange: event => setAddModal(previous => ({
          ...previous,
          data: {
            ...previous.data,
            attackAbility: event.target.value
          }
        }))
      }, /*#__PURE__*/React.createElement("option", {
        value: "fue"
      }, "Fuerza"), /*#__PURE__*/React.createElement("option", {
        value: "des"
      }, "Destreza"), /*#__PURE__*/React.createElement("option", {
        value: "finesse"
      }, "Mejor FUE/DES"))), /*#__PURE__*/React.createElement("label", {
        className: "is-proficient"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: getWeaponAttackProficiency(addModal.data, selectedWeapon),
        onChange: event => setAddModal(previous => ({
          ...previous,
          data: {
            ...previous.data,
            proficient: event.target.checked,
            autoProficiency: false
          }
        }))
      }), /*#__PURE__*/React.createElement("span", null, "Sumar competencia")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "A impactar"), /*#__PURE__*/React.createElement("strong", null, getWeaponAttackBonus(addModal.data, selectedWeapon)))) : /*#__PURE__*/React.createElement("label", {
        className: "arsenal-action-manual"
      }, /*#__PURE__*/React.createElement("span", null, "Bono de ataque"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Ej: +6",
        value: addModal.data.atk || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            atk: e.target.value
          }
        })
      }))), /*#__PURE__*/React.createElement("label", {
        className: "arsenal-action-damage"
      }, /*#__PURE__*/React.createElement("span", null, "Daño y tipo"), /*#__PURE__*/React.createElement("small", null, "Dados, modificador y naturaleza del daño"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Ej: 1d8 + 4 cortante",
        value: addModal.data.dmg || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            dmg: e.target.value
          }
        })
      }))), (addModal.type === 'attack' || addModal.type === 'spell') && /*#__PURE__*/React.createElement("div", {
        className: addModal.type === 'attack' ? 'arsenal-action-notes' : ''
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Notas / Efectos Adicionales"), /*#__PURE__*/React.createElement("textarea", {
        placeholder: "Ej: Efecto, condición o nota útil.",
        value: addModal.data.notes || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            notes: e.target.value
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none h-28 resize-y leading-relaxed"
      })), addModal.type === 'spell' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "grid grid-cols-2 gap-4"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Nivel (0 = Truco)"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        max: "9",
        placeholder: "3",
        value: addModal.data.level ?? '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            level: handleNumInput(e.target.value)
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none text-center font-mono"
      }), Number(addModal.data.level) === 0 && /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] text-fuchsia-300"
      }, "Truco: no consume ranuras ni se prepara.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Alcance"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Ej: 150 pies",
        value: addModal.data.range || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            range: e.target.value
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none"
      }))), /*#__PURE__*/React.createElement("div", {
        className: "grid grid-cols-2 gap-4"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Forma de Área"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Ej: Esfera",
        value: addModal.data.shape || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            shape: e.target.value
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Tamaño Área"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Ej: 20 pies",
        value: addModal.data.size || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            size: e.target.value
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none"
      }))), /*#__PURE__*/React.createElement("div", {
        className: "space-y-3 mt-2 bg-gray-900/50 p-4 rounded border border-gray-800"
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 block font-fantasy border-b border-gray-700 pb-1"
      }, "Componentes Requeridos"), /*#__PURE__*/React.createElement("div", {
        className: "flex gap-6"
      }, /*#__PURE__*/React.createElement("label", {
        className: "flex items-center space-x-2 text-sm text-gray-300 cursor-pointer font-bold"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: addModal.data.compV || false,
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            compV: e.target.checked
          }
        }),
        className: "w-4 h-4 accent-fuchsia-600 bg-gray-950 border-gray-700 rounded"
      }), /*#__PURE__*/React.createElement("span", null, "V ", /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-normal text-gray-500"
      }, "(Verbal)"))), /*#__PURE__*/React.createElement("label", {
        className: "flex items-center space-x-2 text-sm text-gray-300 cursor-pointer font-bold"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: addModal.data.compS || false,
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            compS: e.target.checked
          }
        }),
        className: "w-4 h-4 accent-fuchsia-600 bg-gray-950 border-gray-700 rounded"
      }), /*#__PURE__*/React.createElement("span", null, "S ", /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-normal text-gray-500"
      }, "(Gestos)"))), /*#__PURE__*/React.createElement("label", {
        className: "flex items-center space-x-2 text-sm text-gray-300 cursor-pointer font-bold"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: addModal.data.compM || false,
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            compM: e.target.checked
          }
        }),
        className: "w-4 h-4 accent-fuchsia-600 bg-gray-950 border-gray-700 rounded"
      }), /*#__PURE__*/React.createElement("span", null, "M ", /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-normal text-gray-500"
      }, "(Objeto)")))), addModal.data.compM && /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Ej: polvo de diamante",
        value: addModal.data.compMDesc || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            compMDesc: e.target.value
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none text-sm mt-2"
      })), /*#__PURE__*/React.createElement("div", {
        className: "grid grid-cols-2 gap-3"
      }, /*#__PURE__*/React.createElement("label", {
        className: "flex min-h-11 items-center gap-3 rounded border border-purple-900/70 bg-purple-950/20 px-3 text-sm text-purple-100"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: addModal.data.concentration || false,
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            concentration: e.target.checked
          }
        }),
        className: "h-5 w-5 accent-purple-600"
      }), /*#__PURE__*/React.createElement("span", null, "Concentración")), /*#__PURE__*/React.createElement("label", {
        className: "flex min-h-11 items-center gap-3 rounded border border-gray-700 bg-gray-900/50 px-3 text-sm text-gray-200"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: addModal.data.ritual || false,
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            ritual: e.target.checked
          }
        }),
        className: "h-5 w-5 accent-purple-600"
      }), /*#__PURE__*/React.createElement("span", null, "Ritual"))), /*#__PURE__*/React.createElement("div", {
        className: "space-y-3 rounded border border-cyan-900/60 bg-cyan-950/10 p-3"
      }, /*#__PURE__*/React.createElement("label", {
        className: "block text-[10px] font-bold uppercase tracking-wider text-cyan-200"
      }, "Origen y funcionamiento", /*#__PURE__*/React.createElement("select", {
        value: addModal.data.grantType || 'standard',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            grantType: e.target.value,
            countsPreparation: false,
            countsKnownLimit: e.target.value === 'standard'
          }
        }),
        className: "mt-1 min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case text-white"
      }, /*#__PURE__*/React.createElement("option", {
        value: "standard"
      }, "Conjuro normal"), /*#__PURE__*/React.createElement("option", {
        value: "species"
      }, "Concedido por especie"), /*#__PURE__*/React.createElement("option", {
        value: "class"
      }, "Concedido por clase"), /*#__PURE__*/React.createElement("option", {
        value: "subclass"
      }, "Concedido por subclase"), /*#__PURE__*/React.createElement("option", {
        value: "feat"
      }, "Concedido por dote"), /*#__PURE__*/React.createElement("option", {
        value: "item"
      }, "Concedido por objeto"))), (addModal.data.grantType || 'standard') !== 'standard' && /*#__PURE__*/React.createElement("input", {
        value: addModal.data.grantSource || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            grantSource: e.target.value
          }
        }),
        placeholder: "Nombre del rasgo, dote u objeto",
        className: "min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-3 text-sm text-white"
      }), /*#__PURE__*/React.createElement("div", {
        className: "grid gap-2 sm:grid-cols-2"
      }, /*#__PURE__*/React.createElement("label", {
        className: "flex items-center gap-2 text-xs text-gray-300"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: addModal.data.countsPreparation ?? false,
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            countsPreparation: e.target.checked
          }
        }),
        className: "h-4 w-4 accent-cyan-600"
      }), "Consume preparación"), /*#__PURE__*/React.createElement("label", {
        className: "flex items-center gap-2 text-xs text-gray-300"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: addModal.data.countsKnownLimit ?? (addModal.data.grantType || 'standard') === 'standard',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            countsKnownLimit: e.target.checked
          }
        }),
        className: "h-4 w-4 accent-cyan-600"
      }), "Cuenta contra conocidos")), /*#__PURE__*/React.createElement("label", {
        className: "block text-[10px] font-bold uppercase tracking-wider text-gray-400"
      }, "Recurso de lanzamiento", /*#__PURE__*/React.createElement("select", {
        value: addModal.data.castingResource || 'slots',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            castingResource: e.target.value
          }
        }),
        className: "mt-1 min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case text-white"
      }, /*#__PURE__*/React.createElement("option", {
        value: "slots"
      }, "Ranuras normales"), /*#__PURE__*/React.createElement("option", {
        value: "independent"
      }, "Usos propios independientes"), /*#__PURE__*/React.createElement("option", {
        value: "at-will"
      }, "A voluntad"))), addModal.data.castingResource === 'independent' && /*#__PURE__*/React.createElement("label", {
        className: "block text-[10px] font-bold uppercase tracking-wider text-gray-400"
      }, "Usos máximos", /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "1",
        value: addModal.data.ownUsesMax || 1,
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            ownUsesMax: Math.max(1, Number(e.target.value) || 1),
            ownUsesCurrent: Math.max(1, Number(e.target.value) || 1)
          }
        }),
        className: "mt-1 min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-center text-sm text-white"
      })))), addModal.type === 'resource' && /*#__PURE__*/React.createElement("div", {
        className: "space-y-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex gap-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-1/2"
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Usos Máximos"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        placeholder: "3",
        value: addModal.data.max || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            max: handleNumInput(e.target.value)
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none text-center font-mono"
      })), /*#__PURE__*/React.createElement("div", {
        className: "w-1/2"
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy"
      }, "Tipo de Dado"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Ej: d8",
        value: addModal.data.dice || '',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            dice: e.target.value
          }
        }),
        className: "w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none text-center font-mono"
      }))), /*#__PURE__*/React.createElement("label", {
        className: "block text-sm text-gray-300"
      }, "Se recupera con", /*#__PURE__*/React.createElement("select", {
        value: addModal.data.recoveryRest || 'manual',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            recoveryRest: e.target.value
          }
        }),
        className: "block mt-1 w-full bg-gray-950 border border-gray-700 rounded p-2"
      }, /*#__PURE__*/React.createElement("option", {
        value: "short"
      }, "Descanso corto (también largo)"), /*#__PURE__*/React.createElement("option", {
        value: "long"
      }, "Descanso largo"), /*#__PURE__*/React.createElement("option", {
        value: "manual"
      }, "Solo manualmente"))), addModal.data.recoveryRest !== 'manual' && /*#__PURE__*/React.createElement("label", {
        className: "block text-sm text-gray-300"
      }, "Cantidad recuperada", /*#__PURE__*/React.createElement("select", {
        value: addModal.data.recoveryMode || 'full',
        onChange: e => setAddModal({
          ...addModal,
          data: {
            ...addModal.data,
            recoveryMode: e.target.value
          }
        }),
        className: "block mt-1 w-full bg-gray-950 border border-gray-700 rounded p-2"
      }, /*#__PURE__*/React.createElement("option", {
        value: "full"
      }, "Completa"), /*#__PURE__*/React.createElement("option", {
        value: "fixed"
      }, "Cantidad fija"), /*#__PURE__*/React.createElement("option", {
        value: "half"
      }, "Mitad"), /*#__PURE__*/React.createElement("option", {
        value: "manual"
      }, "Manual"))))), /*#__PURE__*/React.createElement("div", {
        className: `flex justify-end space-x-4 mt-8 pt-5 border-t border-gray-700 ${addModal.type === 'weapon' || addModal.type === 'attack' ? 'arsenal-editor-footer' : ''}`
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setAddModal({
          isOpen: false,
          type: null,
          data: {}
        }),
        className: "px-5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded font-bold transition-colors font-fantasy uppercase tracking-wider text-xs"
      }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
        onClick: handleAddSubmit,
        className: "px-6 py-2 bg-purple-700 hover:bg-purple-600 border border-purple-500 text-white rounded font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all transform hover:scale-105 font-fantasy uppercase tracking-wider text-xs"
      }, addModal.type === 'weapon' ? 'Añadir al arsenal' : addModal.type === 'attack' ? 'Añadir acción' : 'Registrar')))));
    }
    window.DndEditorDialogComponents = {
      EditorDialogs
    };
  })();
})();