import Link from 'next/link';

// ============================================================
// ✏️  EDITA SOLO ESTA SECCIÓN PARA CADA CLIENTE
// ============================================================
const NEGOCIO = {
  nombre:       "Taquería El Padrino",
  tipo:         "Tacos & Antojitos",
  slogan:       "El sabor que no se olvida",
  descripcion:  "Desde 1998 sirviendo los mejores tacos al pastor, birria y antojitos del barrio. Sazón de abuela, trato de familia.",
  whatsapp:     "524428367627",
  facebook:     "taqueriaelpadrino",
  telefono:     "442 200 0000",
  direccion:    "Calle Corregidora 22, El Pueblito, Qro.",
  maps_embed:   "https://maps.google.com/maps?q=queretaro&output=embed",
  horarios: [
    { dia: "Martes a Domingo", hora: "8:00 am – 11:00 pm" },
    { dia: "Lunes",            hora: "Cerrado" },
  ],
  menu: [
    { categoria: "Tacos",    items: [
      { nombre: "Al Pastor",    precio: "$18" },
      { nombre: "Bistec",       precio: "$20" },
      { nombre: "Suadero",      precio: "$20" },
      { nombre: "Campechano",   precio: "$22" },
      { nombre: "De Canasta",   precio: "$12" },
    ]},
    { categoria: "Birria",   items: [
      { nombre: "Taco de Birria",      precio: "$25" },
      { nombre: "Consomé chico",       precio: "$30" },
      { nombre: "Orden de Birria",     precio: "$80" },
    ]},
    { categoria: "Antojitos", items: [
      { nombre: "Quesadilla",   precio: "$35" },
      { nombre: "Huarache",     precio: "$55" },
      { nombre: "Sope",         precio: "$30" },
      { nombre: "Tlayuda",      precio: "$65" },
    ]},
  ],
};
// ============================================================

