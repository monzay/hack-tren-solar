import { Suspense } from "react";
import SupresionTicket from "@/features/admin/SupresionTicket";

export default function PaginaSupresionTicket() {
  return <Suspense fallback={null}><SupresionTicket /></Suspense>;
}
