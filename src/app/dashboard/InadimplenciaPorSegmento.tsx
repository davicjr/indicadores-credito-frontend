"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { InadimplenciaSegmento } from "@/lib/dados-api";
import { corDoSegmento, nomeSegmento } from "@/lib/segmentos";
import { ordenarAlfabeticamente } from "@/lib/ordenacao";
import {
  alturaGraficoHorizontal,
  BarraComPiso,
  CURSOR_HOVER,
  ESPESSURA_BARRA,
  FUNDO_BARRA,
} from "@/lib/graficos";
import { TooltipGrafico } from "@/components/TooltipGrafico";
import styles from "./dashboard.module.css";

interface InadimplenciaPorSegmentoProps {
  segmentos: InadimplenciaSegmento[];
}

const formatoPercentual = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

interface ItemOrdenado extends InadimplenciaSegmento {
  rotulo: string;
  taxaFormatada: string;
}

function ConteudoTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ItemOrdenado }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <TooltipGrafico
      titulo={item.rotulo}
      linhas={[{ rotulo: "Taxa de inadimplência", valor: item.taxaFormatada }]}
      cor={corDoSegmento(item.segmento)}
    />
  );
}

export function InadimplenciaPorSegmento({ segmentos }: InadimplenciaPorSegmentoProps) {
  if (segmentos.length === 0) {
    return (
      <section className={styles.cartao} aria-label="Inadimplência por segmento">
        <h2 className={styles.titulo}>Inadimplência por segmento</h2>
        <p className={styles.vazio}>Sem dados de inadimplência disponíveis.</p>
      </section>
    );
  }

  const ordenados = ordenarAlfabeticamente(
    segmentos.map((item) => ({
      ...item,
      rotulo: nomeSegmento(item.segmento),
      taxaFormatada: formatoPercentual.format(item.taxaInadimplencia),
    })),
    (item) => item.rotulo
  );

  return (
    <section className={styles.cartao} aria-label="Inadimplência por segmento">
      <header className={styles.cabecalhoGrafico}>
        <div>
          <span className={styles.indiceGrafico}>Risco · incidência</span>
          <h2 className={styles.titulo}>Inadimplência por segmento</h2>
        </div>
        <p className={styles.resumoGrafico}>
          <strong className="fonte-dados">{ordenados.length}</strong>
          <span>perfis</span>
        </p>
      </header>
      {/* "Clientes" fica só em Distribuição por segmento — mostrar de novo aqui duplicava a
          mesma contagem em 2 cards (achado real do usuário navegando a aplicação). */}
      <table className="sr-only">
        <caption>Taxa de inadimplência por segmento</caption>
        <thead>
          <tr>
            <th scope="col">Segmento</th>
            <th scope="col">Taxa de inadimplência</th>
          </tr>
        </thead>
        <tbody>
          {ordenados.map((item) => (
            <tr key={item.segmento}>
              <td>{item.rotulo}</td>
              <td>{item.taxaFormatada}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.areaGrafico}>
        <ResponsiveContainer width="100%" height={alturaGraficoHorizontal(ordenados.length)} aria-hidden="true">
          <BarChart data={ordenados} layout="vertical" margin={{ top: 8, right: 58, bottom: 8, left: 0 }}>
            <XAxis type="number" domain={[0, 1]} tick={false} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="rotulo"
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
              dataKey="taxaInadimplencia"
              barSize={ESPESSURA_BARRA}
              shape={BarraComPiso}
              background={FUNDO_BARRA}
              isAnimationActive={false}
            >
              {ordenados.map((item) => (
                <Cell key={item.segmento} fill={corDoSegmento(item.segmento)} />
              ))}
              <LabelList dataKey="taxaFormatada" position="right" fill="var(--tinta)" fontSize={12} fontWeight={500} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className={styles.instrucaoGrafico}>Escala comum de 0% a 100%; o valor exato aparece ao lado.</p>
    </section>
  );
}
