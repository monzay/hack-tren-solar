import type { Categoria, Franja, Organismo } from "@/lib/dominio";
import type { SenalRecomendacion } from "@/lib/informes/periodicidad";

/**
 * SIMULACIÓN: candidatos a informe con datos ficticios y borradores escritos a mano.
 * Reemplaza, hasta la implementación completa (docs/INFORMES-AGENTICOS.md), a la
 * evaluación de reglas sobre tickets y al borrador que redactaría el modelo.
 * Solo contiene datos agregados: nunca relatos, contactos ni coordenadas.
 */

export const MODELO_PREVISTO = "claude-haiku-5-5";
export const FECHA_SIMULADA = "23/11/2026";

export interface BorradorInforme {
  hallazgo: string;
  evidencia: string[];
  acciones: string[];
  recursos: string[];
}

export interface CandidatoInforme {
  id: string;
  /** Regla de recomendación que lo origina (ReglaRecomendacion.id del seed). */
  reglaId: number;
  organismo: Organismo;
  categoria: Categoria;
  franja: Franja | null;
  zona: string;
  recomendacion: string;
  motivo: string;
  senal: SenalRecomendacion;
  borrador: BorradorInforme;
}

const RECURSOS_SALUD = [
  "Línea 144 (violencia de género)",
  "Centro de Atención a la Víctima",
  "Centros de salud del barrio",
];

