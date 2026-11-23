import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

/** Salud de la app y de la base. Sin `connection()` se prerenderizaría como estática. */
export async function GET() {
  await connection();
  try {
    await prisma.barrio.findFirst({ select: { id: true } });
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "error", mensaje: "Base de datos no disponible" }, { status: 503 });
  }
}
