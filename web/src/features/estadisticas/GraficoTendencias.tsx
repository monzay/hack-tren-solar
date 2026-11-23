"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORIA_ETIQUETA } from "@/lib/dominio";
import type { TendenciasRespuesta } from "@/lib/schemas";

const COLORES = [
  "#1f6f8b",
  "#d9341d",
  "#7a4fb5",
  "#e08a1e",
  "#2e9e4f",
  "#b0306b",
  "#5a6b7b",
  "#8a6d1f",
  "#0f9d9a",
];

function mesCorto(m: string) {
  const [anio, mes] = m.split("-");
  return mes && anio ? `${mes}/${anio.slice(2)}` : m;
}

export default function GraficoTendencias({ datos }: { datos: TendenciasRespuesta }) {
  const filas = datos.meses.map((mes, i) => {
    const fila: Record<string, string | number> = { mes: mesCorto(mes) };
    for (const s of datos.series) fila[s.categoria] = s.valores[i] ?? 0;
    return fila;
  });

  return (
    <div
      className="h-80 w-full"
      role="img"
      aria-label="Tendencia mensual de hechos por categoría"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filas} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
          <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={36} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {datos.series.map((s, i) => (
            <Line
              key={s.categoria}
              type="monotone"
              dataKey={s.categoria}
              name={CATEGORIA_ETIQUETA[s.categoria]}
              stroke={COLORES[i % COLORES.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
