import Link from "next/link";
import { redirect } from "next/navigation";

import { Building2, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app-config";
import { type ServicioRow, servicioLabel } from "@/lib/empresas";
import { formatoDinero, formatoFecha } from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { getSessionContext } from "@/lib/session";

import { CerrarTodasLasSesiones, NombreForm, PasswordForm } from "./_components/cuenta-forms";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

const ROLE_LABELS = { superadmin: "Superadministrador", dueno: "Dueño", empleado: "Empleado" } as const;

const ESTADO_CLASS: Record<string, string> = {
  activo: "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  pausado: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  cancelado: "bg-muted text-muted-foreground",
};

function Seccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <div>
        <h2 className="font-semibold text-lg">{titulo}</h2>
        {descripcion ? <p className="text-muted-foreground text-sm">{descripcion}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default async function MiCuentaPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const { user, role, empresas } = session;
  const metadata = user.user_metadata as Record<string, unknown>;
  const supabase = await createSupabaseServerClient();

  const [{ data: fila }, { data: serviciosData }] = await Promise.all([
    supabase.from("gl_usuarios").select("nombre").eq("auth_id", user.id).maybeSingle(),
    empresas.length > 0
      ? supabase
          .from("gl_empresa_servicios")
          .select("empresa_id, servicio, estado, precio_mensual, fecha_vencimiento")
          .in(
            "empresa_id",
            empresas.map((empresa) => empresa.id),
          )
          .order("servicio")
      : Promise.resolve({ data: [] }),
  ]);

  const nombre =
    fila?.nombre ??
    (typeof metadata.full_name === "string" ? metadata.full_name : null) ??
    (typeof metadata.name === "string" ? metadata.name : null) ??
    "";
  const servicios = (serviciosData ?? []) as (ServicioRow & { empresa_id: number })[];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-6">
      <header>
        <h1 className="font-semibold text-2xl">Mi cuenta</h1>
        <p className="text-muted-foreground">Tus datos de acceso a Gamalink.</p>
      </header>

      <Seccion titulo="Mis datos">
        <NombreForm nombre={nombre} />
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Correo</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Rol</dt>
            <dd className="font-medium">{ROLE_LABELS[role]}</dd>
          </div>
        </dl>
      </Seccion>

      <Seccion titulo="Seguridad">
        <PasswordForm />
        <div className="border-t pt-4">
          <CerrarTodasLasSesiones />
        </div>
      </Seccion>

      {role === "superadmin" ? (
        <Seccion descripcion="Administra a tus clientes, sus servicios y sus accesos." titulo="Gamalink">
          <Link className={buttonVariants({ variant: "outline" })} href="/dashboard/empresas">
            <Building2 />
            Ir al panel de empresas
          </Link>
        </Seccion>
      ) : (
        empresas.map((empresa) => {
          const serviciosEmpresa = servicios.filter((s) => s.empresa_id === empresa.id);
          const mensaje = `Hola Gamalink, soy de ${empresa.nombre} y me interesa agregar un servicio.`;

          return (
            <Seccion
              descripcion="Servicios que tienes contratados con Gamalink."
              key={empresa.id}
              titulo={empresa.nombre}
            >
              {serviciosEmpresa.length > 0 ? (
                <ul className="divide-y rounded-lg border">
                  {serviciosEmpresa.map((servicio) => (
                    <li className="flex flex-wrap items-center justify-between gap-2 p-3" key={servicio.servicio}>
                      <div>
                        <p className="font-medium text-sm">{servicioLabel(servicio.servicio)}</p>
                        <p className="text-muted-foreground text-xs">
                          {servicio.precio_mensual !== null
                            ? `${formatoDinero(servicio.precio_mensual)} al mes`
                            : "Precio por definir"}
                          {servicio.fecha_vencimiento ? ` · Vence ${formatoFecha(servicio.fecha_vencimiento)}` : ""}
                        </p>
                      </div>
                      <Badge className={ESTADO_CLASS[servicio.estado]}>{servicio.estado}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Aún no tienes servicios contratados.</p>
              )}
              <a
                className={buttonVariants({ variant: "outline" })}
                href={`https://wa.me/${APP_CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle />
                ¿Quieres agregar un servicio? Escríbenos
              </a>
            </Seccion>
          );
        })
      )}
    </main>
  );
}
