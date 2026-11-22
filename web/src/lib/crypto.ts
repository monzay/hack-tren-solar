// CONTRATO (dueño: agente Tickets, T005). AES-256-GCM con ENCRYPTION_KEY (32 bytes base64).

/** Cifra un texto. Formato de salida: base64(iv).base64(tag).base64(datos). */
export function cifrar(texto: string): string {
  void texto;
  throw new Error("Pendiente T005");
}

export function descifrar(cifrado: string): string {
  void cifrado;
  throw new Error("Pendiente T005");
}
