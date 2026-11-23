import { describe, expect, it } from "vitest";
import { puntoEnPoligono } from "./poligono";

const cuadrado = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];
const agujero = [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]];
const poly = { type: "Polygon", coordinates: [cuadrado, agujero] };

describe("puntoEnPoligono", () => {
  it("dentro", () => expect(puntoEnPoligono(2, 2, poly)).toBe(true));
  it("fuera", () => expect(puntoEnPoligono(20, 20, poly)).toBe(false));
  it("agujero", () => expect(puntoEnPoligono(5, 5, poly)).toBe(false));
  it("MultiPolygon", () => {
    const multi = {
      type: "MultiPolygon",
      coordinates: [[cuadrado], [[[20, 20], [30, 20], [30, 30], [20, 30], [20, 20]]]],
    };
    expect(puntoEnPoligono(25, 25, multi)).toBe(true);
    expect(puntoEnPoligono(15, 15, multi)).toBe(false);
    expect(puntoEnPoligono(2, 8, multi)).toBe(true);
  });
});
