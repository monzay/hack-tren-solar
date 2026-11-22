import { z } from "zod";
import { ruta, leerQuery } from "@/lib/http";
import { requiereSesion } from "@/lib/auth/sesion";
import { evaluarRecomendaciones } from "@/lib/estadisticas/recomendaciones";

export const dynamic = "force-dynamic";

const Query = z.object({ barrioId: z.coerce.number().int().positive().optional() });

export const GET = ruta(async (req: Request) => {
  await requiereSesion(["CIUDADANO", "ANALISTA", "ADMIN"]);
  const { barrioId } = leerQuery(req, Query);
  return Response.json(await evaluarRecomendaciones(barrioId ?? null));
});
