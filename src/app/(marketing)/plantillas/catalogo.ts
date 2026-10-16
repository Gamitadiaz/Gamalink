import type { LandingTemplateKey } from "@/lib/landings/model";

// Catálogo público de plantillas: lo usan /plantillas y el título de cada demo.
// La captura de cada una vive en public/img/plantillas/<slug>.png.
export const PLANTILLAS: {
  slug: LandingTemplateKey;
  nombre: string;
  ideal: string;
  desc: string;
  acento: string;
}[] = [
  {
    slug: "dark-purple",
    nombre: "Dark Purple",
    ideal: "Gimnasios · Fitness · Tech",
    desc: "Estilo espacial y tecnológico. Gradientes de azul a morado, perfecto para negocios de alto impacto.",
    acento: "bg-purple-600",
  },
  {
    slug: "orange-industrial",
    nombre: "Orange Industrial",
    ideal: "Talleres · Autos · Refaccionarias",
    desc: "Industrial y directo. Naranja sobre negro, tipografía bold. Para negocios que transmiten fuerza y confianza.",
    acento: "bg-orange-600",
  },
  {
    slug: "warm-wood",
    nombre: "Warm Wood",
    ideal: "Barberías · Cafés · Restaurantes",
    desc: "Elegante y cálido. Tonos madera y crema con tipografía serif. Transmite tradición y confianza.",
    acento: "bg-[#8B5E3C]",
  },
  {
    slug: "clean-white",
    nombre: "Clean White",
    ideal: "Estéticas · Consultorios · Servicios",
    desc: "Minimalista y profesional. Blanco y gris con tipografía refinada. Funciona para cualquier negocio.",
    acento: "bg-gray-800",
  },
  {
    slug: "bold-red",
    nombre: "Bold Red",
    ideal: "Taquerías · Comida rápida · Fondas",
    desc: "Energético y apetitoso. Rojo intenso sobre negro oscuro, tipografía condensada. Llama la atención.",
    acento: "bg-red-700",
  },
];

export function getPlantilla(slug: LandingTemplateKey) {
  const plantilla = PLANTILLAS.find((p) => p.slug === slug);
  if (!plantilla) {
    throw new Error(`La plantilla ${slug} no está en el catálogo.`);
  }
  return plantilla;
}
