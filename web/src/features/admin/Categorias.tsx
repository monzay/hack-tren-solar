"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PanelEstado from "@/features/estadisticas/PanelEstado";
import { useConsulta } from "@/features/estadisticas/useConsulta";
import { apiFetch } from "@/lib/api";
import { CATEGORIA_ETIQUETA, type Categoria } from "@/lib/dominio";
import { CategoriaConfigEntrada } from "@/lib/schemas";
import { SIGUIENTE_ADMIN, mensajeDe } from "./utilidades";

type Config = z.infer<typeof CategoriaConfigEntrada>;
type ConfigVista = Config & { categoria: Categoria };

const OPCIONES: { campo: keyof Omit<Config, "recursosUrgencia">; etiqueta: string }[] = [
  { campo: "permiteAnonimo", etiqueta: "Permite reporte anónimo" },
  { campo: "requiereContacto", etiqueta: "Requiere datos de contacto" },
  { campo: "derivaSalud", etiqueta: "Deriva a Salud" },
  { campo: "derivaPolicia", etiqueta: "Deriva a Policía" },
];

function TarjetaCategoria({
  config,
  alGuardar,
}: {
  config: ConfigVista;
  alGuardar: () => void;
}) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<Config>({
    resolver: zodResolver(CategoriaConfigEntrada),
    defaultValues: {
      permiteAnonimo: config.permiteAnonimo,
      requiereContacto: config.requiereContacto,
      derivaSalud: config.derivaSalud,
      derivaPolicia: config.derivaPolicia,
      recursosUrgencia: config.recursosUrgencia ?? [],
    },
  });

  async function guardar(valores: Config) {
    try {
      await apiFetch(`/admin/categorias/${config.categoria}`, {
        method: "PATCH",
        body: JSON.stringify(valores),
      });
      toast.success(`${CATEGORIA_ETIQUETA[config.categoria]} actualizada.`);
      alGuardar();
    } catch (e) {
      toast.error(mensajeDe(e));
    }
  }

  const prefijo = `cat-${config.categoria}`;
  return (
    <form
      onSubmit={handleSubmit(guardar)}
      className="space-y-3 rounded-xl border bg-card p-4"
    >
      <h2 className="font-semibold">{CATEGORIA_ETIQUETA[config.categoria]}</h2>
      <div className="space-y-2">
        {OPCIONES.map(({ campo, etiqueta }) => (
          <Controller
            key={campo}
            control={control}
            name={campo}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`${prefijo}-${campo}`}
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
                <Label htmlFor={`${prefijo}-${campo}`} className="font-normal">
                  {etiqueta}
                </Label>
              </div>
            )}
          />
        ))}
      </div>
      {config.recursosUrgencia?.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Recursos de urgencia:{" "}
          {config.recursosUrgencia.map((r) => `${r.numero} (${r.descripcion})`).join(", ")}
        </p>
      )}
      <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}

export default function Categorias() {
  const { datos, error, cargando, recargar } = useConsulta<ConfigVista[]>(
    "/admin/categorias",
    SIGUIENTE_ADMIN,
  );
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Definí qué categorías admiten reporte anónimo y a qué organismo se derivan.
      </p>
      <PanelEstado cargando={cargando && !datos} error={error} />
      {datos && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {datos.map((c) => (
            <TarjetaCategoria key={c.categoria} config={c} alGuardar={recargar} />
          ))}
        </div>
      )}
    </div>
  );
}
