import { APP_CONFIG } from "@/config/app-config";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <a href="/precios" className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#5a67c5]">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="font-bold text-2xl tracking-tight text-[#404a9d]">Gamalink</span>
          </a>
          <div className="flex items-center gap-6">
            {[
              { href: "/precios", label: "Precios" },
              { href: "/plantillas", label: "Plantillas" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hidden md:block text-sm font-bold uppercase tracking-wide text-[#5a67c5] hover:text-[#404a9d] transition-colors"
              >
                {link.label}
              </a>
            ))}
            {/* Discreto a propósito: el botón principal es "Cotizar Proyecto". En celular está en el pie de página. */}
            <a
              href="/login"
              className="hidden md:block text-sm font-medium text-slate-500 hover:text-[#404a9d] transition-colors"
            >
              Acceso clientes
            </a>
            <a
              href={`https://wa.me/${APP_CONFIG.whatsapp}?text=Hola,%20quiero%20cotizar%20un%20proyecto`}
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
