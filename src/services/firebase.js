        import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
        import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
        import { collection, doc, getDoc, getFirestore, onSnapshot, runTransaction, serverTimestamp, setDoc, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

        // Sustituye exclusivamente los valores PEGAR_* por la configuración web de tu proyecto Firebase.
        // firebase-config.js se genera localmente o durante el despliegue; nunca se versiona.
        const firebaseConfig = window.__FIREBASE_CONFIG__;

        const firebaseState = window.firebaseConnectionState = { ready: false, user: null, error: null };
        const notify = (type, detail = {}) => window.dispatchEvent(new CustomEvent(type, { detail }));
        const isConfigured = firebaseConfig
            && typeof firebaseConfig === "object"
            && Object.values(firebaseConfig).every(value => typeof value === "string" && value && !value.startsWith("PEGAR_"));

        try {
            if (!isConfigured) throw new Error("Falta configurar Firebase. Sustituye los valores PEGAR_* de firebaseConfig.");
            const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
            const firebaseAuth = getAuth(firebaseApp);
            const firestore = getFirestore(firebaseApp);
            window.firebaseServices = { app: firebaseApp, auth: firebaseAuth, firestore };
            window.firebaseFirestore = { collection, doc, getDoc, onSnapshot, runTransaction, serverTimestamp, setDoc, updateDoc, writeBatch };
            firebaseState.ready = true;
            console.info("[Firebase] Inicializado.");
            notify("firebase-ready");

            let anonymousSignInStarted = false;
            onAuthStateChanged(firebaseAuth, async user => {
                if (user) {
                    firebaseState.user = user;
                    console.info("[Firebase] Inicio anónimo completado. UID recibido:", user.uid);
                    notify("firebase-auth-state", { user });
                    return;
                }
                if (anonymousSignInStarted) return;
                anonymousSignInStarted = true;
                try {
                    await signInAnonymously(firebaseAuth);
                } catch (error) {
                    firebaseState.error = error;
                    console.error("[Firebase] Error durante el inicio anónimo:", error);
                    notify("firebase-error", { error });
                }
            });
        } catch (error) {
            firebaseState.error = error;
            console.error("[Firebase] Error de inicialización:", error);
            notify("firebase-error", { error });
        }
