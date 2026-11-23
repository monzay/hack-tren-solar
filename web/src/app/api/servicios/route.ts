import { ruta } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { ServicioPublico } from "@/lib/schemas";

export const GET = ruta(async () => {
  const servicios = await prisma.servicioAsistencia.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
  const datos: ServicioPublico[] = servicios.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    tipo: s.tipo,
    telefono: s.telefono,
    lat: s.lat === null ? null : Number(s.lat),
    lng: s.lng === null ? null : Number(s.lng),
  }));
  return Response.json(datos);
});
