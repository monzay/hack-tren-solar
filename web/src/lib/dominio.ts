// Constantes y etiquetas del dominio. Los valores coinciden con los enums de Prisma.

export const CATEGORIAS = [
  "HOMICIDIO",
  "LESIONES",
  "VIOLENCIA_GENERO",
  "VIOLENCIA_INTRAFAMILIAR",
  "ABUSO_SEXUAL",
  "ROBO",
  "HURTO",
  "HURTO_VEHICULO",
  "ESTAFA_ONLINE",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const FRANJAS = ["MADRUGADA", "MANANA", "TARDE", "NOCHE"] as const;
export type Franja = (typeof FRANJAS)[number];

export const ROLES = [
  "CIUDADANO",
  "OPERADOR_SALUD",
  "OPERADOR_POLICIA",
  "ANALISTA",
  "ADMIN",
] as const;
export type Role = (typeof ROLES)[number];

export const ORGANISMOS = ["SALUD", "POLICIA"] as const;
export type Organismo = (typeof ORGANISMOS)[number];

export const ESTADOS = ["NUEVO", "CONTACTADO", "DERIVADO", "CERRADO"] as const;
export type EstadoTicket = (typeof ESTADOS)[number];

export const MODOS = ["ANONIMO", "CON_CONTACTO"] as const;
export type ModoTicket = (typeof MODOS)[number];

export const ROLES_REPORTANTE = ["VICTIMA", "TESTIGO"] as const;
export type RolReportante = (typeof ROLES_REPORTANTE)[number];

export const TIPOS_SERVICIO = ["COMISARIA", "CENTRO_SALUD", "CAV", "LINEA"] as const;
export type TipoServicio = (typeof TIPOS_SERVICIO)[number];

export const CONDICIONES = ["TENDENCIA_SUBA", "PICO", "TASA_SUPERA"] as const;
export type CondicionRegla = (typeof CONDICIONES)[number];

export const CATEGORIA_ETIQUETA: Record<Categoria, string> = {
  HOMICIDIO: "Homicidio",
  LESIONES: "Lesiones",
  VIOLENCIA_GENERO: "Violencia de género",
  VIOLENCIA_INTRAFAMILIAR: "Violencia intrafamiliar",
  ABUSO_SEXUAL: "Abuso sexual",
  ROBO: "Robo",
  HURTO: "Hurto",
  HURTO_VEHICULO: "Hurto de vehículo",
  ESTAFA_ONLINE: "Estafa online",
};

export const FRANJA_ETIQUETA: Record<Franja, string> = {
  MADRUGADA: "Madrugada (0 a 6 h)",
  MANANA: "Mañana (6 a 12 h)",
  TARDE: "Tarde (12 a 18 h)",
  NOCHE: "Noche (18 a 24 h)",
};

export const ESTADO_ETIQUETA: Record<EstadoTicket, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  DERIVADO: "Derivado",
  CERRADO: "Cerrado",
};

export const ORGANISMO_ETIQUETA: Record<Organismo, string> = {
  SALUD: "Ministerio de Salud",
  POLICIA: "Policía",
};

export const TIPO_SERVICIO_ETIQUETA: Record<TipoServicio, string> = {
  COMISARIA: "Comisaría",
  CENTRO_SALUD: "Centro de salud",
  CAV: "Centro de Atención a la Víctima",
  LINEA: "Línea telefónica",
};

/** Categorías que admiten reporte anónimo (decisión 7 del plan). */
export const CATEGORIAS_ANONIMAS: readonly Categoria[] = [
  "ABUSO_SEXUAL",
  "VIOLENCIA_GENERO",
  "VIOLENCIA_INTRAFAMILIAR",
];

/** Derivación por defecto (decisión 9). La fuente real es CategoriaConfig en la base. */
export function organismosPorDefecto(categoria: Categoria): Organismo[] {
  return categoria === "ABUSO_SEXUAL" ? ["SALUD", "POLICIA"] : ["POLICIA"];
}

/** Transiciones válidas: solo hacia adelante. */
export const SIGUIENTE_ESTADO: Record<EstadoTicket, EstadoTicket | null> = {
  NUEVO: "CONTACTADO",
  CONTACTADO: "DERIVADO",
  DERIVADO: "CERRADO",
  CERRADO: null,
};

export function organismoDeRol(role: Role): Organismo | null {
  if (role === "OPERADOR_SALUD") return "SALUD";
  if (role === "OPERADOR_POLICIA") return "POLICIA";
  return null;
}

export function franjaDeHora(hora: number): Franja {
  if (hora < 6) return "MADRUGADA";
  if (hora < 12) return "MANANA";
  if (hora < 18) return "TARDE";
  return "NOCHE";
}

export const RECURSOS_URGENCIA = [
  { numero: "911", descripcion: "Emergencias" },
  { numero: "144", descripcion: "Violencia de género" },
  { numero: "102", descripcion: "Niñas, niños y adolescentes" },
] as const;

/** Tamaño de celda de la grilla del mapa: ~100 m de latitud. */
export const CELDA_GRADOS = 0.0009;

/** Vista inicial del mapa: San Salvador de Jujuy. */
export const CENTRO_SSJ: [number, number] = [-24.1858, -65.2995];
export const ZOOM_CIUDAD = 13;
export const ZOOM_BARRIO = 15;

export const FUENTE_MAPA = "Datos oficiales + reportes ciudadanos no verificados";
