import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COOKIE_SESSAO } from "@/lib/session";
import { POST } from "./route";

function requisicao(corpo: unknown) {
  return new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.stubEnv("CLIENTES_API_URL", "http://clientes.test");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("credenciais válidas: seta cookie httpOnly e retorna 200", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ token: "jwt-de-teste" }), { status: 200 }),
    );

    const resposta = await POST(requisicao({ usuario: "analista1", senha: "x" }));

    expect(resposta.status).toBe(200);
    const cookie = resposta.cookies.get(COOKIE_SESSAO);
    expect(cookie?.value).toBe("jwt-de-teste");
    expect(cookie?.httpOnly).toBe(true);
  });

  it("chama o -clientes com a URL e o corpo certos", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ token: "jwt" }), { status: 200 }),
    );

    await POST(requisicao({ usuario: "analista1", senha: "x" }));

    expect(fetch).toHaveBeenCalledWith(
      "http://clientes.test/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ usuario: "analista1", senha: "x" }),
      }),
    );
  });

  it("credenciais inválidas: repassa o status e o corpo do backend, sem setar cookie", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ status: 401, erro: "credenciais_invalidas", mensagem: "usuário ou senha inválidos" }),
        { status: 401 },
      ),
    );

    const resposta = await POST(requisicao({ usuario: "analista1", senha: "errada" }));

    expect(resposta.status).toBe(401);
    const corpo = await resposta.json();
    expect(corpo.erro).toBe("credenciais_invalidas");
    expect(resposta.cookies.get(COOKIE_SESSAO)).toBeUndefined();
  });
});
