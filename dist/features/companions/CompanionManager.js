(() => {
  window.DndCompanionComponents = (() => {
    const {
      useState,
      useEffect
    } = React;
    const {
      LOCAL_BESTIARY_STORAGE_KEY,
      cloneData,
      normalizeCompanion,
      normalizeRuleLookupText,
      isValidPortraitDataUrl
    } = window.DndAppUtils;
    const COMPANION_CATEGORY_LABELS = Object.freeze({
      familiar: 'Familiar',
      animal: 'Compañero animal',
      construct: 'Compañero artificial',
      mount: 'Montura',
      summon: 'Invocación',
      other: 'Otro aliado'
    });
    const COMPANION_INITIATIVE_LABELS = Object.freeze({
      'after-owner': 'Actúa después de mi turno',
      own: 'Iniciativa propia',
      shared: 'Comparte mi iniciativa'
    });
    let companionBestiaryAvatarCache = {
      raw: null,
      avatars: new Map()
    };
    const getCompanionAvatar = companion => {
      if (companion?.avatarDataUrl || companion?.avatarPath) return companion.avatarDataUrl || companion.avatarPath;
      if (companion?.sourceKind !== 'bestiary' || !companion?.sourceId) return '';
      try {
        const raw = window.localStorage.getItem(LOCAL_BESTIARY_STORAGE_KEY) || '';
        if (raw !== companionBestiaryAvatarCache.raw) {
          const parsed = raw ? JSON.parse(raw) : null;
          companionBestiaryAvatarCache = {
            raw,
            avatars: new Map((Array.isArray(parsed?.monsters) ? parsed.monsters : []).map(monster => [monster.id, isValidPortraitDataUrl(monster.avatarDataUrl) ? monster.avatarDataUrl : '']))
          };
        }
        return companionBestiaryAvatarCache.avatars.get(companion.sourceId) || '';
      } catch (error) {
        return '';
      }
    };
    const companionConditionNames = companion => (Array.isArray(companion?.conditions) ? companion.conditions : []).map(condition => typeof condition === 'string' ? condition : condition?.name).filter(Boolean);
    function CompanionAvatar({
      companion,
      avatar: avatarOverride = '',
      className = ''
    }) {
      const avatar = avatarOverride || getCompanionAvatar(companion);
      return /*#__PURE__*/React.createElement("span", {
        className: `companion-avatar ${className}`
      }, avatar ? /*#__PURE__*/React.createElement("img", {
        src: avatar,
        alt: ""
      }) : /*#__PURE__*/React.createElement("b", null, String(companion?.name || '?').slice(0, 1).toLocaleUpperCase('es')));
    }
    function CompanionManagerModal({
      open,
      focusId,
      focusField,
      companions,
      srdMonsters,
      localMonsters,
      getMonsterIcon,
      onChange,
      onDelete,
      onClose
    }) {
      const [view, setView] = useState('list');
      const [selectedId, setSelectedId] = useState(null);
      const [editor, setEditor] = useState(null);
      const [sourceKind, setSourceKind] = useState('srd');
      const [sourceScope, setSourceScope] = useState('beasts');
      const [query, setQuery] = useState('');
      useEffect(() => {
        if (!open) return;
        const focusedCompanion = focusId ? companions.find(companion => companion.id === focusId) : null;
        if (focusedCompanion && focusField) {
          setSelectedId(focusId);
          setEditor(cloneData(focusedCompanion));
          setView('editor');
        } else if (focusedCompanion) {
          setSelectedId(focusId);
          setEditor(null);
          setView('detail');
        } else {
          setSelectedId(null);
          setEditor(null);
          setView('list');
        }
      }, [open, focusId, focusField]);
      useEffect(() => {
        if (!open || view !== 'editor' || !focusField) return;
        const selector = focusField === 'initiative' ? '.companion-editor-combat input[type="number"]' : focusField === 'maxHp' ? '.companion-editor-stats label:nth-of-type(2) input' : '';
        if (!selector) return;
        const focusTimer = window.setTimeout(() => {
          const input = document.querySelector(selector);
          input?.focus();
          input?.select?.();
          input?.scrollIntoView({
            block: 'center',
            behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
          });
        }, 40);
        return () => window.clearTimeout(focusTimer);
      }, [open, view, focusField]);
      if (!open) return null;
      const selected = companions.find(companion => companion.id === selectedId) || null;
      const sourceMonsters = sourceKind === 'srd' ? srdMonsters : localMonsters;
      const normalizedQuery = String(query || '').trim().toLocaleLowerCase('es');
      const matches = sourceMonsters.filter(monster => {
        const details = sourceKind === 'srd' ? monster.details : monster.srdDetails || {};
        const type = normalizeRuleLookupText(details.type || monster.tags?.join(' ') || '');
        const searchable = `${monster.name || ''} ${details.type || ''} ${(monster.tags || []).join(' ')}`.toLocaleLowerCase('es');
        return (sourceScope !== 'beasts' || type.includes('bestia')) && (!normalizedQuery || searchable.includes(normalizedQuery));
      }).slice(0, 120);
      const startManual = () => {
        setEditor(normalizeCompanion({
          name: '',
          category: 'familiar',
          sourceKind: 'manual',
          maxHp: 1,
          currentHp: 1,
          armorClass: 10,
          initiativeMode: 'own',
          participates: false,
          details: {
            abilities: {
              str: 10,
              dex: 10,
              con: 10,
              int: 10,
              wis: 10,
              cha: 10
            },
            speedText: '',
            senses: '',
            languages: '',
            traits: [],
            actions: [],
            bonusActions: [],
            reactions: []
          }
        }));
        setView('editor');
      };
      const importMonster = monster => {
        const details = cloneData(sourceKind === 'srd' ? monster.details || {} : monster.srdDetails || {});
        setEditor(normalizeCompanion({
          name: monster.name,
          category: 'familiar',
          sourceKind: sourceKind === 'srd' ? 'srd' : 'bestiary',
          sourceId: monster.id,
          sourceLabel: sourceKind === 'srd' ? 'Compendio SRD 5.1' : 'Bestiario personal',
          avatarDataUrl: '',
          avatarPath: sourceKind === 'srd' ? getMonsterIcon(monster) : '',
          maxHp: monster.maxHp,
          currentHp: monster.maxHp,
          armorClass: monster.armorClass,
          initiativeMode: 'own',
          details,
          notes: sourceKind === 'bestiary' ? monster.privateNotes || '' : ''
        }));
        setView('editor');
      };
      const saveEditor = () => {
        const normalized = normalizeCompanion(editor);
        if (!normalized.name) return;
        onChange(previous => previous.some(item => item.id === normalized.id) ? previous.map(item => item.id === normalized.id ? normalized : item) : [...previous, normalized]);
        setSelectedId(normalized.id);
        setView('detail');
      };
      const updateEditor = changes => setEditor(previous => normalizeCompanion({
        ...previous,
        ...changes
      }));
      const updateDetails = changes => setEditor(previous => normalizeCompanion({
        ...previous,
        details: {
          ...(previous.details || {}),
          ...changes
        }
      }));
      const statEntries = companion => Object.entries({
        FUE: companion?.details?.abilities?.str,
        DES: companion?.details?.abilities?.dex,
        CON: companion?.details?.abilities?.con,
        INT: companion?.details?.abilities?.int,
        SAB: companion?.details?.abilities?.wis,
        CAR: companion?.details?.abilities?.cha
      });
      const goBack = () => {
        if (view === 'list') onClose();else {
          setEditor(null);
          setView('list');
        }
      };
      return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
        className: "companion-overlay",
        onMouseDown: event => {
          if (event.target === event.currentTarget) onClose();
        }
      }, /*#__PURE__*/React.createElement("section", {
        className: "companion-dialog",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "companion-dialog-title"
      }, /*#__PURE__*/React.createElement("header", {
        className: "companion-dialog-header"
      }, /*#__PURE__*/React.createElement("span", {
        className: "companion-dialog-emblem",
        "aria-hidden": "true"
      }, "✦"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Vínculos del personaje"), /*#__PURE__*/React.createElement("h3", {
        id: "companion-dialog-title"
      }, view === 'source' ? 'Elegir criatura' : view === 'editor' ? companions.some(item => item.id === editor?.id) ? 'Editar compañero' : 'Vincular compañero' : view === 'detail' && selected ? selected.name : 'Compañeros'), /*#__PURE__*/React.createElement("p", null, view === 'source' ? 'Importa una criatura como copia independiente de su ficha.' : view === 'editor' ? 'Ajusta su identidad y cómo participa en combate.' : view === 'detail' ? `${COMPANION_CATEGORY_LABELS[selected?.category] || 'Compañero'} · ${selected?.sourceLabel || 'Ficha personalizada'}` : 'Familiares, aliados, monturas e invocaciones vinculadas.')), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClose,
        "aria-label": "Cerrar"
      }, "×")), view !== 'list' && /*#__PURE__*/React.createElement("nav", {
        className: "companion-dialog-back"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: goBack
      }, "← Volver a compañeros")), /*#__PURE__*/React.createElement("div", {
        className: "companion-dialog-body"
      }, view === 'list' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "companion-manager-intro"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, companions.length ? 'Vínculos registrados' : 'Tu grupo cercano'), /*#__PURE__*/React.createElement("strong", null, companions.length ? `${companions.length} compañero${companions.length === 1 ? '' : 's'}` : 'Aún no hay compañeros'), /*#__PURE__*/React.createElement("p", null, "Sus PV, condiciones y participación pertenecen a este personaje.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setView('source')
      }, "＋ Añadir compañero")), /*#__PURE__*/React.createElement("div", {
        className: "companion-manager-grid"
      }, companions.map(companion => {
        const hpPercent = companion.maxHp > 0 ? Math.max(0, Math.min(100, companion.currentHp / companion.maxHp * 100)) : 0;
        return /*#__PURE__*/React.createElement("article", {
          key: companion.id,
          className: companion.participates ? 'is-participating' : ''
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "companion-manager-card-main",
          onClick: () => {
            setSelectedId(companion.id);
            setView('detail');
          }
        }, /*#__PURE__*/React.createElement(CompanionAvatar, {
          companion: companion
        }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, COMPANION_CATEGORY_LABELS[companion.category]), /*#__PURE__*/React.createElement("strong", null, companion.name), /*#__PURE__*/React.createElement("em", null, "CA ", companion.armorClass ?? '—', " · PV ", companion.currentHp, "/", companion.maxHp), /*#__PURE__*/React.createElement("i", null, /*#__PURE__*/React.createElement("b", {
          style: {
            width: `${hpPercent}%`
          }
        }))), /*#__PURE__*/React.createElement("span", {
          className: "companion-manager-state"
        }, companion.participates ? 'En combate' : 'Disponible')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => {
            setEditor(cloneData(companion));
            setView('editor');
          }
        }, "Editar"), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => onDelete(companion)
        }, "Eliminar")));
      }), !companions.length && /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "companion-manager-empty",
        onClick: () => setView('source')
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "◇"), /*#__PURE__*/React.createElement("strong", null, "Añade tu primer compañero"), /*#__PURE__*/React.createElement("p", null, "Elige una bestia del compendio, usa tu bestiario o crea una ficha manual."), /*#__PURE__*/React.createElement("b", null, "Comenzar →")))), view === 'source' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "companion-source-options"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: sourceKind === 'srd' ? 'is-active' : '',
        onClick: () => setSourceKind('srd')
      }, /*#__PURE__*/React.createElement("span", null, "♜"), /*#__PURE__*/React.createElement("strong", null, "Compendio SRD"), /*#__PURE__*/React.createElement("small", null, srdMonsters.length, " criaturas")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: sourceKind === 'local' ? 'is-active' : '',
        onClick: () => setSourceKind('local')
      }, /*#__PURE__*/React.createElement("span", null, "◇"), /*#__PURE__*/React.createElement("strong", null, "Mi bestiario"), /*#__PURE__*/React.createElement("small", null, localMonsters.length, " criaturas")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: startManual
      }, /*#__PURE__*/React.createElement("span", null, "＋"), /*#__PURE__*/React.createElement("strong", null, "Crear manualmente"), /*#__PURE__*/React.createElement("small", null, "Ficha personalizada"))), /*#__PURE__*/React.createElement("div", {
        className: "companion-source-filters"
      }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "⌕"), /*#__PURE__*/React.createElement("input", {
        autoFocus: true,
        value: query,
        onChange: event => setQuery(event.target.value),
        placeholder: "Buscar por nombre o tipo…"
      })), /*#__PURE__*/React.createElement("select", {
        value: sourceScope,
        onChange: event => setSourceScope(event.target.value)
      }, /*#__PURE__*/React.createElement("option", {
        value: "beasts"
      }, "Bestias recomendadas"), /*#__PURE__*/React.createElement("option", {
        value: "all"
      }, "Todas las criaturas"))), /*#__PURE__*/React.createElement("div", {
        className: "companion-source-results"
      }, matches.map(monster => {
        const details = sourceKind === 'srd' ? monster.details || {} : monster.srdDetails || {};
        const avatar = monster.avatarDataUrl || (sourceKind === 'srd' ? getMonsterIcon(monster) : '');
        return /*#__PURE__*/React.createElement("button", {
          key: monster.id,
          type: "button",
          onClick: () => importMonster(monster)
        }, /*#__PURE__*/React.createElement("span", {
          className: "companion-source-avatar"
        }, avatar ? /*#__PURE__*/React.createElement("img", {
          src: avatar,
          alt: "",
          loading: "lazy"
        }) : String(monster.name).slice(0, 1)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, details.type || monster.tags?.[0] || 'Criatura', " · CR ", String(details.challengeRating || '—').split(' ')[0]), /*#__PURE__*/React.createElement("strong", null, monster.name), /*#__PURE__*/React.createElement("em", null, "PV ", monster.maxHp, " · CA ", monster.armorClass ?? '—')), /*#__PURE__*/React.createElement("b", null, "Vincular →"));
      }), !matches.length && /*#__PURE__*/React.createElement("div", {
        className: "companion-source-empty"
      }, /*#__PURE__*/React.createElement("strong", null, "Sin coincidencias"), /*#__PURE__*/React.createElement("p", null, sourceScope === 'beasts' ? 'Prueba a mostrar todas las criaturas.' : 'Cambia la búsqueda o crea una ficha manual.')))), view === 'editor' && editor && /*#__PURE__*/React.createElement("div", {
        className: "companion-editor"
      }, /*#__PURE__*/React.createElement("section", {
        className: "companion-editor-identity"
      }, /*#__PURE__*/React.createElement(CompanionAvatar, {
        companion: editor
      }), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Nombre del compañero"), /*#__PURE__*/React.createElement("input", {
        autoFocus: true,
        value: editor.name,
        onChange: event => updateEditor({
          name: event.target.value
        }),
        placeholder: "Ej. Nimbo"
      })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Tipo de vínculo"), /*#__PURE__*/React.createElement("select", {
        value: editor.category,
        onChange: event => updateEditor({
          category: event.target.value
        })
      }, Object.entries(COMPANION_CATEGORY_LABELS).map(([value, label]) => /*#__PURE__*/React.createElement("option", {
        key: value,
        value: value
      }, label))))), /*#__PURE__*/React.createElement("section", {
        className: "companion-editor-stats"
      }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "PV actuales"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        value: editor.currentHp,
        onChange: event => updateEditor({
          currentHp: event.target.value
        })
      })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "PV máximos"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        value: editor.maxHp,
        onChange: event => updateEditor({
          maxHp: event.target.value
        })
      })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "PV temporales"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        value: editor.tempHp,
        onChange: event => updateEditor({
          tempHp: event.target.value
        })
      })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Clase de armadura"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        value: editor.armorClass ?? '',
        onChange: event => updateEditor({
          armorClass: event.target.value
        })
      }))), /*#__PURE__*/React.createElement("section", {
        className: "companion-editor-combat"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Comportamiento táctico"), /*#__PURE__*/React.createElement("strong", null, "Participación en combate")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: editor.participates ? 'is-active' : '',
        onClick: () => updateEditor({
          participates: !editor.participates
        })
      }, /*#__PURE__*/React.createElement("i", null), editor.participates ? 'Participará' : 'No participa')), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Cuándo actúa"), /*#__PURE__*/React.createElement("select", {
        value: editor.initiativeMode,
        onChange: event => updateEditor({
          initiativeMode: event.target.value
        })
      }, Object.entries(COMPANION_INITIATIVE_LABELS).map(([value, label]) => /*#__PURE__*/React.createElement("option", {
        key: value,
        value: value
      }, label)))), editor.initiativeMode === 'own' && /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Iniciativa"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        value: editor.initiative ?? '',
        onChange: event => updateEditor({
          initiative: event.target.value
        }),
        placeholder: "Pendiente"
      })), /*#__PURE__*/React.createElement("p", null, "La aplicación organiza el turno, pero no decide qué puede hacer el compañero.")), editor.category === 'familiar' && /*#__PURE__*/React.createElement("aside", {
        className: "companion-rules-note"
      }, /*#__PURE__*/React.createElement("span", null, "SRD 5.1"), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Familiar clásico:"), " tira su propia iniciativa y actúa en su turno. No puede atacar, aunque sí puede realizar otras acciones; una capacidad concreta puede modificar estas reglas.")), editor.sourceKind === 'manual' && /*#__PURE__*/React.createElement("section", {
        className: "companion-editor-details"
      }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Velocidad"), /*#__PURE__*/React.createElement("input", {
        value: editor.details?.speedText || '',
        onChange: event => updateDetails({
          speedText: event.target.value
        }),
        placeholder: "Ej. 9 m, volar 18 m"
      })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Sentidos"), /*#__PURE__*/React.createElement("input", {
        value: editor.details?.senses || '',
        onChange: event => updateDetails({
          senses: event.target.value
        })
      })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Idiomas"), /*#__PURE__*/React.createElement("input", {
        value: editor.details?.languages || '',
        onChange: event => updateDetails({
          languages: event.target.value
        })
      }))), /*#__PURE__*/React.createElement("label", {
        className: "companion-editor-notes"
      }, /*#__PURE__*/React.createElement("span", null, "Condiciones activas"), /*#__PURE__*/React.createElement("input", {
        value: companionConditionNames(editor).join(', '),
        onChange: event => updateEditor({
          conditions: event.target.value.split(',').map(value => value.trim()).filter(Boolean)
        }),
        placeholder: "Invisible, envenenado…"
      })), /*#__PURE__*/React.createElement("label", {
        className: "companion-editor-notes"
      }, /*#__PURE__*/React.createElement("span", null, "Notas del jugador"), /*#__PURE__*/React.createElement("textarea", {
        value: editor.notes || '',
        onChange: event => updateEditor({
          notes: event.target.value
        }),
        placeholder: "Órdenes habituales, vínculo, recordatorios…"
      })), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: goBack
      }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-primary",
        disabled: !editor.name.trim(),
        onClick: saveEditor
      }, "Guardar compañero"))), view === 'detail' && selected && /*#__PURE__*/React.createElement("div", {
        className: "companion-sheet"
      }, /*#__PURE__*/React.createElement("section", {
        className: "companion-sheet-hero"
      }, /*#__PURE__*/React.createElement(CompanionAvatar, {
        companion: selected
      }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, COMPANION_CATEGORY_LABELS[selected.category]), /*#__PURE__*/React.createElement("h4", null, selected.name), /*#__PURE__*/React.createElement("p", null, selected.details?.subtitle || selected.details?.type || selected.sourceLabel || 'Compañero personalizado'), /*#__PURE__*/React.createElement("span", {
        className: selected.participates ? 'is-active' : ''
      }, selected.participates ? 'Preparado para combatir' : 'Fuera del combate')), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          setEditor(cloneData(selected));
          setView('editor');
        }
      }, "Editar ficha")), /*#__PURE__*/React.createElement("div", {
        className: "companion-sheet-vitals"
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "PV"), /*#__PURE__*/React.createElement("strong", null, selected.currentHp, "/", selected.maxHp), selected.tempHp > 0 && /*#__PURE__*/React.createElement("em", null, "+", selected.tempHp, " temporales")), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "CA"), /*#__PURE__*/React.createElement("strong", null, selected.armorClass ?? '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Movimiento"), /*#__PURE__*/React.createElement("strong", null, selected.details?.speedText || '—')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("small", null, "Turno"), /*#__PURE__*/React.createElement("strong", null, COMPANION_INITIATIVE_LABELS[selected.initiativeMode]))), statEntries(selected).some(([, value]) => value !== undefined) && /*#__PURE__*/React.createElement("div", {
        className: "companion-sheet-abilities"
      }, statEntries(selected).map(([label, value]) => /*#__PURE__*/React.createElement("span", {
        key: label
      }, /*#__PURE__*/React.createElement("small", null, label), /*#__PURE__*/React.createElement("strong", null, value ?? '—'), /*#__PURE__*/React.createElement("em", null, Number.isFinite(Number(value)) ? `${Math.floor((Number(value) - 10) / 2) >= 0 ? '+' : ''}${Math.floor((Number(value) - 10) / 2)}` : '')))), /*#__PURE__*/React.createElement("div", {
        className: "companion-sheet-info"
      }, [['Sentidos', selected.details?.senses], ['Idiomas', selected.details?.languages], ['Salvaciones', selected.details?.saves], ['Habilidades', selected.details?.skills], ['Resistencias', selected.details?.resistances], ['Inmunidades', selected.details?.immunities], ['Vulnerabilidades', selected.details?.vulnerabilities]].filter(([, value]) => value).map(([label, value]) => /*#__PURE__*/React.createElement("p", {
        key: label
      }, /*#__PURE__*/React.createElement("strong", null, label), value))), /*#__PURE__*/React.createElement("div", {
        className: "companion-sheet-sections"
      }, [['Rasgos', selected.details?.traits], ['Acciones', selected.details?.actions], ['Acciones adicionales', selected.details?.bonusActions], ['Reacciones', selected.details?.reactions]].map(([title, entries]) => Array.isArray(entries) && entries.length > 0 && /*#__PURE__*/React.createElement("section", {
        key: title
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("h5", null, title), /*#__PURE__*/React.createElement("span", null, entries.length)), entries.map((entry, index) => /*#__PURE__*/React.createElement("article", {
        key: `${entry?.name || title}-${index}`
      }, /*#__PURE__*/React.createElement("strong", null, entry?.name || 'Detalle'), /*#__PURE__*/React.createElement("p", null, entry?.desc || ''), Array.isArray(entry?.dice) && entry.dice.length > 0 && /*#__PURE__*/React.createElement("div", null, entry.dice.map((die, dieIndex) => /*#__PURE__*/React.createElement("span", {
        key: `${die}-${dieIndex}`
      }, die)))))))), companionConditionNames(selected).length > 0 && /*#__PURE__*/React.createElement("section", {
        className: "companion-sheet-conditions"
      }, /*#__PURE__*/React.createElement("h5", null, "Condiciones"), /*#__PURE__*/React.createElement("div", null, companionConditionNames(selected).map(name => /*#__PURE__*/React.createElement("span", {
        key: name
      }, name)))), selected.notes && /*#__PURE__*/React.createElement("section", {
        className: "companion-sheet-notes"
      }, /*#__PURE__*/React.createElement("h5", null, "Notas"), /*#__PURE__*/React.createElement("p", null, selected.notes)))))), document.body);
    }
    return {
      COMPANION_CATEGORY_LABELS,
      COMPANION_INITIATIVE_LABELS,
      getCompanionAvatar,
      companionConditionNames,
      CompanionAvatar,
      CompanionManagerModal
    };
  })();
})();