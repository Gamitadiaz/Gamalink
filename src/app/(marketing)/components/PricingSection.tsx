import { APP_CONFIG } from "@/config/app-config";

import { CheckIcon } from "./Icons";

export default function PricingSection() {
  return (
    <section id="precios" className="py-20 bg-[#b5c4fb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gl-revelar text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl text-[#404a9d]">Planes y Precios</h2>
          <p className="mt-4 text-lg text-[#1e293b]">
            Inversión tecnológica que se paga sola. Elige el modelo que mejor se adapte a tu empresa. <br />
            <span className="text-sm font-semibold text-[#404a9d]">
              Los precios mostrados incluyen impuestos aplicables.
            </span>
          </p>
        </div>

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
              <p className="text-sm font-semibold uppercase tracking-wider mb-1 text-[#5a67c5]">Suscripción Mensual</p>
              <div className="text-4xl font-extrabold text-[#5a67c5]">
                $400 <span className="text-lg font-normal">/mes</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              {[
                "Elige un diseño de nuestro catálogo",
                "Tú editas textos e imágenes desde tu panel, cuando quieras",
                "Métricas de visitas de tu página",
                "Hospedaje, dominio y certificado SSL",
                "Configuración y enlace directo a WhatsApp",
                "Alta y optimización en Google Maps",
              ].map((item, i) => (
                <li key={i} className="flex items-start text-sm">
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
                $890 <span className="text-lg text-[#e2e8f0] font-normal">/mes</span>
              </div>
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
              ].map((item, i) => (
                <li key={i} className="flex items-start text-sm">
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
                Desde $15,000 <span className="text-lg text-slate-500 font-normal">MXN</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider mb-1 text-[#5a67c5]">
                Suscripción y Servidores
              </p>
              <div className="text-4xl font-extrabold text-[#5a67c5]">
                $1,500+ <span className="text-lg font-normal">/mes</span>
              </div>
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
              ].map((item, i) => (
                <li key={i} className="flex items-start text-sm">
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

        <p className="gl-revelar mt-12 text-center text-[#1e293b]">
          <span className="font-bold text-[#404a9d]">Pago anual:</span> paga 12 meses por adelantado y llévate 2
          gratis, en cualquier plan.
        </p>
      </div>
    </section>
  );
}
