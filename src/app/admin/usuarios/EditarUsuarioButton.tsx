"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import type { Usuario } from "@/lib/usuario-api";
import { EditarUsuarioForm } from "./EditarUsuarioForm";
import styles from "./usuarios.module.css";

interface EditarUsuarioButtonProps {
  usuario: Usuario;
}

export function EditarUsuarioButton({ usuario }: EditarUsuarioButtonProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  function aoConcluir() {
    setAberto(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" className={styles.acaoEditar} onClick={() => setAberto(true)}>
        Editar
      </button>
      {aberto && (
        <Modal
          titulo="Editar usuário"
          variante="administracao"
          descricao=""
          onFechar={() => setAberto(false)}
        >
          <EditarUsuarioForm usuario={usuario} onSucesso={aoConcluir} />
        </Modal>
      )}
    </>
  );
}
