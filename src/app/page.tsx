import Navbar from '@/app/(marketing)/components/Navbar';
import HeroSection from '@/app/(marketing)/components/HeroSection';
import PricingSection from '@/app/(marketing)/components/PricingSection';
import Footer from '@/app/(marketing)/components/Footer';
import WhatsAppButton from '@/app/(marketing)/components/WhatsAppButton';

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
