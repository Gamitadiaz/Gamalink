"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { z } from "zod";

import type { Servicio } from "@/lib/dashboard-access";
import { type ActionState, ESTADOS_EMPRESA, ESTADOS_SERVICIO, SERVICIOS } from "@/lib/empresas";
import { createSupabaseAdminClient } from "@/lib/sb/admin";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { getSessionContext } from "@/lib/session";

// Toda acción de este archivo es solo para el superadmin. Las escrituras usan la sesión del
// usuario, así que RLS vuelve a comprobarlo en la base de datos.
async function requireSuperadmin() {
  const session = await getSessionContext();
  if (session?.role !== "superadmin") {
    throw new Error("No autorizado.");
  }
  return createSupabaseServerClient();
}

function isServicio(value: unknown): value is Servicio {
  return SERVICIOS.some((item) => item.key === value);
}

export async function crearEmpresa(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await requireSuperadmin();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const servicios = formData.getAll("servicios").filter(isServicio);

  if (!nombre || nombre.length > 120) {
    return { ok: false, message: "Escribe el nombre del negocio (máximo 120 caracteres)." };
  }

  const { data: empresa, error } = await supabase
    .from("gl_empresas")
    .insert({ nombre_negocio: nombre, estado: "Activo" })
    .select("id")
    .single();
  if (error) {
    return { ok: false, message: `No se pudo crear la empresa: ${error.message}` };
  }

  if (servicios.length > 0) {
    const { error: serviciosError } = await supabase
      .from("gl_empresa_servicios")
      .insert(servicios.map((servicio) => ({ empresa_id: empresa.id, servicio })));
    if (serviciosError) {
      return {
        ok: false,
        message: `La empresa se creó, pero no se pudieron asignar los servicios: ${serviciosError.message}`,
      };
    }
  }

  revalidatePath("/dashboard/empresas");
  redirect(`/dashboard/empresas/${empresa.id}`);
}

export async function actualizarEmpresa(
  empresaId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireSuperadmin();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const estado = String(formData.get("estado") ?? "");

  if (!nombre || nombre.length > 120) {
    return { ok: false, message: "Escribe el nombre del negocio (máximo 120 caracteres)." };
  }
  if (!ESTADOS_EMPRESA.includes(estado as (typeof ESTADOS_EMPRESA)[number])) {
    return { ok: false, message: "Estado no válido." };
  }

  const { error } = await supabase.from("gl_empresas").update({ nombre_negocio: nombre, estado }).eq("id", empresaId);
  if (error) {
    return { ok: false, message: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath("/dashboard/empresas");
  revalidatePath(`/dashboard/empresas/${empresaId}`);
  return { ok: true, message: "Datos guardados." };
}

export async function guardarServicio(
  empresaId: number,
  servicio: Servicio,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireSuperadmin();
  if (!isServicio(servicio)) {
    return { ok: false, message: "Servicio no válido." };
  }

  const estado = String(formData.get("estado") ?? "");
  const precioRaw = String(formData.get("precio_mensual") ?? "").trim();
  const vencimiento = String(formData.get("fecha_vencimiento") ?? "").trim();

  if (!ESTADOS_SERVICIO.includes(estado as (typeof ESTADOS_SERVICIO)[number])) {
    return { ok: false, message: "Estado no válido." };
  }
  const precio = precioRaw === "" ? null : Number(precioRaw);
  if (precio !== null && (!Number.isFinite(precio) || precio < 0)) {
    return { ok: false, message: "El precio debe ser un número positivo." };
  }
  if (vencimiento && !/^\d{4}-\d{2}-\d{2}$/.test(vencimiento)) {
    return { ok: false, message: "Fecha de vencimiento no válida." };
  }

  const { error } = await supabase.from("gl_empresa_servicios").upsert(
    {
      empresa_id: empresaId,
      servicio,
      estado,
      precio_mensual: precio,
      fecha_vencimiento: vencimiento || null,
    },
    { onConflict: "empresa_id,servicio" },
  );
  if (error) {
    return { ok: false, message: `No se pudo guardar el servicio: ${error.message}` };
  }

  revalidatePath("/dashboard/empresas");
  revalidatePath(`/dashboard/empresas/${empresaId}`);
  return { ok: true, message: "Servicio guardado." };
}

const invitacionSchema = z.object({
  nombre: z.string().trim().min(1, "Escribe el nombre del dueño.").max(120),
  correo: z.email("Escribe un correo válido.").transform((correo) => correo.toLowerCase()),
});

export async function invitarDueno(empresaId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await requireSuperadmin();
  const parsed = invitacionSchema.safeParse({
    nombre: formData.get("nombre"),
    correo: String(formData.get("correo") ?? "").trim(),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }
  const { nombre, correo } = parsed.data;

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return {
      ok: false,
      message:
        "Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno; sin ella no se pueden enviar invitaciones.",
    };
  }

  const { data: existente } = await supabase.from("gl_usuarios").select("id").eq("correo", correo).maybeSingle();
  if (existente) {
    return { ok: false, message: "Ese correo ya pertenece a un usuario de Gamalink." };
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");

  const { data: invitacion, error: inviteError } = await admin.auth.admin.inviteUserByEmail(correo, {
    redirectTo: `${protocol}://${host}/auth/set-password`,
    data: { full_name: nombre },
  });
  if (inviteError) {
    return { ok: false, message: `No se pudo enviar la invitación: ${inviteError.message}` };
  }

  const { error: insertError } = await supabase.from("gl_usuarios").insert({
    empresa_id: empresaId,
    nombre,
    correo,
    auth_id: invitacion.user.id,
    role_slug: "dueno",
  });
  if (insertError) {
    // Sin fila en gl_usuarios el usuario no tendría empresa: deshacemos la invitación.
    await admin.auth.admin.deleteUser(invitacion.user.id);
    return { ok: false, message: `No se pudo vincular el usuario a la empresa: ${insertError.message}` };
  }

  revalidatePath(`/dashboard/empresas/${empresaId}`);
  return { ok: true, message: `Invitación enviada a ${correo}.` };
}
