import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home (hub pós-login)", () => {
  it("mostra atalhos pras 3 áreas principais", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Decisões de crédito com contexto real." })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "O que você quer fazer?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explorar dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard"
    );
    expect(screen.getByRole("link", { name: /acessar clientes/i })).toHaveAttribute("href", "/clientes");
    expect(screen.getByRole("link", { name: /simular um score/i })).toHaveAttribute("href", "/simulador");
  });
});
