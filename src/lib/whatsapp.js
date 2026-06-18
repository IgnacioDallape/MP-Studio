// ============================================================================
// Envío del informe de tratamiento por WhatsApp al teléfono del paciente.
// ----------------------------------------------------------------------------
// WhatsApp NO permite adjuntar un archivo vía link: wa.me solo abre el chat con
// un texto. Por eso, en modo nube subimos el PDF a Storage y mandamos el LINK.
// En modo local (sin Supabase) no hay hosting → se descarga el PDF y se abre el
// chat para adjuntarlo a mano.
// ============================================================================

import { getTratamientoPDFBlob } from './exportPDF.js';
import { uploadPdf } from './db.js';
import { WHATSAPP } from './config.js';
import { fechaLarga } from './format.js';

// Normaliza un teléfono a formato internacional para wa.me (solo dígitos).
// Heurística pensada para Argentina (54 + 9 + área + número).
export function normalizarTelefono(raw) {
  if (!raw) return '';
  let d = String(raw).replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2); // prefijo internacional

  const cc = WHATSAPP.waDialCode;
  if (d.startsWith(cc)) {
    if (WHATSAPP.waMobile9 && cc === '54' && d[cc.length] !== '9') {
      d = cc + '9' + d.slice(cc.length);
    }
    return d;
  }
  if (d.startsWith('0')) d = d.slice(1); // troncal nacional
  if (WHATSAPP.waMobile9 && cc === '54') return cc + '9' + d;
  return cc + d;
}

function descargar(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Prepara el envío y devuelve { waUrl, downloaded, hasLink, tel }.
// NO abre ventanas (eso lo hace el componente dentro del gesto del click,
// para evitar el bloqueo de pop-ups).
export async function prepararEnvioWhatsApp({ paciente, tratamiento }) {
  const tel = normalizarTelefono(paciente.telefono);
  if (!tel) {
    throw new Error('El paciente no tiene un teléfono válido cargado.');
  }

  const { blob, filename } = await getTratamientoPDFBlob({ paciente, tratamiento });

  let link = null;
  try {
    link = await uploadPdf(blob, filename);
  } catch {
    link = null; // si falla la subida, seguimos sin link
  }

  const nombre = (paciente.nombre || '').trim();
  let msg = `Hola ${nombre}! 👋 Te comparto el informe de tu tratamiento del ${fechaLarga(tratamiento.fecha)} en MP Studio.`;
  let downloaded = false;
  if (link) {
    msg += `\n\n${link}`;
  } else {
    descargar(blob, filename); // modo local: lo bajamos para adjuntarlo a mano
    downloaded = true;
    msg += '\n\n(Te adjunto el informe en PDF.)';
  }

  const waUrl = `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
  return { waUrl, downloaded, hasLink: Boolean(link), tel };
}
