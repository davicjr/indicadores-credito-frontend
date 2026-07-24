import { Campo } from "@/components/Campo";

export interface DadosFinanceirosFormState {
  rendaMensal: string;
  numeroDependentes: string;
  utilizacaoCreditoRotativo: string;
  razaoDividaRenda: string;
  linhasCreditoAbertas: string;
  emprestimosImobiliarios: string;
  atrasos30a59Dias: string;
  atrasos60a89Dias: string;
  atrasos90DiasOuMais: string;
}

interface DadosFinanceirosCamposProps {
  valores: DadosFinanceirosFormState;
  erros: Record<string, string>;
  onChange: (campo: keyof DadosFinanceirosFormState) => (evento: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CamposSituacaoFinanceira({ valores, erros, onChange }: DadosFinanceirosCamposProps) {
  return (
    <>
      <Campo
        label="Empréstimos imobiliários"
        name="emprestimosImobiliarios"
        type="number"
        min={0}
        value={valores.emprestimosImobiliarios}
        onChange={onChange("emprestimosImobiliarios")}
        required
        erro={erros.emprestimosImobiliarios}
      />
      <Campo
        label="Linhas de crédito abertas"
        name="linhasCreditoAbertas"
        type="number"
        min={0}
        value={valores.linhasCreditoAbertas}
        onChange={onChange("linhasCreditoAbertas")}
        required
        erro={erros.linhasCreditoAbertas}
      />
      <Campo
        label="Número de dependentes"
        name="numeroDependentes"
        type="number"
        min={0}
        value={valores.numeroDependentes}
        onChange={onChange("numeroDependentes")}
        erro={erros.numeroDependentes}
      />
      <Campo
        label="Razão dívida/renda"
        name="razaoDividaRenda"
        type="number"
        min={0}
        step="0.01"
        value={valores.razaoDividaRenda}
        onChange={onChange("razaoDividaRenda")}
        required
        erro={erros.razaoDividaRenda}
      />
      <Campo
        label="Renda mensal"
        name="rendaMensal"
        type="number"
        min={0}
        step="0.01"
        value={valores.rendaMensal}
        onChange={onChange("rendaMensal")}
        erro={erros.rendaMensal}
      />
      <Campo
        label="Utilização de crédito rotativo"
        name="utilizacaoCreditoRotativo"
        type="number"
        min={0}
        step="0.01"
        value={valores.utilizacaoCreditoRotativo}
        onChange={onChange("utilizacaoCreditoRotativo")}
        required
        erro={erros.utilizacaoCreditoRotativo}
      />
    </>
  );
}

export function CamposHistoricoAtraso({ valores, erros, onChange }: DadosFinanceirosCamposProps) {
  return (
    <>
      <Campo
        label="Atrasos de 30 a 59 dias"
        name="atrasos30a59Dias"
        type="number"
        min={0}
        value={valores.atrasos30a59Dias}
        onChange={onChange("atrasos30a59Dias")}
        required
        erro={erros.atrasos30a59Dias}
      />
      <Campo
        label="Atrasos de 60 a 89 dias"
        name="atrasos60a89Dias"
        type="number"
        min={0}
        value={valores.atrasos60a89Dias}
        onChange={onChange("atrasos60a89Dias")}
        required
        erro={erros.atrasos60a89Dias}
      />
      <Campo
        label="Atrasos de 90 dias ou mais"
        name="atrasos90DiasOuMais"
        type="number"
        min={0}
        value={valores.atrasos90DiasOuMais}
        onChange={onChange("atrasos90DiasOuMais")}
        required
        erro={erros.atrasos90DiasOuMais}
      />
    </>
  );
}
