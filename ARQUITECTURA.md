# Arquitectura de Gamalink

Gamalink es el panel con el que administro mi negocio: vendo servicios digitales a otros negocios
(landing pages, membresías para gyms, citas, tienditas) y cada cliente administra lo suyo desde aquí.

## Modelo

```
Superadmin (dueño de Gamalink) ── ve y administra todo
 │
 ├─ Empresa "Taquería X"   servicios: landing
 ├─ Empresa "GymForge"     servicios: membresías + landing
 ├─ Empresa "Barbería Y"   servicios: citas
 └─ Empresa "Tienda Z"     servicios: tiendita
        │
        └─ usuarios de la empresa: dueño (y más adelante empleados)
```

### Reglas

1. **Cada cliente es una empresa (`gl_empresas`)** y sus datos están aislados de las demás.
2. **Toda tabla de negocio lleva `empresa_id`** (leads, citas, socios, productos, ventas…) y usa la
   misma regla de RLS: *superadmin, o el usuario pertenece a esa empresa*. Una sola función de acceso
   reutilizada, nunca políticas sueltas tipo `auth.role() = 'authenticated'`.
3. **Una empresa puede tener varios servicios.** Los servicios contratados viven en
   `gl_empresa_servicios` (empresa, servicio, estado, precio, vencimiento), no en un plan único.
   El sidebar y las rutas se muestran según **rol + servicios activos de la empresa**.
4. **Los clientes de mis clientes no son usuarios.** Socios de un gym, compradores de una tiendita o
   personas que agendan cita son filas de datos (`gl_socios`, `gl_ventas`…), no cuentas con login.

### Roles (`gl_usuarios.role_slug`)

| Rol | Quién | Acceso |
|---|---|---|
| `superadmin` | Yo | Todo: todas las empresas, cobranza, configuración global |
| `dueno` | Mi cliente | Su empresa: los módulos de los servicios que contrató |
| `empleado` | Personal de mi cliente (futuro) | Parte de los módulos de su empresa |

`gl_usuarios.rol` y `gl_user_roles` se eliminan cuando se unifique todo en `role_slug`.

### Servicios y módulos

| Servicio | Qué hace el dueño | Base visual de la plantilla |
|---|---|---|
| `landing` | Editar su landing, subir imágenes, ver métricas | configuration, landing-analytics |
| `membresias` ✅ | Socios, planes, pagos, ingresos, quién vence (`/dashboard/membresias`) | finance, users |
| `citas` ✅ | Agenda semanal, servicios con duración, horario y capacidad, recordatorio por WhatsApp (`/dashboard/citas`) | calendar |
| `tienda` ✅ | Punto de venta, productos, inventario con historial, ventas y ganancia (`/dashboard/tienda`) | ecommerce |
| (todos) | Leads / contactos | crm |

Panel del superadmin: empresas, servicios contratados, cobranza (`gl_cobros`), usuarios.

**Inicio** (`/dashboard/default`): para cada negocio, pendientes del día y una tarjeta por servicio
contratado; para el superadmin, ingreso mensual, cobranza próxima y servicios por tipo.

**Referencias** (menú Desarrollo → Referencias, solo superadmin): las demos de la plantilla sin
funcionalidad real. Se usan como base visual al construir un módulo nuevo; no se muestran a clientes.

## Tablas antiguas (a migrar)

| Tabla | Destino |
|---|---|
| `gda_clientes` | `gl_empresas` (contacto, Stripe) |
| `gda_pagos` | `gl_cobros` (mi cobranza, solo superadmin) |
| `clientes`, `planes`, `pagos` | Módulo membresías: `gl_socios`, `gl_membresias`, `gl_pagos_socios` con `empresa_id` |
| `citas`, `configuracion` | Módulo citas: `gl_citas` (ya existe) y configuración por empresa |

Mientras se migran quedan cerradas: solo el superadmin puede leerlas.

## Plan de trabajo

- **Fase 0 – Seguridad:** desactivar registro abierto en Supabase Auth, cerrar tablas antiguas,
  limpiar políticas RLS duplicadas, verificar que nadie pueda cambiarse el rol.
- **Fase 1 – Base:** unificar roles en `role_slug`, crear `gl_empresa_servicios`, una función de
  acceso por empresa, sidebar y proxy por rol + servicios.
- **Fase 2 – Landings:** el dueño edita su propia landing, sube imágenes y ve métricas; el
  superadmin ve todas.
- **Fase 3+ – Módulos:** membresías → citas → tiendita, uno a la vez.

## Archivos clave

- `src/proxy.ts` — subdominios/dominios de landings y protección de rutas por rol.
- `src/lib/dashboard-access.ts` — qué rutas ve cada rol y qué rutas desbloquea cada servicio
  (`SERVICE_ROUTES`). Al crear un módulo nuevo, agregar sus rutas ahí.
- `src/lib/session.ts` — `getSessionContext()`: usuario, rol, empresas y servicios (vía la función
  `gl_mi_contexto()` de Supabase), una vez por request.
