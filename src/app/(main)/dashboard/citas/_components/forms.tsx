"use client";

import { useActionState, useEffect, useState, useTransition } from "react";

import { CalendarPlus, Check, MessageCircle, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type AgendaConfig,
  type Cita,
  DIAS_SEMANA,
  duracionCorta,
  type EstadoCita,
  mensajeRecordatorioCita,
  type ServicioAgenda,
} from "@/lib/citas";
import { formatoDinero, formatoFecha, hoyMx } from "@/lib/formato";
import { whatsappUrl } from "@/lib/whatsapp";
import {
  cambiarEstadoCita,
  cambiarEstadoServicioAgenda,
  crearCita,
  guardarHorario,
  guardarServicioAgenda,
  horariosDisponibles,
} from "@/server/citas-actions";

const selectClassName = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm";

// ---------- Nueva cita ----------

export function NuevaCitaForm({
  empresaId,
  servicios,
  fechaInicial,
}: {
  empresaId: number;
  servicios: ServicioAgenda[];
  fechaInicial: string;
}) {
  const activos = servicios.filter((servicio) => servicio.activo);
  const [open, setOpen] = useState(false);
  const [servicioId, setServicioId] = useState(String(activos[0]?.id ?? ""));
  const [fecha, setFecha] = useState(fechaInicial);
  const [hora, setHora] = useState("");
  const [horarios, setHorarios] = useState<string[] | null>(null);
  const [cargando, startCarga] = useTransition();
  const [state, action, pending] = useActionState(crearCita.bind(null, empresaId), null);

  useEffect(() => {
    if (!open || !servicioId || !fecha) return;
    setHora("");
    startCarga(async () => {
      setHorarios(await horariosDisponibles(empresaId, fecha, Number(servicioId)));
    });
  }, [open, empresaId, servicioId, fecha]);

  let textoBoton = "Elige una hora";
  if (pending) textoBoton = "Agendando…";
  else if (hora) textoBoton = `Agendar ${formatoFecha(fecha)} a las ${hora}`;

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} type="button">
        <CalendarPlus />
        Nueva cita
      </Button>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold text-lg">Nueva cita</h2>
        <Button aria-label="Cerrar" onClick={() => setOpen(false)} size="icon-sm" type="button" variant="ghost">
          <X />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="cita-servicio">Servicio</Label>
          <select
            className={selectClassName}
            id="cita-servicio"
            name="servicio_id"
            onChange={(event) => setServicioId(event.currentTarget.value)}
            value={servicioId}
          >
            {activos.map((servicio) => (
              <option key={servicio.id} value={servicio.id}>
                {servicio.nombre} · {duracionCorta(servicio.duracion_min)} · {formatoDinero(servicio.precio)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="cita-fecha">Día</Label>
          <Input
            id="cita-fecha"
            min={hoyMx()}
            name="fecha"
            onChange={(event) => setFecha(event.currentTarget.value)}
            required
            type="date"
            value={fecha}
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 font-medium text-sm">Hora</legend>
        <input name="hora" type="hidden" value={hora} />
        {cargando || horarios === null ? (
          <p className="text-muted-foreground text-sm">Buscando horarios libres…</p>
        ) : null}
        {!cargando && horarios?.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay horarios libres ese día (cerrado, lleno o ya pasó).</p>
        ) : null}
        {!cargando && horarios && horarios.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {horarios.map((opcion) => (
              <button
                aria-pressed={hora === opcion}
                className="rounded-md border px-3 py-1.5 text-sm tabular-nums transition-colors hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                key={opcion}
                onClick={() => setHora(opcion)}
                type="button"
              >
                {opcion}
              </button>
            ))}
          </div>
        ) : null}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="cita-nombre">Cliente</Label>
          <Input autoComplete="off" id="cita-nombre" maxLength={120} name="cliente_nombre" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cita-telefono">Teléfono / WhatsApp</Label>
          <Input autoComplete="off" id="cita-telefono" maxLength={30} name="cliente_telefono" type="tel" />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="cita-notas">Notas (opcional)</Label>
        <Textarea id="cita-notas" maxLength={500} name="notas" rows={2} />
      </div>

      <FormMessage state={state} />
      <Button disabled={pending || !hora} type="submit">
        <CalendarPlus />
        {textoBoton}
      </Button>
    </form>
  );
}

// ---------- Acciones de una cita ----------

export function CitaAcciones({ empresaId, cita }: { empresaId: number; cita: Cita }) {
  const [pending, startTransition] = useTransition();
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);
  const activa = cita.estado === "pendiente" || cita.estado === "confirmada";

  const cambiar = (estado: EstadoCita) =>
    startTransition(async () => {
      try {
        await cambiarEstadoCita(empresaId, cita.id, estado);
      } catch (error) {
        toast.error("No se pudo actualizar la cita", {
          description: error instanceof Error ? error.message : undefined,
        });
      }
    });

  if (confirmandoCancelar) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <Button disabled={pending} onClick={() => cambiar("cancelada")} size="sm" type="button" variant="destructive">
          Sí, cancelar
        </Button>
        <Button onClick={() => setConfirmandoCancelar(false)} size="sm" type="button" variant="ghost">
          No
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {cita.cliente_telefono && activa ? (
        <a
          aria-label={`Recordar a ${cita.cliente_nombre} por WhatsApp`}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          href={whatsappUrl(cita.cliente_telefono, mensajeRecordatorioCita(cita))}
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircle className="size-4" />
        </a>
      ) : null}
      {cita.estado === "pendiente" ? (
        <Button disabled={pending} onClick={() => cambiar("confirmada")} size="sm" type="button" variant="outline">
          Confirmar
        </Button>
      ) : null}
      {activa ? (
        <>
          <Button disabled={pending} onClick={() => cambiar("completada")} size="sm" type="button" variant="outline">
            <Check />
            Atendida
          </Button>
          <Button disabled={pending} onClick={() => cambiar("no_asistio")} size="sm" type="button" variant="ghost">
            No asistió
          </Button>
          <Button
            disabled={pending}
            onClick={() => setConfirmandoCancelar(true)}
            size="sm"
            type="button"
            variant="ghost"
          >
            Cancelar
          </Button>
        </>
      ) : (
        <Button disabled={pending} onClick={() => cambiar("confirmada")} size="sm" type="button" variant="ghost">
          Reabrir
        </Button>
      )}
    </div>
  );
}

