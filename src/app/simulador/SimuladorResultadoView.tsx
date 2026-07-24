import type { CSSProperties } from "react";
import { ExplicabilidadeScore } from "@/components/ExplicabilidadeScore";
import { RegraDeScore } from "@/components/RegraDeScore";
import type { SimuladorEntrada, SimuladorResultado } from "@/lib/simulador-api";
import { corDoSegmento, descricaoSegmento, nomeSegmento } from "@/lib/segmentos";
import { valoresPorFeature } from "@/lib/valores-features";
import styles from "./simulador.module.css";

export interface CenarioSimulado extends SimuladorResultado {
  entrada: SimuladorEntrada;
}

interface SimuladorResultadoViewProps {
  historico: CenarioSimulado[];
  onSimularOutro: () => void;
  onCadastrar: () => void;
}

export function SimuladorResultadoView({ historico, onSimularOutro, onCadastrar }: SimuladorResultadoViewProps) {
  const comparando = historico.length > 1;

  return (
    <div className={styles.resultado}>
      <header className={styles.cabecalhoResultado}>
        <div>
          <span className={styles.indiceSimulador}>Leitura gerada</span>
          <h2>{comparando ? "Compare os cenários" : "Resultado da simulação"}</h2>
        </div>
        <p>
          {comparando
            ? "O cenário mais recente aparece primeiro para facilitar a comparação."
            : "Veja a posição na régua e os fatores que mais influenciaram o score."}
        </p>
      </header>
      <div className={styles.comparacao}>
        {historico.map((resultado, indice) => (
          <div className={styles.cenario} key={`${resultado.score}-${indice}`}>
            <div className={styles.cenarioTopo}>
              <h3>{comparando ? (indice === 0 ? "Cenário atual" : "Cenário anterior") : "Cenário simulado"}</h3>
              <span>Score calculado</span>
            </div>
            <RegraDeScore score={resultado.score} faixa={resultado.faixa} />
            <div
              className={styles.perfilRisco}
              style={
                {
                  "--cor-perfil": corDoSegmento(resultado.segmento),
                } as CSSProperties
              }
            >
              <span className={styles.perfilRiscoRotulo}>Perfil de risco identificado</span>
              <strong className={styles.perfilRiscoNome}>
                {nomeSegmento(resultado.segmento)}
              </strong>
              <span className={styles.perfilRiscoDescricao}>
                {descricaoSegmento(resultado.segmento)}
              </span>
            </div>
            <section className={styles.explicacaoResultado} aria-label="Explicação do score">
              <h4>Por que este score?</h4>
              <ExplicabilidadeScore
                contribuicoes={resultado.contribuicoes}
                valores={valoresPorFeature(resultado.entrada)}
              />
            </section>
          </div>
        ))}
      </div>
      <div className={styles.acoes}>
        <button type="button" className={styles.acaoSecundaria} onClick={onSimularOutro}>
          Simular outro cenário
        </button>
        <button type="button" className={styles.botao} onClick={onCadastrar}>
          <span>Cadastrar este cliente</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
