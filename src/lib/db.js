// ============================================================================
// DB — Adaptador de datos unificado
// ----------------------------------------------------------------------------
// El resto de la app llama a estas funciones sin saber si los datos van a
// Supabase (nube) o a localStorage (este navegador). Se decide solo segun
// haya o no credenciales en config.js (CLOUD_ENABLED).
// ============================================================================

import { sb } from './supabase.js';
import { CLOUD_ENABLED, STORAGE_BUCKET } from './config.js';
import { compressImage, readAsDataURL, isImage } from './files.js';

export const isCloud = CLOUD_ENABLED;

const uid = () =>
  (crypto?.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2) + Date.now());

const nowISO = () => new Date().toISOString();

// ----------------------------------------------------------------------------
// Backend LOCAL (localStorage)
// ----------------------------------------------------------------------------
const KEYS = {
  pacientes: 'mp_pacientes',
  tratamientos: 'mp_tratamientos',
  turnos: 'mp_turnos',
};

function lsRead(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function lsWrite(key, arr) {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
    return true;
  } catch (e) {
    throw new Error(
      'No hay mas espacio en el almacenamiento local. Configura Supabase para guardar en la nube.'
    );
  }
}

// ----------------------------------------------------------------------------
// PACIENTES
// ----------------------------------------------------------------------------
export async function listPacientes() {
  if (isCloud) {
    const { data, error } = await sb
      .from('pacientes')
      .select('*')
      .order('apellido', { ascending: true });
    if (error) throw error;
    return data || [];
  }
  return lsRead(KEYS.pacientes).sort((a, b) =>
    (a.apellido || '').localeCompare(b.apellido || '')
  );
}

export async function getPaciente(id) {
  if (isCloud) {
    const { data, error } = await sb.from('pacientes').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }
  return lsRead(KEYS.pacientes).find((p) => p.id === id) || null;
}

export async function createPaciente(data) {
  const row = { id: uid(), created_at: nowISO(), ficha: {}, ...data };
  if (isCloud) {
    const { data: out, error } = await sb.from('pacientes').insert(row).select().single();
    if (error) throw error;
    return out;
  }
  const all = lsRead(KEYS.pacientes);
  all.push(row);
  lsWrite(KEYS.pacientes, all);
  return row;
}

export async function updatePaciente(id, patch) {
  if (isCloud) {
    const { data, error } = await sb
      .from('pacientes')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const all = lsRead(KEYS.pacientes);
  const i = all.findIndex((p) => p.id === id);
  if (i === -1) throw new Error('Paciente no encontrado');
  all[i] = { ...all[i], ...patch };
  lsWrite(KEYS.pacientes, all);
  return all[i];
}

export async function deletePaciente(id) {
  if (isCloud) {
    const { error } = await sb.from('pacientes').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  lsWrite(KEYS.pacientes, lsRead(KEYS.pacientes).filter((p) => p.id !== id));
  // limpiar tratamientos del paciente
  lsWrite(KEYS.tratamientos, lsRead(KEYS.tratamientos).filter((t) => t.paciente_id !== id));
}

// ----------------------------------------------------------------------------
// TRATAMIENTOS (sesiones)
// ----------------------------------------------------------------------------
export async function listTratamientos(pacienteId) {
  if (isCloud) {
    let q = sb.from('tratamientos').select('*').order('fecha', { ascending: false });
    if (pacienteId) q = q.eq('paciente_id', pacienteId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }
  let all = lsRead(KEYS.tratamientos);
  if (pacienteId) all = all.filter((t) => t.paciente_id === pacienteId);
  return all.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
}

export async function createTratamiento(data) {
  const row = { id: uid(), created_at: nowISO(), imagenes: [], ...data };
  if (isCloud) {
    const { data: out, error } = await sb.from('tratamientos').insert(row).select().single();
    if (error) throw error;
    return out;
  }
  const all = lsRead(KEYS.tratamientos);
  all.push(row);
  lsWrite(KEYS.tratamientos, all);
  return row;
}

export async function deleteTratamiento(id) {
  if (isCloud) {
    const { error } = await sb.from('tratamientos').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  lsWrite(KEYS.tratamientos, lsRead(KEYS.tratamientos).filter((t) => t.id !== id));
}

// ----------------------------------------------------------------------------
// TURNOS (agenda)
// ----------------------------------------------------------------------------
export async function listTurnos() {
  if (isCloud) {
    const { data, error } = await sb
      .from('turnos')
      .select('*')
      .order('fecha', { ascending: true });
    if (error) throw error;
    return data || [];
  }
  return lsRead(KEYS.turnos).sort((a, b) =>
    (a.fecha + a.hora).localeCompare(b.fecha + b.hora)
  );
}

export async function createTurno(data) {
  const row = { id: uid(), created_at: nowISO(), estado: 'pendiente', ...data };
  if (isCloud) {
    const { data: out, error } = await sb.from('turnos').insert(row).select().single();
    if (error) throw error;
    return out;
  }
  const all = lsRead(KEYS.turnos);
  all.push(row);
  lsWrite(KEYS.turnos, all);
  return row;
}

export async function updateTurno(id, patch) {
  if (isCloud) {
    const { data, error } = await sb.from('turnos').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const all = lsRead(KEYS.turnos);
  const i = all.findIndex((t) => t.id === id);
  if (i === -1) throw new Error('Turno no encontrado');
  all[i] = { ...all[i], ...patch };
  lsWrite(KEYS.turnos, all);
  return all[i];
}

export async function deleteTurno(id) {
  if (isCloud) {
    const { error } = await sb.from('turnos').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  lsWrite(KEYS.turnos, lsRead(KEYS.turnos).filter((t) => t.id !== id));
}

// ----------------------------------------------------------------------------
// ARCHIVOS (imagenes / PDFs)
// Devuelve { name, type, url }  — url sirve para <img> y para el PDF.
// ----------------------------------------------------------------------------
export async function uploadFile(file) {
  let blob = file;
  let dataUrl = null;
  let type = file.type;
  let ext = (file.name.split('.').pop() || 'bin').toLowerCase();

  if (isImage(file)) {
    const c = await compressImage(file);
    blob = c.blob;
    dataUrl = c.dataUrl;
    type = 'image/jpeg'; // compressImage siempre produce JPEG
    ext = 'jpg';
  } else {
    dataUrl = await readAsDataURL(file);
  }

  if (isCloud) {
    const path = `${nowISO().slice(0, 10)}/${uid()}.${ext}`;
    const { error } = await sb.storage
      .from(STORAGE_BUCKET)
      .upload(path, blob, { contentType: type, upsert: false });
    if (error) throw error;
    const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return { name: file.name, type, url: data.publicUrl, path };
  }

  // Local: el data URL ES la url.
  return { name: file.name, type, url: dataUrl };
}
