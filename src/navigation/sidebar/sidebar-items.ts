import {
  Banknote,
  Building2,
  Calendar,
  CalendarClock,
  ChartBar,
  CheckSquare,
  Dumbbell,
  FolderOpen,
  Forklift,
  Gauge,
  Globe,
  GraduationCap,
  HeartPulse,
  Kanban,
  LayoutDashboard,
  LibraryBig,
  ListTodo,
  Lock,
  type LucideIcon,
  Mail,
  MessageSquare,
  ReceiptText,
  Server,
  ShoppingBag,
  Store,
  UserRound,
  Users,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    // Solo superadmin: ninguna de estas rutas está en COMMON_ROUTES ni en SERVICE_ROUTES.
    id: 0,
    label: "Gamalink",
    items: [
      {
        id: "empresas",
        title: "Empresas",
        url: "/dashboard/empresas",
        icon: Building2,
      },
    ],
  },
  {
    // Lo que ve cada cliente; cada ruta se muestra solo si su servicio está activo (SERVICE_ROUTES).
    id: 1,
    label: "Mi negocio",
    items: [
      {
        id: "default",
        title: "Inicio",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        id: "configuration",
        title: "Landing pages",
        url: "/dashboard/configuration",
        icon: Globe,
      },
      {
        id: "landing-analytics",
        title: "Analíticas de landing",
        url: "/dashboard/landing-analytics",
        icon: Gauge,
      },
      {
        id: "membresias",
        title: "Membresías",
        url: "/dashboard/membresias",
        icon: Dumbbell,
      },
      {
        id: "tienda",
        title: "Tiendita",
        url: "/dashboard/tienda",
        icon: Store,
      },
      {
        id: "citas",
        title: "Citas",
        url: "/dashboard/citas",
        icon: CalendarClock,
      },
      {
        id: "profile",
        title: "Mi cuenta",
        url: "/dashboard/profile",
        icon: UserRound,
      },
    ],
  },
  {
    // Demos de la plantilla sin funcionalidad real: referencia visual para futuros módulos.
    // Solo superadmin (ninguna ruta está en COMMON_ROUTES ni en SERVICE_ROUTES). Desplegable cerrado por defecto.
    id: 2,
    label: "Desarrollo",
    items: [
      {
        id: "referencias",
        title: "Referencias",
        icon: LibraryBig,
        subItems: [
          { id: "inicio-demo", title: "Inicio (demo)", url: "/dashboard/inicio-demo", icon: LayoutDashboard },
          { id: "crm", title: "CRM", url: "/dashboard/crm", icon: ChartBar },
          { id: "finance", title: "Finanzas", url: "/dashboard/finance", icon: Banknote },
          { id: "analytics", title: "Analíticas", url: "/dashboard/analytics", icon: Gauge },
          { id: "productivity", title: "Productividad", url: "/dashboard/productivity", icon: ListTodo },
          { id: "ecommerce", title: "E-commerce", url: "/dashboard/ecommerce", icon: ShoppingBag },
          { id: "academy", title: "Academia", url: "/dashboard/academy", icon: GraduationCap },
          { id: "logistics", title: "Logística", url: "/dashboard/logistics", icon: Forklift },
          { id: "infrastructure", title: "Infraestructura", url: "/dashboard/infrastructure", icon: Server },
          { id: "file-manager", title: "Archivos", url: "/dashboard/file-manager", icon: FolderOpen },
          { id: "patient-monitoring", title: "Pacientes", url: "/dashboard/patient-monitoring", icon: HeartPulse },
          { id: "email", title: "Correo", url: "/dashboard/mail", icon: Mail },
          { id: "chat", title: "Chat", url: "/dashboard/chat", icon: MessageSquare },
          { id: "calendar", title: "Calendario", url: "/dashboard/calendar", icon: Calendar },
          { id: "kanban", title: "Kanban", url: "/dashboard/kanban", icon: Kanban },
          { id: "tasks", title: "Tareas", url: "/dashboard/tasks", icon: CheckSquare },
          { id: "invoice", title: "Facturación", url: "/dashboard/invoice", icon: ReceiptText },
          { id: "users", title: "Usuarios", url: "/dashboard/users", icon: Users },
          { id: "roles", title: "Roles", url: "/dashboard/roles", icon: Lock },
          { id: "default-v1", title: "Inicio v1", url: "/dashboard/default-v1", icon: LayoutDashboard },
          { id: "crm-v1", title: "CRM v1", url: "/dashboard/crm-v1", icon: ChartBar },
          { id: "analytics-v1", title: "Analíticas v1", url: "/dashboard/analytics-v1", icon: Gauge },
          { id: "finance-v1", title: "Finanzas v1", url: "/dashboard/finance-v1", icon: Banknote },
        ],
      },
    ],
  },
];
