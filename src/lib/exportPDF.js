// ============================================================================
// PDF del informe de tratamiento — MP Studio
// Diseño con logo y paleta de la marca para enviar al paciente.
// ============================================================================

import { jsPDF } from 'jspdf';
import { fechaLarga, nombreCompleto } from './format.js';
import { STUDIO } from './config.js';

// Paleta (RGB)
const OLIVE = [65, 67, 27];
const SAGE = [174, 183, 132];
const BEIGE = [227, 219, 187];
const CREAM = [248, 243, 225];
const INK = [52, 54, 28];
const GREY = [116, 117, 90];

const PAGE_W = 210;
const PAGE_H = 297;
const MX = 18; // margen lateral
const CW = PAGE_W - MX * 2; // ancho de contenido

// Convierte cualquier url (dataURL o remota) a dataURL para jsPDF.
async function toDataURL(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function header(doc) {
  // Banda olivo
  doc.setFillColor(...OLIVE);
  doc.rect(0, 0, PAGE_W, 34, 'F');

  // Monograma M / P
  doc.setTextColor(...CREAM);
  doc.setFont('times', 'bold');
  doc.setFontSize(30);
  doc.text('M', MX, 23);
  doc.text('P', MX + 13, 25);

  // aguja ecoguiada (diagonal salvia)
  doc.setDrawColor(...SAGE);
  doc.setLineWidth(0.7);
  doc.line(MX + 26, 8, MX + 4, 28);

  // Wordmark + tagline
  doc.setFont('times', 'normal');
  doc.setFontSize(17);
  doc.setTextColor(...CREAM);
  doc.text('MP Studio', MX + 36, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...BEIGE);
  doc.setCharSpace(1.6);
  doc.text('FISIOTERAPIA INVASIVA  ·  ECOGUIADA', MX + 36, 23);
  doc.setCharSpace(0);
}

function footer(doc) {
  const y = PAGE_H - 16;
  doc.setDrawColor(...BEIGE);
  doc.setLineWidth(0.4);
  doc.line(MX, y, PAGE_W - MX, y);

  // Línea 1: marca + profesional / matrícula
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...GREY);
  doc.text('MP Studio · Fisioterapia Invasiva Ecoguiada', MX, y + 5);

  const prof = [STUDIO.profesional, STUDIO.matricula].filter(Boolean).join(' · ');
  if (prof) doc.text(prof, PAGE_W - MX, y + 5, { align: 'right' });

  // Línea 2: contacto (sólo los datos cargados)
  const contacto = [
    STUDIO.telefono && `Tel: ${STUDIO.telefono}`,
    STUDIO.mail,
    STUDIO.instagram,
  ].filter(Boolean).join('   ·   ');
  if (contacto) {
    doc.setTextColor(...SAGE);
    doc.text(contacto, MX, y + 10);
  }
}

// Título de sección con barra salvia
function sectionTitle(doc, y, text) {
  doc.setFillColor(...SAGE);
  doc.rect(MX, y - 4, 1.6, 5.5, 'F');
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...OLIVE);
  doc.text(text, MX + 5, y);
  return y + 7;
}

// Si no entra `need` mm en la página, abre una nueva con header/footer.
function ensureSpace(doc, y, need) {
  if (y + need > PAGE_H - 22) {
    doc.addPage();
    header(doc);
    footer(doc);
    return 48;
  }
  return y;
}

function paragraph(doc, y, text) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  const lines = doc.splitTextToSize(text || '—', CW);
  doc.text(lines, MX, y);
  return y + lines.length * 5.4 + 4;
}

