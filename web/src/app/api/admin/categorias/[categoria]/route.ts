import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requiereSesion } from "@/lib/auth/sesion";
import { ErrorHttp, leerJson, ruta } from "@/lib/http";
import { CategoriaConfigEntrada } from "@/lib/schemas";
import { CATEGORIAS, type Categoria } from "@/lib/dominio";

export const PATCH = ruta(
  async (req: Request, ctx: { params: Promise<{ categoria: string }> }) => {
    await requiereSesion(["ADMIN"]);
    const { categoria } = await ctx.params;
    if (!(CATEGORIAS as readonly string[]).includes(categoria)) {
      throw new ErrorHttp(404, "No existe la categoría");
    }
    const cat = categoria as Categoria;
    const d = await leerJson(req, CategoriaConfigEntrada);
    if (!d.derivaSalud && !d.derivaPolicia) {
      throw new ErrorHttp(422, "La categoría debe derivar a al menos un organismo");
    }
    const datos = {
      permiteAnonimo: d.permiteAnonimo,
      requiereContacto: d.requiereContacto,
      derivaSalud: d.derivaSalud,
      derivaPolicia: d.derivaPolicia,
      recursosUrgencia: d.recursosUrgencia as Prisma.InputJsonValue,
    };
    const f = await prisma.categoriaConfig.upsert({
      where: { categoria: cat },
      create: { categoria: cat, ...datos },
      update: datos,
    });
    return Response.json({
      categoria: f.categoria,
      permiteAnonimo: f.permiteAnonimo,
      requiereContacto: f.requiereContacto,
      derivaSalud: f.derivaSalud,
      derivaPolicia: f.derivaPolicia,
      recursosUrgencia: f.recursosUrgencia,
    });
  },
);
