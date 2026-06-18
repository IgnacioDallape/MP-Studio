import { useState } from 'react';
import { useStore } from '../../store/useStore.js';
import * as db from '../../lib/db.js';
import Attachments from '../Attachments.jsx';
import { IcCheck } from '../icons.jsx';

const EVA_COLORS = ['#4d6b3a', '#5f7a36', '#7d8a33', '#9a8c2a', '#b07d22', '#bf6a1f', '#c4561d', '#bd421f', '#b13224', '#a52828', '#8f1f1f'];

export default function FichaClinica({ paciente, onSaved }) {
  const toast = useStore((s) => s.toast);
  const [f, setF] = useState({
    lesion: '', antecedentes: '', eva: null, alergias: '', fobias: '',
    tratamientos_previos: '', archivos: [],
    ...(paciente.ficha || {}),
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const set = (k) => (e) => { setF((s) => ({ ...s, [k]: e.target.value })); setDirty(true); };

  const persist = async (ficha) => {
    setSaving(true);
    try {
      await db.updatePaciente(paciente.id, { ficha });
      onSaved?.();
      setDirty(false);
    } catch (e) {
      toast('Error al guardar la ficha: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const onArchivos = (archivos) => {
    const next = { ...f, archivos };
    setF(next);
    persist(next); // los archivos se guardan al toque
  };

  const save = async () => {
    await persist(f);
    toast('Ficha clínica guardada', 'success');
  };

  return (
    <div className="detail-cols">
      <div className="stack">
        <div className="card card-pad">
          <div className="section-title"><span className="bar" /> Lesión / Patología</div>
          <div className="stack mt">
            <div className="field">
              <label>Lesión o patología</label>
              <textarea value={f.lesion} onChange={set('lesion')} placeholder="Ej: Tendinopatía rotuliana derecha" />
            </div>
            <div className="field">
              <label>Antecedentes lesivos</label>
              <textarea value={f.antecedentes} onChange={set('antecedentes')} placeholder="Lesiones o cirugías previas relevantes…" />
            </div>
            <div className="field">
              <label>Escala de dolor — EVA (0 = sin dolor · 10 = máximo)</label>
              <div className="eva-pick" style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
                {Array.from({ length: 11 }, (_, n) => (
                  <button
                    key={n}
                    onClick={() => { setF((s) => ({ ...s, eva: n })); setDirty(true); }}
                    style={{
                      width: 38, height: 38, borderRadius: 8, cursor: 'pointer',
                      border: f.eva === n ? '2px solid var(--olive)' : '1px solid var(--border)',
                      background: f.eva === n ? EVA_COLORS[n] : 'var(--card)',
                      color: f.eva === n ? '#fff' : 'var(--text-2)',
                      fontWeight: 600, fontFamily: 'var(--sans)',
                    }}
                  >{n}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stack">
        <div className="card card-pad">
          <div className="section-title"><span className="bar" style={{ background: 'var(--amber)' }} /> Datos clínicos</div>
          <div className="stack mt">
            <div className="field">
              <label>Alergias</label>
              <textarea value={f.alergias} onChange={set('alergias')} placeholder="Ej: Lidocaína, AINEs… (o 'Sin alergias conocidas')" style={{ minHeight: 60 }} />
            </div>
            <div className="field">
              <label>Fobias / observaciones</label>
              <textarea value={f.fobias} onChange={set('fobias')} placeholder="Ej: Belonefobia (miedo a agujas)…" style={{ minHeight: 60 }} />
            </div>
            <div className="field">
              <label>Tratamientos previos</label>
              <textarea value={f.tratamientos_previos} onChange={set('tratamientos_previos')} placeholder="Kinesiología, infiltraciones, medicación…" style={{ minHeight: 60 }} />
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-title"><span className="bar" style={{ background: 'var(--sage)' }} /> Estudios / imágenes previas</div>
          <p className="small muted" style={{ marginTop: 2, marginBottom: 12 }}>Resonancias, ecografías o informes en PDF que traiga el paciente.</p>
          <Attachments value={f.archivos} onChange={onArchivos} hint="Imágenes (JPG/PNG) o PDF" />
        </div>
      </div>

      <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
        {dirty && <span className="small muted" style={{ alignSelf: 'center' }}>Tenés cambios sin guardar</span>}
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <IcCheck width={18} /> {saving ? 'Guardando…' : 'Guardar ficha'}
        </button>
      </div>
    </div>
  );
}
