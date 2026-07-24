import { MetricasExplorador } from "@/components/MetricasExplorador";
import type { DistribuicaoMetrica } from "@/lib/dados-api";
import styles from "./dashboard.module.css";

interface MetricasCarteiraProps {
  metricas: string[];
  metricaInicial: string;
  distribuicaoInicial: DistribuicaoMetrica;
  titulo?: string;
}

export function MetricasCarteira({
  metricas,
  metricaInicial,
  distribuicaoInicial,
  titulo = "Relação entre variáveis e inadimplência",
}: MetricasCarteiraProps) {
  return (
    <section className={styles.cartao} aria-label="Distribuição por métrica">
      <MetricasExplorador
        metricas={metricas}
        metricaInicial={metricaInicial}
        distribuicaoInicial={distribuicaoInicial}
        titulo={titulo}
      />
    </section>
  );
}
