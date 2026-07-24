import { corDoSegmento, ORDEM_SEGMENTOS } from "./segmentos";

// Cada caso é uma linha REAL do gold (149.390 linhas, retreinado em 2026-07-23 com o cap de
// idade do ADR 0006 e a reordenação canônica de cluster do ADR 0007), escolhida entre os
// membros mais próximos do centróide GMM de cada segmento — não a mediana de cada campo
// calculada independentemente (abordagem anterior, e o motivo de um bug real: pra clusters
// pequenos/difusos, combinar medianas de campo por campo gera um ponto sintético que o próprio
// modelo NÃO classifica de volta no mesmo segmento).
//
// Escolha do candidato dentro de cada segmento: não é só "o mais próximo do centróide" — score
// (regressão logística, pesa muito utilização/atraso) e segmento (GMM, pesa também
// renda/flags de dado) são dois modelos diferentes, então o membro mais "típico" de um cluster
// não necessariamente tem o score mais representativo daquele nível de risco (achado real,
// 2026-07-23: o candidato mais próximo do centróide de "Aperto no orçamento" tinha score 655 —
// MAIOR que "Cliente de confiança", 602 — porque comportamento de pagamento pesa pouco pra
// pertencer àquele cluster específico, é a renda quase-zero + flag de dado que definem o
// cluster). Corrigido: dentro do pool de candidatos que batem round-trip, escolhido o mais
// próximo de um score-alvo que respeita a ordem de risco real entre os 6 segmentos (cada um
// estritamente maior que o do segmento mais arriscado antes dele) — ainda um caso 100% real e
// validado, só não necessariamente o mais próximo do centróide geométrico.
//
// Cada um dos 6 casos abaixo foi validado round-trip: os valores aqui, já arredondados como
// aparecem no formulário, passados pelo MESMO caminho que o simulador usa de verdade (POST
// /simulador em -dados), retornam o próprio segmento que o nome promete E mantêm a ordem de
// score crescente do maior risco pro menor (300 → 460 → 561 → 650 → 690 → 745).
//
// Segmentos 3 e 4 só batem no próprio cluster com `razaoDividaRenda` numa faixa que o -dados
// marca como extrema (>10, ver fonte/clean.py) — não é valor arbitrário: é a característica que
// de fato define esses clusters no treino (dado de origem sinalizado como suspeito), só não
// sobrevive nos campos "normais" de um dado limpo em gold.parquet. Mostrar esse valor extremo
// no card É o ponto pedagógico do caso, não um artefato pra esconder.
//
// `historia` é a mesma leitura dos centróides em tom de narrativa — vai no tooltip do ícone "i"
// do card (ver CasosReaisSimulador.tsx), não sempre visível: card mostra só o nome, compacto.
//
// Os arquétipos são apresentados em ordem de histórico de atraso, do maior risco pro menor
// (mesma ORDEM_SEGMENTOS usada no filtro de clientes, ver segmentos.ts). As cores seguem o
// mesmo risco real (mesma rampa de --faixa-* já usada na régua de score).
// `cor` vem de corDoSegmento (segmentos.ts) — mesma função usada no gráfico de segmento do
// dashboard, pra não duplicar o mapeamento segmento→cor em dois arquivos.
export interface CasoRealSimulador {
  segmento: number;
  nome: string;
  historia: string;
  cor: string;
  valores: {
    idade: string;
    rendaMensal: string;
    numeroDependentes: string;
    utilizacaoCreditoRotativo: string;
    razaoDividaRenda: string;
    linhasCreditoAbertas: string;
    emprestimosImobiliarios: string;
    atrasos30a59Dias: string;
    atrasos60a89Dias: string;
    atrasos90DiasOuMais: string;
  };
}

