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
