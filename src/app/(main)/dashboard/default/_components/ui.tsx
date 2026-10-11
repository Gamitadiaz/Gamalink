import Link from "next/link";

import type { LucideIcon } from "lucide-react";
import { ChevronRight, MessageCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export function saludo(nombre: string) {
  const hora = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "America/Mexico_City" }).format(
      new Date(),
    ),
  );
  let parte = "Buenas noches";
  if (hora < 12) parte = "Buenos días";
  else if (hora < 19) parte = "Buenas tardes";
  const fecha = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Mexico_City",
  });
  return { titulo: `${parte}, ${nombre}`, fecha };
}

export function Encabezado({ nombre, subtitulo }: { nombre: string; subtitulo?: string }) {
  const { titulo, fecha } = saludo(nombre);
  return (
    <header>
      <h1 className="font-semibold text-2xl">{titulo}</h1>
      <p className="text-muted-foreground first-letter:uppercase">
        {fecha}
        {subtitulo ? ` · ${subtitulo}` : ""}
      </p>
    </header>
  );
}

export type Pendiente = {
  key: string;
  texto: string;
  detalle?: string;
  href?: string;
  whatsapp?: string;
};

export function ListaPendientes({ pendientes }: { pendientes: Pendiente[] }) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6">
      <h2 className="font-semibold text-lg">Pendientes</h2>
      {pendientes.length > 0 ? (
        <ul className="divide-y">
          {pendientes.map((pendiente) => (
            <li className="flex items-center justify-between gap-3 py-2" key={pendiente.key}>
              <div className="min-w-0">
                {pendiente.href ? (
                  <Link className="block truncate font-medium text-sm hover:underline" href={pendiente.href}>
                    {pendiente.texto}
                  </Link>
                ) : (
                  <p className="truncate font-medium text-sm">{pendiente.texto}</p>
                )}
                {pendiente.detalle ? (
                  <p className="truncate text-muted-foreground text-xs">{pendiente.detalle}</p>
                ) : null}
              </div>
              {pendiente.whatsapp ? (
                <a
                  aria-label={`Escribir por WhatsApp: ${pendiente.texto}`}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  href={pendiente.whatsapp}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle className="size-4" />
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">Todo al día. 🎉</p>
      )}
    </section>
  );
}

export function TarjetaServicio({
  titulo,
  icono: Icono,
  datos,
  accion,
  enlace,
  children,
}: {
  titulo: string;
  icono: LucideIcon;
  datos: { label: string; valor: string }[];
  accion: { label: string; href: string; externo?: boolean };
  enlace?: { label: string; href: string };
  children?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <Icono className="size-4 text-primary" />
          {titulo}
        </h2>
        {enlace ? (
          <Link className="flex items-center text-muted-foreground text-xs hover:text-foreground" href={enlace.href}>
            {enlace.label}
            <ChevronRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {datos.map((dato) => (
          <div key={dato.label}>
            <dt className="text-muted-foreground text-xs">{dato.label}</dt>
            <dd className="font-semibold text-xl tabular-nums tracking-tight">{dato.valor}</dd>
          </div>
        ))}
      </dl>
      {children}
      <div className="mt-auto">
        {accion.externo ? (
          <a
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href={accion.href}
            rel="noreferrer"
            target="_blank"
          >
            {accion.label}
          </a>
        ) : (
          <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={accion.href}>
            {accion.label}
          </Link>
        )}
      </div>
    </section>
  );
}
