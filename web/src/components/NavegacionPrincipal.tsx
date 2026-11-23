"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LogIn,
  MapPin,
  Menu,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Enlace = {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  destacado?: boolean;
};

const ENLACES: Enlace[] = [
  { href: "/", etiqueta: "Mapa", icono: MapPin },
  {
    href: "/reportar",
    etiqueta: "Reportar un hecho",
    icono: Megaphone,
    destacado: true,
  },
  { href: "/estadisticas", etiqueta: "Estadísticas", icono: BarChart3 },
  { href: "/login", etiqueta: "Ingresar", icono: LogIn },
];

function claseEnlace(activo: boolean, destacado: boolean | undefined) {
  return cn(
    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    destacado
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "text-foreground hover:bg-accent",
    activo && !destacado && "bg-accent text-primary",
    activo && destacado && "ring-2 ring-ring ring-offset-2",
  );
}

export default function NavegacionPrincipal() {
  const pathname = usePathname();
  const esActivo = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
        {ENLACES.map(({ href, etiqueta, icono: Icono, destacado }) => (
          <Link
            key={href}
            href={href}
            aria-current={esActivo(href) ? "page" : undefined}
            className={claseEnlace(esActivo(href), destacado)}
          >
            <Icono className="size-4" aria-hidden="true" />
            {etiqueta}
          </Link>
        ))}
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Menú</SheetTitle>
            <SheetDescription>Navegación del sitio</SheetDescription>
          </SheetHeader>
          <nav aria-label="Principal (celular)" className="flex flex-col gap-2 p-4">
            {ENLACES.map(({ href, etiqueta, icono: Icono, destacado }) => (
              <SheetClose asChild key={href}>
                <Link
                  href={href}
                  aria-current={esActivo(href) ? "page" : undefined}
                  className={claseEnlace(esActivo(href), destacado)}
                >
                  <Icono className="size-4" aria-hidden="true" />
                  {etiqueta}
                </Link>
              </SheetClose>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
