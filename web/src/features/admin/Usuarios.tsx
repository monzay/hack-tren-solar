"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { ORGANISMO_ETIQUETA, ORGANISMOS, ROLES, organismoDeRol, type Role } from "@/lib/dominio";
import { UsuarioEntrada, type UsuarioVista } from "@/lib/schemas";
import { Campo, ConfirmarDialogo, SelectSimple, SIGUIENTE_ADMIN, mensajeDe } from "./utilidades";

const ROL_ETIQUETA: Record<Role, string> = {
  CIUDADANO: "Ciudadano",
  OPERADOR_SALUD: "Operador de Salud",
  OPERADOR_POLICIA: "Operador de Policía",
  ANALISTA: "Analista",
  ADMIN: "Administrador",
};

type Entrada = z.input<typeof UsuarioEntrada>;
type Salida = z.output<typeof UsuarioEntrada>;

const VACIO: Entrada = {
  email: "",
  nombre: "",
  role: "ANALISTA",
  organismo: null,
  password: "",
  activo: true,
};

export default function Usuarios() {
  const { datos, error, cargando, recargar } = useConsulta<UsuarioVista[]>(
    "/admin/usuarios",
    SIGUIENTE_ADMIN,
  );
  const [aDesactivar, setADesactivar] = useState<UsuarioVista | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Entrada, unknown, Salida>({
    resolver: zodResolver(UsuarioEntrada),
    defaultValues: VACIO,
  });

  async function alEnviar(valores: Salida) {
    try {
      await apiFetch("/admin/usuarios", {
        method: "POST",
        body: JSON.stringify(valores),
      });
      toast.success("Usuario creado.");
      reset(VACIO);
      recargar();
    } catch (e) {
      toast.error(mensajeDe(e));
    }
  }

  async function desactivar() {
    if (!aDesactivar) return;
    try {
      await apiFetch(`/admin/usuarios/${aDesactivar.id}`, { method: "DELETE" });
      toast.success("Usuario desactivado.");
      recargar();
    } catch (e) {
      toast.error(mensajeDe(e));
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">Nuevo usuario</h2>
        <form
          onSubmit={handleSubmit(alEnviar)}
          noValidate
          className="grid gap-4 md:grid-cols-2"
        >
          <Campo id="u-nombre" etiqueta="Nombre" error={errors.nombre?.message}>
            <Input id="u-nombre" autoComplete="off" {...register("nombre")} />
          </Campo>
          <Campo id="u-email" etiqueta="Email" error={errors.email?.message}>
            <Input id="u-email" type="email" autoComplete="off" {...register("email")} />
          </Campo>
          <Campo id="u-rol" etiqueta="Rol" error={errors.role?.message}>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <SelectSimple
                  id="u-rol"
                  valor={field.value}
                  onCambio={(v) => {
                    field.onChange(v);
                    setValue("organismo", organismoDeRol(v as Role));
                  }}
                  opciones={ROLES.map((r) => ({ valor: r, etiqueta: ROL_ETIQUETA[r] }))}
                />
              )}
            />
          </Campo>
          <Campo id="u-org" etiqueta="Organismo" error={errors.organismo?.message}>
            <Controller
              control={control}
              name="organismo"
              render={({ field }) => (
                <SelectSimple
                  id="u-org"
                  valor={field.value ?? "ninguno"}
                  onCambio={(v) => field.onChange(v === "ninguno" ? null : v)}
                  opciones={[
                    { valor: "ninguno", etiqueta: "Sin organismo" },
                    ...ORGANISMOS.map((o) => ({ valor: o, etiqueta: ORGANISMO_ETIQUETA[o] })),
                  ]}
                />
              )}
            />
          </Campo>
          <Campo
            id="u-pass"
            etiqueta="Contraseña"
            ayuda="Mínimo 8 caracteres."
            error={errors.password?.message}
          >
            <Input
              id="u-pass"
              type="password"
              autoComplete="new-password"
              {...register("password", { setValueAs: (v: string) => v || undefined })}
            />
          </Campo>
          <div className="flex items-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando…" : "Crear usuario"}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">Usuarios</h2>
        <PanelEstado cargando={cargando && !datos} error={error} />
        {datos && (
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Organismo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nombre}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{ROL_ETIQUETA[u.role]}</TableCell>
                    <TableCell>{u.organismo ? ORGANISMO_ETIQUETA[u.organismo] : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.activo ? "secondary" : "outline"}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {u.activo && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setADesactivar(u)}
                          aria-label={`Desactivar a ${u.nombre}`}
                        >
                          Desactivar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <ConfirmarDialogo
        abierto={aDesactivar !== null}
        onCambio={(a) => !a && setADesactivar(null)}
        titulo="Desactivar usuario"
        descripcion={`${aDesactivar?.nombre ?? ""} no va a poder ingresar más a la plataforma.`}
        textoConfirmar="Desactivar"
        onConfirmar={desactivar}
      />
    </div>
  );
}
