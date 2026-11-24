import { CheckCircle2, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RECURSOS_URGENCIA } from "@/lib/dominio";
import type { CrearTicketRespuesta } from "@/lib/schemas";

export default function Confirmacion({ respuesta }: { respuesta: CrearTicketRespuesta }) {
  const recursos = respuesta.recursos.length > 0 ? respuesta.recursos : RECURSOS_URGENCIA;
  return (
    <section className="space-y-5" aria-labelledby="titulo-confirmacion">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 size-6 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h2 id="titulo-confirmacion" className="text-lg font-semibold" tabIndex={-1}>
            Recibimos tu reporte
          </h2>
          <p className="text-sm">{respuesta.mensaje}</p>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 text-sm font-semibold">Si necesitás ayuda ahora</h3>
        <ul className="space-y-2">
          {recursos.map((r) => (
            <li key={r.numero}>
              <a
                href={`tel:${r.numero}`}
                className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Phone className="size-4" aria-hidden="true" />
                <strong className="text-base">{r.numero}</strong>
                <span className="text-sm">{r.descripcion}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <Button asChild variant="outline">
        <Link href="/">Volver al mapa</Link>
      </Button>
    </section>
  );
}
