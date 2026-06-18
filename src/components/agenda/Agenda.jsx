import { useEffect, useMemo, useState, useCallback } from 'react';
import { useStore } from '../../store/useStore.js';
import * as db from '../../lib/db.js';
import { fechaLarga } from '../../lib/format.js';
import TurnoForm from './TurnoForm.jsx';
import { IcBack, IcPlus, IcTrash, IcCheck, IcClock } from '../icons.jsx';

const HORAS = Array.from({ length: 14 }, (_, i) => 8 + i); // 08:00 .. 21:00
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function startOfWeek(d) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 0 = lunes
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const hh = (h) => `${String(h).padStart(2, '0')}:00`;

export default function Agenda() {
  const toast = useStore((s) => s.toast);
  const [monday, setMonday] = useState(() => startOfWeek(new Date()));
  const [turnos, setTurnos] = useState([]);
  const [form, setForm] = useState(null); // { fecha, hora } | turno
  const [detail, setDetail] = useState(null);

  const dias = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(monday, i)), [monday]);
  const todayISO = toISO(new Date());

  const load = useCallback(async () => {
    try {
      setTurnos(await db.listTurnos());
    } catch (e) {
      toast('Error al cargar la agenda: ' + e.message, 'error');
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const mapa = useMemo(() => {
    const m = {};
    for (const t of turnos) m[`${t.fecha}|${t.hora}`] = t;
    return m;
  }, [turnos]);

  const rangoLabel = `${dias[0].getDate()} ${dias[0].toLocaleDateString('es-AR', { month: 'short' })} – ${dias[5].getDate()} ${dias[5].toLocaleDateString('es-AR', { month: 'short' })} ${dias[5].getFullYear()}`;

  const delTurno = async (t) => {
    try {
      await db.deleteTurno(t.id);
      toast('Turno eliminado', 'success');
      setDetail(null);
      load();
    } catch (e) { toast('Error: ' + e.message, 'error'); }
  };

  const toggleDone = async (t) => {
    try {
      await db.updateTurno(t.id, { estado: t.estado === 'realizado' ? 'pendiente' : 'realizado' });
      setDetail(null);
      load();
    } catch (e) { toast('Error: ' + e.message, 'error'); }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Agenda</h1>
          <div className="sub">Turnos de 8:00 a 22:00 · Lunes a Sábado</div>
        </div>
        <button className="btn btn-primary" onClick={() => setForm({ fecha: todayISO, hora: '09:00' })}>
          <IcPlus width={18} /> Nuevo turno
        </button>
      </div>

      <div className="toolbar">
        <div className="week-nav">
          <button className="btn btn-outline btn-sm" onClick={() => setMonday(addDays(monday, -7))}><IcBack width={16} /></button>
          <button className="btn btn-ghost btn-sm" onClick={() => setMonday(startOfWeek(new Date()))}>Hoy</button>
          <button className="btn btn-outline btn-sm" onClick={() => setMonday(addDays(monday, 7))} style={{ transform: 'scaleX(-1)' }}><IcBack width={16} /></button>
          <span className="lbl">{rangoLabel}</span>
        </div>
      </div>

      <div className="agenda-scroll">
        <div className="agenda-grid">
          <div className="ag-cell ag-head"><IcClock width={15} /></div>
          {dias.map((d, i) => (
            <div key={i} className="ag-cell ag-head" style={toISO(d) === todayISO ? { background: 'var(--olive-700)' } : null}>
              {DIAS[i]}<small>{d.getDate()}/{d.getMonth() + 1}</small>
            </div>
          ))}

          {HORAS.map((h) => (
            <Row key={h} hora={h} dias={dias} mapa={mapa}
              onSlot={(fecha) => setForm({ fecha, hora: hh(h) })}
              onAppt={(t) => setDetail(t)} />
          ))}
        </div>
      </div>

      {form && (
        <TurnoForm
          initial={form}
          onClose={() => setForm(null)}
          onSaved={() => { setForm(null); load(); }}
        />
      )}

      {detail && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-head">
              <h2>Turno</h2>
              <button className="icon-btn" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="stat-row mb">
                <div className="stat"><div className="n" style={{ fontSize: '1.3rem' }}>{detail.hora}</div><div className="l">{fechaLarga(detail.fecha)}</div></div>
              </div>
              <div className="info-row"><span className="lbl">Paciente</span><span className="val">{detail.paciente_nombre || '—'}</span></div>
              {detail.notas && <div className="info-row"><span className="lbl">Notas</span><span className="val">{detail.notas}</span></div>}
              <div className="info-row"><span className="lbl">Estado</span><span className="val">
                <span className={`badge ${detail.estado === 'realizado' ? 'green' : 'amber'}`}>{detail.estado === 'realizado' ? 'Realizado' : 'Pendiente'}</span>
              </span></div>
              <div className="form-actions">
                <button className="btn btn-danger" onClick={() => delTurno(detail)}><IcTrash width={16} /> Eliminar</button>
                <button className="btn btn-sage" onClick={() => toggleDone(detail)}>
                  <IcCheck width={16} /> {detail.estado === 'realizado' ? 'Marcar pendiente' : 'Marcar realizado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ hora, dias, mapa, onSlot, onAppt }) {
  const label = hh(hora);
  return (
    <>
      <div className="ag-cell ag-time">{label}</div>
      {dias.map((d, i) => {
        const fecha = toISO(d);
        const t = mapa[`${fecha}|${label}`];
        return (
          <div key={i} className="ag-cell ag-slot" onClick={() => (t ? onAppt(t) : onSlot(fecha))}>
            {t && (
              <div className={`ag-appt ${t.estado === 'realizado' ? 'done' : ''}`}>
                <div className="who">{t.paciente_nombre || 'Turno'}</div>
                {t.notas && <div style={{ opacity: 0.8 }}>{t.notas.slice(0, 22)}</div>}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
