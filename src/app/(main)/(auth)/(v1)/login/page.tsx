import Link from "next/link";

import type { Metadata } from "next";

import { LoginForm } from "../../_components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Entra a tu panel de Gamalink para administrar tu negocio.",
};

export default function LoginV1() {
  return (
    <div className="flex h-dvh">
      <div className="hidden bg-gradient-to-br from-[#404a9d] via-[#5a67c5] to-[#7686f0] lg:block lg:w-1/3">
        <div className="flex h-full flex-col items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white shadow-lg">
              <span className="font-extrabold text-4xl text-[#5a67c5]">G</span>
            </div>
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
            {/* En celular el panel morado se oculta: aquí va el logo. */}
            <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#5a67c5]">
                <span className="font-bold text-white text-xl">G</span>
              </div>
              <span className="font-bold text-2xl text-[#404a9d] tracking-tight">Gamalink</span>
            </div>
            <h2 className="font-bold text-2xl tracking-tight">Iniciar sesión</h2>
            <p className="text-muted-foreground text-sm">Ingresa tu correo (o tu usuario) y tu contraseña.</p>
          </div>
          <LoginForm />
          {/* El registro está oculto: las cuentas las da de alta Gamalink desde el panel de Empresas. */}
          <p className="text-center text-muted-foreground text-sm">
            ¿Olvidaste tu contraseña? Escríbele a Gamalink para restablecerla.
          </p>
          <p className="text-center text-muted-foreground text-xs">
            <Link className="hover:underline" href="/aviso-de-privacidad" prefetch={false}>
              Aviso de privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
