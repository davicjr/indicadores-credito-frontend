import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { COOKIE_SESSAO } from "@/lib/session";
import { middleware } from "./middleware";

function requisicao(caminho: string, comSessao: boolean) {
  const req = new NextRequest(`http://localhost:3000${caminho}`);
  if (comSessao) {
    req.cookies.set(COOKIE_SESSAO, "jwt-de-teste");
  }
  return req;
}

describe("middleware", () => {
  it("rota protegida sem sessão redireciona pro /login", () => {
    const resposta = middleware(requisicao("/dashboard", false));

    expect(resposta.status).toBe(307);
    expect(resposta.headers.get("location")).toContain("/login");
  });

  it("rota protegida com sessão deixa passar", () => {
    const resposta = middleware(requisicao("/dashboard", true));

    expect(resposta.headers.get("location")).toBeNull();
  });

  it("/login com sessão já ativa redireciona pro /dashboard", () => {
    const resposta = middleware(requisicao("/login", true));

    expect(resposta.status).toBe(307);
    expect(resposta.headers.get("location")).toContain("/dashboard");
  });

  it("/login sem sessão deixa passar", () => {
    const resposta = middleware(requisicao("/login", false));

    expect(resposta.headers.get("location")).toBeNull();
  });

  it("/clientes e /simulador também são protegidas", () => {
    expect(middleware(requisicao("/clientes", false)).headers.get("location")).toContain("/login");
    expect(middleware(requisicao("/simulador", false)).headers.get("location")).toContain("/login");
  });

  it("raiz (/) sem sessão redireciona pro /login", () => {
    const resposta = middleware(requisicao("/", false));

    expect(resposta.status).toBe(307);
    expect(resposta.headers.get("location")).toContain("/login");
  });

  it("raiz (/) com sessão deixa passar (renderiza o hub, não redireciona)", () => {
    const resposta = middleware(requisicao("/", true));

    expect(resposta.headers.get("location")).toBeNull();
  });
});
