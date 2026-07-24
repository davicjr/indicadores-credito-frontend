import { describe, expect, it } from "vitest";
import { corDaFaixa, faixaDoScore, ordenarPorFaixa, ORDEM_FAIXAS } from "./faixas";

describe("ORDEM_FAIXAS", () => {
  it("segue a escala de risco, do pior pro melhor", () => {
    expect(ORDEM_FAIXAS).toEqual(["Ruim", "Regular", "Bom", "Muito Bom", "Excelente"]);
  });
});

describe("ordenarPorFaixa", () => {
  it("reordena categorias de faixa alfabeticamente pelo rótulo", () => {
    const entrada = [
      { faixa: "Excelente", quantidade: 1 },
      { faixa: "Ruim", quantidade: 2 },
      { faixa: "Bom", quantidade: 3 },
    ];

    expect(ordenarPorFaixa(entrada).map((item) => item.faixa)).toEqual(["Bom", "Excelente", "Ruim"]);
  });

  it("não muta o array original", () => {
    const entrada = [{ faixa: "Bom", quantidade: 1 }, { faixa: "Ruim", quantidade: 2 }];
    const original = [...entrada];

    ordenarPorFaixa(entrada);

    expect(entrada).toEqual(original);
  });
});

describe("corDaFaixa", () => {
  it("mapeia cada faixa conhecida pro token de cor correspondente", () => {
    expect(corDaFaixa("Ruim")).toBe("var(--faixa-ruim)");
    expect(corDaFaixa("Muito Bom")).toBe("var(--faixa-muito-bom)");
  });

  it("cai pro token neutro quando a faixa não é reconhecida", () => {
    expect(corDaFaixa("Desconhecida")).toBe("var(--apagado)");
  });
});

describe("faixaDoScore", () => {
  it("mapeia score pra faixa seguindo os mesmos limites do scale.py de -dados", () => {
    expect(faixaDoScore(579)).toBe("Ruim");
    expect(faixaDoScore(580)).toBe("Regular");
    expect(faixaDoScore(669)).toBe("Regular");
    expect(faixaDoScore(670)).toBe("Bom");
    expect(faixaDoScore(850)).toBe("Excelente");
    expect(faixaDoScore(300)).toBe("Ruim");
  });
});
