"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { Campo, mensajeDe } from "./utilidades";

const EJEMPLO = `[
  { "categoria": "ROBO", "fecha": "2026-03-14", "franja": "NOCHE", "lat": -24.1858, "lng": -65.2995, "fuente": "SNIC", "sintetico": true }
]`;

interface Resultado {
  enviados: number;
  creados: number;
  descartados: number;
}

export default function CargaIncidentes() {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  async function enviar() {
    setError(null);
    setResultado(null);
    let incidentes: unknown;
    try {
      const json: unknown = JSON.parse(texto);
      incidentes =
        typeof json === "object" && json !== null && "incidentes" in json
          ? (json as { incidentes: unknown }).incidentes
          : json;
    } catch {
      setError("El texto no es un JSON válido.");
      return;
    }
    if (!Array.isArray(incidentes) || incidentes.length === 0) {
      setError("Pegá una lista (array) con al menos un incidente.");
      return;
    }
    if (incidentes.length > 5000) {
      setError("Se admiten hasta 5.000 incidentes por carga.");
      return;
    }
    setEnviando(true);
    try {
      const r = await apiFetch<{ creados: number; descartados?: number }>(
        "/admin/incidentes",
        { method: "POST", body: JSON.stringify({ incidentes }) },
      );
      const enviados = incidentes.length;
      setResultado({
        enviados,
        creados: r.creados,
        descartados: r.descartados ?? Math.max(0, enviados - r.creados),
      });
      toast.success(`Se cargaron ${r.creados} incidentes.`);
    } catch (e) {
      setError(mensajeDe(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4">
      <h2 className="text-lg font-semibold">Carga de incidentes</h2>
      <p className="text-sm text-muted-foreground">
        Pegá un JSON con una lista de incidentes (hasta 5.000). Cada uno lleva categoría, fecha,
        franja, lat, lng, fuente y sintetico.
      </p>
      <Campo id="carga-json" etiqueta="JSON de incidentes" error={error ?? undefined}>
        <Textarea
          id="carga-json"
          rows={12}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={EJEMPLO}
          className="font-mono text-xs"
          spellCheck={false}
        />
      </Campo>
      <Button onClick={enviar} disabled={enviando || texto.trim() === ""}>
        {enviando ? "Cargando…" : "Cargar incidentes"}
      </Button>
      {resultado && (
        <Alert role="status">
          <AlertDescription>
            Enviados: {resultado.enviados}. Creados: {resultado.creados}. Descartados:{" "}
            {resultado.descartados}.
          </AlertDescription>
        </Alert>
      )}
    </section>
  );
}
