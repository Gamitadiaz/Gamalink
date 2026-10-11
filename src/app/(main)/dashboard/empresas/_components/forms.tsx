"use client";

import { useActionState, useState, useTransition } from "react";

import { Check, Copy, KeyRound, Mail, MessageCircle, Plus, Save, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { FormMessage } from "@/components/form-message";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Servicio } from "@/lib/dashboard-access";
import { ESTADOS_EMPRESA, ESTADOS_SERVICIO, SERVICIOS, type ServicioRow } from "@/lib/empresas";
import { whatsappUrl } from "@/lib/whatsapp";
import {
  actualizarEmpresa,
  type CredencialState,
  crearDuenoSinCorreo,
  crearEmpresa,
  guardarServicio,
  invitarDueno,
  restablecerContrasena,
} from "@/server/empresas-actions";

const selectClassName = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm";

export function NuevaEmpresaForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(crearEmpresa, null);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} type="button">
        <Plus />
        Nueva empresa
      </Button>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-lg">Nueva empresa</h2>
          <p className="text-muted-foreground text-sm">
            Después podrás invitar al dueño y ajustar precios y vencimientos.
          </p>
        </div>
        <Button aria-label="Cancelar" onClick={() => setOpen(false)} size="icon-sm" type="button" variant="ghost">
          <X />
        </Button>
      </div>

      <div className="max-w-md space-y-2">
        <Label htmlFor="empresa-nombre">Nombre del negocio</Label>
        <Input autoComplete="off" id="empresa-nombre" maxLength={120} name="nombre" required />
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 font-medium text-sm">Servicios contratados</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {SERVICIOS.map((servicio) => (
            <label
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-checked:border-primary has-checked:bg-primary/5"
              key={servicio.key}
            >
              <input className="mt-1 accent-primary" name="servicios" type="checkbox" value={servicio.key} />
              <span>
                <span className="block font-medium text-sm">{servicio.label}</span>
                <span className="block text-muted-foreground text-xs">{servicio.descripcion}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <FormMessage state={state} />
      <Button disabled={pending} type="submit">
        <Plus />
        {pending ? "Creando…" : "Crear empresa"}
      </Button>
    </form>
  );
}

export function EmpresaDatosForm({
  empresaId,
  nombre,
  estado,
  telefono,
}: {
  empresaId: number;
  nombre: string;
  estado: string;
  telefono: string | null;
}) {
  const [state, action, pending] = useActionState(actualizarEmpresa.bind(null, empresaId), null);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <h2 className="font-semibold text-lg">Datos</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="empresa-nombre">Nombre del negocio</Label>
          <Input defaultValue={nombre} id="empresa-nombre" maxLength={120} name="nombre" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="empresa-telefono">WhatsApp de contacto</Label>
          <Input
            defaultValue={telefono ?? ""}
            id="empresa-telefono"
            maxLength={30}
            name="contacto_telefono"
            placeholder="442 123 4567"
            type="tel"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="empresa-estado">Estado</Label>
          <select className={selectClassName} defaultValue={estado} id="empresa-estado" name="estado">
            {ESTADOS_EMPRESA.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <FormMessage state={state} />
      <Button disabled={pending} type="submit" variant="outline">
        <Save />
        Guardar datos
      </Button>
    </form>
  );
}

export function ServicioForm({
  empresaId,
  servicio,
  actual,
}: {
  empresaId: number;
  servicio: Servicio;
  actual: ServicioRow | undefined;
}) {
  const [state, action, pending] = useActionState(guardarServicio.bind(null, empresaId, servicio), null);
  const info = SERVICIOS.find((item) => item.key === servicio);
  const id = `servicio-${servicio}`;

  return (
    <form
      action={action}
      className="space-y-3 rounded-lg border p-4 data-[activo=true]:border-primary/60"
      data-activo={actual?.estado === "activo"}
    >
      <div>
        <h3 className="font-medium">{info?.label}</h3>
        <p className="text-muted-foreground text-xs">
          {actual ? info?.descripcion : "No contratado. Guárdalo como activo para darlo de alta."}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor={`${id}-estado`}>Estado</Label>
          <select
            className={selectClassName}
            defaultValue={actual?.estado ?? "activo"}
            id={`${id}-estado`}
            name="estado"
          >
            {ESTADOS_SERVICIO.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${id}-precio`}>Precio mensual</Label>
          <Input
            defaultValue={actual?.precio_mensual ?? ""}
            id={`${id}-precio`}
            min={0}
            name="precio_mensual"
            step="0.01"
            type="number"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${id}-vencimiento`}>Vence</Label>
          <Input
            defaultValue={actual?.fecha_vencimiento ?? ""}
            id={`${id}-vencimiento`}
            name="fecha_vencimiento"
            type="date"
          />
        </div>
      </div>
      <FormMessage state={state} />
      <Button disabled={pending} size="sm" type="submit" variant={actual ? "outline" : "default"}>
        <Save />
        {actual ? "Guardar" : "Dar de alta"}
      </Button>
    </form>
  );
}

