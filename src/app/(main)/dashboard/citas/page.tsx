import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  CITA_COLUMNS,
  type Cita,
  DIAS_SEMANA,
  diaSemana,
  ESTADO_CITA_CLASS,
  ESTADO_CITA_LABEL,
  ESTADOS_ACTIVOS,
  horaMx,
  type ServicioAgenda,
} from "@/lib/citas";
import { resolverEmpresa } from "@/lib/empresa-actual";
import { diaMx, formatoDinero, formatoFecha, hoyMx, inicioDiaMx, sumarDias } from "@/lib/formato";
import { createSupabaseServerClient } from "@/lib/sb/server";

import { CitaAcciones, NuevaCitaForm } from "./_components/forms";
import { conEmpresa, ModuloHeader, SinEmpresa } from "./_components/modulo-header";

export const metadata: Metadata = { title: "Citas" };

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string; fecha?: string }>;
}) {
  const { empresa: empresaParam, fecha: fechaParam } = await searchParams;
  const { empresa, opciones } = await resolverEmpresa("citas", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const hoy = hoyMx();
  const fecha = fechaParam && /^\d{4}-\d{2}-\d{2}$/.test(fechaParam) ? fechaParam : hoy;
  // Semana de lunes a domingo que contiene la fecha elegida.
  const lunes = sumarDias(fecha, -((Number(diaSemana(fecha)) + 6) % 7));
  const inicioMes = `${hoy.slice(0, 7)}-01`;

  const supabase = await createSupabaseServerClient();
  const [{ data: semanaData }, { data: mesData }, { data: serviciosData }] = await Promise.all([
    supabase
      .from("gl_agenda_citas")
      .select(CITA_COLUMNS)
      .eq("empresa_id", empresa.id)
      .gte("inicio", inicioDiaMx(lunes))
      .lt("inicio", inicioDiaMx(sumarDias(lunes, 7)))
      .order("inicio"),
    supabase
      .from("gl_agenda_citas")
      .select("estado, precio")
      .eq("empresa_id", empresa.id)
      .gte("inicio", inicioDiaMx(inicioMes))
      .lt("inicio", inicioDiaMx(sumarDias(hoy, 1))),
    supabase
      .from("gl_agenda_servicios")
      .select("id, nombre, duracion_min, precio, activo")
      .eq("empresa_id", empresa.id)
      .eq("activo", true)
      .order("nombre"),
  ]);

  const semana = ((semanaData ?? []) as Cita[]).map((cita) => ({ ...cita, dia: diaMx(cita.inicio) }));
  const citasDia = semana.filter((cita) => cita.dia === fecha);
  const activasDia = citasDia.filter((cita) => ESTADOS_ACTIVOS.includes(cita.estado));
  const servicios = (serviciosData ?? []) as ServicioAgenda[];

  const mes = mesData ?? [];
  const atendidas = mes.filter((cita) => cita.estado === "completada");
  const faltas = mes.filter((cita) => cita.estado === "no_asistio").length;
  const ingresosMes = atendidas.reduce((suma, cita) => suma + Number(cita.precio), 0);
  const tasaFaltas = atendidas.length + faltas > 0 ? Math.round((faltas / (atendidas.length + faltas)) * 100) : null;

  const kpis = [
    {
      label: fecha === hoy ? "Citas hoy" : `Citas el ${formatoFecha(fecha)}`,
      valor: String(activasDia.length),
      detalle: `${citasDia.filter((c) => c.estado === "completada").length} atendidas`,
    },
    {
      label: "Esta semana",
      valor: String(semana.filter((cita) => cita.estado !== "cancelada").length),
      detalle: "Sin contar canceladas",
    },
    { label: "Ingresos del mes", valor: formatoDinero(ingresosMes), detalle: `${atendidas.length} citas atendidas` },
    {
      label: "No asistieron",
      valor: tasaFaltas === null ? "—" : `${tasaFaltas}%`,
      detalle: `${faltas} en el mes`,
    },
  ];

  const hrefFecha = (dia: string) => conEmpresa(`/dashboard/citas?fecha=${dia}`, empresa.id);

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <ModuloHeader actual="agenda" empresa={empresa} opciones={opciones} />

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div className="space-y-1 bg-card p-4" key={kpi.label}>
            <p className="text-muted-foreground text-sm">{kpi.label}</p>
            <p className="font-semibold text-2xl tabular-nums tracking-tight">{kpi.valor}</p>
            <p className="text-muted-foreground text-xs">{kpi.detalle}</p>
          </div>
        ))}
      </div>

      {servicios.length > 0 ? (
        <NuevaCitaForm empresaId={empresa.id} fechaInicial={fecha < hoy ? hoy : fecha} servicios={servicios} />
      ) : (
        <p className="rounded-lg border bg-muted/30 p-3 text-sm">
          Primero crea al menos un servicio en{" "}
          <Link className="font-medium underline" href={conEmpresa("/dashboard/citas/servicios", empresa.id)}>
            Servicios
          </Link>{" "}
          para poder agendar.
        </p>
      )}

      <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <Link
            aria-label="Semana anterior"
            className={buttonVariants({ size: "icon", variant: "outline" })}
            href={hrefFecha(sumarDias(lunes, -7))}
          >
            <ChevronLeft />
          </Link>
          <nav aria-label="Días de la semana" className="grid flex-1 grid-cols-7 gap-1">
            {DIAS_SEMANA.map((dia, i) => {
              const diaFecha = sumarDias(lunes, i);
              const total = semana.filter(
                (cita) => cita.dia === diaFecha && ESTADOS_ACTIVOS.includes(cita.estado),
              ).length;
              return (
                <Link
                  aria-current={diaFecha === fecha ? "date" : undefined}
                  className="flex flex-col items-center rounded-lg border border-transparent py-1.5 text-xs transition-colors hover:bg-muted aria-[current]:border-primary aria-[current]:bg-primary/10"
                  href={hrefFecha(diaFecha)}
                  key={dia.key}
                >
                  <span className="text-muted-foreground">{dia.corto}</span>
                  <span className={`font-semibold text-base ${diaFecha === hoy ? "text-primary" : ""}`}>
                    {Number(diaFecha.slice(8))}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {total > 0 ? `${total} cita${total > 1 ? "s" : ""}` : "·"}
                  </span>
                </Link>
              );
            })}
          </nav>
          <Link
            aria-label="Semana siguiente"
            className={buttonVariants({ size: "icon", variant: "outline" })}
            href={hrefFecha(sumarDias(lunes, 7))}
          >
            <ChevronRight />
          </Link>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t pt-4">
          <h2 className="font-semibold text-lg capitalize">
            {new Date(`${fecha}T12:00:00Z`).toLocaleDateString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: "UTC",
            })}
          </h2>
          {fecha !== hoy ? (
            <Link className="text-primary text-sm hover:underline" href={hrefFecha(hoy)}>
              Ir a hoy
            </Link>
          ) : null}
        </div>

        {citasDia.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {citasDia.map((cita) => (
              <li
                className="flex flex-wrap items-center justify-between gap-3 p-3 data-[inactiva=true]:opacity-60"
                data-inactiva={!ESTADOS_ACTIVOS.includes(cita.estado) && cita.estado !== "completada"}
                key={cita.id}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="w-14 shrink-0 text-right">
                    <p className="font-semibold tabular-nums">{horaMx(cita.inicio)}</p>
                    <p className="text-muted-foreground text-xs tabular-nums">{horaMx(cita.fin)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-sm">
                      {cita.cliente_nombre}
                      <Badge className={ESTADO_CITA_CLASS[cita.estado]}>{ESTADO_CITA_LABEL[cita.estado]}</Badge>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {cita.servicio_nombre} · {formatoDinero(cita.precio)}
                      {cita.cliente_telefono ? ` · ${cita.cliente_telefono}` : ""}
                    </p>
                    {cita.notas ? <p className="mt-1 text-muted-foreground text-xs italic">{cita.notas}</p> : null}
                  </div>
                </div>
                <CitaAcciones cita={cita} empresaId={empresa.id} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No hay citas este día.</p>
        )}
      </section>
    </main>
  );
}
