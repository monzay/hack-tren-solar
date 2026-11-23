"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import type {
  BarrioPublico,
  MapaCalorRespuesta,
  ResumenZona,
  ServicioPublico,
} from "@/lib/schemas";
import { queryDeFiltros, type FiltrosUI } from "./estadoFiltros";

export function useMapaCalor(filtros: FiltrosUI) {
  const clave = JSON.stringify(filtros);
  const calor = usePolling(
    () => apiFetch<MapaCalorRespuesta>(`/mapa/calor?${queryDeFiltros(filtros)}`),
    clave,
  );
  const resumen = usePolling(
    () => apiFetch<ResumenZona>(`/mapa/resumen?${queryDeFiltros(filtros)}`),
    clave,
  );

  const [barrios, setBarrios] = useState<BarrioPublico[]>([]);
  const [servicios, setServicios] = useState<ServicioPublico[]>([]);
  useEffect(() => {
    let activo = true;
    apiFetch<BarrioPublico[]>("/barrios")
      .then((d) => {
        if (activo) setBarrios(d);
      })
      .catch(() => undefined);
    apiFetch<ServicioPublico[]>("/servicios")
      .then((d) => {
        if (activo) setServicios(d);
      })
      .catch(() => undefined);
    return () => {
      activo = false;
    };
  }, []);

  return { calor, resumen, barrios, servicios };
}
