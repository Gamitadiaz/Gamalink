import Link from "next/link";

import type { EmpresaOpcion } from "@/lib/empresa-actual";

export type ModuloTab = { key: string; label: string; href: string };

export function conEmpresa(href: string, empresaId: number) {
  return `${href}${href.includes("?") ? "&" : "?"}empresa=${empresaId}`;
}

// Encabezado común de los módulos: título, selector de empresa (si hay varias) y pestañas.
export function ModuloHeader({
  titulo,
  tabs,
  actual,
  empresa,
  opciones,
}: {
  titulo: string;
  tabs: ModuloTab[];
  actual: string;
  empresa: EmpresaOpcion;
  opciones: EmpresaOpcion[];
}) {
  const hrefActual = tabs.find((tab) => tab.key === actual)?.href ?? tabs[0].href;

  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-semibold text-2xl">{titulo}</h1>
          <p className="text-muted-foreground">{empresa.nombre}</p>
        </div>
        {opciones.length > 1 ? (
          <nav aria-label="Empresa" className="flex flex-wrap gap-1.5">
            {opciones.map((opcion) => (
              <Link
                aria-current={opcion.id === empresa.id ? "true" : undefined}
                className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted aria-[current]:border-primary aria-[current]:bg-primary/10 aria-[current]:text-foreground"
                href={conEmpresa(hrefActual, opcion.id)}
                key={opcion.id}
              >
                {opcion.nombre}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
      <nav aria-label="Secciones" className="scrollbar-none flex gap-1 overflow-x-auto border-b">
        {tabs.map((tab) => (
          <Link
            aria-current={tab.key === actual ? "page" : undefined}
            className="-mb-px shrink-0 border-transparent border-b-2 px-3 py-2 text-muted-foreground text-sm transition-colors hover:text-foreground aria-[current]:border-primary aria-[current]:font-medium aria-[current]:text-foreground"
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

export function SinEmpresa({ titulo, servicio }: { titulo: string; servicio: string }) {
  return (
    <main className="flex flex-col gap-2 p-4 md:p-6">
      <h1 className="font-semibold text-2xl">{titulo}</h1>
      <p className="text-muted-foreground">
        Ninguna empresa tiene el servicio de {servicio} activo. Dalo de alta desde el panel de Empresas.
      </p>
    </main>
  );
}
