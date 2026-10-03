"use client";

import { useEffect } from "react";

import { createBrowserClient } from "@supabase/ssr";

export function useAnalytics(empresaId?: number) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  );

  useEffect(() => {
    if (empresaId === undefined) {
      return;
    }

    // Registra la visita al instante de abrir la página
    const recordPageView = async () => {
      // Usamos .then() sin await para no bloquear la interfaz (Fire and Forget)
      supabase
        .from("gl_analytics_events")
        .insert({
          empresa_id: empresaId,
          event_type: "page_view",
          path: window.location.pathname,
          source: document.referrer || "Direct",
        })
        .then();
    };

    void recordPageView();
  }, [empresaId, supabase]);

  // Función exportable para medir botones específicos
  const trackClick = (eventType: string) => {
    if (empresaId === undefined) {
      return;
    }

    supabase
      .from("gl_analytics_events")
      .insert({
        empresa_id: empresaId,
        event_type: eventType,
        path: window.location.pathname,
      })
      .then();
  };

  return { trackClick };
}
