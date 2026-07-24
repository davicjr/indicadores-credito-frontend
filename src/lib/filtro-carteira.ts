import { nomeAmigavelMetricaCliente, rotuloFaixaMetricaCliente } from "@/lib/metricas-clientes";
import { nomeSegmento } from "@/lib/segmentos";

export type FiltroCarteira =
  | { tipo: "faixa"; valor: string }
  | { tipo: "segmento"; valor: number }
  | { tipo: "metrica"; metrica: string; min: number; max: number };

export function filtroDosParams(params: {
  faixa?: string;
  segmento?: string;
  metrica?: string;
  min?: string;
  max?: string;
}): FiltroCarteira | null {
  if (params.faixa) {
    return { tipo: "faixa", valor: params.faixa };
  }
  if (params.segmento !== undefined) {
    const segmento = Number(params.segmento);
    if (!Number.isNaN(segmento)) {
      return { tipo: "segmento", valor: segmento };
    }
  }
  if (params.metrica && params.min !== undefined && params.max !== undefined) {
    const min = Number(params.min);
    const max = Number(params.max);
    if (Number.isFinite(min) && Number.isFinite(max) && min <= max) {
      return { tipo: "metrica", metrica: params.metrica, min, max };
    }
  }
  return null;
}

export function queryStringDoFiltro(filtro: FiltroCarteira | null): string {
  if (!filtro) {
    return "";
  }
  const params = new URLSearchParams();
  if (filtro.tipo === "faixa") {
    params.set("faixa", filtro.valor);
  } else if (filtro.tipo === "segmento") {
    params.set("segmento", String(filtro.valor));
  } else {
    params.set("metrica", filtro.metrica);
    params.set("min", String(filtro.min));
    params.set("max", String(filtro.max));
  }
  return `?${params.toString()}`;
}

export function filtrosIguais(a: FiltroCarteira | null, b: FiltroCarteira | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  if (a.tipo !== b.tipo) {
    return false;
  }
  if (a.tipo === "faixa" && b.tipo === "faixa") {
    return a.valor === b.valor;
  }
  if (a.tipo === "segmento" && b.tipo === "segmento") {
    return a.valor === b.valor;
  }
  if (a.tipo === "metrica" && b.tipo === "metrica") {
    return a.metrica === b.metrica && a.min === b.min && a.max === b.max;
  }
  return false;
}

export function rotuloFiltro(filtro: FiltroCarteira): string {
  if (filtro.tipo === "faixa") return filtro.valor;
  if (filtro.tipo === "segmento") return nomeSegmento(filtro.valor);
  return `${nomeAmigavelMetricaCliente(filtro.metrica)}: ${rotuloFaixaMetricaCliente(filtro.min, filtro.max)}`;
}
