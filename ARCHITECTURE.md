# Arquitectura de la ficha RPG

La aplicación funciona sin bundler ni npm. Producción carga JavaScript compilado
desde `index.html`; desarrollo carga los JSX fuente con Babel desde
`index.dev.html`. Los módulos exponen contratos explícitos en `window` porque
este proyecto no usa imports de un empaquetador.

Después de editar cualquier JSX hay que ejecutar:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-production.ps1
```

## Estructura

```text
src/
├─ App.jsx
├─ app/
│  └─ CharacterSheetApp.jsx
├─ features/
│  ├─ character/
│  ├─ combat/
│  ├─ companions/
│  ├─ online-table/
│  │  └─ utils/
│  ├─ dice/
│  ├─ spellbook/
│  ├─ inventory/
│  └─ bestiary/
├─ shared/
│  ├─ components/
│  │  └─ dialogs/
│  └─ utils/
├─ services/
├─ data/
└─ styles/

dist/
├─ App.js
├─ app/
├─ features/
└─ shared/
```

`src/` contiene los fuentes mantenibles. `dist/` replica las funciones con los
archivos compilados que consume producción; no se editan a mano.

Antes de publicar, consultar [RELEASE.md](RELEASE.md). El manifiesto
`.build-manifest.json` relaciona cada fuente con su compilado y la validación de
release rechaza artefactos desactualizados. El contrato de Mesa Online está en
[FIRESTORE_CONTRACT.md](FIRESTORE_CONTRACT.md) y la referencia de seguridad en
[`firestore.rules`](firestore.rules).

## Capas

1. Utilidades y persistencia:
   `src/shared/utils/app-utils.js`, las utilidades de `src/features/online-table`,
   `src/services/character-storage.js` y `src/services/firebase.js`.
2. Controladores de dominio:
   `src/features/online-table/useOnlineRoom.jsx` concentra sala, participantes, enemigos,
   Bestiario, vida, efectos, turnos, compartir y reconexión.
3. Vistas de función:
   los componentes dentro de `src/features/character`, `combat`, `companions`,
   `inventory` y `online-table`.
4. Componentes y diálogos reutilizables:
   los elementos de `src/shared/components` y los componentes específicos de
   cada carpeta dentro de `src/features`.
5. Composición:
   `src/app/CharacterSheetApp.jsx` conecta estado de ficha, reglas y módulos.
   `src/App.jsx` únicamente monta `KaelCharacterSheet` en `#root`.

Cada JSX tiene un JavaScript equivalente dentro de `dist/`. `index.html`, el service
worker, el manifiesto de compilación y el workflow de Pages deben conservar el
mismo orden: utilidades, componentes compartidos, controladores, composición y
por último `dist/App.js`.

## Límites de responsabilidad

- Una regla o normalización sin React pertenece a `src/shared/utils` o a las
  utilidades de la función correspondiente.
- Una transición pura de iniciativa pertenece a
  `src/features/online-table/utils/initiative.js`.
- La persistencia de perfiles pertenece a `src/services/character-storage.js`.
- La inicialización de Firebase pertenece a `src/services/firebase.js`.
- Las escrituras y listeners de Mesa Online pertenecen a
  `src/features/online-table/useOnlineRoom.jsx`; sus vistas solo reciben datos y callbacks.
- Las pantallas de ficha se modifican en su componente de función, no en el
  punto de entrada.
- Los diálogos deben vivir en el módulo del dominio que representan.
- `src/App.jsx` no debe adquirir estado, reglas ni interfaz adicional.

## Datos y seguridad

- No crear una segunda fuente de verdad para personajes, vida, turnos o
  formularios.
- Las utilidades puras no escriben estado React ni Firestore.
- Los handlers de Firestore deben conservar transacciones, permisos y
  listeners existentes.
- Los datos persistentes deben respetar [LOCAL_DATA_CONTRACT.md](LOCAL_DATA_CONTRACT.md).
- Todo compilado necesario al arrancar debe figurar en `APP_SHELL` de
  `service-worker.js`; las imágenes siguen usando la caché estable de recursos.

## Verificación

- `build-production.ps1`: compila todos los JSX y actualiza el manifiesto.
- `node scripts/verify-browser-runtime.mjs`: abre producción en Chrome sin
  interfaz, comprueba el montaje de React, los contratos globales y excepciones.
- `node --test tests/pure-utils.test.mjs`: valida reglas puras.
- `node scripts/verify-release.mjs`: valida hashes, archivos offline y artefacto
  de GitHub Pages.
- `window.runDndArchitectureChecks()`: comprobación manual desde el navegador.

Los analizadores `scripts/analyze-js-block.mjs` y
`scripts/analyze-jsx-block.mjs` permiten revisar dependencias libres antes de
mover lógica o JSX entre módulos.
