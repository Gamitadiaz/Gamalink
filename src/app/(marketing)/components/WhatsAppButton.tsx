import { WhatsAppIcon } from "./Icons";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/44222222222?text=Hola,%20quiero%20cotizar%20un%20proyecto"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
      aria-label="Contactar por WhatsApp"
    >
      <WhatsAppIcon className="w-8 h-8" />
    </a>
  );
}
