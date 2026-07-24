import { EstadoRota } from "@/components/EstadoRota";

export default function DashboardLoading() {
  return (
    <EstadoRota
      tipo="carregando"
      indice="CARTEIRA · CONSOLIDANDO"
      titulo="Consolidando a carteira"
      descricao="Organizando métricas, segmentos e distribuições para apresentar a leitura mais recente."
    />
  );
}
