"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/sb/supabase_config";
import { correoParaLogin } from "@/lib/usuarios";

const formSchema = z.object({
  // Correo, o "usuario" para quienes no tienen correo (ver lib/usuarios.ts).
  email: z.string().trim().min(3, { message: "Escribe tu correo o tu usuario." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export function LoginForm() {
  const router = useRouter(); // Para redireccionar después del login

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Lógica real de autenticación con Supabase
  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { error } = await supabase.auth.signInWithPassword({
      email: correoParaLogin(data.email),
      password: data.password,
    });

    if (error) {
      toast.error("No se pudo iniciar sesión", {
        description:
          error.message === "Invalid login credentials" ? "Usuario, correo o contraseña incorrectos." : error.message,
      });
      return;
    }

    toast.success("¡Bienvenido de vuelta!");
    router.push("/dashboard");
    router.refresh(); // Fuerza a Next.js a actualizar los datos del servidor
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-email">Correo o usuario</FieldLabel>
              <Input
                {...field}
                id="login-email"
                type="text"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="correo@ejemplo.com o tu usuario"
                autoComplete="username"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
              <Input
                {...field}
                id="login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
