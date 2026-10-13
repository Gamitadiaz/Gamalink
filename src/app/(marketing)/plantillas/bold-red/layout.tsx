import type { ReactNode } from "react";

import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

import { getPlantilla } from "../catalogo";

const plantilla = getPlantilla("bold-red");

export const metadata: Metadata = pageMetadata({
  title: `Plantilla ${plantilla.nombre} para ${plantilla.ideal.replaceAll(" · ", ", ").toLowerCase()}`,
  description: plantilla.desc,
  path: "/plantillas/bold-red",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
