import { HEAT_RAMP } from "@/lib/heat";

export default function Leyenda() {
  return (
    <div
      className="rounded-md border bg-background/95 p-2 text-xs shadow-sm"
      role="img"
      aria-label="Leyenda de concentración: de baja (verde) a alta (rojo)"
    >
      <p className="mb-1 font-medium">Concentración</p>
      <div className="flex">
        {HEAT_RAMP.map((color) => (
          <span key={color} className="h-3 w-4" style={{ backgroundColor: color }} />
        ))}
      </div>
      <div className="mt-0.5 flex justify-between text-muted-foreground">
        <span>Baja</span>
        <span>Media</span>
        <span>Alta</span>
      </div>
    </div>
  );
}
