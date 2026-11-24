"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api";

export const SIGUIENTE_ADMIN = "/admin";

export function mensajeDe(e: unknown): string {
  return e instanceof ApiError ? e.mensaje : "Ocurrió un error inesperado. Intentá de nuevo.";
}

/** Convierte un input numérico vacío en null. */
export function numeroONull(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {ayuda && !error && <p className="text-xs text-muted-foreground">{ayuda}</p>}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectSimple({
  id,
  valor,
  onCambio,
  opciones,
  deshabilitado,
}: {
  id: string;
  valor: string;
  onCambio: (v: string) => void;
  opciones: { valor: string; etiqueta: string }[];
  deshabilitado?: boolean;
}) {
  return (
    <Select value={valor} onValueChange={onCambio} disabled={deshabilitado}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opciones.map((o) => (
          <SelectItem key={o.valor} value={o.valor}>
            {o.etiqueta}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ConfirmarDialogo({
  abierto,
  onCambio,
  titulo,
  descripcion,
  textoConfirmar,
  onConfirmar,
}: {
  abierto: boolean;
  onCambio: (abierto: boolean) => void;
  titulo: string;
  descripcion: string;
  textoConfirmar: string;
  onConfirmar: () => Promise<void>;
}) {
  const [procesando, setProcesando] = useState(false);
  async function confirmar() {
    setProcesando(true);
    try {
      await onConfirmar();
      onCambio(false);
    } finally {
      setProcesando(false);
    }
  }
  return (
    <Dialog open={abierto} onOpenChange={onCambio}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onCambio(false)} disabled={procesando}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmar} disabled={procesando}>
            {procesando ? "Procesando…" : textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
