import { useEffect, useState } from 'react';
import BrandMark from './BrandMark.jsx';
import { IcX } from './icons.jsx';

// Banner "Instalar app" — aparece cuando el navegador lo permite (Android/desktop).
// En iOS no existe el evento; se muestra una ayuda para "Agregar a inicio".
export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) return;
    if (sessionStorage.getItem('mp-install-dismissed')) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // iOS Safari: no dispara beforeinstallprompt.
    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isSafari = /^((?!chrome|crios|fxios).)*safari/i.test(window.navigator.userAgent);
    if (isIOS && isSafari) {
      const t = setTimeout(() => { setIosHelp(true); setShow(true); }, 2500);
      return () => { clearTimeout(t); window.removeEventListener('beforeinstallprompt', onPrompt); };
    }

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('mp-install-dismissed', '1');
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="install-banner">
      <div className="install-ico"><BrandMark variant="mono" width={40} /></div>
      <div className="install-txt">
        <strong>Instalá MP Studio</strong>
        <span>
          {iosHelp
            ? 'Tocá Compartir y luego "Agregar a inicio".'
            : 'Accedé como una app desde tu pantalla de inicio.'}
        </span>
      </div>
      {!iosHelp && <button className="btn btn-sage btn-sm" onClick={install}>Instalar</button>}
      <button className="icon-btn" onClick={dismiss} aria-label="Cerrar"><IcX width={16} /></button>
    </div>
  );
}
