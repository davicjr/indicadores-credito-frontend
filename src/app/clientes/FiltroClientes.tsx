"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ordenarPorFaixa, ORDEM_FAIXAS } from "@/lib/faixas";
import { nomeSegmento, ORDEM_SEGMENTOS } from "@/lib/segmentos";
import styles from "./clientes.module.css";

interface FiltroClientesProps {
  nome?: string;
  faixa?: string;
  segmento?: number;
  status?: string;
}

// Espelha o default do backend (ClienteController.ativoDoStatus) — "" no <select> = "ativo" pro
// backend, não "todos": omitir o param preserva o comportamento de antes do filtro existir (só
// mostrava ativos), então o valor "vazio" do dropdown não pode virar "sem filtro".
const OPCOES_STATUS = [
  { valor: "", rotulo: "Ativos" },
  { valor: "inativo", rotulo: "Inativos" },
  { valor: "todos", rotulo: "Todos" },
] as const;

// Espera o usuário parar de digitar antes de navegar — sem isso, cada tecla disparava uma busca
// nova (achado real: campo "pulava" a cada letra digitada).
const ATRASO_BUSCA_MS = 350;

export function FiltroClientes({ nome, faixa, segmento, status }: FiltroClientesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [nomeDigitado, setNomeDigitado] = useState(nome ?? "");

  function atualizarFiltro(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(chave, valor);
    } else {
      params.delete(chave);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    if (nomeDigitado === (nome ?? "")) return;
    const espera = setTimeout(() => atualizarFiltro("nome", nomeDigitado), ATRASO_BUSCA_MS);
    return () => clearTimeout(espera);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomeDigitado]);

  const quantidadeFiltros =
    Number(Boolean(nome)) + Number(Boolean(faixa)) + Number(segmento !== undefined) + Number(Boolean(status));

  return (
    <div role="search" className={styles.filtro}>
      <div className={styles.filtroCabecalho}>
        <div>
          <span className={styles.indiceLista}>Refine a base</span>
          <strong>Encontre o cliente certo</strong>
        </div>
        <span className={styles.filtroEstado}>
          {quantidadeFiltros === 0
            ? "Todos os clientes"
            : `${quantidadeFiltros} ${quantidadeFiltros === 1 ? "filtro ativo" : "filtros ativos"}`}
        </span>
      </div>
      <div className={styles.filtroCampos}>
        <div className={styles.campoBusca}>
          <label htmlFor="filtro-nome">Buscar por nome</label>
          <input
            id="filtro-nome"
            type="text"
            value={nomeDigitado}
            placeholder="Digite um nome"
            onChange={(evento) => setNomeDigitado(evento.target.value)}
          />
        </div>
        <div>
          <label htmlFor="filtro-faixa">Faixa</label>
          <select
            id="filtro-faixa"
            defaultValue={faixa ?? ""}
            onChange={(evento) => atualizarFiltro("faixa", evento.target.value)}
          >
            <option value="">Todas</option>
            {ordenarPorFaixa(ORDEM_FAIXAS.map((item) => ({ faixa: item }))).map(({ faixa: item }) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-segmento">Segmento</label>
          <select
            id="filtro-segmento"
            defaultValue={segmento ?? ""}
            onChange={(evento) => atualizarFiltro("segmento", evento.target.value)}
          >
            <option value="">Todos</option>
            {ORDEM_SEGMENTOS.map((item) => (
              <option key={item} value={item}>
                {nomeSegmento(item)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-status">Status</label>
          <select
            id="filtro-status"
            defaultValue={status ?? ""}
            onChange={(evento) => atualizarFiltro("status", evento.target.value)}
          >
            {OPCOES_STATUS.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
