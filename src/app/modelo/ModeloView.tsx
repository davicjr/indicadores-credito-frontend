"use client";

import { useState } from "react";
import { MotionReveal } from "@/components/MotionReveal";
import type {
  CarteiraResumo,
  DistribuicaoMetrica,
  InadimplenciaSegmento,
  PesoFeature,
} from "@/lib/dados-api";
import type { ResumoModelo as ResumoModeloApi } from "@/lib/modelo-api";
import { nomeModelo } from "@/lib/modelos";
import { Abas, AbaPainel, type AbaDef } from "@/components/Abas";
import { DistribuicaoPorFaixa } from "../dashboard/DistribuicaoPorFaixa";
import { DistribuicaoPorSegmento } from "../dashboard/DistribuicaoPorSegmento";
import { InadimplenciaPorSegmento } from "../dashboard/InadimplenciaPorSegmento";
import { MetricasCarteira } from "../dashboard/MetricasCarteira";
import { ResumoCarteira } from "../dashboard/ResumoCarteira";
import { ComparacaoModelos } from "./ComparacaoModelos";
import { FluxoModelo } from "./FluxoModelo";
import { ImportanciaFeaturesModelo } from "./ImportanciaFeaturesModelo";
import { ResumoModelo } from "./ResumoModelo";
import dashboardStyles from "../dashboard/dashboard.module.css";
import styles from "./modelo.module.css";

interface ModeloViewProps {
  resumoModelo: ResumoModeloApi;
  pesos: PesoFeature[];
  carteira: CarteiraResumo;
  inadimplencia: InadimplenciaSegmento[];
  metricas: string[];
  metricaInicial: string;
  distribuicaoMetricaInicial: DistribuicaoMetrica;
}

const ABAS_MODELO: AbaDef[] = [
  { id: "visao-geral", rotulo: "01 Visão geral" },
  { id: "como-funciona", rotulo: "02 Como funciona" },
  { id: "evidencias", rotulo: "03 Evidências" },
];

const ABAS_EVIDENCIAS: AbaDef[] = [
  { id: "evidencia-amostra", rotulo: "Amostra" },
  { id: "evidencia-distribuicoes", rotulo: "Distribuições" },
  { id: "evidencia-risco", rotulo: "Risco observado" },
];

interface AberturaEtapaProps {
  numero: string;
  sobretitulo: string;
  titulo: string;
  texto: string;
}

function AberturaEtapa({ numero, sobretitulo, titulo, texto }: AberturaEtapaProps) {
  return (
    <header className={styles.aberturaEtapa}>
      <MotionReveal
        as="span"
        className={`${styles.numeroEtapaPagina} fonte-dados`}
        aria-hidden="true"
        delay={1}
        variant="emphasis"
      >
        {numero}
      </MotionReveal>
      <div>
        <p className={styles.sobretitulo}>{sobretitulo}</p>
        <h2>{titulo}</h2>
        <p className={styles.descricaoEtapa}>{texto}</p>
      </div>
    </header>
  );
}

