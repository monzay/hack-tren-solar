import { SIGUIENTE_ESTADO, type EstadoTicket, type Organismo } from "@/lib/dominio";
import { ErrorHttp } from "@/lib/http";

/** Un operador solo ve tickets derivados a su organismo. */
export function puedeVerTicket(
  organismoOperador: Organismo | null,
  organismosDelTicket: readonly Organismo[],
): boolean {
  return organismoOperador !== null && organismosDelTicket.includes(organismoOperador);
}

/** Solo se permite avanzar al estado siguiente. */
export function validarTransicion(actual: EstadoTicket, nuevo: EstadoTicket): void {
  if (SIGUIENTE_ESTADO[actual] !== nuevo) {
    throw new ErrorHttp(422, "Transición de estado no permitida");
  }
}
