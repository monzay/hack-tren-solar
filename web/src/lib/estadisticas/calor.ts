import { agregarEnGrilla, type Punto } from "@/lib/geo/agregacion";
import { CELDA_GRADOS } from "@/lib/dominio";
import type { MapaCalorRespuesta } from "@/lib/schemas";

/**
 * Arma la respuesta pública del mapa de calor. Pura: solo devuelve centros de celda
 * con al menos `minCount` incidentes, nunca una coordenada de entrada.
 */
export function armarCalor(
  puntos: Punto[],
  minCount = 1,
  celda = CELDA_GRADOS,
  ahora = new Date(),
): MapaCalorRespuesta {
  const celdas = agregarEnGrilla(puntos, celda, minCount);
  return {
    puntos: celdas.map((c) => [c.lat, c.lng, c.count]),
    total: celdas.reduce((s, c) => s + c.count, 0),
    actualizado: ahora.toISOString(),
  };
}
