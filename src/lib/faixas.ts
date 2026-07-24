import { ordenarAlfabeticamente } from "./ordenacao";

// Ordem da régua de score, mantida para cálculos e para a representação contínua de pior a
// melhor. Filtros usam ordenarPorFaixa (A–Z, pra busca rápida no dropdown); gráficos usam
// ordenarPorGravidadeFaixa (pior pra melhor, pra leitura de risco na barra).
export const ORDEM_FAIXAS = ["Ruim", "Regular", "Bom", "Muito Bom", "Excelente"] as const;

type Faixa = (typeof ORDEM_FAIXAS)[number];

const TOKEN_POR_FAIXA: Record<Faixa, string> = {
  Ruim: "var(--faixa-ruim)",
  Regular: "var(--faixa-regular)",
  Bom: "var(--faixa-bom)",
  "Muito Bom": "var(--faixa-muito-bom)",
  Excelente: "var(--faixa-excelente)",
};

export function corDaFaixa(faixa: string): string {
  return TOKEN_POR_FAIXA[faixa as Faixa] ?? "var(--apagado)";
}

export function ordenarPorFaixa<T extends { faixa: string }>(itens: T[]): T[] {
  return ordenarAlfabeticamente(itens, (item) => item.faixa);
}

export function ordenarPorGravidadeFaixa<T extends { faixa: string }>(itens: T[]): T[] {
  const ordem: readonly string[] = ORDEM_FAIXAS;
  return [...itens].sort((a, b) => ordem.indexOf(a.faixa) - ordem.indexOf(b.faixa));
}

// Mesmos limites de score/scale.py em -dados (padrão FICO) — replicado aqui só pra decidir a
// cor/rótulo no client sem round-trip extra à API quando já temos o score em mãos.
const LIMITES_FAIXA: [number, Faixa][] = [
  [579, "Ruim"],
  [669, "Regular"],
  [739, "Bom"],
  [799, "Muito Bom"],
  [850, "Excelente"],
];

export function faixaDoScore(score: number): Faixa {
  for (const [limite, faixa] of LIMITES_FAIXA) {
    if (score <= limite) return faixa;
  }
  return "Excelente";
}
