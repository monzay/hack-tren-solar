"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CENTRO_SSJ, ZOOM_CIUDAD } from "@/lib/dominio";

interface Props {
  punto: { lat: number; lng: number } | null;
  onElegir: (lat: number, lng: number) => void;
}

/** Mapa para marcar el punto. El marcador es solo local: no se muestra a otras personas. */
export default function SelectorUbicacion({ punto, onElegir }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const marcadorRef = useRef<L.CircleMarker | null>(null);
  const onElegirRef = useRef(onElegir);

  useEffect(() => {
    onElegirRef.current = onElegir;
  }, [onElegir]);

  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const mapa = L.map(el, { center: CENTRO_SSJ, zoom: ZOOM_CIUDAD });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapa);
    mapa.on("click", (e: L.LeafletMouseEvent) => onElegirRef.current(e.latlng.lat, e.latlng.lng));
    // Teclado: Enter marca el centro del mapa.
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const c = mapa.getCenter();
        onElegirRef.current(c.lat, c.lng);
      }
    };
    el.addEventListener("keydown", alTeclear);
    mapaRef.current = mapa;
    return () => {
      el.removeEventListener("keydown", alTeclear);
      mapa.remove();
      mapaRef.current = null;
      marcadorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    marcadorRef.current?.remove();
    marcadorRef.current = null;
    if (!punto) return;
    marcadorRef.current = L.circleMarker([punto.lat, punto.lng], {
      radius: 10,
      color: "#7f1d1d",
      weight: 3,
      fillColor: "#ef4444",
      fillOpacity: 0.9,
    }).addTo(mapa);
    if (!mapa.getBounds().contains([punto.lat, punto.lng])) {
      mapa.setView([punto.lat, punto.lng], Math.max(mapa.getZoom(), ZOOM_CIUDAD));
    }
  }, [punto]);

  return (
    <div
      ref={contenedor}
      className="z-0 h-72 w-full rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-96"
      role="application"
      aria-label="Mapa para marcar el lugar del hecho. Con teclado, mové el mapa con las flechas y presioná Enter para marcar el centro."
    />
  );
}
