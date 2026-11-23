/**
 * Cuándo una recomendación justifica un informe para una entidad.
 * No hay calendario fijo: se emite solo si hay evidencia suficiente y sostenida,
 * y no se repite un informe igual reciente salvo que el patrón empeore.
 */

export interface CriteriosEmision {
  /** Hechos mínimos (oficiales + reportes) en la ventana que respaldan la recomendación. */
  minHechos: number;
  /** Ventana de conteo en días. */
  ventanaDias: number;
  /** Semanas consecutivas en que la regla debe cumplirse. */
  semanasSostenidas: number;
  /** Días sin repetir un informe de la misma regla, zona y entidad. */
  diasEnfriamiento: number;
  /** Puntos porcentuales de empeoramiento que habilitan un informe antes del enfriamiento. */
  escaladaPuntos: number;
}

export const CRITERIOS_EMISION: CriteriosEmision = {
  minHechos: 30,
  ventanaDias: 30,
  semanasSostenidas: 2,
  diasEnfriamiento: 14,
  escaladaPuntos: 50,
};

export interface SenalRecomendacion {
  hechos: number;
  semanasSostenida: number;
  variacionPct: number | null;
  ultimoInforme: { haceDias: number; variacionPct: number | null } | null;
}

export type Respaldo = "BAJO" | "MEDIO" | "ALTO";

export type DecisionEmision =
  | { emitir: true; motivo: "NUEVO" | "ESCALADA"; respaldo: Respaldo }
  | { emitir: false; faltan: string[]; respaldo: Respaldo };

export function nivelRespaldo(hechos: number, minHechos: number): Respaldo {
  if (hechos >= 2 * minHechos) return "ALTO";
  if (hechos >= minHechos) return "MEDIO";
  return "BAJO";
}

function escalo(senal: SenalRecomendacion, puntos: number): boolean {
  const previa = senal.ultimoInforme?.variacionPct;
  if (previa === null || previa === undefined || senal.variacionPct === null) return false;
  return senal.variacionPct - previa >= puntos;
}

export function evaluarEmision(
  senal: SenalRecomendacion,
  criterios: CriteriosEmision = CRITERIOS_EMISION,
): DecisionEmision {
  const respaldo = nivelRespaldo(senal.hechos, criterios.minHechos);
  const faltan: string[] = [];

  if (senal.hechos < criterios.minHechos) {
    faltan.push(
      `Faltan ${criterios.minHechos - senal.hechos} hechos (hay ${senal.hechos} de ${criterios.minHechos} en ${criterios.ventanaDias} días)`,
    );
  }
  if (senal.semanasSostenida < criterios.semanasSostenidas) {
    faltan.push(
      `El patrón lleva ${senal.semanasSostenida} de ${criterios.semanasSostenidas} semanas seguidas`,
    );
  }

  const reciente =
    senal.ultimoInforme !== null && senal.ultimoInforme.haceDias < criterios.diasEnfriamiento;
  const escalada = reciente && escalo(senal, criterios.escaladaPuntos);
  if (reciente && !escalada) {
    faltan.push(
      `Ya se envió un informe igual hace ${senal.ultimoInforme!.haceDias} días (espera ${criterios.diasEnfriamiento})`,
    );
  }

  if (faltan.length > 0) return { emitir: false, faltan, respaldo };
  return { emitir: true, motivo: escalada ? "ESCALADA" : "NUEVO", respaldo };
}
