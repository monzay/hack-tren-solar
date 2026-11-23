import { describe, expect, it } from "vitest";
import { CRITERIOS_EMISION, evaluarEmision, nivelRespaldo, type SenalRecomendacion } from "./periodicidad";

const base: SenalRecomendacion = {
  hechos: 48,
  semanasSostenida: 3,
  variacionPct: 116,
  ultimoInforme: null,
};

describe("evaluarEmision", () => {
  it("emite cuando hay hechos suficientes y el patrón es sostenido", () => {
    expect(evaluarEmision(base)).toEqual({ emitir: true, motivo: "NUEVO", respaldo: "MEDIO" });
  });

  it("no emite con pocos hechos y explica cuántos faltan", () => {
    const d = evaluarEmision({ ...base, hechos: 12 });
    expect(d.emitir).toBe(false);
    if (!d.emitir) expect(d.faltan[0]).toContain("Faltan 18 hechos");
  });

  it("no emite si el patrón no se sostuvo las semanas pedidas", () => {
    const d = evaluarEmision({ ...base, semanasSostenida: 1 });
    expect(d.emitir).toBe(false);
  });

  it("no repite un informe dentro del enfriamiento", () => {
    const d = evaluarEmision({ ...base, ultimoInforme: { haceDias: 5, variacionPct: 100 } });
    expect(d.emitir).toBe(false);
  });

  it("emite antes del enfriamiento si el patrón escaló", () => {
    const d = evaluarEmision({ ...base, variacionPct: 80, ultimoInforme: { haceDias: 10, variacionPct: 20 } });
    expect(d).toMatchObject({ emitir: true, motivo: "ESCALADA" });
  });

  it("vuelve a emitir pasado el enfriamiento", () => {
    const d = evaluarEmision({
      ...base,
      ultimoInforme: { haceDias: CRITERIOS_EMISION.diasEnfriamiento, variacionPct: 116 },
    });
    expect(d).toMatchObject({ emitir: true, motivo: "NUEVO" });
  });
});

describe("nivelRespaldo", () => {
  it("clasifica según el mínimo de hechos", () => {
    expect(nivelRespaldo(10, 30)).toBe("BAJO");
    expect(nivelRespaldo(30, 30)).toBe("MEDIO");
    expect(nivelRespaldo(60, 30)).toBe("ALTO");
  });
});
