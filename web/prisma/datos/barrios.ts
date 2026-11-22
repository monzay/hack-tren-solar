// Barrios de San Salvador de Jujuy con polígonos APROXIMADOS (octógonos alrededor del centro).
// Datos de demo: no representan límites oficiales. Coordenadas GeoJSON: [lng, lat].

export interface BarrioSeed {
  nombre: string;
  centroLat: number;
  centroLng: number;
  radioM: number;
  poblacion: number;
  /** Peso relativo de incidentes en los datos sintéticos. */
  peso: number;
  poligono: { type: "Polygon"; coordinates: number[][][] };
}

function octogono(lat: number, lng: number, radioM: number) {
  const dLat = radioM / 111320;
  const dLng = radioM / (111320 * Math.cos((lat * Math.PI) / 180));
  const anillo: number[][] = [];
  for (let k = 0; k < 8; k++) {
    const ang = ((k * 45 + 22.5) * Math.PI) / 180;
    anillo.push([
      Number((lng + dLng * Math.cos(ang)).toFixed(6)),
      Number((lat + dLat * Math.sin(ang)).toFixed(6)),
    ]);
  }
  anillo.push(anillo[0]);
  return { type: "Polygon" as const, coordinates: [anillo] };
}

const BASE: [string, number, number, number, number, number][] = [
  // nombre, lat, lng, radio m, población, peso
  ["Centro", -24.1858, -65.2995, 450, 14000, 9],
  ["Gorriti", -24.179, -65.308, 450, 9500, 3],
  ["Ciudad de Nieva", -24.199, -65.29, 550, 11000, 3],
  ["Los Perales", -24.208, -65.307, 600, 16000, 6],
  ["Mariano Moreno", -24.196, -65.311, 450, 8500, 3],
  ["Alto Comedero", -24.235, -65.265, 900, 68000, 10],
  ["Chijra", -24.2, -65.325, 600, 12000, 6],
  ["Cuyaya", -24.17, -65.29, 500, 9000, 3],
  ["Bajo La Viña", -24.195, -65.28, 450, 7500, 2],
  ["Alto La Viña", -24.201, -65.27, 500, 6500, 2],
  ["Villa Jardín de Reyes", -24.16, -65.3, 600, 10500, 2],
  ["Campo Verde", -24.22, -65.28, 600, 9000, 2],
  ["Malvinas", -24.215, -65.295, 500, 7000, 2],
  ["Coronel Arias", -24.185, -65.32, 450, 6000, 2],
  ["San Pedrito", -24.175, -65.318, 450, 6500, 2],
  ["Belgrano", -24.192, -65.333, 450, 7000, 2],
  ["Los Huaicos", -24.165, -65.33, 500, 5500, 1.5],
  ["Luján", -24.18, -65.278, 450, 5000, 1.5],
  ["Villa San Martín", -24.215, -65.325, 500, 6500, 1.5],
  ["Huaico", -24.23, -65.305, 500, 5000, 1.5],
];

export const BARRIOS: BarrioSeed[] = BASE.map(([nombre, lat, lng, radioM, poblacion, peso]) => ({
  nombre,
  centroLat: lat,
  centroLng: lng,
  radioM,
  poblacion,
  peso,
  poligono: octogono(lat, lng, radioM),
}));
