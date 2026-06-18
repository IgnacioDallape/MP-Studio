import { useStore } from '../store/useStore.js';
import { isCloud } from '../lib/db.js';
import BrandMark from './BrandMark.jsx';
import { IcUsers, IcCalendar, IcHistory } from './icons.jsx';

const ITEMS = [
  { id: 'pacientes', label: 'Pacientes', Icon: IcUsers },
  { id: 'agenda', label: 'Agenda', Icon: IcCalendar },
  { id: 'historial', label: 'Historial', Icon: IcHistory },
];

export default function Sidebar({ onNavigate }) {
  const section = useStore((s) => s.section);
  const setSection = useStore((s) => s.setSection);

  const go = (id) => {
    setSection(id);
    onNavigate?.();
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <BrandMark variant="full" width={170} color="#F8F3E1" accent="#AEB784" />
      </div>

      <nav className="nav">
        {ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-item ${section === id ? 'active' : ''}`}
            onClick={() => go(id)}
          >
            <Icon className="ico" />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <span className={`cloud-pill ${isCloud ? 'on' : 'off'}`}>
          <span className="dot" />
          {isCloud ? 'Nube conectada' : 'Modo local'}
        </span>
        <span>MP Studio · {new Date().getFullYear()}</span>
      </div>
    </aside>
  );
}
