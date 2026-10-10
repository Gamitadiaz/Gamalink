"use client";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { supabase } from "@/lib/sb/supabase_config";

export function useSignOut() {
  const router = useRouter();

  return async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("No se pudo cerrar sesión", { description: error.message });
      return;
    }

    router.replace("/login");
    // Limpia los datos del servidor que se renderizaron con la sesión anterior.
    router.refresh();
  };
}
