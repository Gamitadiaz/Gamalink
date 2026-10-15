// Exportación a CSV para abrir en Excel. Solo servidor (rutas /dashboard/<modulo>/exportar).

type Celda = string | number | null | undefined;

// Supabase devuelve máximo 1,000 filas por consulta: se piden por páginas hasta traer todo.
const TAMANO_PAGINA = 1000;

export async function todasLasFilas<T>(
  pagina: (desde: number, hasta: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const filas: T[] = [];
  for (let desde = 0; ; desde += TAMANO_PAGINA) {
    const { data, error } = await pagina(desde, desde + TAMANO_PAGINA - 1);
    if (error) throw new Error(error.message);
    filas.push(...(data ?? []));
    if (!data || data.length < TAMANO_PAGINA) return filas;
  }
}

function celda(valor: Celda): string {
  if (valor === null || valor === undefined) return "";
  if (typeof valor === "number") return String(valor);
  // Un texto que empieza con = + - @ Excel lo trata como fórmula; con el apóstrofo se queda como texto.
  const texto = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
  return /[",\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

// Nombre de archivo sin acentos ni espacios: "Gym Fuerza" → "gym-fuerza".
export function nombreArchivo(...partes: string[]) {
  return partes
    .join("-")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function respuestaCsv(nombre: string, encabezados: string[], filas: Celda[][]) {
  // El BOM hace que Excel lea los acentos como UTF-8.
  const cuerpo = `﻿${[encabezados, ...filas].map((fila) => fila.map(celda).join(",")).join("\r\n")}`;
  return new Response(cuerpo, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

export function sinPermiso() {
  return new Response("No tienes acceso a esta empresa.", { status: 403 });
}

// Mes 'YYYY-MM' del parámetro, o el actual. Devuelve el primer día y el primer día del mes siguiente.
export function rangoMes(mesParam: string | null, hoy: string) {
  const mes = mesParam && /^\d{4}-\d{2}$/.test(mesParam) ? mesParam : hoy.slice(0, 7);
  const [anio, numero] = mes.split("-").map(Number);
  const siguiente = new Date(Date.UTC(anio, numero, 1)).toISOString().slice(0, 10);
  return { mes, desde: `${mes}-01`, hasta: siguiente };
}
