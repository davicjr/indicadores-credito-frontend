import type { ResumoModelo } from "@/lib/modelo-api";
import styles from "./modelo.module.css";

interface FluxoModeloProps {
  resumo: ResumoModelo;
}

const formatoInteiro = new Intl.NumberFormat("pt-BR");

export function FluxoModelo({ resumo }: FluxoModeloProps) {
  return (
    <section className={styles.cartao} aria-labelledby="titulo-fluxo-modelo">
      <div>
        <p className={styles.sobretitulo}>Do dado à decisão</p>
        <h2 id="titulo-fluxo-modelo">Como o resultado é produzido</h2>
      </div>
      <ol className={styles.fluxo}>
        <li>
          <div className={styles.marcadorFluxo} aria-hidden="true">
            <span className={`${styles.numeroEtapa} fonte-dados`}>01</span>
            <span className={styles.grafismoEtapa} />
          </div>
          <div>
            <h3>Dados financeiros</h3>
            <p>
              Renda, uso do crédito, dívida, idade, linhas abertas, imóveis,
              dependentes e histórico de atrasos entram na análise.
            </p>
          </div>
        </li>
        <li>
          <div className={styles.marcadorFluxo} aria-hidden="true">
            <span className={`${styles.numeroEtapa} fonte-dados`}>02</span>
            <span className={styles.grafismoEtapa} />
          </div>
          <div>
            <h3>Tratamento consistente</h3>
            <p>
              Valores ausentes e sinais atípicos seguem as mesmas regras usadas no
              treino antes de chegar ao modelo.
            </p>
          </div>
        </li>
        <li>
          <div className={styles.marcadorFluxo} aria-hidden="true">
            <span className={`${styles.numeroEtapa} fonte-dados`}>03</span>
            <span className={styles.grafismoEtapa} />
          </div>
          <div>
            <h3>Probabilidade vira score</h3>
            <p>
              A estimativa de inadimplência é convertida para 300–850. O ponto de
              referência é {formatoInteiro.format(resumo.escala.scoreBase)} com odds de{" "}
              {formatoInteiro.format(resumo.escala.oddsBase)}:1; a cada{" "}
              {formatoInteiro.format(resumo.escala.pdo)} pontos, as odds de
              adimplência dobram.
            </p>
          </div>
        </li>
        <li>
          <div className={styles.marcadorFluxo} aria-hidden="true">
            <span className={`${styles.numeroEtapa} fonte-dados`}>04</span>
            <span className={styles.grafismoEtapa} />
          </div>
          <div>
            <h3>Faixa e perfil</h3>
            <p>
              O score define uma das cinco faixas. Em paralelo, um modelo GMM
              organiza padrões semelhantes em {resumo.quantidadeSegmentos} perfis
              comportamentais.
            </p>
          </div>
        </li>
      </ol>
    </section>
  );
}
