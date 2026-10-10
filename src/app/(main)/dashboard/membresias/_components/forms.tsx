"use client";

import { useActionState, useState, useTransition } from "react";

import { Plus, Save, Trash2, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/empresas";
import { duracionLabel, formatoDinero, hoyMx, METODOS_PAGO, type PlanMembresia } from "@/lib/membresias";
import {
  actualizarSocio,
  cambiarEstadoPlan,
  cambiarEstadoSocio,
  crearPlan,
  crearSocio,
  eliminarPago,
  registrarPago,
} from "@/server/membresias-actions";

const selectClassName = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm";

function FormMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p className={state.ok ? "text-muted-foreground text-sm" : "text-destructive text-sm"} role="status">
      {state.message}
    </p>
  );
}

// ---------- Planes ----------

export function NuevoPlanForm({ empresaId }: { empresaId: number }) {
  const [state, action, pending] = useActionState(crearPlan.bind(null, empresaId), null);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <div>
        <h2 className="font-semibold text-lg">Nuevo plan</h2>
        <p className="text-muted-foreground text-sm">Por ejemplo: Mensualidad · $500 · 30 días.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="plan-nombre">Nombre</Label>
          <Input id="plan-nombre" maxLength={80} name="nombre" placeholder="Mensualidad" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="plan-precio">Precio</Label>
          <Input id="plan-precio" min={0} name="precio" required step="0.01" type="number" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="plan-duracion">Duración</Label>
          <select className={selectClassName} defaultValue="30" id="plan-duracion" name="duracion_dias">
            <option value="1">1 día (visita)</option>
            <option value="7">1 semana</option>
            <option value="15">15 días</option>
            <option value="30">1 mes</option>
            <option value="90">3 meses</option>
            <option value="180">6 meses</option>
            <option value="365">1 año</option>
          </select>
        </div>
      </div>
      <FormMessage state={state} />
      <Button disabled={pending} type="submit">
        <Plus />
        Crear plan
      </Button>
    </form>
  );
}

export function PlanEstadoButton({ empresaId, plan }: { empresaId: number; plan: PlanMembresia }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={pending}
      onClick={() => startTransition(() => cambiarEstadoPlan(empresaId, plan.id, !plan.activo))}
      size="sm"
      type="button"
      variant="outline"
    >
      {plan.activo ? "Desactivar" : "Activar"}
    </Button>
  );
}

// ---------- Pago (compartido por "nuevo socio" y "registrar pago") ----------

