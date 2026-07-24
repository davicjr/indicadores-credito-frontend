"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import styles from "./Abas.module.css";

export interface AbaDef {
  id: string;
  rotulo: string;
  cor?: string;
}

interface AbasProps {
  abas: AbaDef[];
  abaAtiva: string;
  onMudarAba: (id: string) => void;
  rotuloGrupo: string;
  children: ReactNode;
}

// Extraído depois de repetir no formulário do simulador e no de cliente (2 usos reais) — mesmo
// padrão tablist/tabpanel com [hidden], só a lista de abas e as cores mudam por consumidor.
export function Abas({ abas, abaAtiva, onMudarAba, rotuloGrupo, children }: AbasProps) {
  const botoes = useRef<Array<HTMLButtonElement | null>>([]);

  function navegarPeloTeclado(evento: KeyboardEvent<HTMLButtonElement>, indiceAtual: number) {
    let proximoIndice: number | null = null;
    if (evento.key === "ArrowRight") proximoIndice = (indiceAtual + 1) % abas.length;
    if (evento.key === "ArrowLeft") proximoIndice = (indiceAtual - 1 + abas.length) % abas.length;
    if (evento.key === "Home") proximoIndice = 0;
    if (evento.key === "End") proximoIndice = abas.length - 1;
    if (proximoIndice === null) return;

    evento.preventDefault();
    onMudarAba(abas[proximoIndice].id);
    botoes.current[proximoIndice]?.focus();
  }

  return (
    <div className={styles.abasContainer}>
      <div className={styles.abasLista} role="tablist" aria-label={rotuloGrupo}>
        {abas.map((aba, indice) => {
          const ativa = aba.id === abaAtiva;
          return (
            <button
              key={aba.id}
              type="button"
              role="tab"
              id={`aba-${aba.id}`}
              aria-selected={ativa}
              aria-controls={`painel-${aba.id}`}
              tabIndex={ativa ? 0 : -1}
              className={ativa ? styles.abaAtiva : styles.aba}
              style={ativa && aba.cor ? { borderColor: aba.cor, color: aba.cor } : undefined}
              onClick={() => onMudarAba(aba.id)}
              onKeyDown={(evento) => navegarPeloTeclado(evento, indice)}
              ref={(elemento) => {
                botoes.current[indice] = elemento;
              }}
            >
              {aba.rotulo}
            </button>
          );
        })}
      </div>
      {children}
    </div>
  );
}

interface AbaPainelProps {
  id: string;
  abaAtiva: string;
  children: ReactNode;
}

export function AbaPainel({ id, abaAtiva, children }: AbaPainelProps) {
  return (
    <div role="tabpanel" id={`painel-${id}`} aria-labelledby={`aba-${id}`} hidden={id !== abaAtiva} className={styles.abaPainel}>
      {children}
    </div>
  );
}
