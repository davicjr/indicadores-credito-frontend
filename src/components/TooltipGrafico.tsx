import styles from "./TooltipGrafico.module.css";

interface LinhaTooltip {
  // Sem rótulo, a linha mostra só o valor.
  rotulo?: string;
  valor: string;
}

interface TooltipGraficoProps {
  titulo?: string;
  linhas: LinhaTooltip[];
  // Cor da barra sob o mouse — mesmo padrão de style inline já usado em CasoReal
  // (CasosReaisSimulador.tsx). Sem isso a borda ficava sempre --acento, mesmo passando o mouse
  // numa barra vermelha (achado real: "no hover, a borda tem que ser da cor do item").
  cor?: string;
}

// Substitui a caixa branca padrão do Recharts (sombra, borda genérica, número sem separador de
// milhar) — destoava do resto do app e, sobrepondo outras barras do gráfico ao aparecer, foi
// confundido com "dado errado" (achado real: os números sempre estiveram certos, só a caixa
// que não tinha nada a ver com o resto da tela). Usado nos 4 gráficos de barra do dashboard.
export function TooltipGrafico({ titulo, linhas, cor }: TooltipGraficoProps) {
  return (
    <div className={styles.tooltip} style={cor ? { borderLeftColor: cor } : undefined}>
      {titulo && <p className={styles.titulo}>{titulo}</p>}
      {linhas.map((linha, indice) => (
        <p key={linha.rotulo ?? indice} className={styles.linha}>
          {linha.rotulo && <span className={styles.rotulo}>{linha.rotulo}</span>}
          <span className={styles.valor}>{linha.valor}</span>
        </p>
      ))}
    </div>
  );
}
