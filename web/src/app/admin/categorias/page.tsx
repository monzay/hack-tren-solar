import { Suspense } from "react";
import Categorias from "@/features/admin/Categorias";

export default function PaginaCategorias() {
  return <Suspense fallback={null}><Categorias /></Suspense>;
}
