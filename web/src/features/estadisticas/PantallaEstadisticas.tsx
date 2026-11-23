"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FUENTE_MAPA } from "@/lib/dominio";
import type {
  BarrioPublico,
  ConteoFranja,
  RankingBarrio,
  Recomendacion,
  TendenciasRespuesta,
} from "@/lib/schemas";
import GraficoFranjas from "./GraficoFranjas";
import GraficoTendencias from "./GraficoTendencias";
import PanelEstado from "./PanelEstado";
import RankingBarrios from "./RankingBarrios";
import Recomendaciones from "./Recomendaciones";
import { useConsulta } from "./useConsulta";

const TODA = "todos";
const SIG = "/estadisticas";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

export default function PantallaEstadisticas() {
  const [barrio, setBarrio] = useState(TODA);
  const q = barrio === TODA ? "" : `barrioId=${barrio}`;

  const barrios = useConsulta<BarrioPublico[]>("/barrios", SIG);
  const tendencias = useConsulta<TendenciasRespuesta>(
    `/estadisticas/tendencias?meses=12${q ? `&${q}` : ""}`,
    SIG,
  );
  const ranking = useConsulta<RankingBarrio[]>("/estadisticas/barrios", SIG);
  const franjas = useConsulta<ConteoFranja[]>(
    `/estadisticas/franjas${q ? `?${q}` : ""}`,
    SIG,
  );
  const recs = useConsulta<Recomendacion[]>(
    `/recomendaciones${q ? `?${q}` : ""}`,
    SIG,
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Estadísticas de la ciudad</h1>
        <p className="text-sm text-muted-foreground">
          San Salvador de Jujuy. Solo datos agregados.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          Los datos son sintéticos, de demostración. Fuente: {FUENTE_MAPA}. Los reportes
          ciudadanos no están verificados.
        </AlertDescription>
      </Alert>

      <div className="flex max-w-sm flex-col gap-2">
        <Label htmlFor="selector-barrio">Barrio</Label>
        <Select value={barrio} onValueChange={setBarrio}>
          <SelectTrigger id="selector-barrio" className="w-full">
            <SelectValue placeholder="Toda la ciudad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODA}>Toda la ciudad</SelectItem>
            {(barrios.datos ?? []).map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Seccion titulo="Tendencia mensual por categoría">
        <PanelEstado
          cargando={tendencias.cargando && !tendencias.datos}
          error={tendencias.error}
          alto="h-80"
        />
        {tendencias.datos && <GraficoTendencias datos={tendencias.datos} />}
      </Seccion>

      <div className="grid gap-6 lg:grid-cols-2">
        <Seccion titulo="Barrios por tasa cada mil habitantes">
          <PanelEstado cargando={ranking.cargando && !ranking.datos} error={ranking.error} />
          {ranking.datos && <RankingBarrios datos={ranking.datos} />}
        </Seccion>
        <Seccion titulo="Distribución por franja horaria">
          <PanelEstado cargando={franjas.cargando && !franjas.datos} error={franjas.error} />
          {franjas.datos && <GraficoFranjas datos={franjas.datos} />}
        </Seccion>
      </div>

      <Seccion titulo="Recomendaciones">
        <PanelEstado cargando={recs.cargando && !recs.datos} error={recs.error} alto="h-24" />
        {recs.datos && <Recomendaciones datos={recs.datos} />}
      </Seccion>
    </div>
  );
}
