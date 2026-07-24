"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

interface ModalProps {
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
  largura?: "padrao" | "larga";
  variante?: "padrao" | "cliente" | "administracao";
  descricao?: string;
  compacta?: boolean;
}

// A saída anima antes de desmontar de verdade: iniciar a saída só marca "saindo" — o onFechar
// do chamador (que tira o <Modal> da árvore) dispara quando a animação termina. onAnimationEnd
// é o caminho normal; o timeout (mesma duração de --motion-rapida) é rede de segurança — cobre
// o caso do evento não disparar (acontece) e, como efeito colateral, é o que torna esse fluxo
// testável: jsdom não implementa AnimationEvent, então testes dependem só do timeout.
const DURACAO_SAIDA_MS = 130;

export function Modal({
  titulo,
  onFechar,
  children,
  largura = "padrao",
  variante = "padrao",
  descricao,
  compacta = false,
}: ModalProps) {
  const [saindo, setSaindo] = useState(false);
  const jaFechouRef = useRef(false);
  const caixaRef = useRef<HTMLDivElement>(null);
  const tituloId = useId();
  const descricaoId = useId();
  const estruturada = variante === "cliente" || variante === "administracao";

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        setSaindo(true);
      }
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, []);

  useEffect(() => {
    if (!saindo) return;
    const id = setTimeout(fecharDeVerdade, DURACAO_SAIDA_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saindo]);

  useEffect(() => {
    const elementoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const primeiroFoco =
      caixaRef.current?.querySelector<HTMLElement>("[data-foco-inicial]") ??
      caixaRef.current?.querySelector<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
      );
    (primeiroFoco ?? caixaRef.current)?.focus();

    return () => {
      document.body.style.overflow = overflowAnterior;
      elementoAnterior?.focus();
    };
  }, []);

  function fecharDeVerdade() {
    if (jaFechouRef.current) return;
    jaFechouRef.current = true;
    onFechar();
  }

  function manterFoco(evento: ReactKeyboardEvent<HTMLDivElement>) {
    if (evento.key !== "Tab") return;

    const focaveis = Array.from(
      evento.currentTarget.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
      ),
    ).filter((elemento) => elemento.getAttribute("aria-hidden") !== "true");

    if (focaveis.length === 0) {
      evento.preventDefault();
      evento.currentTarget.focus();
      return;
    }

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }

  const contexto =
    variante === "administracao"
      ? "Administração · acesso"
      : variante === "cliente"
        ? "Carteira · cliente"
        : compacta
          ? "Confirmação · decisão"
          : "Janela · contexto";

  const conteudo = (
    <div
      className={[
        styles.fundo,
        estruturada ? styles.fundoCliente : "",
        compacta ? styles.fundoCompacto : "",
        saindo ? styles.fundoSaindo : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) setSaindo(true);
      }}
      onAnimationEnd={() => {
        if (saindo) fecharDeVerdade();
      }}
      role="presentation"
    >
      <div
        ref={caixaRef}
        className={[
          styles.caixa,
          largura === "larga" ? styles.caixaLarga : "",
          estruturada ? styles.caixaCliente : "",
          variante === "administracao" ? styles.caixaAdministracao : "",
          compacta ? styles.caixaCompacta : "",
          saindo ? styles.caixaSaindo : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onKeyDown={manterFoco}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descricao ? descricaoId : undefined}
        tabIndex={-1}
      >
        <header
          className={[
            styles.cabecalho,
            estruturada ? styles.cabecalhoEstruturado : "",
            variante === "administracao" ? styles.cabecalhoAdministracao : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div>
            <span className={styles.contexto}>{contexto}</span>
            <h2 id={tituloId}>{titulo}</h2>
            {descricao && <p id={descricaoId}>{descricao}</p>}
          </div>
          <button
            type="button"
            className={styles.fechar}
            aria-label={`Fechar ${titulo.toLocaleLowerCase("pt-BR")}`}
            onClick={() => setSaindo(true)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        {children}
      </div>
    </div>
  );

  return createPortal(conteudo, document.body);
}
