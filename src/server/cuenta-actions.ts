"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/empresas";
import { createSupabaseServerClient } from "@/lib/sb/server";

export async function actualizarMiNombre(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre || nombre.length > 120) {
    return { ok: false, message: "El nombre debe tener entre 1 y 120 caracteres." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Tu sesión expiró. Vuelve a iniciar sesión." };
  }

  // El nombre vive en dos lugares: los datos de la cuenta (menú y header) y gl_usuarios (panel de empresas).
  const [{ error: authError }, { error: rowError }] = await Promise.all([
    supabase.auth.updateUser({ data: { full_name: nombre } }),
    supabase.rpc("gl_actualizar_mi_nombre", { p_nombre: nombre }),
  ]);
  if (authError || rowError) {
    return { ok: false, message: `No se pudo guardar: ${(authError ?? rowError)?.message}` };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Nombre actualizado." };
}
