const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { SUPPORTED_DICE, parseDiceFormula, formatDiceFormula, doubleDiceFormula, rollDice: calculateDiceRoll, rerollDiceResult } = window.DndDiceEngine;
const { getGeometry, getAnimatedQuaternion, drawDie } = window.DndDice3D;

const Dice3D = ({ die, index = 0, rolling = true, quick = false, reducedMotion = false, selectable = false, selectedForReroll = false, onToggleReroll }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const [settled, setSettled] = useState(false);
    const geometry = useMemo(() => getGeometry(die.sides), [die.sides]);
    const seed = useMemo(() => [...String(die.id)].reduce((sum, character) => sum + character.charCodeAt(0), 11 + index * 7), [die.id, index]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
        if (!context) return undefined;
        let active = true;
        const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
        const pixelRatio = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 2);
        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const width = Math.max(1, Math.round(rect.width * pixelRatio));
            const height = Math.max(1, Math.round(rect.height * pixelRatio));
            if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
        };
        resize();
        if (window.ResizeObserver) {
            resizeObserverRef.current = new ResizeObserver(resize);
            resizeObserverRef.current.observe(canvas);
        } else window.addEventListener('resize', resize);

        setSettled(false);
        const startedAt = performance.now();
        const duration = reducedMotion ? 140 : quick ? 680 + index * 45 : 1650 + index * 105;
        const render = now => {
            if (!active) return;
            resize();
            const progress = rolling ? Math.max(0, Math.min(1, (now - startedAt) / duration)) : 1;
            const rotation = getAnimatedQuaternion(geometry, die.result, progress, seed);
            drawDie(context, geometry, rotation, { result: die.result, faceLabels: die.faceLabels, settled: progress >= .995 });
            if (progress < 1) animationRef.current = window.requestAnimationFrame(render);
            else { setSettled(true); animationRef.current = null; }
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
    }, [die.id, die.result, die.faceLabels, geometry, index, quick, reducedMotion, rolling, seed]);

    const toggleReroll = () => { if (selectable) onToggleReroll?.(die.groupId); };
    return <figure
        className={`dice-3d ${settled ? 'is-settled' : 'is-rolling'} ${die.state === 'selected' ? 'is-selected' : die.state === 'discarded' ? 'is-discarded' : ''} ${selectable ? 'is-selectable' : ''} ${selectedForReroll ? 'is-reroll-selected' : ''}`}
        style={{ '--die-index': index }}
        role={selectable ? 'button' : undefined}
        tabIndex={selectable ? 0 : undefined}
        aria-pressed={selectable ? selectedForReroll : undefined}
        aria-label={selectable ? `${selectedForReroll ? 'No repetir' : 'Repetir'} d${die.sides} con resultado ${die.displayValue}` : undefined}
        onClick={toggleReroll}
        onKeyDown={event => { if (selectable && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); toggleReroll(); } }}
    >
        <div className="dice-3d__aura" aria-hidden="true" />
        <canvas ref={canvasRef} role="img" aria-label={`d${die.sides} con resultado ${die.displayValue}`} />
        <figcaption><span>{die.percentileRole ? die.percentileRole : `d${die.sides}`}</span><strong>{settled ? die.displayValue : '…'}</strong>{selectedForReroll && <em className="is-reroll">Repetir</em>}{!selectedForReroll && die.state === 'selected' && settled && <em>Usado</em>}{!selectedForReroll && die.state === 'discarded' && settled && <em>Descartado</em>}</figcaption>
    </figure>;
};

