/* Centralized responsive mode detection and layout shells. */
window.DndLayoutMode = (() => {
    const LAYOUT_MODES = Object.freeze(['auto', 'mobile', 'tablet', 'desktop']);
    const POINTER_QUERIES = Object.freeze([
        '(hover: hover) and (pointer: fine)',
        '(any-hover: hover) and (any-pointer: fine)',
        '(pointer: coarse)'
    ]);
    const VIEWPORT_QUERIES = Object.freeze([
        '(min-width: 640px)',
        '(min-width: 1180px)',
        '(min-width: 1600px)',
        '(min-width: 2200px)'
    ]);

    const normalizeLayoutOverride = value => LAYOUT_MODES.includes(value) ? value : 'auto';
    const getDesktopDensity = width => width >= 2200 ? 'wide' : width >= 1600 ? 'standard' : 'compact';

    const resolveLayoutMode = ({ width = 0, override = 'auto', fineHover = false, anyFineHover = fineHover, coarsePointer = false } = {}) => {
        const viewportWidth = Math.max(0, Number(width) || 0);
        const normalizedOverride = normalizeLayoutOverride(override);
        if (normalizedOverride !== 'auto') {
            return {
                mode: normalizedOverride,
                density: normalizedOverride === 'desktop' ? getDesktopDensity(viewportWidth) : normalizedOverride,
                override: normalizedOverride,
                reason: 'manual'
            };
        }
        if (viewportWidth < 640) return { mode: 'mobile', density: 'mobile', override: 'auto', reason: 'viewport' };
        if (viewportWidth < 1180) return { mode: 'tablet', density: 'tablet', override: 'auto', reason: 'viewport' };
        if (coarsePointer && !fineHover && !anyFineHover) {
            return { mode: 'tablet', density: 'tablet', override: 'auto', reason: 'touch-primary' };
        }
        return { mode: 'desktop', density: getDesktopDensity(viewportWidth), override: 'auto', reason: 'desktop-capable' };
    };

    const readLayoutEnvironment = (override = 'auto') => {
        const match = query => typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
        return resolveLayoutMode({
            width: window.innerWidth || document.documentElement?.clientWidth || 0,
            override,
            fineHover: match(POINTER_QUERIES[0]),
            anyFineHover: match(POINTER_QUERIES[1]),
            coarsePointer: match(POINTER_QUERIES[2])
        });
    };

    const useLayoutMode = (override = 'auto') => {
        const ReactApi = window.React;
        const normalizedOverride = normalizeLayoutOverride(override);
        const [layout, setLayout] = ReactApi.useState(() => readLayoutEnvironment(normalizedOverride));

        ReactApi.useEffect(() => {
            const update = () => setLayout(previous => {
                const next = readLayoutEnvironment(normalizedOverride);
                return previous.mode === next.mode && previous.density === next.density
                    && previous.override === next.override && previous.reason === next.reason ? previous : next;
            });
            const mediaQueries = [...POINTER_QUERIES, ...VIEWPORT_QUERIES].map(query => window.matchMedia?.(query)).filter(Boolean);
            mediaQueries.forEach(query => {
                if (typeof query.addEventListener === 'function') query.addEventListener('change', update);
                else query.addListener?.(update);
            });
            update();
            return () => {
                mediaQueries.forEach(query => {
                    if (typeof query.removeEventListener === 'function') query.removeEventListener('change', update);
                    else query.removeListener?.(update);
                });
            };
        }, [normalizedOverride]);

        ReactApi.useEffect(() => {
            document.documentElement.dataset.layoutMode = layout.mode;
            document.documentElement.dataset.layoutDensity = layout.density;
        }, [layout.mode, layout.density]);

        return layout;
    };

    return { LAYOUT_MODES, normalizeLayoutOverride, resolveLayoutMode, readLayoutEnvironment, useLayoutMode };
})();
