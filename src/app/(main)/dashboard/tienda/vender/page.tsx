import type { Metadata } from "next";

import { resolverEmpresa } from "@/lib/empresa-actual";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { PRODUCTO_COLUMNS, type Producto } from "@/lib/tienda";

import { ModuloHeader, SinEmpresa } from "../_components/modulo-header";
import { PuntoDeVenta } from "../_components/punto-de-venta";

export const metadata: Metadata = { title: "Vender" };

export default async function VenderPage({ searchParams }: { searchParams: Promise<{ empresa?: string }> }) {
  const { empresa: empresaParam } = await searchParams;
  const { empresa, opciones } = await resolverEmpresa("tienda", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("gl_productos")
    .select(PRODUCTO_COLUMNS)
    .eq("empresa_id", empresa.id)
    .eq("activo", true)
    .order("nombre");

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <ModuloHeader actual="vender" empresa={empresa} opciones={opciones} />
      <PuntoDeVenta empresaId={empresa.id} productos={(data ?? []) as Producto[]} />
    </main>
  );
}
