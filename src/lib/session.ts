import { cache } from "react";

import type { User } from "@supabase/supabase-js";

import { type AccessContext, type EmpresaContext, parseContext } from "@/lib/dashboard-access";
import { createSupabaseServerClient } from "@/lib/sb/server";

export type SessionContext = AccessContext & {
  user: User;
  empresas: EmpresaContext[];
};

// Usuario + rol + empresas + servicios, una sola vez por request (layout y páginas la comparten).
export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.rpc("gl_mi_contexto");
  if (error) {
    console.error("No se pudo cargar el contexto del usuario:", error.message);
  }

  return { user, ...parseContext(user.id, data) };
});
