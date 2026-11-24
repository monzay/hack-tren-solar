import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const NOMBRE_COOKIE = "sesion";

function secreto(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("Falta JWT_SECRET");
  return new TextEncoder().encode(s);
}

function expiracion(): string {
  return process.env.JWT_EXPIRES_IN || "8h";
}

/** Duración en segundos de la expiración configurada (formatos "30m", "8h", "7d", "3600"). */
function segundosDe(valor: string): number {
  const m = /^(\d+)\s*([smhd]?)$/.exec(valor.trim());
  if (!m) return 8 * 3600;
  const mult: Record<string, number> = { "": 1, s: 1, m: 60, h: 3600, d: 86400 };
  return Number(m[1]) * mult[m[2]];
}

export async function firmarToken(usuarioId: number): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(usuarioId))
    .setIssuedAt()
    .setExpirationTime(expiracion())
    .sign(secreto());
}

/** Devuelve el id de usuario o null si el token es inválido o venció. */
export async function verificarToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, secreto(), { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

function opcionesCookie(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function setearCookieSesion(token: string): Promise<void> {
  const c = await cookies();
  c.set(NOMBRE_COOKIE, token, opcionesCookie(segundosDe(expiracion())));
}

export async function borrarCookieSesion(): Promise<void> {
  const c = await cookies();
  c.set(NOMBRE_COOKIE, "", opcionesCookie(0));
}

export async function leerCookieSesion(): Promise<string | null> {
  const c = await cookies();
  return c.get(NOMBRE_COOKIE)?.value ?? null;
}
