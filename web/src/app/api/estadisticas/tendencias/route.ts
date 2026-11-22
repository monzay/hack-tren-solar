import { ruta, leerQuery } from "@/lib/http";
import { requiereSesion } from "@/lib/auth/sesion";
import { CATEGORIAS } from "@/lib/dominio";
import { claveMes, ultimosMeses } from "@/lib/geo/agregacion";
import { FiltrosTendencias, type TendenciasRespuesta } from "@/lib/schemas";
import { inicioMesActual, obtenerPuntos, restarMeses } from "@/lib/estadisticas/consultas";


// Serie mensual por categoría, solo meses completos.
export const GET = ruta(async (req: Request) => {
  await requiereSesion(["CIUDADANO", "ANALISTA", "ADMIN"]);
  const { meses, barrioId } = leerQuery(req, FiltrosTendencias);

  const inicio = inicioMesActual();
  const fin = new Date(inicio.getTime() - 1);
  const claves = ultimosMeses(meses, fin);
  const puntos = await obtenerPuntos(
    { fuente: "todas", ...(barrioId ? { barrioId } : {}) },
    { desde: restarMeses(inicio, meses), hasta: fin },
  );

  const cuentas = new Map<string, number>();
  for (const p of puntos) {
    const k = `${p.categoria}|${claveMes(p.fecha)}`;
    cuentas.set(k, (cuentas.get(k) ?? 0) + 1);
  }
  const respuesta: TendenciasRespuesta = {
    meses: claves,
    series: CATEGORIAS.map((categoria) => ({
      categoria,
      valores: claves.map((m) => cuentas.get(`${categoria}|${m}`) ?? 0),
    })),
  };
  return Response.json(respuesta);
});
