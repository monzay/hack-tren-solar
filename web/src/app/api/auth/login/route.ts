import bcrypt from "bcryptjs";
import { firmarToken, setearCookieSesion } from "@/lib/auth/jwt";
import { ErrorHttp, ipDe, leerJson, ruta } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { consumir } from "@/lib/rate-limit";
import { LoginEntrada, type UsuarioSesion } from "@/lib/schemas";

export const POST = ruta(async (req: Request) => {
  const { email, password } = await leerJson(req, LoginEntrada);
  const emailNorm = email.trim().toLowerCase();

  const permitido = await consumir(`login:${ipDe(req)}:${emailNorm}`, 5, 60_000);
  if (!permitido) throw new ErrorHttp(429, "Demasiados intentos, probá en un minuto");

  const u = await prisma.user.findUnique({ where: { email: emailNorm } });
  // Si el usuario no existe se compara igual contra un hash para igualar tiempos.
  const hash = u?.passwordHash ?? (await bcrypt.hash("sin-usuario", 10));
  const ok = await bcrypt.compare(password, hash);
  if (!u || !u.activo || !ok) throw new ErrorHttp(401, "Email o contraseña incorrectos");

  await setearCookieSesion(await firmarToken(u.id));
  const usuario: UsuarioSesion = {
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    role: u.role,
    organismo: u.organismo,
  };
  return Response.json({ usuario });
});
