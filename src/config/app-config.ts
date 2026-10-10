import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Gamalink",
  version: packageJson.version,
  copyright: `© ${currentYear}, Gamalink.`,
  // WhatsApp de Gamalink para que los clientes pidan servicios (con lada 52, sin "+").
  whatsapp: "524428367627",
  meta: {
    title: "Gamalink: SaaS CRM Dashboard",
    description: "Panel CRM de Gamalink para gestionar clientes, ventas y la operación de tu negocio.",
  },
};
