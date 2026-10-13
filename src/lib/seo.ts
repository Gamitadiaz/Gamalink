import type { Metadata } from "next";

import { APP_CONFIG } from "@/config/app-config";

export const SITE_URL = "https://gamalink.online";

// Base de Open Graph del sitio. Cada página que define su propio openGraph debe partir de aquí,
// porque Next.js reemplaza el objeto completo en lugar de mezclarlo con el del layout.
export const BASE_OPEN_GRAPH = {
  type: "website",
  locale: "es_MX",
  siteName: APP_CONFIG.name,
} as const;

// Imagen para compartir (src/app/opengraph-image.png). Se repite aquí por la misma razón.
const SHARE_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: APP_CONFIG.meta.title,
};

/** Título, descripción y vista previa al compartir de una página pública de Gamalink. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = `${title} | ${APP_CONFIG.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...BASE_OPEN_GRAPH, title: fullTitle, description, url: path, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [SHARE_IMAGE] },
  };
}
