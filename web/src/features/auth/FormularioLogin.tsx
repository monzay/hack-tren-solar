"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiFetch } from "@/lib/api";
import { LoginEntrada, type UsuarioSesion } from "@/lib/schemas";
import { destinoPorRol, siguienteSeguro } from "./destinoPorRol";

// Contraseña pública de los usuarios demo; sin ella no se muestra el panel. El admin no se publica.
const CLAVE_DEMO = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

const USUARIOS_DEMO = [
  { email: "salud@demo.ar", rol: "Operador de Salud" },
  { email: "policia@demo.ar", rol: "Operador de Policía" },
  { email: "analista@demo.ar", rol: "Analista" },
  { email: "ciudadano@demo.ar", rol: "Ciudadano" },
];

export function FormularioLogin() {
  const params = useSearchParams();
  const [enviando, setEnviando] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginEntrada>({
    resolver: zodResolver(LoginEntrada),
    defaultValues: { email: "", password: "" },
  });

  async function alEnviar(datos: LoginEntrada) {
    setEnviando(true);
    try {
      const { usuario } = await apiFetch<{ usuario: UsuarioSesion }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(datos),
      });
      const destino = siguienteSeguro(params.get("siguiente")) ?? destinoPorRol(usuario.role);
      window.location.assign(destino);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.mensaje : "No pudimos iniciar sesión. Intentá de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <form onSubmit={handleSubmit(alEnviar)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            aria-invalid={errors.email ? true : undefined}
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            {...register("password")}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={enviando}>
          {enviando ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>

      {CLAVE_DEMO && (
        <aside className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">Usuarios de demostración</p>
          <p className="mb-2">
            Contraseña: <code>{CLAVE_DEMO}</code>
          </p>
          <ul className="space-y-1">
            {USUARIOS_DEMO.map((u) => (
              <li key={u.email}>
                <button
                  type="button"
                  className="text-left underline-offset-2 hover:underline focus-visible:underline"
                  onClick={() => {
                    setValue("email", u.email);
                    setValue("password", CLAVE_DEMO);
                  }}
                >
                  {u.email}
                </button>{" "}
                <span>({u.rol})</span>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
