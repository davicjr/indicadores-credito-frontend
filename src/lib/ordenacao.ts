const COMPARADOR_PT_BR = new Intl.Collator("pt-BR", {
  numeric: true,
  sensitivity: "base",
});

export function compararAlfabeticamente(a: string, b: string): number {
  return COMPARADOR_PT_BR.compare(a, b);
}

export function ordenarAlfabeticamente<T>(
  itens: readonly T[],
  obterRotulo: (item: T) => string
): T[] {
  return [...itens].sort((a, b) =>
    compararAlfabeticamente(obterRotulo(a), obterRotulo(b))
  );
}

export function proximoSort(sortAtual: string | undefined, campo: string): string | undefined {
  const [campoAtual, direcaoAtual] = sortAtual?.split(",") ?? [];

  if (campoAtual !== campo) {
    return `${campo},asc`;
  }
  if (direcaoAtual === "asc") {
    return `${campo},desc`;
  }
  return undefined;
}
