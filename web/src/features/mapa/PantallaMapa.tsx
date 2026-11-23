"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FUENTE_MAPA } from "@/lib/dominio";
import { Skeleton } from "@/components/ui/skeleton";
import FlechaNorte from "./FlechaNorte";
import Filtros from "./Filtros";
import Leyenda from "./Leyenda";
import PanelZona from "./PanelZona";
import { FILTROS_INICIALES, type FiltrosUI } from "./estadoFiltros";
import { useMapaCalor } from "./useMapaCalor";

const MapaCalor = dynamic(() => import("./MapaCalor"), {
  ssr: false,
  loading: () => <Skeleton className="absolute inset-0 rounded-none" />,
});

export default function PantallaMapa() {
  const [filtros, setFiltros] = useState<FiltrosUI>(FILTROS_INICIALES);
  const { calor, resumen, barrios, servicios } = useMapaCalor(filtros);

  const barrio = useMemo(
    () => barrios.find((b) => b.id === filtros.barrioId) ?? null,
    [barrios, filtros.barrioId],
  );
  const puntos = useMemo(() => calor.datos?.puntos ?? [], [calor.datos]);

  return (
    <main className="flex flex-1 flex-col md:flex-row">
      <div className="relative order-1 min-h-[55vh] flex-1 md:order-2 md:min-h-[32rem]">
        <MapaCalor puntos={puntos} barrio={barrio} servicios={servicios} />
        <div className="pointer-events-none absolute top-3 right-3 z-[500]">
          <FlechaNorte />
        </div>
        <div className="pointer-events-none absolute bottom-8 left-3 z-[500]">
          <Leyenda />
        </div>
        <p className="pointer-events-none absolute right-3 bottom-8 z-[500] max-w-[60%] rounded-md border bg-background/95 px-2 py-1 text-right text-xs shadow-sm">
          {FUENTE_MAPA}
        </p>
        {calor.error && !calor.datos ? (
          <p
            role="alert"
            className="absolute top-3 left-14 z-[500] rounded-md border bg-background px-3 py-1 text-sm text-destructive shadow-sm"
          >
            No pudimos cargar el mapa. Reintentando.
          </p>
        ) : null}
      </div>
      <aside
        aria-label="Filtros y resumen de la zona"
        className="order-2 w-full space-y-5 border-t bg-background p-4 md:order-1 md:w-96 md:overflow-y-auto md:border-t-0 md:border-r"
      >
        <h1 className="text-xl font-semibold">Mapa del delito · San Salvador de Jujuy</h1>
        <Filtros filtros={filtros} barrios={barrios} onChange={setFiltros} />
        <PanelZona
          resumen={resumen.datos}
          cargando={resumen.cargando}
          error={resumen.error !== null}
        />
      </aside>
    </main>
  );
}
