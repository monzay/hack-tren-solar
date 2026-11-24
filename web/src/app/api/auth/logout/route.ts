import { borrarCookieSesion } from "@/lib/auth/jwt";
import { ruta } from "@/lib/http";

export const POST = ruta(async () => {
  await borrarCookieSesion();
  return Response.json({ ok: true });
});