// ---------- Servicios ----------

export function ServicioAgendaForm({ empresaId, servicio }: { empresaId: number; servicio?: ServicioAgenda }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    guardarServicioAgenda.bind(null, empresaId, servicio?.id ?? null),
    null,
  );
  const id = servicio ? `servicio-${servicio.id}` : "servicio-nuevo";

  if (!open) {
    return servicio ? (
      <Button onClick={() => setOpen(true)} size="sm" type="button" variant="ghost">
        Editar
      </Button>
    ) : (
      <Button onClick={() => setOpen(true)} type="button">
        <Plus />
        Nuevo servicio
      </Button>
    );
  }

  return (
    <form action={action} className="w-full space-y-3 rounded-lg border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor={`${id}-nombre`}>Nombre</Label>
          <Input
            defaultValue={servicio?.nombre}
            id={`${id}-nombre`}
            maxLength={80}
            name="nombre"
            placeholder="Corte"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${id}-duracion`}>Duración</Label>
          <select
            className={selectClassName}
            defaultValue={servicio?.duracion_min ?? 30}
            id={`${id}-duracion`}
            name="duracion_min"
          >
            {[15, 20, 30, 45, 60, 75, 90, 120, 150, 180, 240].map((minutos) => (
              <option key={minutos} value={minutos}>
                {duracionCorta(minutos)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${id}-precio`}>Precio</Label>
          <Input
            defaultValue={servicio?.precio ?? ""}
            id={`${id}-precio`}
            min={0}
            name="precio"
            step="0.01"
            type="number"
          />
        </div>
      </div>
      <FormMessage state={state} />
      <div className="flex gap-2">
        <Button disabled={pending} size="sm" type="submit">
          <Save />
          Guardar
        </Button>
        <Button onClick={() => setOpen(false)} size="sm" type="button" variant="ghost">
          Cerrar
        </Button>
      </div>
    </form>
  );
}

export function ServicioAgendaEstadoButton({ empresaId, servicio }: { empresaId: number; servicio: ServicioAgenda }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={pending}
      onClick={() => startTransition(() => cambiarEstadoServicioAgenda(empresaId, servicio.id, !servicio.activo))}
      size="sm"
      type="button"
      variant="outline"
    >
      {servicio.activo ? "Desactivar" : "Activar"}
    </Button>
  );
}

// ---------- Horario ----------

export function HorarioForm({ empresaId, config }: { empresaId: number; config: AgendaConfig }) {
  const [state, action, pending] = useActionState(guardarHorario.bind(null, empresaId), null);
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DIAS_SEMANA.map((dia) => [dia.key, config.horario[dia.key] !== null])),
  );

  return (
    <form action={action} className="space-y-5 rounded-xl border bg-card p-4 md:p-6">
      <div>
        <h2 className="font-semibold text-lg">Horario de atención</h2>
        <p className="text-muted-foreground text-sm">Solo se pueden agendar citas dentro de este horario.</p>
      </div>

      <ul className="divide-y rounded-lg border">
        {DIAS_SEMANA.map((dia) => {
          const actual = config.horario[dia.key];
          return (
            <li className="flex flex-wrap items-center gap-3 p-3" key={dia.key}>
              <label className="flex w-32 cursor-pointer items-center gap-2 font-medium text-sm">
                <input
                  checked={abiertos[dia.key]}
                  className="accent-primary"
                  name={`abierto_${dia.key}`}
                  onChange={(event) => setAbiertos((prev) => ({ ...prev, [dia.key]: event.currentTarget.checked }))}
                  type="checkbox"
                />
                {dia.label}
              </label>
              {abiertos[dia.key] ? (
                <div className="flex items-center gap-2 text-sm">
                  <Input
                    aria-label={`${dia.label}: abre`}
                    className="w-28"
                    defaultValue={actual?.abre ?? "09:00"}
                    name={`abre_${dia.key}`}
                    step={900}
                    type="time"
                  />
                  <span className="text-muted-foreground">a</span>
                  <Input
                    aria-label={`${dia.label}: cierra`}
                    className="w-28"
                    defaultValue={actual?.cierra ?? "19:00"}
                    name={`cierra_${dia.key}`}
                    step={900}
                    type="time"
                  />
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Cerrado</span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="horario-intervalo">Ofrecer horarios cada</Label>
          <select
            className={selectClassName}
            defaultValue={config.intervalo_min}
            id="horario-intervalo"
            name="intervalo_min"
          >
            {[10, 15, 20, 30, 45, 60].map((minutos) => (
              <option key={minutos} value={minutos}>
                {minutos} minutos
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="horario-capacidad">Citas al mismo tiempo</Label>
          <Input
            defaultValue={config.capacidad}
            id="horario-capacidad"
            max={20}
            min={1}
            name="capacidad"
            type="number"
          />
          <p className="text-muted-foreground text-xs">Cuántas personas pueden atender a la vez (sillas, cabinas…).</p>
        </div>
      </div>

      <FormMessage state={state} />
      <Button disabled={pending} type="submit">
        <Save />
        Guardar horario
      </Button>
    </form>
  );
}
