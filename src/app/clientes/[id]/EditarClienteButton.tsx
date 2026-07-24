"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import type { Cliente } from "@/lib/clientes-api";
import { ClienteForm, type ClienteFormState } from "../ClienteForm";
import styles from "../clientes.module.css";

interface EditarClienteButtonProps {
  cliente: Cliente;
}

function paraValoresIniciais(cliente: Cliente): Partial<ClienteFormState> {
  return {
    nome: cliente.nome,
    email: cliente.email,
    telefone: cliente.telefone,
    dataNascimento: cliente.dataNascimento,
    rendaMensal: cliente.dadosFinanceiros.rendaMensal?.toString() ?? "",
    numeroDependentes: cliente.dadosFinanceiros.numeroDependentes?.toString() ?? "",
    utilizacaoCreditoRotativo: cliente.dadosFinanceiros.utilizacaoCreditoRotativo.toString(),
    razaoDividaRenda: cliente.dadosFinanceiros.razaoDividaRenda.toString(),
    linhasCreditoAbertas: cliente.dadosFinanceiros.linhasCreditoAbertas.toString(),
    emprestimosImobiliarios: cliente.dadosFinanceiros.emprestimosImobiliarios.toString(),
    atrasos30a59Dias: cliente.dadosFinanceiros.atrasos30a59Dias.toString(),
    atrasos60a89Dias: cliente.dadosFinanceiros.atrasos60a89Dias.toString(),
    atrasos90DiasOuMais: cliente.dadosFinanceiros.atrasos90DiasOuMais.toString(),
  };
}

export function EditarClienteButton({ cliente }: EditarClienteButtonProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  function aoConcluir() {
    setAberto(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" className={styles.botaoSecundario} onClick={() => setAberto(true)}>
        Editar
      </button>
      {aberto && (
        <Modal
          titulo="Editar cliente"
          descricao=""
          onFechar={() => setAberto(false)}
          largura="larga"
          variante="cliente"
        >
          <ClienteForm
            modo="editar"
            clienteId={cliente.id}
            valoresIniciais={paraValoresIniciais(cliente)}
            onSucesso={aoConcluir}
            apresentacao="modal"
          />
        </Modal>
      )}
    </>
  );
}
