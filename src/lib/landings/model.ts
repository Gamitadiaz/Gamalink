export const TEMPLATE_OPTIONS = [
  { key: "bold-red", label: "Bold Red" },
  { key: "clean-white", label: "Clean White" },
  { key: "dark-purple", label: "Dark Purple" },
  { key: "orange-industrial", label: "Orange Industrial" },
  { key: "warm-wood", label: "Warm Wood" },
] as const;

export type LandingTemplateKey = (typeof TEMPLATE_OPTIONS)[number]["key"];

type BusinessBase = {
  nombre: string;
  tipo: string;
  whatsapp: string;
  direccion: string;
  maps_embed: string;
  horarios: { dia: string; hora: string }[];
  imagenes: string[];
};

export type LandingContentByTemplate = {
  "bold-red": BusinessBase & {
    slogan: string;
    descripcion: string;
    facebook: string;
    telefono: string;
    menu: { categoria: string; items: { nombre: string; precio: string }[] }[];
  };
  "clean-white": BusinessBase & {
    slogan: string;
    descripcion: string;
    instagram: string;
    telefono: string;
    servicios: { icono: string; nombre: string; precio: string; desc: string }[];
  };
  "dark-purple": BusinessBase & {
    slogan: string;
    subtitulo: string;
    instagram: string;
    servicios: { emoji: string; nombre: string; desc: string; color: string }[];
    precios: { nombre: string; precio: string; badge: string | null; especial: boolean }[];
    inscripcion: string;
    precio_estudiante: string;
    precio_tercera_edad: string;
  };
  "orange-industrial": BusinessBase & {
    ciudad: string;
    slogan: string;
    slogan2: string;
    descripcion: string;
    zonas: { nombre: string; items: string[] }[];
    precio_banner: string;
    precio_sub: string;
  };
  "warm-wood": BusinessBase & {
    slogan: string;
    descripcion: string;
    instagram: string;
    servicios: { nombre: string; precio: string; desc: string }[];
  };
};

export type LandingContent = LandingContentByTemplate[LandingTemplateKey];

