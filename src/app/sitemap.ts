import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

// Solo páginas públicas de Gamalink. El panel (/dashboard) requiere sesión y no se anuncia.
const PUBLIC_ROUTES = [
  "/precios",
  "/plantillas",
  "/plantillas/bold-red",
  "/plantillas/clean-white",
  "/plantillas/dark-purple",
  "/plantillas/orange-industrial",
  "/plantillas/warm-wood",
  "/aviso-de-privacidad",
  "/terminos-y-condiciones",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
  }));
}
