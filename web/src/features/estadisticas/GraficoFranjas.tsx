"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FRANJAS, FRANJA_ETIQUETA } from "@/lib/dominio";
import type { ConteoFranja } from "@/lib/schemas";

export default function GraficoFranjas({ datos }: { datos: ConteoFranja[] }) {
  const filas = FRANJAS.map((f) => ({
    franja: FRANJA_ETIQUETA[f].split(" (")[0],
    conteo: datos.find((d) => d.franja === f)?.conteo ?? 0,
  }));
  return (
    <div className="h-64 w-full" role="img" aria-label="Hechos por franja horaria">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filas} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
          <XAxis dataKey="franja" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={36} />
          <Tooltip />
          <Bar dataKey="conteo" name="Hechos" fill="#1f6f8b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