export const DEFAULT_LANDING_CONTENT: LandingContentByTemplate = {
  "bold-red": {
    nombre: "Taquería El Padrino",
    tipo: "Tacos & Antojitos",
    slogan: "El sabor que no se olvida",
    descripcion:
      "Desde 1998 sirviendo los mejores tacos al pastor, birria y antojitos del barrio. Sazón de abuela, trato de familia.",
    whatsapp: "524428367627",
    facebook: "taqueriaelpadrino",
    telefono: "442 200 0000",
    direccion: "Calle Corregidora 22, El Pueblito, Qro.",
    maps_embed: "https://maps.google.com/maps?q=queretaro&output=embed",
    horarios: [
      { dia: "Martes a Domingo", hora: "8:00 am – 11:00 pm" },
      { dia: "Lunes", hora: "Cerrado" },
    ],
    menu: [
      {
        categoria: "Tacos",
        items: [
          { nombre: "Al Pastor", precio: "$18" },
          { nombre: "Bistec", precio: "$20" },
          { nombre: "Suadero", precio: "$20" },
          { nombre: "Campechano", precio: "$22" },
          { nombre: "De Canasta", precio: "$12" },
        ],
      },
      {
        categoria: "Birria",
        items: [
          { nombre: "Taco de Birria", precio: "$25" },
          { nombre: "Consomé chico", precio: "$30" },
          { nombre: "Orden de Birria", precio: "$80" },
        ],
      },
      {
        categoria: "Antojitos",
        items: [
          { nombre: "Quesadilla", precio: "$35" },
          { nombre: "Huarache", precio: "$55" },
          { nombre: "Sope", precio: "$30" },
          { nombre: "Tlayuda", precio: "$65" },
        ],
      },
    ],
    imagenes: [],
  },
  "clean-white": {
    nombre: "Studio Blanc",
    tipo: "Estética & Bienestar",
    slogan: "Belleza que habla por sí sola",
    descripcion:
      "Un espacio dedicado a realzar tu mejor versión. Servicios profesionales en un ambiente tranquilo y sofisticado.",
    whatsapp: "52442836727",
    instagram: "studioblanc",
    telefono: "442 100 0000",
    direccion: "Av. Constituyentes 88, Querétaro",
    maps_embed: "https://maps.google.com/maps?q=queretaro&output=embed",
    horarios: [
      { dia: "Lunes a Viernes", hora: "9:00 – 19:00" },
      { dia: "Sábado", hora: "9:00 – 15:00" },
      { dia: "Domingo", hora: "Cerrado" },
    ],
    servicios: [
      {
        icono: "✦",
        nombre: "Corte & Peinado",
        precio: "Desde $200",
        desc: "Corte personalizado y secado con productos premium.",
      },
      {
        icono: "✦",
        nombre: "Color & Mechas",
        precio: "Desde $350",
        desc: "Técnicas modernas para resultados naturales o atrevidos.",
      },
      {
        icono: "✦",
        nombre: "Tratamientos",
        precio: "Desde $250",
        desc: "Keratina, hidratación y reconstrucción capilar.",
      },
      {
        icono: "✦",
        nombre: "Maquillaje",
        precio: "Desde $400",
        desc: "Social, editorial y nupcial con productos de alta gama.",
      },
      { icono: "✦", nombre: "Uñas", precio: "Desde $150", desc: "Manicure, pedicure y nail art." },
      { icono: "✦", nombre: "Cejas & Pestañas", precio: "Desde $120", desc: "Diseño, tinte y extensiones." },
    ],
    imagenes: [],
  },
  "dark-purple": {
    nombre: "Pulsar Forge Gym",
    tipo: "Gimnasio & Fitness",
    slogan: "Forja tu cuerpo",
    subtitulo: "Pesas, cardio y entrenamiento funcional en el mejor ambiente.",
    whatsapp: "524421103306",
    instagram: "pulsarforgegym",
    direccion: "Río Nilo 3-Bodega 4, 76922 Arroyo Hondo, Qro.",
    maps_embed: "https://maps.google.com/maps?q=Arroyo+Hondo+Queretaro&output=embed",
    horarios: [
      { dia: "Lunes a Viernes", hora: "6:00 am – 10:30 pm" },
      { dia: "Sábado", hora: "7:00 am – 2:00 pm" },
      { dia: "Domingo", hora: "8:00 am – 1:00 pm" },
    ],
    servicios: [
      {
        emoji: "🏋️‍♂️",
        nombre: "Pesas y Cardio",
        desc: "Máquinas modernas y zona de peso libre para hipertrofia y resistencia.",
        color: "hover:border-purple-500",
      },
      {
        emoji: "🥊",
        nombre: "Funcional Box y GAP",
        desc: "Entrenamientos dinámicos de alta intensidad para quemar grasa y tonificar.",
        color: "hover:border-blue-500",
      },
      {
        emoji: "💃",
        nombre: "Baile Fitness & Jumping",
        desc: "Clases llenas de energía para mejorar tu coordinación y ritmo cardiovascular.",
        color: "hover:border-pink-500",
      },
    ],
    precios: [
      { nombre: "Visita", precio: "$100", badge: null, especial: false },
      { nombre: "Mensualidad", precio: "$590", badge: "Popular", especial: false },
      { nombre: "Bimestral", precio: "$1,150", badge: null, especial: false },
      { nombre: "Trimestral", precio: "$1,590", badge: null, especial: false },
      { nombre: "Semestral", precio: "$3,000", badge: null, especial: false },
      { nombre: "Anualidad", precio: "$5,700", badge: null, especial: false },
    ],
    inscripcion: "$150 MXN",
    precio_estudiante: "$490",
    precio_tercera_edad: "$490",
    imagenes: [],
  },
  "orange-industrial": {
    nombre: "X GYM Fitness",
    tipo: "Gimnasio Industrial",
    ciudad: "Huimilpan, Qro.",
    slogan: "Fuerza Bruta.",
    slogan2: "Cero Excusas.",
    descripcion:
      "Equipamiento de alto rendimiento, peso libre y el mejor ambiente de entrenamiento en una nave industrial diseñada para forjar resultados.",
    whatsapp: "524428367627",
    direccion: "Francisco I. Madero Nte. 186, 76950 Huimilpan, Qro.",
    maps_embed: "https://maps.google.com/maps?q=Huimilpan+Queretaro&output=embed",
    horarios: [
      { dia: "Lunes a Viernes", hora: "6:00 am – 10:00 pm" },
      { dia: "Sábado", hora: "7:00 am – 3:00 pm" },
      { dia: "Domingo", hora: "8:00 am – 1:00 pm" },
    ],
    zonas: [
      {
        nombre: "Planta Baja",
        items: [
          "Amplia zona de peso libre",
          "Aparatos de placa para hipertrofia",
          "Estructuras sólidas tipo industrial",
          "Espacio abierto y ventilado",
        ],
      },
      {
        nombre: "Mezzanine Cardio",
        items: [
          "Zona elevada exclusiva para cardio",
          "Caminadoras y elípticas",
          "Bicicletas estáticas",
          "Vista panorámica al área de pesas",
        ],
      },
    ],
    precio_banner: "Pregunta por nuestras membresías accesibles",
    precio_sub: "Sin inscripciones forzosas · Planes desde $400/mes",
    imagenes: [],
  },
  "warm-wood": {
    nombre: "La Navaja & Co.",
    tipo: "Barbería de Autor",
    slogan: "El corte perfecto no es casualidad",
    descripcion: "Tradición barbera con técnica contemporánea. Cada servicio es una experiencia, cada corte una obra.",
    whatsapp: "4428367627",
    instagram: "lanajabarber",
    direccion: "Andador Hidalgo 14, Centro, Querétaro",
    maps_embed: "https://maps.google.com/maps?q=queretaro&output=embed",
    horarios: [
      { dia: "Lunes a Viernes", hora: "9:00 am – 8:00 pm" },
      { dia: "Sábado", hora: "9:00 am – 6:00 pm" },
      { dia: "Domingo", hora: "Cerrado" },
    ],
    servicios: [
      { nombre: "Corte Clásico", precio: "$120", desc: "Tijera o máquina con acabado premium." },
      { nombre: "Corte + Barba", precio: "$180", desc: "Diseño completo con navaja y toalla caliente." },
      { nombre: "Afeitado con Navaja", precio: "$100", desc: "Ritual tradicional con espuma artesanal." },
      { nombre: "Tinte o Decoloración", precio: "$250+", desc: "Desde tonos naturales hasta estilos atrevidos." },
      { nombre: "Corte Infantil", precio: "$80", desc: "Para los pequeños de la casa." },
      { nombre: "Tratamiento Capilar", precio: "$150", desc: "Hidratación y fortalecimiento profundo." },
    ],
    imagenes: [],
  },
};

