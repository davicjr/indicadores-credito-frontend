"use client";

import { useState, type FormEvent } from "react";
import { MotionReveal } from "@/components/MotionReveal";
import type { PesoFeature } from "@/lib/dados-api";
import type { SimuladorEntrada } from "@/lib/simulador-api";
import type { CasoRealSimulador } from "@/lib/casos-reais-simulador";
import { ClienteForm } from "../clientes/ClienteForm";
import { CasosReaisSimulador } from "./CasosReaisSimulador";
import { SimuladorCampos, type SimuladorCamposFormState } from "./SimuladorCampos";
import { SimuladorResultadoView, type CenarioSimulado } from "./SimuladorResultadoView";
import styles from "./simulador.module.css";

const ESTADO_VAZIO: SimuladorCamposFormState = {
  idade: "",
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

function numeroOuNull(valor: string): number | null {
  return valor === "" ? null : Number(valor);
}

interface SimuladorFormProps {
  pesos: PesoFeature[];
}

export function SimuladorForm({ pesos }: SimuladorFormProps) {
  const [valores, setValores] = useState<SimuladorCamposFormState>(ESTADO_VAZIO);
  const [historico, setHistorico] = useState<CenarioSimulado[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [cadastrando, setCadastrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function onChange(campo: keyof SimuladorCamposFormState) {
    return (evento: React.ChangeEvent<HTMLInputElement>) => {
      setValores((atual) => ({ ...atual, [campo]: evento.target.value }));
    };
  }

  function aoEscolherCasoReal(caso: CasoRealSimulador) {
    setErro(null);
    setValores(caso.valores);
  }

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    const entrada: SimuladorEntrada = {
      idade: Number(valores.idade),
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
    try {
      const resposta = await fetch("/api/simulador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entrada),
      });

      const corpo = await resposta.json().catch(() => null);
      if (!resposta.ok) {
        setErro(corpo?.mensagem ?? "Não foi possível simular. Tente novamente.");
        return;
      }

      setHistorico((atual) => [{ ...corpo, entrada }, ...atual].slice(0, 2));
      setMostrarFormulario(false);
    } finally {
      setEnviando(false);
    }
  }

  if (cadastrando) {
    return (
      <MotionReveal className={styles.cadastroDepoisSimulacao} delay={1}>
        <header className={styles.cabecalhoCadastroAssistido}>
          <div>
            <span className={styles.indiceSimulador}>Próximo passo</span>
            <h2>Transforme o cenário em cadastro</h2>
            <p>Os sinais financeiros simulados já foram transferidos para o formulário.</p>
          </div>
          <button type="button" onClick={() => setCadastrando(false)}>
            ← Voltar ao resultado
          </button>
        </header>
        <div className={styles.formularioCadastroAssistido}>
          <ClienteForm modo="criar" valoresIniciais={valores} />
        </div>
      </MotionReveal>
    );
  }

  if (!mostrarFormulario && historico.length > 0) {
    return (
      <MotionReveal delay={1}>
        <SimuladorResultadoView
          historico={historico}
          onSimularOutro={() => setMostrarFormulario(true)}
          onCadastrar={() => setCadastrando(true)}
        />
      </MotionReveal>
    );
  }

  return (
    <MotionReveal as="form" onSubmit={aoSubmeter} className={styles.formulario} delay={1}>
      <header className={styles.cabecalhoFormulario}>
        <div>
          <span className={styles.indiceSimulador}>Configure a leitura</span>
          <h2>Monte um cenário</h2>
        </div>
      </header>
      <div className={styles.corpoFormulario}>
        <CasosReaisSimulador onEscolher={aoEscolherCasoReal} />
        <SimuladorCampos valores={valores} onChange={onChange} pesos={pesos} />
      </div>
      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}
      <footer className={styles.rodapeFormulario}>
        <span></span>
        <button type="submit" className={styles.botao} disabled={enviando}>
          <span>{enviando ? "Simulando..." : "Simular score"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </footer>
    </MotionReveal>
  );
}
