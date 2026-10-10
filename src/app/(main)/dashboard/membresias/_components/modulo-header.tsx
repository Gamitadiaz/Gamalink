import type { EmpresaOpcion } from "@/lib/empresa-actual";

import {
  ModuloHeader as BaseHeader,
  SinEmpresa as BaseSinEmpresa,
  type ModuloTab,
} from "../../_components/modulo/modulo-header";

export { conEmpresa } from "../../_components/modulo/modulo-header";

const TABS: ModuloTab[] = [
  { key: "resumen", label: "Resumen", href: "/dashboard/membresias" },
  { key: "socios", label: "Socios", href: "/dashboard/membresias/socios" },
  { key: "planes", label: "Planes", href: "/dashboard/membresias/planes" },
];

export function ModuloHeader(props: { empresa: EmpresaOpcion; opciones: EmpresaOpcion[]; actual: string }) {
  return <BaseHeader tabs={TABS} titulo="Membresías" {...props} />;
}

export function SinEmpresa() {
  return <BaseSinEmpresa servicio="membresías" titulo="Membresías" />;
}
