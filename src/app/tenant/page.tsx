import { notFound } from "next/navigation";

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

export default async function TenantLandingPage({ searchParams }: TenantPageProps) {
  const { host: requestedHost } = await searchParams;
  const host = requestedHost?.toLowerCase().replace(/\.$/, "");

  if (!host || !/^[a-z0-9.-]{1,253}$/.test(host)) {
    notFound();
  }

  const isGamalinkSubdomain = host.endsWith(".gamalink.online");
  const slug = isGamalinkSubdomain ? host.slice(0, -".gamalink.online".length) : null;
  if (slug?.includes(".")) {
    notFound();
  }

  const supabase = createLandingReadClient();
  const query = supabase
    .from("gl_landings")
    .select("id, empresa_id, template_key, content")
    .eq("status", "published")
    .limit(1);
  const { data: landing, error } = slug
    ? await query.eq("slug", slug).maybeSingle()
    : await query.eq("custom_domain", host).maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar la landing para ${host}: ${error.message}`);
  }

  if (!landing || !isLandingTemplateKey(landing.template_key)) {
    notFound();
  }

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
