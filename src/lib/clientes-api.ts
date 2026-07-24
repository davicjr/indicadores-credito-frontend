import { env } from "@/lib/env";
import { queryStringDoFiltro, type FiltroCarteira } from "@/lib/filtro-carteira";
import { getToken } from "@/lib/session";

export interface DadosFinanceiros {
  rendaMensal: number | null;
  numeroDependentes: number | null;
  utilizacaoCreditoRotativo: number;
  razaoDividaRenda: number;
  linhasCreditoAbertas: number;
  emprestimosImobiliarios: number;
  atrasos30a59Dias: number;
  atrasos60a89Dias: number;
  atrasos90DiasOuMais: number;
}

export interface Cliente {
  id: string;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  idade: number;
  ativo: boolean;
  dadosFinanceiros: DadosFinanceiros;
  score: number | null;
  faixa: string | null;
  segmento: number | null;
  modeloUsado: string | null;
  scoreAtualizadoEm: string | null;
}

export interface PaginaClientes {
  content: Cliente[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

async function buscar<T>(caminho: string): Promise<T> {
  const token = await getToken();
  const resposta = await fetch(`${env.clientesApiUrl()}${caminho}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao consultar ${caminho} em -clientes: ${resposta.status}`);
  }
  return resposta.json();
}

export interface FiltrosClientes {
  nome?: string;
  faixa?: string;
  segmento?: number;
  status?: string;
  sort?: string;
}

export const ORDENACAO_PADRAO_CLIENTES = "nome,asc";

export async function getClientes(pagina: number, filtros: FiltrosClientes = {}): Promise<PaginaClientes> {
  const params = new URLSearchParams({
    page: String(pagina),
    sort: filtros.sort ?? ORDENACAO_PADRAO_CLIENTES,
  });
  if (filtros.nome) params.set("nome", filtros.nome);
  if (filtros.faixa) params.set("faixa", filtros.faixa);
  if (filtros.segmento !== undefined) params.set("segmento", String(filtros.segmento));
  if (filtros.status) params.set("status", filtros.status);

  return buscar<PaginaClientes>(`/clientes?${params.toString()}`);
}

export async function getClienteById(id: string): Promise<Cliente> {
  return buscar<Cliente>(`/clientes/${id}`);
}

export interface DistribuicaoFaixaResumo {
  faixa: string;
  quantidade: number;
}

export interface DistribuicaoSegmentoResumo {
  segmento: number;
  quantidade: number;
}

export interface ResumoClientes {
  totalClientes: number;
  scoreMedio: number | null;
  distribuicaoPorFaixa: DistribuicaoFaixaResumo[];
  distribuicaoPorSegmento: DistribuicaoSegmentoResumo[];
}

// Carteira REAL (clientes cadastrados de verdade em -clientes) — não confundir com
// getCarteira() de dados-api.ts, que agrega a base histórica usada só pra treinar o modelo.
// filtro opcional (faixa, segmento ou intervalo de métrica) recalcula os agregados só sobre o recorte — usado pelo
// SSR inicial de /dashboard quando a URL já chega com um filtro aplicado.
export async function getResumoClientes(filtro: FiltroCarteira | null = null): Promise<ResumoClientes> {
  return buscar<ResumoClientes>(`/clientes/resumo${queryStringDoFiltro(filtro)}`);
}

// Mesmas 10 métricas de entrada do domínio Cliente (ver ClienteService.METRICAS_DISPONIVEIS
// em -clientes) — nomes em camelCase, diferente das métricas de -dados (snake_case).
export const METRICAS_CLIENTES = [
  "atrasos30a59Dias",
  "atrasos60a89Dias",
  "atrasos90DiasOuMais",
  "emprestimosImobiliarios",
  "idade",
  "linhasCreditoAbertas",
  "numeroDependentes",
  "razaoDividaRenda",
  "rendaMensal",
  "utilizacaoCreditoRotativo",
] as const;

export interface FaixaMetricaCliente {
  min: number;
  max: number;
  quantidade: number;
}

export interface DistribuicaoMetricaCliente {
  metrica: string;
  faixas: FaixaMetricaCliente[];
}

// Sem taxaInadimplencia de propósito — diferente de getDistribuicaoMetrica() em dados-api.ts,
// um cliente ativo real ainda não "aconteceu", não tem como saber se vai inadimplir. O filtro
// cruzado também aceita uma faixa de métrica, compartilhando a mesma query do resumo.
export async function getDistribuicaoMetricaCliente(
  metrica: string,
  filtro: FiltroCarteira | null = null
): Promise<DistribuicaoMetricaCliente> {
  return buscar<DistribuicaoMetricaCliente>(`/clientes/distribuicao/${metrica}${queryStringDoFiltro(filtro)}`);
}
