import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORIA_ETIQUETA, FRANJA_ETIQUETA } from "@/lib/dominio";
import type { Recomendacion } from "@/lib/schemas";

export default function Recomendaciones({ datos }: { datos: Recomendacion[] }) {
  if (datos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ninguna regla se cumple para la selección actual.
      </p>
    );
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {datos.map((r) => (
        <li key={r.id} className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Lightbulb className="size-4 text-primary" aria-hidden="true" />
            <Badge variant="secondary">{CATEGORIA_ETIQUETA[r.categoria]}</Badge>
            {r.franja && <Badge variant="outline">{FRANJA_ETIQUETA[r.franja]}</Badge>}
          </div>
          <p className="text-sm font-medium">{r.texto}</p>
          <p className="mt-1 text-sm text-muted-foreground">Motivo: {r.motivo}</p>
        </li>
      ))}
    </ul>
  );
}
