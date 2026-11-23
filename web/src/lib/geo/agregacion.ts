export interface Punto {
  lat: number;
  lng: number;
}

export interface Celda {
  lat: number;
  lng: number;
  count: number;
}

/**
 * Agrupa puntos en una grilla de `cellSize` grados y descarta las celdas con
 * menos de `minCount` incidentes. Devuelve el centro de cada celda, nunca el
 * punto original.
 */
export function agregarEnGrilla(
  puntos: Punto[],
  cellSize: number,
  minCount: number,
): Celda[] {
  const celdas = new Map<string, { i: number; j: number; count: number }>();
  for (const p of puntos) {
    const i = Math.floor(p.lat / cellSize);
    const j = Math.floor(p.lng / cellSize);
    const key = `${i}:${j}`;
    const previa = celdas.get(key);
    celdas.set(key, { i, j, count: (previa?.count ?? 0) + 1 });
  }
  return [...celdas.values()]
    .filter((c) => c.count >= minCount)
    .map((c) => ({
      lat: round((c.i + 0.5) * cellSize),
      lng: round((c.j + 0.5) * cellSize),
      count: c.count,
    }));
}

export interface PuntoSerie {
  mes: string;
  count: number;
}

export interface Tendencia {
  serie: PuntoSerie[];
  deltaPct: number | null;
  pico: boolean;
}

/** Δ% del último mes contra el anterior y detección de pico (> media + 2σ). */
export function calcularTendencia(serie: PuntoSerie[]): Tendencia {
  if (serie.length < 2) return { serie, deltaPct: null, pico: false };
  const ultimo = serie[serie.length - 1].count;
  const anterior = serie[serie.length - 2].count;
  const deltaPct =
    anterior === 0 ? null : round(((ultimo - anterior) / anterior) * 100, 1);
  const previos = serie.slice(0, -1).map((p) => p.count);
  const media = previos.reduce((a, b) => a + b, 0) / previos.length;
  const varianza =
    previos.reduce((a, b) => a + (b - media) ** 2, 0) / previos.length;
  const pico = previos.length >= 3 && ultimo > media + 2 * Math.sqrt(varianza);
  return { serie, deltaPct, pico };
}

/** Genera las claves YYYY-MM de los últimos `meses` meses (incluye el actual). */
export function ultimosMeses(meses: number, hoy = new Date()): string[] {
  const res: string[] = [];
  for (let k = meses - 1; k >= 0; k--) {
    const d = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - k));
    res.push(claveMes(d));
  }
  return res;
}

export function claveMes(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function tasaPorMil(count: number, poblacion: number): number {
  return poblacion > 0 ? round((count / poblacion) * 1000, 2) : 0;
}

function round(n: number, decimals = 5): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}
