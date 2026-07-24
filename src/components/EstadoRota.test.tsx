import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EstadoRota } from "./EstadoRota";

describe("EstadoRota", () => {
  it("expõe carregamento como status ocupado", () => {
    render(
      <EstadoRota
        tipo="carregando"
        indice="CARTEIRA · CONSOLIDANDO"
        titulo="Consolidando a carteira"
        descricao="Organizando os indicadores."
      />,
    );

    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Consolidando a carteira");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("expõe erro de forma assertiva e permite tentar novamente", async () => {
    const onTentarNovamente = vi.fn();
    const usuario = userEvent.setup();
    render(
      <EstadoRota
        tipo="erro"
        indice="CLIENTES · INDISPONÍVEL"
        titulo="Não foi possível carregar os clientes"
        descricao="Tente novamente."
        onTentarNovamente={onTentarNovamente}
      />,
    );

    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
    await usuario.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(onTentarNovamente).toHaveBeenCalledOnce();
  });
});
