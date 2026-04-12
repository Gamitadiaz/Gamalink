"use client";
import Link from 'next/link';

export default function Precios() {
  // Número de WhatsApp y Correo para facilitar cambios futuros
  const whatsappNumber = "524428367327";
  const email = "gamalieldiaz04@gmail.com";

  return (
    <div className="bg-gray-900 text-white font-sans min-h-screen">
      {/* Navbar Simple */}
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto border-b border-gray-800">
        <Link href="/">
          <h1 className="text-2xl font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition">← Volver al inicio</h1>
        </Link>
      </nav>

      <header className="py-16 text-center px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Planes y <span className="text-blue-500">Soluciones</span></h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Sistemas y presencia digital para tu negocio. Tú enfócate en crecer, yo me encargo de la tecnología.</p>
      </header>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Plan 1: Presencia Digital */}
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex flex-col hover:border-gray-500 transition">
            <h3 className="text-2xl font-bold mb-2">Presencia Digital</h3>
            <p className="text-gray-400 mb-6 text-sm">Ideal para negocios locales que necesitan aparecer en el mapa y recibir clientes directamente a su celular.</p>
            
            <div className="mb-6 pb-6 border-b border-gray-700">
              <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-1">Inversión Inicial</p>
              <p className="text-3xl font-extrabold">$2,000 <span className="text-base font-normal">MXN</span></p>
            </div>
            
            <div className="mb-6 text-blue-400">
              <p className="text-sm uppercase tracking-widest font-bold mb-1">Suscripción Mensual</p>
              <p className="text-4xl font-extrabold">$400 <span className="text-lg font-normal text-gray-400">/mes</span></p>
            </div>

            <ul className="mb-8 space-y-4 flex-1 text-gray-300 text-sm">
              <li className="flex gap-2">✓ <span>Landing Page de alto impacto</span></li>
              <li className="flex gap-2">✓ <span>Hospedaje, dominio y certificado SSL</span></li>
              <li className="flex gap-2 font-semibold text-white">✓ <span>Configuración y enlace directo a WhatsApp Business</span></li>
              <li className="flex gap-2">✓ <span>Alta y optimización básica en Google Maps</span></li>
              <li className="flex gap-2 text-gray-400 text-xs italic ml-5">*Incluye 1 actualización de contenido al mes (Textos/Imágenes).</li>
            </ul>
            <a 
              href={`https://wa.me/${whatsappNumber}?text=Hola,%20me%20interesa%20solicitar%20el%20Plan%20Presencia%20Digital`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-center block border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white py-3 rounded-full font-bold transition">
              Solicitar Plan
            </a>
          </div>

          {/* Plan 2: Gestión Digital */}
          <div className="bg-gradient-to-b from-blue-900 to-gray-800 p-8 rounded-2xl border-2 border-blue-500 transform md:-translate-y-4 shadow-2xl relative flex flex-col">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold uppercase py-1 px-4 rounded-bl-xl shadow-sm">Recomendado</div>
            <h3 className="text-2xl font-bold mb-2 mt-2">Gestión Digital</h3>
            <p className="text-gray-300 mb-6 text-sm">Sistema base para administrar tu negocio local sin descapitalizarte. La inversión en desarrollo va por mi cuenta.</p>
            
            <div className="mb-6 pb-6 border-b border-gray-700/50">
              <p className="text-sm text-blue-300 uppercase tracking-widest font-bold mb-1">Inversión Inicial</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold">$0 <span className="text-base font-normal">MXN</span></p>
                <span className="text-xs text-blue-300 font-bold bg-blue-900/50 px-2 py-1 rounded">(Instalación Gratis)</span>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-blue-300 uppercase tracking-widest font-bold mb-1">Uso de Plataforma</p>
              <p className="text-4xl font-extrabold text-white">$890 <span className="text-lg font-normal text-gray-300">/mes</span></p>
            </div>

            <ul className="mb-8 space-y-4 flex-1 text-gray-200 text-sm">
              <li className="flex gap-2 font-bold text-blue-300">✓ Incluye Presencia Digital, además:</li>
              {/* PUNTO AGRUPADO PARA EVITAR CONFUSIONES */}
              <li className="flex gap-2">✓ <span><strong>Panel Administrativo Privado:</strong> Control de clientes, pagos y vencimientos con base de datos segura en la nube.</span></li>
              <li className="flex gap-2">✓ <span>Módulos a la medida (Ej. Inventario/Citas) disponibles desde $1,000 MXN extra.</span></li>
              <li className="flex gap-2 text-gray-400 text-xs italic ml-5">*Las actualizaciones mensuales incluidas aplican solo a la Landing Page, no a la estructura del sistema.</li>
            </ul>
            <a 
              href={`https://wa.me/${whatsappNumber}?text=Hola,%20me%20gustaría%20agendar%20una%20Demo%20del%20Plan%20Gestión%20Digital`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-center block bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-bold transition shadow-lg shadow-blue-600/30">
              Agendar Demo
            </a>
          </div>

          {/* Plan 3: Sistema Personalizado */}
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex flex-col hover:border-purple-900/50 transition">
            <h3 className="text-2xl font-bold mb-2">Sistema Personalizado</h3>
            <p className="text-gray-400 mb-6 text-sm">Desarrollo a la medida y automatización avanzada para negocios establecidos con necesidades específicas.</p>
            
            <div className="mb-6 pb-6 border-b border-gray-700">
              <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-1">Desarrollo a Medida</p>
              <p className="text-3xl font-extrabold">Desde $5,000 <span className="text-base font-normal">MXN</span></p>
            </div>
            
            <div className="mb-6 text-purple-400">
              <p className="text-sm uppercase tracking-widest font-bold mb-1">Suscripción y Servidores</p>
              <p className="text-4xl font-extrabold">Desde $900 <span className="text-lg font-normal text-gray-400">/mes</span></p>
            </div>

            <ul className="mb-8 space-y-4 flex-1 text-gray-300 text-sm">
              <li className="flex gap-2 font-bold text-purple-400">✓ Incluye todo lo anterior, además:</li>
              <li className="flex gap-2">✓ <span>Arquitectura de software 100% adaptable a tus procesos</span></li>
              <li className="flex gap-2">✓ <span>Múltiples usuarios con diferentes niveles de permisos</span></li>
              <li className="flex gap-2">✓ <span>Automatización de flujos de trabajo (Correos/Recordatorios)</span></li>
              <li className="flex gap-2">✓ <span>Soporte técnico prioritario y capacitación de personal</span></li>
            </ul>
            {/* Aquí te sugiero usar el correo, ya que proyectos de $5k+ requieren una cotización más formal */}
            <a 
              href={`mailto:${email}?subject=Cotización%20de%20Sistema%20Personalizado&body=Hola,%20me%20interesa%20cotizar%20un%20proyecto%20a%20la%20medida%20para%20mi%20negocio.`}
              className="text-center block border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white py-3 rounded-full font-bold transition">
              Cotizar Proyecto
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}