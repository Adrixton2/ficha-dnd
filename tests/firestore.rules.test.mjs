import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';

const projectId = 'demo-ficha-dnd';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
let environment;

before(async () => {
    environment = await initializeTestEnvironment({ projectId, firestore: { rules } });
});
after(async () => environment?.cleanup());
beforeEach(async () => {
    await environment.clearFirestore();
    await environment.withSecurityRulesDisabled(async context => {
        const db = context.firestore();
        await setDoc(doc(db, 'campaigns', 'campaign_a'), {
            ownerUid: 'user_a', name: 'Campaña segura', status: 'lobby', schemaVersion: 2,
            inviteCode: 'ABCDEFGH', joinEnabled: true, round: 0, currentTurnId: null, turnOrder: [], turnIndex: 0,
            createdAt: new Date(), updatedAt: new Date()
        });
        await setDoc(doc(db, 'campaigns', 'campaign_a', 'members', 'user_a'), { uid: 'user_a', role: 'owner', displayName: 'Máster', active: true, blocked: false, joinedAt: new Date(), updatedAt: new Date() });
        await setDoc(doc(db, 'campaigns', 'campaign_a', 'members', 'user_b'), { uid: 'user_b', role: 'player', displayName: 'Jugador', active: true, blocked: false, joinedAt: new Date(), updatedAt: new Date() });
        await setDoc(doc(db, 'characters', 'char_a'), {
            ownerUid: 'user_a', schemaVersion: 1, name: 'A', recordJson: '{"privateNotes":"A"}', clientUpdatedAt: new Date().toISOString(), updatedAt: new Date()
        });
        await setDoc(doc(db, 'characters', 'char_b'), {
            ownerUid: 'user_b', schemaVersion: 1, name: 'B', recordJson: '{"privateNotes":"B"}', clientUpdatedAt: new Date().toISOString(), updatedAt: new Date()
        });
        await setDoc(doc(db, 'campaigns', 'campaign_a', 'participants', 'user_b'), {
            id: 'user_b', ownerUid: 'user_b', type: 'player', name: 'B', characterId: 'char_b', currentHp: 10, maxHp: 12, tempHp: 0, initiative: 14, conditions: [], connected: true, updatedAt: new Date()
        });
        await setDoc(doc(db, 'campaigns', 'campaign_a', 'effectsPrivate', 'secret_1'), { id: 'secret_1', name: 'Secreto del Máster', createdBy: 'user_a' });
        await setDoc(doc(db, 'campaigns', 'campaign_a', 'effectsPublic', 'effect_b'), { id: 'effect_b', name: 'Guía', ownerUid: 'user_b', createdBy: 'user_b', targetId: 'user_b', targetType: 'player', visibleToPlayers: true });
        await setDoc(doc(db, 'campaigns', 'campaign_a', 'publicCombatants', 'enemy_1'), { id: 'enemy_1', type: 'enemy', name: 'Goblin' });
        await setDoc(doc(db, 'campaignInvites', 'ABCDEFGH'), { campaignId: 'campaign_a', active: true });
        await setDoc(doc(db, 'rooms', 'ABC234'), { code: 'ABC234', ownerUid: 'user_a', status: 'lobby', schemaVersion: 1 });
        await setDoc(doc(db, 'rooms', 'ABC234', 'members', 'user_a'), { uid: 'user_a', role: 'master', displayName: 'Máster', active: true, joinedAt: new Date() });
    });
});

const dbFor = uid => environment.authenticatedContext(uid).firestore();

test('usuario A puede leer su personaje privado', async () => {
    await assertSucceeds(getDoc(doc(dbFor('user_a'), 'characters', 'char_a')));
});

test('usuario B no puede leer ni escribir el personaje privado de A', async () => {
    const db = dbFor('user_b');
    await assertFails(getDoc(doc(db, 'characters', 'char_a')));
    await assertFails(updateDoc(doc(db, 'characters', 'char_a'), { name: 'Robado' }));
});

