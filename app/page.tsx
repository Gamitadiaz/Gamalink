import React from 'react';

export default function GamalinkPage() {
  return (
    <div className="min-h-screen font-sans text-slate-900 bg-[#f8fafc]"> {/* Slate 50 para contraste */}
      
      {/* NAVEGACIÓN */}
      <nav className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#5a67c5]"> {/* Purple-Medium */}
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#404a9d]">Gamalink</span> {/* Purple-Profundo */}
            </div>
            <div className="flex items-center gap-6">
              <a 
                href="/plantillas" 
                className="hidden md:block text-sm font-bold uppercase tracking-wide text-[#5a67c5] hover:text-[#404a9d] transition-colors"
              >
                Ver Plantillas
              </a>
              <a 
                href="https://wa.me/524428367627" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white px-5 py-2 rounded-full font-medium transition-colors shadow-md bg-[#5a67c5] hover:bg-[#404a9d]" /* Purple-Medium -> Purple-Deep */
              >
                Cotizar Proyecto
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - Usando el degradado de tu imagen */}
      <section className="relative text-white py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-[#404a9d] via-[#5a67c5] to-[#7686f0]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Soluciones de Software y <br className="hidden md:block" /> 
            <span className="text-[#b5c4fb]">Presencia Digital para tu Negocio</span> {/* Purple-Pale */}
          </h1>
          <p className="mt-4 text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-[#f1f5f9]"> {/* Slate 100 */}
            Automatizamos tus procesos y aumentamos tus ventas con tecnología a la medida. Sin complicaciones, orientado a resultados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#precios" 
              className="bg-white px-8 py-3 rounded-full font-bold text-lg transition shadow-lg text-[#404a9d] hover:bg-slate-100" /* Text: Purple-Deep */
            >
              Ver Planes
            </a>
            <a 
              href="https://wa.me/524428367627"
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-transparent border-2 px-8 py-3 rounded-full font-bold text-lg transition border-[#96a8f7] text-white hover:bg-white hover:text-[#404a9d]" /* Border: Lavender-Bright */
            >
              Hablar con un Asesor
            </a>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE PRECIOS - Fondo Lavanda Pálido para textura */}
      <section id="precios" className="py-20 bg-[#b5c4fb]"> {/* Purple-Pale */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl text-[#404a9d]">Planes y Precios</h2> {/* Purple-Deep */}
            <p className="mt-4 text-lg text-[#1e293b]"> {/* Slate 800 */}
              Inversión tecnológica que se paga sola. Elige el modelo que mejor se adapte a tu empresa. <br />
              <span className="text-sm font-semibold text-[#404a9d]">Los precios mostrados incluyen impuestos aplicables.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Plan 1: Presencia Digital - ACTUALIZADO */}
            <div className="bg-white rounded-2xl p-8 border shadow-sm flex flex-col border-slate-200">
              <h3 className="text-2xl font-bold mb-2 text-[#5a67c5]">Presencia Digital</h3>
              <p className="text-slate-600 mb-6 text-sm">Ideal para negocios locales que necesitan aparecer en el mapa y recibir clientes directamente a su celular.</p>
              
              <div className="mb-6 pb-6 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Inversión Inicial</p>
                <div className="text-3xl font-extrabold text-slate-900">$2,000 <span className="text-lg text-slate-500 font-normal">MXN</span></div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider mb-1 text-[#5a67c5]">Suscripción Mensual</p>
                <div className="text-4xl font-extrabold text-[#5a67c5]">$400 <span className="text-lg font-normal">/mes</span></div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {[
                  'Elige un diseño de nuestro catálogo', // Texto estratégico
                  'Hospedaje, dominio y certificado SSL',
                  'Configuración y enlace directo a WhatsApp',
                  'Alta y optimización en Google Maps'
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#7686f0]" />
                    <span className="ml-3 text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              
              {/* ESTE ES EL CAMBIO CLAVE: Manda a plantillas */}
              <a href="/plantillas" className="mt-auto block w-full text-center font-bold py-4 rounded-xl transition border-2 border-[#b5c4fb] bg-[#f8fafc] text-[#5a67c5] hover:bg-[#b5c4fb] hover:text-[#404a9d] shadow-sm">
                Ver Catálogo de Plantillas
              </a>
            </div>

            {/* Plan 2: Gestión Digital (Destacado - Usando Púrpura Profundo) */}
            <div className="bg-[#404a9d] rounded-2xl p-8 shadow-2xl relative transform md:-translate-y-4 flex flex-col border border-[#404a9d]"> {/* Purple-Deep */}
              <div className="absolute top-0 right-0 bg-[#96a8f7] text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg rounded-tr-xl uppercase tracking-wide">
                Recomendado
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Gestión Digital</h3>
              <p className="text-[#e2e8f0] mb-6 text-sm">Sistema base para administrar tu negocio local sin descapitalizarte. La inversión en desarrollo va por mi cuenta.</p>
              
              <div className="mb-6 pb-6 border-b border-[#5a67c5]">
                <p className="text-sm font-semibold text-[#b5c4fb] uppercase tracking-wider mb-1">Inversión Inicial</p>
                <div className="text-3xl font-extrabold text-white">$0 <span className="text-lg text-[#b5c4fb] font-normal">MXN (Instalación Gratis)</span></div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider mb-1 text-[#96a8f7]">Uso de Plataforma</p>
                <div className="text-4xl font-extrabold text-white">$890 <span className="text-lg text-[#e2e8f0] font-normal">/mes</span></div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start text-sm font-semibold text-white">
                  <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#96a8f7]" />
                  <span className="ml-3">Incluye Presencia Digital, además:</span>
                </li>
                {[
                  'Panel Administrativo Privado: Control de clientes, pagos y vencimientos en la nube.',
                  'Módulos a la medida (Ej. Inventario/Citas) disponibles desde $1,000 MXN extra.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#b5c4fb]" />
                    <span className="ml-3 text-[#f1f5f9]">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="https://wa.me/524428367627?text=Hola,%20me%20interesa%20el%20plan%20Gestión%20Digital" target="_blank" rel="noopener noreferrer" className="mt-auto block w-full bg-[#96a8f7] text-[#404a9d] text-center font-bold py-3 rounded-xl transition shadow-lg hover:bg-white hover:text-[#404a9d]">
                Agendar Demo
              </a>
            </div>

            {/* Plan 3: Sistema Personalizado */}
            <div className="bg-white rounded-2xl p-8 border shadow-sm flex flex-col border-slate-200">
              <h3 className="text-2xl font-bold mb-2 text-[#5a67c5]">Sistema Personalizado</h3>
              <p className="text-slate-600 mb-6 text-sm">Desarrollo a la medida y automatización avanzada para negocios establecidos con necesidades específicas.</p>
              
              <div className="mb-6 pb-6 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Desarrollo a Medida</p>
                <div className="text-3xl font-extrabold text-slate-900">Desde $5,000 <span className="text-lg text-slate-500 font-normal">MXN</span></div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider mb-1 text-[#5a67c5]">Suscripción y Servidores</p>
                <div className="text-4xl font-extrabold text-[#5a67c5]">$900+ <span className="text-lg font-normal">/mes</span></div> {/* Agregado el '+' para indicar "desde" */}
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start text-sm font-semibold text-slate-900">
                  <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#7686f0]" />
                  <span className="ml-3">Incluye todo lo anterior, además:</span>
                </li>
                {[
                  'Arquitectura de software 100% adaptable a tus procesos',
                  'Múltiples usuarios con diferentes niveles de permisos',
                  'Automatización de flujos de trabajo (Correos/Recordatorios)',
                  'Soporte técnico prioritario y capacitación de personal'
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#b5c4fb]" />
                    <span className="ml-3 text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="https://wa.me/524428367627?text=Hola,%20necesito%20cotizar%20un%20Sistema%20Personalizado" target="_blank" rel="noopener noreferrer" className="mt-auto block w-full text-center font-bold py-3 rounded-xl transition border-2 border-[#5a67c5] bg-white text-[#5a67c5] hover:bg-[#5a67c5] hover:text-white">
                Cotizar Proyecto
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER & CONTACTO */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#5a67c5]">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">Gamalink</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              Transformamos la forma en que operan los negocios mediante desarrollo de software estratégico y presencia digital de alto impacto.
            </p>
          </div>
          <div className="md:text-right flex flex-col md:items-end justify-center">
            <h4 className="text-white font-bold text-lg mb-4">Contacto Directo</h4>
            <a href="mailto:gamalieldiaz04@outlook.com" className="flex items-center gap-2 hover:text-white transition mb-2">
              <MailIcon className="w-5 h-5 text-[#b5c4fb]" />
              gamalieldiaz04@outlook.com
            </a>
            <a href="https://wa.me/524428367627" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition text-[#96a8f7]">
              <WhatsAppIcon className="w-5 h-5" />
              +52 442 836 7627
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Gamalink. Todos los derechos reservados.</p>
          <p>Los precios mostrados incluyen impuestos aplicables.</p>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE WHATSAPP - Manteniendo el verde por convención */}
      <a 
        href="https://wa.me/524428367627" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
        aria-label="Contactar por WhatsApp"
      >
        <WhatsAppIcon className="w-8 h-8" />
      </a>
    </div>
  );
}

/* --- ÍCONOS SVG --- */
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}