import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getTokenMock = vi.fn();
vi.mock("./session", () => ({ getToken: () => getTokenMock() }));

beforeEach(() => {
  vi.stubEnv("CLIENTES_API_URL", "http://clientes.test");
  getTokenMock.mockResolvedValue("jwt-de-teste");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("proxyParaClientes", () => {
  it("chama -clientes com method, Bearer e corpo, repassando status e corpo da resposta", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: "c1" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const { proxyParaClientes } = await import("./proxy-clientes");
    const resposta = await proxyParaClientes("/clientes", "POST", { nome: "Ana" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://clientes.test/clientes",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer jwt-de-teste" },
        body: JSON.stringify({ nome: "Ana" }),
      })
    );
    expect(resposta.status).toBe(201);
    expect(await resposta.json()).toEqual({ id: "c1" });
  });

  it("repassa erro de validação (422 com campos) do backend intacto", async () => {
    const corpoErro = { status: 422, erro: "validacao_falhou", mensagem: "campos inválidos", campos: { documento: "CPF inválido" } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(corpoErro), { status: 422 })));

    const { proxyParaClientes } = await import("./proxy-clientes");
    const resposta = await proxyParaClientes("/clientes", "POST", { nome: "Ana" });

    expect(resposta.status).toBe(422);
    expect(await resposta.json()).toEqual(corpoErro);
  });

  it("funciona sem corpo (PATCH de inativação)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "c1", ativo: false }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { proxyParaClientes } = await import("./proxy-clientes");
    await proxyParaClientes("/clientes/c1/inativar", "PATCH");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://clientes.test/clientes/c1/inativar",
      expect.not.objectContaining({ body: expect.anything() })
    );
  });

  it("repassa DELETE sem corpo, mesmo quando o backend responde 204 sem body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const { proxyParaClientes } = await import("./proxy-clientes");
    const resposta = await proxyParaClientes("/usuarios/u1", "DELETE");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://clientes.test/usuarios/u1",
      expect.objectContaining({ method: "DELETE" })
    );
    expect(resposta.status).toBe(204);
  });
});
