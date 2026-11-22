"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoJsonObject } from "geojson";
import { CENTRO_SSJ, TIPO_SERVICIO_ETIQUETA, ZOOM_BARRIO, ZOOM_CIUDAD } from "@/lib/dominio";
import { HEAT_RAMP } from "@/lib/heat";
import type { BarrioPublico, PuntoCalor, ServicioPublico } from "@/lib/schemas";

interface CapaCalorLeaflet extends L.Layer {
  setLatLngs(puntos: PuntoCalor[]): this;
  setOptions(opciones: Record<string, unknown>): this;
}

interface Props {
  puntos: PuntoCalor[];
  barrio: BarrioPublico | null;
  servicios: ServicioPublico[];
}

const GRADIENTE = Object.fromEntries(HEAT_RAMP.map((c, i) => [(i + 1) / HEAT_RAMP.length, c]));

export default function MapaCalor({ puntos, barrio, servicios }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const calorRef = useRef<CapaCalorLeaflet | null>(null);
  const contornoRef = useRef<L.GeoJSON | null>(null);
  const serviciosRef = useRef<L.LayerGroup | null>(null);
  const [listo, setListo] = useState(false);

  // Mapa base y capa de calor (una sola vez).
  useEffect(() => {
    let cancelado = false;
    const el = contenedor.current;
    if (!el) return;

    const mapa = L.map(el, { center: CENTRO_SSJ, zoom: ZOOM_CIUDAD, zoomControl: true });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(mapa);
    L.control.scale({ metric: true, imperial: false, position: "bottomleft" }).addTo(mapa);
    serviciosRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;

    // leaflet.heat se engancha al global L.
    Object.assign(window, { L });
    import("leaflet.heat").then(() => {
      if (cancelado) return;
      const fabrica = (L as unknown as {
        heatLayer: (p: PuntoCalor[], o: Record<string, unknown>) => CapaCalorLeaflet;
      }).heatLayer;
      calorRef.current = fabrica([], {
        radius: 25,
        blur: 18,
        minOpacity: 0.35,
        maxZoom: 17,
        gradient: GRADIENTE,
      }).addTo(mapa);
      setListo(true);
    });

    return () => {
      cancelado = true;
      mapa.remove();
      mapaRef.current = null;
      calorRef.current = null;
      contornoRef.current = null;
      serviciosRef.current = null;
      setListo(false);
    };
  }, []);

  // Puntos de calor.
  useEffect(() => {
    if (!listo || !calorRef.current) return;
    const max = puntos.reduce((m, p) => Math.max(m, p[2]), 1);
    calorRef.current.setOptions({ max });
    calorRef.current.setLatLngs(puntos);
  }, [listo, puntos]);

  // Contorno y zoom al barrio.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    contornoRef.current?.remove();
    contornoRef.current = null;
    if (!barrio) {
      mapa.setView(CENTRO_SSJ, ZOOM_CIUDAD);
      return;
    }
    if (barrio.poligono) {
      contornoRef.current = L.geoJSON(barrio.poligono as GeoJsonObject, {
        style: { color: "#1e3a8a", weight: 3, fillOpacity: 0.04, dashArray: "6 4" },
      }).addTo(mapa);
    }
    mapa.setView(barrio.centro, ZOOM_BARRIO);
  }, [barrio]);

  // Marcadores: solo servicios de asistencia.
  useEffect(() => {
    const grupo = serviciosRef.current;
    if (!grupo) return;
    grupo.clearLayers();
    for (const s of servicios) {
      if (s.lat === null || s.lng === null) continue;
      const marcador = L.circleMarker([s.lat, s.lng], {
        radius: 7,
        color: "#1e3a8a",
        weight: 2,
        fillColor: "#ffffff",
        fillOpacity: 1,
      });
      const popup = document.createElement("div");
      const titulo = document.createElement("strong");
      titulo.textContent = s.nombre;
      const tipo = document.createElement("div");
      tipo.textContent = TIPO_SERVICIO_ETIQUETA[s.tipo];
      const tel = document.createElement("a");
      tel.textContent = s.telefono;
      tel.href = `tel:${s.telefono.replace(/[^\d+]/g, "")}`;
      popup.append(titulo, tipo, tel);
      marcador.bindPopup(popup);
      marcador.addTo(grupo);
    }
  }, [servicios]);

  return (
    <div
      ref={contenedor}
      className="absolute inset-0 z-0"
      role="region"
      aria-label="Mapa de calor de San Salvador de Jujuy"
    />
  );
}
