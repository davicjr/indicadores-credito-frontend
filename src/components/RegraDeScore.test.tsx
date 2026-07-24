import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { corDaFaixa } from "@/lib/faixas";
import { RegraDeScore } from "./RegraDeScore";

describe("RegraDeScore", () => {
  it("mostra o número do score e o nome da faixa", () => {
    render(<RegraDeScore score={712} faixa="Bom" />);

    expect(screen.getByTestId("regua-score-numero")).toHaveTextContent("712");
    expect(screen.getByText("Bom")).toBeInTheDocument();
  });

  it("colore o número na cor da faixa correspondente", () => {
    render(<RegraDeScore score={575} faixa="Ruim" />);

    expect(screen.getByTestId("regua-score-numero")).toHaveStyle({ color: corDaFaixa("Ruim") });
  });

  it("posiciona o indicador proporcionalmente à escala 300-850", () => {
    render(<RegraDeScore score={575} faixa="Ruim" />);

    const indicador = screen.getByTestId("regua-indicador");
    expect(indicador.style.left).toBe(`${((575 - 300) / (850 - 300)) * 100}%`);
  });

  it("mostra os limites e alinha a faixa diretamente em cima do número", () => {
    render(<RegraDeScore score={575} faixa="Ruim" />);

    expect(screen.getByText("300")).toBeInTheDocument();
    expect(screen.getByText("850")).toBeInTheDocument();
    const numero = screen.getByTestId("regua-score-numero");
    const faixa = screen.getByText("Ruim");
    expect(numero).toHaveTextContent("575");
    expect(faixa.parentElement).toBe(numero.parentElement);
    expect(faixa.style.left).toBe(numero.style.left);
    expect(numero.style.left).toBe(`${((575 - 300) / (850 - 300)) * 100}%`);
  });

  it("clampa a posição do número na régua pra não transbordar num score perto das pontas", () => {
    render(<RegraDeScore score={305} faixa="Ruim" />);

    const numero = screen.getByTestId("regua-score-numero");
    expect(Number.parseFloat(numero.style.left)).toBeGreaterThanOrEqual(6);
  });

  it("mostra estado sem score quando o cliente ainda não foi avaliado", () => {
    render(<RegraDeScore score={null} faixa={null} />);

    expect(screen.getByText(/sem score calculado/i)).toBeInTheDocument();
  });
});
