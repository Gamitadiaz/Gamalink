import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

// Cliente de Supabase para Server Components con la sesión del usuario.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // Los Server Components no pueden escribir cookies; el proxy ya refresca la sesión.
        setAll: () => {
          /* no-op */
        },
      },
    },
  );
}
