export type DiaHorario = { abre: string; cierra: string } | null;
// Claves "0" (domingo) … "6" (sábado), igual que extract(dow) en Postgres y getUTCDay() en JS.
export type Horario = Record<string, DiaHorario>;

export type AgendaConfig = { horario: Horario; intervalo_min: number; capacidad: number };

export type ServicioAgenda = { id: number; nombre: string; duracion_min: number; precio: number; activo: boolean };

export type EstadoCita = "pendiente" | "confirmada" | "completada" | "cancelada" | "no_asistio";

export type Cita = {
  id: number;
  servicio_nombre: string;
  precio: number;
  cliente_nombre: string;
  cliente_telefono: string | null;
  inicio: string;
  fin: string;
  estado: EstadoCita;
  notas: string | null;
  origen: string;
};

export const CITA_COLUMNS =
  "id, servicio_nombre, precio, cliente_nombre, cliente_telefono, inicio, fin, estado, notas, origen";

// Debe coincidir con gamalink_internal.gl_agenda_horario_default() en fase4-citas.sql.
export const HORARIO_DEFAULT: Horario = {
  "0": null,
  "1": { abre: "09:00", cierra: "19:00" },
  "2": { abre: "09:00", cierra: "19:00" },
  "3": { abre: "09:00", cierra: "19:00" },
  "4": { abre: "09:00", cierra: "19:00" },
  "5": { abre: "09:00", cierra: "19:00" },
  "6": { abre: "09:00", cierra: "19:00" },
};

export const CONFIG_DEFAULT: AgendaConfig = { horario: HORARIO_DEFAULT, intervalo_min: 30, capacidad: 1 };

// Orden de la semana para mostrar (lunes primero).
export const DIAS_SEMANA = [
  { key: "1", label: "Lunes", corto: "Lun" },
  { key: "2", label: "Martes", corto: "Mar" },
  { key: "3", label: "Miércoles", corto: "Mié" },
  { key: "4", label: "Jueves", corto: "Jue" },
  { key: "5", label: "Viernes", corto: "Vie" },
  { key: "6", label: "Sábado", corto: "Sáb" },
  { key: "0", label: "Domingo", corto: "Dom" },
] as const;

export const ESTADOS_ACTIVOS: EstadoCita[] = ["pendiente", "confirmada"];

export const ESTADO_CITA_LABEL: Record<EstadoCita, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Atendida",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

export const ESTADO_CITA_CLASS: Record<EstadoCita, string> = {
  pendiente: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  confirmada: "bg-primary/10 text-primary",
  completada: "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  cancelada: "bg-muted text-muted-foreground",
  no_asistio: "bg-destructive/10 text-destructive",
};

export function diaSemana(fecha: string) {
  return String(new Date(`${fecha}T12:00:00Z`).getUTCDay());
}

function aMinutos(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function aHora(minutos: number) {
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

// Hora local de México 'HH:MM' de un timestamp ISO.
export function horaMx(timestamp: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Mexico_City",
  }).format(new Date(timestamp));
}

// Horarios libres de un día para un servicio de `duracion` minutos.
// `ocupadas`: citas activas de ese día. `ahoraMin`: minutos desde medianoche si la fecha es hoy (para no ofrecer horas pasadas).
export function calcularHorarios(
  fecha: string,
  config: AgendaConfig,
  duracion: number,
  ocupadas: Pick<Cita, "inicio" | "fin">[],
  ahoraMin: number | null,
): string[] {
  const dia = config.horario[diaSemana(fecha)];
  if (!dia) return [];

  const rangos = ocupadas.map((cita) => [aMinutos(horaMx(cita.inicio)), aMinutos(horaMx(cita.fin)) || 24 * 60]);
  const abre = aMinutos(dia.abre);
  const cierra = aMinutos(dia.cierra);
  const libres: string[] = [];

  for (let inicio = abre; inicio + duracion <= cierra; inicio += config.intervalo_min) {
    if (ahoraMin !== null && inicio <= ahoraMin) continue;
    const fin = inicio + duracion;
    const empalmes = rangos.filter(([a, b]) => a < fin && b > inicio).length;
    if (empalmes < config.capacidad) libres.push(aHora(inicio));
  }
  return libres;
}

export function duracionCorta(minutos: number) {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

export function mensajeRecordatorioCita(cita: Pick<Cita, "cliente_nombre" | "servicio_nombre" | "inicio">) {
  const dia = new Date(cita.inicio).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Mexico_City",
  });
  return `Hola ${cita.cliente_nombre}, te recordamos tu cita de ${cita.servicio_nombre} el ${dia} a las ${horaMx(cita.inicio)}. ¡Te esperamos!`;
}
