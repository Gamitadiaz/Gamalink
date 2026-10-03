import type { Metadata } from "next";

import { LandingAnalytics } from "./_components/landing-analytics";

export const metadata: Metadata = {
  title: "Analíticas de landing pages",
  description: "Revisa visitas, visitantes únicos e interacciones por landing page.",
};

export default function LandingAnalyticsPage() {
  return <LandingAnalytics />;
}
