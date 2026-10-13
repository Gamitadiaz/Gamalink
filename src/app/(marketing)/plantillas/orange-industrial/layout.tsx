import type { ReactNode } from "react";

import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

import { getPlantilla } from "../catalogo";

const plantilla = getPlantilla("orange-industrial");

export const metadata: Metadata = pageMetadata({
  title: `Plantilla ${plantilla.nombre} para ${plantilla.ideal.replaceAll(" · ", ", ").toLowerCase()}`,
  description: plantilla.desc,
  path: "/plantillas/orange-industrial",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
