"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
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
import { TIPOS_SERVICIO, TIPO_SERVICIO_ETIQUETA } from "@/lib/dominio";
import { ServicioEntrada, type ServicioPublico } from "@/lib/schemas";
import {
  Campo,
  ConfirmarDialogo,
  SelectSimple,
  SIGUIENTE_ADMIN,
  mensajeDe,
  numeroONull,
} from "./utilidades";

type Entrada = z.input<typeof ServicioEntrada>;
type Salida = z.output<typeof ServicioEntrada>;
type ServicioVista = ServicioPublico & { barrioId?: number | null; activo?: boolean };

const VACIO: Entrada = {
  nombre: "",
  tipo: "COMISARIA",
  telefono: "",
  lat: null,
  lng: null,
  barrioId: null,
  activo: true,
};

export default function Servicios() {
  const { datos, error, cargando, recargar } = useConsulta<ServicioVista[]>(
    "/admin/servicios",
    SIGUIENTE_ADMIN,
  );
  const [editando, setEditando] = useState<number | null>(null);
  const [aBorrar, setABorrar] = useState<ServicioVista | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Entrada, unknown, Salida>({
    resolver: zodResolver(ServicioEntrada),
    defaultValues: VACIO,
  });

  function editar(s: ServicioVista) {
    setEditando(s.id);
    reset({
      nombre: s.nombre,
      tipo: s.tipo,
      telefono: s.telefono,
      lat: s.lat,
      lng: s.lng,
      barrioId: s.barrioId ?? null,
      activo: s.activo ?? true,
    });
  }

  function cancelar() {
    setEditando(null);
    reset(VACIO);
  }

  async function alEnviar(valores: Salida) {
    try {
      await apiFetch(editando ? `/admin/servicios/${editando}` : "/admin/servicios", {
        method: editando ? "PATCH" : "POST",
        body: JSON.stringify(valores),
      });
      toast.success(editando ? "Servicio actualizado." : "Servicio creado.");
      cancelar();
      recargar();
    } catch (e) {
      toast.error(mensajeDe(e));
    }
  }

  async function borrar() {
    if (!aBorrar) return;
    try {
      await apiFetch(`/admin/servicios/${aBorrar.id}`, { method: "DELETE" });
      toast.success("Servicio eliminado.");
      recargar();
    } catch (e) {
      toast.error(mensajeDe(e));
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">
          {editando ? "Editar servicio" : "Nuevo servicio"}
        </h2>
        <form onSubmit={handleSubmit(alEnviar)} noValidate className="grid gap-4 md:grid-cols-2">
          <Campo id="s-nombre" etiqueta="Nombre" error={errors.nombre?.message}>
            <Input id="s-nombre" {...register("nombre")} />
          </Campo>
          <Campo id="s-tipo" etiqueta="Tipo" error={errors.tipo?.message}>
            <Controller
              control={control}
              name="tipo"
              render={({ field }) => (
                <SelectSimple
                  id="s-tipo"
                  valor={field.value}
                  onCambio={field.onChange}
                  opciones={TIPOS_SERVICIO.map((t) => ({
                    valor: t,
                    etiqueta: TIPO_SERVICIO_ETIQUETA[t],
                  }))}
                />
              )}
            />
          </Campo>
          <Campo id="s-tel" etiqueta="Teléfono" error={errors.telefono?.message}>
            <Input id="s-tel" type="tel" {...register("telefono")} />
          </Campo>
          <Campo id="s-barrio" etiqueta="Id de barrio (opcional)" error={errors.barrioId?.message}>
            <Input
              id="s-barrio"
              type="number"
              {...register("barrioId", { setValueAs: numeroONull })}
            />
          </Campo>
          <Campo id="s-lat" etiqueta="Latitud (opcional)" error={errors.lat?.message}>
            <Input
              id="s-lat"
              type="number"
              step="any"
              {...register("lat", { setValueAs: numeroONull })}
            />
          </Campo>
          <Campo id="s-lng" etiqueta="Longitud (opcional)" error={errors.lng?.message}>
            <Input
              id="s-lng"
              type="number"
              step="any"
              {...register("lng", { setValueAs: numeroONull })}
            />
          </Campo>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {editando ? "Guardar cambios" : "Crear servicio"}
            </Button>
            {editando && (
              <Button type="button" variant="outline" onClick={cancelar}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">Servicios de asistencia</h2>
        <PanelEstado cargando={cargando && !datos} error={error} />
        {datos && (
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.nombre}</TableCell>
                    <TableCell>{TIPO_SERVICIO_ETIQUETA[s.tipo]}</TableCell>
                    <TableCell>{s.telefono}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => editar(s)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setABorrar(s)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <ConfirmarDialogo
        abierto={aBorrar !== null}
        onCambio={(a) => !a && setABorrar(null)}
        titulo="Eliminar servicio"
        descripcion={`Se va a quitar "${aBorrar?.nombre ?? ""}" de la lista de servicios.`}
        textoConfirmar="Eliminar"
        onConfirmar={borrar}
      />
    </div>
  );
}
