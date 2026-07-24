type IconeMenu = "perfil" | "usuarios" | "tema" | "sair";

export function MenuUsuarioIcone({ tipo }: { tipo: IconeMenu }) {
  if (tipo === "perfil") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.5-4.1 2.8-6.2 7-6.2s6.5 2.1 7 6.2" />
      </svg>
    );
  }

  if (tipo === "usuarios") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.4-3.2 2.2-5 5.5-5s5.1 1.8 5.5 5M15 6.5a3 3 0 0 1 0 5.8M16 14c2.7.2 4.1 1.8 4.5 4.5" />
      </svg>
    );
  }

  if (tipo === "tema") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />
    </svg>
  );
}
