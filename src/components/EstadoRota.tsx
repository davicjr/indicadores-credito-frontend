import styles from "./EstadoRota.module.css";

interface EstadoRotaProps {
  tipo: "carregando" | "erro";
  indice: string;
  titulo: string;
  descricao: string;
  onTentarNovamente?: () => void;
}

export function EstadoRota({
  tipo,
  indice,
  titulo,
  descricao,
  onTentarNovamente,
}: EstadoRotaProps) {
  const carregando = tipo === "carregando";

  return (
    <main className={styles.pagina} aria-busy={carregando || undefined}>
      <section
        className={`${styles.estado} ${carregando ? styles.carregando : styles.erro}`}
        role={carregando ? "status" : "alert"}
        aria-live={carregando ? "polite" : "assertive"}
      >
        <span className={`${styles.indice} fonte-dados`}>{indice}</span>

        <div className={styles.marca} aria-hidden="true">
          {carregando ? (
            <span className={styles.barras}>
              <span />
              <span />
              <span />
            </span>
          ) : (
            <span className={styles.sinalErro}>!</span>
          )}
        </div>

        <div className={styles.conteudo}>
          <h1>{titulo}</h1>
          <p>{descricao}</p>

          {carregando ? (
            <div className={styles.linhas} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          ) : (
            onTentarNovamente && (
              <button type="button" className={styles.acao} onClick={onTentarNovamente}>
                <span>Tentar de novo</span>
                <span aria-hidden="true">↻</span>
              </button>
            )
          )}
        </div>
      </section>
    </main>
  );
}
