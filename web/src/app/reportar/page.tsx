import { Suspense } from "react";
import type { Metadata } from "next";
import FormularioReportar from "@/features/reportar/FormularioReportar";

export const metadata: Metadata = {
  title: "Reportar un hecho · Mapa del delito",
};

export default function ReportarPage() {
  return (
    <div className="flex-1">
      <Suspense fallback={null}><FormularioReportar /></Suspense>
    </div>
  );
}
