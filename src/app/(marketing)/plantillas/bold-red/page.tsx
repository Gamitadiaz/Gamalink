"use client";
import { useAnalytics } from "@/hooks/use-analytics";

interface BoldRedTemplateProps {
  empresaId?: number;
  negocio?: {
    nombre: string;
    tipo: string;
    slogan: string;
    descripcion: string;
    whatsapp: string;
    facebook: string;
    telefono: string;
    direccion: string;
    maps_embed: string;
    horarios: { dia: string; hora: string }[];
    menu: { categoria: string; items: { nombre: string; precio: string }[] }[];
  };
}
// ============================================================
// ✏️  EDITA SOLO ESTA SECCIÓN PARA CADA CLIENTE
// ============================================================
const NEGOCIO = {
  nombre: "Taquería El Padrino",
  tipo: "Tacos & Antojitos",
  slogan: "El sabor que no se olvida",
  descripcion:
    "Desde 1998 sirviendo los mejores tacos al pastor, birria y antojitos del barrio. Sazón de abuela, trato de familia.",
  whatsapp: "524428367627",
  facebook: "taqueriaelpadrino",
  telefono: "442 200 0000",
  direccion: "Calle Corregidora 22, El Pueblito, Qro.",
  maps_embed: "https://maps.google.com/maps?q=queretaro&output=embed",
  horarios: [
    { dia: "Martes a Domingo", hora: "8:00 am – 11:00 pm" },
    { dia: "Lunes", hora: "Cerrado" },
  ],
  menu: [
    {
      categoria: "Tacos",
      items: [
        { nombre: "Al Pastor", precio: "$18" },
        { nombre: "Bistec", precio: "$20" },
        { nombre: "Suadero", precio: "$20" },
        { nombre: "Campechano", precio: "$22" },
        { nombre: "De Canasta", precio: "$12" },
      ],
    },
    {
      categoria: "Birria",
      items: [
        { nombre: "Taco de Birria", precio: "$25" },
        { nombre: "Consomé chico", precio: "$30" },
        { nombre: "Orden de Birria", precio: "$80" },
      ],
    },
    {
      categoria: "Antojitos",
      items: [
        { nombre: "Quesadilla", precio: "$35" },
        { nombre: "Huarache", precio: "$55" },
        { nombre: "Sope", precio: "$30" },
        { nombre: "Tlayuda", precio: "$65" },
      ],
    },
  ],
};
// ============================================================

