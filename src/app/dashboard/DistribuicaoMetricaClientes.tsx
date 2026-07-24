"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DistribuicaoMetricaCliente, FaixaMetricaCliente } from "@/lib/clientes-api";
import {
  alturaGraficoHorizontal,
  BarraComPiso,
  CURSOR_HOVER,
  dominioComFolga,
  ESPESSURA_BARRA,
  FUNDO_BARRA,
  OPACIDADE_ESMAECIDA,
  RotuloDepoisDaBarra,
} from "@/lib/graficos";
import type { FiltroCarteira } from "@/lib/filtro-carteira";
import { nomeAmigavelMetricaCliente, rotuloFaixaMetricaCliente } from "@/lib/metricas-clientes";
import { ordenarAlfabeticamente } from "@/lib/ordenacao";
import { TooltipGrafico } from "@/components/TooltipGrafico";
import styles from "./dashboard.module.css";

// Métrica discreta com poucos valores distintos (atrasos, dependentes...) faz o qcut do lado de
// -dados devolver bucket de largura zero — min e max iguais, tipo "0 – 0". É bucket de verdade,
// não bug de dado, mas mostrar como intervalo é redundante/estranho (achado real: "esses
// intervalos não estão estranhos, tipo 0 a 0?") — mostrar só o número único quando não há
// intervalo de fato pra mostrar.
function rotuloFaixa(min: number, max: number): string {
  return rotuloFaixaMetricaCliente(min, max);
}

interface FaixaFormatada {
  min: number;
  max: number;
  quantidade: number;
  rotulo: string;
  cor: string;
  opacidade: number;
}

function ConteudoTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: FaixaFormatada }> }) {
  if (!active || !payload?.length) return null;
  const faixa = payload[0].payload;
  return (
    <TooltipGrafico
      titulo={faixa.rotulo}
      linhas={[{ rotulo: "Clientes", valor: String(faixa.quantidade) }]}
      cor={faixa.cor}
    />
  );
}

interface DistribuicaoMetricaClientesProps {
  metricas: readonly string[];
  metricaSelecionada: string;
  distribuicao: DistribuicaoMetricaCliente;
  carregando: boolean;
  erro: string | null;
  filtroAtivo: Extract<FiltroCarteira, { tipo: "metrica" }> | null;
  quantidadeSelecionada?: number;
  onSelecionarMetrica: (metrica: string) => void;
  onSelecionarFaixa: (faixa: FaixaMetricaCliente) => void;
}

