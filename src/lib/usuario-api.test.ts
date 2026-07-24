import { afterEach, describe, expect, it, vi } from "vitest";

const getTokenMock = vi.fn();
vi.mock("./session", () => ({ getToken: () => getTokenMock() }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("getUsuarioAtual", () => {
  it("busca /usuarios/me com o Bearer da sessão", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    const corpo = { id: "u1", usuario: "ana1", papel: "ANALISTA", ativo: true };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { getUsuarioAtual } = await import("./usuario-api");
    const resultado = await getUsuarioAtual();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://clientes.local/usuarios/me",
      expect.objectContaining({ headers: { Authorization: "Bearer jwt-de-teste" } })
    );
    expect(resultado).toEqual(corpo);
  });

  it("retorna null quando a resposta não é ok (sessão inválida, por exemplo)", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-invalido");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 401 })));

    const { getUsuarioAtual } = await import("./usuario-api");
    const resultado = await getUsuarioAtual();

    expect(resultado).toBeNull();
  });
});

describe("getUsuarios", () => {
  it("busca /usuarios paginado com o Bearer da sessão", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    const corpo = {
      content: [{ id: "u1", usuario: "admin1", papel: "ADMIN", ativo: true }],
      page: { size: 20, number: 0, totalElements: 1, totalPages: 1 },
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { getUsuarios } = await import("./usuario-api");
    const resultado = await getUsuarios(0);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://clientes.local/usuarios?page=0&sort=usuario,asc",
      expect.objectContaining({ headers: { Authorization: "Bearer jwt-de-teste" }, cache: "no-store" })
    );
    expect(resultado).toEqual(corpo);
  });
});

describe("getUsuarioPorId", () => {
  it("busca /usuarios/{id} com o Bearer da sessão", async () => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.local");
    getTokenMock.mockResolvedValue("jwt-de-teste");
    const corpo = { id: "u1", usuario: "ana1", papel: "ANALISTA", ativo: true };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { getUsuarioPorId } = await import("./usuario-api");
    const resultado = await getUsuarioPorId("u1");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://clientes.local/usuarios/u1",
      expect.objectContaining({ headers: { Authorization: "Bearer jwt-de-teste" }, cache: "no-store" })
    );
    expect(resultado).toEqual(corpo);
  });
});
