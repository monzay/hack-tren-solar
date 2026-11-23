import { Suspense } from "react";
import Servicios from "@/features/admin/Servicios";

export default function PaginaServicios() {
  return <Suspense fallback={null}><Servicios /></Suspense>;
}