export default function BoldRedTemplate() {
  const wa = `https://wa.me/${NEGOCIO.whatsapp}?text=Hola%20${encodeURIComponent(NEGOCIO.nombre)},%20quiero%20hacer%20un%20pedido`;

  return (
    <div className="bg-[#0f0a0a] text-white min-h-screen" style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=Barlow:wght@400;500;600&display=swap');
        .font-condensed { font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif; }
        .font-body-reg  { font-family: 'Barlow', sans-serif; }

        .bg-red-brand   { background-color: #d42b2b; }
        .text-red-brand { color: #d42b2b; }
        .border-red-brand { border-color: #d42b2b; }

        @keyframes slide-in {
          from { opacity:0; transform:translateX(-20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .slide-in { animation: slide-in 0.5s ease-out both; }
        .d1 { animation-delay:0.1s; }
        .d2 { animation-delay:0.2s; }

        .menu-item { transition: background 0.15s ease; }
        .menu-item:hover { background: rgba(212,43,43,0.08); }

        .stamp {
          border: 3px solid #d42b2b;
          border-radius: 4px;
          transform: rotate(-4deg);
          display: inline-block;
          padding: 4px 12px;
          color: #d42b2b;
          font-weight: 900;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .diagonal-section {
          clip-path: polygon(0 4%, 100% 0%, 100% 96%, 0% 100%);
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-[#0f0a0a]/95 backdrop-blur-sm border-b-2 border-red-brand">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="font-condensed">
            <span className="text-2xl font-black text-white tracking-tight">{NEGOCIO.nombre}</span>
            <span className="hidden md:inline text-red-brand text-sm font-bold ml-3 uppercase tracking-widest">— {NEGOCIO.tipo}</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-condensed text-sm font-bold uppercase tracking-widest text-zinc-400">
            <a href="#menu" className="hover:text-red-brand transition">Menú</a>
            <a href="#ubicacion" className="hover:text-red-brand transition">Ubicación</a>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="font-condensed font-black uppercase tracking-widest text-sm bg-red-brand text-white px-5 py-2 hover:brightness-110 transition">
            Pedir Ya
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 px-4">

        {/* Fondo con patrón */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `repeating-linear-gradient(45deg, #d42b2b 0, #d42b2b 1px, transparent 0, transparent 50%)`, backgroundSize: '20px 20px' }} />

        {/* Número grande decorativo */}
        <div className="absolute right-0 top-0 font-condensed font-black text-[280px] leading-none text-red-brand opacity-5 select-none pointer-events-none">
          98
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="stamp slide-in mb-6">Desde 1998</div>

          <h1 className="font-condensed text-6xl md:text-9xl font-black uppercase leading-[0.9] mb-6 slide-in d1">
            <span className="text-white">{NEGOCIO.slogan.split(' ').slice(0, 2).join(' ')}</span><br/>
            <span className="text-red-brand italic">{NEGOCIO.slogan.split(' ').slice(2).join(' ')}</span>
          </h1>

          <p className="font-body-reg text-zinc-400 text-lg max-w-xl mb-10 slide-in d2">
            {NEGOCIO.descripcion}
          </p>

          <div className="flex flex-wrap gap-4">
            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="font-condensed font-black uppercase tracking-widest text-base bg-red-brand text-white px-8 py-4 hover:brightness-110 transition flex items-center gap-2">
              Hacer Pedido
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>
            <a href="#menu"
              className="font-condensed font-black uppercase tracking-widest text-base border-2 border-zinc-700 text-zinc-300 px-8 py-4 hover:border-red-brand hover:text-red-brand transition">
              Ver Menú
            </a>
          </div>

          {/* Pills de info rápida */}
          <div className="flex flex-wrap gap-3 mt-10">
            {["🕐 Abierto hoy", "🛵 Para llevar", "💳 Efectivo y tarjeta"].map((item, i) => (
              <span key={i} className="font-condensed text-sm font-semibold text-zinc-400 border border-zinc-800 px-3 py-1.5 uppercase tracking-wide">
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── MENÚ ── */}
      <section id="menu" className="py-20 bg-[#160d0d] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-8 h-1 bg-red-brand" />
            <h2 className="font-condensed text-5xl font-black uppercase tracking-tight">Nuestro Menú</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {NEGOCIO.menu.map((cat, ci) => (
              <div key={ci} className="border border-zinc-800 overflow-hidden">
                {/* Cat header */}
                <div className="bg-red-brand px-6 py-3">
                  <h3 className="font-condensed font-black uppercase text-xl tracking-widest">{cat.categoria}</h3>
                </div>
                {/* Items */}
                <div className="divide-y divide-zinc-800/50">
                  {cat.items.map((item, ii) => (
                    <div key={ii} className="menu-item px-6 py-3.5 flex justify-between items-center">
                      <span className="font-body-reg text-zinc-300">{item.nombre}</span>
                      <span className="font-condensed font-bold text-red-brand text-lg">{item.precio}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="font-body-reg text-zinc-500 text-sm mb-4">¿Quieres ordenar o preguntar por algo más?</p>
            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="font-condensed font-black uppercase tracking-widest text-base bg-red-brand text-white px-10 py-4 hover:brightness-110 transition inline-block">
              Pedir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FRANJA ── */}
      <div className="bg-red-brand py-8 px-4 overflow-hidden">
        <div className="font-condensed font-black text-2xl uppercase tracking-widest text-white/20 whitespace-nowrap animate-pulse text-center">
          {Array(6).fill(`${NEGOCIO.nombre} · El sabor de siempre · `).join('')}
        </div>
      </div>

      {/* ── UBICACIÓN ── */}
      <section id="ubicacion" className="py-20 bg-[#0f0a0a] px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">

          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-1 bg-red-brand" />
              <h2 className="font-condensed text-4xl font-black uppercase">Encuéntranos</h2>
            </div>

            <div className="space-y-6">
              {[
                { label: "Dirección", value: NEGOCIO.direccion, icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" },
                { label: "Teléfono",  value: NEGOCIO.telefono,  icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-red-brand flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-condensed text-xs uppercase tracking-widest text-zinc-500 mb-0.5">{item.label}</p>
                    <p className="font-body-reg text-zinc-200 font-medium">{item.value}</p>
                  </div>
                </div>
              ))}

              {/* Horarios */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-red-brand flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-condensed text-xs uppercase tracking-widest text-zinc-500 mb-2">Horarios</p>
                  {NEGOCIO.horarios.map((h, i) => (
                    <div key={i} className="flex justify-between font-body-reg text-sm py-2 border-b border-zinc-800 last:border-0">
                      <span className="text-zinc-400">{h.dia}</span>
                      <span className="font-bold text-white">{h.hora}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="font-condensed mt-8 inline-flex items-center gap-2 font-black uppercase tracking-widest text-base bg-red-brand text-white px-8 py-4 hover:brightness-110 transition">
              Contactar por WhatsApp
            </a>
          </div>

          {/* Mapa */}
          <div className="h-80 md:h-full min-h-[320px] border-2 border-zinc-800 overflow-hidden">
            <iframe
              src={NEGOCIO.maps_embed}
              width="100%" height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación"
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t-2 border-red-brand bg-[#0a0606] py-10 px-4 text-center">
        <p className="font-condensed text-2xl font-black uppercase tracking-widest text-white mb-1">{NEGOCIO.nombre}</p>
        <p className="font-condensed text-red-brand text-xs uppercase tracking-widest mb-4">{NEGOCIO.tipo}</p>
        <p className="font-body-reg text-zinc-600 text-xs">© {new Date().getFullYear()} {NEGOCIO.nombre} · Desarrollado por GDA.</p>
      </footer>

    </div>
  );
}
