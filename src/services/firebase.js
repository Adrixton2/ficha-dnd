import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
    GoogleAuthProvider,
    browserLocalPersistence,
    deleteUser,
    getAuth,
    getRedirectResult,
    linkWithPopup,
    onAuthStateChanged,
    reauthenticateWithPopup,
    setPersistence,
    signInAnonymously,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
    clearIndexedDbPersistence,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    initializeFirestore,
    onSnapshot,
    persistentLocalCache,
    persistentMultipleTabManager,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    terminate,
    updateDoc,
    where,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-check.js";

// firebase-config.js se genera localmente o durante el despliegue; nunca se versiona.
const firebaseConfig = window.__FIREBASE_CONFIG__;
const firebaseState = window.firebaseConnectionState = {
    ready: false,
    authResolved: false,
    user: null,
    error: null,
    offlinePersistence: false,
    appCheck: 'disabled'
};
const notify = (name, detail = {}) => window.dispatchEvent(new CustomEvent(name, { detail }));
const requiredConfigFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
const isConfigured = firebaseConfig
    && typeof firebaseConfig === 'object'
    && requiredConfigFields.every(field => typeof firebaseConfig[field] === 'string' && firebaseConfig[field] && !firebaseConfig[field].startsWith('PEGAR_'));

const removeSensitiveDeviceState = uid => {
    const keys = [
        `dnd_character_manager_v1:${uid}`,
        'dnd_character_manager_v1',
        'dnd_master_bestiary_v1',
        'dnd_master_bestiary_backup_v1',
        'dnd_online_table_v1',
        'dnd_online_hp_pending_v1'
    ];
    keys.forEach(key => {
        try { window.localStorage.removeItem(key); } catch (error) {}
    });
};

