// AES-256-GCM con ENCRYPTION_KEY (32 bytes en base64).
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function clave(): Buffer {
  const b64 = process.env.ENCRYPTION_KEY;
  if (!b64) throw new Error("Falta la variable de entorno ENCRYPTION_KEY");
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) throw new Error("ENCRYPTION_KEY debe ser de 32 bytes en base64");
  return key;
}

/** Cifra un texto. Formato de salida: base64(iv).base64(tag).base64(datos). */
export function cifrar(texto: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", clave(), iv);
  const datos = Buffer.concat([cipher.update(texto, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, datos].map((b) => b.toString("base64")).join(".");
}

export function descifrar(cifrado: string): string {
  const partes = cifrado.split(".");
  if (partes.length !== 3) throw new Error("Formato de dato cifrado inválido");
  const [iv, tag, datos] = partes.map((p) => Buffer.from(p, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", clave(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(datos), decipher.final()]).toString("utf8");
}
