"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

interface Estado<T> {
  ruta: string;
  tick: number;
  datos: T | null;
  error: ApiError | null;
}

/** GET a la API con recarga manual. Si 401/403 redirige a `/login?siguiente=...`. */
export function useConsulta<T>(ruta: string | null, siguiente: string) {
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [estado, setEstado] = useState<Estado<T> | null>(null);

  useEffect(() => {
    if (ruta === null) return;
    let vivo = true;
    apiFetch<T>(ruta)
      .then((datos) => {
        if (vivo) setEstado({ ruta, tick, datos, error: null });
      })
      .catch((e: unknown) => {
        const error =
          e instanceof ApiError ? e : new ApiError(0, "No se pudo conectar.");
        if (vivo) setEstado({ ruta, tick, datos: null, error });
      });
    return () => {
      vivo = false;
    };
  }, [ruta, tick]);

  const error = estado?.ruta === ruta ? estado.error : null;
  const noAutorizado = error?.status === 401 || error?.status === 403;

  useEffect(() => {
    if (noAutorizado) router.replace(`/login?siguiente=${siguiente}`);
  }, [noAutorizado, router, siguiente]);

  const recargar = useCallback(() => setTick((t) => t + 1), []);
  const cargando =
    ruta !== null &&
    (estado === null || estado.ruta !== ruta || estado.tick !== tick);

  return {
    datos: estado?.datos ?? null,
    error: noAutorizado ? null : error,
    noAutorizado,
    cargando,
    recargar,
  };
}
