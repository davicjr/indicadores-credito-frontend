"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Campo } from "@/components/Campo";
import styles from "@/app/login/login.module.css";

export function LoginForm() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });

      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        setErro(corpo?.mensagem ?? "Não foi possível entrar. Tente novamente.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={aoSubmeter} className={styles.formulario} aria-busy={enviando} aria-label="Acesso à plataforma">
      <Campo
        label="Usuário"
        name="usuario"
        type="text"
        autoComplete="username"
        value={usuario}
        onChange={(evento) => setUsuario(evento.target.value)}
        required
      />
      <Campo
        label="Senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        value={senha}
        onChange={(evento) => setSenha(evento.target.value)}
        required
      />

      {erro && (
        <p className={styles.erro} role="alert">
          <span aria-hidden="true">!</span>
          {erro}
        </p>
      )}

      <button type="submit" className={styles.botao} disabled={enviando}>
        <span>{enviando ? "Entrando..." : "Entrar"}</span>
        <span aria-hidden="true">→</span>
      </button>

      <div className={styles.notaSeguranca}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="10" width="14" height="10" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <span>Sua credencial é enviada por uma conexão protegida.</span>
      </div>
    </form>
  );
}
