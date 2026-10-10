import Link from "next/link";

import { ChevronRight, Search } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { resolverEmpresa } from "@/lib/empresa-actual";
import {
  ESTADO_SOCIO_CLASS,
  ESTADO_SOCIO_LABEL,
  type EstadoSocio,
  estadoSocio,
  formatoFecha,
  hoyMx,
  type PlanMembresia,
  type SocioResumen,
} from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";

import { NuevoSocioForm } from "../_components/forms";
import { conEmpresa, ModuloHeader, SinEmpresa } from "../_components/modulo-header";

export const metadata: Metadata = { title: "Socios" };

const FILTROS: { key: EstadoSocio | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "activo", label: "Activos" },
  { key: "por_vencer", label: "Por vencer" },
  { key: "vencido", label: "Vencidos" },
  { key: "sin_pagos", label: "Sin pagos" },
  { key: "baja", label: "Bajas" },
];

export default async function SociosPage({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string; q?: string; estado?: string }>;
}) {
  const { empresa: empresaParam, q = "", estado: filtro = "todos" } = await searchParams;
  const { empresa, opciones } = await resolverEmpresa("membresias", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const supabase = await createSupabaseServerClient();
  const [{ data: sociosData }, { data: planesData }] = await Promise.all([
    supabase.from("gl_socios_resumen").select("*").eq("empresa_id", empresa.id).order("nombre"),
    supabase
      .from("gl_planes_membresia")
      .select("id, nombre, precio, duracion_dias, activo")
      .eq("empresa_id", empresa.id)
      .order("precio"),
  ]);

  const hoy = hoyMx();
  const busqueda = q.trim().toLowerCase();
  const socios = ((sociosData ?? []) as SocioResumen[])
    .map((socio) => ({ ...socio, estado: estadoSocio(socio, hoy) }))
    .filter((socio) => {
      // "Activos" incluye a los que están por vencer: siguen pagados.
      const coincideEstado =
        filtro === "todos" || socio.estado === filtro || (filtro === "activo" && socio.estado === "por_vencer");
      const coincideBusqueda =
        !busqueda ||
        socio.nombre.toLowerCase().includes(busqueda) ||
        (socio.telefono ?? "").includes(busqueda) ||
        (socio.correo ?? "").toLowerCase().includes(busqueda);
      return coincideEstado && coincideBusqueda;
    });
  const planes = (planesData ?? []) as PlanMembresia[];

  const hrefFiltro = (key: string) => {
    const params = new URLSearchParams({ empresa: String(empresa.id) });
    if (key !== "todos") params.set("estado", key);
    if (q) params.set("q", q);
    return `/dashboard/membresias/socios?${params}`;
  };

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <ModuloHeader actual="socios" empresa={empresa} opciones={opciones} />

      {planes.some((plan) => plan.activo) ? (
        <NuevoSocioForm empresaId={empresa.id} planes={planes} />
      ) : (
        <p className="rounded-lg border bg-muted/30 p-3 text-sm">
          Primero crea al menos un plan en{" "}
          <Link className="font-medium underline" href={conEmpresa("/dashboard/membresias/planes", empresa.id)}>
            Planes
          </Link>{" "}
          para poder registrar pagos.
        </p>
      )}

      <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-1.5">
            {FILTROS.map((item) => (
              <Link
                aria-current={item.key === filtro ? "true" : undefined}
                className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted aria-[current]:border-primary aria-[current]:bg-primary/10"
                href={hrefFiltro(item.key)}
                key={item.key}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action="/dashboard/membresias/socios" className="relative w-full sm:w-64">
            <input name="empresa" type="hidden" value={empresa.id} />
            {filtro !== "todos" ? <input name="estado" type="hidden" value={filtro} /> : null}
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar socio"
              className="pl-8"
              defaultValue={q}
              name="q"
              placeholder="Buscar por nombre o teléfono"
              type="search"
            />
          </form>
        </div>

        {socios.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {socios.map((socio) => (
              <li key={socio.id}>
                <Link
                  className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/50"
                  href={conEmpresa(`/dashboard/membresias/socios/${socio.id}`, empresa.id)}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">{socio.nombre}</p>
                    <p className="truncate text-muted-foreground text-xs">
                      {socio.vigente_hasta ? `Vence ${formatoFecha(socio.vigente_hasta)}` : "Sin pagos"}
                      {socio.telefono ? ` · ${socio.telefono}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className={ESTADO_SOCIO_CLASS[socio.estado]}>{ESTADO_SOCIO_LABEL[socio.estado]}</Badge>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            {busqueda || filtro !== "todos" ? "Ningún socio coincide con el filtro." : "Aún no hay socios."}
          </p>
        )}
      </section>
    </main>
  );
}
