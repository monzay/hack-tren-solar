import { Phone } from "lucide-react";

const RECURSOS = [
  { numero: "911", descripcion: "Emergencias" },
  { numero: "144", descripcion: "Violencia de género" },
  { numero: "102", descripcion: "Niñas, niños y adolescentes" },
];

export default function PieUrgencias() {
  return (
    <footer className="border-t bg-muted">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4">
        <ul
          aria-label="Recursos de urgencia"
          className="flex flex-wrap gap-x-6 gap-y-2"
        >
          {RECURSOS.map(({ numero, descripcion }) => (
            <li key={numero}>
              <a
                href={`tel:${numero}`}
                className="inline-flex items-center gap-2 rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Phone className="size-4 text-primary" aria-hidden="true" />
                <strong className="text-base">{numero}</strong>
                <span>{descripcion}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Esta plataforma no reemplaza una denuncia formal.
        </p>
      </div>
    </footer>
  );
}
