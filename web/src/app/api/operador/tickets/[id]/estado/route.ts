import { requiereSesion } from "@/lib/auth/sesion";
import { organismoDeRol } from "@/lib/dominio";
import { ErrorHttp, leerJson, ruta } from "@/lib/http";
import { validarTransicion } from "@/lib/operador/acceso";
import { exigirTicketPropio, obtenerDetalle } from "@/lib/operador/tickets";
import { prisma } from "@/lib/prisma";
import { CambioEstadoEntrada } from "@/lib/schemas";

export const PATCH = ruta(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const sesion = await requiereSesion(["OPERADOR_SALUD", "OPERADOR_POLICIA"]);
  const organismo = organismoDeRol(sesion.role);
  if (!organismo) throw new ErrorHttp(403, "Sin organismo asignado");
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id <= 0) throw new ErrorHttp(404, "Ticket no encontrado");
  const { estado } = await leerJson(req, CambioEstadoEntrada);

  const ticket = await exigirTicketPropio(id, organismo);
  validarTransicion(ticket.estado, estado);

  await prisma.$transaction([
    prisma.ticket.update({ where: { id }, data: { estado } }),
    prisma.historialEstado.create({
      data: { ticketId: id, de: ticket.estado, a: estado, autorId: sesion.id },
    }),
  ]);

  return Response.json(await obtenerDetalle(id, organismo, sesion.id, false));
});
