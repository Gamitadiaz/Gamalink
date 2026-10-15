"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Printer } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

// Al imprimir solo sale este contenido, sin menú ni encabezado del panel: se copia como hijo directo
// de <body> con data-imprimir y el CSS de impresión (globals.css) oculta todo lo demás.
// "ticket" es angosto para impresoras de tickets de 58/80 mm; "hoja" es tamaño carta.
export function Imprimible({ tipo, children }: { tipo: "ticket" | "hoja"; children: ReactNode }) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  return (
    <>
      {children}
      {montado
        ? createPortal(
            <div className="hidden print:block" data-imprimir={tipo}>
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function BotonImprimir({ children = "Imprimir" }: { children?: ReactNode }) {
  return (
    <Button onClick={() => window.print()} size="sm" type="button" variant="outline">
      <Printer data-icon="inline-start" />
      {children}
    </Button>
  );
}
