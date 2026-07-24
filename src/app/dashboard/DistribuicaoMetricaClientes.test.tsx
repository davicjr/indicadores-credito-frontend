import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DistribuicaoMetricaClientes } from "./DistribuicaoMetricaClientes";

const DISTRIBUICAO_IDADE = {
  metrica: "idade",
  faixas: [
    { min: 25, max: 30, quantidade: 3 },
    { min: 31, max: 40, quantidade: 5 },
  ],
};
const METRICAS = ["idade", "rendaMensal"];

describe("DistribuicaoMetricaClientes", () => {
  it("mostra a distribuição numa tabela acessível, sem coluna de inadimplência", () => {
    render(
      <DistribuicaoMetricaClientes
        metricas={METRICAS}
        metricaSelecionada="idade"
        distribuicao={DISTRIBUICAO_IDADE}
        carregando={false}
        erro={null}
        filtroAtivo={null}
        onSelecionarMetrica={vi.fn()}
        onSelecionarFaixa={vi.fn()}
      />
    );

    const cabecalho = screen
      .getByRole("heading", { name: "Métricas dos clientes" })
      .closest('[class*="cabecalhoCartao"]');
    expect(cabecalho).toContainElement(screen.getByRole("combobox", { name: "Métrica" }));

    const tabela = screen.getByRole("table");
    const cabecalhos = within(tabela)
      .getAllByRole("columnheader")
      .map((celula) => celula.textContent);
    expect(cabecalhos).not.toContain(expect.stringMatching(/inadimpl/i));

    const linhas = within(tabela)
      .getAllByRole("row")
      .slice(1)
      .map((linha) => within(linha).getAllByRole("cell").map((celula) => celula.textContent));
    expect(linhas).toEqual([
      ["25 – 30", "3"],
      ["31 – 40", "5"],
    ]);
  });

  it("trocar a métrica no dropdown dispara onSelecionarMetrica (sem fetch próprio — orquestrador decide)", async () => {
    const onSelecionarMetrica = vi.fn();
    const usuario = userEvent.setup();
    render(
      <DistribuicaoMetricaClientes
        metricas={METRICAS}
        metricaSelecionada="idade"
        distribuicao={DISTRIBUICAO_IDADE}
        carregando={false}
        erro={null}
        filtroAtivo={null}
        onSelecionarMetrica={onSelecionarMetrica}
        onSelecionarFaixa={vi.fn()}
      />
    );

    await usuario.selectOptions(screen.getByRole("combobox", { name: "Métrica" }), "Renda mensal");

    expect(onSelecionarMetrica).toHaveBeenCalledWith("rendaMensal");
  });

  it("clicar numa faixa dispara o filtro cruzado e marca a faixa selecionada", async () => {
    const onSelecionarFaixa = vi.fn();
    const usuario = userEvent.setup();
    const { container, rerender } = render(
      <DistribuicaoMetricaClientes
        metricas={METRICAS}
        metricaSelecionada="idade"
        distribuicao={DISTRIBUICAO_IDADE}
        carregando={false}
        erro={null}
        filtroAtivo={null}
        onSelecionarMetrica={vi.fn()}
        onSelecionarFaixa={onSelecionarFaixa}
      />
    );

    await usuario.click(screen.getByRole("button", { name: "25 – 30" }));

    expect(onSelecionarFaixa).toHaveBeenCalledWith(expect.objectContaining({ min: 25, max: 30, quantidade: 3 }));

    onSelecionarFaixa.mockClear();
    const barra = container.querySelector(".recharts-bar-rectangle");
    expect(barra).not.toBeNull();
    await usuario.click(barra!);
    expect(onSelecionarFaixa).toHaveBeenCalledWith(expect.objectContaining({ min: 25, max: 30, quantidade: 3 }));

    rerender(
      <DistribuicaoMetricaClientes
        metricas={METRICAS}
        metricaSelecionada="idade"
        distribuicao={DISTRIBUICAO_IDADE}
        carregando={false}
        erro={null}
        filtroAtivo={{ tipo: "metrica", metrica: "idade", min: 25, max: 30 }}
        onSelecionarMetrica={vi.fn()}
        onSelecionarFaixa={onSelecionarFaixa}
      />
    );
    expect(screen.getByRole("button", { name: "25 – 30" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "31 – 40" })).not.toBeInTheDocument();
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(1);
    expect(container.querySelector('rect[class*="barraSelecionada"]')).toHaveAttribute(
      "stroke",
      "var(--tinta)"
    );
    expect(screen.queryByText(/selecione uma faixa para recalcular/i)).not.toBeInTheDocument();
  });

  it("mantém a faixa selecionada quando a API recalcula os limites da distribuição", () => {
    const { container } = render(
      <DistribuicaoMetricaClientes
        metricas={METRICAS}
        metricaSelecionada="razaoDividaRenda"
        distribuicao={{
          metrica: "razaoDividaRenda",
          faixas: [
            { min: 0.3, max: 0.4295, quantidade: 7 },
            { min: 0.5461, max: 1.7, quantidade: 6 },
          ],
        }}
        carregando={false}
        erro={null}
        filtroAtivo={{ tipo: "metrica", metrica: "razaoDividaRenda", min: 0.4295, max: 0.5461 }}
        quantidadeSelecionada={3}
        onSelecionarMetrica={vi.fn()}
        onSelecionarFaixa={vi.fn()}
      />
    );

    expect(screen.queryByText(/sem clientes suficientes/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "0,43 – 0,55" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("cell", { name: "3" })).toBeInTheDocument();
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(1);
  });

  it("mantém o gráfico visível e esmaecido enquanto o orquestrador está buscando", () => {
    const { container } = render(
      <DistribuicaoMetricaClientes
        metricas={METRICAS}
        metricaSelecionada="idade"
        distribuicao={DISTRIBUICAO_IDADE}
        carregando={true}
        erro={null}
        filtroAtivo={null}
        onSelecionarMetrica={vi.fn()}
        onSelecionarFaixa={vi.fn()}
      />
    );

    expect(screen.getByText(/atualizando/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Distribuição dos clientes por métrica")).toHaveAttribute(
      "aria-busy",
      "true"
    );
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(2);
  });

  it("mostra o erro passado pelo orquestrador", () => {
    render(
      <DistribuicaoMetricaClientes
        metricas={METRICAS}
        metricaSelecionada="idade"
        distribuicao={DISTRIBUICAO_IDADE}
        carregando={false}
        erro="Não foi possível carregar essa métrica. Tente novamente."
        filtroAtivo={null}
        onSelecionarMetrica={vi.fn()}
        onSelecionarFaixa={vi.fn()}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/não foi possível carregar/i);
  });

  it("mostra só o número quando o bucket é de valor único (min = max, ex.: atrasos discretos)", () => {
    render(
      <DistribuicaoMetricaClientes
        metricas={METRICAS}
        metricaSelecionada="atrasos30a59Dias"
        distribuicao={{
          metrica: "atrasos30a59Dias",
          faixas: [
            { min: 0, max: 0, quantidade: 120 },
            { min: 1, max: 1, quantidade: 20 },
          ],
        }}
        carregando={false}
        erro={null}
        filtroAtivo={null}
        onSelecionarMetrica={vi.fn()}
        onSelecionarFaixa={vi.fn()}
      />
    );

    const tabela = screen.getByRole("table");
    const linhas = within(tabela)
      .getAllByRole("row")
      .slice(1)
      .map((linha) => within(linha).getAllByRole("cell").map((celula) => celula.textContent));
    expect(linhas).toEqual([
      ["0", "120"],
      ["1", "20"],
    ]);
  });

  it("mostra estado vazio quando não há clientes suficientes pra essa métrica", () => {
    render(
      <DistribuicaoMetricaClientes
        metricas={METRICAS}
        metricaSelecionada="idade"
        distribuicao={{ metrica: "idade", faixas: [] }}
        carregando={false}
        erro={null}
        filtroAtivo={null}
        onSelecionarMetrica={vi.fn()}
        onSelecionarFaixa={vi.fn()}
      />
    );

    expect(screen.getByText(/sem clientes suficientes/i)).toBeInTheDocument();
  });
});
