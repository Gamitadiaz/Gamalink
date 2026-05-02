import Navbar from '@/components/Navbar';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function Precios() {
  return (
    <div className="min-h-screen font-sans text-slate-900 bg-[#f8fafc]">
      <Navbar />

      <div className="py-16 text-center bg-gradient-to-br from-[#404a9d] via-[#5a67c5] to-[#7686f0]">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Planes y Precios
        </h1>
        <p className="mt-4 text-lg text-[#b5c4fb] max-w-2xl mx-auto px-4">
          Sistemas y presencia digital para tu negocio. Tú enfócate en crecer, yo me encargo de la tecnología.
        </p>
      </div>

      <PricingSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
