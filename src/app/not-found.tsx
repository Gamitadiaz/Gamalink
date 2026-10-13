"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center space-y-2 px-4 text-center">
      <h1 className="font-semibold text-2xl">Página no encontrada</h1>
      <p className="text-muted-foreground">La página que buscas no existe o cambió de dirección.</p>
      <Link prefetch={false} replace href="/">
        <Button variant="outline">Ir al inicio</Button>
      </Link>
    </div>
  );
}
