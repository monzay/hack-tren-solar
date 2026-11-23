import { Suspense } from "react";
import CargaIncidentes from "@/features/admin/CargaIncidentes";

export default function PaginaCargaIncidentes() {
  return <Suspense fallback={null}><CargaIncidentes /></Suspense>;
}
