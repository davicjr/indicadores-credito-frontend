import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ModeloView } from "./ModeloView";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("ModeloView", () => {
  it("organiza a explicação em uma narrativa de três abas", async () => {
    const usuario = userEvent.setup();
    render(
      <ModeloView
        resumoModelo={{
          modeloAtivo: "logistic",
          metricas: [
            { modelo: "logistic", auc: 0.855, ks: 0.56 },
            { modelo: "gradient_boosting", auc: 0.865, ks: 0.585 },
          ],
          totalRegistros: 149390,
          fracaoTeste: 0.2,
          escala: { pdo: 20, scoreBase: 600, oddsBase: 50 },
          quantidadeSegmentos: 4,
          geradoEm: "2026-07-20T14:53:36Z",
        }}
        pesos={[
          { feature: "times_90_days_late", peso: 1.4 },
          { feature: "age", peso: -0.7 },
        ]}
        carteira={{
          totalClientes: 149390,
          scoreMedio: 712,
          distribuicaoPorFaixa: [{ faixa: "Bom", quantidade: 100 }],
          distribuicaoPorSegmento: [{ segmento: 0, quantidade: 100 }],
        }}
        inadimplencia={[{ segmento: 0, totalClientes: 100, taxaInadimplencia: 0.05 }]}
        metricas={["age"]}
        metricaInicial="age"
        distribuicaoMetricaInicial={{
          metrica: "age",
          faixas: [{ min: 20, max: 33, quantidade: 100, taxaInadimplencia: 0.1 }],
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Sobre o modelo" })).toBeInTheDocument();
    expect(screen.getByLabelText("Resumo do modelo")).toBeInTheDocument();
    expect(screen.getByLabelText("Estado da documentação do modelo")).toBeInTheDocument();
    expect(screen.getAllByText("Regressão logística")).toHaveLength(4);
    expect(screen.getAllByText("85,5%")).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "O que está em uso hoje" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Comparação dos modelos" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Como o resultado é produzido" })).not.toBeInTheDocument();

    screen.getByRole("tab", { name: /01\s+Visão geral/ }).focus();
    await usuario.keyboard("{ArrowRight}");

    expect(screen.getByRole("heading", { name: "Como os dados viram uma decisão" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Como o resultado é produzido" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fatores da regressão logística" })).toBeInTheDocument();
    expect(screen.getByText("Atrasos de 90 dias ou mais")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /02\s+Como funciona/ })).toHaveFocus();

    await usuario.click(screen.getByRole("tab", { name: /03\s+Evidências/ }));

    expect(screen.getByRole("heading", { name: "O que a base histórica sustenta" })).toBeInTheDocument();
    expect(screen.getByLabelText("Indicadores da base histórica")).toBeInTheDocument();

    await usuario.click(screen.getByRole("tab", { name: "Distribuições" }));

    expect(screen.getByLabelText("Distribuição por faixa de score")).toBeInTheDocument();
    expect(screen.getByLabelText("Distribuição por segmento")).toBeInTheDocument();

    await usuario.click(screen.getByRole("tab", { name: "Risco observado" }));

    expect(screen.getByLabelText("Inadimplência por segmento")).toBeInTheDocument();
    expect(screen.getByLabelText("Distribuição por métrica")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /03\s+Evidências/ })).toHaveAttribute("aria-selected", "true");
  });
});
