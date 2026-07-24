"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { Cliente } from "@/lib/clientes-api";
import type { ContribuicaoFeature } from "@/lib/simulador-api";
import { MotionReveal } from "@/components/MotionReveal";
import { RegraDeScore } from "@/components/RegraDeScore";
import { ExplicabilidadeScore } from "@/components/ExplicabilidadeScore";
import { IconeAjuda } from "@/components/IconeAjuda";
import { TooltipGrafico } from "@/components/TooltipGrafico";
import { corDoSegmento, descricaoSegmento, nomeSegmento } from "@/lib/segmentos";
import { valoresPorFeature } from "@/lib/valores-features";
import { AtivarClienteButton } from "../AtivarClienteButton";
import { InativarClienteButton } from "../InativarClienteButton";
import { EditarClienteButton } from "./EditarClienteButton";
import styles from "../clientes.module.css";

interface DetalheClienteProps {
  cliente: Cliente;
  contribuicoes?: ContribuicaoFeature[];
}

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatoPercentual = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });
const formatoInteiro = new Intl.NumberFormat("pt-BR");

// Nenhum dado do cliente mostra o valor de cara — só o rótulo. É a tela completa de um cliente
// (pessoal + financeiro), visível na tela de um analista o dia todo; qualquer um passando atrás
// via tudo sem precisar disso pra trabalhar. Passar o mouse ou focar (Tab) revela o valor real
// num tooltip flutuante, mesma peça visual do hover dos gráficos do dashboard. O valor real
// fica no DOM o tempo todo (leitor de tela lê normalmente) — é proteção visual contra "olhar de
// relance", não controle de acesso.
function ItemDado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className={`${styles.itemDado} ${styles.itemSensivel}`} tabIndex={0}>
      <span className={styles.rotuloDado}>{rotulo}</span>
      <span className={styles.indicadorDado} aria-hidden="true">
        ver
      </span>
      <span className={styles.tooltipValor}>
        <TooltipGrafico linhas={[{ valor }]} />
      </span>
    </div>
  );
}

