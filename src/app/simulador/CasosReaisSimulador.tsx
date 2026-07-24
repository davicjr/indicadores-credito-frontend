import type { KeyboardEvent } from "react";
import { IconeAjuda } from "@/components/IconeAjuda";
import { CASOS_REAIS_SIMULADOR, type CasoRealSimulador } from "@/lib/casos-reais-simulador";
import styles from "./simulador.module.css";

interface CasosReaisSimuladorProps {
  onEscolher: (caso: CasoRealSimulador) => void;
}

// Card = div com role="button", não um <button> — o ícone "i" (que É um <button>, ver
// IconeAjuda) precisa ficar dentro dele, e <button> dentro de <button> é HTML inválido. Clicar
// em qualquer ponto do card (inclusive no ícone, que não tem onClick próprio) escolhe o caso;
// o ícone serve só pra hover/foco revelar a história, sem crescer o card com texto sempre visível.
function CasoReal({ caso, onEscolher }: { caso: CasoRealSimulador; onEscolher: (caso: CasoRealSimulador) => void }) {
  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      onEscolher(caso);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={caso.nome}
      className={styles.casoReal}
      style={{ borderLeftColor: caso.cor }}
      onClick={() => onEscolher(caso)}
      onKeyDown={aoTeclar}
    >
      <span className={styles.casoRealConteudo}>
        <span className={styles.casoRealNome}>{caso.nome}</span>
        <span className={styles.casoRealAcao} aria-hidden="true">
          Aplicar perfil
        </span>
      </span>
      <IconeAjuda
        id={`caso-${caso.segmento}-historia`}
        texto={caso.historia}
        rotuloAcessivel={`sobre o perfil ${caso.nome}`}
      />
    </div>
  );
}

export function CasosReaisSimulador({ onEscolher }: CasosReaisSimuladorProps) {
  return (
    <div className={styles.casosReais}>
      <div className={styles.casosReaisCabecalho}>
        <span className={styles.indiceSimulador}>Referências</span>
        <p className={styles.casosReaisTitulo}>Comece de um perfil</p>
        <p className={styles.casosReaisLegenda}>
          Seis tipos para preencher o cenário e ajustar à vontade.
        </p>
      </div>
      <div className={styles.casosReaisGrade}>
        {CASOS_REAIS_SIMULADOR.map((caso) => (
          <CasoReal key={caso.segmento} caso={caso} onEscolher={onEscolher} />
        ))}
      </div>
    </div>
  );
}
