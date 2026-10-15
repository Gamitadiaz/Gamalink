import Link from "next/link";
import { notFound } from "next/navigation";

import { ChevronLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { resolverEmpresa } from "@/lib/empresa-actual";
import { diaMx, formatoDinero, formatoFecha, formatoHora } from "@/lib/formato";
import { METODOS_PAGO } from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { whatsappTexto } from "@/lib/whatsapp";

import { BotonImprimir, Imprimible } from "../../../_components/modulo/imprimible";
import { conEmpresa, ModuloHeader, SinEmpresa } from "../../_components/modulo-header";

export const metadata: Metadata = { title: "Ticket de venta" };

type Venta = {
  id: number;
  total: number;
  metodo: string;
  estado: "completada" | "cancelada";
  created_at: string;
  gl_venta_items: { id: number; nombre: string; cantidad: number; precio_unitario: number; subtotal: number }[];
};

const cantidad = (valor: number) => Number(valor).toLocaleString("es-MX", { maximumFractionDigits: 3 });

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ ventaId: string }>;
  searchParams: Promise<{ empresa?: string }>;
}) {
  const [{ ventaId }, { empresa: empresaParam }] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(ventaId)) notFound();

  const { empresa, opciones } = await resolverEmpresa("tienda", empresaParam);
  if (!empresa) return <SinEmpresa />;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("gl_ventas")
    .select("id, total, metodo, estado, created_at, gl_venta_items(id, nombre, cantidad, precio_unitario, subtotal)")
    .eq("empresa_id", empresa.id)
    .eq("id", Number(ventaId))
    .maybeSingle();
  if (!data) notFound();

  const venta = data as Venta;
  const metodo = METODOS_PAGO.find((m) => m.key === venta.metodo)?.label ?? venta.metodo;
  const fecha = `${formatoFecha(diaMx(venta.created_at))} · ${formatoHora(venta.created_at)}`;
  const cancelada = venta.estado === "cancelada";

  const textoWhatsapp = [
    `*${empresa.nombre}*`,
    `Ticket #${venta.id} · ${fecha}`,
    "",
    ...venta.gl_venta_items.map(
      (item) => `${cantidad(item.cantidad)} × ${item.nombre}  ${formatoDinero(item.subtotal)}`,
    ),
    "",
    `*Total: ${formatoDinero(venta.total)}* (${metodo})`,
    cancelada ? "VENTA CANCELADA" : "¡Gracias por su compra!",
  ].join("\n");

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <ModuloHeader
        acciones={
          <>
            <Link
              className={buttonVariants({ size: "sm", variant: "ghost" })}
              href={conEmpresa("/dashboard/tienda/ventas", empresa.id)}
            >
              <ChevronLeft data-icon="inline-start" />
              Ventas
            </Link>
            <a
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href={whatsappTexto(textoWhatsapp)}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle data-icon="inline-start" />
              Enviar por WhatsApp
            </a>
            <BotonImprimir />
          </>
        }
        actual="ventas"
        empresa={empresa}
        opciones={opciones}
      />

      <Imprimible tipo="ticket">
        <article className="mx-auto w-full max-w-xs rounded-xl border bg-card p-5 font-mono text-sm print:max-w-none print:rounded-none print:border-0 print:p-0">
          <header className="space-y-1 text-center">
            <p className="font-bold text-base">{empresa.nombre}</p>
            <p className="text-muted-foreground text-xs print:text-black">Ticket #{venta.id}</p>
            <p className="text-muted-foreground text-xs print:text-black">{fecha}</p>
          </header>

          <ul className="my-4 space-y-2 border-y border-dashed py-3">
            {venta.gl_venta_items.map((item) => (
              <li key={item.id}>
                <p>{item.nombre}</p>
                <p className="flex justify-between gap-2 text-muted-foreground text-xs print:text-black">
                  <span>
                    {cantidad(item.cantidad)} × {formatoDinero(item.precio_unitario)}
                  </span>
                  <span className="tabular-nums">{formatoDinero(item.subtotal)}</span>
                </p>
              </li>
            ))}
          </ul>

          <p className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="tabular-nums">{formatoDinero(venta.total)}</span>
          </p>
          <p className="flex justify-between text-xs">
            <span>Pago</span>
            <span>{metodo}</span>
          </p>

          <p className="mt-4 text-center text-xs">
            {cancelada ? "*** VENTA CANCELADA ***" : "¡Gracias por su compra!"}
          </p>
        </article>
      </Imprimible>
    </main>
  );
}
