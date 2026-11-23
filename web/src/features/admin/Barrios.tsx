"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PanelEstado from "@/features/estadisticas/PanelEstado";
import { useConsulta } from "@/features/estadisticas/useConsulta";
import { apiFetch } from "@/lib/api";
import type { BarrioPublico } from "@/lib/schemas";
import { SIGUIENTE_ADMIN, mensajeDe } from "./utilidades";

function FilaBarrio({ barrio, alGuardar }: { barrio: BarrioPublico; alGuardar: () => void }) {
  const [poblacion, setPoblacion] = useState(String(barrio.poblacion));
  const [guardando, setGuardando] = useState(false);
  const valor = Number(poblacion);
  const invalido = poblacion === "" || !Number.isInteger(valor) || valor < 0;

  async function guardar() {
    setGuardando(true);
    try {
      await apiFetch(`/admin/barrios/${barrio.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          nombre: barrio.nombre,
          poblacion: valor,
          centroLat: barrio.centro[0],
          centroLng: barrio.centro[1],
          poligono: barrio.poligono,
        }),
      });
      toast.success(`Población de ${barrio.nombre} actualizada.`);
      alGuardar();
    } catch (e) {
      toast.error(mensajeDe(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{barrio.nombre}</TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          step={1}
          value={poblacion}
          onChange={(e) => setPoblacion(e.target.value)}
          aria-label={`Población de ${barrio.nombre}`}
          aria-invalid={invalido ? true : undefined}
          className="w-36"
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          onClick={guardar}
          disabled={guardando || invalido || valor === barrio.poblacion}
        >
          Guardar
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function Barrios() {
  const { datos, error, cargando, recargar } = useConsulta<BarrioPublico[]>(
    "/admin/barrios",
    SIGUIENTE_ADMIN,
  );
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        La población se usa para calcular la tasa por mil habitantes.
      </p>
      <PanelEstado cargando={cargando && !datos} error={error} />
      {datos && (
        <div className="max-h-[36rem] overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barrio</TableHead>
                <TableHead>Población</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datos.map((b) => (
                <FilaBarrio key={`${b.id}-${b.poblacion}`} barrio={b} alGuardar={recargar} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
