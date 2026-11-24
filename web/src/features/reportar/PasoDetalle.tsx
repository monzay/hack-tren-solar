"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FRANJAS, FRANJA_ETIQUETA } from "@/lib/dominio";
import OpcionRadio from "./OpcionRadio";
import type { ValoresReporte } from "./esquema";

export function hoyLocal(): string {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

export default function PasoDetalle() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ValoresReporte>();

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Contanos el detalle</h2>

      <div className="space-y-1">
        <Label htmlFor="fecha">Fecha del hecho</Label>
        <Input id="fecha" type="date" max={hoyLocal()} {...register("fecha")} aria-invalid={!!errors.fecha} />
        {errors.fecha ? (
          <p role="alert" className="text-sm text-destructive">
            {String(errors.fecha.message ?? "Indicá una fecha válida")}
          </p>
        ) : null}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Franja horaria</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {FRANJAS.map((f) => (
            <OpcionRadio key={f} value={f} {...register("franja")}>
              {FRANJA_ETIQUETA[f]}
            </OpcionRadio>
          ))}
        </div>
        {errors.franja ? (
          <p role="alert" className="text-sm text-destructive">
            Elegí una franja horaria.
          </p>
        ) : null}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">¿Cuál fue tu rol?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <OpcionRadio value="VICTIMA" {...register("rolReportante")}>
            Fui la víctima
          </OpcionRadio>
          <OpcionRadio value="TESTIGO" {...register("rolReportante")}>
            Fui testigo
          </OpcionRadio>
        </div>
        {errors.rolReportante ? (
          <p role="alert" className="text-sm text-destructive">
            Indicá si fuiste víctima o testigo.
          </p>
        ) : null}
      </fieldset>

      <div className="space-y-1">
        <Label htmlFor="relato">Relato (opcional)</Label>
        <Textarea id="relato" rows={4} maxLength={2000} {...register("relato")} />
        <p className="text-xs text-muted-foreground">
          No incluyas datos que te identifiquen si elegís reportar de forma anónima.
        </p>
        {errors.relato ? (
          <p role="alert" className="text-sm text-destructive">
            {String(errors.relato.message)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
