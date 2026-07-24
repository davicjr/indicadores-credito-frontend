import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CasosReaisSimulador } from "./CasosReaisSimulador";

describe("CasosReaisSimulador", () => {
  it("mostra os 6 arquétipos, compactos, com o nome e o ícone de ajuda", () => {
    render(<CasosReaisSimulador onEscolher={vi.fn()} />);

    expect(screen.getByText("No vermelho")).toBeInTheDocument();
    expect(screen.getByText("Cliente de confiança")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sobre o perfil no vermelho/i })).toBeInTheDocument();
  });

  it("apresenta os arquétipos em ordem de histórico de atraso, do maior risco pro menor", () => {
    render(<CasosReaisSimulador onEscolher={vi.fn()} />);

    const nomes = [
      "No vermelho",
      "Endividamento crítico",
      "Aperto no orçamento",
      "Cliente de confiança",
      "Pagador tranquilo",
      "Pagador exemplar",
    ];
    const cards = nomes.map((nome) => screen.getByRole("button", { name: nome }));

    expect(
      cards.every(
        (card, indice) =>
          indice === 0 ||
          Boolean(
            cards[indice - 1].compareDocumentPosition(card) &
              Node.DOCUMENT_POSITION_FOLLOWING
          )
      )
    ).toBe(true);
  });

  it("a história de cada perfil mora dentro do tooltip do ícone de ajuda, não solta no card", () => {
    render(<CasosReaisSimulador onEscolher={vi.fn()} />);

    const historia = screen.getByText(/perfil de maior risco/i);
    expect(historia.closest('[role="tooltip"]')).not.toBeNull();
  });

  it("clicar em qualquer ponto do card chama onEscolher com o caso certo", async () => {
    const usuario = userEvent.setup();
    const onEscolher = vi.fn();
    render(<CasosReaisSimulador onEscolher={onEscolher} />);

    await usuario.click(screen.getByRole("button", { name: "Cliente de confiança" }));

    expect(onEscolher).toHaveBeenCalledWith(expect.objectContaining({ nome: "Cliente de confiança" }));
  });

  it("Enter no card focado também escolhe o caso (teclado, não só mouse)", async () => {
    const usuario = userEvent.setup();
    const onEscolher = vi.fn();
    render(<CasosReaisSimulador onEscolher={onEscolher} />);

    screen.getByRole("button", { name: "Pagador tranquilo" }).focus();
    await usuario.keyboard("{Enter}");

    expect(onEscolher).toHaveBeenCalledWith(expect.objectContaining({ nome: "Pagador tranquilo" }));
  });
});
