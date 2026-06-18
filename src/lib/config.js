// ============================================================================
// CONFIG — MP Studio
// ----------------------------------------------------------------------------
// Para activar la nube (Supabase): completá SUPABASE_URL y SUPABASE_ANON_KEY.
// Mientras estén vacíos, la app funciona 100% en modo LOCAL (este navegador).
// Las instrucciones para crear el proyecto + las tablas estan en README.md.
// ============================================================================

export const SUPABASE_URL = 'https://npelotjjbdxnugxbcvxx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZWxvdGpqYmR4bnVneGJjdnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTAyMzgsImV4cCI6MjA5NzM4NjIzOH0.dS0fHAD7IiS3ELl7p10y8gfbnIgFPcOOJAjl_1i3nJQ';

// PIN de acceso a la app. Marcos lo puede cambiar acá.
// (Es una traba simple del lado del cliente, no encriptacion fuerte.)
export const APP_PIN = '1234';

// true cuando hay credenciales de Supabase cargadas.
export const CLOUD_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Nombre del bucket de Storage donde van imagenes y PDFs.
export const STORAGE_BUCKET = 'archivos';

// Datos del profesional — aparecen en el pie del PDF que se envia al paciente.
// Completá los que falten (los vacios no se muestran).
export const STUDIO = {
  profesional: 'Marcos Porretta',
  titulo: 'Fisioterapeuta',        // ej: 'Lic. en Kinesiología'
  matricula: '',                   // ej: 'M.N. 12345'
  telefono: '',                    // ej: '+54 261 510-2698'
  mail: '',                        // ej: 'mpstudio@gmail.com'
  instagram: '',                   // ej: '@mp.studio'
};

// WhatsApp — para enviar el informe al teléfono del paciente.
// waDialCode: código de país por defecto si el número guardado no lo trae.
// waMobile9: en Argentina los celulares llevan un "9" después del 54.
export const WHATSAPP = {
  waDialCode: '54',
  waMobile9: true,
};
