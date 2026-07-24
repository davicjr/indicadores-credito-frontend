"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DistribuicaoSegmento } from "@/lib/dados-api";
import { corDoSegmento, nomeSegmento, ordenarPorGravidadeSegmento } from "@/lib/segmentos";
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

interface DistribuicaoPorSegmentoProps {
  distribuicao: DistribuicaoSegmento[];
  // Opcionais: /modelo reaproveita este componente pra base histórica, só leitura, sem
  // filtro cruzado (essa interação existe só no /dashboard de clientes reais).
  filtroAtivo?: number | null;
  onSelecionar?: (segmento: number) => void;
  atualizando?: boolean;
}

interface ItemOrdenado extends DistribuicaoSegmento {
  // Só o nome de negócio, em toda parte — tooltip, legenda e a tabela acessível. O número do
  // cluster (0-3) é detalhe de implementação do algoritmo, não informação útil pra quem lê a
  // tela (achado real: "tira qualquer referência a numeração do segmento").
  nome: string;
}

function ConteudoTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ItemOrdenado }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <TooltipGrafico
      titulo={item.nome}
      linhas={[{ rotulo: "Clientes", valor: formatoInteiro.format(item.quantidade) }]}
      cor={corDoSegmento(item.segmento)}
    />
  );
}

export function DistribuicaoPorSegmento({
  distribuicao,
  filtroAtivo = null,
  onSelecionar,
  atualizando = false,
}: DistribuicaoPorSegmentoProps) {
  if (distribuicao.length === 0) {
    return (
      <section className={`${styles.cartao} ${styles.cartaoSegmento}`} aria-label="Distribuição por segmento">
        <h2 className={styles.titulo}>Distribuição por segmento</h2>
        <p className={styles.vazio}>Sem dados de segmento disponíveis.</p>
      </section>
    );
  }

  const ordenada = ordenarPorGravidadeSegmento(
    distribuicao.map((item) => ({ ...item, nome: nomeSegmento(item.segmento) }))
  );
  const total = ordenada.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <section
      className={`${styles.cartao} ${styles.cartaoSegmento} ${filtroAtivo !== null ? styles.cartaoSelecionado : ""}`}
      aria-label="Distribuição por segmento"
      aria-busy={atualizando}
    >
      <header className={styles.cabecalhoGrafico}>
        <div>
          <span className={styles.indiceGrafico}>Perfis · composição</span>
          <h2 className={styles.titulo}>Distribuição por segmento</h2>
        </div>
        <p className={styles.resumoGrafico}>
          <strong className="fonte-dados">{formatoInteiro.format(total)}</strong>
          <span>clientes</span>
        </p>
      </header>
      <table className="sr-only">
        <caption>Distribuição por segmento</caption>
        <thead>
          <tr>
            <th scope="col">Segmento</th>
            <th scope="col">Clientes</th>
          </tr>
        </thead>
        <tbody>
          {ordenada.map((item) => (
            <tr key={item.segmento}>
              <td>
                {onSelecionar ? (
                  <button
                    type="button"
                    aria-pressed={item.segmento === filtroAtivo}
                    onClick={() => onSelecionar(item.segmento)}
                  >
                    {item.nome}
                  </button>
                ) : (
                  item.nome
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
              dataKey="nome"
              width={172}
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
              onClick={(item) => onSelecionar?.((item.payload as DistribuicaoSegmento).segmento)}
            >
              {ordenada.map((item) => (
                <Cell
                  key={item.segmento}
                  fill={corDoSegmento(item.segmento)}
                  fillOpacity={filtroAtivo !== null && item.segmento !== filtroAtivo ? OPACIDADE_ESMAECIDA : 1}
                  stroke={item.segmento === filtroAtivo ? "var(--tinta)" : "transparent"}
                  strokeWidth={item.segmento === filtroAtivo ? 2 : 0}
                  className={item.segmento === filtroAtivo ? styles.barraSelecionada : undefined}
                />
              ))}
              <LabelList dataKey="quantidade" content={<RotuloDepoisDaBarra />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {!onSelecionar && (
        <p className={styles.instrucaoGrafico}>Perfis comportamentais da amostra.</p>
      )}
    </section>
  );
}
