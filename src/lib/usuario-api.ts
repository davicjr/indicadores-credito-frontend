import { env } from "@/lib/env";
import { getToken } from "@/lib/session";

export type Papel = "ANALISTA" | "ADMIN";

export interface Usuario {
  id: string;
  usuario: string;
  papel: Papel;
  ativo: boolean;
}

export async function getUsuarioAtual(): Promise<Usuario | null> {
  const token = await getToken();
  const resposta = await fetch(`${env.clientesApiUrl()}/usuarios/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) {
    return null;
  }
  return resposta.json();
}

export interface PaginaUsuarios {
  content: Usuario[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export async function getUsuarioPorId(id: string): Promise<Usuario> {
  const token = await getToken();
  const resposta = await fetch(`${env.clientesApiUrl()}/usuarios/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao consultar /usuarios/${id} em -clientes: ${resposta.status}`);
  }
  return resposta.json();
}

export async function getUsuarios(pagina: number): Promise<PaginaUsuarios> {
  const token = await getToken();
  const resposta = await fetch(`${env.clientesApiUrl()}/usuarios?page=${pagina}&sort=usuario,asc`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao consultar /usuarios em -clientes: ${resposta.status}`);
  }
  return resposta.json();
}
