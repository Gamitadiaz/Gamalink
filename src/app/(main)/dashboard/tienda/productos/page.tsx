import Link from "next/link";

import { ChevronRight, Search } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { resolverEmpresa } from "@/lib/empresa-actual";
import { formatoDinero } from "@/lib/formato";
import { createSupabaseServerClient } from "@/lib/sb/server";
import {
  ESTADO_STOCK_CLASS,
  ESTADO_STOCK_LABEL,
  type EstadoStock,
  estadoStock,
  formatoCantidad,
  PRODUCTO_COLUMNS,
  type Producto,
} from "@/lib/tienda";

import { BotonExportar } from "../../_components/modulo/acciones";
import { NuevoProductoForm } from "../_components/forms";
import { conEmpresa, ModuloHeader, SinEmpresa } from "../_components/modulo-header";

export const metadata: Metadata = { title: "Productos" };

const FILTROS: { key: string; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "surtir", label: "Por surtir" },
  { key: "inactivos", label: "Desactivados" },
];

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string; q?: string; filtro?: string }>;
}) {
  const { empresa: empresaParam, q = "", filtro = "todos" } = await searchParams;
  const { empresa, opciones } = await resolverEmpresa("tienda", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("gl_productos")
    .select(PRODUCTO_COLUMNS)
    .eq("empresa_id", empresa.id)
    .order("nombre");
  const todos = (data ?? []) as Producto[];
  const categorias = [...new Set(todos.map((p) => p.categoria).filter((c): c is string => Boolean(c)))].sort();

  const busqueda = q.trim().toLowerCase();
  const productos = todos
    .map((producto) => ({ ...producto, estado: estadoStock(producto) as EstadoStock }))
    .filter((producto) => {
      if (filtro === "inactivos") return !producto.activo;
      if (!producto.activo) return false;
      if (filtro === "surtir" && producto.estado === "ok") return false;
      return (
        !busqueda ||
        producto.nombre.toLowerCase().includes(busqueda) ||
        (producto.codigo ?? "").toLowerCase().includes(busqueda) ||
        (producto.categoria ?? "").toLowerCase().includes(busqueda)
      );
    });

  const hrefFiltro = (key: string) => {
    const params = new URLSearchParams({ empresa: String(empresa.id) });
    if (key !== "todos") params.set("filtro", key);
    if (q) params.set("q", q);
    return `/dashboard/tienda/productos?${params}`;
  };

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <ModuloHeader
        acciones={
          <BotonExportar href={`/dashboard/tienda/exportar?tipo=productos&empresa=${empresa.id}`}>
            Exportar productos
          </BotonExportar>
        }
        actual="productos"
        empresa={empresa}
        opciones={opciones}
      />

      <NuevoProductoForm categorias={categorias} empresaId={empresa.id} />

      <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Filtrar productos" className="flex flex-wrap gap-1.5">
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
          <form action="/dashboard/tienda/productos" className="relative w-full sm:w-64">
            <input name="empresa" type="hidden" value={empresa.id} />
            {filtro !== "todos" ? <input name="filtro" type="hidden" value={filtro} /> : null}
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar producto"
              className="pl-8"
              defaultValue={q}
              name="q"
              placeholder="Nombre, código o categoría"
              type="search"
            />
          </form>
        </div>

        {productos.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {productos.map((producto) => (
              <li key={producto.id}>
                <Link
                  className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/50"
                  href={conEmpresa(`/dashboard/tienda/productos/${producto.id}`, empresa.id)}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">{producto.nombre}</p>
                    <p className="truncate text-muted-foreground text-xs">
                      {formatoDinero(producto.precio)}
                      {producto.categoria ? ` · ${producto.categoria}` : ""}
                      {` · ${formatoCantidad(producto.stock, producto.unidad)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {producto.activo ? (
                      <Badge className={ESTADO_STOCK_CLASS[producto.estado]}>
                        {ESTADO_STOCK_LABEL[producto.estado]}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Desactivado</Badge>
                    )}
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            {todos.length === 0 ? "Aún no hay productos." : "Ningún producto coincide con el filtro."}
          </p>
        )}
      </section>
    </main>
  );
}
