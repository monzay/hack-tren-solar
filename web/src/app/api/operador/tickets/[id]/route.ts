import { requiereSesion } from "@/lib/auth/sesion";
import { organismoDeRol } from "@/lib/dominio";
import { ErrorHttp, ruta } from "@/lib/http";
import { obtenerDetalle } from "@/lib/operador/tickets";

export const GET = ruta(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const sesion = await requiereSesion(["OPERADOR_SALUD", "OPERADOR_POLICIA"]);
  const organismo = organismoDeRol(sesion.role);
  if (!organismo) throw new ErrorHttp(403, "Sin organismo asignado");
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id <= 0) throw new ErrorHttp(404, "Ticket no encontrado");
  return Response.json(await obtenerDetalle(id, organismo, sesion.id, true));
});
