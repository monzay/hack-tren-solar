import { ruta, leerQuery, ErrorHttp } from "@/lib/http";
import { FiltrosMapa, type ResumenZona } from "@/lib/schemas";
import { tasaPorMil } from "@/lib/geo/agregacion";
import {
  listarBarrios,
  obtenerPuntos,
  rangoAnterior,
  rangoDe,
  variacionPct,
} from "@/lib/estadisticas/consultas";
import { evaluarRecomendaciones } from "@/lib/estadisticas/recomendaciones";

export const dynamic = "force-dynamic";

export const GET = ruta(async (req: Request) => {
  const filtros = leerQuery(req, FiltrosMapa);
  const barrios = await listarBarrios();
  const barrio = filtros.barrioId ? barrios.find((b) => b.id === filtros.barrioId) : null;
  if (filtros.barrioId && !barrio) throw new ErrorHttp(404, "Barrio no encontrado");

  const rango = rangoDe(filtros);
  const [actual, previo, recomendaciones] = await Promise.all([
    obtenerPuntos(filtros, rango),
    obtenerPuntos(filtros, rangoAnterior(rango)),
    evaluarRecomendaciones(barrio?.id ?? null),
  ]);
  const poblacion = barrio ? barrio.poblacion : barrios.reduce((s, b) => s + b.poblacion, 0);

  const resumen: ResumenZona = {
    barrioId: barrio?.id ?? null,
    nombre: barrio?.nombre ?? "San Salvador de Jujuy",
    conteo: actual.length,
    tasaPorMil: tasaPorMil(actual.length, poblacion),
    variacionPct: variacionPct(actual.length, previo.length),
    recomendaciones,
  };
  return Response.json(resumen);
});
