"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ValoresReporte } from "./esquema";

const SelectorUbicacion = dynamic(() => import("./SelectorUbicacion"), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full sm:h-96" />,
});

export default function PasoUbicacion() {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<ValoresReporte>();
  const lat = useWatch({ control, name: "lat" });
  const lng = useWatch({ control, name: "lng" });

  // lat y lng no tienen input visible: se registran para validarlos.
  useEffect(() => {
    register("lat");
    register("lng");
  }, [register]);

  const elegir = (la: number, ln: number) => {
    setValue("lat", la, { shouldValidate: true });
    setValue("lng", ln, { shouldValidate: true });
  };

  const usarMiUbicacion = () => {
    if (!navigator.geolocation) {
      toast.error("Tu dispositivo no permite obtener la ubicación. Marcala en el mapa.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => elegir(pos.coords.latitude, pos.coords.longitude),
      () => toast.error("No pudimos obtener tu ubicación. Marcala en el mapa."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const punto = typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null;

  return (
    <section className="space-y-3" aria-labelledby="titulo-ubicacion">
      <h2 id="titulo-ubicacion" className="text-lg font-semibold">
        ¿Dónde ocurrió?
      </h2>
      <p className="text-sm text-muted-foreground">
        Tocá el mapa para marcar el lugar. Con teclado, mové el mapa con las flechas y presioná
        Enter. Tu punto exacto lo ve solo el personal autorizado; al público se muestra agrupado.
      </p>
      <SelectorUbicacion punto={punto} onElegir={elegir} />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={usarMiUbicacion}>
          <MapPin aria-hidden="true" /> Usar mi ubicación
        </Button>
        <p className="text-sm" aria-live="polite">
          {punto ? "Lugar marcado en el mapa." : "Todavía no marcaste un lugar."}
        </p>
      </div>
      {errors.lat || errors.lng ? (
        <p role="alert" className="text-sm text-destructive">
          Marcá el lugar del hecho en el mapa para continuar.
        </p>
      ) : null}
    </section>
  );
}
