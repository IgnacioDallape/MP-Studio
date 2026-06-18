import { useEffect, useState, useCallback } from 'react';
import { useStore } from '../../store/useStore.js';
import * as db from '../../lib/db.js';
import { iniciales, nombreCompleto, fechaCorta } from '../../lib/format.js';
import { IcBack, IcEdit, IcTrash, IcPhone, IcMail } from '../icons.jsx';
import PacienteForm from './PacienteForm.jsx';
import FichaClinica from './FichaClinica.jsx';
import Sesiones from './Sesiones.jsx';

export default function PacienteDetail({ id }) {
  const closePaciente = useStore((s) => s.closePaciente);
  const refreshList = useStore((s) => s.refreshPacientes);
  const toast = useStore((s) => s.toast);
  const [pac, setPac] = useState(null);
  const [tab, setTab] = useState('ficha');
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPac(await db.getPaciente(id));
    } catch (e) {
      toast('No se pudo cargar el paciente: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  const onDelete = async () => {
    if (!confirm(`¿Eliminar a ${nombreCompleto(pac)} y todas sus sesiones? Esta acción no se puede deshacer.`)) return;
    try {
      await db.deletePaciente(id);
      toast('Paciente eliminado', 'success');
      await refreshList();
      closePaciente();
    } catch (e) {
      toast('Error al eliminar: ' + e.message, 'error');
    }
  };

  if (loading) return <div className="empty"><div className="muted">Cargando…</div></div>;
  if (!pac) return (
    <div className="empty">
      <h3>Paciente no encontrado</h3>
      <button className="btn btn-outline mt" onClick={closePaciente}><IcBack /> Volver</button>
    </div>
  );

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb" onClick={closePaciente}><IcBack width={18} /> Volver a pacientes</button>

      <div className="detail-head">
        <div className="avatar lg">{iniciales(pac.nombre, pac.apellido)}</div>
        <div className="grow">
          <h1>{nombreCompleto(pac)}</h1>
          <div className="kv">
            {pac.edad != null && pac.edad !== '' && <div className="kv-item"><span className="k">Edad</span><span className="v">{pac.edad} años</span></div>}
            <div className="kv-item"><span className="k">DNI</span><span className="v">{pac.dni || '—'}</span></div>
            <div className="kv-item"><span className="k">Ingreso</span><span className="v">{fechaCorta(pac.fecha_ingreso)}</span></div>
            {pac.telefono && <div className="kv-item"><span className="k">Teléfono</span><span className="v"><IcPhone /> {pac.telefono}</span></div>}
            {pac.mail && <div className="kv-item"><span className="k">Email</span><span className="v"><IcMail /> {pac.mail}</span></div>}
          </div>
        </div>
        <div className="row">
          <button className="btn btn-outline btn-sm" onClick={() => setEditOpen(true)}><IcEdit width={16} /> Editar</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}><IcTrash width={16} /></button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'ficha' ? 'active' : ''}`} onClick={() => setTab('ficha')}>Ficha clínica</button>
        <button className={`tab ${tab === 'sesiones' ? 'active' : ''}`} onClick={() => setTab('sesiones')}>Tratamientos</button>
      </div>

      {tab === 'ficha' && <FichaClinica paciente={pac} onSaved={load} />}
      {tab === 'sesiones' && <Sesiones paciente={pac} />}

      {editOpen && <PacienteForm paciente={pac} onClose={() => { setEditOpen(false); load(); refreshList(); }} />}
    </div>
  );
}
