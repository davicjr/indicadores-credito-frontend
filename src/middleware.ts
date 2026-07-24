import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESSAO } from "@/lib/session";

// "/" é a raiz do hub pós-login (rota exata) — as demais são prefixo (cobrem sub-rotas tipo
// /clientes/[id]). Nunca colocar "/" no array de prefixo: todo caminho começa com "/", ia
// proteger o app inteiro por engano (achado real do módulo autenticacao).
const ROTA_PROTEGIDA_EXATA = "/";
const ROTAS_PROTEGIDAS_PREFIXO = ["/dashboard", "/clientes", "/simulador", "/modelo", "/perfil", "/admin"];

// Só checa PRESENÇA do cookie, nunca valida o JWT aqui (middleware roda em Edge runtime — validar
// assinatura exigiria reimplementar o parsing do token nos dois lugares). Token expirado/inválido
// ainda é pego pelos backends, que retornam 401 nas chamadas reais.
export function middleware(request: NextRequest) {
  const temSessao = request.cookies.has(COOKIE_SESSAO);
  const { pathname } = request.nextUrl;

  const rotaProtegida =
    pathname === ROTA_PROTEGIDA_EXATA ||
    ROTAS_PROTEGIDAS_PREFIXO.some((rota) => pathname.startsWith(rota));
  if (rotaProtegida && !temSessao) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && temSessao) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/clientes/:path*",
    "/simulador/:path*",
    "/modelo/:path*",
    "/perfil/:path*",
    "/admin/:path*",
    "/login",
  ],
};
