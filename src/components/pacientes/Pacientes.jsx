import { useState } from 'react';
import { useStore } from '../../store/useStore.js';
import PacientesList from './PacientesList.jsx';
import PacienteForm from './PacienteForm.jsx';
import PacienteDetail from './PacienteDetail.jsx';

export default function Pacientes() {
  const selectedId = useStore((s) => s.selectedPacienteId);
  const [formOpen, setFormOpen] = useState(false);

  if (selectedId) return <PacienteDetail id={selectedId} />;

  return (
    <>
      <PacientesList onNew={() => setFormOpen(true)} />
      {formOpen && <PacienteForm onClose={() => setFormOpen(false)} />}
    </>
  );
}
