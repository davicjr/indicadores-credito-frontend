import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Usuario } from "@/lib/usuario-api";
import { Nav } from "./Nav";

const usePathnameMock = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const usuario: Usuario = { id: "u1", usuario: "ana1", papel: "ANALISTA", ativo: true };

describe("Nav", () => {
  it("mostra os links das áreas e marca a rota atual como ativa", () => {
    usePathnameMock.mockReturnValue("/clientes");
    render(<Nav usuario={usuario} />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Simulador" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Índice Real — página inicial" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Clientes" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
    expect(
      screen
        .getAllByRole("link")
        .map((link) => link.getAttribute("href"))
        .filter((href) => ["/clientes", "/dashboard", "/simulador", "/modelo"].includes(href ?? ""))
    ).toEqual(["/clientes", "/dashboard", "/simulador", "/modelo"]);
  });

  it("mostra o menu do usuário com acesso ao logout", async () => {
    usePathnameMock.mockReturnValue("/dashboard");
    const usuarioInteracao = userEvent.setup();
    render(<Nav usuario={usuario} />);

    await usuarioInteracao.click(screen.getByRole("button", { name: /menu do usuário/i }));

    expect(screen.getByRole("menuitem", { name: "Sair" })).toBeInTheDocument();
  });

  it("sem usuário (sessão não resolvida), não quebra e não mostra o menu", () => {
    usePathnameMock.mockReturnValue("/dashboard");
    render(<Nav usuario={null} />);

    expect(screen.queryByRole("button", { name: /menu do usuário/i })).not.toBeInTheDocument();
  });

  it("marca a logomark como link atual na home", () => {
    usePathnameMock.mockReturnValue("/");
    render(<Nav usuario={usuario} />);

    expect(screen.getByRole("link", { name: "Índice Real — página inicial" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
