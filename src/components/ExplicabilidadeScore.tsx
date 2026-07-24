import type { ContribuicaoFeature } from "@/lib/simulador-api";
import { nomeAmigavelFeature } from "@/lib/nomes-features";
import styles from "./ExplicabilidadeScore.module.css";

interface ExplicabilidadeScoreProps {
  contribuicoes: ContribuicaoFeature[];
  valores?: Record<string, string>;
  contexto?: "cliente" | "cenario";
}

function intensidadeDaInfluencia(proporcao: number): string {
  if (proporcao >= 0.75) return "Influência alta";
  if (proporcao >= 0.4) return "Influência média";
  return "Influência baixa";
}

export function ExplicabilidadeScore({
  contribuicoes,
  valores = {},
  contexto = "cenario",
}: ExplicabilidadeScoreProps) {
  if (contribuicoes.length === 0) {
    return <p className={styles.vazio}>Sem explicação disponível pra este resultado.</p>;
  }

  // Ordem por contribuição com sinal (não por |magnitude|): do que mais aumenta o risco (mais
  // vermelho) até o que mais reduz (mais verde) — lê como gradiente, em vez de intercalar
  // vermelho/verde por força bruta do impacto.
  const principais = [...contribuicoes].sort((a, b) => b.contribuicao - a.contribuicao);
  // Barra é relativa ao maior |contribuicao| DESSA lista — não tem unidade absoluta útil pra
  // mostrar (é log-odds padronizado), mas a proporção entre os fatores é real e comparável
  // (mesma escala, ver score/explain.py em -dados).
  const maiorMagnitude = Math.max(...principais.map((item) => Math.abs(item.contribuicao)));

  return (
    <div className={styles.explicacao}>
      <p className={styles.descricao}>
        {contexto === "cliente"
          ? "Esta leitura explica o resultado deste cliente."
          : "Esta leitura explica somente este cenário simulado."}{" "}
        Vermelho indica aumento do risco estimado; verde indica redução.
      </p>
      <ul className={styles.lista}>
        {principais.map((item) => {
          // contribuição positiva = pesa a favor do risco de inadimplência = reduz o score;
          // negativa = pesa contra o risco = aumenta o score (ver score/explain.py em -dados).
          const aumentaRisco = item.contribuicao > 0;
          const reduzRisco = item.contribuicao < 0;
          const proporcao =
            maiorMagnitude > 0 ? Math.abs(item.contribuicao) / maiorMagnitude : 0;
          const largura = proporcao * 100;
          const efeito = aumentaRisco
            ? "Aumentou o risco estimado"
            : reduzRisco
              ? "Reduziu o risco estimado"
              : "Sem impacto relevante";
          const classeItem = aumentaRisco
            ? styles.itemDesfavoravel
            : reduzRisco
              ? styles.itemFavoravel
              : styles.itemNeutro;
          const classeEfeito = aumentaRisco
            ? styles.desfavoravel
            : reduzRisco
              ? styles.favoravel
              : styles.neutro;
          const classeBarra = aumentaRisco
            ? styles.barraDesfavoravel
            : reduzRisco
              ? styles.barraFavoravel
              : styles.barraNeutra;

          return (
            <li
              className={`${styles.item} ${classeItem}`}
              key={item.feature}
            >
              <div className={styles.linha}>
                <span className={styles.nome}>{nomeAmigavelFeature(item.feature)}</span>
                {valores[item.feature] && (
                  <span className={styles.valorInformado}>{valores[item.feature]}</span>
                )}
              </div>
              <div className={styles.efeitoLinha}>
                <span className={classeEfeito}>{efeito}</span>
                <span className={styles.intensidade}>{intensidadeDaInfluencia(proporcao)}</span>
              </div>
              <div className={styles.trilho} aria-label={intensidadeDaInfluencia(proporcao)}>
                <div
                  className={classeBarra}
                  style={{ width: `${largura}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className={styles.nota}>
        As barras comparam a influência dos fatores entre si; elas não representam pontos
        retirados ou adicionados ao score.
      </p>
    </div>
  );
}
