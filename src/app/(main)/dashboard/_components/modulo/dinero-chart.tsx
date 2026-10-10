"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatoDinero } from "@/lib/formato";

// Barras de una sola serie de dinero. El título de la tarjeta nombra la serie, así que no lleva leyenda.
// var(--primary) pasa contraste y banda de luminosidad en tema claro y oscuro (validado).
export function DineroChart({ data, serie }: { data: { etiqueta: string; valor: number }[]; serie: string }) {
  const chartConfig = { valor: { label: serie, color: "var(--primary)" } } satisfies ChartConfig;

  return (
    <>
      <ChartContainer className="h-56 w-full" config={chartConfig}>
        <BarChart accessibilityLayer data={data} margin={{ left: 0, right: 8, top: 8 }}>
          <CartesianGrid strokeOpacity={0.5} vertical={false} />
          <XAxis axisLine={false} dataKey="etiqueta" interval="preserveStartEnd" tickLine={false} tickMargin={8} />
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
          <Bar dataKey="valor" fill="var(--color-valor)" maxBarSize={44} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
      {/* Versión en tabla para lectores de pantalla. */}
      <table className="sr-only">
        <caption>{serie}</caption>
        <tbody>
          {data.map((row) => (
            <tr key={row.etiqueta}>
              <th scope="row">{row.etiqueta}</th>
              <td>{formatoDinero(row.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
