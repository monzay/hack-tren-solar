import { ruta } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { BarrioPublico } from "@/lib/schemas";

export const GET = ruta(async () => {
  const barrios = await prisma.barrio.findMany({ orderBy: { nombre: "asc" } });
  const datos: BarrioPublico[] = barrios.map((b) => ({
    id: b.id,
    nombre: b.nombre,
    poblacion: b.poblacion,
    centro: [Number(b.centroLat), Number(b.centroLng)],
    poligono: b.poligono,
  }));
  return Response.json(datos);
});
