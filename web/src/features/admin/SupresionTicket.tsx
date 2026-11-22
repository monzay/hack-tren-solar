"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { Campo, ConfirmarDialogo, mensajeDe } from "./utilidades";

export default function SupresionTicket() {
  const [valor, setValor] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const id = Number(valor);
  const invalido = valor.trim() === "" || !Number.isInteger(id) || id <= 0;

  async function suprimir() {
    try {
      await apiFetch(`/admin/tickets/${id}`, { method: "DELETE" });
      toast.success(`Ticket #${id} suprimido.`);
      setValor("");
    } catch (e) {
      toast.error(mensajeDe(e));
    }
  }

  return (
    <section className="max-w-xl space-y-4 rounded-xl border bg-card p-4">
      <h2 className="text-lg font-semibold">Supresión de ticket</h2>
      <Alert>
        <AlertDescription>
          Borra el ticket y sus datos de contacto de forma definitiva, a pedido de la persona. No
          se puede deshacer.
        </AlertDescription>
      </Alert>
      <Campo id="ticket-id" etiqueta="Número de ticket">
        <Input
          id="ticket-id"
          type="number"
          min={1}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
      </Campo>
      <Button variant="destructive" disabled={invalido} onClick={() => setConfirmando(true)}>
        Suprimir ticket
      </Button>
      <ConfirmarDialogo
        abierto={confirmando}
        onCambio={setConfirmando}
        titulo={`Suprimir el ticket #${invalido ? "" : id}`}
        descripcion="Se elimina de forma física, junto con sus notas e historial. Esta acción no se puede deshacer."
        textoConfirmar="Suprimir definitivamente"
        onConfirmar={suprimir}
      />
    </section>
  );
}
