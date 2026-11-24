const MENSAJE_GENERICO = "Ocurrió un error inesperado. Intentá de nuevo.";

export class ApiError extends Error {
  readonly status: number;
  readonly mensaje: string;

  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.mensaje = mensaje;
  }
}

async function leerJson(respuesta: Response): Promise<unknown> {
  try {
    return await respuesta.json();
  } catch {
    return undefined;
  }
}

function extraerMensaje(cuerpo: unknown): string | undefined {
  if (typeof cuerpo === "object" && cuerpo !== null && "mensaje" in cuerpo) {
    const { mensaje } = cuerpo as { mensaje: unknown };
    if (typeof mensaje === "string" && mensaje.length > 0) return mensaje;
  }
  return undefined;
}

export async function apiFetch<T>(
  ruta: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const respuesta = await fetch(`/api${ruta}`, {
    ...init,
    headers,
    credentials: "same-origin",
  });
  const cuerpo = await leerJson(respuesta);

  if (!respuesta.ok) {
    throw new ApiError(
      respuesta.status,
      extraerMensaje(cuerpo) ?? MENSAJE_GENERICO,
    );
  }
  return cuerpo as T;
}
