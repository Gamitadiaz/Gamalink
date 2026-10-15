import type { Metadata } from "next";

import Footer from "@/app/(marketing)/components/Footer";
import Navbar from "@/app/(marketing)/components/Navbar";
import PageHeader from "@/app/(marketing)/components/PageHeader";
import PricingSection from "@/app/(marketing)/components/PricingSection";
import WhatsAppButton from "@/app/(marketing)/components/WhatsAppButton";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Planes y precios",
  description:
    "Página web para tu negocio, sistema de membresías para gimnasios, agenda de citas y punto de venta para tiendas. Instalación gratis en los sistemas, desde $500 al mes. Hospedaje, dominio y soporte incluidos.",
  path: "/precios",
});

export default function Precios() {
  return (
    <div className="min-h-screen font-sans text-slate-900 bg-[#f8fafc]">
      <Navbar />
      <PageHeader title="Planes y Precios">
        Sistemas y presencia digital para tu negocio. Tú enfócate en crecer, nosotros nos encargamos de la tecnología.
      </PageHeader>
      <PricingSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
