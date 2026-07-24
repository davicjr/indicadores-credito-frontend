import Link from "next/link";
import { MotionReveal, MotionStagger } from "@/components/MotionReveal";
import styles from "./home.module.css";

const ATALHOS = [
  {
    href: "/clientes",
    numero: "01",
    rotulo: "Clientes",
    titulo: "Encontre quem precisa de uma decisão",
    descricao: "Consulte scores, filtre a carteira e cadastre novos clientes em um só fluxo.",
    acao: "Acessar clientes",
    variante: "clientes",
    icone: "pessoas",
  },
  {
    href: "/simulador",
    numero: "02",
    rotulo: "Simulador",
    titulo: "Teste cenários antes de decidir",
    descricao: "Altere dados financeiros, compare resultados e entenda o impacto de cada variável.",
    acao: "Simular um score",
    variante: "simulador",
    icone: "ajustes",
  },
  {
    href: "/dashboard",
    numero: "03",
    rotulo: "Carteira",
    titulo: "Veja o risco ganhar contexto",
    descricao: "Explore distribuições, segmentos e indicadores da carteira em uma visão integrada.",
    acao: "Explorar dashboard",
    variante: "dashboard",
    icone: "grafico",
  },
] as const;

function IconeAcao({ tipo }: { tipo: (typeof ATALHOS)[number]["icone"] }) {
  if (tipo === "pessoas") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.4-3.1 2.2-5 5.5-5s5.1 1.9 5.5 5" />
        <path d="M15 6.5a3 3 0 0 1 0 5.8M16 14c2.7.2 4.1 1.8 4.5 4.5" />
      </svg>
    );
  }

  if (tipo === "ajustes") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h10M18 7h2M4 17h2M10 17h10M8 14v6M16 4v6" />
        <circle cx="16" cy="7" r="2" />
        <circle cx="8" cy="17" r="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      <path d="m4 7 6-4 6 7 5-5" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className={styles.pagina}>
      <MotionReveal as="header" className={styles.heroConteudo}>
        <h1>
          Decisões de crédito com <span className={styles.tituloDestaque}>contexto real.</span>
        </h1>

      </MotionReveal>

      <MotionReveal as="header" className={styles.cabecalhoAcoes} delay={1}>
        <span className={styles.indiceSecao}>Comece por aqui</span>
        <h2>O que você quer fazer?</h2>
      </MotionReveal>

      <MotionStagger className={styles.grade} delay={1}>
        {ATALHOS.map((atalho) => (
          <Link
            key={atalho.href}
            href={atalho.href}
            className={`${styles.atalho} ${styles[atalho.variante]}`}
          >
            <span className={styles.atalhoTopo}>
              <span className={styles.iconeAcao}>
                <IconeAcao tipo={atalho.icone} />
              </span>
              <span className={styles.atalhoNumero}>{atalho.numero}</span>
            </span>
            <span className={styles.atalhoRotulo}>{atalho.rotulo}</span>
            <span className={styles.atalhoTitulo}>{atalho.titulo}</span>
            <span className={styles.atalhoDescricao}>{atalho.descricao}</span>
            <span className={styles.atalhoAcao}>
              {atalho.acao}
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </MotionStagger>
    </main>
  );
}