// Componente puro — não busca dado próprio. O DashboardView (orquestrador) é dono do fetch,
// porque a mesma distribuição também precisa reagir ao filtro cruzado (faixa/segmento/métrica) setado
// por OUTROS cards, não só à troca de métrica local. Ter dois fetches independentes (um aqui,
// outro no orquestrador) pra reagir ao mesmo estado teria criado corrida/duplicidade.
export function DistribuicaoMetricaClientes({
  metricas,
  metricaSelecionada,
  distribuicao,
  carregando,
  erro,
  filtroAtivo,
  quantidadeSelecionada,
  onSelecionarMetrica,
  onSelecionarFaixa,
}: DistribuicaoMetricaClientesProps) {
  const metricasOrdenadas = ordenarAlfabeticamente(metricas, nomeAmigavelMetricaCliente);
  const todasAsFaixas: FaixaFormatada[] = distribuicao.faixas.map((faixa) => ({
    ...faixa,
    rotulo: rotuloFaixa(faixa.min, faixa.max),
    cor: "var(--serie-4)",
    opacidade: 1,
  }));
  const filtroDaMetricaAtual = filtroAtivo?.metrica === metricaSelecionada ? filtroAtivo : null;
  const faixaOriginalSelecionada = filtroDaMetricaAtual
    ? todasAsFaixas.find(
        (faixa) => faixa.min === filtroDaMetricaAtual.min && faixa.max === filtroDaMetricaAtual.max
      )
    : null;
  // A distribuição pode ser recalculada entre o clique e a resposta (ou depois de um
  // restart), mudando os limites dos buckets. A seleção continua sendo o intervalo da URL:
  // reconstrói a única barra selecionada com o total filtrado em vez de fazê-la desaparecer
  // quando não há mais um bucket com limites exatamente iguais na nova distribuição.
  const faixas: FaixaFormatada[] = filtroDaMetricaAtual && !carregando
    ? [
        {
          min: filtroDaMetricaAtual.min,
          max: filtroDaMetricaAtual.max,
          quantidade: quantidadeSelecionada ?? faixaOriginalSelecionada?.quantidade ?? 0,
          rotulo: rotuloFaixa(filtroDaMetricaAtual.min, filtroDaMetricaAtual.max),
          cor: faixaOriginalSelecionada?.cor ?? "var(--serie-4)",
          opacidade: faixaOriginalSelecionada?.opacidade ?? 1,
        },
      ]
    : todasAsFaixas;
  const total = faixas.reduce((soma, faixa) => soma + faixa.quantidade, 0);

  return (
    <section
      className={`${styles.cartao} ${styles.cartaoMetrica} ${filtroDaMetricaAtual ? styles.cartaoSelecionado : ""}`}
      aria-label="Distribuição dos clientes por métrica"
      aria-busy={carregando}
    >
      <div className={styles.cabecalhoCartao}>
        <div>
          <span className={styles.indiceGrafico}>Variável · distribuição</span>
          <h2 className={styles.titulo}>Métricas dos clientes</h2>

        </div>
        <div className={styles.campoMetrica}>
          <label htmlFor="metrica-selecionada">Métrica</label>
          <select
            id="metrica-selecionada"
            value={metricaSelecionada}
            onChange={(evento) => onSelecionarMetrica(evento.target.value)}
          >
            {metricasOrdenadas.map((metrica) => (
              <option key={metrica} value={metrica}>
                {nomeAmigavelMetricaCliente(metrica)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {erro && (
        <p className={styles.vazio} role="alert">
          {erro}
        </p>
      )}
      {faixas.length === 0 ? (
        <p className={styles.vazio}>Sem clientes suficientes pra mostrar essa métrica ainda.</p>
      ) : (
        <>
          <table className="sr-only">
            <caption>
              Distribuição de {nomeAmigavelMetricaCliente(metricaSelecionada)} entre os clientes ativos
            </caption>
            <thead>
              <tr>
                <th scope="col">Faixa</th>
                <th scope="col">Clientes</th>
              </tr>
            </thead>
            <tbody>
              {faixas.map((faixa, indice) => (
                <tr key={indice}>
                  <td>
                    <button
                      type="button"
                      aria-pressed={
                        filtroDaMetricaAtual?.min === faixa.min && filtroDaMetricaAtual.max === faixa.max
                      }
                      onClick={() => onSelecionarFaixa(faixa)}
                    >
                      {faixa.rotulo}
                    </button>
                  </td>
                  <td>{faixa.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            className={`${styles.areaGrafico} ${styles.graficoClicavel} ${
              carregando ? styles.areaGraficoAtualizando : ""
            }`}
          >
            {carregando && (
              <span className={styles.indicadorAtualizando} aria-live="polite">
                Atualizando…
              </span>
            )}
            <ResponsiveContainer width="100%" height={alturaGraficoHorizontal(faixas.length)} aria-hidden="true">
              <BarChart data={faixas} layout="vertical" margin={{ top: 8, right: 58, left: 0, bottom: 8 }}>
                <XAxis type="number" domain={[0, dominioComFolga]} tick={false} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="rotulo"
                  width={108}
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
                  dataKey="quantidade"
                  barSize={ESPESSURA_BARRA}
                  shape={BarraComPiso}
                  background={FUNDO_BARRA}
                  isAnimationActive={false}
                  cursor="pointer"
                  onClick={(item) => onSelecionarFaixa(item.payload as FaixaFormatada)}
                >
                  {faixas.map((faixa, indice) => {
                    const selecionada =
                      filtroDaMetricaAtual?.min === faixa.min &&
                      filtroDaMetricaAtual.max === faixa.max;
                    return (
                      <Cell
                        key={indice}
                        fill={faixa.cor}
                        fillOpacity={
                          filtroDaMetricaAtual && !selecionada
                            ? faixa.opacidade * OPACIDADE_ESMAECIDA
                            : faixa.opacidade
                        }
                        stroke={selecionada ? "var(--tinta)" : "transparent"}
                        strokeWidth={selecionada ? 2 : 0}
                        className={selecionada ? styles.barraSelecionada : undefined}
                      />
                    );
                  })}
                  <LabelList dataKey="quantidade" content={<RotuloDepoisDaBarra />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}
