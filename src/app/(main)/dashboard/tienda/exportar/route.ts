import { resolverEmpresa } from "@/lib/empresa-actual";
import { nombreArchivo, rangoMes, respuestaCsv, sinPermiso, todasLasFilas } from "@/lib/exportar";
import { diaMx, formatoHora, hoyMx, inicioDiaMx } from "@/lib/formato";
import { METODOS_PAGO } from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { PRODUCTO_COLUMNS, type Producto, UNIDADES } from "@/lib/tienda";

// GET /dashboard/tienda/exportar?empresa=ID&tipo=productos
// GET /dashboard/tienda/exportar?empresa=ID&tipo=ventas&mes=YYYY-MM  (un renglón por producto vendido)
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const { empresa } = await resolverEmpresa("tienda", params.get("empresa") ?? undefined);
  if (!empresa) return sinPermiso();

  const supabase = await createSupabaseServerClient();
  const hoy = hoyMx();

  if (params.get("tipo") === "ventas") {
    const { mes, desde, hasta } = rangoMes(params.get("mes"), hoy);
    const ventas = await todasLasFilas<{
      id: number;
      metodo: string;
      estado: string;
      created_at: string;
      gl_venta_items: { nombre: string; cantidad: number; precio_unitario: number; subtotal: number }[];
    }>((inicio, fin) =>
      supabase
        .from("gl_ventas")
        .select("id, metodo, estado, created_at, gl_venta_items(nombre, cantidad, precio_unitario, subtotal)")
        .eq("empresa_id", empresa.id)
        .gte("created_at", inicioDiaMx(desde))
        .lt("created_at", inicioDiaMx(hasta))
        .order("created_at")
        .order("id")
        .range(inicio, fin),
    );
    const metodo = new Map<string, string>(METODOS_PAGO.map((m) => [m.key, m.label]));

    return respuestaCsv(
      nombreArchivo(empresa.nombre, "ventas", mes),
      ["Fecha", "Hora", "Folio", "Producto", "Cantidad", "Precio unitario", "Subtotal", "Método", "Estado"],
      ventas.flatMap((venta) =>
        venta.gl_venta_items.map((item) => [
          diaMx(venta.created_at),
          formatoHora(venta.created_at),
          venta.id,
          item.nombre,
          Number(item.cantidad),
          Number(item.precio_unitario),
          Number(item.subtotal),
          metodo.get(venta.metodo) ?? venta.metodo,
          venta.estado === "cancelada" ? "Cancelada" : "Completada",
        ]),
      ),
    );
  }

  const productos = await todasLasFilas<Producto>((desde, hasta) =>
    supabase
      .from("gl_productos")
      .select(PRODUCTO_COLUMNS)
      .eq("empresa_id", empresa.id)
      .order("nombre")
      .order("id")
      .range(desde, hasta),
  );
  const unidad = new Map<string, string>(UNIDADES.map((u) => [u.key, u.label]));

  return respuestaCsv(
    nombreArchivo(empresa.nombre, "productos", hoy),
    ["Nombre", "Código", "Categoría", "Unidad", "Precio", "Costo", "Existencia", "Mínimo", "Activo"],
    productos.map((producto) => [
      producto.nombre,
      producto.codigo,
      producto.categoria,
      unidad.get(producto.unidad) ?? producto.unidad,
      Number(producto.precio),
      producto.costo === null ? null : Number(producto.costo),
      Number(producto.stock),
      Number(producto.stock_minimo),
      producto.activo ? "Sí" : "No",
    ]),
  );
}
