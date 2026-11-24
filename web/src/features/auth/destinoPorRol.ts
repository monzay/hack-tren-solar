import type { Role } from "@/lib/dominio";

export function destinoPorRol(role: Role): string {
  if (role === "OPERADOR_SALUD" || role === "OPERADOR_POLICIA") return "/operador";
  if (role === "ADMIN") return "/admin";
  return "/estadisticas";
}

/** Solo rutas internas: evita redirecciones abiertas. */
export function siguienteSeguro(valor: string | null): string | null {
  if (valor && valor.startsWith("/") && !valor.startsWith("//") && !valor.startsWith("/\\")) {
    return valor;
  }
  return null;
}
