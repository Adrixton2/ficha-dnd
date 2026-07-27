/* Ampliación de opciones de personaje para reglas 2014.
 * Datos mecánicos resumidos, sin transcribir el Manual del Jugador. */
(function () {
    const rules = window.DndSrdCharacterRules;
    if (!rules) return;

    const feature = (id, name, level, source, description) => ({ id, name, level, source, description });
    const subclass = (id, classId, name, aliases, entries) => ({
        id, classId, name, aliases,
        features: entries.map(([level, featureName, description], index) => feature(`${id}-${level}-${index}`, featureName, level, 'subclass', description))
    });
    const species = (id, name, aliases, speed, size, abilityBonuses, entries) => ({
        id, name, aliases, speed, size, abilityBonuses,
        traits: entries.map(([traitName, description], index) => feature(`${id}-${index}`, traitName, 1, 'species', description))
    });
    const mergeMissing = (target, entries) => Object.entries(entries).forEach(([id, entry]) => {
        if (!target[id]) target[id] = entry;
    });

    mergeMissing(rules.subclasses, {
        'totem-warrior': subclass('totem-warrior', 'barbarian', 'Senda del guerrero tótem', ['guerrero totem', 'totem warrior'], [
            [3, 'Buscador espiritual', 'Puedes lanzar conjuros de comunión animal y sentido de las bestias como rituales.'],
            [3, 'Espíritu tótem', 'Elige un espíritu animal que mejora tu ira; la elección se gestiona manualmente.'],
            [6, 'Aspecto de la bestia', 'Obtienes un beneficio de exploración según el aspecto animal elegido.'],
            [10, 'Caminante espiritual', 'Puedes lanzar comunión con la naturaleza como ritual.'],
            [14, 'Sintonía tótem', 'Obtienes una mejora de combate según el espíritu animal elegido.']
        ]),
        valor: subclass('valor', 'bard', 'Colegio del valor', ['colegio del valor', 'valor'], [
            [3, 'Competencias adicionales', 'Obtienes competencia con armadura media, escudos y armas marciales.'],
            [3, 'Inspiración de combate', 'Tu inspiración puede aumentar daño o CA de un aliado.'],
            [6, 'Ataque adicional', 'Puedes atacar dos veces al realizar la acción Atacar.'],
            [14, 'Magia de batalla', 'Tras lanzar un conjuro de bardo, puedes realizar un ataque con arma como acción adicional.']
        ]),
        knowledge: subclass('knowledge', 'cleric', 'Dominio del conocimiento', ['dominio del conocimiento', 'knowledge'], [
            [1, 'Bendiciones del conocimiento', 'Obtienes idiomas y competencia reforzada en dos habilidades de conocimiento.'],
            [2, 'Canalizar divinidad: conocimiento de las eras', 'Obtienes competencia temporal con una habilidad o herramienta.'],
            [6, 'Canalizar divinidad: leer pensamientos', 'Puedes leer pensamientos superficiales y usar su conocimiento contra una criatura.'],
            [8, 'Lanzamiento potente', 'Añades tu modificador de Sabiduría al daño de tus trucos de clérigo.'],
            [17, 'Visiones del pasado', 'Puedes recibir visiones sobre un objeto o lugar mediante plegaria.']
        ]),
        light: subclass('light', 'cleric', 'Dominio de la luz', ['dominio de la luz', 'light'], [
            [1, 'Truco adicional', 'Aprendes el truco luz si no lo conoces.'],
            [1, 'Resplandor protector', 'Usas una reacción para imponer desventaja a un ataque cercano que te alcance a ti o a un aliado.'],
            [2, 'Canalizar divinidad: resplandor del alba', 'Disipas oscuridad mágica e infliges daño radiante a enemigos cercanos.'],
            [6, 'Resplandor mejorado', 'Puedes proteger a otra criatura con tu Resplandor protector.'],
            [8, 'Lanzamiento potente', 'Añades Sabiduría al daño de tus trucos de clérigo.'],
            [17, 'Corona de luz', 'Emites luz intensa y los enemigos tienen desventaja contra tus salvaciones de fuego o radiante.']
        ]),
        nature: subclass('nature', 'cleric', 'Dominio de la naturaleza', ['dominio de la naturaleza', 'nature'], [
            [1, 'Acólito de la naturaleza', 'Aprendes un truco de druida, una habilidad natural y competencia con armadura pesada.'],
            [2, 'Canalizar divinidad: cautivar animales y plantas', 'Puedes obligar a bestias y plantas cercanas a evitarte.'],
            [6, 'Amortiguar elementos', 'Usas una reacción para dar resistencia a ácido, frío, fuego, rayo o trueno.'],
            [8, 'Golpe divino', 'Una vez por turno añades 1d8 de daño extra de un tipo elemental a un ataque con arma.'],
            [17, 'Maestro de la naturaleza', 'Puedes gastar Canalizar divinidad para controlar brevemente bestias o plantas.']
        ]),
        tempest: subclass('tempest', 'cleric', 'Dominio de la tempestad', ['dominio de la tempestad', 'tempest'], [
            [1, 'Competencias adicionales', 'Obtienes armadura pesada y armas marciales.'],
            [1, 'Ira de la tormenta', 'Al recibir un ataque cercano puedes reaccionar para infligir 2d8 de rayo o trueno.'],
            [2, 'Canalizar divinidad: ira destructora', 'Maximizas daño de rayo o trueno de un conjuro o Canalizar divinidad.'],
            [6, 'Golpe atronador', 'Al infligir rayo a una criatura grande o menor puedes empujarla 10 pies.'],
            [8, 'Golpe divino', 'Una vez por turno añades 1d8 de daño de trueno a un ataque con arma.'],
            [17, 'Nacido de la tormenta', 'Obtienes velocidad de vuelo igual a tu velocidad mientras no estés bajo tierra ni en interiores.']
        ]),
        trickery: subclass('trickery', 'cleric', 'Dominio del engaño', ['dominio del engaño', 'trickery'], [
            [1, 'Bendición del embaucador', 'Das ventaja en Sigilo a una criatura durante 1 hora.'],
            [2, 'Canalizar divinidad: invocar duplicidad', 'Creas una ilusión duplicada que mejora tus conjuros y engaños.'],
            [6, 'Canalizar divinidad: manto de sombras', 'Te vuelves invisible hasta tu siguiente turno.'],
            [8, 'Golpe divino', 'Una vez por turno añades 1d8 de daño de veneno a un ataque con arma.'],
            [17, 'Duplicidad mejorada', 'Puedes crear hasta cuatro duplicados ilusorios.']
        ]),
        war: subclass('war', 'cleric', 'Dominio de la guerra', ['dominio de la guerra', 'war'], [
            [1, 'Competencias adicionales', 'Obtienes armadura pesada y armas marciales.'],
            [1, 'Sacerdote de guerra', 'Puedes hacer un ataque con arma como acción adicional un número limitado de veces por descanso largo.'],
            [2, 'Canalizar divinidad: golpe guiado', 'Obtienes +10 a una tirada de ataque después de verla.'],
            [6, 'Bendición del dios de la guerra', 'Puedes dar +10 al ataque de otra criatura a 30 pies.'],
            [8, 'Golpe divino', 'Una vez por turno añades 1d8 de daño del arma a un ataque con arma.'],
            [17, 'Avatar de batalla', 'Obtienes resistencia al daño contundente, perforante y cortante no mágico.']
        ]),
        moon: subclass('moon', 'druid', 'Círculo de la luna', ['circulo de la luna', 'moon'], [
            [2, 'Forma de combate salvaje', 'Puedes transformarte como acción adicional y usar formas más poderosas.'],
            [2, 'Círculo de las formas', 'Puedes gastar ranuras para curarte mientras estás en Forma salvaje.'],
            [6, 'Golpes primigenios', 'Tus ataques de bestia cuentan como mágicos.'],
            [10, 'Forma salvaje elemental', 'Puedes gastar dos usos de Forma salvaje para adoptar una forma elemental.'],
            [14, 'Mil formas', 'Puedes lanzar alterar el propio ser a voluntad.']
        ]),
        'battle-master': subclass('battle-master', 'fighter', 'Maestro de batalla', ['maestro de batalla', 'battle master'], [
            [3, 'Superioridad en combate', 'Aprendes 3 maniobras y obtienes 4d8 de superioridad, recuperados tras descanso corto o largo.'],
            [3, 'Estudiante de la guerra', 'Obtienes competencia con una herramienta artesanal.'],
            [7, 'Conoce a tu enemigo', 'Tras observar 1 minuto, comparas capacidades de combate con una criatura.'],
            [10, 'Superioridad mejorada', 'Tus dados de superioridad pasan a d10 y aprendes 2 maniobras más.'],
            [15, 'Implacable', 'Al tirar iniciativa sin dados de superioridad, recuperas 1.'],
            [18, 'Superioridad mejorada', 'Tus dados de superioridad pasan a d12.']
        ]),
        shadow: subclass('shadow', 'monk', 'Camino de las sombras', ['camino de las sombras', 'shadow'], [
            [3, 'Artes sombrías', 'Puedes gastar 2 puntos de ki para lanzar oscuridad, visión en la oscuridad, pasar sin rastro o silencio.'],
            [6, 'Paso sombrío', 'Con luz tenue u oscuridad te teletransportas hasta 60 pies como acción adicional y tienes ventaja en tu siguiente ataque cuerpo a cuerpo.'],
            [11, 'Manto de sombras', 'Puedes volverte invisible en luz tenue u oscuridad mientras permanezcas inmóvil.'],
            [17, 'Oportunista', 'Cuando una criatura a 5 pies recibe un impacto de otra criatura, reaccionas con un ataque cuerpo a cuerpo.']
        ]),
        elements: subclass('elements', 'monk', 'Camino de los cuatro elementos', ['cuatro elementos', 'four elements'], [
            [3, 'Discípulo de los elementos', 'Aprendes disciplinas elementales que gastan puntos de ki; elige y gestiona las disciplinas manualmente.'],
            [6, 'Discípulo de los elementos', 'Aprendes una disciplina elemental adicional.'],
            [11, 'Discípulo de los elementos', 'Aprendes una disciplina elemental adicional.'],
            [17, 'Discípulo de los elementos', 'Aprendes una disciplina elemental adicional.']
        ]),
        ancients: subclass('ancients', 'paladin', 'Juramento de los ancestros', ['juramento de los ancestros', 'ancients'], [
            [3, 'Canalizar divinidad', 'Obtienes las opciones Ira de la naturaleza y Expulsar a los infieles.'],
            [7, 'Aura de protección mágica', 'Tú y aliados cercanos tenéis resistencia al daño de conjuros.'],
            [15, 'Centinela inmortal', 'Al llegar a 0 PG sin morir, puedes quedar a 1 PG una vez por descanso largo.'],
            [20, 'Campeón ancestral', 'Como acción, adoptas una forma que te mejora durante 1 minuto.']
        ]),
        vengeance: subclass('vengeance', 'paladin', 'Juramento de venganza', ['juramento de venganza', 'vengeance'], [
            [3, 'Canalizar divinidad', 'Obtienes las opciones Renunciar al enemigo y Voto de enemistad.'],
            [7, 'Vengador implacable', 'Tras un ataque de oportunidad puedes moverte hasta la mitad de tu velocidad sin provocar ataques.'],
            [15, 'Alma vengativa', 'Tu objetivo de Voto de enemistad recibe contraataques cuando te golpea.'],
            [20, 'Ángel vengador', 'Como acción, obtienes vuelo y un aura que asusta enemigos durante 1 hora.']
        ]),
        beastmaster: subclass('beastmaster', 'ranger', 'Maestro de bestias', ['maestro de bestias', 'beast master'], [
            [3, 'Compañero de exploración', 'Obtienes una bestia compañera; sus datos se gestionan manualmente.'],
            [7, 'Entrenamiento excepcional', 'Tu bestia puede atacar, Correr, Retirarse o Ayudar como acción adicional.'],
            [11, 'Furia bestial', 'Cuando ordenas atacar, tu bestia puede realizar dos ataques.'],
            [15, 'Compartir conjuros', 'Con conjuros de objetivo propio puedes afectar también a tu bestia a 30 pies.']
        ]),
        assassin: subclass('assassin', 'rogue', 'Asesino', ['asesino', 'assassin'], [
            [3, 'Competencias adicionales', 'Obtienes competencia con kit de disfraz y kit de venenos.'],
            [3, 'Asesinar', 'Tienes ventaja contra criaturas que aún no han actuado; los impactos contra sorprendidos son críticos.'],
            [9, 'Infiltración experta', 'Puedes crear una identidad falsa tras tiempo y recursos.'],
            [13, 'Impostor', 'Puedes imitar de forma convincente el habla y conducta de otra persona.'],
            [17, 'Golpe de muerte', 'Contra un objetivo sorprendido, el daño de Ataque furtivo puede duplicarse si falla una salvación de Constitución.']
        ]),
        'wild-magic': subclass('wild-magic', 'sorcerer', 'Magia salvaje', ['magia salvaje', 'wild magic'], [
            [1, 'Oleada de magia salvaje', 'Tras lanzar un conjuro de nivel 1 o superior, el DM puede pedir una tirada para un efecto imprevisible.'],
            [1, 'Mareas del caos', 'Obtienes ventaja en una tirada y después el DM puede activar una Oleada de magia salvaje.'],
            [6, 'Doblar la suerte', 'Gastando 2 puntos de hechicería, añades o restas 1d4 a una tirada de otra criatura.'],
            [14, 'Caos controlado', 'Cuando tires en la tabla de oleadas, puedes tirar dos veces y elegir resultado.'],
            [18, 'Bombardeo de conjuros', 'Con daño de conjuro puedes aumentar el daño al obtener el valor máximo de un dado.']
        ]),
        archfey: subclass('archfey', 'warlock', 'El Archifey', ['archifey', 'el archifey'], [
            [1, 'Presencia feérica', 'Una vez por descanso corto o largo, puedes asustar o hechizar criaturas en un cubo de 10 pies.'],
            [6, 'Huida brumosa', 'Al recibir daño, reaccionas para volverte invisible y teletransportarte hasta 60 pies.'],
            [10, 'Defensas seductoras', 'Eres inmune a ser hechizado y puedes devolver el intento contra quien te hechice.'],
            [14, 'Delirio oscuro', 'Puedes hechizar e incapacitar temporalmente a una criatura en una ilusión.']
        ]),
        'great-old-one': subclass('great-old-one', 'warlock', 'El Gran Antiguo', ['gran antiguo', 'great old one'], [
            [1, 'Mente despierta', 'Puedes comunicarte telepáticamente a 30 pies con una criatura que conozca un idioma.'],
            [6, 'Protección entrópica', 'Impones desventaja a un ataque contra ti y, si falla, tienes ventaja contra el atacante.'],
            [10, 'Escudo de pensamientos', 'Obtienes resistencia al daño psíquico y quien te dañe con él recibe el mismo daño.'],
            [14, 'Crear sirviente', 'Puedes dominar indefinidamente a un humanoide incapacitado si falla una salvación.']
        ]),
        abjuration: subclass('abjuration', 'wizard', 'Escuela de abjuración', ['abjuracion', 'escuela de abjuracion'], [
            [2, 'Protección de abjuración', 'Al lanzar una abjuración de nivel 1 o superior creas un escudo de PG igual al doble de tu nivel + modificador de Inteligencia.'],
            [6, 'Protección proyectada', 'Usas una reacción para que tu escudo absorba daño de un aliado a 30 pies.'],
            [10, 'Abjuración mejorada', 'Añades competencia a pruebas de característica para dispersar magia.'],
            [14, 'Resistencia a conjuros', 'Tienes ventaja en salvaciones contra conjuros y resistencia a su daño.']
        ]),
        conjuration: subclass('conjuration', 'wizard', 'Escuela de conjuración', ['conjuracion', 'escuela de conjuracion'], [
            [2, 'Conjuración menor', 'Con una acción conjuras un objeto inanimado de hasta 3 pies que dura 1 hora.'],
            [6, 'Transposición benigna', 'Te teletransportas hasta 30 pies o intercambias lugar con una criatura voluntaria.'],
            [10, 'Conjuración concentrada', 'Tu concentración no se rompe al recibir daño de conjuros de conjuración.'],
            [14, 'Invocaciones duraderas', 'Las criaturas que conjures con conjuros de nivel 1 o superior tienen 30 PG temporales.']
        ]),
        divination: subclass('divination', 'wizard', 'Escuela de adivinación', ['adivinacion', 'escuela de adivinacion'], [
            [2, 'Adivinación experta', 'Recuperas una ranura menor al lanzar conjuros de adivinación de nivel 2 o superior.'],
            [2, 'Presagio', 'Tras un descanso largo tiras 2d20 y puedes sustituir una tirada vista por uno de ellos.'],
            [6, 'Adivinación experta', 'Al lanzar adivinaciones recuperas más energía mágica.'],
            [10, 'El tercer ojo', 'Tras descanso corto eliges visión en la oscuridad, visión etérea, comprensión superior o ver invisibilidad.'],
            [14, 'Presagio mayor', 'Tiras 3d20 para Presagio en lugar de 2d20.']
        ]),
        enchantment: subclass('enchantment', 'wizard', 'Escuela de encantamiento', ['encantamiento', 'escuela de encantamiento'], [
            [2, 'Mirada hipnótica', 'Como acción incapacitas y reduces a 0 la velocidad de una criatura a 5 pies mientras mantengas el efecto.'],
            [6, 'Encanto instintivo', 'Usas una reacción para desviar un ataque de una criatura hacia otro objetivo cercano.'],
            [10, 'Encantamiento dividido', 'Tus encantamientos de objetivo único pueden afectar a un segundo objetivo.'],
            [14, 'Modificar recuerdos', 'Puedes obligar a un objetivo hechizado a perder recuerdos de un periodo breve.']
        ]),
        illusion: subclass('illusion', 'wizard', 'Escuela de ilusión', ['ilusion', 'escuela de ilusion'], [
            [2, 'Ilusión menor mejorada', 'Conoces ilusión menor; puedes crear sonido e imagen con un solo lanzamiento.'],
            [6, 'Ilusiones maleables', 'Puedes cambiar la naturaleza de una ilusión mientras dure.'],
            [10, 'Yo ilusorio', 'Puedes crear un doble ilusorio que evita un ataque contra ti.'],
            [14, 'Realidad ilusoria', 'Como acción adicional haces real durante 1 minuto parte de una ilusión no mágica.']
        ]),
        necromancy: subclass('necromancy', 'wizard', 'Escuela de nigromancia', ['nigromancia', 'escuela de nigromancia'], [
            [2, 'Cosecha siniestra', '1 vez por turno, al matar con un conjuro de nivel 1 o superior recuperas PG según el nivel del conjuro.'],
            [6, 'Esclavos no muertos', 'Añades animar a los muertos al libro y tus no muertos obtienen PG y daño adicionales.'],
            [10, 'Acostumbrado a la muerte', 'Obtienes resistencia al daño necrótico y no reduces tu máximo de PG.'],
            [14, 'Dominar a los no muertos', 'Puedes imponer control sobre un no muerto que falle una salvación de Carisma.']
        ]),
        transmutation: subclass('transmutation', 'wizard', 'Escuela de transmutación', ['transmutacion', 'escuela de transmutacion'], [
            [2, 'Alquimia menor', 'Transformas temporalmente madera, piedra, hierro, cobre o plata en otro de esos materiales.'],
            [6, 'Piedra de transmutador', 'Creas una piedra que concede un beneficio elegido a quien la porte.'],
            [10, 'Cambiaformas', 'Puedes lanzar polimorfar sobre ti sin gastar una ranura, una vez por descanso corto.'],
            [14, 'Maestro transmutador', 'Consumes la piedra para producir un gran efecto de restauración, vida, juventud o transformación.']
        ])
    });

    mergeMissing(rules.species, {
        'hill-dwarf': species('hill-dwarf', 'Enano de las colinas', ['enano colinas', 'hill dwarf'], 25, 'Mediano', { con: 2, sab: 1 }, [
            ['Visión en la oscuridad', 'Ves en penumbra a 60 pies como luz brillante y en oscuridad como penumbra.'],
            ['Resistencia enana', 'Ventaja contra veneno y resistencia al daño de veneno.'],
            ['Entrenamiento de combate enano', 'Obtienes competencia con hacha de batalla, hacha de mano, martillo ligero y martillo de guerra.'],
            ['Afinidad con la piedra', 'Añades el doble de competencia a pruebas de Historia sobre cantería.'],
            ['Dureza enana', 'Tus PG máximos aumentan en 1 por cada nivel.']
        ]),
        'mountain-dwarf': species('mountain-dwarf', 'Enano de las montañas', ['enano montañas', 'mountain dwarf'], 25, 'Mediano', { con: 2, fue: 2 }, [
            ['Visión en la oscuridad', 'Ves en penumbra a 60 pies como luz brillante y en oscuridad como penumbra.'],
            ['Resistencia enana', 'Ventaja contra veneno y resistencia al daño de veneno.'],
            ['Entrenamiento de combate enano', 'Obtienes competencia con hacha de batalla, hacha de mano, martillo ligero y martillo de guerra.'],
            ['Afinidad con la piedra', 'Añades el doble de competencia a pruebas de Historia sobre cantería.'],
            ['Entrenamiento con armadura enana', 'Obtienes competencia con armadura ligera y media.']
        ]),
        'high-elf': species('high-elf', 'Elfo alto', ['elfo alto', 'high elf'], 30, 'Mediano', { des: 2, int: 1 }, [
            ['Visión en la oscuridad', 'Ves en penumbra a 60 pies como luz brillante y en oscuridad como penumbra.'],
            ['Sentidos agudos', 'Obtienes competencia en Percepción.'],
            ['Ascendencia feérica', 'Ventaja contra ser hechizado; la magia no puede dormirte.'],
            ['Trance', 'Meditas 4 horas en vez de dormir 8.'],
            ['Entrenamiento con armas élficas', 'Obtienes competencia con espada larga, espada corta, arco largo y arco corto.'],
            ['Truco élfico', 'Aprendes un truco de mago basado en Inteligencia; selecciónalo manualmente en el Grimorio.']
        ]),
        'wood-elf': species('wood-elf', 'Elfo de los bosques', ['elfo de los bosques', 'wood elf'], 35, 'Mediano', { des: 2, sab: 1 }, [
            ['Visión en la oscuridad', 'Ves en penumbra a 60 pies como luz brillante y en oscuridad como penumbra.'],
            ['Sentidos agudos', 'Obtienes competencia en Percepción.'],
            ['Ascendencia feérica', 'Ventaja contra ser hechizado; la magia no puede dormirte.'],
            ['Trance', 'Meditas 4 horas en vez de dormir 8.'],
            ['Entrenamiento con armas élficas', 'Obtienes competencia con espada larga, espada corta, arco largo y arco corto.'],
            ['Máscara de la naturaleza', 'Puedes intentar ocultarte con lluvia intensa, niebla, nieve, follaje o fenómenos naturales similares.']
        ]),
        drow: species('drow', 'Drow', ['elfo oscuro', 'drow'], 30, 'Mediano', { des: 2, car: 1 }, [
            ['Visión en la oscuridad superior', 'Ves en oscuridad hasta 120 pies, en blanco y negro.'],
            ['Ascendencia feérica', 'Ventaja contra ser hechizado; la magia no puede dormirte.'],
            ['Trance', 'Meditas 4 horas en vez de dormir 8.'],
            ['Sensibilidad a la luz solar', 'Con luz solar directa tienes desventaja en ataques y Percepción basada en vista.'],
            ['Entrenamiento con armas drow', 'Obtienes competencia con estoque, espada corta y ballesta de mano.'],
            ['Magia drow', 'Obtienes luces danzantes y magia adicional a niveles superiores; añade los conjuros manualmente si los usas.']
        ]),
        'forest-gnome': species('forest-gnome', 'Gnomo de los bosques', ['gnomo de los bosques', 'forest gnome'], 25, 'Pequeño', { int: 2, des: 1 }, [
            ['Visión en la oscuridad', 'Ves en penumbra a 60 pies como luz brillante y en oscuridad como penumbra.'],
            ['Astucia gnómica', 'Ventaja en salvaciones de Inteligencia, Sabiduría y Carisma contra magia.'],
            ['Ilusionista nato', 'Aprendes ilusión menor basada en Inteligencia.'],
            ['Hablar con bestias pequeñas', 'Puedes comunicar ideas simples con bestias Pequeñas o menores.']
        ]),
        'rock-gnome': species('rock-gnome', 'Gnomo de las rocas', ['gnomo de las rocas', 'rock gnome'], 25, 'Pequeño', { int: 2, con: 1 }, [
            ['Visión en la oscuridad', 'Ves en penumbra a 60 pies como luz brillante y en oscuridad como penumbra.'],
            ['Astucia gnómica', 'Ventaja en salvaciones de Inteligencia, Sabiduría y Carisma contra magia.'],
            ['Conocimiento de artificiero', 'Duplicas competencia en pruebas de Historia sobre objetos mágicos, alquímicos o tecnológicos.'],
            ['Inventor', 'Con herramientas de artesano puedes crear pequeños dispositivos mecánicos.']
        ]),
        'lightfoot-halfling': species('lightfoot-halfling', 'Mediano piesligeros', ['mediano piesligeros', 'lightfoot halfling'], 25, 'Pequeño', { des: 2, car: 1 }, [
            ['Afortunado', 'Cuando sacas 1 en un d20, puedes repetirlo.'],
            ['Valiente', 'Ventaja en salvaciones contra estar asustado.'],
            ['Agilidad mediana', 'Puedes atravesar el espacio de criaturas mayores que tú.'],
            ['Sigilo natural', 'Puedes intentar ocultarte tras una criatura de al menos un tamaño mayor que tú.']
        ]),
        'stout-halfling': species('stout-halfling', 'Mediano fornido', ['mediano fornido', 'stout halfling'], 25, 'Pequeño', { des: 2, con: 1 }, [
            ['Afortunado', 'Cuando sacas 1 en un d20, puedes repetirlo.'],
            ['Valiente', 'Ventaja en salvaciones contra estar asustado.'],
            ['Agilidad mediana', 'Puedes atravesar el espacio de criaturas mayores que tú.'],
            ['Resistencia fornida', 'Ventaja contra veneno y resistencia al daño de veneno.']
        ]),
        'variant-human': species('variant-human', 'Humano variante', ['humano variante', 'variant human'], 30, 'Mediano', {}, [
            ['Aumento de característica flexible', 'Elige dos características distintas para aumentar +1; aplícalas manualmente en Atributos.'],
            ['Competencia flexible', 'Obtienes competencia en una habilidad a elección; selecciónala manualmente.'],
            ['Dote inicial', 'Obtienes una dote a nivel 1; añádela desde el Compendio de dotes.']
        ])
    });
})();