const DiceResult = ({ roll, phase, revealedModifiers }) => {
    const diceTerms = roll.terms.filter(term => term.type === 'dice');
    const showNatural = phase !== 'rolling';
    const showFinal = phase === 'final';
    return <section className={`dice-result ${showFinal ? 'is-final' : ''} ${roll.critical ? 'is-critical' : roll.fumble ? 'is-fumble' : ''}`} aria-live="polite">
        <div className="dice-result__natural">
            <small>{roll.advantageMode ? roll.advantageMode === 'advantage' ? 'Resultado con ventaja' : 'Resultado con desventaja' : diceTerms.length === 1 && diceTerms[0].count === 1 ? 'Resultado natural' : 'Resultados de los dados'}</small>
            {showNatural ? <div>{diceTerms.map((term, termIndex) => <span key={`term_${termIndex}`}><b>{term.rolls.map((value, index) => <React.Fragment key={`${value}_${index}`}><i className={term.usedRollIndex === index ? 'is-used' : term.usedRollIndex !== null ? 'is-discarded' : ''}>{value}</i>{index < term.rolls.length - 1 && <em>+</em>}</React.Fragment>)}</b><strong>{term.advantageMode ? `Se usa ${term.rolls[term.usedRollIndex]}` : term.rolls.length > 1 ? `= ${term.subtotal}` : `d${term.sides}`}</strong></span>)}</div> : <strong className="dice-result__waiting">Determinando resultado…</strong>}
        </div>
        {roll.modifiers.length > 0 && <div className="dice-result__modifiers">{roll.modifiers.map((modifier, index) => <div key={`${modifier.label}_${index}`} className={index < revealedModifiers ? 'is-visible' : ''}><span>{modifier.label}</span><strong>{modifier.value >= 0 ? '+' : ''}{modifier.value}</strong></div>)}</div>}
        <div className={`dice-result__total ${showFinal ? 'is-visible' : ''}`}><span>Total</span><strong>{roll.total}</strong>{roll.difficultyClass !== null && <em>CD {roll.difficultyClass}</em>}</div>
        {showFinal && roll.success !== null && <div className={`dice-result__outcome ${roll.success ? 'is-success' : 'is-failure'}`}><span aria-hidden="true">{roll.success ? '✦' : '◇'}</span><strong>{roll.success ? 'Éxito' : 'Fallo'}</strong><small>{roll.total} {roll.success ? 'alcanza' : 'no alcanza'} la CD {roll.difficultyClass}</small></div>}
        {showFinal && roll.critical && <p className="dice-result__special is-critical"><span>✦</span> 20 natural</p>}
        {showFinal && roll.fumble && <p className="dice-result__special is-fumble"><span>◇</span> 1 natural</p>}
    </section>;
};

