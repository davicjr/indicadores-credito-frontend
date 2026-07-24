import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const getDistribuicaoMetricaMock = vi.fn();
vi.mock("@/lib/dados-api", () => ({
  getDistribuicaoMetrica: (metrica: string) => getDistribuicaoMetricaMock(metrica),
}));

describe("GET /api/metricas/distribuicao/[metrica]", () => {
  it("busca a distribuição da métrica pedida na rota e devolve como json", async () => {
    getDistribuicaoMetricaMock.mockResolvedValue({
      metrica: "age",
      faixas: [{ min: 20, max: 33, quantidade: 16855, taxaInadimplencia: 0.114 }],
    });
    const { GET } = await import("./route");

    const resposta = await GET(new NextRequest("http://localhost:3000/api/metricas/distribuicao/age"), {
      params: Promise.resolve({ metrica: "age" }),
    });

    expect(getDistribuicaoMetricaMock).toHaveBeenCalledWith("age");
    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual({
      metrica: "age",
      faixas: [{ min: 20, max: 33, quantidade: 16855, taxaInadimplencia: 0.114 }],
    });
  });

  it("repassa erro quando -dados falha (ex.: métrica desconhecida)", async () => {
    getDistribuicaoMetricaMock.mockRejectedValue(new Error("Falha ao consultar /agregados/distribuicao/x em -dados: 404"));
    const { GET } = await import("./route");

    const resposta = await GET(new NextRequest("http://localhost:3000/api/metricas/distribuicao/x"), {
      params: Promise.resolve({ metrica: "x" }),
    });

    expect(resposta.status).toBe(502);
  });
});
