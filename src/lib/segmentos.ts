// Segmentos de risco vêm de indicadores-credito-dados (GMM, K=6 desde o ADR 0004/0005 daquele
// repo). Desde o ADR 0007, o índice do cluster é CANÔNICO por taxa de inadimplência real
// ascendente — 0 é sempre o de menor risco, 5 o de maior — reordenado no treino
// (segmentacao/cluster.py:relabel_by_risk), não mais a ordem arbitrária de convergência do GMM.
// Antes do ADR 0007, o índice mudava a cada retreino mesmo sem mudança real de cluster (achado:
// capar idade em 80, ver ADR 0006, trocou 4 dos 6 índices sem mudar a composição dos clusters) —
// quebrou esse mapeamento duas vezes na mesma sessão. Nomes abaixo continuam decididos a partir
// dos centróides reais de cada cluster (idade, renda, utilização, histórico de atraso,
// indicadores de dado sinalizado):
// 0 = renda não informada, ZERO atraso em qualquer faixa, sempre (1,5%, a menor)
// 1 = renda não informada, atraso baixo mas não-zero (2,9%)
// 2 = maioria da base, renda sempre informada, comportamento típico (4,1%, 71% da base)
// 3 = renda informada mas ~R$0 (mediana literal), razão dívida/renda marcada como suspeita (7,6%)
// 4 = dívida várias vezes a renda, maior taxa de indicador de dado de origem sinalizado (18,1%)
// 5 = utilização alta + atraso pesado nas 3 faixas (30-59/60-89/90+) — o de maior risco (35,2%)
// Ordem por histórico de atraso, do maior risco pro menor — com índice canônico isso é só a
// ordem decrescente [5,4,3,2,1,0], mas mantido explícito (não .reverse() de um range) pra não
// depender de K continuar sendo 6 pra sempre.
export const ORDEM_SEGMENTOS = [5, 4, 3, 2, 1, 0] as const;

const NOME_SEGMENTO: Record<number, string> = {
  5: "No vermelho",
  4: "Endividamento crítico",
  3: "Aperto no orçamento",
  2: "Cliente de confiança",
  1: "Pagador tranquilo",
  0: "Pagador exemplar",
};

const DESCRICAO_SEGMENTO: Record<number, string> = {
  5: "Maior exposição a atrasos e uso elevado do crédito.",
  4: "Dívida bem acima da renda, com dado de origem sinalizado.",
  3: "Renda muito baixa e orçamento desproporcional à dívida.",
  2: "Histórico mais estável, com poucos atrasos.",
  1: "Baixa utilização de crédito e poucos atrasos.",
  0: "Nenhum atraso registrado e utilização mínima do crédito.",
};

// Só o nome de negócio, sem o número do cluster junto — o número é detalhe de implementação do
// algoritmo (GMM), não informação que ajuda quem está lendo a tela (achado real: "Cliente de
// confiança (Segmento 1)" foi apontado como confuso/técnico demais).
export function nomeSegmento(segmento: number): string {
  return NOME_SEGMENTO[segmento] ?? `Segmento ${segmento}`;
}

export function descricaoSegmento(segmento: number): string {
  return DESCRICAO_SEGMENTO[segmento] ?? "Perfil identificado a partir de dados financeiros semelhantes.";
}

// Cor por identidade do cluster, não por posição depois de um filtro — segmento 5 é sempre
// vermelho, mesmo se só ele sobrar na tela. Reaproveita a régua --faixa-* (já usada no gráfico
// de score) em vez de uma paleta categórica nova (mesmo padrão de antes, ver ADR 0001 do
// -dados). Só existem 5 tokens --faixa-* pros 6 segmentos — 0 e 1 (os dois únicos de perfil
// "renda não informada", os dois de menor risco: 1,5% e 2,9%) dividem --faixa-excelente; risco
// entre eles fica diferenciado por nome/descrição no card, não por cor exclusiva (ver ADR 0005
// do -dados — decisão de paleta, não inventar tom fora da régua --faixa-*).
const TOKEN_POR_SEGMENTO: Record<number, string> = {
  5: "var(--faixa-ruim)",
  4: "var(--faixa-regular)",
  3: "var(--faixa-bom)",
  2: "var(--faixa-muito-bom)",
  1: "var(--faixa-excelente)",
  0: "var(--faixa-excelente)",
};

export function corDoSegmento(segmento: number): string {
  return TOKEN_POR_SEGMENTO[segmento] ?? "var(--apagado)";
}

export function ordenarPorGravidadeSegmento<T extends { segmento: number }>(itens: T[]): T[] {
  const ordem: readonly number[] = ORDEM_SEGMENTOS;
  return [...itens].sort((a, b) => ordem.indexOf(a.segmento) - ordem.indexOf(b.segmento));
}
