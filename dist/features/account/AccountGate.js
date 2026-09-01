(() => {
  window.DndAccountComponents = (() => {
    const {
      useEffect,
      useMemo,
      useState
    } = React;
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
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json'
      }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    };
    function AccountGate({
      children
    }) {
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
      const identityLabel = useMemo(() => user?.isAnonymous ? 'Invitado' : alias.trim() || user?.displayName || 'Cuenta sincronizada', [user?.isAnonymous, user?.displayName, alias]);
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
        try {
          manager = JSON.parse(window.localStorage.getItem(scopedKey) || window.localStorage.getItem('dnd_character_manager_v1') || 'null');
        } catch (readError) {}
        try {
          bestiary = JSON.parse(window.localStorage.getItem('dnd_master_bestiary_v1') || 'null');
        } catch (readError) {}
        try {
          settings = JSON.parse(window.localStorage.getItem('dnd_app_settings_v1') || 'null');
        } catch (readError) {}
        try {
          const db = window.firebaseServices?.firestore;
          const api = window.firebaseFirestore;
          if (db && api && user?.uid) {
            const snapshot = await api.getDocs(api.collection(db, 'users', user.uid, 'campaigns'));
            campaigns = snapshot.docs.map(item => ({
              id: item.id,
              ...item.data(),
              updatedAt: item.data().updatedAt?.toDate?.()?.toISOString?.() || null
            }));
          }
        } catch (readError) {}
        downloadJson({
          format: 'dnd-account-export',
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          account: {
            uid: user?.uid || '',
            type: user?.isAnonymous ? 'guest' : 'google'
          },
          characterManager: manager,
          bestiary,
          settings,
          campaigns
        }, `datos-ficha-dnd-${new Date().toISOString().slice(0, 10)}.json`);
      };
      const saveAlias = () => run('alias', () => window.firebaseAccount.updateMinimalProfile({
        displayName: alias
      }));
      const openExistingAccount = () => {
        setError('');
        setExistingAccountOpen(true);
      };
      const deleteAccount = () => run('delete', async () => {
        await window.firebaseAccount.deleteMyAccount();
        window.location.reload();
      });
      if (!state.resolved) {
        return /*#__PURE__*/React.createElement("main", {
          className: "account-entry account-entry--loading"
        }, /*#__PURE__*/React.createElement("span", {
          className: "account-entry__sigil",
          "aria-hidden": "true"
        }, "◇"), /*#__PURE__*/React.createElement("h1", null, "Preparando tu archivo"), /*#__PURE__*/React.createElement("p", null, "Comprobando la identidad guardada en este dispositivo…"));
      }
      if (!user) {
        return /*#__PURE__*/React.createElement("main", {
          className: "account-entry"
        }, /*#__PURE__*/React.createElement("section", {
          className: "account-entry__card",
          "aria-labelledby": "account-entry-title"
        }, /*#__PURE__*/React.createElement("span", {
          className: "account-entry__sigil",
          "aria-hidden": "true"
        }, "✦"), /*#__PURE__*/React.createElement("small", null, "Archivo de aventureros"), /*#__PURE__*/React.createElement("h1", {
          id: "account-entry-title"
        }, "Tu ficha, donde la necesites"), /*#__PURE__*/React.createElement("p", null, "Accede con Google para sincronizar tus personajes o continúa como invitado en este dispositivo."), /*#__PURE__*/React.createElement("div", {
          className: "account-entry__actions"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "is-google",
          disabled: !!busy || !state.ready,
          onClick: () => run('google', () => window.firebaseAccount.signInWithGoogle())
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "G"), /*#__PURE__*/React.createElement("b", null, busy === 'google' ? 'Abriendo Google…' : 'Continuar con Google')), /*#__PURE__*/React.createElement("button", {
          type: "button",
          disabled: !!busy || !state.ready,
          onClick: () => run('guest', () => window.firebaseAccount.beginGuestSession())
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "◇"), /*#__PURE__*/React.createElement("b", null, busy === 'guest' ? 'Creando acceso…' : 'Continuar como invitado'))), /*#__PURE__*/React.createElement("p", {
          className: "account-entry__privacy"
        }, /*#__PURE__*/React.createElement("span", {
          "aria-hidden": "true"
        }, "◆"), "No almacenamos contraseñas ni copiamos tu email a Firestore."), (error || state.error) && /*#__PURE__*/React.createElement("div", {
          className: "account-entry__error",
          role: "alert"
        }, error || getErrorMessage(state.error))));
      }
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(React.Fragment, {
        key: user.uid
      }, children), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: `account-status-button ${user.isAnonymous ? 'is-guest' : 'is-synced'}`,
        onClick: () => setPanelOpen(true),
        "aria-label": "Abrir Cuenta y privacidad"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, user.isAnonymous ? '◇' : '✓'), /*#__PURE__*/React.createElement("b", null, user.isAnonymous ? 'Invitado' : 'Sincronizado')), panelOpen && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
        className: "account-dialog-backdrop",
        onMouseDown: event => {
          if (event.target === event.currentTarget) setPanelOpen(false);
        }
      }, /*#__PURE__*/React.createElement("section", {
        className: "account-dialog",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "account-dialog-title"
      }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "✦"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Cuenta · Datos y privacidad"), /*#__PURE__*/React.createElement("h2", {
        id: "account-dialog-title"
      }, identityLabel), /*#__PURE__*/React.createElement("p", null, user.isAnonymous ? 'Acceso temporal vinculado a este dispositivo.' : 'Cuenta protegida y disponible en tus dispositivos.')), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setPanelOpen(false),
        "aria-label": "Cerrar"
      }, "×")), /*#__PURE__*/React.createElement("div", {
        className: "account-dialog__body"
      }, /*#__PURE__*/React.createElement("section", {
        className: "account-sync-state"
      }, /*#__PURE__*/React.createElement("span", {
        className: user.isAnonymous ? 'is-warning' : 'is-ready',
        "aria-hidden": "true"
      }, user.isAnonymous ? '!' : '✓'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Estado"), /*#__PURE__*/React.createElement("strong", null, user.isAnonymous ? 'Invitado sin recuperación' : 'Sincronización activada'), /*#__PURE__*/React.createElement("p", null, state.offlinePersistence ? 'Este dispositivo mantiene una copia offline aislada por el navegador.' : 'La caché de Firestore solo está disponible durante esta sesión.'))), user.isAnonymous ? /*#__PURE__*/React.createElement("div", {
        className: "account-auth-options"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "account-protect-action",
        disabled: !!busy,
        onClick: () => run('link', () => window.firebaseAccount.linkAnonymousWithGoogle())
      }, /*#__PURE__*/React.createElement("span", null, "G"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Proteger esta cuenta"), /*#__PURE__*/React.createElement("small", null, "Vincula este invitado con una cuenta de Google nueva."))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "account-existing-action",
        disabled: !!busy,
        onClick: openExistingAccount
      }, /*#__PURE__*/React.createElement("span", null, "↪"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Ya tengo una cuenta"), /*#__PURE__*/React.createElement("small", null, "Entra para recuperar los personajes que ya sincronizaste.")))) : /*#__PURE__*/React.createElement("section", {
        className: "account-alias"
      }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Alias visible"), /*#__PURE__*/React.createElement("small", null, "Opcional. El email no se guarda en Firestore."), /*#__PURE__*/React.createElement("input", {
        value: alias,
        maxLength: "80",
        onChange: event => setAlias(event.target.value),
        placeholder: "Nombre de jugador"
      })), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: busy === 'alias',
        onClick: saveAlias
      }, busy === 'alias' ? 'Guardando…' : 'Guardar alias')), /*#__PURE__*/React.createElement("section", {
        className: "account-privacy-facts"
      }, /*#__PURE__*/React.createElement("h3", null, "Privacidad"), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", null, "◆"), "Firebase Authentication conserva la identidad; la ficha usa únicamente tu UID para autorizar datos."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", null, "◆"), "Otros jugadores nunca reciben tu email ni tus notas privadas."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", null, "◆"), "App Check: ", state.appCheck === 'enabled' ? 'activo en este cliente' : state.appCheck === 'failed' ? 'configurado, pero no pudo iniciarse' : 'pendiente de configurar en Firebase Console', ".")), /*#__PURE__*/React.createElement("div", {
        className: "account-data-actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: exportAccountData
      }, /*#__PURE__*/React.createElement("span", null, "⇩"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Exportar mis datos"), /*#__PURE__*/React.createElement("small", null, "Descarga una copia JSON de los personajes disponibles."))), !user.isAnonymous && /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: !!busy,
        onClick: () => run('signout', () => window.firebaseAccount.signOutSecurely())
      }, /*#__PURE__*/React.createElement("span", null, "↪"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Cerrar sesión"), /*#__PURE__*/React.createElement("small", null, "Limpia los datos sensibles de este dispositivo."))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-danger",
        onClick: () => setDeleteOpen(true)
      }, /*#__PURE__*/React.createElement("span", null, "×"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Eliminar mi cuenta y datos"), /*#__PURE__*/React.createElement("small", null, "Incluye tus personajes y campañas propias.")))), error && /*#__PURE__*/React.createElement("div", {
        className: "account-dialog__error",
        role: "alert"
      }, error)))), document.body), user.isAnonymous && existingAccountOpen && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
        className: "account-dialog-backdrop",
        onMouseDown: event => {
          if (event.target === event.currentTarget && !busy) setExistingAccountOpen(false);
        }
      }, /*#__PURE__*/React.createElement("section", {
        className: "account-switch-dialog",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "account-switch-title"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "↪"), /*#__PURE__*/React.createElement("small", null, "Cuenta existente"), /*#__PURE__*/React.createElement("h2", {
        id: "account-switch-title"
      }, "Entrar con Google"), /*#__PURE__*/React.createElement("p", null, "Al continuar dejarás esta sesión de invitado y verás los personajes de tu cuenta. Los datos del invitado no se fusionarán automáticamente."), /*#__PURE__*/React.createElement("p", {
        className: "account-switch-dialog__notice"
      }, "Si has creado algo importante en este dispositivo como invitado, expórtalo antes de cambiar de cuenta."), /*#__PURE__*/React.createElement("div", {
        className: "account-switch-dialog__actions"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: !!busy,
        onClick: () => setExistingAccountOpen(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        disabled: !!busy,
        onClick: exportAccountData
      }, "Exportar invitado"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-primary",
        disabled: !!busy,
        onClick: () => run('existing-google', () => window.firebaseAccount.signInWithExistingGoogle())
      }, busy === 'existing-google' ? 'Abriendo Google…' : 'Entrar con Google')), error && /*#__PURE__*/React.createElement("div", {
        className: "account-dialog__error",
        role: "alert"
      }, error))), document.body), deleteOpen && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
        className: "account-delete-backdrop"
      }, /*#__PURE__*/React.createElement("section", {
        className: "account-delete-dialog",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-labelledby": "account-delete-title"
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "!"), /*#__PURE__*/React.createElement("h2", {
        id: "account-delete-title"
      }, "Eliminar cuenta y datos"), /*#__PURE__*/React.createElement("p", null, "Se eliminarán tus personajes sincronizados y tu acceso. Saldrás de las campañas y las campañas propias quedarán cerradas; sus registros internos permanecerán bloqueados e inaccesibles. Esta acción no se puede deshacer."), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, "Escribe ELIMINAR para confirmar"), /*#__PURE__*/React.createElement("input", {
        autoFocus: true,
        value: deleteConfirmation,
        onChange: event => setDeleteConfirmation(event.target.value)
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => {
          setDeleteOpen(false);
          setDeleteConfirmation('');
        }
      }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "is-danger",
        disabled: deleteConfirmation !== 'ELIMINAR' || busy === 'delete',
        onClick: deleteAccount
      }, busy === 'delete' ? 'Eliminando…' : 'Eliminar definitivamente')), error && /*#__PURE__*/React.createElement("p", {
        className: "account-delete-error"
      }, error))), document.body));
    }
    return {
      AccountGate
    };
  })();
})();