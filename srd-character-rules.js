/* SRD 5.1 (reglas 2014): datos mecánicos breves para el constructor asistido.
 * No contiene texto de reglas extenso; la ficha usa estas claves para derivar
 * valores y rasgos sin sobrescribir las entradas manuales del jugador. */
(function () {
    const normalize = (value) => String(value || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().trim();

    const featureDescriptions = {
        'Visión en la oscuridad': 'Puedes ver en luz tenue como si fuera luz brillante y en oscuridad como si fuera luz tenue, en blanco y negro.',
        'Sentidos agudos': 'Tienes competencia en la habilidad Percepción.',
        'Ascendencia feérica': 'Tienes ventaja contra ser hechizado y la magia no puede dormirte.',
        'Trance': 'No necesitas dormir. Meditas profundamente durante cuatro horas en lugar de descansar ocho.',
        'Pericia': 'Elige una competencia que ya poseas; tu bonificador de competencia se duplica para las pruebas que usen esa competencia.',
        'Ataque furtivo': 'Una vez por turno, puedes infligir daño adicional cuando atacas con ventaja o cuando un aliado amenaza al objetivo.',
        'Jerga de ladrones': 'Conoces el argot secreto de los ladrones y sabes transmitir mensajes ocultos con él.',
        'Acción astuta': 'Puedes usar una acción adicional para Correr, Retirarte o Esconderte.',
        'Arquetipo pícaro': 'Defines la especialidad que guía tu estilo de pícaro.',
        'Esquiva asombrosa': 'Cuando un atacante que ves te golpea, puedes usar tu reacción para reducir a la mitad el daño recibido.',
        'Evasión': 'Cuando superas una salvación de Destreza que normalmente infligiría la mitad de daño, no recibes daño; si fallas, recibes la mitad.',
        'Talento fiable': 'Una prueba de habilidad en la que añadas tu bonificador de competencia trata un resultado de d20 menor de 10 como un 10.',
        'Sentido ciego': 'Si puedes oír, conoces la ubicación de criaturas ocultas o invisibles cercanas.',
        'Mente escurridiza': 'Obtienes competencia en las tiradas de salvación de Sabiduría.',
        'Escurridizo': 'Ninguna tirada de ataque tiene ventaja contra ti mientras no estés incapacitado.',
        'Golpe de suerte': 'Puedes convertir un ataque fallido en impacto o una prueba fallida en un resultado de 20.',
        'Lanzamiento de conjuros': 'Tu clase te permite lanzar conjuros. El Grimorio calcula automáticamente su progresión cuando está disponible.',
        'Embaucador arcano': 'Combinas astucia y magia arcana para ampliar las opciones del pícaro.',
        'Mano de mago versátil': 'Tu Mano de mago obtiene opciones adicionales para distraer y manipular a distancia.',
        'Emboscada mágica': 'Tus objetivos tienen desventaja contra tus conjuros cuando estás oculto para ellos.',
        'Tramposo versátil': 'Puedes usar Mano de mago como distracción para obtener ventaja en ataques contra una criatura.',
        'Ladrón de conjuros': 'Puedes robar temporalmente el conocimiento de un conjuro que otra criatura lance sobre ti.',
        'Cuchillas psíquicas': 'Cuando atacas, puedes manifestar cuchillas de energía psíquica para realizar ataques cuerpo a cuerpo o a distancia. También puedes realizar un segundo ataque con acción adicional.',
        'Poder psiónico': 'Obtienes dados de energía psiónica para reforzar pruebas con competencia y crear un vínculo telepático temporal con aliados.',
        'Habilidad reforzada por energía psiónica': 'Cuando fallas una prueba con una competencia que posees, puedes gastar un dado de energía psiónica para añadirlo a la tirada.',
        'Susurros psíquicos': 'Puedes gastar un dado de energía psiónica para establecer comunicación telepática temporal con criaturas que elijas.',
        'Cuchillas del alma': 'Tus cuchillas psíquicas mejoran: puedes corregir un ataque fallido y teletransportarte usando una de ellas.',
        'Velo psíquico': 'Puedes envolverte en energía psiónica para volverte invisible temporalmente.',
        'Desgarrar la mente': 'Al dañar con Ataque furtivo mediante una cuchilla psíquica, puedes intentar aturdir al objetivo con energía mental.',
        'Afortunado': 'Cuando sacas un 1 en un d20 de ataque, prueba o salvación, puedes repetir la tirada.',
        'Valiente': 'Tienes ventaja en las salvaciones contra estar asustado.',
        'Agilidad mediana': 'Puedes moverte a través del espacio de cualquier criatura de tamaño mayor que el tuyo.',
        'Resistencia enana': 'Tienes ventaja en las salvaciones contra veneno y resistencia al daño de veneno.',
        'Astucia gnómica': 'Tienes ventaja en salvaciones de Inteligencia, Sabiduría y Carisma contra magia.',
        'Resistencia infernal': 'Tienes resistencia al daño de fuego.',
        'Legado infernal': 'Aprendes magia innata que progresa con tu nivel de personaje.',
        'Bendición de la Reina Cuervo': 'Puedes teletransportarte mágicamente a corta distancia. A niveles superiores, el salto también te protege brevemente del daño.',
        'Resistencia necrótica': 'Tienes resistencia al daño necrótico.',
        'Arma de aliento': 'Puedes exhalar energía destructiva según tu ancestro dracónico.',
        'Resistencia al daño': 'Tienes resistencia al tipo de daño asociado a tu ancestro dracónico.',
        'Resistencia incansable': 'Cuando caerías a 0 puntos de golpe, puedes quedarte a 1 punto de golpe una vez por descanso prolongado.',
        'Ataques salvajes': 'Cuando logras un crítico con un arma cuerpo a cuerpo, tiras un dado adicional de daño del arma.',
        'Defensa sin armadura': 'Mientras no lleves armadura, tu CA se calcula con Destreza y la característica adicional indicada por tu clase.',
        'Segundo aliento': 'Puedes recuperar puntos de golpe como acción adicional una vez por descanso corto.',
        'Oleada de acción': 'Puedes realizar una acción adicional durante tu turno una vez por descanso corto.',
        'Ataque adicional': 'Cuando realizas la acción Atacar, puedes atacar dos veces en vez de una.',
        'Ira': 'Puedes entrar en una ira que mejora tu resistencia y tus ataques físicos durante un tiempo limitado.',
        'Ki': 'Obtienes puntos de ki para alimentar técnicas de tu tradición monástica.',
        'Golpe divino': 'Puedes gastar una ranura de conjuro al impactar con un arma cuerpo a cuerpo para infligir daño radiante adicional.',
        'Inspiración de bardo': 'Puedes inspirar a otra criatura con un dado que puede añadir a una prueba, ataque o salvación.',
        'Forma salvaje': 'Puedes adoptar temporalmente la forma de una bestia que hayas visto.',
        'Canalizar divinidad': 'Canalizas energía divina para producir efectos definidos por tu dominio.',
        'Magia de pacto': 'Tu patrón te concede ranuras de conjuro que se recuperan con descansos cortos.',
        'Recuperación arcana': 'Una vez al día recuperas parte de tu energía mágica durante un descanso corto.'
    };
    const feature = (id, name, level, source) => ({
        id, name, level, source,
        description: featureDescriptions[name] || 'Capacidad que se obtiene automáticamente al alcanzar este nivel.'
    });
    const classFeatureSet = (classId, names) => names.map(([level, name], index) => feature(`${classId}-${level}-${index}`, name, level, 'class'));
    const subclassFeatureSet = (subclassId, names) => names.map(([level, name], index) => feature(`${subclassId}-${level}-${index}`, name, level, 'subclass'));

    const classes = {
        barbarian: {
            id: 'barbarian', name: 'Bárbaro', hitDie: 'd12', savingThrows: ['fue', 'con'],
            aliases: ['barbaro'],
            features: classFeatureSet('barbarian', [[1, 'Ira'], [1, 'Defensa sin armadura'], [2, 'Ataque temerario'], [2, 'Sentido del peligro'], [3, 'Senda primitiva'], [5, 'Ataque adicional'], [5, 'Movimiento rápido'], [7, 'Instinto feral'], [7, 'Embate instintivo'], [9, 'Crítico brutal'], [11, 'Ira implacable'], [15, 'Ira persistente'], [18, 'Fuerza indómita'], [20, 'Campeón primordial']])
        },
        bard: {
            id: 'bard', name: 'Bardo', hitDie: 'd8', savingThrows: ['des', 'car'], aliases: ['bardo'],
            features: classFeatureSet('bard', [[1, 'Lanzamiento de conjuros'], [1, 'Inspiración de bardo'], [2, 'Aprendiz de todo'], [2, 'Canción de descanso'], [3, 'Colegio de bardo'], [3, 'Pericia'], [5, 'Inspiración de bardo mejorada'], [5, 'Fuente de inspiración'], [6, 'Contrahechizo'], [10, 'Secretos mágicos'], [20, 'Inspiración superior']])
        },
        cleric: {
            id: 'cleric', name: 'Clérigo', hitDie: 'd8', savingThrows: ['sab', 'car'], aliases: ['clerigo'],
            features: classFeatureSet('cleric', [[1, 'Lanzamiento de conjuros'], [1, 'Dominio divino'], [2, 'Canalizar divinidad'], [4, 'Mejora de característica'], [5, 'Destruir muertos vivientes'], [8, 'Destruir muertos vivientes mejorado'], [10, 'Intervención divina'], [20, 'Intervención divina mejorada']])
        },
        druid: {
            id: 'druid', name: 'Druida', hitDie: 'd8', savingThrows: ['int', 'sab'], aliases: ['druida'],
            features: classFeatureSet('druid', [[1, 'Druídico'], [1, 'Lanzamiento de conjuros'], [2, 'Círculo druídico'], [2, 'Forma salvaje'], [4, 'Mejora de característica'], [8, 'Forma salvaje mejorada'], [18, 'Cuerpo atemporal'], [18, 'Conjuros bestiales'], [20, 'Archidruida']])
        },
        fighter: {
            id: 'fighter', name: 'Guerrero', hitDie: 'd10', savingThrows: ['fue', 'con'], aliases: ['guerrero'],
            features: classFeatureSet('fighter', [[1, 'Estilo de combate'], [1, 'Segundo aliento'], [2, 'Oleada de acción'], [3, 'Arquetipo marcial'], [4, 'Mejora de característica'], [5, 'Ataque adicional'], [9, 'Indomable'], [11, 'Ataque adicional mejorado'], [20, 'Ataque adicional superior']])
        },
        monk: {
            id: 'monk', name: 'Monje', hitDie: 'd8', savingThrows: ['fue', 'des'], aliases: ['monje'],
            features: classFeatureSet('monk', [[1, 'Defensa sin armadura'], [1, 'Artes marciales'], [2, 'Ki'], [2, 'Movimiento sin armadura'], [3, 'Tradición monástica'], [4, 'Caída lenta'], [5, 'Ataque adicional'], [5, 'Golpe aturdidor'], [7, 'Evasión'], [10, 'Pureza de cuerpo'], [14, 'Alma de diamante'], [18, 'Cuerpo vacío'], [20, 'Ser perfecto']])
        },
        paladin: {
            id: 'paladin', name: 'Paladín', hitDie: 'd10', savingThrows: ['sab', 'car'], aliases: ['paladin'],
            features: classFeatureSet('paladin', [[1, 'Sentido divino'], [1, 'Imposición de manos'], [2, 'Estilo de combate'], [2, 'Lanzamiento de conjuros'], [2, 'Golpe divino'], [3, 'Salud divina'], [3, 'Juramento sagrado'], [5, 'Ataque adicional'], [6, 'Aura de protección'], [10, 'Aura de valor'], [14, 'Toque purificador'], [20, 'Campeón sagrado']])
        },
        ranger: {
            id: 'ranger', name: 'Explorador', hitDie: 'd10', savingThrows: ['fue', 'des'], aliases: ['explorador', 'ranger'],
            features: classFeatureSet('ranger', [[1, 'Enemigo predilecto'], [1, 'Explorador natural'], [2, 'Estilo de combate'], [2, 'Lanzamiento de conjuros'], [3, 'Arquetipo de explorador'], [4, 'Mejora de característica'], [5, 'Ataque adicional'], [8, 'Andar por tierras'], [10, 'Ocultarse a plena vista'], [14, 'Desvanecerse'], [18, 'Sentidos ferales'], [20, 'Asesino de enemigos']])
        },
        rogue: {
            id: 'rogue', name: 'Pícaro', hitDie: 'd8', savingThrows: ['des', 'int'], aliases: ['picaro'],
            features: classFeatureSet('rogue', [[1, 'Pericia'], [1, 'Ataque furtivo'], [1, 'Jerga de ladrones'], [2, 'Acción astuta'], [3, 'Arquetipo pícaro'], [4, 'Mejora de característica'], [5, 'Esquiva asombrosa'], [6, 'Pericia'], [7, 'Evasión'], [11, 'Talento fiable'], [14, 'Sentido ciego'], [15, 'Mente escurridiza'], [18, 'Escurridizo'], [20, 'Golpe de suerte']])
        },
        sorcerer: {
            id: 'sorcerer', name: 'Hechicero', hitDie: 'd6', savingThrows: ['con', 'car'], aliases: ['hechicero'],
            features: classFeatureSet('sorcerer', [[1, 'Lanzamiento de conjuros'], [1, 'Origen sortílego'], [2, 'Fuente de magia'], [3, 'Metamagia'], [4, 'Mejora de característica'], [20, 'Restauración sortílega']])
        },
        warlock: {
            id: 'warlock', name: 'Brujo', hitDie: 'd8', savingThrows: ['sab', 'car'], aliases: ['brujo'],
            features: classFeatureSet('warlock', [[1, 'Otro patrón sobrenatural'], [1, 'Magia de pacto'], [2, 'Invocaciones sobrenaturales'], [3, 'Don del pacto'], [4, 'Mejora de característica'], [11, 'Arcano místico'], [20, 'Maestro sobrenatural']])
        },
        wizard: {
            id: 'wizard', name: 'Mago', hitDie: 'd6', savingThrows: ['int', 'sab'], aliases: ['mago'],
            features: classFeatureSet('wizard', [[1, 'Lanzamiento de conjuros'], [1, 'Recuperación arcana'], [2, 'Tradición arcana'], [4, 'Mejora de característica'], [18, 'Maestría de conjuros'], [20, 'Conjuros característicos']])
        }
    };

    const subclasses = {
        berserker: { id: 'berserker', classId: 'barbarian', name: 'Senda del berserker', aliases: ['berserker'], features: subclassFeatureSet('berserker', [[3, 'Frenesí'], [6, 'Furia inconsciente'], [10, 'Presencia intimidante'], [14, 'Represalia']]) },
        lore: { id: 'lore', classId: 'bard', name: 'Colegio del saber', aliases: ['colegio del saber', 'lore'], features: subclassFeatureSet('lore', [[3, 'Competencias adicionales'], [3, 'Palabras hirientes'], [6, 'Secretos mágicos adicionales'], [14, 'Habilidad sin par']]) },
        life: { id: 'life', classId: 'cleric', name: 'Dominio de la vida', aliases: ['dominio de la vida', 'life'], features: subclassFeatureSet('life', [[1, 'Discípulo de la vida'], [2, 'Canalizar divinidad: preservar la vida'], [6, 'Sanador bendito'], [8, 'Golpe divino'], [17, 'Curación suprema']]) },
        land: { id: 'land', classId: 'druid', name: 'Círculo de la tierra', aliases: ['circulo de la tierra', 'land'], features: subclassFeatureSet('land', [[2, 'Truco adicional'], [2, 'Recuperación natural'], [6, 'Andar por la tierra'], [10, 'Protección de la naturaleza'], [14, 'Santuario de la naturaleza']]) },
        champion: { id: 'champion', classId: 'fighter', name: 'Campeón', aliases: ['campeon'], features: subclassFeatureSet('champion', [[3, 'Crítico mejorado'], [7, 'Atleta excepcional'], [10, 'Estilo de combate adicional'], [15, 'Crítico superior'], [18, 'Superviviente']]) },
        'open-hand': { id: 'open-hand', classId: 'monk', name: 'Camino de la mano abierta', aliases: ['mano abierta', 'open hand'], features: subclassFeatureSet('open-hand', [[3, 'Técnica de la mano abierta'], [6, 'Plenitud corporal'], [11, 'Tranquilidad'], [17, 'Palma temblorosa']]) },
        devotion: { id: 'devotion', classId: 'paladin', name: 'Juramento de devoción', aliases: ['devocion', 'juramento de devocion'], features: subclassFeatureSet('devotion', [[3, 'Canalizar divinidad: arma sagrada'], [7, 'Aura de devoción'], [15, 'Pureza de espíritu'], [20, 'Aura sagrada']]) },
        hunter: { id: 'hunter', classId: 'ranger', name: 'Cazador', aliases: ['cazador', 'hunter'], features: subclassFeatureSet('hunter', [[3, 'Presas de cazador'], [7, 'Tácticas defensivas'], [11, 'Ataque múltiple'], [15, 'Defensa de cazador superior']]) },
        thief: { id: 'thief', classId: 'rogue', name: 'Ladrón', aliases: ['ladron', 'thief'], features: subclassFeatureSet('thief', [[3, 'Manos rápidas'], [3, 'Trabajo de segunda planta'], [9, 'Sigilo supremo'], [13, 'Usar objeto mágico'], [17, 'Reflejos de ladrón']]) },
        'arcane-trickster': { id: 'arcane-trickster', classId: 'rogue', name: 'Embaucador arcano', aliases: ['embaucador arcano', 'arcane trickster'], features: subclassFeatureSet('arcane-trickster', [[3, 'Lanzamiento de conjuros'], [3, 'Mano de mago versátil'], [9, 'Emboscada mágica'], [13, 'Tramposo versátil'], [17, 'Ladrón de conjuros']]) },
        'eldritch-knight': { id: 'eldritch-knight', classId: 'fighter', name: 'Caballero arcano', aliases: ['caballero arcano', 'eldritch knight'], features: subclassFeatureSet('eldritch-knight', [[3, 'Lanzamiento de conjuros'], [3, 'Vínculo con arma'], [7, 'Magia de guerra'], [10, 'Golpe sobrenatural'], [15, 'Carga arcana'], [18, 'Magia de guerra mejorada']]) },
        soulknife: { id: 'soulknife', classId: 'rogue', name: 'Cuchillas de alma', aliases: ['cuchillas de alma', 'soulknife', 'cuchilla de alma'], features: subclassFeatureSet('soulknife', [[3, 'Cuchillas psíquicas'], [3, 'Poder psiónico'], [3, 'Habilidad reforzada por energía psiónica'], [3, 'Susurros psíquicos'], [9, 'Cuchillas del alma'], [13, 'Velo psíquico'], [17, 'Desgarrar la mente']]) },
        draconic: { id: 'draconic', classId: 'sorcerer', name: 'Linaje dracónico', aliases: ['linaje draconico', 'draconic'], features: subclassFeatureSet('draconic', [[1, 'Ancestro dracónico'], [1, 'Resistencia dracónica'], [6, 'Afinidad elemental'], [14, 'Alas de dragón'], [18, 'Presencia dracónica']]) },
        fiend: { id: 'fiend', classId: 'warlock', name: 'El infernal', aliases: ['infernal', 'fiend'], features: subclassFeatureSet('fiend', [[1, 'Bendición del oscuro'], [6, 'Suerte del oscuro'], [10, 'Resistencia infernal'], [14, 'Arrojar al infierno']]) },
        evocation: { id: 'evocation', classId: 'wizard', name: 'Escuela de evocación', aliases: ['evocacion', 'escuela de evocacion'], features: subclassFeatureSet('evocation', [[2, 'Escultor de conjuros'], [2, 'Truco potente'], [6, 'Truco fortalecido'], [10, 'Evocación potenciada'], [14, 'Sobrecarga']]) }
    };

    const classSkillChoices = {
        barbarian: { count: 2, options: ['trato_con_animales', 'atletismo', 'intimidacion', 'naturaleza', 'percepcion', 'supervivencia'] },
        bard: { count: 3, options: ['acrobacias', 'arcanos', 'atletismo', 'engano', 'historia', 'interpretacion', 'intimidacion', 'juego_de_manos', 'medicina', 'naturaleza', 'percepcion', 'perspicacia', 'persuasion', 'religion', 'sigilo', 'supervivencia', 'trato_con_animales'] },
        cleric: { count: 2, options: ['historia', 'medicina', 'perspicacia', 'persuasion', 'religion'] },
        druid: { count: 2, options: ['arcanos', 'trato_con_animales', 'perspicacia', 'medicina', 'naturaleza', 'percepcion', 'religion', 'supervivencia'] },
        fighter: { count: 2, options: ['acrobacias', 'trato_con_animales', 'atletismo', 'historia', 'perspicacia', 'intimidacion', 'percepcion', 'supervivencia'] },
        monk: { count: 2, options: ['acrobacias', 'atletismo', 'historia', 'perspicacia', 'religion', 'sigilo'] },
        paladin: { count: 2, options: ['trato_con_animales', 'atletismo', 'perspicacia', 'intimidacion', 'medicina', 'persuasion', 'religion'] },
        ranger: { count: 3, options: ['trato_con_animales', 'atletismo', 'perspicacia', 'investigacion', 'naturaleza', 'percepcion', 'sigilo', 'supervivencia'] },
        rogue: { count: 4, options: ['acrobacias', 'atletismo', 'engano', 'perspicacia', 'intimidacion', 'investigacion', 'juego_de_manos', 'percepcion', 'interpretacion', 'persuasion', 'sigilo'] },
        sorcerer: { count: 2, options: ['arcanos', 'engano', 'perspicacia', 'intimidacion', 'persuasion', 'religion'] },
        warlock: { count: 2, options: ['arcanos', 'engano', 'historia', 'intimidacion', 'investigacion', 'naturaleza', 'religion'] },
        wizard: { count: 2, options: ['arcanos', 'historia', 'perspicacia', 'investigacion', 'medicina', 'religion'] }
    };
    Object.entries(classSkillChoices).forEach(([classId, choice]) => { classes[classId].skillChoices = choice; });
    classes.rogue.expertiseLevels = { 1: 2, 6: 2 };
    classes.bard.expertiseLevels = { 3: 2, 10: 2 };

    const species = {
        dragonborn: { id: 'dragonborn', name: 'Dracónido', aliases: ['draconido'], speed: 30, size: 'Mediano', abilityBonuses: { fue: 2, car: 1 }, traits: [feature('dragonborn-ancestry', 'Ancestro dracónico', 1, 'species'), feature('dragonborn-breath', 'Arma de aliento', 1, 'species'), feature('dragonborn-resistance', 'Resistencia al daño', 1, 'species')] },
        dwarf: { id: 'dwarf', name: 'Enano', aliases: ['enano'], speed: 25, size: 'Mediano', abilityBonuses: { con: 2 }, traits: [feature('dwarf-darkvision', 'Visión en la oscuridad', 1, 'species'), feature('dwarf-resilience', 'Resistencia enana', 1, 'species'), feature('dwarf-training', 'Entrenamiento de combate enano', 1, 'species'), feature('dwarf-stonecunning', 'Afinidad con la piedra', 1, 'species')] },
        elf: { id: 'elf', name: 'Elfo', aliases: ['elfo'], speed: 30, size: 'Mediano', abilityBonuses: { des: 2 }, skillProficiencies: ['percepcion'], traits: [feature('elf-darkvision', 'Visión en la oscuridad', 1, 'species'), feature('elf-senses', 'Sentidos agudos', 1, 'species'), feature('elf-ancestry', 'Ascendencia feérica', 1, 'species'), feature('elf-trance', 'Trance', 1, 'species')] },
        gnome: { id: 'gnome', name: 'Gnomo', aliases: ['gnomo'], speed: 25, size: 'Pequeño', abilityBonuses: { int: 2 }, traits: [feature('gnome-darkvision', 'Visión en la oscuridad', 1, 'species'), feature('gnome-cunning', 'Astucia gnómica', 1, 'species')] },
        'half-elf': { id: 'half-elf', name: 'Semielfo', aliases: ['semielfo', 'medio elfo'], speed: 30, size: 'Mediano', abilityBonuses: { car: 2 }, traits: [feature('half-elf-darkvision', 'Visión en la oscuridad', 1, 'species'), feature('half-elf-ancestry', 'Ascendencia feérica', 1, 'species'), feature('half-elf-versatility', 'Versatilidad en semielfos', 1, 'species')] },
        'half-orc': { id: 'half-orc', name: 'Semiorco', aliases: ['semiorco', 'medio orco'], speed: 30, size: 'Mediano', abilityBonuses: { fue: 2, con: 1 }, traits: [feature('half-orc-darkvision', 'Visión en la oscuridad', 1, 'species'), feature('half-orc-endurance', 'Resistencia incansable', 1, 'species'), feature('half-orc-savage', 'Ataques salvajes', 1, 'species')] },
        halfling: { id: 'halfling', name: 'Mediano', aliases: ['mediano', 'halfling'], speed: 25, size: 'Pequeño', abilityBonuses: { des: 2 }, traits: [feature('halfling-lucky', 'Afortunado', 1, 'species'), feature('halfling-brave', 'Valiente', 1, 'species'), feature('halfling-nimbleness', 'Agilidad mediana', 1, 'species')] },
        human: { id: 'human', name: 'Humano', aliases: ['humano'], speed: 30, size: 'Mediano', abilityBonuses: { fue: 1, des: 1, con: 1, int: 1, sab: 1, car: 1 }, traits: [] },
        'shadar-kai': { id: 'shadar-kai', name: 'Shadar-kai', aliases: ['shadar kai', 'shadarkai'], speed: 30, size: 'Mediano o Pequeño', abilityBonuses: {}, traits: [feature('shadar-kai-darkvision', 'Visión en la oscuridad', 1, 'species'), feature('shadar-kai-fey', 'Ascendencia feérica', 1, 'species'), feature('shadar-kai-raven', 'Bendición de la Reina Cuervo', 1, 'species'), feature('shadar-kai-necrotic', 'Resistencia necrótica', 1, 'species'), feature('shadar-kai-trance', 'Trance', 1, 'species')] },
        tiefling: { id: 'tiefling', name: 'Tiefling', aliases: ['tiefling'], speed: 30, size: 'Mediano', abilityBonuses: { int: 1, car: 2 }, traits: [feature('tiefling-darkvision', 'Visión en la oscuridad', 1, 'species'), feature('tiefling-resistance', 'Resistencia infernal', 1, 'species'), feature('tiefling-legacy', 'Legado infernal', 1, 'species')] }
    };

    const backgrounds = {
        acolyte: { id: 'acolyte', name: 'Acólito', aliases: ['acolito'], skillProficiencies: ['perspicacia', 'religion'] },
        charlatan: { id: 'charlatan', name: 'Charlatán', aliases: ['charlatan'], skillProficiencies: ['engano', 'juego_de_manos'] },
        criminal: { id: 'criminal', name: 'Criminal', aliases: ['criminal', 'espia', 'espía'], skillProficiencies: ['engano', 'sigilo'] },
        entertainer: { id: 'entertainer', name: 'Artista', aliases: ['artista', 'entretenedor'], skillProficiencies: ['acrobacias', 'interpretacion'] },
        'folk-hero': { id: 'folk-hero', name: 'Héroe del pueblo', aliases: ['heroe del pueblo'], skillProficiencies: ['trato_con_animales', 'supervivencia'] },
        'guild-artisan': { id: 'guild-artisan', name: 'Artesano gremial', aliases: ['artesano gremial'], skillProficiencies: ['perspicacia', 'persuasion'] },
        hermit: { id: 'hermit', name: 'Ermitaño', aliases: ['ermitano', 'ermitaño'], skillProficiencies: ['medicina', 'religion'] },
        noble: { id: 'noble', name: 'Noble', aliases: ['noble', 'caballero'], skillProficiencies: ['historia', 'persuasion'] },
        outlander: { id: 'outlander', name: 'Forastero', aliases: ['forastero'], skillProficiencies: ['atletismo', 'supervivencia'] },
        sage: { id: 'sage', name: 'Sabio', aliases: ['sabio'], skillProficiencies: ['arcanos', 'historia'] },
        sailor: { id: 'sailor', name: 'Marinero', aliases: ['marinero', 'pirata'], skillProficiencies: ['atletismo', 'percepcion'] },
        soldier: { id: 'soldier', name: 'Soldado', aliases: ['soldado'], skillProficiencies: ['atletismo', 'intimidacion'] },
        urchin: { id: 'urchin', name: 'Huerfano', aliases: ['huerfano', 'huérfano'], skillProficiencies: ['juego_de_manos', 'sigilo'] }
    };

    const getByName = (collection, value) => {
        const needle = normalize(value);
        return Object.values(collection).find(entry => normalize(entry.name) === needle || (entry.aliases || []).some(alias => normalize(alias) === needle)) || null;
    };
    const getClassForName = (value) => {
        const needle = normalize(value).replace(/\(.+?\)/g, '').trim();
        return getByName(classes, needle) || Object.values(classes).find(entry => needle.includes(normalize(entry.name)) || (entry.aliases || []).some(alias => needle.includes(normalize(alias)))) || null;
    };
    const getSubclassForName = (value, classId) => {
        const needle = normalize(value);
        return Object.values(subclasses).find(entry => (!classId || entry.classId === classId) && (normalize(entry.name) === needle || (entry.aliases || []).some(alias => normalize(alias) === needle))) || null;
    };
    const getSpeciesForName = (value) => getByName(species, value);
    const getBackgroundForName = (value) => getByName(backgrounds, value);
    const getSubclassesForClass = (classId) => Object.values(subclasses).filter(entry => entry.classId === classId);
    const getFeaturesForBuild = ({ classId, subclassId, speciesId, level }) => {
        const normalizedLevel = Math.max(1, Math.min(20, Math.trunc(Number(level) || 1)));
        const classEntry = classes[classId] || null;
        const subclassEntry = subclasses[subclassId]?.classId === classId ? subclasses[subclassId] : null;
        const speciesEntry = species[speciesId] || null;
        return [
            ...(speciesEntry?.traits || []),
            ...(classEntry?.features || []),
            ...(subclassEntry?.features || [])
        ].filter(entry => entry.level <= normalizedLevel);
    };
    const getMechanicalRulesForBuild = ({ classId, level }) => {
        const normalizedLevel = Math.max(1, Math.min(20, Math.trunc(Number(level) || 1)));
        if (classId === 'barbarian' && normalizedLevel >= 1) {
            return { unarmoredDefense: { ability: 'con', label: 'Bárbaro', allowsShield: true } };
        }
        if (classId === 'monk' && normalizedLevel >= 1) {
            return { unarmoredDefense: { ability: 'sab', label: 'Monje', allowsShield: false } };
        }
        return {};
    };

    window.DndSrdCharacterRules = {
        classes, subclasses, species, backgrounds, normalize,
        getClassForName, getSubclassForName, getSpeciesForName, getBackgroundForName,
        getSubclassesForClass, getFeaturesForBuild, getMechanicalRulesForBuild
    };
})();