export function DetalheCliente({ cliente, contribuicoes }: DetalheClienteProps) {
  const { dadosFinanceiros } = cliente;
  const valoresExplicabilidade = valoresPorFeature({
    idade: cliente.idade,
    rendaMensal: dadosFinanceiros.rendaMensal,
    numeroDependentes: dadosFinanceiros.numeroDependentes,
    utilizacaoCreditoRotativo: dadosFinanceiros.utilizacaoCreditoRotativo,
    razaoDividaRenda: dadosFinanceiros.razaoDividaRenda,
    linhasCreditoAbertas: dadosFinanceiros.linhasCreditoAbertas,
    emprestimosImobiliarios: dadosFinanceiros.emprestimosImobiliarios,
    atrasos30a59Dias: dadosFinanceiros.atrasos30a59Dias,
    atrasos60a89Dias: dadosFinanceiros.atrasos60a89Dias,
    atrasos90DiasOuMais: dadosFinanceiros.atrasos90DiasOuMais,
  });

  return (
    <main className={`${styles.detalhe} ${styles.detalheNovo}`}>
      <MotionReveal as="header" className={styles.detalheCabecalho}>
        <div className={styles.detalheTitulo}>
          <Link className={styles.voltarClientes} href="/clientes">
            <span aria-hidden="true">←</span>
            Carteira de clientes
          </Link>
          <span className={styles.sobretituloDetalhe}>
            <span aria-hidden="true" />
            Cliente · visão individual
          </span>
          <div className={styles.detalheTituloLinha}>
            <h1>{cliente.nome}</h1>
            <span
              className={`${styles.status} ${styles.statusDetalhe} ${
                cliente.ativo ? "" : styles.statusInativo
              }`}
            >
              {cliente.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
        <div className={styles.acoes}>
          <EditarClienteButton cliente={cliente} />
          {cliente.ativo ? (
            <InativarClienteButton clienteId={cliente.id} className={styles.botaoPerigo} />
          ) : (
            <AtivarClienteButton clienteId={cliente.id} className={styles.botaoSecundario} />
          )}
        </div>
      </MotionReveal>

      <MotionReveal
        as="section"
        className={`${styles.cartao} ${styles.cartaoScore}`}
        aria-label="Resumo de crédito"
        delay={1}
        variant="fade"
      >
        <div className={styles.cabecalhoCartaoDetalhe}>
          <div>
            <span className={styles.indiceDetalhe}>01 · Risco atual</span>
            <div className={styles.tituloComAjuda}>
              <h2 className={styles.tituloCartao}>Resumo de crédito</h2>
              {contribuicoes && contribuicoes.length > 0 && (
                <IconeAjuda
                  id="score-fatores"
                  rotuloAcessivel="entender os fatores por trás deste score"
                  largo
                >
                  <ExplicabilidadeScore
                    contribuicoes={contribuicoes}
                    valores={valoresExplicabilidade}
                    contexto="cliente"
                  />
                </IconeAjuda>
              )}
            </div>
          </div>
        </div>
        <div className={styles.scoreConteudo}>
          <div className={styles.scorePrincipal}>
            <RegraDeScore score={cliente.score} faixa={cliente.faixa} />
          </div>
          {cliente.segmento !== null && (
            <aside
              className={styles.perfilRisco}
              style={
                {
                  "--cor-perfil": corDoSegmento(cliente.segmento),
                  borderLeftColor: corDoSegmento(cliente.segmento),
                } as CSSProperties
              }
            >
              <span className={styles.perfilRiscoRotulo}>Perfil de risco</span>
              <strong className={styles.perfilRiscoNome}>{nomeSegmento(cliente.segmento)}</strong>
              <p className={styles.perfilRiscoDescricao}>
                {descricaoSegmento(cliente.segmento)}
              </p>
            </aside>
          )}
        </div>
      </MotionReveal>

      <MotionReveal
        as="section"
        className={`${styles.cartao} ${styles.cartaoContato}`}
        aria-label="Contato"
        delay={2}
      >
        <div className={styles.cabecalhoCartaoDetalhe}>
          <div>
            <span className={styles.indiceDetalhe}>02 · Identificação</span>
            <h2 className={styles.tituloCartao}>Contato e identificação</h2>
          </div>
        </div>
        <div className={styles.listaDados}>
          <ItemDado rotulo="Documento" valor={cliente.documento} />
          <ItemDado rotulo="E-mail" valor={cliente.email} />
          <ItemDado rotulo="Telefone" valor={cliente.telefone} />
          <ItemDado rotulo="Idade" valor={`${cliente.idade} anos`} />
        </div>
      </MotionReveal>

      <MotionReveal
        as="section"
        className={`${styles.cartao} ${styles.cartaoFinanceiro}`}
        aria-label="Dados financeiros"
        delay={3}
      >
        <div className={styles.cabecalhoCartaoDetalhe}>
          <div>
            <span className={styles.indiceDetalhe}>03 · Sinais financeiros</span>
            <h2 className={styles.tituloCartao}>Dados financeiros</h2>
          </div>
        </div>

        <div className={styles.gruposFinanceiros}>
          <section className={styles.grupoDados} aria-label="Capacidade financeira">
            <h3 className={styles.tituloGrupoDados}>Capacidade financeira</h3>
            <div className={styles.grupoDadosLista}>
              <ItemDado
                rotulo="Dependentes"
                valor={
                  dadosFinanceiros.numeroDependentes !== null
                    ? formatoInteiro.format(dadosFinanceiros.numeroDependentes)
                    : "não informado"
                }
              />
              <ItemDado
                rotulo="Razão dívida/renda"
                valor={formatoPercentual.format(dadosFinanceiros.razaoDividaRenda)}
              />
              <ItemDado
                rotulo="Renda mensal"
                valor={
                  dadosFinanceiros.rendaMensal !== null
                    ? formatoMoeda.format(dadosFinanceiros.rendaMensal)
                    : "não informada"
                }
              />
            </div>
          </section>

          <section className={styles.grupoDados} aria-label="Histórico de atrasos">
            <h3 className={styles.tituloGrupoDados}>Histórico de atrasos</h3>
            <div className={styles.grupoDadosLista}>
              <ItemDado
                rotulo="Atrasos de 30 a 59 dias"
                valor={formatoInteiro.format(dadosFinanceiros.atrasos30a59Dias)}
              />
              <ItemDado
                rotulo="Atrasos de 60 a 89 dias"
                valor={formatoInteiro.format(dadosFinanceiros.atrasos60a89Dias)}
              />
              <ItemDado
                rotulo="Atrasos de 90 dias ou mais"
                valor={formatoInteiro.format(dadosFinanceiros.atrasos90DiasOuMais)}
              />
            </div>
          </section>

          <section className={styles.grupoDados} aria-label="Uso do crédito">
            <h3 className={styles.tituloGrupoDados}>Uso do crédito</h3>
            <div className={styles.grupoDadosLista}>
              <ItemDado
                rotulo="Empréstimos imobiliários"
                valor={formatoInteiro.format(dadosFinanceiros.emprestimosImobiliarios)}
              />
              <ItemDado
                rotulo="Linhas de crédito abertas"
                valor={formatoInteiro.format(dadosFinanceiros.linhasCreditoAbertas)}
              />
              <ItemDado
                rotulo="Utilização do crédito rotativo"
                valor={formatoPercentual.format(dadosFinanceiros.utilizacaoCreditoRotativo)}
              />
            </div>
          </section>
        </div>
      </MotionReveal>
    </main>
  );
}
