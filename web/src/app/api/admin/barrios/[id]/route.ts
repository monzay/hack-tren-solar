import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requiereSesion } from "@/lib/auth/sesion";
import { ErrorHttp, leerJson, ruta } from "@/lib/http";
import { BarrioEntrada } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

async function leerId(ctx: Ctx): Promise<number> {
  const n = Number((await ctx.params).id);
  if (!Number.isInteger(n) || n <= 0) throw new ErrorHttp(404, "No existe el barrio");
  return n;
}

export const PATCH = ruta(async (req: Request, ctx: Ctx) => {
  await requiereSesion(["ADMIN"]);
  const id = await leerId(ctx);
  const d = await leerJson(req, BarrioEntrada.partial());
  const actual = await prisma.barrio.findUnique({ where: { id } });
  if (!actual) throw new ErrorHttp(404, "No existe el barrio");
  if (d.nombre && d.nombre !== actual.nombre) {
    const otro = await prisma.barrio.findUnique({ where: { nombre: d.nombre } });
    if (otro) throw new ErrorHttp(409, "Ya existe un barrio con ese nombre");
  }
  const b = await prisma.barrio.update({
    where: { id },
    data: {
      ...(d.nombre !== undefined && { nombre: d.nombre }),
      ...(d.poblacion !== undefined && { poblacion: d.poblacion }),
      ...(d.centroLat !== undefined && { centroLat: d.centroLat }),
      ...(d.centroLng !== undefined && { centroLng: d.centroLng }),
      ...(d.poligono !== undefined &&
        d.poligono !== null && { poligono: d.poligono as Prisma.InputJsonValue }),
    },
  });
  return Response.json({
    id: b.id,
    nombre: b.nombre,
    poblacion: b.poblacion,
    centroLat: Number(b.centroLat),
    centroLng: Number(b.centroLng),
    poligono: b.poligono,
  });
});

export const DELETE = ruta(async (_req: Request, ctx: Ctx) => {
  await requiereSesion(["ADMIN"]);
  const id = await leerId(ctx);
  const existe = await prisma.barrio.findUnique({ where: { id }, select: { id: true } });
  if (!existe) throw new ErrorHttp(404, "No existe el barrio");
  const [incidentes, tickets] = await Promise.all([
    prisma.incidente.count({ where: { barrioId: id } }),
    prisma.ticket.count({ where: { barrioId: id } }),
  ]);
  if (incidentes > 0 || tickets > 0) {
    throw new ErrorHttp(409, "El barrio tiene datos asociados");
  }
  await prisma.barrio.delete({ where: { id } });
  return new Response(null, { status: 204 });
});
