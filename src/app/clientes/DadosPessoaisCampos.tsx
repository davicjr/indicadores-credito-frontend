import { Campo } from "@/components/Campo";
import type { ClienteFormState } from "./ClienteForm";

interface DadosPessoaisCamposProps {
  modo: "criar" | "editar";
  valores: ClienteFormState;
  erros: Record<string, string>;
  onChange: (campo: keyof ClienteFormState) => (evento: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DadosPessoaisCampos({ modo, valores, erros, onChange }: DadosPessoaisCamposProps) {
  return (
    <>
      {modo === "criar" && (
        <Campo
          label="CPF"
          name="documento"
          value={valores.documento}
          onChange={onChange("documento")}
          required
          erro={erros.documento}
        />
      )}
      <Campo
        label="Data de nascimento"
        name="dataNascimento"
        type="date"
        value={valores.dataNascimento}
        onChange={onChange("dataNascimento")}
        required
        erro={erros.dataNascimento}
      />
      <Campo
        label="Email"
        name="email"
        type="email"
        value={valores.email}
        onChange={onChange("email")}
        required
        erro={erros.email}
      />
      <Campo label="Nome" name="nome" value={valores.nome} onChange={onChange("nome")} required />
      <Campo
        label="Telefone"
        name="telefone"
        value={valores.telefone}
        onChange={onChange("telefone")}
        required
        erro={erros.telefone}
      />
    </>
  );
}
