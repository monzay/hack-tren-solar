import { ruta, leerQuery } from "@/lib/http";
import { requiereSesion } from "@/lib/auth/sesion";
import { FRANJAS } from "@/lib/dominio";
import { FiltrosMapa, type ConteoFranja } from "@/lib/schemas";
import { obtenerPuntos } from "@/lib/estadisticas/consultas";


export const GET = ruta(async (req: Request) => {
  await requiereSesion(["CIUDADANO", "ANALISTA", "ADMIN"]);
  const filtros = leerQuery(req, FiltrosMapa);
  const puntos = await obtenerPuntos(filtros);
  const respuesta: ConteoFranja[] = FRANJAS.map((franja) => ({
    franja,
    conteo: puntos.filter((p) => p.franja === franja).length,
  }));
  return Response.json(respuesta);
});
