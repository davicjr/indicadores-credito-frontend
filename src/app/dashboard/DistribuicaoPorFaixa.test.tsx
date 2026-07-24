import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DistribuicaoPorFaixa } from "./DistribuicaoPorFaixa";

describe("DistribuicaoPorFaixa", () => {
  it("mostra cada faixa em ordem de gravidade, do pior pro melhor, com a quantidade", () => {
    render(
      <DistribuicaoPorFaixa
        distribuicao={[
          { faixa: "Excelente", quantidade: 100 },
          { faixa: "Ruim", quantidade: 50 },
          { faixa: "Bom", quantidade: 200 },
        ]}
        filtroAtivo={null}
        onSelecionar={vi.fn()}
      />
    );

    // tabela acessível (sr-only) é a fonte de verdade testável — o SVG do Recharts não
    // renderiza os rótulos de categoria em jsdom (limitação de medição de texto SVG),
    // e é a mesma tabela que um leitor de tela usa (o gráfico visual é aria-hidden)
    const tabela = screen.getByRole("table");
    const linhas = within(tabela)
      .getAllByRole("row")
      .slice(1) // pula o cabeçalho
      .map((linha) => within(linha).getAllByRole("cell").map((celula) => celula.textContent));

    expect(linhas).toEqual([
      ["Ruim", "50"],
      ["Bom", "200"],
      ["Excelente", "100"],
    ]);
  });

  it("mostra estado vazio quando não há distribuição", () => {
    render(<DistribuicaoPorFaixa distribuicao={[]} filtroAtivo={null} onSelecionar={vi.fn()} />);

    expect(screen.getByText(/sem dados/i)).toBeInTheDocument();
  });

  it("clicar numa faixa dispara onSelecionar com aquela faixa (filtro in-page, sem navegar)", async () => {
    const onSelecionar = vi.fn();
    const usuario = userEvent.setup();
    render(<DistribuicaoPorFaixa distribuicao={[{ faixa: "Bom", quantidade: 200 }]} filtroAtivo={null} onSelecionar={onSelecionar} />);

    await usuario.click(screen.getByRole("button", { name: "Bom" }));

    expect(onSelecionar).toHaveBeenCalledWith("Bom");
    expect(screen.queryByText(/selecione uma barra para cruzar/i)).not.toBeInTheDocument();
  });

  it("marca a faixa filtrada como pressionada (aria-pressed) pra acessibilidade", () => {
    const { container } = render(
      <DistribuicaoPorFaixa
        distribuicao={[
          { faixa: "Bom", quantidade: 200 },
          { faixa: "Ruim", quantidade: 50 },
        ]}
        filtroAtivo="Bom"
        onSelecionar={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Bom" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Ruim" })).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelector('rect[class*="barraSelecionada"]')).toHaveAttribute(
      "stroke",
      "var(--tinta)"
    );
    expect(container.querySelector('rect[fill-opacity="0.35"]')).toBeInTheDocument();
  });

  it("não anuncia interação nem usa botão quando o gráfico está em modo somente leitura", () => {
    render(<DistribuicaoPorFaixa distribuicao={[{ faixa: "Bom", quantidade: 200 }]} />);

    expect(screen.queryByRole("button", { name: "Bom" })).not.toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Bom" })).toBeInTheDocument();
  });
});
