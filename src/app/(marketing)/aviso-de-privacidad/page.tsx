import type { Metadata } from "next";

import Footer from "@/app/(marketing)/components/Footer";
import Navbar from "@/app/(marketing)/components/Navbar";
import { APP_CONFIG } from "@/config/app-config";

export const metadata: Metadata = {
  title: "Aviso de privacidad · Gamalink",
  description: "Cómo Gamalink trata los datos personales de sus clientes y de los visitantes de sus páginas.",
};

// BORRADOR basado en la LFPDPPP (México). Antes de considerarlo definitivo:
//   1. Completa RESPONSABLE (nombre legal y domicilio).
//   2. Pide que lo revise un abogado o especialista en protección de datos.
const RESPONSABLE = {
  nombre: "Gamaliel Diaz Alegría",
  domicilio: "Independencia 12, El Garruñal Huimilpan, 76984, Queretaro, México",
};
const ULTIMA_ACTUALIZACION = "11 de octubre de 2026";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-bold text-slate-900 text-xl">{titulo}</h2>
      <div className="space-y-3 text-slate-700 leading-relaxed">{children}</div>
    </section>
  );
}

export default function AvisoDePrivacidad() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
        <header className="space-y-2">
          <h1 className="font-extrabold text-4xl tracking-tight">Aviso de privacidad</h1>
          <p className="text-slate-500">Última actualización: {ULTIMA_ACTUALIZACION}</p>
        </header>

        <Seccion titulo="1. Responsable de tus datos">
          <p>
            {RESPONSABLE.nombre}, que opera la plataforma <strong>Gamalink</strong>, con domicilio en{" "}
            {RESPONSABLE.domicilio}, es responsable del uso y protección de tus datos personales, conforme a la Ley
            Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
          </p>
          <p>
            Contacto para temas de privacidad: <strong>{APP_CONFIG.correo}</strong> o WhatsApp{" "}
            <strong>{APP_CONFIG.whatsappVisible}</strong>.
          </p>
        </Seccion>

        <Seccion titulo="2. Qué datos recabamos">
          <p>
            <strong>De nuestros clientes</strong> (negocios que contratan Gamalink y las personas que usan su cuenta):
            nombre, correo electrónico o nombre de usuario, teléfono o WhatsApp, nombre y datos del negocio, y la
            información de los servicios contratados (precios, fechas y pagos).
          </p>
          <p>
            <strong>De los clientes de nuestros clientes</strong> (por ejemplo, socios de un gimnasio, personas que
            agendan una cita o compradores de una tienda): nombre, teléfono, correo electrónico y el historial de pagos,
            citas o compras que el negocio registre en la plataforma.
          </p>
          <p>
            <strong>De quienes visitan las páginas web</strong> que alojamos: un identificador anónimo guardado en una
            cookie, la página visitada, el sitio de procedencia y los clics en botones de contacto. Con esto no
            identificamos a la persona.
          </p>
          <p>No recabamos datos personales sensibles ni datos financieros como números de tarjeta.</p>
        </Seccion>

        <Seccion titulo="3. Para qué usamos tus datos">
          <p>Finalidades necesarias para el servicio:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Crear y administrar tu cuenta y darte acceso a la plataforma.</li>
            <li>Prestar los servicios contratados: página web, membresías, citas y punto de venta.</li>
            <li>Mostrarte estadísticas de tu negocio y de las visitas a tu página.</li>
            <li>Darte soporte, avisarte de vencimientos y cobrar los servicios.</li>
            <li>Mantener la seguridad de la plataforma y cumplir obligaciones legales.</li>
          </ul>
          <p>
            Finalidad adicional: enviarte información sobre nuevos servicios de Gamalink. Si no quieres recibirla,
            escríbenos a {APP_CONFIG.correo}; negarte no afecta el servicio que tienes contratado.
          </p>
        </Seccion>

        <Seccion titulo="4. Datos de los clientes de nuestros clientes">
          <p>
            Cuando un negocio registra a sus propios clientes en Gamalink,{" "}
            <strong>ese negocio es el responsable</strong> de esos datos y Gamalink solo los guarda y procesa por su
            cuenta, como encargado. Cada negocio debe tener su propio aviso de privacidad frente a sus clientes. Si eres
            cliente de uno de esos negocios y quieres ejercer tus derechos, contacta primero al negocio; si lo
            necesitas, también podemos ayudarte.
          </p>
        </Seccion>

        <Seccion titulo="5. Con quién compartimos tus datos">
          <p>
            No vendemos ni rentamos tus datos. Solo los compartimos con proveedores que nos ayudan a operar la
            plataforma y que están obligados a protegerlos: alojamiento de la base de datos (Supabase), alojamiento de
            la aplicación (Vercel) y envío de correos (Resend). Estos proveedores pueden almacenar la información fuera
            de México.
          </p>
          <p>También podemos compartirlos cuando una autoridad competente lo requiera conforme a la ley.</p>
        </Seccion>

        <Seccion titulo="6. Tus derechos (ARCO) y cómo ejercerlos">
          <p>
            Tienes derecho a <strong>Acceder</strong> a tus datos, <strong>Rectificarlos</strong> si son incorrectos,{" "}
            <strong>Cancelarlos</strong> cuando consideres que no se requieren y <strong>Oponerte</strong> a su uso para
            fines específicos. También puedes revocar tu consentimiento o limitar el uso de tus datos.
          </p>
          <p>
            Para hacerlo, envía tu solicitud a <strong>{APP_CONFIG.correo}</strong> indicando tu nombre, el derecho que
            quieres ejercer, los datos involucrados y una forma de contactarte, junto con una identificación. Te
            responderemos en un máximo de 20 días hábiles.
          </p>
        </Seccion>

        <Seccion titulo="7. Cookies">
          <p>
            Usamos cookies necesarias para mantener tu sesión iniciada y recordar tus preferencias de la plataforma, y
            una cookie anónima en las páginas web de nuestros clientes para contar visitas. Puedes borrarlas o
            bloquearlas desde tu navegador, aunque algunas funciones podrían dejar de funcionar.
          </p>
        </Seccion>

        <Seccion titulo="8. Cambios a este aviso">
          <p>Si este aviso cambia, publicaremos la nueva versión en esta misma página con su fecha de actualización.</p>
        </Seccion>
      </main>

      <Footer />
    </div>
  );
}
