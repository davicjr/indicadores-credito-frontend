"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/components/ToastProvider";
import styles from "./usuarios.module.css";

interface ExcluirUsuarioButtonProps {
  usuarioId: string;
}

export function ExcluirUsuarioButton({ usuarioId }: ExcluirUsuarioButtonProps) {
  const router = useRouter();
  const confirmar = useConfirm();
  const mostrarToast = useToast();
  const [enviando, setEnviando] = useState(false);

  async function excluir() {
    const ok = await confirmar({
      titulo: "Excluir usuário",
      mensagem: "Essa ação é permanente e não pode ser desfeita — o usuário some da plataforma.",
      textoConfirmar: "Excluir",
      variante: "administracao",
      destrutiva: true,
    });
    if (!ok) {
      return;
    }

    setEnviando(true);
    try {
      const resposta = await fetch(`/api/usuarios/${usuarioId}`, { method: "DELETE" });
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        mostrarToast(corpo?.mensagem ?? "Não foi possível excluir o usuário.", "erro");
        return;
      }
      mostrarToast("Usuário excluído", "sucesso");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <button type="button" className={styles.acaoExcluir} onClick={excluir} disabled={enviando}>
      Excluir usuário
    </button>
  );
}
