import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MetricasCarteira } from "./MetricasCarteira";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MetricasCarteira", () => {
  it("mostra o título do card e a métrica inicial selecionada", () => {
    render(
      <MetricasCarteira
        metricas={["age", "atrasos_totais"]}
        metricaInicial="age"
        distribuicaoInicial={{
          metrica: "age",
          faixas: [{ min: 20, max: 33, quantidade: 16855, taxaInadimplencia: 0.114 }],
        }}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Relação entre variáveis e inadimplência",
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Métrica" })).toHaveValue("age");
    expect(screen.getByRole("option", { name: "Idade" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Atrasos" })).toBeInTheDocument();
    expect(screen.queryByText("Legenda")).not.toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "11,4%" })).toBeInTheDocument();
  });

  it("troca a distribuição ao selecionar outra opção no dropdown", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          metrica: "atrasos_totais",
          faixas: [{ min: 0, max: 1, quantidade: 120, taxaInadimplencia: 0.08 }],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    const usuario = userEvent.setup();

    render(
      <MetricasCarteira
        metricas={["age", "atrasos_totais"]}
        metricaInicial="age"
        distribuicaoInicial={{
          metrica: "age",
          faixas: [{ min: 20, max: 33, quantidade: 100, taxaInadimplencia: 0.1 }],
        }}
      />
    );

    await usuario.selectOptions(screen.getByRole("combobox", { name: "Métrica" }), "atrasos_totais");

    expect(fetchMock).toHaveBeenCalledWith("/api/metricas/distribuicao/atrasos_totais");
    expect(screen.getByRole("combobox", { name: "Métrica" })).toHaveValue("atrasos_totais");
    expect(await screen.findAllByText("0 – 1")).not.toHaveLength(0);
  });
});
