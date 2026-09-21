import { createClient } from '@supabase/supabase-js';

// Local Supabase stack defaults (docker: kong on :54321).
// Override via frontend/.env for hosted projects.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
