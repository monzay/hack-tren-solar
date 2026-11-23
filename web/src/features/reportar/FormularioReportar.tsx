"use client";

import { useRef, useState } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api";
import type { CrearTicketRespuesta } from "@/lib/schemas";
import AvisoUrgencia from "./AvisoUrgencia";
import Confirmacion from "./Confirmacion";
import PasoCategoria from "./PasoCategoria";
import PasoContacto from "./PasoContacto";
import PasoDetalle, { hoyLocal } from "./PasoDetalle";
import PasoUbicacion from "./PasoUbicacion";
import { resolverReporte, type SalidaReporte, type ValoresReporte } from "./esquema";

const TITULOS = ["Categoría", "Ubicación", "Detalle", "Contacto"] as const;

const CAMPOS_POR_PASO: FieldPath<ValoresReporte>[][] = [
  ["categoria"],
  ["lat", "lng"],
  ["fecha", "franja", "rolReportante", "relato"],
];

export default function FormularioReportar() {
  const [paso, setPaso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [respuesta, setRespuesta] = useState<CrearTicketRespuesta | null>(null);
  const encabezado = useRef<HTMLHeadingElement>(null);

  const metodos = useForm<ValoresReporte, unknown, SalidaReporte>({
    resolver: resolverReporte,
    shouldUnregister: false,
    defaultValues: {
      modo: "ANONIMO",
      fecha: hoyLocal(),
      quiereDenunciar: false,
      declaracionAceptada: false,
      relato: "",
      contacto: { nombre: "", telefono: "", email: "", horario: "" },
    },
  });

  const irA = (n: number) => {
    setPaso(n);
    requestAnimationFrame(() => encabezado.current?.focus());
  };

  const siguiente = async () => {
    if (await metodos.trigger(CAMPOS_POR_PASO[paso])) irA(paso + 1);
  };

  const enviarDatos = async (datos: SalidaReporte) => {
    setEnviando(true);
    try {
      const r = await apiFetch<CrearTicketRespuesta>("/tickets", {
        method: "POST",
        body: JSON.stringify(datos),
      });
      setRespuesta(r);
      window.scrollTo({ top: 0 });
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 422) {
          toast.error(e.mensaje);
          irA(1);
        } else if (e.status === 429) {
          toast.error(e.mensaje || "Hiciste demasiados envíos. Probá de nuevo en unos minutos.");
        } else {
          toast.error(e.mensaje);
        }
      } else {
        toast.error("No pudimos enviar el reporte. Revisá tu conexión e intentá de nuevo.");
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6">
      <h1 className="text-2xl font-semibold">Reportar un hecho</h1>
      <AvisoUrgencia />

      {respuesta ? (
        <Confirmacion respuesta={respuesta} />
      ) : (
        <FormProvider {...metodos}>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (paso === 3) void metodos.handleSubmit(enviarDatos)(e);
              else void siguiente();
            }}
            className="space-y-6"
          >
            <div>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Paso {paso + 1} de 4
              </p>
              <h2
                ref={encabezado}
                tabIndex={-1}
                className="sr-only focus:outline-none"
              >
                {TITULOS[paso]}
              </h2>
              <div
                className="mt-2 flex gap-1"
                role="progressbar"
                aria-label="Progreso del formulario"
                aria-valuemin={1}
                aria-valuemax={4}
                aria-valuenow={paso + 1}
              >
                {TITULOS.map((t, i) => (
                  <span
                    key={t}
                    className={`h-1.5 flex-1 rounded-full ${i <= paso ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
              </div>
            </div>

            {paso === 0 ? <PasoCategoria /> : null}
            {paso === 1 ? <PasoUbicacion /> : null}
            {paso === 2 ? <PasoDetalle /> : null}
            {paso === 3 ? <PasoContacto /> : null}

            <div className="flex justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={paso === 0 || enviando}
                onClick={() => irA(paso - 1)}
              >
                Atrás
              </Button>
              <Button type="submit" size="lg" disabled={enviando}>
                {paso === 3 ? (enviando ? "Enviando..." : "Enviar reporte") : "Siguiente"}
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
}
