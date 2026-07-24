"use client";

import { EstadoRota } from "@/components/EstadoRota";

interface DashboardErrorProps {
  reset: () => void;
}

export default function DashboardError({ reset }: DashboardErrorProps) {
  return (
    <EstadoRota
      tipo="erro"
      indice="CARTEIRA · INDISPONÍVEL"
      titulo="Não foi possível carregar a carteira"
      descricao="O serviço de dados pode estar indisponível ou ainda não ter o cálculo mais recente pronto. Tente novamente em instantes."
      onTentarNovamente={reset}
    />
  );
}