- `src/app/(main)/dashboard/empresas/` + `src/server/empresas-actions.ts` — panel del superadmin:
  empresas, servicios contratados e invitación de dueños.
- `src/app/(main)/dashboard/_components/modulo/` — piezas comunes de los módulos (encabezado con
  pestañas y selector de empresa, gráfica de dinero). `src/lib/formato.ts` — fechas (hora de México) y dinero.
- `src/lib/sb/admin.ts` — cliente con service role (solo servidor, solo tras verificar superadmin).
- `src/app/auth/set-password/` — destino del correo de invitación: el dueño crea su contraseña.
- `src/app/tenant/page.tsx` — sirve la landing pública según el dominio.
- `src/lib/landings/` — modelo y validación del contenido de las landings.
- Scripts SQL en la raíz (`*.sql`) — se ejecutan a mano en Supabase → SQL Editor.

## Pendiente: salir de Supabase y Vercel a un VPS

Objetivo: dejar de pagar Supabase y Vercel y correr todo en un VPS propio con costo fijo.
No es solo mover la base de datos: el sistema usa cuatro piezas de Supabase y una de Vercel.

| Pieza | Dónde se usa | Qué hay que resolver |
|---|---|---|
| Postgres | Todas las tablas `gl_*`, funciones `.rpc()` (`gl_mi_contexto`, `gl_tienda_registrar_venta`, `gl_agenda_crear_cita`…) | Se migra con `pg_dump`/`pg_restore`; es la parte fácil. |
| Auth | Login, invitación de dueños (`auth.admin.inviteUserByEmail`), `/auth/set-password`, alta y baja de usuarios en `empresas-actions.ts` | Sin Supabase hay que reemplazarlo (Auth.js, Better Auth…) y reescribir esos flujos, incluido el envío de correos (SMTP propio). |
| RLS | Las políticas y `gl_is_superadmin()` / acceso por empresa dependen de `auth.uid()`. Siete componentes consultan la BD directo desde el navegador (`src/lib/sb/supabase_config.ts`) confiando en RLS. | Sin Supabase no hay `auth.uid()` ni acceso directo desde el navegador: esas consultas pasan a server actions y el filtro por `empresa_id` se hace en el servidor (o se emula `auth.uid()` con una variable de sesión de Postgres). |
| Storage | Bucket `gl-landing-images` (editor de landings) | Mover las imágenes a disco o a un S3 compatible (MinIO, Cloudflare R2). |
| Vercel | Hosting de Next.js y **dominios propios de las landings con SSL automático** (`src/proxy.ts`, `src/app/tenant`) | En el VPS: Next.js en Node o Docker detrás de Caddy con *on-demand TLS* para emitir certificados a cada dominio de cliente. |

### Caminos

1. **Supabase self-hosted en el VPS (Docker) — recomendado como primer paso.** Se conserva Auth, RLS,
   Storage y el código casi sin cambios; solo cambian las URLs y llaves en las variables de entorno.
   Deja de pagarse Supabase. Contra: el stack de Supabase pide más RAM (≈4 GB) y hay que mantenerlo actualizado.
2. **Postgres puro + auth propia.** Más ligero y con control total, pero es una reescritura de auth,
   permisos y subida de imágenes en ~38 archivos que hoy importan el cliente de Supabase.

Se puede hacer 1 ahora y 2 más adelante, módulo por módulo.

### Antes de migrar

- **Respaldos:** los términos prometen conservar la información hasta 12 meses tras una baja. Configurar
  `pg_dump` diario fuera del VPS (otro proveedor o bucket) y probar una restauración.
- **Correo:** las invitaciones salen hoy por el SMTP de Supabase; en el VPS hace falta un SMTP propio
  (Resend, Amazon SES…).
- **Monitoreo y actualizaciones** del servidor pasan a ser responsabilidad propia.

## Roadmap

### Cobros con Stripe (pagos domiciliados)

Objetivo: cobrar las mensualidades con cargo automático a tarjeta en lugar de perseguir transferencias.

- **Fase A — Gamalink cobra a sus clientes.** Stripe Billing con suscripciones por empresa: un
  `Customer` por `gl_empresas` y un `Price` por servicio de `gl_empresa_servicios` (mensual y anual).
  Webhooks (`invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`) actualizan
  `gl_cobros` y el estado del servicio; la suspensión al 4.º día de atraso de los términos se vuelve
  automática. `gda_clientes` ya tenía columnas de Stripe: revisarlas al migrar a `gl_empresas`.
- **Fase B — los clientes cobran a sus socios** (membresías del gym, anticipos de citas, ventas de la
  tiendita). Requiere Stripe Connect (cuentas conectadas por empresa) y es otro producto: valorar
  cobrar comisión o subir el precio del módulo.
- Pendientes: los pagos en OXXO no sirven para domiciliar (son pago único); confirmar qué métodos
  recurrentes acepta Stripe en México al momento de implementarlo. Las llaves y el secreto del webhook
  van en variables de entorno, nunca en el código.

### Inicio de sesión con Google y SSO

