import { useState } from 'react';
import { useStore } from '../../store/useStore.js';
import * as db from '../../lib/db.js';
import { hoyISO } from '../../lib/format.js';
import { IcX } from '../icons.jsx';

const EMPTY = {
  nombre: '', apellido: '', edad: '', fecha_ingreso: hoyISO(),
  telefono: '', mail: '', dni: '',
};

export default function PacienteForm({ onClose, paciente }) {
  const editing = Boolean(paciente);
  const [f, setF] = useState(editing ? { ...EMPTY, ...paciente } : EMPTY);
  const [saving, setSaving] = useState(false);
  const toast = useStore((s) => s.toast);
  const refresh = useStore((s) => s.refreshPacientes);
  const openPaciente = useStore((s) => s.openPaciente);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.nombre.trim() || !f.apellido.trim()) {
      toast('Nombre y apellido son obligatorios', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: f.nombre.trim(),
        apellido: f.apellido.trim(),
        edad: f.edad ? Number(f.edad) : null,
        fecha_ingreso: f.fecha_ingreso || hoyISO(),
        telefono: f.telefono.trim(),
        mail: f.mail.trim(),
        dni: f.dni.trim(),
      };
      if (editing) {
        await db.updatePaciente(paciente.id, payload);
        toast('Paciente actualizado', 'success');
      } else {
        const created = await db.createPaciente(payload);
        toast('Paciente creado', 'success');
        await refresh();
        onClose();
        openPaciente(created.id);
        return;
      }
      await refresh();
      onClose();
    } catch (err) {
      toast('Error al guardar: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>{editing ? 'Editar paciente' : 'Nuevo paciente'}</h2>
          <button className="icon-btn" onClick={onClose}><IcX /></button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Nombre <span className="req">*</span></label>
              <input value={f.nombre} onChange={set('nombre')} autoFocus placeholder="Juan" />
            </div>
            <div className="field">
              <label>Apellido <span className="req">*</span></label>
              <input value={f.apellido} onChange={set('apellido')} placeholder="Pérez" />
            </div>
            <div className="field">
              <label>Edad</label>
              <input type="number" min="0" max="120" value={f.edad} onChange={set('edad')} placeholder="35" />
            </div>
            <div className="field">
              <label>Fecha de ingreso</label>
              <input type="date" value={f.fecha_ingreso} onChange={set('fecha_ingreso')} />
            </div>
            <div className="field">
              <label>DNI</label>
              <input value={f.dni} onChange={set('dni')} placeholder="30.123.456" />
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input value={f.telefono} onChange={set('telefono')} placeholder="11 2345-6789" />
            </div>
            <div className="field col-2">
              <label>Email</label>
              <input type="email" value={f.mail} onChange={set('mail')} placeholder="paciente@mail.com" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
