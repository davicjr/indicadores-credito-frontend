"use client";

import type { ReactNode } from "react";
import { IconeAjuda } from "./IconeAjuda";
import styles from "./Campo.module.css";

interface CampoProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  min?: number;
  step?: string;
  erro?: string;
  // Conteúdo do tooltip (ícone "i" ao lado do label) — faixa real de valor e/ou por que o campo
  // pesa no modelo. Texto sempre visível embaixo do campo, testado antes, foi apontado como
  // "estranho" (denso demais pra aparecer inteiro em repouso) — vira hover/foco.
  ajuda?: string;
  // Selo curto sempre visível ao lado do label (ex.: "#1") — diferente de `ajuda`, não precisa
  // de hover pra dar o sinal rápido de "isso aqui importa".
  badge?: ReactNode;
}

export function Campo({
  label,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  required = false,
  min,
  step,
  erro,
  ajuda,
  badge,
}: CampoProps) {
  const idAjuda = ajuda ? `${name}-ajuda` : undefined;

  return (
    <div className={styles.campo}>
      <div className={styles.rotuloLinha}>
        <label className={styles.rotulo} htmlFor={name}>
          {label}
        </label>
        {badge}
        {ajuda && idAjuda && <IconeAjuda id={idAjuda} texto={ajuda} rotuloAcessivel={`ajuda sobre ${label}`} />}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        step={step}
        className={styles.input}
        aria-invalid={Boolean(erro)}
        aria-describedby={idAjuda}
      />
      {erro && (
        <span className={styles.erro} role="alert">
          {erro}
        </span>
      )}
    </div>
  );
}
