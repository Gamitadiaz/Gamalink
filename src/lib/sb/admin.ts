import { createClient } from "@supabase/supabase-js";

// SOLO SERVIDOR. Usa la service role key, que se salta RLS: úsalo únicamente para lo que
// no se puede hacer con la sesión del usuario (por ejemplo, invitar usuarios) y siempre
// después de verificar que quien llama es superadmin.
// La variable no lleva NEXT_PUBLIC_, así que nunca llega al navegador.
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
