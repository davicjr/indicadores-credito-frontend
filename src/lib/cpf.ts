function digitoVerificador(cpf: number[], quantidadeDigitos: number): number {
  let peso = quantidadeDigitos + 1;
  let soma = 0;
  for (let i = 0; i < quantidadeDigitos; i++) {
    soma += cpf[i] * peso;
    peso--;
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function isValidCpf(valor: string): boolean {
  const digitosTexto = valor.replace(/\D/g, "");
  if (digitosTexto.length !== 11 || new Set(digitosTexto).size === 1) {
    return false;
  }

  const cpf = digitosTexto.split("").map(Number);
  return cpf[9] === digitoVerificador(cpf, 9) && cpf[10] === digitoVerificador(cpf, 10);
}
