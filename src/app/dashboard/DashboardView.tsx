"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MotionReveal, MotionStagger } from "@/components/MotionReveal";
import type { DistribuicaoMetricaCliente, FaixaMetricaCliente, ResumoClientes } from "@/lib/clientes-api";
import { filtroDosParams, filtrosIguais, queryStringDoFiltro, type FiltroCarteira } from "@/lib/filtro-carteira";
import { DistribuicaoMetricaClientes } from "./DistribuicaoMetricaClientes";
import { DistribuicaoPorFaixa } from "./DistribuicaoPorFaixa";
import { DistribuicaoPorSegmento } from "./DistribuicaoPorSegmento";
import { FiltroCarteiraChip } from "./FiltroCarteiraChip";
import { ResumoCarteira } from "./ResumoCarteira";
import styles from "./dashboard.module.css";

interface DashboardViewProps {
  resumoInicial: ResumoClientes;
  metricas: readonly string[];
  metricaInicial: string;
  distribuicaoMetricaInicial: DistribuicaoMetricaCliente;
  filtroInicial: FiltroCarteira | null;
}

// Orquestrador único: dono do filtro cruzado (faixa/segmento/métrica), da métrica selecionada e dos 2
// fetches que cobrem os 4 cards (getResumoClientes já traz total+faixa+segmento numa chamada
// só). Os cards viraram componentes puros — nenhum busca dado próprio — pra evitar dois
// mecanismos de fetch competindo pelo mesmo estado quando o filtro muda por fora do card.
export function DashboardView({
  resumoInicial,
  metricas,
  metricaInicial,
  distribuicaoMetricaInicial,
  filtroInicial,
}: DashboardViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryAtual = searchParams.toString();

  const [filtro, setFiltro] = useState<FiltroCarteira | null>(filtroInicial);
  const [resumo, setResumo] = useState(resumoInicial);
  const [metricaSelecionada, setMetricaSelecionada] = useState(metricaInicial);
  const [distribuicaoMetrica, setDistribuicaoMetrica] = useState(distribuicaoMetricaInicial);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const primeiraSincroniaUrl = useRef(true);
  const primeiroFetch = useRef(true);

  const aplicarFiltro = useCallback(
    (proximo: FiltroCarteira | null) => {
      setFiltro(proximo);
      const params = new URLSearchParams(queryAtual);
      params.delete("faixa");
      params.delete("segmento");
      params.delete("metrica");
      params.delete("min");
      params.delete("max");
      if (proximo?.tipo === "faixa") params.set("faixa", proximo.valor);
      if (proximo?.tipo === "segmento") params.set("segmento", String(proximo.valor));
      if (proximo?.tipo === "metrica") {
        params.set("metrica", proximo.metrica);
        params.set("min", String(proximo.min));
        params.set("max", String(proximo.max));
      }
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    },
    [pathname, queryAtual, router]
  );

  // Sincroniza quando a URL muda por fora (botão voltar do navegador, link compartilhado com
  // filtro na query) — sem isso, dar F5 ou navegar de volta não atualizava o filtro na tela.
  // Dependência é a STRING da query, não o objeto searchParams — useSearchParams() pode
  // devolver uma referência nova a cada render sem o conteúdo ter mudado (achado real via
  // teste), o que disparava este efeito à toa e brigava com o setFiltro otimista do clique.
  // Pula a primeira renderização: o estado inicial já veio correto via SSR (filtroInicial).
  useEffect(() => {
    if (primeiraSincroniaUrl.current) {
      primeiraSincroniaUrl.current = false;
      return;
    }
    const params = new URLSearchParams(queryAtual);
    const daUrl = filtroDosParams({
      faixa: params.get("faixa") ?? undefined,
      segmento: params.get("segmento") ?? undefined,
      metrica: params.get("metrica") ?? undefined,
      min: params.get("min") ?? undefined,
      max: params.get("max") ?? undefined,
    });
    setFiltro((atual) => (filtrosIguais(daUrl, atual) ? atual : daUrl));
  }, [queryAtual]);

  // Refaz os 2 fetches sempre que o filtro ou a métrica selecionada mudam — seleção mais
  // recente vence (cancelado descarta resposta desatualizada). Pula a primeira renderização:
  // os dados já chegaram prontos via SSR, refazer aqui seria requisição redundante.
  useEffect(() => {
    if (primeiroFetch.current) {
      primeiroFetch.current = false;
      return;
    }
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    const query = queryStringDoFiltro(filtro);
    Promise.all([
      fetch(`/api/clientes/resumo${query}`).then((r) => r.json()),
      fetch(`/api/clientes/distribuicao/${metricaSelecionada}${query}`).then((r) => r.json()),
    ])
      .then(([novoResumo, novaDistribuicao]) => {
        if (cancelado) return;
        setResumo(novoResumo);
        setDistribuicaoMetrica(novaDistribuicao);
      })
      .catch(() => {
        if (!cancelado) setErro("Não foi possível aplicar o filtro. Tente novamente.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [filtro, metricaSelecionada]);

  useEffect(() => {
    if (!filtro) return;

    function limparComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        aplicarFiltro(null);
      }
    }

    document.addEventListener("keydown", limparComEscape);
    return () => document.removeEventListener("keydown", limparComEscape);
  }, [aplicarFiltro, filtro]);

  function selecionarFaixa(faixa: string) {
    aplicarFiltro(filtro?.tipo === "faixa" && filtro.valor === faixa ? null : { tipo: "faixa", valor: faixa });
  }

  function selecionarSegmento(segmento: number) {
    aplicarFiltro(
      filtro?.tipo === "segmento" && filtro.valor === segmento ? null : { tipo: "segmento", valor: segmento }
    );
  }

  function selecionarFaixaMetrica(faixa: FaixaMetricaCliente) {
    const proximo: FiltroCarteira = {
      tipo: "metrica",
      metrica: metricaSelecionada,
      min: faixa.min,
      max: faixa.max,
    };
    aplicarFiltro(filtrosIguais(filtro, proximo) ? null : proximo);
  }

  return (
    <main className={`${styles.pagina} ${styles.paginaDashboard}`}>
      <MotionReveal as="header" className={styles.cabecalhoPagina}>
        <div className={styles.cabecalhoConteudo}>
          <h1>Carteira de clientes</h1>
        </div>
        <div className={styles.leituraAtual} aria-label="Estado da visualização">
          <span className={styles.leituraRotulo}>Filtro atual</span>
          {filtro ? (
            <FiltroCarteiraChip filtro={filtro} onLimpar={() => aplicarFiltro(null)} />
          ) : (
            <span className={styles.leituraStatus}>
              <span aria-hidden="true" />
              Carteira completa
            </span>
          )}
          <span className={styles.leituraApoio}>
            {filtro ? "Os cards refletem este recorte." : "Clique nos gráficos para cruzar os cards."}
          </span>
        </div>
      </MotionReveal>
      <MotionReveal delay={1} variant="fade">
        <ResumoCarteira
          totalClientes={resumo.totalClientes}
          scoreMedio={resumo.scoreMedio}
          rotuloTotal="Clientes ativos"
          legenda=""
        />
      </MotionReveal>
      <MotionStagger className={styles.grade} delay={2}>
        <DistribuicaoPorFaixa
          distribuicao={resumo.distribuicaoPorFaixa}
          filtroAtivo={filtro?.tipo === "faixa" ? filtro.valor : null}
          onSelecionar={selecionarFaixa}
          atualizando={carregando}
        />
        <DistribuicaoPorSegmento
          distribuicao={resumo.distribuicaoPorSegmento}
          filtroAtivo={filtro?.tipo === "segmento" ? filtro.valor : null}
          onSelecionar={selecionarSegmento}
          atualizando={carregando}
        />
      </MotionStagger>
      <MotionReveal delay={3}>
        <DistribuicaoMetricaClientes
          metricas={metricas}
          metricaSelecionada={metricaSelecionada}
          distribuicao={distribuicaoMetrica}
          carregando={carregando}
          erro={erro}
          filtroAtivo={filtro?.tipo === "metrica" ? filtro : null}
          quantidadeSelecionada={filtro?.tipo === "metrica" ? resumo.totalClientes : undefined}
          onSelecionarMetrica={setMetricaSelecionada}
          onSelecionarFaixa={selecionarFaixaMetrica}
        />
      </MotionReveal>
    </main>
  );
}
