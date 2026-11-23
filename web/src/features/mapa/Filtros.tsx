"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  CATEGORIAS,
  CATEGORIA_ETIQUETA,
  FRANJAS,
  FRANJA_ETIQUETA,
} from "@/lib/dominio";
import type { BarrioPublico } from "@/lib/schemas";
import { FILTROS_INICIALES, type FiltrosUI } from "./estadoFiltros";

const CLASE_SELECT =
  "h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface Props {
  filtros: FiltrosUI;
  barrios: BarrioPublico[];
  onChange: (f: FiltrosUI) => void;
}

export default function Filtros({ filtros, barrios, onChange }: Props) {
  const set = <K extends keyof FiltrosUI>(k: K, v: FiltrosUI[K]) =>
    onChange({ ...filtros, [k]: v });

  return (
    <form
      className="grid grid-cols-2 gap-3"
      aria-label="Filtros del mapa"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="col-span-2 space-y-1">
        <Label htmlFor="f-barrio">Barrio</Label>
        <select
          id="f-barrio"
          className={CLASE_SELECT}
          value={filtros.barrioId ?? ""}
          onChange={(e) => set("barrioId", e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Toda la ciudad</option>
          {barrios.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2 space-y-1">
        <Label htmlFor="f-categoria">Categoría</Label>
        <select
          id="f-categoria"
          className={CLASE_SELECT}
          value={filtros.categoria}
          onChange={(e) => set("categoria", e.target.value as FiltrosUI["categoria"])}
        >
          <option value="">Todas</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {CATEGORIA_ETIQUETA[c]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="f-periodo">Período</Label>
        <select
          id="f-periodo"
          className={CLASE_SELECT}
          value={filtros.meses}
          onChange={(e) => set("meses", Number(e.target.value) as FiltrosUI["meses"])}
        >
          <option value={3}>Últimos 3 meses</option>
          <option value={6}>Últimos 6 meses</option>
          <option value={12}>Últimos 12 meses</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="f-franja">Franja horaria</Label>
        <select
          id="f-franja"
          className={CLASE_SELECT}
          value={filtros.franja}
          onChange={(e) => set("franja", e.target.value as FiltrosUI["franja"])}
        >
          <option value="">Todas</option>
          {FRANJAS.map((f) => (
            <option key={f} value={f}>
              {FRANJA_ETIQUETA[f]}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2 space-y-1">
        <Label htmlFor="f-fuente">Fuente</Label>
        <select
          id="f-fuente"
          className={CLASE_SELECT}
          value={filtros.fuente}
          onChange={(e) => set("fuente", e.target.value as FiltrosUI["fuente"])}
        >
          <option value="todas">Oficial y ciudadana</option>
          <option value="oficial">Solo datos oficiales</option>
          <option value="ciudadano">Solo reportes ciudadanos</option>
        </select>
      </div>
      <div className="col-span-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onChange(FILTROS_INICIALES)}>
          Restablecer filtros
        </Button>
      </div>
    </form>
  );
}
