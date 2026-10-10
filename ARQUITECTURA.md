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
| `membresias` | Socios, suscripciones, pagos, ganancias | finance, users |
| `citas` | Agenda, servicios, recordatorios | calendar |
| `tienda` | Productos, inventario, ventas | ecommerce |
| (todos) | Leads / contactos | crm |

Panel del superadmin: empresas, servicios contratados, cobranza (`gl_cobros`), usuarios.

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
- `src/lib/sb/admin.ts` — cliente con service role (solo servidor, solo tras verificar superadmin).
- `src/app/auth/set-password/` — destino del correo de invitación: el dueño crea su contraseña.
- `src/app/tenant/page.tsx` — sirve la landing pública según el dominio.
- `src/lib/landings/` — modelo y validación del contenido de las landings.
- Scripts SQL en la raíz (`*.sql`) — se ejecutan a mano en Supabase → SQL Editor.
