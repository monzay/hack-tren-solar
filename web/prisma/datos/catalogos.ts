// Catálogos de la demo: configuración de categorías, servicios de asistencia y reglas de recomendación.
// Los teléfonos de comisarías y centros son ficticios (demo).

import type { Categoria, CondicionRegla, Franja, TipoServicio } from "../../src/lib/dominio";

const RECURSOS = [
  { numero: "911", descripcion: "Emergencias" },
  { numero: "144", descripcion: "Violencia de género" },
  { numero: "102", descripcion: "Niñas, niños y adolescentes" },
];

const ANONIMAS: Categoria[] = ["ABUSO_SEXUAL", "VIOLENCIA_GENERO", "VIOLENCIA_INTRAFAMILIAR"];
const TODAS: Categoria[] = [
  "HOMICIDIO",
  "LESIONES",
  "VIOLENCIA_GENERO",
  "VIOLENCIA_INTRAFAMILIAR",
  "ABUSO_SEXUAL",
  "ROBO",
  "HURTO",
  "HURTO_VEHICULO",
  "ESTAFA_ONLINE",
];

export const CATEGORIAS_CONFIG = TODAS.map((categoria) => {
  const anonima = ANONIMAS.includes(categoria);
  return {
    categoria,
    permiteAnonimo: anonima,
    requiereContacto: !anonima,
    derivaSalud: categoria === "ABUSO_SEXUAL",
    derivaPolicia: true,
    recursosUrgencia: RECURSOS,
  };
});

export interface ServicioSeed {
  nombre: string;
  tipo: TipoServicio;
  telefono: string;
  lat: number | null;
  lng: number | null;
  barrio: string | null;
}

export const SERVICIOS: ServicioSeed[] = [
  { nombre: "Comisaría Seccional 1ª", tipo: "COMISARIA", telefono: "388 400-0001", lat: -24.1862, lng: -65.3003, barrio: "Centro" },
  { nombre: "Comisaría Seccional 4ª", tipo: "COMISARIA", telefono: "388 400-0004", lat: -24.2075, lng: -65.3065, barrio: "Los Perales" },
  { nombre: "Comisaría Alto Comedero", tipo: "COMISARIA", telefono: "388 400-0010", lat: -24.2345, lng: -65.2665, barrio: "Alto Comedero" },
  { nombre: "Comisaría de Chijra", tipo: "COMISARIA", telefono: "388 400-0012", lat: -24.2005, lng: -65.3245, barrio: "Chijra" },
  { nombre: "Centro de Salud Centro", tipo: "CENTRO_SALUD", telefono: "388 400-0101", lat: -24.1848, lng: -65.2985, barrio: "Centro" },
  { nombre: "Centro de Salud Alto Comedero", tipo: "CENTRO_SALUD", telefono: "388 400-0102", lat: -24.2335, lng: -65.2635, barrio: "Alto Comedero" },
  { nombre: "Centro de Salud Los Perales", tipo: "CENTRO_SALUD", telefono: "388 400-0103", lat: -24.2095, lng: -65.3085, barrio: "Los Perales" },
  { nombre: "Centro de Salud Chijra", tipo: "CENTRO_SALUD", telefono: "388 400-0104", lat: -24.1995, lng: -65.3265, barrio: "Chijra" },
  { nombre: "Centro de Atención a la Víctima (CAV)", tipo: "CAV", telefono: "388 400-0200", lat: -24.1875, lng: -65.2975, barrio: "Centro" },
  { nombre: "Línea 144 - Violencia de género", tipo: "LINEA", telefono: "144", lat: null, lng: null, barrio: null },
  { nombre: "Línea 102 - Niñas, niños y adolescentes", tipo: "LINEA", telefono: "102", lat: null, lng: null, barrio: null },
  { nombre: "Emergencias 911", tipo: "LINEA", telefono: "911", lat: null, lng: null, barrio: null },
];

export interface ReglaSeed {
  categoria: Categoria;
  franja: Franja | null;
  condicion: CondicionRegla;
  umbral: number | null;
  texto: string;
}

// Recomendaciones de prevención situacional (lugares y horarios), sin perfilar personas.
export const REGLAS: ReglaSeed[] = [
  { categoria: "ROBO", franja: "NOCHE", condicion: "TENDENCIA_SUBA", umbral: 20, texto: "Reforzar la iluminación de calles y esquinas con suba de robos en la franja nocturna." },
  { categoria: "ROBO", franja: "NOCHE", condicion: "PICO", umbral: 15, texto: "Reforzar el patrullaje preventivo visible en el horario y la zona del pico de robos." },
  { categoria: "ROBO", franja: null, condicion: "TASA_SUPERA", umbral: 30, texto: "Instalar paradas seguras de transporte con buena iluminación y cámaras en la zona." },
  { categoria: "HURTO", franja: "MANANA", condicion: "TENDENCIA_SUBA", umbral: 20, texto: "Reforzar la presencia preventiva en zonas comerciales y paradas de colectivo en la mañana." },
  { categoria: "HURTO_VEHICULO", franja: null, condicion: "TENDENCIA_SUBA", umbral: 20, texto: "Mejorar la iluminación y la vigilancia de playas de estacionamiento y calles con suba de hurtos de vehículos." },
  { categoria: "LESIONES", franja: "MADRUGADA", condicion: "PICO", umbral: 15, texto: "Coordinar controles y patrullaje preventivo alrededor de locales nocturnos en la madrugada." },
  { categoria: "VIOLENCIA_GENERO", franja: null, condicion: "TENDENCIA_SUBA", umbral: 15, texto: "Difundir en el barrio los recursos de asistencia: línea 144, CAV y centros de salud cercanos." },
  { categoria: "VIOLENCIA_INTRAFAMILIAR", franja: null, condicion: "TASA_SUPERA", umbral: 25, texto: "Reforzar la difusión de la línea 102 y de los servicios de asistencia en el barrio." },
  { categoria: "ABUSO_SEXUAL", franja: null, condicion: "TENDENCIA_SUBA", umbral: 10, texto: "Garantizar corredores escolares seguros y recorridos preventivos en horarios de entrada y salida." },
  { categoria: "ESTAFA_ONLINE", franja: null, condicion: "TENDENCIA_SUBA", umbral: 20, texto: "Realizar campañas de prevención de estafas online y difundir canales oficiales de denuncia." },
];
