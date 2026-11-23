import { prisma } from "@/lib/prisma";
import { requiereSesion } from "@/lib/auth/sesion";
import { ErrorHttp, ruta } from "@/lib/http";

/**
 * Supresión física a pedido de la persona (Ley 25.326, art. 16).
 * La cascada borra contacto, notas, historial, derivaciones y accesos.
 */
export const DELETE = ruta(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requiereSesion(["ADMIN"]);
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id <= 0) throw new ErrorHttp(404, "No existe el ticket");
  const existe = await prisma.ticket.findUnique({ where: { id }, select: { id: true } });
  if (!existe) throw new ErrorHttp(404, "No existe el ticket");
  await prisma.ticket.delete({ where: { id } });
  return new Response(null, { status: 204 });
});
