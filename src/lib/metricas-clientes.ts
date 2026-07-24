const ROTULOS_METRICA: Record<string, string> = {
  idade: "Idade",
  rendaMensal: "Renda mensal",
  numeroDependentes: "Número de dependentes",
  utilizacaoCreditoRotativo: "Utilização de crédito rotativo",
  razaoDividaRenda: "Razão dívida/renda",
  linhasCreditoAbertas: "Linhas de crédito abertas",
  emprestimosImobiliarios: "Empréstimos imobiliários",
  atrasos30a59Dias: "Atrasos de 30 a 59 dias",
  atrasos60a89Dias: "Atrasos de 60 a 89 dias",
  atrasos90DiasOuMais: "Atrasos de 90 dias ou mais",
};

const formatoNumero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export function nomeAmigavelMetricaCliente(metrica: string): string {
  return ROTULOS_METRICA[metrica] ?? metrica;
}

export function rotuloFaixaMetricaCliente(min: number, max: number): string {
  if (min === max) return formatoNumero.format(min);
  return `${formatoNumero.format(min)} – ${formatoNumero.format(max)}`;
}
