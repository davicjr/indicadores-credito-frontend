import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FiltroCarteiraChip } from "./FiltroCarteiraChip";

describe("FiltroCarteiraChip", () => {
  it("mostra o rótulo do filtro de faixa ativo", () => {
    render(<FiltroCarteiraChip filtro={{ tipo: "faixa", valor: "Ruim" }} onLimpar={vi.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent("Filtrando por: Ruim");
  });

  it("mostra o nome de negócio do segmento ativo", () => {
    render(<FiltroCarteiraChip filtro={{ tipo: "segmento", valor: 2 }} onLimpar={vi.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent("Filtrando por: Cliente de confiança");
  });

  it("clicar no × dispara onLimpar", async () => {
    const onLimpar = vi.fn();
    const usuario = userEvent.setup();
    render(<FiltroCarteiraChip filtro={{ tipo: "faixa", valor: "Ruim" }} onLimpar={onLimpar} />);

    await usuario.click(screen.getByRole("button", { name: "Limpar filtro" }));

    expect(onLimpar).toHaveBeenCalled();
  });
});
