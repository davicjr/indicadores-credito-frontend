import { describe, expect, it } from "vitest";
import { COOKIE_SESSAO } from "@/lib/session";
import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  it("limpa o cookie de sessão", async () => {
    const resposta = await POST();

    expect(resposta.status).toBe(200);
    const cookie = resposta.cookies.get(COOKIE_SESSAO);
    expect(cookie?.value).toBe("");
  });
});
