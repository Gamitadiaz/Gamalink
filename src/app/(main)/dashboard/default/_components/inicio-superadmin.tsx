import Link from "next/link";

import { Building2, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SERVICIOS, servicioLabel } from "@/lib/empresas";
import { formatoDinero, formatoFecha, hoyMx, sumarDias } from "@/lib/formato";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { whatsappUrl } from "@/lib/whatsapp";

// Días hacia adelante para la cobranza próxima.
const DIAS_COBRANZA = 15;

export async function InicioSuperadmin() {
  const supabase = await createSupabaseServerClient();
  const hoy = hoyMx();
  const [{ data: empresasData }, { data: serviciosData }] = await Promise.all([
    supabase.from("gl_empresas").select("id, nombre_negocio, estado, contacto_telefono"),
    supabase.from("gl_empresa_servicios").select("empresa_id, servicio, estado, precio_mensual, fecha_vencimiento"),
  ]);

  const empresas = empresasData ?? [];
  const servicios = serviciosData ?? [];
  const empresaPorId = new Map(empresas.map((empresa) => [empresa.id, empresa]));
  const activos = servicios.filter(
    (servicio) => servicio.estado === "activo" && empresaPorId.get(servicio.empresa_id)?.estado === "Activo",
  );

  const ingresoMensual = activos.reduce((suma, servicio) => suma + Number(servicio.precio_mensual ?? 0), 0);
  const sinPrecio = activos.filter((servicio) => servicio.precio_mensual === null).length;
  const limite = sumarDias(hoy, DIAS_COBRANZA);
  const cobranza = activos
    .filter((servicio) => servicio.fecha_vencimiento && servicio.fecha_vencimiento <= limite)
    .sort((a, b) => (a.fecha_vencimiento ?? "").localeCompare(b.fecha_vencimiento ?? ""));
  const porCobrar = cobranza.reduce((suma, servicio) => suma + Number(servicio.precio_mensual ?? 0), 0);

  const kpis = [
    {
      label: "Empresas activas",
      valor: String(empresas.filter((empresa) => empresa.estado === "Activo").length),
      detalle: `${empresas.length} registradas`,
    },
    { label: "Servicios activos", valor: String(activos.length), detalle: "En empresas activas" },
    {
      label: "Ingreso mensual",
      valor: formatoDinero(ingresoMensual),
      detalle: sinPrecio > 0 ? `${sinPrecio} servicio(s) sin precio` : "Suma de servicios activos",
    },
    {
      label: `Por cobrar (${DIAS_COBRANZA} días)`,
      valor: formatoDinero(porCobrar),
      detalle: `${cobranza.length} vencimientos`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div className="space-y-1 bg-card p-4" key={kpi.label}>
            <p className="text-muted-foreground text-sm">{kpi.label}</p>
            <p className="font-semibold text-2xl tabular-nums tracking-tight">{kpi.valor}</p>
            <p className="text-muted-foreground text-xs">{kpi.detalle}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6 xl:col-span-3">
          <div>
            <h2 className="font-semibold text-lg">Cobranza próxima</h2>
            <p className="text-muted-foreground text-sm">
              Servicios vencidos o que vencen en los próximos {DIAS_COBRANZA} días.
            </p>
          </div>
          {cobranza.length > 0 ? (
            <ul className="divide-y">
              {cobranza.map((servicio) => {
                const empresa = empresaPorId.get(servicio.empresa_id);
                const vencido = (servicio.fecha_vencimiento ?? "") < hoy;
                const mensaje = `Hola ${empresa?.nombre_negocio}, te recordamos que tu servicio de ${servicioLabel(servicio.servicio)} con Gamalink ${vencido ? "venció" : "vence"} el ${formatoFecha(servicio.fecha_vencimiento)}. ¿Te ayudo con la renovación?`;
                return (
                  <li
                    className="flex items-center justify-between gap-3 py-2"
                    key={`${servicio.empresa_id}-${servicio.servicio}`}
                  >
                    <Link className="min-w-0 hover:underline" href={`/dashboard/empresas/${servicio.empresa_id}`}>
                      <span className="block truncate font-medium text-sm">{empresa?.nombre_negocio}</span>
                      <span className="block text-muted-foreground text-xs">
                        {servicioLabel(servicio.servicio)} · {formatoDinero(servicio.precio_mensual)} ·{" "}
                        {formatoFecha(servicio.fecha_vencimiento)}
                      </span>
                    </Link>
                    <div className="flex shrink-0 items-center gap-2">
                      {vencido ? <Badge className="bg-destructive/10 text-destructive">Vencido</Badge> : null}
                      {empresa?.contacto_telefono ? (
                        <a
                          aria-label={`Escribir a ${empresa.nombre_negocio} por WhatsApp`}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          href={whatsappUrl(empresa.contacto_telefono, mensaje)}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <MessageCircle className="size-4" />
                        </a>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              Nada por cobrar. Pon la fecha de vencimiento de cada servicio en el panel de Empresas para verlo aquí.
            </p>
          )}
        </section>

        <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6 xl:col-span-2">
          <h2 className="font-semibold text-lg">Servicios contratados</h2>
          <ul className="divide-y">
            {SERVICIOS.map((servicio) => {
              const deEste = activos.filter((s) => s.servicio === servicio.key);
              return (
                <li className="flex items-center justify-between gap-2 py-2 text-sm" key={servicio.key}>
                  <span>{servicio.label}</span>
                  <span className="text-muted-foreground">
                    {deEste.length} {deEste.length === 1 ? "empresa" : "empresas"} ·{" "}
                    <span className="text-foreground tabular-nums">
                      {formatoDinero(deEste.reduce((suma, s) => suma + Number(s.precio_mensual ?? 0), 0))}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <Link className={buttonVariants({ size: "sm", variant: "outline" })} href="/dashboard/empresas">
            <Building2 />
            Ir a empresas
          </Link>
        </section>
      </div>
    </div>
  );
}
