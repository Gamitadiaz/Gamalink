import Link from 'next/link';

// ============================================================
// ✏️  EDITA SOLO ESTA SECCIÓN PARA CADA CLIENTE
// ============================================================
const NEGOCIO = {
  nombre:       "La Navaja & Co.",
  tipo:         "Barbería de Autor",
  slogan:       "El corte perfecto no es casualidad",
  descripcion:  "Tradición barbera con técnica contemporánea. Cada servicio es una experiencia, cada corte una obra.",
  whatsapp:     "4428367627",
  instagram:    "lanajabarber",
  direccion:    "Andador Hidalgo 14, Centro, Querétaro",
  maps_embed:   "https://maps.google.com/maps?q=queretaro&output=embed",
  horarios: [
    { dia: "Lunes a Viernes", hora: "9:00 am – 8:00 pm" },
    { dia: "Sábado",          hora: "9:00 am – 6:00 pm" },
    { dia: "Domingo",         hora: "Cerrado" },
  ],
  servicios: [
    { nombre: "Corte Clásico",        precio: "$120",  desc: "Tijera o máquina con acabado premium." },
    { nombre: "Corte + Barba",        precio: "$180",  desc: "Diseño completo con navaja y toalla caliente." },
    { nombre: "Afeitado con Navaja",  precio: "$100",  desc: "Ritual tradicional con espuma artesanal." },
    { nombre: "Tinte o Decoloración", precio: "$250+", desc: "Desde tonos naturales hasta estilos atrevidos." },
    { nombre: "Corte Infantil",       precio: "$80",   desc: "Para los pequeños de la casa." },
    { nombre: "Tratamiento Capilar",  precio: "$150",  desc: "Hidratación y fortalecimiento profundo." },
  ],
};
// ============================================================

