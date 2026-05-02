export type Cliente = {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  estado_pago: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  plan: string;
};

export type Plan = {
  id: number;
  nombre: string;
  precio: number;
  duracion_dias: number;
  activo: boolean;
};

export type Pago = {
  id: number;
  cliente_id: number;
  fecha_pago: string;
  monto: number;
  plan: string;
  metodo_pago: string;
  notas: string;
  created_at: string;
};

export type Config = {
  id: number;
  nombre_negocio: string;
  moneda: string;
  correo_contacto: string;
  correo_bienvenida_activo: boolean;
  correo_vencimiento_activo: boolean;
};

export type ModalMode     = 'crear' | 'editar' | null;
export type PlanModalMode = 'crear' | 'editar' | null;

export const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'];
