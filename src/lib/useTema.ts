"use client";

import { useEffect, useState } from "react";

const CHAVE_ARMAZENAMENTO = "tema";

export type Tema = "light" | "dark";

function lerTemaAtual(): Tema {
  const atual = document.documentElement.getAttribute("data-theme");
  return atual === "dark" ? "dark" : "light";
}

export function useTema() {
  const [tema, setTema] = useState<Tema>("light");

  useEffect(() => {
    setTema(lerTemaAtual());
  }, []);

  function alternar() {
    const proximo: Tema = tema === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", proximo);
    localStorage.setItem(CHAVE_ARMAZENAMENTO, proximo);
    setTema(proximo);
  }

  return { tema, alternar };
}
