import { RegraDeScore } from "@/components/RegraDeScore";
import { faixaDoScore } from "@/lib/faixas";
import styles from "./dashboard.module.css";

interface ResumoCarteiraProps {
  totalClientes: number;
  scoreMedio: number | null;
  rotuloTotal?: string;
  legenda?: string;
  ariaLabel?: string;
}

const formatoInteiro = new Intl.NumberFormat("pt-BR");

export function ResumoCarteira({
  totalClientes,
  scoreMedio,
  rotuloTotal = "Registros analisados",
  legenda = "Base histórica usada pelo modelo, não é o cadastro de clientes",
  ariaLabel = "Indicadores da carteira",
}: ResumoCarteiraProps) {
  const scoreArredondado = scoreMedio === null ? null : Math.round(scoreMedio);
  const faixa = scoreArredondado === null ? null : faixaDoScore(scoreArredondado);
  const totalFormatado = formatoInteiro.format(totalClientes);
  const valorTotalLongo = totalFormatado.length >= 6;

  return (
    <section className={styles.resumo} aria-label={ariaLabel}>
      <article
        className={`${styles.resumoCartao} ${styles.resumoCartaoClientes} ${styles.resumoItem} ${styles.resumoClientes}`}
        aria-label={rotuloTotal}
      >
        <span className={styles.resumoRotulo}>{rotuloTotal}</span>
        {/* key força o React a remontar quando o valor muda (filtro do dashboard) — é o que
            faz a animação de entrada (dashboard.module.css) disparar de novo a cada troca. */}
        <span
          key={totalClientes}
          className={`${styles.resumoValorClientes} ${valorTotalLongo ? styles.resumoValorClientesLongo : ""} ${styles.resumoValorAnimado} fonte-dados`}
        >
          {totalFormatado}
        </span>
        {/* "Clientes" confundia com o cadastro real de -clientes (achado real do usuário —
            dashboard mostrava 149.390 aqui e só 2 na tela /clientes, sem explicação). */}
        {legenda && <span className={styles.resumoLegenda}>{legenda}</span>}
      </article>
      <article
        className={`${styles.resumoCartao} ${styles.resumoCartaoScore} ${styles.resumoItem} ${styles.resumoRegua}`}
        aria-label="Score médio"
      >
        <span className={styles.resumoRotulo}>Score médio</span>
        <RegraDeScore score={scoreArredondado} faixa={faixa} />
      </article>
    </section>
  );
}
