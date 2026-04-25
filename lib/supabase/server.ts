import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
}

/**
 * Server-side Supabase client with service role key.
 * BYPASSES Row Level Security — use only in server-side agent operations.
 * NEVER expose this client or its key to the browser.
 * Import this only in /lib/agents and /app/api route handlers.
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    db: { schema: "cma" },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
