# Contrato de datos locales

Este documento describe los datos que pertenecen al dispositivo. No sustituye a
las reglas de Firestore: Mesa Online tiene su propio contrato en
`FIRESTORE_CONTRACT.md`.

## Principio general

La ficha es **local-first**. Los personajes completos se guardan en
`localStorage`; Firebase solo almacena el estado público o privado mínimo para
una Mesa Online. Un cambio local no debe requerir conexión a Internet.

La única fuente de verdad de personajes es el gestor versionado de
`src/shared/utils/app-utils.js` y `src/services/character-storage.js`:

```text
dnd_character_manager_v1
{
  version: 1,
  activeCharacterId: string,
  characters: Record<string, CharacterRecord>
}
```

## Registro de personaje

```text
CharacterRecord {
  meta: {
    id: string,
    name: string,
    portrait: data URL de PNG/JPEG/WebP o cadena vacía,
    createdAt: ISO string,
    updatedAt: ISO string
  },
  data: CharacterData
}
```

`meta.id` identifica el perfil y nunca se reutiliza. Al duplicar o importar se
crea un identificador nuevo. El retrato pertenece al perfil, no a la UI ni a
una sala online.

## CharacterData

Los campos principales son:

- `charInfo`: nombre visible, especie y clase escritos por el jugador.
- `level`: texto numérico, normalmente de `1` a `20`.
- `characterBuild`: referencias opcionales a clase, subclase, especie y
  trasfondo conocidos; además contiene elecciones de competencias/pericia y
  preferencias de automatización.
- `narrative`: perfil interpretativo con alineamiento, datos físicos,
  personalidad, ideales, vínculos, defectos, relaciones, objetivos, fe e
  historia. Todos sus campos son texto opcional y no afectan a los cálculos.
- `presentation`: preferencias locales de identidad y perfil compartible
  (acento, lema, privacidad y referencias a un rasgo, objeto y conjuro
  emblemáticos). Solo referencia datos existentes y no altera sus reglas.
- `hp`, `hitDice`, `stats`, `tempStats`, `savingThrows`, `proficiencies`:
  valores de ficha y combate local.
- `proficiencyEntries`: competencias consultables que no forman parte de las
  habilidades (idiomas, armas, armaduras, escudos, herramientas,
  instrumentos, juegos, vehículos y entradas personalizadas). Cada entrada
  guarda categoría, nombre y procedencia. Las habilidades y pericias siguen
  derivándose de `proficiencies` y `characterBuild` para no duplicar datos.
  Las sugerencias SRD añaden `autoKey` para poder reconciliarlas cuando cambia
  la clase, especie o trasfondo; nombre y procedencia continúan siendo
  editables. `hidden` permite descartar una sugerencia sin que reaparezca al
  recargar la ficha.
- `resources`, `weapons`, `armors`, `tools`, `inventory`, `currency`:
  listas del equipo y recursos.
  Las armas pueden declarar `usesAmmo`, `ammoItemId` y `ammoPerShot` para
  consumir una pila concreta de `inventory`. La cantidad del objeto de
  inventario es la única fuente de verdad; el arma no guarda un contador
  duplicado.
- `traits`, `feats`, `spells`: contenido manual del personaje. Los rasgos de
  reglas se calculan desde los catálogos; no se mezclan con los manuales.
- `grimoireConfig`, `spellLimits`, `spellSlots`: configuración y recursos del
  grimorio.
- `activeConcentration`: recordatorio manual del conjuro de concentración
  activo, con identificador, nombre y fecha de inicio. No ejecuta tiradas ni
  salvaciones automáticas.
  Cada conjuro puede incluir `grantType`, `grantSource`, `countsPreparation`,
  `countsKnownLimit`, `castingResource` y usos propios. Los usos de
  concesiones automáticas se guardan en `spellGrantUses`.
  Cada conjuro puede incluir `grantType`, `grantSource`, `countsPreparation`,
  `countsKnownLimit`, `castingResource` y usos propios. Los usos de
  concesiones automáticas se guardan en `spellGrantUses`.
- `conditions`, `timers`, `activityLog`, `sessionNotes`: seguimiento de
  partida local.

Un personaje nuevo se crea vacío: nivel `1`, contadores técnicos a cero y
arrays vacíos. No hereda el equipo ni datos del personaje anterior.

## Normalización y migración

Antes de usar un perfil, `normalizeGrimoireData` completa campos que puedan
faltar en fichas antiguas. La normalización debe:

1. Mantener los valores manuales existentes.
2. Añadir valores neutros a los campos nuevos.
3. Convertir listas inexistentes en arrays vacíos.
4. Limitar retratos y datos importados a formatos válidos.
5. No escribir cambios en otros perfiles.

No se debe asumir que todos los personajes contienen el esquema más reciente.
Si se añade un campo persistente, hay que actualizar el valor por defecto y la
normalización juntos.

## Catálogos locales

Los catálogos de reglas no son fichas ni se guardan por personaje:

- `srd-character-rules.js`: clases, subclases, especies, trasfondos y rasgos.
- `srd-spellcasting-profiles.js`: progresión de lanzador y ranuras.
- `src/data/spell-library-srd51-es.js`: compendio de conjuros.
- `feat-compendium.js`: compendio de dotes.
- `src/data/monster-compendium-srd51.js`: criaturas del compendio de Bestiario.
- `phb2014-expansion.js` y `eberron-character-expansion.js`: ampliaciones de
  reglas estructuradas.

Las fichas guardan elecciones o copias de datos de usuario, nunca una copia
entera de estos catálogos.

## Bestiario local

El Bestiario usa `dnd_master_bestiary_v1` y, antes de reemplazos, puede crear
`dnd_master_bestiary_backup_v1`. Una plantilla tiene como mínimo `id`, `name`,
`maxHp`, `armorClass`, etiquetas y notas privadas. Una aparición de enemigo en
una sala online es una entidad distinta: modificarla nunca debe cambiar su
plantilla local.

## Configuración y sesión

- `dnd_app_settings_v1`: tema, idioma y tamaño de texto globales.
- `dnd_online_table_v1`: código y rol de la última sala, para reentrada.
- `dnd_online_hp_pending_v1`: cola local de sincronización de vida pendiente.

Estos valores no se incluyen en la exportación de personaje porque pertenecen
al dispositivo o a la sesión, no a una ficha individual.

## Exportación e importación

Una exportación de personaje contiene `format`, `schemaVersion`, fecha y un
único `character` con `meta` y `data`. No incluye otros personajes, sala activa,
UI, modales ni ajustes globales. La importación valida completamente el archivo
antes de modificar el gestor y crea siempre un perfil nuevo.

## Invariantes que deben conservarse

1. No mutar arrays o objetos de estado React directamente.
2. No crear una segunda fuente de verdad para el personaje activo.
3. Mantener los identificadores de perfil como cadenas únicas.
4. Usar copias profundas al duplicar o exportar datos persistentes.
5. Validar y normalizar antes de guardar datos externos.
6. Mantener separados los datos locales completos y los documentos mínimos de
   Mesa Online.
