import { describe, expect, it } from "vitest";
import { ErrorHttp } from "@/lib/http";
import type { CrearTicketEntrada } from "@/lib/schemas";
import { validarReglasTicket } from "./reglas";

const base: CrearTicketEntrada = {
  categoria: "ROBO",
  modo: "ANONIMO",
  rolReportante: "VICTIMA",
  fecha: new Date("2026-01-01"),
  franja: "NOCHE",
  lat: -24.18,
  lng: -65.3,
  quiereDenunciar: false,
  declaracionAceptada: false,
};
const contacto = { nombre: "Ana", telefono: "388123" };
const anon = { permiteAnonimo: true, requiereContacto: false };
const noAnon = { permiteAnonimo: false, requiereContacto: true };

const status = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return e instanceof ErrorHttp ? e.status : -1;
  }
  return 0;
};

describe("validarReglasTicket", () => {
  it("abuso sexual anónimo sin contacto OK", () => {
    expect(validarReglasTicket({ ...base, categoria: "ABUSO_SEXUAL" }, anon)).toBe("ANONIMO");
  });
  it("robo anónimo -> 400", () => {
    expect(status(() => validarReglasTicket(base, noAnon))).toBe(400);
  });
  it("robo con contacto sin declaración -> 400", () => {
    const e = { ...base, modo: "CON_CONTACTO" as const, contacto };
    expect(status(() => validarReglasTicket(e, noAnon))).toBe(400);
  });
  it("robo con contacto y declaración OK", () => {
    const e = { ...base, modo: "CON_CONTACTO" as const, contacto, declaracionAceptada: true };
    expect(validarReglasTicket(e, noAnon)).toBe("CON_CONTACTO");
  });
  it("anónimo + quiereDenunciar -> CON_CONTACTO y exige contacto", () => {
    const e = { ...base, categoria: "ABUSO_SEXUAL" as const, quiereDenunciar: true };
    expect(status(() => validarReglasTicket(e, anon))).toBe(400);
    expect(validarReglasTicket({ ...e, contacto, declaracionAceptada: true }, anon)).toBe(
      "CON_CONTACTO",
    );
  });
});
