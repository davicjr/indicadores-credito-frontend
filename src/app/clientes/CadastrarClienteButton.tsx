"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { ClienteForm } from "./ClienteForm";
import styles from "./clientes.module.css";

export function CadastrarClienteButton() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  function aoConcluir() {
    setAberto(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" className={`${styles.link} ${styles.acaoCadastrar}`} onClick={() => setAberto(true)}>
        <span>Cadastrar cliente</span>
        <span aria-hidden="true">＋</span>
      </button>
      {aberto && (
        <Modal
          titulo="Cadastrar cliente"
          descricao="Inclua o cadastro e os sinais financeiros usados na leitura de crédito."
          onFechar={() => setAberto(false)}
          largura="larga"
          variante="cliente"
        >
          <ClienteForm modo="criar" onSucesso={aoConcluir} apresentacao="modal" />
        </Modal>
      )}
    </>
  );
}
