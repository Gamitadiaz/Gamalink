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
import { correoDeUsuario, identificadorVisible, USUARIO_REGEX } from "@/lib/usuarios";

import { randomInt } from "node:crypto";

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

  const telefono =
    String(formData.get("contacto_telefono") ?? "")
      .trim()
      .slice(0, 30) || null;

  const { error } = await supabase
    .from("gl_empresas")
    .update({ nombre_negocio: nombre, estado, contacto_telefono: telefono })
    .eq("id", empresaId);
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

// ---------- Usuarios sin correo y contraseñas temporales ----------

export type CredencialState = { ok: boolean; message: string; usuario?: string; password?: string } | null;

// Sin letras/números que se confundan al dictarlos o copiarlos (0/O, 1/l/I).
const ALFABETO = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function contrasenaTemporal() {
  return Array.from({ length: 10 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
}

const sinCorreoSchema = z.object({
  nombre: z.string().trim().min(1, "Escribe el nombre del dueño.").max(120),
  usuario: z
    .string()
    .trim()
    .toLowerCase()
    .regex(USUARIO_REGEX, "El usuario debe tener de 3 a 30 caracteres: letras, números, punto, guion o guion bajo."),
});

export async function crearDuenoSinCorreo(
  empresaId: number,
  _prev: CredencialState,
  formData: FormData,
): Promise<CredencialState> {
  const supabase = await requireSuperadmin();
  const parsed = sinCorreoSchema.safeParse({ nombre: formData.get("nombre"), usuario: formData.get("usuario") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }
  const { nombre, usuario } = parsed.data;
  const correo = correoDeUsuario(usuario);

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { ok: false, message: "Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno." };
  }

  const { data: existente } = await supabase.from("gl_usuarios").select("id").eq("correo", correo).maybeSingle();
  if (existente) {
    return { ok: false, message: `El usuario “${usuario}” ya existe. Elige otro.` };
  }

  const password = contrasenaTemporal();
  // email_confirm: la cuenta queda lista sin mandar ningún correo (el dominio es interno).
  const { data: creado, error: createError } = await admin.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
    user_metadata: { full_name: nombre, usuario, debe_cambiar_contrasena: true },
  });
  if (createError) {
    const yaExiste = createError.message.toLowerCase().includes("already");
    return { ok: false, message: yaExiste ? `El usuario “${usuario}” ya existe.` : createError.message };
  }

  const { error: insertError } = await supabase.from("gl_usuarios").insert({
    empresa_id: empresaId,
    nombre,
    correo,
    auth_id: creado.user.id,
    role_slug: "dueno",
  });
  if (insertError) {
    await admin.auth.admin.deleteUser(creado.user.id);
    return { ok: false, message: `No se pudo vincular el usuario a la empresa: ${insertError.message}` };
  }

  revalidatePath(`/dashboard/empresas/${empresaId}`);
  return { ok: true, message: "Usuario creado.", usuario, password };
}

export async function restablecerContrasena(
  empresaId: number,
  usuarioId: number,
): Promise<NonNullable<CredencialState>> {
  const supabase = await requireSuperadmin();
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { ok: false, message: "Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno." };
  }

  const { data: fila } = await supabase
    .from("gl_usuarios")
    .select("auth_id, correo")
    .eq("id", usuarioId)
    .eq("empresa_id", empresaId)
    .maybeSingle();
  if (!fila?.auth_id) {
    return { ok: false, message: "Este usuario no tiene cuenta todavía." };
  }

  const password = contrasenaTemporal();
  const { error } = await admin.auth.admin.updateUserById(fila.auth_id, {
    password,
    user_metadata: { debe_cambiar_contrasena: true },
  });
  if (error) {
    return { ok: false, message: `No se pudo restablecer: ${error.message}` };
  }

  return { ok: true, message: "Contraseña restablecida.", usuario: identificadorVisible(fila.correo), password };
}
