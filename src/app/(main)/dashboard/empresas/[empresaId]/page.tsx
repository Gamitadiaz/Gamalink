import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { SERVICIOS, type ServicioRow } from "@/lib/empresas";
import { createSupabaseServerClient } from "@/lib/sb/server";

import { EmpresaDatosForm, InvitarDuenoForm, ServicioForm } from "../_components/forms";

export const metadata: Metadata = {
  title: "Empresa",
};

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Superadmin",
  dueno: "Dueño",
  empleado: "Empleado",
};

export default async function EmpresaPage({ params }: { params: Promise<{ empresaId: string }> }) {
  const { empresaId: rawId } = await params;
  const empresaId = Number(rawId);
  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: empresa }, { data: servicios }, { data: usuarios }, { data: landings }] = await Promise.all([
    supabase.from("gl_empresas").select("id, nombre_negocio, estado, created_at").eq("id", empresaId).maybeSingle(),
    supabase
      .from("gl_empresa_servicios")
      .select("servicio, estado, precio_mensual, fecha_vencimiento")
      .eq("empresa_id", empresaId),
    supabase
      .from("gl_usuarios")
      .select("id, nombre, correo, role_slug, auth_id")
      .eq("empresa_id", empresaId)
      .order("nombre"),
    supabase.from("gl_landings").select("id, slug, status").eq("empresa_id", empresaId),
  ]);

  if (!empresa) {
    notFound();
  }

  const serviciosRows = (servicios ?? []) as ServicioRow[];

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <Link
        className="inline-flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        href="/dashboard/empresas"
      >
        <ArrowLeft className="size-4" />
        Volver a empresas
      </Link>

      <header>
        <h1 className="font-semibold text-2xl">{empresa.nombre_negocio}</h1>
        <p className="text-muted-foreground">
          Cliente desde {new Date(empresa.created_at).toLocaleDateString("es-MX", { dateStyle: "long" })}
        </p>
      </header>

      <EmpresaDatosForm empresaId={empresa.id} estado={empresa.estado ?? "Activo"} nombre={empresa.nombre_negocio} />

      <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
        <div>
          <h2 className="font-semibold text-lg">Servicios</h2>
          <p className="text-muted-foreground text-sm">
            Lo que esté activo es lo que el dueño ve en su menú. Pausar un servicio lo oculta sin borrar sus datos.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {SERVICIOS.map((servicio) => (
            <ServicioForm
              actual={serviciosRows.find((row) => row.servicio === servicio.key)}
              empresaId={empresa.id}
              key={servicio.key}
              servicio={servicio.key}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
        <h2 className="font-semibold text-lg">Usuarios</h2>
        {usuarios && usuarios.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {usuarios.map((usuario) => (
              <li className="flex flex-wrap items-center justify-between gap-2 p-3" key={usuario.id}>
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{usuario.nombre}</p>
                  <p className="truncate text-muted-foreground text-xs">{usuario.correo}</p>
                </div>
                <div className="flex items-center gap-2">
                  {usuario.auth_id ? null : <Badge variant="outline">Sin cuenta</Badge>}
                  <Badge variant="secondary">{ROLE_LABELS[usuario.role_slug] ?? usuario.role_slug}</Badge>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Esta empresa aún no tiene usuarios.</p>
        )}
        <InvitarDuenoForm empresaId={empresa.id} />
      </section>

      {landings && landings.length > 0 ? (
        <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6">
          <h2 className="font-semibold text-lg">Landing pages</h2>
          <ul className="flex flex-wrap gap-2">
            {landings.map((landing) => (
              <li key={landing.id}>
                <Link
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted/50"
                  href={`/dashboard/configuration/${landing.id}`}
                >
                  {landing.slug}
                  <span className="text-muted-foreground text-xs">
                    {landing.status === "published" ? "Publicada" : "Borrador"}
                  </span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
