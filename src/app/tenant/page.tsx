import { cache } from "react";

import { notFound } from "next/navigation";

import type { Metadata } from "next";

import BoldRedTemplate from "@/app/(marketing)/plantillas/bold-red/page";
import CleanWhiteTemplate from "@/app/(marketing)/plantillas/clean-white/page";
import DarkPurpleTemplate from "@/app/(marketing)/plantillas/dark-purple/page";
import OrangeIndustrialTemplate from "@/app/(marketing)/plantillas/orange-industrial/page";
import WarmWoodTemplate from "@/app/(marketing)/plantillas/warm-wood/page";
import { isLandingContent, isLandingTemplateKey } from "@/lib/landings/model";
import { createLandingReadClient } from "@/lib/landings/public-client";

export const dynamic = "force-dynamic";

type TenantPageProps = {
  searchParams: Promise<{ host?: string }>;
};

const templateLabels = {
  "bold-red": "Bold Red",
  "clean-white": "Clean White",
  "dark-purple": "Dark Purple",
  "orange-industrial": "Orange Industrial",
  "warm-wood": "Warm Wood",
} as const;

// Una sola consulta por visita: la comparten generateMetadata y la página.
const getLanding = cache(async (requestedHost: string | undefined) => {
  const host = requestedHost?.toLowerCase().replace(/\.$/, "");

  if (!host || !/^[a-z0-9.-]{1,253}$/.test(host)) {
    notFound();
  }

  // slug.gamalink.online en producción, slug.localhost en desarrollo.
  const tenantSuffix = [".gamalink.online", ".localhost"].find((suffix) => host.endsWith(suffix));
  const slug = tenantSuffix ? host.slice(0, -tenantSuffix.length) : null;
  if (slug?.includes(".")) {
    notFound();
  }

  // Un dominio propio debe abrir igual con y sin "www.", sin importar cómo se haya guardado.
  const bareHost = host.replace(/^www\./, "");
  const domainVariants = [bareHost, `www.${bareHost}`];

  const supabase = createLandingReadClient();
  const query = supabase
    .from("gl_landings")
    .select("id, empresa_id, template_key, content")
    .eq("status", "published")
    .limit(1);
  const { data: landing, error } = slug
    ? await query.eq("slug", slug).maybeSingle()
    : await query.in("custom_domain", domainVariants).maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar la landing para ${host}: ${error.message}`);
  }

  if (!landing || !isLandingTemplateKey(landing.template_key)) {
    notFound();
  }

  return { host, isTrialSubdomain: slug !== null, landing: { ...landing, template_key: landing.template_key } };
});

function contentText(content: unknown, field: string) {
  const value = content && typeof content === "object" ? (content as Record<string, unknown>)[field] : undefined;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

// Al compartir la página de un cliente se ve su negocio, no Gamalink.
export async function generateMetadata({ searchParams }: TenantPageProps): Promise<Metadata> {
  const { host: requestedHost } = await searchParams;
  const { host, isTrialSubdomain, landing } = await getLanding(requestedHost);
  const { content } = landing;

  const nombre = contentText(content, "nombre") ?? "Mi negocio";
  const tipo = contentText(content, "tipo");
  const title = tipo ? `${nombre} | ${tipo}` : nombre;
  const description =
    contentText(content, "descripcion") ?? contentText(content, "subtitulo") ?? contentText(content, "slogan");
  const imagenes = content && typeof content === "object" ? (content as Record<string, unknown>).imagenes : undefined;
  const image = Array.isArray(imagenes)
    ? imagenes.find((url) => typeof url === "string" && url.startsWith("https://"))
    : undefined;
  const images = image ? [{ url: image as string, alt: nombre }] : [];

  return {
    metadataBase: new URL(`https://${host}`),
    title: { absolute: title },
    description,
    applicationName: nombre,
    alternates: { canonical: "/" },
    // Los subdominios de gamalink.online son pruebas gratuitas: no deben aparecer en Google.
    robots: isTrialSubdomain ? { index: false, follow: false } : undefined,
    openGraph: { type: "website", locale: "es_MX", siteName: nombre, title, description, url: "/", images },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images },
  };
}

export default async function TenantLandingPage({ searchParams }: TenantPageProps) {
  const { host: requestedHost } = await searchParams;
  const { landing } = await getLanding(requestedHost);

  switch (landing.template_key) {
    case "bold-red":
      if (!isLandingContent("bold-red", landing.content)) {
        throw new Error(`El contenido guardado para la plantilla ${templateLabels["bold-red"]} no es válido.`);
      }
      return (
        <BoldRedTemplate business={landing.content} empresaId={Number(landing.empresa_id)} landingId={landing.id} />
      );
    case "clean-white":
      if (!isLandingContent("clean-white", landing.content)) {
        throw new Error(`El contenido guardado para la plantilla ${templateLabels["clean-white"]} no es válido.`);
      }
      return (
        <CleanWhiteTemplate business={landing.content} empresaId={Number(landing.empresa_id)} landingId={landing.id} />
      );
    case "dark-purple":
      if (!isLandingContent("dark-purple", landing.content)) {
        throw new Error(`El contenido guardado para la plantilla ${templateLabels["dark-purple"]} no es válido.`);
      }
      return (
        <DarkPurpleTemplate business={landing.content} empresaId={Number(landing.empresa_id)} landingId={landing.id} />
      );
    case "orange-industrial":
      if (!isLandingContent("orange-industrial", landing.content)) {
        throw new Error(`El contenido guardado para la plantilla ${templateLabels["orange-industrial"]} no es válido.`);
      }
      return (
        <OrangeIndustrialTemplate
          business={landing.content}
          empresaId={Number(landing.empresa_id)}
          landingId={landing.id}
        />
      );
    case "warm-wood":
      if (!isLandingContent("warm-wood", landing.content)) {
        throw new Error(`El contenido guardado para la plantilla ${templateLabels["warm-wood"]} no es válido.`);
      }
      return (
        <WarmWoodTemplate business={landing.content} empresaId={Number(landing.empresa_id)} landingId={landing.id} />
      );
  }
}
