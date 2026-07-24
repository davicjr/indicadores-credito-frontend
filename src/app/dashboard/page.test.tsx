import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const getResumoClientesMock = vi.fn();
const getDistribuicaoMetricaClienteMock = vi.fn();

vi.mock("@/lib/clientes-api", () => ({
  getResumoClientes: (filtro: unknown) => getResumoClientesMock(filtro),
  getDistribuicaoMetricaCliente: (metrica: string, filtro: unknown) =>
    getDistribuicaoMetricaClienteMock(metrica, filtro),
  METRICAS_CLIENTES: ["idade", "rendaMensal"],
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

describe("DashboardPage", () => {
  it("busca o resumo e a métrica inicial dos clientes reais (sem filtro), renderizando o DashboardView", async () => {
    getResumoClientesMock.mockResolvedValue({
      totalClientes: 2,
      scoreMedio: 660,
      distribuicaoPorFaixa: [],
      distribuicaoPorSegmento: [],
    });
    getDistribuicaoMetricaClienteMock.mockResolvedValue({ metrica: "rendaMensal", faixas: [] });

    const { default: DashboardPage } = await import("./page");
    render(await DashboardPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Carteira de clientes" })).toBeInTheDocument();
    expect(getResumoClientesMock).toHaveBeenCalledWith(null);
    expect(getDistribuicaoMetricaClienteMock).toHaveBeenCalledWith("idade", null);
  });

  it("com ?faixa= na URL, busca já filtrado (SSR reflete o filtro compartilhado)", async () => {
    getResumoClientesMock.mockResolvedValue({
      totalClientes: 1,
      scoreMedio: 610,
      distribuicaoPorFaixa: [{ faixa: "Ruim", quantidade: 1 }],
      distribuicaoPorSegmento: [],
    });
    getDistribuicaoMetricaClienteMock.mockResolvedValue({ metrica: "idade", faixas: [] });

    const { default: DashboardPage } = await import("./page");
    render(await DashboardPage({ searchParams: Promise.resolve({ faixa: "Ruim" }) }));

    expect(getResumoClientesMock).toHaveBeenCalledWith({ tipo: "faixa", valor: "Ruim" });
    expect(getDistribuicaoMetricaClienteMock).toHaveBeenCalledWith("idade", { tipo: "faixa", valor: "Ruim" });
    expect(screen.getByRole("status")).toHaveTextContent("Filtrando por: Ruim");
  });

  it("com faixa de métrica na URL, busca o recorte no SSR e mostra o chip", async () => {
    getResumoClientesMock.mockResolvedValue({
      totalClientes: 1,
      scoreMedio: 610,
      distribuicaoPorFaixa: [],
      distribuicaoPorSegmento: [],
    });
    getDistribuicaoMetricaClienteMock.mockResolvedValue({ metrica: "idade", faixas: [] });

    const { default: DashboardPage } = await import("./page");
    render(
      await DashboardPage({
        searchParams: Promise.resolve({ metrica: "rendaMensal", min: "2500", max: "4000" }),
      })
    );

    const filtro = { tipo: "metrica", metrica: "rendaMensal", min: 2500, max: 4000 };
    expect(getResumoClientesMock).toHaveBeenCalledWith(filtro);
    expect(getDistribuicaoMetricaClienteMock).toHaveBeenCalledWith("rendaMensal", filtro);
    expect(screen.getByRole("combobox", { name: "Métrica" })).toHaveValue("rendaMensal");
    expect(screen.getByRole("status")).toHaveTextContent("Filtrando por: Renda mensal: 2.500 – 4.000");
  });
});
