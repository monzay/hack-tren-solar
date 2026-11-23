import { prisma } from "@/lib/prisma";
import { CATEGORIA_ETIQUETA, type Categoria } from "@/lib/dominio";
import { calcularTendencia, claveMes, tasaPorMil, ultimosMeses } from "@/lib/geo/agregacion";
import type { Recomendacion } from "@/lib/schemas";
import {
  inicioMesActual,
  listarBarrios,
  obtenerPuntos,
  restarMeses,
  type PuntoHecho,
} from "./consultas";

const UMBRAL_SUBA_DEFAULT = 20;
const MESES_ANALISIS = 12;

/** Serie mensual filtrada por categoría y, si se pide, franja. */
function serieMensual(
  puntos: PuntoHecho[],
  claves: string[],
  categoria: Categoria,
  franja: string | null,
) {
  const cuenta = new Map(claves.map((c) => [c, 0]));
  for (const p of puntos) {
    if (p.categoria !== categoria || (franja && p.franja !== franja)) continue;
    const k = claveMes(p.fecha);
    if (cuenta.has(k)) cuenta.set(k, (cuenta.get(k) ?? 0) + 1);
  }
  return claves.map((mes) => ({ mes, count: cuenta.get(mes) ?? 0 }));
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Evalúa las reglas activas para un barrio (o toda la ciudad si es null). Meses completos. */
export async function evaluarRecomendaciones(barrioId: number | null): Promise<Recomendacion[]> {
  const [reglas, barrios] = await Promise.all([
    prisma.reglaRecomendacion.findMany({ where: { activa: true }, orderBy: { id: "asc" } }),
    listarBarrios(),
  ]);
  if (reglas.length === 0) return [];

  const inicio = inicioMesActual();
  const claves = ultimosMeses(MESES_ANALISIS, new Date(inicio.getTime() - 1));
  const puntos = await obtenerPuntos(
    { fuente: "todas", ...(barrioId ? { barrioId } : {}) },
    { desde: restarMeses(inicio, MESES_ANALISIS), hasta: new Date(inicio.getTime() - 1) },
  );
  const poblacion = barrioId
    ? (barrios.find((b) => b.id === barrioId)?.poblacion ?? 0)
    : barrios.reduce((s, b) => s + b.poblacion, 0);
  const zona = barrioId ? "la zona" : "la ciudad";

  const salida: Recomendacion[] = [];
  for (const r of reglas) {
    const umbral = r.umbral === null ? null : Number(r.umbral);
    const nombre = capitalizar(CATEGORIA_ETIQUETA[r.categoria].toLowerCase());
    const cuando = r.franja ? ` (franja ${r.franja.toLowerCase()})` : "";
    const serie = serieMensual(puntos, claves, r.categoria, r.franja);
    let motivo: string | null = null;

    if (r.condicion === "TENDENCIA_SUBA") {
      const { deltaPct } = calcularTendencia(serie);
      const limite = umbral ?? UMBRAL_SUBA_DEFAULT;
      if (deltaPct !== null && deltaPct > limite) {
        motivo = `${nombre}${cuando} suben ${deltaPct}% en ${zona} respecto del mes anterior (umbral ${limite}%)`;
      }
    } else if (r.condicion === "PICO") {
      if (calcularTendencia(serie).pico) {
        motivo = `${nombre}${cuando}: el último mes está muy por encima del promedio de los meses previos en ${zona}`;
      }
    } else if (r.condicion === "TASA_SUPERA") {
      const total = serie.reduce((s, p) => s + p.count, 0);
      const tasa = tasaPorMil(total, poblacion);
      if (umbral !== null && tasa > umbral) {
        motivo = `${nombre}${cuando}: ${tasa} casos por mil habitantes en ${zona}, supera el umbral de ${umbral}`;
      }
    }

    if (motivo) {
      salida.push({ id: r.id, texto: r.texto, categoria: r.categoria, franja: r.franja, motivo });
    }
  }
  return salida;
}
