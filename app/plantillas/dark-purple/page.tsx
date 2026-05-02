import Link from 'next/link';

// ============================================================
// ✏️  EDITA SOLO ESTA SECCIÓN PARA CADA CLIENTE
// ============================================================
const NEGOCIO = {
  nombre:      "Pulsar Forge Gym",
  tipo:        "Gimnasio & Fitness",
  slogan:      "Forja tu cuerpo",
  subtitulo:   "Pesas, cardio y entrenamiento funcional en el mejor ambiente.",
  whatsapp:    "524421103306",
  instagram:   "pulsarforgegym",
  direccion:   "Río Nilo 3-Bodega 4, 76922 Arroyo Hondo, Qro.",
  maps_embed:  "https://maps.google.com/maps?q=Arroyo+Hondo+Queretaro&output=embed",
  horarios: [
    { dia: "Lunes a Viernes", hora: "6:00 am – 10:30 pm" },
    { dia: "Sábado",          hora: "7:00 am – 2:00 pm" },
    { dia: "Domingo",         hora: "8:00 am – 1:00 pm" },
  ],
  servicios: [
    { emoji: "🏋️‍♂️", nombre: "Pesas y Cardio",         desc: "Máquinas modernas y zona de peso libre para hipertrofia y resistencia.", color: "hover:border-purple-500" },
    { emoji: "🥊",   nombre: "Funcional Box y GAP",     desc: "Entrenamientos dinámicos de alta intensidad para quemar grasa y tonificar.", color: "hover:border-blue-500" },
    { emoji: "💃",   nombre: "Baile Fitness & Jumping", desc: "Clases llenas de energía para mejorar tu coordinación y ritmo cardiovascular.", color: "hover:border-pink-500" },
  ],
  precios: [
    { nombre: "Visita",       precio: "$100",   badge: null,      especial: false },
    { nombre: "Mensualidad",  precio: "$590",   badge: "Popular", especial: false },
    { nombre: "Bimestral",    precio: "$1,150", badge: null,      especial: false },
    { nombre: "Trimestral",   precio: "$1,590", badge: null,      especial: false },
    { nombre: "Semestral",    precio: "$3,000", badge: null,      especial: false },
    { nombre: "Anualidad",    precio: "$5,700", badge: null,      especial: false },
  ],
  inscripcion:     "$150 MXN",
  precio_estudiante: "$490",
  precio_tercera_edad: "$490",
};
// ============================================================

export default function DarkPurpleTemplate() {
  const wa = `https://wa.me/${NEGOCIO.whatsapp}?text=Hola,%20quiero%20información%20sobre%20${encodeURIComponent(NEGOCIO.nombre)}`;

  return (
    <div className="bg-black text-white font-sans min-h-screen selection:bg-purple-500 selection:text-white">

      {/* ── NAV ── */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-purple-900/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 8v8M18 8v8M4 10h16M4 14h16M2 12h20" />
            </svg>
            <span className="text-xl font-black tracking-widest uppercase">
              {NEGOCIO.nombre.split(' ')[0]}<br/>
              <span className="text-purple-500 text-sm">{NEGOCIO.nombre.split(' ').slice(1).join(' ')}</span>
            </span>
          </div>
          <div className="hidden md:flex space-x-6 text-sm font-semibold tracking-wider">
            <a href="#servicios" className="hover:text-purple-400 transition">Servicios</a>
            <a href="#membresias" className="hover:text-purple-400 transition">Membresías</a>
            <a href="#ubicacion" className="hover:text-purple-400 transition">Ubicación</a>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition transform shadow-[0_0_15px_rgba(147,51,234,0.5)]">
            Unirse
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-[120px] -z-10" />
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          {NEGOCIO.slogan}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 font-light mb-8 max-w-2xl">
          {NEGOCIO.subtitulo}
        </p>
        <a href={wa} target="_blank" rel="noopener noreferrer"
          className="bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-wider hover:bg-gray-200 transition transform hover:scale-105 flex items-center gap-2">
          Contactar
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </a>
      </header>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="py-20 bg-zinc-950 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black uppercase text-center mb-16">
            <span className="text-blue-500">Nuestras</span> Áreas
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {NEGOCIO.servicios.map((s, i) => (
              <div key={i} className={`bg-black border border-zinc-800 p-8 rounded-2xl ${s.color} transition group`}>
                <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">{s.emoji}</div>
                <h3 className="text-2xl font-bold mb-2">{s.nombre}</h3>
                <p className="text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="membresias" className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            Membresías
          </h2>
          <p className="text-gray-400 text-lg">
            Inscripción general: <span className="text-white font-bold">{NEGOCIO.inscripcion}</span>
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
          <ul className="space-y-4 text-lg md:text-xl">
            {NEGOCIO.precios.map((p, i) => (
              <li key={i} className="flex justify-between items-center border-b border-zinc-800 pb-2 last:border-0">
                <span className="font-semibold flex items-center gap-2">
                  {p.nombre}
                  {p.badge && (
                    <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white uppercase tracking-wider">{p.badge}</span>
                  )}
                </span>
                <span className="text-yellow-400 font-black">{p.precio}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex justify-between text-gray-400 text-sm md:text-base bg-black/50 p-4 rounded-xl flex-wrap gap-2">
            <p>Estudiante: <span className="text-white font-bold">{NEGOCIO.precio_estudiante}</span></p>
            <p>3ra. Edad: <span className="text-white font-bold">{NEGOCIO.precio_tercera_edad}</span></p>
          </div>
        </div>
      </section>

      {/* ── UBICACIÓN ── */}
      <section id="ubicacion" className="py-20 bg-zinc-950 px-4 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-8 text-blue-500">Encuéntranos</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <svg className="w-6 h-6 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <div>
                  <h4 className="font-bold">Ubicación</h4>
                  <p className="text-gray-400">{NEGOCIO.direccion}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h4 className="font-bold">Horarios</h4>
                  {NEGOCIO.horarios.map((h, i) => (
                    <p key={i} className="text-gray-400">{h.dia}: <span className="text-white">{h.hora}</span></p>
                  ))}
                </div>
              </div>
              {NEGOCIO.instagram && (
                <div className="flex gap-4">
                  <svg className="w-6 h-6 text-pink-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  <div>
                    <h4 className="font-bold">Instagram</h4>
                    <a href={`https://instagram.com/${NEGOCIO.instagram}`} target="_blank" rel="noopener noreferrer"
                      className="text-gray-400 hover:text-pink-400 transition">@{NEGOCIO.instagram}</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-64 md:h-96 rounded-2xl border border-zinc-800 overflow-hidden">
            <iframe
              src={NEGOCIO.maps_embed}
              width="100%" height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.85)' }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación"
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-900 bg-black py-8 text-center px-4">
        <h2 className="text-xl font-black tracking-widest uppercase mb-2">{NEGOCIO.nombre}</h2>
        {NEGOCIO.instagram && (
          <a href={`https://instagram.com/${NEGOCIO.instagram}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-pink-500 transition mb-4 text-sm">
            @{NEGOCIO.instagram}
          </a>
        )}
        <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} {NEGOCIO.nombre}.</p>
        <p className="text-zinc-700 text-xs mt-1">Desarrollado por GDA.</p>
      </footer>
    </div>
  );
}
