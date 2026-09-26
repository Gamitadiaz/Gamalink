import { createBrowserClient } from "@supabase/ssr";

// Esto reemplaza al antiguo createClient de @supabase/supabase-js
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
);
