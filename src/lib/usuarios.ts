// Usuarios sin correo: Supabase exige un correo, así que se les asigna uno interno con este dominio.
// Nunca se les envía nada (la cuenta se crea ya confirmada) y la app muestra solo el "usuario".
export const DOMINIO_USUARIOS = "usuarios.gamalink.online";

// 3 a 30 caracteres: minúsculas, números, punto, guion y guion bajo; empieza con letra o número.
export const USUARIO_REGEX = /^[a-z0-9][a-z0-9._-]{2,29}$/;

export function correoDeUsuario(usuario: string) {
  return `${usuario.trim().toLowerCase()}@${DOMINIO_USUARIOS}`;
}

// "tiluli@usuarios.gamalink.online" → "tiluli"; un correo real → null.
export function usuarioDeCorreo(correo: string | null | undefined) {
  const sufijo = `@${DOMINIO_USUARIOS}`;
  return correo?.toLowerCase().endsWith(sufijo) ? correo.slice(0, -sufijo.length) : null;
}

// Lo que se le muestra a la persona: su usuario si no tiene correo, o su correo.
export function identificadorVisible(correo: string | null | undefined) {
  return usuarioDeCorreo(correo) ?? correo ?? "";
}

// Lo que escribió en el login (usuario o correo) → correo para Supabase.
export function correoParaLogin(entrada: string) {
  const limpio = entrada.trim().toLowerCase();
  return limpio.includes("@") ? limpio : correoDeUsuario(limpio);
}
