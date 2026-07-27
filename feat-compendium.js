/* Compendio breve de dotes para D&D 5e (reglas 2014).
 * Incluye entradas SRD y nombres/efectos resumidos de Tasha. No reproduce
 * texto extenso de los libros: cada dote se guarda como una copia editable. */
(function () {
    const feat = (id, name, source, summary, prerequisites = '') => ({
        id, name, source, summary, prerequisites
    });

    const feats = [
        feat('srd-alert', 'Alerta', 'SRD 5.1', '+5 a iniciativa; no puedes ser sorprendido mientras estés consciente y los atacantes invisibles para ti no tienen ventaja por ello.'),
        feat('srd-actor', 'Actor', 'SRD 5.1', '+1 a Carisma (máx. 20); ventaja al engañar haciéndote pasar por otra persona y puedes imitar voces tras escucharlas 1 minuto.', 'Carisma 13 o más'),
        feat('srd-athlete', 'Atleta', 'SRD 5.1', '+1 a Fuerza o Destreza (máx. 20); levantarte cuesta 5 pies, trepar no cuesta movimiento extra y mejoras el salto con carrera.'),
        feat('srd-charger', 'Carga', 'SRD 5.1', 'Tras usar Correr, puedes atacar cuerpo a cuerpo como acción adicional con +5 al daño, o empujar 10 pies si tienes éxito.'),
        feat('srd-crossbow-expert', 'Experto en ballestas', 'SRD 5.1', 'Ignoras la propiedad de carga, disparas a corta distancia sin desventaja y puedes usar una ballesta de mano como acción adicional.'),
        feat('srd-defensive-duelist', 'Duelista defensivo', 'SRD 5.1', 'Con un arma sutil y una reacción, añades tu bonificador de competencia a la CA contra un ataque cuerpo a cuerpo.', 'Destreza 13 o más'),
        feat('srd-dual-wielder', 'Combatiente con dos armas', 'SRD 5.1', '+1 a la CA al empuñar dos armas; puedes usar armas de una mano no ligeras y desenfundar o guardar dos armas a la vez.'),
        feat('srd-dungeon-delver', 'Explorador de mazmorras', 'SRD 5.1', 'Ventaja para detectar puertas secretas; ventaja en salvaciones contra trampas, resistencia a su daño y puedes avanzar a paso normal al buscarlas.'),
        feat('srd-durable', 'Resistente', 'SRD 5.1', '+1 a Constitución (máx. 20); al gastar un Dado de Golpe recuperas al menos el doble de tu modificador de Constitución.'),
        feat('srd-elemental-adept', 'Adepto elemental', 'SRD 5.1', 'Elige ácido, frío, fuego, rayo o trueno: tus conjuros ignoran resistencia y los 1 en sus dados de daño cuentan como 2.', 'Capacidad para lanzar al menos un conjuro'),
        feat('srd-grappler', 'Luchador', 'SRD 5.1', 'Ventaja al atacar a una criatura que agarres; puedes usar una acción para intentar inmovilizarla a ella y a ti.', 'Fuerza 13 o más'),
        feat('srd-great-weapon-master', 'Maestro de armas a dos manos', 'SRD 5.1', 'Tras crítico o derrota, un ataque cuerpo a cuerpo adicional como acción adicional. Antes de impactar: -5 al ataque para +10 al daño.'),
        feat('srd-heavily-armored', 'Entrenamiento con armadura pesada', 'SRD 5.1', '+1 a Fuerza (máx. 20) y competencia con armadura pesada.', 'Competencia con armadura media'),
        feat('srd-heavy-armor-master', 'Maestro de armadura pesada', 'SRD 5.1', '+1 a Fuerza (máx. 20); con armadura pesada reduces en 3 el daño contundente, perforante y cortante no mágico.', 'Competencia con armadura pesada'),
        feat('srd-inspiring-leader', 'Líder inspirador', 'SRD 5.1', 'Tras 10 minutos, hasta 6 criaturas obtienen PG temporales iguales a tu nivel + modificador de Carisma; se repite tras un descanso corto o largo.', 'Carisma 13 o más'),
        feat('srd-keen-mind', 'Mente aguda', 'SRD 5.1', '+1 a Inteligencia (máx. 20); recuerdas hasta un mes, conoces norte y horas restantes hasta amanecer/anochecer.'),
        feat('srd-lightly-armored', 'Entrenamiento con armadura ligera', 'SRD 5.1', '+1 a Fuerza o Destreza (máx. 20) y competencia con armadura ligera.'),
        feat('srd-linguist', 'Lingüista', 'SRD 5.1', '+1 a Inteligencia (máx. 20), aprendes 3 idiomas y puedes crear códigos escritos difíciles de descifrar.'),
        feat('srd-lucky', 'Afortunado', 'SRD 5.1', 'Obtienes 3 puntos de suerte por descanso largo para tirar 1d20 adicional en un ataque, prueba, salvación o ataque contra ti.'),
        feat('srd-mage-slayer', 'Asesino de magos', 'SRD 5.1', 'Cuando una criatura a 5 pies lanza un conjuro, reaccionas con un ataque; tienes ventaja en sus salvaciones y desventaja para su concentración al dañarla.'),
        feat('srd-magic-initiate', 'Iniciado en la magia', 'SRD 5.1', 'Elige bardo, clérigo, druida, hechicero, brujo o mago: aprendes 2 trucos y 1 conjuro de nivel 1, lanzable 1 vez por descanso largo.'),
        feat('srd-martial-adept', 'Adepto marcial', 'SRD 5.1', 'Aprendes 2 maniobras de guerrero y obtienes 1 dado de superioridad d6, recuperado tras descanso corto o largo.'),
        feat('srd-medium-armor-master', 'Maestro de armadura media', 'SRD 5.1', 'Con armadura media puedes aplicar hasta +3 de Destreza a la CA y no sufres desventaja en Sigilo.', 'Competencia con armadura media'),
        feat('srd-mobile', 'Móvil', 'SRD 5.1', '+10 pies a velocidad; Correr ignora terreno difícil y una criatura a la que ataques no puede hacerte ataque de oportunidad ese turno.'),
        feat('srd-moderately-armored', 'Entrenamiento con armadura media', 'SRD 5.1', '+1 a Fuerza o Destreza (máx. 20) y competencia con armadura media y escudos.', 'Competencia con armadura ligera'),
        feat('srd-mounted-combatant', 'Combatiente montado', 'SRD 5.1', 'Ventaja al atacar criaturas sin montura menores que tu montura; puedes recibir sus ataques y tu montura obtiene ventaja en salvaciones de Destreza.'),
        feat('srd-observant', 'Observador', 'SRD 5.1', '+1 a Inteligencia o Sabiduría (máx. 20); lees labios y obtienes +5 a Percepción e Investigación pasivas.'),
        feat('srd-polearm-master', 'Maestro de armas de asta', 'SRD 5.1', 'Tras atacar con alabarda, guja, lanza o bastón, haces 1 ataque adicional de 1d4 con acción adicional; reaccionas al entrar un enemigo en tu alcance.'),
        feat('srd-resilient', 'Resiliente', 'SRD 5.1', '+1 a una característica (máx. 20) y competencia en las tiradas de salvación de esa característica.'),
        feat('srd-ritual-caster', 'Lanzador ritual', 'SRD 5.1', 'Obtienes un libro con 2 rituales de nivel 1 y puedes copiar otros rituales que encuentres.', 'Inteligencia o Sabiduría 13 o más'),
        feat('srd-savage-attacker', 'Atacante salvaje', 'SRD 5.1', '1 vez por turno, al tirar daño de un ataque cuerpo a cuerpo con arma, puedes repetir todos sus dados y usar cualquiera de los resultados.'),
        feat('srd-sentinel', 'Centinela', 'SRD 5.1', 'Un ataque de oportunidad que impacte reduce la velocidad a 0; reaccionas contra una criatura a 5 pies que ataque a un aliado.'),
        feat('srd-sharpshooter', 'Tirador experto', 'SRD 5.1', 'Ignoras alcance largo y cobertura parcial o media. Antes de impactar: -5 al ataque para +10 al daño con arma a distancia.'),
        feat('srd-shield-master', 'Maestro de escudos', 'SRD 5.1', 'Tras Atacar, puedes empujar con el escudo como acción adicional; añades su CA a ciertas salvaciones de Destreza y puedes evitar daño al superarlas.', 'Competencia con escudos'),
        feat('srd-skilled', 'Hábil', 'SRD 5.1', 'Obtienes competencia en 3 habilidades o herramientas a elección.'),
        feat('srd-skulker', 'Sigiloso', 'SRD 5.1', 'Puedes ocultarte con luz tenue, no revelas tu posición al fallar un ataque a distancia oculto y ves sin penalización en penumbra.', 'Destreza 13 o más'),
        feat('srd-spell-sniper', 'Francotirador de conjuros', 'SRD 5.1', 'Aprendes 1 truco de ataque; su alcance se duplica e ignoras cobertura media y tres cuartos con ataques de conjuro.', 'Capacidad para lanzar al menos un conjuro'),
        feat('srd-tavern-brawler', 'Luchador de taberna', 'SRD 5.1', '+1 a Fuerza o Constitución (máx. 20); tus golpes hacen 1d4 y, tras golpear con golpe sin armas o improvisado, puedes intentar agarrar como acción adicional.'),
        feat('srd-tough', 'Duro', 'SRD 5.1', '+2 PG máximos por cada nivel que tengas; se aplica también a niveles ya obtenidos.'),
        feat('srd-war-caster', 'Conjurador de guerra', 'SRD 5.1', 'Ventaja en salvaciones de Constitución para concentración; puedes usar componentes somáticos con manos ocupadas y lanzar 1 conjuro como ataque de oportunidad.', 'Capacidad para lanzar al menos un conjuro'),
        feat('srd-weapon-master', 'Maestro de armas', 'SRD 5.1', '+1 a Fuerza o Destreza (máx. 20) y competencia con 4 armas simples o marciales a elección.'),
        feat('tasha-chef', 'Chef', 'Caldero de Tasha', '+1 a Constitución o Sabiduría (máx. 20); durante descanso corto preparas comida que cura 1d8 + competencia, y tras descanso largo creas golosinas con PG temporales iguales a competencia.'),
        feat('tasha-crusher', 'Aplastador', 'Caldero de Tasha', '+1 a Fuerza o Constitución (máx. 20); 1 vez por turno puedes mover 5 pies al objetivo de daño contundente y tus críticos conceden ventaja contra él hasta tu próximo turno.'),
        feat('tasha-eldritch-adept', 'Adepto de lo oculto', 'Caldero de Tasha', 'Obtienes 1 invocación sobrenatural sin prerrequisito de nivel; puedes cambiarla al subir un nivel que conceda mejora de característica.', 'Capacidad para lanzar al menos un conjuro o Magia de pacto'),
        feat('tasha-fey-touched', 'Tocado por las hadas', 'Caldero de Tasha', '+1 a Inteligencia, Sabiduría o Carisma (máx. 20); aprendes Paso brumoso y un conjuro de nivel 1, cada uno 1 vez por descanso largo.'),
        feat('tasha-fighting-initiate', 'Iniciado en estilo de combate', 'Caldero de Tasha', 'Aprendes 1 estilo de combate de guerrero y puedes cambiarlo al subir un nivel que conceda mejora de característica.', 'Competencia con un arma marcial'),
        feat('tasha-gunner', 'Artillero', 'Caldero de Tasha', '+1 a Destreza (máx. 20), competencia con armas de fuego, ignoras carga y no sufres desventaja por disparar a 5 pies.'),
        feat('tasha-metamagic-adept', 'Adepto de metamagia', 'Caldero de Tasha', 'Aprendes 2 opciones de metamagia y obtienes 2 puntos de hechicería, recuperados tras descanso largo.', 'Capacidad para lanzar al menos un conjuro'),
        feat('tasha-piercer', 'Perforador', 'Caldero de Tasha', '+1 a Fuerza o Destreza (máx. 20); 1 vez por turno repites un dado de daño perforante y añades 1 dado extra en críticos.'),
        feat('tasha-poisoner', 'Envenenador', 'Caldero de Tasha', 'Ignoras resistencia al daño de veneno, aplicas veneno como acción adicional y puedes fabricar una dosis de CD 14 por 50 po durante un descanso largo.'),
        feat('tasha-shadow-touched', 'Tocado por las sombras', 'Caldero de Tasha', '+1 a Inteligencia, Sabiduría o Carisma (máx. 20); aprendes Invisibilidad y un conjuro de nivel 1, cada uno 1 vez por descanso largo.'),
        feat('tasha-skill-expert', 'Experto en habilidades', 'Caldero de Tasha', '+1 a una característica (máx. 20), competencia en 1 habilidad y pericia en 1 habilidad con competencia.'),
        feat('tasha-slasher', 'Cortador', 'Caldero de Tasha', '+1 a Fuerza o Destreza (máx. 20); 1 vez por turno reduces 10 pies la velocidad tras daño cortante y los críticos dan desventaja a sus ataques.'),
        feat('tasha-telekinetic', 'Telequinético', 'Caldero de Tasha', '+1 a Inteligencia, Sabiduría o Carisma (máx. 20); obtienes Mano de mago invisible a 60 pies y puedes mover una criatura 5 pies con una acción adicional.'),
        feat('tasha-telepathic', 'Telepático', 'Caldero de Tasha', '+1 a Inteligencia, Sabiduría o Carisma (máx. 20); telepatía a 60 pies y Detectar pensamientos 1 vez por descanso largo.')
    ];

    window.DndFeatCompendium = { feats };
})();
