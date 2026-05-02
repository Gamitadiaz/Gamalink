import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function GamalinkPage() {
  return (
    <div className="min-h-screen font-sans text-slate-900 bg-[#f8fafc]">
      <Navbar />
      <HeroSection />
      <PricingSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
