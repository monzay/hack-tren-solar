import { requiereSesion } from "@/lib/auth/sesion";
import { organismoDeRol } from "@/lib/dominio";
import { ErrorHttp, leerJson, ruta } from "@/lib/http";
import { exigirTicketPropio } from "@/lib/operador/tickets";
import { prisma } from "@/lib/prisma";
import { NuevaNotaEntrada, type NotaVista } from "@/lib/schemas";

export const POST = ruta(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const sesion = await requiereSesion(["OPERADOR_SALUD", "OPERADOR_POLICIA"]);
  const organismo = organismoDeRol(sesion.role);
  if (!organismo) throw new ErrorHttp(403, "Sin organismo asignado");
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id <= 0) throw new ErrorHttp(404, "Ticket no encontrado");
  const { texto } = await leerJson(req, NuevaNotaEntrada);

  await exigirTicketPropio(id, organismo);
  const nota = await prisma.notaTicket.create({
    data: { ticketId: id, autorId: sesion.id, texto },
  });
  const vista: NotaVista = {
    id: nota.id,
    texto: nota.texto,
    autor: sesion.nombre,
    createdAt: nota.createdAt.toISOString(),
  };
  return Response.json(vista, { status: 201 });
});
