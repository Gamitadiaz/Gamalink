export const UNIDADES = [
  { key: "pieza", label: "Pieza", corto: "pza" },
  { key: "kg", label: "Kilo", corto: "kg" },
  { key: "litro", label: "Litro", corto: "L" },
  { key: "paquete", label: "Paquete", corto: "paq" },
] as const;

export type Unidad = (typeof UNIDADES)[number]["key"];

export type Producto = {
  id: number;
  nombre: string;
  codigo: string | null;
  categoria: string | null;
  unidad: Unidad;
  precio: number;
  costo: number | null;
  stock: number;
  stock_minimo: number;
  activo: boolean;
};

export const PRODUCTO_COLUMNS = "id, nombre, codigo, categoria, unidad, precio, costo, stock, stock_minimo, activo";

// Kilos y litros se venden con decimales; piezas y paquetes, enteros.
export function permiteDecimales(unidad: Unidad) {
  return unidad === "kg" || unidad === "litro";
}

export function formatoCantidad(cantidad: number | string, unidad: Unidad) {
  const valor = Number(cantidad);
  const corto = UNIDADES.find((item) => item.key === unidad)?.corto ?? "";
  const numero = permiteDecimales(unidad)
    ? valor.toLocaleString("es-MX", { maximumFractionDigits: 3 })
    : valor.toLocaleString("es-MX", { maximumFractionDigits: 0 });
  return `${numero} ${corto}`;
}

export type EstadoStock = "ok" | "bajo" | "agotado";

export function estadoStock(producto: Pick<Producto, "stock" | "stock_minimo">): EstadoStock {
  const stock = Number(producto.stock);
  if (stock <= 0) return "agotado";
  if (stock <= Number(producto.stock_minimo)) return "bajo";
  return "ok";
}

export const ESTADO_STOCK_LABEL: Record<EstadoStock, string> = {
  ok: "En stock",
  bajo: "Stock bajo",
  agotado: "Agotado",
};

export const ESTADO_STOCK_CLASS: Record<EstadoStock, string> = {
  ok: "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  bajo: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  agotado: "bg-destructive/10 text-destructive",
};

export const TIPO_MOVIMIENTO_LABEL: Record<string, string> = {
  entrada: "Entrada",
  venta: "Venta",
  ajuste: "Ajuste por conteo",
  cancelacion: "Venta cancelada",
};
