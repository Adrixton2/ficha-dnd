const { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } = React;
const { SUPPORTED_DICE, parseDiceFormula, formatDiceFormula, doubleDiceFormula, rollDice: calculateDiceRoll, rerollDiceResult } = window.DndDiceEngine;
const { getGeometry, getAnimatedQuaternion, drawDie } = window.DndDice3D;

const Dice3D = ({ die, index = 0, rolling = true, quick = false, reducedMotion = false, revealResult = true, revealSelectionState = true, selectable = false, selectedForReroll = false, onToggleReroll }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const [settled, setSettled] = useState(false);
    const geometry = useMemo(() => getGeometry(die.sides), [die.sides]);
    const seed = useMemo(() => [...String(die.id)].reduce((sum, character) => sum + character.charCodeAt(0), 11 + index * 7), [die.id, index]);
    const isD20 = Number(die.sides) === 20;
    const isEligibleD20 = isD20 && die.state !== 'discarded';
    const resultTone = isEligibleD20 && Number(die.result) === 20 ? 'critical' : isEligibleD20 && Number(die.result) === 1 ? 'fumble' : '';
    useLayoutEffect(() => { if (rolling) setSettled(false); }, [die.id, die.result, rolling]);

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

        if (rolling) setSettled(false);
        const startedAt = performance.now();
        const duration = reducedMotion ? 140 : quick ? 680 + index * 45 : 1650 + index * 105;
        const revealDuration = reducedMotion || !isD20 ? 0 : quick ? 720 : 1250;
        const render = now => {
            if (!active) return;
            resize();
            const progress = rolling ? Math.max(0, Math.min(1, (now - startedAt) / duration)) : 1;
            const rawReveal = revealResult ? (rolling || revealDuration === 0 ? 1 : Math.max(0, Math.min(1, (now - startedAt) / revealDuration))) : 0;
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
            if (progress < 1 || (!rolling && revealResult && rawReveal < 1)) animationRef.current = window.requestAnimationFrame(render);
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
    }, [die.id, die.result, die.faceLabels, die.palette, geometry, index, isD20, quick, reducedMotion, rolling, revealResult, resultTone, seed]);

    const toggleReroll = () => { if (selectable) onToggleReroll?.(die.groupId); };
    const resultVisible = settled && revealResult;
    const isNaturalTwenty = resultVisible && resultTone === 'critical';
    const isNaturalOne = resultVisible && resultTone === 'fumble';
    const resolvedStateVisible = !isD20 || revealSelectionState;
    const resolvedStateClass = resolvedStateVisible ? die.state === 'selected' ? 'is-selected' : die.state === 'discarded' ? 'is-discarded' : '' : '';
    return <figure
        className={`dice-3d ${settled ? 'is-settled' : 'is-rolling'} ${resultVisible ? 'is-result-visible' : 'is-awaiting-result'} ${isD20 ? 'is-d20-suspense' : ''} ${isNaturalTwenty ? 'is-natural-twenty' : isNaturalOne ? 'is-natural-one' : ''} ${resolvedStateClass} ${selectable ? 'is-selectable' : ''} ${selectedForReroll ? 'is-reroll-selected' : ''}`}
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
        {isD20 && revealResult && <span className={`dice-3d__result-number ${resultTone ? `is-${resultTone}` : ''}`} aria-hidden="true">{die.displayValue}</span>}
        {(isNaturalTwenty || isNaturalOne) && <div className={`dice-3d__outcome-burst is-${resultTone}`} aria-hidden="true"><div>{Array.from({ length: 12 }, (_, rayIndex) => <i key={rayIndex} style={{ '--outcome-ray': `${rayIndex * 30}deg`, '--outcome-delay': `${450 + rayIndex * 34}ms` }} />)}</div><span>{Array.from({ length: 8 }, (_, fragmentIndex) => <b key={fragmentIndex} style={{ '--fragment-angle': `${fragmentIndex * 45 + 12}deg`, '--fragment-delay': `${1480 + fragmentIndex * 58}ms` }} />)}</span></div>}
        <figcaption><span>{die.percentileRole ? die.percentileRole : `d${die.sides}`}</span><strong>{resultVisible ? die.displayValue : '…'}</strong>{selectedForReroll && <em className="is-reroll">Repetir</em>}{!selectedForReroll && resolvedStateVisible && die.state === 'selected' && resultVisible && <em>Usado</em>}{!selectedForReroll && resolvedStateVisible && die.state === 'discarded' && resultVisible && <em>Descartado</em>}</figcaption>
    </figure>;
};

