const CLAVE_LOCAL = "demo1234";
const HOSTS_LOCALES = new Set(["localhost", "127.0.0.1", "[::1]"]);
const LARGO_MINIMO_ADMIN = 12;

export interface ClavesSeed {
  demo: string;
  admin: string;
}

/**
 * Contraseñas de los usuarios del seed. En una base local alcanza con los valores por
 * defecto; en una remota hay que definirlas, y la del admin no puede ser la pública.
 */
export function clavesSeed(env: Record<string, string | undefined>): ClavesSeed {
  if (!env.DATABASE_URL) throw new Error("Falta DATABASE_URL");
  const demo = env.SEED_PASSWORD;
  const admin = env.SEED_ADMIN_PASSWORD;

  if (HOSTS_LOCALES.has(new URL(env.DATABASE_URL).hostname)) {
    const demoLocal = demo || CLAVE_LOCAL;
    return { demo: demoLocal, admin: admin || demoLocal };
  }
  if (!demo || !admin) {
    throw new Error("Base remota: definí SEED_PASSWORD y SEED_ADMIN_PASSWORD");
  }
  if (admin === demo || admin.length < LARGO_MINIMO_ADMIN) {
    throw new Error(
      `Base remota: SEED_ADMIN_PASSWORD debe ser distinta de SEED_PASSWORD y tener al menos ${LARGO_MINIMO_ADMIN} caracteres`,
    );
  }
  return { demo, admin };
}
