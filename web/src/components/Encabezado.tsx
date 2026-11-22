import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import NavegacionPrincipal from "@/components/NavegacionPrincipal";

export default function Encabezado() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ShieldCheck className="size-6 shrink-0" aria-hidden="true" />
          <span className="leading-tight">
            Mapa del delito
            <span className="hidden sm:inline"> · San Salvador de Jujuy</span>
          </span>
        </Link>
        <NavegacionPrincipal />
      </div>
    </header>
  );
}
