import { prisma } from "@/lib/prisma";
import { requiereSesion } from "@/lib/auth/sesion";
import { ruta } from "@/lib/http";
import {
  CATEGORIAS,
  CATEGORIAS_ANONIMAS,
  RECURSOS_URGENCIA,
  organismosPorDefecto,
} from "@/lib/dominio";

export const GET = ruta(async () => {
  await requiereSesion(["ADMIN"]);
  const filas = await prisma.categoriaConfig.findMany();
  const porCategoria = new Map(filas.map((f) => [f.categoria, f]));
  const lista = CATEGORIAS.map((categoria) => {
    const f = porCategoria.get(categoria);
    if (f) {
      return {
        categoria,
        permiteAnonimo: f.permiteAnonimo,
        requiereContacto: f.requiereContacto,
        derivaSalud: f.derivaSalud,
        derivaPolicia: f.derivaPolicia,
        recursosUrgencia: f.recursosUrgencia,
      };
    }
    const permiteAnonimo = CATEGORIAS_ANONIMAS.includes(categoria);
    const organismos = organismosPorDefecto(categoria);
    return {
      categoria,
      permiteAnonimo,
      requiereContacto: !permiteAnonimo,
      derivaSalud: organismos.includes("SALUD"),
      derivaPolicia: organismos.includes("POLICIA"),
      recursosUrgencia: RECURSOS_URGENCIA.map((r) => ({ ...r })),
    };
  });
  return Response.json(lista);
});
