import type { Categoria, Franja } from "@/lib/dominio";

export interface FiltrosUI {
  categoria: Categoria | "";
  meses: 3 | 6 | 12;
  franja: Franja | "";
  fuente: "todas" | "oficial" | "ciudadano";
  barrioId: number | null;
}

export const FILTROS_INICIALES: FiltrosUI = {
  categoria: "",
  meses: 6,
  franja: "",
  fuente: "todas",
  barrioId: null,
};

/** Arma el query string de FiltrosMapa. `desde` se calcula al pedir (no entra en la clave). */
export function queryDeFiltros(f: FiltrosUI): string {
  const p = new URLSearchParams();
  if (f.categoria) p.set("categoria", f.categoria);
  if (f.franja) p.set("franja", f.franja);
  p.set("fuente", f.fuente);
  if (f.barrioId !== null) p.set("barrioId", String(f.barrioId));
  const desde = new Date();
  desde.setMonth(desde.getMonth() - f.meses);
  p.set("desde", desde.toISOString());
  p.set("hasta", new Date().toISOString());
  return p.toString();
}
