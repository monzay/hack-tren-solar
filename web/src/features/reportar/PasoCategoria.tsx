"use client";

import { useFormContext } from "react-hook-form";
import { CATEGORIAS, CATEGORIA_ETIQUETA, CATEGORIAS_ANONIMAS } from "@/lib/dominio";
import OpcionRadio from "./OpcionRadio";
import type { ValoresReporte } from "./esquema";

export default function PasoCategoria() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<ValoresReporte>();

  const alElegir = (c: (typeof CATEGORIAS)[number]) => {
    // Sin anonimato posible: el contacto es obligatorio.
    setValue("modo", CATEGORIAS_ANONIMAS.includes(c) ? "ANONIMO" : "CON_CONTACTO");
    setValue("quiereDenunciar", false);
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold">¿Qué querés reportar?</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {CATEGORIAS.map((c) => (
          <OpcionRadio
            key={c}
            value={c}
            {...register("categoria", { onChange: () => alElegir(c) })}
          >
            {CATEGORIA_ETIQUETA[c]}
          </OpcionRadio>
        ))}
      </div>
      {errors.categoria ? (
        <p role="alert" className="text-sm text-destructive">
          Elegí una categoría para continuar.
        </p>
      ) : null}
    </fieldset>
  );
}
