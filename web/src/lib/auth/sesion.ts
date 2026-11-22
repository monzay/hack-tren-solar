// CONTRATO (dueño: agente Auth, T004). Firmas fijas; el cuerpo lo implementa T004.
import type { Role } from "@/lib/dominio";
import type { UsuarioSesion } from "@/lib/schemas";

export type Sesion = UsuarioSesion;

/** Sesión actual desde la cookie httpOnly, o null. Para Server Components y Route Handlers. */
export async function obtenerSesion(): Promise<Sesion | null> {
  throw new Error("Pendiente T004");
}

/**
 * Exige sesión (401 si no hay) y, si se pasan roles, que el rol esté incluido (403).
 * Lanza ErrorHttp. Usar al inicio de cada Route Handler protegido.
 */
export async function requiereSesion(roles?: readonly Role[]): Promise<Sesion> {
  void roles;
  throw new Error("Pendiente T004");
}
