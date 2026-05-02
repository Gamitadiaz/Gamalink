import Link from 'next/link';

export default function PulsarForgeGym() {
  return (
    <div className="bg-black text-white font-sans min-h-screen selection:bg-purple-500 selection:text-white">
      
      {/* Navegación */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-purple-900/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Ícono de pesa simplificado */}
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M3 12h18M3 18h18" opacity="0" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 8v8M18 8v8M4 10h16M4 14h16M2 12h20" />
            </svg>
            <span className="text-xl font-black tracking-widest uppercase">Pulsar<br/><span className="text-purple-500 text-sm">Forge Gym</span></span>
          </div>
          <div className="hidden md:flex space-x-6 text-sm font-semibold tracking-wider">
            <Link href="#servicios" className="hover:text-purple-400 transition">Servicios</Link>
            <Link href="#membresias" className="hover:text-purple-400 transition">Membresías</Link>
            <Link href="#ubicacion" className="hover:text-purple-400 transition">Ubicación</Link>
          </div>
          <a href="https://wa.me/524421103306" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition transform shadow-[0_0_15px_rgba(147,51,234,0.5)]">
            Unirse
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden flex flex-col items-center text-center">
        {/* Efecto de brillo de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-[120px] -z-10"></div>
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Forja tu cuerpo
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 font-light mb-8 max-w-2xl">
          Atención Tripulación: Prepárate para despegar. Pesas, cardio y entrenamiento funcional en el mejor ambiente.
        </p>
        <a href="https://wa.me/524421103306" target="_blank" rel="noopener noreferrer" className="bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-wider hover:bg-gray-200 transition transform hover:scale-105 flex items-center gap-2">
          Contactar a la base
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </header>

      {/* Servicios */}
      <section id="servicios" className="py-20 bg-zinc-950 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black uppercase text-center mb-16"><span className="text-blue-500">Nuestras</span> Áreas</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black border border-zinc-800 p-8 rounded-2xl hover:border-purple-500 transition group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">🏋️‍♂️</div>
              <h3 className="text-2xl font-bold mb-2">Pesas y Cardio</h3>
              <p className="text-gray-400">Máquinas modernas y zona de peso libre para hipertrofia y resistencia.</p>
            </div>
            <div className="bg-black border border-zinc-800 p-8 rounded-2xl hover:border-blue-500 transition group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">🥊</div>
              <h3 className="text-2xl font-bold mb-2">Funcional Box y GAP</h3>
              <p className="text-gray-400">Entrenamientos dinámicos de alta intensidad para quemar grasa y tonificar.</p>
            </div>
            <div className="bg-black border border-zinc-800 p-8 rounded-2xl hover:border-pink-500 transition group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">💃</div>
              <h3 className="text-2xl font-bold mb-2">Baile Fitness & Jumping</h3>
              <p className="text-gray-400">Clases llenas de energía para mejorar tu coordinación y ritmo cardiovascular.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Precios / Membresías */}
      <section id="membresias" className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Membresías de la Estación</h2>
          <p className="text-gray-400 text-lg">Inscripción general: <span className="text-white font-bold">$150 MXN</span></p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
          <ul className="space-y-4 text-lg md:text-xl">
            <li className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="font-semibold">Visita</span>
              <span className="text-yellow-400 font-black">$100</span>
            </li>
            <li className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="font-semibold flex items-center gap-2">Mensualidad <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white uppercase tracking-wider">Popular</span></span>
              <span className="text-yellow-400 font-black">$590</span>
            </li>
            <li className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="font-semibold text-gray-300">Bimestral</span>
              <span className="text-yellow-400 font-bold">$1,150</span>
            </li>
            <li className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="font-semibold text-gray-300">Trimestral</span>
              <span className="text-yellow-400 font-bold">$1,590</span>
            </li>
            <li className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="font-semibold text-gray-300">Semestral</span>
              <span className="text-yellow-400 font-bold">$3,000</span>
            </li>
            <li className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="font-semibold text-gray-300">Anualidad</span>
              <span className="text-yellow-400 font-bold">$5,700</span>
            </li>
          </ul>
          
          <div className="mt-8 flex justify-between text-gray-400 text-sm md:text-base bg-black/50 p-4 rounded-xl">
            <p>Membresía Estudiante: <span className="text-white font-bold">$490</span></p>
            <p>Membresía 3ra. Edad: <span className="text-white font-bold">$490</span></p>
          </div>
        </div>
      </section>

      {/* Horarios y Ubicación */}
      <section id="ubicacion" className="py-20 bg-zinc-950 px-4 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-8 text-blue-500">Coordenadas de Aterrizaje</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <svg className="w-6 h-6 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <div>
                  <h4 className="font-bold text-white">Ubicación</h4>
                  <p className="text-gray-400">Río Nilo 3-Bodega 4, 76922 Arroyo Hondo, Qro.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <h4 className="font-bold text-white">Horarios de la Base</h4>
                  <p className="text-gray-400">Lunes a Viernes: 6:00 am - 10:30 pm</p>
                  <p className="text-gray-400">Sábados: 7:00 am - 2:00 pm</p>
                  <p className="text-gray-400">Domingos: 8:00 am - 1:00 pm</p>
                </div>
              </div>

              <div className="flex gap-4">
                <svg className="w-6 h-6 text-pink-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <div>
                  <h4 className="font-bold text-white">Contacto</h4>
                  <p className="text-gray-400">442 110 3306</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-64 md:h-96 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center relative overflow-hidden group">
            {/* Placeholder del mapa - En producción aquí va el iframe de Google Maps */}
            <div className="text-center z-10">
              <svg className="w-12 h-12 text-zinc-600 mx-auto mb-2 group-hover:text-purple-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
              <p className="text-zinc-500 font-medium">Mapa Interactivo</p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-8 text-center px-4">
        <h2 className="text-xl font-black tracking-widest uppercase mb-4">Pulsar Forge Gym</h2>
        <a href="https://instagram.com/pulsarforgegym" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-400 hover:text-pink-500 transition mb-6">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          @pulsarforgegym
        </a>
        <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} Pulsar Forge Gym. Todos los derechos reservados.</p>
        <p className="text-zinc-700 text-xs mt-2">Desarrollado por GDA.</p>
      </footer>

    </div>
  );
}