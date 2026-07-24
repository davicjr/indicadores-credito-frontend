"use client";

import { useState } from "react";
import { Campo } from "@/components/Campo";
import type { DadosFinanceirosFormState } from "@/components/DadosFinanceirosCampos";
import type { PesoFeature } from "@/lib/dados-api";
import {
  ABAS_SIMULADOR,
  METADADOS_CAMPOS_SIMULADOR,
  posicaoImportancia,
  type IdAba,
} from "@/lib/campos-simulador";
import { ordenarAlfabeticamente } from "@/lib/ordenacao";
import styles from "./simulador.module.css";

export interface SimuladorCamposFormState extends DadosFinanceirosFormState {
  idade: string;
}

interface SimuladorCamposProps {
  valores: SimuladorCamposFormState;
  onChange: (campo: keyof SimuladorCamposFormState) => (evento: React.ChangeEvent<HTMLInputElement>) => void;
  pesos: PesoFeature[];
}

const ROTULOS_CAMPO: Record<string, string> = {
  idade: "Idade",
  rendaMensal: "Renda mensal",
  numeroDependentes: "Número de dependentes",
  utilizacaoCreditoRotativo: "Utilização de crédito rotativo",
  razaoDividaRenda: "Razão dívida/renda",
  linhasCreditoAbertas: "Linhas de crédito abertas",
  emprestimosImobiliarios: "Empréstimos imobiliários",
  atrasos30a59Dias: "Atrasos de 30 a 59 dias",
  atrasos60a89Dias: "Atrasos de 60 a 89 dias",
  atrasos90DiasOuMais: "Atrasos de 90 dias ou mais",
};

// Só idade é obrigatória — mora na 1ª aba, sempre visível ao abrir a tela. Os demais campos
// ficam em abas que podem estar fechadas: 0 é valor real e válido pra todos eles (0% de
// utilização, 0 atrasos etc.), então travar o envio por "obrigatório vazio" numa aba escondida
// era um jeito fácil de o usuário achar que o botão não funciona (achado da sessão de UX).
const PASSO_CAMPO: Record<string, string> = {
  utilizacaoCreditoRotativo: "0.01",
  razaoDividaRenda: "0.01",
  rendaMensal: "0.01",
};

export function SimuladorCampos({ valores, onChange, pesos }: SimuladorCamposProps) {
  // Abas na ordem declarada em ABAS_SIMULADOR (Perfil primeiro — é a que abre por padrão,
  // contém a idade, único campo obrigatório). Só os campos dentro de cada aba seguem A–Z.
  const abasOrdenadas = ABAS_SIMULADOR;
  const [abaAtiva, setAbaAtiva] = useState<IdAba>("perfil");

  return (
    <div className={styles.abasContainer}>
      <header className={styles.cabecalhoCampos}>
        <div>
          <span className={styles.indiceSimulador}>Parâmetros</span>
          <h3>Ajuste os sinais</h3>
        </div>
      </header>
      <div className={styles.abasLista} role="tablist" aria-label="Grupos de campos">
        {abasOrdenadas.map((aba) => {
          const ativa = aba.id === abaAtiva;
          return (
            <button
              key={aba.id}
              type="button"
              role="tab"
              id={`aba-${aba.id}`}
              aria-selected={ativa}
              aria-controls={`painel-${aba.id}`}
              className={ativa ? styles.abaAtiva : styles.aba}
              style={ativa ? { borderColor: aba.cor, color: aba.cor } : undefined}
              onClick={() => setAbaAtiva(aba.id)}
            >
              {aba.rotulo}
            </button>
          );
        })}
      </div>
      {abasOrdenadas.map((aba) => (
        <div
          key={aba.id}
          role="tabpanel"
          id={`painel-${aba.id}`}
          aria-labelledby={`aba-${aba.id}`}
          hidden={aba.id !== abaAtiva}
          className={styles.abaPainel}
        >
          {ordenarAlfabeticamente(aba.campos, (campo) => ROTULOS_CAMPO[campo]).map((campo) => {
            const chave = campo as keyof SimuladorCamposFormState;
            const meta = METADADOS_CAMPOS_SIMULADOR[campo];
            const posicao = posicaoImportancia(campo, pesos);
            return (
              <Campo
                key={campo}
                label={ROTULOS_CAMPO[campo]}
                name={campo}
                type="number"
                min={0}
                step={PASSO_CAMPO[campo]}
                required={campo === "idade"}
                value={valores[chave]}
                onChange={onChange(chave)}
                ajuda={`${meta.porQueImporta} ${meta.faixaReal}`}
                badge={
                  posicao !== null ? (
                    <span
                      className={posicao <= 3 ? styles.pesoBadgeAlto : styles.pesoBadge}
                      style={posicao <= 3 ? { background: aba.cor, borderColor: aba.cor } : undefined}
                      title={`peso #${posicao} de 10`}
                    >
                      #{posicao}
                    </span>
                  ) : null
                }
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
