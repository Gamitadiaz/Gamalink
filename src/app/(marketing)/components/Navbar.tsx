import { WHATSAPP_NUMBER } from '@/lib/constants';
import ThemeSelector from './ThemeSelector';

export default function Navbar() {
  return (
    <nav className="w-full bg-white dark:bg-zinc-900 shadow-sm sticky top-0 z-50 border-b border-slate-100 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#5a67c5]">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="font-bold text-2xl tracking-tight text-[#404a9d] dark:text-indigo-400">Gamalink</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="/plantillas"
              className="hidden md:block text-sm font-bold uppercase tracking-wide text-[#5a67c5] dark:text-indigo-300 hover:text-[#404a9d] transition-colors"
            >
              Ver Plantillas
            </a>

            {/* AQUÍ ESTÁ EL BOTÓN DE TEMA AGREGADO */}
            <ThemeSelector />

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white px-5 py-2 rounded-full font-medium transition-colors shadow-md bg-[#5a67c5] hover:bg-[#404a9d]"
            >
              Cotizar Proyecto
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}