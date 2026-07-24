"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Usuario } from "@/lib/usuario-api";
import { Logomark } from "./Logomark";
import { MenuUsuario } from "./MenuUsuario";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "/clientes", rotulo: "Clientes", rotuloCurto: "Clientes" },
  { href: "/dashboard", rotulo: "Dashboard", rotuloCurto: "Dashboard" },
  { href: "/simulador", rotulo: "Simulador", rotuloCurto: "Simulador" },
  { href: "/modelo", rotulo: "Sobre o modelo", rotuloCurto: "Modelo" },
];

interface NavProps {
  usuario: Usuario | null;
}

export function Nav({ usuario }: NavProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      <div className={styles.conteudo}>
        <Link
          href="/"
          className={styles.marca}
          aria-label="Índice Real — página inicial"
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <Logomark tamanho="pequeno" />
          <span className={styles.wordmark} aria-hidden="true">
            <strong>Índice</strong>
            <span>Real</span>
          </span>
        </Link>
        <div className={styles.links}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.link}
              aria-current={pathname?.startsWith(link.href) ? "page" : undefined}
            >
              <span className={styles.rotuloCompleto}>{link.rotulo}</span>
              <span className={styles.rotuloCurto} aria-hidden="true">
                {link.rotuloCurto}
              </span>
            </Link>
          ))}
        </div>
        {usuario && <MenuUsuario usuario={usuario} />}
      </div>
    </nav>
  );
}
