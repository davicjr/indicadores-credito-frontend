import { LoginForm } from "@/components/LoginForm";
import { MotionReveal } from "@/components/MotionReveal";
import { LoginMarca } from "./LoginMarca";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.pagina}>
      <MotionReveal as="section" className={styles.palcoMarca} variant="fade">
        <LoginMarca />
      </MotionReveal>

      <MotionReveal as="section" className={styles.painelLogin} delay={1}>
        <div className={styles.conteudoLogin}>
          <header className={styles.cabecalhoLogin}>
            <h2>Entre na plataforma</h2>
            <p>Use as credenciais associadas à sua conta institucional.</p>
          </header>
          <LoginForm />
        </div>
      </MotionReveal>
    </main>
  );
}
