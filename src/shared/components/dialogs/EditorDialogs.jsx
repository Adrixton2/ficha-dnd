(() => {
    const { getArmorFormula } = window.DndAppUtils;
    const { CombatSectionIcon } = window.DndCharacterSheetComponents;
    const { EquipmentCompendiumModal } = window.DndLocalModalComponents;

    function EditorDialogs({ model }) {
        const {
            addModal,
            addNamePlaceholders,
            equipmentCompendiumCategory,
            equipmentCompendiumOpen,
            equipmentCompendiumQuery,
            getWeaponAttackBonus,
            getWeaponAttackProficiency,
            handleAddSubmit,
            handleNumInput,
            hasWeaponProficiency,
            inferWeaponAbility,
            inventory,
            marketCompendiumItems,
            proficiencies,
            selectedWeapon,
            setAddModal,
            setEquipmentCompendiumCategory,
            setEquipmentCompendiumOpen,
            setEquipmentCompendiumQuery,
            setSkillModal,
            skillModal,
            updateSkillProficiency
        } = model;

        return <>
{skillModal.isOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setSkillModal({ isOpen: false, skillKey: null, skillName: "" })}>
                                <div className="rpg-panel border border-purple-500/50 rounded-lg p-6 max-w-sm w-full shadow-2xl animate-attack" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                                        <h3 className="text-xl font-fantasy font-bold text-white tracking-widest">{skillModal.skillName}</h3>
                                        <button onClick={() => setSkillModal({ isOpen: false, skillKey: null, skillName: "" })} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
                                    </div>
                                    <div className="space-y-3">
                                        <button onClick={() => updateSkillProficiency('none')} className={`w-full py-3 rounded border text-sm font-bold font-fantasy tracking-wider uppercase transition-colors ${!proficiencies.expertise.includes(skillModal.skillKey) && !proficiencies.proficient.includes(skillModal.skillKey) ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'}`}>
                                            Sin Competencia
                                        </button>
                                        <button onClick={() => updateSkillProficiency('proficient')} className={`w-full py-3 rounded border text-sm font-bold font-fantasy tracking-wider uppercase transition-colors flex items-center justify-center space-x-3 ${proficiencies.proficient.includes(skillModal.skillKey) ? 'bg-purple-900/40 border-purple-500 text-purple-300' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-purple-500/50'}`}>
                                            <div className="w-3 h-3 rounded-full bg-purple-500 border border-purple-300"></div><span>Competencia</span>
                                        </button>
                                        <button onClick={() => updateSkillProficiency('expertise')} className={`w-full py-3 rounded border text-sm font-bold font-fantasy tracking-wider uppercase transition-colors flex items-center justify-center space-x-3 ${proficiencies.expertise.includes(skillModal.skillKey) ? 'bg-fuchsia-900/40 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-fuchsia-500/50'}`}>
                                            <div className="w-3 h-3 rounded-full bg-fuchsia-500 border border-fuchsia-300 shadow-[0_0_8px_rgba(217,70,239,0.8)]"></div><span>Pericia</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MODAL GENÉRICO AÑADIR */}
                        <EquipmentCompendiumModal
                            open={equipmentCompendiumOpen}
                            items={marketCompendiumItems}
                            query={equipmentCompendiumQuery}
                            category={equipmentCompendiumCategory}
                            onQueryChange={setEquipmentCompendiumQuery}
                            onCategoryChange={setEquipmentCompendiumCategory}
                            onClose={() => setEquipmentCompendiumOpen(false)}
                            onChoose={item => {
                                const magicDetails = [
                                    item.data?.desc,
                                    item.rarity && `Rareza: ${item.rarity}`,
                                    item.attunement && 'Requiere sintonización.'
                                ].filter(Boolean).join('\n');
                                const itemData = { name: item.name, ...item.data, desc: magicDetails, sourceId: item.id, weaponCategory: item.category };
                                if (item.type === 'weapon') {
                                    const magicBonuses = [...String(`${item.name} ${item.data?.desc || ''}`).matchAll(/\+([123])\b/g)].map(match => Number(match[1]));
                                    const magicBonus = [...new Set(magicBonuses)].length === 1 ? magicBonuses[0] : 0;
                                    const proficient = hasWeaponProficiency(item.name, item.category);
                                    itemData.attacks = (item.data?.attacks || []).map(attack => {
                                        const attackAbility = inferWeaponAbility(attack);
                                        const prepared = { ...attack, autoAttack: true, attackAbility, proficient, autoProficiency: true, weaponName: item.name, weaponCategory: item.category, magicBonus };
                                        return { ...prepared, atk: getWeaponAttackBonus(prepared) };
                                    });
                                }
                                setAddModal({ isOpen: true, type: item.type, data: itemData });
                                setEquipmentCompendiumOpen(false);
                            }}
                        />
                        {addModal.isOpen && (
                            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 ${(addModal.type === 'weapon' || addModal.type === 'attack') ? 'arsenal-editor-backdrop' : ''}`} onClick={() => setAddModal({isOpen:false, type:null, data:{}})}>
                                <div className={`rpg-panel border border-purple-500/50 rounded-lg p-6 max-w-md w-full shadow-2xl animate-attack ${(addModal.type === 'weapon' || addModal.type === 'attack') ? `arsenal-editor-dialog is-${addModal.type}` : ''}`} onClick={e => e.stopPropagation()}>
                                    <div className={`flex justify-between items-center mb-6 border-b border-gray-700 pb-3 ${(addModal.type === 'weapon' || addModal.type === 'attack') ? 'arsenal-editor-header' : ''}`}>
                                        {(addModal.type === 'weapon' || addModal.type === 'attack') ? <><span className="arsenal-editor-emblem" aria-hidden="true"><CombatSectionIcon section="arsenal" /></span><div><small>{addModal.type === 'weapon' ? 'Preparar equipo' : `Acción para ${selectedWeapon?.name || 'el arma'}`}</small><h3>{addModal.type === 'weapon' ? 'Nueva arma' : 'Nueva acción'}</h3><p>{addModal.type === 'weapon' ? 'Añádela al arsenal y revisa su configuración antes de usarla.' : 'Define cómo impacta, qué daño causa y cualquier propiedad útil.'}</p></div></> : <h3 className="text-xl font-fantasy font-bold text-white tracking-widest uppercase">Creación</h3>}
                                        <button onClick={() => setAddModal({isOpen:false, type:null, data:{}})} className={(addModal.type === 'weapon' || addModal.type === 'attack') ? 'arsenal-editor-close' : 'text-gray-500 hover:text-white text-3xl leading-none'} aria-label="Cerrar">&times;</button>
                                    </div>

                                    <div className={`space-y-5 ${(addModal.type === 'weapon' || addModal.type === 'attack') ? 'arsenal-editor-body' : ''}`}>
                                        {(addModal.type === 'item' || addModal.type === 'armor' || addModal.type === 'tool' || addModal.type === 'weapon' || addModal.type === 'resource' || addModal.type === 'spell' || addModal.type === 'attack') && (
                                            <div className={(addModal.type === 'weapon' || addModal.type === 'attack') ? 'arsenal-editor-name' : ''}>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Nombre del Elemento</label>
                                                <input type="text" autoFocus placeholder={addNamePlaceholders[addModal.type] || 'Nombre'} value={addModal.data.name || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, name: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none" />
                                            </div>
                                        )}

                                        {addModal.type === 'item' && (
                                            <div className="flex gap-4">
                                                <div className="w-1/3">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Cant.</label>
                                                    <input type="number" placeholder="1" value={addModal.data.qty || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, qty: handleNumInput(e.target.value)}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none text-center" />
                                                </div>
                                                <div className="w-2/3">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Breve Desc.</label>
                                                    <input type="text" placeholder="Ej: 50 pies de cuerda" value={addModal.data.desc || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, desc: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none" />
                                                </div>
                                            </div>
                                        )}

                                        {addModal.type === 'armor' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Categoría</label>
                                                    <select value={addModal.data.type || 'light'} onChange={e => setAddModal({...addModal, data: {...addModal.data, type: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none appearance-none">
                                                        <option value="light">Armadura Ligera</option>
                                                        <option value="medium">Armadura Media</option>
                                                        <option value="heavy">Armadura Pesada</option>
                                                        <option value="shield">Escudo</option>
                                                    </select>
                                                </div>
                                                <div className="rounded border border-purple-900/70 bg-purple-950/20 px-3 py-2 text-xs text-purple-200">Cálculo de CA: <b>{getArmorFormula({ type: addModal.data.type || 'light', ac: addModal.data.ac })}</b></div>
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Clase de Armadura (CA) que otorga</label>
                                                    <input type="number" placeholder="Ej: 11" value={addModal.data.ac || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, ac: handleNumInput(e.target.value)}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none" />
                                                </div>
                                                <label className="flex items-center space-x-3 text-sm text-gray-300 cursor-pointer pt-2 bg-gray-900/50 p-3 rounded border border-gray-800">
                                                    <input type="checkbox" checked={addModal.data.stealthDis || false} onChange={e => setAddModal({...addModal, data: {...addModal.data, stealthDis: e.target.checked}})} className="w-5 h-5 accent-red-600 bg-gray-950 border-gray-700 rounded" />
                                                    <span className="font-medium">Impone Desventaja en Sigilo</span>
                                                </label>
                                            </div>
                                        )}

                                        {addModal.type === 'tool' && (
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Para qué sirve</label>
                                                <textarea placeholder="Ej: Abrir cerraduras y desarmar trampas." value={addModal.data.desc || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, desc: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none h-24 resize-y leading-relaxed" />
                                            </div>
                                        )}

                                        {addModal.type === 'weapon' && (
                                            <div className="arsenal-weapon-form space-y-3 rounded border border-cyan-900/70 bg-cyan-950/15 p-3">
                                                {Array.isArray(addModal.data.attacks) && addModal.data.attacks.length > 0 && <div className="weapon-import-preview"><header><span>Cálculo de ataque</span><small>Se actualizará con tu ficha</small></header>{addModal.data.attacks.map((attack, attackIndex) => <div key={`${attack.name}-${attackIndex}`} className="weapon-import-attack"><div><strong>{attack.name || addModal.data.name}</strong><small>{attack.dmg || 'Daño sin indicar'}</small></div><label><span>Característica</span><select value={attack.attackAbility || 'fue'} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, attacks: previous.data.attacks.map((item, index) => index === attackIndex ? { ...item, attackAbility: event.target.value, autoAttack: true } : item) } }))}><option value="fue">Fuerza</option><option value="des">Destreza</option><option value="finesse">Mejor entre FUE/DES</option></select></label><label className="weapon-import-proficiency" title={attack.autoProficiency ? 'Detectado a partir de las competencias de la ficha' : 'Ajustado manualmente'}><input type="checkbox" checked={getWeaponAttackProficiency(attack)} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, attacks: previous.data.attacks.map((item, index) => index === attackIndex ? { ...item, proficient: event.target.checked, autoProficiency: false, autoAttack: true } : item) } }))}/><span>Competente</span></label><div className="weapon-import-result"><small>A impactar</small><strong>{getWeaponAttackBonus(attack)}</strong></div></div>)}</div>}
                                                <label className="flex items-center gap-3 text-sm font-semibold text-cyan-100"><input type="checkbox" checked={addModal.data.usesAmmo === true || (addModal.data.usesAmmo === undefined && Array.isArray(addModal.data.attacks) && addModal.data.attacks.some(attack => /munici[oó]n/i.test(String(attack.notes || ''))))} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, usesAmmo: event.target.checked } }))} className="h-5 w-5 accent-cyan-600"/><span>Usa munición del inventario</span></label>
                                                {(addModal.data.usesAmmo === true || (addModal.data.usesAmmo === undefined && Array.isArray(addModal.data.attacks) && addModal.data.attacks.some(attack => /munici[oó]n/i.test(String(attack.notes || ''))))) && <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pila de munición<select value={addModal.data.ammoItemId || ''} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, ammoItemId: event.target.value } }))} className="mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case tracking-normal text-white"><option value="">Vincular más tarde</option>{inventory.map(item => <option key={item.id} value={item.id}>{item.name} · {Math.max(0, Number(item.qty) || 0)}</option>)}</select></label>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Por disparo<input type="number" min="1" value={addModal.data.ammoPerShot || 1} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, ammoPerShot: Math.max(1, Math.trunc(Number(event.target.value) || 1)) } }))} className="mt-1 block min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-center text-sm text-white"/></label>
                                                </div>}
                                                <p className="text-xs text-gray-400">La cantidad del objeto elegido será la reserva única para esta arma y la mochila.</p>
                                            </div>
                                        )}
                                        
                                        {(addModal.type === 'trait' || addModal.type === 'feat') && (
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Título</label>
                                                <input type="text" autoFocus placeholder={addModal.type === 'trait' ? 'Ej: Visión en la oscuridad' : 'Ej: Alerta'} value={addModal.data.title || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, title: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none" />
                                            </div>
                                        )}

                                        {(addModal.type === 'trait' || addModal.type === 'feat') && (
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Descripción Detallada</label>
                                                <textarea placeholder="Ej: Describe el beneficio o cómo se usa." value={addModal.data.desc || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, desc: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none h-32 resize-y leading-relaxed" />
                                            </div>
                                        )}

                                        {addModal.type === 'attack' && (
                                            <div className="arsenal-action-fields">
                                                <section className="arsenal-action-attack"><header><div><small>Cálculo para impactar</small><strong>{addModal.data.autoAttack ? 'Automático desde la ficha' : 'Valor manual'}</strong></div><label><input type="checkbox" checked={addModal.data.autoAttack === true} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, autoAttack: event.target.checked } }))}/><span><i></i></span></label></header>{addModal.data.autoAttack ? <div className="arsenal-action-auto"><label><span>Característica</span><select value={addModal.data.attackAbility || 'fue'} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, attackAbility: event.target.value } }))}><option value="fue">Fuerza</option><option value="des">Destreza</option><option value="finesse">Mejor FUE/DES</option></select></label><label className="is-proficient"><input type="checkbox" checked={getWeaponAttackProficiency(addModal.data, selectedWeapon)} onChange={event => setAddModal(previous => ({ ...previous, data: { ...previous.data, proficient: event.target.checked, autoProficiency: false } }))}/><span>Sumar competencia</span></label><div><small>A impactar</small><strong>{getWeaponAttackBonus(addModal.data, selectedWeapon)}</strong></div></div> : <label className="arsenal-action-manual"><span>Bono de ataque</span><input type="text" placeholder="Ej: +6" value={addModal.data.atk || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, atk: e.target.value}})}/></label>}</section>
                                                <label className="arsenal-action-damage"><span>Daño y tipo</span><small>Dados, modificador y naturaleza del daño</small><input type="text" placeholder="Ej: 1d8 + 4 cortante" value={addModal.data.dmg || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, dmg: e.target.value}})}/></label>
                                            </div>
                                        )}

                                        {(addModal.type === 'attack' || addModal.type === 'spell') && (
                                            <div className={addModal.type === 'attack' ? 'arsenal-action-notes' : ''}>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Notas / Efectos Adicionales</label>
                                                <textarea placeholder="Ej: Efecto, condición o nota útil." value={addModal.data.notes || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, notes: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none h-28 resize-y leading-relaxed" />
                                            </div>
                                        )}

                                        {addModal.type === 'spell' && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Nivel (0 = Truco)</label>
                                                        <input type="number" min="0" max="9" placeholder="3" value={addModal.data.level ?? ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, level: handleNumInput(e.target.value)}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none text-center font-mono" />
                                                        {Number(addModal.data.level) === 0 && <span className="text-[10px] text-fuchsia-300">Truco: no consume ranuras ni se prepara.</span>}
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Alcance</label>
                                                        <input type="text" placeholder="Ej: 150 pies" value={addModal.data.range || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, range: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Forma de Área</label>
                                                        <input type="text" placeholder="Ej: Esfera" value={addModal.data.shape || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, shape: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Tamaño Área</label>
                                                        <input type="text" placeholder="Ej: 20 pies" value={addModal.data.size || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, size: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3 mt-2 bg-gray-900/50 p-4 rounded border border-gray-800">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 block font-fantasy border-b border-gray-700 pb-1">Componentes Requeridos</label>
                                                    <div className="flex gap-6">
                                                        <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer font-bold">
                                                            <input type="checkbox" checked={addModal.data.compV || false} onChange={e => setAddModal({...addModal, data: {...addModal.data, compV: e.target.checked}})} className="w-4 h-4 accent-fuchsia-600 bg-gray-950 border-gray-700 rounded" />
                                                            <span>V <span className="text-[10px] font-normal text-gray-500">(Verbal)</span></span>
                                                        </label>
                                                        <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer font-bold">
                                                            <input type="checkbox" checked={addModal.data.compS || false} onChange={e => setAddModal({...addModal, data: {...addModal.data, compS: e.target.checked}})} className="w-4 h-4 accent-fuchsia-600 bg-gray-950 border-gray-700 rounded" />
                                                            <span>S <span className="text-[10px] font-normal text-gray-500">(Gestos)</span></span>
                                                        </label>
                                                        <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer font-bold">
                                                            <input type="checkbox" checked={addModal.data.compM || false} onChange={e => setAddModal({...addModal, data: {...addModal.data, compM: e.target.checked}})} className="w-4 h-4 accent-fuchsia-600 bg-gray-950 border-gray-700 rounded" />
                                                            <span>M <span className="text-[10px] font-normal text-gray-500">(Objeto)</span></span>
                                                        </label>
                                                    </div>
                                                    {addModal.data.compM && (
                                                        <input type="text" placeholder="Ej: polvo de diamante" value={addModal.data.compMDesc || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, compMDesc: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none text-sm mt-2" />
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <label className="flex min-h-11 items-center gap-3 rounded border border-purple-900/70 bg-purple-950/20 px-3 text-sm text-purple-100"><input type="checkbox" checked={addModal.data.concentration || false} onChange={e => setAddModal({...addModal, data: {...addModal.data, concentration: e.target.checked}})} className="h-5 w-5 accent-purple-600"/><span>Concentración</span></label>
                                                    <label className="flex min-h-11 items-center gap-3 rounded border border-gray-700 bg-gray-900/50 px-3 text-sm text-gray-200"><input type="checkbox" checked={addModal.data.ritual || false} onChange={e => setAddModal({...addModal, data: {...addModal.data, ritual: e.target.checked}})} className="h-5 w-5 accent-purple-600"/><span>Ritual</span></label>
                                                </div>
                                                <div className="space-y-3 rounded border border-cyan-900/60 bg-cyan-950/10 p-3">
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-cyan-200">Origen y funcionamiento<select value={addModal.data.grantType || 'standard'} onChange={e => setAddModal({...addModal, data: {...addModal.data, grantType: e.target.value, countsPreparation: false, countsKnownLimit: e.target.value === 'standard'}})} className="mt-1 min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case text-white"><option value="standard">Conjuro normal</option><option value="species">Concedido por especie</option><option value="class">Concedido por clase</option><option value="subclass">Concedido por subclase</option><option value="feat">Concedido por dote</option><option value="item">Concedido por objeto</option></select></label>
                                                    {(addModal.data.grantType || 'standard') !== 'standard' && <input value={addModal.data.grantSource || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, grantSource: e.target.value}})} placeholder="Nombre del rasgo, dote u objeto" className="min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-3 text-sm text-white"/>}
                                                    <div className="grid gap-2 sm:grid-cols-2"><label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={addModal.data.countsPreparation ?? false} onChange={e => setAddModal({...addModal, data: {...addModal.data, countsPreparation: e.target.checked}})} className="h-4 w-4 accent-cyan-600"/>Consume preparación</label><label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={addModal.data.countsKnownLimit ?? (addModal.data.grantType || 'standard') === 'standard'} onChange={e => setAddModal({...addModal, data: {...addModal.data, countsKnownLimit: e.target.checked}})} className="h-4 w-4 accent-cyan-600"/>Cuenta contra conocidos</label></div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Recurso de lanzamiento<select value={addModal.data.castingResource || 'slots'} onChange={e => setAddModal({...addModal, data: {...addModal.data, castingResource: e.target.value}})} className="mt-1 min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-sm normal-case text-white"><option value="slots">Ranuras normales</option><option value="independent">Usos propios independientes</option><option value="at-will">A voluntad</option></select></label>
                                                    {addModal.data.castingResource === 'independent' && <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Usos máximos<input type="number" min="1" value={addModal.data.ownUsesMax || 1} onChange={e => setAddModal({...addModal, data: {...addModal.data, ownUsesMax: Math.max(1, Number(e.target.value) || 1), ownUsesCurrent: Math.max(1, Number(e.target.value) || 1)}})} className="mt-1 min-h-10 w-full rounded border border-gray-700 bg-gray-950 px-2 text-center text-sm text-white"/></label>}
                                                </div>
                                            </>
                                        )}

                                        {addModal.type === 'resource' && (
                                            <div className="space-y-3">
                                            <div className="flex gap-4">
                                                <div className="w-1/2">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Usos Máximos</label>
                                                    <input type="number" placeholder="3" value={addModal.data.max || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, max: handleNumInput(e.target.value)}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none text-center font-mono" />
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block font-fantasy">Tipo de Dado</label>
                                                    <input type="text" placeholder="Ej: d8" value={addModal.data.dice || ''} onChange={e => setAddModal({...addModal, data: {...addModal.data, dice: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 text-white focus:border-purple-500 outline-none text-center font-mono" />
                                                </div>
                                            </div>
                                            <label className="block text-sm text-gray-300">Se recupera con<select value={addModal.data.recoveryRest || 'manual'} onChange={e => setAddModal({...addModal, data:{...addModal.data,recoveryRest:e.target.value}})} className="block mt-1 w-full bg-gray-950 border border-gray-700 rounded p-2"><option value="short">Descanso corto (también largo)</option><option value="long">Descanso largo</option><option value="manual">Solo manualmente</option></select></label>
                                            {addModal.data.recoveryRest !== 'manual' && <label className="block text-sm text-gray-300">Cantidad recuperada<select value={addModal.data.recoveryMode || 'full'} onChange={e => setAddModal({...addModal, data:{...addModal.data,recoveryMode:e.target.value}})} className="block mt-1 w-full bg-gray-950 border border-gray-700 rounded p-2"><option value="full">Completa</option><option value="fixed">Cantidad fija</option><option value="half">Mitad</option><option value="manual">Manual</option></select></label>}
                                            </div>
                                        )}

                                    </div>
                                    <div className={`flex justify-end space-x-4 mt-8 pt-5 border-t border-gray-700 ${(addModal.type === 'weapon' || addModal.type === 'attack') ? 'arsenal-editor-footer' : ''}`}>
                                        <button onClick={() => setAddModal({isOpen:false, type:null, data:{}})} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded font-bold transition-colors font-fantasy uppercase tracking-wider text-xs">Cancelar</button>
                                        <button onClick={handleAddSubmit} className="px-6 py-2 bg-purple-700 hover:bg-purple-600 border border-purple-500 text-white rounded font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all transform hover:scale-105 font-fantasy uppercase tracking-wider text-xs">{addModal.type === 'weapon' ? 'Añadir al arsenal' : addModal.type === 'attack' ? 'Añadir acción' : 'Registrar'}</button>
                                    </div>
                                </div>
                            </div>
                        )}
        </>;
    }

    window.DndEditorDialogComponents = { EditorDialogs };
})();
