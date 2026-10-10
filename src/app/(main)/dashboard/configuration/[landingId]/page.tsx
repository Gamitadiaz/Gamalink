import type { Metadata } from "next";

import { LandingEditor } from "../_components/landing-editor";

export const metadata: Metadata = {
  title: "Editar landing page",
};

export default async function EditLandingPage({ params }: { params: Promise<{ landingId: string }> }) {
  const { landingId } = await params;

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <LandingEditor landingId={landingId} />
    </main>
  );
}
