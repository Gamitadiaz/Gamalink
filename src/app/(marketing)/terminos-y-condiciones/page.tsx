import type { ReactNode } from "react";

import type { Metadata } from "next";

import Footer from "@/app/(marketing)/components/Footer";
import Navbar from "@/app/(marketing)/components/Navbar";
import { APP_CONFIG } from "@/config/app-config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Términos y condiciones",
  description: "Condiciones de pago, cancelación, soporte, mantenimiento y dominios de los servicios de Gamalink.",
  path: "/terminos-y-condiciones",
});

// BORRADOR basado en el "Contrato de prestación de servicios y SLA" (media/). Antes de considerarlo definitivo,
// pide que lo revise un abogado. Las secciones 6 a 9 no estaban en el contrato y se agregaron como cláusulas generales.
const RESPONSABLE = "Gamaliel Diaz Alegría";
const ULTIMA_ACTUALIZACION = "15 de octubre de 2026";

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-bold text-slate-900 text-xl">{titulo}</h2>
      <div className="space-y-3 text-slate-700 leading-relaxed">{children}</div>
    </section>
  );
}

export default function TerminosYCondiciones() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
        <header className="space-y-2">
          <h1 className="font-extrabold text-4xl tracking-tight">Términos y condiciones</h1>
          <p className="text-slate-500">Última actualización: {ULTIMA_ACTUALIZACION}</p>
        </header>

        <p className="text-slate-700 leading-relaxed">
          Estos términos establecen las condiciones bajo las cuales <strong>Gamalink</strong>, operado por {RESPONSABLE}{" "}
          (en adelante, &quot;Gamalink&quot;), presta servicios de páginas web, software y sistemas de gestión a sus
          clientes (en adelante, &quot;el Cliente&quot;). <strong>Realizar el pago inicial</strong> (anticipo o primera
          mensualidad) <strong>significa que el Cliente acepta estos términos.</strong> Los precios publicados incluyen
          IVA, excepto los del plan A la Medida, que se indican como &quot;+ IVA&quot; y a los que se suma el IVA vigente.
        </p>

        <Seccion titulo="1. Pagos, entregas y cancelaciones">
          <p>
            <strong>Pago inicial.</strong> En los planes con costo de instalación (Página Web y A la
            Medida), el desarrollo inicia tras el pago de un <strong>anticipo del 50%, no reembolsable</strong>.
            El 50% restante se paga contra entrega. En el plan Página + Sistema (instalación $0), el desarrollo inicia
            con el pago por adelantado de la primera mensualidad.
          </p>
          <p>
            <strong>Cancelación del proyecto.</strong> Si el Cliente cancela una vez iniciado el desarrollo, el anticipo
            no se reembolsa, ya que cubre el tiempo técnico y operativo invertido.
          </p>
          <p>
            <strong>Entrega.</strong> Gamalink presenta el proyecto terminado en una dirección temporal de prueba. Una
            vez que el Cliente lo aprueba y liquida el 100%, se publica en el dominio oficial y se entregan las
            credenciales de acceso junto con el manual de uso.
          </p>
          <p>
            <strong>Tiempos de entrega.</strong> El tiempo estimado (de 1 a 2 semanas según el plan) empieza a contar
            desde el día en que el Cliente entrega todo el material necesario: logotipos, imágenes, textos y precios.
          </p>
          <p>
            <strong>Plazo mínimo del plan Página + Sistema.</strong> Para conservar la instalación a $0, este plan
            requiere un compromiso mínimo de <strong>6 meses</strong>. Si el Cliente cancela antes, deberá cubrir una
            tarifa de recuperación de instalación de <strong>$2,500 MXN</strong>. Después del sexto mes, el servicio es
            mes a mes y puede cancelarse sin penalización.
          </p>
        </Seccion>

        <Seccion titulo="2. Mensualidades, suspensión y respaldos">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Pago anual:</strong> si el Cliente paga 12 mensualidades por adelantado, solo cubre 10. El pago
              anual no es reembolsable una vez iniciado el periodo.
            </li>
            <li>
              <strong>Tolerancia:</strong> las mensualidades se pagan cada mes, con 3 días naturales de tolerancia
              después de la fecha de corte.
            </li>
            <li>
              <strong>Suspensión:</strong> al cuarto día natural de atraso, la página web y el panel administrativo se
              suspenden temporalmente.
            </li>
            <li>
              <strong>Reactivación:</strong> una vez confirmado el pago, el servicio se reactiva en un máximo de 24
              horas en días hábiles.
            </li>
            <li>
              <strong>Baja definitiva:</strong> después de 90 días naturales sin pago, el servicio se da de baja.
            </li>
            <li>
              <strong>Respaldo y reinstalación:</strong> tras una baja, Gamalink conserva un respaldo de la información
              hasta por 12 meses. Si el Cliente pide reinstalar el servicio en ese plazo, deberá cubrir el 50% del costo
              de instalación original del plan, con un mínimo de $1,500 MXN.
            </li>
          </ul>
        </Seccion>

        <Seccion titulo="3. Mantenimiento incluido y cambios adicionales">
          <p>
            El Cliente puede editar los textos e imágenes de su página web desde su panel, sin límite y sin costo. Si
            prefiere que Gamalink haga esos cambios por él, la mensualidad incluye:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Hasta 2 imágenes y 3 bloques de texto por página.</li>
            <li>Un máximo total de 10 imágenes y 15 bloques de texto al mes en todo el sitio.</li>
          </ul>
          <p>
            No incluye rediseños, cambios de estructura, funciones nuevas (por ejemplo, carritos de compra) ni cambios
            al código del panel administrativo. Estos se cotizan por separado:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Nuevas secciones en la página web: desde $300 MXN.</li>
            <li>
              Módulos adicionales ya disponibles en la plataforma (Membresías, Citas o Tienda): $350 MXN al mes cada
              uno, sin costo de instalación.
            </li>
            <li>Funciones nuevas desarrolladas a la medida en el panel administrativo: desde $1,000 MXN.</li>
          </ul>
          <p>
            Cualquier cambio que no esté en la cotización inicial se pausa, se cotiza aparte y, si el Cliente lo
            aprueba, se agrega a su cobro.
          </p>
        </Seccion>

        <Seccion titulo="4. Horario de soporte">
          <p>
            El soporte se brinda de <strong>lunes a viernes, de 8:00 a 17:00 (hora del centro de México)</strong>, por
            WhatsApp al {APP_CONFIG.whatsappVisible} o al correo {APP_CONFIG.correo}. Las solicitudes fuera de ese
            horario o en fin de semana se atienden como soporte extraordinario, según disponibilidad.
          </p>
        </Seccion>

        <Seccion titulo="5. Propiedad del software y dominios">
          <p>
            <strong>Plan Página + Sistema:</strong> el código, la base de datos y la arquitectura de la plataforma son
            propiedad de Gamalink. El Cliente paga una suscripción por la licencia de uso.
          </p>
          <p>
            <strong>Plan A la Medida:</strong> el Cliente es dueño de su copia de la plataforma desarrollada a
            la medida, y Gamalink conserva el derecho de reutilizar la tecnología base.
          </p>
          <p>
            <strong>Dominios:</strong> los planes incluyen el registro de dominios <strong>.com</strong> o{" "}
            <strong>.com.mx</strong>; otras terminaciones se cotizan aparte. Durante la vigencia del servicio, el
            dominio se registra y administra a nombre de Gamalink. Si el Cliente cancela y está al corriente en sus
            pagos, puede solicitar que el dominio se transfiera a su nombre cubriendo una tarifa de $500 MXN.
          </p>
        </Seccion>

        <Seccion titulo="6. Contenido del Cliente">
          <p>
            El Cliente es responsable de que los textos, imágenes, logotipos, precios y demás material que entrega sean
            correctos y de que tenga derecho a usarlos. Gamalink puede retirar contenido que sea ilegal o que infrinja
            derechos de terceros.
          </p>
        </Seccion>

        <Seccion titulo="7. Disponibilidad del servicio">
          <p>
            Gamalink procura que las páginas y el panel estén disponibles en todo momento, pero puede haber
            interrupciones por mantenimiento o por fallas de proveedores externos (alojamiento, base de datos,
            dominios). En esos casos, Gamalink trabajará para restablecer el servicio lo antes posible y no será
            responsable de pérdidas indirectas, como ventas no realizadas.
          </p>
        </Seccion>

        <Seccion titulo="8. Datos personales">
          <p>
            El uso de los datos personales se rige por nuestro{" "}
            <a href="/aviso-de-privacidad" className="font-semibold text-[#5a67c5] hover:underline">
              Aviso de privacidad
            </a>
            .
          </p>
        </Seccion>

        <Seccion titulo="9. Cambios a estos términos">
          <p>
            Si estos términos cambian, publicaremos la nueva versión en esta página con su fecha de actualización y lo
            avisaremos a los clientes con servicio activo. Los cambios de precio de un servicio vigente se notificarán
            con al menos 30 días de anticipación.
          </p>
        </Seccion>
      </main>

      <Footer />
    </div>
  );
}
