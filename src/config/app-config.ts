import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Gamalink",
  version: packageJson.version,
  copyright: `© ${currentYear}, Gamalink.`,
  // WhatsApp de Gamalink para que los clientes pidan servicios (con lada 52, sin "+").
  whatsapp: "524428367627",
  // Mismo número, para mostrarlo a personas.
  whatsappVisible: "+52 442 836 7627",
  correo: "gamalieldiaz04@outlook.com",
  meta: {
    title: "Gamalink - Páginas web para tu negocio",
    description:
      "Páginas web, tienda en línea, citas y membresías para tu negocio. Tú enfócate en crecer, Gamalink se encarga de la tecnología.",
  },
};
