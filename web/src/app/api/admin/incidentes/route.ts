import { prisma } from "@/lib/prisma";
import { requiereSesion } from "@/lib/auth/sesion";
import { leerJson, ruta } from "@/lib/http";
import { asignarBarrio } from "@/lib/geo/ciudad";
import { CargaIncidentesEntrada } from "@/lib/schemas";

export const GET = ruta(async () => {
  await requiereSesion(["ADMIN"]);
  const lista = await prisma.incidente.findMany({
    orderBy: { id: "desc" },
    take: 100,
    include: { barrio: { select: { nombre: true } } },
  });
  return Response.json(
    lista.map((i) => ({
      id: i.id,
      categoria: i.categoria,
      fecha: i.fecha.toISOString(),
      franja: i.franja,
      lat: Number(i.lat),
      lng: Number(i.lng),
      barrioId: i.barrioId,
      barrio: i.barrio.nombre,
      fuente: i.fuente,
      sintetico: i.sintetico,
    })),
  );
});

export const POST = ruta(async (req: Request) => {
  await requiereSesion(["ADMIN"]);
  const { incidentes } = await leerJson(req, CargaIncidentesEntrada);
  const barrios = (
    await prisma.barrio.findMany({ select: { id: true, poligono: true, centroLat: true, centroLng: true } })
  ).map((b) => ({ ...b, centroLat: Number(b.centroLat), centroLng: Number(b.centroLng) }));

  const filas: (typeof incidentes[number] & { barrioId: number })[] = [];
  let descartados = 0;
  for (const inc of incidentes) {
    const barrio = asignarBarrio(inc.lat, inc.lng, barrios);
    if (!barrio) {
      descartados++;
      continue;
    }
    filas.push({ ...inc, barrioId: barrio.id });
  }
  if (filas.length > 0) await prisma.incidente.createMany({ data: filas });
  return Response.json({ creados: filas.length, descartados });
});
