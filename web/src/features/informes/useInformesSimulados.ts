"use client";

import { useCallback, useMemo, useState } from "react";
import { evaluarEmision, type DecisionEmision } from "@/lib/informes/periodicidad";
import { CANDIDATOS_SIMULADOS, type CandidatoInforme } from "./datosSimulados";

export type EstadoInforme = "BORRADOR" | "ENVIADO" | "DESCARTADO";

export interface InformeSimulado extends CandidatoInforme {
  decision: Extract<DecisionEmision, { emitir: true }>;
  estado: EstadoInforme;
}

export interface CandidatoEnObservacion extends CandidatoInforme {
  decision: Extract<DecisionEmision, { emitir: false }>;
}

/** Estado local de la simulación: no persiste ni llama a la API. */
export function useInformesSimulados() {
  const [estados, setEstados] = useState<Record<string, EstadoInforme>>({});

  const { emitibles, enObservacion } = useMemo(() => {
    const emitibles: Omit<InformeSimulado, "estado">[] = [];
    const enObservacion: CandidatoEnObservacion[] = [];
    for (const c of CANDIDATOS_SIMULADOS) {
      const decision = evaluarEmision(c.senal);
      if (decision.emitir) emitibles.push({ ...c, decision });
      else enObservacion.push({ ...c, decision });
    }
    return { emitibles, enObservacion };
  }, []);

  const informes: InformeSimulado[] = emitibles.map((i) => ({
    ...i,
    estado: estados[i.id] ?? "BORRADOR",
  }));

  const cambiarEstado = useCallback((id: string, estado: EstadoInforme) => {
    setEstados((prev) => ({ ...prev, [id]: estado }));
  }, []);

  return { informes, enObservacion, cambiarEstado };
}
