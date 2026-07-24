import { afterEach, describe, expect, it, vi } from "vitest";
import { getResumoModelo } from "./modelo-api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("getResumoModelo", () => {
  it("busca o resumo real do treino e mapeia os campos pra camelCase", async () => {
    vi.stubEnv("DADOS_API_URL", "http://dados.local");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          modelo_ativo: "logistic",
          metricas: [{ modelo: "logistic", auc: 0.8554, ks: 0.5599 }],
          total_registros: 149390,
          fracao_teste: 0.2,
          escala: { pdo: 20, base_score: 600, base_odds: 50 },
          quantidade_segmentos: 4,
          gerado_em: "2026-07-20T14:53:36Z",
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const resultado = await getResumoModelo();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://dados.local/modelo/resumo",
      expect.objectContaining({ cache: "no-store" })
    );
    expect(resultado).toEqual({
      modeloAtivo: "logistic",
      metricas: [{ modelo: "logistic", auc: 0.8554, ks: 0.5599 }],
      totalRegistros: 149390,
      fracaoTeste: 0.2,
      escala: { pdo: 20, scoreBase: 600, oddsBase: 50 },
      quantidadeSegmentos: 4,
      geradoEm: "2026-07-20T14:53:36Z",
    });
  });

  it("lança erro quando o relatório do modelo não está disponível", async () => {
    vi.stubEnv("DADOS_API_URL", "http://dados.local");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));

    await expect(getResumoModelo()).rejects.toThrow(/503/);
  });
});
