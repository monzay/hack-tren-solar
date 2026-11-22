"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SECCIONES = [
  { href: "/admin", etiqueta: "Usuarios" },
  { href: "/admin/barrios", etiqueta: "Barrios" },
  { href: "/admin/categorias", etiqueta: "Categorías" },
  { href: "/admin/servicios", etiqueta: "Servicios" },
  { href: "/admin/reglas", etiqueta: "Reglas" },
  { href: "/admin/incidentes", etiqueta: "Carga de incidentes" },
  { href: "/admin/tickets", etiqueta: "Supresión de ticket" },
];

export default function NavegacionAdmin() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administración" className="flex flex-wrap gap-1 border-b pb-3">
      {SECCIONES.map(({ href, etiqueta }) => {
        const activo = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activo
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent",
            )}
          >
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
