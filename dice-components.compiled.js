(() => {
  const {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useMemo,
    useCallback
  } = React;
  const {
    SUPPORTED_DICE,
    parseDiceFormula,
    formatDiceFormula,
    doubleDiceFormula,
    rollDice: calculateDiceRoll,
    rerollDiceResult
  } = window.DndDiceEngine;
  const {
    getGeometry,
    getAnimatedQuaternion,
    drawDie
  } = window.DndDice3D;
  const Dice3D = ({
    die,
    index = 0,
    rolling = true,
    quick = false,
    reducedMotion = false,
    revealResult = true,
    revealSelectionState = true,
    selectable = false,
    selectedForReroll = false,
    onToggleReroll
  }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const [settled, setSettled] = useState(false);
    const geometry = useMemo(() => getGeometry(die.sides), [die.sides]);
    const seed = useMemo(() => [...String(die.id)].reduce((sum, character) => sum + character.charCodeAt(0), 11 + index * 7), [die.id, index]);
    const isD20 = Number(die.sides) === 20;
    const isEligibleD20 = isD20 && die.state !== 'discarded';
    const resultTone = isEligibleD20 && Number(die.result) === 20 ? 'critical' : isEligibleD20 && Number(die.result) === 1 ? 'fumble' : '';
    useLayoutEffect(() => {
      if (rolling) setSettled(false);
    }, [die.id, die.result, rolling]);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return undefined;
      const context = canvas.getContext('2d', {
        alpha: true,
        desynchronized: true
      });
      if (!context) return undefined;
      let active = true;
      const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 || navigator.deviceMemory && navigator.deviceMemory <= 4;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 2);
      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width * pixelRatio));
        const height = Math.max(1, Math.round(rect.height * pixelRatio));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      };
      resize();
      if (window.ResizeObserver) {
        resizeObserverRef.current = new ResizeObserver(resize);
        resizeObserverRef.current.observe(canvas);
      } else window.addEventListener('resize', resize);
      if (rolling) setSettled(false);
      const startedAt = performance.now();
      const duration = reducedMotion ? 140 : quick ? 680 + index * 45 : 1650 + index * 105;
      const revealDuration = reducedMotion || !isD20 ? 0 : quick ? 720 : 1250;
      const render = now => {
        if (!active) return;
        resize();
        const progress = rolling ? Math.max(0, Math.min(1, (now - startedAt) / duration)) : 1;
        const rawReveal = revealResult ? rolling || revealDuration === 0 ? 1 : Math.max(0, Math.min(1, (now - startedAt) / revealDuration)) : 0;
        const resultReveal = rawReveal * rawReveal * (3 - 2 * rawReveal);
        const rawNeighborhoodFade = Number(die.sides) === 20 ? Math.max(0, Math.min(1, (progress - .7) / .3)) : 0;
        const resultNeighborhoodFade = rawNeighborhoodFade * rawNeighborhoodFade * (3 - 2 * rawNeighborhoodFade);
        const rawOrthographicBlend = Number(die.sides) === 10 ? Math.max(0, Math.min(1, (progress - .66) / .34)) : 0;
        const orthographicBlend = rawOrthographicBlend * rawOrthographicBlend * (3 - 2 * rawOrthographicBlend);
        const rotation = getAnimatedQuaternion(geometry, die.result, progress, seed);
        drawDie(context, geometry, rotation, {
          result: die.result,
          faceLabels: die.faceLabels,
          settled: progress >= .995 && (revealResult || !isD20),
          hideResultLabel: isD20,
          resultReveal: isD20 ? resultReveal : 1,
          resultTone,
          resultNeighborhoodFade,
          orthographicBlend,
          palette: die.palette
        });
        if (progress < 1 || !rolling && revealResult && rawReveal < 1) animationRef.current = window.requestAnimationFrame(render);else {
          setSettled(true);
          animationRef.current = null;
        }
      };
      animationRef.current = window.requestAnimationFrame(render);
      return () => {
        active = false;
        if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
        resizeObserverRef.current?.disconnect();
        resizeObserverRef.current = null;
        window.removeEventListener('resize', resize);
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 1;
        canvas.height = 1;
      };
    }, [die.id, die.result, die.faceLabels, die.palette, geometry, index, isD20, quick, reducedMotion, rolling, revealResult, resultTone, seed]);
    const toggleReroll = () => {
      if (selectable) onToggleReroll?.(die.groupId);
    };
    const resultVisible = settled && revealResult;
    const isNaturalTwenty = resultVisible && resultTone === 'critical';
    const isNaturalOne = resultVisible && resultTone === 'fumble';
    const resolvedStateVisible = !isD20 || revealSelectionState;
    const resolvedStateClass = resolvedStateVisible ? die.state === 'selected' ? 'is-selected' : die.state === 'discarded' ? 'is-discarded' : '' : '';
    return /*#__PURE__*/React.createElement("figure", {
      className: `dice-3d ${settled ? 'is-settled' : 'is-rolling'} ${resultVisible ? 'is-result-visible' : 'is-awaiting-result'} ${isD20 ? 'is-d20-suspense' : ''} ${isNaturalTwenty ? 'is-natural-twenty' : isNaturalOne ? 'is-natural-one' : ''} ${resolvedStateClass} ${selectable ? 'is-selectable' : ''} ${selectedForReroll ? 'is-reroll-selected' : ''}`,
      style: {
        '--die-index': index
      },
      role: selectable ? 'button' : undefined,
      tabIndex: selectable ? 0 : undefined,
      "aria-pressed": selectable ? selectedForReroll : undefined,
      "aria-label": selectable ? `${selectedForReroll ? 'No repetir' : 'Repetir'} d${die.sides} con resultado ${die.displayValue}` : undefined,
      onClick: toggleReroll,
      onKeyDown: event => {
        if (selectable && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          toggleReroll();
        }
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "dice-3d__aura",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("canvas", {
      ref: canvasRef,
      role: "img",
      "aria-label": `d${die.sides} con resultado ${die.displayValue}`
    }), isD20 && revealResult && /*#__PURE__*/React.createElement("span", {
      className: `dice-3d__result-number ${resultTone ? `is-${resultTone}` : ''}`,
      "aria-hidden": "true"
    }, die.displayValue), (isNaturalTwenty || isNaturalOne) && /*#__PURE__*/React.createElement("div", {
      className: `dice-3d__outcome-burst is-${resultTone}`,
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("div", null, Array.from({
      length: 12
    }, (_, rayIndex) => /*#__PURE__*/React.createElement("i", {
      key: rayIndex,
      style: {
        '--outcome-ray': `${rayIndex * 30}deg`,
        '--outcome-delay': `${450 + rayIndex * 34}ms`
      }
    }))), /*#__PURE__*/React.createElement("span", null, Array.from({
      length: 8
    }, (_, fragmentIndex) => /*#__PURE__*/React.createElement("b", {
      key: fragmentIndex,
      style: {
        '--fragment-angle': `${fragmentIndex * 45 + 12}deg`,
        '--fragment-delay': `${1480 + fragmentIndex * 58}ms`
      }
    })))), /*#__PURE__*/React.createElement("figcaption", null, /*#__PURE__*/React.createElement("span", null, die.percentileRole ? die.percentileRole : `d${die.sides}`), /*#__PURE__*/React.createElement("strong", null, resultVisible ? die.displayValue : '…'), selectedForReroll && /*#__PURE__*/React.createElement("em", {
      className: "is-reroll"
    }, "Repetir"), !selectedForReroll && resolvedStateVisible && die.state === 'selected' && resultVisible && /*#__PURE__*/React.createElement("em", null, "Usado"), !selectedForReroll && resolvedStateVisible && die.state === 'discarded' && resultVisible && /*#__PURE__*/React.createElement("em", null, "Descartado")));
  };
  const DiceResult = ({
    roll,
    phase,
    revealedModifiers
  }) => {
    const diceTerms = roll.terms.filter(term => term.type === 'dice');
    const showNatural = phase === 'natural' || phase === 'final';
    const showFinal = phase === 'final';
    return /*#__PURE__*/React.createElement("section", {
      className: `dice-result ${showFinal ? 'is-final' : ''} ${showNatural && roll.critical ? 'is-critical' : showNatural && roll.fumble ? 'is-fumble' : ''}`,
      "aria-live": "polite"
    }, /*#__PURE__*/React.createElement("div", {
      className: "dice-result__natural"
    }, /*#__PURE__*/React.createElement("small", null, roll.advantageMode ? roll.advantageMode === 'advantage' ? 'Resultado con ventaja' : 'Resultado con desventaja' : diceTerms.length === 1 && diceTerms[0].count === 1 ? 'Resultado natural' : 'Resultados de los dados'), showNatural ? /*#__PURE__*/React.createElement("div", null, diceTerms.map((term, termIndex) => /*#__PURE__*/React.createElement("span", {
      key: `term_${termIndex}`
    }, /*#__PURE__*/React.createElement("b", null, term.rolls.map((value, index) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: `${value}_${index}`
    }, /*#__PURE__*/React.createElement("i", {
      className: term.usedRollIndex === index ? 'is-used' : term.usedRollIndex !== null ? 'is-discarded' : ''
    }, value), index < term.rolls.length - 1 && /*#__PURE__*/React.createElement("em", null, "+")))), /*#__PURE__*/React.createElement("strong", null, term.advantageMode ? `Se usa ${term.rolls[term.usedRollIndex]}` : term.rolls.length > 1 ? `= ${term.subtotal}` : `d${term.sides}`)))) : /*#__PURE__*/React.createElement("strong", {
      className: "dice-result__waiting"
    }, "Determinando resultado…")), roll.modifiers.length > 0 && !roll.damageBreakdown?.length && /*#__PURE__*/React.createElement("div", {
      className: "dice-result__modifiers"
    }, roll.modifiers.map((modifier, index) => /*#__PURE__*/React.createElement("div", {
      key: `${modifier.label}_${index}`,
      className: index < revealedModifiers ? 'is-visible' : ''
    }, /*#__PURE__*/React.createElement("span", null, modifier.label), /*#__PURE__*/React.createElement("strong", null, modifier.value >= 0 ? '+' : '', modifier.value)))), showFinal && roll.damageBreakdown?.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "dice-result__breakdown"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", null, "Desglose de impactos"), /*#__PURE__*/React.createElement("small", null, roll.damageBreakdown.length, " partidas")), roll.damageBreakdown.map((group, index) => /*#__PURE__*/React.createElement("div", {
      key: `${group.label}_${index}`
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, group.label), /*#__PURE__*/React.createElement("small", null, group.formula, group.critical ? ' · crítico' : '')), /*#__PURE__*/React.createElement("b", null, group.total)))), /*#__PURE__*/React.createElement("div", {
      className: `dice-result__total ${showFinal ? 'is-visible' : ''}`
    }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("strong", {
      "aria-hidden": !showFinal
    }, showFinal ? roll.total : '—'), roll.difficultyClass !== null && /*#__PURE__*/React.createElement("em", null, "CD ", roll.difficultyClass)), showFinal && roll.success !== null && /*#__PURE__*/React.createElement("div", {
      className: `dice-result__outcome ${roll.success ? 'is-success' : 'is-failure'}`
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, roll.success ? '✦' : '◇'), /*#__PURE__*/React.createElement("strong", null, roll.success ? 'Éxito' : 'Fallo'), /*#__PURE__*/React.createElement("small", null, roll.total, " ", roll.success ? 'alcanza' : 'no alcanza', " la CD ", roll.difficultyClass)), showFinal && roll.critical && /*#__PURE__*/React.createElement("p", {
      className: "dice-result__special is-critical"
    }, /*#__PURE__*/React.createElement("span", null, "✦"), /*#__PURE__*/React.createElement("strong", null, "¡Crítico!"), /*#__PURE__*/React.createElement("small", null, "20 natural")), showFinal && roll.fumble && /*#__PURE__*/React.createElement("p", {
      className: "dice-result__special is-fumble"
    }, /*#__PURE__*/React.createElement("span", null, "◆"), /*#__PURE__*/React.createElement("strong", null, "¡Pifia!"), /*#__PURE__*/React.createElement("small", null, "1 natural")));
  };
  const DiceRollStage = ({
    roll,
    quick,
    reducedMotion,
    onClose,
    onRepeat,
    onRerollSelected,
    onAttackOutcome,
    onNewRoll
  }) => {
    const [phase, setPhase] = useState('rolling');
    const [phaseRollId, setPhaseRollId] = useState(roll.id);
    const [revealedModifiers, setRevealedModifiers] = useState(0);
    const [rerollSelection, setRerollSelection] = useState(() => new Set());
    const hasD20Suspense = roll.visualDice.some(die => Number(die.sides) === 20 && die.state !== 'discarded');
    useEffect(() => {
      setPhase('rolling');
      setPhaseRollId(roll.id);
      setRevealedModifiers(0);
      setRerollSelection(new Set());
      const base = reducedMotion ? 160 : hasD20Suspense ? quick ? 1220 : 2450 : quick ? 1020 : 2150;
      const rerolledGroups = new Set(Array.isArray(roll.rerolledGroupIds) ? roll.rerolledGroupIds : []);
      const animatedDiceIndexes = roll.visualDice.map((die, index) => !rerolledGroups.size || rerolledGroups.has(die.groupId) ? index : -1).filter(index => index >= 0);
      const lastAnimatedIndex = animatedDiceIndexes.length ? Math.max(...animatedDiceIndexes) : 0;
      const diceDelay = reducedMotion ? 0 : lastAnimatedIndex * (quick ? 45 : 105);
      const naturalAt = base + diceDelay;
      const revealDuration = reducedMotion || !hasD20Suspense ? 0 : quick ? 720 : 1250;
      const exceptionalHold = !reducedMotion && hasD20Suspense && (roll.critical || roll.fumble) ? quick ? 1150 : 2000 : 0;
      const resultAt = naturalAt + revealDuration + exceptionalHold;
      const visibleModifiers = roll.damageBreakdown?.length ? [] : roll.modifiers;
      const timers = hasD20Suspense ? [window.setTimeout(() => setPhase('revealing'), naturalAt), window.setTimeout(() => setPhase('natural'), resultAt)] : [window.setTimeout(() => setPhase('natural'), naturalAt)];
      visibleModifiers.forEach((modifier, index) => timers.push(window.setTimeout(() => setRevealedModifiers(index + 1), resultAt + (index + 1) * (reducedMotion ? 40 : quick ? 170 : 330))));
      const finalAt = resultAt + Math.max(1, visibleModifiers.length) * (reducedMotion ? 40 : quick ? 170 : 330) + (reducedMotion ? 40 : quick ? 150 : 300);
      timers.push(window.setTimeout(() => setPhase('final'), finalAt));
      return () => timers.forEach(timer => window.clearTimeout(timer));
    }, [roll.id, roll.modifiers.length, roll.visualDice.length, roll.damageBreakdown?.length, hasD20Suspense, quick, reducedMotion]);
    const toggleReroll = groupId => setRerollSelection(previous => {
      const next = new Set(previous);
      if (next.has(groupId)) next.delete(groupId);else next.add(groupId);
      return next;
    });
    const isAttackRoll = ['weapon-damage', 'spell-damage'].includes(roll.followUp?.type);
    const rerolledGroups = new Set(Array.isArray(roll.rerolledGroupIds) ? roll.rerolledGroupIds : []);
    const diceCountClass = roll.visualDice.length >= 7 ? 'is-many' : roll.visualDice.length >= 4 ? 'is-group' : roll.visualDice.length === 1 ? 'is-single' : '';
    const paletteStyle = roll.dicePalette ? {
      '--dice-accent-rgb': roll.dicePalette.join(',')
    } : undefined;
    const renderPhase = phaseRollId === roll.id ? phase : 'rolling';
    const resultRevealed = renderPhase !== 'rolling';
    return /*#__PURE__*/React.createElement("article", {
      className: `dice-stage ${renderPhase === 'final' ? 'is-complete' : ''} ${hasD20Suspense ? 'has-d20-suspense' : ''} ${resultRevealed && roll.critical ? 'is-critical' : resultRevealed && roll.fumble ? 'is-fumble' : ''}`,
      style: paletteStyle,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "dice-stage-title"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "dice-overlay__close",
      onClick: onClose,
      "aria-label": "Cerrar tirada"
    }, "×"), /*#__PURE__*/React.createElement("header", {
      className: "dice-stage__header"
    }, /*#__PURE__*/React.createElement("small", null, roll.rollType), /*#__PURE__*/React.createElement("h2", {
      id: "dice-stage-title"
    }, roll.label), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, roll.displayFormula || roll.formula), roll.advantageMode && /*#__PURE__*/React.createElement("span", null, roll.advantageMode === 'advantage' ? 'Ventaja' : 'Desventaja'), roll.difficultyClass !== null && /*#__PURE__*/React.createElement("span", null, "CD ", roll.difficultyClass), roll.rerollCount > 0 && /*#__PURE__*/React.createElement("span", null, "Repetición ", roll.rerollCount))), /*#__PURE__*/React.createElement("div", {
      className: `dice-stage__scene ${diceCountClass}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "dice-stage__sigil",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("div", {
      className: "dice-stage__dice"
    }, roll.visualDice.map((die, index) => {
      const rerollingDie = !rerolledGroups.size || rerolledGroups.has(die.groupId);
      const preserveSettledResult = rerolledGroups.size > 0 && !rerollingDie;
      return /*#__PURE__*/React.createElement(Dice3D, {
        key: die.id,
        die: {
          ...die,
          palette: roll.dicePalette
        },
        index: index,
        rolling: renderPhase === 'rolling' && rerollingDie,
        quick: quick,
        reducedMotion: reducedMotion,
        revealResult: resultRevealed || preserveSettledResult,
        revealSelectionState: renderPhase === 'natural' || renderPhase === 'final',
        selectable: renderPhase === 'final',
        selectedForReroll: rerollSelection.has(die.groupId),
        onToggleReroll: toggleReroll
      });
    })), renderPhase === 'final' && /*#__PURE__*/React.createElement("p", {
      className: "dice-stage__reroll-hint"
    }, "Toca uno o varios dados para repetirlos")), /*#__PURE__*/React.createElement(DiceResult, {
      roll: roll,
      phase: renderPhase,
      revealedModifiers: revealedModifiers
    }), renderPhase === 'final' && /*#__PURE__*/React.createElement("footer", {
      className: "dice-stage__actions"
    }, !isAttackRoll && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "is-new-roll",
      onClick: onNewRoll
    }, /*#__PURE__*/React.createElement("span", {
      className: "dice-stage__action-icon",
      "aria-hidden": "true"
    }, "＋"), /*#__PURE__*/React.createElement("strong", null, "Nueva tirada")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "is-repeat-all",
      onClick: onRepeat
    }, /*#__PURE__*/React.createElement("span", {
      className: "dice-stage__action-icon",
      "aria-hidden": "true"
    }, "↻"), /*#__PURE__*/React.createElement("strong", null, "Repetir todo")), rerollSelection.size > 0 && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "is-reroll",
      onClick: () => onRerollSelected?.([...rerollSelection])
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "⟳"), " Repetir ", rerollSelection.size === 1 ? 'dado' : `${rerollSelection.size} dados`), isAttackRoll && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "is-miss",
      onClick: () => onAttackOutcome?.(roll, false)
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◇"), " Falló"), isAttackRoll && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "is-primary is-follow-up",
      onClick: () => onAttackOutcome?.(roll, true)
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "✦"), " Impactó")));
  };
  const SheetRollPrompt = ({
    request,
    onCancel,
    onChoose
  }) => {
    const [useGuidance, setUseGuidance] = useState(false);
    const [targetLabel, setTargetLabel] = useState('');
    useEffect(() => setUseGuidance(false), [request]);
    useEffect(() => setTargetLabel(''), [request]);
    useEffect(() => {
      if (!request) return undefined;
      const handleKey = event => {
        if (event.key === 'Escape') onCancel?.();
        if (event.key === '1') onChoose?.('normal', {
          useGuidance,
          targetLabel
        });
        if (event.key === '2') onChoose?.('advantage', {
          useGuidance,
          targetLabel
        });
        if (event.key === '3') onChoose?.('disadvantage', {
          useGuidance,
          targetLabel
        });
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }, [request, onCancel, onChoose, useGuidance, targetLabel]);
    if (!request) return null;
    const choices = [['normal', 'Normal', '1d20', 'Una tirada'], ['advantage', 'Ventaja', '2d20', 'Conserva el mayor'], ['disadvantage', 'Desventaja', '2d20', 'Conserva el menor']];
    return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
      className: "sheet-roll-prompt",
      onMouseDown: event => {
        if (event.target === event.currentTarget) onCancel?.();
      }
    }, /*#__PURE__*/React.createElement("section", {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "sheet-roll-prompt-title"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "20"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, request.rollType || 'Tirada de la ficha'), /*#__PURE__*/React.createElement("h2", {
      id: "sheet-roll-prompt-title"
    }, request.label), /*#__PURE__*/React.createElement("p", null, request.displayFormula)), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onCancel,
      "aria-label": "Cancelar tirada"
    }, "×")), request.note && /*#__PURE__*/React.createElement("div", {
      className: `sheet-roll-prompt__note ${request.suggestedMode ? 'is-suggested' : ''}`
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, request.suggestedMode === 'disadvantage' ? '⚠' : '✦'), /*#__PURE__*/React.createElement("p", null, request.note)), request.targetPrompt && /*#__PURE__*/React.createElement("label", {
      className: "sheet-roll-prompt__target"
    }, /*#__PURE__*/React.createElement("span", null, "Objetivo de este ataque"), /*#__PURE__*/React.createElement("small", null, "Opcional · te ayuda a repartir rayos entre varias criaturas."), /*#__PURE__*/React.createElement("input", {
      value: targetLabel,
      onChange: event => setTargetLabel(event.target.value),
      placeholder: "Ej: Goblin del puente",
      maxLength: "50"
    })), request.allowGuidance && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: `sheet-roll-prompt__guidance ${useGuidance ? 'is-active' : ''}`,
      "aria-pressed": useGuidance,
      onClick: () => setUseGuidance(value => !value)
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "◇"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Guía disponible"), /*#__PURE__*/React.createElement("strong", null, useGuidance ? 'Se añadirá 1d4 a la tirada' : '¿Quieres utilizar Guía?'), /*#__PURE__*/React.createElement("p", null, "Solo se aplica a esta prueba de característica.")), /*#__PURE__*/React.createElement("b", null, useGuidance ? '✓' : '+1d4')), /*#__PURE__*/React.createElement("div", {
      className: "sheet-roll-prompt__choices",
      "aria-label": "Elige cómo realizar la tirada"
    }, choices.map(([mode, label, dice, help]) => /*#__PURE__*/React.createElement("button", {
      type: "button",
      key: mode,
      onClick: () => onChoose?.(mode, {
        useGuidance,
        targetLabel
      }),
      className: request.suggestedMode === mode ? 'is-suggested' : ''
    }, /*#__PURE__*/React.createElement("span", null, useGuidance ? `${dice}+1d4` : dice), /*#__PURE__*/React.createElement("strong", null, label), /*#__PURE__*/React.createElement("small", null, help), request.suggestedMode === mode && /*#__PURE__*/React.createElement("em", null, "Sugerida")))), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("p", null, "Elige una opción para lanzar. Tu ficha ya ha calculado los modificadores."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onCancel
    }, "Cancelar")))), document.body);
  };
  const AttackSequencePanel = ({
    sequence,
    attackOptions,
    error,
    onNextAttack,
    onRollDamage,
    onClose
  }) => {
    const attempts = Array.isArray(sequence?.attempts) ? sequence.attempts : [];
    const hits = attempts.filter(attempt => attempt.hit);
    const allAttackOptions = Array.isArray(sequence?.attackOptions) && sequence.attackOptions.length ? sequence.attackOptions : attackOptions;
    const availableAttackOptions = allAttackOptions.filter(option => !option.maxUses || attempts.filter(attempt => attempt.roll.followUp?.attackKey === option.id).length < option.maxUses);
    const [selectedAttackId, setSelectedAttackId] = useState(sequence?.lastAttackKey || availableAttackOptions[0]?.id || '');
    const [mode, setMode] = useState('normal');
    const [targetLabel, setTargetLabel] = useState('');
    const [sneakTargetId, setSneakTargetId] = useState('');
    const [extraFormula, setExtraFormula] = useState('');
    const [extraTargetId, setExtraTargetId] = useState('');
    const [formulaError, setFormulaError] = useState('');
    const sneakCandidates = hits.filter(attempt => attempt.roll.followUp?.sneakAttackFormula && attempt.roll.advantageMode !== 'disadvantage');
    useEffect(() => {
      if (!availableAttackOptions.some(option => option.id === selectedAttackId)) setSelectedAttackId(availableAttackOptions[0]?.id || '');
    }, [availableAttackOptions, selectedAttackId]);
    useEffect(() => {
      if (!hits.some(hit => hit.id === extraTargetId)) setExtraTargetId(hits[0]?.id || '');
      if (!sneakCandidates.some(hit => hit.id === sneakTargetId)) {
        const advantageHit = sneakCandidates.find(hit => hit.roll.advantageMode === 'advantage');
        setSneakTargetId(advantageHit?.id || '');
      }
    }, [attempts.length, extraTargetId, sneakTargetId]);
    const submitDamage = () => {
      let normalizedExtra = '';
      if (extraFormula.trim()) {
        try {
          normalizedExtra = parseDiceFormula(extraFormula).source;
        } catch (error) {
          setFormulaError(error.message || 'La fórmula de daño extra no es válida.');
          return;
        }
      }
      setFormulaError('');
      onRollDamage?.({
        sneakTargetId,
        extraFormula: normalizedExtra,
        extraTargetId
      });
    };
    const selectedOption = availableAttackOptions.find(option => option.id === selectedAttackId);
    const attackLimit = allAttackOptions.reduce((total, option) => total + (Number(option.maxUses) || 0), 0);
    return /*#__PURE__*/React.createElement("article", {
      className: "attack-sequence",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "attack-sequence-title"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "dice-overlay__close",
      onClick: onClose,
      "aria-label": "Cerrar secuencia de ataques"
    }, "×"), /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "⚔"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, sequence?.contextLabel || 'Resolución de combate'), /*#__PURE__*/React.createElement("h2", {
      id: "attack-sequence-title"
    }, sequence?.title || 'Ataques del turno'), /*#__PURE__*/React.createElement("p", null, "Reparte cada ataque, resuelve sus impactos y lanza todo el daño junto al final."))), /*#__PURE__*/React.createElement("div", {
      className: "attack-sequence__body"
    }, /*#__PURE__*/React.createElement("section", {
      className: "attack-sequence__attempts"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Historial temporal"), /*#__PURE__*/React.createElement("strong", null, attempts.length, " ", attempts.length === 1 ? 'ataque realizado' : 'ataques realizados')), /*#__PURE__*/React.createElement("span", null, hits.length, " ", hits.length === 1 ? 'impacto' : 'impactos')), /*#__PURE__*/React.createElement("div", null, attempts.map((attempt, index) => /*#__PURE__*/React.createElement("article", {
      key: attempt.id,
      className: attempt.hit ? 'is-hit' : 'is-miss'
    }, /*#__PURE__*/React.createElement("span", null, index + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, attempt.roll.label), /*#__PURE__*/React.createElement("small", null, attempt.roll.advantageMode === 'advantage' ? 'Ventaja' : attempt.roll.advantageMode === 'disadvantage' ? 'Desventaja' : 'Normal', " · total ", attempt.roll.total, attempt.roll.critical ? ' · crítico' : '')), /*#__PURE__*/React.createElement("b", null, attempt.hit ? 'Impactó' : 'Falló'))))), /*#__PURE__*/React.createElement("section", {
      className: "attack-sequence__next"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("small", null, "Continuar atacando"), /*#__PURE__*/React.createElement("strong", null, attackLimit ? `${Math.max(0, attackLimit - attempts.length)} ataques disponibles` : '¿Quieres realizar otro ataque?')), availableAttackOptions.length > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Ataque o acción"), /*#__PURE__*/React.createElement("select", {
      value: selectedAttackId,
      onChange: event => setSelectedAttackId(event.target.value)
    }, availableAttackOptions.map(option => /*#__PURE__*/React.createElement("option", {
      value: option.id,
      key: option.id
    }, option.weaponName, " · ", option.label)))), sequence?.allowTargets && /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Objetivo de este ataque"), /*#__PURE__*/React.createElement("input", {
      value: targetLabel,
      onChange: event => setTargetLabel(event.target.value),
      placeholder: "Ej: Goblin del puente",
      maxLength: "50"
    })), /*#__PURE__*/React.createElement("div", {
      className: "attack-sequence__modes",
      "aria-label": "Modo del siguiente ataque"
    }, [['normal', 'Normal'], ['advantage', 'Ventaja'], ['disadvantage', 'Desventaja']].map(([value, label]) => /*#__PURE__*/React.createElement("button", {
      type: "button",
      key: value,
      className: mode === value ? 'is-active' : '',
      onClick: () => setMode(value)
    }, label))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "attack-sequence__roll-next",
      disabled: !selectedOption,
      onClick: () => {
        if (selectedOption) {
          onNextAttack?.(selectedOption, mode, targetLabel.trim());
          setTargetLabel('');
        }
      }
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "20"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Añadir a la secuencia"), /*#__PURE__*/React.createElement("strong", null, "Tirar siguiente ataque")), /*#__PURE__*/React.createElement("b", null, "→"))) : /*#__PURE__*/React.createElement("p", {
      className: "attack-sequence__empty"
    }, attackLimit ? 'Ya has resuelto todos los ataques de este conjuro.' : 'Añade ataques con daño a tu Arsenal para continuar la secuencia.')), /*#__PURE__*/React.createElement("section", {
      className: "attack-sequence__damage"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("small", null, "Cuando hayas terminado"), /*#__PURE__*/React.createElement("strong", null, "Preparar todo el daño"), /*#__PURE__*/React.createElement("span", null, hits.length ? `${hits.length} impactos guardados` : 'Todavía sin impactos')), hits.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "attack-sequence__extras"
    }, sneakCandidates.length > 0 && /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Ataque furtivo"), /*#__PURE__*/React.createElement("small", null, "Una sola vez. Con una tirada normal confirmas que se cumplen las demás condiciones."), /*#__PURE__*/React.createElement("select", {
      value: sneakTargetId,
      onChange: event => setSneakTargetId(event.target.value)
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "No utilizar"), sneakCandidates.map((attempt, index) => /*#__PURE__*/React.createElement("option", {
      value: attempt.id,
      key: attempt.id
    }, attempt.roll.label, " · impacto ", attempts.indexOf(attempt) + 1, attempt.roll.critical ? ' · crítico' : '', " · ", attempt.roll.followUp.sneakAttackFormula)))), /*#__PURE__*/React.createElement("div", {
      className: "attack-sequence__custom-extra"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Dados extra opcionales"), /*#__PURE__*/React.createElement("small", null, "Para castigos, maniobras, venenos u otros efectos."), /*#__PURE__*/React.createElement("input", {
      value: extraFormula,
      onChange: event => {
        setExtraFormula(event.target.value);
        setFormulaError('');
      },
      placeholder: "Ej: 2d8",
      spellCheck: "false"
    })), extraFormula.trim() && /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Aplicar al impacto"), /*#__PURE__*/React.createElement("small", null, "Si ese ataque fue crítico, estos dados también se duplicarán."), /*#__PURE__*/React.createElement("select", {
      value: extraTargetId,
      onChange: event => setExtraTargetId(event.target.value)
    }, hits.map(attempt => /*#__PURE__*/React.createElement("option", {
      value: attempt.id,
      key: attempt.id
    }, attempt.roll.label, attempt.roll.critical ? ' · crítico' : ''))))), (formulaError || error) && /*#__PURE__*/React.createElement("p", {
      className: "attack-sequence__error",
      role: "alert"
    }, formulaError || error)), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "attack-sequence__roll-damage",
      disabled: !hits.length,
      onClick: submitDamage
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "✦"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Combinar todos los impactos"), /*#__PURE__*/React.createElement("strong", null, "Tirar daño total")), /*#__PURE__*/React.createElement("b", null, "→")), !hits.length && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "attack-sequence__finish-empty",
      onClick: onClose
    }, "Finalizar sin daño"))));
  };
  const DiceControls = ({
    onRoll,
    onClose,
    lastRequest,
    error
  }) => {
    const [pool, setPool] = useState([{
      sides: 20,
      count: 1
    }]);
    const [modifier, setModifier] = useState(0);
    const [formula, setFormula] = useState('1d20');
    const [label, setLabel] = useState('');
    const [rollType, setRollType] = useState('Tirada manual');
    const [difficultyClass, setDifficultyClass] = useState('');
    const [mode, setMode] = useState('normal');
    const [quick, setQuick] = useState(false);
    const updateBuilder = (nextPool, nextModifier = modifier) => {
      setPool(nextPool);
      setModifier(nextModifier);
      setFormula(formatDiceFormula(nextPool, nextModifier));
      if (!nextPool.some(group => group.sides === 20 && group.count === 1)) setMode('normal');
    };
    const addDie = sides => {
      const existing = pool.find(group => group.sides === sides);
      updateBuilder(existing ? pool.map(group => group.sides === sides ? {
        ...group,
        count: Math.min(20, group.count + 1)
      } : group) : [...pool, {
        sides,
        count: 1
      }]);
    };
    const changeCount = (sides, delta) => updateBuilder(pool.map(group => group.sides === sides ? {
      ...group,
      count: group.count + delta
    } : group).filter(group => group.count > 0));
    const editFormula = value => {
      setFormula(value);
      try {
        const parsed = parseDiceFormula(value);
        const nextPool = [];
        parsed.terms.filter(term => term.type === 'dice').forEach(term => {
          const existing = nextPool.find(group => group.sides === term.sides);
          if (existing) existing.count += term.count;else nextPool.push({
            sides: term.sides,
            count: term.count
          });
        });
        const nextModifier = parsed.terms.filter(term => term.type === 'modifier').reduce((sum, term) => sum + term.value, 0);
        setPool(nextPool);
        setModifier(nextModifier);
        if (!nextPool.some(group => group.sides === 20 && group.count === 1)) setMode('normal');
      } catch (formulaError) {}
    };
    const submit = event => {
      event.preventDefault();
      onRoll(formula, {
        label: label || 'Tirada manual',
        rollType,
        difficultyClass,
        advantage: mode === 'advantage',
        disadvantage: mode === 'disadvantage',
        fast: quick
      });
    };
    const canUseAdvantage = pool.some(group => group.sides === 20 && group.count === 1);
    return /*#__PURE__*/React.createElement("article", {
      className: "dice-controls",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "dice-controls-title"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "dice-overlay__close",
      onClick: onClose,
      "aria-label": "Cerrar lanzador de dados"
    }, "×"), /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
      className: "dice-controls__emblem",
      "aria-hidden": "true"
    }, "20"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Herramienta de sesión"), /*#__PURE__*/React.createElement("h2", {
      id: "dice-controls-title"
    }, "Lanzador de dados"), /*#__PURE__*/React.createElement("p", null, "Construye la fórmula y deja que los dados dicten el resultado."))), /*#__PURE__*/React.createElement("form", {
      onSubmit: submit
    }, /*#__PURE__*/React.createElement("section", {
      className: "dice-controls__builder"
    }, /*#__PURE__*/React.createElement("div", {
      className: "dice-controls__section-heading"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Reserva de dados"), /*#__PURE__*/React.createElement("strong", null, "Añadir dados")), /*#__PURE__*/React.createElement("span", null, pool.reduce((sum, group) => sum + group.count, 0), " dados")), /*#__PURE__*/React.createElement("div", {
      className: "dice-controls__types"
    }, SUPPORTED_DICE.map(sides => /*#__PURE__*/React.createElement("button", {
      type: "button",
      key: sides,
      onClick: () => addDie(sides)
    }, /*#__PURE__*/React.createElement("span", null, "d", sides), /*#__PURE__*/React.createElement("small", null, "Añadir")))), /*#__PURE__*/React.createElement("div", {
      className: "dice-controls__pool"
    }, pool.map(group => /*#__PURE__*/React.createElement("div", {
      key: group.sides
    }, /*#__PURE__*/React.createElement("span", null, "d", group.sides), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => changeCount(group.sides, -1),
      "aria-label": `Quitar un d${group.sides}`
    }, "−"), /*#__PURE__*/React.createElement("strong", null, group.count), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => changeCount(group.sides, 1),
      "aria-label": `Añadir un d${group.sides}`
    }, "+"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => updateBuilder(pool.filter(item => item.sides !== group.sides)),
      "aria-label": `Eliminar d${group.sides}`
    }, "×"))), !pool.length && /*#__PURE__*/React.createElement("p", null, "Añade al menos un dado."))), /*#__PURE__*/React.createElement("section", {
      className: "dice-controls__formula"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Fórmula"), /*#__PURE__*/React.createElement("small", null, "Puedes escribir combinaciones como 1d8+2d6+5"), /*#__PURE__*/React.createElement("input", {
      value: formula,
      onChange: event => editFormula(event.target.value),
      spellCheck: "false",
      inputMode: "text"
    })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Modificador total"), /*#__PURE__*/React.createElement("small", null, "Se incorpora a la fórmula"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      value: modifier,
      onChange: event => {
        const value = event.target.value === '' ? 0 : Math.trunc(Number(event.target.value) || 0);
        updateBuilder(pool, value);
      }
    }))), /*#__PURE__*/React.createElement("section", {
      className: "dice-controls__context"
    }, /*#__PURE__*/React.createElement("div", {
      className: "dice-controls__section-heading"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Presentación"), /*#__PURE__*/React.createElement("strong", null, "Contexto de la tirada"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Nombre opcional"), /*#__PURE__*/React.createElement("input", {
      value: label,
      onChange: event => setLabel(event.target.value),
      placeholder: "Ej: Sigilo",
      maxLength: "60"
    })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Tipo de prueba"), /*#__PURE__*/React.createElement("select", {
      value: rollType,
      onChange: event => setRollType(event.target.value)
    }, /*#__PURE__*/React.createElement("option", null, "Tirada manual"), /*#__PURE__*/React.createElement("option", null, "Prueba de característica"), /*#__PURE__*/React.createElement("option", null, "Tirada de salvación"), /*#__PURE__*/React.createElement("option", null, "Ataque"), /*#__PURE__*/React.createElement("option", null, "Daño"), /*#__PURE__*/React.createElement("option", null, "Iniciativa"), /*#__PURE__*/React.createElement("option", null, "Curación"))), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Dificultad / CD"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      value: difficultyClass,
      onChange: event => setDifficultyClass(event.target.value),
      placeholder: "Opcional"
    })))), /*#__PURE__*/React.createElement("section", {
      className: "dice-controls__options"
    }, /*#__PURE__*/React.createElement("div", {
      className: "dice-controls__roll-mode",
      "aria-label": "Modo de tirada"
    }, [['normal', 'Normal'], ['advantage', 'Ventaja'], ['disadvantage', 'Desventaja']].map(([value, text]) => /*#__PURE__*/React.createElement("button", {
      type: "button",
      key: value,
      disabled: value !== 'normal' && !canUseAdvantage,
      className: mode === value ? 'is-selected' : '',
      onClick: () => setMode(value)
    }, text))), /*#__PURE__*/React.createElement("label", {
      className: "dice-controls__quick"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: quick,
      onChange: event => setQuick(event.target.checked)
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Animación rápida"), /*#__PURE__*/React.createElement("small", null, "Reduce el suspense sin omitir el resultado.")))), error && /*#__PURE__*/React.createElement("p", {
      className: "dice-controls__error",
      role: "alert"
    }, /*#__PURE__*/React.createElement("span", null, "!"), error), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => lastRequest && onRoll(lastRequest.formula, lastRequest.options),
      disabled: !lastRequest
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "↻"), " Última tirada"), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "is-primary",
      disabled: !pool.length
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "✦"), " Tirar ", formula))));
  };
  const DiceRoller = ({
    open,
    onClose,
    attackOptions = []
  }) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [activeRoll, setActiveRoll] = useState(null);
    const [lastRequest, setLastRequest] = useState(null);
    const [attackSequence, setAttackSequence] = useState(null);
    const [error, setError] = useState('');
    const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false);
    const executeRoll = useCallback((formula, options = {}) => {
      try {
        const result = calculateDiceRoll(formula, options);
        setError('');
        setLastRequest({
          formula,
          options: {
            ...options
          }
        });
        setActiveRoll(result);
        setInternalOpen(true);
        return result;
      } catch (rollError) {
        setError(rollError.message || 'No se pudo preparar la tirada.');
        setActiveRoll(null);
        setInternalOpen(true);
        return null;
      }
    }, []);
    const rerollSelected = useCallback(groupIds => {
      try {
        setError('');
        setActiveRoll(current => current ? rerollDiceResult(current, groupIds) : current);
      } catch (rollError) {
        setError(rollError.message || 'No se pudieron repetir los dados seleccionados.');
      }
    }, []);
    const recordAttackOutcome = useCallback((attackRoll, hit) => {
      if (!attackRoll?.followUp) return;
      const attempt = {
        id: `attack_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        hit: hit === true,
        roll: attackRoll
      };
      setAttackSequence(previous => ({
        id: previous?.id || `sequence_${Date.now()}`,
        attempts: [...(previous?.attempts || []), attempt],
        lastAttackKey: attackRoll.followUp.attackKey || previous?.lastAttackKey || '',
        attackOptions: previous?.attackOptions || attackRoll.followUp.sequenceOptions || null,
        allowTargets: previous?.allowTargets || attackRoll.followUp.allowTargets === true,
        contextLabel: previous?.contextLabel || attackRoll.followUp.contextLabel || '',
        title: previous?.title || attackRoll.followUp.sequenceTitle || '',
        dicePalette: previous?.dicePalette || attackRoll.dicePalette || null
      }));
      setActiveRoll(null);
      setError('');
      setInternalOpen(true);
    }, []);
    const rollNextSequenceAttack = useCallback((option, mode, targetLabel = '') => {
      if (!option?.formula || !option?.options) return;
      const attackNumber = (attackSequence?.attempts || []).filter(attempt => attempt.roll.followUp?.attackKey === option.id).length + 1;
      const baseLabel = option.sequenceLabel || option.options.label;
      const label = `${baseLabel}${option.maxUses ? ` ${attackNumber}` : ''}${targetLabel ? ` → ${targetLabel}` : ''}`;
      executeRoll(option.formula, {
        ...option.options,
        label,
        advantage: mode === 'advantage',
        disadvantage: mode === 'disadvantage',
        followUp: {
          ...option.options.followUp,
          targetLabel
        }
      });
    }, [attackSequence, executeRoll]);
    const rollSequenceDamage = useCallback(({
      sneakTargetId = '',
      extraFormula = '',
      extraTargetId = ''
    } = {}) => {
      const hits = (attackSequence?.attempts || []).filter(attempt => attempt.hit && attempt.roll.followUp?.formula);
      if (!hits.length) return;
      try {
        const formulas = [];
        const modifiers = [];
        const damageGroups = [];
        const addDamageGroup = ({
          label,
          formula,
          groupModifiers = [],
          critical = false,
          extra = false
        }) => {
          const resolvedFormula = critical ? doubleDiceFormula(formula) : formula;
          const parsed = parseDiceFormula(resolvedFormula);
          const modifierTotal = groupModifiers.reduce((sum, modifier) => sum + (Number(modifier.value) || 0), 0);
          formulas.push(resolvedFormula);
          groupModifiers.forEach(modifier => modifiers.push({
            ...modifier,
            label: `${label} · ${modifier.label}`
          }));
          damageGroups.push({
            label,
            formula: `${resolvedFormula}${modifierTotal ? `${modifierTotal > 0 ? '+' : ''}${modifierTotal}` : ''}`,
            termCount: parsed.terms.length,
            modifierTotal,
            critical,
            extra
          });
        };
        hits.forEach(attempt => addDamageGroup({
          label: attempt.roll.label,
          formula: attempt.roll.followUp.formula,
          groupModifiers: Array.isArray(attempt.roll.followUp.modifiers) ? attempt.roll.followUp.modifiers : [],
          critical: attempt.roll.critical
        }));
        const sneakTarget = hits.find(attempt => attempt.id === sneakTargetId && attempt.roll.advantageMode !== 'disadvantage');
        if (sneakTarget?.roll.followUp.sneakAttackFormula) addDamageGroup({
          label: `Ataque furtivo · ${sneakTarget.roll.label}`,
          formula: sneakTarget.roll.followUp.sneakAttackFormula,
          critical: sneakTarget.roll.critical,
          extra: true
        });
        const extraTarget = hits.find(attempt => attempt.id === extraTargetId) || hits[0];
        if (extraFormula) addDamageGroup({
          label: `Daño extra · ${extraTarget.roll.label}`,
          formula: extraFormula,
          critical: extraTarget.roll.critical,
          extra: true
        });
        const combinedFormula = formulas.join('+');
        const displayFormula = damageGroups.map(group => group.formula).join(' + ');
        const result = executeRoll(combinedFormula, {
          label: `Daño total · ${hits.length} ${hits.length === 1 ? 'impacto' : 'impactos'}`,
          rollType: 'Daño combinado',
          modifiers,
          displayFormula,
          damageGroups,
          dicePalette: attackSequence?.dicePalette,
          fast: !!lastRequest?.options?.fast
        });
        if (result) setAttackSequence(null);
      } catch (rollError) {
        setError(rollError.message || 'No se pudo preparar el daño conjunto.');
      }
    }, [attackSequence, executeRoll, lastRequest]);
    const close = useCallback(() => {
      setActiveRoll(null);
      setAttackSequence(null);
      setInternalOpen(false);
      setError('');
      onClose?.();
    }, [onClose]);
    const newRoll = () => {
      setActiveRoll(null);
      setAttackSequence(null);
      setInternalOpen(true);
      setError('');
    };
    useEffect(() => {
      if (open) {
        setInternalOpen(true);
        setActiveRoll(null);
        setAttackSequence(null);
        setError('');
      }
    }, [open]);
    useEffect(() => {
      const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (!media) return undefined;
      const update = event => setReducedMotion(event.matches);
      media.addEventListener?.('change', update);
      return () => media.removeEventListener?.('change', update);
    }, []);
    useEffect(() => {
      const previousRollDice = window.rollDice;
      const previousOpenDiceRoller = window.openDiceRoller;
      window.rollDice = executeRoll;
      window.openDiceRoller = () => {
        setActiveRoll(null);
        setAttackSequence(null);
        setError('');
        setInternalOpen(true);
      };
      window.DndDice = Object.freeze({
        rollDice: executeRoll,
        open: window.openDiceRoller
      });
      return () => {
        if (window.rollDice === executeRoll) window.rollDice = previousRollDice;
        if (window.openDiceRoller === window.DndDice?.open) window.openDiceRoller = previousOpenDiceRoller;
        delete window.DndDice;
      };
    }, [executeRoll]);
    useEffect(() => {
      if (!internalOpen && !open) return undefined;
      const handleKey = event => {
        if (event.key === 'Escape') close();
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }, [internalOpen, open, close]);
    if (!internalOpen && !open) return null;
    return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
      className: `dice-overlay ${activeRoll ? 'is-rolling' : attackSequence ? 'is-sequence' : 'is-builder'}`,
      onMouseDown: event => {
        if (event.target === event.currentTarget && !activeRoll) close();
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "dice-overlay__atmosphere",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), activeRoll ? /*#__PURE__*/React.createElement(DiceRollStage, {
      roll: activeRoll,
      quick: !!lastRequest?.options?.fast,
      reducedMotion: reducedMotion,
      onClose: close,
      onNewRoll: newRoll,
      onRepeat: () => executeRoll(lastRequest.formula, lastRequest.options),
      onRerollSelected: rerollSelected,
      onAttackOutcome: recordAttackOutcome
    }) : attackSequence ? /*#__PURE__*/React.createElement(AttackSequencePanel, {
      sequence: attackSequence,
      attackOptions: attackOptions,
      error: error,
      onNextAttack: rollNextSequenceAttack,
      onRollDamage: rollSequenceDamage,
      onClose: close
    }) : /*#__PURE__*/React.createElement(DiceControls, {
      onRoll: executeRoll,
      onClose: close,
      lastRequest: lastRequest,
      error: error
    })), document.body);
  };
  window.DndDiceComponents = Object.freeze({
    DiceRoller,
    Dice3D,
    DiceControls,
    DiceResult,
    SheetRollPrompt
  });
})();