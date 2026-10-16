import Link from "next/link";

import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { resolverEmpresa } from "@/lib/empresa-actual";
import { formatoDinero, formatoFecha, formatoHora, hoyMx, inicioDiaMx, plural, sumarDias } from "@/lib/formato";
import { METODOS_PAGO } from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";

import { BotonImprimir, Imprimible } from "../../../_components/modulo/imprimible";
import { conEmpresa, ModuloHeader, SinEmpresa } from "../../_components/modulo-header";

export const metadata: Metadata = { title: "Corte de caja" };

type Venta = {
  id: number;
  total: number;
  metodo: string;
  estado: "completada" | "cancelada";
  gl_venta_items: { nombre: string; cantidad: number; subtotal: number; costo_unitario: number | null }[];
};

export default async function CortePage({
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
    .select("id, total, metodo, estado, gl_venta_items(nombre, cantidad, subtotal, costo_unitario)")
    .eq("empresa_id", empresa.id)
    .gte("created_at", inicioDiaMx(fecha))
    .lt("created_at", inicioDiaMx(sumarDias(fecha, 1)));

  const ventas = (data ?? []) as Venta[];
  const completadas = ventas.filter((venta) => venta.estado === "completada");
  const canceladas = ventas.filter((venta) => venta.estado === "cancelada");
  const suma = (lista: Venta[]) => lista.reduce((total, venta) => total + Number(venta.total), 0);
  const totalVendido = suma(completadas);

  const porMetodo = METODOS_PAGO.map((m) => {
    const delMetodo = completadas.filter((venta) => venta.metodo === m.key);
    return { label: m.label, ventas: delMetodo.length, total: suma(delMetodo) };
  }).filter((m) => m.ventas > 0);

  // Ganancia: solo de los renglones cuyo producto tenía costo al momento de vender (igual que el Resumen).
  let ganancia = 0;
  let sinCosto = false;
  const productos = new Map<string, { cantidad: number; total: number }>();
  for (const item of completadas.flatMap((venta) => venta.gl_venta_items)) {
    if (item.costo_unitario === null) sinCosto = true;
    else ganancia += Number(item.subtotal) - Number(item.costo_unitario) * Number(item.cantidad);
    const actual = productos.get(item.nombre) ?? { cantidad: 0, total: 0 };
    productos.set(item.nombre, {
      cantidad: actual.cantidad + Number(item.cantidad),
      total: actual.total + Number(item.subtotal),
    });
  }
  const masVendidos = [...productos.entries()].sort((a, b) => b[1].total - a[1].total);

  const hrefFecha = (dia: string) => conEmpresa(`/dashboard/tienda/ventas/corte?fecha=${dia}`, empresa.id);
  const generado = formatoHora(new Date().toISOString());

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <ModuloHeader
        acciones={
          <>
            <Link
              className={buttonVariants({ size: "sm", variant: "ghost" })}
              href={conEmpresa(`/dashboard/tienda/ventas?fecha=${fecha}`, empresa.id)}
            >
              <ChevronLeft data-icon="inline-start" />
              Ventas
            </Link>
            <BotonImprimir>Imprimir corte</BotonImprimir>
          </>
        }
        actual="ventas"
        empresa={empresa}
        opciones={opciones}
      />

      <form action="/dashboard/tienda/ventas/corte" className="flex items-center gap-2">
        <input name="empresa" type="hidden" value={empresa.id} />
        <input
          aria-label="Día del corte"
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          defaultValue={fecha}
          max={hoy}
          name="fecha"
          type="date"
        />
        <button className={buttonVariants({ size: "sm", variant: "outline" })} type="submit">
          Ver
        </button>
        {fecha < hoy ? (
          <Link className={buttonVariants({ size: "sm", variant: "ghost" })} href={hrefFecha(hoy)}>
            Hoy
          </Link>
        ) : null}
      </form>

      <Imprimible tipo="hoja">
        <article className="max-w-2xl space-y-6 rounded-xl border bg-card p-6 print:max-w-none print:border-0 print:p-0">
          <header>
            <h2 className="font-semibold text-xl">Corte de caja</h2>
            <p className="text-muted-foreground text-sm print:text-black">
              {empresa.nombre} · {formatoFecha(fecha)}
              {fecha === hoy ? ` · al corte de las ${generado}` : ""}
            </p>
          </header>

          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total vendido", valor: formatoDinero(totalVendido) },
              { label: "Ventas", valor: String(completadas.length) },
              {
                label: "Ticket promedio",
                valor: formatoDinero(completadas.length ? totalVendido / completadas.length : 0),
              },
              { label: sinCosto ? "Ganancia (aprox.)" : "Ganancia", valor: formatoDinero(ganancia) },
            ].map((dato) => (
              <div key={dato.label}>
                <dt className="text-muted-foreground text-xs print:text-black">{dato.label}</dt>
                <dd className="font-semibold text-lg tabular-nums">{dato.valor}</dd>
              </div>
            ))}
          </dl>

          <section className="space-y-2">
            <h3 className="font-medium">Por método de pago</h3>
            {porMetodo.length > 0 ? (
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {porMetodo.map((m) => (
                    <tr key={m.label}>
                      <td className="py-1.5">{m.label}</td>
                      <td className="py-1.5 text-right text-muted-foreground print:text-black">
                        {plural(m.ventas, "venta")}
                      </td>
                      <td className="py-1.5 text-right font-medium tabular-nums">{formatoDinero(m.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted-foreground text-sm">No hubo ventas este día.</p>
            )}
            <p className="text-muted-foreground text-xs print:text-black">
              Efectivo cobrado (sin contar el fondo de caja):{" "}
              <strong>{formatoDinero(porMetodo.find((m) => m.label === "Efectivo")?.total ?? 0)}</strong>
            </p>
          </section>

          {canceladas.length > 0 ? (
            <p className="text-sm">
              Ventas canceladas: {canceladas.length} por {formatoDinero(suma(canceladas))} (no se suman al total).
            </p>
          ) : null}

          {masVendidos.length > 0 ? (
            <section className="space-y-2">
              <h3 className="font-medium">Productos vendidos</h3>
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground text-xs print:text-black">
                  <tr>
                    <th className="pb-1 font-normal">Producto</th>
                    <th className="pb-1 text-right font-normal">Cantidad</th>
                    <th className="pb-1 text-right font-normal">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {masVendidos.map(([nombre, item]) => (
                    <tr key={nombre}>
                      <td className="py-1.5">{nombre}</td>
                      <td className="py-1.5 text-right tabular-nums">
                        {item.cantidad.toLocaleString("es-MX", { maximumFractionDigits: 3 })}
                      </td>
                      <td className="py-1.5 text-right tabular-nums">{formatoDinero(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          {sinCosto ? (
            <p className="text-muted-foreground text-xs print:text-black">
              Algunos productos no tienen costo registrado: la ganancia es aproximada.
            </p>
          ) : null}
        </article>
      </Imprimible>
    </main>
  );
}
