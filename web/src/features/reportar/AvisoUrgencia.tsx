import { Phone, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RECURSOS_URGENCIA } from "@/lib/dominio";

export default function AvisoUrgencia() {
  return (
    <Alert>
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>Esto no es una denuncia formal</AlertTitle>
      <AlertDescription>
        <p>
          Este reporte ayuda a prevenir y a orientar la atención, pero no reemplaza una denuncia.
          Si estás en peligro, llamá ahora:
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1" aria-label="Números de urgencia">
          {RECURSOS_URGENCIA.map((r) => (
            <li key={r.numero}>
              <a
                href={`tel:${r.numero}`}
                className="inline-flex items-center gap-1.5 rounded-md font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Phone className="size-4" aria-hidden="true" />
                {r.numero} <span className="font-normal">{r.descripcion}</span>
              </a>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
