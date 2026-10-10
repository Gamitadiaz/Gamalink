import Link from "next/link";

import type { EmpresaOpcion } from "@/lib/empresa-actual";

const TABS = [
  { key: "resumen", label: "Resumen", href: "/dashboard/membresias" },
  { key: "socios", label: "Socios", href: "/dashboard/membresias/socios" },
  { key: "planes", label: "Planes", href: "/dashboard/membresias/planes" },
] as const;

export function conEmpresa(href: string, empresaId: number) {
  return `${href}${href.includes("?") ? "&" : "?"}empresa=${empresaId}`;
}

export function ModuloHeader({
  empresa,
  opciones,
  actual,
}: {
  empresa: EmpresaOpcion;
  opciones: EmpresaOpcion[];
  actual: (typeof TABS)[number]["key"];
}) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-semibold text-2xl">Membresías</h1>
          <p className="text-muted-foreground">{empresa.nombre}</p>
        </div>
        {opciones.length > 1 ? (
          <nav aria-label="Empresa" className="flex flex-wrap gap-1.5">
            {opciones.map((opcion) => (
              <Link
                aria-current={opcion.id === empresa.id ? "true" : undefined}
                className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted aria-[current]:border-primary aria-[current]:bg-primary/10 aria-[current]:text-foreground"
                href={conEmpresa(TABS.find((tab) => tab.key === actual)?.href ?? "/dashboard/membresias", opcion.id)}
                key={opcion.id}
              >
                {opcion.nombre}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
      <nav aria-label="Secciones" className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <Link
            aria-current={tab.key === actual ? "page" : undefined}
            className="-mb-px border-transparent border-b-2 px-3 py-2 text-muted-foreground text-sm transition-colors hover:text-foreground aria-[current]:border-primary aria-[current]:font-medium aria-[current]:text-foreground"
            href={conEmpresa(tab.href, empresa.id)}
            key={tab.key}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SinEmpresa() {
  return (
    <main className="flex flex-col gap-2 p-4 md:p-6">
      <h1 className="font-semibold text-2xl">Membresías</h1>
      <p className="text-muted-foreground">
        Ninguna empresa tiene el servicio de membresías activo. Dalo de alta desde el panel de Empresas.
      </p>
    </main>
  );
}
