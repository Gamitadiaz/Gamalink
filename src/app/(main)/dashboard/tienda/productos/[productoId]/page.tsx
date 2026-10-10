import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { resolverEmpresa } from "@/lib/empresa-actual";
import { formatoDinero, formatoHora } from "@/lib/formato";
import { createSupabaseServerClient } from "@/lib/sb/server";
import {
  ESTADO_STOCK_CLASS,
  ESTADO_STOCK_LABEL,
  estadoStock,
  formatoCantidad,
  PRODUCTO_COLUMNS,
  type Producto,
  TIPO_MOVIMIENTO_LABEL,
} from "@/lib/tienda";

import { EditarProductoForm, ProductoEstadoButton, StockForm } from "../../_components/forms";
import { conEmpresa, SinEmpresa } from "../../_components/modulo-header";

export const metadata: Metadata = { title: "Producto" };

export default async function ProductoPage({
  params,
  searchParams,
}: {
  params: Promise<{ productoId: string }>;
  searchParams: Promise<{ empresa?: string }>;
}) {
  const [{ productoId: rawId }, { empresa: empresaParam }] = await Promise.all([params, searchParams]);
  const productoId = Number(rawId);
  if (!Number.isInteger(productoId) || productoId <= 0) notFound();

  const { empresa } = await resolverEmpresa("tienda", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const supabase = await createSupabaseServerClient();
  const [{ data: productoData }, { data: movimientos }, { data: categoriasData }] = await Promise.all([
    supabase
      .from("gl_productos")
      .select(PRODUCTO_COLUMNS)
      .eq("id", productoId)
      .eq("empresa_id", empresa.id)
      .maybeSingle(),
    supabase
      .from("gl_movimientos_inventario")
      .select("id, tipo, cantidad, stock_resultante, nota, created_at")
      .eq("producto_id", productoId)
      .eq("empresa_id", empresa.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("gl_productos").select("categoria").eq("empresa_id", empresa.id).not("categoria", "is", null),
  ]);

  if (!productoData) notFound();
  const producto = productoData as Producto;
  const estado = estadoStock(producto);
  const categorias = [...new Set((categoriasData ?? []).map((row) => row.categoria as string))].sort();
  const margen =
    producto.costo !== null && Number(producto.precio) > 0
      ? Math.round(((Number(producto.precio) - Number(producto.costo)) / Number(producto.precio)) * 100)
      : null;

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <Link
        className="inline-flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        href={conEmpresa("/dashboard/tienda/productos", empresa.id)}
      >
        <ArrowLeft className="size-4" />
        Volver a productos
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-2xl">{producto.nombre}</h1>
            {producto.activo ? (
              <Badge className={ESTADO_STOCK_CLASS[estado]}>{ESTADO_STOCK_LABEL[estado]}</Badge>
            ) : (
              <Badge variant="outline">Desactivado</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Hay {formatoCantidad(producto.stock, producto.unidad)} · Precio {formatoDinero(producto.precio)}
            {margen !== null ? ` · Margen ${margen}%` : ""}
          </p>
          {Number(producto.stock) < 0 ? (
            <p className="text-destructive text-sm">
              El stock quedó negativo: se vendió más de lo registrado. Haz un conteo físico para corregirlo.
            </p>
          ) : null}
        </div>
        <ProductoEstadoButton empresaId={empresa.id} producto={producto} />
      </header>

      <StockForm empresaId={empresa.id} producto={producto} />

      <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6">
        <h2 className="font-semibold text-lg">Movimientos de inventario</h2>
        {movimientos && movimientos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground text-xs">
                <tr className="border-b">
                  <th className="py-2 pr-3 font-medium">Fecha</th>
                  <th className="py-2 pr-3 font-medium">Tipo</th>
                  <th className="py-2 pr-3 text-right font-medium">Cambio</th>
                  <th className="py-2 pr-3 text-right font-medium">Quedó</th>
                  <th className="py-2 font-medium">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {movimientos.map((mov) => (
                  <tr key={mov.id}>
                    <td className="whitespace-nowrap py-2 pr-3 text-muted-foreground">
                      {new Date(mov.created_at).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        timeZone: "America/Mexico_City",
                      })}{" "}
                      {formatoHora(mov.created_at)}
                    </td>
                    <td className="py-2 pr-3">{TIPO_MOVIMIENTO_LABEL[mov.tipo] ?? mov.tipo}</td>
                    <td
                      className={`py-2 pr-3 text-right tabular-nums ${Number(mov.cantidad) < 0 ? "text-destructive" : "text-green-700 dark:text-green-300"}`}
                    >
                      {Number(mov.cantidad) > 0 ? "+" : ""}
                      {formatoCantidad(mov.cantidad, producto.unidad)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {formatoCantidad(mov.stock_resultante, producto.unidad)}
                    </td>
                    <td className="py-2 text-muted-foreground">{mov.nota ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Sin movimientos todavía.</p>
        )}
      </section>

      <EditarProductoForm categorias={categorias} empresaId={empresa.id} producto={producto} />
    </main>
  );
}
