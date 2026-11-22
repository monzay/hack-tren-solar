import { ruta, leerQuery } from "@/lib/http";
import { FiltrosMapa } from "@/lib/schemas";
import { armarCalor } from "@/lib/estadisticas/calor";
import { obtenerPuntos } from "@/lib/estadisticas/consultas";


// Público. Solo centros de celda de ~100 m; nunca coordenadas exactas.
export const GET = ruta(async (req: Request) => {
  const filtros = leerQuery(req, FiltrosMapa);
  const puntos = await obtenerPuntos(filtros);
  const minCount = Math.max(1, Number(process.env.MIN_COUNT) || 1);
  return Response.json(armarCalor(puntos, minCount));
});
