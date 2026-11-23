import { Suspense } from "react";
import Reglas from "@/features/admin/Reglas";

export default function PaginaReglas() {
  return <Suspense fallback={null}><Reglas /></Suspense>;
}
