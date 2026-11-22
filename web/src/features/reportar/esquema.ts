import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldErrors, Resolver } from "react-hook-form";
import type { z } from "zod";
import { CATEGORIAS_ANONIMAS } from "@/lib/dominio";
import { CrearTicketEntrada } from "@/lib/schemas";

/** Lo que maneja el formulario (antes de validar). */
export type ValoresReporte = z.input<typeof CrearTicketEntrada>;
export type SalidaReporte = z.output<typeof CrearTicketEntrada>;

export function esAnonimaPosible(categoria: ValoresReporte["categoria"] | undefined): boolean {
  return categoria !== undefined && CATEGORIAS_ANONIMAS.includes(categoria);
}

export function requiereContacto(v: Partial<ValoresReporte>): boolean {
  return v.modo === "CON_CONTACTO" || v.quiereDenunciar === true;
}

/** Declaración jurada: categorías sin anonimato, o cuando se quiere registrar denuncia. */
export function requiereDeclaracion(v: Partial<ValoresReporte>): boolean {
  return requiereContacto(v) && (!esAnonimaPosible(v.categoria) || v.quiereDenunciar === true);
}

function vacio(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t ? t : undefined;
}

/** Limpia strings vacíos y descarta el contacto cuando no corresponde. */
function normalizar(v: ValoresReporte): ValoresReporte {
  const contacto = requiereContacto(v)
    ? {
        nombre: v.contacto?.nombre ?? "",
        telefono: vacio(v.contacto?.telefono),
        email: vacio(v.contacto?.email),
        horario: vacio(v.contacto?.horario),
      }
    : undefined;
  return {
    ...v,
    relato: vacio(v.relato),
    quiereDenunciar: v.quiereDenunciar === true,
    declaracionAceptada: v.declaracionAceptada === true,
    contacto,
  };
}

const base = zodResolver(CrearTicketEntrada) as unknown as Resolver<ValoresReporte, unknown, SalidaReporte>;

export const resolverReporte: Resolver<ValoresReporte, unknown, SalidaReporte> = async (
  valores,
  contexto,
  opciones,
) => {
  const limpio = normalizar(valores);
  const res = await base(limpio, contexto, opciones);
  if (requiereDeclaracion(limpio) && !limpio.declaracionAceptada) {
    const errores = {
      ...(res.errors as FieldErrors<ValoresReporte>),
      declaracionAceptada: {
        type: "required",
        message: "Tenés que aceptar la declaración para continuar",
      },
    } as FieldErrors<ValoresReporte>;
    return { values: {}, errors: errores };
  }
  return res;
};
