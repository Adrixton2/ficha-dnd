# Arquitectura de la ficha RPG

La aplicación sigue funcionando sin bundler ni npm. Los módulos se cargan desde
`index.html` y se comunican mediante objetos explícitos de `window`.

`index.html` es la entrada de producción: carga JavaScript ya compilado.
`index.dev.html` mantiene Babel y los archivos JSX fuente para desarrollo. Tras
editar `app.jsx` o `online-table-components.jsx`, ejecutar
`powershell -ExecutionPolicy Bypass -File .\build-production.ps1` para
regenerar los archivos compilados.

Antes de publicar, consultar [RELEASE.md](RELEASE.md). El manifiesto
`.build-manifest.json` enlaza los fuentes y compilados actuales; GitHub Actions
rechaza despliegues si no coinciden o si detecta configuracion sensible.

## Orden de carga

1. `online-initiative-utils.js`: reglas puras de iniciativa y turnos.
2. `online-table-utils.js`: normalización de vida, condiciones y enemigos.
3. `app-utils.js`: datos de personaje, migración, grimorio, retratos y Bestiario.
4. `character-manager.js`: hook de React para perfiles y persistencia local.
5. `firebase-client.js`: Firebase App, Authentication y Firestore.
6. `online-table-components.compiled.js`: componentes visuales de Mesa Online.
7. `app.compiled.js`: estado de pantalla, handlers y composición principal.

Los fuentes equivalentes (`online-table-components.jsx` y `app.jsx`) se usan
solo desde `index.dev.html`.

`styles.css` contiene los estilos generales de la ficha. `online-table.css`
se carga después para conservar la cascada de Mesa Online y sus modales.

## Límites de responsabilidad

- Añadir una regla o normalización sin React: `app-utils.js` o
  `online-table-utils.js`.
- Añadir una operación de turno: `online-initiative-utils.js`.
- Añadir persistencia de perfil: `character-manager.js`.
- Añadir inicialización o configuración Firebase: `firebase-client.js`.
- Añadir un elemento visual reutilizable de Mesa Online: `online-table-components.jsx`.
- Mantener en `app.jsx` únicamente estado React, callbacks y composición de
  vistas hasta que una sección tenga props y contratos claramente definidos.

## Reglas de seguridad para cambios

- No crear una segunda fuente de verdad para personajes, vida, turnos o
  formularios. Los componentes reciben datos y callbacks por props.
- Las funciones de utilidad no deben escribir estado React ni Firestore.
- Los handlers que escriben Firestore deben conservar las transacciones y los
  listeners existentes.
- Cuando se añada un archivo local que deba funcionar offline, incluirlo en
  `APP_SHELL` de `service-worker.js`.
- Después de una extracción, verificar que Babel no muestra errores y que los
  objetos globales requeridos están cargados antes de `app.jsx`.

`window.runDndArchitectureChecks()` ejecuta una comprobación manual de los
módulos cargados y de una transición de iniciativa coherente. No escribe datos
ni se ejecuta automáticamente.

## Siguientes extracciones seguras

1. Convertir el modal de enemigo en un componente de presentación con props.
2. Extraer la vista de Bestiario, cuando sus callbacks estén agrupados.
3. Extraer las vistas Personaje, Combate, Grimorio e Inventario una por una.
4. Crear una capa de servicio de Mesa Online solo después de agrupar los
   callbacks de Firestore por operación (sala, participantes, enemigos,
   efectos).
