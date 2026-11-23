import { Suspense } from "react";
import type { Metadata } from "next";
import PantallaEstadisticas from "@/features/estadisticas/PantallaEstadisticas";

export const metadata: Metadata = { title: "Estadísticas · Mapa del delito" };

export default function PaginaEstadisticas() {
  return <Suspense fallback={null}><PantallaEstadisticas /></Suspense>;
}
