import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../store/useStore.js';
import * as db from '../../lib/db.js';
import { fechaLarga, nombreCompleto, iniciales } from '../../lib/format.js';
import { exportTratamientoPDF } from '../../lib/exportPDF.js';
import { IcPdf, IcHistory, IcSearch } from '../icons.jsx';

export default function Historial() {
  const pacientes = useStore((s) => s.pacientes);
  const openPaciente = useStore((s) => s.openPaciente);
  const toast = useStore((s) => s.toast);
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [gen, setGen] = useState(null);

  const pacMap = useMemo(() => {
    const m = {};
    for (const p of pacientes) m[p.id] = p;
    return m;
  }, [pacientes]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setSesiones(await db.listTratamientos());
      } catch (e) {
        toast('Error al cargar el historial: ' + e.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const esteMes = useMemo(() => {
    const ym = new Date().toISOString().slice(0, 7);
    return sesiones.filter((s) => (s.fecha || '').slice(0, 7) === ym).length;
  }, [sesiones]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return sesiones;
    return sesiones.filter((s) => {
      const p = pacMap[s.paciente_id];
      const nm = p ? nombreCompleto(p) : '';
      return [nm, s.patologia, s.tratamiento].filter(Boolean).some((v) => v.toLowerCase().includes(term));
    });
  }, [sesiones, q, pacMap]);

  const onPDF = async (s) => {
    const p = pacMap[s.paciente_id];
    if (!p) { toast('El paciente de esta sesión ya no existe', 'error'); return; }
    setGen(s.id);
    try {
      await exportTratamientoPDF({ paciente: p, tratamiento: s });
      toast('PDF generado', 'success');
    } catch (e) {
      toast('Error al generar PDF: ' + e.message, 'error');
    } finally {
      setGen(null);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Historial</h1>
          <div className="sub">Todos los tratamientos realizados</div>
        </div>
      </div>

      <div className="stat-row mb">
        <div className="stat"><div className="n">{pacientes.length}</div><div className="l">Pacientes</div></div>
        <div className="stat"><div className="n">{sesiones.length}</div><div className="l">Tratamientos totales</div></div>
        <div className="stat"><div className="n">{esteMes}</div><div className="l">Este mes</div></div>
      </div>

      <div className="toolbar">
        <div className="search">
          <IcSearch className="ico" />
          <input placeholder="Buscar por paciente, patología o tratamiento…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="empty"><div className="muted">Cargando…</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="em-ico"><IcHistory width={40} height={40} /></div>
          <h3>{q ? 'Sin resultados' : 'Todavía no hay tratamientos'}</h3>
          <p>{q ? 'Probá con otro término.' : 'Los tratamientos que registres van a aparecer acá.'}</p>
        </div>
      ) : (
        filtered.map((s) => {
          const p = pacMap[s.paciente_id];
          return (
            <div key={s.id} className="session">
              <div className="session-head">
                <div className="row" style={{ gap: 12 }}>
                  <div className="avatar" style={{ width: 42, height: 42, fontSize: '1rem' }}>
                    {p ? iniciales(p.nombre, p.apellido) : '?'}
                  </div>
                  <div>
                    <strong
                      style={{ color: 'var(--olive)', cursor: p ? 'pointer' : 'default' }}
                      onClick={() => p && openPaciente(p.id)}
                    >
                      {p ? nombreCompleto(p) : 'Paciente eliminado'}
                    </strong>
                    <div className="small muted">{fechaLarga(s.fecha)} · {s.patologia || 'Sin patología'}</div>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => onPDF(s)} disabled={!p || gen === s.id}>
                  <IcPdf width={16} /> {gen === s.id ? 'Generando…' : 'PDF'}
                </button>
              </div>
              {s.tratamiento && <div style={{ marginTop: 8 }} className="small">{s.tratamiento}</div>}
              {(s.imagenes || []).length > 0 && (
                <div className="imgs">
                  {s.imagenes.slice(0, 5).map((img, i) => (
                    <img key={i} className="thumb" src={img.url} alt="" onClick={() => window.open(img.url, '_blank')} />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
