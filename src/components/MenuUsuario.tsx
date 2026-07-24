"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTema } from "@/lib/useTema";
import type { Usuario } from "@/lib/usuario-api";
import { MenuUsuarioIcone } from "./MenuUsuarioIcone";
import styles from "./MenuUsuario.module.css";

interface MenuUsuarioProps {
  usuario: Usuario;
}

const ROTULO_PAPEL: Record<Usuario["papel"], string> = {
  ANALISTA: "Analista",
  ADMIN: "Admin",
};
export function MenuUsuario({ usuario }: MenuUsuarioProps) {
  const router = useRouter();
  const { tema, alternar } = useTema();
  const [aberto, setAberto] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const inicial = usuario.usuario.charAt(0).toUpperCase();

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(evento: MouseEvent) {
      if (!wrapperRef.current?.contains(evento.target as Node)) {
        setAberto(false);
      }
    }

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  async function sair() {
    setAberto(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    // O layout raiz decide "mostra Nav?" no servidor a partir do cookie — router.push troca só
    // o segmento de rota, não reavalia o layout. Sem refresh(), a Nav de usuário logado ficava
    // grudada na tela de login depois do logout (achado real do usuário).
    router.refresh();
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        ref={botaoRef}
        type="button"
        className={styles.avatar}
        onClick={() => setAberto((atual) => !atual)}
        aria-label="Menu do usuário"
        aria-expanded={aberto}
        aria-haspopup="menu"
        aria-controls={aberto ? "menu-usuario" : undefined}
      >
        <span className={styles.avatarLetra} aria-hidden="true">
          {inicial}
        </span>
        <span className={styles.avatarMeta} aria-hidden="true">
          <strong>Conta</strong>
          <span>{ROTULO_PAPEL[usuario.papel]}</span>
        </span>
        <span className={styles.chevron} aria-hidden="true">
          {aberto ? "↑" : "↓"}
        </span>
      </button>

      {aberto && (
        <div className={styles.painel} role="menu" id="menu-usuario">
          <div className={styles.cabecalho}>
            <span className={styles.avatarGrande} aria-hidden="true">
              {inicial}
            </span>
            <div className={styles.info}>
              <p className={styles.email}>{usuario.usuario}</p>
              <p className={styles.papel}>{ROTULO_PAPEL[usuario.papel]}</p>
            </div>
          </div>

          <div className={styles.grupo}>
            <span className={styles.grupoRotulo}>Conta e acesso</span>
            <Link
              href="/perfil"
              className={styles.item}
              onClick={() => setAberto(false)}
              role="menuitem"
              aria-label="Meu perfil"
            >
              <span className={styles.itemIcone}>
                <MenuUsuarioIcone tipo="perfil" />
              </span>
              <span className={styles.itemTexto}>
                <strong>Meu perfil</strong>
                <small>Dados da conta e senha</small>
              </span>
              <span className={styles.itemSeta} aria-hidden="true">
                →
              </span>
            </Link>
            {usuario.papel === "ADMIN" && (
              <Link
                href="/admin/usuarios"
                className={styles.item}
                onClick={() => setAberto(false)}
                role="menuitem"
                aria-label="Gestão de usuários"
              >
                <span className={styles.itemIcone}>
                  <MenuUsuarioIcone tipo="usuarios" />
                </span>
                <span className={styles.itemTexto}>
                  <strong>Gestão de usuários</strong>
                  <small>Permissões e acessos</small>
                </span>
                <span className={styles.itemSeta} aria-hidden="true">
                  →
                </span>
              </Link>
            )}
          </div>

          <div className={styles.grupo}>
            <span className={styles.grupoRotulo}>Preferências</span>
            <button
              type="button"
              className={styles.item}
              onClick={alternar}
              role="menuitem"
              aria-label={tema === "dark" ? "Tema claro" : "Tema escuro"}
            >
              <span className={styles.itemIcone}>
                <MenuUsuarioIcone tipo="tema" />
              </span>
              <span className={styles.itemTexto}>
                <strong>{tema === "dark" ? "Tema claro" : "Tema escuro"}</strong>
                <small>Alternar aparência da interface</small>
              </span>
              <span className={styles.temaIndicador} aria-hidden="true">
                {tema === "dark" ? "☼" : "◐"}
              </span>
            </button>
          </div>

          <button
            type="button"
            className={`${styles.item} ${styles.sair}`}
            onClick={sair}
            role="menuitem"
            aria-label="Sair"
          >
            <span className={styles.itemIcone}>
              <MenuUsuarioIcone tipo="sair" />
            </span>
            <span className={styles.itemTexto}>
              <strong>Sair</strong>
              <small>Encerrar esta sessão</small>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
