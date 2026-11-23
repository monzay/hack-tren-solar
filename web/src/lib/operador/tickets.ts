import type { Prisma } from "@prisma/client";
import { descifrar } from "@/lib/crypto";
import type { Organismo } from "@/lib/dominio";
import { ErrorHttp } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { TicketBandeja, TicketDetalle } from "@/lib/schemas";
import { puedeVerTicket } from "./acceso";

type TicketConBarrio = Prisma.TicketGetPayload<{
  include: { barrio: true; derivaciones: true };
}>;

export interface FiltrosBandejaEntrada {
  estado?: TicketBandeja["estado"];
  categoria?: TicketBandeja["categoria"];
}

function aBandeja(t: TicketConBarrio): TicketBandeja {
  return {
    id: t.id,
    categoria: t.categoria,
    modo: t.modo,
    estado: t.estado,
    fecha: t.fecha.toISOString(),
    franja: t.franja,
    barrio: t.barrio.nombre,
    organismos: t.derivaciones.map((d) => d.organismo),
    createdAt: t.createdAt.toISOString(),
  };
}

export async function listarBandeja(
  organismo: Organismo,
  filtros: FiltrosBandejaEntrada,
): Promise<TicketBandeja[]> {
  const tickets = await prisma.ticket.findMany({
    where: {
      deletedAt: null,
      derivaciones: { some: { organismo } },
      ...(filtros.estado ? { estado: filtros.estado } : {}),
      ...(filtros.categoria ? { categoria: filtros.categoria } : {}),
    },
    include: { barrio: true, derivaciones: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return tickets.map(aBandeja);
}

/** Valida existencia (404) y pertenencia al organismo (403). */
export async function exigirTicketPropio(id: number, organismo: Organismo) {
  const ticket = await prisma.ticket.findFirst({
    where: { id, deletedAt: null },
    include: { derivaciones: true },
  });
  if (!ticket) throw new ErrorHttp(404, "Ticket no encontrado");
  const organismos = ticket.derivaciones.map((d) => d.organismo);
  if (!puedeVerTicket(organismo, organismos)) {
    throw new ErrorHttp(403, "No tenés acceso a este ticket");
  }
  return ticket;
}

function descifrarOpcional(valor: string | null): string | null {
  return valor === null ? null : descifrar(valor);
}

/**
 * Arma el detalle. Con `auditar` descifra el contacto y registra el acceso;
 * sin `auditar` (tras cambiar estado) no vuelve a registrar.
 */
export async function obtenerDetalle(
  id: number,
  organismo: Organismo,
  usuarioId: number,
  auditar: boolean,
): Promise<TicketDetalle> {
  await exigirTicketPropio(id, organismo);
  const t = await prisma.ticket.findUniqueOrThrow({
    where: { id },
    include: {
      barrio: true,
      derivaciones: true,
      contacto: true,
      notas: { include: { autor: true }, orderBy: { createdAt: "asc" } },
      historial: { include: { autor: true }, orderBy: { fecha: "asc" } },
    },
  });

  const c = t.contacto && !t.contacto.deletedAt ? t.contacto : null;
  const contacto = c
    ? {
        nombre: descifrarOpcional(c.nombre),
        telefono: descifrarOpcional(c.telefono),
        email: descifrarOpcional(c.email),
        horario: descifrarOpcional(c.horario),
      }
    : null;

  if (contacto && auditar) {
    await prisma.accesoContacto.create({ data: { ticketId: id, usuarioId } });
  }

  return {
    ...aBandeja(t),
    rolReportante: t.rolReportante,
    relato: t.relato,
    quiereDenunciar: t.quiereDenunciar,
    lat: Number(t.lat),
    lng: Number(t.lng),
    contacto,
    notas: t.notas.map((n) => ({
      id: n.id,
      texto: n.texto,
      autor: n.autor.nombre,
      createdAt: n.createdAt.toISOString(),
    })),
    historial: t.historial.map((h) => ({
      de: h.de,
      a: h.a,
      autor: h.autor.nombre,
      fecha: h.fecha.toISOString(),
    })),
  };
}
