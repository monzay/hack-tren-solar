import { prisma } from "@/lib/prisma";
import { requiereSesion } from "@/lib/auth/sesion";
import { leerJson, ruta } from "@/lib/http";
import { ReglaEntrada } from "@/lib/schemas";

function vista(r: {
  id: number;
  categoria: string;
  franja: string | null;
  condicion: string;
  umbral: unknown;
  texto: string;
  activa: boolean;
}) {
  return {
    id: r.id,
    categoria: r.categoria,
    franja: r.franja,
    condicion: r.condicion,
    umbral: r.umbral === null ? null : Number(r.umbral),
    texto: r.texto,
    activa: r.activa,
  };
}

export const GET = ruta(async () => {
  await requiereSesion(["ADMIN"]);
  const lista = await prisma.reglaRecomendacion.findMany({ orderBy: { id: "asc" } });
  return Response.json(lista.map(vista));
});

export const POST = ruta(async (req: Request) => {
  await requiereSesion(["ADMIN"]);
  const d = await leerJson(req, ReglaEntrada);
  const r = await prisma.reglaRecomendacion.create({ data: d });
  return Response.json(vista(r), { status: 201 });
});
