"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DistribuicaoFaixa } from "@/lib/dados-api";
import { corDaFaixa, ordenarPorGravidadeFaixa } from "@/lib/faixas";
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
import { TooltipGrafico } from "@/components/TooltipGrafico";
import styles from "./dashboard.module.css";

const formatoInteiro = new Intl.NumberFormat("pt-BR");

interface DistribuicaoPorFaixaProps {
  distribuicao: DistribuicaoFaixa[];
  // Opcionais: /modelo reaproveita este componente pra base histórica, só leitura, sem
  // filtro cruzado (essa interação existe só no /dashboard de clientes reais).
  filtroAtivo?: string | null;
  onSelecionar?: (faixa: string) => void;
  atualizando?: boolean;
}

function ConteudoTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DistribuicaoFaixa }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <TooltipGrafico
      titulo={item.faixa}
      linhas={[{ rotulo: "Clientes", valor: formatoInteiro.format(item.quantidade) }]}
      cor={corDaFaixa(item.faixa)}
    />
  );
}

export function DistribuicaoPorFaixa({
  distribuicao,
  filtroAtivo = null,
  onSelecionar,
  atualizando = false,
}: DistribuicaoPorFaixaProps) {
  if (distribuicao.length === 0) {
    return (
      <section className={`${styles.cartao} ${styles.cartaoFaixa}`} aria-label="Distribuição por faixa de score">
        <h2 className={styles.titulo}>Distribuição por faixa de score</h2>
        <p className={styles.vazio}>Sem dados de faixa disponíveis.</p>
      </section>
    );
  }

  const ordenada = ordenarPorGravidadeFaixa(distribuicao);
  const total = ordenada.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <section
      className={`${styles.cartao} ${styles.cartaoFaixa} ${filtroAtivo ? styles.cartaoSelecionado : ""}`}
      aria-label="Distribuição por faixa de score"
      aria-busy={atualizando}
    >
      <header className={styles.cabecalhoGrafico}>
        <div>
          <span className={styles.indiceGrafico}>Score · composição</span>
          <h2 className={styles.titulo}>Distribuição por faixa de score</h2>
        </div>
        <p className={styles.resumoGrafico}>
          <strong className="fonte-dados">{formatoInteiro.format(total)}</strong>
          <span>clientes</span>
        </p>
      </header>
      <table className="sr-only">
        <caption>Distribuição por faixa de score</caption>
        <thead>
          <tr>
            <th scope="col">Faixa</th>
            <th scope="col">Clientes</th>
          </tr>
        </thead>
        <tbody>
          {ordenada.map((item) => (
            <tr key={item.faixa}>
              <td>
                {onSelecionar ? (
                  <button
                    type="button"
                    aria-pressed={item.faixa === filtroAtivo}
                    onClick={() => onSelecionar(item.faixa)}
                  >
                    {item.faixa}
                  </button>
                ) : (
                  item.faixa
                )}
              </td>
              <td>{item.quantidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className={`${styles.areaGrafico} ${onSelecionar ? styles.graficoClicavel : ""} ${
          atualizando ? styles.areaGraficoAtualizando : ""
        }`}
      >
        <ResponsiveContainer width="100%" height={alturaGraficoHorizontal(ordenada.length)} aria-hidden="true">
          <BarChart data={ordenada} layout="vertical" margin={{ top: 8, right: 58, bottom: 8, left: 0 }}>
            <XAxis type="number" domain={[0, dominioComFolga]} tick={false} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="faixa"
              width={88}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--tinta)", fontSize: 12, fontWeight: 600 }}
              tickMargin={10}
              interval={0}
            />
            <Tooltip
              cursor={CURSOR_HOVER}
              content={<ConteudoTooltip />}
              allowEscapeViewBox={{ x: false, y: true }}
            />
            <Bar
              dataKey="quantidade"
              barSize={ESPESSURA_BARRA}
              shape={BarraComPiso}
              background={FUNDO_BARRA}
              isAnimationActive={false}
              cursor={onSelecionar ? "pointer" : "default"}
              onClick={(item) => onSelecionar?.((item.payload as DistribuicaoFaixa).faixa)}
            >
              {ordenada.map((item) => (
                <Cell
                  key={item.faixa}
                  fill={corDaFaixa(item.faixa)}
                  fillOpacity={filtroAtivo && item.faixa !== filtroAtivo ? OPACIDADE_ESMAECIDA : 1}
                  stroke={item.faixa === filtroAtivo ? "var(--tinta)" : "transparent"}
                  strokeWidth={item.faixa === filtroAtivo ? 2 : 0}
                  className={item.faixa === filtroAtivo ? styles.barraSelecionada : undefined}
                />
              ))}
              <LabelList dataKey="quantidade" content={<RotuloDepoisDaBarra />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {!onSelecionar && (
        <p className={styles.instrucaoGrafico}>Valores absolutos da base histórica.</p>
      )}
    </section>
  );
}
