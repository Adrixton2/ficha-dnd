# Contrato de Firestore de Mesa Online

Este documento describe los documentos que usa actualmente `app.jsx`. Es una
referencia para revisar las reglas de Firestore antes de modificar Mesa Online.
La copia de las reglas auditadas está en [`firestore.rules`](firestore.rules) y
los hallazgos en [FIRESTORE_RULES_AUDIT.md](FIRESTORE_RULES_AUDIT.md). Ninguno
de estos archivos modifica Firebase por sí mismo.

## Principios

- El cliente no debe escribir datos locales completos de un personaje en una
  sala. Solo comparte el resumen público del participante.
- El propietario de `rooms/{roomCode}` es el Máster (`ownerUid`).
- Los documentos privados de enemigos solo se escuchan para el Máster.
- Los jugadores solo deben modificar su propio documento de participante y
  sus condiciones/efectos autorizados.
- Los campos enviados nunca deben contener `undefined`.

## Colecciones y responsabilidades

| Ruta | Lectura | Escritura prevista | Datos principales |
| --- | --- | --- | --- |
| `rooms/{code}` | Miembros activos | Creador para crear/cerrar; Máster para estado de encuentro | `ownerUid`, `status`, `round`, `turnOrder`, `turnIndex`, `currentTurnId` |
| `rooms/{code}/members/{uid}` | Miembros activos | El propio usuario al entrar/salir; Máster al crear su miembro | `uid`, `role`, `displayName`, `active`, `joinedAt` |
| `rooms/{code}/participants/{uid}` | Miembros activos | Dueño del personaje para compartir/actualizar; Máster para vida e iniciativa | resumen público del PJ, PV, CA, iniciativa, condiciones |
| `rooms/{code}/publicCombatants/{id}` | Miembros activos | Solo Máster | enemigo público: nombre, iniciativa, estado visible, avatar reducido, condiciones visibles |
| `rooms/{code}/privateEnemies/{id}` | Solo Máster | Solo Máster | PV exactos, CA, notas y condiciones privadas del enemigo |
| `rooms/{code}/effectsPublic/{id}` | Miembros activos | Máster o dueño autorizado del efecto de jugador | efectos visibles para jugadores |
| `rooms/{code}/effectsPrivate/{id}` | Solo Máster | Máster, salvo que las reglas permitan expresamente el caso de propietario | efectos privados |

## Payload público de participante

`shareLocalCharacter` construye explícitamente el payload. Para creación debe
permitir los siguientes campos y tipos:

```text
id: string                 // igual al uid del dueño
ownerUid: string           // igual al uid autenticado
type: "player"
characterId: string
name: string
className: string
level: number              // entero >= 1
currentHp: number
maxHp: number              // >= 0
tempHp: number             // >= 0
armorClass: number         // >= 0
initiative: number | null
conditions: array
connected: boolean
joinedAt: server timestamp // solo al crear
updatedAt: server timestamp
lastUpdatedBy: string
updateSource: string
avatarDataUrl: string      // opcional, solo data URL reducida válida
```

En actualización no deben modificarse `id`, `ownerUid`, `type` ni `joinedAt`.
La validación del nivel como número es obligatoria: un nivel guardado
localmente como texto se normaliza antes de escribir.

## Revisión obligatoria de reglas

Antes de publicar cambios de permisos, comprobar en Firebase Console:

1. Que `members/{uid}` impide que un jugador se asigne `role: "master"`.
2. Que `participants/{uid}` exige `request.auth.uid == participantId` y
   `ownerUid == request.auth.uid` al crear.
3. Que `publicCombatants` y `privateEnemies` solo permiten escritura al
   `ownerUid` de la sala.
4. Que `privateEnemies` y `effectsPrivate` no se pueden leer desde un cliente
   jugador.
5. Que las listas de campos y tipos coinciden con los payloads actuales.
6. Que `status: "closed"` bloquea nuevas altas y escrituras no necesarias.

## Límite conocido

Las reglas exportadas ya están versionadas como referencia. Antes de tratarlas
como fuente de despliegue hay que confirmar que coinciden con Firebase Console
y adoptar Firebase CLI o un flujo equivalente de publicación controlada.
