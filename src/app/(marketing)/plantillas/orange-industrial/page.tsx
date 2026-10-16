"use client";

import { LandingImageGallery } from "@/components/landing-image-gallery";
import { useAnalytics } from "@/hooks/use-analytics";
import type { LandingContentByTemplate } from "@/lib/landings/model";

const DEMO_NEGOCIO: LandingContentByTemplate["orange-industrial"] = {
  nombre: "Torque Taller Mecánico",
  tipo: "Taller Mecánico",
  ciudad: "Querétaro, Qro.",
  slogan: "Tu auto,",
  slogan2: "en buenas manos.",
  descripcion:
    "Mecánica general, diagnóstico por computadora, frenos y suspensión. Presupuesto sin compromiso y garantía en cada reparación.",
  whatsapp: "524428367627",
  direccion: "Calle Industria 45, Centro, Querétaro, Qro.",
  maps_embed: "https://maps.google.com/maps?q=Queretaro&output=embed",
  horarios: [
    { dia: "Lunes a Viernes", hora: "8:30 am – 6:30 pm" },
    { dia: "Sábado", hora: "9:00 am – 2:00 pm" },
    { dia: "Domingo", hora: "Cerrado" },
  ],
  zonas: [
    {
      nombre: "Mecánica",
      items: ["Afinación y cambio de aceite", "Frenos y suspensión", "Clutch y transmisión", "Sistema de enfriamiento"],
    },
    {
      nombre: "Diagnóstico",
      items: [
        "Escáner por computadora",
        "Revisión eléctrica",
        "Revisión antes de carretera",
        "Presupuesto sin compromiso",
      ],
    },
  ],
  precio_banner: "Cotiza tu servicio sin compromiso",
  precio_sub: "Afinación desde $890 · Garantía en cada reparación",
  imagenes: [],
};

// Textos fijos de la plantilla. Todavía no son editables (no están en el contenido de la landing, y agregarlos
// rompería la validación de las landings ya guardadas): las landings reales conservan los de gimnasio y la demo
// del catálogo usa los de taller.
const TEXTOS_GIMNASIO = {
  mensajeWhatsapp: "quiero información sobre membresías",
  enlaceSeccion: "Instalaciones",
  botonNav: "Entrena Hoy",
  tituloSeccion: "Nuestras Zonas",
  botonPrecios: "Consultar Precios",
  tituloContacto: "¿Listo para empezar?",
};

const TEXTOS_TALLER: typeof TEXTOS_GIMNASIO = {
  mensajeWhatsapp: "quiero cotizar un servicio",
  enlaceSeccion: "Servicios",
  botonNav: "Agenda tu servicio",
  tituloSeccion: "Nuestros Servicios",
  botonPrecios: "Pedir Cotización",
  tituloContacto: "¿Tu auto necesita servicio?",
};

