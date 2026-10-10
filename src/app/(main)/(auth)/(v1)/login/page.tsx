import Link from "next/link";

import { Command } from "lucide-react";
import type { Metadata } from "next";

import { LoginForm } from "../../_components/login-form";

export const metadata: Metadata = {
  title: "Gamalink - Iniciar sesión",
  description:
    "Sistema CRM y de gestión de proyectos para empresas y freelancers. Administra tus clientes, proyectos y tareas de manera eficiente.",
  alternates: {
    canonical: "/auth/v1/login",
  },
};

export default function LoginV1() {
  return (
    <div className="flex h-dvh">
      <div className="hidden bg-gradient-to-br from-[#404a9d] via-[#5a67c5] to-[#7686f0] lg:block lg:w-1/3">
        <div className="flex h-full flex-col items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <Command className="mx-auto size-12 text-white" /> {/* Reemplazar con logo */}
            <div className="space-y-2">
              <h1 className="font-extrabold text-5xl text-white tracking-tight">Gamalink</h1>
              <p className="text-[#b5c4fb] text-xl">Inicia sesión para continuar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-2/3">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="font-bold text-2xl tracking-tight">Iniciar sesión</h2>
            <p className="text-muted-foreground text-sm">Ingresa tu correo electrónico y contraseña.</p>
          </div>
          <LoginForm />
          <p className="text-center text-muted-foreground text-sm">
            ¿No tienes una cuenta?{" "}
            <Link prefetch={false} href="register" className="font-medium text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
