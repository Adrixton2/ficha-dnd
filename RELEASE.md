# Publicar una actualizacion

La entrada de produccion es `index.html`. Los archivos JSX fuente no se
publican directamente: deben compilarse antes de subir cambios visuales o de
logica.

1. Editar los archivos fuente necesarios.
2. Ejecutar `powershell -ExecutionPolicy Bypass -File .\build-production.ps1`.
3. Ejecutar `node scripts\verify-release.mjs` y `node --test tests\pure-utils.test.mjs` si Node.js esta disponible localmente.
   La primera comprobación valida también que `firestore.rules` existe, no
   contiene permisos globales abiertos y no se publica en GitHub Pages.
4. Probar `index.html` y la Mesa Online.
5. Revisar `git status` antes de confirmar ningun cambio.
6. Crear el commit y hacer `git push origin main`.

GitHub Actions repite la validacion y las pruebas antes de desplegar. El
workflow genera `firebase-config.js` a partir del secreto
`FIREBASE_CONFIG_JSON` y solo publica el directorio de produccion. Nunca
versionar `firebase-config.js`, `config-firebase.txt` ni tokens locales.

`firestore.rules` es una copia de referencia de las reglas auditadas. Antes de
desplegar reglas distintas, revisar `FIRESTORE_RULES_AUDIT.md` y probar alta,
salida y reentrada de miembros desde dos navegadores.
