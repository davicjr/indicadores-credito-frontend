function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida`);
  }
  return valor;
}

/** Server-only — nunca importar de um Client Component (as URLs não vão pro bundle, de propósito). */
export const env = {
  dadosApiUrl: () => obrigatoria("DADOS_API_URL"),
  clientesApiUrl: () => obrigatoria("CLIENTES_API_URL"),
};
