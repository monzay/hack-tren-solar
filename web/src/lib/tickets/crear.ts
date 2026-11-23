import { CATEGORIAS_ANONIMAS, organismosPorDefecto, type Organismo } from "@/lib/dominio";
import { asignarBarrio } from "@/lib/geo/ciudad";
import { cifrar } from "@/lib/crypto";
import { ErrorHttp } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { consumir } from "@/lib/rate-limit";
import type { CrearTicketEntrada } from "@/lib/schemas";
import { validarReglasTicket } from "./reglas";

/** Crea el ticket. No loguear contacto ni relato. */
export async function crearTicket(entrada: CrearTicketEntrada, ip: string): Promise<void> {
  if (!(await consumir("ticket:" + ip, 5, 3_600_000))) {
    throw new ErrorHttp(429, "Alcanzaste el límite de reportes, probá más tarde");
  }

  const config = await prisma.categoriaConfig.findUnique({
    where: { categoria: entrada.categoria },
  });
  const reglas = config ?? {
    permiteAnonimo: CATEGORIAS_ANONIMAS.includes(entrada.categoria),
    requiereContacto: false,
  };
  const modo = validarReglasTicket(entrada, reglas);

  const organismos: Organismo[] = config
    ? [
        ...(config.derivaSalud ? (["SALUD"] as const) : []),
        ...(config.derivaPolicia ? (["POLICIA"] as const) : []),
      ]
    : organismosPorDefecto(entrada.categoria);

  const barrios = (
    await prisma.barrio.findMany({ select: { id: true, poligono: true, centroLat: true, centroLng: true } })
  ).map((b) => ({ ...b, centroLat: Number(b.centroLat), centroLng: Number(b.centroLng) }));
  const barrio = asignarBarrio(entrada.lat, entrada.lng, barrios);
  if (!barrio) throw new ErrorHttp(422, "La ubicación está fuera de San Salvador de Jujuy");

  const contacto = modo === "CON_CONTACTO" ? entrada.contacto : undefined;
  const enc = (v?: string) => (v ? cifrar(v) : null);

  await prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.create({
      data: {
        categoria: entrada.categoria,
        modo,
        rolReportante: entrada.rolReportante,
        fecha: entrada.fecha,
        franja: entrada.franja,
        lat: entrada.lat,
        lng: entrada.lng,
        barrioId: barrio.id,
        relato: entrada.relato || null,
        quiereDenunciar: entrada.quiereDenunciar,
        declaracionAceptada: modo === "CON_CONTACTO" ? entrada.declaracionAceptada : false,
      },
    });
    if (organismos.length > 0) {
      await tx.ticketDerivacion.createMany({
        data: organismos.map((organismo) => ({ ticketId: ticket.id, organismo })),
      });
    }
    if (contacto) {
      await tx.contactoTicket.create({
        data: {
          ticketId: ticket.id,
          nombre: enc(contacto.nombre),
          telefono: enc(contacto.telefono),
          email: enc(contacto.email),
          horario: enc(contacto.horario),
        },
      });
    }
  });
}
