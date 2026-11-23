"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch } from "@/lib/api";
import {
  CATEGORIA_ETIQUETA,
  ESTADO_ETIQUETA,
  type EstadoTicket,
  FRANJA_ETIQUETA,
  SIGUIENTE_ESTADO,
} from "@/lib/dominio";
import { NuevaNotaEntrada, type NotaVista, type TicketDetalle } from "@/lib/schemas";
import { fechaCorta, fechaHora, varianteEstado } from "./formato";

type NotaForm = { texto: string };

function Dato({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm">{valor || "-"}</dd>
    </div>
  );
}

export function DetalleTicket({ id }: { id: string }) {
  const [ticket, setTicket] = useState<TicketDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [avanzando, setAvanzando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const manejarError = useCallback(
    (e: unknown, porDefecto: string) => {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        window.location.assign(`/login?siguiente=/operador/${id}`);
        return;
      }
      toast.error(e instanceof ApiError ? e.mensaje : porDefecto);
    },
    [id],
  );

  useEffect(() => {
    let activo = true;
    apiFetch<TicketDetalle>(`/operador/tickets/${id}`)
      .then((t) => {
        if (activo) setTicket(t);
      })
      .catch((e) => {
        if (!activo) return;
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          window.location.assign(`/login?siguiente=/operador/${id}`);
          return;
        }
        setErrorCarga(e instanceof ApiError ? e.mensaje : "No pudimos cargar el ticket.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [id]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NotaForm>({
    resolver: zodResolver(NuevaNotaEntrada),
    defaultValues: { texto: "" },
  });

  async function agregarNota(datos: NotaForm) {
    try {
      const nota = await apiFetch<NotaVista>(`/operador/tickets/${id}/notas`, {
        method: "POST",
        body: JSON.stringify(datos),
      });
      setTicket((t) => (t ? { ...t, notas: [...t.notas, nota] } : t));
      reset();
      toast.success("Nota agregada");
    } catch (e) {
      manejarError(e, "No pudimos guardar la nota.");
    }
  }

  async function avanzar(siguiente: EstadoTicket) {
    setAvanzando(true);
    try {
      const actualizado = await apiFetch<TicketDetalle>(`/operador/tickets/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado: siguiente }),
      });
      setTicket(actualizado);
      toast.success(`Estado actualizado: ${ESTADO_ETIQUETA[actualizado.estado]}`);
    } catch (e) {
      manejarError(e, "No pudimos cambiar el estado.");
    } finally {
      setAvanzando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6">
      <Link
        href="/operador"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Volver a la bandeja
      </Link>

      {cargando && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {errorCarga && (
        <p role="alert" className="text-sm text-destructive">
          {errorCarga}
        </p>
      )}

      {ticket && (
        <>
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">
                #{ticket.id} · {CATEGORIA_ETIQUETA[ticket.categoria]}
              </h1>
              <Badge variant={varianteEstado(ticket.estado)} className="mt-1">
                {ESTADO_ETIQUETA[ticket.estado]}
              </Badge>
            </div>
            {SIGUIENTE_ESTADO[ticket.estado] && (
              <Button
                size="lg"
                disabled={avanzando}
                onClick={() => {
                  const s = SIGUIENTE_ESTADO[ticket.estado];
                  if (s) void avanzar(s);
                }}
              >
                Pasar a {ESTADO_ETIQUETA[SIGUIENTE_ESTADO[ticket.estado]!]}
              </Button>
            )}
          </header>

          <section className="rounded-lg border p-4">
            <h2 className="mb-3 font-medium">Datos del hecho</h2>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Dato etiqueta="Fecha" valor={fechaCorta(ticket.fecha)} />
              <Dato etiqueta="Franja" valor={FRANJA_ETIQUETA[ticket.franja]} />
              <Dato etiqueta="Barrio" valor={ticket.barrio} />
              <Dato
                etiqueta="Reporta como"
                valor={ticket.rolReportante === "VICTIMA" ? "Víctima" : "Testigo"}
              />
              <Dato
                etiqueta="Modo"
                valor={ticket.modo === "ANONIMO" ? "Anónimo" : "Con contacto"}
              />
              <Dato etiqueta="Quiere denunciar" valor={ticket.quiereDenunciar ? "Sí" : "No"} />
              <Dato
                etiqueta="Ubicación"
                valor={`${ticket.lat.toFixed(5)}, ${ticket.lng.toFixed(5)}`}
              />
            </dl>
            <h3 className="mb-1 mt-4 text-xs uppercase tracking-wide text-muted-foreground">
              Relato
            </h3>
            <p className="whitespace-pre-wrap text-sm">{ticket.relato || "Sin relato."}</p>
          </section>

          <section className="rounded-lg border p-4">
            <h2 className="mb-3 font-medium">Contacto</h2>
            {ticket.contacto ? (
              <>
                <Alert className="mb-3">
                  <ShieldAlert aria-hidden />
                  <AlertDescription>
                    El acceso a estos datos queda registrado.
                  </AlertDescription>
                </Alert>
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Dato etiqueta="Nombre" valor={ticket.contacto.nombre} />
                  <Dato etiqueta="Teléfono" valor={ticket.contacto.telefono} />
                  <Dato etiqueta="Email" valor={ticket.contacto.email} />
                  <Dato etiqueta="Horario" valor={ticket.contacto.horario} />
                </dl>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Reporte anónimo: no hay datos de contacto.
              </p>
            )}
          </section>

          <section className="rounded-lg border p-4">
            <h2 className="mb-3 font-medium">Notas internas</h2>
            {ticket.notas.length === 0 ? (
              <p className="mb-3 text-sm text-muted-foreground">Todavía no hay notas.</p>
            ) : (
              <ul className="mb-4 space-y-3">
                {ticket.notas.map((n) => (
                  <li key={n.id} className="rounded-md bg-muted/50 p-3 text-sm">
                    <p className="whitespace-pre-wrap">{n.texto}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.autor} · {fechaHora(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={handleSubmit(agregarNota)} className="space-y-2" noValidate>
              <Label htmlFor="nota">Agregar nota</Label>
              <Textarea id="nota" rows={3} maxLength={2000} {...register("texto")} />
              {errors.texto && (
                <p className="text-sm text-destructive">Escribí el texto de la nota.</p>
              )}
              <Button type="submit" disabled={isSubmitting}>
                Guardar nota
              </Button>
            </form>
          </section>

          <section className="rounded-lg border p-4">
            <h2 className="mb-3 font-medium">Historial de estados</h2>
            {ticket.historial.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin cambios de estado.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {ticket.historial.map((h, i) => (
                  <li key={i}>
                    {ESTADO_ETIQUETA[h.de]} → {ESTADO_ETIQUETA[h.a]}
                    <span className="text-muted-foreground">
                      {" "}
                      · {h.autor} · {fechaHora(h.fecha)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  );
}
