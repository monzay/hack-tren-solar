"use client";

import { useEffect, useEffectEvent, useState } from "react";

const POLL_MS = Number(process.env.NEXT_PUBLIC_POLL_MS ?? 5000);

interface Estado<T> {
  clave: string | null;
  datos: T | null;
  error: Error | null;
}

/**
 * Pide datos al montar y cada NEXT_PUBLIC_POLL_MS mientras la pestaña está visible
 * (decisión 22: tiempo real por polling). Si `clave` cambia (p. ej. los filtros),
 * vuelve a pedir enseguida.
 */
export function usePolling<T>(pedir: () => Promise<T>, clave: string) {
  const [estado, setEstado] = useState<Estado<T>>({ clave: null, datos: null, error: null });
  const pedirEvento = useEffectEvent(pedir);

  useEffect(() => {
    let activo = true;
    const traer = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const datos = await pedirEvento();
        if (activo) setEstado({ clave, datos, error: null });
      } catch (e) {
        const error = e instanceof Error ? e : new Error("Error al cargar");
        if (activo) setEstado((previo) => ({ ...previo, clave, error }));
      }
    };
    void traer();
    const intervalo = setInterval(traer, POLL_MS);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [clave]);

  return { datos: estado.datos, error: estado.error, cargando: estado.clave !== clave };
}
