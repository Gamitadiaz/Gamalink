import type { ReactNode } from "react";

import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

import { getPlantilla } from "../catalogo";

const plantilla = getPlantilla("warm-wood");

export const metadata: Metadata = pageMetadata({
  title: `Plantilla ${plantilla.nombre} para ${plantilla.ideal.replaceAll(" · ", ", ").toLowerCase()}`,
  description: plantilla.desc,
  path: "/plantillas/warm-wood",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
