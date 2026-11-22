import { describe, expect, it } from "vitest";
import { asignarBarrio, dentroDeCiudad } from "./ciudad";

const cuadrado = (lat: number, lng: number, d: number) => ({
  type: "Polygon",
  coordinates: [
    [
      [lng - d, lat - d],
      [lng + d, lat - d],
      [lng + d, lat + d],
      [lng - d, lat + d],
      [lng - d, lat - d],
    ],
  ],
});

const barrios = [
  { id: 1, centroLat: -24.1858, centroLng: -65.2995, poligono: cuadrado(-24.1858, -65.2995, 0.003) },
  { id: 2, centroLat: -24.235, centroLng: -65.265, poligono: cuadrado(-24.235, -65.265, 0.008) },
];

describe("ubicación en la ciudad", () => {
  it("acepta el centro y Alto Comedero, rechaza Buenos Aires", () => {
    expect(dentroDeCiudad(-24.1858, -65.2995)).toBe(true);
    expect(dentroDeCiudad(-24.235, -65.265)).toBe(true);
    expect(dentroDeCiudad(-34.6, -58.4)).toBe(false);
  });

  it("asigna el barrio que contiene el punto", () => {
    expect(asignarBarrio(-24.186, -65.3, barrios)?.id).toBe(1);
  });

  it("un punto entre polígonos va al barrio más cercano (antes daba 422)", () => {
    expect(asignarBarrio(-24.195, -65.296, barrios)?.id).toBe(1);
  });

  it("fuera de la ciudad devuelve null", () => {
    expect(asignarBarrio(-34.6, -58.4, barrios)).toBeNull();
  });
});
