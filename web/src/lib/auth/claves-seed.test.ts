import { describe, expect, it } from "vitest";
import { clavesSeed } from "./claves-seed";

const LOCAL = "mysql://u:p@localhost:3306/jujuy";
const REMOTA = "mysql://u:p@base.ejemplo.invalid:4000/jujuy?sslaccept=strict";
const ADMIN = "una-clave-larga-de-admin";

describe("clavesSeed", () => {
  it("en local usa los valores por defecto", () => {
    expect(clavesSeed({ DATABASE_URL: LOCAL })).toEqual({ demo: "demo1234", admin: "demo1234" });
  });

  it("en una base remota exige las dos contraseñas", () => {
    expect(() => clavesSeed({ DATABASE_URL: REMOTA })).toThrow("SEED_ADMIN_PASSWORD");
    expect(() => clavesSeed({ DATABASE_URL: REMOTA, SEED_PASSWORD: "x" })).toThrow();
    expect(() => clavesSeed({ DATABASE_URL: REMOTA, SEED_ADMIN_PASSWORD: ADMIN })).toThrow();
  });

  it("en una base remota rechaza un admin igual a la demo o corto", () => {
    const base = { DATABASE_URL: REMOTA };
    expect(() =>
      clavesSeed({ ...base, SEED_PASSWORD: ADMIN, SEED_ADMIN_PASSWORD: ADMIN }),
    ).toThrow("distinta");
    expect(() =>
      clavesSeed({ ...base, SEED_PASSWORD: "demo1234", SEED_ADMIN_PASSWORD: "corta" }),
    ).toThrow("12");
  });

  it("en una base remota devuelve las contraseñas definidas", () => {
    expect(
      clavesSeed({ DATABASE_URL: REMOTA, SEED_PASSWORD: "demo1234", SEED_ADMIN_PASSWORD: ADMIN }),
    ).toEqual({ demo: "demo1234", admin: ADMIN });
  });
});
