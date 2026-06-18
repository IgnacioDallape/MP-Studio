// Logo MP Studio recreado en SVG (monograma M/P con aguja + tagline).
// variant: 'full' (con tagline) | 'mono' (solo monograma) | 'row' (monograma + texto al lado)

const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";

export default function BrandMark({
  variant = 'full',
  color = '#41431B',
  accent = '#AEB784',
  width = 220,
}) {
  if (variant === 'mono') {
    return (
      <svg width={width} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="MP Studio">
        <Monogram color={color} accent={accent} />
      </svg>
    );
  }

  if (variant === 'row') {
    return (
      <svg width={width} viewBox="0 0 520 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="MP Studio">
        <g transform="translate(0,-65) scale(0.78)">
          <Monogram color={color} accent={accent} />
        </g>
        <g fontFamily={SERIF} fill={color}>
          <text x="210" y="78" fontSize="40" fontWeight="600" letterSpacing="2">MP Studio</text>
          <line x1="212" y1="96" x2="430" y2="96" stroke={accent} strokeWidth="1.4" />
          <text x="212" y="124" fontSize="17" letterSpacing="5">FISIOTERAPIA INVASIVA</text>
          <text x="212" y="148" fontSize="17" letterSpacing="5">ECOGUIADA</text>
        </g>
      </svg>
    );
  }

  // full
  return (
    <svg width={width} viewBox="0 0 360 440" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="MP Studio — Fisioterapia Invasiva Ecoguiada">
      <g transform="translate(30,0)">
        <Monogram color={color} accent={accent} />
      </g>
      <g fontFamily={SERIF} fill={color} textAnchor="middle">
        <line x1="123" y1="300" x2="237" y2="300" stroke={color} strokeWidth="1.2" />
        <text x="180" y="346" fontSize="20" letterSpacing="3.4">FISIOTERAPIA INVASIVA</text>
        <text x="180" y="366" fontSize="16">—</text>
        <text x="180" y="396" fontSize="20" letterSpacing="6">ECOGUIADA</text>
      </g>
    </svg>
  );
}

function Monogram({ color, accent }) {
  return (
    <g>
      <text
        x="92" y="170" fontFamily={SERIF} fontSize="210" fontWeight="600"
        fill={color} textAnchor="middle" dominantBaseline="middle"
      >
        M
      </text>
      <text
        x="178" y="248" fontFamily={SERIF} fontSize="210" fontWeight="600"
        fill={color} textAnchor="middle" dominantBaseline="middle"
      >
        P
      </text>
      {/* aguja ecoguiada */}
      <line x1="252" y1="40" x2="86" y2="300" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <g stroke={accent} strokeWidth="2.4" strokeLinecap="round">
        <line x1="248" y1="46" x2="236" y2="56" />
        <line x1="242" y1="55" x2="230" y2="65" />
        <line x1="236" y1="64" x2="224" y2="74" />
        <line x1="230" y1="73" x2="218" y2="83" />
      </g>
      <text
        x="232" y="262" fontFamily={SERIF} fontSize="34" fontStyle="italic"
        fill={color} dominantBaseline="middle"
      >
        Studio.
      </text>
    </g>
  );
}
