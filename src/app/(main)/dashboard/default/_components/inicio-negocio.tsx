import Link from "next/link";

import { CalendarClock, Dumbbell, Globe, Store } from "lucide-react";

import { APP_CONFIG } from "@/config/app-config";
import { CITA_COLUMNS, type Cita, ESTADO_CITA_LABEL, horaMx } from "@/lib/citas";
import type { EmpresaContext } from "@/lib/dashboard-access";
import { servicioLabel } from "@/lib/empresas";
import { diaMx, diasEntre, formatoDinero, formatoFecha, hoyMx, inicioDiaMx, sumarDias } from "@/lib/formato";
import { DIAS_AVISO, estadoSocio, mensajeRecordatorioSocio } from "@/lib/membresias";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { estadoStock, formatoCantidad, type Unidad } from "@/lib/tienda";
import { whatsappUrl } from "@/lib/whatsapp";

import { ListaPendientes, type Pendiente, TarjetaServicio } from "./ui";

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

// Máximo de pendientes por tipo, para que la lista no se vuelva interminable.
const MAX_POR_TIPO = 3;

const conEmpresa = (href: string, empresaId: number) => `${href}${href.includes("?") ? "&" : "?"}empresa=${empresaId}`;

async function datosLanding(supabase: Supabase, empresaId: number) {
  const { data: landings } = await supabase
    .from("gl_landings")
    .select("id, slug, custom_domain, status")
    .eq("empresa_id", empresaId)
    .order("updated_at", { ascending: false });
  const principal = landings?.find((l) => l.status === "published") ?? landings?.[0];
  if (!principal) return null;

  const hasta = new Date();
  const desde = new Date(hasta.getTime() - 7 * 86_400_000);
  const { data } = await supabase.rpc("gl_get_landing_analytics", {
    p_landing_id: principal.id,
    p_from: desde.toISOString(),
    p_to: hasta.toISOString(),
  });
  const stats = (Array.isArray(data) ? data[0] : data) as { total_views?: number; whatsapp_clicks?: number } | null;

  return {
    landing: principal,
    visitas: Number(stats?.total_views ?? 0),
    whatsapp: Number(stats?.whatsapp_clicks ?? 0),
  };
}

async function datosMembresias(supabase: Supabase, empresaId: number, hoy: string) {
  const [{ data: socios }, { data: pagos }] = await Promise.all([
    supabase
      .from("gl_socios_resumen")
      .select("id, nombre, telefono, activo, vigente_hasta")
      .eq("empresa_id", empresaId),
    supabase
      .from("gl_pagos_socios")
      .select("monto")
      .eq("empresa_id", empresaId)
      .gte("fecha_pago", `${hoy.slice(0, 7)}-01`),
  ]);
  const conEstado = (socios ?? []).map((socio) => ({ ...socio, estado: estadoSocio(socio, hoy) }));
  return {
    activos: conEstado.filter((s) => s.estado === "activo" || s.estado === "por_vencer").length,
    porVencer: conEstado
      .filter((s) => s.estado === "por_vencer")
      .sort((a, b) => (a.vigente_hasta ?? "").localeCompare(b.vigente_hasta ?? "")),
    ingresosMes: (pagos ?? []).reduce((suma, pago) => suma + Number(pago.monto), 0),
  };
}

async function datosTienda(supabase: Supabase, empresaId: number, hoy: string) {
  const [{ data: ventas }, { data: productos }] = await Promise.all([
    supabase
      .from("gl_ventas")
      .select("total, created_at")
      .eq("empresa_id", empresaId)
      .eq("estado", "completada")
      .gte("created_at", inicioDiaMx(`${hoy.slice(0, 7)}-01`)),
    supabase
      .from("gl_productos")
      .select("id, nombre, unidad, stock, stock_minimo")
      .eq("empresa_id", empresaId)
      .eq("activo", true),
  ]);
  const deHoy = (ventas ?? []).filter((venta) => diaMx(venta.created_at) === hoy);
  return {
    hoy: deHoy.reduce((suma, venta) => suma + Number(venta.total), 0),
    ventasHoy: deHoy.length,
    mes: (ventas ?? []).reduce((suma, venta) => suma + Number(venta.total), 0),
    porSurtir: (productos ?? [])
      .filter((producto) => estadoStock(producto) !== "ok")
      .sort((a, b) => Number(a.stock) - Number(b.stock)),
  };
}

