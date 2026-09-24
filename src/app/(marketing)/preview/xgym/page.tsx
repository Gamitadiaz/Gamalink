"use client";

import Link from 'next/link';

export default function XGymFitness() {
  return (
    <div className="bg-zinc-950 text-white font-sans min-h-screen selection:bg-orange-500 selection:text-black">
      
      {/* Navegación Industrial */}
      <nav className="border-b-4 border-orange-600 bg-black sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo de texto agresivo */}
            <h1 className="text-3xl font-black italic tracking-tighter text-white">
              <span className="text-orange-600 text-4xl">X</span> GYM
              <span className="block text-xs font-normal text-zinc-400 uppercase tracking-widest not-italic">Fitness</span>
            </h1>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-widest text-zinc-400">
            <Link href="#instalaciones" className="hover:text-orange-500 transition">Instalaciones</Link>
            <Link href="#ubicacion" className="hover:text-orange-500 transition">Ubicación</Link>
          </div>
          <a href="#contacto" className="bg-orange-600 text-black px-6 py-2 font-black uppercase italic hover:bg-orange-500 transition transform hover:-skew-x-12">
            Entrena Hoy
          </a>
        </div>
      </nav>

      {/* Hero Section - Estilo "Fierros" */}
      <header className="relative pt-24 pb-20 md:pt-40 md:pb-32 px-4 overflow-hidden border-b border-zinc-800 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 to-zinc-950 -z-10"></div>
        
        <div className="max-w-5xl mx-auto flex flex-col items-start">
          <div className="bg-orange-600 text-black font-black uppercase px-3 py-1 mb-6 transform -skew-x-12 inline-block">
            Huimilpan, Qro.
          </div>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none text-zinc-100">
            Fuerza Bruta.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">Cero Excusas.</span>
          </h2>
          <p className="text-xl md:text-2xl text-zinc-400 font-medium mb-10 max-w-2xl border-l-4 border-orange-600 pl-4">
            Equipamiento de alto rendimiento, peso libre y el mejor ambiente de entrenamiento en una nave industrial diseñada para forjar resultados.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#ubicacion" className="bg-orange-600 text-black px-8 py-4 font-black uppercase tracking-widest hover:bg-orange-500 transition transform hover:-translate-y-1">
              Ver Ubicación
            </a>
            <a href="#contacto" className="border-2 border-orange-600 text-orange-500 px-8 py-4 font-black uppercase tracking-widest hover:bg-orange-600 hover:text-black transition">
              Pedir Informes
            </a>
          </div>
        </div>
      </header>

      {/* Instalaciones - Basado en las fotos */}
      <section id="instalaciones" className="py-24 bg-zinc-900 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-1 w-12 bg-orange-600"></div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Nuestras Zonas</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Planta Baja */}
            <div className="bg-zinc-950 p-8 border-l-4 border-zinc-700 hover:border-orange-600 transition duration-300">
              <h3 className="text-3xl font-black uppercase mb-4 text-orange-500">Planta Baja</h3>
              <ul className="space-y-3 text-zinc-400 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-orange-600">▪</span> Amplia zona de peso libre
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600">▪</span> Aparatos de placa para hipertrofia
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600">▪</span> Estructuras sólidas tipo industrial
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600">▪</span> Espacio abierto y ventilado
                </li>
              </ul>
            </div>

            {/* Mezzanine */}
            <div className="bg-zinc-950 p-8 border-l-4 border-zinc-700 hover:border-orange-600 transition duration-300">
              <h3 className="text-3xl font-black uppercase mb-4 text-orange-500">Mezzanine Cardio</h3>
              <ul className="space-y-3 text-zinc-400 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-orange-600">▪</span> Zona elevada exclusiva para cardio
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600">▪</span> Caminadoras y elípticas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600">▪</span> Bicicletas estáticas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600">▪</span> Vista panorámica al área de pesas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Banner de Precios (Placeholder) */}
      <section className="py-16 bg-orange-600 px-4 text-black text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase mb-4">Pregunta por nuestras promociones locales</h2>
        <p className="text-xl font-bold opacity-80">Mensualidades accesibles y sin inscripciones forzosas.</p>
      </section>

      {/* Ubicación y Contacto */}
      <section id="ubicacion" className="py-24 bg-zinc-950 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          
          <div>
            <h2 className="text-4xl font-black uppercase mb-8 border-b-2 border-orange-600 inline-block pb-2">Encuéntranos</h2>
            
            <div className="space-y-8 mt-8">
              <div className="bg-zinc-900 p-6 flex gap-4 items-start">
                <svg className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <div>
                  <h4 className="font-black text-xl text-white uppercase mb-1">Dirección</h4>
                  <p className="text-zinc-400 text-lg">Francisco I. Madero Nte. 186,<br/>76950 Huimilpan, Qro.</p>
                </div>
              </div>

              <div className="bg-zinc-900 p-6 flex gap-4 items-start">
                <svg className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <h4 className="font-black text-xl text-white uppercase mb-1">Horarios</h4>
                  <p className="text-zinc-400 text-lg">Apertura desde las 7:00 a.m.</p>
                  <p className="text-zinc-500 text-sm mt-1">(Pregunta por horarios entre semana en mostrador)</p>
                </div>
              </div>
            </div>
          </div>

          <div id="contacto" className="bg-zinc-900 border border-zinc-800 p-8 flex flex-col justify-center">
            <h3 className="text-2xl font-black uppercase mb-6 text-white text-center">¿Listo para empezar?</h3>
            <p className="text-zinc-400 text-center mb-8">Déjanos tus datos o visítanos directamente en la recepción del gimnasio para darte de alta.</p>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Tu Nombre" className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition" />
              <input type="tel" placeholder="Teléfono / WhatsApp" className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition" />
              <button className="w-full bg-orange-600 text-black font-black uppercase py-4 hover:bg-orange-500 transition">
                Enviar Solicitud
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* Footer Industrial */}
      <footer className="border-t-4 border-orange-600 bg-black py-10 text-center px-4">
        <h2 className="text-2xl font-black italic tracking-tighter text-zinc-600 mb-2">
          X GYM <span className="not-italic text-sm tracking-widest">FITNESS</span>
        </h2>
        <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} X GYM Fitness. Huimilpan, Querétaro.</p>
        <div className="mt-6 inline-block bg-zinc-900 px-4 py-2 text-xs text-zinc-600 uppercase tracking-widest">
          Desarrollado y operado por GDA.
        </div>
      </footer>

    </div>
  );
}