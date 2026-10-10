import type { Servicio } from "@/lib/dashboard-access";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { getSessionContext } from "@/lib/session";

export type EmpresaOpcion = { id: number; nombre: string };

// Decide con qué empresa trabaja una página de módulo.
// - Dueño/empleado: sus empresas que tienen el servicio activo.
// - Superadmin: todas las empresas con el servicio activo (elige con ?empresa=ID).
export async function resolverEmpresa(servicio: Servicio, empresaParam?: string) {
  const session = await getSessionContext();
  if (!session) {
    return { empresa: null, opciones: [] as EmpresaOpcion[] };
  }

  let opciones: EmpresaOpcion[];
  if (session.role === "superadmin") {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("gl_empresa_servicios")
      .select("empresa_id, gl_empresas(nombre_negocio)")
      .eq("servicio", servicio)
      .eq("estado", "activo");
    opciones = (data ?? [])
      .map((row) => {
        const empresa = row.gl_empresas as unknown as { nombre_negocio: string } | null;
        return { id: Number(row.empresa_id), nombre: empresa?.nombre_negocio ?? `Empresa ${row.empresa_id}` };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  } else {
    opciones = session.empresas
      .filter((empresa) => empresa.servicios.includes(servicio))
      .map((empresa) => ({ id: empresa.id, nombre: empresa.nombre }));
  }

  const elegida = opciones.find((empresa) => String(empresa.id) === empresaParam) ?? opciones[0] ?? null;
  return { empresa: elegida, opciones };
}
