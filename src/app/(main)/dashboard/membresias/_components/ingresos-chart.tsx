"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatoDinero } from "@/lib/membresias";

// Una sola serie: el título de la tarjeta la nombra, así que no lleva leyenda.
// var(--primary) pasa contraste y banda de luminosidad en tema claro y oscuro.
const chartConfig = {
  ingresos: { label: "Ingresos", color: "var(--primary)" },
} satisfies ChartConfig;

export function IngresosChart({ data }: { data: { mes: string; ingresos: number }[] }) {
  return (
    <>
      <ChartContainer className="h-56 w-full" config={chartConfig}>
        <BarChart accessibilityLayer data={data} margin={{ left: 0, right: 8, top: 8 }}>
          <CartesianGrid strokeOpacity={0.5} vertical={false} />
          <XAxis axisLine={false} dataKey="mes" tickLine={false} tickMargin={8} />
          <YAxis
            axisLine={false}
            tickFormatter={(value: number) => (value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${value}`)}
            tickLine={false}
            width={48}
          />
          <ChartTooltip
            content={<ChartTooltipContent formatter={(value) => formatoDinero(Number(value))} hideIndicator />}
            cursor={{ fillOpacity: 0.4 }}
          />
          <Bar dataKey="ingresos" fill="var(--color-ingresos)" maxBarSize={44} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
      {/* Versión en tabla para lectores de pantalla. */}
      <table className="sr-only">
        <caption>Ingresos por mes</caption>
        <tbody>
          {data.map((row) => (
            <tr key={row.mes}>
              <th scope="row">{row.mes}</th>
              <td>{formatoDinero(row.ingresos)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
