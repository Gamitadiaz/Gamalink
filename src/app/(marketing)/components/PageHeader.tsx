import type { ReactNode } from "react";

// Encabezado con el degradado de Gamalink que comparten las páginas públicas.
export default function PageHeader({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="py-16 text-center bg-gradient-to-br from-[#404a9d] via-[#5a67c5] to-[#7686f0]">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight px-4">{title}</h1>
      <p className="mt-4 text-lg text-[#b5c4fb] max-w-2xl mx-auto px-4">{children}</p>
    </div>
  );
}
