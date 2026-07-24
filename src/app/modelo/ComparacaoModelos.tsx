import type { CSSProperties } from "react";
import type { ResumoModelo } from "@/lib/modelo-api";
import { nomeModelo } from "@/lib/modelos";
import { ordenarAlfabeticamente } from "@/lib/ordenacao";
import styles from "./modelo.module.css";

interface ComparacaoModelosProps {
  resumo: ResumoModelo;
}

const formatoPercentual = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function ComparacaoModelos({ resumo }: ComparacaoModelosProps) {
  const metricasOrdenadas = ordenarAlfabeticamente(
    resumo.metricas,
    (item) => nomeModelo(item.modelo)
  );

  return (
    <section className={styles.cartao} aria-labelledby="titulo-comparacao-modelos">
      <header className={styles.cabecalhoCartao}>
        <div>
          <p className={styles.sobretitulo}>Validação fora do treino</p>
          <h2 id="titulo-comparacao-modelos">Comparação dos modelos</h2>
        </div>

      </header>
      <table className="sr-only">
        <caption>Comparação de AUC e KS dos modelos avaliados</caption>
        <thead>
          <tr>
            <th scope="col">Modelo</th>
            <th scope="col">AUC</th>
            <th scope="col">KS</th>
            <th scope="col">Situação</th>
          </tr>
        </thead>
        <tbody>
          {metricasOrdenadas.map((item) => (
            <tr key={item.modelo}>
              <th scope="row">{nomeModelo(item.modelo)}</th>
              <td>{formatoPercentual.format(item.auc)}</td>
              <td>{formatoPercentual.format(item.ks)}</td>
              <td>{item.modelo === resumo.modeloAtivo ? "Em uso" : "Comparação"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.comparacaoVisual} aria-hidden="true">
        <div className={styles.escalaComparacao}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <ol className={styles.listaComparacao}>
          {metricasOrdenadas.map((item, indice) => {
            const ativo = item.modelo === resumo.modeloAtivo;
            return (
              <li key={item.modelo} className={ativo ? styles.modeloComparacaoAtivo : undefined}>
                <header>
                  <span className={`${styles.indiceComparacao} fonte-dados`}>
                    {String(indice + 1).padStart(2, "0")}
                  </span>
                  <strong>{nomeModelo(item.modelo)}</strong>
                  <span className={ativo ? styles.seloAtivo : styles.seloComparacao}>
                    {ativo ? "Em uso" : "Referência"}
                  </span>
                </header>
                <div className={styles.linhaComparacao}>
                  <span>AUC</span>
                  <span className={styles.trilhoComparacao}>
                    <span
                      className={styles.barraAuc}
                      style={{ "--valor-comparacao": `${item.auc * 100}%` } as CSSProperties}
                    />
                  </span>
                  <strong className="fonte-dados">{formatoPercentual.format(item.auc)}</strong>
                </div>
                <div className={styles.linhaComparacao}>
                  <span>KS</span>
                  <span className={styles.trilhoComparacao}>
                    <span
                      className={styles.barraKs}
                      style={{ "--valor-comparacao": `${item.ks * 100}%` } as CSSProperties}
                    />
                  </span>
                  <strong className="fonte-dados">{formatoPercentual.format(item.ks)}</strong>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={styles.guiaComparacao}>
        <p>
          <strong>AUC</strong>
          <span>50% equivale ao acaso; quanto maior, melhor a ordenação do risco.</span>
        </p>
        <p>
          <strong>KS</strong>
          <span>Quanto maior, maior a separação observada entre os dois grupos.</span>
        </p>
      </div>
      <p className={styles.nota}>
        {resumo.modeloAtivo === "logistic"
          ? "O Gradient Boosting tem ganho preditivo pequeno, mas a regressão logística permanece ativa porque expõe a direção e o peso de cada fator."
          : `${nomeModelo(resumo.modeloAtivo)} está ativo; os demais modelos permanecem como referência de comparação.`}
      </p>
    </section>
  );
}
