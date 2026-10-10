import type { Servicio } from "@/lib/dashboard-access";

export const SERVICIOS: { key: Servicio; label: string; descripcion: string }[] = [
  { key: "landing", label: "Landing page", descripcion: "Página web, imágenes y métricas" },
  { key: "membresias", label: "Membresías", descripcion: "Socios, suscripciones y ganancias" },
  { key: "citas", label: "Citas", descripcion: "Agenda y servicios" },
  { key: "tienda", label: "Tiendita", descripcion: "Productos, inventario y ventas" },
];

export const ESTADOS_EMPRESA = ["Activo", "Pausado", "Cancelado"] as const;
export const ESTADOS_SERVICIO = ["activo", "pausado", "cancelado"] as const;

export type EstadoServicio = (typeof ESTADOS_SERVICIO)[number];

export type ServicioRow = {
  servicio: Servicio;
  estado: EstadoServicio;
  precio_mensual: number | null;
  fecha_vencimiento: string | null;
};

export function servicioLabel(servicio: string) {
  return SERVICIOS.find((item) => item.key === servicio)?.label ?? servicio;
}

export type ActionState = { ok: boolean; message: string } | null;
