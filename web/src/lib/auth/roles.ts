import type { Role } from "@/lib/dominio";

/** Función pura: true si no se exigen roles o si el rol está incluido. */
export function verificarRol(role: Role, rolesPermitidos?: readonly Role[]): boolean {
  if (!rolesPermitidos || rolesPermitidos.length === 0) return true;
  return rolesPermitidos.includes(role);
}
