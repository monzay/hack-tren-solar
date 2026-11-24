"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OpcionRadio from "./OpcionRadio";
import {
  esAnonimaPosible,
  requiereContacto,
  requiereDeclaracion,
  type ValoresReporte,
} from "./esquema";

function Error({ mensaje }: { mensaje?: string }) {
  return mensaje ? (
    <p role="alert" className="text-sm text-destructive">
      {mensaje}
    </p>
  ) : null;
}

export default function PasoContacto() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ValoresReporte>();
  const categoria = useWatch({ control, name: "categoria" });
  const modo = useWatch({ control, name: "modo" });
  const quiereDenunciar = useWatch({ control, name: "quiereDenunciar" });

  const anonimaPosible = esAnonimaPosible(categoria);
  const estado = { categoria, modo, quiereDenunciar };
  const pideContacto = requiereContacto(estado);
  const pideDeclaracion = requiereDeclaracion(estado);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Contacto</h2>

      {anonimaPosible ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">¿Cómo querés reportar?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <OpcionRadio value="ANONIMO" {...register("modo")}>
              Anónimo
            </OpcionRadio>
            <OpcionRadio value="CON_CONTACTO" {...register("modo")}>
              Quiero que me contacten
            </OpcionRadio>
          </div>
          <label className="flex items-start gap-2 pt-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-primary"
              {...register("quiereDenunciar")}
            />
            <span>
              Quiero registrar una denuncia (vamos a necesitar un medio de contacto).
            </span>
          </label>
        </fieldset>
      ) : (
        <p className="text-sm text-muted-foreground">
          Para esta categoría necesitamos un medio de contacto para poder asistirte.
        </p>
      )}

      {!pideContacto ? (
        <p className="rounded-md border bg-muted/40 p-3 text-sm">
          Vas a reportar de forma anónima: no te vamos a pedir ningún dato personal.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="c-nombre">Nombre</Label>
            <Input id="c-nombre" autoComplete="name" {...register("contacto.nombre")} aria-invalid={!!errors.contacto?.nombre} />
            <Error mensaje={errors.contacto?.nombre?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="c-telefono">Teléfono</Label>
              <Input id="c-telefono" type="tel" autoComplete="tel" {...register("contacto.telefono")} aria-invalid={!!errors.contacto?.telefono} />
              <Error mensaje={errors.contacto?.telefono?.message} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" autoComplete="email" {...register("contacto.email")} aria-invalid={!!errors.contacto?.email} />
              <Error mensaje={errors.contacto?.email?.message} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="c-horario">Mejor horario para contactarte (opcional)</Label>
            <Input id="c-horario" {...register("contacto.horario")} />
          </div>
          <p className="text-xs text-muted-foreground">
            Tus datos de contacto se guardan cifrados y solo los ve el personal autorizado.
          </p>
        </div>
      )}

      {pideDeclaracion ? (
        <div className="space-y-1">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-primary"
              {...register("declaracionAceptada")}
            />
            <span>
              Declaro bajo juramento que lo que informo es verdadero y entiendo que una
              falsa denuncia puede tener consecuencias legales.
            </span>
          </label>
          <Error mensaje={errors.declaracionAceptada?.message} />
        </div>
      ) : null}
    </div>
  );
}
