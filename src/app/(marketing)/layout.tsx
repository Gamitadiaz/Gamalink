import type { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/next";

import { WhatsAppClickTracker } from "./whatsapp-click-tracker";

// Métricas de visitas solo para las páginas públicas de Gamalink; las páginas de clientes usan las suyas.
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
      <WhatsAppClickTracker />
    </>
  );
}
