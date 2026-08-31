/* Opciones estructuradas de Eberron: resúmenes mecánicos breves. */
(function () {
    const rules = window.DndSrdCharacterRules;
    if (!rules || rules.species.warforged) return;

    const trait = (id, name, description) => ({ id, name, level: 1, source: 'species', description });
    rules.species.warforged = {
        id: 'warforged',
        name: 'Forjado',
        aliases: ['forjado', 'warforged'],
        speed: 30,
        size: 'Mediano',
        abilityBonuses: {},
        armorClassBonus: 1,
        traits: [
            trait('warforged-ability', 'Aumento de característica', '+2 a Constitución y +1 a otra característica a elección; introdúcelos manualmente en Atributos.'),
            trait('warforged-resilience', 'Resiliencia construida', 'Ventaja contra veneno, resistencia al daño de veneno, inmunidad a enfermedad y no necesitas comer, beber ni respirar.'),
            trait('warforged-rest', 'Reposo centinela', 'No necesitas dormir. Durante 6 horas permaneces inmóvil e inactivo, pero consciente y con visión normal.'),
            trait('warforged-protection', 'Protección integrada', '+1 a la CA. Puedes llevar armadura normalmente, pero no se puede retirar de tu cuerpo contra tu voluntad.')
        ]
    };
})();
