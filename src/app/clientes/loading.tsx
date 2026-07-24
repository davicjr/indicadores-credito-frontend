import { EstadoRota } from "@/components/EstadoRota";

export default function ClientesLoading() {
  return (
    <EstadoRota
      tipo="carregando"
      indice="CLIENTES · ORGANIZANDO CARTEIRA"
      titulo="Organizando os clientes"
      descricao="Preparando cadastros, scores e filtros para uma leitura consistente da carteira."
    />
  );
}
