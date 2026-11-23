import { prisma } from "@/lib/prisma";
import { requiereSesion } from "@/lib/auth/sesion";
import { leerJson, ruta } from "@/lib/http";
import { ServicioEntrada } from "@/lib/schemas";

function vista(s: {
  id: number;
  nombre: string;
  tipo: string;
  telefono: string;
  lat: unknown;
  lng: unknown;
  barrioId: number | null;
  activo: boolean;
}) {
  return {
    id: s.id,
    nombre: s.nombre,
    tipo: s.tipo,
    telefono: s.telefono,
    lat: s.lat === null ? null : Number(s.lat),
    lng: s.lng === null ? null : Number(s.lng),
    barrioId: s.barrioId,
    activo: s.activo,
  };
}

export const GET = ruta(async () => {
  await requiereSesion(["ADMIN"]);
  const lista = await prisma.servicioAsistencia.findMany({ orderBy: { nombre: "asc" } });
  return Response.json(lista.map(vista));
});

export const POST = ruta(async (req: Request) => {
  await requiereSesion(["ADMIN"]);
  const d = await leerJson(req, ServicioEntrada);
  const s = await prisma.servicioAsistencia.create({ data: d });
  return Response.json(vista(s), { status: 201 });
});