function CamposPago({ planes, requierePlan }: { planes: PlanMembresia[]; requierePlan: boolean }) {
  const activos = planes.filter((plan) => plan.activo);
  const [planId, setPlanId] = useState(requierePlan ? String(activos[0]?.id ?? "") : "");
  const [monto, setMonto] = useState(requierePlan && activos[0] ? String(activos[0].precio) : "");
  const sinPlan = planId === "personalizado";

  const elegirPlan = (value: string) => {
    setPlanId(value);
    const plan = activos.find((item) => String(item.id) === value);
    if (plan) setMonto(String(plan.precio));
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1">
        <Label htmlFor="pago-plan">Plan</Label>
        <select
          className={selectClassName}
          id="pago-plan"
          onChange={(event) => elegirPlan(event.currentTarget.value)}
          value={planId}
        >
          {requierePlan ? null : <option value="">Sin pago por ahora</option>}
          {activos.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.nombre} · {formatoDinero(plan.precio)} · {duracionLabel(plan.duracion_dias)}
            </option>
          ))}
          <option value="personalizado">Personalizado (elegir vencimiento)</option>
        </select>
        {/* "personalizado" no es un plan: se manda vacío y se usa la fecha de vencimiento. */}
        <input name="plan_id" type="hidden" value={sinPlan ? "" : planId} />
        {sinPlan ? <input name="personalizado" type="hidden" value="1" /> : null}
      </div>

      {planId !== "" ? (
        <>
          <div className="space-y-1">
            <Label htmlFor="pago-monto">Monto</Label>
            <Input
              id="pago-monto"
              min={0}
              name="monto"
              onChange={(event) => setMonto(event.currentTarget.value)}
              required
              step="0.01"
              type="number"
              value={monto}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pago-metodo">Método</Label>
            <select className={selectClassName} defaultValue="efectivo" id="pago-metodo" name="metodo">
              {METODOS_PAGO.map((metodo) => (
                <option key={metodo.key} value={metodo.key}>
                  {metodo.label}
                </option>
              ))}
            </select>
          </div>
          {sinPlan ? (
            <div className="space-y-1">
              <Label htmlFor="pago-vence">Vence</Label>
              <Input id="pago-vence" min={hoyMx()} name="vigente_hasta" required type="date" />
            </div>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="pago-fecha">Fecha de pago</Label>
              <Input defaultValue={hoyMx()} id="pago-fecha" max={hoyMx()} name="fecha_pago" type="date" />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

export function RegistrarPagoForm({
  empresaId,
  socioId,
  planes,
}: {
  empresaId: number;
  socioId: number;
  planes: PlanMembresia[];
}) {
  const [state, action, pending] = useActionState(registrarPago.bind(null, empresaId, socioId), null);

  return (
    <form action={action} className="space-y-3 rounded-lg border p-4">
      <div>
        <h3 className="font-medium">Registrar pago</h3>
        <p className="text-muted-foreground text-xs">
          Si su membresía sigue vigente, el nuevo periodo empieza cuando termine la actual.
        </p>
      </div>
      <CamposPago planes={planes} requierePlan />
      <FormMessage state={state} />
      <Button disabled={pending} size="sm" type="submit">
        <Save />
        {pending ? "Guardando…" : "Registrar pago"}
      </Button>
    </form>
  );
}

export function EliminarPagoButton({ empresaId, pagoId }: { empresaId: number; pagoId: number }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirmando) {
    return (
      <Button
        aria-label="Eliminar pago"
        onClick={() => setConfirmando(true)}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <Trash2 />
      </Button>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <Button
        disabled={pending}
        onClick={() => startTransition(() => eliminarPago(empresaId, pagoId))}
        size="sm"
        type="button"
        variant="destructive"
      >
        Eliminar
      </Button>
      <Button onClick={() => setConfirmando(false)} size="sm" type="button" variant="ghost">
        Cancelar
      </Button>
    </span>
  );
}

// ---------- Socios ----------

export function NuevoSocioForm({ empresaId, planes }: { empresaId: number; planes: PlanMembresia[] }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(crearSocio.bind(null, empresaId), null);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} type="button">
        <UserPlus />
        Nuevo socio
      </Button>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold text-lg">Nuevo socio</h2>
        <Button aria-label="Cancelar" onClick={() => setOpen(false)} size="icon-sm" type="button" variant="ghost">
          <X />
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="socio-nombre">Nombre</Label>
          <Input autoComplete="off" id="socio-nombre" maxLength={120} name="nombre" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="socio-telefono">Teléfono / WhatsApp</Label>
          <Input autoComplete="off" id="socio-telefono" maxLength={30} name="telefono" type="tel" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="socio-correo">Correo (opcional)</Label>
          <Input autoComplete="off" id="socio-correo" maxLength={200} name="correo" type="email" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="font-medium text-sm">Primer pago</p>
        <CamposPago planes={planes} requierePlan={false} />
      </div>
      <FormMessage state={state} />
      <Button disabled={pending} type="submit">
        <UserPlus />
        {pending ? "Guardando…" : "Guardar socio"}
      </Button>
    </form>
  );
}

export function SocioDatosForm({
  empresaId,
  socio,
}: {
  empresaId: number;
  socio: { id: number; nombre: string; telefono: string | null; correo: string | null; notas: string | null };
}) {
  const [state, action, pending] = useActionState(actualizarSocio.bind(null, empresaId, socio.id), null);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <h2 className="font-semibold text-lg">Datos</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="socio-nombre">Nombre</Label>
          <Input defaultValue={socio.nombre} id="socio-nombre" maxLength={120} name="nombre" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="socio-telefono">Teléfono / WhatsApp</Label>
          <Input defaultValue={socio.telefono ?? ""} id="socio-telefono" maxLength={30} name="telefono" type="tel" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="socio-correo">Correo</Label>
          <Input defaultValue={socio.correo ?? ""} id="socio-correo" maxLength={200} name="correo" type="email" />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="socio-notas">Notas</Label>
        <Textarea defaultValue={socio.notas ?? ""} id="socio-notas" maxLength={1000} name="notas_socio" rows={2} />
      </div>
      <FormMessage state={state} />
      <Button disabled={pending} type="submit" variant="outline">
        <Save />
        Guardar datos
      </Button>
    </form>
  );
}

export function SocioEstadoButton({
  empresaId,
  socioId,
  activo,
}: {
  empresaId: number;
  socioId: number;
  activo: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={pending}
      onClick={() => startTransition(() => cambiarEstadoSocio(empresaId, socioId, !activo))}
      size="sm"
      type="button"
      variant="outline"
    >
      {activo ? "Dar de baja" : "Reactivar"}
    </Button>
  );
}