export default function WarmWoodTemplate() {
  const wa = `https://wa.me/${NEGOCIO.whatsapp}?text=Hola,%20quiero%20agendar%20una%20cita%20en%20${encodeURIComponent(NEGOCIO.nombre)}`;

  return (
    <div className="bg-[#f5f0e8] text-[#2a1f14] font-serif min-h-screen selection:bg-[#8B5E3C] selection:text-white">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Lato:wght@300;400;700&display=swap');
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body    { font-family: 'Lato', sans-serif; }

        @keyframes fade-up {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up { animation: fade-up 0.7s ease-out both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }

        .scissor-divider {
          display:flex; align-items:center; gap:12px;
          color:#8B5E3C; font-size:1.2rem; margin: 0 auto;
          width: fit-content;
        }
        .scissor-divider::before,
        .scissor-divider::after {
          content:''; display:block; height:1px;
          width:80px; background:#8B5E3C; opacity:0.4;
        }

        .service-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(139,94,60,0.15); }
        .service-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }

        .nav-link { position:relative; }
        .nav-link::after {
          content:''; position:absolute; bottom:-2px; left:0;
          width:0; height:1px; background:#8B5E3C;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after { width:100%; }
      `}</style>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-[#f5f0e8]/95 backdrop-blur-sm border-b border-[#d4b896]/40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-display">
            <p className="text-xl font-bold tracking-wide leading-tight">{NEGOCIO.nombre}</p>
            <p className="font-body text-[10px] uppercase tracking-[0.25em] text-[#8B5E3C]">{NEGOCIO.tipo}</p>
          </div>
          <div className="hidden md:flex gap-8 font-body text-sm font-bold uppercase tracking-widest text-[#5a3e28]">
            <a href="#servicios" className="nav-link hover:text-[#8B5E3C] transition">Servicios</a>
            <a href="#ubicacion" className="nav-link hover:text-[#8B5E3C] transition">Ubicación</a>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="font-body text-xs font-bold uppercase tracking-widest bg-[#2a1f14] text-[#f5f0e8] px-5 py-2.5 hover:bg-[#8B5E3C] transition">
            Reservar
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Fondo de textura */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a1f14' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        {/* Línea decorativa vertical */}
        <div className="absolute left-12 top-0 bottom-0 w-px bg-[#8B5E3C] opacity-20 hidden lg:block" />

        <div className="max-w-5xl mx-auto px-6 lg:px-16 py-24 w-full">
          <div className="max-w-2xl fade-up">
            <div className="scissor-divider mb-8 justify-start">
              <span>✂</span>
              <span className="font-body text-xs uppercase tracking-[0.3em]">{NEGOCIO.tipo}</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-black leading-[1.05] mb-6 text-[#2a1f14]">
              {NEGOCIO.slogan.split(' ').slice(0, 3).join(' ')}<br/>
              <span className="italic text-[#8B5E3C]">{NEGOCIO.slogan.split(' ').slice(3).join(' ')}</span>
            </h1>

            <p className="font-body text-lg text-[#5a3e28] leading-relaxed mb-10 max-w-lg delay-1 fade-up">
              {NEGOCIO.descripcion}
            </p>

            <div className="flex flex-wrap gap-4 delay-2 fade-up">
              <a href={wa} target="_blank" rel="noopener noreferrer"
                className="font-body font-bold uppercase tracking-widest text-sm bg-[#2a1f14] text-[#f5f0e8] px-8 py-4 hover:bg-[#8B5E3C] transition flex items-center gap-2">
                Agendar Cita
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </a>
              <a href="#servicios"
                className="font-body font-bold uppercase tracking-widest text-sm border border-[#2a1f14]/40 text-[#2a1f14] px-8 py-4 hover:border-[#8B5E3C] hover:text-[#8B5E3C] transition">
                Ver Servicios
              </a>
            </div>
          </div>

          {/* Card decorativa */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="bg-white/60 backdrop-blur border border-[#d4b896]/60 p-8 rounded-sm w-56 text-center shadow-xl">
              <div className="text-4xl mb-3">✂️</div>
              <p className="font-display text-sm font-bold text-[#2a1f14] mb-1">Experiencia</p>
              <p className="font-body text-xs text-[#8B5E3C] uppercase tracking-widest">desde 2018</p>
              <div className="border-t border-[#d4b896]/40 mt-4 pt-4">
                <p className="font-body text-xs text-[#5a3e28]">Cita previa por<br/>WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="py-24 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="scissor-divider mb-4"><span>✂</span></div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#2a1f14] mb-3">Nuestros Servicios</h2>
            <p className="font-body text-[#8B5E3C] text-sm uppercase tracking-widest">Tradición y precisión en cada corte</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {NEGOCIO.servicios.map((s, i) => (
              <div key={i} className="service-card bg-[#f5f0e8] border border-[#d4b896]/40 p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-display text-lg font-bold text-[#2a1f14]">{s.nombre}</h3>
                  <span className="font-body font-bold text-[#8B5E3C] text-sm whitespace-nowrap ml-2">{s.precio}</span>
                </div>
                <p className="font-body text-sm text-[#5a3e28] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="font-body inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm text-[#8B5E3C] border border-[#8B5E3C] px-8 py-3 hover:bg-[#8B5E3C] hover:text-white transition">
              Reservar por WhatsApp
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.054 23.293a.75.75 0 00.921.921l5.434-1.479A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.5-5.205-1.377l-.374-.214-3.876 1.054 1.054-3.876-.214-.374A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── FRANJA QUOTE ── */}
      <div className="bg-[#2a1f14] py-16 px-6 text-center">
        <p className="font-display text-2xl md:text-3xl italic text-[#d4b896] max-w-2xl mx-auto">
          "Un buen corte no cambia tu cara,<br/>cambia cómo te sientes."
        </p>
        <div className="scissor-divider mt-6" style={{ color: '#8B5E3C' }}><span>✂</span></div>
      </div>

      {/* ── UBICACIÓN Y HORARIOS ── */}
      <section id="ubicacion" className="py-24 bg-[#f5f0e8] px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">

          <div>
            <div className="scissor-divider mb-6 justify-start"><span>✂</span></div>
            <h2 className="font-display text-4xl font-bold text-[#2a1f14] mb-8">Visítanos</h2>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-[#8B5E3C] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-body font-bold text-[#2a1f14] uppercase tracking-wider text-xs mb-1">Dirección</p>
                  <p className="font-body text-[#5a3e28]">{NEGOCIO.direccion}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-[#8B5E3C] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-body font-bold text-[#2a1f14] uppercase tracking-wider text-xs mb-2">Horarios</p>
                  {NEGOCIO.horarios.map((h, i) => (
                    <div key={i} className="flex justify-between gap-8 font-body text-sm text-[#5a3e28] border-b border-[#d4b896]/30 py-1.5 last:border-0">
                      <span>{h.dia}</span>
                      <span className="font-bold text-[#2a1f14]">{h.hora}</span>
                    </div>
                  ))}
                </div>
              </div>

              {NEGOCIO.instagram && (
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-[#8B5E3C] flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-body font-bold text-[#2a1f14] uppercase tracking-wider text-xs mb-1">Instagram</p>
                    <a href={`https://instagram.com/${NEGOCIO.instagram}`} target="_blank" rel="noopener noreferrer"
                      className="font-body text-[#8B5E3C] hover:underline">@{NEGOCIO.instagram}</a>
                  </div>
                </div>
              )}
            </div>

            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="font-body mt-8 inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm bg-[#2a1f14] text-white px-8 py-4 hover:bg-[#8B5E3C] transition">
              Agendar por WhatsApp
            </a>
          </div>

          {/* Mapa */}
          <div className="h-80 md:h-full min-h-[320px] border border-[#d4b896]/40 overflow-hidden">
            <iframe
              src={NEGOCIO.maps_embed}
              width="100%" height="100%"
              style={{ border: 0, filter: 'sepia(20%) contrast(0.9)' }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación"
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#2a1f14] py-10 px-6 text-center">
        <p className="font-display text-xl text-[#d4b896] mb-1">{NEGOCIO.nombre}</p>
        <p className="font-body text-[#8B5E3C] text-xs uppercase tracking-widest mb-4">{NEGOCIO.tipo}</p>
        <p className="font-body text-[#5a3e28] text-xs">
          © {new Date().getFullYear()} {NEGOCIO.nombre}. Todos los derechos reservados.
        </p>
        <p className="font-body text-[#3a2a1a] text-xs mt-2">Desarrollado por GDA.</p>
      </footer>

    </div>
  );
}
