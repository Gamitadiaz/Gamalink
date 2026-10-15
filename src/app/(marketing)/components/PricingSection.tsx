import { APP_CONFIG } from "@/config/app-config";

import { CheckIcon } from "./Icons";

// El selector Mensual/Anual es CSS puro: dos radios ocultos y `group-has-[...]` muestran un precio u otro.
// Al pasar de oculto a visible, .gl-cambio vuelve a correr su animación.
const MENSUAL_ACTIVO = "group-has-[#periodo-anual:checked]:hidden";
const ANUAL_ACTIVO = "hidden group-has-[#periodo-anual:checked]:inline-block";

function Precio({ mensual, anual }: { mensual: string; anual: string }) {
  return (
    <>
      <span className={`gl-cambio inline-block ${MENSUAL_ACTIVO}`}>{mensual}</span>
      <span className={`gl-cambio ${ANUAL_ACTIVO}`}>{anual}</span>
    </>
  );
}

function DetalleAnual({ children, className }: { children: string; className: string }) {
  return (
    <p className={`gl-cambio mt-1 hidden text-sm group-has-[#periodo-anual:checked]:block ${className}`}>{children}</p>
  );
}

export default function PricingSection() {
  return (
    <section id="precios" className="group py-20 bg-[#b5c4fb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gl-revelar text-center mb-10">
          <h2 className="text-3xl font-bold sm:text-4xl text-[#404a9d]">Planes y Precios</h2>
          <p className="mt-4 text-lg text-[#1e293b]">
            Inversión tecnológica que se paga sola. Elige el modelo que mejor se adapte a tu empresa. <br />
            <span className="text-sm font-semibold text-[#404a9d]">
              Precios en MXN con IVA incluido, excepto el plan A la Medida (+ IVA).
            </span>
          </p>
        </div>

        <fieldset className="gl-revelar mx-auto mb-16 flex w-fit items-center gap-1 rounded-full bg-white/60 p-1 shadow-sm">
          <legend className="sr-only">Periodo de pago</legend>
          <input type="radio" name="periodo" id="periodo-mensual" defaultChecked className="peer/mensual sr-only" />
          <label
            htmlFor="periodo-mensual"
            className="cursor-pointer rounded-full px-5 py-2 font-bold text-[#404a9d] transition peer-checked/mensual:bg-[#404a9d] peer-checked/mensual:text-white peer-focus-visible/mensual:ring-2 peer-focus-visible/mensual:ring-[#404a9d] peer-focus-visible/mensual:ring-offset-2"
          >
            Mensual
          </label>
          <input type="radio" name="periodo" id="periodo-anual" className="peer/anual sr-only" />
          <label
            htmlFor="periodo-anual"
            className="flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 font-bold text-[#404a9d] transition peer-checked/anual:bg-[#404a9d] peer-checked/anual:text-white peer-focus-visible/anual:ring-2 peer-focus-visible/anual:ring-[#404a9d] peer-focus-visible/anual:ring-offset-2"
          >
            Anual
            <span className="rounded-full bg-[#25D366] px-2 py-0.5 text-xs text-white">2 meses gratis</span>
          </label>
        </fieldset>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Página Web */}
          <div className="gl-revelar bg-white rounded-2xl p-8 border shadow-sm flex flex-col border-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="text-2xl font-bold mb-2 text-[#5a67c5]">Página Web</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Ideal para negocios locales que necesitan aparecer en el mapa y recibir clientes directamente a su
              celular.
            </p>

            <div className="mb-6 pb-6 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Inversión Inicial</p>
              <div className="text-3xl font-extrabold text-slate-900">
                $2,500 <span className="text-lg text-slate-500 font-normal">MXN</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider mb-1 text-[#5a67c5]">Suscripción</p>
              <div className="text-4xl font-extrabold text-[#5a67c5]">
                <Precio mensual="$400" anual="$333" /> <span className="text-lg font-normal">/mes</span>
              </div>
              <DetalleAnual className="text-slate-500">$4,000 al año · ahorras $800</DetalleAnual>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              {[
                "Elige un diseño de nuestro catálogo",
                "Tú editas textos e imágenes desde tu panel, cuando quieras",
                "Métricas de visitas de tu página",
                "Hospedaje, dominio y certificado SSL",
                "Configuración y enlace directo a WhatsApp",
                "Alta y optimización en Google Maps",
              ].map((item) => (
                <li key={item} className="flex items-start text-sm">
                  <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#7686f0]" />
                  <span className="ml-3 text-slate-700">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="/plantillas"
              className="mt-auto block w-full text-center font-bold py-4 rounded-xl transition border-2 border-[#b5c4fb] bg-[#f8fafc] text-[#5a67c5] hover:bg-[#b5c4fb] hover:text-[#404a9d] shadow-sm"
            >
              Ver Catálogo de Plantillas
            </a>
          </div>

          {/* Plan 2: Página + Sistema (Destacado) */}
          <div className="gl-revelar bg-[#404a9d] rounded-2xl p-8 shadow-2xl relative md:-translate-y-4 flex flex-col border border-[#404a9d] transition duration-300 hover:-translate-y-1 md:hover:-translate-y-5">
            <div className="absolute top-0 right-0 bg-[#96a8f7] text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg rounded-tr-xl uppercase tracking-wide">
              Recomendado
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Página + Sistema</h3>
            <p className="text-[#e2e8f0] mb-6 text-sm">
              Tu página web más un sistema para administrar tu negocio, sin descapitalizarte. La instalación va por
              nuestra cuenta.
            </p>

            <div className="mb-6 pb-6 border-b border-[#5a67c5]">
              <p className="text-sm font-semibold text-[#b5c4fb] uppercase tracking-wider mb-1">Inversión Inicial</p>
              <div className="text-3xl font-extrabold text-white">
                $0 <span className="text-lg text-[#b5c4fb] font-normal">MXN (Instalación Gratis)</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider mb-1 text-[#96a8f7]">Uso de Plataforma</p>
              <div className="text-4xl font-extrabold text-white">
                <Precio mensual="$900" anual="$750" /> <span className="text-lg text-[#e2e8f0] font-normal">/mes</span>
              </div>
              <DetalleAnual className="text-[#b5c4fb]">$9,000 al año · ahorras $1,800</DetalleAnual>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start text-sm font-semibold text-white">
                <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#96a8f7]" />
                <span className="ml-3">Incluye Página Web, además:</span>
              </li>
              {[
                "1 módulo a elegir: Membresías (socios, pagos y vencimientos), Citas (agenda y recordatorios por WhatsApp) o Tienda (punto de venta e inventario).",
                "Módulos adicionales: +$350 MXN/mes cada uno.",
                "Tus datos en la nube, desde la computadora o el celular.",
              ].map((item) => (
                <li key={item} className="flex items-start text-sm">
                  <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#b5c4fb]" />
                  <span className="ml-3 text-[#f1f5f9]">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href={`https://wa.me/${APP_CONFIG.whatsapp}?text=Hola,%20me%20interesa%20el%20plan%20P%C3%A1gina%20%2B%20Sistema`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto block w-full bg-[#96a8f7] text-[#404a9d] text-center font-bold py-3 rounded-xl transition shadow-lg hover:bg-white hover:text-[#404a9d]"
            >
              Agendar Demo
            </a>
          </div>

          {/* Plan 3: A la Medida */}
          <div className="gl-revelar bg-white rounded-2xl p-8 border shadow-sm flex flex-col border-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="text-2xl font-bold mb-2 text-[#5a67c5]">A la Medida</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Desarrollo a la medida y automatización avanzada para negocios establecidos con necesidades específicas.
            </p>

            <div className="mb-6 pb-6 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Desarrollo a Medida</p>
              <div className="text-3xl font-extrabold text-slate-900">
                Desde $15,000 <span className="text-lg text-slate-500 font-normal">MXN + IVA</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider mb-1 text-[#5a67c5]">
                Suscripción y Servidores
              </p>
              <div className="text-4xl font-extrabold text-[#5a67c5]">
                <Precio mensual="$1,500+" anual="$1,250+" /> <span className="text-lg font-normal">/mes + IVA</span>
              </div>
              <DetalleAnual className="text-slate-500">Desde $15,000 al año + IVA</DetalleAnual>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start text-sm font-semibold text-slate-900">
                <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#7686f0]" />
                <span className="ml-3">Incluye todo lo anterior, además:</span>
              </li>
              {[
                "Arquitectura de software 100% adaptable a tus procesos",
                "Múltiples usuarios con diferentes niveles de permisos",
                "Automatización de flujos de trabajo (Correos/Recordatorios)",
                "Soporte técnico prioritario y capacitación de personal",
              ].map((item) => (
                <li key={item} className="flex items-start text-sm">
                  <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#b5c4fb]" />
                  <span className="ml-3 text-slate-700">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href={`https://wa.me/${APP_CONFIG.whatsapp}?text=Hola,%20necesito%20cotizar%20un%20plan%20A%20la%20Medida`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto block w-full text-center font-bold py-3 rounded-xl transition border-2 border-[#5a67c5] bg-white text-[#5a67c5] hover:bg-[#5a67c5] hover:text-white"
            >
              Cotizar Proyecto
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
