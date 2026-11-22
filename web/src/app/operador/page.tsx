import { Suspense } from "react";
import { Bandeja } from "@/features/operador/Bandeja";

export default function PaginaOperador() {
  return (
    <div className="flex-1">
      <Suspense fallback={null}><Bandeja /></Suspense>
    </div>
  );
}
