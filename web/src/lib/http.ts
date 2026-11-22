import { z, ZodError } from "zod";

/** Error con código HTTP y mensaje en español para el cliente. */
export class ErrorHttp extends Error {
  constructor(
    public readonly status: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

/**
 * Envuelve un Route Handler: convierte ErrorHttp y ZodError en respuestas JSON
 * `{ mensaje }` (formato que espera `apiFetch`). Nunca devuelve detalles internos.
 */
export function ruta<C>(
  handler: (req: Request, ctx: C) => Promise<Response>,
): (req: Request, ctx: C) => Promise<Response> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof ErrorHttp) {
        return Response.json({ mensaje: e.message }, { status: e.status });
      }
      if (e instanceof ZodError) {
        return Response.json(
          { mensaje: "Datos inválidos", errores: z.flattenError(e).fieldErrors },
          { status: 400 },
        );
      }
      return Response.json({ mensaje: "Error interno" }, { status: 500 });
    }
  };
}

/** Lee y valida el cuerpo JSON con un esquema Zod. */
export async function leerJson<S extends z.ZodType>(
  req: Request,
  esquema: S,
): Promise<z.infer<S>> {
  let cuerpo: unknown;
  try {
    cuerpo = await req.json();
  } catch {
    throw new ErrorHttp(400, "El cuerpo debe ser JSON válido");
  }
  return esquema.parse(cuerpo);
}

/** Valida los query params de la URL con un esquema Zod. */
export function leerQuery<S extends z.ZodType>(req: Request, esquema: S): z.infer<S> {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  return esquema.parse(params);
}

/** IP del cliente (Vercel la pone en x-forwarded-for). */
export function ipDe(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
