// Regenera los assets derivados del logo oficial de MP Studio.
// Fuente: public/logo-dark.png (logo oscuro con transparencia, recorte ajustado).
// Genera: logo-light.png (crema) + iconos PWA (192/512/180/maskable) + favicon.
// Uso: npm run gen:icons

import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUB = join(__dirname, '..', 'public');

const dark = await loadImage(join(PUB, 'logo-dark.png'));
const bw = dark.width, bh = dark.height;

function save(cv, name) {
  writeFileSync(join(PUB, name), cv.toBuffer('image/png'));
  console.log('✓', name, cv.width + 'x' + cv.height);
}

// Recolorea el logo (mantiene el canal alpha) → versión crema para el sidebar.
function recolor([r, g, b], long) {
  const c = createCanvas(bw, bh); const x = c.getContext('2d');
  x.drawImage(dark, 0, 0);
  const im = x.getImageData(0, 0, bw, bh); const d = im.data;
  for (let i = 0; i < d.length; i += 4) { d[i] = r; d[i + 1] = g; d[i + 2] = b; }
  x.putImageData(im, 0, 0);
  if (!long) return c;
  const s = long / Math.max(bw, bh);
  const o = createCanvas(Math.round(bw * s), Math.round(bh * s));
  o.getContext('2d').drawImage(c, 0, 0, o.width, o.height);
  return o;
}

// Icono cuadrado: logo centrado sobre fondo, con padding.
function icon(size, pad, bg) {
  const c = createCanvas(size, size); const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, size, size);
  const avail = size * (1 - 2 * pad);
  const s = avail / Math.max(bw, bh);
  x.drawImage(dark, (size - bw * s) / 2, (size - bh * s) / 2, bw * s, bh * s);
  return c;
}

save(recolor([248, 243, 225], 1200), 'logo-light.png');
save(icon(512, 0.14, '#ffffff'), 'icon-512.png');
save(icon(192, 0.14, '#ffffff'), 'icon-192.png');
save(icon(180, 0.14, '#ffffff'), 'icon-180.png');
save(icon(512, 0.22, '#ffffff'), 'icon-maskable-512.png');
save(icon(96, 0.12, '#ffffff'), 'favicon.png');

console.log('Assets regenerados desde public/logo-dark.png');
