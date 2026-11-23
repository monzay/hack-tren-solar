"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import {
  CATEGORIAS,
  CATEGORIA_ETIQUETA,
  ESTADOS,
  ESTADO_ETIQUETA,
  FRANJA_ETIQUETA,
  ORGANISMO_ETIQUETA,
  type Categoria,
  type EstadoTicket,
} from "@/lib/dominio";
import { useSesion } from "@/features/auth/useSesion";
import { fechaCorta, varianteEstado } from "./formato";
import { useBandeja } from "./useBandeja";

const TODOS = "todos";

export function Bandeja() {
  const { usuario, cerrarSesion } = useSesion();
  const [estado, setEstado] = useState<EstadoTicket | "">("");
  const [categoria, setCategoria] = useState<Categoria | "">("");
  const { datos, error, cargando } = useBandeja(estado, categoria);

  const sinPermiso = error instanceof ApiError && (error.status === 401 || error.status === 403);
  useEffect(() => {
    if (sinPermiso) window.location.assign("/login?siguiente=/operador");
  }, [sinPermiso]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Bandeja de tickets</h1>
          <p className="text-sm text-muted-foreground">
            {usuario?.organismo ? ORGANISMO_ETIQUETA[usuario.organismo] : "Organismo"}
            {usuario ? ` · ${usuario.nombre}` : ""}
          </p>
        </div>
        <Button variant="outline" onClick={() => void cerrarSesion()}>
          <LogOut aria-hidden /> Cerrar sesión
        </Button>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="min-w-40 flex-1 sm:flex-none">
          <Select
            value={estado || TODOS}
            onValueChange={(v) => setEstado(v === TODOS ? "" : (v as EstadoTicket))}
          >
            <SelectTrigger className="w-full" aria-label="Filtrar por estado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los estados</SelectItem>
              {ESTADOS.map((e) => (
                <SelectItem key={e} value={e}>
                  {ESTADO_ETIQUETA[e]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-48 flex-1 sm:flex-none">
          <Select
            value={categoria || TODOS}
            onValueChange={(v) => setCategoria(v === TODOS ? "" : (v as Categoria))}
          >
            <SelectTrigger className="w-full" aria-label="Filtrar por categoría">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas las categorías</SelectItem>
              {CATEGORIAS.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORIA_ETIQUETA[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && !sinPermiso && (
        <p role="alert" className="text-sm text-destructive">
          No pudimos actualizar la bandeja. Reintentamos automáticamente.
        </p>
      )}

      {cargando && !datos ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N.º</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Barrio</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Franja</TableHead>
                <TableHead>Modo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(datos ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No hay tickets con estos filtros.
                  </TableCell>
                </TableRow>
              )}
              {(datos ?? []).map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link
                      href={`/operador/${t.id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      #{t.id}
                    </Link>
                  </TableCell>
                  <TableCell>{CATEGORIA_ETIQUETA[t.categoria]}</TableCell>
                  <TableCell>{t.barrio}</TableCell>
                  <TableCell>{fechaCorta(t.fecha)}</TableCell>
                  <TableCell>{FRANJA_ETIQUETA[t.franja]}</TableCell>
                  <TableCell>{t.modo === "ANONIMO" ? "Anónimo" : "Con contacto"}</TableCell>
                  <TableCell>
                    <Badge variant={varianteEstado(t.estado)}>{ESTADO_ETIQUETA[t.estado]}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
