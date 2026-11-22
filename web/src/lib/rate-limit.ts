// CONTRATO (dueño: agente Auth, T004). Contador en la tabla RateLimit (ventana fija).
import { prisma } from "@/lib/prisma";

/** Suma 1 al contador de `clave`. Devuelve false si se superó `limite` dentro de `ventanaMs`. */
export async function consumir(clave: string, limite: number, ventanaMs: number): Promise<boolean> {
  const ahora = new Date();
  const actual = await prisma.rateLimit.findUnique({ where: { clave } });
  if (!actual || ahora.getTime() - actual.ventanaInicio.getTime() >= ventanaMs) {
    await prisma.rateLimit.upsert({
      where: { clave },
      create: { clave, ventanaInicio: ahora, contador: 1 },
      update: { ventanaInicio: ahora, contador: 1 },
    });
    return limite >= 1;
  }
  const nuevo = await prisma.rateLimit.update({
    where: { clave },
    data: { contador: { increment: 1 } },
  });
  return nuevo.contador <= limite;
}
