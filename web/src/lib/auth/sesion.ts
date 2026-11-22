// CONTRATO (dueño: agente Auth, T004). Firmas fijas.
import type { Role } from "@/lib/dominio";
import { ErrorHttp } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { UsuarioSesion } from "@/lib/schemas";
import { leerCookieSesion, verificarToken } from "./jwt";
import { verificarRol } from "./roles";

export type Sesion = UsuarioSesion;

/** Sesión actual desde la cookie httpOnly, o null. Para Server Components y Route Handlers. */
export async function obtenerSesion(): Promise<Sesion | null> {
  const token = await leerCookieSesion();
  if (!token) return null;
  const id = await verificarToken(token);
  if (id === null) return null;
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u || !u.activo) return null;
  return { id: u.id, nombre: u.nombre, email: u.email, role: u.role, organismo: u.organismo };
}

/**
 * Exige sesión (401 si no hay) y, si se pasan roles, que el rol esté incluido (403).
 * Lanza ErrorHttp. Usar al inicio de cada Route Handler protegido.
 */
export async function requiereSesion(roles?: readonly Role[]): Promise<Sesion> {
  const sesion = await obtenerSesion();
  if (!sesion) throw new ErrorHttp(401, "Iniciá sesión");
  if (!verificarRol(sesion.role, roles)) throw new ErrorHttp(403, "No tenés permiso");
  return sesion;
}
