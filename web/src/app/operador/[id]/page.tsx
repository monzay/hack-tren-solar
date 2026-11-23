import { Suspense } from "react";
import { DetalleTicket } from "@/features/operador/DetalleTicket";

async function Contenido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetalleTicket id={id} />;
}

export default function PaginaDetalleTicket({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex-1">
      <Suspense fallback={null}>
        <Contenido params={params} />
      </Suspense>
    </div>
  );
}
