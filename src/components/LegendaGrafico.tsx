import styles from "./LegendaGrafico.module.css";

interface ItemLegenda {
  cor: string;
  rotulo: string;
  // Só pros buckets ordinais de DistribuicaoMetricaClientes — a mesma opacidade aplicada na
  // barra (rampa de uma cor só), pra marca da legenda bater exatamente com o tom da barra.
  opacidade?: number;
  selecionado?: boolean;
  onSelecionar?: () => void;
}

interface LegendaGraficoProps {
  itens: ItemLegenda[];
  // Empilhado (swatch em cima, rótulo embaixo) — só faz sentido pro intervalo numérico dos
  // buckets de métrica ("22 – 33"), onde o texto é mais largo que o nome de uma faixa/segmento;
  // ao lado, o intervalo brigava de largura com o próximo item da legenda (achado real: "o
  // intervalo poe embaixo do quadrado da cor"). Faixa/segmento continuam lado a lado (default).
  empilhado?: boolean;
}

// Faixa visual compartilhada pelos gráficos: separa a chave de cores da área de plotagem e
// mantém o mesmo tratamento de espaçamento em todos os cards.
export function LegendaGrafico({ itens, empilhado = false }: LegendaGraficoProps) {
  const interativa = itens.some((item) => item.onSelecionar !== undefined);

  return (
    <div className={styles.blocoLegenda} aria-hidden={interativa ? undefined : true}>
      <span className={styles.tituloLegenda}>Legenda</span>
      <ul className={styles.legenda}>
        {itens.map((item, indice) => {
          const conteudo = (
            <>
              <span className={styles.marca} style={{ background: item.cor, opacity: item.opacidade }} />
              {item.rotulo}
            </>
          );
          const classeItem = empilhado ? styles.itemEmpilhado : styles.item;

          return (
            <li key={indice} className={styles.entrada}>
              {item.onSelecionar ? (
                <button
                  type="button"
                  className={`${classeItem} ${styles.botaoLegenda} ${item.selecionado ? styles.botaoLegendaAtivo : ""}`}
                  aria-label={`Filtrar pela legenda: ${item.rotulo}`}
                  aria-pressed={item.selecionado ?? false}
                  onClick={item.onSelecionar}
                >
                  {conteudo}
                </button>
              ) : (
                <span className={classeItem}>{conteudo}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
