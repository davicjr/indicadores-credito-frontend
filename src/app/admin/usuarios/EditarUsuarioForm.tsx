"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Campo } from "@/components/Campo";
import type { Usuario } from "@/lib/usuario-api";
import styles from "./usuarios.module.css";

interface EditarUsuarioFormProps {
  usuario: Usuario;
  onSucesso?: () => void;
}

export function EditarUsuarioForm({ usuario, onSucesso }: EditarUsuarioFormProps) {
  const router = useRouter();
  const [nomeUsuario, setNomeUsuario] = useState(usuario.usuario);
  const [papel, setPapel] = useState(usuario.papel);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: nomeUsuario, papel }),
      });

      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        setErro(corpo?.mensagem ?? "Não foi possível salvar. Tente novamente.");
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
        <span className="fonte-dados" aria-hidden="true">02</span>
        <div>
          <strong>Conta selecionada</strong>
          <p></p>
        </div>
      </div>
      <Campo
        label="Usuário"
        name="usuario"
        type="text"
        autoComplete="username"
        value={nomeUsuario}
        onChange={(evento) => setNomeUsuario(evento.target.value)}
        required
      />
      <div className={styles.campo}>
        <label htmlFor="papel">Papel</label>
        <select
          id="papel"
          name="papel"
          value={papel}
          onChange={(evento) => setPapel(evento.target.value as Usuario["papel"])}
        >
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
        <span>As novas permissões passam a valer após salvar.</span>
        <button type="submit" className={styles.botao} disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar"}
        </button>
      </footer>
    </form>
  );
}
