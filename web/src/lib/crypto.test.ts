import { beforeAll, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { cifrar, descifrar } from "./crypto";

describe("crypto", () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = randomBytes(32).toString("base64");
  });

  it("ida y vuelta", () => {
    expect(descifrar(cifrar("María Pérez 388-1234"))).toBe("María Pérez 388-1234");
  });

  it("dos cifrados del mismo texto difieren", () => {
    expect(cifrar("hola")).not.toBe(cifrar("hola"));
  });
});
