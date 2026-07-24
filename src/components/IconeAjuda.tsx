"use client";

import { useRef, useState, type ReactNode } from "react";
import styles from "./IconeAjuda.module.css";

interface IconeAjudaProps {
  id: string;
  // Texto simples (a maioria dos usos) ou conteúdo rico (ex.: a lista de barras de
  // ExplicabilidadeScore no detalhe do cliente) — um dos dois, nunca os dois.
  texto?: string;
  children?: ReactNode;
  rotuloAcessivel: string;
  // Painel mais largo pra conteúdo rico (listas, barras) que não cabe nos 17rem padrão de um
  // texto de ajuda comum.
  largo?: boolean;
}

const MARGEM_BORDA_PX = 16;

// Acha o limite direito real que o painel precisa respeitar: não é só a viewport, é o ancestral
// clipável mais próximo (achado real: o painel ficava cortado bem antes da borda da tela, pelo
// overflow:hidden de .paginaSimulador — necessário ali pra recortar a forma decorativa do canto,
// não pode virar visible). "Clipável" cobre hidden/clip/scroll/auto, não só hidden.
function limiteDireito(elemento: HTMLElement): number {
  let limite = window.innerWidth;
  let atual = elemento.parentElement;
  while (atual) {
    const estilo = getComputedStyle(atual);
    if (estilo.overflow !== "visible" || estilo.overflowX !== "visible") {
      limite = Math.min(limite, atual.getBoundingClientRect().right);
    }
    atual = atual.parentElement;
  }
  return limite;
}

// Ícone "i" com tooltip no hover/foco — usado em qualquer lugar que precise de conteúdo mais
// longo sem deixá-lo sempre visível (campos do simulador, cards de caso real, explicabilidade
// do score). Extraído depois de repetir em 2 lugares (ver Campo.tsx e CasosReaisSimulador.tsx).
export function IconeAjuda({ id, texto, children, rotuloAcessivel, largo }: IconeAjudaProps) {
  const painelRef = useRef<HTMLSpanElement>(null);
  const [alinharDireita, setAlinharDireita] = useState(false);

  // O painel nasce alinhado à esquerda do ícone (mais comum). Ícones perto da borda direita da
  // área visível (2ª coluna de formulário, cards no fim de uma grade) empurravam o painel pra
  // fora (achado real: "informativo saindo cortado" num campo da 2ª coluna do simulador).
  // Recalcula a cada abertura porque a posição do ícone na tela pode mudar (resize, scroll).
  function verificarPosicao() {
    const painel = painelRef.current;
    if (!painel) return;
    const box = painel.getBoundingClientRect();
    setAlinharDireita(box.left < 0 || box.right > limiteDireito(painel) - MARGEM_BORDA_PX);
  }

  return (
    <span className={styles.gatilho} onMouseEnter={verificarPosicao} onFocus={verificarPosicao}>
      <button type="button" className={styles.icone} aria-describedby={id}>
        i<span className="sr-only">, {rotuloAcessivel}</span>
      </button>
      <span
        ref={painelRef}
        id={id}
        role="tooltip"
        className={[styles.painel, largo && styles.painelLargo, alinharDireita && styles.painelDireita]
          .filter(Boolean)
          .join(" ")}
      >
        {children ?? texto}
      </span>
    </span>
  );
}