// Contraseña temporal recién generada: se muestra una sola vez para copiarla o mandarla por WhatsApp.
function Credenciales({ usuario, password, telefono }: { usuario: string; password: string; telefono: string | null }) {
  const [copiado, setCopiado] = useState(false);
  const origen = typeof window === "undefined" ? "" : window.location.origin;
  const texto = `Tu acceso a Gamalink:\nUsuario: ${usuario}\nContraseña temporal: ${password}\nEntra en ${origen}/login y cámbiala en “Mi cuenta”.`;

  const copiar = async () => {
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    toast.success("Datos de acceso copiados.");
  };

  return (
    <div className="space-y-3 rounded-lg border border-primary/40 bg-primary/5 p-3">
      <p className="font-medium text-sm">Mándale estos datos. La contraseña no se volverá a mostrar.</p>
      <dl className="grid gap-1 font-mono text-sm sm:grid-cols-2">
        <div>
          <dt className="font-sans text-muted-foreground text-xs">Usuario</dt>
          <dd>{usuario}</dd>
        </div>
        <div>
          <dt className="font-sans text-muted-foreground text-xs">Contraseña temporal</dt>
          <dd className="select-all">{password}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void copiar()} size="sm" type="button" variant="outline">
          {copiado ? <Check /> : <Copy />}
          {copiado ? "Copiado" : "Copiar datos"}
        </Button>
        {telefono ? (
          <a
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href={whatsappUrl(telefono, texto)}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle />
            Mandar por WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}

function InvitarConCorreo({ empresaId }: { empresaId: number }) {
  const [state, action, pending] = useActionState(invitarDueno.bind(null, empresaId), null);

  return (
    <form action={action} className="space-y-3">
      <p className="text-muted-foreground text-xs">Le llegará un correo para crear su contraseña.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="invitar-nombre">Nombre</Label>
          <Input id="invitar-nombre" maxLength={120} name="nombre" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="invitar-correo">Correo</Label>
          <Input autoComplete="off" id="invitar-correo" name="correo" required type="email" />
        </div>
      </div>
      <FormMessage state={state} />
      <Button disabled={pending} size="sm" type="submit">
        <Mail />
        {pending ? "Enviando…" : "Enviar invitación"}
      </Button>
    </form>
  );
}

function CrearSinCorreo({ empresaId, telefono }: { empresaId: number; telefono: string | null }) {
  const [state, action, pending] = useActionState(crearDuenoSinCorreo.bind(null, empresaId), null);

  return (
    <form action={action} className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Para quien no tiene correo: entra con un usuario y una contraseña temporal que tú le mandas.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="sincorreo-nombre">Nombre</Label>
          <Input id="sincorreo-nombre" maxLength={120} name="nombre" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sincorreo-usuario">Usuario</Label>
          <Input
            autoCapitalize="none"
            autoComplete="off"
            id="sincorreo-usuario"
            maxLength={30}
            name="usuario"
            placeholder="ej. barberia.tiluli"
            required
            spellCheck={false}
          />
        </div>
      </div>
      {state && !state.ok ? <p className="text-destructive text-sm">{state.message}</p> : null}
      {state?.ok && state.usuario && state.password ? (
        <Credenciales password={state.password} telefono={telefono} usuario={state.usuario} />
      ) : null}
      <Button disabled={pending} size="sm" type="submit">
        <UserPlus />
        {pending ? "Creando…" : "Crear usuario"}
      </Button>
    </form>
  );
}

export function AltaDuenoForm({ empresaId, telefono }: { empresaId: number; telefono: string | null }) {
  const [modo, setModo] = useState<"correo" | "usuario">("correo");
  const modos = [
    ["correo", "Con correo"],
    ["usuario", "Sin correo"],
  ] as const;

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium">Dar acceso al dueño</h3>
        <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
          {modos.map(([key, label]) => (
            <button
              aria-pressed={modo === key}
              className="rounded-md px-3 py-1 text-muted-foreground transition-colors aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
              key={key}
              onClick={() => setModo(key)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {modo === "correo" ? (
        <InvitarConCorreo empresaId={empresaId} />
      ) : (
        <CrearSinCorreo empresaId={empresaId} telefono={telefono} />
      )}
    </div>
  );
}

export function RestablecerContrasenaButton({
  empresaId,
  usuarioId,
  telefono,
}: {
  empresaId: number;
  usuarioId: number;
  telefono: string | null;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [resultado, setResultado] = useState<CredencialState>(null);
  const [pending, startTransition] = useTransition();

  const restablecer = () =>
    startTransition(async () => {
      const respuesta = await restablecerContrasena(empresaId, usuarioId);
      setConfirmando(false);
      if (!respuesta.ok) {
        toast.error(respuesta.message);
        return;
      }
      setResultado(respuesta);
    });

  if (resultado?.usuario && resultado.password) {
    return (
      <div className="w-full">
        <Credenciales password={resultado.password} telefono={telefono} usuario={resultado.usuario} />
      </div>
    );
  }

  if (!confirmando) {
    return (
      <Button onClick={() => setConfirmando(true)} size="sm" type="button" variant="ghost">
        <KeyRound />
        Restablecer contraseña
      </Button>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <Button disabled={pending} onClick={restablecer} size="sm" type="button" variant="destructive">
        Sí, generar nueva
      </Button>
      <Button onClick={() => setConfirmando(false)} size="sm" type="button" variant="ghost">
        No
      </Button>
    </span>
  );
}