export default function BoldRedTemplate({ empresaId, negocio = NEGOCIO }: BoldRedTemplateProps = {}) {
  // El hook ahora usa el ID dinámico que le pasen
  const { trackClick } = useAnalytics(empresaId);

  const wa = `https://wa.me/${negocio.whatsapp}?text=Hola%20${encodeURIComponent(negocio.nombre)},%20quiero%20hacer%20un%20pedido`;

  return (
    <div
      className="min-h-screen·bg-[#0f0a0a]·text-white"
      style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }}
    >
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
      <nav className="sticky·top-0·z-50·border-red-brand·border-b-2·bg-[#0f0a0a]/95·backdrop-blur-sm">
        <div className="mx-auto·flex·max-w-5xl·items-center·justify-between·px-4·py-3">
          <div className="font-condensed">
            <span className="font-black·text-2xl·text-white·tracking-tight">{NEGOCIO.nombre}</span>
            <span className="ml-3·hidden·font-bold·text-red-brand·text-sm·uppercase·tracking-widest·md:inline">
              — {NEGOCIO.tipo}
            </span>
          </div>
          <div className="hidden·items-center·gap-8·font-bold·font-condensed·text-sm·text-zinc-400·uppercase·tracking-widest·md:flex">
            <a href="#menu" className="transition·hover:text-red-brand">
              Menú
            </a>
            <a href="#ubicacion" className="transition hover:text-red-brand">
              Ubicación
            </a>
          </div>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-brand px-5 py-2 font-black font-condensed text-sm text-white uppercase tracking-widest transition hover:brightness-110"
          >
            Pedir Ya
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="relative overflow-hidden px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Fondo con patrón */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeatinglinear-gradient(45deg, #d42b2b 0, #d42b2b 1px, transparent 0, transparent 50%)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Número grande decorativo */}
        <div className="pointer-events-none absolute top-0 right-0 select-none font-black font-condensed text-[280px] text-red-brand leading-none opacity-5">
          98
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="stamp slide-in mb-6">Desde 1998</div>

          <h1 className="slide-in d1 mb-6 font-black font-condensed text-6xl uppercase leading-[0.9] md:text-9xl">
            <span className="text-white">{NEGOCIO.slogan.split(" ").slice(0, 2).join(" ")}</span>
            <br />
            <span className="text-red-brand italic">{NEGOCIO.slogan.split(" ").slice(2).join(" ")}</span>
          </h1>

          <p className="slide-in d2 mb-10 max-w-xl font-body-reg text-lg text-zinc-400">{NEGOCIO.descripcion}</p>

          <div className="flex flex-wrap gap-4">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick("whatsapp_click")}
              className="flex items-center gap-2 bg-red-brand px-8 py-4 font-black font-condensed text-base text-white uppercase tracking-widest transition hover:brightness-110"
            >
              Ver Menú
            </a>
          </div>

          {/* Pills de info rápida */}
          <div className="mt-10 flex flex-wrap gap-3">
            {["🕐 Abierto hoy", "🛵 Para llevar", "💳 Efectivo y tarjeta"].map((item) => (
              <span
                key={item}
                className="border border-zinc-800 px-3 py-1.5 font-condensed font-semibold text-sm text-zinc-400 uppercase tracking-wide"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── MENÚ ── */}
      <section id="menu" className="bg-[#160d0d] px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 flex items-center gap-4">
            <div className="h-1 w-8 bg-red-brand" />
            <h2 className="font-black font-condensed text-5xl uppercase tracking-tight">Nuestro Menú</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {NEGOCIO.menu.map((cat) => (
              <div key={cat.categoria} className="overflow-hidden border border-zinc-800">
                {/* Cat header */}
                <div className="bg-red-brand px-6 py-3">
                  <h3 className="font-black font-condensed text-xl uppercase tracking-widest">{cat.categoria}</h3>
                </div>
                {/* Items */}
                <div className="divide-y divide-zinc-800/50">
                  {cat.items.map((item) => (
                    <div key={item.nombre} className="menu-item flex items-center justify-between px-6 py-3.5">
                      <span className="font-body-reg text-zinc-300">{item.nombre}</span>
                      <span className="font-bold font-condensed text-lg text-red-brand">{item.precio}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="mb-4 font-body-reg text-sm text-zinc-500">¿Quieres ordenar o preguntar por algo más?</p>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-brand px-10 py-4 font-black font-condensed text-base text-white uppercase tracking-widest transition hover:brightness-110"
            >
              Pedir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FRANJA ── */}
      <div className="overflow-hidden bg-red-brand px-4 py-8">
        <div className="animate-pulse whitespace-nowrap text-center font-black font-condensed text-2xl text-white/20 uppercase tracking-widest">
          {Array(6).fill(`${NEGOCIO.nombre} · El sabor de siempre · `).join("")}
        </div>
      </div>

      {/* ── UBICACIÓN ── */}
      <section id="ubicacion" className="bg-[#0f0a0a] px-4 py-20">
        <div className="mx-auto grid max-w-5xl items-start gap-12 md:grid-cols-2">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="h-1 w-8 bg-red-brand" />
              <h2 className="font-black font-condensed text-4xl uppercase">Encuéntranos</h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  label: "Dirección",
                  value: NEGOCIO.direccion,
                  icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
                },
                {
                  label: "Teléfono",
                  value: NEGOCIO.telefono,
                  icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-red-brand">
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="mb-0.5 font-condensed text-xs text-zinc-500 uppercase tracking-widest">
                      {item.label}
                    </p>
                    <p className="font-body-reg font-medium text-zinc-200">{item.value}</p>
                  </div>
                </div>
              ))}

              {/* Horarios */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-red-brand">
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5 text-white"
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
                </div>
                <div className="flex-1">
                  <p className="mb-2 font-condensed text-xs text-zinc-500 uppercase tracking-widest">Horarios</p>
                  {NEGOCIO.horarios.map((h) => (
                    <div
                      key={h.dia}
                      className="flex justify-between border-zinc-800 border-b py-2 font-body-reg text-sm last:border-0"
                    >
                      <span className="text-zinc-400">{h.dia}</span>
                      <span className="font-bold text-white">{h.hora}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-red-brand px-8 py-4 font-black font-condensed text-base text-white uppercase tracking-widest transition hover:brightness-110"
            >
              Contactar por WhatsApp
            </a>
          </div>

          {/* Mapa */}
          <div className="h-80 min-h-[320px] overflow-hidden border-2 border-zinc-800 md:h-full">
            <iframe
              src={NEGOCIO.maps_embed}
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación"
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-red-brand border-t-2 bg-[#0a0606] px-4 py-10 text-center">
        <p className="mb-1 font-black font-condensed text-2xl text-white uppercase tracking-widest">{NEGOCIO.nombre}</p>
        <p className="mb-4 font-condensed text-red-brand text-xs uppercase tracking-widest">{NEGOCIO.tipo}</p>
        <p className="font-body-reg text-xs text-zinc-600">
          © {new Date().getFullYear()} {NEGOCIO.nombre} · Desarrollado por GDA.
        </p>
      </footer>
    </div>
  );
}
