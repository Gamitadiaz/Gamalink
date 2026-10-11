import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { getSessionContext } from "@/lib/session";

import { InicioNegocio } from "./_components/inicio-negocio";
import { InicioSuperadmin } from "./_components/inicio-superadmin";
import { Encabezado } from "./_components/ui";

export const metadata: Metadata = {
  title: "Inicio",
};

export default async function InicioPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const metadata = session.user.user_metadata as Record<string, unknown>;
  const nombreCompleto =
    (typeof metadata.full_name === "string" && metadata.full_name) || session.user.email?.split("@")[0] || "";
  const nombre = nombreCompleto.split(" ")[0];

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      {session.role === "superadmin" ? (
        <>
          <Encabezado nombre={nombre} subtitulo="Resumen de Gamalink" />
          <InicioSuperadmin />
        </>
      ) : (
        <>
          <Encabezado
            nombre={nombre}
            subtitulo={session.empresas.length === 1 ? session.empresas[0].nombre : undefined}
          />
          <InicioNegocio empresas={session.empresas} />
        </>
      )}
    </main>
  );
}
