"use client";

import { type FormEvent, useActionState, useState } from "react";

import { useRouter } from "next/navigation";

import { KeyRound, LogOut, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/sb/supabase_config";
import { actualizarMiNombre } from "@/server/cuenta-actions";

export function NombreForm({ nombre }: { nombre: string }) {
  const [state, action, pending] = useActionState(actualizarMiNombre, null);

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1">
        <Label htmlFor="cuenta-nombre">Nombre</Label>
        <Input defaultValue={nombre} id="cuenta-nombre" maxLength={120} name="nombre" required />
        {state ? (
          <p className={state.ok ? "text-muted-foreground text-xs" : "text-destructive text-xs"} role="status">
            {state.message}
          </p>
        ) : null}
      </div>
      <Button className="sm:mb-px" disabled={pending} type="submit" variant="outline">
        <Save />
        Guardar
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { debe_cambiar_contrasena: false },
    });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPassword("");
    setConfirm("");
    toast.success("Contraseña actualizada.");
    router.refresh();
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="cuenta-password">Nueva contraseña</Label>
          <Input
            autoComplete="new-password"
            id="cuenta-password"
            onChange={(event) => setPassword(event.currentTarget.value)}
            type="password"
            value={password}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cuenta-confirm">Confirmar contraseña</Label>
          <Input
            autoComplete="new-password"
            id="cuenta-confirm"
            onChange={(event) => setConfirm(event.currentTarget.value)}
            type="password"
            value={confirm}
          />
        </div>
      </div>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <Button disabled={saving || !password} type="submit" variant="outline">
        <KeyRound />
        {saving ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}

export function CerrarTodasLasSesiones() {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [pending, setPending] = useState(false);

  const cerrar = async () => {
    setPending(true);
    // scope "global": invalida la sesión en todos los dispositivos, incluido este.
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      toast.error("No se pudo cerrar las sesiones", { description: error.message });
      setPending(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  };

  if (!confirmando) {
    return (
      <Button onClick={() => setConfirmando(true)} type="button" variant="outline">
        <LogOut />
        Cerrar sesión en todos mis dispositivos
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm">Tendrás que volver a iniciar sesión en todos lados.</span>
      <Button disabled={pending} onClick={() => void cerrar()} size="sm" type="button" variant="destructive">
        Sí, cerrar todas
      </Button>
      <Button onClick={() => setConfirmando(false)} size="sm" type="button" variant="ghost">
        Cancelar
      </Button>
    </div>
  );
}
