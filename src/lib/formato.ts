// Fechas y dinero para los módulos. Los negocios están en México: las fechas "de calendario"
// (vencimientos, días de venta) se calculan en hora de la Ciudad de México.

const ZONA = "America/Mexico_City";
// CDMX no tiene horario de verano desde 2022: siempre UTC-6.
const OFFSET_MX = "-06:00";

// Fecha de hoy en México como 'YYYY-MM-DD'.
export function hoyMx(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date());
}

// Inicio del día 'YYYY-MM-DD' en México, como timestamp ISO para filtrar columnas timestamptz.
export function inicioDiaMx(fecha: string): string {
  return `${fecha}T00:00:00${OFFSET_MX}`;
}

// Día 'YYYY-MM-DD' en México de un timestamp ISO.
export function diaMx(timestamp: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date(timestamp));
}

export function sumarDias(fecha: string, dias: number): string {
  const date = new Date(`${fecha}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + dias);
  return date.toISOString().slice(0, 10);
}

export function diasEntre(desde: string, hasta: string): number {
  return Math.round((Date.parse(`${hasta}T12:00:00Z`) - Date.parse(`${desde}T12:00:00Z`)) / 86_400_000);
}

const moneyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function formatoDinero(valor: number | string | null | undefined) {
  return moneyFormatter.format(Number(valor ?? 0));
}

export function formatoFecha(fecha: string | null | undefined) {
  if (!fecha) {
    return "—";
  }
  return new Date(`${fecha}T12:00:00Z`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatoHora(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", timeZone: ZONA });
}

// "1 venta", "3 ventas". Para frases que no se forman con "s" se pasa el plural.
export function plural(cantidad: number, singular: string, enPlural = `${singular}s`) {
  return `${cantidad.toLocaleString("es-MX")} ${cantidad === 1 ? singular : enPlural}`;
}