export const CANDIDATOS_SIMULADOS: CandidatoInforme[] = [
  {
    id: "sim-robo-noche-centro",
    reglaId: 2,
    organismo: "POLICIA",
    categoria: "ROBO",
    franja: "NOCHE",
    zona: "Centro",
    recomendacion: "Reforzar el patrullaje preventivo visible en el horario y la zona del pico de robos.",
    motivo: "Robo (franja noche) suben 116% respecto del mes anterior (umbral 20%).",
    senal: { hechos: 48, semanasSostenida: 3, variacionPct: 116, ultimoInforme: null },
    borrador: {
      hallazgo:
        "Los robos en la franja de 18 a 24 h en el barrio Centro aumentaron 116% respecto del mes anterior y se mantienen en suba hace tres semanas.",
      evidencia: [
        "48 hechos en los últimos 30 días (datos oficiales + reportes ciudadanos no verificados).",
        "3 semanas consecutivas por encima del umbral de la regla (20%).",
        "La mayor concentración está en las celdas cercanas a paradas de colectivo.",
      ],
      acciones: [
        "Patrullaje preventivo visible de 18 a 24 h en la zona del pico.",
        "Relevar con el municipio la iluminación de paradas y esquinas.",
      ],
      recursos: ["911 (emergencias)"],
    },
  },
  {
    id: "sim-violencia-genero-alto-comedero",
    reglaId: 7,
    organismo: "SALUD",
    categoria: "VIOLENCIA_GENERO",
    franja: null,
    zona: "Alto Comedero",
    recomendacion: "Difundir en el barrio los recursos de asistencia: línea 144, CAV y centros de salud cercanos.",
    motivo: "Violencia de género suben 23,5% respecto del mes anterior (umbral 15%).",
    senal: {
      hechos: 64,
      semanasSostenida: 2,
      variacionPct: 23.5,
      ultimoInforme: { haceDias: 30, variacionPct: 10 },
    },
    borrador: {
      hallazgo:
        "Los reportes de violencia de género en Alto Comedero subieron 23,5% respecto del mes anterior, con dos semanas seguidas en suba.",
      evidencia: [
        "64 hechos en los últimos 30 días; respaldo alto.",
        "El último informe sobre esta regla se envió hace 30 días, con una suba del 10%.",
      ],
      acciones: [
        "Campaña de difusión de recursos de asistencia en centros de salud y escuelas del barrio.",
        "Reforzar la guardia de atención del CAV en los horarios de mayor demanda.",
      ],
      recursos: RECURSOS_SALUD,
    },
  },
  {
    id: "sim-abuso-los-perales-salud",
    reglaId: 9,
    organismo: "SALUD",
    categoria: "ABUSO_SEXUAL",
    franja: null,
    zona: "Los Perales",
    recomendacion: "Garantizar corredores escolares seguros y recorridos preventivos en horarios de entrada y salida.",
    motivo: "Abuso sexual suben 33,3% respecto del mes anterior (umbral 10%).",
    senal: { hechos: 31, semanasSostenida: 2, variacionPct: 33.3, ultimoInforme: null },
    borrador: {
      hallazgo:
        "Los reportes de abuso sexual en Los Perales subieron 33,3% respecto del mes anterior y la suba se sostiene hace dos semanas.",
      evidencia: ["31 hechos en los últimos 30 días; respaldo medio."],
      acciones: [
        "Coordinar con escuelas del barrio talleres de prevención y canales de consulta.",
        "Asegurar turnos de atención y acompañamiento en el centro de salud más cercano.",
      ],
      recursos: RECURSOS_SALUD,
    },
  },
  {
    id: "sim-abuso-los-perales-policia",
    reglaId: 9,
    organismo: "POLICIA",
    categoria: "ABUSO_SEXUAL",
    franja: null,
    zona: "Los Perales",
    recomendacion: "Garantizar corredores escolares seguros y recorridos preventivos en horarios de entrada y salida.",
    motivo: "Abuso sexual suben 33,3% respecto del mes anterior (umbral 10%).",
    senal: { hechos: 31, semanasSostenida: 2, variacionPct: 33.3, ultimoInforme: null },
    borrador: {
      hallazgo:
        "Los reportes de abuso sexual en Los Perales subieron 33,3% respecto del mes anterior y la suba se sostiene hace dos semanas.",
      evidencia: ["31 hechos en los últimos 30 días; respaldo medio."],
      acciones: [
        "Recorridos preventivos en los corredores escolares en horarios de entrada y salida.",
      ],
      recursos: ["911 (emergencias)", "102 (niñas, niños y adolescentes)"],
    },
  },
  {
    id: "sim-lesiones-madrugada-centro",
    reglaId: 6,
    organismo: "POLICIA",
    categoria: "LESIONES",
    franja: "MADRUGADA",
    zona: "Centro",
    recomendacion: "Coordinar controles y patrullaje preventivo alrededor de locales nocturnos en la madrugada.",
    motivo: "Lesiones (franja madrugada): el último mes está muy por encima del promedio.",
    senal: {
      hechos: 36,
      semanasSostenida: 2,
      variacionPct: 80,
      ultimoInforme: { haceDias: 10, variacionPct: 20 },
    },
    borrador: {
      hallazgo:
        "Las lesiones de madrugada en el Centro empeoraron desde el último informe: pasaron de +20% a +80% en 10 días.",
      evidencia: [
        "36 hechos en los últimos 30 días.",
        "Se emite antes del plazo de 14 días porque el patrón escaló 60 puntos.",
      ],
      acciones: ["Controles y patrullaje preventivo alrededor de locales nocturnos de 0 a 6 h."],
      recursos: ["911 (emergencias)"],
    },
  },
  {
    id: "sim-estafa-ciudad",
    reglaId: 10,
    organismo: "POLICIA",
    categoria: "ESTAFA_ONLINE",
    franja: null,
    zona: "Toda la ciudad",
    recomendacion: "Realizar campañas de prevención de estafas online y difundir canales oficiales de denuncia.",
    motivo: "Estafa online suben 50% respecto del mes anterior (umbral 20%).",
    senal: { hechos: 12, semanasSostenida: 3, variacionPct: 50, ultimoInforme: null },
    borrador: { hallazgo: "", evidencia: [], acciones: [], recursos: [] },
  },
  {
    id: "sim-hurto-vehiculo-nieva",
    reglaId: 5,
    organismo: "POLICIA",
    categoria: "HURTO_VEHICULO",
    franja: null,
    zona: "Ciudad de Nieva",
    recomendacion: "Mejorar la iluminación y la vigilancia de playas de estacionamiento y calles con suba de hurtos de vehículos.",
    motivo: "Hurto de vehículo suben 25% respecto del mes anterior (umbral 20%).",
    senal: {
      hechos: 41,
      semanasSostenida: 2,
      variacionPct: 25,
      ultimoInforme: { haceDias: 5, variacionPct: 22 },
    },
    borrador: { hallazgo: "", evidencia: [], acciones: [], recursos: [] },
  },
  {
    id: "sim-hurto-manana-gorriti",
    reglaId: 4,
    organismo: "POLICIA",
    categoria: "HURTO",
    franja: "MANANA",
    zona: "Gorriti",
    recomendacion: "Reforzar la presencia preventiva en zonas comerciales y paradas de colectivo en la mañana.",
    motivo: "Hurto (franja mañana) suben 21% respecto del mes anterior (umbral 20%).",
    senal: { hechos: 33, semanasSostenida: 1, variacionPct: 21, ultimoInforme: null },
    borrador: { hallazgo: "", evidencia: [], acciones: [], recursos: [] },
  },
];
