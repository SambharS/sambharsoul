// src/lib/supabaseClient.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://lztnasrsgahrucgdophe.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "your-public-anon-key"; // never use service key here

// ⚙️ Client-side instance (safe for browser use)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  },
});

// ⚙️ Admin instance (server-side use only)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);
