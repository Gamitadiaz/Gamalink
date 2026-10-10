"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { Command } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { rootUser } from "@/data/users";
import { type AppRole, filterAccessibleSidebarItems, getUserRole } from "@/lib/dashboard-access";
import { supabase } from "@/lib/sb/supabase_config";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.values.sidebar_variant,
      sidebarCollapsible: s.values.sidebar_collapsible,
      isSynced: s.isSynced,
    })),
  );
  const [userId, setUserId] = useState<string | undefined>();
  const [userRole, setUserRole] = useState<AppRole>("cliente");
  const [currentUser, setCurrentUser] = useState(rootUser);

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        return;
      }

      const { data: userRow } = await supabase.from("gl_usuarios").select("*").eq("auth_id", user.id).maybeSingle();

      const role = getUserRole(user.id, (userRow?.role_slug ?? userRow?.rol ?? null) as string | null);
      const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
      const displayName =
        (typeof metadata.full_name === "string" && metadata.full_name) ||
        (typeof metadata.name === "string" && metadata.name) ||
        user.email ||
        rootUser.name;

      setUserId(user.id);
      setUserRole(role);
      setCurrentUser({
        id: user.id,
        name: displayName,
        username: (typeof metadata.user_name === "string" && metadata.user_name) || user.email || rootUser.username,
        email: user.email || rootUser.email,
        avatar:
          (typeof metadata.avatar_url === "string" && metadata.avatar_url) ||
          (typeof metadata.picture === "string" && metadata.picture) ||
          rootUser.avatar,
        role,
      });
    });
  }, []);

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;
  const filteredSidebarItems = useMemo(
    () => filterAccessibleSidebarItems(sidebarItems, userId, userRole),
    [userId, userRole],
  );

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="/dashboard/default">
                <Command />
                <span className="font-semibold text-base">{APP_CONFIG.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredSidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
