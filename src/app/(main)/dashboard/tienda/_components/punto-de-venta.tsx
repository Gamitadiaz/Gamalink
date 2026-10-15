"use client";

import { useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Minus, Plus, ScanBarcode, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatoDinero } from "@/lib/formato";
import { METODOS_PAGO } from "@/lib/membresias";
import {
  ESTADO_STOCK_CLASS,
  ESTADO_STOCK_LABEL,
  estadoStock,
  formatoCantidad,
  type Producto,
  permiteDecimales,
} from "@/lib/tienda";
import { registrarVenta } from "@/server/tienda-actions";

type Renglon = { producto: Producto; cantidad: number };

const redondear = (valor: number) => Math.round(valor * 100) / 100;

export function PuntoDeVenta({ empresaId, productos }: { empresaId: number; productos: Producto[] }) {
  const router = useRouter();
  const buscadorRef = useRef<HTMLInputElement>(null);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<Renglon[]>([]);
  const [metodo, setMetodo] = useState("efectivo");
  const [pagaCon, setPagaCon] = useState("");
  const [cobrando, setCobrando] = useState(false);

  const activos = useMemo(() => productos.filter((producto) => producto.activo), [productos]);
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return activos;
    return activos.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(q) ||
        (producto.codigo ?? "").toLowerCase() === q ||
        (producto.categoria ?? "").toLowerCase().includes(q),
    );
  }, [activos, busqueda]);

  const total = redondear(carrito.reduce((suma, r) => suma + redondear(r.producto.precio * r.cantidad), 0));
  const recibido = Number(pagaCon);
  const cambio = metodo === "efectivo" && pagaCon !== "" && recibido >= total ? redondear(recibido - total) : null;

  const agregar = (producto: Producto) => {
    setCarrito((actual) => {
      const existente = actual.find((r) => r.producto.id === producto.id);
      if (existente) {
        return actual.map((r) => (r.producto.id === producto.id ? { ...r, cantidad: r.cantidad + 1 } : r));
      }
      return [...actual, { producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (productoId: number, cantidad: number) => {
    setCarrito((actual) =>
      cantidad <= 0
        ? actual.filter((r) => r.producto.id !== productoId)
        : actual.map((r) => (r.producto.id === productoId ? { ...r, cantidad } : r)),
    );
  };

  // Enter en el buscador: un lector de código de barras escribe el código y manda Enter.
  const alPresionarEnter = () => {
    const q = busqueda.trim().toLowerCase();
    const porCodigo = activos.find((producto) => (producto.codigo ?? "").toLowerCase() === q);
    const elegido = porCodigo ?? (filtrados.length === 1 ? filtrados[0] : null);
    if (elegido) {
      agregar(elegido);
      setBusqueda("");
    }
  };

  const cobrar = async () => {
    if (carrito.length === 0) return;
    if (metodo === "efectivo" && pagaCon !== "" && recibido < total) {
      toast.error("El pago es menor al total.");
      return;
    }

    setCobrando(true);
    const resultado = await registrarVenta(
      empresaId,
      carrito.map((r) => ({ producto_id: r.producto.id, cantidad: r.cantidad })),
      metodo,
    );
    setCobrando(false);

    if (!resultado.ok) {
      toast.error("No se pudo registrar la venta", { description: resultado.message });
      return;
    }

    toast.success(`Venta registrada · ${formatoDinero(total)}`, {
      description: cambio !== null ? `Cambio: ${formatoDinero(cambio)}` : undefined,
      duration: 8000,
      action: {
        label: "Ver ticket",
        onClick: () => router.push(`/dashboard/tienda/ventas/${resultado.ventaId}?empresa=${empresaId}`),
      },
    });
    setCarrito([]);
    setPagaCon("");
    setMetodo("efectivo");
    buscadorRef.current?.focus();
    router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="space-y-4">
        <div className="relative">
          <ScanBarcode className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar producto o escanear código"
            autoFocus
            className="h-11 pl-9 text-base"
            onChange={(event) => setBusqueda(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                alPresionarEnter();
              }
            }}
            placeholder="Buscar producto o escanear código…"
            ref={buscadorRef}
            value={busqueda}
          />
        </div>

        {activos.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aún no hay productos. Agrégalos en la pestaña Productos.</p>
        ) : null}
        {activos.length > 0 && filtrados.length === 0 ? (
          <p className="text-muted-foreground text-sm">Ningún producto coincide con “{busqueda}”.</p>
        ) : null}
        {filtrados.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {filtrados.slice(0, 60).map((producto) => {
              const estado = estadoStock(producto);
              return (
                <li key={producto.id}>
                  <button
                    className="flex h-full w-full flex-col items-start gap-1 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
                    onClick={() => agregar(producto)}
                    type="button"
                  >
                    <span className="line-clamp-2 font-medium text-sm">{producto.nombre}</span>
                    <span className="font-semibold text-base tabular-nums">{formatoDinero(producto.precio)}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[11px] ${estado === "ok" ? "text-muted-foreground" : ESTADO_STOCK_CLASS[estado]}`}
                    >
                      {estado === "ok" ? formatoCantidad(producto.stock, producto.unidad) : ESTADO_STOCK_LABEL[estado]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <aside className="h-fit space-y-4 rounded-xl border bg-card p-4 lg:sticky lg:top-16">
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          <ShoppingCart className="size-5" />
          Venta actual
        </h2>

        {carrito.length === 0 ? (
          <p className="text-muted-foreground text-sm">Toca un producto o escanéalo para agregarlo.</p>
        ) : (
          <ul className="divide-y">
            {carrito.map(({ producto, cantidad }) => {
              const decimales = permiteDecimales(producto.unidad);
              return (
                <li className="space-y-2 py-2" key={producto.id}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm">{producto.nombre}</span>
                    <span className="shrink-0 font-medium text-sm tabular-nums">
                      {formatoDinero(redondear(producto.precio * cantidad))}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      aria-label={`Quitar uno de ${producto.nombre}`}
                      onClick={() => cambiarCantidad(producto.id, decimales ? cantidad - 0.5 : cantidad - 1)}
                      size="icon-sm"
                      type="button"
                      variant="outline"
                    >
                      <Minus />
                    </Button>
                    <Input
                      aria-label={`Cantidad de ${producto.nombre}`}
                      className="h-8 w-20 text-center tabular-nums"
                      min={0}
                      onChange={(event) => cambiarCantidad(producto.id, Number(event.currentTarget.value))}
                      step={decimales ? 0.001 : 1}
                      type="number"
                      value={cantidad}
                    />
                    <Button
                      aria-label={`Agregar uno de ${producto.nombre}`}
                      onClick={() => cambiarCantidad(producto.id, decimales ? cantidad + 0.5 : cantidad + 1)}
                      size="icon-sm"
                      type="button"
                      variant="outline"
                    >
                      <Plus />
                    </Button>
                    <span className="ml-1 text-muted-foreground text-xs">× {formatoDinero(producto.precio)}</span>
                    <Button
                      aria-label={`Eliminar ${producto.nombre}`}
                      className="ml-auto"
                      onClick={() => cambiarCantidad(producto.id, 0)}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-baseline justify-between border-t pt-3">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold text-3xl tabular-nums tracking-tight">{formatoDinero(total)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="pos-metodo">Método</Label>
            <select
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              id="pos-metodo"
              onChange={(event) => setMetodo(event.currentTarget.value)}
              value={metodo}
            >
              {METODOS_PAGO.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {metodo === "efectivo" ? (
            <div className="space-y-1">
              <Label htmlFor="pos-paga">Paga con</Label>
              <Input
                id="pos-paga"
                inputMode="decimal"
                min={0}
                onChange={(event) => setPagaCon(event.currentTarget.value)}
                placeholder="$0.00"
                step="0.01"
                type="number"
                value={pagaCon}
              />
            </div>
          ) : null}
        </div>

        {cambio !== null ? (
          <p className="flex items-baseline justify-between rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-muted-foreground text-sm">Cambio</span>
            <span className="font-semibold text-xl tabular-nums">{formatoDinero(cambio)}</span>
          </p>
        ) : null}

        <Button
          className="h-11 w-full text-base"
          disabled={carrito.length === 0 || cobrando}
          onClick={cobrar}
          type="button"
        >
          {cobrando ? "Cobrando…" : `Cobrar ${formatoDinero(total)}`}
        </Button>
      </aside>
    </div>
  );
}