async function datosCitas(supabase: Supabase, empresaId: number, hoy: string) {
  const { data } = await supabase
    .from("gl_agenda_citas")
    .select(CITA_COLUMNS)
    .eq("empresa_id", empresaId)
    .gte("inicio", inicioDiaMx(hoy))
    .lt("inicio", inicioDiaMx(sumarDias(hoy, 2)))
    .order("inicio");
  const citas = ((data ?? []) as Cita[]).map((cita) => ({ ...cita, dia: diaMx(cita.inicio) }));
  const deHoy = citas.filter((cita) => cita.dia === hoy);
  return {
    proximasHoy: deHoy.filter((cita) => cita.estado === "pendiente" || cita.estado === "confirmada"),
    atendidasHoy: deHoy.filter((cita) => cita.estado === "completada").length,
    sinConfirmar: citas.filter((cita) => cita.estado === "pendiente"),
  };
}

function TarjetaLanding({ datos: landing }: { datos: Awaited<ReturnType<typeof datosLanding>> }) {
  if (!landing) {
    return (
      <section className="rounded-xl border bg-card p-4 text-muted-foreground text-sm md:p-5">
        <p className="mb-1 flex items-center gap-2 font-semibold text-foreground">
          <Globe className="size-4 text-primary" />
          Mi página web
        </p>
        Estamos preparando tu página. Te avisaremos cuando esté lista.{" "}
        <Link className="text-primary hover:underline" href="/dashboard/configuration">
          Ver estado
        </Link>
      </section>
    );
  }
  return (
    <TarjetaServicio
      accion={
        landing.landing.status === "published"
          ? {
              label: "Ver mi página",
              href: `https://${landing.landing.custom_domain ?? `${landing.landing.slug}.gamalink.online`}`,
              externo: true,
            }
          : { label: "Editar mi página", href: `/dashboard/configuration/${landing.landing.id}` }
      }
      datos={[
        { label: "Visitas (7 días)", valor: landing.visitas.toLocaleString("es-MX") },
        { label: "Clics a WhatsApp", valor: landing.whatsapp.toLocaleString("es-MX") },
      ]}
      enlace={{ label: "Analíticas", href: "/dashboard/landing-analytics" }}
      icono={Globe}
      titulo="Mi página web"
    >
      {landing.landing.status === "published" ? null : (
        <p className="text-muted-foreground text-xs">Tu página aún no está publicada.</p>
      )}
    </TarjetaServicio>
  );
}

