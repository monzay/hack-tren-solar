"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { HeatLayer } from "leaflet.heat";
import "leaflet/dist/leaflet.css";
import type { GeoJsonObject } from "geojson";
import { CENTRO_SSJ, TIPO_SERVICIO_ETIQUETA, ZOOM_BARRIO, ZOOM_CIUDAD } from "@/lib/dominio";
import { HEAT_RAMP } from "@/lib/heat";
import type { BarrioPublico, PuntoCalor, ServicioPublico } from "@/lib/schemas";

interface Props {
  puntos: PuntoCalor[];
  barrio: BarrioPublico | null;
  servicios: ServicioPublico[];
}

const GRADIENTE = Object.fromEntries(HEAT_RAMP.map((c, i) => [(i + 1) / HEAT_RAMP.length, c]));

export default function MapaCalor({ puntos, barrio, servicios }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const calorRef = useRef<HeatLayer | null>(null);
  const contornoRef = useRef<L.GeoJSON | null>(null);
  const serviciosRef = useRef<L.LayerGroup | null>(null);

  // Mapa base y capa de calor (una sola vez).
  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;

    const mapa = L.map(el, { center: CENTRO_SSJ, zoom: ZOOM_CIUDAD, zoomControl: true });
    // Esri Light Gray (sin clave, gris claro como Positron) + nombres de calles encima.
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap",
      maxZoom: 16,
    }).addTo(mapa);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap",
      maxZoom: 16,
    }).addTo(mapa);
    L.control.scale({ metric: true, imperial: false, position: "bottomleft" }).addTo(mapa);
    serviciosRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;
    // El contenedor cambia de tamaño después de crear el mapa (layout flex): recalcular.
    const observador = new ResizeObserver(() => mapa.invalidateSize());
    observador.observe(el);

    // leaflet.heat 1.x es ESM: se usa la clase HeatLayer (ya no se engancha a L).
    // Sus tipos están escritos para Leaflet 2; en ejecución soporta 1.9 (lo detecta por L.version).
    const capaCalor = new HeatLayer([], {
      radius: 25,
      blur: 18,
      minOpacity: 0.35,
      maxZoom: 17,
      gradient: GRADIENTE,
    });
    mapa.addLayer(capaCalor as unknown as L.Layer);
    calorRef.current = capaCalor;

    return () => {
      observador.disconnect();
      mapa.remove();
      mapaRef.current = null;
      calorRef.current = null;
      contornoRef.current = null;
      serviciosRef.current = null;
    };
  }, []);

  // Puntos de calor.
  useEffect(() => {
    if (!calorRef.current) return;
    // Máximo = percentil 90 de los pesos: reparte mejor los 10 colores que el máximo absoluto.
    const pesos = puntos.map((p) => p[2]).sort((a, b) => a - b);
    const max = Math.max(1, pesos[Math.floor(pesos.length * 0.9)] ?? 1);
    calorRef.current.setOptions({ max });
    calorRef.current.setLatLngs(puntos);
  }, [puntos]);

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
