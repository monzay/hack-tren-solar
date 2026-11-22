// CONTRATO DE LA API. Lo usan los Route Handlers (validación) y las pantallas
// (formularios y tipos de respuesta). No cambiar sin avisar: varias tareas dependen de esto.
// Errores: siempre `{ mensaje: string }` (y `errores` por campo en 400).
import { z } from "zod";
import {
  CATEGORIAS,
  CONDICIONES,
  ESTADOS,
  FRANJAS,
  MODOS,
  ORGANISMOS,
  ROLES,
  ROLES_REPORTANTE,
  TIPOS_SERVICIO,
  type Categoria,
  type CondicionRegla,
  type EstadoTicket,
  type Franja,
  type ModoTicket,
  type Organismo,
  type Role,
  type RolReportante,
  type TipoServicio,
} from "@/lib/dominio";

const lat = z.number().min(-90).max(90);
const lng = z.number().min(-180).max(180);
const id = z.coerce.number().int().positive();

// ─── Auth ───────────────────────────────────────────────
// POST /api/auth/login  body LoginEntrada → { usuario: UsuarioSesion }
// POST /api/auth/logout → { ok: true }
// GET  /api/auth/sesion → { usuario: UsuarioSesion | null }
export const LoginEntrada = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "Ingresá la contraseña"),
});
export type LoginEntrada = z.infer<typeof LoginEntrada>;

export interface UsuarioSesion {
  id: number;
  nombre: string;
  email: string;
  role: Role;
  organismo: Organismo | null;
}

// ─── Tickets (público) ──────────────────────────────────
// POST /api/tickets  body CrearTicketEntrada → CrearTicketRespuesta (201)
// 400 datos inválidos · 422 fuera de San Salvador de Jujuy · 429 rate limit
export const ContactoEntrada = z
  .object({
    nombre: z.string().trim().min(2, "Ingresá tu nombre").max(120),
    telefono: z.string().trim().max(40).optional(),
    email: z.email("Email inválido").optional(),
    horario: z.string().trim().max(120).optional(),
  })
  .refine((c) => Boolean(c.telefono) || Boolean(c.email), {
    message: "Indicá un teléfono o un email",
    path: ["telefono"],
  });
export type ContactoEntrada = z.infer<typeof ContactoEntrada>;

export const CrearTicketEntrada = z.object({
  categoria: z.enum(CATEGORIAS),
  modo: z.enum(MODOS),
  rolReportante: z.enum(ROLES_REPORTANTE),
  /** Fecha del hecho, ISO (YYYY-MM-DD o completa). No puede ser futura. */
  fecha: z.coerce
    .date()
    .refine((d) => d.getTime() <= Date.now(), "La fecha no puede ser futura"),
  franja: z.enum(FRANJAS),
  lat,
  lng,
  relato: z.string().trim().max(2000).optional(),
  quiereDenunciar: z.boolean().default(false),
  declaracionAceptada: z.boolean().default(false),
  /** Obligatorio si modo = CON_CONTACTO o quiereDenunciar. Prohibido si ANONIMO sin denuncia. */
  contacto: ContactoEntrada.optional(),
});
export type CrearTicketEntrada = z.infer<typeof CrearTicketEntrada>;

export interface RecursoUrgencia {
  numero: string;
  descripcion: string;
}
export interface CrearTicketRespuesta {
  ok: true;
  mensaje: string;
  recursos: RecursoUrgencia[];
}

// ─── Datos públicos de apoyo ────────────────────────────
// GET /api/barrios → BarrioPublico[]
// GET /api/servicios → ServicioPublico[]
export interface BarrioPublico {
  id: number;
  nombre: string;
  poblacion: number;
  centro: [number, number];
  /** Geometría GeoJSON (Polygon o MultiPolygon), coordenadas [lng, lat]. */
  poligono: unknown;
}
export interface ServicioPublico {
  id: number;
  nombre: string;
  tipo: TipoServicio;
  telefono: string;
  lat: number | null;
  lng: number | null;
}

// ─── Mapa (público) ─────────────────────────────────────
// GET /api/mapa/calor?FiltrosMapa → MapaCalorRespuesta
// GET /api/mapa/resumen?FiltrosMapa (barrioId opcional: sin él, toda la ciudad) → ResumenZona
export const FiltrosMapa = z.object({
  categoria: z.enum(CATEGORIAS).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  franja: z.enum(FRANJAS).optional(),
  fuente: z.enum(["todas", "oficial", "ciudadano"]).default("todas"),
  barrioId: id.optional(),
});
export type FiltrosMapa = z.infer<typeof FiltrosMapa>;

/** [lat, lng, peso] del CENTRO de una celda de ~100 m. Nunca coordenadas exactas. */
export type PuntoCalor = [number, number, number];
export interface MapaCalorRespuesta {
  puntos: PuntoCalor[];
  total: number;
  actualizado: string;
}

export interface Recomendacion {
  id: number;
  texto: string;
  categoria: Categoria;
  franja: Franja | null;
  /** Por qué aplica, explicable: "Robos en suba 40% vs. mes anterior". */
  motivo: string;
}

export interface ResumenZona {
  barrioId: number | null;
  nombre: string;
  conteo: number;
  tasaPorMil: number;
  /** Variación % del período contra el período anterior de igual duración. */
  variacionPct: number | null;
  recomendaciones: Recomendacion[];
}

