/* Presentation-only application shells. Only the selected tree is mounted. */
window.DndAppLayoutShells = (() => {
    const makeShell = (kind, props) => {
        const { layout, className = '', children, ...rest } = props;
        const mode = layout?.mode || 'mobile';
        const density = layout?.density || mode;
        return window.React.createElement('div', {
            ...rest,
            className: `${className} ${kind}-shell ${kind}-shell--${density}`.trim(),
            'data-layout-mode': mode,
            'data-layout-density': density
        }, children);
    };

    const MobileShell = props => makeShell('mobile', props);
    const TabletShell = props => makeShell('tablet', props);
    const DesktopShell = props => makeShell('desktop', props);
    const AppLayoutShell = props => props.layout?.mode === 'desktop'
        ? window.React.createElement(DesktopShell, props)
        : props.layout?.mode === 'tablet'
            ? window.React.createElement(TabletShell, props)
            : window.React.createElement(MobileShell, props);

    const makeWorkspaceLayout = (kind, props) => {
        const { layout, activeTab, combatView, children } = props;
        return window.React.createElement('section', {
            className: `${kind}-workspace-layout`,
            'data-view': activeTab,
            'data-combat-view': combatView,
            'aria-label': activeTab === 'combat' ? 'Panel de combate' : undefined
        }, children);
    };
    const MobileWorkspaceLayout = props => makeWorkspaceLayout('mobile', props);
    const TabletWorkspaceLayout = props => makeWorkspaceLayout('tablet', props);
    const DesktopWorkspaceLayout = props => makeWorkspaceLayout('desktop', props);
    const ActiveWorkspaceLayout = props => props.layout?.mode === 'desktop'
        ? window.React.createElement(DesktopWorkspaceLayout, props)
        : props.layout?.mode === 'tablet'
            ? window.React.createElement(TabletWorkspaceLayout, props)
            : window.React.createElement(MobileWorkspaceLayout, props);

    return {
        MobileShell,
        TabletShell,
        DesktopShell,
        AppLayoutShell,
        MobileWorkspaceLayout,
        TabletWorkspaceLayout,
        DesktopWorkspaceLayout,
        ActiveWorkspaceLayout
    };
})();
