import type { SimuladorEntrada } from "@/lib/simulador-api";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percentual = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });
const inteiro = new Intl.NumberFormat("pt-BR");

// A explicação do modelo chega com nomes técnicos de features. Este mapa acrescenta o valor
// concreto usado no cálculo, para a pessoa entender o que, naquele cenário, gerou o impacto.
export function valoresPorFeature(entrada: SimuladorEntrada): Record<string, string> {
  return {
    revolving_utilization: percentual.format(entrada.utilizacaoCreditoRotativo),
    age: `${inteiro.format(entrada.idade)} anos`,
    times_30_59_days_late: inteiro.format(entrada.atrasos30a59Dias),
    debt_ratio: percentual.format(entrada.razaoDividaRenda),
    monthly_income:
      entrada.rendaMensal === null ? "Não informada" : moeda.format(entrada.rendaMensal),
    open_credit_lines: inteiro.format(entrada.linhasCreditoAbertas),
    times_90_days_late: inteiro.format(entrada.atrasos90DiasOuMais),
    real_estate_loans: inteiro.format(entrada.emprestimosImobiliarios),
    times_60_89_days_late: inteiro.format(entrada.atrasos60a89Dias),
    dependents:
      entrada.numeroDependentes === null
        ? "Não informado"
        : inteiro.format(entrada.numeroDependentes),
    monthly_income_missing: entrada.rendaMensal === null ? "Não informada" : "Informada",
    dependents_missing:
      entrada.numeroDependentes === null ? "Não informado" : "Informado",
  };
}
