"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/empresas";
import { METODOS_PAGO } from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { getSessionContext } from "@/lib/session";
import { UNIDADES } from "@/lib/tienda";

// Superadmin, o usuario de la empresa con el servicio activo. Las funciones de la BD lo vuelven a comprobar.
async function requireTienda(empresaId: number) {
  const session = await getSessionContext();
  const permitido =
    session?.role === "superadmin" ||
    session?.empresas.some((empresa) => empresa.id === empresaId && empresa.servicios.includes("tienda"));
  if (!permitido) {
    throw new Error("No autorizado.");
  }
  return createSupabaseServerClient();
}

function revalidar() {
  revalidatePath("/dashboard/tienda", "layout");
}

function texto(formData: FormData, campo: string, max: number) {
  const valor = String(formData.get(campo) ?? "").trim();
  return valor ? valor.slice(0, max) : null;
}

function numero(formData: FormData, campo: string) {
  const raw = String(formData.get(campo) ?? "").trim();
  if (raw === "") return null;
  const valor = Number(raw);
  return Number.isFinite(valor) ? valor : Number.NaN;
}

function errorDeBd(message: string) {
  if (message.includes("gl_productos_codigo_unico")) return "Ese código de barras ya está en otro producto.";
  return message;
}

// ---------- Productos ----------

type DatosProducto = {
  nombre: string;
  codigo: string | null;
  categoria: string | null;
  unidad: string;
  precio: number;
  costo: number | null;
  stock_minimo: number;
};

function leerProducto(formData: FormData): DatosProducto | string {
  const nombre = texto(formData, "nombre", 120);
  const unidad = String(formData.get("unidad") ?? "pieza");
  const precio = numero(formData, "precio");
  const costo = numero(formData, "costo");
  const minimo = numero(formData, "stock_minimo") ?? 0;

  if (!nombre) return "Escribe el nombre del producto.";
  if (!UNIDADES.some((item) => item.key === unidad)) return "Unidad no válida.";
  if (precio === null || Number.isNaN(precio) || precio < 0) return "Precio de venta no válido.";
  if (costo !== null && (Number.isNaN(costo) || costo < 0)) return "Costo no válido.";
  if (Number.isNaN(minimo) || minimo < 0) return "Stock mínimo no válido.";

  return {
    nombre,
    codigo: texto(formData, "codigo", 64),
    categoria: texto(formData, "categoria", 60),
    unidad,
    precio,
    costo,
    stock_minimo: minimo,
  };
}

export async function crearProducto(empresaId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await requireTienda(empresaId);
  const datos = leerProducto(formData);
  if (typeof datos === "string") return { ok: false, message: datos };

  const stock = numero(formData, "stock") ?? 0;
  if (Number.isNaN(stock) || stock < 0) return { ok: false, message: "Stock inicial no válido." };

  const { error } = await supabase.from("gl_productos").insert({ ...datos, empresa_id: empresaId, stock });
  if (error) return { ok: false, message: `No se pudo crear el producto: ${errorDeBd(error.message)}` };

  revalidar();
  return { ok: true, message: `“${datos.nombre}” agregado.` };
}

export async function actualizarProducto(
  empresaId: number,
  productoId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireTienda(empresaId);
  const datos = leerProducto(formData);
  if (typeof datos === "string") return { ok: false, message: datos };

  const { error } = await supabase.from("gl_productos").update(datos).eq("id", productoId).eq("empresa_id", empresaId);
  if (error) return { ok: false, message: `No se pudo guardar: ${errorDeBd(error.message)}` };

  revalidar();
  return { ok: true, message: "Producto guardado." };
}

export async function cambiarEstadoProducto(empresaId: number, productoId: number, activo: boolean) {
  const supabase = await requireTienda(empresaId);
  await supabase.from("gl_productos").update({ activo }).eq("id", productoId).eq("empresa_id", empresaId);
  revalidar();
}

export async function ajustarStock(
  empresaId: number,
  productoId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireTienda(empresaId);
  const tipo = String(formData.get("tipo") ?? "");
  const cantidad = numero(formData, "cantidad");
  if (tipo !== "entrada" && tipo !== "ajuste") return { ok: false, message: "Tipo no válido." };
  if (cantidad === null || Number.isNaN(cantidad) || cantidad < 0) return { ok: false, message: "Cantidad no válida." };

  const { error } = await supabase.rpc("gl_tienda_ajustar_stock", {
    p_producto_id: productoId,
    p_tipo: tipo,
    p_cantidad: cantidad,
    p_nota: texto(formData, "nota", 200),
  });
  if (error) return { ok: false, message: error.message };

  revalidar();
  return { ok: true, message: tipo === "entrada" ? "Entrada registrada." : "Stock actualizado con el conteo." };
}

// ---------- Ventas ----------

export type ResultadoVenta = { ok: true; ventaId: number } | { ok: false; message: string };

export async function registrarVenta(
  empresaId: number,
  items: { producto_id: number; cantidad: number }[],
  metodo: string,
): Promise<ResultadoVenta> {
  const supabase = await requireTienda(empresaId);
  if (!METODOS_PAGO.some((item) => item.key === metodo)) return { ok: false, message: "Método de pago no válido." };

  const limpios = items.filter(
    (item) => Number.isInteger(item.producto_id) && Number.isFinite(item.cantidad) && item.cantidad > 0,
  );
  if (limpios.length === 0) return { ok: false, message: "Agrega al menos un producto." };

  const { data, error } = await supabase.rpc("gl_tienda_registrar_venta", {
    p_empresa_id: empresaId,
    p_items: limpios,
    p_metodo: metodo,
  });
  if (error) return { ok: false, message: error.message };

  revalidar();
  return { ok: true, ventaId: Number(data) };
}

export async function cancelarVenta(empresaId: number, ventaId: number) {
  const supabase = await requireTienda(empresaId);
  const { error } = await supabase.rpc("gl_tienda_cancelar_venta", { p_venta_id: ventaId });
  if (error) throw new Error(error.message);
  revalidar();
}
