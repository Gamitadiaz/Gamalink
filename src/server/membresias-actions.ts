"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ActionState } from "@/lib/empresas";
import { hoyMx, METODOS_PAGO, type MetodoPago, sumarDias } from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { getSessionContext } from "@/lib/session";

// Superadmin, o usuario de la empresa con el servicio activo. RLS lo vuelve a comprobar.
async function requireMembresias(empresaId: number) {
  const session = await getSessionContext();
  const permitido =
    session?.role === "superadmin" ||
    session?.empresas.some((empresa) => empresa.id === empresaId && empresa.servicios.includes("membresias"));
  if (!permitido) {
    throw new Error("No autorizado.");
  }
  return createSupabaseServerClient();
}

function revalidar() {
  revalidatePath("/dashboard/membresias", "layout");
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

function esFecha(valor: string | null): valor is string {
  return valor !== null && /^\d{4}-\d{2}-\d{2}$/.test(valor);
}

// ---------- Planes ----------

export async function crearPlan(empresaId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await requireMembresias(empresaId);
  const nombre = texto(formData, "nombre", 80);
  const precio = numero(formData, "precio");
  const duracion = numero(formData, "duracion_dias");

  if (!nombre) return { ok: false, message: "Escribe el nombre del plan." };
  if (precio === null || Number.isNaN(precio) || precio < 0) return { ok: false, message: "Precio no válido." };
  if (duracion === null || !Number.isInteger(duracion) || duracion < 1 || duracion > 3660) {
    return { ok: false, message: "La duración debe ser un número de días entre 1 y 3660." };
  }

  const { error } = await supabase
    .from("gl_planes_membresia")
    .insert({ empresa_id: empresaId, nombre, precio, duracion_dias: duracion });
  if (error) return { ok: false, message: `No se pudo crear el plan: ${error.message}` };

  revalidar();
  return { ok: true, message: `Plan “${nombre}” creado.` };
}

export async function cambiarEstadoPlan(empresaId: number, planId: number, activo: boolean) {
  const supabase = await requireMembresias(empresaId);
  await supabase.from("gl_planes_membresia").update({ activo }).eq("id", planId).eq("empresa_id", empresaId);
  revalidar();
}

// ---------- Pagos ----------

type NuevoPago = {
  planId: number | null;
  monto: number;
  metodo: MetodoPago;
  fechaPago: string;
  vigenteHasta: string | null;
  notas: string | null;
};

async function insertarPago(
  supabase: SupabaseClient,
  empresaId: number,
  socioId: number,
  pago: NuevoPago,
): Promise<ActionState> {
  let duracion: number | null = null;
  if (pago.planId !== null) {
    const { data: plan } = await supabase
      .from("gl_planes_membresia")
      .select("duracion_dias")
      .eq("id", pago.planId)
      .eq("empresa_id", empresaId)
      .maybeSingle();
    if (!plan) return { ok: false, message: "El plan no existe." };
    duracion = plan.duracion_dias;
  }

  // La membresía nueva empieza al terminar la actual (si sigue vigente) o desde hoy.
  const { data: ultimo } = await supabase
    .from("gl_pagos_socios")
    .select("vigente_hasta")
    .eq("socio_id", socioId)
    .order("vigente_hasta", { ascending: false })
    .limit(1)
    .maybeSingle();
  const hoy = hoyMx();
  const desde = ultimo && ultimo.vigente_hasta >= hoy ? sumarDias(ultimo.vigente_hasta, 1) : hoy;
  const hasta = duracion !== null ? sumarDias(desde, duracion - 1) : pago.vigenteHasta;

  if (!esFecha(hasta) || hasta < desde) {
    return { ok: false, message: "Elige un plan o una fecha de vencimiento posterior al inicio." };
  }

  const { error } = await supabase.from("gl_pagos_socios").insert({
    empresa_id: empresaId,
    socio_id: socioId,
    plan_id: pago.planId,
    monto: pago.monto,
    metodo: pago.metodo,
    fecha_pago: pago.fechaPago,
    vigente_desde: desde,
    vigente_hasta: hasta,
    notas: pago.notas,
  });
  if (error) return { ok: false, message: `No se pudo registrar el pago: ${error.message}` };
  return { ok: true, message: "Pago registrado." };
}

function leerPago(formData: FormData): NuevoPago | string {
  const planRaw = String(formData.get("plan_id") ?? "");
  const planId = planRaw === "" ? null : Number(planRaw);
  const monto = numero(formData, "monto");
  const metodo = String(formData.get("metodo") ?? "efectivo") as MetodoPago;
  const fechaPago = texto(formData, "fecha_pago", 10) ?? hoyMx();
  const vigenteHasta = texto(formData, "vigente_hasta", 10);

  if (planId !== null && !Number.isInteger(planId)) return "Plan no válido.";
  if (monto === null || Number.isNaN(monto) || monto < 0) return "Escribe el monto pagado.";
  if (!METODOS_PAGO.some((item) => item.key === metodo)) return "Método de pago no válido.";
  if (!esFecha(fechaPago)) return "Fecha de pago no válida.";
  return { planId, monto, metodo, fechaPago, vigenteHasta, notas: texto(formData, "notas", 500) };
}

export async function registrarPago(
  empresaId: number,
  socioId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireMembresias(empresaId);
  const pago = leerPago(formData);
  if (typeof pago === "string") return { ok: false, message: pago };

  const resultado = await insertarPago(supabase, empresaId, socioId, pago);
  if (resultado?.ok) revalidar();
  return resultado;
}

export async function eliminarPago(empresaId: number, pagoId: number) {
  const supabase = await requireMembresias(empresaId);
  await supabase.from("gl_pagos_socios").delete().eq("id", pagoId).eq("empresa_id", empresaId);
  revalidar();
}

// ---------- Socios ----------

export async function crearSocio(empresaId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await requireMembresias(empresaId);
  const nombre = texto(formData, "nombre", 120);
  if (!nombre) return { ok: false, message: "Escribe el nombre del socio." };

  // Si eligieron plan (o un pago personalizado), se registra también el primer pago.
  const conPago = String(formData.get("plan_id") ?? "") !== "" || formData.get("personalizado") === "1";
  const pago = conPago ? leerPago(formData) : null;
  if (typeof pago === "string") return { ok: false, message: pago };

  const { data: socio, error } = await supabase
    .from("gl_socios")
    .insert({
      empresa_id: empresaId,
      nombre,
      telefono: texto(formData, "telefono", 30),
      correo: texto(formData, "correo", 200),
      notas: texto(formData, "notas_socio", 1000),
    })
    .select("id")
    .single();
  if (error) return { ok: false, message: `No se pudo crear el socio: ${error.message}` };

  if (pago) {
    const resultado = await insertarPago(supabase, empresaId, socio.id, pago);
    if (!resultado?.ok) {
      revalidar();
      return { ok: false, message: `El socio se creó, pero el pago falló: ${resultado?.message}` };
    }
  }

  revalidar();
  redirect(`/dashboard/membresias/socios/${socio.id}?empresa=${empresaId}`);
}

export async function actualizarSocio(
  empresaId: number,
  socioId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireMembresias(empresaId);
  const nombre = texto(formData, "nombre", 120);
  if (!nombre) return { ok: false, message: "Escribe el nombre del socio." };

  const { error } = await supabase
    .from("gl_socios")
    .update({
      nombre,
      telefono: texto(formData, "telefono", 30),
      correo: texto(formData, "correo", 200),
      notas: texto(formData, "notas_socio", 1000),
    })
    .eq("id", socioId)
    .eq("empresa_id", empresaId);
  if (error) return { ok: false, message: `No se pudo guardar: ${error.message}` };

  revalidar();
  return { ok: true, message: "Datos guardados." };
}

export async function cambiarEstadoSocio(empresaId: number, socioId: number, activo: boolean) {
  const supabase = await requireMembresias(empresaId);
  await supabase.from("gl_socios").update({ activo }).eq("id", socioId).eq("empresa_id", empresaId);
  revalidar();
}