const DiceRollStage = ({ roll, quick, reducedMotion, onClose, onRepeat, onRerollSelected, onFollowUp, onNewRoll }) => {
    const [phase, setPhase] = useState('rolling');
    const [revealedModifiers, setRevealedModifiers] = useState(0);
    const [rerollSelection, setRerollSelection] = useState(() => new Set());
    useEffect(() => {
        setPhase('rolling');
        setRevealedModifiers(0);
        setRerollSelection(new Set());
        const base = reducedMotion ? 160 : quick ? 820 : 1850;
        const diceDelay = reducedMotion ? 0 : Math.max(0, roll.visualDice.length - 1) * (quick ? 45 : 105);
        const naturalAt = base + diceDelay;
        const timers = [window.setTimeout(() => setPhase('natural'), naturalAt)];
        roll.modifiers.forEach((modifier, index) => timers.push(window.setTimeout(() => setRevealedModifiers(index + 1), naturalAt + (index + 1) * (reducedMotion ? 40 : quick ? 170 : 330))));
        const finalAt = naturalAt + Math.max(1, roll.modifiers.length) * (reducedMotion ? 40 : quick ? 170 : 330) + (reducedMotion ? 40 : quick ? 150 : 300);
        timers.push(window.setTimeout(() => setPhase('final'), finalAt));
        return () => timers.forEach(timer => window.clearTimeout(timer));
    }, [roll.id, roll.modifiers.length, roll.visualDice.length, quick, reducedMotion]);

    const toggleReroll = groupId => setRerollSelection(previous => {
        const next = new Set(previous);
        if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
        return next;
    });
    const includesSneakAttack = roll.advantageMode === 'advantage' && !!roll.followUp?.sneakAttackFormula;
    const diceCountClass = roll.visualDice.length >= 7 ? 'is-many' : roll.visualDice.length >= 4 ? 'is-group' : roll.visualDice.length === 1 ? 'is-single' : '';
    return <article className={`dice-stage ${phase === 'final' ? 'is-complete' : ''} ${roll.critical ? 'is-critical' : roll.fumble ? 'is-fumble' : ''}`} role="dialog" aria-modal="true" aria-labelledby="dice-stage-title">
        <button type="button" className="dice-overlay__close" onClick={onClose} aria-label="Cerrar tirada">×</button>
        <header className="dice-stage__header"><small>{roll.rollType}</small><h2 id="dice-stage-title">{roll.label}</h2><div><span>{roll.displayFormula || roll.formula}</span>{roll.advantageMode && <span>{roll.advantageMode === 'advantage' ? 'Ventaja' : 'Desventaja'}</span>}{roll.difficultyClass !== null && <span>CD {roll.difficultyClass}</span>}{roll.rerollCount > 0 && <span>Repetición {roll.rerollCount}</span>}</div></header>
        <div className={`dice-stage__scene ${diceCountClass}`}><div className="dice-stage__sigil" aria-hidden="true"><i /><i /><i /></div><div className="dice-stage__dice">{roll.visualDice.map((die, index) => <Dice3D key={die.id} die={die} index={index} rolling={phase === 'rolling'} quick={quick} reducedMotion={reducedMotion} selectable={phase === 'final'} selectedForReroll={rerollSelection.has(die.groupId)} onToggleReroll={toggleReroll} />)}</div>{phase === 'final' && <p className="dice-stage__reroll-hint">Toca uno o varios dados para repetirlos</p>}</div>
        <DiceResult roll={roll} phase={phase} revealedModifiers={revealedModifiers} />
        {phase === 'final' && <footer className="dice-stage__actions">
            <button type="button" onClick={onNewRoll}>Nueva tirada</button>
            <button type="button" onClick={onRepeat}><span aria-hidden="true">↻</span> Repetir todo</button>
            {rerollSelection.size > 0 && <button type="button" className="is-reroll" onClick={() => onRerollSelected?.([...rerollSelection])}><span aria-hidden="true">⟳</span> Repetir {rerollSelection.size === 1 ? 'dado' : `${rerollSelection.size} dados`}</button>}
            {roll.followUp?.type === 'weapon-damage' && <button type="button" className="is-primary is-follow-up" onClick={() => onFollowUp?.(roll)}><span aria-hidden="true">✦</span> {includesSneakAttack ? `Impactó · Daño + furtivo (${roll.followUp.sneakAttackFormula})` : 'Impactó · Tirar daño'}</button>}
        </footer>}
    </article>;
};

