// Enlace wa.me con mensaje. Números de 10 dígitos se toman como de México (lada 52).
export function whatsappUrl(telefono: string, mensaje: string) {
  const digitos = telefono.replace(/\D/g, "");
  const numero = digitos.length === 10 ? `52${digitos}` : digitos;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
