"use client";

import { useEffect } from "react";

import { track } from "@vercel/analytics";

// Cuenta los clics a WhatsApp en las páginas públicas de Gamalink (evento "WhatsApp" en Vercel Analytics).
export function WhatsAppClickTracker() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      const link = event.target.closest("a[href]");
      if (link instanceof HTMLAnchorElement && new URL(link.href).hostname === "wa.me") {
        track("WhatsApp", { pagina: window.location.pathname });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
