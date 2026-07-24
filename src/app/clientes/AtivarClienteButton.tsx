"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

interface AtivarClienteButtonProps {
  clienteId: string;
  className?: string;
}

// Sem confirmação, diferente de InativarClienteButton: reativar não esconde nada nem some com
// dado, é o inverso de baixo risco — inclusive pra cliente que já nasceu inativo (achado real:
// "clientes que foram criados inativos não dá pra ativar, tem que poder ativar todos").
export function AtivarClienteButton({ clienteId, className }: AtivarClienteButtonProps) {
  const router = useRouter();
  const mostrarToast = useToast();
  const [enviando, setEnviando] = useState(false);

  async function ativar() {
    setEnviando(true);
    try {
      await fetch(`/api/clientes/${clienteId}/ativar`, { method: "PATCH" });
      mostrarToast("Cliente ativado", "sucesso");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <button type="button" className={className} onClick={ativar} disabled={enviando}>
      Ativar cliente
    </button>
  );
}
