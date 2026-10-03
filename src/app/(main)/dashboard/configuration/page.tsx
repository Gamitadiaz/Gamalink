import type { Metadata } from "next";

import { LandingManager } from "./_components/landing-manager";

export const metadata: Metadata = {
  title: "Configuración de landing pages",
  description: "Administra las landing pages, contenido e imágenes de tus empresas.",
};

export default function ConfigurationPage() {
  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <header>
        <h1 className="font-semibold text-2xl">Configuración de landing pages</h1>
        <p className="text-muted-foreground">
          Crea landing pages con las plantillas de Gamalink y edita el contenido sin cambiar su diseño.
        </p>
      </header>
      <LandingManager />
    </main>
  );
}
