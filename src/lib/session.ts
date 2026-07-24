import { cookies } from "next/headers";

export const COOKIE_SESSAO = "sessao";

// espelha JWT_EXPIRACAO_MINUTOS=60 do indicadores-credito-clientes — cookie não deve sobreviver
// mais que o token que ele guarda.
const MAX_AGE_SEGUNDOS = 60 * 60;

export const opcoesCookieSessao = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SEGUNDOS,
};

export async function getToken(): Promise<string | undefined> {
  const armazenamento = await cookies();
  return armazenamento.get(COOKIE_SESSAO)?.value;
}
