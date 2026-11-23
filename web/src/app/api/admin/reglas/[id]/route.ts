import { prisma } from "@/lib/prisma";
import { requiereSesion } from "@/lib/auth/sesion";
import { ErrorHttp, ruta } from "@/lib/http";
import { ReglaEntrada } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

async function leerId(ctx: Ctx): Promise<number> {
  const n = Number((await ctx.params).id);
  if (!Number.isInteger(n) || n <= 0) throw new ErrorHttp(404, "No existe la regla");
  return n;
}

export const PATCH = ruta(async (req: Request, ctx: Ctx) => {
  await requiereSesion(["ADMIN"]);
  const id = await leerId(ctx);
  const crudo: unknown = await req.json().catch(() => {
    throw new ErrorHttp(400, "El cuerpo debe ser JSON válido");
  });
  const d = ReglaEntrada.partial().parse(crudo);
  // Solo se actualiza lo que vino en el cuerpo (los defaults de Zod no pisan datos).
  const presentes = Object.keys((crudo ?? {}) as Record<string, unknown>);
  const data = Object.fromEntries(Object.entries(d).filter(([k]) => presentes.includes(k)));
  const existe = await prisma.reglaRecomendacion.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existe) throw new ErrorHttp(404, "No existe la regla");
  const r = await prisma.reglaRecomendacion.update({ where: { id }, data });
  return Response.json({
    id: r.id,
    categoria: r.categoria,
    franja: r.franja,
    condicion: r.condicion,
    umbral: r.umbral === null ? null : Number(r.umbral),
    texto: r.texto,
    activa: r.activa,
  });
});

export const DELETE = ruta(async (_req: Request, ctx: Ctx) => {
  await requiereSesion(["ADMIN"]);
  const id = await leerId(ctx);
  const existe = await prisma.reglaRecomendacion.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existe) throw new ErrorHttp(404, "No existe la regla");
  await prisma.reglaRecomendacion.delete({ where: { id } });
  return new Response(null, { status: 204 });
});
