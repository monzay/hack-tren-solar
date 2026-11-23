import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIA_ETIQUETA, FRANJA_ETIQUETA } from "@/lib/dominio";
import type { ResumenZona } from "@/lib/schemas";

interface Props {
  resumen: ResumenZona | null;
  cargando: boolean;
  error: boolean;
}

function Variacion({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-muted-foreground">Sin dato previo</span>;
  const Icono = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
  return (
    <span className="inline-flex items-center gap-1">
      <Icono className="size-4" aria-hidden="true" />
      {pct > 0 ? "+" : ""}
      {pct.toFixed(1)} %
    </span>
  );
}

export default function PanelZona({ resumen, cargando, error }: Props) {
  if (!resumen) {
    return error ? (
      <p role="alert" className="text-sm text-destructive">
        No pudimos cargar el resumen. Se reintenta automáticamente.
      </p>
    ) : (
      <div className="space-y-2" aria-busy="true">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <section aria-label={`Resumen de ${resumen.nombre}`} aria-busy={cargando} className="space-y-4">
      <h2 className="text-lg font-semibold">{resumen.nombre}</h2>
      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md border p-2">
          <dt className="text-xs text-muted-foreground">Hechos</dt>
          <dd className="text-xl font-semibold">{resumen.conteo}</dd>
        </div>
        <div className="rounded-md border p-2">
          <dt className="text-xs text-muted-foreground">Por 1.000 hab.</dt>
          <dd className="text-xl font-semibold">{resumen.tasaPorMil.toFixed(1)}</dd>
        </div>
        <div className="rounded-md border p-2">
          <dt className="text-xs text-muted-foreground">Variación</dt>
          <dd className="text-sm font-semibold">
            <Variacion pct={resumen.variacionPct} />
          </dd>
        </div>
      </dl>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Recomendaciones</h3>
        {resumen.recomendaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay recomendaciones para esta zona con los filtros elegidos.
          </p>
        ) : (
          <ul className="space-y-2">
            {resumen.recomendaciones.map((r) => (
              <li key={r.id} className="rounded-md border bg-muted/40 p-3 text-sm">
                <p>{r.texto}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {CATEGORIA_ETIQUETA[r.categoria]}
                  {r.franja ? ` · ${FRANJA_ETIQUETA[r.franja]}` : ""}
                </p>
                <p className="mt-1 text-xs">
                  <span className="font-medium">Por qué: </span>
                  {r.motivo}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
