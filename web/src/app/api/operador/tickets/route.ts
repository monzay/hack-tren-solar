import { requiereSesion } from "@/lib/auth/sesion";
import { organismoDeRol } from "@/lib/dominio";
import { ErrorHttp, leerQuery, ruta } from "@/lib/http";
import { listarBandeja } from "@/lib/operador/tickets";
import { FiltrosBandeja } from "@/lib/schemas";

export const GET = ruta(async (req: Request) => {
  const sesion = await requiereSesion(["OPERADOR_SALUD", "OPERADOR_POLICIA"]);
  const organismo = organismoDeRol(sesion.role);
  if (!organismo) throw new ErrorHttp(403, "Sin organismo asignado");
  const filtros = leerQuery(req, FiltrosBandeja);
  return Response.json(await listarBandeja(organismo, filtros));
});
