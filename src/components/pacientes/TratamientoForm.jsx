import { useState } from 'react';
import { useStore } from '../../store/useStore.js';
import * as db from '../../lib/db.js';
import { hoyISO } from '../../lib/format.js';
import { exportTratamientoPDF } from '../../lib/exportPDF.js';
import { prepararEnvioWhatsApp } from '../../lib/whatsapp.js';
import Attachments from '../Attachments.jsx';
import { IcX, IcPdf, IcCheck, IcWhatsApp } from '../icons.jsx';

export default function TratamientoForm({ paciente, onClose, onCreated }) {
  const toast = useStore((s) => s.toast);
  const fichaLesion = paciente.ficha?.lesion || '';
  const [f, setF] = useState({
    fecha: hoyISO(),
    patologia: fichaLesion,
    tratamiento: '',
    notas: '',
    imagenes: [],
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const datosOk = () => {
    if (!f.tratamiento.trim() && !f.patologia.trim()) {
      toast('Indicá al menos la patología o el tratamiento realizado', 'error');
      return false;
    }
    return true;
  };

  const crear = async () => db.createTratamiento({
    paciente_id: paciente.id,
    fecha: f.fecha || hoyISO(),
    patologia: f.patologia.trim(),
    tratamiento: f.tratamiento.trim(),
    notas: f.notas.trim(),
    imagenes: f.imagenes,
  });

  const guardar = async (conPDF) => {
    if (!datosOk()) return;
    setSaving(true);
    try {
      const creado = await crear();
      toast('Tratamiento guardado', 'success');
      if (conPDF) await exportTratamientoPDF({ paciente, tratamiento: creado });
      onCreated?.();
    } catch (e) {
      toast('Error al guardar: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const guardarYEnviar = async () => {
    if (!datosOk()) return;
    if (!paciente.telefono) {
      toast('El paciente no tiene teléfono cargado. Editá sus datos primero.', 'error');
      return;
    }
    const win = window.open('', '_blank'); // abrir dentro del gesto del click
    setSaving(true);
    try {
      const creado = await crear();
      const { waUrl, downloaded } = await prepararEnvioWhatsApp({ paciente, tratamiento: creado });
      if (win) win.location.href = waUrl; else window.location.href = waUrl;
      toast(
        downloaded
          ? 'Guardado. PDF descargado y WhatsApp abierto (conectá Supabase para link directo).'
          : 'Guardado y WhatsApp abierto con el informe ✓',
        downloaded ? 'info' : 'success'
      );
      onCreated?.();
    } catch (e) {
      if (win) win.close();
      toast('Error: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal wide">
        <div className="modal-head">
          <h2>Nuevo tratamiento</h2>
          <button className="icon-btn" onClick={onClose}><IcX /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field">
              <label>Fecha del tratamiento</label>
              <input type="date" value={f.fecha} onChange={set('fecha')} />
            </div>
            <div className="field">
              <label>Patología / lesión tratada</label>
              <input value={f.patologia} onChange={set('patologia')} placeholder="Ej: Tendinopatía rotuliana" />
            </div>
            <div className="field col-2">
              <label>Tratamiento realizado</label>
              <textarea value={f.tratamiento} onChange={set('tratamiento')} placeholder="Ej: Electrólisis percutánea ecoguiada (EPI) en tendón rotuliano + punción seca…" />
            </div>
            <div className="field col-2">
              <label>Notas / observaciones (opcional)</label>
              <textarea value={f.notas} onChange={set('notas')} placeholder="Indicaciones post-tratamiento, próximos pasos…" style={{ minHeight: 60 }} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-2)' }}>Imágenes de ecografía / tratamiento</label>
            <p className="small muted" style={{ margin: '4px 0 10px' }}>Estas imágenes van a salir en el PDF que se le envía al paciente.</p>
            <Attachments
              value={f.imagenes}
              onChange={(imagenes) => setF((s) => ({ ...s, imagenes }))}
              accept="image/*"
              hint="Fotos o capturas de la ecografía (JPG/PNG)"
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-outline" onClick={() => guardar(false)} disabled={saving}>
              <IcCheck width={16} /> Guardar
            </button>
            <button className="btn btn-outline" onClick={() => guardar(true)} disabled={saving}>
              <IcPdf width={16} /> {saving ? 'Procesando…' : 'Guardar + PDF'}
            </button>
            <button className="btn btn-wa" onClick={guardarYEnviar} disabled={saving}>
              <IcWhatsApp size={16} /> {saving ? 'Procesando…' : 'Guardar y enviar por WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
