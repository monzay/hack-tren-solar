import { ruta, leerQuery } from "@/lib/http";
import { requiereSesion } from "@/lib/auth/sesion";
import { tasaPorMil } from "@/lib/geo/agregacion";
import { FiltrosMapa, type RankingBarrio } from "@/lib/schemas";
import {
  listarBarrios,
  obtenerPuntos,
  rangoAnterior,
  rangoDe,
  variacionPct,
} from "@/lib/estadisticas/consultas";


function contar(ps: { barrioId: number }[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const p of ps) m.set(p.barrioId, (m.get(p.barrioId) ?? 0) + 1);
  return m;
}

// Ranking de todos los barrios por tasa (desc). Solo agregados.
export const GET = ruta(async (req: Request) => {
  await requiereSesion(["CIUDADANO", "ANALISTA", "ADMIN"]);
  const filtros = { ...leerQuery(req, FiltrosMapa), barrioId: undefined };
  const rango = rangoDe(filtros);
  const [barrios, actual, previo] = await Promise.all([
    listarBarrios(),
    obtenerPuntos(filtros, rango),
    obtenerPuntos(filtros, rangoAnterior(rango)),
  ]);
  const a = contar(actual);
  const p = contar(previo);

  const ranking: RankingBarrio[] = barrios
    .map((b) => {
      const conteo = a.get(b.id) ?? 0;
      return {
        barrioId: b.id,
        nombre: b.nombre,
        conteo,
        tasaPorMil: tasaPorMil(conteo, b.poblacion),
        variacionPct: variacionPct(conteo, p.get(b.id) ?? 0),
      };
    })
    .sort((x, y) => y.tasaPorMil - x.tasaPorMil || y.conteo - x.conteo);
  return Response.json(ranking);
});