export default function OrangeIndustrialTemplate({
  business,
  empresaId,
  landingId,
}: {
  business?: LandingContentByTemplate["orange-industrial"];
  empresaId?: number;
  landingId?: string;
} = {}) {
  const NEGOCIO = business ?? DEMO_NEGOCIO;
  const TEXTOS = business ? TEXTOS_GIMNASIO : TEXTOS_TALLER;
  useAnalytics(empresaId, landingId);
  const wa = `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(`Hola ${NEGOCIO.nombre}, ${TEXTOS.mensajeWhatsapp}`)}`;

  return (
    <div className="bg-zinc-950 text-white font-sans min-h-screen selection:bg-orange-500 selection:text-black">
      {/* ── NAV ── */}
      <nav className="border-b-4 border-orange-600 bg-black sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-black italic tracking-tighter text-white">
            <span className="text-orange-600 text-4xl">{NEGOCIO.nombre.charAt(0)}</span>
            {NEGOCIO.nombre.slice(1).split(" ")[0]}
            <span className="block text-xs font-normal text-zinc-400 uppercase tracking-widest not-italic">
              {NEGOCIO.nombre.split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <div className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-widest text-zinc-400">
            <a href="#instalaciones" className="hover:text-orange-500 transition">
              {TEXTOS.enlaceSeccion}
            </a>
            <a href="#ubicacion" className="hover:text-orange-500 transition">
              Ubicación
            </a>
          </div>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-600 text-black px-6 py-2 font-black uppercase italic hover:bg-orange-500 transition transform hover:-skew-x-12"
          >
            {TEXTOS.botonNav}
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
            {NEGOCIO.slogan}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
              {NEGOCIO.slogan2}
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-zinc-400 font-medium mb-10 max-w-2xl border-l-4 border-orange-600 pl-4">
            {NEGOCIO.descripcion}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#ubicacion"
              className="bg-orange-600 text-black px-8 py-4 font-black uppercase tracking-widest hover:bg-orange-500 transition transform hover:-translate-y-1"
            >
              Ver Ubicación
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-orange-600 text-orange-500 px-8 py-4 font-black uppercase tracking-widest hover:bg-orange-600 hover:text-black transition"
            >
              Pedir Informes
            </a>
          </div>
        </div>
        <LandingImageGallery images={NEGOCIO.imagenes} />
      </header>

      {/* ── INSTALACIONES ── */}
      <section id="instalaciones" className="py-24 bg-zinc-900 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-1 w-12 bg-orange-600" />
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">{TEXTOS.tituloSeccion}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {NEGOCIO.zonas.map((zona, zi) => (
              <div
                key={zi}
                className="bg-zinc-950 p-8 border-l-4 border-zinc-700 hover:border-orange-600 transition duration-300"
              >
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
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block bg-black text-white font-black uppercase tracking-widest px-8 py-4 hover:bg-zinc-900 transition text-sm"
        >
          {TEXTOS.botonPrecios}
        </a>
      </section>

      {/* ── UBICACIÓN ── */}
      <section id="ubicacion" className="py-24 bg-zinc-950 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-black uppercase mb-8 border-b-2 border-orange-600 inline-block pb-2">
              Encuéntranos
            </h2>
            <div className="space-y-6 mt-6">
              {[
                {
                  label: "Dirección",
                  value: NEGOCIO.direccion,
                  icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
                },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900 p-6 flex gap-4 items-start">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  <div>
                    <h4 className="font-black text-xl text-white uppercase mb-1">{item.label}</h4>
                    <p className="text-zinc-400 text-lg">{item.value}</p>
                  </div>
                </div>
              ))}

              <div className="bg-zinc-900 p-6 flex gap-4 items-start">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="font-black text-xl text-white uppercase mb-2">Horarios</h4>
                  {NEGOCIO.horarios.map((h, i) => (
                    <p key={i} className="text-zinc-400">
                      {h.dia}: <span className="text-white font-bold">{h.hora}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contacto + Mapa */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8">
              <h3 className="text-2xl font-black uppercase mb-4 text-white">{TEXTOS.tituloContacto}</h3>
              <p className="text-zinc-400 mb-6">
                Visítanos directamente o contáctanos por WhatsApp para más información.
              </p>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-orange-600 text-black font-black uppercase py-4 hover:bg-orange-500 transition block text-center"
              >
                Contactar por WhatsApp
              </a>
            </div>

            <div className="h-64 border border-zinc-800 overflow-hidden">
              <iframe
                src={NEGOCIO.maps_embed}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.85)" }}
                allowFullScreen
                loading="lazy"
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
        <p className="text-zinc-500 text-sm">
          © {new Date().getFullYear()} {NEGOCIO.nombre}. {NEGOCIO.ciudad}
        </p>
        <div className="mt-4 inline-block bg-zinc-900 px-4 py-2 text-xs text-zinc-600 uppercase tracking-widest">
          Desarrollado por{" "}
          <a
            href="https://gamalink.online"
            target="_blank"
            rel="noopener"
            className="underline underline-offset-2 hover:opacity-80"
          >
            Gamalink
          </a>
          .
        </div>
      </footer>
    </div>
  );
}