const SheetRollPrompt = ({ request, onCancel, onChoose }) => {
    const [useGuidance, setUseGuidance] = useState(false);
    useEffect(() => setUseGuidance(false), [request]);
    useEffect(() => {
        if (!request) return undefined;
        const handleKey = event => {
            if (event.key === 'Escape') onCancel?.();
            if (event.key === '1') onChoose?.('normal', { useGuidance });
            if (event.key === '2') onChoose?.('advantage', { useGuidance });
            if (event.key === '3') onChoose?.('disadvantage', { useGuidance });
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [request, onCancel, onChoose, useGuidance]);

    if (!request) return null;
    const choices = [
        ['normal', 'Normal', '1d20', 'Una tirada'],
        ['advantage', 'Ventaja', '2d20', 'Conserva el mayor'],
        ['disadvantage', 'Desventaja', '2d20', 'Conserva el menor']
    ];
    return ReactDOM.createPortal(<div className="sheet-roll-prompt" onMouseDown={event => { if (event.target === event.currentTarget) onCancel?.(); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="sheet-roll-prompt-title">
            <header><span aria-hidden="true">20</span><div><small>{request.rollType || 'Tirada de la ficha'}</small><h2 id="sheet-roll-prompt-title">{request.label}</h2><p>{request.displayFormula}</p></div><button type="button" onClick={onCancel} aria-label="Cancelar tirada">×</button></header>
            {request.note && <div className={`sheet-roll-prompt__note ${request.suggestedMode ? 'is-suggested' : ''}`}><span aria-hidden="true">{request.suggestedMode === 'disadvantage' ? '⚠' : '✦'}</span><p>{request.note}</p></div>}
            {request.allowGuidance && <button type="button" className={`sheet-roll-prompt__guidance ${useGuidance ? 'is-active' : ''}`} aria-pressed={useGuidance} onClick={() => setUseGuidance(value => !value)}><span aria-hidden="true">◇</span><div><small>Guía disponible</small><strong>{useGuidance ? 'Se añadirá 1d4 a la tirada' : '¿Quieres utilizar Guía?'}</strong><p>Solo se aplica a esta prueba de característica.</p></div><b>{useGuidance ? '✓' : '+1d4'}</b></button>}
            <div className="sheet-roll-prompt__choices" aria-label="Elige cómo realizar la tirada">
                {choices.map(([mode, label, dice, help]) => <button type="button" key={mode} onClick={() => onChoose?.(mode, { useGuidance })} className={request.suggestedMode === mode ? 'is-suggested' : ''}><span>{useGuidance ? `${dice}+1d4` : dice}</span><strong>{label}</strong><small>{help}</small>{request.suggestedMode === mode && <em>Sugerida</em>}</button>)}
            </div>
            <footer><p>Elige una opción para lanzar. Tu ficha ya ha calculado los modificadores.</p><button type="button" onClick={onCancel}>Cancelar</button></footer>
        </section>
    </div>, document.body);
};

const DiceControls = ({ onRoll, onClose, lastRequest, error }) => {
    const [pool, setPool] = useState([{ sides: 20, count: 1 }]);
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
        updateBuilder(existing ? pool.map(group => group.sides === sides ? { ...group, count: Math.min(20, group.count + 1) } : group) : [...pool, { sides, count: 1 }]);
    };
    const changeCount = (sides, delta) => updateBuilder(pool.map(group => group.sides === sides ? { ...group, count: group.count + delta } : group).filter(group => group.count > 0));
    const editFormula = value => {
        setFormula(value);
        try {
            const parsed = parseDiceFormula(value);
            const nextPool = [];
            parsed.terms.filter(term => term.type === 'dice').forEach(term => {
                const existing = nextPool.find(group => group.sides === term.sides);
                if (existing) existing.count += term.count; else nextPool.push({ sides: term.sides, count: term.count });
            });
            const nextModifier = parsed.terms.filter(term => term.type === 'modifier').reduce((sum, term) => sum + term.value, 0);
            setPool(nextPool);
            setModifier(nextModifier);
            if (!nextPool.some(group => group.sides === 20 && group.count === 1)) setMode('normal');
        } catch (formulaError) {}
    };
    const submit = event => {
        event.preventDefault();
        onRoll(formula, { label: label || 'Tirada manual', rollType, difficultyClass, advantage: mode === 'advantage', disadvantage: mode === 'disadvantage', fast: quick });
    };
    const canUseAdvantage = pool.some(group => group.sides === 20 && group.count === 1);

    return <article className="dice-controls" role="dialog" aria-modal="true" aria-labelledby="dice-controls-title">
        <button type="button" className="dice-overlay__close" onClick={onClose} aria-label="Cerrar lanzador de dados">×</button>
        <header><span className="dice-controls__emblem" aria-hidden="true">20</span><div><small>Herramienta de sesión</small><h2 id="dice-controls-title">Lanzador de dados</h2><p>Construye la fórmula y deja que los dados dicten el resultado.</p></div></header>
        <form onSubmit={submit}>
            <section className="dice-controls__builder"><div className="dice-controls__section-heading"><div><small>Reserva de dados</small><strong>Añadir dados</strong></div><span>{pool.reduce((sum, group) => sum + group.count, 0)} dados</span></div><div className="dice-controls__types">{SUPPORTED_DICE.map(sides => <button type="button" key={sides} onClick={() => addDie(sides)}><span>d{sides}</span><small>Añadir</small></button>)}</div><div className="dice-controls__pool">{pool.map(group => <div key={group.sides}><span>d{group.sides}</span><button type="button" onClick={() => changeCount(group.sides,-1)} aria-label={`Quitar un d${group.sides}`}>−</button><strong>{group.count}</strong><button type="button" onClick={() => changeCount(group.sides,1)} aria-label={`Añadir un d${group.sides}`}>+</button><button type="button" onClick={() => updateBuilder(pool.filter(item => item.sides !== group.sides))} aria-label={`Eliminar d${group.sides}`}>×</button></div>)}{!pool.length && <p>Añade al menos un dado.</p>}</div></section>
            <section className="dice-controls__formula"><label><span>Fórmula</span><small>Puedes escribir combinaciones como 1d8+2d6+5</small><input value={formula} onChange={event => editFormula(event.target.value)} spellCheck="false" inputMode="text" /></label><label><span>Modificador total</span><small>Se incorpora a la fórmula</small><input type="number" value={modifier} onChange={event => { const value = event.target.value === '' ? 0 : Math.trunc(Number(event.target.value) || 0); updateBuilder(pool,value); }} /></label></section>
            <section className="dice-controls__context"><div className="dice-controls__section-heading"><div><small>Presentación</small><strong>Contexto de la tirada</strong></div></div><div><label><span>Nombre opcional</span><input value={label} onChange={event => setLabel(event.target.value)} placeholder="Ej: Sigilo" maxLength="60" /></label><label><span>Tipo de prueba</span><select value={rollType} onChange={event => setRollType(event.target.value)}><option>Tirada manual</option><option>Prueba de característica</option><option>Tirada de salvación</option><option>Ataque</option><option>Daño</option><option>Iniciativa</option><option>Curación</option></select></label><label><span>Dificultad / CD</span><input type="number" min="0" value={difficultyClass} onChange={event => setDifficultyClass(event.target.value)} placeholder="Opcional" /></label></div></section>
            <section className="dice-controls__options"><div className="dice-controls__roll-mode" aria-label="Modo de tirada">{[['normal','Normal'],['advantage','Ventaja'],['disadvantage','Desventaja']].map(([value,text]) => <button type="button" key={value} disabled={value !== 'normal' && !canUseAdvantage} className={mode === value ? 'is-selected' : ''} onClick={() => setMode(value)}>{text}</button>)}</div><label className="dice-controls__quick"><input type="checkbox" checked={quick} onChange={event => setQuick(event.target.checked)} /><span><i /></span><div><strong>Animación rápida</strong><small>Reduce el suspense sin omitir el resultado.</small></div></label></section>
            {error && <p className="dice-controls__error" role="alert"><span>!</span>{error}</p>}
            <footer><button type="button" onClick={() => lastRequest && onRoll(lastRequest.formula,lastRequest.options)} disabled={!lastRequest}><span aria-hidden="true">↻</span> Última tirada</button><button type="submit" className="is-primary" disabled={!pool.length}><span aria-hidden="true">✦</span> Tirar {formula}</button></footer>
        </form>
    </article>;
};

const DiceRoller = ({ open, onClose }) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [activeRoll, setActiveRoll] = useState(null);
    const [lastRequest, setLastRequest] = useState(null);
    const [error, setError] = useState('');
    const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false);

    const executeRoll = useCallback((formula, options = {}) => {
        try {
            const result = calculateDiceRoll(formula, options);
            setError('');
            setLastRequest({ formula, options: { ...options } });
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
    const executeFollowUp = useCallback(attackRoll => {
        const followUp = attackRoll?.followUp;
        if (!followUp?.formula) return;
        try {
            const includeSneakAttack = attackRoll.advantageMode === 'advantage' && !!followUp.sneakAttackFormula;
            const combinedFormula = [followUp.formula, includeSneakAttack ? followUp.sneakAttackFormula : ''].filter(Boolean).join('+');
            const damageFormula = attackRoll.critical ? doubleDiceFormula(combinedFormula) : combinedFormula;
            const modifiers = Array.isArray(followUp.modifiers) ? followUp.modifiers : [];
            const modifierTotal = modifiers.reduce((total, modifier) => total + (Number(modifier.value) || 0), 0);
            executeRoll(damageFormula, {
                label: `${followUp.label || 'Daño'}${includeSneakAttack ? ' + Ataque furtivo' : ''}${attackRoll.critical ? ' · Crítico' : ''}`,
                rollType: 'Daño',
                modifiers,
                displayFormula: `${damageFormula}${modifierTotal ? `${modifierTotal > 0 ? '+' : ''}${modifierTotal}` : ''}`,
                fast: !!lastRequest?.options?.fast
            });
        } catch (rollError) {
            setError(rollError.message || 'No se pudo preparar la tirada de daño.');
        }
    }, [executeRoll, lastRequest]);
    const close = useCallback(() => {
        setActiveRoll(null);
        setInternalOpen(false);
        setError('');
        onClose?.();
    }, [onClose]);
    const newRoll = () => { setActiveRoll(null); setInternalOpen(true); setError(''); };

    useEffect(() => {
        if (open) { setInternalOpen(true); setActiveRoll(null); setError(''); }
    }, [open]);
    useEffect(() => {
        const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (!media) return undefined;
        const update = event => setReducedMotion(event.matches);
        media.addEventListener?.('change',update);
        return () => media.removeEventListener?.('change',update);
    }, []);
    useEffect(() => {
        const previousRollDice = window.rollDice;
        const previousOpenDiceRoller = window.openDiceRoller;
        window.rollDice = executeRoll;
        window.openDiceRoller = () => { setActiveRoll(null); setError(''); setInternalOpen(true); };
        window.DndDice = Object.freeze({ rollDice: executeRoll, open: window.openDiceRoller });
        return () => {
            if (window.rollDice === executeRoll) window.rollDice = previousRollDice;
            if (window.openDiceRoller === window.DndDice?.open) window.openDiceRoller = previousOpenDiceRoller;
            delete window.DndDice;
        };
    }, [executeRoll]);
    useEffect(() => {
        if (!internalOpen && !open) return undefined;
        const handleKey = event => { if (event.key === 'Escape') close(); };
        window.addEventListener('keydown',handleKey);
        return () => window.removeEventListener('keydown',handleKey);
    }, [internalOpen, open, close]);

    if (!internalOpen && !open) return null;
    return ReactDOM.createPortal(<div className={`dice-overlay ${activeRoll ? 'is-rolling' : 'is-builder'}`} onMouseDown={event => { if (event.target === event.currentTarget && !activeRoll) close(); }}>
        <div className="dice-overlay__atmosphere" aria-hidden="true"><i /><i /><i /><i /></div>
        {activeRoll
            ? <DiceRollStage roll={activeRoll} quick={!!lastRequest?.options?.fast} reducedMotion={reducedMotion} onClose={close} onNewRoll={newRoll} onRepeat={() => executeRoll(lastRequest.formula,lastRequest.options)} onRerollSelected={rerollSelected} onFollowUp={executeFollowUp} />
            : <DiceControls onRoll={executeRoll} onClose={close} lastRequest={lastRequest} error={error} />}
    </div>, document.body);
};

window.DndDiceComponents = Object.freeze({ DiceRoller, Dice3D, DiceControls, DiceResult, SheetRollPrompt });
