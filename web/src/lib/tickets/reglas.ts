import type { ModoTicket } from "@/lib/dominio";
import { ErrorHttp } from "@/lib/http";
import type { CrearTicketEntrada } from "@/lib/schemas";

export interface ConfigReglas {
  permiteAnonimo: boolean;
  requiereContacto: boolean;
}

/** Devuelve el modo final del ticket o lanza ErrorHttp(400). Función pura. */
export function validarReglasTicket(
  entrada: CrearTicketEntrada,
  config: ConfigReglas,
): ModoTicket {
  let modo: ModoTicket;
  if (entrada.quiereDenunciar) {
    modo = "CON_CONTACTO";
  } else if (entrada.modo === "ANONIMO") {
    if (!config.permiteAnonimo) {
      throw new ErrorHttp(400, "Esta categoría requiere datos de contacto");
    }
    modo = config.requiereContacto ? "CON_CONTACTO" : "ANONIMO";
  } else {
    modo = "CON_CONTACTO";
  }

  if (modo === "CON_CONTACTO") {
    const faltan: string[] = [];
    if (!entrada.contacto) faltan.push("los datos de contacto");
    if (!entrada.declaracionAceptada) faltan.push("la declaración jurada");
    if (faltan.length > 0) {
      throw new ErrorHttp(400, `Falta completar ${faltan.join(" y ")}`);
    }
  }
  return modo;
}
