import { PrismaClient } from "@prisma/client";

// Una sola instancia por proceso: en desarrollo el hot reload de Next
// volvería a crear el cliente y agotaría las conexiones de MySQL.
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalParaPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
