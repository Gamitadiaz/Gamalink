import Link from "next/link";

import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { resolverEmpresa } from "@/lib/empresa-actual";
import {
  DIAS_AVISO,
  diasEntre,
  ESTADO_SOCIO_CLASS,
  ESTADO_SOCIO_LABEL,
  estadoSocio,
  formatoDinero,
  formatoFecha,
  hoyMx,
  type SocioResumen,
} from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";

import { IngresosChart } from "./_components/ingresos-chart";
import { conEmpresa, ModuloHeader, SinEmpresa } from "./_components/modulo-header";

export const metadata: Metadata = { title: "Membresías" };

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function whatsappLink(telefono: string, nombre: string, vence: string | null) {
  const digitos = telefono.replace(/\D/g, "");
  const numero = digitos.length === 10 ? `52${digitos}` : digitos;
  const mensaje = vence
    ? `Hola ${nombre}, te recordamos que tu membresía vence el ${formatoFecha(vence)}. ¡Te esperamos!`
    : `Hola ${nombre}, ¿te gustaría renovar tu membresía?`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export default async function MembresiasResumenPage({ searchParams }: { searchParams: Promise<{ empresa?: string }> }) {
  const { empresa: empresaParam } = await searchParams;
  const { empresa, opciones } = await resolverEmpresa("membresias", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const hoy = hoyMx();
  const [anio, mes] = hoy.split("-").map(Number);
  const inicioRango = new Date(Date.UTC(anio, mes - 1 - 5, 1)).toISOString().slice(0, 10);

  const supabase = await createSupabaseServerClient();
  const [{ data: sociosData }, { data: pagosData }] = await Promise.all([
    supabase.from("gl_socios_resumen").select("*").eq("empresa_id", empresa.id),
    supabase
      .from("gl_pagos_socios")
      .select("id, socio_id, monto, fecha_pago, metodo")
      .eq("empresa_id", empresa.id)
      .gte("fecha_pago", inicioRango)
      .order("fecha_pago", { ascending: false })
      .order("id", { ascending: false }),
  ]);

  const socios = (sociosData ?? []) as SocioResumen[];
  const pagos = pagosData ?? [];
  const conEstado = socios.map((socio) => ({ ...socio, estado: estadoSocio(socio, hoy) }));
  const cuenta = (estado: string) => conEstado.filter((socio) => socio.estado === estado).length;
  const activos = cuenta("activo") + cuenta("por_vencer");

  // Ingresos por mes, últimos 6 meses (incluye el actual).
  const meses = Array.from({ length: 6 }, (_, i) => {
    const fecha = new Date(Date.UTC(anio, mes - 1 - 5 + i, 1));
    return { clave: fecha.toISOString().slice(0, 7), mes: MESES[fecha.getUTCMonth()], ingresos: 0 };
  });
  for (const pago of pagos) {
    const fila = meses.find((m) => m.clave === pago.fecha_pago.slice(0, 7));
    if (fila) fila.ingresos += Number(pago.monto);
  }
  const ingresosMes = meses[5].ingresos;
  const ingresosAnterior = meses[4].ingresos;
  const variacion =
    ingresosAnterior > 0 ? Math.round(((ingresosMes - ingresosAnterior) / ingresosAnterior) * 100) : null;

  // Por vencer (próximos días) y vencidos hace poco: a quién escribirle hoy.
  const seguimiento = conEstado
    .filter(
      (socio) =>
        socio.estado === "por_vencer" ||
        (socio.estado === "vencido" && socio.vigente_hasta && diasEntre(socio.vigente_hasta, hoy) <= 30),
    )
    .sort((a, b) => (a.vigente_hasta ?? "").localeCompare(b.vigente_hasta ?? ""));

  const nombrePorId = new Map(socios.map((socio) => [socio.id, socio.nombre]));
  const ultimosPagos = pagos.slice(0, 6);

  const kpis = [
    {
      label: "Socios activos",
      valor: String(activos),
      detalle: `${socios.filter((s) => s.activo).length} registrados`,
    },
    { label: "Por vencer", valor: String(cuenta("por_vencer")), detalle: `En los próximos ${DIAS_AVISO} días` },
    { label: "Vencidos", valor: String(cuenta("vencido")), detalle: "Sin renovar" },
    {
      label: "Ingresos del mes",
      valor: formatoDinero(ingresosMes),
      detalle:
        variacion === null
          ? `${formatoDinero(ingresosAnterior)} el mes pasado`
          : `${variacion >= 0 ? "+" : ""}${variacion}% vs. mes pasado`,
    },
  ];

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <ModuloHeader actual="resumen" empresa={empresa} opciones={opciones} />

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div className="space-y-1 bg-card p-4" key={kpi.label}>
            <p className="text-muted-foreground text-sm">{kpi.label}</p>
            <p className="font-semibold text-2xl tabular-nums tracking-tight">{kpi.valor}</p>
            <p className="text-muted-foreground text-xs">{kpi.detalle}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6 xl:col-span-3">
          <div>
            <h2 className="font-semibold text-lg">Ingresos por mes</h2>
            <p className="text-muted-foreground text-sm">Pagos registrados en los últimos 6 meses.</p>
          </div>
          <IngresosChart data={meses.map(({ mes: m, ingresos }) => ({ mes: m, ingresos }))} />
        </section>

        <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6 xl:col-span-2">
          <div>
            <h2 className="font-semibold text-lg">Para dar seguimiento</h2>
            <p className="text-muted-foreground text-sm">Por vencer y vencidos en los últimos 30 días.</p>
          </div>
          {seguimiento.length > 0 ? (
            <ul className="divide-y">
              {seguimiento.slice(0, 8).map((socio) => (
                <li className="flex items-center justify-between gap-2 py-2" key={socio.id}>
                  <Link
                    className="min-w-0 hover:underline"
                    href={conEmpresa(`/dashboard/membresias/socios/${socio.id}`, empresa.id)}
                  >
                    <span className="block truncate font-medium text-sm">{socio.nombre}</span>
                    <span className="block text-muted-foreground text-xs">
                      Vence {formatoFecha(socio.vigente_hasta)}
                    </span>
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className={ESTADO_SOCIO_CLASS[socio.estado]}>{ESTADO_SOCIO_LABEL[socio.estado]}</Badge>
                    {socio.telefono ? (
                      <a
                        aria-label={`Escribir a ${socio.nombre} por WhatsApp`}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        href={whatsappLink(socio.telefono, socio.nombre, socio.vigente_hasta)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <MessageCircle className="size-4" />
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Nadie por vencer. 🎉</p>
          )}
        </section>
      </div>

      <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6">
        <h2 className="font-semibold text-lg">Últimos pagos</h2>
        {ultimosPagos.length > 0 ? (
          <ul className="divide-y">
            {ultimosPagos.map((pago) => (
              <li className="flex items-center justify-between gap-2 py-2 text-sm" key={pago.id}>
                <Link
                  className="truncate hover:underline"
                  href={conEmpresa(`/dashboard/membresias/socios/${pago.socio_id}`, empresa.id)}
                >
                  {nombrePorId.get(pago.socio_id) ?? "Socio"}
                </Link>
                <span className="shrink-0 text-muted-foreground">
                  {formatoFecha(pago.fecha_pago)} ·{" "}
                  <span className="text-foreground tabular-nums">{formatoDinero(pago.monto)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Aún no hay pagos registrados.</p>
        )}
      </section>
    </main>
  );
}
