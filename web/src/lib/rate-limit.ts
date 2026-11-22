// CONTRATO (dueño: agente Auth, T004). Contador en la tabla RateLimit (ventana fija).

/** Suma 1 al contador de `clave`. Devuelve false si se superó `limite` dentro de `ventanaMs`. */
export async function consumir(clave: string, limite: number, ventanaMs: number): Promise<boolean> {
  void clave;
  void limite;
  void ventanaMs;
  throw new Error("Pendiente T004");
}
