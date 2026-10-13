import Image from "next/image";
import Link from "next/link";

import type { Metadata } from "next";

import Footer from "@/app/(marketing)/components/Footer";
import Navbar from "@/app/(marketing)/components/Navbar";
import PageHeader from "@/app/(marketing)/components/PageHeader";
import WhatsAppButton from "@/app/(marketing)/components/WhatsAppButton";
import { APP_CONFIG } from "@/config/app-config";
import { pageMetadata } from "@/lib/seo";

import { PLANTILLAS } from "./catalogo";

export const metadata: Metadata = pageMetadata({
  title: "Plantillas de páginas web",
  description:
    "Elige el diseño de tu página web: plantillas para gimnasios, barberías, cafés, consultorios, taquerías y más. Nosotros la adaptamos a tu negocio.",
  path: "/plantillas",
});

export default function PlantillasIndex() {
  return (
    <div className="min-h-screen font-sans text-slate-900 bg-[#f8fafc]">
      <Navbar />
      <PageHeader title="Catálogo de Plantillas">
        Elige la que mejor represente a tu negocio y nosotros la adaptamos con tu información, fotos y colores.
      </PageHeader>

      <section className="py-20 bg-[#b5c4fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {PLANTILLAS.map((p) => (
            <article
              key={p.slug}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition hover:shadow-xl hover:-translate-y-1"
            >
              <Link href={`/plantillas/${p.slug}`} className="block border-b border-slate-100">
                <Image
                  src={`/img/plantillas/${p.slug}.png`}
                  alt={`Vista previa de la plantilla ${p.nombre}`}
                  width={1280}
                  height={800}
                  sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                  className="w-full h-auto"
                />
              </Link>
              <div className="p-6 flex flex-col flex-grow">
                <span
                  className={`${p.acento} self-start text-white text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded`}
                >
                  {p.nombre}
                </span>
                <p className="mt-3 text-sm font-semibold text-[#5a67c5]">{p.ideal}</p>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-grow">{p.desc}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Link
                    href={`/plantillas/${p.slug}`}
                    className="text-center font-bold py-3 rounded-xl transition border-2 border-[#b5c4fb] bg-[#f8fafc] text-[#5a67c5] hover:bg-[#b5c4fb] hover:text-[#404a9d]"
                  >
                    Ver demo
                  </Link>
                  <a
                    href={`https://wa.me/${APP_CONFIG.whatsapp}?text=${encodeURIComponent(`Hola Gamalink, me interesa la plantilla ${p.nombre}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center font-bold py-3 rounded-xl transition shadow-md bg-[#5a67c5] text-white hover:bg-[#404a9d]"
                  >
                    La quiero
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
