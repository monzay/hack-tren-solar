"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ORGANISMOS, ORGANISMO_ETIQUETA, type Organismo } from "@/lib/dominio";
import { CRITERIOS_EMISION } from "@/lib/informes/periodicidad";
import { useSesion } from "@/features/auth/useSesion";
import ListaObservacion from "./ListaObservacion";
import TarjetaInforme from "./TarjetaInforme";
import { useInformesSimulados, type InformeSimulado } from "./useInformesSimulados";

const ROLES_PERMITIDOS = ["ANALISTA", "ADMIN"] as const;

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

export default function PantallaInformes() {
  const { usuario, cargando } = useSesion();
  const router = useRouter();
  const [filtro, setFiltro] = useState<Organismo | null>(null);
  const { informes, enObservacion, cambiarEstado } = useInformesSimulados();

  useEffect(() => {
    if (!cargando && !usuario) router.replace("/login?siguiente=/informes");
  }, [cargando, usuario, router]);

  if (cargando || !usuario) return null;
  if (!ROLES_PERMITIDOS.some((r) => r === usuario.role)) {
    return (
      <p role="alert" className="mx-auto max-w-7xl px-4 py-6 text-sm text-destructive">
        Solo analistas y administradores ven los informes para entidades.
      </p>
    );
  }

  const visibles = filtro ? informes.filter((i) => i.organismo === filtro) : informes;
  const enviar = (i: InformeSimulado) => {
    cambiarEstado(i.id, "ENVIADO");
    toast.success(`Informe enviado a ${ORGANISMO_ETIQUETA[i.organismo]} (simulado)`);
  };
  const descartar = (i: InformeSimulado) => {
    cambiarEstado(i.id, "DESCARTADO");
    toast(`Informe descartado`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Informes para entidades</h1>
        <p className="text-sm text-muted-foreground">
          Se arman a partir de las recomendaciones que generan los tickets, y solo se emiten cuando
          hay datos suficientes que las respalden.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          Simulación con datos ficticios. Los borradores están escritos a mano: todavía no hay un
          modelo conectado y nada se envía de verdad.
        </AlertDescription>
      </Alert>

      <section aria-label="Criterios de emisión" className="rounded-xl border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Cuándo se emite un informe</h2>
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          <li>Al menos {CRITERIOS_EMISION.minHechos} hechos en {CRITERIOS_EMISION.ventanaDias} días.</li>
          <li>Patrón sostenido {CRITERIOS_EMISION.semanasSostenidas} semanas seguidas.</li>
          <li>Sin un informe igual en los últimos {CRITERIOS_EMISION.diasEnfriamiento} días.</li>
          <li>Salvo que empeore {CRITERIOS_EMISION.escaladaPuntos} puntos o más (escalada).</li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por entidad">
        <Button variant={filtro === null ? "default" : "outline"} onClick={() => setFiltro(null)}>
          Todas
        </Button>
        {ORGANISMOS.map((o) => (
          <Button key={o} variant={filtro === o ? "default" : "outline"} onClick={() => setFiltro(o)}>
            {ORGANISMO_ETIQUETA[o]}
          </Button>
        ))}
      </div>

      <Seccion titulo={`Informes listos para revisar (${visibles.length})`}>
        <div className="grid gap-4 lg:grid-cols-2">
          {visibles.map((i) => (
            <TarjetaInforme key={i.id} informe={i} onEnviar={enviar} onDescartar={descartar} />
          ))}
        </div>
      </Seccion>

      <Seccion titulo="En observación: todavía no alcanzan para un informe">
        <ListaObservacion
          datos={filtro ? enObservacion.filter((c) => c.organismo === filtro) : enObservacion}
        />
      </Seccion>
    </div>
  );
}
