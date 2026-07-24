"use client";

import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type FormEvent } from "react";
import { Abas, AbaPainel, type AbaDef } from "@/components/Abas";
import { CamposHistoricoAtraso, CamposSituacaoFinanceira, type DadosFinanceirosFormState } from "@/components/DadosFinanceirosCampos";
import { isValidCpf } from "@/lib/cpf";
import { DadosPessoaisCampos } from "./DadosPessoaisCampos";
import styles from "./clientes.module.css";

export interface ClienteFormState extends DadosFinanceirosFormState {
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  dataNascimento: string;
}

const ESTADO_VAZIO: ClienteFormState = {
  nome: "",
  documento: "",
  email: "",
  telefone: "",
  dataNascimento: "",
  rendaMensal: "",
  numeroDependentes: "",
  utilizacaoCreditoRotativo: "",
  razaoDividaRenda: "",
  linhasCreditoAbertas: "",
  emprestimosImobiliarios: "",
  atrasos30a59Dias: "",
  atrasos60a89Dias: "",
  atrasos90DiasOuMais: "",
};

// Mesmo agrupamento por domínio (e mesma cor por domínio) já usado no simulador — identidade
// visual consistente pro mesmo tipo de dado em telas diferentes do produto.
const ABAS_CLIENTE: AbaDef[] = [
  { id: "pessoal", rotulo: "Dados pessoais", cor: "var(--acento)" },
  { id: "atraso", rotulo: "Histórico de atraso", cor: "var(--critico)" },
  { id: "financeiro", rotulo: "Situação financeira", cor: "var(--aviso)" },
];

const CAMPOS_POR_ABA: Record<string, string[]> = {
  pessoal: ["documento", "dataNascimento", "email", "nome", "telefone"],
  financeiro: [
    "emprestimosImobiliarios",
    "linhasCreditoAbertas",
    "numeroDependentes",
    "razaoDividaRenda",
    "rendaMensal",
    "utilizacaoCreditoRotativo",
  ],
  atraso: ["atrasos30a59Dias", "atrasos60a89Dias", "atrasos90DiasOuMais"],
};

// Erro de campo que caiu numa aba fechada é invisível — mesma armadilha documentada no
// simulador (idade obrigatória escondida numa aba fechada). Acha a 1ª aba que tem o campo com
// erro e troca pra ela, senão o usuário vê "não foi possível salvar" sem entender por quê.
function abaComPrimeiroErro(erros: Record<string, string>): string | null {
  const camposComErro = Object.keys(erros);
  for (const aba of ABAS_CLIENTE) {
    if (CAMPOS_POR_ABA[aba.id].some((campo) => camposComErro.includes(campo))) {
      return aba.id;
    }
  }
  return null;
}

interface ClienteFormProps {
  modo: "criar" | "editar";
  clienteId?: string;
  valoresIniciais?: Partial<ClienteFormState>;
  apresentacao?: "padrao" | "modal";
  // Usado quando o form roda dentro de um Modal — fecha o modal em vez de navegar pra uma
  // página nova. Sem essa prop, mantém o comportamento antigo (navega pro detalhe do cliente).
  onSucesso?: () => void;
}

function numeroOuNull(valor: string): number | null {
  return valor === "" ? null : Number(valor);
}

function corpoRequisicao(valores: ClienteFormState, modo: "criar" | "editar") {
  const dadosFinanceiros = {
    rendaMensal: numeroOuNull(valores.rendaMensal),
    numeroDependentes: numeroOuNull(valores.numeroDependentes),
    utilizacaoCreditoRotativo: Number(valores.utilizacaoCreditoRotativo),
    razaoDividaRenda: Number(valores.razaoDividaRenda),
    linhasCreditoAbertas: Number(valores.linhasCreditoAbertas),
    emprestimosImobiliarios: Number(valores.emprestimosImobiliarios),
    atrasos30a59Dias: Number(valores.atrasos30a59Dias),
    atrasos60a89Dias: Number(valores.atrasos60a89Dias),
    atrasos90DiasOuMais: Number(valores.atrasos90DiasOuMais),
  };
  const base = {
    nome: valores.nome,
    email: valores.email,
    telefone: valores.telefone,
    dataNascimento: valores.dataNascimento,
    dadosFinanceiros,
  };
  return modo === "criar" ? { ...base, documento: valores.documento } : base;
}

