const NOMES_MODELOS: Record<string, string> = {
  logistic: "Regressão logística",
  gradient_boosting: "Gradient Boosting",
};

export function nomeModelo(modelo: string): string {
  return NOMES_MODELOS[modelo] ?? modelo;
}
