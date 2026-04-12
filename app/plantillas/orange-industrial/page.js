"use client";
import Link from 'next/link';

// ============================================================
// ✏️  EDITA SOLO ESTA SECCIÓN PARA CADA CLIENTE
// ============================================================
const NEGOCIO = {
  nombre:      "X GYM Fitness",
  tipo:        "Gimnasio Industrial",
  ciudad:      "Huimilpan, Qro.",
  slogan:      "Fuerza Bruta.",
  slogan2:     "Cero Excusas.",
  descripcion: "Equipamiento de alto rendimiento, peso libre y el mejor ambiente de entrenamiento en una nave industrial diseñada para forjar resultados.",
  whatsapp:    "524428367627",
  direccion:   "Francisco I. Madero Nte. 186, 76950 Huimilpan, Qro.",
  maps_embed:  "https://maps.google.com/maps?q=Huimilpan+Queretaro&output=embed",
  horarios: [
    { dia: "Lunes a Viernes", hora: "6:00 am – 10:00 pm" },
    { dia: "Sábado",          hora: "7:00 am – 3:00 pm" },
    { dia: "Domingo",         hora: "8:00 am – 1:00 pm" },
  ],
  zonas: [
    {
      nombre: "Planta Baja",
      items: [
        "Amplia zona de peso libre",
        "Aparatos de placa para hipertrofia",
        "Estructuras sólidas tipo industrial",
        "Espacio abierto y ventilado",
      ],
    },
    {
      nombre: "Mezzanine Cardio",
      items: [
        "Zona elevada exclusiva para cardio",
        "Caminadoras y elípticas",
        "Bicicletas estáticas",
        "Vista panorámica al área de pesas",
      ],
    },
  ],
  precio_banner: "Pregunta por nuestras membresías accesibles",
  precio_sub:    "Sin inscripciones forzosas · Planes desde $400/mes",
};
// ============================================================

export default function OrangeIndustrialTemplate() {
  const wa = `https://wa.me/${NEGOCIO.whatsapp}?text=Hola%20${encodeURIComponent(NEGOCIO.nombre)},%20quiero%20información%20sobre%20membresías`;

  return (
    <div className="bg-zinc-950 text-white font-sans min-h-screen selection:bg-orange-500 selection:text-black">

      {/* ── NAV ── */}
      <nav className="border-b-4 border-orange-600 bg-black sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-black italic tracking-tighter text-white">
            <span className="text-orange-600 text-4xl">{NEGOCIO.nombre.charAt(0)}</span>
            {NEGOCIO.nombre.slice(1).split(' ')[0]}
            <span className="block text-xs font-normal text-zinc-400 uppercase tracking-widest not-italic">
              {NEGOCIO.nombre.split(' ').slice(1).join(' ')}
            </span>
          </h1>
          <div className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-widest text-zinc-400">
            <a href="#instalaciones" className="hover:text-orange-500 transition">Instalaciones</a>
            <a href="#ubicacion" className="hover:text-orange-500 transition">Ubicación</a>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="bg-orange-600 text-black px-6 py-2 font-black uppercase italic hover:bg-orange-500 transition transform hover:-skew-x-12">
            Entrena Hoy
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="relative pt-24 pb-20 md:pt-40 md:pb-32 px-4 overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 to-zinc-950 -z-10" />
        <div className="max-w-5xl mx-auto flex flex-col items-start">
          <div className="bg-orange-600 text-black font-black uppercase px-3 py-1 mb-6 transform -skew-x-12 inline-block text-sm">
            {NEGOCIO.ciudad}
          </div>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none text-zinc-100">
            {NEGOCIO.slogan}<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
              {NEGOCIO.slogan2}
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-zinc-400 font-medium mb-10 max-w-2xl border-l-4 border-orange-600 pl-4">
            {NEGOCIO.descripcion}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#ubicacion"
              className="bg-orange-600 text-black px-8 py-4 font-black uppercase tracking-widest hover:bg-orange-500 transition transform hover:-translate-y-1">
              Ver Ubicación
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="border-2 border-orange-600 text-orange-500 px-8 py-4 font-black uppercase tracking-widest hover:bg-orange-600 hover:text-black transition">
              Pedir Informes
            </a>
          </div>
        </div>
      </header>

      {/* ── INSTALACIONES ── */}
      <section id="instalaciones" className="py-24 bg-zinc-900 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-1 w-12 bg-orange-600" />
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Nuestras Zonas</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {NEGOCIO.zonas.map((zona, zi) => (
              <div key={zi} className="bg-zinc-950 p-8 border-l-4 border-zinc-700 hover:border-orange-600 transition duration-300">
                <h3 className="text-3xl font-black uppercase mb-4 text-orange-500">{zona.nombre}</h3>
                <ul className="space-y-3 text-zinc-400 font-medium">
                  {zona.items.map((item, ii) => (
                    <li key={ii} className="flex items-center gap-2">
                      <span className="text-orange-600">▪</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANNER PRECIOS ── */}
      <section className="py-16 bg-orange-600 px-4 text-black text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase mb-3">{NEGOCIO.precio_banner}</h2>
        <p className="text-xl font-bold opacity-80">{NEGOCIO.precio_sub}</p>
        <a href={wa} target="_blank" rel="noopener noreferrer"
          className="mt-6 inline-block bg-black text-white font-black uppercase tracking-widest px-8 py-4 hover:bg-zinc-900 transition text-sm">
          Consultar Precios
        </a>
      </section>

      {/* ── UBICACIÓN ── */}
      <section id="ubicacion" className="py-24 bg-zinc-950 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-black uppercase mb-8 border-b-2 border-orange-600 inline-block pb-2">Encuéntranos</h2>
            <div className="space-y-6 mt-6">
              {[
                { label: "Dirección", value: NEGOCIO.direccion, icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900 p-6 flex gap-4 items-start">
                  <svg className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
                  </svg>
                  <div>
                    <h4 className="font-black text-xl text-white uppercase mb-1">{item.label}</h4>
                    <p className="text-zinc-400 text-lg">{item.value}</p>
                  </div>
                </div>
              ))}

              <div className="bg-zinc-900 p-6 flex gap-4 items-start">
                <svg className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h4 className="font-black text-xl text-white uppercase mb-2">Horarios</h4>
                  {NEGOCIO.horarios.map((h, i) => (
                    <p key={i} className="text-zinc-400">{h.dia}: <span className="text-white font-bold">{h.hora}</span></p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contacto + Mapa */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8">
              <h3 className="text-2xl font-black uppercase mb-4 text-white">¿Listo para empezar?</h3>
              <p className="text-zinc-400 mb-6">Visítanos directamente o contáctanos por WhatsApp para más información.</p>
              <a href={wa} target="_blank" rel="noopener noreferrer"
                className="w-full bg-orange-600 text-black font-black uppercase py-4 hover:bg-orange-500 transition block text-center">
                Contactar por WhatsApp
              </a>
            </div>

            <div className="h-64 border border-zinc-800 overflow-hidden">
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
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t-4 border-orange-600 bg-black py-10 text-center px-4">
        <h2 className="text-2xl font-black italic tracking-tighter text-zinc-600 mb-1">
          {NEGOCIO.nombre} <span className="not-italic text-sm tracking-widest">{NEGOCIO.tipo.toUpperCase()}</span>
        </h2>
        <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} {NEGOCIO.nombre}. {NEGOCIO.ciudad}</p>
        <div className="mt-4 inline-block bg-zinc-900 px-4 py-2 text-xs text-zinc-600 uppercase tracking-widest">
          Desarrollado por GDA.
        </div>
      </footer>
    </div>
  );
}