export function ClienteForm({
  modo,
  clienteId,
  valoresIniciais,
  onSucesso,
  apresentacao = "padrao",
}: ClienteFormProps) {
  const router = useRouter();
  const [valores, setValores] = useState<ClienteFormState>({ ...ESTADO_VAZIO, ...valoresIniciais });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState(ABAS_CLIENTE[0].id);

  function onChange(campo: keyof ClienteFormState) {
    return (evento: React.ChangeEvent<HTMLInputElement>) => {
      setValores((atual) => ({ ...atual, [campo]: evento.target.value }));
    };
  }

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErros({});
    setErroGeral(null);

    if (modo === "criar" && !isValidCpf(valores.documento)) {
      setErros({ documento: "CPF inválido" });
      setAbaAtiva("pessoal");
      return;
    }

    setEnviando(true);
    try {
      const url = modo === "criar" ? "/api/clientes" : `/api/clientes/${clienteId}`;
      const method = modo === "criar" ? "POST" : "PUT";
      const resposta = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpoRequisicao(valores, modo)),
      });

      const corpo = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        if (corpo?.campos) {
          setErros(corpo.campos);
          const aba = abaComPrimeiroErro(corpo.campos);
          if (aba) setAbaAtiva(aba);
        } else {
          setErroGeral(corpo?.mensagem ?? "Não foi possível salvar. Tente novamente.");
        }
        return;
      }

      if (onSucesso) {
        onSucesso();
      } else {
        router.push(`/clientes/${corpo.id}`);
      }
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  const indiceAbaAtiva = ABAS_CLIENTE.findIndex((aba) => aba.id === abaAtiva);
  const rotuloAbaAtiva = ABAS_CLIENTE[indiceAbaAtiva]?.rotulo ?? "";

  return (
    <form
      onSubmit={aoSubmeter}
      className={`${styles.formulario} ${
        apresentacao === "modal" ? styles.formularioModalCliente : ""
      }`}
    >
      {apresentacao === "modal" && (
        <div
          className={styles.progressoFormulario}
          aria-live="polite"
          style={
            {
              "--progresso-formulario": `${((indiceAbaAtiva + 1) / ABAS_CLIENTE.length) * 100}%`,
            } as CSSProperties
          }
        >
          <span>
            Etapa {indiceAbaAtiva + 1} de {ABAS_CLIENTE.length}
          </span>
          <strong>{rotuloAbaAtiva}</strong>
        </div>
      )}
      <Abas abas={ABAS_CLIENTE} abaAtiva={abaAtiva} onMudarAba={setAbaAtiva} rotuloGrupo="Grupos de campos">
        <AbaPainel id="pessoal" abaAtiva={abaAtiva}>
          <DadosPessoaisCampos modo={modo} valores={valores} erros={erros} onChange={onChange} />
        </AbaPainel>
        <AbaPainel id="financeiro" abaAtiva={abaAtiva}>
          <CamposSituacaoFinanceira valores={valores} erros={erros} onChange={onChange} />
        </AbaPainel>
        <AbaPainel id="atraso" abaAtiva={abaAtiva}>
          <CamposHistoricoAtraso valores={valores} erros={erros} onChange={onChange} />
        </AbaPainel>
      </Abas>
      {erroGeral && (
        <p className={styles.erro} role="alert">
          {erroGeral}
          </p>
      )}
      <div className={styles.rodapeFormularioCliente}>
        {apresentacao === "modal" && <span></span>}
        <button type="submit" className={styles.botao} disabled={enviando}>
          <span>{modo === "criar" ? "Cadastrar cliente" : "Salvar alterações"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
