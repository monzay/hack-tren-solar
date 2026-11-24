"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { UsuarioSesion } from "@/lib/schemas";

/** Sesión actual (GET /api/auth/sesion) y cierre de sesión. */
export function useSesion() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    apiFetch<{ usuario: UsuarioSesion | null }>("/auth/sesion")
      .then((r) => {
        if (activo) setUsuario(r.usuario);
      })
      .catch(() => {
        if (activo) setUsuario(null);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await apiFetch<{ ok: true }>("/auth/logout", { method: "POST" });
    } finally {
      window.location.assign("/");
    }
  }, []);

  return { usuario, cargando, cerrarSesion };
}
