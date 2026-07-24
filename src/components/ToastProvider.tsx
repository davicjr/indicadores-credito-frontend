"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./ToastProvider.module.css";

type TipoToast = "info" | "sucesso" | "erro";

interface ToastItem {
  id: string;
  mensagem: string;
  tipo: TipoToast;
  saindo: boolean;
}

type FuncaoToast = (mensagem: string, tipo?: TipoToast) => void;

const ToastContext = createContext<FuncaoToast | null>(null);

const DURACAO_MS = 4000;
// Combina com --motion-rapida (design_system.md#Motion) — some com fade antes de sair da lista,
// em vez de sumir de golpe quando o tempo de exibição acaba.
const DURACAO_SAIDA_MS = 130;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const temporizadores = useRef<ReturnType<typeof setTimeout>[]>([]);

  const removerToast = useCallback((id: string) => {
    setToasts((atual) => atual.map((item) => (item.id === id ? { ...item, saindo: true } : item)));
    const temporizador = setTimeout(() => {
      setToasts((atual) => atual.filter((item) => item.id !== id));
    }, DURACAO_SAIDA_MS);
    temporizadores.current.push(temporizador);
  }, []);

  const mostrarToast = useCallback<FuncaoToast>(
    (mensagem, tipo = "info") => {
      const id = crypto.randomUUID();
      setToasts((atual) => [...atual, { id, mensagem, tipo, saindo: false }]);
      const temporizador = setTimeout(() => removerToast(id), DURACAO_MS);
      temporizadores.current.push(temporizador);
    },
    [removerToast],
  );

  useEffect(() => {
    const ativos = temporizadores.current;
    return () => {
      ativos.forEach(clearTimeout);
    };
  }, []);

  const apresentacao = {
    info: { icone: "i", rotulo: "Informação" },
    sucesso: { icone: "✓", rotulo: "Concluído" },
    erro: { icone: "!", rotulo: "Atenção" },
  } satisfies Record<TipoToast, { icone: string; rotulo: string }>;

  return (
    <ToastContext.Provider value={mostrarToast}>
      {children}
      <div className={styles.pilha} aria-label="Notificações">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[styles.item, styles[toast.tipo], toast.saindo ? styles.itemSaindo : ""]
              .filter(Boolean)
              .join(" ")}
            role={toast.tipo === "erro" ? "alert" : "status"}
            aria-live={toast.tipo === "erro" ? "assertive" : "polite"}
            aria-atomic="true"
          >
            <span className={styles.icone} aria-hidden="true">
              {apresentacao[toast.tipo].icone}
            </span>
            <div className={styles.conteudo}>
              <strong>{apresentacao[toast.tipo].rotulo}</strong>
              <p>{toast.mensagem}</p>
            </div>
            <button
              type="button"
              className={styles.fechar}
              aria-label={`Dispensar notificação: ${toast.mensagem}`}
              onClick={() => removerToast(toast.id)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): FuncaoToast {
  const contexto = useContext(ToastContext);
  if (!contexto) {
    throw new Error("useToast precisa estar dentro de <ToastProvider>");
  }
  return contexto;
}
