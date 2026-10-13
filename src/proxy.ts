import { type NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

import { isProtectedAppRoute, isRouteAllowed, parseContext } from "@/lib/dashboard-access";

export async function proxy(request: NextRequest) {
  const host = request.nextUrl.hostname.toLowerCase().replace(/\.$/, "");
  const isRootHost = ["gamalink.online", "www.gamalink.online", "localhost", "127.0.0.1"].includes(host);
  const isVercelHost = host.endsWith(".vercel.app");
  const isReservedSubdomain = ["app.gamalink.online", "admin.gamalink.online"].includes(host);
  const isTenantSubdomain =
    (host.endsWith(".gamalink.online") && !isReservedSubdomain && host !== "www.gamalink.online") ||
    host.endsWith(".localhost");
  const isCustomDomain = !isRootHost && !isVercelHost && !isReservedSubdomain && !isTenantSubdomain;

  if (isTenantSubdomain || isCustomDomain) {
    const landingUrl = request.nextUrl.clone();
    landingUrl.pathname = "/tenant";
    landingUrl.searchParams.set("host", host);
    return NextResponse.rewrite(landingUrl);
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Registro oculto (las cuentas las crea Gamalink) y páginas de acceso de la plantilla (/v2): todo va al login.
  const hiddenAuthRoutes = ["/register", "/v2"];
  if (hiddenAuthRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.redirect(new URL(user ? "/dashboard" : "/login", request.url));
  }

  // Solo el panel pide sesión. Lo demás es público, y una dirección que no existe muestra la página 404.
  if (!user && isProtectedAppRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname.startsWith("/login")) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (user && isProtectedAppRoute(pathname)) {
    // Misma fuente que el layout y el sidebar: rol + servicios activos de la empresa.
    const { data: context } = await supabase.rpc("gl_mi_contexto");

    if (!isRouteAllowed(pathname, parseContext(user.id, context))) {
      const unauthorizedUrl = new URL("/unauthorized", request.url);
      const redirectResponse = NextResponse.redirect(unauthorizedUrl);
      // Conserva las cookies de sesión que Supabase haya refrescado en esta petición.
      for (const cookie of supabaseResponse.cookies.getAll()) {
        redirectResponse.cookies.set(cookie);
      }
      return redirectResponse;
    }
  }

  return supabaseResponse;
}

export const config = {
  // robots.txt y sitemap.xml quedan fuera para que Google los lea sin sesión.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
