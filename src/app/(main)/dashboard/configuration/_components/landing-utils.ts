import type { JsonValue } from "./content-editor";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg"]);
const RESERVED_SUBDOMAINS = new Set(["admin", "app", "www"]);

export const LANDING_COLUMNS =
  "id, empresa_id, template_key, slug, custom_domain, status, content, created_at, updated_at";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function isValidSlug(value: string) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) && !RESERVED_SUBDOMAINS.has(value);
}

export function getImageStoragePath(publicUrl: string) {
  try {
    const url = new URL(publicUrl);
    const prefix = "/storage/v1/object/public/gl-landing-images/";
    return url.pathname.startsWith(prefix) ? decodeURIComponent(url.pathname.slice(prefix.length)) : null;
  } catch {
    return null;
  }
}

export function isValidDomain(value: string) {
  if (!value) {
    return true;
  }
  const normalized = value.trim().toLowerCase();
  const labels = normalized.split(".");
  return (
    normalized.length <= 253 &&
    labels.length >= 2 &&
    !normalized.endsWith(".gamalink.online") &&
    !normalized.endsWith(".localhost") &&
    !normalized.endsWith(".vercel.app") &&
    normalized !== "gamalink.online" &&
    labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
  );
}

// 23505 = unique_violation de Postgres; el mensaje trae el nombre del índice/constraint.
export function describeLandingError(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    if (error.message.includes("custom_domain")) {
      return "Ese dominio ya está en uso por otra landing.";
    }
    if (error.message.includes("slug")) {
      return "Ese subdominio ya está en uso. Elige otro.";
    }
  }
  return error.message;
}

export function getImages(value: JsonValue): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value) || !Array.isArray(value.imagenes)) {
    return [];
  }
  return value.imagenes.filter((image): image is string => typeof image === "string");
}
