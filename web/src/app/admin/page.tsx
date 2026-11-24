import { Suspense } from "react";
import Usuarios from "@/features/admin/Usuarios";

export default function PaginaAdmin() {
  return <Suspense fallback={null}><Usuarios /></Suspense>;
}
