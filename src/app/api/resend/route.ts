import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_DOMAIN = process.env.RESEND_FROM_EMAIL;

export async function POST(req: NextRequest) {
  try {
    if (!FROM_DOMAIN) {
      return NextResponse.json({ error: 'RESEND_FROM_EMAIL no está configurado en las variables de entorno.' }, { status: 500 });
    }

    const body = await req.json();
    const { tipo, cliente, config } = body;

    // ── Validaciones básicas ──────────────────────────────────────
    if (!tipo || !cliente) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos.' }, { status: 400 });
    }

    if (!cliente.correo) {
      return NextResponse.json({ error: 'El cliente no tiene correo registrado.' }, { status: 400 });
    }

    const nombreNegocio = config?.nombre_negocio || 'Tu Negocio';

    // ── Templates de correo ───────────────────────────────────────
    let subject = '';
    let html    = '';

    if (tipo === 'bienvenida') {
      subject = `¡Bienvenido a ${nombreNegocio}! 🎉`;
      html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f9fafb; margin:0; padding:0;">
          <div style="max-width:520px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background:#2563eb; padding:32px 40px; text-align:center;">
              <h1 style="color:#fff; margin:0; font-size:24px; font-weight:900; letter-spacing:-0.5px;">
                ${nombreNegocio}
              </h1>
            </div>

            <!-- Body -->
            <div style="padding:36px 40px;">
              <h2 style="font-size:20px; font-weight:800; color:#111827; margin:0 0 8px;">
                ¡Bienvenido, ${cliente.nombre}! 👋
              </h2>
              <p style="color:#6b7280; font-size:15px; line-height:1.6; margin:0 0 24px;">
                Tu membresía ha sido registrada exitosamente. Aquí están los detalles de tu plan:
              </p>

              <!-- Info card -->
              <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:20px 24px; margin-bottom:24px;">
                <table style="width:100%; border-collapse:collapse;">
                  <tr>
                    <td style="padding:6px 0; color:#6b7280; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Plan</td>
                    <td style="padding:6px 0; color:#111827; font-size:14px; font-weight:700; text-align:right;">${cliente.plan}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#6b7280; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Inicio</td>
                    <td style="padding:6px 0; color:#111827; font-size:14px; font-weight:700; text-align:right;">${cliente.fecha_inicio || '—'}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#6b7280; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Vencimiento</td>
                    <td style="padding:6px 0; color:#2563eb; font-size:14px; font-weight:800; text-align:right;">${cliente.fecha_vencimiento || '—'}</td>
                  </tr>
                </table>
              </div>

              <p style="color:#9ca3af; font-size:13px; margin:0;">
                Si tienes dudas, comunícate directamente con ${nombreNegocio}.
              </p>
            </div>

            <!-- Footer -->
            <div style="padding:20px 40px; background:#f9fafb; border-top:1px solid #f3f4f6; text-align:center;">
              <p style="color:#d1d5db; font-size:12px; margin:0;">
                Este correo fue enviado por ${nombreNegocio} · Powered by Gamalink
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    else if (tipo === 'vencimiento') {
      const diasTexto = cliente.dias_restantes === 0
        ? 'hoy'
        : cliente.dias_restantes === 1
          ? 'mañana'
          : `en ${cliente.dias_restantes} días`;

      subject = `⚠️ Tu membresía vence ${diasTexto} — ${nombreNegocio}`;
      html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f9fafb; margin:0; padding:0;">
          <div style="max-width:520px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header naranja para urgencia -->
            <div style="background:#ea580c; padding:32px 40px; text-align:center;">
              <p style="color:#fed7aa; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; margin:0 0 8px;">Aviso de vencimiento</p>
              <h1 style="color:#fff; margin:0; font-size:24px; font-weight:900;">${nombreNegocio}</h1>
            </div>

            <!-- Body -->
            <div style="padding:36px 40px;">
              <h2 style="font-size:20px; font-weight:800; color:#111827; margin:0 0 8px;">
                Hola, ${cliente.nombre} 👋
              </h2>
              <p style="color:#6b7280; font-size:15px; line-height:1.6; margin:0 0 24px;">
                Te avisamos que tu membresía <strong style="color:#111827;">${cliente.plan}</strong> vence <strong style="color:#ea580c;">${diasTexto}</strong> (${cliente.fecha_vencimiento}).
              </p>

              <!-- Alerta -->
              <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:12px; padding:16px 20px; margin-bottom:24px; display:flex; align-items:center; gap:12px;">
                <span style="font-size:24px;">⏰</span>
                <p style="margin:0; color:#c2410c; font-size:14px; font-weight:600;">
                  Renueva a tiempo para no perder el acceso.
                </p>
              </div>

              <p style="color:#9ca3af; font-size:13px; margin:0;">
                Comunícate con ${nombreNegocio} para renovar tu membresía.
              </p>
            </div>

            <!-- Footer -->
            <div style="padding:20px 40px; background:#f9fafb; border-top:1px solid #f3f4f6; text-align:center;">
              <p style="color:#d1d5db; font-size:12px; margin:0;">
                Este correo fue enviado por ${nombreNegocio} · Powered by Gamalink
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    else {
      return NextResponse.json({ error: 'Tipo de correo no válido.' }, { status: 400 });
    }

    // ── Enviar con Resend ─────────────────────────────────────────
    const { data, error } = await resend.emails.send({
        from: `${nombreNegocio} <${FROM_DOMAIN}>`,
        to:   [cliente.correo],
        subject,
        html,
        replyTo: config.correo_contacto || undefined,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });

  } catch (err: any) {
    console.error('Send email error:', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