test('el propietario no puede cambiar ownerUid ni añadir campos inesperados', async () => {
    const db = dbFor('user_a');
    await assertFails(updateDoc(doc(db, 'characters', 'char_a'), { ownerUid: 'user_b' }));
    await assertFails(updateDoc(doc(db, 'characters', 'char_a'), { admin: true }));
});

test('un jugador no puede convertirse en master ni editar roles', async () => {
    const membership = doc(dbFor('user_b'), 'campaigns', 'campaign_a', 'members', 'user_b');
    await assertFails(updateDoc(membership, { role: 'master' }));
    await assertSucceeds(updateDoc(membership, { displayName: 'Jugador renombrado', updatedAt: new Date() }));
});

test('un miembro puede leer la campaña y quien conoce el código solo ve la cabecera abierta', async () => {
    await assertSucceeds(getDoc(doc(dbFor('user_b'), 'campaigns', 'campaign_a')));
    await assertSucceeds(getDoc(doc(dbFor('user_c'), 'campaigns', 'campaign_a')));
    await assertFails(getDocs(collection(dbFor('user_c'), 'campaigns', 'campaign_a', 'participants')));
});

test('el master puede modificar HP compartido sin cambiar propiedad', async () => {
    const participant = doc(dbFor('user_a'), 'campaigns', 'campaign_a', 'participants', 'user_b');
    await assertSucceeds(updateDoc(participant, { currentHp: 4 }));
    await assertFails(updateDoc(participant, { ownerUid: 'user_a' }));
});

test('el master no puede leer la ficha privada completa de otro jugador', async () => {
    await assertFails(getDoc(doc(dbFor('user_a'), 'characters', 'char_b')));
});

test('un jugador no puede leer ni modificar efectos privados del master', async () => {
    const secret = doc(dbFor('user_b'), 'campaigns', 'campaign_a', 'effectsPrivate', 'secret_1');
    await assertFails(getDoc(secret));
    await assertFails(updateDoc(secret, { name: 'Manipulado' }));
});

test('un código antiguo conocido puede resolverse pero no enumerarse', async () => {
    await assertSucceeds(getDoc(doc(dbFor('user_c'), 'campaignInvites', 'ABCDEFGH')));
    await assertFails(getDocs(collection(dbFor('user_c'), 'campaignInvites')));
});

test('una sala V1 permite entrar únicamente como jugador con su código exacto', async () => {
    const db = dbFor('user_c');
    await assertFails(getDoc(doc(db, 'rooms', 'ABC234')));
    await assertSucceeds(setDoc(doc(db, 'rooms', 'ABC234', 'members', 'user_c'), {
        uid: 'user_c', role: 'player', displayName: 'Jugador', active: true, joinedAt: new Date(), lastSeen: new Date()
    }));
    await assertFails(setDoc(doc(db, 'rooms', 'ABC234', 'members', 'user_d'), {
        uid: 'user_d', role: 'master', displayName: 'Intruso', active: true, joinedAt: new Date()
    }));
});

test('un usuario deslogueado no puede acceder a datos protegidos', async () => {
    const db = environment.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'characters', 'char_a')));
    await assertFails(getDoc(doc(db, 'campaigns', 'campaign_a')));
});

test('writes de personaje con campos arbitrarios son rechazados', async () => {
    const db = dbFor('user_a');
    await assertFails(setDoc(doc(db, 'characters', 'malicious'), {
        ownerUid: 'user_a', schemaVersion: 1, name: 'X', recordJson: '{}', clientUpdatedAt: new Date().toISOString(), updatedAt: new Date(), role: 'owner'
    }));
});

test('un miembro no puede fabricar otro miembro aunque conozca campaignId', async () => {
    await assertFails(setDoc(doc(dbFor('user_b'), 'campaigns', 'campaign_a', 'members', 'attacker'), {
        uid: 'attacker', role: 'owner', displayName: 'Atacante', active: true
    }));
});