// ─── Estadísticas (CIUDADANO, ANALISTA, ADMIN) ──────────
// GET /api/estadisticas/tendencias?meses=12&barrioId → TendenciasRespuesta
// GET /api/estadisticas/barrios?FiltrosMapa → RankingBarrio[] (ordenado por tasa desc)
// GET /api/estadisticas/franjas?FiltrosMapa → ConteoFranja[]
// GET /api/recomendaciones?barrioId → Recomendacion[]
export const FiltrosTendencias = z.object({
  meses: z.coerce.number().int().min(3).max(24).default(12),
  barrioId: id.optional(),
});
export interface TendenciasRespuesta {
  meses: string[];
  series: { categoria: Categoria; valores: number[] }[];
}
export interface RankingBarrio {
  barrioId: number;
  nombre: string;
  conteo: number;
  tasaPorMil: number;
  variacionPct: number | null;
}
export interface ConteoFranja {
  franja: Franja;
  conteo: number;
}

// ─── Operador (OPERADOR_SALUD, OPERADOR_POLICIA) ────────
// GET   /api/operador/tickets?FiltrosBandeja → TicketBandeja[] (solo de su organismo)
// GET   /api/operador/tickets/:id → TicketDetalle (descifra contacto y AUDITA el acceso; 403 si no es de su organismo)
// PATCH /api/operador/tickets/:id/estado body CambioEstadoEntrada → TicketDetalle (422 si no es la transición siguiente)
// POST  /api/operador/tickets/:id/notas body NuevaNotaEntrada → NotaVista (201)
export const FiltrosBandeja = z.object({
  estado: z.enum(ESTADOS).optional(),
  categoria: z.enum(CATEGORIAS).optional(),
});
export interface TicketBandeja {
  id: number;
  categoria: Categoria;
  modo: ModoTicket;
  estado: EstadoTicket;
  fecha: string;
  franja: Franja;
  barrio: string;
  organismos: Organismo[];
  createdAt: string;
}
export interface NotaVista {
  id: number;
  texto: string;
  autor: string;
  createdAt: string;
}
export interface TicketDetalle extends TicketBandeja {
  rolReportante: RolReportante;
  relato: string | null;
  quiereDenunciar: boolean;
  lat: number;
  lng: number;
  contacto: { nombre: string | null; telefono: string | null; email: string | null; horario: string | null } | null;
  notas: NotaVista[];
  historial: { de: EstadoTicket; a: EstadoTicket; autor: string; fecha: string }[];
}
export const CambioEstadoEntrada = z.object({ estado: z.enum(ESTADOS) });
export const NuevaNotaEntrada = z.object({ texto: z.string().trim().min(1).max(2000) });

// ─── Admin (ADMIN) ──────────────────────────────────────
// CRUD REST: GET lista · POST crea · PATCH /:id actualiza · DELETE /:id (baja lógica o física según entidad)
//   /api/admin/usuarios     UsuarioEntrada (password obligatorio al crear)
//   /api/admin/barrios      BarrioEntrada
//   /api/admin/categorias   CategoriaConfigEntrada (PATCH por categoría: /api/admin/categorias/:categoria)
//   /api/admin/servicios    ServicioEntrada
//   /api/admin/reglas       ReglaEntrada
// POST   /api/admin/incidentes  CargaIncidentesEntrada → { creados: number } (hasta 5.000)
// DELETE /api/admin/tickets/:id → supresión física a pedido de la persona (204)
export const UsuarioEntrada = z.object({
  email: z.email(),
  nombre: z.string().trim().min(2).max(120),
  role: z.enum(ROLES),
  organismo: z.enum(ORGANISMOS).nullable().default(null),
  password: z.string().min(8).optional(),
  activo: z.boolean().default(true),
});
export interface UsuarioVista {
  id: number;
  email: string;
  nombre: string;
  role: Role;
  organismo: Organismo | null;
  activo: boolean;
}
export const BarrioEntrada = z.object({
  nombre: z.string().trim().min(2).max(120),
  poblacion: z.number().int().nonnegative(),
  centroLat: lat,
  centroLng: lng,
  poligono: z.unknown(),
});
export const CategoriaConfigEntrada = z.object({
  permiteAnonimo: z.boolean(),
  requiereContacto: z.boolean(),
  derivaSalud: z.boolean(),
  derivaPolicia: z.boolean(),
  recursosUrgencia: z.array(z.object({ numero: z.string(), descripcion: z.string() })),
});
export const ServicioEntrada = z.object({
  nombre: z.string().trim().min(2).max(160),
  tipo: z.enum(TIPOS_SERVICIO),
  telefono: z.string().trim().min(3).max(40),
  lat: lat.nullable().default(null),
  lng: lng.nullable().default(null),
  barrioId: z.number().int().positive().nullable().default(null),
  activo: z.boolean().default(true),
});
export const ReglaEntrada = z.object({
  categoria: z.enum(CATEGORIAS),
  franja: z.enum(FRANJAS).nullable().default(null),
  condicion: z.enum(CONDICIONES),
  umbral: z.number().nullable().default(null),
  texto: z.string().trim().min(5).max(1000),
  activa: z.boolean().default(true),
});
export type ReglaVista = z.infer<typeof ReglaEntrada> & { id: number; condicion: CondicionRegla };
export const CargaIncidentesEntrada = z.object({
  incidentes: z
    .array(
      z.object({
        categoria: z.enum(CATEGORIAS),
        fecha: z.coerce.date(),
        franja: z.enum(FRANJAS),
        lat,
        lng,
        fuente: z.string().max(60).default("SNIC"),
        sintetico: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(5000),
});
