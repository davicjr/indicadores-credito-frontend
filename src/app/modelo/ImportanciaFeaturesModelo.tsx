import type { CSSProperties } from "react";
import type { PesoFeature } from "@/lib/dados-api";
import { nomeAmigavelFeature } from "@/lib/nomes-features";
import styles from "./modelo.module.css";

interface ImportanciaFeaturesModeloProps {
  pesos: PesoFeature[];
}

const QUANTIDADE_VISIVEL = 8;
const formatoPeso = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "always",
});

export function ImportanciaFeaturesModelo({
  pesos,
}: ImportanciaFeaturesModeloProps) {
  const visiveis = [...pesos]
    .sort((a, b) => Math.abs(b.peso) - Math.abs(a.peso))
    .slice(0, QUANTIDADE_VISIVEL);
  const maiorMagnitude = Math.max(
    ...visiveis.map((item) => Math.abs(item.peso)),
    1
  );

  return (
    <section className={styles.cartao} aria-labelledby="titulo-fatores-modelo">
      <header className={styles.cabecalhoCartao}>
        <div>
          <p className={styles.sobretitulo}>Coeficientes padronizados</p>
          <h2 id="titulo-fatores-modelo">
            Fatores da regressão logística
          </h2>
        </div>

      </header>

      {visiveis.length === 0 ? (
        <p className={styles.textoApoio}>Pesos ainda não disponíveis.</p>
      ) : (
        <>
          <div className={styles.legendaPesos} aria-hidden="true">
            <span>Fator</span>
            <span>
              <span>← Proteção</span>
              <span>Neutro</span>
              <span>Risco →</span>
            </span>
            <span>Efeito</span>
          </div>
          <ol className={styles.listaPesos}>
            {visiveis.map((item, indice) => {
              const aumentaRisco = item.peso >= 0;
              return (
                <li key={item.feature} className={styles.pesoItem}>
                  <div className={styles.pesoIdentidade}>
                    <span className={`${styles.indicePeso} fonte-dados`}>
                      {String(indice + 1).padStart(2, "0")}
                    </span>
                    <strong>{nomeAmigavelFeature(item.feature)}</strong>
                  </div>
                  <span className={styles.trilhoPeso} aria-hidden="true">
                    <span className={styles.eixoPeso} />
                    <span
                      className={
                        aumentaRisco ? styles.barraRisco : styles.barraProtecao
                      }
                      style={
                        {
                          "--magnitude-peso": `${(Math.abs(item.peso) / maiorMagnitude) * 50}%`,
                        } as CSSProperties
                      }
                    />
                  </span>
                  <span
                    className={`${styles.direcao} ${
                      aumentaRisco ? styles.direcaoRisco : styles.direcaoProtecao
                    }`}
                  >
                    <span aria-hidden="true" />
                    <span>{aumentaRisco ? "Aumenta o risco" : "Reduz o risco"}</span>
                    <strong className="fonte-dados">{formatoPeso.format(item.peso)}</strong>
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      )}

      <p className={styles.nota}>
        Exibindo os {Math.min(QUANTIDADE_VISIVEL, pesos.length)} maiores pesos de{" "}
        {pesos.length}. No simulador, a explicação é recalculada para cada caso.
      </p>
    </section>
  );
}
