"use client";

import { rotuloFiltro, type FiltroCarteira } from "@/lib/filtro-carteira";
import styles from "./dashboard.module.css";

interface FiltroCarteiraChipProps {
  filtro: FiltroCarteira;
  onLimpar: () => void;
}

export function FiltroCarteiraChip({ filtro, onLimpar }: FiltroCarteiraChipProps) {
  return (
    <div className={styles.chipFiltro} role="status">
      <span>Filtrando por: {rotuloFiltro(filtro)}</span>
      <button type="button" onClick={onLimpar} aria-label="Limpar filtro">
        ×
      </button>
    </div>
  );
}
