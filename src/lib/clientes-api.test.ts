import { afterEach, describe, expect, it, vi } from "vitest";

const getTokenMock = vi.fn();
vi.mock("./session", () => ({ getToken: () => getTokenMock() }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("getClientes", () => {
  it("busca /clientes paginado com o Bearer da sessão", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    const corpo = {
      content: [{ id: "c1", nome: "Ana", documento: "11144477735" }],
      page: { size: 20, number: 0, totalElements: 1, totalPages: 1 },
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { getClientes } = await import("./clientes-api");
    const resultado = await getClientes(0);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://clientes.local/clientes?page=0&sort=nome%2Casc",
      expect.objectContaining({
        headers: { Authorization: "Bearer jwt-de-teste" },
        cache: "no-store",
      })
    );
    expect(resultado).toEqual(corpo);
  });

  it("lança erro quando a resposta não é ok", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 401 })));

    const { getClientes } = await import("./clientes-api");
    await expect(getClientes(0)).rejects.toThrow(/401/);
  });

  it("inclui nome, faixa, segmento e sort quando fornecidos", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } }), {
        status: 200,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { getClientes } = await import("./clientes-api");
    await getClientes(0, { nome: "ana", faixa: "Bom", segmento: 1, status: "todos", sort: "nome,asc" });

    const urlChamada = fetchMock.mock.calls[0][0] as string;
    expect(urlChamada).toContain("page=0");
    expect(urlChamada).toContain("nome=ana");
    expect(urlChamada).toContain("faixa=Bom");
    expect(urlChamada).toContain("segmento=1");
    expect(urlChamada).toContain("status=todos");
    expect(urlChamada).toContain("sort=nome%2Casc");
  });

  it("omite filtros vazios/indefinidos da query", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } }), {
        status: 200,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { getClientes } = await import("./clientes-api");
    await getClientes(0, { nome: "" });

    const urlChamada = fetchMock.mock.calls[0][0] as string;
    expect(urlChamada).not.toContain("nome=");
    expect(urlChamada).not.toContain("faixa=");
  });
});

describe("getClienteById", () => {
  it("busca /clientes/{id} com o Bearer da sessão", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    const corpo = { id: "c1", nome: "Ana" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 })));

    const { getClienteById } = await import("./clientes-api");
    const resultado = await getClienteById("c1");

    expect(resultado).toEqual(corpo);
  });
});

describe("getResumoClientes", () => {
  it("busca /clientes/resumo com o Bearer da sessão", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    const corpo = {
      totalClientes: 32,
      scoreMedio: 562.5,
      distribuicaoPorFaixa: [{ faixa: "Ruim", quantidade: 18 }],
      distribuicaoPorSegmento: [{ segmento: 0, quantidade: 10 }],
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { getResumoClientes } = await import("./clientes-api");
    const resultado = await getResumoClientes();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://clientes.local/clientes/resumo",
      expect.objectContaining({ headers: { Authorization: "Bearer jwt-de-teste" }, cache: "no-store" })
    );
    expect(resultado).toEqual(corpo);
  });

  it("scoreMedio nulo quando nenhum cliente ativo ainda tem score calculado", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    const corpo = { totalClientes: 2, scoreMedio: null, distribuicaoPorFaixa: [], distribuicaoPorSegmento: [] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 })));

    const { getResumoClientes } = await import("./clientes-api");
    const resultado = await getResumoClientes();

    expect(resultado.scoreMedio).toBeNull();
  });

  it("com filtro de faixa, anexa ?faixa= na URL", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    const corpo = { totalClientes: 18, scoreMedio: 531, distribuicaoPorFaixa: [], distribuicaoPorSegmento: [] };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { getResumoClientes } = await import("./clientes-api");
    await getResumoClientes({ tipo: "faixa", valor: "Ruim" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://clientes.local/clientes/resumo?faixa=Ruim",
      expect.objectContaining({ headers: { Authorization: "Bearer jwt-de-teste" } })
    );
  });
});

describe("getDistribuicaoMetricaCliente", () => {
  it("busca /clientes/distribuicao/{metrica} com o Bearer da sessão", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    const corpo = { metrica: "idade", faixas: [{ min: 21, max: 40, quantidade: 5 }] };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { getDistribuicaoMetricaCliente } = await import("./clientes-api");
    const resultado = await getDistribuicaoMetricaCliente("idade");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://clientes.local/clientes/distribuicao/idade",
      expect.objectContaining({ headers: { Authorization: "Bearer jwt-de-teste" }, cache: "no-store" })
    );
    expect(resultado).toEqual(corpo);
  });

  it("com filtro de segmento, anexa ?segmento= na URL", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    const corpo = { metrica: "idade", faixas: [] };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { getDistribuicaoMetricaCliente } = await import("./clientes-api");
    await getDistribuicaoMetricaCliente("idade", { tipo: "segmento", valor: 1 });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://clientes.local/clientes/distribuicao/idade?segmento=1",
      expect.objectContaining({ headers: { Authorization: "Bearer jwt-de-teste" } })
    );
  });
});
