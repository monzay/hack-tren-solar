import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORIA_ETIQUETA, ORGANISMO_ETIQUETA } from "@/lib/dominio";
import { CRITERIOS_EMISION } from "@/lib/informes/periodicidad";
import type { CandidatoEnObservacion } from "./useInformesSimulados";

export default function ListaObservacion({ datos }: { datos: CandidatoEnObservacion[] }) {
  if (datos.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay recomendaciones en observación.</p>;
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {datos.map((c) => {
        const avance = Math.min(100, Math.round((c.senal.hechos / CRITERIOS_EMISION.minHechos) * 100));
        return (
          <li key={c.id} className="space-y-2 rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Eye className="size-4 text-muted-foreground" aria-hidden="true" />
              <Badge variant="secondary">{CATEGORIA_ETIQUETA[c.categoria]}</Badge>
              <Badge variant="outline">{c.zona}</Badge>
              <span className="text-xs text-muted-foreground">→ {ORGANISMO_ETIQUETA[c.organismo]}</span>
            </div>
            <p className="text-sm font-medium">{c.recomendacion}</p>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Hechos que respaldan la recomendación"
              aria-valuemin={0}
              aria-valuemax={CRITERIOS_EMISION.minHechos}
              aria-valuenow={Math.min(c.senal.hechos, CRITERIOS_EMISION.minHechos)}
            >
              <div className="h-full bg-primary" style={{ width: `${avance}%` }} />
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {c.decision.faltan.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
