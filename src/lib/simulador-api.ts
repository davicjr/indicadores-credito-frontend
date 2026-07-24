import { env } from "@/lib/env";

export interface SimuladorEntrada {
  idade: number;
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

export interface ContribuicaoFeature {
  feature: string;
  contribuicao: number;
}

export interface SimuladorResultado {
  score: number;
  faixa: string;
  segmento: number;
  modeloUsado: string;
  contribuicoes: ContribuicaoFeature[];
}

interface SimuladorPayloadApi {
  dados_financeiros: {
    idade: number;
    renda_mensal: number | null;
    numero_dependentes: number | null;
    utilizacao_credito_rotativo: number;
    razao_divida_renda: number;
    linhas_credito_abertas: number;
    emprestimos_imobiliarios: number;
    atrasos_30_59_dias: number;
    atrasos_60_89_dias: number;
    atrasos_90_dias_ou_mais: number;
  };
}

interface SimuladorResultadoApi {
  score: number;
  faixa: string;
  segmento: number;
  modelo_usado: string;
  contribuicoes: ContribuicaoFeature[];
}

// -dados é serviço Python/Pydantic (snake_case); nomes de atraso também divergem do -clientes
// (atrasos_30_59_dias aqui vs. atrasos30a59Dias lá) — mesmo conceito, contratos independentes.
export function paraPayloadSimulador(entrada: SimuladorEntrada): SimuladorPayloadApi {
  return {
    dados_financeiros: {
      idade: entrada.idade,
      renda_mensal: entrada.rendaMensal,
      numero_dependentes: entrada.numeroDependentes,
      utilizacao_credito_rotativo: entrada.utilizacaoCreditoRotativo,
      razao_divida_renda: entrada.razaoDividaRenda,
      linhas_credito_abertas: entrada.linhasCreditoAbertas,
      emprestimos_imobiliarios: entrada.emprestimosImobiliarios,
      atrasos_30_59_dias: entrada.atrasos30a59Dias,
      atrasos_60_89_dias: entrada.atrasos60a89Dias,
      atrasos_90_dias_ou_mais: entrada.atrasos90DiasOuMais,
    },
  };
}

export function paraResultadoSimulador(dados: SimuladorResultadoApi): SimuladorResultado {
  return {
    score: dados.score,
    faixa: dados.faixa,
    segmento: dados.segmento,
    modeloUsado: dados.modelo_usado,
    contribuicoes: dados.contribuicoes,
  };
}

// Server-only (importa env.dadosApiUrl(), sem NEXT_PUBLIC_). Usado por /api/simulador (via UI)
// e pela página de detalhe de cliente (recalcula a explicação em cima dos dados já salvos do
// cliente — mesmo endpoint, sem precisar de rota nova em -dados). Retorna null em vez de lançar:
// quem chama usa isso como complemento opcional, não quer derrubar a página inteira se -dados
// estiver fora do ar.
export async function simularNoServidor(entrada: SimuladorEntrada): Promise<SimuladorResultado | null> {
  try {
    const resposta = await fetch(`${env.dadosApiUrl()}/simulador`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paraPayloadSimulador(entrada)),
    });
    if (!resposta.ok) {
      return null;
    }
    return paraResultadoSimulador(await resposta.json());
  } catch {
    return null;
  }
}