const DiceResult = ({ roll, phase, revealedModifiers }) => {
    const diceTerms = roll.terms.filter(term => term.type === 'dice');
    const showNatural = phase === 'natural' || phase === 'final';
    const showFinal = phase === 'final';
    return <section className={`dice-result ${showFinal ? 'is-final' : ''} ${showNatural && roll.critical ? 'is-critical' : showNatural && roll.fumble ? 'is-fumble' : ''}`} aria-live="polite">
        <div className="dice-result__natural">
            <small>{roll.advantageMode ? roll.advantageMode === 'advantage' ? 'Resultado con ventaja' : 'Resultado con desventaja' : diceTerms.length === 1 && diceTerms[0].count === 1 ? 'Resultado natural' : 'Resultados de los dados'}</small>
            {showNatural ? <div>{diceTerms.map((term, termIndex) => <span key={`term_${termIndex}`}><b>{term.rolls.map((value, index) => <React.Fragment key={`${value}_${index}`}><i className={term.usedRollIndex === index ? 'is-used' : term.usedRollIndex !== null ? 'is-discarded' : ''}>{value}</i>{index < term.rolls.length - 1 && <em>+</em>}</React.Fragment>)}</b><strong>{term.advantageMode ? `Se usa ${term.rolls[term.usedRollIndex]}` : term.rolls.length > 1 ? `= ${term.subtotal}` : `d${term.sides}`}</strong></span>)}</div> : <strong className="dice-result__waiting">Determinando resultado…</strong>}
        </div>
        {roll.modifiers.length > 0 && !roll.damageBreakdown?.length && <div className="dice-result__modifiers">{roll.modifiers.map((modifier, index) => <div key={`${modifier.label}_${index}`} className={index < revealedModifiers ? 'is-visible' : ''}><span>{modifier.label}</span><strong>{modifier.value >= 0 ? '+' : ''}{modifier.value}</strong></div>)}</div>}
        {showFinal && roll.damageBreakdown?.length > 0 && <div className="dice-result__breakdown"><header><span>Desglose de impactos</span><small>{roll.damageBreakdown.length} partidas</small></header>{roll.damageBreakdown.map((group, index) => <div key={`${group.label}_${index}`}><span><strong>{group.label}</strong><small>{group.formula}{group.critical ? ' · crítico' : ''}</small></span><b>{group.total}</b></div>)}</div>}
        <div className={`dice-result__total ${showFinal ? 'is-visible' : ''}`}><span>Total</span><strong aria-hidden={!showFinal}>{showFinal ? roll.total : '—'}</strong>{roll.difficultyClass !== null && <em>CD {roll.difficultyClass}</em>}</div>
        {showFinal && roll.success !== null && <div className={`dice-result__outcome ${roll.success ? 'is-success' : 'is-failure'}`}><span aria-hidden="true">{roll.success ? '✦' : '◇'}</span><strong>{roll.success ? 'Éxito' : 'Fallo'}</strong><small>{roll.total} {roll.success ? 'alcanza' : 'no alcanza'} la CD {roll.difficultyClass}</small></div>}
        {showFinal && roll.critical && <p className="dice-result__special is-critical"><span>✦</span><strong>¡Crítico!</strong><small>20 natural</small></p>}
        {showFinal && roll.fumble && <p className="dice-result__special is-fumble"><span>◆</span><strong>¡Pifia!</strong><small>1 natural</small></p>}
    </section>;
};

