import type { MetadataRoute } from "next";

const SITE_URL = "https://gamalink.online";

// Solo páginas públicas de Gamalink. El panel (/dashboard) requiere sesión y no se anuncia.
const PUBLIC_ROUTES = [
  "/precios",
  "/plantillas",
  "/plantillas/bold-red",
  "/plantillas/clean-white",
  "/plantillas/dark-purple",
  "/plantillas/orange-industrial",
  "/plantillas/warm-wood",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
  }));
}
