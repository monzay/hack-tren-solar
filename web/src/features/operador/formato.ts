import type { EstadoTicket } from "@/lib/dominio";

export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { timeZone: "UTC" });
}

export function fechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

export function varianteEstado(e: EstadoTicket): "default" | "secondary" | "outline" | "destructive" {
  if (e === "NUEVO") return "destructive";
  if (e === "CERRADO") return "outline";
  if (e === "DERIVADO") return "secondary";
  return "default";
}
