import Link from 'next/link';

const PLANTILLAS = [
  {
    slug: 'dark-purple',
    nombre: 'Dark Purple',
    ideal: 'Gimnasios · Fitness · Tech',
    desc: 'Estilo espacial y tecnológico. Gradientes de azul a morado, perfecto para negocios de alto impacto.',
    bg: 'bg-black',
    border: 'border-purple-700',
    badge: 'bg-purple-600',
    preview: '🟣',
    textColor: 'text-purple-400',
  },
  {
    slug: 'orange-industrial',
    nombre: 'Orange Industrial',
    ideal: 'Gimnasios · Talleres · Autos',
    desc: 'Agresivo e industrial. Naranja sobre negro, tipografía bold. Para negocios que hablan de fuerza.',
    bg: 'bg-zinc-900',
    border: 'border-orange-600',
    badge: 'bg-orange-600',
    preview: '🟠',
    textColor: 'text-orange-400',
  },
  {
    slug: 'warm-wood',
    nombre: 'Warm Wood',
    ideal: 'Barberías · Cafés · Restaurantes',
    desc: 'Elegante y cálido. Tonos madera y crema con tipografía serif. Transmite tradición y confianza.',
    bg: 'bg-[#2a1f14]',
    border: 'border-[#8B5E3C]',
    badge: 'bg-[#8B5E3C]',
    preview: '🟤',
    textColor: 'text-[#d4b896]',
  },
  {
    slug: 'clean-white',
    nombre: 'Clean White',
    ideal: 'Estéticas · Consultorios · Servicios',
    desc: 'Minimalista y profesional. Blanco y gris con tipografía refinada. Funciona para cualquier negocio.',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    badge: 'bg-gray-800',
    preview: '⚪',
    textColor: 'text-gray-600',
  },
  {
    slug: 'bold-red',
    nombre: 'Bold Red',
    ideal: 'Taquerías · Comida rápida · Fondas',
    desc: 'Energético y apetitoso. Rojo intenso sobre negro oscuro, tipografía condensada. Llama la atención.',
    bg: 'bg-[#160d0d]',
    border: 'border-red-700',
    badge: 'bg-red-700',
    preview: '🔴',
    textColor: 'text-red-400',
  },
];

export default function PlantillasIndex() {
  return (
    <div className="min-h-screen font-sans bg-[#f3f4ff] text-slate-900 pb-20">

      {/* Header Estilo Gamalink */}
      <div className="border-b border-[#b5c4fb] bg-[#e0e7ff] px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest mb-3 text-[#404a9d]">Gamalink · Catálogo</p>
        <h1 className="text-4xl md:text-5xl font-black text-[#404a9d]">Elige tu Presencia Digital</h1>
        <p className="text-base mt-4 text-[#5a67c5] max-w-xl mx-auto">Selecciona un diseño base y nosotros lo adaptamos a tu negocio.</p>
      </div>

      {/* Grid de Plantillas - Respetando tu estilo original */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLANTILLAS.map((p) => (
          <div key={p.slug} className={`group block rounded-xl border ${p.border} ${p.bg} overflow-hidden hover:scale-[1.02] transition-transform duration-200 shadow-lg`}>

            {/* Preview block original */}
            <Link href={`/plantillas/${p.slug}`}>
              <div className={`h-28 flex items-center justify-center text-5xl ${p.bg} border-b ${p.border} cursor-pointer`}>
                {p.preview}
              </div>
            </Link>

            {/* Info original */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`${p.badge} text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded`}>
                  {p.nombre}
                </span>
              </div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${p.textColor}`}>{p.ideal}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{p.desc}</p>

              {/* Acciones como enlaces de texto (Como los tenías antes) */}
              <div className="mt-4 flex items-center gap-6">
                <Link href={`/plantillas/${p.slug}`} className={`text-xs font-bold uppercase tracking-widest ${p.textColor} hover:underline`}>
                  Ver Demo →
                </Link>
                <a 
                  href={`https://wa.me/524428367627?text=Hola%20Gamalink,%20me%20interesa%20la%20plantilla%20${p.nombre}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-xs font-bold uppercase tracking-widest ${p.textColor} hover:underline`}
                >
                  Seleccionar →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer y Botón Volver */}
      <div className="text-center px-6">
        <Link href="/" className="text-[#5a67c5] hover:text-[#404a9d] font-bold text-sm">
          ← Volver a Gamalink
        </Link>
      </div>

      {/* WhatsApp Flotante */}
      <a 
        href="https://wa.me/524428367627" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}