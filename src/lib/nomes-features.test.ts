import { describe, expect, it } from "vitest";
import { nomeAmigavelFeature } from "./nomes-features";

describe("nomeAmigavelFeature", () => {
  it("traduz os nomes técnicos das features do modelo pra rótulo em português", () => {
    expect(nomeAmigavelFeature("revolving_utilization")).toBe("Utilização de crédito rotativo");
    expect(nomeAmigavelFeature("age")).toBe("Idade");
    expect(nomeAmigavelFeature("times_90_days_late")).toBe("Atrasos de 90 dias ou mais");
    expect(nomeAmigavelFeature("monthly_income_missing")).toBe("Renda não informada");
  });

  it("cai pro nome técnico quando não reconhece a feature", () => {
    expect(nomeAmigavelFeature("feature_nova")).toBe("feature_nova");
  });
});