async function SeccionEmpresa({ empresa, mostrarNombre }: { empresa: EmpresaContext; mostrarNombre: boolean }) {
  const supabase = await createSupabaseServerClient();
  const hoy = hoyMx();
  const tiene = (servicio: string) => empresa.servicios.includes(servicio as never);

  const [landing, membresias, tienda, citas, { data: vencimientos }] = await Promise.all([
    tiene("landing") ? datosLanding(supabase, empresa.id) : null,
    tiene("membresias") ? datosMembresias(supabase, empresa.id, hoy) : null,
    tiene("tienda") ? datosTienda(supabase, empresa.id, hoy) : null,
    tiene("citas") ? datosCitas(supabase, empresa.id, hoy) : null,
    supabase
      .from("gl_empresa_servicios")
      .select("servicio, fecha_vencimiento")
      .eq("empresa_id", empresa.id)
      .eq("estado", "activo")
      .not("fecha_vencimiento", "is", null)
      .lte("fecha_vencimiento", sumarDias(hoy, 7)),
  ]);

  // ---------- Pendientes ----------
  const pendientes: Pendiente[] = [];

  for (const servicio of vencimientos ?? []) {
    const vencido = servicio.fecha_vencimiento < hoy;
    pendientes.push({
      key: `gamalink-${servicio.servicio}`,
      texto: `Tu servicio de ${servicioLabel(servicio.servicio)} ${vencido ? "venció" : "vence"} el ${formatoFecha(servicio.fecha_vencimiento)}`,
      detalle: "Escríbenos para renovarlo",
      whatsapp: whatsappUrl(
        APP_CONFIG.whatsapp,
        `Hola Gamalink, soy de ${empresa.nombre} y quiero renovar mi servicio de ${servicioLabel(servicio.servicio)}.`,
      ),
    });
  }

  for (const cita of (citas?.sinConfirmar ?? []).slice(0, MAX_POR_TIPO)) {
    pendientes.push({
      key: `cita-${cita.id}`,
      texto: `Confirmar cita de ${cita.cliente_nombre}`,
      detalle: `${cita.dia === hoy ? "Hoy" : "Mañana"} ${horaMx(cita.inicio)} · ${cita.servicio_nombre}`,
      href: conEmpresa(`/dashboard/citas?fecha=${cita.dia}`, empresa.id),
    });
  }

  for (const socio of (membresias?.porVencer ?? []).slice(0, MAX_POR_TIPO)) {
    const dias = socio.vigente_hasta ? diasEntre(hoy, socio.vigente_hasta) : 0;
    pendientes.push({
      key: `socio-${socio.id}`,
      texto: `Membresía de ${socio.nombre} por vencer`,
      detalle: dias === 0 ? "Vence hoy" : `Vence en ${dias} día${dias === 1 ? "" : "s"}`,
      href: conEmpresa(`/dashboard/membresias/socios/${socio.id}`, empresa.id),
      whatsapp: socio.telefono
        ? whatsappUrl(socio.telefono, mensajeRecordatorioSocio(socio.nombre, socio.vigente_hasta))
        : undefined,
    });
  }

  for (const producto of (tienda?.porSurtir ?? []).slice(0, MAX_POR_TIPO)) {
    pendientes.push({
      key: `producto-${producto.id}`,
      texto: `Surtir ${producto.nombre}`,
      detalle:
        Number(producto.stock) <= 0
          ? "Agotado"
          : `Quedan ${formatoCantidad(producto.stock, producto.unidad as Unidad)}`,
      href: conEmpresa(`/dashboard/tienda/productos/${producto.id}`, empresa.id),
    });
  }

  const sinServicios = empresa.servicios.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {mostrarNombre ? <h2 className="font-semibold text-xl">{empresa.nombre}</h2> : null}

      {sinServicios ? (
        <section className="rounded-xl border bg-card p-4 md:p-6">
          <p className="text-muted-foreground">
            Aún no tienes servicios activos.{" "}
            <a
              className="font-medium text-primary hover:underline"
              href={whatsappUrl(
                APP_CONFIG.whatsapp,
                `Hola Gamalink, soy de ${empresa.nombre} y me interesa contratar un servicio.`,
              )}
              rel="noreferrer"
              target="_blank"
            >
              Escríbenos para empezar
            </a>
            .
          </p>
        </section>
      ) : (
        <ListaPendientes pendientes={pendientes} />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {citas ? (
          <TarjetaServicio
            accion={{ label: "Nueva cita", href: conEmpresa("/dashboard/citas", empresa.id) }}
            datos={[
              { label: "Citas por atender hoy", valor: String(citas.proximasHoy.length) },
              { label: "Atendidas hoy", valor: String(citas.atendidasHoy) },
            ]}
            enlace={{ label: "Agenda", href: conEmpresa("/dashboard/citas", empresa.id) }}
            icono={CalendarClock}
            titulo="Citas"
          >
            {citas.proximasHoy.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {citas.proximasHoy.slice(0, 4).map((cita) => (
                  <li className="flex justify-between gap-2" key={cita.id}>
                    <span className="truncate">
                      <span className="font-medium tabular-nums">{horaMx(cita.inicio)}</span> · {cita.cliente_nombre}
                    </span>
                    <span className="shrink-0 text-muted-foreground text-xs">{ESTADO_CITA_LABEL[cita.estado]}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </TarjetaServicio>
        ) : null}

        {tienda ? (
          <TarjetaServicio
            accion={{ label: "Nueva venta", href: conEmpresa("/dashboard/tienda/vender", empresa.id) }}
            datos={[
              { label: `Vendido hoy (${tienda.ventasHoy})`, valor: formatoDinero(tienda.hoy) },
              { label: "Vendido en el mes", valor: formatoDinero(tienda.mes) },
            ]}
            enlace={{ label: "Resumen", href: conEmpresa("/dashboard/tienda", empresa.id) }}
            icono={Store}
            titulo="Tiendita"
          />
        ) : null}

        {membresias ? (
          <TarjetaServicio
            accion={{ label: "Registrar pago", href: conEmpresa("/dashboard/membresias/socios", empresa.id) }}
            datos={[
              { label: "Socios activos", valor: String(membresias.activos) },
              { label: "Ingresos del mes", valor: formatoDinero(membresias.ingresosMes) },
            ]}
            enlace={{ label: "Resumen", href: conEmpresa("/dashboard/membresias", empresa.id) }}
            icono={Dumbbell}
            titulo="Membresías"
          >
            {membresias.porVencer.length > 0 ? (
              <p className="text-muted-foreground text-xs">
                {membresias.porVencer.length} por vencer en los próximos {DIAS_AVISO} días.
              </p>
            ) : null}
          </TarjetaServicio>
        ) : null}

        {tiene("landing") ? <TarjetaLanding datos={landing} /> : null}
      </div>
    </div>
  );
}

export function InicioNegocio({ empresas }: { empresas: EmpresaContext[] }) {
  if (empresas.length === 0) {
    return (
      <p className="rounded-xl border bg-card p-4 text-muted-foreground">
        Tu usuario aún no está vinculado a un negocio. Contacta a Gamalink para que te den acceso.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-8">
      {empresas.map((empresa) => (
        <SeccionEmpresa empresa={empresa} key={empresa.id} mostrarNombre={empresas.length > 1} />
      ))}
    </div>
  );
}