const DiceRollStage = ({ roll, quick, reducedMotion, onClose, onRepeat, onRerollSelected, onAttackOutcome, onNewRoll }) => {
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
        const base = reducedMotion ? 160 : hasD20Suspense ? (quick ? 1220 : 2450) : (quick ? 1020 : 2150);
        const rerolledGroups = new Set(Array.isArray(roll.rerolledGroupIds) ? roll.rerolledGroupIds : []);
        const animatedDiceIndexes = roll.visualDice
            .map((die, index) => !rerolledGroups.size || rerolledGroups.has(die.groupId) ? index : -1)
            .filter(index => index >= 0);
        const lastAnimatedIndex = animatedDiceIndexes.length ? Math.max(...animatedDiceIndexes) : 0;
        const diceDelay = reducedMotion ? 0 : lastAnimatedIndex * (quick ? 45 : 105);
        const naturalAt = base + diceDelay;
        const revealDuration = reducedMotion || !hasD20Suspense ? 0 : quick ? 720 : 1250;
        const exceptionalHold = !reducedMotion && hasD20Suspense && (roll.critical || roll.fumble) ? (quick ? 1150 : 2000) : 0;
        const resultAt = naturalAt + revealDuration + exceptionalHold;
        const visibleModifiers = roll.damageBreakdown?.length ? [] : roll.modifiers;
        const timers = hasD20Suspense
            ? [window.setTimeout(() => setPhase('revealing'), naturalAt), window.setTimeout(() => setPhase('natural'), resultAt)]
            : [window.setTimeout(() => setPhase('natural'), naturalAt)];
        visibleModifiers.forEach((modifier, index) => timers.push(window.setTimeout(() => setRevealedModifiers(index + 1), resultAt + (index + 1) * (reducedMotion ? 40 : quick ? 170 : 330))));
        const finalAt = resultAt + Math.max(1, visibleModifiers.length) * (reducedMotion ? 40 : quick ? 170 : 330) + (reducedMotion ? 40 : quick ? 150 : 300);
        timers.push(window.setTimeout(() => setPhase('final'), finalAt));
        return () => timers.forEach(timer => window.clearTimeout(timer));
    }, [roll.id, roll.modifiers.length, roll.visualDice.length, roll.damageBreakdown?.length, hasD20Suspense, quick, reducedMotion]);

    const toggleReroll = groupId => setRerollSelection(previous => {
        const next = new Set(previous);
        if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
        return next;
    });
    const isAttackRoll = ['weapon-damage', 'spell-damage'].includes(roll.followUp?.type);
    const rerolledGroups = new Set(Array.isArray(roll.rerolledGroupIds) ? roll.rerolledGroupIds : []);
    const diceCountClass = roll.visualDice.length >= 7 ? 'is-many' : roll.visualDice.length >= 4 ? 'is-group' : roll.visualDice.length === 1 ? 'is-single' : '';
    const paletteStyle = roll.dicePalette ? { '--dice-accent-rgb': roll.dicePalette.join(',') } : undefined;
    const renderPhase = phaseRollId === roll.id ? phase : 'rolling';
    const resultRevealed = renderPhase !== 'rolling';
    return <article className={`dice-stage ${renderPhase === 'final' ? 'is-complete' : ''} ${hasD20Suspense ? 'has-d20-suspense' : ''} ${resultRevealed && roll.critical ? 'is-critical' : resultRevealed && roll.fumble ? 'is-fumble' : ''}`} style={paletteStyle} role="dialog" aria-modal="true" aria-labelledby="dice-stage-title">
        <button type="button" className="dice-overlay__close" onClick={onClose} aria-label="Cerrar tirada">×</button>
        <header className="dice-stage__header"><small>{roll.rollType}</small><h2 id="dice-stage-title">{roll.label}</h2><div><span>{roll.displayFormula || roll.formula}</span>{roll.advantageMode && <span>{roll.advantageMode === 'advantage' ? 'Ventaja' : 'Desventaja'}</span>}{roll.difficultyClass !== null && <span>CD {roll.difficultyClass}</span>}{roll.rerollCount > 0 && <span>Repetición {roll.rerollCount}</span>}</div></header>
        <div className={`dice-stage__scene ${diceCountClass}`}><div className="dice-stage__sigil" aria-hidden="true"><i /><i /><i /></div><div className="dice-stage__dice">{roll.visualDice.map((die, index) => {
            const rerollingDie = !rerolledGroups.size || rerolledGroups.has(die.groupId);
            const preserveSettledResult = rerolledGroups.size > 0 && !rerollingDie;
            return <Dice3D key={die.id} die={{ ...die, palette: roll.dicePalette }} index={index} rolling={renderPhase === 'rolling' && rerollingDie} quick={quick} reducedMotion={reducedMotion} revealResult={resultRevealed || preserveSettledResult} revealSelectionState={renderPhase === 'natural' || renderPhase === 'final'} selectable={renderPhase === 'final'} selectedForReroll={rerollSelection.has(die.groupId)} onToggleReroll={toggleReroll} />;
        })}</div>{renderPhase === 'final' && <p className="dice-stage__reroll-hint">Toca uno o varios dados para repetirlos</p>}</div>
        <DiceResult roll={roll} phase={renderPhase} revealedModifiers={revealedModifiers} />
        {renderPhase === 'final' && <footer className="dice-stage__actions">
            {!isAttackRoll && <button type="button" className="is-new-roll" onClick={onNewRoll}><span className="dice-stage__action-icon" aria-hidden="true">＋</span><strong>Nueva tirada</strong></button>}
            <button type="button" className="is-repeat-all" onClick={onRepeat}><span className="dice-stage__action-icon" aria-hidden="true">↻</span><strong>Repetir todo</strong></button>
            {rerollSelection.size > 0 && <button type="button" className="is-reroll" onClick={() => onRerollSelected?.([...rerollSelection])}><span aria-hidden="true">⟳</span> Repetir {rerollSelection.size === 1 ? 'dado' : `${rerollSelection.size} dados`}</button>}
            {isAttackRoll && <button type="button" className="is-miss" onClick={() => onAttackOutcome?.(roll, false)}><span aria-hidden="true">◇</span> Falló</button>}
            {isAttackRoll && <button type="button" className="is-primary is-follow-up" onClick={() => onAttackOutcome?.(roll, true)}><span aria-hidden="true">✦</span> Impactó</button>}
        </footer>}
    </article>;
};

