# Cuentas, sincronización y campañas en Firebase Spark

La aplicación funciona sin Cloud Functions y no requiere asociar una cuenta de facturación. Utiliza Firebase Authentication, Cloud Firestore, reglas de seguridad e IndexedDB.

## Modelo de datos

- `users/{uid}`: alias y avatar opcionales; nunca se copia el email.
- `users/{uid}/campaigns/{campaignId}`: índice privado de campañas del usuario.
- `characters/{characterId}`: ficha privada completa, con `ownerUid` inmutable.
- `campaigns/{campaignId}`: estado compartido de campaña y combate.
- `campaigns/{campaignId}/members/{uid}`: membresía validada por reglas; el cliente solo puede crearse como jugador.
- `characterProfiles`, `participants` y `publicCombatants`: datos visibles para miembros de una campaña abierta.
- `characterSummaries`: resumen que solo leen su propietario y el propietario de la campaña.
- `memberPrivate/{uid}`: espacio privado del jugador; el Máster no puede leerlo.
- `privateEnemies`, `effectsPrivate` y `dmPrivate`: datos exclusivos del propietario.
- `effectsPublic`: efectos compartidos con permisos limitados por propietario.

## Invitaciones sin servidor

Las campañas nuevas usan un código aleatorio de doce caracteres como identificador no enumerable. Las reglas permiten consultar una campaña abierta únicamente a sus miembros o a una persona autenticada que ya conozca el código. Al entrar, esa persona solo puede crear una membresía para su propio UID y con rol `player`.

La colección `campaignInvites` se mantiene en modo de solo lectura puntual para resolver posibles códigos V2 antiguos de ocho caracteres. No se pueden enumerar ni modificar desde el cliente. Las salas V1 de seis caracteres también siguen disponibles para datos anteriores.

Al expulsar a alguien, el propietario marca su membresía como bloqueada; el jugador no puede quitar ese bloqueo ni volver a entrar con el mismo código. Al cerrar una campaña, `joinEnabled` pasa a `false` y las reglas impiden acceder a sus datos internos.

## Límites deliberados del plan gratuito

- Una cuenta invitada se puede vincular a una cuenta de Google nueva conservando el mismo UID.
- Si la cuenta de Google ya existía, no se transfieren propietarios automáticamente. El usuario debe exportar cada ficha desde el selector de personajes y entrar después en la cuenta existente para importarlas.
- Al eliminar una cuenta, se borran sus personajes y datos propios accesibles. Sus campañas propias se cierran y quedan inaccesibles, pero Firestore puede conservar documentos internos huérfanos porque el cliente no dispone de borrado recursivo administrativo.
- App Check es opcional y complementa las reglas, pero no las reemplaza.

## Despliegue

Solo se despliegan reglas e índices de Firestore:

```powershell
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project dnd-character-sheet-online
```

En Firebase Authentication deben estar activados los proveedores Google y Anónimo, y `adrixton2.github.io` debe figurar como dominio autorizado.

## Persistencia y privacidad del dispositivo

Firestore usa persistencia IndexedDB multipestaña. Los personajes también mantienen una copia local asociada al UID para arrancar offline. Al cerrar sesión se cancelan listeners, se eliminan las claves locales sensibles y se limpia la persistencia de Firestore antes de recargar. Una cuenta invitada no puede cerrar sesión sin vincularse, evitando perder accidentalmente el único acceso.

Las fichas completas son accesibles exclusivamente por su propietario. El Máster recibe únicamente el resumen compartido necesario para dirigir; no recibe el documento privado `characters` ni `memberPrivate`.
