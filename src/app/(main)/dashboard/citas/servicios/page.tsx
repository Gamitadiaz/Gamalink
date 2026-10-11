import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { duracionCorta, type ServicioAgenda } from "@/lib/citas";
import { resolverEmpresa } from "@/lib/empresa-actual";
import { formatoDinero } from "@/lib/formato";
import { createSupabaseServerClient } from "@/lib/sb/server";

import { ServicioAgendaEstadoButton, ServicioAgendaForm } from "../_components/forms";
import { ModuloHeader, SinEmpresa } from "../_components/modulo-header";

export const metadata: Metadata = { title: "Servicios" };

export default async function ServiciosAgendaPage({ searchParams }: { searchParams: Promise<{ empresa?: string }> }) {
  const { empresa: empresaParam } = await searchParams;
  const { empresa, opciones } = await resolverEmpresa("citas", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("gl_agenda_servicios")
    .select("id, nombre, duracion_min, precio, activo")
    .eq("empresa_id", empresa.id)
    .order("activo", { ascending: false })
    .order("nombre");
  const servicios = (data ?? []) as ServicioAgenda[];

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <ModuloHeader actual="servicios" empresa={empresa} opciones={opciones} />

      <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
        <div>
          <h2 className="font-semibold text-lg">Servicios</h2>
          <p className="text-muted-foreground text-sm">
            La duración define cuánto tiempo ocupa cada cita en la agenda. Desactivar un servicio no afecta las citas ya
            agendadas.
          </p>
        </div>
        {servicios.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {servicios.map((servicio) => (
              <li className="flex flex-wrap items-center justify-between gap-3 p-3" key={servicio.id}>
                <div>
                  <p className="flex items-center gap-2 font-medium text-sm">
                    {servicio.nombre}
                    {servicio.activo ? null : <Badge variant="outline">Inactivo</Badge>}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {duracionCorta(servicio.duracion_min)} · {formatoDinero(servicio.precio)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <ServicioAgendaForm empresaId={empresa.id} servicio={servicio} />
                  <ServicioAgendaEstadoButton empresaId={empresa.id} servicio={servicio} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Aún no hay servicios. Crea el primero para poder agendar.</p>
        )}
        <ServicioAgendaForm empresaId={empresa.id} />
      </section>
    </main>
  );
}
