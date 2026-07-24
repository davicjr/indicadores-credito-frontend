import { redirect } from "next/navigation";
import { MotionReveal, MotionStagger } from "@/components/MotionReveal";
import { getUsuarioAtual } from "@/lib/usuario-api";
import { TrocarSenhaForm } from "./TrocarSenhaForm";
import styles from "./perfil.module.css";

const ROTULO_PAPEL = { ANALISTA: "Analista", ADMIN: "Admin" };

export default async function PerfilPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) {
    redirect("/login");
  }

  return (
    <main className={styles.pagina}>
      <MotionReveal as="header" className={styles.cabecalho}>
        <div className={styles.blocoTitulo}>
          <p className={styles.sobretitulo}>
            <span aria-hidden="true" />
            Conta · identidade e acesso
          </p>
          <h1>Meu perfil</h1>
          <p>
          </p>
        </div>
        <aside className={styles.painelAcesso} aria-label="Contexto da área pessoal">
          <span className={styles.indicePainel}>Área pessoal</span>
          <strong>Credencial individual</strong>
          <p>
            Sua senha protege o acesso às análises e às ações realizadas em seu nome.
          </p>
          <div className={styles.marcadoresAcesso} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </aside>
      </MotionReveal>

      <MotionStagger className={styles.gradePerfil} delay={1}>
        <section className={`${styles.cartao} ${styles.cartaoIdentidade}`} aria-label="Dados da conta">
          <header className={styles.cabecalhoCartao}>
            <div>
              <span className={styles.indiceSecao}>01 · Identidade</span>
              <h2 className={styles.titulo}>Dados da conta</h2>
            </div>
            <span className={styles.seloConta}>
              <span aria-hidden="true" />
              {usuario.ativo ? "Conta ativa" : "Conta inativa"}
            </span>
          </header>

          <div className={styles.identidade}>
            <span className={styles.avatar} aria-hidden="true">
              {usuario.usuario.charAt(0).toUpperCase()}
            </span>
            <dl className={styles.listaDados}>
              <div className={styles.itemDado}>
                <dt>Usuário</dt>
                <dd>{usuario.usuario}</dd>
                <span>Usado para identificar seu acesso à plataforma.</span>
              </div>
              <div className={styles.itemDado}>
                <dt>Papel</dt>
                <dd>{ROTULO_PAPEL[usuario.papel]}</dd>
                <span>Define as áreas e ações disponíveis para esta conta.</span>
              </div>
            </dl>
          </div>

          <footer className={styles.notaConta}>
            <span className={styles.marcaNota} aria-hidden="true">i</span>
            <p>Alterações de e-mail e papel são administradas pela equipe responsável.</p>
          </footer>
        </section>

        <section className={`${styles.cartao} ${styles.cartaoSeguranca}`} aria-label="Trocar senha">
          <header className={styles.cabecalhoCartao}>
            <div>
              <span className={styles.indiceSecao}>02 · Segurança</span>
              <h2 className={styles.titulo}>Trocar senha</h2>
            </div>
          </header>

          <div className={styles.guiaSeguranca}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3 5 6v5c0 4.5 2.8 8.1 7 10 4.2-1.9 7-5.5 7-10V6l-7-3Z" />
              <path d="m9.5 12 1.6 1.6 3.7-4" />
            </svg>
            <div>
              <strong>Atualização segura</strong>
            </div>
          </div>

          <TrocarSenhaForm />
        </section>
      </MotionStagger>
    </main>
  );
}
