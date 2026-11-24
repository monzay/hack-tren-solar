import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requiereSesion } from "@/lib/auth/sesion";
import { ErrorHttp, leerJson, ruta } from "@/lib/http";
import { BarrioEntrada } from "@/lib/schemas";

function vista(b: {
  id: number;
  nombre: string;
  poblacion: number;
  poligono: unknown;
  centroLat: unknown;
  centroLng: unknown;
}) {
  return {
    id: b.id,
    nombre: b.nombre,
    poblacion: b.poblacion,
    centroLat: Number(b.centroLat),
    centroLng: Number(b.centroLng),
    poligono: b.poligono,
  };
}

export const GET = ruta(async () => {
  await requiereSesion(["ADMIN"]);
  const barrios = await prisma.barrio.findMany({ orderBy: { nombre: "asc" } });
  return Response.json(barrios.map(vista));
});

export const POST = ruta(async (req: Request) => {
  await requiereSesion(["ADMIN"]);
  const datos = await leerJson(req, BarrioEntrada);
  if (datos.poligono === undefined || datos.poligono === null) {
    throw new ErrorHttp(400, "Falta el polígono del barrio");
  }
  const existe = await prisma.barrio.findUnique({ where: { nombre: datos.nombre } });
  if (existe) throw new ErrorHttp(409, "Ya existe un barrio con ese nombre");
  const creado = await prisma.barrio.create({
    data: {
      nombre: datos.nombre,
      poblacion: datos.poblacion,
      centroLat: datos.centroLat,
      centroLng: datos.centroLng,
      poligono: datos.poligono as Prisma.InputJsonValue,
    },
  });
  return Response.json(vista(creado), { status: 201 });
});
