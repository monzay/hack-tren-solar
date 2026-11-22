import { prisma } from "@/lib/prisma";
import { requiereSesion } from "@/lib/auth/sesion";
import { ErrorHttp, ruta } from "@/lib/http";
import { ServicioEntrada } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

async function leerId(ctx: Ctx): Promise<number> {
  const n = Number((await ctx.params).id);
  if (!Number.isInteger(n) || n <= 0) throw new ErrorHttp(404, "No existe el servicio");
  return n;
}

export const PATCH = ruta(async (req: Request, ctx: Ctx) => {
  await requiereSesion(["ADMIN"]);
  const id = await leerId(ctx);
  const crudo: unknown = await req.json().catch(() => {
    throw new ErrorHttp(400, "El cuerpo debe ser JSON válido");
  });
  const d = ServicioEntrada.partial().parse(crudo);
  // Solo se actualiza lo que vino en el cuerpo (los defaults de Zod no pisan datos).
  const presentes = Object.keys((crudo ?? {}) as Record<string, unknown>);
  const data = Object.fromEntries(Object.entries(d).filter(([k]) => presentes.includes(k)));
  const existe = await prisma.servicioAsistencia.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existe) throw new ErrorHttp(404, "No existe el servicio");
  const s = await prisma.servicioAsistencia.update({ where: { id }, data });
  return Response.json({
    id: s.id,
    nombre: s.nombre,
    tipo: s.tipo,
    telefono: s.telefono,
    lat: s.lat === null ? null : Number(s.lat),
    lng: s.lng === null ? null : Number(s.lng),
    barrioId: s.barrioId,
    activo: s.activo,
  });
});

export const DELETE = ruta(async (_req: Request, ctx: Ctx) => {
  await requiereSesion(["ADMIN"]);
  const id = await leerId(ctx);
  const existe = await prisma.servicioAsistencia.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existe) throw new ErrorHttp(404, "No existe el servicio");
  await prisma.servicioAsistencia.update({ where: { id }, data: { activo: false } });
  return new Response(null, { status: 204 });
});
