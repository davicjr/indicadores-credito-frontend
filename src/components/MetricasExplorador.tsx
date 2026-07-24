"use client";

import { useState } from "react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DistribuicaoMetrica, FaixaMetrica } from "@/lib/dados-api";
import {
  alturaGraficoHorizontal,
  BarraComPiso,
  CURSOR_HOVER,
  ESPESSURA_BARRA,
  FUNDO_BARRA,
  RotuloDepoisDaBarra,
} from "@/lib/graficos";
import { nomeAmigavelFeature } from "@/lib/nomes-features";
import { ordenarAlfabeticamente } from "@/lib/ordenacao";
import { TooltipGrafico } from "@/components/TooltipGrafico";
import dashboardStyles from "@/app/dashboard/dashboard.module.css";
import styles from "./MetricasExplorador.module.css";

interface MetricasExploradorProps {
  metricas: string[];
  metricaInicial: string;
  distribuicaoInicial: DistribuicaoMetrica;
  titulo: string;
}

const formatoPercentual = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const formatoNumero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const formatoInteiro = new Intl.NumberFormat("pt-BR");

// pandas qcut abre a primeira faixa um pouco abaixo do mínimo real (ex.: -0.001) pra incluir o
// próprio mínimo — arredondado pra 2 casas isso virava "-0" na tela (achado real de screenshot).
function semZeroNegativo(valor: number): number {
  const arredondado = Math.round(valor * 100) / 100;
  return arredondado === 0 ? 0 : arredondado;
}

function rotuloFaixa(min: number, max: number): string {
  return `${formatoNumero.format(semZeroNegativo(min))} – ${formatoNumero.format(semZeroNegativo(max))}`;
}

interface FaixaFormatada extends FaixaMetrica {
  rotulo: string;
  taxaFormatada: string;
  cor: string;
}

function ConteudoTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: FaixaFormatada }> }) {
  if (!active || !payload?.length) return null;
  const faixa = payload[0].payload;
  return (
    <TooltipGrafico
      titulo={faixa.rotulo}
      cor={faixa.cor}
      linhas={[
        { rotulo: "Inadimplência", valor: faixa.taxaFormatada },
        { rotulo: "Clientes", valor: formatoInteiro.format(faixa.quantidade) },
      ]}
    />
  );
}

export function MetricasExplorador({
  metricas,
  metricaInicial,
  distribuicaoInicial,
  titulo,
}: MetricasExploradorProps) {
  const [metricaSelecionada, setMetricaSelecionada] = useState(metricaInicial);
  const [distribuicao, setDistribuicao] = useState(distribuicaoInicial);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function selecionar(metrica: string) {
    if (metrica === metricaSelecionada) {
      return;
    }
    setMetricaSelecionada(metrica);
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/metricas/distribuicao/${metrica}`);
      if (!resposta.ok) {
        setErro("Não foi possível carregar essa métrica. Tente novamente.");
        return;
      }
      setDistribuicao(await resposta.json());
    } finally {
      setCarregando(false);
    }
  }

  const faixas: FaixaFormatada[] = distribuicao.faixas.map((faixa) => ({
    ...faixa,
    rotulo: rotuloFaixa(faixa.min, faixa.max),
    taxaFormatada: formatoPercentual.format(faixa.taxaInadimplencia),
    cor: "var(--critico)",
  }));

  const metricasOrdenadas = ordenarAlfabeticamente(metricas, nomeAmigavelFeature);

  return (
    <>
      <div className={dashboardStyles.cabecalhoCartao}>
        <h2 className={dashboardStyles.titulo}>{titulo}</h2>
        <div className={dashboardStyles.campoMetrica}>
          <label htmlFor="metrica-historica">Métrica</label>
          <select
            id="metrica-historica"
            value={metricaSelecionada}
            onChange={(evento) => selecionar(evento.target.value)}
          >
            {metricasOrdenadas.map((metrica) => (
              <option key={metrica} value={metrica}>
                {nomeAmigavelFeature(metrica)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}
      {carregando ? (
        <p className={styles.vazio}>Carregando...</p>
      ) : faixas.length === 0 ? (
        <p className={styles.vazio}>Sem dados para essa métrica.</p>
      ) : (
        <>
          <table className="sr-only">
            <caption>Taxa de inadimplência por faixa de {nomeAmigavelFeature(metricaSelecionada)}</caption>
            <thead>
              <tr>
                <th scope="col">Faixa</th>
                <th scope="col">Clientes</th>
                <th scope="col">Taxa de inadimplência</th>
              </tr>
            </thead>
            <tbody>
              {faixas.map((faixa, indice) => (
                <tr key={indice}>
                  <td>{faixa.rotulo}</td>
                  <td>{formatoInteiro.format(faixa.quantidade)}</td>
                  <td>{faixa.taxaFormatada}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {faixas.length === 1 && (
            <p className={styles.vazio}>
              Essa métrica está concentrada numa única faixa em toda a carteira — não há variação
              suficiente pra abrir mais de um grupo.
            </p>
          )}
          <div className={dashboardStyles.areaGrafico}>
            <ResponsiveContainer width="100%" height={alturaGraficoHorizontal(faixas.length)} aria-hidden="true">
              <BarChart data={faixas} layout="vertical" margin={{ top: 8, right: 58, left: 0, bottom: 8 }}>
                <XAxis type="number" domain={[0, 1]} tick={false} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="rotulo"
                  width={112}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--tinta)", fontSize: 12, fontWeight: 600 }}
                  tickMargin={10}
                  interval={0}
                />
                <Tooltip
                  content={<ConteudoTooltip />}
                  cursor={CURSOR_HOVER}
                  allowEscapeViewBox={{ x: false, y: true }}
                />
                <Bar
                  dataKey="taxaInadimplencia"
                  barSize={ESPESSURA_BARRA}
                  shape={BarraComPiso}
                  background={FUNDO_BARRA}
                  isAnimationActive={false}
                >
                  {faixas.map((faixa, indice) => (
                    <Cell key={indice} fill={faixa.cor} />
                  ))}
                  <LabelList dataKey="taxaFormatada" content={<RotuloDepoisDaBarra />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className={styles.escala}>Escala comum de 0% a 100%; cada linha representa uma faixa da variável.</p>
        </>
      )}
    </>
  );
}
