import type { ResumoModelo as ResumoModeloApi } from "@/lib/modelo-api";
import { nomeModelo } from "@/lib/modelos";
import styles from "./modelo.module.css";

interface ResumoModeloProps {
  resumo: ResumoModeloApi;
}

const formatoInteiro = new Intl.NumberFormat("pt-BR");
const formatoPercentual = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function ResumoModelo({ resumo }: ResumoModeloProps) {
  const metricasAtivas = resumo.metricas.find(
    (item) => item.modelo === resumo.modeloAtivo
  );
  const tamanhoTeste = Math.round(resumo.totalRegistros * resumo.fracaoTeste);

  return (
    <section className={styles.resumoModelo} aria-label="Resumo do modelo">
      <article className={`${styles.indicador} ${styles.indicadorDestaque}`}>
        <div className={styles.indicadorCabecalho}>
          <span className={styles.rotulo}>Modelo em uso</span>
          <span className={`${styles.indiceIndicador} fonte-dados`}>ATIVO</span>
        </div>
        <div className={styles.modeloAtivo}>
          <span className={styles.marcaModelo} aria-hidden="true" />
          <strong className={styles.nomeModelo}>
            {nomeModelo(resumo.modeloAtivo)}
          </strong>
        </div>
        <p className={styles.legenda}>
          {resumo.modeloAtivo === "logistic"
            ? "Scorecard linear escolhido para manter cada decisão explicável."
            : "Configuração selecionada para produzir os scores da operação."}
        </p>
      </article>

      <article className={`${styles.indicador} ${styles.indicadorAuc}`}>
        <div className={styles.indicadorCabecalho}>
          <span className={styles.rotulo}>AUC no teste</span>
          <span className={`${styles.indiceIndicador} fonte-dados`}>01</span>
        </div>
        <strong className={`${styles.valor} fonte-dados`}>
          {metricasAtivas ? formatoPercentual.format(metricasAtivas.auc) : "—"}
        </strong>
        <span className={styles.legenda}>
          Capacidade de ordenar clientes por risco.
        </span>
      </article>

      <article className={`${styles.indicador} ${styles.indicadorKs}`}>
        <div className={styles.indicadorCabecalho}>
          <span className={styles.rotulo}>KS no teste</span>
          <span className={`${styles.indiceIndicador} fonte-dados`}>02</span>
        </div>
        <strong className={`${styles.valor} fonte-dados`}>
          {metricasAtivas
            ? `${formatoPercentual.format(metricasAtivas.ks)}`
            : "—"}
        </strong>
        <span className={styles.legenda}>
          Separação entre adimplentes e inadimplentes.
        </span>
      </article>

      <article className={`${styles.indicador} ${styles.indicadorBase}`}>
        <div className={styles.indicadorCabecalho}>
          <span className={styles.rotulo}>Base de teste</span>
          <span className={`${styles.indiceIndicador} fonte-dados`}>03</span>
        </div>
        <strong className={`${styles.valor} fonte-dados`}>
          {formatoInteiro.format(tamanhoTeste)}
        </strong>
        <span className={styles.legenda}>
          {formatoPercentual.format(resumo.fracaoTeste)} dos{" "}
          {formatoInteiro.format(resumo.totalRegistros)} registros históricos.
        </span>
      </article>
    </section>
  );
}
