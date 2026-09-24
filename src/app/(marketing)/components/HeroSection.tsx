import { WHATSAPP_NUMBER } from '@/lib/constants';

export default function HeroSection() {
  return (
    <section className="relative text-white py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-[#404a9d] via-[#5a67c5] to-[#7686f0]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
          Soluciones de Software y <br className="hidden md:block" />
          <span className="text-[#b5c4fb]">Presencia Digital para tu Negocio</span>
        </h1>
        <p className="mt-4 text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-[#f1f5f9]">
          Automatizamos tus procesos y aumentamos tus ventas con tecnología a la medida. Sin complicaciones, orientado a resultados.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#precios"
            className="bg-white px-8 py-3 rounded-full font-bold text-lg transition shadow-lg text-[#404a9d] hover:bg-slate-100"
          >
            Ver Planes
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent border-2 px-8 py-3 rounded-full font-bold text-lg transition border-[#96a8f7] text-white hover:bg-white hover:text-[#404a9d]"
          >
            Hablar con un Asesor
          </a>
        </div>
      </div>
    </section>
  );
}