try {
    if (!isConfigured) throw new Error('Falta configurar Firebase. Revisa firebase-config.js.');
    const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

    const appCheckSiteKey = window.__FIREBASE_APPCHECK_SITE_KEY__ || firebaseConfig.appCheckSiteKey || '';
    if (appCheckSiteKey) {
        try {
            initializeAppCheck(firebaseApp, {
                provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
                isTokenAutoRefreshEnabled: true
            });
            firebaseState.appCheck = 'enabled';
        } catch (error) {
            firebaseState.appCheck = 'failed';
            console.warn('[Firebase] App Check no pudo inicializarse; las reglas siguen protegiendo los datos.', error);
        }
    }

    const firebaseAuth = getAuth(firebaseApp);
    await setPersistence(firebaseAuth, browserLocalPersistence);

    let firestore;
    try {
        firestore = initializeFirestore(firebaseApp, {
            localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        });
        firebaseState.offlinePersistence = true;
    } catch (error) {
        firestore = getFirestore(firebaseApp);
        firebaseState.offlinePersistence = false;
        console.warn('[Firebase] Persistencia offline no disponible; usando memoria.', error);
    }
    const firestoreApi = { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, runTransaction, serverTimestamp, setDoc, updateDoc, where, writeBatch };
    window.firebaseServices = { app: firebaseApp, auth: firebaseAuth, firestore };
    window.firebaseFirestore = firestoreApi;

    const googleProvider = () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        return provider;
    };
    const beginGuestSession = async () => {
        if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
        return (await signInAnonymously(firebaseAuth)).user;
    };
    const signInWithGoogle = async () => {
        if (firebaseAuth.currentUser?.isAnonymous) return window.firebaseAccount.linkAnonymousWithGoogle();
        return (await signInWithPopup(firebaseAuth, googleProvider())).user;
    };
    const linkAnonymousWithGoogle = async () => {
        const sourceUser = firebaseAuth.currentUser;
        if (!sourceUser?.isAnonymous) return signInWithGoogle();
        const sourceUid = sourceUser.uid;
        try {
            return (await linkWithPopup(sourceUser, googleProvider())).user;
        } catch (error) {
            if (!['auth/credential-already-in-use', 'auth/email-already-in-use'].includes(error?.code)) throw error;
            const accountError = new Error('La cuenta de Google ya contiene datos. Exporta cada personaje desde el selector de personajes y entra después con Google para importarlos sin mezclar propietarios de forma insegura.');
            accountError.code = 'ACCOUNT_ALREADY_EXISTS_EXPORT_REQUIRED';
            accountError.sourceUid = sourceUid;
            throw accountError;
        }
    };
    const updateMinimalProfile = async ({ displayName = '', avatarUrl = '' } = {}) => {
        const user = firebaseAuth.currentUser;
        if (!user) throw new Error('AUTH_REQUIRED');
        const cleanName = String(displayName || '').trim().slice(0, 80);
        const cleanAvatar = String(avatarUrl || '').trim().slice(0, 500);
        await setDoc(doc(firestore, 'users', user.uid), {
            uid: user.uid,
            displayName: cleanName,
            avatarUrl: cleanAvatar,
            updatedAt: serverTimestamp()
        }, { merge: true });
    };
    const signOutSecurely = async () => {
        const user = firebaseAuth.currentUser;
        if (!user || user.isAnonymous) throw new Error('ANONYMOUS_SIGN_OUT_UNSAFE');
        const uid = user.uid;
        notify('firebase-before-signout', { uid });
        await signOut(firebaseAuth);
        removeSensitiveDeviceState(uid);
        try {
            await terminate(firestore);
            await clearIndexedDbPersistence(firestore);
        } catch (error) {
            console.warn('[Firebase] No se pudo limpiar por completo IndexedDB.', error);
        }
        window.location.reload();
    };
    const commitDeletes = async references => {
        for (let offset = 0; offset < references.length; offset += 350) {
            const batch = writeBatch(firestore);
            references.slice(offset, offset + 350).forEach(reference => batch.delete(reference));
            await batch.commit();
        }
    };
    const ownDocuments = async (collectionRef, uid) => {
        const snapshot = await getDocs(query(collectionRef, where('ownerUid', '==', uid)));
        return snapshot.docs.map(item => item.ref);
    };
    const deleteMyAccount = async () => {
        const user = firebaseAuth.currentUser;
        if (!user) throw new Error('AUTH_REQUIRED');
        const uid = user.uid;
        if (!user.isAnonymous) await reauthenticateWithPopup(user, googleProvider());

        const campaignReferences = await getDocs(collection(firestore, 'users', uid, 'campaigns'));
        for (const reference of campaignReferences.docs) {
            const campaignId = reference.data().campaignId || reference.id;
            const campaignRef = doc(firestore, 'campaigns', campaignId);
            try {
                const [campaignSnapshot, memberSnapshot] = await Promise.all([
                    getDoc(campaignRef),
                    getDoc(doc(firestore, 'campaigns', campaignId, 'members', uid))
                ]);
                const isOwner = campaignSnapshot.exists()
                    && campaignSnapshot.data().ownerUid === uid
                    && memberSnapshot.data()?.role === 'owner';
                if (isOwner && campaignSnapshot.data().status !== 'closed') {
                    await updateDoc(campaignRef, { status: 'closed', joinEnabled: false, updatedAt: serverTimestamp() });
                } else if (memberSnapshot.exists()) {
                    const removable = [];
                    for (const childName of ['effectsPublic', 'characterSummaries', 'characterProfiles', 'participants']) {
                        try {
                            removable.push(...await ownDocuments(collection(firestore, 'campaigns', campaignId, childName), uid));
                        } catch (error) {
                            if (error?.code !== 'permission-denied') throw error;
                        }
                    }
                    removable.push(doc(firestore, 'campaigns', campaignId, 'memberPrivate', uid));
                    await commitDeletes(removable);
                    await deleteDoc(memberSnapshot.ref);
                }
            } catch (error) {
                if (!['permission-denied', 'not-found'].includes(error?.code)) throw error;
            }
            await deleteDoc(reference.ref);
        }

        const characters = await getDocs(query(collection(firestore, 'characters'), where('ownerUid', '==', uid)));
        await commitDeletes(characters.docs.map(item => item.ref));
        await deleteDoc(doc(firestore, 'users', uid)).catch(error => {
            if (error?.code !== 'not-found') throw error;
        });
        notify('firebase-before-signout', { uid });
        await deleteUser(user);
        removeSensitiveDeviceState(uid);
        try {
            await terminate(firestore);
            await clearIndexedDbPersistence(firestore);
        } catch (error) {}
        return { deleted: true };
    };

    window.firebaseAccount = {
        beginGuestSession,
        deleteMyAccount,
        linkAnonymousWithGoogle,
        signInWithGoogle,
        signOutSecurely,
        updateMinimalProfile
    };

    firebaseState.ready = true;
    notify('firebase-ready');
    await getRedirectResult(firebaseAuth).catch(error => {
        firebaseState.error = error;
        notify('firebase-error', { error });
    });
    onAuthStateChanged(firebaseAuth, user => {
        firebaseState.user = user;
        firebaseState.authResolved = true;
        firebaseState.error = null;
        notify('firebase-auth-state', { user });
    });
} catch (error) {
    firebaseState.error = error;
    firebaseState.authResolved = true;
    notify('firebase-error', { error });
}
