import { CITA_COLUMNS, type Cita, ESTADO_CITA_LABEL } from "@/lib/citas";
import { resolverEmpresa } from "@/lib/empresa-actual";
import { nombreArchivo, rangoMes, respuestaCsv, sinPermiso, todasLasFilas } from "@/lib/exportar";
import { diaMx, formatoHora, hoyMx, inicioDiaMx } from "@/lib/formato";
import { createSupabaseServerClient } from "@/lib/sb/server";

// GET /dashboard/citas/exportar?empresa=ID&mes=YYYY-MM
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const { empresa } = await resolverEmpresa("citas", params.get("empresa") ?? undefined);
  if (!empresa) return sinPermiso();

  const { mes, desde, hasta } = rangoMes(params.get("mes"), hoyMx());
  const supabase = await createSupabaseServerClient();
  const citas = await todasLasFilas<Cita>((inicio, fin) =>
    supabase
      .from("gl_agenda_citas")
      .select(CITA_COLUMNS)
      .eq("empresa_id", empresa.id)
      .gte("inicio", inicioDiaMx(desde))
      .lt("inicio", inicioDiaMx(hasta))
      .order("inicio")
      .order("id")
      .range(inicio, fin),
  );

  return respuestaCsv(
    nombreArchivo(empresa.nombre, "citas", mes),
    ["Fecha", "Hora", "Termina", "Cliente", "Teléfono", "Servicio", "Precio", "Estado", "Notas"],
    citas.map((cita) => [
      diaMx(cita.inicio),
      formatoHora(cita.inicio),
      formatoHora(cita.fin),
      cita.cliente_nombre,
      cita.cliente_telefono,
      cita.servicio_nombre,
      Number(cita.precio),
      ESTADO_CITA_LABEL[cita.estado],
      cita.notas,
    ]),
  );
}
