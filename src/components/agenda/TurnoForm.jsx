import { useState } from 'react';
import { useStore } from '../../store/useStore.js';
import * as db from '../../lib/db.js';
import { nombreCompleto } from '../../lib/format.js';
import { IcX } from '../icons.jsx';

const HORAS = Array.from({ length: 14 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);

export default function TurnoForm({ initial, onClose, onSaved }) {
  const toast = useStore((s) => s.toast);
  const pacientes = useStore((s) => s.pacientes);
  const [f, setF] = useState({
    fecha: initial.fecha,
    hora: initial.hora,
    paciente_id: '',
    paciente_nombre: '',
    notas: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const onPick = (e) => {
    const id = e.target.value;
    const p = pacientes.find((x) => x.id === id);
    setF((s) => ({ ...s, paciente_id: id, paciente_nombre: p ? nombreCompleto(p) : s.paciente_nombre }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!f.paciente_nombre.trim()) { toast('Indicá el nombre del paciente', 'error'); return; }
    setSaving(true);
    try {
      await db.createTurno({
        fecha: f.fecha,
        hora: f.hora,
        paciente_id: f.paciente_id || null,
        paciente_nombre: f.paciente_nombre.trim(),
        notas: f.notas.trim(),
      });
      toast('Turno agendado', 'success');
      onSaved?.();
    } catch (err) {
      toast('Error al agendar: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-head">
          <h2>Nuevo turno</h2>
          <button className="icon-btn" onClick={onClose}><IcX /></button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Fecha</label>
              <input type="date" value={f.fecha} onChange={set('fecha')} />
            </div>
            <div className="field">
              <label>Hora</label>
              <select value={f.hora} onChange={set('hora')}>
                {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="field col-2">
              <label>Paciente registrado (opcional)</label>
              <select value={f.paciente_id} onChange={onPick}>
                <option value="">— Elegir de la lista —</option>
                {pacientes.map((p) => <option key={p.id} value={p.id}>{nombreCompleto(p)}</option>)}
              </select>
            </div>
            <div className="field col-2">
              <label>Nombre del paciente <span className="req">*</span></label>
              <input value={f.paciente_nombre} onChange={set('paciente_nombre')} placeholder="Nombre y apellido" />
            </div>
            <div className="field col-2">
              <label>Notas (opcional)</label>
              <textarea value={f.notas} onChange={set('notas')} placeholder="Motivo de consulta, primera vez, etc." style={{ minHeight: 60 }} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Agendando…' : 'Agendar turno'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
