import { describe, expect, it } from "vitest";
import { ErrorHttp } from "@/lib/http";
import { puedeVerTicket, validarTransicion } from "./acceso";

describe("puedeVerTicket", () => {
  it("operador de SALUD no ve un ticket solo de POLICIA", () => {
    expect(puedeVerTicket("SALUD", ["POLICIA"])).toBe(false);
  });
  it("operador de SALUD ve un ticket derivado a ambos", () => {
    expect(puedeVerTicket("SALUD", ["SALUD", "POLICIA"])).toBe(true);
  });
  it("sin organismo no ve nada", () => {
    expect(puedeVerTicket(null, ["SALUD"])).toBe(false);
  });
});

describe("validarTransicion", () => {
  it("NUEVO -> CONTACTADO es válida", () => {
    expect(() => validarTransicion("NUEVO", "CONTACTADO")).not.toThrow();
  });
  it.each([
    ["NUEVO", "CERRADO"],
    ["CERRADO", "NUEVO"],
  ] as const)("%s -> %s falla con 422", (de, a) => {
    let error: unknown;
    try {
      validarTransicion(de, a);
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(ErrorHttp);
    expect((error as ErrorHttp).status).toBe(422);
  });
});
