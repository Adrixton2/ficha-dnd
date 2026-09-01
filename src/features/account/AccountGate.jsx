window.DndAccountComponents = (() => {
    const { useEffect, useMemo, useState } = React;

    const readFirebaseState = () => ({
        ready: window.firebaseConnectionState?.ready === true,
        resolved: window.firebaseConnectionState?.authResolved === true,
        user: window.firebaseConnectionState?.user || null,
        error: window.firebaseConnectionState?.error || null,
        offlinePersistence: window.firebaseConnectionState?.offlinePersistence === true,
        appCheck: window.firebaseConnectionState?.appCheck || 'disabled'
    });
    const getErrorMessage = error => {
        const code = error?.code || error?.message || '';
        const messages = {
            'auth/popup-closed-by-user': 'Se cerró la ventana de Google antes de completar el acceso.',
            'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes e inténtalo de nuevo.',
            'auth/unauthorized-domain': `El dominio actual (${window.location.hostname}) no está autorizado en Firebase Authentication. Prueba desde la app publicada o autoriza este dominio para desarrollo.`,
            'auth/operation-not-allowed': 'El acceso con Google todavía no está habilitado en Firebase Authentication.',
            'auth/network-request-failed': 'No hay conexión suficiente para completar el acceso.',
            'auth/requires-recent-login': 'La operación exige una identificación reciente. Vuelve a intentarlo y confirma Google.',
            'ACCOUNT_ALREADY_EXISTS_EXPORT_REQUIRED': 'Esa cuenta de Google ya está protegida. Pulsa «Ya tengo cuenta» para entrar y ver sus personajes.',
            'ANONYMOUS_SIGN_OUT_UNSAFE': 'Protege la cuenta de invitado antes de cerrar sesión para no perder el acceso.'
        };
        return messages[code] || messages[String(code).replace(/^Firebase:\s*/i, '')] || 'No se pudo completar la operación de cuenta.';
    };
    const downloadJson = (payload, fileName) => {
        const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    };

    function AccountGate({ children }) {
        const [state, setState] = useState(readFirebaseState);
        const [busy, setBusy] = useState('');
        const [error, setError] = useState('');
        const [panelOpen, setPanelOpen] = useState(false);
        const [existingAccountOpen, setExistingAccountOpen] = useState(false);
        const [deleteOpen, setDeleteOpen] = useState(false);
        const [deleteConfirmation, setDeleteConfirmation] = useState('');
        const [alias, setAlias] = useState('');
        const user = state.user;

        useEffect(() => {
            const sync = () => setState(readFirebaseState());
            window.addEventListener('firebase-ready', sync);
            window.addEventListener('firebase-auth-state', sync);
            window.addEventListener('firebase-error', sync);
            return () => {
                window.removeEventListener('firebase-ready', sync);
                window.removeEventListener('firebase-auth-state', sync);
                window.removeEventListener('firebase-error', sync);
            };
        }, []);
        useEffect(() => {
            setAlias(user?.displayName || '');
            setError('');
        }, [user?.uid]);

        const identityLabel = useMemo(() => user?.isAnonymous ? 'Invitado' : (alias.trim() || user?.displayName || 'Cuenta sincronizada'), [user?.isAnonymous, user?.displayName, alias]);
        const run = async (operation, action) => {
            if (busy) return;
            try {
                setBusy(operation);
                setError('');
                await action();
            } catch (operationError) {
                console.error('[Cuenta]', operationError);
                setError(getErrorMessage(operationError));
                if (operationError?.code === 'ACCOUNT_ALREADY_EXISTS_EXPORT_REQUIRED') setExistingAccountOpen(true);
            } finally {
                setBusy('');
            }
        };
        const exportAccountData = async () => {
            const scopedKey = user?.uid ? `dnd_character_manager_v1:${user.uid}` : '';
            let manager = null;
            let bestiary = null;
            let settings = null;
            let campaigns = [];
            try { manager = JSON.parse(window.localStorage.getItem(scopedKey) || window.localStorage.getItem('dnd_character_manager_v1') || 'null'); } catch (readError) {}
            try { bestiary = JSON.parse(window.localStorage.getItem('dnd_master_bestiary_v1') || 'null'); } catch (readError) {}
            try { settings = JSON.parse(window.localStorage.getItem('dnd_app_settings_v1') || 'null'); } catch (readError) {}
            try {
                const db = window.firebaseServices?.firestore;
                const api = window.firebaseFirestore;
                if (db && api && user?.uid) {
                    const snapshot = await api.getDocs(api.collection(db, 'users', user.uid, 'campaigns'));
                    campaigns = snapshot.docs.map(item => ({ id: item.id, ...item.data(), updatedAt: item.data().updatedAt?.toDate?.()?.toISOString?.() || null }));
                }
            } catch (readError) {}
            downloadJson({
                format: 'dnd-account-export',
                schemaVersion: 1,
                exportedAt: new Date().toISOString(),
                account: { uid: user?.uid || '', type: user?.isAnonymous ? 'guest' : 'google' },
                characterManager: manager,
                bestiary,
                settings,
                campaigns
            }, `datos-ficha-dnd-${new Date().toISOString().slice(0, 10)}.json`);
        };
        const saveAlias = () => run('alias', () => window.firebaseAccount.updateMinimalProfile({ displayName: alias }));
        const openExistingAccount = () => {
            setError('');
            setExistingAccountOpen(true);
        };
        const deleteAccount = () => run('delete', async () => {
            await window.firebaseAccount.deleteMyAccount();
            window.location.reload();
        });

        if (!state.resolved) {
            return <main className="account-entry account-entry--loading"><span className="account-entry__sigil" aria-hidden="true">◇</span><h1>Preparando tu archivo</h1><p>Comprobando la identidad guardada en este dispositivo…</p></main>;
        }
        if (!user) {
            return <main className="account-entry">
                <section className="account-entry__card" aria-labelledby="account-entry-title">
                    <span className="account-entry__sigil" aria-hidden="true">✦</span>
                    <small>Archivo de aventureros</small>
                    <h1 id="account-entry-title">Tu ficha, donde la necesites</h1>
                    <p>Accede con Google para sincronizar tus personajes o continúa como invitado en este dispositivo.</p>
                    <div className="account-entry__actions">
                        <button type="button" className="is-google" disabled={!!busy || !state.ready} onClick={() => run('google', () => window.firebaseAccount.signInWithGoogle())}><span aria-hidden="true">G</span><b>{busy === 'google' ? 'Abriendo Google…' : 'Continuar con Google'}</b></button>
                        <button type="button" disabled={!!busy || !state.ready} onClick={() => run('guest', () => window.firebaseAccount.beginGuestSession())}><span aria-hidden="true">◇</span><b>{busy === 'guest' ? 'Creando acceso…' : 'Continuar como invitado'}</b></button>
                    </div>
                    <p className="account-entry__privacy"><span aria-hidden="true">◆</span>No almacenamos contraseñas ni copiamos tu email a Firestore.</p>
                    {(error || state.error) && <div className="account-entry__error" role="alert">{error || getErrorMessage(state.error)}</div>}
                </section>
            </main>;
        }

        return <>
            <React.Fragment key={user.uid}>{children}</React.Fragment>
            <button type="button" className={`account-status-button ${user.isAnonymous ? 'is-guest' : 'is-synced'}`} onClick={() => setPanelOpen(true)} aria-label="Abrir Cuenta y privacidad"><span aria-hidden="true">{user.isAnonymous ? '◇' : '✓'}</span><b>{user.isAnonymous ? 'Invitado' : 'Sincronizado'}</b></button>
            {user.isAnonymous && <aside className={`guest-protection-banner ${error ? 'has-error' : ''}`} role={error ? 'alert' : 'status'}><span aria-hidden="true">{error ? '!' : '◇'}</span><div><strong>Esta ficha solo está protegida por este dispositivo</strong><p>Vincula una cuenta nueva o entra en una que ya tengas.</p>{error && <p className="guest-protection-banner__error">{error}</p>}</div><div className="guest-protection-banner__actions"><button type="button" className="is-secondary" disabled={!!busy} onClick={openExistingAccount}>Ya tengo cuenta</button><button type="button" disabled={!!busy} onClick={() => run('link', () => window.firebaseAccount.linkAnonymousWithGoogle())}>{busy === 'link' ? 'Conectando…' : 'Proteger cuenta nueva'}</button></div></aside>}
            {panelOpen && ReactDOM.createPortal(<div className="account-dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setPanelOpen(false); }}>
                <section className="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
                    <header><span aria-hidden="true">✦</span><div><small>Cuenta · Datos y privacidad</small><h2 id="account-dialog-title">{identityLabel}</h2><p>{user.isAnonymous ? 'Acceso temporal vinculado a este dispositivo.' : 'Cuenta protegida y disponible en tus dispositivos.'}</p></div><button type="button" onClick={() => setPanelOpen(false)} aria-label="Cerrar">×</button></header>
                    <div className="account-dialog__body">
                        <section className="account-sync-state"><span className={user.isAnonymous ? 'is-warning' : 'is-ready'} aria-hidden="true">{user.isAnonymous ? '!' : '✓'}</span><div><small>Estado</small><strong>{user.isAnonymous ? 'Invitado sin recuperación' : 'Sincronización activada'}</strong><p>{state.offlinePersistence ? 'Este dispositivo mantiene una copia offline aislada por el navegador.' : 'La caché de Firestore solo está disponible durante esta sesión.'}</p></div></section>
                        {user.isAnonymous ? <div className="account-auth-options"><button type="button" className="account-protect-action" disabled={!!busy} onClick={() => run('link', () => window.firebaseAccount.linkAnonymousWithGoogle())}><span>G</span><div><strong>Proteger esta cuenta</strong><small>Vincula este invitado con una cuenta de Google nueva.</small></div></button><button type="button" className="account-existing-action" disabled={!!busy} onClick={openExistingAccount}><span>↪</span><div><strong>Ya tengo una cuenta</strong><small>Entra para recuperar los personajes que ya sincronizaste.</small></div></button></div> : <section className="account-alias"><label><span>Alias visible</span><small>Opcional. El email no se guarda en Firestore.</small><input value={alias} maxLength="80" onChange={event => setAlias(event.target.value)} placeholder="Nombre de jugador" /></label><button type="button" disabled={busy === 'alias'} onClick={saveAlias}>{busy === 'alias' ? 'Guardando…' : 'Guardar alias'}</button></section>}
                        <section className="account-privacy-facts"><h3>Privacidad</h3><p><span>◆</span>Firebase Authentication conserva la identidad; la ficha usa únicamente tu UID para autorizar datos.</p><p><span>◆</span>Otros jugadores nunca reciben tu email ni tus notas privadas.</p><p><span>◆</span>App Check: {state.appCheck === 'enabled' ? 'activo en este cliente' : state.appCheck === 'failed' ? 'configurado, pero no pudo iniciarse' : 'pendiente de configurar en Firebase Console'}.</p></section>
                        <div className="account-data-actions"><button type="button" onClick={exportAccountData}><span>⇩</span><div><strong>Exportar mis datos</strong><small>Descarga una copia JSON de los personajes disponibles.</small></div></button>{!user.isAnonymous && <button type="button" disabled={!!busy} onClick={() => run('signout', () => window.firebaseAccount.signOutSecurely())}><span>↪</span><div><strong>Cerrar sesión</strong><small>Limpia los datos sensibles de este dispositivo.</small></div></button>}<button type="button" className="is-danger" onClick={() => setDeleteOpen(true)}><span>×</span><div><strong>Eliminar mi cuenta y datos</strong><small>Incluye tus personajes y campañas propias.</small></div></button></div>
                        {error && <div className="account-dialog__error" role="alert">{error}</div>}
                    </div>
                </section>
            </div>, document.body)}
            {user.isAnonymous && existingAccountOpen && ReactDOM.createPortal(<div className="account-dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setExistingAccountOpen(false); }}><section className="account-switch-dialog" role="dialog" aria-modal="true" aria-labelledby="account-switch-title"><span aria-hidden="true">↪</span><small>Cuenta existente</small><h2 id="account-switch-title">Entrar con Google</h2><p>Al continuar dejarás esta sesión de invitado y verás los personajes de tu cuenta. Los datos del invitado no se fusionarán automáticamente.</p><p className="account-switch-dialog__notice">Si has creado algo importante en este dispositivo como invitado, expórtalo antes de cambiar de cuenta.</p><div className="account-switch-dialog__actions"><button type="button" disabled={!!busy} onClick={() => setExistingAccountOpen(false)}>Cancelar</button><button type="button" disabled={!!busy} onClick={exportAccountData}>Exportar invitado</button><button type="button" className="is-primary" disabled={!!busy} onClick={() => run('existing-google', () => window.firebaseAccount.signInWithExistingGoogle())}>{busy === 'existing-google' ? 'Abriendo Google…' : 'Entrar con Google'}</button></div>{error && <div className="account-dialog__error" role="alert">{error}</div>}</section></div>, document.body)}
            {deleteOpen && ReactDOM.createPortal(<div className="account-delete-backdrop"><section className="account-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="account-delete-title"><span aria-hidden="true">!</span><h2 id="account-delete-title">Eliminar cuenta y datos</h2><p>Se eliminarán tus personajes sincronizados y tu acceso. Saldrás de las campañas y las campañas propias quedarán cerradas; sus registros internos permanecerán bloqueados e inaccesibles. Esta acción no se puede deshacer.</p><label><span>Escribe ELIMINAR para confirmar</span><input autoFocus value={deleteConfirmation} onChange={event => setDeleteConfirmation(event.target.value)} /></label><div><button type="button" onClick={() => { setDeleteOpen(false); setDeleteConfirmation(''); }}>Cancelar</button><button type="button" className="is-danger" disabled={deleteConfirmation !== 'ELIMINAR' || busy === 'delete'} onClick={deleteAccount}>{busy === 'delete' ? 'Eliminando…' : 'Eliminar definitivamente'}</button></div>{error && <p className="account-delete-error">{error}</p>}</section></div>, document.body)}
        </>;
    }

    return { AccountGate };
})();
