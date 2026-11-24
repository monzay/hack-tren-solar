import { describe, expect, it } from "vitest";
import { verificarRol } from "./roles";

describe("verificarRol", () => {
  it("pasa si no se exigen roles", () => {
    expect(verificarRol("CIUDADANO")).toBe(true);
    expect(verificarRol("CIUDADANO", [])).toBe(true);
  });
  it("pasa si el rol está incluido", () => {
    expect(verificarRol("ADMIN", ["ADMIN", "ANALISTA"])).toBe(true);
  });
  it("falla si el rol no está incluido", () => {
    expect(verificarRol("OPERADOR_SALUD", ["ADMIN"])).toBe(false);
  });
});
