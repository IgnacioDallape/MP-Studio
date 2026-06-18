import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, CLOUD_ENABLED } from './config.js';

// Solo creamos el cliente si hay credenciales. Si no, queda null y el
// adaptador (db.js) usa el backend local automaticamente.
export const sb = CLOUD_ENABLED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