const SheetRollPrompt = ({ request, onCancel, onChoose }) => {
    const [useGuidance, setUseGuidance] = useState(false);
    const [targetLabel, setTargetLabel] = useState('');
    useEffect(() => setUseGuidance(false), [request]);
    useEffect(() => setTargetLabel(''), [request]);
    useEffect(() => {
        if (!request) return undefined;
        const handleKey = event => {
            if (event.key === 'Escape') onCancel?.();
            if (event.key === '1') onChoose?.('normal', { useGuidance, targetLabel });
            if (event.key === '2') onChoose?.('advantage', { useGuidance, targetLabel });
            if (event.key === '3') onChoose?.('disadvantage', { useGuidance, targetLabel });
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [request, onCancel, onChoose, useGuidance, targetLabel]);

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
            {request.targetPrompt && <label className="sheet-roll-prompt__target"><span>Objetivo de este ataque</span><small>Opcional · te ayuda a repartir rayos entre varias criaturas.</small><input value={targetLabel} onChange={event => setTargetLabel(event.target.value)} placeholder="Ej: Goblin del puente" maxLength="50" /></label>}
            {request.allowGuidance && <button type="button" className={`sheet-roll-prompt__guidance ${useGuidance ? 'is-active' : ''}`} aria-pressed={useGuidance} onClick={() => setUseGuidance(value => !value)}><span aria-hidden="true">◇</span><div><small>Guía disponible</small><strong>{useGuidance ? 'Se añadirá 1d4 a la tirada' : '¿Quieres utilizar Guía?'}</strong><p>Solo se aplica a esta prueba de característica.</p></div><b>{useGuidance ? '✓' : '+1d4'}</b></button>}
            <div className="sheet-roll-prompt__choices" aria-label="Elige cómo realizar la tirada">
                {choices.map(([mode, label, dice, help]) => <button type="button" key={mode} onClick={() => onChoose?.(mode, { useGuidance, targetLabel })} className={request.suggestedMode === mode ? 'is-suggested' : ''}><span>{useGuidance ? `${dice}+1d4` : dice}</span><strong>{label}</strong><small>{help}</small>{request.suggestedMode === mode && <em>Sugerida</em>}</button>)}
            </div>
            <footer><p>Elige una opción para lanzar. Tu ficha ya ha calculado los modificadores.</p><button type="button" onClick={onCancel}>Cancelar</button></footer>
        </section>
    </div>, document.body);
};

const AttackSequencePanel = ({ sequence, attackOptions, error, onNextAttack, onRollDamage, onClose }) => {
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
            try { normalizedExtra = parseDiceFormula(extraFormula).source; }
            catch (error) { setFormulaError(error.message || 'La fórmula de daño extra no es válida.'); return; }
        }
        setFormulaError('');
        onRollDamage?.({ sneakTargetId, extraFormula: normalizedExtra, extraTargetId });
    };
    const selectedOption = availableAttackOptions.find(option => option.id === selectedAttackId);
    const attackLimit = allAttackOptions.reduce((total, option) => total + (Number(option.maxUses) || 0), 0);

    return <article className="attack-sequence" role="dialog" aria-modal="true" aria-labelledby="attack-sequence-title">
        <button type="button" className="dice-overlay__close" onClick={onClose} aria-label="Cerrar secuencia de ataques">×</button>
        <header><span aria-hidden="true">⚔</span><div><small>{sequence?.contextLabel || 'Resolución de combate'}</small><h2 id="attack-sequence-title">{sequence?.title || 'Ataques del turno'}</h2><p>Reparte cada ataque, resuelve sus impactos y lanza todo el daño junto al final.</p></div></header>
        <div className="attack-sequence__body">
            <section className="attack-sequence__attempts"><header><div><small>Historial temporal</small><strong>{attempts.length} {attempts.length === 1 ? 'ataque realizado' : 'ataques realizados'}</strong></div><span>{hits.length} {hits.length === 1 ? 'impacto' : 'impactos'}</span></header><div>{attempts.map((attempt, index) => <article key={attempt.id} className={attempt.hit ? 'is-hit' : 'is-miss'}><span>{index + 1}</span><div><strong>{attempt.roll.label}</strong><small>{attempt.roll.advantageMode === 'advantage' ? 'Ventaja' : attempt.roll.advantageMode === 'disadvantage' ? 'Desventaja' : 'Normal'} · total {attempt.roll.total}{attempt.roll.critical ? ' · crítico' : ''}</small></div><b>{attempt.hit ? 'Impactó' : 'Falló'}</b></article>)}</div></section>

            <section className="attack-sequence__next"><header><small>Continuar atacando</small><strong>{attackLimit ? `${Math.max(0, attackLimit - attempts.length)} ataques disponibles` : '¿Quieres realizar otro ataque?'}</strong></header>{availableAttackOptions.length > 0 ? <><label><span>Ataque o acción</span><select value={selectedAttackId} onChange={event => setSelectedAttackId(event.target.value)}>{availableAttackOptions.map(option => <option value={option.id} key={option.id}>{option.weaponName} · {option.label}</option>)}</select></label>{sequence?.allowTargets && <label><span>Objetivo de este ataque</span><input value={targetLabel} onChange={event => setTargetLabel(event.target.value)} placeholder="Ej: Goblin del puente" maxLength="50" /></label>}<div className="attack-sequence__modes" aria-label="Modo del siguiente ataque">{[['normal','Normal'],['advantage','Ventaja'],['disadvantage','Desventaja']].map(([value, label]) => <button type="button" key={value} className={mode === value ? 'is-active' : ''} onClick={() => setMode(value)}>{label}</button>)}</div><button type="button" className="attack-sequence__roll-next" disabled={!selectedOption} onClick={() => { if (selectedOption) { onNextAttack?.(selectedOption, mode, targetLabel.trim()); setTargetLabel(''); } }}><span aria-hidden="true">20</span><div><small>Añadir a la secuencia</small><strong>Tirar siguiente ataque</strong></div><b>→</b></button></> : <p className="attack-sequence__empty">{attackLimit ? 'Ya has resuelto todos los ataques de este conjuro.' : 'Añade ataques con daño a tu Arsenal para continuar la secuencia.'}</p>}</section>

            <section className="attack-sequence__damage"><header><small>Cuando hayas terminado</small><strong>Preparar todo el daño</strong><span>{hits.length ? `${hits.length} impactos guardados` : 'Todavía sin impactos'}</span></header>{hits.length > 0 && <div className="attack-sequence__extras">
                {sneakCandidates.length > 0 && <label><span>Ataque furtivo</span><small>Una sola vez. Con una tirada normal confirmas que se cumplen las demás condiciones.</small><select value={sneakTargetId} onChange={event => setSneakTargetId(event.target.value)}><option value="">No utilizar</option>{sneakCandidates.map((attempt, index) => <option value={attempt.id} key={attempt.id}>{attempt.roll.label} · impacto {attempts.indexOf(attempt) + 1}{attempt.roll.critical ? ' · crítico' : ''} · {attempt.roll.followUp.sneakAttackFormula}</option>)}</select></label>}
                <div className="attack-sequence__custom-extra"><label><span>Dados extra opcionales</span><small>Para castigos, maniobras, venenos u otros efectos.</small><input value={extraFormula} onChange={event => { setExtraFormula(event.target.value); setFormulaError(''); }} placeholder="Ej: 2d8" spellCheck="false" /></label>{extraFormula.trim() && <label><span>Aplicar al impacto</span><small>Si ese ataque fue crítico, estos dados también se duplicarán.</small><select value={extraTargetId} onChange={event => setExtraTargetId(event.target.value)}>{hits.map(attempt => <option value={attempt.id} key={attempt.id}>{attempt.roll.label}{attempt.roll.critical ? ' · crítico' : ''}</option>)}</select></label>}</div>
                {(formulaError || error) && <p className="attack-sequence__error" role="alert">{formulaError || error}</p>}
            </div>}
                <button type="button" className="attack-sequence__roll-damage" disabled={!hits.length} onClick={submitDamage}><span aria-hidden="true">✦</span><div><small>Combinar todos los impactos</small><strong>Tirar daño total</strong></div><b>→</b></button>
                {!hits.length && <button type="button" className="attack-sequence__finish-empty" onClick={onClose}>Finalizar sin daño</button>}
            </section>
        </div>
    </article>;
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

