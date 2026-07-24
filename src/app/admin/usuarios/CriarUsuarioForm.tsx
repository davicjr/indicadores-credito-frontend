"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Campo } from "@/components/Campo";
import styles from "./usuarios.module.css";

const ESTADO_VAZIO = { usuario: "", senha: "", papel: "ANALISTA" };

interface CriarUsuarioFormProps {
  onSucesso?: () => void;
}

export function CriarUsuarioForm({ onSucesso }: CriarUsuarioFormProps) {
  const router = useRouter();
  const [valores, setValores] = useState(ESTADO_VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function onChange(campo: keyof typeof ESTADO_VAZIO) {
    return (evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValores((atual) => ({ ...atual, [campo]: evento.target.value }));
    };
  }

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valores),
      });

      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        setErro(corpo?.mensagem ?? "Não foi possível criar o usuário. Tente novamente.");
        return;
      }

      if (onSucesso) {
        onSucesso();
      } else {
        router.push("/admin/usuarios");
      }
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={aoSubmeter} className={styles.formulario} aria-busy={enviando}>
      <div className={styles.guiaFormulario}>
        <span className="fonte-dados" aria-hidden="true">01</span>
        <div>
          <strong>Nova credencial</strong>
          <p></p>
        </div>
      </div>
      <Campo
        label="Usuário"
        name="usuario"
        type="text"
        autoComplete="username"
        value={valores.usuario}
        onChange={onChange("usuario")}
        required
      />
      <Campo
        label="Senha"
        name="senha"
        type="password"
        autoComplete="new-password"
        value={valores.senha}
        onChange={onChange("senha")}
        required
      />
      <div className={styles.campo}>
        <label htmlFor="papel">Papel</label>
        <select id="papel" name="papel" value={valores.papel} onChange={onChange("papel")}>
          <option value="ADMIN">Admin</option>
          <option value="ANALISTA">Analista</option>
        </select>
      </div>
      {erro && (
        <p className={styles.erro} role="alert">
          <span aria-hidden="true">!</span>
          {erro}
        </p>
      )}
      <footer className={styles.acoesFormulario}>
        <span></span>
        <button type="submit" className={styles.botao} disabled={enviando}>
          {enviando ? "Criando..." : "Criar usuário"}
        </button>
      </footer>
    </form>
  );
}
