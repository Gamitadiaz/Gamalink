"use client";

import { type FormEvent, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/sb/supabase_config";

type Status = "verificando" | "listo" | "invalido";

// Destino del correo de invitación: valida el enlace, abre la sesión y pide la contraseña nueva.
export default function SetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verificando");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const openSession = async () => {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.slice(1));

      // Plantilla de correo con token_hash (recomendada) o enlace clásico con tokens en el #hash.
      const tokenHash = query.get("token_hash");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (tokenHash) {
        const type = query.get("type") === "recovery" ? "recovery" : "invite";
        await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      } else if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }

      // Quita los tokens de la barra de direcciones.
      window.history.replaceState(null, "", window.location.pathname);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      setStatus(session ? "listo" : "invalido");
    };

    void openSession();
  }, []);

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
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-6">
        <div className="space-y-1">
          <h1 className="font-semibold text-xl">Bienvenido a Gamalink</h1>
          <p className="text-muted-foreground text-sm">Crea tu contraseña para entrar a tu panel.</p>
        </div>

        {status === "verificando" ? <p className="text-muted-foreground text-sm">Verificando enlace…</p> : null}

        {status === "invalido" ? (
          <p className="text-destructive text-sm" role="alert">
            El enlace no es válido o ya expiró. Pide a Gamalink que te envíe una nueva invitación.
          </p>
        ) : null}

        {status === "listo" ? (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="new-password">Contraseña</Label>
              <Input
                autoComplete="new-password"
                id="new-password"
                onChange={(event) => setPassword(event.currentTarget.value)}
                type="password"
                value={password}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                autoComplete="new-password"
                id="confirm-password"
                onChange={(event) => setConfirm(event.currentTarget.value)}
                type="password"
                value={confirm}
              />
            </div>
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            <Button className="w-full" disabled={saving} type="submit">
              {saving ? "Guardando…" : "Guardar y entrar"}
            </Button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
