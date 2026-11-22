// GeoJSON usa [lng, lat].
type Anillo = number[][];

function enAnillo(lng: number, lat: number, anillo: Anillo): boolean {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      dentro = !dentro;
    }
  }
  return dentro;
}

/** Primer anillo = exterior; los siguientes = agujeros. */
function enPoligono(lng: number, lat: number, anillos: Anillo[]): boolean {
  if (!Array.isArray(anillos) || anillos.length === 0) return false;
  if (!enAnillo(lng, lat, anillos[0])) return false;
  for (let k = 1; k < anillos.length; k++) {
    if (enAnillo(lng, lat, anillos[k])) return false;
  }
  return true;
}

/** true si el punto está dentro del Polygon/MultiPolygon GeoJSON. */
export function puntoEnPoligono(lat: number, lng: number, geometria: unknown): boolean {
  if (!geometria || typeof geometria !== "object") return false;
  const g = geometria as { type?: string; coordinates?: unknown };
  if (g.type === "Polygon") return enPoligono(lng, lat, g.coordinates as Anillo[]);
  if (g.type === "MultiPolygon") {
    return (g.coordinates as Anillo[][]).some((p) => enPoligono(lng, lat, p));
  }
  return false;
}
