import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardView } from "./DashboardView";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

const RESUMO_BASE = {
  totalClientes: 2,
  scoreMedio: 660,
  distribuicaoPorFaixa: [{ faixa: "Regular", quantidade: 2 }],
  distribuicaoPorSegmento: [{ segmento: 1, quantidade: 2 }],
};
const DISTRIBUICAO_METRICA_BASE = { metrica: "idade", faixas: [{ min: 30, max: 40, quantidade: 2 }] };

afterEach(() => {
  vi.unstubAllGlobals();
  replaceMock.mockClear();
});

describe("DashboardView", () => {
  it("compõe resumo, distribuições e a métrica dos clientes reais", () => {
    render(
      <DashboardView
        resumoInicial={RESUMO_BASE}
        metricas={["idade", "rendaMensal"]}
        metricaInicial="idade"
        distribuicaoMetricaInicial={DISTRIBUICAO_METRICA_BASE}
        filtroInicial={null}
      />
    );

    expect(screen.getByRole("heading", { name: "Carteira de clientes" })).toBeInTheDocument();
    expect(screen.getByLabelText("Indicadores da carteira")).toBeInTheDocument();
    expect(screen.queryByText("Resumo da carteira")).not.toBeInTheDocument();
    expect(screen.getByText("Clientes ativos")).toBeInTheDocument();
    expect(screen.getByLabelText("Distribuição por faixa de score")).toBeInTheDocument();
    expect(screen.getByLabelText("Distribuição por segmento")).toBeInTheDocument();
    expect(screen.getByLabelText("Distribuição dos clientes por métrica")).toBeInTheDocument();
    // Inadimplência exige resultado real conhecido (só a base histórica tem) — não faz sentido
    // aqui, achado do próprio usuário navegando a aplicação.
    expect(screen.queryByLabelText("Inadimplência por segmento")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("não quebra quando nenhum cliente ainda tem score calculado", () => {
    render(
      <DashboardView
        resumoInicial={{ totalClientes: 2, scoreMedio: null, distribuicaoPorFaixa: [], distribuicaoPorSegmento: [] }}
        metricas={["idade"]}
        metricaInicial="idade"
        distribuicaoMetricaInicial={{ metrica: "idade", faixas: [] }}
        filtroInicial={null}
      />
    );

    expect(screen.getByText(/sem score calculado/i)).toBeInTheDocument();
  });

  it("clicar numa faixa mostra o chip de filtro e atualiza a URL, sem navegar pra /clientes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          totalClientes: 1,
          scoreMedio: 610,
          distribuicaoPorFaixa: [{ faixa: "Regular", quantidade: 1 }],
          distribuicaoPorSegmento: [{ segmento: 1, quantidade: 1 }],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    const usuario = userEvent.setup();

    render(
      <DashboardView
        resumoInicial={RESUMO_BASE}
        metricas={["idade"]}
        metricaInicial="idade"
        distribuicaoMetricaInicial={DISTRIBUICAO_METRICA_BASE}
        filtroInicial={null}
      />
    );

    await usuario.click(screen.getByRole("button", { name: "Regular" }));

    expect(replaceMock).toHaveBeenCalledWith("/dashboard?faixa=Regular", { scroll: false });
    expect(screen.getByRole("status")).toHaveTextContent("Filtrando por: Regular");
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/clientes/resumo?faixa=Regular");
    });
  });

  it("clicar numa barra de métrica aplica o mesmo filtro cruzado e permite limpar no segundo clique", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.startsWith("/api/clientes/resumo")) {
        return Promise.resolve(new Response(JSON.stringify(RESUMO_BASE), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify(DISTRIBUICAO_METRICA_BASE), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);
    const usuario = userEvent.setup();

    render(
      <DashboardView
        resumoInicial={RESUMO_BASE}
        metricas={["idade"]}
        metricaInicial="idade"
        distribuicaoMetricaInicial={DISTRIBUICAO_METRICA_BASE}
        filtroInicial={null}
      />
    );

    const faixa = screen.getByRole("button", { name: "30 – 40" });
    await usuario.click(faixa);

    expect(replaceMock).toHaveBeenCalledWith("/dashboard?metrica=idade&min=30&max=40", { scroll: false });
    expect(screen.getByRole("status")).toHaveTextContent("Filtrando por: Idade: 30 – 40");
    expect(faixa).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/clientes/resumo?metrica=idade&min=30&max=40");
      expect(fetchMock).toHaveBeenCalledWith("/api/clientes/distribuicao/idade?metrica=idade&min=30&max=40");
    });

    await usuario.click(screen.getByRole("button", { name: "30 – 40" }));
    expect(replaceMock).toHaveBeenLastCalledWith("/dashboard", { scroll: false });
  });

  it("filtro inicial (vindo da URL/SSR) já mostra o chip e a barra pressionada", () => {
    render(
      <DashboardView
        resumoInicial={RESUMO_BASE}
        metricas={["idade"]}
        metricaInicial="idade"
        distribuicaoMetricaInicial={DISTRIBUICAO_METRICA_BASE}
        filtroInicial={{ tipo: "faixa", valor: "Regular" }}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("Filtrando por: Regular");
    expect(screen.getByRole("button", { name: "Regular" })).toHaveAttribute("aria-pressed", "true");
  });

  it("pressionar Escape limpa qualquer filtro ativo", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation((url: string) => {
      const dados = url.includes("/distribuicao/") ? DISTRIBUICAO_METRICA_BASE : RESUMO_BASE;
      return Promise.resolve(new Response(JSON.stringify(dados), { status: 200 }));
    }));
    const usuario = userEvent.setup();

    render(
      <DashboardView
        resumoInicial={RESUMO_BASE}
        metricas={["idade"]}
        metricaInicial="idade"
        distribuicaoMetricaInicial={DISTRIBUICAO_METRICA_BASE}
        filtroInicial={{ tipo: "faixa", valor: "Regular" }}
      />
    );

    await usuario.keyboard("{Escape}");

    expect(replaceMock).toHaveBeenLastCalledWith("/dashboard", { scroll: false });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("clicar no × do chip limpa o filtro e volta pra URL sem query", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(RESUMO_BASE), { status: 200 })));
    const usuario = userEvent.setup();

    render(
      <DashboardView
        resumoInicial={RESUMO_BASE}
        metricas={["idade"]}
        metricaInicial="idade"
        distribuicaoMetricaInicial={DISTRIBUICAO_METRICA_BASE}
        filtroInicial={{ tipo: "faixa", valor: "Regular" }}
      />
    );

    await usuario.click(screen.getByRole("button", { name: "Limpar filtro" }));

    expect(replaceMock).toHaveBeenCalledWith("/dashboard", { scroll: false });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
