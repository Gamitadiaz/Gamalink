import Link from "next/link";

import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { servicioLabel } from "@/lib/empresas";
import { createSupabaseServerClient } from "@/lib/sb/server";

import { NuevaEmpresaForm } from "./_components/forms";

export const metadata: Metadata = {
  title: "Empresas",
};

export default async function EmpresasPage() {
  // El proxy ya restringe esta ruta al superadmin; RLS vuelve a filtrar en la base de datos.
  const supabase = await createSupabaseServerClient();
  const [{ data: empresas, error }, { data: servicios }, { data: usuarios }] = await Promise.all([
    supabase.from("gl_empresas").select("id, nombre_negocio, estado, created_at").order("nombre_negocio"),
    supabase.from("gl_empresa_servicios").select("empresa_id, servicio, estado"),
    supabase.from("gl_usuarios").select("empresa_id"),
  ]);

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-semibold text-2xl">Empresas</h1>
          <p className="text-muted-foreground">Tus clientes, sus servicios y quién tiene acceso.</p>
        </div>
      </header>

      <NuevaEmpresaForm />

      {error ? (
        <p
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-destructive text-sm"
          role="alert"
        >
          No se pudieron cargar las empresas: {error.message}
        </p>
      ) : null}

      {empresas && empresas.length > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          {empresas.map((empresa) => {
            const serviciosEmpresa = (servicios ?? []).filter((s) => s.empresa_id === empresa.id);
            const totalUsuarios = (usuarios ?? []).filter((u) => u.empresa_id === empresa.id).length;

            return (
              <Link
                className="flex items-center justify-between gap-4 border-b p-4 transition-colors last:border-b-0 hover:bg-muted/50"
                href={`/dashboard/empresas/${empresa.id}`}
                key={empresa.id}
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{empresa.nombre_negocio}</span>
                    {empresa.estado && empresa.estado !== "Activo" ? (
                      <Badge variant="outline">{empresa.estado}</Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {serviciosEmpresa.length > 0 ? (
                      serviciosEmpresa.map((s) => (
                        <Badge key={s.servicio} variant={s.estado === "activo" ? "secondary" : "outline"}>
                          {servicioLabel(s.servicio)}
                          {s.estado === "activo" ? "" : ` · ${s.estado}`}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">Sin servicios</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-muted-foreground text-sm">
                  <span>
                    {totalUsuarios} {totalUsuarios === 1 ? "usuario" : "usuarios"}
                  </span>
                  <ChevronRight className="size-4" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}

      {empresas && empresas.length === 0 ? (
        <p className="text-muted-foreground">Aún no hay empresas. Crea la primera con “Nueva empresa”.</p>
      ) : null}
    </main>
  );
}
