import { describe, expect, it } from "vitest";
import {
  agregarEnGrilla,
  calcularTendencia,
  tasaPorMil,
  ultimosMeses,
} from "./agregacion";

describe("agregarEnGrilla", () => {
  it("agrupa por celda y oculta celdas bajo el umbral", () => {
    const puntos = [
      { lat: -24.181, lng: -65.301 },
      { lat: -24.182, lng: -65.302 },
      { lat: -24.183, lng: -65.303 },
      { lat: -24.5, lng: -65.0 },
    ];
    const celdas = agregarEnGrilla(puntos, 0.01, 2);
    expect(celdas).toHaveLength(1);
    expect(celdas[0].count).toBe(3);
  });

  it("no devuelve coordenadas originales", () => {
    const puntos = Array.from({ length: 5 }, () => ({
      lat: -24.1812,
      lng: -65.3017,
    }));
    const [celda] = agregarEnGrilla(puntos, 0.01, 1);
    expect(celda.lat).toBe(-24.185);
    expect(celda.lng).toBe(-65.305);
  });
});

describe("calcularTendencia", () => {
  it("calcula delta porcentual", () => {
    const t = calcularTendencia([
      { mes: "2026-01", count: 10 },
      { mes: "2026-02", count: 15 },
    ]);
    expect(t.deltaPct).toBe(50);
  });

  it("detecta picos atípicos", () => {
    const t = calcularTendencia([
      { mes: "1", count: 10 },
      { mes: "2", count: 11 },
      { mes: "3", count: 9 },
      { mes: "4", count: 10 },
      { mes: "5", count: 30 },
    ]);
    expect(t.pico).toBe(true);
  });

  it("devuelve null si no hay base de comparación", () => {
    expect(calcularTendencia([{ mes: "1", count: 3 }]).deltaPct).toBeNull();
  });
});

describe("utilidades", () => {
  it("genera los últimos meses en orden", () => {
    expect(ultimosMeses(3, new Date(Date.UTC(2026, 0, 15)))).toEqual([
      "2025-11",
      "2025-12",
      "2026-01",
    ]);
  });

  it("calcula tasa por 1.000 habitantes", () => {
    expect(tasaPorMil(25, 50000)).toBe(0.5);
  });
});
