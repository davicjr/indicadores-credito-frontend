"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/components/ToastProvider";
import styles from "./usuarios.module.css";

interface InativarUsuarioButtonProps {
  usuarioId: string;
}

export function InativarUsuarioButton({ usuarioId }: InativarUsuarioButtonProps) {
  const router = useRouter();
  const confirmar = useConfirm();
  const mostrarToast = useToast();
  const [enviando, setEnviando] = useState(false);

  async function inativar() {
    const ok = await confirmar({
      titulo: "Inativar usuário",
      mensagem: "Ele deixa de conseguir fazer login na plataforma.",
      textoConfirmar: "Inativar",
      variante: "administracao",
    });
    if (!ok) {
      return;
    }

    setEnviando(true);
    try {
      await fetch(`/api/usuarios/${usuarioId}/inativar`, { method: "PATCH" });
      mostrarToast("Usuário inativado", "sucesso");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <button type="button" className={styles.acaoInativar} onClick={inativar} disabled={enviando}>
      Inativar usuário
    </button>
  );
}