test('quien conoce una campaña abierta puede unirse solo como jugador y crear su índice privado', async () => {
    const db = dbFor('user_c');
    const batch = writeBatch(db);
    batch.set(doc(db, 'campaigns', 'campaign_a', 'members', 'user_c'), {
        uid: 'user_c', role: 'player', displayName: 'Nueva jugadora', active: true, blocked: false,
        joinedAt: new Date(), lastSeen: new Date(), updatedAt: new Date()
    });
    batch.set(doc(db, 'users', 'user_c', 'campaigns', 'campaign_a'), {
        campaignId: 'campaign_a', role: 'player', active: true, name: 'Campaña segura',
        inviteCode: 'ABCDEFGH', updatedAt: new Date()
    });
    await assertSucceeds(batch.commit());
    await assertFails(setDoc(doc(db, 'campaigns', 'campaign_a', 'members', 'owner_falso'), {
        uid: 'owner_falso', role: 'owner', displayName: 'Falso', active: true, blocked: false,
        joinedAt: new Date(), updatedAt: new Date()
    }));
});

test('un usuario puede crear una campaña Spark, pero no elegir otro propietario', async () => {
    const db = dbFor('user_c');
    const campaignId = 'K7MP4QTXW9RF';
    const batch = writeBatch(db);
    batch.set(doc(db, 'campaigns', campaignId), {
        ownerUid: 'user_c', name: 'Mesa Online', status: 'lobby', schemaVersion: 2,
        inviteCode: campaignId, joinEnabled: true, round: 0, currentTurnId: null,
        turnOrder: [], turnIndex: 0, createdAt: new Date(), updatedAt: new Date()
    });
    batch.set(doc(db, 'campaigns', campaignId, 'members', 'user_c'), {
        uid: 'user_c', role: 'owner', displayName: 'Máster', active: true, blocked: false,
        joinedAt: new Date(), lastSeen: new Date(), updatedAt: new Date()
    });
    batch.set(doc(db, 'users', 'user_c', 'campaigns', campaignId), {
        campaignId, role: 'owner', active: true, name: 'Mesa Online', inviteCode: campaignId, updatedAt: new Date()
    });
    await assertSucceeds(batch.commit());
    await assertFails(setDoc(doc(db, 'campaigns', 'OTRACAMPANA2'), {
        ownerUid: 'user_a', name: 'Robada', status: 'lobby', schemaVersion: 2,
        inviteCode: 'OTRACAMPANA2', joinEnabled: true, round: 0, currentTurnId: null,
        turnOrder: [], turnIndex: 0, createdAt: new Date(), updatedAt: new Date()
    }));
});

test('un invitado autenticado puede crear una campaña Spark sin leer antes el código', async () => {
    const uid = 'guest_creator';
    const campaignId = 'GUEST8KQ2MNP';
    const db = environment.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } }).firestore();
    const batch = writeBatch(db);
    batch.set(doc(db, 'campaigns', campaignId), {
        ownerUid: uid, name: 'Mesa Online', status: 'lobby', schemaVersion: 2,
        inviteCode: campaignId, joinEnabled: true, round: 0, currentTurnId: null,
        turnOrder: [], turnIndex: 0, createdAt: new Date(), updatedAt: new Date()
    });
    batch.set(doc(db, 'campaigns', campaignId, 'members', uid), {
        uid, role: 'owner', displayName: 'Máster', active: true, blocked: false,
        joinedAt: new Date(), lastSeen: new Date(), updatedAt: new Date()
    });
    batch.set(doc(db, 'users', uid, 'campaigns', campaignId), {
        campaignId, role: 'owner', active: true, name: 'Mesa Online', inviteCode: campaignId, updatedAt: new Date()
    });
    await assertSucceeds(batch.commit());
});

