import { getImportanciaFeatures } from "@/lib/dados-api";
import { MotionReveal } from "@/components/MotionReveal";
import { SimuladorForm } from "./SimuladorForm";
import styles from "./simulador.module.css";

export default async function SimuladorPage() {
  // Só enriquece a ajuda de cada campo com o peso real do modelo — se -dados estiver fora do
  // ar ou o modelo "logistic" não tiver sido treinado ainda, o simulador continua funcionando
  // sem o ranking (rotuloImportancia trata lista vazia), só perde esse complemento.
  const pesos = await getImportanciaFeatures().catch(() => []);

  return (
    <main className={`${styles.pagina} ${styles.paginaSimulador}`}>
      <MotionReveal as="header" className={styles.aberturaSimulador}>
        <div className={styles.aberturaConteudo}>
          <span className={styles.sobretituloSimulador}>
            <span aria-hidden="true" />
            Laboratório · cenários de crédito
          </span>
          <h1>Simulador de score</h1>
          <p>
          </p>
        </div>
        <aside className={styles.avisoSimulacao} aria-label="Contexto da simulação">
          <span className={styles.avisoRotulo}>Ambiente de análise</span>
          <strong>Cenário livre</strong>
          <p>Nenhum cadastro é alterado durante a simulação.</p>
        </aside>
      </MotionReveal>
      <SimuladorForm pesos={pesos} />
    </main>
  );
}
