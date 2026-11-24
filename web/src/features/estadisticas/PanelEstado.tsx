import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiError } from "@/lib/api";

/** Muestra carga o error; si no hay ninguno, no renderiza nada. */
export default function PanelEstado({
  cargando,
  error,
  alto = "h-64",
}: {
  cargando: boolean;
  error: ApiError | null;
  alto?: string;
}) {
  if (error) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertDescription>{error.mensaje}</AlertDescription>
      </Alert>
    );
  }
  if (cargando) return <Skeleton className={`${alto} w-full`} aria-label="Cargando" />;
  return null;
}
