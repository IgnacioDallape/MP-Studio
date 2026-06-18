// Genera los iconos PNG de la PWA a partir del logo MP (vectorial).
// Uso: npm run gen:icons
// Usa una fuente serif del sistema (Georgia/Times) para el monograma M/P.

import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');
const FONT = { loadSystemFonts: true, defaultFontFamily: 'Georgia', serifFamily: 'Georgia' };

// Marca MP (monograma + aguja + "Studio." + subrayado), en coordenadas libres.
const inner = `
  <g fill="#141414" font-family="Cormorant Garamond, Georgia, Times New Roman, serif" font-weight="600" text-anchor="middle">
    <text x="178" y="300" font-size="300">M</text>
    <text x="320" y="420" font-size="300">P</text>
  </g>
  <line x1="420" y1="70" x2="150" y2="450" stroke="#141414" stroke-width="5" stroke-linecap="round"/>
  <g stroke="#141414" stroke-width="5" stroke-linecap="round">
    <line x1="414" y1="78" x2="398" y2="90"/>
    <line x1="406" y1="90" x2="390" y2="102"/>
    <line x1="398" y1="102" x2="382" y2="114"/>
    <line x1="390" y1="114" x2="374" y2="126"/>
  </g>
  <text x="372" y="452" font-size="62" font-style="italic" fill="#141414"
        font-family="Cormorant Garamond, Georgia, Times New Roman, serif">Studio.</text>
  <line x1="180" y1="476" x2="332" y2="476" stroke="#141414" stroke-width="3"/>
`;

// Bounding box real del contenido renderizado (según la fuente del sistema).
const raw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 600">${inner}</svg>`;
const bbox = new Resvg(raw, { font: FONT }).getBBox();
if (!bbox) throw new Error('No se pudo calcular el bounding box del logo');

// Centra y escala el contenido dentro de 512x512 dejando un margen (inset 0..0.5).
function svg(inset, bg = '#ffffff') {
  const m = 512 * inset;
  const avail = 512 - 2 * m;
  const scale = Math.min(avail / bbox.width, avail / bbox.height);
  const tx = (512 - bbox.width * scale) / 2 - bbox.x * scale;
  const ty = (512 - bbox.height * scale) / 2 - bbox.y * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="${bg}"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})">${inner}</g>
</svg>`;
}

function render(svgStr, size, out) {
  const resvg = new Resvg(svgStr, { fitTo: { mode: 'width', value: size }, font: FONT, background: '#ffffff' });
  writeFileSync(join(PUBLIC, out), resvg.render().asPng());
  console.log('✓', out, `(${size}px)`);
}

const full = svg(0.08);      // icono normal
const maskable = svg(0.20);  // maskable: más margen (zona segura del recorte circular)

writeFileSync(join(PUBLIC, 'icon.svg'), full + '\n');
render(full, 512, 'icon-512.png');
render(full, 192, 'icon-192.png');
render(full, 180, 'icon-180.png');
render(maskable, 512, 'icon-maskable-512.png');

console.log(`bbox = x:${bbox.x.toFixed(0)} y:${bbox.y.toFixed(0)} w:${bbox.width.toFixed(0)} h:${bbox.height.toFixed(0)}`);
console.log('Iconos generados en public/');
