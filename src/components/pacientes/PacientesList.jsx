import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore.js';
import { iniciales, nombreCompleto, fechaCorta } from '../../lib/format.js';
import { IcPlus, IcSearch, IcUsers } from '../icons.jsx';

export default function PacientesList({ onNew }) {
  const pacientes = useStore((s) => s.pacientes);
  const loading = useStore((s) => s.loadingPacientes);
  const openPaciente = useStore((s) => s.openPaciente);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return pacientes;
    return pacientes.filter((p) =>
      [p.nombre, p.apellido, p.dni, p.mail, p.telefono]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [pacientes, q]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Pacientes</h1>
          <div className="sub">{pacientes.length} {pacientes.length === 1 ? 'paciente registrado' : 'pacientes registrados'}</div>
        </div>
        <button className="btn btn-primary" onClick={onNew}>
          <IcPlus width={18} /> Nuevo paciente
        </button>
      </div>

      <div className="toolbar">
        <div className="search">
          <IcSearch className="ico" />
          <input
            placeholder="Buscar por nombre, apellido, DNI, mail…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="empty"><div className="muted">Cargando…</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="em-ico"><IcUsers width={42} height={42} /></div>
          <h3>{q ? 'Sin resultados' : 'Todavía no hay pacientes'}</h3>
          <p>{q ? 'Probá con otro término de búsqueda.' : 'Cargá tu primer paciente para empezar.'}</p>
          {!q && (
            <button className="btn btn-sage mt" onClick={onNew}><IcPlus width={18} /> Nuevo paciente</button>
          )}
        </div>
      ) : (
        <div className="patient-grid">
          {filtered.map((p) => (
            <div key={p.id} className="patient-card" onClick={() => openPaciente(p.id)}>
              <div className="avatar">{iniciales(p.nombre, p.apellido)}</div>
              <div className="meta">
                <div className="nm">{nombreCompleto(p)}</div>
                <div className="dt">DNI {p.dni || '—'} · Ingreso {fechaCorta(p.fecha_ingreso)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
