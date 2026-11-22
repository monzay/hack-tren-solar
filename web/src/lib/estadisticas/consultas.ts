import { prisma } from "@/lib/prisma";
import type { Categoria, Franja } from "@/lib/dominio";
import type { FiltrosMapa } from "@/lib/schemas";

/** Punto de hecho (oficial o ciudadano) para cálculos internos. Nunca se expone tal cual. */
export interface PuntoHecho {
  lat: number;
  lng: number;
  categoria: Categoria;
  franja: Franja;
  fecha: Date;
  barrioId: number;
  fuente: "oficial" | "ciudadano";
}

export interface Rango {
  desde: Date;
  hasta: Date;
}

/** Resta meses sin desborde de día (31/mar - 1 mes = 28/feb). */
export function restarMeses(fecha: Date, meses: number): Date {
  const y = fecha.getUTCFullYear();
  const m = fecha.getUTCMonth() - meses;
  const diasMes = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(
    Date.UTC(
      y,
      m,
      Math.min(fecha.getUTCDate(), diasMes),
      fecha.getUTCHours(),
      fecha.getUTCMinutes(),
      fecha.getUTCSeconds(),
      fecha.getUTCMilliseconds(),
    ),
  );
}

/** Período pedido; por defecto los últimos 12 meses. */
export function rangoDe(f: Pick<FiltrosMapa, "desde" | "hasta">, ahora = new Date()): Rango {
  const hasta = f.hasta ?? ahora;
  const desde = f.desde ?? restarMeses(hasta, 12);
  return { desde, hasta };
}

/** Período anterior de igual duración, contiguo al actual. */
export function rangoAnterior(r: Rango): Rango {
  const dur = r.hasta.getTime() - r.desde.getTime();
  return { desde: new Date(r.desde.getTime() - dur), hasta: new Date(r.desde.getTime()) };
}

/** Inicio (UTC) del mes en curso. */
export function inicioMesActual(ahora = new Date()): Date {
  return new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), 1));
}

/**
 * Une incidentes oficiales y tickets no borrados (mismo peso) según los filtros.
 * `rango` pisa desde/hasta de los filtros. El rango es [desde, hasta], con hasta inclusive
 * si viene de los filtros del usuario.
 */
export async function obtenerPuntos(
  filtros: Partial<FiltrosMapa>,
  rango?: Rango,
): Promise<PuntoHecho[]> {
  const { desde, hasta } = rango ?? rangoDe(filtros);
  const fuente = filtros.fuente ?? "todas";
  const comun = {
    fecha: { gte: desde, lte: hasta },
    ...(filtros.categoria ? { categoria: filtros.categoria } : {}),
    ...(filtros.franja ? { franja: filtros.franja } : {}),
    ...(filtros.barrioId ? { barrioId: filtros.barrioId } : {}),
  };
  const select = {
    lat: true,
    lng: true,
    categoria: true,
    franja: true,
    fecha: true,
    barrioId: true,
  } as const;

  const [incidentes, tickets] = await Promise.all([
    fuente === "ciudadano"
      ? Promise.resolve([])
      : prisma.incidente.findMany({ where: comun, select }),
    fuente === "oficial"
      ? Promise.resolve([])
      : prisma.ticket.findMany({ where: { ...comun, deletedAt: null }, select }),
  ]);

  const mapear = (fila: (typeof incidentes)[number], origen: PuntoHecho["fuente"]): PuntoHecho => ({
    lat: Number(fila.lat),
    lng: Number(fila.lng),
    categoria: fila.categoria,
    franja: fila.franja,
    fecha: fila.fecha,
    barrioId: fila.barrioId,
    fuente: origen,
  });
  return [
    ...incidentes.map((i) => mapear(i, "oficial")),
    ...tickets.map((t) => mapear(t, "ciudadano")),
  ];
}

export interface BarrioBasico {
  id: number;
  nombre: string;
  poblacion: number;
}

export async function listarBarrios(): Promise<BarrioBasico[]> {
  return prisma.barrio.findMany({
    select: { id: true, nombre: true, poblacion: true },
    orderBy: { nombre: "asc" },
  });
}

/** Variación % entre dos conteos; null si el período anterior es 0. */
export function variacionPct(actual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return Math.round(((actual - anterior) / anterior) * 1000) / 10;
}
