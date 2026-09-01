const { KaelCharacterSheet } = window.DndCharacterSheetApp;
const { AccountGate } = window.DndAccountComponents;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AccountGate><KaelCharacterSheet /></AccountGate>);
