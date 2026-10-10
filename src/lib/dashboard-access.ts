import { isSuperadminUserId } from "@/lib/landings/superadmin";
import type { NavGroup, NavMainItem } from "@/navigation/sidebar/sidebar-items";

export type AppRole = "superadmin" | "dueno" | "empleado";
export type Servicio = "landing" | "membresias" | "citas" | "tienda";

export type AccessContext = {
  role: AppRole;
  // Servicios activos de las empresas del usuario (unión si tiene varias).
  servicios: Servicio[];
};

export type EmpresaContext = { id: number; nombre: string; servicios: Servicio[] };

const SERVICIOS: Servicio[] = ["landing", "membresias", "citas", "tienda"];

// Rutas que requieren revisar el rol (además de estar logueado).
const PROTECTED_PREFIXES = ["/dashboard", "/mail", "/chat"];

// Lo que ve cualquier dueño o empleado, sin importar sus servicios.
const COMMON_ROUTES = ["/dashboard/default", "/dashboard/profile"];

// Lo que se desbloquea con cada servicio contratado.
const SERVICE_ROUTES: Record<Servicio, string[]> = {
  landing: ["/dashboard/configuration", "/dashboard/landing-analytics"],
  membresias: ["/dashboard/membresias"],
  citas: [],
  tienda: [],
};

export function normalizeRole(userId?: string | null, rawRole?: string | null): AppRole {
  // La cuenta dueña de Gamalink siempre es superadmin, igual que gl_is_superadmin() en la BD.
  if (isSuperadminUserId(userId ?? undefined)) {
    return "superadmin";
  }

  const role = (rawRole ?? "").trim().toLowerCase();
  if (role === "superadmin" || role === "empleado") {
    return role;
  }
  // 'dueno' y los roles antiguos ('admin', 'cliente') son dueños de su empresa.
  return "dueno";
}

// Interpreta la respuesta de la función gl_mi_contexto() de Supabase.
export function parseContext(userId: string, raw: unknown): AccessContext & { empresas: EmpresaContext[] } {
  const data = (raw ?? {}) as { role?: unknown; empresas?: unknown };
  const empresas = (Array.isArray(data.empresas) ? data.empresas : []).map((item) => {
    const empresa = item as { id?: unknown; nombre?: unknown; servicios?: unknown };
    return {
      id: Number(empresa.id),
      nombre: typeof empresa.nombre === "string" ? empresa.nombre : `Empresa ${empresa.id}`,
      servicios: (Array.isArray(empresa.servicios) ? empresa.servicios : []).filter((s): s is Servicio =>
        SERVICIOS.includes(s as Servicio),
      ),
    };
  });

  return {
    role: normalizeRole(userId, typeof data.role === "string" ? data.role : null),
    empresas,
    servicios: [...new Set(empresas.flatMap((empresa) => empresa.servicios))],
  };
}

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isProtectedAppRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => matchesRoute(pathname, prefix));
}

export function isRouteAllowed(pathname: string, access: AccessContext): boolean {
  if (access.role === "superadmin") {
    return true;
  }

  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const path = normalizedPath === "/dashboard" ? "/dashboard/default" : normalizedPath;
  const allowed = [...COMMON_ROUTES, ...access.servicios.flatMap((servicio) => SERVICE_ROUTES[servicio])];

  return allowed.some((route) => matchesRoute(path, route));
}

export function filterAccessibleSidebarItems(items: NavGroup[], access: AccessContext): NavGroup[] {
  return items
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => {
          if (item.subItems) {
            const filteredSubItems = item.subItems.filter((subItem) => isRouteAllowed(subItem.url, access));
            if (filteredSubItems.length === 0) {
              return null;
            }
            return {
              ...item,
              subItems: filteredSubItems,
            } satisfies NavMainItem;
          }

          if (!item.url) {
            return item;
          }

          return isRouteAllowed(item.url, access) ? item : null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    }))
    .filter((group) => group.items.length > 0);
}