- **Google:** proveedor OAuth de Supabase Auth (`signInWithOAuth({ provider: "google" })`). Ojo con
  las invitaciones: el dueño invitado por correo debe poder entrar con Google si es el mismo correo;
  si no, se crearía un usuario nuevo sin empresa. Verificar la vinculación de identidades antes de
  publicarlo.
- **SSO empresarial (SAML/Microsoft Entra/Google Workspace):** solo tiene sentido para clientes del
  plan A la Medida con varios usuarios. En Supabase Cloud el SSO por SAML es de planes de pago, lo que
  choca con la migración a VPS: decidir el proveedor de auth (ver "Pendiente: salir de Supabase y
  Vercel") antes de construirlo.

### Funciones que sostienen el precio

Comparado con la competencia (software de gym y agendas de $400 a $2,000 MXN/mes), estas funciones
son las que los clientes esperan. Con las tres primeras listas, el plan Página + Sistema puede subir de
$900 a ~$1,100–1,200/mes.

1. **Citas — reserva en línea desde la landing.** Hoy solo el dueño agenda. Bloque "Agenda tu cita" en
   la landing pública que use `horariosDisponibles` y cree la cita sin login. Como la landing es
   pública, la cita debe crearse con una función de la BD acotada (solo inserta en esa empresa, valida
   horario y capacidad) y con freno de abuso (captcha o límite por teléfono/IP). Ojo: la función
   `gl_agenda_crear_cita` vive en Supabase y no está en los `.sql` del repo; revisarla y versionarla.
2. **Citas — recordatorios automáticos.** Hoy el dueño los manda a mano con un enlace `wa.me`.
   Automatizarlos requiere un envío programado (cron) y un canal: correo (barato) o la API de WhatsApp
   Business (cobra por mensaje → incluir un cupo en el plan y cobrar el excedente).
3. **Membresías — aviso automático de vencimiento al socio.** Mismo mecanismo que los recordatorios:
   tarea diaria que busca membresías que vencen en N días y avisa al socio (y un resumen al dueño).
4. **Tienda — ticket de venta y corte de caja.** Ticket imprimible o compartible por WhatsApp al
   registrar la venta; corte del día con total por método de pago, ventas canceladas y ganancia.
5. **Todos — exportar a Excel.** Socios, pagos, citas, productos y ventas a `.xlsx`/CSV con los filtros
   de la pantalla.
6. **Todos — cobro automático.** Ver "Cobros con Stripe" (fase A para la mensualidad de Gamalink,
   fase B para que los negocios cobren a sus clientes).

## Precios y reglas comerciales

Fuente de verdad para la página de precios (`src/app/(marketing)/components/PricingSection.tsx`) y los
términos (`src/app/(marketing)/terminos-y-condiciones/page.tsx`). Si cambia algo aquí, cambiar ambos.

| Producto | Instalación | Mensual | Anual (por mes) | Página web | Plazo mínimo |
|---|---|---|---|---|---|
| Página Web | $2,500 | $400 | $333 | — | Ninguno |
| Membresías | $0 | $900 | $750 | Incluida | 6 meses |
| Citas | $0 | $900 | $750 | Incluida | 6 meses |
| Tienda | $0 | $500 | $417 | +$350/mes | 3 meses |
| A la Medida | desde $15,000 + IVA | desde $1,500 + IVA | desde $1,250 + IVA | Incluida | Por contrato |

- **IVA:** todo con IVA incluido, excepto A la Medida (+ IVA).
- **Pago anual:** 12 meses por el precio de 10. Cubre el plazo mínimo y no es reembolsable una vez iniciado.
- **Combinaciones:** se cobra completo el sistema de mayor precio y +$350/mes por cada sistema adicional
  (la Página Web agregada a la Tienda cuenta como adicional). Ej.: Membresías + Tienda = $1,250.
  Sin esta regla, Tienda ($500) + Membresías (+$350) saldría más barato que Membresías sola.
- **Plazo mínimo:** solo en los sistemas con instalación gratis. En combinaciones aplica el más largo
  (si incluye Membresías o Citas, 6 meses). Agregar sistemas durante el plazo no lo reinicia.
- **Penalización por cancelar antes del plazo:** 50% de las mensualidades que falten, con la mensualidad
  vigente. Ej.: Membresías cancelada tras el mes 1 → 5 × $900 × 50% = $2,250; Tienda tras el mes 1 →
  2 × $500 × 50% = $500; Membresías + Tienda tras el mes 1 → 5 × $1,250 × 50% = $3,125.
- **Reinstalación tras baja:** 50% del costo de instalación original, mínimo $1,500.
- **Cambios extra:** secciones nuevas en la página desde $300; funciones nuevas a la medida desde $1,000.
- **Posicionamiento:** $900 es precio de lanzamiento. Subir a ~$1,100–1,200 cuando existan reserva en
  línea, check-in y recordatorios automáticos (ver Roadmap). La Tienda va más barata porque compite con
  puntos de venta gratuitos o de bajo costo.