export type LandingRow = {
  id: string;
  empresa_id: number;
  template_key: LandingTemplateKey;
  slug: string;
  custom_domain: string | null;
  status: "draft" | "published" | "archived";
  content: unknown;
  created_at: string;
  updated_at: string;
};

function matchesShape(defaultValue: unknown, candidate: unknown, key = "", depth = 0): boolean {
  if (depth > 8) {
    return false;
  }

  if (key === "imagenes") {
    return (
      Array.isArray(candidate) &&
      candidate.length <= 5 &&
      candidate.every(
        (url) =>
          typeof url === "string" &&
          url.length <= 2048 &&
          (() => {
            try {
              return ["http:", "https:"].includes(new URL(url).protocol);
            } catch {
              return false;
            }
          })(),
      )
    );
  }

  if (Array.isArray(defaultValue)) {
    return (
      Array.isArray(candidate) &&
      candidate.length <= 50 &&
      (defaultValue.length === 0 || candidate.every((item) => matchesShape(defaultValue[0], item, "", depth + 1)))
    );
  }

  if (defaultValue !== null && typeof defaultValue === "object") {
    if (candidate === null || typeof candidate !== "object" || Array.isArray(candidate)) {
      return false;
    }
    const expected = Object.keys(defaultValue);
    const received = Object.keys(candidate);
    return (
      expected.length === received.length &&
      expected.every(
        (property) =>
          Object.hasOwn(candidate, property) &&
          matchesShape(
            (defaultValue as Record<string, unknown>)[property],
            (candidate as Record<string, unknown>)[property],
            property,
            depth + 1,
          ),
      )
    );
  }

  if (defaultValue === null) {
    return candidate === null || typeof candidate === "string";
  }
  if (typeof defaultValue === "string") {
    return typeof candidate === "string" && candidate.length <= 5000;
  }
  if (typeof defaultValue === "boolean") {
    return typeof candidate === "boolean";
  }
  return typeof defaultValue === "number" && typeof candidate === "number" && Number.isFinite(candidate);
}

export function isLandingTemplateKey(value: unknown): value is LandingTemplateKey {
  return typeof value === "string" && TEMPLATE_OPTIONS.some((template) => template.key === value);
}

export function isLandingContent<K extends LandingTemplateKey>(
  template: K,
  value: unknown,
): value is LandingContentByTemplate[K] {
  return matchesShape(DEFAULT_LANDING_CONTENT[template], value);
}

export function cloneDefaultContent<K extends LandingTemplateKey>(template: K): LandingContentByTemplate[K] {
  return structuredClone(DEFAULT_LANDING_CONTENT[template]);
}
