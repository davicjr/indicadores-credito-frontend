import { describe, expect, it } from "vitest";
import { valoresPorFeature } from "./valores-features";

describe("valoresPorFeature", () => {
  it("formata os valores do cenário para acompanhar a explicação do modelo", () => {
    const valores = valoresPorFeature({
      idade: 36,
      rendaMensal: 5000,
      numeroDependentes: 2,
      utilizacaoCreditoRotativo: 0.75,
      razaoDividaRenda: 0.2,
      linhasCreditoAbertas: 3,
      emprestimosImobiliarios: 1,
      atrasos30a59Dias: 2,
      atrasos60a89Dias: 0,
      atrasos90DiasOuMais: 1,
    });

    expect(valores.age).toBe("36 anos");
    expect(valores.revolving_utilization).toBe("75%");
    expect(valores.monthly_income).toContain("5.000,00");
    expect(valores.times_30_59_days_late).toBe("2");
  });
});
