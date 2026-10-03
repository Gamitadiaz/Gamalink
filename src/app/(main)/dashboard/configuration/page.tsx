export default function ConfigurationPage() {
  return (
    <main className="flex flex-col gap-4 p-4">
      <header>
        <h1 className="font-semibold text-2xl">Configuración</h1>
        <p className="text-muted-foreground">Administra las preferencias de tu espacio de trabajo.</p>
      </header>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold text-lg">Configuración general</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Las opciones de configuración estarán disponibles próximamente.
        </p>
      </section>
    </main>
  );
}
