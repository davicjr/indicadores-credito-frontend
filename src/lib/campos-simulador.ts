import type { PesoFeature } from "@/lib/dados-api";

export interface MetaCampoSimulador {
  // Nome da feature em -dados — casa com getImportanciaFeatures() pra ranquear por peso real.
  featureBackend: string;
  // Faixa real (p10-p90) tirada direto do dataset de produção (149.390 linhas), não estimada.
  faixaReal: string;
  porQueImporta: string;
}

// Faixas e pesos verificados contra o gold real em 2026-07-22 — ver histórico de conversa.
// Se o modelo for retreinado, os números de faixaReal podem ficar desatualizados (não há
// endpoint de percentil ao vivo pro simulador ainda); o ranking de peso (rotuloImportancia)
// sempre busca o valor atual via /modelo/importancia-features, esse nunca fica velho.
export const METADADOS_CAMPOS_SIMULADOR: Record<string, MetaCampoSimulador> = {
  idade: {
    featureBackend: "age",
    faixaReal: "Carteira real: 21 a 109 anos — metade dos clientes fica entre 33 e 72.",
    porQueImporta: "Quanto mais velho o cliente, menor o risco.",
  },
  rendaMensal: {
    featureBackend: "monthly_income",
    faixaReal:
      "Carteira real: R$ 2.029 a R$ 11.666 (metade). Pode ficar em branco — cerca de 1 em cada 8 clientes reais não tem renda informada.",
    porQueImporta: "Quanto maior a renda, menor o risco — mas pesa menos do que se imagina.",
  },
  numeroDependentes: {
    featureBackend: "dependents",
    faixaReal: "Carteira real: metade dos clientes tem 0, até 2 no limite superior comum.",
    porQueImporta: "Quase não move o ponteiro — é um dos fatores que menos pesam.",
  },
  utilizacaoCreditoRotativo: {
    featureBackend: "revolving_utilization",
    faixaReal: "Fração do limite disponível já usada (0 a 1). Carteira real: metade fica entre 0 e 0,97.",
    porQueImporta: "O fator de maior peso, disparado — mais que o dobro do 2º colocado.",
  },
  razaoDividaRenda: {
    featureBackend: "debt_ratio",
    faixaReal: "Carteira real: 0,02 a 0,71 (metade dos clientes).",
    porQueImporta:
      "Curiosidade: apesar de soar como o indicador clássico, é um dos que menos pesam — bem atrás dos atrasos de pagamento.",
  },
  linhasCreditoAbertas: {
    featureBackend: "open_credit_lines",
    faixaReal: "Carteira real: 3 a 15 linhas (metade dos clientes).",
    porQueImporta: "Ter mais linhas de crédito abertas pesa um pouco contra o score — contraintuitivo, mas é o que os dados mostram.",
  },
  emprestimosImobiliarios: {
    featureBackend: "real_estate_loans",
    faixaReal: "Carteira real: 0 a 2 (metade dos clientes).",
    porQueImporta: "Peso pequeno, mas presente — mais empréstimos imobiliários pesa levemente contra o score.",
  },
  atrasos30a59Dias: {
    featureBackend: "times_30_59_days_late",
    faixaReal: "9 em cada 10 clientes reais têm 0 nessa janela.",
    porQueImporta: "Um dos fatores de maior peso — qualquer atraso aqui pesa bastante contra o score.",
  },
  atrasos60a89Dias: {
    featureBackend: "times_60_89_days_late",
    faixaReal: "9 em cada 10 clientes reais têm 0 nessa janela.",
    porQueImporta: "Pesa contra o score, mas menos que os atrasos de 30-59 e 90+ dias.",
  },
  atrasos90DiasOuMais: {
    featureBackend: "times_90_days_late",
    faixaReal: "9 em cada 10 clientes reais têm 0 nessa janela.",
    porQueImporta: "O 2º fator de maior peso — atraso grave é o sinal de risco mais forte depois da utilização de crédito.",
  },
};

export type IdAba = "perfil" | "financeiro" | "atraso";

export interface AbaSimulador {
  id: IdAba;
  rotulo: string;
  cor: string;
  campos: string[];
}

// Mesmo agrupamento por sentido de domínio já usado no dashboard (as 3 janelas de atraso viram
// "Atrasos" como métrica só, separada dos outros dados financeiros — ver -dados/gold/build.py).
// Cor por aba é sinal de severidade, não decoração: perfil é dado de identidade (neutro/acento),
// situação financeira é "acompanhar" (aviso), histórico de atraso é o sinal de risco mais forte
// (crítico) — mesma leitura de --critico usada em toda a régua de score.
export const ABAS_SIMULADOR: AbaSimulador[] = [
  {
    id: "perfil",
    rotulo: "Perfil",
    cor: "var(--acento)",
    campos: ["idade", "numeroDependentes"],
  },
  {
    id: "financeiro",
    rotulo: "Situação financeira",
    cor: "var(--aviso)",
    campos: [
      "rendaMensal",
      "utilizacaoCreditoRotativo",
      "razaoDividaRenda",
      "linhasCreditoAbertas",
      "emprestimosImobiliarios",
    ],
  },
  {
    id: "atraso",
    rotulo: "Histórico de atraso",
    cor: "var(--critico)",
    campos: ["atrasos30a59Dias", "atrasos60a89Dias", "atrasos90DiasOuMais"],
  },
];

function pesosRelevantesOrdenados(pesos: PesoFeature[]): PesoFeature[] {
  const nomesDoUsuario = new Set(Object.values(METADADOS_CAMPOS_SIMULADOR).map((m) => m.featureBackend));
  return pesos.filter((p) => nomesDoUsuario.has(p.feature)).sort((a, b) => Math.abs(b.peso) - Math.abs(a.peso));
}

// Posição (1-indexed) do campo no ranking de peso real do modelo, entre os 10 campos que o
// usuário controla. null se não houver dado de peso (ex.: -dados fora do ar).
export function posicaoImportancia(campo: string, pesos: PesoFeature[]): number | null {
  const meta = METADADOS_CAMPOS_SIMULADOR[campo];
  if (!meta || pesos.length === 0) return null;

  const relevantes = pesosRelevantesOrdenados(pesos);
  const posicao = relevantes.findIndex((p) => p.feature === meta.featureBackend);
  return posicao === -1 ? null : posicao + 1;
}

export function rotuloImportancia(campo: string, pesos: PesoFeature[]): string | null {
  const posicao = posicaoImportancia(campo, pesos);
  if (posicao === null) return null;
  const total = pesosRelevantesOrdenados(pesos).length;
  return `peso #${posicao} de ${total}`;
}
