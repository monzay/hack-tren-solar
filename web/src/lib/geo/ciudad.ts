import { puntoEnPoligono } from "@/lib/geo/poligono";

/**
 * Límite aproximado del ejido de San Salvador de Jujuy (incluye Alto Comedero al sur,
 * Los Huaicos al oeste y llega hasta el límite con Palpalá al este). GeoJSON [lng, lat].
 * Decide si un reporte está dentro de la ciudad; los barrios de la demo son aproximados
 * y dejan huecos entre sí, por eso NO se usan como límite.
 */
export const EJIDO_SSJ = {
  type: "Polygon",
  coordinates: [
    [
      [-65.37, -24.14],
      [-65.22, -24.14],
      [-65.215, -24.2],
      [-65.22, -24.28],
      [-65.31, -24.28],
      [-65.37, -24.22],
      [-65.37, -24.14],
    ],
  ],
} as const;

export interface BarrioUbicable {
  id: number;
  poligono: unknown;
  centroLat: number;
  centroLng: number;
}

export function dentroDeCiudad(lat: number, lng: number): boolean {
  return puntoEnPoligono(lat, lng, EJIDO_SSJ);
}

/**
 * Barrio del punto: el que lo contiene o, si cae entre polígonos, el de centro más
 * cercano. Devuelve null si el punto está fuera de la ciudad.
 */
export function asignarBarrio<B extends BarrioUbicable>(
  lat: number,
  lng: number,
  barrios: readonly B[],
): B | null {
  if (barrios.length === 0 || !dentroDeCiudad(lat, lng)) return null;
  const contenedor = barrios.find((b) => puntoEnPoligono(lat, lng, b.poligono));
  if (contenedor) return contenedor;
  // Distancia aproximada en grados, corrigiendo la longitud por la latitud.
  const escalaLng = Math.cos((lat * Math.PI) / 180);
  let masCercano = barrios[0];
  let mejor = Infinity;
  for (const b of barrios) {
    const d = (b.centroLat - lat) ** 2 + ((b.centroLng - lng) * escalaLng) ** 2;
    if (d < mejor) {
      mejor = d;
      masCercano = b;
    }
  }
  return masCercano;
}
