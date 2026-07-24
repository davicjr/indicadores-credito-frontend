import { afterEach, describe, expect, it, vi } from "vitest";
import { paraPayloadSimulador, paraResultadoSimulador, simularNoServidor } from "./simulador-api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("paraPayloadSimulador", () => {
  it("traduz os campos pro snake_case e nomes do contrato Python de -dados", () => {
    const payload = paraPayloadSimulador({
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
    });

    expect(payload).toEqual({
      dados_financeiros: {
        idade: 30,
        renda_mensal: 4500,
        numero_dependentes: 1,
        utilizacao_credito_rotativo: 0.25,
        razao_divida_renda: 0.18,
        linhas_credito_abertas: 2,
        emprestimos_imobiliarios: 0,
        atrasos_30_59_dias: 0,
        atrasos_60_89_dias: 0,
        atrasos_90_dias_ou_mais: 0,
      },
    });
  });

  it("preserva null em renda mensal e dependentes (opcionais no contrato)", () => {
    const payload = paraPayloadSimulador({
      idade: 30,
      rendaMensal: null,
      numeroDependentes: null,
      utilizacaoCreditoRotativo: 0.25,
      razaoDividaRenda: 0.18,
      linhasCreditoAbertas: 2,
      emprestimosImobiliarios: 0,
      atrasos30a59Dias: 0,
      atrasos60a89Dias: 0,
      atrasos90DiasOuMais: 0,
    });

    expect(payload.dados_financeiros.renda_mensal).toBeNull();
    expect(payload.dados_financeiros.numero_dependentes).toBeNull();
  });
});

describe("paraResultadoSimulador", () => {
  it("traduz a resposta de -dados (snake_case) pro formato do frontend, incluindo contribuições", () => {
    const resultado = paraResultadoSimulador({
      score: 712,
      faixa: "Bom",
      segmento: 1,
      modelo_usado: "gbm-v1",
      contribuicoes: [{ feature: "age", contribuicao: 0.4 }],
    });

    expect(resultado).toEqual({
      score: 712,
      faixa: "Bom",
      segmento: 1,
      modeloUsado: "gbm-v1",
      contribuicoes: [{ feature: "age", contribuicao: 0.4 }],
    });
  });
});

describe("simularNoServidor", () => {
  it("chama -dados diretamente e traduz a resposta", async () => {
    vi.stubEnv("DADOS_API_URL", "http://dados.local");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ score: 705, faixa: "Bom", segmento: 1, modelo_usado: "logistic", contribuicoes: [] }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const resultado = await simularNoServidor({
      idade: 36,
      rendaMensal: 5000,
      numeroDependentes: 0,
      utilizacaoCreditoRotativo: 0.3,
      razaoDividaRenda: 0.2,
      linhasCreditoAbertas: 3,
      emprestimosImobiliarios: 1,
      atrasos30a59Dias: 0,
      atrasos60a89Dias: 0,
      atrasos90DiasOuMais: 0,
    });

    expect(fetchMock).toHaveBeenCalledWith("http://dados.local/simulador", expect.objectContaining({ method: "POST" }));
    expect(resultado?.score).toBe(705);
  });

  it("retorna null quando -dados falha (não quebra a página que só quer complementar)", async () => {
    vi.stubEnv("DADOS_API_URL", "http://dados.local");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));

    const resultado = await simularNoServidor({
      idade: 36,
      rendaMensal: 5000,
      numeroDependentes: 0,
      utilizacaoCreditoRotativo: 0.3,
      razaoDividaRenda: 0.2,
      linhasCreditoAbertas: 3,
      emprestimosImobiliarios: 1,
      atrasos30a59Dias: 0,
      atrasos60a89Dias: 0,
      atrasos90DiasOuMais: 0,
    });

    expect(resultado).toBeNull();
  });
});
