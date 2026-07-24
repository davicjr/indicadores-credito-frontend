import { env } from "@/lib/env";

export interface MetricasModelo {
  modelo: string;
  auc: number;
  ks: number;
}

export interface ResumoModelo {
  modeloAtivo: string;
  metricas: MetricasModelo[];
  totalRegistros: number;
  fracaoTeste: number;
  escala: {
    pdo: number;
    scoreBase: number;
    oddsBase: number;
  };
  quantidadeSegmentos: number;
  geradoEm: string | null;
}

interface ResumoModeloApi {
  modelo_ativo: string;
  metricas: MetricasModelo[];
  total_registros: number;
  fracao_teste: number;
  escala: {
    pdo: number;
    base_score: number;
    base_odds: number;
  };
  quantidade_segmentos: number;
  gerado_em: string | null;
}

export async function getResumoModelo(): Promise<ResumoModelo> {
  const resposta = await fetch(`${env.dadosApiUrl()}/modelo/resumo`, {
    cache: "no-store",
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao consultar /modelo/resumo em -dados: ${resposta.status}`);
  }

  const dados: ResumoModeloApi = await resposta.json();
  return {
    modeloAtivo: dados.modelo_ativo,
    metricas: dados.metricas,
    totalRegistros: dados.total_registros,
    fracaoTeste: dados.fracao_teste,
    escala: {
      pdo: dados.escala.pdo,
      scoreBase: dados.escala.base_score,
      oddsBase: dados.escala.base_odds,
    },
    quantidadeSegmentos: dados.quantidade_segmentos,
    geradoEm: dados.gerado_em,
  };
}
