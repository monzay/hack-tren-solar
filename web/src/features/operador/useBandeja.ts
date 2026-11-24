"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { CATEGORIA_ETIQUETA, type Categoria, type EstadoTicket } from "@/lib/dominio";
import type { TicketBandeja } from "@/lib/schemas";
import { usePolling } from "@/hooks/usePolling";

export function useBandeja(estado: EstadoTicket | "", categoria: Categoria | "") {
  const qs = new URLSearchParams();
  if (estado) qs.set("estado", estado);
  if (categoria) qs.set("categoria", categoria);
  const query = qs.toString();
  const res = usePolling(
    () => apiFetch<TicketBandeja[]>(`/operador/tickets${query ? `?${query}` : ""}`),
    query,
  );

  const vistos = useRef<Set<number> | null>(null);
  const claveVistos = useRef(query);
  useEffect(() => {
    const datos = res.datos;
    if (!datos || res.cargando) return;
    if (claveVistos.current !== query) {
      // Cambió el filtro: reiniciar la referencia sin avisar.
      claveVistos.current = query;
      vistos.current = null;
    }
    const previos = vistos.current;
    if (previos) {
      const nuevos = datos.filter((t) => !previos.has(t.id));
      if (nuevos.length === 1) {
        toast.info(`Nuevo ticket: ${CATEGORIA_ETIQUETA[nuevos[0].categoria]} en ${nuevos[0].barrio}`);
      } else if (nuevos.length > 1) {
        toast.info(`${nuevos.length} tickets nuevos en la bandeja`);
      }
    }
    vistos.current = new Set(datos.map((t) => t.id));
  }, [res.datos, res.cargando, query]);

  return res;
}
