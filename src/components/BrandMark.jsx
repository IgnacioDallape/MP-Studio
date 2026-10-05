// Logo oficial MP Studio (monograma M/P + "Studio.") como imagen.
//   tone: 'dark'  → logo oscuro, para fondos claros (default)
//         'light' → logo crema, para el sidebar olivo
//   variant: 'full' (logo + tagline) | 'mono' (solo el logo)
// Los PNG viven en /public (logo-dark.png, logo-light.png).

export default function BrandMark({ variant = 'full', tone = 'dark', width = 160, tagline = true, color }) {
  const src = tone === 'light' ? '/logo-light.png' : '/logo-dark.png';
  const tagColor = color || (tone === 'light' ? '#F8F3E1' : '#41431b');

  const img = (
    <img
      src={src}
      alt="MP Studio — Fisioterapia Invasiva Ecoguiada"
      width={width}
      style={{ height: 'auto', display: 'block' }}
    />
  );

  if (variant === 'mono') return img;

  const fs = Math.max(10, Math.round(width * 0.092));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {img}
      {tagline && (
        <div style={{ textAlign: 'center', marginTop: Math.round(width * 0.05) }}>
          <div style={{ width: Math.round(width * 0.6), height: 1, background: tagColor, opacity: 0.35, margin: '0 auto 8px' }} />
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: fs, letterSpacing: Math.max(2, width * 0.022), color: tagColor, lineHeight: 1.3 }}>
            FISIOTERAPIA INVASIVA
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: fs, letterSpacing: Math.max(3, width * 0.045), color: tagColor, lineHeight: 1.3 }}>
            ECOGUIADA
          </div>
        </div>
      )}
    </div>
  );
}
