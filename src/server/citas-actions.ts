"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { calcularHorarios, DIAS_SEMANA, type EstadoCita, type Horario } from "@/lib/citas";
import { obtenerConfig } from "@/lib/citas-server";
import type { ActionState } from "@/lib/empresas";
import { hoyMx, inicioDiaMx, sumarDias } from "@/lib/formato";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { getSessionContext } from "@/lib/session";

// Superadmin, o usuario de la empresa con el servicio activo. RLS y la función de la BD lo vuelven a comprobar.
async function requireCitas(empresaId: number) {
  const session = await getSessionContext();
  const permitido =
    session?.role === "superadmin" ||
    session?.empresas.some((empresa) => empresa.id === empresaId && empresa.servicios.includes("citas"));
  if (!permitido) {
    throw new Error("No autorizado.");
  }
  return createSupabaseServerClient();
}

function revalidar() {
  revalidatePath("/dashboard/citas", "layout");
}

const esFecha = (valor: string) => /^\d{4}-\d{2}-\d{2}$/.test(valor);
const esHora = (valor: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);

// ---------- Agenda ----------

export async function horariosDisponibles(empresaId: number, fecha: string, servicioId: number): Promise<string[]> {
  const supabase = await requireCitas(empresaId);
  if (!esFecha(fecha)) return [];

  const [config, { data: servicio }, { data: citas }] = await Promise.all([
    obtenerConfig(supabase, empresaId),
    supabase
      .from("gl_agenda_servicios")
      .select("duracion_min")
      .eq("id", servicioId)
      .eq("empresa_id", empresaId)
      .maybeSingle(),
    supabase
      .from("gl_agenda_citas")
      .select("inicio, fin")
      .eq("empresa_id", empresaId)
      .in("estado", ["pendiente", "confirmada"])
      .gte("inicio", inicioDiaMx(fecha))
      .lt("inicio", inicioDiaMx(sumarDias(fecha, 1))),
  ]);
  if (!servicio) return [];

  let ahoraMin: number | null = null;
  if (fecha === hoyMx()) {
    const [h, m] = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "America/Mexico_City",
    })
      .format(new Date())
      .split(":")
      .map(Number);
    ahoraMin = h * 60 + m;
  }

  return calcularHorarios(fecha, config, servicio.duracion_min, citas ?? [], ahoraMin);
}

export async function crearCita(empresaId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await requireCitas(empresaId);
  const servicioId = Number(formData.get("servicio_id"));
  const fecha = String(formData.get("fecha") ?? "");
  const hora = String(formData.get("hora") ?? "");
  const nombre = String(formData.get("cliente_nombre") ?? "").trim();

  if (!Number.isInteger(servicioId) || servicioId <= 0) return { ok: false, message: "Elige un servicio." };
  if (!esFecha(fecha) || !esHora(hora)) return { ok: false, message: "Elige el día y la hora." };
  if (!nombre) return { ok: false, message: "Escribe el nombre del cliente." };

  const { error } = await supabase.rpc("gl_agenda_crear_cita", {
    p_empresa_id: empresaId,
    p_servicio_id: servicioId,
    // CDMX es UTC-6 todo el año.
    p_inicio: `${fecha}T${hora}:00-06:00`,
    p_cliente_nombre: nombre.slice(0, 120),
    p_cliente_telefono: String(formData.get("cliente_telefono") ?? "").slice(0, 30),
    p_notas: String(formData.get("notas") ?? "").slice(0, 500),
  });
  if (error) return { ok: false, message: error.message };

  revalidar();
  redirect(`/dashboard/citas?empresa=${empresaId}&fecha=${fecha}`);
}

const ESTADOS: EstadoCita[] = ["pendiente", "confirmada", "completada", "cancelada", "no_asistio"];

export async function cambiarEstadoCita(empresaId: number, citaId: number, estado: EstadoCita) {
  const supabase = await requireCitas(empresaId);
  if (!ESTADOS.includes(estado)) throw new Error("Estado no válido.");
  const { error } = await supabase
    .from("gl_agenda_citas")
    .update({ estado })
    .eq("id", citaId)
    .eq("empresa_id", empresaId);
  if (error) throw new Error(error.message);
  revalidar();
}

// ---------- Servicios ----------

export async function guardarServicioAgenda(
  empresaId: number,
  servicioId: number | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireCitas(empresaId);
  const nombre = String(formData.get("nombre") ?? "").trim();
  const duracion = Number(formData.get("duracion_min"));
  const precio = Number(String(formData.get("precio") ?? "").trim() || 0);

  if (!nombre || nombre.length > 80) return { ok: false, message: "Escribe el nombre del servicio." };
  if (!Number.isInteger(duracion) || duracion < 5 || duracion > 480)
    return { ok: false, message: "Duración no válida." };
  if (!Number.isFinite(precio) || precio < 0) return { ok: false, message: "Precio no válido." };

  const datos = { nombre, duracion_min: duracion, precio };
  const { error } =
    servicioId === null
      ? await supabase.from("gl_agenda_servicios").insert({ ...datos, empresa_id: empresaId })
      : await supabase.from("gl_agenda_servicios").update(datos).eq("id", servicioId).eq("empresa_id", empresaId);
  if (error) return { ok: false, message: `No se pudo guardar: ${error.message}` };

  revalidar();
  return { ok: true, message: servicioId === null ? `“${nombre}” agregado.` : "Servicio guardado." };
}

export async function cambiarEstadoServicioAgenda(empresaId: number, servicioId: number, activo: boolean) {
  const supabase = await requireCitas(empresaId);
  await supabase.from("gl_agenda_servicios").update({ activo }).eq("id", servicioId).eq("empresa_id", empresaId);
  revalidar();
}

// ---------- Horario ----------

export async function guardarHorario(empresaId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await requireCitas(empresaId);
  const intervalo = Number(formData.get("intervalo_min"));
  const capacidad = Number(formData.get("capacidad"));
  if (![10, 15, 20, 30, 45, 60].includes(intervalo)) return { ok: false, message: "Intervalo no válido." };
  if (!Number.isInteger(capacidad) || capacidad < 1 || capacidad > 20) {
    return { ok: false, message: "Las citas a la vez deben ser entre 1 y 20." };
  }

  const horario: Horario = {};
  for (const dia of DIAS_SEMANA) {
    if (formData.get(`abierto_${dia.key}`) !== "on") {
      horario[dia.key] = null;
      continue;
    }
    const abre = String(formData.get(`abre_${dia.key}`) ?? "");
    const cierra = String(formData.get(`cierra_${dia.key}`) ?? "");
    if (!esHora(abre) || !esHora(cierra) || abre >= cierra) {
      return { ok: false, message: `Revisa el horario del ${dia.label.toLowerCase()}: debe abrir antes de cerrar.` };
    }
    horario[dia.key] = { abre, cierra };
  }

  const { error } = await supabase
    .from("gl_agenda_config")
    .upsert(
      { empresa_id: empresaId, horario, intervalo_min: intervalo, capacidad, updated_at: new Date().toISOString() },
      { onConflict: "empresa_id" },
    );
  if (error) return { ok: false, message: `No se pudo guardar: ${error.message}` };

  revalidar();
  return { ok: true, message: "Horario guardado." };
}
