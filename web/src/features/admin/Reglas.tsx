"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  CATEGORIAS,
  CATEGORIA_ETIQUETA,
  CONDICIONES,
  FRANJAS,
  FRANJA_ETIQUETA,
  type CondicionRegla,
} from "@/lib/dominio";
import { ReglaEntrada, type ReglaVista } from "@/lib/schemas";
import {
  Campo,
  ConfirmarDialogo,
  SelectSimple,
  SIGUIENTE_ADMIN,
  mensajeDe,
  numeroONull,
} from "./utilidades";

type Entrada = z.input<typeof ReglaEntrada>;
type Salida = z.output<typeof ReglaEntrada>;

const CONDICION_ETIQUETA: Record<CondicionRegla, string> = {
  TENDENCIA_SUBA: "Tendencia en suba",
  PICO: "Pico en una franja",
  TASA_SUPERA: "Tasa supera el umbral",
};

const VACIO: Entrada = {
  categoria: "ROBO",
  franja: null,
  condicion: "TENDENCIA_SUBA",
  umbral: null,
  texto: "",
  activa: true,
};

export default function Reglas() {
  const { datos, error, cargando, recargar } = useConsulta<ReglaVista[]>(
    "/admin/reglas",
    SIGUIENTE_ADMIN,
  );
  const [editando, setEditando] = useState<number | null>(null);
  const [aBorrar, setABorrar] = useState<ReglaVista | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Entrada, unknown, Salida>({
    resolver: zodResolver(ReglaEntrada),
    defaultValues: VACIO,
  });

  function editar(r: ReglaVista) {
    setEditando(r.id);
    reset({
      categoria: r.categoria,
      franja: r.franja,
      condicion: r.condicion,
      umbral: r.umbral,
      texto: r.texto,
      activa: r.activa,
    });
  }

  function cancelar() {
    setEditando(null);
    reset(VACIO);
  }

  async function alEnviar(valores: Salida) {
    try {
      await apiFetch(editando ? `/admin/reglas/${editando}` : "/admin/reglas", {
        method: editando ? "PATCH" : "POST",
        body: JSON.stringify(valores),
      });
      toast.success(editando ? "Regla actualizada." : "Regla creada.");
      cancelar();
      recargar();
    } catch (e) {
      toast.error(mensajeDe(e));
    }
  }

  async function borrar() {
    if (!aBorrar) return;
    try {
      await apiFetch(`/admin/reglas/${aBorrar.id}`, { method: "DELETE" });
      toast.success("Regla eliminada.");
      recargar();
    } catch (e) {
      toast.error(mensajeDe(e));
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">{editando ? "Editar regla" : "Nueva regla"}</h2>
        <form onSubmit={handleSubmit(alEnviar)} noValidate className="grid gap-4 md:grid-cols-2">
          <Campo id="r-cat" etiqueta="Categoría" error={errors.categoria?.message}>
            <Controller
              control={control}
              name="categoria"
              render={({ field }) => (
                <SelectSimple
                  id="r-cat"
                  valor={field.value}
                  onCambio={field.onChange}
                  opciones={CATEGORIAS.map((c) => ({ valor: c, etiqueta: CATEGORIA_ETIQUETA[c] }))}
                />
              )}
            />
          </Campo>
          <Campo id="r-cond" etiqueta="Condición" error={errors.condicion?.message}>
            <Controller
              control={control}
              name="condicion"
              render={({ field }) => (
                <SelectSimple
                  id="r-cond"
                  valor={field.value}
                  onCambio={field.onChange}
                  opciones={CONDICIONES.map((c) => ({ valor: c, etiqueta: CONDICION_ETIQUETA[c] }))}
                />
              )}
            />
          </Campo>
          <Campo id="r-franja" etiqueta="Franja (opcional)" error={errors.franja?.message}>
            <Controller
              control={control}
              name="franja"
              render={({ field }) => (
                <SelectSimple
                  id="r-franja"
                  valor={field.value ?? "ninguna"}
                  onCambio={(v) => field.onChange(v === "ninguna" ? null : v)}
                  opciones={[
                    { valor: "ninguna", etiqueta: "Cualquier franja" },
                    ...FRANJAS.map((f) => ({ valor: f, etiqueta: FRANJA_ETIQUETA[f] })),
                  ]}
                />
              )}
            />
          </Campo>
          <Campo
            id="r-umbral"
            etiqueta="Umbral (opcional)"
            ayuda="Porcentaje de suba o tasa por mil, según la condición."
            error={errors.umbral?.message}
          >
            <Input
              id="r-umbral"
              type="number"
              step="any"
              {...register("umbral", { setValueAs: numeroONull })}
            />
          </Campo>
          <div className="md:col-span-2">
            <Campo id="r-texto" etiqueta="Texto de la recomendación" error={errors.texto?.message}>
              <Textarea id="r-texto" rows={3} {...register("texto")} />
            </Campo>
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {editando ? "Guardar cambios" : "Crear regla"}
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
        <h2 className="text-lg font-semibold">Reglas</h2>
        <PanelEstado cargando={cargando && !datos} error={error} />
        {datos && (
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Condición</TableHead>
                  <TableHead>Texto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{CATEGORIA_ETIQUETA[r.categoria]}</TableCell>
                    <TableCell>
                      {CONDICION_ETIQUETA[r.condicion]}
                      {r.franja ? ` · ${FRANJA_ETIQUETA[r.franja].split(" (")[0]}` : ""}
                      {r.umbral !== null ? ` · ${r.umbral}` : ""}
                    </TableCell>
                    <TableCell className="max-w-md whitespace-normal">{r.texto}</TableCell>
                    <TableCell>
                      <Badge variant={r.activa ? "secondary" : "outline"}>
                        {r.activa ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => editar(r)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setABorrar(r)}>
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
        titulo="Eliminar regla"
        descripcion="La recomendación deja de mostrarse en el mapa y en las estadísticas."
        textoConfirmar="Eliminar"
        onConfirmar={borrar}
      />
    </div>
  );
}
