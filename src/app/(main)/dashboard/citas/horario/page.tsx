import type { Metadata } from "next";

import { obtenerConfig } from "@/lib/citas-server";
import { resolverEmpresa } from "@/lib/empresa-actual";
import { createSupabaseServerClient } from "@/lib/sb/server";

import { HorarioForm } from "../_components/forms";
import { ModuloHeader, SinEmpresa } from "../_components/modulo-header";

export const metadata: Metadata = { title: "Horario" };

export default async function HorarioPage({ searchParams }: { searchParams: Promise<{ empresa?: string }> }) {
  const { empresa: empresaParam } = await searchParams;
  const { empresa, opciones } = await resolverEmpresa("citas", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const supabase = await createSupabaseServerClient();
  const config = await obtenerConfig(supabase, empresa.id);

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <ModuloHeader actual="horario" empresa={empresa} opciones={opciones} />
      <HorarioForm config={config} empresaId={empresa.id} />
    </main>
  );
}
