import type { ReactNode } from "react";

import type { EmpresaOpcion } from "@/lib/empresa-actual";

import {
  ModuloHeader as BaseHeader,
  SinEmpresa as BaseSinEmpresa,
  type ModuloTab,
} from "../../_components/modulo/modulo-header";

export { conEmpresa } from "../../_components/modulo/modulo-header";

const TABS: ModuloTab[] = [
  { key: "agenda", label: "Agenda", href: "/dashboard/citas" },
  { key: "servicios", label: "Servicios", href: "/dashboard/citas/servicios" },
  { key: "horario", label: "Horario", href: "/dashboard/citas/horario" },
];

export function ModuloHeader(props: {
  empresa: EmpresaOpcion;
  opciones: EmpresaOpcion[];
  actual: string;
  acciones?: ReactNode;
}) {
  return <BaseHeader tabs={TABS} titulo="Citas" {...props} />;
}

export function SinEmpresa() {
  return <BaseSinEmpresa servicio="citas" titulo="Citas" />;
}
