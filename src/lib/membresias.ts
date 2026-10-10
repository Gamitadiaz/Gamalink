export const METODOS_PAGO = [
  { key: "efectivo", label: "Efectivo" },
  { key: "tarjeta", label: "Tarjeta" },
  { key: "transferencia", label: "Transferencia" },
  { key: "otro", label: "Otro" },
] as const;

export type MetodoPago = (typeof METODOS_PAGO)[number]["key"];

export type PlanMembresia = {
  id: number;
  nombre: string;
  precio: number;
  duracion_dias: number;
  activo: boolean;
};

export type SocioResumen = {
  id: number;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  notas: string | null;
  activo: boolean;
  created_at: string;
  vigente_hasta: string | null;
  ultimo_pago: string | null;
  total_pagado: number | null;
};

export type EstadoSocio = "activo" | "por_vencer" | "vencido" | "sin_pagos" | "baja";

// Días antes del vencimiento en que un socio cuenta como "por vencer".
export const DIAS_AVISO = 7;

const ZONA = "America/Mexico_City";

// Fecha de hoy en México como 'YYYY-MM-DD' (las fechas de la BD son 'date', sin hora).
export function hoyMx(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date());
}

export function sumarDias(fecha: string, dias: number): string {
  const date = new Date(`${fecha}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + dias);
  return date.toISOString().slice(0, 10);
}

export function diasEntre(desde: string, hasta: string): number {
  return Math.round((Date.parse(`${hasta}T12:00:00Z`) - Date.parse(`${desde}T12:00:00Z`)) / 86_400_000);
}

export function estadoSocio(socio: Pick<SocioResumen, "activo" | "vigente_hasta">, hoy: string): EstadoSocio {
  if (!socio.activo) {
    return "baja";
  }
  if (!socio.vigente_hasta) {
    return "sin_pagos";
  }
  if (socio.vigente_hasta < hoy) {
    return "vencido";
  }
  return diasEntre(hoy, socio.vigente_hasta) <= DIAS_AVISO ? "por_vencer" : "activo";
}

export const ESTADO_SOCIO_LABEL: Record<EstadoSocio, string> = {
  activo: "Activo",
  por_vencer: "Por vencer",
  vencido: "Vencido",
  sin_pagos: "Sin pagos",
  baja: "Baja",
};

// Clases del badge por estado (verde / ámbar / rojo / neutro), legibles en ambos temas.
export const ESTADO_SOCIO_CLASS: Record<EstadoSocio, string> = {
  activo: "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  por_vencer: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  vencido: "bg-destructive/10 text-destructive",
  sin_pagos: "bg-muted text-muted-foreground",
  baja: "bg-muted text-muted-foreground",
};

const moneyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function formatoDinero(valor: number | null | undefined) {
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

export function duracionLabel(dias: number) {
  if (dias === 1) return "1 día";
  if (dias === 7) return "1 semana";
  if (dias % 365 === 0) return dias === 365 ? "1 año" : `${dias / 365} años`;
  if (dias % 30 === 0) return dias === 30 ? "1 mes" : `${dias / 30} meses`;
  return `${dias} días`;
}
