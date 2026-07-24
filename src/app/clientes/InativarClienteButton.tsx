"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/components/ToastProvider";

interface InativarClienteButtonProps {
  clienteId: string;
  className?: string;
}

export function InativarClienteButton({ clienteId, className }: InativarClienteButtonProps) {
  const router = useRouter();
  const confirmar = useConfirm();
  const mostrarToast = useToast();
  const [enviando, setEnviando] = useState(false);

  async function inativar() {
    const ok = await confirmar({
      titulo: "Inativar cliente",
      mensagem: "Ele deixa de aparecer como ativo na plataforma. Essa ação pode ser revertida depois.",
      textoConfirmar: "Inativar",
    });
    if (!ok) {
      return;
    }

    setEnviando(true);
    try {
      await fetch(`/api/clientes/${clienteId}/inativar`, { method: "PATCH" });
      mostrarToast("Cliente inativado", "sucesso");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <button type="button" className={className} onClick={inativar} disabled={enviando}>
      Inativar cliente
    </button>
  );
}
