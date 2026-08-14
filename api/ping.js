// ============================================================================
// Keepalive de Supabase
// ----------------------------------------------------------------------------
// Lo llama el cron de Vercel (ver vercel.json) cada 3 días. Hace una consulta
// mínima a la base para que Supabase registre actividad y NO pause el proyecto
// free por inactividad (los proyectos gratis se pausan tras ~7 días sin uso).
// También se puede abrir a mano en /api/ping para "despertarlo".
//
// URL + anon key son las mismas de src/lib/config.js (la anon key es pública).
// ============================================================================

const SUPABASE_URL = 'https://npelotjjbdxnugxbcvxx.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZWxvdGpqYmR4bnVneGJjdnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTAyMzgsImV4cCI6MjA5NzM4NjIzOH0.dS0fHAD7IiS3ELl7p10y8gfbnIgFPcOOJAjl_1i3nJQ';

export default async function handler(req, res) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/pacientes?select=id&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    res.status(r.ok ? 200 : 502).json({
      ok: r.ok,
      supabaseStatus: r.status,
      at: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String((e && e.message) || e), at: new Date().toISOString() });
  }
}
