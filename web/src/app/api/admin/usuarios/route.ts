import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { requiereSesion } from "@/lib/auth/sesion";
import { organismoDeRol } from "@/lib/dominio";
import { ErrorHttp, leerJson, ruta } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { UsuarioEntrada, type UsuarioVista } from "@/lib/schemas";

function vistaDe(u: User): UsuarioVista {
  return {
    id: u.id,
    email: u.email,
    nombre: u.nombre,
    role: u.role,
    organismo: u.organismo,
    activo: u.activo,
  };
}

export const GET = ruta(async () => {
  await requiereSesion(["ADMIN"]);
  const filas = await prisma.user.findMany({ orderBy: { id: "asc" } });
  return Response.json(filas.map(vistaDe));
});

export const POST = ruta(async (req: Request) => {
  await requiereSesion(["ADMIN"]);
  const e = await leerJson(req, UsuarioEntrada);
  if (!e.password) throw new ErrorHttp(422, "La contraseña es obligatoria");
  const esperado = organismoDeRol(e.role);
  if (esperado !== null && e.organismo !== esperado) {
    throw new ErrorHttp(422, "El organismo no coincide con el rol");
  }
  const email = e.email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new ErrorHttp(422, "Ya existe un usuario con ese email");
  }
  const u = await prisma.user.create({
    data: {
      email,
      nombre: e.nombre,
      role: e.role,
      organismo: e.organismo,
      activo: e.activo,
      passwordHash: await bcrypt.hash(e.password, 10),
    },
  });
  return Response.json(vistaDe(u), { status: 201 });
});
