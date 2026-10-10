import type { EmpresaOpcion } from "@/lib/empresa-actual";

import {
  ModuloHeader as BaseHeader,
  SinEmpresa as BaseSinEmpresa,
  type ModuloTab,
} from "../../_components/modulo/modulo-header";

export { conEmpresa } from "../../_components/modulo/modulo-header";

const TABS: ModuloTab[] = [
  { key: "resumen", label: "Resumen", href: "/dashboard/tienda" },
  { key: "vender", label: "Vender", href: "/dashboard/tienda/vender" },
  { key: "productos", label: "Productos", href: "/dashboard/tienda/productos" },
  { key: "ventas", label: "Ventas", href: "/dashboard/tienda/ventas" },
];

export function ModuloHeader(props: { empresa: EmpresaOpcion; opciones: EmpresaOpcion[]; actual: string }) {
  return <BaseHeader tabs={TABS} titulo="Tiendita" {...props} />;
}

export function SinEmpresa() {
  return <BaseSinEmpresa servicio="tiendita" titulo="Tiendita" />;
}
