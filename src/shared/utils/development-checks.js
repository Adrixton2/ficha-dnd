/* Manual development checks. Nothing runs until window.runDndArchitectureChecks() is called. */
(function () {
    const runDndArchitectureChecks = () => {
        const checks = [];
        const add = (name, passed, detail = '') => checks.push({ name, passed: !!passed, detail });

        add('app-utils', !!window.DndAppUtils, 'Utilidades de personaje y Bestiario.');
        add('character-manager', typeof window.DndCharacterManager?.useCharacterManager === 'function', 'Hook de perfiles.');
        add('initiative-utils', typeof window.OnlineInitiativeUtils?.findNextEligibleTurn === 'function', 'Reglas puras de iniciativa.');
        add('online-table-utils', typeof window.DndOnlineTableUtils?.getHpValues === 'function', 'Normalizadores de Mesa Online.');
        add('online-components', typeof window.DndOnlineComponents?.EnemyModal === 'function', 'Componentes de presentación.');
        add('character-builder-components', typeof window.DndCharacterBuilderComponents?.CharacterBuildModal === 'function', 'Modal de construcción de personaje.');
        add('bestiary-components', typeof window.DndBestiaryComponents?.LocalBestiaryModal === 'function', 'Modal local del Bestiario.');
        add('local-modal-components', typeof window.DndLocalModalComponents?.TimerModal === 'function', 'Modales locales reutilizables.');
        add('spellbook-components', typeof window.DndSpellbookComponents?.ArcaneCompendiumView === 'function', 'Compendio Arcano visual.');
        add('character-sheet-components', typeof window.DndCharacterSheetComponents?.AbilityGlyph === 'function', 'Componentes compartidos de la ficha.');
        add('companion-components', typeof window.DndCompanionComponents?.CompanionManagerModal === 'function', 'Gestión de compañeros y familiares.');
        add('session-mode-components', typeof window.DndSessionModeComponents?.SessionMode === 'function', 'Vista enfocada de sesión.');
        add('inventory-view-components', typeof window.DndInventoryViewComponents?.InventoryView === 'function', 'Vista modular de inventario.');
        add('character-footer-components', typeof window.DndCharacterFooterComponents?.CharacterFooter === 'function', 'Competencias y perfil narrativo.');
        add('online-table-shell-components', typeof window.DndOnlineTableShellComponents?.OnlineTableShell === 'function', 'Carcasa visual de Mesa Online.');
        add('combat-dashboard-components', typeof window.DndCombatDashboardComponents?.CombatDashboard === 'function', 'Panel principal de combate.');
        add('character-header-components', typeof window.DndCharacterHeaderComponents?.CharacterHeader === 'function', 'Cabecera y progresión del personaje.');
        add('character-workspace-components', typeof window.DndCharacterWorkspaceComponents?.CharacterWorkspace === 'function', 'Contenido de ficha, combate y grimorio.');
        add('online-table-controller', typeof window.DndOnlineTableController?.useOnlineTableController === 'function', 'Estado y operaciones de Mesa Online y Bestiario.');
        add('compendium-dialog-components', typeof window.DndCompendiumDialogComponents?.CompendiumDialogs === 'function', 'Diálogos de grimorio y compendios.');
        add('action-dialog-components', typeof window.DndActionDialogComponents?.ActionDialogs === 'function', 'Diálogos de lanzamiento y acciones de sesión.');
        add('editor-dialog-components', typeof window.DndEditorDialogComponents?.EditorDialogs === 'function', 'Editores de ficha y equipo.');
        add('character-sheet-app', typeof window.DndCharacterSheetApp?.KaelCharacterSheet === 'function', 'Controlador principal de la ficha.');
        add('firebase-client', !!window.firebaseConnectionState, 'Estado de conexión Firebase.');
        add('react-root', !!document.getElementById('root'), 'Punto de montaje React.');

        const initiativeUtils = window.OnlineInitiativeUtils;
        if (initiativeUtils?.validateTurnState) {
            const turnState = initiativeUtils.validateTurnState({
                turnOrder: ['a', 'b'],
                turnIndex: 1,
                currentTurnId: 'b',
                round: 1
            });
            add('turn-state-validation', turnState.valid, turnState.errors.join(', '));
        } else {
            add('turn-state-validation', false, 'validateTurnState no está disponible.');
        }

        const passed = checks.every(check => check.passed);
        console.table(checks);
        return { passed, checks };
    };

    window.runDndArchitectureChecks = runDndArchitectureChecks;
}());
