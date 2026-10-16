import Link from "next/link";

import { ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { resolverEmpresa } from "@/lib/empresa-actual";
import { formatoDinero, formatoFecha, formatoHora, hoyMx, inicioDiaMx, plural, sumarDias } from "@/lib/formato";
import { METODOS_PAGO } from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";

import { BotonExportar } from "../../_components/modulo/acciones";
import { CancelarVentaButton } from "../_components/forms";
import { conEmpresa, ModuloHeader, SinEmpresa } from "../_components/modulo-header";

export const metadata: Metadata = { title: "Ventas" };

type Venta = {
  id: number;
  total: number;
  metodo: string;
  estado: "completada" | "cancelada";
  created_at: string;
  gl_venta_items: { id: number; nombre: string; cantidad: number; precio_unitario: number; subtotal: number }[];
};

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string; fecha?: string }>;
}) {
  const { empresa: empresaParam, fecha: fechaParam } = await searchParams;
  const { empresa, opciones } = await resolverEmpresa("tienda", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const hoy = hoyMx();
  const fecha = fechaParam && /^\d{4}-\d{2}-\d{2}$/.test(fechaParam) && fechaParam <= hoy ? fechaParam : hoy;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("gl_ventas")
    .select("id, total, metodo, estado, created_at, gl_venta_items(id, nombre, cantidad, precio_unitario, subtotal)")
    .eq("empresa_id", empresa.id)
    .gte("created_at", inicioDiaMx(fecha))
    .lt("created_at", inicioDiaMx(sumarDias(fecha, 1)))
    .order("created_at", { ascending: false });

  const ventas = (data ?? []) as Venta[];
  const completadas = ventas.filter((venta) => venta.estado === "completada");
  const totalDia = completadas.reduce((suma, venta) => suma + Number(venta.total), 0);
  const metodoLabel = new Map<string, string>(METODOS_PAGO.map((m) => [m.key, m.label]));
  const porMetodo = METODOS_PAGO.map((m) => ({
    label: m.label,
    total: completadas.filter((v) => v.metodo === m.key).reduce((suma, v) => suma + Number(v.total), 0),
  })).filter((m) => m.total > 0);

  const hrefFecha = (dia: string) => conEmpresa(`/dashboard/tienda/ventas?fecha=${dia}`, empresa.id);

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <ModuloHeader
        acciones={
          <>
            <BotonExportar
              href={`/dashboard/tienda/exportar?tipo=ventas&mes=${fecha.slice(0, 7)}&empresa=${empresa.id}`}
            >
              Ventas del mes
            </BotonExportar>
            <Link
              className={buttonVariants({ size: "sm" })}
              href={conEmpresa(`/dashboard/tienda/ventas/corte?fecha=${fecha}`, empresa.id)}
            >
              <ReceiptText data-icon="inline-start" />
              Corte de caja
            </Link>
          </>
        }
        actual="ventas"
        empresa={empresa}
        opciones={opciones}
      />

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2">
          <Link
            aria-label="Día anterior"
            className={buttonVariants({ size: "icon", variant: "outline" })}
            href={hrefFecha(sumarDias(fecha, -1))}
          >
            <ChevronLeft />
          </Link>
          <form action="/dashboard/tienda/ventas" className="flex items-center gap-2">
            <input name="empresa" type="hidden" value={empresa.id} />
            <input
              aria-label="Elegir día"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              defaultValue={fecha}
              max={hoy}
              name="fecha"
              type="date"
            />
            <button className={buttonVariants({ size: "sm", variant: "outline" })} type="submit">
              Ver
            </button>
          </form>
          {fecha < hoy ? (
            <Link
              aria-label="Día siguiente"
              className={buttonVariants({ size: "icon", variant: "outline" })}
              href={hrefFecha(sumarDias(fecha, 1))}
            >
              <ChevronRight />
            </Link>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-sm">
            {fecha === hoy ? "Hoy" : formatoFecha(fecha)} · {plural(completadas.length, "venta")}
          </p>
          <p className="font-semibold text-2xl tabular-nums tracking-tight">{formatoDinero(totalDia)}</p>
          {porMetodo.length > 1 ? (
            <p className="text-muted-foreground text-xs">
              {porMetodo.map((m) => `${m.label} ${formatoDinero(m.total)}`).join(" · ")}
            </p>
          ) : null}
        </div>
      </section>

      {ventas.length > 0 ? (
        <ul className="space-y-2">
          {ventas.map((venta) => (
            <li
              className="rounded-xl border bg-card data-[cancelada=true]:opacity-60"
              data-cancelada={venta.estado === "cancelada"}
              key={venta.id}
            >
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">
                      {formatoHora(venta.created_at)} · {metodoLabel.get(venta.metodo) ?? venta.metodo}
                    </p>
                    <p className="truncate text-muted-foreground text-xs">
                      {venta.gl_venta_items.map((item) => item.nombre).join(", ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {venta.estado === "cancelada" ? <Badge variant="outline">Cancelada</Badge> : null}
                    <span className="font-semibold tabular-nums">{formatoDinero(venta.total)}</span>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" />
                  </div>
                </summary>
                <div className="space-y-3 border-t px-4 py-3">
                  <ul className="space-y-1 text-sm">
                    {venta.gl_venta_items.map((item) => (
                      <li className="flex justify-between gap-2" key={item.id}>
                        <span>
                          {Number(item.cantidad).toLocaleString("es-MX", { maximumFractionDigits: 3 })} × {item.nombre}
                        </span>
                        <span className="tabular-nums">{formatoDinero(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-end gap-2">
                    <Link
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                      href={conEmpresa(`/dashboard/tienda/ventas/${venta.id}`, empresa.id)}
                    >
                      Ver ticket
                    </Link>
                    {venta.estado === "completada" ? (
                      <CancelarVentaButton empresaId={empresa.id} ventaId={venta.id} />
                    ) : null}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No hay ventas este día.</p>
      )}
    </main>
  );
}
