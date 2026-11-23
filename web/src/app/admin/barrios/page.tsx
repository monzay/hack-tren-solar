import { Suspense } from "react";
import Barrios from "@/features/admin/Barrios";

export default function PaginaBarrios() {
  return <Suspense fallback={null}><Barrios /></Suspense>;
}
