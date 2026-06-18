import { useEffect, useState, useCallback } from 'react';
import { useStore } from '../../store/useStore.js';
import * as db from '../../lib/db.js';
import { fechaLarga } from '../../lib/format.js';
import { exportTratamientoPDF } from '../../lib/exportPDF.js';
import { prepararEnvioWhatsApp } from '../../lib/whatsapp.js';
import { IcPlus, IcPdf, IcTrash, IcActivity, IcWhatsApp } from '../icons.jsx';
import TratamientoForm from './TratamientoForm.jsx';

export default function Sesiones({ paciente }) {
  const toast = useStore((s) => s.toast);
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [sending, setSending] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSesiones(await db.listTratamientos(paciente.id));
    } catch (e) {
      toast('Error al cargar tratamientos: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [paciente.id, toast]);

  useEffect(() => { load(); }, [load]);

  const onDelete = async (s) => {
    if (!confirm('¿Eliminar este tratamiento?')) return;
    try {
      await db.deleteTratamiento(s.id);
      toast('Tratamiento eliminado', 'success');
      load();
    } catch (e) {
      toast('Error: ' + e.message, 'error');
    }
  };

  const onPDF = async (s) => {
    setGenerating(s.id);
    try {
      await exportTratamientoPDF({ paciente, tratamiento: s });
      toast('PDF generado', 'success');
    } catch (e) {
      toast('Error al generar PDF: ' + e.message, 'error');
    } finally {
      setGenerating(null);
    }
  };

  const onWhatsApp = async (s) => {
    if (!paciente.telefono) {
      toast('El paciente no tiene teléfono cargado. Editá sus datos primero.', 'error');
      return;
    }
    const win = window.open('', '_blank'); // abrir dentro del gesto del click
    setSending(s.id);
    try {
      const { waUrl, downloaded } = await prepararEnvioWhatsApp({ paciente, tratamiento: s });
      if (win) win.location.href = waUrl; else window.location.href = waUrl;
      toast(
        downloaded
          ? 'PDF descargado y WhatsApp abierto. Conectá Supabase para enviarlo como link directo.'
          : 'WhatsApp abierto con el informe ✓',
        downloaded ? 'info' : 'success'
      );
    } catch (e) {
      if (win) win.close();
      toast(e.message, 'error');
    } finally {
      setSending(null);
    }
  };

  return (
    <div>
      <div className="spread mb">
        <div className="section-title"><span className="bar" /> Tratamientos realizados</div>
        <button className="btn btn-primary btn-sm" onClick={() => setFormOpen(true)}>
          <IcPlus width={16} /> Nuevo tratamiento
        </button>
      </div>

      {loading ? (
        <div className="empty"><div className="muted">Cargando…</div></div>
      ) : sesiones.length === 0 ? (
        <div className="empty">
          <div className="em-ico"><IcActivity width={40} height={40} /></div>
          <h3>Sin tratamientos todavía</h3>
          <p>Registrá la primera sesión y generá el informe en PDF para el paciente.</p>
          <button className="btn btn-sage mt" onClick={() => setFormOpen(true)}><IcPlus width={16} /> Nuevo tratamiento</button>
        </div>
      ) : (
        sesiones.map((s) => (
          <div key={s.id} className="session">
            <div className="session-head">
              <div>
                <strong style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--olive)' }}>
                  {s.patologia || 'Sesión'}
                </strong>
                <div className="small muted">{fechaLarga(s.fecha)}</div>
              </div>
              <div className="row">
                <button className="btn btn-wa btn-sm" onClick={() => onWhatsApp(s)} disabled={sending === s.id}>
                  <IcWhatsApp size={15} /> {sending === s.id ? 'Enviando…' : 'WhatsApp'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => onPDF(s)} disabled={generating === s.id}>
                  <IcPdf width={16} /> {generating === s.id ? 'Generando…' : 'PDF'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(s)}><IcTrash width={15} /></button>
              </div>
            </div>
            {s.tratamiento && <div style={{ marginTop: 8 }}><span className="muted small">Tratamiento: </span>{s.tratamiento}</div>}
            {s.notas && <div style={{ marginTop: 4 }} className="small muted">{s.notas}</div>}
            {(s.imagenes || []).length > 0 && (
              <div className="imgs">
                {s.imagenes.map((img, i) => (
                  <img key={i} className="thumb" src={img.url} alt="" onClick={() => window.open(img.url, '_blank')} />
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {formOpen && (
        <TratamientoForm
          paciente={paciente}
          onClose={() => setFormOpen(false)}
          onCreated={() => { setFormOpen(false); load(); }}
        />
      )}
    </div>
  );
}