export function ModeloView({
  resumoModelo,
  pesos,
  carteira,
  inadimplencia,
  metricas,
  metricaInicial,
  distribuicaoMetricaInicial,
}: ModeloViewProps) {
  const [abaAtiva, setAbaAtiva] = useState("visao-geral");
  const [abaEvidenciaAtiva, setAbaEvidenciaAtiva] = useState("evidencia-amostra");
  const ultimaAtualizacao = resumoModelo.geradoEm
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(new Date(resumoModelo.geradoEm))
    : null;

  return (
    <main className={`${dashboardStyles.pagina} ${styles.paginaModelo}`}>
      <MotionReveal as="header" className={styles.cabecalho}>
        <div className={styles.blocoTitulo}>
          <p className={styles.sobretitulo}>
            <span aria-hidden="true" />
            Transparência · método e evidências
          </p>
          <h1>Sobre o modelo</h1>
          <p className={styles.introducao}>
         </p>
        </div>
        <aside className={styles.painelContexto} aria-label="Estado da documentação do modelo">
          <div className={styles.estadoContexto}>
            <span aria-hidden="true" />
            Leitura auditável
          </div>
          <p>
            Método, desempenho e evidências reunidos para explicar cada camada do score.
          </p>
          <dl>
            <div>
              <dt>Modelo ativo</dt>
              <dd>{nomeModelo(resumoModelo.modeloAtivo)}</dd>
            </div>
            <div>
              <dt>Atualização</dt>
              <dd>{ultimaAtualizacao ?? "Não informada"}</dd>
            </div>
          </dl>
        </aside>
      </MotionReveal>

      <div className={styles.navegacaoModelo}>
        <Abas abas={ABAS_MODELO} abaAtiva={abaAtiva} onMudarAba={setAbaAtiva} rotuloGrupo="Etapas da explicação do modelo">
          <AbaPainel id="visao-geral" abaAtiva={abaAtiva}>
            <MotionReveal className={styles.conteudoPainel} delay={1}>
              <AberturaEtapa
                numero="01"
                sobretitulo="Comece pelo resultado"
                titulo="O que está em uso hoje"
                texto=""
              />
              <ResumoModelo resumo={resumoModelo} />
              <ComparacaoModelos resumo={resumoModelo} />
            </MotionReveal>
          </AbaPainel>

          <AbaPainel id="como-funciona" abaAtiva={abaAtiva}>
            <MotionReveal className={styles.conteudoPainel}>
              <AberturaEtapa
                numero="02"
                sobretitulo="Acompanhe o cálculo"
                titulo="Como os dados viram uma decisão"
                texto=""
              />
              <FluxoModelo resumo={resumoModelo} />
              <ImportanciaFeaturesModelo pesos={pesos} />
            </MotionReveal>
          </AbaPainel>

          <AbaPainel id="evidencias" abaAtiva={abaAtiva}>
            <MotionReveal className={styles.conteudoPainel}>
              <AberturaEtapa
                numero="03"
                sobretitulo="Consulte as evidências"
                titulo="O que a base histórica sustenta"
                texto=""
              />

              <div className={styles.subnavegacao}>
                <Abas
                  abas={ABAS_EVIDENCIAS}
                  abaAtiva={abaEvidenciaAtiva}
                  onMudarAba={setAbaEvidenciaAtiva}
                  rotuloGrupo="Partes das evidências históricas"
                >
                  <AbaPainel id="evidencia-amostra" abaAtiva={abaEvidenciaAtiva}>
                    <div className={styles.blocoEvidencia}>
                      <div className={styles.guiaEvidencia}>
                        <span className={styles.sobretitulo}>Amostra de desenvolvimento</span>
                        <p>Tamanho da base e score médio depois da limpeza e da deduplicação.</p>
                      </div>
                      <ResumoCarteira
                        totalClientes={carteira.totalClientes}
                        scoreMedio={carteira.scoreMedio}
                        rotuloTotal="Registros históricos"
                        legenda="Amostra anonimizada após limpeza e deduplicação"
                        ariaLabel="Indicadores da base histórica"
                      />
                    </div>
                  </AbaPainel>

                  <AbaPainel id="evidencia-distribuicoes" abaAtiva={abaEvidenciaAtiva}>
                    <div className={styles.blocoEvidencia}>
                      <div className={styles.guiaEvidencia}>
                        <span className={styles.sobretitulo}>Distribuição da amostra</span>
                        <p>Como os registros se distribuem entre faixas de score e perfis comportamentais.</p>
                      </div>
                      <div className={styles.gradeHistorica}>
                        <DistribuicaoPorFaixa distribuicao={carteira.distribuicaoPorFaixa} />
                        <DistribuicaoPorSegmento distribuicao={carteira.distribuicaoPorSegmento} />
                      </div>
                    </div>
                  </AbaPainel>

                  <AbaPainel id="evidencia-risco" abaAtiva={abaEvidenciaAtiva}>
                    <div className={styles.blocoEvidencia}>
                      <div className={styles.guiaEvidencia}>
                        <span className={styles.sobretitulo}>Risco observado</span>
                        <p>Onde a inadimplência apareceu por perfil e por faixa de cada característica.</p>
                      </div>
                      <div className={styles.evidenciasRisco}>
                        <InadimplenciaPorSegmento segmentos={inadimplencia} />
                        <MetricasCarteira
                          metricas={metricas}
                          metricaInicial={metricaInicial}
                          distribuicaoInicial={distribuicaoMetricaInicial}
                        />
                      </div>
                    </div>
                  </AbaPainel>
                </Abas>
              </div>
            </MotionReveal>
          </AbaPainel>
        </Abas>
      </div>
    </main>
  );
}
