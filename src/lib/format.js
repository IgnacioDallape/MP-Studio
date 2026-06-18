// Helpers de formato (fechas, edad, etc.) — todo en es-AR.

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// 'YYYY-MM-DD' de hoy (en hora local, sin desfasaje UTC).
export function hoyISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

// 'YYYY-MM-DD' -> '18 de junio de 2026'
export function fechaLarga(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y) return iso;
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

// 'YYYY-MM-DD' -> '18/06/2026'
export function fechaCorta(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

// Dia de la semana de un ISO date.
export function diaSemana(iso) {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dias[dt.getDay()];
}

export function edadDesde(fechaNac) {
  if (!fechaNac) return '';
  const [y, m, d] = fechaNac.slice(0, 10).split('-').map(Number);
  const nac = new Date(y, m - 1, d);
  const hoy = new Date();
  let e = hoy.getFullYear() - nac.getFullYear();
  const mm = hoy.getMonth() - nac.getMonth();
  if (mm < 0 || (mm === 0 && hoy.getDate() < nac.getDate())) e--;
  return e;
}

export function iniciales(nombre = '', apellido = '') {
  return ((nombre[0] || '') + (apellido[0] || '')).toUpperCase() || '?';
}

export function nombreCompleto(p) {
  if (!p) return '';
  return `${p.nombre || ''} ${p.apellido || ''}`.trim();
}
