import { ORDEM_FAIXAS, corDaFaixa } from "@/lib/faixas";
import styles from "./RegraDeScore.module.css";

interface RegraDeScoreProps {
  score: number | null;
  faixa: string | null;
}

const SCORE_MINIMO = 300;
const SCORE_MAXIMO = 850;

// Largura de cada faixa na escala 300-850 (padrão FICO — ver score/scale.py em -dados).
const LARGURA_FAIXA: Record<(typeof ORDEM_FAIXAS)[number], number> = {
  Ruim: 280,
  Regular: 90,
  Bom: 70,
  "Muito Bom": 60,
  Excelente: 50,
};

export function RegraDeScore({ score, faixa }: RegraDeScoreProps) {
  if (score === null || faixa === null) {
    return (
      <div className={styles.regua}>
        <p className={styles.vazio}>Sem score calculado ainda.</p>
      </div>
    );
  }

  const posicao = ((score - SCORE_MINIMO) / (SCORE_MAXIMO - SCORE_MINIMO)) * 100;
  // Clampado só pro rótulo do número (não pro indicador em si) — sem isso, um score bem perto de
  // 300 ou 850 metade do número transbordava pra fora da régua (achado real: número no lugar do
  // marcador, com destaque).
  const posicaoRotulo = Math.min(Math.max(posicao, 6), 94);

  return (
    <div className={styles.regua}>
      <div className={styles.numeroContainer}>
        <span className={styles.faixaRotulo} style={{ left: `${posicaoRotulo}%` }}>
          {faixa}
        </span>
        <span
          key={score}
          className={`${styles.numero} ${styles.numeroAnimado} fonte-dados`}
          data-testid="regua-score-numero"
          style={{ left: `${posicaoRotulo}%`, color: corDaFaixa(faixa) }}
        >
          {score}
        </span>
      </div>
      <div className={styles.trilho}>
        {ORDEM_FAIXAS.map((nomeFaixa) => (
          <span
            key={nomeFaixa}
            className={styles.segmento}
            style={{ flex: LARGURA_FAIXA[nomeFaixa], background: corDaFaixa(nomeFaixa) }}
          />
        ))}
        <span
          className={styles.indicador}
          data-testid="regua-indicador"
          style={{ left: `${posicao}%` }}
        />
      </div>
      <div className={styles.escala}>
        <span className={styles.limite}>{SCORE_MINIMO}</span>
        <span className={styles.limite}>{SCORE_MAXIMO}</span>
      </div>
    </div>
  );
}
