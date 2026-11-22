import { describe, expect, it } from "vitest";
import { armarCalor } from "./calor";

const BASE_LAT = Math.floor(-24.1858 / 0.0009) * 0.0009;
const BASE_LNG = Math.floor(-65.2995 / 0.0009) * 0.0009;
const puntos = [
  // Tres puntos dentro de una misma celda (se evita el borde de la grilla).
  { lat: BASE_LAT + 0.0002, lng: BASE_LNG + 0.0002 },
  { lat: BASE_LAT + 0.0003, lng: BASE_LNG + 0.0004 },
  { lat: BASE_LAT + 0.0004, lng: BASE_LNG + 0.0003 },
  { lat: -24.19234, lng: -65.30871 },
  { lat: -24.2011, lng: -65.2877 },
];

describe("armarCalor (privacidad)", () => {
  it("no devuelve ninguna coordenada exacta de entrada", () => {
    const r = armarCalor(puntos, 1);
    for (const [lat, lng] of r.puntos) {
      for (const p of puntos) {
        expect(lat).not.toBe(p.lat);
        expect(lng).not.toBe(p.lng);
      }
    }
  });

  it("agrupa y conserva el total", () => {
    const r = armarCalor(puntos, 1);
    expect(r.total).toBe(puntos.length);
    expect(r.puntos.length).toBeLessThan(puntos.length);
  });

  it("respeta minCount", () => {
    const r = armarCalor(puntos, 2);
    expect(r.puntos.length).toBeGreaterThan(0);
    expect(r.puntos.every(([, , c]) => c >= 2)).toBe(true);
    expect(r.total).toBe(3);
  });

  it("sin puntos devuelve vacío", () => {
    expect(armarCalor([], 1).puntos).toEqual([]);
  });
});
