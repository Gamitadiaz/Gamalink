import Link from "next/link";

import { ShoppingCart } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { resolverEmpresa } from "@/lib/empresa-actual";
import { diaMx, formatoDinero, hoyMx, inicioDiaMx, sumarDias } from "@/lib/formato";
import { createSupabaseServerClient } from "@/lib/sb/server";
import {
  ESTADO_STOCK_CLASS,
  ESTADO_STOCK_LABEL,
  estadoStock,
  formatoCantidad,
  PRODUCTO_COLUMNS,
  type Producto,
} from "@/lib/tienda";

import { DineroChart } from "../_components/modulo/dinero-chart";
import { conEmpresa, ModuloHeader, SinEmpresa } from "./_components/modulo-header";

export const metadata: Metadata = { title: "Tiendita" };

const DIAS_GRAFICA = 14;

type VentaConItems = {
  id: number;
  total: number;
  created_at: string;
  gl_venta_items: {
    producto_id: number;
    nombre: string;
    cantidad: number;
    subtotal: number;
    costo_unitario: number | null;
  }[];
};

export default async function TiendaResumenPage({ searchParams }: { searchParams: Promise<{ empresa?: string }> }) {
  const { empresa: empresaParam } = await searchParams;
  const { empresa, opciones } = await resolverEmpresa("tienda", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const hoy = hoyMx();
  const inicioMes = `${hoy.slice(0, 7)}-01`;
  const inicioGrafica = sumarDias(hoy, -(DIAS_GRAFICA - 1));
  const desde = inicioMes < inicioGrafica ? inicioMes : inicioGrafica;

  const supabase = await createSupabaseServerClient();
  const [{ data: ventasData }, { data: productosData }] = await Promise.all([
    supabase
      .from("gl_ventas")
      .select("id, total, created_at, gl_venta_items(producto_id, nombre, cantidad, subtotal, costo_unitario)")
      .eq("empresa_id", empresa.id)
      .eq("estado", "completada")
      .gte("created_at", inicioDiaMx(desde)),
    supabase.from("gl_productos").select(PRODUCTO_COLUMNS).eq("empresa_id", empresa.id).eq("activo", true),
  ]);

  const ventas = ((ventasData ?? []) as VentaConItems[]).map((venta) => ({ ...venta, dia: diaMx(venta.created_at) }));
  const productos = (productosData ?? []) as Producto[];

  const ventasHoy = ventas.filter((venta) => venta.dia === hoy);
  const ventasMes = ventas.filter((venta) => venta.dia >= inicioMes);
  const totalHoy = ventasHoy.reduce((suma, venta) => suma + Number(venta.total), 0);
  const totalMes = ventasMes.reduce((suma, venta) => suma + Number(venta.total), 0);

  // Ganancia: solo de los renglones cuyo producto tenía costo al momento de vender.
  let ganancia = 0;
  let renglonesSinCosto = 0;
  const vendidos = new Map<number, { nombre: string; cantidad: number; total: number }>();
  for (const venta of ventasMes) {
    for (const item of venta.gl_venta_items) {
      if (item.costo_unitario === null) {
        renglonesSinCosto += 1;
      } else {
        ganancia += Number(item.subtotal) - Number(item.costo_unitario) * Number(item.cantidad);
      }
      const actual = vendidos.get(item.producto_id) ?? { nombre: item.nombre, cantidad: 0, total: 0 };
      actual.cantidad += Number(item.cantidad);
      actual.total += Number(item.subtotal);
      vendidos.set(item.producto_id, actual);
    }
  }
  const topProductos = [...vendidos.values()].sort((a, b) => b.total - a.total).slice(0, 5);

  const porDia = Array.from({ length: DIAS_GRAFICA }, (_, i) => {
    const dia = sumarDias(inicioGrafica, i);
    const valor = ventas.filter((venta) => venta.dia === dia).reduce((suma, venta) => suma + Number(venta.total), 0);
    return { etiqueta: `${Number(dia.slice(8))}/${Number(dia.slice(5, 7))}`, valor };
  });

  const porSurtir = productos
    .map((producto) => ({ ...producto, estado: estadoStock(producto) }))
    .filter((producto) => producto.estado !== "ok")
    .sort((a, b) => Number(a.stock) - Number(b.stock));

  const kpis = [
    { label: "Vendido hoy", valor: formatoDinero(totalHoy), detalle: `${ventasHoy.length} ventas` },
    { label: "Vendido en el mes", valor: formatoDinero(totalMes), detalle: `${ventasMes.length} ventas` },
    {
      label: "Ganancia del mes",
      valor: formatoDinero(ganancia),
      detalle: renglonesSinCosto > 0 ? "Hay productos sin costo: es aproximada" : "Ventas menos costo",
    },
    { label: "Por surtir", valor: String(porSurtir.length), detalle: "Stock bajo o agotado" },
  ];

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <ModuloHeader actual="resumen" empresa={empresa} opciones={opciones} />

      <div className="flex justify-end">
        <Link className={buttonVariants()} href={conEmpresa("/dashboard/tienda/vender", empresa.id)}>
          <ShoppingCart />
          Nueva venta
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div className="space-y-1 bg-card p-4" key={kpi.label}>
            <p className="text-muted-foreground text-sm">{kpi.label}</p>
            <p className="font-semibold text-2xl tabular-nums tracking-tight">{kpi.valor}</p>
            <p className="text-muted-foreground text-xs">{kpi.detalle}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6 xl:col-span-3">
          <div>
            <h2 className="font-semibold text-lg">Ventas por día</h2>
            <p className="text-muted-foreground text-sm">Últimos {DIAS_GRAFICA} días.</p>
          </div>
          <DineroChart data={porDia} serie="Ventas" />
        </section>

        <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6 xl:col-span-2">
          <div>
            <h2 className="font-semibold text-lg">Por surtir</h2>
            <p className="text-muted-foreground text-sm">Productos con stock bajo o agotados.</p>
          </div>
          {porSurtir.length > 0 ? (
            <ul className="divide-y">
              {porSurtir.slice(0, 8).map((producto) => (
                <li className="flex items-center justify-between gap-2 py-2" key={producto.id}>
                  <Link
                    className="min-w-0 hover:underline"
                    href={conEmpresa(`/dashboard/tienda/productos/${producto.id}`, empresa.id)}
                  >
                    <span className="block truncate font-medium text-sm">{producto.nombre}</span>
                    <span className="block text-muted-foreground text-xs">
                      Quedan {formatoCantidad(producto.stock, producto.unidad)}
                    </span>
                  </Link>
                  <Badge className={ESTADO_STOCK_CLASS[producto.estado]}>{ESTADO_STOCK_LABEL[producto.estado]}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Todo surtido. 🎉</p>
          )}
        </section>
      </div>

      <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6">
        <h2 className="font-semibold text-lg">Lo más vendido del mes</h2>
        {topProductos.length > 0 ? (
          <ul className="divide-y">
            {topProductos.map((producto) => (
              <li className="flex items-center justify-between gap-2 py-2 text-sm" key={producto.nombre}>
                <span className="truncate">{producto.nombre}</span>
                <span className="shrink-0 text-muted-foreground">
                  {producto.cantidad.toLocaleString("es-MX", { maximumFractionDigits: 3 })} vendidos ·{" "}
                  <span className="text-foreground tabular-nums">{formatoDinero(producto.total)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Aún no hay ventas este mes.</p>
        )}
      </section>
    </main>
  );
}
