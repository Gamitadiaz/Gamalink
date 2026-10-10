"use client";

import { useActionState, useState, useTransition } from "react";

import { PackagePlus, Save, X } from "lucide-react";
import { toast } from "sonner";

import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Producto, permiteDecimales, UNIDADES } from "@/lib/tienda";
import {
  actualizarProducto,
  ajustarStock,
  cambiarEstadoProducto,
  cancelarVenta,
  crearProducto,
} from "@/server/tienda-actions";

const selectClassName = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm";

// Campos compartidos por "nuevo producto" y "editar producto".
function CamposProducto({ producto, categorias }: { producto?: Producto; categorias: string[] }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="producto-nombre">Nombre</Label>
          <Input defaultValue={producto?.nombre} id="producto-nombre" maxLength={120} name="nombre" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="producto-categoria">Categoría</Label>
          <Input
            defaultValue={producto?.categoria ?? ""}
            id="producto-categoria"
            list="categorias-tienda"
            maxLength={60}
            name="categoria"
            placeholder="Bebidas, abarrotes…"
          />
          <datalist id="categorias-tienda">
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria} />
            ))}
          </datalist>
        </div>
        <div className="space-y-1">
          <Label htmlFor="producto-codigo">Código de barras</Label>
          <Input
            autoComplete="off"
            defaultValue={producto?.codigo ?? ""}
            id="producto-codigo"
            maxLength={64}
            name="codigo"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="producto-precio">Precio de venta</Label>
          <Input
            defaultValue={producto?.precio}
            id="producto-precio"
            min={0}
            name="precio"
            required
            step="0.01"
            type="number"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="producto-costo">Costo (opcional)</Label>
          <Input
            defaultValue={producto?.costo ?? ""}
            id="producto-costo"
            min={0}
            name="costo"
            step="0.01"
            type="number"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="producto-unidad">Se vende por</Label>
          <select
            className={selectClassName}
            defaultValue={producto?.unidad ?? "pieza"}
            id="producto-unidad"
            name="unidad"
          >
            {UNIDADES.map((unidad) => (
              <option key={unidad.key} value={unidad.key}>
                {unidad.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="producto-minimo">Avisar cuando queden</Label>
          <Input
            defaultValue={producto?.stock_minimo ?? 0}
            id="producto-minimo"
            min={0}
            name="stock_minimo"
            step="0.001"
            type="number"
          />
        </div>
      </div>
    </>
  );
}

export function NuevoProductoForm({ empresaId, categorias }: { empresaId: number; categorias: string[] }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(crearProducto.bind(null, empresaId), null);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} type="button">
        <PackagePlus />
        Nuevo producto
      </Button>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-lg">Nuevo producto</h2>
          <p className="text-muted-foreground text-sm">Con el costo, el resumen calcula tu ganancia.</p>
        </div>
        <Button aria-label="Cerrar" onClick={() => setOpen(false)} size="icon-sm" type="button" variant="ghost">
          <X />
        </Button>
      </div>
      <CamposProducto categorias={categorias} />
      <div className="max-w-48 space-y-1">
        <Label htmlFor="producto-stock">Stock inicial</Label>
        <Input defaultValue={0} id="producto-stock" min={0} name="stock" step="0.001" type="number" />
      </div>
      <FormMessage state={state} />
      <Button disabled={pending} type="submit">
        <PackagePlus />
        {pending ? "Guardando…" : "Agregar producto"}
      </Button>
    </form>
  );
}

export function EditarProductoForm({
  empresaId,
  producto,
  categorias,
}: {
  empresaId: number;
  producto: Producto;
  categorias: string[];
}) {
  const [state, action, pending] = useActionState(actualizarProducto.bind(null, empresaId, producto.id), null);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <h2 className="font-semibold text-lg">Datos del producto</h2>
      <CamposProducto categorias={categorias} producto={producto} />
      <FormMessage state={state} />
      <Button disabled={pending} type="submit" variant="outline">
        <Save />
        Guardar
      </Button>
    </form>
  );
}

export function StockForm({ empresaId, producto }: { empresaId: number; producto: Producto }) {
  const [tipo, setTipo] = useState<"entrada" | "ajuste">("entrada");
  const [state, action, pending] = useActionState(ajustarStock.bind(null, empresaId, producto.id), null);
  const decimales = permiteDecimales(producto.unidad);

  return (
    <form action={action} className="space-y-3 rounded-xl border bg-card p-4 md:p-6">
      <h2 className="font-semibold text-lg">Inventario</h2>
      <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
        {(
          [
            ["entrada", "Llegó mercancía"],
            ["ajuste", "Conteo físico"],
          ] as const
        ).map(([key, label]) => (
          <button
            aria-pressed={tipo === key}
            className="flex-1 rounded-md px-3 py-1.5 text-muted-foreground transition-colors aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
            key={key}
            onClick={() => setTipo(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <input name="tipo" type="hidden" value={tipo} />
      <p className="text-muted-foreground text-xs">
        {tipo === "entrada"
          ? "Se suma a lo que ya hay."
          : "Escribe cuántos hay realmente en el anaquel; el sistema corrige la diferencia."}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="stock-cantidad">{tipo === "entrada" ? "Cantidad que llegó" : "Cantidad contada"}</Label>
          <Input id="stock-cantidad" min={0} name="cantidad" required step={decimales ? 0.001 : 1} type="number" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="stock-nota">Nota (opcional)</Label>
          <Input id="stock-nota" maxLength={200} name="nota" placeholder="Proveedor, motivo…" />
        </div>
      </div>
      <FormMessage state={state} />
      <Button disabled={pending} size="sm" type="submit">
        <Save />
        {tipo === "entrada" ? "Registrar entrada" : "Guardar conteo"}
      </Button>
    </form>
  );
}

export function ProductoEstadoButton({ empresaId, producto }: { empresaId: number; producto: Producto }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={pending}
      onClick={() => startTransition(() => cambiarEstadoProducto(empresaId, producto.id, !producto.activo))}
      size="sm"
      type="button"
      variant="outline"
    >
      {producto.activo ? "Desactivar" : "Reactivar"}
    </Button>
  );
}

export function CancelarVentaButton({ empresaId, ventaId }: { empresaId: number; ventaId: number }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pending, startTransition] = useTransition();

  const cancelar = () =>
    startTransition(async () => {
      try {
        await cancelarVenta(empresaId, ventaId);
        toast.success("Venta cancelada; el stock se regresó.");
      } catch (error) {
        toast.error("No se pudo cancelar", { description: error instanceof Error ? error.message : undefined });
      }
    });

  if (!confirmando) {
    return (
      <Button onClick={() => setConfirmando(true)} size="sm" type="button" variant="ghost">
        Cancelar venta
      </Button>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <Button disabled={pending} onClick={cancelar} size="sm" type="button" variant="destructive">
        Sí, cancelar
      </Button>
      <Button onClick={() => setConfirmando(false)} size="sm" type="button" variant="ghost">
        No
      </Button>
    </span>
  );
}
