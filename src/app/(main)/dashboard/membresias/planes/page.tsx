import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { resolverEmpresa } from "@/lib/empresa-actual";
import { duracionLabel, formatoDinero, type PlanMembresia } from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";

import { NuevoPlanForm, PlanEstadoButton } from "../_components/forms";
import { ModuloHeader, SinEmpresa } from "../_components/modulo-header";

export const metadata: Metadata = { title: "Planes" };

export default async function PlanesPage({ searchParams }: { searchParams: Promise<{ empresa?: string }> }) {
  const { empresa: empresaParam } = await searchParams;
  const { empresa, opciones } = await resolverEmpresa("membresias", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("gl_planes_membresia")
    .select("id, nombre, precio, duracion_dias, activo")
    .eq("empresa_id", empresa.id)
    .order("activo", { ascending: false })
    .order("precio");
  const planes = (data ?? []) as PlanMembresia[];

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <ModuloHeader actual="planes" empresa={empresa} opciones={opciones} />

      <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6">
        <div>
          <h2 className="font-semibold text-lg">Planes</h2>
          <p className="text-muted-foreground text-sm">
            Desactivar un plan lo quita de las opciones de pago; los pagos anteriores no cambian.
          </p>
        </div>
        {planes.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {planes.map((plan) => (
              <li className="flex flex-wrap items-center justify-between gap-3 p-3" key={plan.id}>
                <div>
                  <p className="flex items-center gap-2 font-medium text-sm">
                    {plan.nombre}
                    {plan.activo ? null : <Badge variant="outline">Inactivo</Badge>}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatoDinero(plan.precio)} · {duracionLabel(plan.duracion_dias)}
                  </p>
                </div>
                <PlanEstadoButton empresaId={empresa.id} plan={plan} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Aún no hay planes. Crea el primero abajo.</p>
        )}
      </section>

      <NuevoPlanForm empresaId={empresa.id} />
    </main>
  );
}