export async function exportTratamientoPDF({ paciente, tratamiento }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  header(doc);
  footer(doc);
  let y = 48;

  // ---- Título del documento ----
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...OLIVE);
  doc.text('Informe de tratamiento', MX, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text(`Emitido el ${fechaLarga(new Date().toISOString().slice(0, 10))}`, PAGE_W - MX, y - 5, { align: 'right' });
  y += 10;

  // ---- Tarjeta del paciente ----
  const cardH = 36;
  doc.setFillColor(...CREAM);
  doc.setDrawColor(...BEIGE);
  doc.setLineWidth(0.4);
  doc.roundedRect(MX, y, CW, cardH, 2.5, 2.5, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...OLIVE);
  doc.text(nombreCompleto(paciente), MX + 7, y + 11);

  const datos = [
    ['Edad', paciente.edad != null && paciente.edad !== '' ? `${paciente.edad} años` : '—'],
    ['DNI', paciente.dni || '—'],
    ['Fecha de ingreso', fechaLarga(paciente.fecha_ingreso)],
    ['Fecha del tratamiento', fechaLarga(tratamiento.fecha)],
  ];
  const colW = CW / 4;
  datos.forEach(([k, v], i) => {
    const x = MX + 7 + i * colW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.4);
    doc.setTextColor(...GREY);
    doc.text(k.toUpperCase(), x, y + 22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const vv = doc.splitTextToSize(String(v), colW - 4);
    doc.text(vv, x, y + 28);
  });
  y += cardH + 12;

  // ---- Patología ----
  y = ensureSpace(doc, y, 24);
  y = sectionTitle(doc, y, 'Patología / Lesión');
  y = paragraph(doc, y, tratamiento.patologia);
  y += 2;

  // ---- Tratamiento ----
  y = ensureSpace(doc, y, 24);
  y = sectionTitle(doc, y, 'Tratamiento realizado');
  y = paragraph(doc, y, tratamiento.tratamiento);
  y += 2;

  // ---- Observaciones ----
  if (tratamiento.notas) {
    y = ensureSpace(doc, y, 24);
    y = sectionTitle(doc, y, 'Observaciones');
    y = paragraph(doc, y, tratamiento.notas);
    y += 2;
  }

  // ---- Imágenes ----
  const imgs = tratamiento.imagenes || [];
  if (imgs.length) {
    y = ensureSpace(doc, y, 48);
    y = sectionTitle(doc, y, 'Imágenes del tratamiento');
    y += 2;

    const gap = 6;
    const cols = imgs.length === 1 ? 1 : 2;
    const cellW = (CW - gap * (cols - 1)) / cols;
    const maxH = cols === 1 ? 120 : 78;

    let col = 0;
    let rowTop = y;
    let rowH = 0;

    for (const img of imgs) {
      let dataUrl, props;
      try {
        dataUrl = await toDataURL(img.url);
        props = doc.getImageProperties(dataUrl);
      } catch {
        continue; // si una imagen falla, seguimos con las demas
      }
      const ratio = props.height / props.width;
      let w = cellW;
      let h = w * ratio;
      if (h > maxH) { h = maxH; w = h / ratio; }

      // salto de pagina si no entra
      if (col === 0 && rowTop + h > PAGE_H - 22) {
        doc.addPage(); header(doc); footer(doc);
        rowTop = 48; y = 48;
      }

      const x = MX + col * (cellW + gap) + (cellW - w) / 2;
      const fmt = (props.fileType || 'JPEG').toUpperCase();
      doc.addImage(dataUrl, fmt === 'PNG' ? 'PNG' : 'JPEG', x, rowTop, w, h);
      // borde sutil
      doc.setDrawColor(...BEIGE);
      doc.setLineWidth(0.3);
      doc.rect(x, rowTop, w, h);

      rowH = Math.max(rowH, h);
      col++;
      if (col >= cols) {
        col = 0;
        rowTop += rowH + gap;
        y = rowTop;
        rowH = 0;
      }
    }
    if (col !== 0) { y = rowTop + rowH + gap; }
  }

  const nombre = `Informe_${(paciente.apellido || '')}_${(paciente.nombre || '')}_${tratamiento.fecha || ''}`
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
  doc.save(`${nombre || 'informe'}.pdf`);
}
