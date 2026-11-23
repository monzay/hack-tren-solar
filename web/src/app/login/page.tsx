import { Suspense } from "react";
import { FormularioLogin } from "@/features/auth/FormularioLogin";

export default function PaginaLogin() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Ingreso de personal</h1>
        <p className="text-sm text-muted-foreground">
          Acceso para operadores, analistas y administración.
        </p>
      </div>
      <Suspense fallback={null}>
        <FormularioLogin />
      </Suspense>
    </div>
  );
}
