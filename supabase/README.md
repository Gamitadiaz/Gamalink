# Supabase

Archivos de la base de datos y de Auth que viven en Supabase y se versionan aquí.

## Plantillas de correo (`templates/`)

Supabase no las lee de este repo: se copian a mano en **Supabase → Authentication → Emails → Templates**.

| Plantilla en Supabase | Archivo | Asunto |
|---|---|---|
| Invite user | `templates/invitacion.html` | Tu panel de Gamalink está listo |
| Reset password | `templates/recuperar-contrasena.html` | Cambia tu contraseña de Gamalink |

- Los enlaces llevan a `/auth/set-password?token_hash=…&type=…`, que abre la sesión con `verifyOtp`.
- La invitación usa `{{ .RedirectTo }}` (el dominio desde el que se invitó, ver `invitarDueno`).
  La de contraseña usa `{{ .SiteURL }}`: en **Authentication → URL Configuration** el *Site URL* debe
  ser `https://gamalink.online` y `https://gamalink.online/auth/set-password` debe estar en *Redirect URLs*.
- El remitente se cambia en **Authentication → Emails → SMTP Settings** con un SMTP propio
  (Resend, Brevo…) y un correo del dominio, p. ej. `Gamalink <no-responder@gamalink.online>`.
  Sin SMTP propio, Supabase envía desde su dirección de prueba y con un límite muy bajo por hora.

## Esquema (`schema.sql`)

Pendiente de traer. Solo el esquema (tablas, funciones, RLS), nunca los datos de los clientes.
Con la cadena de **Connect → Session pooler** de Supabase (la contraseña solo en la terminal):

```
docker run --rm -v "$PWD/supabase":/out postgres:17 \
  pg_dump "postgresql://postgres.XXXX:PASSWORD@aws-0-XXXX.pooler.supabase.com:5432/postgres" \
  --schema-only --schema=public --no-owner -f /out/schema.sql
```

Con `--schema=storage` y `-f /out/storage.sql` salen también las políticas del bucket de imágenes.
