import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Campo } from "./Campo";

describe("Campo", () => {
  it("associa o label ao input e propaga mudanças de valor", async () => {
    const usuario = userEvent.setup();
    const onChange = vi.fn();
    render(<Campo label="Nome" name="nome" value="" onChange={onChange} />);

    const input = screen.getByLabelText("Nome");
    await usuario.type(input, "Ana");

    expect(onChange).toHaveBeenCalled();
  });

  it("mostra a mensagem de erro quando fornecida", () => {
    render(<Campo label="Documento" name="documento" value="" onChange={vi.fn()} erro="CPF inválido" />);

    expect(screen.getByRole("alert")).toHaveTextContent("CPF inválido");
  });

  it("não mostra alerta quando não há erro", () => {
    render(<Campo label="Nome" name="nome" value="" onChange={vi.fn()} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("mostra a ajuda como tooltip (ícone + painel), associado ao input via aria-describedby", () => {
    render(
      <Campo label="Idade" name="idade" value="" onChange={vi.fn()} ajuda="Carteira real: 21 a 109 anos." />
    );

    expect(screen.getByRole("tooltip")).toHaveTextContent("Carteira real: 21 a 109 anos.");
    expect(screen.getByRole("button", { name: /ajuda sobre idade/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Idade")).toHaveAttribute("aria-describedby", "idade-ajuda");
  });

  it("não mostra o gatilho de ajuda quando não há ajuda", () => {
    render(<Campo label="Nome" name="nome" value="" onChange={vi.fn()} />);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("mostra o selo (badge) ao lado do label quando fornecido", () => {
    render(<Campo label="Idade" name="idade" value="" onChange={vi.fn()} badge={<span>#5</span>} />);

    expect(screen.getByText("#5")).toBeInTheDocument();
  });
});
