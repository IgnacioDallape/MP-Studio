import { useRef, useState } from 'react';
import { useStore } from '../../store/useStore.js';
import * as db from '../../lib/db.js';
import Attachments from '../Attachments.jsx';
import { IcCheck, IcEdit, IcActivity } from '../icons.jsx';

const EVA_COLORS = ['#4d6b3a', '#5f7a36', '#7d8a33', '#9a8c2a', '#b07d22', '#bf6a1f', '#c4561d', '#bd421f', '#b13224', '#a52828', '#8f1f1f'];

const FICHA_VACIA = {
  lesion: '', antecedentes: '', eva: null, alergias: '', fobias: '',
  tratamientos_previos: '', archivos: [],
};

function evaLabel(n) {
  if (n === 0) return 'Sin dolor';
  if (n <= 3) return 'Dolor leve';
  if (n <= 6) return 'Dolor moderado';
  if (n <= 9) return 'Dolor intenso';
  return 'Dolor máximo';
}

function tieneDatos(f) {
  return Boolean(
    (f.lesion && f.lesion.trim()) ||
    (f.antecedentes && f.antecedentes.trim()) ||
    f.eva != null ||
    (f.alergias && f.alergias.trim()) ||
    (f.fobias && f.fobias.trim()) ||
    (f.tratamientos_previos && f.tratamientos_previos.trim()) ||
    (f.archivos && f.archivos.length)
  );
}

export default function FichaClinica({ paciente, onSaved }) {
  const toast = useStore((s) => s.toast);
  const inicial = { ...FICHA_VACIA, ...(paciente.ficha || {}) };
  const [f, setF] = useState(inicial);
  const guardado = useRef(inicial);
  const [editing, setEditing] = useState(!tieneDatos(inicial));
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await db.updatePaciente(paciente.id, { ficha: f });
      guardado.current = f;
      onSaved?.();
      setEditing(false);
      toast('Ficha clínica guardada', 'success');
    } catch (e) {
      toast('Error al guardar la ficha: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelar = () => {
    setF(guardado.current);
    setEditing(false);
  };

  // -------------------------------------------------------------- MODO VISTA
  if (!editing) {
    if (!tieneDatos(f)) {
      return (
        <div className="empty">
          <div className="em-ico"><IcActivity width={40} height={40} /></div>
          <h3>Ficha clínica sin completar</h3>
          <p>Cargá la lesión, antecedentes, EVA, alergias y estudios del paciente.</p>
          <button className="btn btn-sage mt" onClick={() => setEditing(true)}><IcEdit width={16} /> Cargar ficha</button>
        </div>
      );
    }
    return (
      <div className="detail-cols">
        <div className="stack">
          <div className="card card-pad">
            <div className="section-title"><span className="bar" /> Lesión / Patología</div>
            <div className="mt">
              <ViewField label="Lesión o patología" value={f.lesion} />
              <ViewField label="Antecedentes lesivos" value={f.antecedentes} />
              <div className="vfield">
                <div className="vlabel">Escala de dolor — EVA</div>
                {f.eva != null ? (
                  <div className="eva-show">
                    <span className="eva-badge" style={{ background: EVA_COLORS[f.eva] }}>{f.eva}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{f.eva}/10</div>
                      <div className="muted small">{evaLabel(f.eva)}</div>
                    </div>
                  </div>
                ) : <div className="vvalue muted">—</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card card-pad">
            <div className="section-title"><span className="bar" style={{ background: 'var(--amber)' }} /> Datos clínicos</div>
            <div className="mt">
              <ViewField label="Alergias" value={f.alergias} />
              <ViewField label="Fobias / observaciones" value={f.fobias} />
              <ViewField label="Tratamientos previos" value={f.tratamientos_previos} />
            </div>
          </div>

          <div className="card card-pad">
            <div className="section-title"><span className="bar" style={{ background: 'var(--sage)' }} /> Estudios / imágenes previas</div>
            <div className="mt">
              {f.archivos && f.archivos.length
                ? <Attachments value={f.archivos} readOnly />
                : <span className="muted small">Sin estudios cargados.</span>}
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
          <button className="btn btn-outline" onClick={() => setEditing(true)}><IcEdit width={16} /> Editar ficha</button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------ MODO EDICIÓN
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
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
                {Array.from({ length: 11 }, (_, n) => (
                  <button
                    key={n}
                    onClick={() => setF((s) => ({ ...s, eva: n }))}
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
          <Attachments value={f.archivos} onChange={(archivos) => setF((s) => ({ ...s, archivos }))} hint="Imágenes (JPG/PNG) o PDF" />
        </div>
      </div>

      <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
        <button className="btn btn-ghost" onClick={cancelar} disabled={saving}>Cancelar</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <IcCheck width={18} /> {saving ? 'Guardando…' : 'Guardar ficha'}
        </button>
      </div>
    </div>
  );
}

function ViewField({ label, value }) {
  const has = value && String(value).trim();
  return (
    <div className="vfield">
      <div className="vlabel">{label}</div>
      <div className={`vvalue ${has ? '' : 'muted'}`}>{has ? value : '—'}</div>
    </div>
  );
}
