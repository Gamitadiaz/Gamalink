import Link from 'next/link';

// ============================================================
// ✏️  EDITA SOLO ESTA SECCIÓN PARA CADA CLIENTE
// ============================================================
const NEGOCIO = {
  nombre:       "Studio Blanc",
  tipo:         "Estética & Bienestar",
  slogan:       "Belleza que habla por sí sola",
  descripcion:  "Un espacio dedicado a realzar tu mejor versión. Servicios profesionales en un ambiente tranquilo y sofisticado.",
  whatsapp:     "52442836727",
  instagram:    "studioblanc",
  telefono:     "442 100 0000",
  direccion:    "Av. Constituyentes 88, Querétaro",
  maps_embed:   "https://maps.google.com/maps?q=queretaro&output=embed",
  horarios: [
    { dia: "Lunes a Viernes", hora: "9:00 – 19:00" },
    { dia: "Sábado",          hora: "9:00 – 15:00" },
    { dia: "Domingo",         hora: "Cerrado" },
  ],
  servicios: [
    { icono: "✦", nombre: "Corte & Peinado",     precio: "Desde $200", desc: "Corte personalizado y secado con productos premium." },
    { icono: "✦", nombre: "Color & Mechas",       precio: "Desde $350", desc: "Técnicas modernas para resultados naturales o atrevidos." },
    { icono: "✦", nombre: "Tratamientos",         precio: "Desde $250", desc: "Keratina, hidratación y reconstrucción capilar." },
    { icono: "✦", nombre: "Maquillaje",           precio: "Desde $400", desc: "Social, editorial y nupcial con productos de alta gama." },
    { icono: "✦", nombre: "Uñas",                 precio: "Desde $150", desc: "Manicure, pedicure y nail art." },
    { icono: "✦", nombre: "Cejas & Pestañas",     precio: "Desde $120", desc: "Diseño, tinte y extensiones." },
  ],
};
// ============================================================

export default function CleanWhiteTemplate() {
  const wa = `https://wa.me/${NEGOCIO.whatsapp}?text=Hola,%20me%20gustar%C3%ADa%20agendar%20una%20cita%20en%20${encodeURIComponent(NEGOCIO.nombre)}`;

  return (
    <div className="bg-white text-gray-900 min-h-screen" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&family=DM+Serif+Display:ital@0;1&display=swap');
        .font-serif-display { font-family: 'DM Serif Display', Georgia, serif; }

        @keyframes reveal {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .reveal { animation: reveal 0.6s ease-out both; }
        .d1 { animation-delay:0.1s; }
        .d2 { animation-delay:0.2s; }
        .d3 { animation-delay:0.3s; }

        .service-item { border-bottom: 1px solid #f0f0f0; }
        .service-item:hover { background: #fafafa; }
        .service-item { transition: background 0.2s ease; }

        .pill {
          display: inline-block;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          padding: 4px 14px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9ca3af;
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <span className="font-serif-display text-xl tracking-wide">{NEGOCIO.nombre}</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500 font-medium">
            <a href="#servicios" className="hover:text-gray-900 transition">Servicios</a>
            <a href="#ubicacion" className="hover:text-gray-900 transition">Contacto</a>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-widest bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-700 transition">
            Reservar
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="max-w-5xl mx-auto px-6 pt-24 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-3xl">
          <span className="pill reveal">Bienvenido a {NEGOCIO.nombre}</span>
          <h1 className="font-serif-display text-5xl md:text-7xl leading-[1.1] mt-6 mb-6 reveal d1">
            {NEGOCIO.slogan}
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-xl reveal d2">
            {NEGOCIO.descripcion}
          </p>
          <div className="flex flex-wrap gap-3 mt-10 reveal d3">
            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-bold px-7 py-3.5 rounded-full hover:bg-gray-700 transition">
              Agendar cita
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>
            <a href="#servicios"
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-7 py-3.5 rounded-full hover:border-gray-400 transition">
              Ver servicios
            </a>
          </div>
        </div>

        {/* Línea decorativa */}
        <div className="mt-20 flex items-center gap-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-gray-300 text-xs uppercase tracking-widest">{NEGOCIO.tipo}</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
      </header>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="py-20 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="pill">Lo que ofrecemos</span>
              <h2 className="font-serif-display text-4xl md:text-5xl mt-4">Servicios</h2>
            </div>
            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="text-sm font-bold text-gray-900 underline underline-offset-4 hover:text-gray-600 transition">
              Reservar por WhatsApp →
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {NEGOCIO.servicios.map((s, i) => (
              <div key={i} className="service-item px-8 py-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <span className="text-gray-300 text-sm font-mono">0{i + 1}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{s.nombre}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{s.precio}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS / VALORES ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: "100%", label: "Productos profesionales" },
            { n: "5★",   label: "Calificación promedio" },
            { n: "Cita", label: "Previa requerida" },
            { n: "±45'", label: "Tiempo por servicio" },
          ].map((stat, i) => (
            <div key={i}>
              <p className="font-serif-display text-4xl text-gray-900 mb-2">{stat.n}</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACTO Y UBICACIÓN ── */}
      <section id="ubicacion" className="py-20 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">

          <div>
            <span className="pill">Encuéntranos</span>
            <h2 className="font-serif-display text-4xl mt-4 mb-10">Visítanos</h2>

            <div className="space-y-6">
              {[
                {
                  label: "Dirección",
                  value: NEGOCIO.direccion,
                  icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
                },
                {
                  label: "Teléfono",
                  value: NEGOCIO.telefono,
                  icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon}/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="text-gray-800 font-medium">{item.value}</p>
                  </div>
                </div>
              ))}

              {/* Horarios */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Horarios</p>
                  {NEGOCIO.horarios.map((h, i) => (
                    <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">{h.dia}</span>
                      <span className="font-medium text-gray-900">{h.hora}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-bold px-7 py-3.5 rounded-full hover:bg-gray-700 transition">
              Contactar por WhatsApp
            </a>
          </div>

          {/* Mapa */}
          <div className="rounded-2xl overflow-hidden h-80 md:h-full min-h-[320px] border border-gray-100">
            <iframe
              src={NEGOCIO.maps_embed}
              width="100%" height="100%"
              style={{ border: 0 }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación"
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-serif-display text-lg">{NEGOCIO.nombre}</p>
            <p className="text-xs text-gray-400 mt-0.5">{NEGOCIO.tipo}</p>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {NEGOCIO.nombre} · Desarrollado por GDA.
          </p>
        </div>
      </footer>

    </div>
  );
}
