import { APP_CONFIG } from "@/config/app-config";

import { CheckIcon } from "./Icons";

// El selector Mensual/Anual es CSS puro: dos radios ocultos y `group-has-[...]` muestran un precio u otro.
// Al pasar de oculto a visible, .gl-cambio vuelve a correr su animación.
const MENSUAL_ACTIVO = "group-has-[#periodo-anual:checked]:hidden";
const ANUAL_ACTIVO = "hidden group-has-[#periodo-anual:checked]:inline-block";

function whatsapp(texto: string) {
  return `https://wa.me/${APP_CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
}

type Producto = {
  nombre: string;
  para: string;
  instalacion: string;
  // Meses mínimos a cambio de la instalación gratis (ver términos).
  plazoMinimo?: number;
  mensual: string;
  anual: string;
  totalAnual: string;
  funciones: string[];
  extra: string;
  cta: { texto: string; href: string; externo: boolean };
};

// Pago anual: 12 meses por el precio de 10.
const PRODUCTOS: Producto[] = [
  {
    nombre: "Página Web",
    para: "Para cualquier negocio que quiere aparecer en Google y recibir clientes por WhatsApp.",
    instalacion: "$2,500",
    mensual: "$400",
    anual: "$333",
    totalAnual: "$4,000 al año · ahorras $800",
    funciones: [
      "Diseño de nuestro catálogo, con tus fotos y colores",
      "Tú editas textos e imágenes cuando quieras",
      "Métricas de visitas",
      "Botón directo a tu WhatsApp",
      "Alta en Google Maps",
      "Hospedaje, dominio y SSL incluidos",
    ],
    extra: "Agrega cualquier sistema por +$350/mes.",
    cta: { texto: "Ver plantillas", href: "/plantillas", externo: false },
  },
  {
    nombre: "Membresías",
    para: "Gimnasios, estudios de yoga, box, academias y clubes.",
    instalacion: "$0",
    plazoMinimo: 6,
    mensual: "$900",
    anual: "$750",
    totalAnual: "$9,000 al año · ahorras $1,800",
    funciones: [
      "Socios y planes de membresía",
      "Registro de pagos e ingresos",
      "Quién vence y cuándo",
      "Tus datos en la nube, desde la compu o el celular",
      "Incluye tu Página Web",
    ],
    extra: "Agrega otro sistema por +$350/mes.",
    cta: { texto: "Agendar demo", href: whatsapp("Hola, me interesa el sistema de Membresías"), externo: true },
  },
  {
    nombre: "Citas",
    para: "Barberías, salones, spas, consultorios y talleres.",
    instalacion: "$0",
    plazoMinimo: 6,
    mensual: "$900",
    anual: "$750",
    totalAnual: "$9,000 al año · ahorras $1,800",
    funciones: [
      "Agenda semanal",
      "Servicios con duración y capacidad",
      "Tu horario de atención",
      "Recordatorios por WhatsApp con un clic",
      "Incluye tu Página Web",
    ],
    extra: "Agrega otro sistema por +$350/mes.",
    cta: { texto: "Agendar demo", href: whatsapp("Hola, me interesa el sistema de Citas"), externo: true },
  },
  {
    nombre: "Tienda",
    para: "Abarrotes, papelerías, boutiques y tiendas de barrio.",
    instalacion: "$0",
    plazoMinimo: 3,
    mensual: "$500",
    anual: "$417",
    totalAnual: "$5,000 al año · ahorras $1,000",
    funciones: [
      "Punto de venta",
      "Productos e inventario con historial",
      "Ventas y ganancia del día",
      "Cancelación de ventas",
      "Tus datos en la nube, desde la compu o el celular",
    ],
    extra: "¿Quieres tu Página Web? +$350/mes.",
    cta: { texto: "Agendar demo", href: whatsapp("Hola, me interesa el sistema de Tienda"), externo: true },
  },
];

function Precio({ mensual, anual }: { mensual: string; anual: string }) {
  return (
    <>
      <span className={`gl-cambio inline-block ${MENSUAL_ACTIVO}`}>{mensual}</span>
      <span className={`gl-cambio ${ANUAL_ACTIVO}`}>{anual}</span>
    </>
  );
}

function DetalleAnual({ children }: { children: string }) {
  return (
    <p className="gl-cambio mt-1 hidden text-slate-500 text-sm group-has-[#periodo-anual:checked]:block">{children}</p>
  );
}

function TarjetaProducto({ producto }: { producto: Producto }) {
  const { nombre, para, instalacion, plazoMinimo, mensual, anual, totalAnual, funciones, extra, cta } = producto;
  return (
    <div className="gl-revelar flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <h3 className="font-bold text-2xl text-[#404a9d]">{nombre}</h3>
      <p className="mt-2 min-h-[3rem] text-slate-600 text-sm">{para}</p>

      <div className="mt-6 border-slate-100 border-b pb-5">
        <div className="font-extrabold text-4xl text-[#5a67c5]">
          <Precio mensual={mensual} anual={anual} /> <span className="font-normal text-lg">/mes</span>
        </div>
        <DetalleAnual>{totalAnual}</DetalleAnual>
        <p className="mt-2 font-semibold text-slate-500 text-sm">
          Instalación: {instalacion === "$0" ? "gratis" : `${instalacion} MXN`}
        </p>
        {plazoMinimo && <p className="text-slate-500 text-xs">Plazo mínimo: {plazoMinimo} meses</p>}
      </div>

      <ul className="mt-5 flex-grow space-y-3">
        {funciones.map((item) => (
          <li key={item} className="flex items-start text-sm">
            <CheckIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7686f0]" />
            <span className="ml-3 text-slate-700">{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 font-semibold text-[#5a67c5] text-sm">{extra}</p>

      <a
        href={cta.href}
        {...(cta.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="mt-5 block w-full rounded-xl bg-[#5a67c5] py-3 text-center font-bold text-white shadow-md transition hover:bg-[#404a9d]"
      >
        {cta.texto}
      </a>
    </div>
  );
}

export default function PricingSection() {
  return (
    <section id="precios" className="group bg-[#b5c4fb] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="gl-revelar mb-10 text-center">
          <h2 className="font-bold text-3xl text-[#404a9d] sm:text-4xl">¿Qué necesita tu negocio?</h2>
          <p className="mt-4 text-[#1e293b] text-lg">
            Elige tu sistema: instalación gratis, y Membresías y Citas incluyen tu página web.
            <br />
            <span className="font-semibold text-[#404a9d] text-sm">
              Precios en MXN con IVA incluido, excepto el plan A la Medida (+ IVA).
            </span>
          </p>
        </div>

        <fieldset className="gl-revelar mx-auto mb-12 flex w-fit items-center gap-1 rounded-full bg-white/60 p-1 shadow-sm">
          <legend className="sr-only">Periodo de pago</legend>
          <input type="radio" name="periodo" id="periodo-mensual" defaultChecked className="peer/mensual sr-only" />
          <label
            htmlFor="periodo-mensual"
            className="cursor-pointer rounded-full px-5 py-2 font-bold text-[#404a9d] transition peer-checked/mensual:bg-[#404a9d] peer-checked/mensual:text-white peer-focus-visible/mensual:ring-2 peer-focus-visible/mensual:ring-[#404a9d] peer-focus-visible/mensual:ring-offset-2"
          >
            Mensual
          </label>
          <input type="radio" name="periodo" id="periodo-anual" className="peer/anual sr-only" />
          <label
            htmlFor="periodo-anual"
            className="flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 font-bold text-[#404a9d] transition peer-checked/anual:bg-[#404a9d] peer-checked/anual:text-white peer-focus-visible/anual:ring-2 peer-focus-visible/anual:ring-[#404a9d] peer-focus-visible/anual:ring-offset-2"
          >
            Anual
            <span className="rounded-full bg-[#25D366] px-2 py-0.5 text-white text-xs">2 meses gratis</span>
          </label>
        </fieldset>

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PRODUCTOS.map((producto) => (
            <TarjetaProducto key={producto.nombre} producto={producto} />
          ))}
        </div>

        <div className="gl-revelar mt-10 rounded-2xl bg-white/70 p-6 text-center text-[#1e293b]">
          <p className="font-bold text-[#404a9d] text-lg">¿Necesitas más de uno? Combínalos.</p>
          <p className="mt-1">
            Pagas el sistema de mayor precio y cada sistema extra cuesta <strong>+$350/mes</strong>. Ejemplo: un
            gimnasio que también vende suplementos usa Membresías + Tienda por <strong>$1,250/mes</strong>.
          </p>
        </div>

        <div className="gl-revelar mt-6 flex flex-col items-center justify-between gap-6 rounded-2xl bg-[#404a9d] p-8 text-white md:flex-row">
          <div>
            <h3 className="font-bold text-2xl">A la Medida</h3>
            <p className="mt-1 text-[#e2e8f0]">
              Desarrollo a la medida, varios usuarios con permisos, automatizaciones y soporte prioritario.
            </p>
            <p className="mt-3 font-semibold text-[#b5c4fb]">
              Desde $15,000 MXN de desarrollo + desde <Precio mensual="$1,500" anual="$1,250" />
              /mes, más IVA
            </p>
          </div>
          <a
            href={whatsapp("Hola, necesito cotizar un plan A la Medida")}
            target="_blank"
            rel="noopener noreferrer"
            className="block shrink-0 rounded-xl bg-[#96a8f7] px-8 py-3 font-bold text-[#404a9d] shadow-lg transition hover:bg-white"
          >
            Cotizar proyecto
          </a>
        </div>
      </div>
    </section>
  );
}