test('el master puede guardar la Destreza privada de un enemigo en una sala V1', async () => {
    await assertSucceeds(setDoc(doc(dbFor('user_a'), 'rooms', 'ABC234', 'privateEnemies', 'enemy_dex'), {
        id: 'enemy_dex', currentHp: 12, maxHp: 12, tempHp: 0, armorClass: 13, dexterity: 16, notes: '', updatedAt: new Date()
    }));
});

test('solo el propietario puede bloquear a un miembro expulsado y el jugador no puede reactivarse', async () => {
    const membership = doc(dbFor('user_a'), 'campaigns', 'campaign_a', 'members', 'user_b');
    await assertSucceeds(updateDoc(membership, { active: false, blocked: true, updatedAt: new Date() }));
    await assertFails(updateDoc(doc(dbFor('user_b'), 'campaigns', 'campaign_a', 'members', 'user_b'), {
        active: true, blocked: false, updatedAt: new Date()
    }));
});

test('cerrar una campaña bloquea sus datos compartidos y nuevas incorporaciones', async () => {
    await assertSucceeds(updateDoc(doc(dbFor('user_a'), 'campaigns', 'campaign_a'), {
        status: 'closed', joinEnabled: false, updatedAt: new Date()
    }));
    await assertFails(getDoc(doc(dbFor('user_b'), 'campaigns', 'campaign_a', 'participants', 'user_b')));
    await assertFails(setDoc(doc(dbFor('user_c'), 'campaigns', 'campaign_a', 'members', 'user_c'), {
        uid: 'user_c', role: 'player', displayName: 'Tarde', active: true, blocked: false,
        joinedAt: new Date(), updatedAt: new Date()
    }));
});

test('un participante no puede inyectar campos arbitrarios en combate', async () => {
    await assertFails(updateDoc(doc(dbFor('user_b'), 'campaigns', 'campaign_a', 'participants', 'user_b'), { role: 'owner' }));
    await assertFails(setDoc(doc(dbFor('user_b'), 'campaigns', 'campaign_a', 'participants', 'fake'), {
        id: 'fake', ownerUid: 'user_b', type: 'player', name: 'Falso', currentHp: 1, maxHp: 1, tempHp: 0,
        conditions: [], updatedAt: new Date(), master: true
    }));
});

test('los borrados autorizados no dependen de request.resource', async () => {
    await assertSucceeds(deleteDoc(doc(dbFor('user_b'), 'campaigns', 'campaign_a', 'effectsPublic', 'effect_b')));
    await assertSucceeds(deleteDoc(doc(dbFor('user_a'), 'campaigns', 'campaign_a', 'publicCombatants', 'enemy_1')));
});

test('un jugador no puede aplicar efectos públicos a enemigos u otros objetivos', async () => {
    await assertFails(setDoc(doc(dbFor('user_b'), 'campaigns', 'campaign_a', 'effectsPublic', 'malicious_effect'), {
        id: 'malicious_effect', name: 'Control enemigo', ownerUid: 'user_b', createdBy: 'user_b',
        targetId: 'enemy_1', targetType: 'enemy', visibleToPlayers: true
    }));
});

test('un no miembro no puede crear ni leer su espacio privado dentro de una campaña', async () => {
    const privateRef = doc(dbFor('user_c'), 'campaigns', 'campaign_a', 'memberPrivate', 'user_c');
    await assertFails(setDoc(privateRef, { notes: 'intrusión' }));
    await assertFails(getDoc(privateRef));
});

test('las reglas cargadas usan denegación por defecto para rutas desconocidas', async () => {
    await assertFails(getDoc(doc(dbFor('user_a'), 'adminSecrets', 'global')));
    await assertFails(getDocs(collection(dbFor('user_a'), 'campaigns')));
    assert.match(rules, /campaignInvites[\s\S]*allow list, write: if false/);
});
