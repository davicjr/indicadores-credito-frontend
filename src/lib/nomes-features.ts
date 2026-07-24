// Nomes técnicos vêm de -dados (colunas do gold/features do modelo, snake_case em inglês) —
// tradução pro rótulo em português usado em toda tela que mostra explicabilidade
// (simulador e detalhe de cliente).
const NOMES_AMIGAVEIS: Record<string, string> = {
  revolving_utilization: "Utilização de crédito rotativo",
  age: "Idade",
  times_30_59_days_late: "Atrasos de 30 a 59 dias",
  debt_ratio: "Razão dívida/renda",
  monthly_income: "Renda mensal",
  open_credit_lines: "Linhas de crédito abertas",
  times_90_days_late: "Atrasos de 90 dias ou mais",
  real_estate_loans: "Empréstimos imobiliários",
  times_60_89_days_late: "Atrasos de 60 a 89 dias",
  // Métrica exibida em /métricas e no dashboard — soma das 3 janelas acima, calculada em
  // -dados (gold.build). As 3 continuam existindo separadas pra explicabilidade e formulário;
  // essa é só a versão consolidada que a tela de exploração de métricas usa.
  atrasos_totais: "Atrasos",
  dependents: "Número de dependentes",
  delinquency_data_flagged: "Indicador de dado de atraso suspeito",
  utilization_flagged: "Indicador de utilização atípica",
  debt_ratio_flagged: "Indicador de razão dívida/renda atípica",
  monthly_income_missing: "Renda não informada",
  dependents_missing: "Dependentes não informado",
};

export function nomeAmigavelFeature(feature: string): string {
  return NOMES_AMIGAVEIS[feature] ?? feature;
}
