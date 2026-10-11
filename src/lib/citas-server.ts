import type { SupabaseClient } from "@supabase/supabase-js";

import { type AgendaConfig, CONFIG_DEFAULT, type Horario } from "@/lib/citas";

// Configuración de la agenda de una empresa (o la de por defecto si aún no la guarda).
export async function obtenerConfig(supabase: SupabaseClient, empresaId: number): Promise<AgendaConfig> {
  const { data } = await supabase
    .from("gl_agenda_config")
    .select("horario, intervalo_min, capacidad")
    .eq("empresa_id", empresaId)
    .maybeSingle();
  if (!data) return CONFIG_DEFAULT;
  return { horario: data.horario as Horario, intervalo_min: data.intervalo_min, capacidad: data.capacidad };
}
