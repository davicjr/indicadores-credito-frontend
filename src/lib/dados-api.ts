import { env } from "@/lib/env";

export interface DistribuicaoFaixa {
  faixa: string;
  quantidade: number;
}

export interface DistribuicaoSegmento {
  segmento: number;
  quantidade: number;
}

export interface CarteiraResumo {
  totalClientes: number;
  scoreMedio: number;
  distribuicaoPorFaixa: DistribuicaoFaixa[];
  distribuicaoPorSegmento: DistribuicaoSegmento[];
}

export interface InadimplenciaSegmento {
  segmento: number;
  totalClientes: number;
  taxaInadimplencia: number;
}

interface CarteiraResponseApi {
  total_clientes: number;
  score_medio: number;
  distribuicao_por_faixa: DistribuicaoFaixa[];
  distribuicao_por_segmento: DistribuicaoSegmento[];
}

interface InadimplenciaSegmentoApi {
  segmento: number;
  total_clientes: number;
  taxa_inadimplencia: number;
}

interface InadimplenciaResponseApi {
  segmentos: InadimplenciaSegmentoApi[];
}

export interface FaixaMetrica {
  min: number;
  max: number;
  quantidade: number;
  taxaInadimplencia: number;
}

export interface DistribuicaoMetrica {
  metrica: string;
  faixas: FaixaMetrica[];
}

interface MetricasResponseApi {
  metricas: string[];
}

interface FaixaMetricaApi {
  min: number;
  max: number;
  quantidade: number;
  taxa_inadimplencia: number;
}

interface DistribuicaoMetricaResponseApi {
  metrica: string;
  faixas: FaixaMetricaApi[];
}

async function buscar<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${env.dadosApiUrl()}${caminho}`, { cache: "no-store" });
  if (!resposta.ok) {
    throw new Error(`Falha ao consultar ${caminho} em -dados: ${resposta.status}`);
  }
  return resposta.json();
}

export async function getCarteira(): Promise<CarteiraResumo> {
  const dados = await buscar<CarteiraResponseApi>("/agregados/carteira");
  return {
    totalClientes: dados.total_clientes,
    scoreMedio: dados.score_medio,
    distribuicaoPorFaixa: dados.distribuicao_por_faixa,
    distribuicaoPorSegmento: dados.distribuicao_por_segmento,
  };
}

export async function getInadimplenciaPorSegmento(): Promise<InadimplenciaSegmento[]> {
  const dados = await buscar<InadimplenciaResponseApi>("/agregados/inadimplencia-por-segmento");
  return dados.segmentos.map((segmento) => ({
    segmento: segmento.segmento,
    totalClientes: segmento.total_clientes,
    taxaInadimplencia: segmento.taxa_inadimplencia,
  }));
}

export async function getMetricasDisponiveis(): Promise<string[]> {
  const dados = await buscar<MetricasResponseApi>("/agregados/metricas");
  return dados.metricas;
}

export async function getDistribuicaoMetrica(metrica: string): Promise<DistribuicaoMetrica> {
  const dados = await buscar<DistribuicaoMetricaResponseApi>(`/agregados/distribuicao/${metrica}`);
  return {
    metrica: dados.metrica,
    faixas: dados.faixas.map((faixa) => ({
      min: faixa.min,
      max: faixa.max,
      quantidade: faixa.quantidade,
      taxaInadimplencia: faixa.taxa_inadimplencia,
    })),
  };
}

export interface PesoFeature {
  feature: string;
  peso: number;
}

interface ImportanciaFeaturesResponseApi {
  pesos: PesoFeature[];
}

// Peso global de cada feature na regressão logística (coeficiente no espaço padronizado —
// mesma métrica pros scorers.ts explicarem, ver score/explain.py). Só existe pro scorer
// "logistic" (o único explicável); usado pra ranquear os campos do simulador por quanto cada
// um pesa de verdade no modelo, não por achismo de UX.
export async function getImportanciaFeatures(): Promise<PesoFeature[]> {
  const dados = await buscar<ImportanciaFeaturesResponseApi>("/modelo/importancia-features");
  return dados.pesos;
}
