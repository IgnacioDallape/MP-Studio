import { useEffect, useState } from 'react';
import { useStore } from './store/useStore.js';
import PinGate from './components/PinGate.jsx';
import Sidebar from './components/Sidebar.jsx';
import Toasts from './components/Toast.jsx';
import Pacientes from './components/pacientes/Pacientes.jsx';
import Agenda from './components/agenda/Agenda.jsx';
import Historial from './components/historial/Historial.jsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx';
import { IcMenu } from './components/icons.jsx';
import BrandMark from './components/BrandMark.jsx';

export default function App() {
  const unlocked = useStore((s) => s.unlocked);
  const section = useStore((s) => s.section);
  const refreshPacientes = useStore((s) => s.refreshPacientes);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (unlocked) refreshPacientes();
  }, [unlocked, refreshPacientes]);

  if (!unlocked) return (<><PinGate /><Toasts /><PWAInstallPrompt /></>);

  return (
    <div className={`app ${navOpen ? 'nav-open' : ''}`}>
      <div className="scrim" onClick={() => setNavOpen(false)} />
      <Sidebar onNavigate={() => setNavOpen(false)} />

      <main className="main">
        <div className="topbar">
          <button className="menu-btn" onClick={() => setNavOpen(true)} aria-label="Menú">
            <IcMenu />
          </button>
          <BrandMark variant="row" width={200} />
        </div>

        {section === 'pacientes' && <Pacientes />}
        {section === 'agenda' && <Agenda />}
        {section === 'historial' && <Historial />}
      </main>

      <Toasts />
      <PWAInstallPrompt />
    </div>
  );
}
