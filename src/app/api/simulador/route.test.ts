import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function requisicao(corpo: unknown) {
  return new NextRequest("http://localhost:3000/api/simulador", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
}

describe("POST /api/simulador", () => {
  beforeEach(() => {
    vi.stubEnv("DADOS_API_URL", "http://dados.test");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("traduz a entrada, chama -dados e devolve o resultado em camelCase", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ score: 712, faixa: "Bom", segmento: 1, modelo_usado: "gbm-v1" }),
        { status: 200 }
      )
    );

    const { POST } = await import("./route");
    const resposta = await POST(
      requisicao({
        idade: 30,
        rendaMensal: 4500,
        numeroDependentes: 1,
        utilizacaoCreditoRotativo: 0.25,
        razaoDividaRenda: 0.18,
        linhasCreditoAbertas: 2,
        emprestimosImobiliarios: 0,
        atrasos30a59Dias: 0,
        atrasos60a89Dias: 0,
        atrasos90DiasOuMais: 0,
      })
    );

    expect(fetch).toHaveBeenCalledWith(
      "http://dados.test/simulador",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"atrasos_30_59_dias":0'),
      })
    );
    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual({ score: 712, faixa: "Bom", segmento: 1, modeloUsado: "gbm-v1" });
  });

  it("repassa erro do backend intacto (ex.: 422)", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "dado inválido" }), { status: 422 })
    );

    const { POST } = await import("./route");
    const resposta = await POST(requisicao({ idade: 30 }));

    expect(resposta.status).toBe(422);
    expect(await resposta.json()).toEqual({ detail: "dado inválido" });
  });
});
