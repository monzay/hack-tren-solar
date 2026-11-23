import { Check, FileText, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORIA_ETIQUETA, FRANJA_ETIQUETA, ORGANISMO_ETIQUETA } from "@/lib/dominio";
import { FECHA_SIMULADA, MODELO_PREVISTO } from "./datosSimulados";
import type { EstadoInforme, InformeSimulado } from "./useInformesSimulados";

const RESPALDO_ETIQUETA = { BAJO: "Respaldo bajo", MEDIO: "Respaldo medio", ALTO: "Respaldo alto" };

const ESTADO_INFORME: Record<EstadoInforme, { etiqueta: string; variante: "outline" | "default" | "secondary" }> = {
  BORRADOR: { etiqueta: "Borrador", variante: "outline" },
  ENVIADO: { etiqueta: "Enviado", variante: "default" },
  DESCARTADO: { etiqueta: "Descartado", variante: "secondary" },
};

interface Props {
  informe: InformeSimulado;
  onEnviar: (informe: InformeSimulado) => void;
  onDescartar: (informe: InformeSimulado) => void;
}

function Lista({ titulo, items }: { titulo: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{titulo}</h4>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

export default function TarjetaInforme({ informe, onEnviar, onDescartar }: Props) {
  const { borrador, decision, estado } = informe;
  const estadoUi = ESTADO_INFORME[estado];
  return (
    <article className="space-y-4 rounded-xl border bg-card p-4" aria-label={`Informe para ${ORGANISMO_ETIQUETA[informe.organismo]}`}>
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <FileText className="size-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold">Para: {ORGANISMO_ETIQUETA[informe.organismo]}</span>
          <Badge variant={estadoUi.variante}>{estadoUi.etiqueta}</Badge>
          {decision.motivo === "ESCALADA" && <Badge variant="destructive">Escalada</Badge>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{CATEGORIA_ETIQUETA[informe.categoria]}</Badge>
          {informe.franja && <Badge variant="outline">{FRANJA_ETIQUETA[informe.franja]}</Badge>}
          <Badge variant="outline">{informe.zona}</Badge>
          <Badge variant="outline">{RESPALDO_ETIQUETA[decision.respaldo]}</Badge>
        </div>
      </header>

      <div>
        <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Hallazgo</h4>
        <p className="mt-1 text-sm">{borrador.hallazgo}</p>
      </div>
      <Lista titulo="Evidencia" items={borrador.evidencia} />
      <Lista titulo="Acciones sugeridas" items={borrador.acciones} />
      <Lista titulo="Recursos" items={borrador.recursos} />

      <p className="text-xs text-muted-foreground">
        Origen: regla #{informe.reglaId} · {informe.recomendacion} Motivo: {informe.motivo}
        <br />
        Borrador simulado · modelo previsto {MODELO_PREVISTO} · {FECHA_SIMULADA}
      </p>

      {estado === "BORRADOR" && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onEnviar(informe)}>
            <Send aria-hidden /> Aprobar y enviar
          </Button>
          <Button variant="outline" onClick={() => onDescartar(informe)}>
            <X aria-hidden /> Descartar
          </Button>
        </div>
      )}
      {estado === "ENVIADO" && (
        <p className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          <Check className="size-4" aria-hidden /> Enviado a {ORGANISMO_ETIQUETA[informe.organismo]} (simulado)
        </p>
      )}
    </article>
  );
}
