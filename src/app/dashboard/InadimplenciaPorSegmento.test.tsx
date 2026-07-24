import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InadimplenciaPorSegmento } from "./InadimplenciaPorSegmento";

describe("InadimplenciaPorSegmento", () => {
  it("mostra a taxa de inadimplência de cada segmento formatada em porcentagem", () => {
    render(
      <InadimplenciaPorSegmento
        segmentos={[
          { segmento: 5, totalClientes: 20000, taxaInadimplencia: 0.348 },
          { segmento: 2, totalClientes: 30000, taxaInadimplencia: 0.017 },
        ]}
      />
    );

    const tabela = screen.getByRole("table");
    const linhas = within(tabela)
      .getAllByRole("row")
      .slice(1)
      .map((linha) => within(linha).getAllByRole("cell").map((celula) => celula.textContent));

    expect(linhas).toEqual([
      ["Cliente de confiança", "1,7%"],
      ["No vermelho", "34,8%"],
    ]);
    expect(screen.getByText(/escala comum de 0% a 100%/i)).toBeInTheDocument();
  });

  it("mostra estado vazio quando não há segmentos", () => {
    render(<InadimplenciaPorSegmento segmentos={[]} />);

    expect(screen.getByText(/sem dados/i)).toBeInTheDocument();
  });
});
