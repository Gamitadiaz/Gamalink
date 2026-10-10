import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { resolverEmpresa } from "@/lib/empresa-actual";
import {
  diasEntre,
  ESTADO_SOCIO_CLASS,
  ESTADO_SOCIO_LABEL,
  estadoSocio,
  formatoDinero,
  formatoFecha,
  hoyMx,
  METODOS_PAGO,
  type PlanMembresia,
  type SocioResumen,
} from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";

import { EliminarPagoButton, RegistrarPagoForm, SocioDatosForm, SocioEstadoButton } from "../../_components/forms";
import { conEmpresa, SinEmpresa } from "../../_components/modulo-header";

export const metadata: Metadata = { title: "Socio" };

export default async function SocioPage({
  params,
  searchParams,
}: {
  params: Promise<{ socioId: string }>;
  searchParams: Promise<{ empresa?: string }>;
}) {
  const [{ socioId: rawId }, { empresa: empresaParam }] = await Promise.all([params, searchParams]);
  const socioId = Number(rawId);
  if (!Number.isInteger(socioId) || socioId <= 0) notFound();

  const { empresa } = await resolverEmpresa("membresias", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const supabase = await createSupabaseServerClient();
  const [{ data: socioData }, { data: pagos }, { data: planesData }] = await Promise.all([
    supabase.from("gl_socios_resumen").select("*").eq("id", socioId).eq("empresa_id", empresa.id).maybeSingle(),
    supabase
      .from("gl_pagos_socios")
      .select("id, plan_id, monto, metodo, fecha_pago, vigente_desde, vigente_hasta")
      .eq("socio_id", socioId)
      .eq("empresa_id", empresa.id)
      .order("vigente_hasta", { ascending: false }),
    supabase
      .from("gl_planes_membresia")
      .select("id, nombre, precio, duracion_dias, activo")
      .eq("empresa_id", empresa.id)
      .order("precio"),
  ]);

  if (!socioData) notFound();
  const socio = socioData as SocioResumen;
  const planes = (planesData ?? []) as PlanMembresia[];
  const hoy = hoyMx();
  const estado = estadoSocio(socio, hoy);
  const planPorId = new Map(planes.map((plan) => [plan.id, plan.nombre]));
  const metodoLabel = new Map<string, string>(METODOS_PAGO.map((m) => [m.key, m.label]));

  let vigencia = "Aún no tiene pagos registrados.";
  if (socio.vigente_hasta) {
    const dias = diasEntre(hoy, socio.vigente_hasta);
    vigencia =
      dias >= 0
        ? `Pagado hasta el ${formatoFecha(socio.vigente_hasta)} (${dias === 0 ? "vence hoy" : `${dias} días`}).`
        : `Venció el ${formatoFecha(socio.vigente_hasta)} (hace ${-dias} días).`;
  }

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <Link
        className="inline-flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        href={conEmpresa("/dashboard/membresias/socios", empresa.id)}
      >
        <ArrowLeft className="size-4" />
        Volver a socios
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-2xl">{socio.nombre}</h1>
            <Badge className={ESTADO_SOCIO_CLASS[estado]}>{ESTADO_SOCIO_LABEL[estado]}</Badge>
          </div>
          <p className="text-muted-foreground">{vigencia}</p>
          <p className="text-muted-foreground text-sm">
            Socio desde {formatoFecha(socio.created_at.slice(0, 10))} · Total pagado {formatoDinero(socio.total_pagado)}
          </p>
        </div>
        <SocioEstadoButton activo={socio.activo} empresaId={empresa.id} socioId={socio.id} />
      </header>

      {socio.activo && planes.some((plan) => plan.activo) ? (
        <RegistrarPagoForm empresaId={empresa.id} planes={planes} socioId={socio.id} />
      ) : null}

      <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6">
        <h2 className="font-semibold text-lg">Historial de pagos</h2>
        {pagos && pagos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground text-xs">
                <tr className="border-b">
                  <th className="py-2 pr-3 font-medium">Pagó</th>
                  <th className="py-2 pr-3 font-medium">Plan</th>
                  <th className="py-2 pr-3 font-medium">Periodo</th>
                  <th className="py-2 pr-3 font-medium">Método</th>
                  <th className="py-2 pr-3 text-right font-medium">Monto</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagos.map((pago) => (
                  <tr key={pago.id}>
                    <td className="whitespace-nowrap py-2 pr-3">{formatoFecha(pago.fecha_pago)}</td>
                    <td className="py-2 pr-3">
                      {pago.plan_id ? (planPorId.get(pago.plan_id) ?? "—") : "Personalizado"}
                    </td>
                    <td className="whitespace-nowrap py-2 pr-3 text-muted-foreground">
                      {formatoFecha(pago.vigente_desde)} – {formatoFecha(pago.vigente_hasta)}
                    </td>
                    <td className="py-2 pr-3">{metodoLabel.get(pago.metodo) ?? pago.metodo}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatoDinero(pago.monto)}</td>
                    <td className="py-2 text-right">
                      <EliminarPagoButton empresaId={empresa.id} pagoId={pago.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Sin pagos todavía.</p>
        )}
      </section>

      <SocioDatosForm empresaId={empresa.id} socio={socio} />
    </main>
  );
}
