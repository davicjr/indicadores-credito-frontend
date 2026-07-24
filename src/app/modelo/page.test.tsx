import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const getCarteiraMock = vi.fn();
const getInadimplenciaPorSegmentoMock = vi.fn();
const getMetricasDisponiveisMock = vi.fn();
const getDistribuicaoMetricaMock = vi.fn();
const getImportanciaFeaturesMock = vi.fn();
const getResumoModeloMock = vi.fn();

vi.mock("@/lib/dados-api", () => ({
  getCarteira: () => getCarteiraMock(),
  getInadimplenciaPorSegmento: () => getInadimplenciaPorSegmentoMock(),
  getMetricasDisponiveis: () => getMetricasDisponiveisMock(),
  getDistribuicaoMetrica: (metrica: string) => getDistribuicaoMetricaMock(metrica),
  getImportanciaFeatures: () => getImportanciaFeaturesMock(),
}));
vi.mock("@/lib/modelo-api", () => ({
  getResumoModelo: () => getResumoModeloMock(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("ModeloPage", () => {
  it("busca carteira, inadimplência e a métrica inicial em paralelo e renderiza o ModeloView", async () => {
    getResumoModeloMock.mockResolvedValue({
      modeloAtivo: "logistic",
      metricas: [{ modelo: "logistic", auc: 0.855, ks: 0.56 }],
      totalRegistros: 149390,
      fracaoTeste: 0.2,
      escala: { pdo: 20, scoreBase: 600, oddsBase: 50 },
      quantidadeSegmentos: 4,
      geradoEm: null,
    });
    getImportanciaFeaturesMock.mockResolvedValue([
      { feature: "age", peso: -0.7 },
    ]);
    getCarteiraMock.mockResolvedValue({
      totalClientes: 149391,
      scoreMedio: 712,
      distribuicaoPorFaixa: [],
      distribuicaoPorSegmento: [],
    });
    getInadimplenciaPorSegmentoMock.mockResolvedValue([]);
    getMetricasDisponiveisMock.mockResolvedValue(["age", "atrasos_totais"]);
    getDistribuicaoMetricaMock.mockResolvedValue({ metrica: "atrasos_totais", faixas: [] });

    const { default: ModeloPage } = await import("./page");
    render(await ModeloPage());

    expect(screen.getByRole("heading", { name: "Sobre o modelo" })).toBeInTheDocument();
    expect(getCarteiraMock).toHaveBeenCalled();
    expect(getResumoModeloMock).toHaveBeenCalled();
    expect(getImportanciaFeaturesMock).toHaveBeenCalled();
    expect(getInadimplenciaPorSegmentoMock).toHaveBeenCalled();
    expect(getMetricasDisponiveisMock).toHaveBeenCalled();
    expect(getDistribuicaoMetricaMock).toHaveBeenCalledWith("atrasos_totais");
  });
});
