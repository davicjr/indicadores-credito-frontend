"use client";

import { useState, type FormEvent } from "react";
import { Campo } from "@/components/Campo";
import { useToast } from "@/components/ToastProvider";
import styles from "./perfil.module.css";

const ESTADO_VAZIO = { senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" };

export function TrocarSenhaForm() {
  const mostrarToast = useToast();
  const [valores, setValores] = useState(ESTADO_VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function onChange(campo: keyof typeof ESTADO_VAZIO) {
    return (evento: React.ChangeEvent<HTMLInputElement>) => {
      setValores((atual) => ({ ...atual, [campo]: evento.target.value }));
    };
  }

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (valores.novaSenha !== valores.confirmarNovaSenha) {
      setErro("A nova senha e a confirmação não coincidem.");
      return;
    }

    setEnviando(true);
    try {
      const resposta = await fetch("/api/usuarios/me/senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual: valores.senhaAtual, novaSenha: valores.novaSenha }),
      });

      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        setErro(corpo?.mensagem ?? "Não foi possível trocar a senha. Tente novamente.");
        return;
      }

      setValores(ESTADO_VAZIO);
      mostrarToast("Senha alterada com sucesso", "sucesso");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={aoSubmeter} className={styles.formulario} aria-busy={enviando}>
      <div className={styles.campoSenhaAtual}>
        <Campo
          label="Senha atual"
          name="senhaAtual"
          type="password"
          autoComplete="current-password"
          value={valores.senhaAtual}
          onChange={onChange("senhaAtual")}
          required
        />
      </div>
      <Campo
        label="Nova senha"
        name="novaSenha"
        type="password"
        autoComplete="new-password"
        value={valores.novaSenha}
        onChange={onChange("novaSenha")}
        required
      />
      <Campo
        label="Confirmar nova senha"
        name="confirmarNovaSenha"
        type="password"
        autoComplete="new-password"
        value={valores.confirmarNovaSenha}
        onChange={onChange("confirmarNovaSenha")}
        required
      />
      {erro && (
        <p className={styles.erro} role="alert">
          <span aria-hidden="true">!</span>
          {erro}
        </p>
      )}
      <footer className={styles.acoesFormulario}>
        <span>A alteração será aplicada no próximo acesso.</span>
        <button type="submit" className={styles.botao} disabled={enviando}>
          {enviando ? "Trocando..." : "Trocar senha"}
        </button>
      </footer>
    </form>
  );
}
