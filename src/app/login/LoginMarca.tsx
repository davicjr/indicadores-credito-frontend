"use client";

import { useState } from "react";
import { Logomark } from "@/components/Logomark";
import styles from "./login.module.css";

// Composição da marca no login: Logomark (com o roteiro completo de motion) + wordmark + régua.
// O brilho na régua é CSS puro (não anime.js) disparado pelo callback aoPousar — mesma divisão
// combinada: JS orquestra só a logo, o resto da plataforma anima com CSS/tokens.
export function LoginMarca() {
  const [brilhando, setBrilhando] = useState(false);

  return (
    <div className={styles.marca}>
      <div className={styles.marcaLinha}>
        <Logomark tamanho="grande" aoPousar={() => setBrilhando(true)} />
        <span className={styles.marcaTitulo}>
          <span>ÍNDICE</span>
          <span className={styles.marcaReal}>REAL</span>
        </span>
      </div>
      <span className={styles.marcaSubtitulo}>Um número. De verdade.</span>
      <div className={styles.reguaTrilho}>
        <div className={styles.regua} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div
          aria-hidden="true"
          className={brilhando ? `${styles.brilho} ${styles.brilhoAtivo}` : styles.brilho}
          onAnimationEnd={() => setBrilhando(false)}
        />
      </div>
    </div>
  );
}
