import {
  getCarteira,
  getDistribuicaoMetrica,
  getImportanciaFeatures,
  getInadimplenciaPorSegmento,
  getMetricasDisponiveis,
} from "@/lib/dados-api";
import { getResumoModelo } from "@/lib/modelo-api";
import { nomeAmigavelFeature } from "@/lib/nomes-features";
import { ordenarAlfabeticamente } from "@/lib/ordenacao";
import { ModeloView } from "./ModeloView";

export default async function ModeloPage() {
  const [resumoModelo, pesos, carteira, inadimplencia, metricas] = await Promise.all([
    getResumoModelo(),
    getImportanciaFeatures(),
    getCarteira(),
    getInadimplenciaPorSegmento(),
    getMetricasDisponiveis(),
  ]);
  const metricasOrdenadas = ordenarAlfabeticamente(metricas, nomeAmigavelFeature);
  const metricaInicial = metricasOrdenadas[0];
  const distribuicaoMetricaInicial = await getDistribuicaoMetrica(metricaInicial);

  return (
    <ModeloView
      resumoModelo={resumoModelo}
      pesos={pesos}
      carteira={carteira}
      inadimplencia={inadimplencia}
      metricas={metricasOrdenadas}
      metricaInicial={metricaInicial}
      distribuicaoMetricaInicial={distribuicaoMetricaInicial}
    />
  );
}
