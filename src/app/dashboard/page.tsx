import { filtroDosParams } from "@/lib/filtro-carteira";
import { getDistribuicaoMetricaCliente, getResumoClientes, METRICAS_CLIENTES } from "@/lib/clientes-api";
import { DashboardView } from "./DashboardView";

interface DashboardPageProps {
  searchParams: Promise<{ faixa?: string; segmento?: string; metrica?: string; min?: string; max?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const filtroInicial = filtroDosParams(params);
  const metricaInicial =
    filtroInicial?.tipo === "metrica" && METRICAS_CLIENTES.includes(filtroInicial.metrica as (typeof METRICAS_CLIENTES)[number])
      ? filtroInicial.metrica
      : METRICAS_CLIENTES[0];
  const [resumo, distribuicaoMetricaInicial] = await Promise.all([
    getResumoClientes(filtroInicial),
    getDistribuicaoMetricaCliente(metricaInicial, filtroInicial),
  ]);

  return (
    <DashboardView
      resumoInicial={resumo}
      metricas={METRICAS_CLIENTES}
      metricaInicial={metricaInicial}
      distribuicaoMetricaInicial={distribuicaoMetricaInicial}
      filtroInicial={filtroInicial}
    />
  );
}
