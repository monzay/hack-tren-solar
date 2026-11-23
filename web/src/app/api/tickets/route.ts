import { RECURSOS_URGENCIA } from "@/lib/dominio";
import { ipDe, leerJson, ruta } from "@/lib/http";
import { CrearTicketEntrada, type CrearTicketRespuesta } from "@/lib/schemas";
import { crearTicket } from "@/lib/tickets/crear";

export const POST = ruta(async (req: Request) => {
  const entrada = await leerJson(req, CrearTicketEntrada);
  await crearTicket(entrada, ipDe(req));
  const cuerpo: CrearTicketRespuesta = {
    ok: true,
    mensaje: "Recibimos tu reporte. No es una denuncia formal.",
    recursos: RECURSOS_URGENCIA.map((r) => ({ ...r })),
  };
  return Response.json(cuerpo, { status: 201 });
});
