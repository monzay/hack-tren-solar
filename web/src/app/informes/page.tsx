import { Suspense } from "react";
import type { Metadata } from "next";
import PantallaInformes from "@/features/informes/PantallaInformes";

export const metadata: Metadata = { title: "Informes para entidades · Mapa del delito" };

export default function PaginaInformes() {
  return <Suspense fallback={null}><PantallaInformes /></Suspense>;
}
