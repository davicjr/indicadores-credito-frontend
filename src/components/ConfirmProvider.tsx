"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Modal } from "./Modal";
import styles from "./Modal.module.css";

interface OpcoesConfirmacao {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: "padrao" | "administracao";
  destrutiva?: boolean;
}

type FuncaoConfirmar = (opcoes: OpcoesConfirmacao) => Promise<boolean>;

const ConfirmContext = createContext<FuncaoConfirmar | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<OpcoesConfirmacao | null>(null);
  const [resolver, setResolver] = useState<((valor: boolean) => void) | null>(null);

  const confirmar = useCallback<FuncaoConfirmar>((opcoes) => {
    return new Promise<boolean>((resolve) => {
      setPedido(opcoes);
      setResolver(() => resolve);
    });
  }, []);

  function fechar(valor: boolean) {
    resolver?.(valor);
    setPedido(null);
    setResolver(null);
  }

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      {pedido && (
        <Modal titulo={pedido.titulo} variante={pedido.variante} compacta onFechar={() => fechar(false)}>
          <div
            className={`${styles.confirmacao} ${pedido.destrutiva ? styles.confirmacaoCritica : ""}`}
          >
            <span aria-hidden="true">{pedido.destrutiva ? "!" : "?"}</span>
            <p>{pedido.mensagem}</p>
          </div>
          <div className={styles.acoes}>
            <button type="button" data-foco-inicial onClick={() => fechar(false)}>
              {pedido.textoCancelar ?? "Cancelar"}
            </button>
            <button
              type="button"
              className={`${styles.botao} ${pedido.destrutiva ? styles.botaoCritico : ""}`}
              onClick={() => fechar(true)}
            >
              {pedido.textoConfirmar ?? "Confirmar"}
            </button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): FuncaoConfirmar {
  const contexto = useContext(ConfirmContext);
  if (!contexto) {
    throw new Error("useConfirm precisa estar dentro de <ConfirmProvider>");
  }
  return contexto;
}
