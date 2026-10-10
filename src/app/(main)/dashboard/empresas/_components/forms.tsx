"use client";

import { useActionState, useState } from "react";

import { Mail, Plus, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Servicio } from "@/lib/dashboard-access";
import { type ActionState, ESTADOS_EMPRESA, ESTADOS_SERVICIO, SERVICIOS, type ServicioRow } from "@/lib/empresas";
import { actualizarEmpresa, crearEmpresa, guardarServicio, invitarDueno } from "@/server/empresas-actions";

const selectClassName = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm";

function FormMessage({ state }: { state: ActionState }) {
  if (!state) {
    return null;
  }
  return (
    <p className={state.ok ? "text-muted-foreground text-sm" : "text-destructive text-sm"} role="status">
      {state.message}
    </p>
  );
}

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

export function EmpresaDatosForm({ empresaId, nombre, estado }: { empresaId: number; nombre: string; estado: string }) {
  const [state, action, pending] = useActionState(actualizarEmpresa.bind(null, empresaId), null);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <h2 className="font-semibold text-lg">Datos</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="empresa-nombre">Nombre del negocio</Label>
          <Input defaultValue={nombre} id="empresa-nombre" maxLength={120} name="nombre" required />
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

export function InvitarDuenoForm({ empresaId }: { empresaId: number }) {
  const [state, action, pending] = useActionState(invitarDueno.bind(null, empresaId), null);

  return (
    <form action={action} className="space-y-3 rounded-lg border p-4">
      <div>
        <h3 className="font-medium">Invitar al dueño</h3>
        <p className="text-muted-foreground text-xs">Le llegará un correo para crear su contraseña.</p>
      </div>
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
