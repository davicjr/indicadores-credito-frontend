import { afterEach, describe, expect, it, vi } from "vitest";
import { getCarteira, getDistribuicaoMetrica, getInadimplenciaPorSegmento, getMetricasDisponiveis } from "./dados-api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("getCarteira", () => {
  it("busca /agregados/carteira e mapeia os campos pra camelCase", async () => {
    vi.stubEnv("DADOS_API_URL", "http://dados.local");
    const corpo = {
      total_clientes: 150000,
      score_medio: 712.4,
      distribuicao_por_faixa: [{ faixa: "Bom", quantidade: 40000 }],
      distribuicao_por_segmento: [{ segmento: 0, quantidade: 30000 }],
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const resultado = await getCarteira();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://dados.local/agregados/carteira",
      expect.objectContaining({ cache: "no-store" })
    );
    expect(resultado).toEqual({
      totalClientes: 150000,
      scoreMedio: 712.4,
      distribuicaoPorFaixa: [{ faixa: "Bom", quantidade: 40000 }],
      distribuicaoPorSegmento: [{ segmento: 0, quantidade: 30000 }],
    });
  });

  it("lança erro quando a resposta não é ok (ex.: 503 gold não construído)", async () => {
    vi.stubEnv("DADOS_API_URL", "http://dados.local");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));

    await expect(getCarteira()).rejects.toThrow(/503/);
  });
});

describe("getInadimplenciaPorSegmento", () => {
  it("busca /agregados/inadimplencia-por-segmento e mapeia os campos", async () => {
    vi.stubEnv("DADOS_API_URL", "http://dados.local");
    const corpo = {
      segmentos: [{ segmento: 0, total_clientes: 30000, taxa_inadimplencia: 0.017 }],
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 })));

    const resultado = await getInadimplenciaPorSegmento();

    expect(resultado).toEqual([{ segmento: 0, totalClientes: 30000, taxaInadimplencia: 0.017 }]);
  });
});

describe("getMetricasDisponiveis", () => {
  it("busca /agregados/metricas e devolve a lista de chaves", async () => {
    vi.stubEnv("DADOS_API_URL", "http://dados.local");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ metricas: ["age", "monthly_income"] }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const resultado = await getMetricasDisponiveis();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://dados.local/agregados/metricas",
      expect.objectContaining({ cache: "no-store" })
    );
    expect(resultado).toEqual(["age", "monthly_income"]);
  });
});

describe("getDistribuicaoMetrica", () => {
  it("busca /agregados/distribuicao/{metrica} e mapeia as faixas pra camelCase", async () => {
    vi.stubEnv("DADOS_API_URL", "http://dados.local");
    const corpo = {
      metrica: "age",
      faixas: [{ min: 20.9, max: 33.0, quantidade: 16855, taxa_inadimplencia: 0.114 }],
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const resultado = await getDistribuicaoMetrica("age");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://dados.local/agregados/distribuicao/age",
      expect.objectContaining({ cache: "no-store" })
    );
    expect(resultado).toEqual({
      metrica: "age",
      faixas: [{ min: 20.9, max: 33.0, quantidade: 16855, taxaInadimplencia: 0.114 }],
    });
  });
});
