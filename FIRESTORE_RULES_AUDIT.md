# Auditoría de reglas de Firestore

Fecha de referencia: 2026-07-19. Se ha auditado
[`firestore.rules`](firestore.rules) contra los listeners y payloads presentes
en `app.jsx`. Este archivo no despliega reglas ni cambia la aplicación.

## Hallazgos que requieren decisión

### 1. Un miembro que salió sigue teniendo acceso efectivo

**Severidad: alta.** `isRoomMember(roomCode)` solo usa `exists(...)`. Al salir,
la aplicación conserva `members/{uid}` y cambia `active` a `false`; por ello el
usuario conserva las autorizaciones que dependen de `isRoomMember`, incluidas
lecturas de participantes, combatientes públicos y efectos públicos.

Además, el propio usuario puede actualizar `active` de su miembro. Esto permite
que un miembro previamente salido se reactive sin pasar de nuevo por el flujo
de unión, incluso cuando la sala esté cerrada.

**Corrección propuesta, pendiente de aprobación:** hacer que `isRoomMember`
exija `get(memberPath(...)).data.active == true`, y separar una función
`isOwnMember` si es necesario para permitir que un usuario inactive su propio
miembro al salir. Hay que probar antes creación de sala, reentrada y cierre.

### 2. Cualquier usuario autenticado puede leer una sala si conoce el código

**Severidad: media.** `allow get: if isSignedIn()` en `rooms/{roomCode}` no
exige pertenencia. No permite listar salas, pero expone metadatos de una sala
adivinada o cuyo código se haya compartido: propietario, estado, ronda y orden
de turno.

**Corrección propuesta, pendiente de aprobación:** permitir `get` al
propietario o miembro activo. La pantalla de unión necesita comprobar que una
sala existe antes de crear el miembro; ese flujo requerirá una ruta específica
de lectura mínima o una adaptación controlada del proceso de unión.

### 3. Tipos de participante no se revalidan completamente en actualizaciones

**Severidad: media.** La creación verifica `level`, PV, CA, condiciones y
conexión; la actualización del propietario no comprueba que `level` siga siendo
un número ni limita sus rangos. El cliente normaliza el payload actual, pero
las reglas no fuerzan todos esos invariantes.

**Corrección propuesta, pendiente de aprobación:** añadir los mismos chequeos
de tipo y rango a la rama de actualización propia. `initiative` debe aceptar
`number` o `null`, porque el flujo de preparación admite iniciativas vacías.

### 4. Tipos de enemigos y efectos dependen completamente del cliente Máster

**Severidad: baja.** Solo el Máster puede escribir enemigos y efectos privados,
por lo que no es una escalada de privilegios. Aun así, las reglas no validan
tipos ni límites para varios campos de enemigos y efectos. Un payload erróneo
del cliente puede dejar datos que la UI no entienda.

**Corrección propuesta, pendiente de aprobación:** validar tipos y tamaños de
campos de texto cuando se toque el esquema; hacerlo como cambio separado para
no bloquear salas existentes.

## Compatibilidad comprobada

- El payload público de participante usa los campos permitidos, incluido
  `level` normalizado como número y `avatarDataUrl` opcional reducido.
- Los payloads de enemigos públicos y privados respetan los conjuntos de
  claves que permiten las reglas.
- Los efectos públicos usan `requiresConcentration`, que es el campo aceptado
  por las reglas. La UI mantiene compatibilidad de lectura con el nombre
  legado `concentration`.
- La creación del miembro Máster usa la condición `getAfter` prevista para el
  batch que crea sala y miembro a la vez.

## Regresión que debe probarse antes de publicar reglas modificadas

1. Crear sala como Máster.
2. Unirse como jugador desde otro navegador.
3. Salir, recargar y reentrar con sala abierta.
4. Cerrar sala y confirmar que no se puede reactivar ni compartir personaje.
5. Compartir, actualizar y retirar un personaje.
6. Crear enemigo y efecto como Máster; crear efecto propio como jugador.
7. Confirmar que jugador no puede leer `privateEnemies` ni `effectsPrivate`.
