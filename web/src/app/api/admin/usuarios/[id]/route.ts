import bcrypt from "bcryptjs";
import { requiereSesion } from "@/lib/auth/sesion";
import { organismoDeRol } from "@/lib/dominio";
import { ErrorHttp, leerJson, ruta } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { UsuarioEntrada } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

async function idDe(ctx: Ctx): Promise<number> {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id <= 0) throw new ErrorHttp(400, "Id inválido");
  return id;
}

// .partial() quita los default(null/true): solo cambia lo que viene en el cuerpo.
const Parcial = UsuarioEntrada.partial();

export const PATCH = ruta(async (req: Request, ctx: Ctx) => {
  await requiereSesion(["ADMIN"]);
  const id = await idDe(ctx);
  const cuerpo = await leerJson(req, Parcial);
  const actual = await prisma.user.findUnique({ where: { id } });
  if (!actual) throw new ErrorHttp(404, "Usuario no encontrado");

  const role = cuerpo.role ?? actual.role;
  const organismo = cuerpo.organismo !== undefined ? cuerpo.organismo : actual.organismo;
  const esperado = organismoDeRol(role);
  if (esperado !== null && organismo !== esperado) {
    throw new ErrorHttp(422, "El organismo no coincide con el rol");
  }
  const email = cuerpo.email?.trim().toLowerCase();
  if (email && email !== actual.email && (await prisma.user.findUnique({ where: { email } }))) {
    throw new ErrorHttp(422, "Ya existe un usuario con ese email");
  }

  const u = await prisma.user.update({
    where: { id },
    data: {
      ...(email ? { email } : {}),
      ...(cuerpo.nombre !== undefined ? { nombre: cuerpo.nombre } : {}),
      role,
      organismo,
      ...(cuerpo.activo !== undefined ? { activo: cuerpo.activo } : {}),
      ...(cuerpo.password ? { passwordHash: await bcrypt.hash(cuerpo.password, 10) } : {}),
    },
  });
  return Response.json({
    id: u.id,
    email: u.email,
    nombre: u.nombre,
    role: u.role,
    organismo: u.organismo,
    activo: u.activo,
  });
});

export const DELETE = ruta(async (_req: Request, ctx: Ctx) => {
  await requiereSesion(["ADMIN"]);
  const id = await idDe(ctx);
  if (!(await prisma.user.findUnique({ where: { id } }))) {
    throw new ErrorHttp(404, "Usuario no encontrado");
  }
  await prisma.user.update({ where: { id }, data: { activo: false } });
  return new Response(null, { status: 204 });
});
