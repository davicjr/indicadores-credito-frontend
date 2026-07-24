"use client";

import { EstadoRota } from "@/components/EstadoRota";

interface ClientesErrorProps {
  reset: () => void;
}

export default function ClientesError({ reset }: ClientesErrorProps) {
  return (
    <EstadoRota
      tipo="erro"
      indice="CLIENTES · INDISPONÍVEL"
      titulo="Não foi possível carregar os clientes"
      descricao="O serviço de clientes pode estar indisponível ou a sessão pode ter expirado. Verifique o acesso e tente novamente."
      onTentarNovamente={reset}
    />
  );
}
