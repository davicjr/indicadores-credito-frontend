import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DistribuicaoPorSegmento } from "./DistribuicaoPorSegmento";

describe("DistribuicaoPorSegmento", () => {
  it("mostra cada segmento com sua quantidade, em ordem de gravidade, do pior pro melhor", () => {
    render(
      <DistribuicaoPorSegmento
        distribuicao={[
          { segmento: 0, quantidade: 10 },
          { segmento: 3, quantidade: 5 },
          { segmento: 5, quantidade: 30 },
        ]}
        filtroAtivo={null}
        onSelecionar={vi.fn()}
      />
    );

    const tabela = screen.getByRole("table");
    const linhas = within(tabela)
      .getAllByRole("row")
      .slice(1)
      .map((linha) => within(linha).getAllByRole("cell").map((celula) => celula.textContent));

    expect(linhas).toEqual([
      ["No vermelho", "30"],
      ["Aperto no orçamento", "5"],
      ["Pagador exemplar", "10"],
    ]);
  });

  it("mostra estado vazio quando não há distribuição", () => {
    render(<DistribuicaoPorSegmento distribuicao={[]} filtroAtivo={null} onSelecionar={vi.fn()} />);

    expect(screen.getByText(/sem dados/i)).toBeInTheDocument();
  });

  it("clicar num segmento dispara onSelecionar com aquele segmento (filtro in-page, sem navegar)", async () => {
    const onSelecionar = vi.fn();
    const usuario = userEvent.setup();
    render(
      <DistribuicaoPorSegmento
        distribuicao={[{ segmento: 2, quantidade: 10 }]}
        filtroAtivo={null}
        onSelecionar={onSelecionar}
      />
    );

    await usuario.click(screen.getByRole("button", { name: "Cliente de confiança" }));

    expect(onSelecionar).toHaveBeenCalledWith(2);
    expect(screen.queryByText(/selecione um perfil para cruzar/i)).not.toBeInTheDocument();
  });

  it("marca o segmento filtrado como pressionado (aria-pressed) pra acessibilidade", () => {
    const { container } = render(
      <DistribuicaoPorSegmento
        distribuicao={[
          { segmento: 5, quantidade: 30 },
          { segmento: 2, quantidade: 10 },
        ]}
        filtroAtivo={2}
        onSelecionar={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Cliente de confiança" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "No vermelho" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(container.querySelector('rect[class*="barraSelecionada"]')).toHaveAttribute(
      "stroke",
      "var(--tinta)"
    );
    expect(container.querySelector('rect[fill-opacity="0.35"]')).toBeInTheDocument();
  });

  it("não anuncia interação nem usa botão quando o gráfico está em modo somente leitura", () => {
    render(<DistribuicaoPorSegmento distribuicao={[{ segmento: 2, quantidade: 10 }]} />);

    expect(screen.queryByRole("button", { name: "Cliente de confiança" })).not.toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Cliente de confiança" })).toBeInTheDocument();
  });
});
