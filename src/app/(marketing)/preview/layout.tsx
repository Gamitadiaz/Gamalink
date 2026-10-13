import type { ReactNode } from "react";

import type { Metadata } from "next";

// Propuestas para negocios específicos: se comparten por link, pero no deben aparecer en Google.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return children;
}