const CASOS_REAIS: CasoRealSimulador[] = [
  {
    segmento: 5,
    nome: "No vermelho",
    historia:
      "Já compromete a maior parte do limite do cartão e vive atrasado nas três janelas de cobrança — é o perfil de maior risco entre os seis.",
    cor: corDoSegmento(5),
    valores: {
      idade: "43",
      rendaMensal: "4000",
      numeroDependentes: "1",
      utilizacaoCreditoRotativo: "0.79",
      razaoDividaRenda: "0.43",
      linhasCreditoAbertas: "7",
      emprestimosImobiliarios: "1",
      atrasos30a59Dias: "1",
      atrasos60a89Dias: "1",
      atrasos90DiasOuMais: "1",
    },
  },
  {
    segmento: 4,
    nome: "Endividamento crítico",
    historia:
      "Renda baixa e uma dívida quase 6 vezes maior do que ela — dado de origem sinalizado como suspeito, com só um atraso leve no histórico.",
    cor: corDoSegmento(4),
    valores: {
      idade: "37",
      rendaMensal: "500",
      numeroDependentes: "3",
      utilizacaoCreditoRotativo: "0.00",
      razaoDividaRenda: "5.84",
      linhasCreditoAbertas: "6",
      emprestimosImobiliarios: "1",
      atrasos30a59Dias: "1",
      atrasos60a89Dias: "0",
      atrasos90DiasOuMais: "0",
    },
  },
  {
    segmento: 3,
    nome: "Aperto no orçamento",
    historia:
      "Renda declarada praticamente zero e uma razão dívida/renda tão extrema que o próprio dado é sinalizado como suspeito — mesmo assim, sem atraso no histórico recente.",
    cor: corDoSegmento(3),
    valores: {
      idade: "39",
      rendaMensal: "1",
      numeroDependentes: "2",
      utilizacaoCreditoRotativo: "0.57",
      razaoDividaRenda: "11.00",
      linhasCreditoAbertas: "6",
      emprestimosImobiliarios: "2",
      atrasos30a59Dias: "0",
      atrasos60a89Dias: "0",
      atrasos90DiasOuMais: "0",
    },
  },
  {
    segmento: 2,
    nome: "Cliente de confiança",
    historia:
      "O perfil mais comum entre os seis. Usa uma fatia pequena do limite disponível e não tem atraso recente.",
    cor: corDoSegmento(2),
    valores: {
      idade: "55",
      rendaMensal: "6500",
      numeroDependentes: "1",
      utilizacaoCreditoRotativo: "0.14",
      razaoDividaRenda: "0.32",
      linhasCreditoAbertas: "7",
      emprestimosImobiliarios: "1",
      atrasos30a59Dias: "0",
      atrasos60a89Dias: "0",
      atrasos90DiasOuMais: "0",
    },
  },
  {
    segmento: 1,
    nome: "Pagador tranquilo",
    historia: "Não informa renda, mas usa muito pouco do crédito disponível e não tem atraso recente.",
    cor: corDoSegmento(1),
    valores: {
      idade: "59",
      rendaMensal: "",
      numeroDependentes: "0",
      utilizacaoCreditoRotativo: "0.04",
      razaoDividaRenda: "0.29",
      linhasCreditoAbertas: "7",
      emprestimosImobiliarios: "1",
      atrasos30a59Dias: "0",
      atrasos60a89Dias: "0",
      atrasos90DiasOuMais: "0",
    },
  },
  {
    segmento: 0,
    nome: "Pagador exemplar",
    historia:
      "Não informa renda nem dependentes, não usa nada do crédito disponível e nunca atrasou — o perfil de menor risco entre os seis.",
    cor: corDoSegmento(0),
    valores: {
      idade: "70",
      rendaMensal: "",
      numeroDependentes: "",
      utilizacaoCreditoRotativo: "0.00",
      razaoDividaRenda: "0.29",
      linhasCreditoAbertas: "5",
      emprestimosImobiliarios: "0",
      atrasos30a59Dias: "0",
      atrasos60a89Dias: "0",
      atrasos90DiasOuMais: "0",
    },
  },
];

export const CASOS_REAIS_SIMULADOR = ORDEM_SEGMENTOS.map(
  (segmento) => CASOS_REAIS.find((caso) => caso.segmento === segmento)!
);
