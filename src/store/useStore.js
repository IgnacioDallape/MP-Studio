import { create } from 'zustand';
import * as db from '../lib/db.js';

let toastSeq = 0;

export const useStore = create((set, get) => ({
  // ---- Acceso (PIN) ----
  unlocked: false,
  unlock: () => set({ unlocked: true }),

  // ---- Navegacion ----
  section: 'pacientes', // 'pacientes' | 'agenda' | 'historial'
  selectedPacienteId: null,
  setSection: (section) => set({ section, selectedPacienteId: null }),
  openPaciente: (id) => set({ section: 'pacientes', selectedPacienteId: id }),
  closePaciente: () => set({ selectedPacienteId: null }),

  // ---- Toasts ----
  toasts: [],
  toast: (msg, type = 'info') => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3600);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // ---- Pacientes (cache) ----
  pacientes: [],
  loadingPacientes: false,
  refreshPacientes: async () => {
    set({ loadingPacientes: true });
    try {
      const pacientes = await db.listPacientes();
      set({ pacientes, loadingPacientes: false });
    } catch (e) {
      set({ loadingPacientes: false });
      get().toast('No se pudieron cargar los pacientes: ' + e.message, 'error');
    }
  },
}));
