import { EstadoRota } from "@/components/EstadoRota";

export default function ModeloLoading() {
  return (
    <EstadoRota
      tipo="carregando"
      indice="MODELO · PREPARANDO LEITURA"
      titulo="Organizando as evidências"
      descricao="Carregando métricas, coeficientes e referências do modelo ativo."
    />
  );
}
