import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RankingBarrio } from "@/lib/schemas";

function variacion(v: number | null) {
  if (v === null) return "s/d";
  return `${v > 0 ? "+" : ""}${v.toFixed(0)} %`;
}

export default function RankingBarrios({ datos }: { datos: RankingBarrio[] }) {
  if (datos.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin datos para el período.</p>;
  }
  const max = Math.max(...datos.map((d) => d.tasaPorMil), 0.0001);
  return (
    <div className="max-h-[32rem] overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Barrio</TableHead>
            <TableHead className="min-w-40">Tasa por mil hab.</TableHead>
            <TableHead className="text-right">Hechos</TableHead>
            <TableHead className="text-right">Variación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {datos.map((b, i) => (
            <TableRow key={b.barrioId}>
              <TableCell>{i + 1}</TableCell>
              <TableCell className="font-medium">{b.nombre}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded bg-muted" aria-hidden="true">
                    <div
                      className="h-2 rounded bg-primary"
                      style={{ width: `${Math.max(2, (b.tasaPorMil / max) * 100)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right tabular-nums">
                    {b.tasaPorMil.toFixed(1)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">{b.conteo}</TableCell>
              <TableCell className="text-right tabular-nums">
                {variacion(b.variacionPct)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
