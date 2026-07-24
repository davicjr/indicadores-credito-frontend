"use client";

import { EstadoRota } from "@/components/EstadoRota";

interface ModeloErrorProps {
  reset: () => void;
}

export default function ModeloError({ reset }: ModeloErrorProps) {
  return (
    <EstadoRota
      tipo="erro"
      indice="MODELO · INDISPONÍVEL"
      titulo="Não foi possível carregar o modelo"
      descricao="O serviço de dados pode estar indisponível ou o pipeline ainda não concluiu o treino mais recente. Tente novamente em instantes."
      onTentarNovamente={reset}
    />
  );
}
