"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/sb/supabase_config";

type LandingOption = { id: string; slug: string };
type TrafficSource = { source: string; visits: number };
type AnalyticsSummary = {
  total_views: number;
  unique_visitors: number;
  whatsapp_clicks: number;
  instagram_clicks: number;
  facebook_clicks: number;
  other_interactions: number;
  sources: TrafficSource[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function parseSummary(value: unknown): AnalyticsSummary | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!isRecord(row)) {
    return null;
  }

  let sourceRows: unknown = row.sources;
  if (typeof sourceRows === "string") {
    try {
      sourceRows = JSON.parse(sourceRows) as unknown;
    } catch {
      return null;
    }
  }
  const sources = Array.isArray(sourceRows)
    ? sourceRows.filter(
        (source): source is Record<string, unknown> =>
          isRecord(source) && typeof source.source === "string" && Number.isFinite(Number(source.visits)),
      )
    : [];

  return {
    total_views: numberValue(row.total_views),
    unique_visitors: numberValue(row.unique_visitors),
    whatsapp_clicks: numberValue(row.whatsapp_clicks),
    instagram_clicks: numberValue(row.instagram_clicks),
    facebook_clicks: numberValue(row.facebook_clicks),
    other_interactions: numberValue(row.other_interactions),
    sources: sources.map((source) => ({ source: String(source.source), visits: Number(source.visits) })),
  };
}

const EMPTY_SUMMARY: AnalyticsSummary = {
  total_views: 0,
  unique_visitors: 0,
  whatsapp_clicks: 0,
  instagram_clicks: 0,
  facebook_clicks: 0,
  other_interactions: 0,
  sources: [],
};

export function LandingAnalytics() {
  const [landings, setLandings] = useState<LandingOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<AnalyticsSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadLandings = async () => {
      setLoading(true);
      setErrorMessage("");
      const { data, error } = await supabase
        .from("gl_landings")
        .select("id, slug")
        .order("updated_at", { ascending: false });

      if (cancelled) {
        return;
      }
      if (error) {
        setErrorMessage(`No se pudieron cargar las landing pages. Revisa bd.sql: ${error.message}`);
        setLandings([]);
        setLoading(false);
        return;
      }
      const options = data ?? [];
      setLandings(options);
      setSelectedId((currentId) =>
        options.some((landing) => landing.id === currentId) ? currentId : (options[0]?.id ?? ""),
      );
      setLoading(false);
    };

    void loadLandings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSummary(EMPTY_SUMMARY);
      return;
    }

    let cancelled = false;
    const loadSummary = async () => {
      setLoading(true);
      setErrorMessage("");
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - days);
      const { data, error } = await supabase.rpc("gl_get_landing_analytics", {
        p_landing_id: selectedId,
        p_from: from.toISOString(),
        p_to: to.toISOString(),
      });

      if (cancelled) {
        return;
      }
      if (error) {
        setErrorMessage(
          `No se pudieron cargar las métricas. Revisa las políticas y la función de bd.sql: ${error.message}`,
        );
        setSummary(EMPTY_SUMMARY);
      } else {
        const parsed = parseSummary(data);
        if (!parsed) {
          setErrorMessage("La respuesta de analíticas no tiene el formato esperado.");
          setSummary(EMPTY_SUMMARY);
        } else {
          setSummary(parsed);
        }
      }
      setLoading(false);
    };

    void loadSummary();
    return () => {
      cancelled = true;
    };
  }, [days, selectedId]);

  const metrics = [
    { title: "Visitas totales", value: summary.total_views },
    { title: "Visitantes únicos", value: summary.unique_visitors },
    { title: "Clics a WhatsApp", value: summary.whatsapp_clicks },
    { title: "Clics a Instagram", value: summary.instagram_clicks },
    { title: "Clics a Facebook", value: summary.facebook_clicks },
    { title: "Otras interacciones", value: summary.other_interactions },
  ];

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl">Analíticas de landing pages</h1>
          <p className="text-muted-foreground">
            Visitas únicas se cuentan por identificador anónimo de navegador/dispositivo.
          </p>
        </div>
        <div className="w-full space-y-2 sm:w-64">
          <Label htmlFor="analytics-landing">Landing page</Label>
          <select
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            disabled={landings.length === 0}
            id="analytics-landing"
            onChange={(event) => setSelectedId(event.currentTarget.value)}
            value={selectedId}
          >
            {landings.map((landing) => (
              <option key={landing.id} value={landing.id}>
                {landing.slug}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full space-y-2 sm:w-40">
          <Label htmlFor="analytics-period">Periodo</Label>
          <select
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            id="analytics-period"
            onChange={(event) => setDays(Number(event.currentTarget.value))}
            value={days}
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
        </div>
      </header>

      {errorMessage ? (
        <div
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-destructive text-sm"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {landings.length === 0 && !loading && !errorMessage ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          Crea una landing page en Configuración para empezar a recibir métricas.
        </div>
      ) : null}

      <div aria-busy={loading} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader>
              <CardTitle className="font-normal text-sm">{metric.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl tabular-nums">{loading ? "…" : metric.value.toLocaleString("es-MX")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-normal">Origen de las visitas</CardTitle>
          <p className="text-muted-foreground text-sm">
            Agrega utm_source=instagram o utm_source=whatsapp a tus enlaces para identificar la fuente.
          </p>
        </CardHeader>
        <CardContent>
          {summary.sources.length > 0 ? (
            <ul className="divide-y">
              {summary.sources.map((source) => (
                <li className="flex items-center justify-between gap-4 py-3 text-sm" key={source.source}>
                  <span className="truncate">{source.source}</span>
                  <span className="tabular-nums">{source.visits.toLocaleString("es-MX")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              {loading ? "Cargando fuentes…" : "Todavía no hay visitas en este periodo."}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
