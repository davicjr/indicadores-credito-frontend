import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { COOKIE_SESSAO, opcoesCookieSessao } from "@/lib/session";

/** -clientes emite o JWT (POST /auth/login retorna só {token}, não seta cookie) — esta rota
 * chama o backend server-side e é quem de fato cria o cookie httpOnly, porque só o servidor
 * consegue fazer isso (JS no browser nunca teria acesso a um cookie httpOnly de qualquer jeito). */
export async function POST(request: NextRequest) {
  const corpo = await request.json();

  const respostaBackend = await fetch(`${env.clientesApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });

  if (!respostaBackend.ok) {
    const erro = await respostaBackend.json().catch(() => null);
    return NextResponse.json(erro ?? { erro: "erro_desconhecido" }, { status: respostaBackend.status });
  }

  const { token } = (await respostaBackend.json()) as { token: string };
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(COOKIE_SESSAO, token, opcoesCookieSessao);
  return resposta;
}
