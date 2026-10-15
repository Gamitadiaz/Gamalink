import { resolverEmpresa } from "@/lib/empresa-actual";
import { nombreArchivo, respuestaCsv, sinPermiso, todasLasFilas } from "@/lib/exportar";
import { diaMx, hoyMx } from "@/lib/formato";
import { ESTADO_SOCIO_LABEL, estadoSocio, METODOS_PAGO, type SocioResumen } from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";

// GET /dashboard/membresias/exportar?empresa=ID&tipo=socios|pagos
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const { empresa } = await resolverEmpresa("membresias", params.get("empresa") ?? undefined);
  if (!empresa) return sinPermiso();

  const supabase = await createSupabaseServerClient();
  const hoy = hoyMx();
  const socios = await todasLasFilas<SocioResumen>((desde, hasta) =>
    supabase
      .from("gl_socios_resumen")
      .select("*")
      .eq("empresa_id", empresa.id)
      .order("nombre")
      .order("id")
      .range(desde, hasta),
  );

  if (params.get("tipo") === "pagos") {
    const [pagos, { data: planes }] = await Promise.all([
      todasLasFilas<{
        socio_id: number;
        plan_id: number | null;
        monto: number;
        metodo: string;
        fecha_pago: string;
        vigente_desde: string | null;
        vigente_hasta: string | null;
      }>((desde, hasta) =>
        supabase
          .from("gl_pagos_socios")
          .select("socio_id, plan_id, monto, metodo, fecha_pago, vigente_desde, vigente_hasta")
          .eq("empresa_id", empresa.id)
          .order("fecha_pago", { ascending: false })
          .order("id", { ascending: false })
          .range(desde, hasta),
      ),
      supabase.from("gl_planes_membresia").select("id, nombre").eq("empresa_id", empresa.id),
    ]);
    const nombreSocio = new Map(socios.map((socio) => [socio.id, socio.nombre]));
    const nombrePlan = new Map((planes ?? []).map((plan) => [plan.id, plan.nombre as string]));
    const metodo = new Map<string, string>(METODOS_PAGO.map((m) => [m.key, m.label]));

    return respuestaCsv(
      nombreArchivo(empresa.nombre, "pagos", hoy),
      ["Fecha de pago", "Socio", "Plan", "Monto", "Método", "Vigente desde", "Vigente hasta"],
      pagos.map((pago) => [
        pago.fecha_pago,
        nombreSocio.get(pago.socio_id) ?? `Socio ${pago.socio_id}`,
        pago.plan_id ? (nombrePlan.get(pago.plan_id) ?? "") : "",
        Number(pago.monto),
        metodo.get(pago.metodo) ?? pago.metodo,
        pago.vigente_desde,
        pago.vigente_hasta,
      ]),
    );
  }

  return respuestaCsv(
    nombreArchivo(empresa.nombre, "socios", hoy),
    ["Nombre", "Teléfono", "Correo", "Estado", "Vigente hasta", "Último pago", "Total pagado", "Alta", "Notas"],
    socios.map((socio) => [
      socio.nombre,
      socio.telefono,
      socio.correo,
      ESTADO_SOCIO_LABEL[estadoSocio(socio, hoy)],
      socio.vigente_hasta,
      socio.ultimo_pago,
      Number(socio.total_pagado ?? 0),
      diaMx(socio.created_at),
      socio.notas,
    ]),
  );
}
