import { isSuperadminUserId } from "@/lib/landings/superadmin";
import type { NavGroup, NavMainItem } from "@/navigation/sidebar/sidebar-items";

export type AppRole = "superadmin" | "admin" | "cliente";

const ROLE_ALIASES: Record<AppRole, string[]> = {
  superadmin: ["superadmin", "super admin", "super-admin"],
  admin: ["admin", "administrator", "administrador", "owner"],
  cliente: ["cliente", "client", "customer"],
};

export function getUserRole(userId?: string | null, rawRole?: string | null): AppRole {
  if (!userId) {
    return "cliente";
  }

  // La cuenta dueña de Gamalink siempre es superadmin, aunque falle la consulta a gl_usuarios.
  if (isSuperadminUserId(userId)) {
    return "superadmin";
  }

  const normalized = (rawRole ?? "cliente").trim().toLowerCase();

  if (ROLE_ALIASES.superadmin.includes(normalized)) {
    return "superadmin";
  }

  if (ROLE_ALIASES.admin.includes(normalized)) {
    return "admin";
  }

  return "cliente";
}

// Rutas que requieren revisar el rol (además de estar logueado).
const PROTECTED_PREFIXES = ["/dashboard", "/mail", "/chat"];

const ADMIN_DENIED = ["/dashboard/users", "/dashboard/roles"];

const CLIENT_ALLOWED = [
  "/dashboard/default",
  "/dashboard/profile",
  "/dashboard/landing-analytics",
  "/dashboard/configuration",
];

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isProtectedAppRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => matchesRoute(pathname, prefix));
}

function isRouteAllowedForRole(pathname: string, role: AppRole): boolean {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const path = normalizedPath === "/dashboard" ? "/dashboard/default" : normalizedPath;

  if (role === "superadmin") {
    return true;
  }

  if (role === "admin") {
    return !ADMIN_DENIED.some((route) => matchesRoute(path, route));
  }

  return CLIENT_ALLOWED.some((route) => matchesRoute(path, route));
}

export function isDashboardRouteAllowed(pathname: string, userId?: string | null, rawRole?: string | null): boolean {
  const role = getUserRole(userId, rawRole);
  return isRouteAllowedForRole(pathname, role);
}

export function filterAccessibleSidebarItems(
  items: NavGroup[],
  userId?: string | null,
  rawRole?: string | null,
): NavGroup[] {
  const role = getUserRole(userId, rawRole);

  return items
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => {
          if (item.subItems) {
            const filteredSubItems = item.subItems.filter((subItem) => isRouteAllowedForRole(subItem.url, role));
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

          return isRouteAllowedForRole(item.url, role) ? item : null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    }))
    .filter((group) => group.items.length > 0);
}