const DiceRoller = ({ open, onClose, attackOptions = [] }) => {
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
            followUp: { ...option.options.followUp, targetLabel }
        });
    }, [attackSequence, executeRoll]);
    const rollSequenceDamage = useCallback(({ sneakTargetId = '', extraFormula = '', extraTargetId = '' } = {}) => {
        const hits = (attackSequence?.attempts || []).filter(attempt => attempt.hit && attempt.roll.followUp?.formula);
        if (!hits.length) return;
        try {
            const formulas = [];
            const modifiers = [];
            const damageGroups = [];
            const addDamageGroup = ({ label, formula, groupModifiers = [], critical = false, extra = false }) => {
                const resolvedFormula = critical ? doubleDiceFormula(formula) : formula;
                const parsed = parseDiceFormula(resolvedFormula);
                const modifierTotal = groupModifiers.reduce((sum, modifier) => sum + (Number(modifier.value) || 0), 0);
                formulas.push(resolvedFormula);
                groupModifiers.forEach(modifier => modifiers.push({ ...modifier, label: `${label} · ${modifier.label}` }));
                damageGroups.push({ label, formula: `${resolvedFormula}${modifierTotal ? `${modifierTotal > 0 ? '+' : ''}${modifierTotal}` : ''}`, termCount: parsed.terms.length, modifierTotal, critical, extra });
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
    const newRoll = () => { setActiveRoll(null); setAttackSequence(null); setInternalOpen(true); setError(''); };

    useEffect(() => {
        if (open) { setInternalOpen(true); setActiveRoll(null); setAttackSequence(null); setError(''); }
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
        window.openDiceRoller = () => { setActiveRoll(null); setAttackSequence(null); setError(''); setInternalOpen(true); };
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
    return ReactDOM.createPortal(<div className={`dice-overlay ${activeRoll ? 'is-rolling' : attackSequence ? 'is-sequence' : 'is-builder'}`} onMouseDown={event => { if (event.target === event.currentTarget && !activeRoll) close(); }}>
        <div className="dice-overlay__atmosphere" aria-hidden="true"><i /><i /><i /><i /></div>
        {activeRoll
            ? <DiceRollStage roll={activeRoll} quick={!!lastRequest?.options?.fast} reducedMotion={reducedMotion} onClose={close} onNewRoll={newRoll} onRepeat={() => executeRoll(lastRequest.formula,lastRequest.options)} onRerollSelected={rerollSelected} onAttackOutcome={recordAttackOutcome} />
            : attackSequence
                ? <AttackSequencePanel sequence={attackSequence} attackOptions={attackOptions} error={error} onNextAttack={rollNextSequenceAttack} onRollDamage={rollSequenceDamage} onClose={close} />
                : <DiceControls onRoll={executeRoll} onClose={close} lastRequest={lastRequest} error={error} />}
    </div>, document.body);
};

window.DndDiceComponents = Object.freeze({ DiceRoller, Dice3D, DiceControls, DiceResult, SheetRollPrompt });
