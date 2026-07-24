import { describe, expect, it } from "vitest";
import { filtroDosParams, filtrosIguais, queryStringDoFiltro, rotuloFiltro } from "./filtro-carteira";

describe("filtroDosParams", () => {
  it("lê faixa quando presente", () => {
    expect(filtroDosParams({ faixa: "Ruim" })).toEqual({ tipo: "faixa", valor: "Ruim" });
  });

  it("lê segmento numérico quando presente", () => {
    expect(filtroDosParams({ segmento: "1" })).toEqual({ tipo: "segmento", valor: 1 });
  });

  it("lê uma faixa de métrica quando os limites são válidos", () => {
    expect(filtroDosParams({ metrica: "idade", min: "25", max: "40" })).toEqual({
      tipo: "metrica",
      metrica: "idade",
      min: 25,
      max: 40,
    });
  });

  it("faixa tem prioridade se os dois vierem juntos (não deveria acontecer, mas não quebra)", () => {
    expect(filtroDosParams({ faixa: "Ruim", segmento: "1" })).toEqual({ tipo: "faixa", valor: "Ruim" });
  });

  it("segmento não-numérico é tratado como sem filtro", () => {
    expect(filtroDosParams({ segmento: "abc" })).toBeNull();
  });

  it("intervalo de métrica incompleto ou invertido é tratado como sem filtro", () => {
    expect(filtroDosParams({ metrica: "idade", min: "40", max: "25" })).toBeNull();
    expect(filtroDosParams({ metrica: "idade", min: "25" })).toBeNull();
  });

  it("sem nenhum param retorna null", () => {
    expect(filtroDosParams({})).toBeNull();
  });
});

describe("queryStringDoFiltro", () => {
  it("monta ?faixa=X", () => {
    expect(queryStringDoFiltro({ tipo: "faixa", valor: "Ruim" })).toBe("?faixa=Ruim");
  });

  it("monta ?segmento=N", () => {
    expect(queryStringDoFiltro({ tipo: "segmento", valor: 1 })).toBe("?segmento=1");
  });

  it("monta a query completa de uma faixa de métrica", () => {
    expect(queryStringDoFiltro({ tipo: "metrica", metrica: "idade", min: 25, max: 40 })).toBe(
      "?metrica=idade&min=25&max=40"
    );
  });

  it("filtro null vira string vazia", () => {
    expect(queryStringDoFiltro(null)).toBe("");
  });
});

describe("filtrosIguais", () => {
  it("dois filtros null são iguais", () => {
    expect(filtrosIguais(null, null)).toBe(true);
  });

  it("null e um filtro real são diferentes", () => {
    expect(filtrosIguais(null, { tipo: "faixa", valor: "Ruim" })).toBe(false);
  });

  it("mesma faixa é igual", () => {
    expect(filtrosIguais({ tipo: "faixa", valor: "Ruim" }, { tipo: "faixa", valor: "Ruim" })).toBe(true);
  });

  it("faixas diferentes não são iguais", () => {
    expect(filtrosIguais({ tipo: "faixa", valor: "Ruim" }, { tipo: "faixa", valor: "Bom" })).toBe(false);
  });

  it("tipos diferentes não são iguais mesmo com valor parecido", () => {
    expect(filtrosIguais({ tipo: "faixa", valor: "1" }, { tipo: "segmento", valor: 1 })).toBe(false);
  });

  it("faixas da mesma métrica só são iguais com os mesmos limites", () => {
    const faixa = { tipo: "metrica" as const, metrica: "idade", min: 25, max: 40 };
    expect(filtrosIguais(faixa, { ...faixa })).toBe(true);
    expect(filtrosIguais(faixa, { ...faixa, max: 50 })).toBe(false);
  });
});

describe("rotuloFiltro", () => {
  it("faixa retorna o próprio valor", () => {
    expect(rotuloFiltro({ tipo: "faixa", valor: "Ruim" })).toBe("Ruim");
  });

  it("segmento retorna o nome de negócio do segmento", () => {
    expect(rotuloFiltro({ tipo: "segmento", valor: 2 })).toBe("Cliente de confiança");
  });

  it("métrica retorna o nome amigável e o intervalo", () => {
    expect(rotuloFiltro({ tipo: "metrica", metrica: "rendaMensal", min: 2500, max: 5000 })).toBe(
      "Renda mensal: 2.500 – 5.000"
    );
  });
});
