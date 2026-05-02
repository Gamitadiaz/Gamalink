import { MailIcon, WhatsAppIcon } from './Icons';
import { WHATSAPP_NUMBER, CONTACT_EMAIL } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#5a67c5]">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">Gamalink</span>
          </div>
          <p className="text-slate-400 max-w-sm">
            Transformamos la forma en que operan los negocios mediante desarrollo de software estratégico y presencia digital de alto impacto.
          </p>
        </div>
        <div className="md:text-right flex flex-col md:items-end justify-center">
          <h4 className="text-white font-bold text-lg mb-4">Contacto Directo</h4>
          <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 hover:text-white transition mb-2">
            <MailIcon className="w-5 h-5 text-[#b5c4fb]" />
            {CONTACT_EMAIL}
          </a>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition text-[#96a8f7]">
            <WhatsAppIcon className="w-5 h-5" />
            +52 442 836 7627
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Gamalink. Todos los derechos reservados.</p>
        <p>Los precios mostrados incluyen impuestos aplicables.</p>
      </div>
    </footer>
  );
}
