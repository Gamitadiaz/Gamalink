"use client";

import { useEffect } from "react";

import { createBrowserClient } from "@supabase/ssr";

function getVisitorId() {
  const existingId = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("gl_visitor_id="))
    ?.split("=")[1];

  if (existingId) {
    return existingId;
  }

  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  const visitorId = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const domain = window.location.hostname.endsWith(".gamalink.online") ? "; Domain=.gamalink.online" : "";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `gl_visitor_id=${visitorId}; Path=/; Max-Age=31536000; SameSite=Lax${domain}${secure}`;
  return visitorId;
}

function getVisitSource() {
  const utmSource = new URLSearchParams(window.location.search).get("utm_source")?.trim().toLowerCase();

  if (utmSource) {
    return utmSource.slice(0, 128);
  }

  if (!document.referrer) {
    return "Directo";
  }

  try {
    return new URL(document.referrer).hostname.slice(0, 128);
  } catch {
    return "Directo";
  }
}

export function useAnalytics(empresaId?: number, landingId?: string) {
  useEffect(() => {
    if (!empresaId || !landingId) {
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("No se pueden registrar analíticas: faltan las variables públicas de Supabase.");
      return;
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
    const visitorId = getVisitorId();
    const source = getVisitSource();

    const recordEvent = (eventType: string) => {
      void supabase
        .from("gl_analytics_events")
        .insert({
          empresa_id: empresaId,
          landing_id: landingId,
          event_type: eventType,
          path: window.location.pathname.slice(0, 500),
          source,
          visitor_id: visitorId,
        })
        .then(
          ({ error }) => {
            if (error) {
              console.error("No se pudo registrar el evento de la landing:", error.message);
            }
          },
          (error: unknown) => {
            console.error("Falló la solicitud de analíticas de la landing:", error);
          },
        );
    };

    const handlePageClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const target = event.target.closest("a, button, [role='button']");
      if (!target) {
        return;
      }

      const href = target instanceof HTMLAnchorElement ? target.getAttribute("href") || "" : "";
      if (href.startsWith("#")) {
        return;
      }

      let eventType = "interaction_click";
      if (href) {
        const url = new URL(href, window.location.href);
        if (["wa.me", "api.whatsapp.com", "whatsapp.com"].includes(url.hostname)) {
          eventType = "whatsapp_click";
        } else if (url.hostname === "instagram.com" || url.hostname.endsWith(".instagram.com")) {
          eventType = "instagram_click";
        } else if (url.hostname === "facebook.com" || url.hostname.endsWith(".facebook.com")) {
          eventType = "facebook_click";
        } else if (url.protocol === "tel:") {
          eventType = "phone_click";
        } else if (url.protocol === "mailto:") {
          eventType = "email_click";
        }
      }

      recordEvent(eventType);
    };

    recordEvent("page_view");
    document.addEventListener("click", handlePageClick);

    return () => document.removeEventListener("click", handlePageClick);
  }, [empresaId, landingId]);
}
