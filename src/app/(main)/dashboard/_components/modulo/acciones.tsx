import type { ReactNode } from "react";

import { Download } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

// Descarga un CSV de /dashboard/<modulo>/exportar. Es un enlace normal: no necesita JavaScript.
export function BotonExportar({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className={buttonVariants({ size: "sm", variant: "outline" })} download href={href}>
      <Download data-icon="inline-start" />
      {children}
    </a>
  );
}
