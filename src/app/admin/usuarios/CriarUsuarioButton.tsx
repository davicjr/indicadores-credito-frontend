"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { CriarUsuarioForm } from "./CriarUsuarioForm";
import styles from "./usuarios.module.css";

export function CriarUsuarioButton() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  function aoConcluir() {
    setAberto(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" className={styles.acaoPrincipal} onClick={() => setAberto(true)}>
        <span aria-hidden="true">+</span>
        Criar usuário
      </button>
      {aberto && (
        <Modal
          titulo="Criar usuário"
          variante="administracao"
          descricao=""
          onFechar={() => setAberto(false)}
        >
          <CriarUsuarioForm onSucesso={aoConcluir} />
        </Modal>
      )}
    </>
  );
}
