const {
  KaelCharacterSheet
} = window.DndCharacterSheetApp;
const {
  AccountGate
} = window.DndAccountComponents;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(AccountGate, null, /*#__PURE__*/React.createElement(KaelCharacterSheet, null)));