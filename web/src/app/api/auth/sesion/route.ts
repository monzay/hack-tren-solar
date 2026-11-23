import { obtenerSesion } from "@/lib/auth/sesion";
import { ruta } from "@/lib/http";

export const GET = ruta(async () => {
  const usuario = await obtenerSesion();
  return Response.json({ usuario });
});
