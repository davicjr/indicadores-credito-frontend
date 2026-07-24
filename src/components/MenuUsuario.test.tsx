import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MenuUsuario } from "./MenuUsuario";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

describe("MenuUsuario", () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    document.documentElement.setAttribute("data-theme", "light");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
  });

  it("mostra a inicial do usuario como avatar, painel fechado por padrão", () => {
    render(<MenuUsuario usuario={{ id: "u1", usuario: "ana1", papel: "ANALISTA", ativo: true }} />);

    expect(screen.getByRole("button", { name: /menu do usuário/i })).toHaveTextContent("A");
    expect(screen.queryByText("ana1")).not.toBeInTheDocument();
  });

  it("clicar no avatar abre o painel com usuario e papel", async () => {
    const usuario = userEvent.setup();
    render(<MenuUsuario usuario={{ id: "u1", usuario: "ana1", papel: "ANALISTA", ativo: true }} />);

    await usuario.click(screen.getByRole("button", { name: /menu do usuário/i }));

    expect(screen.getByText("ana1")).toBeInTheDocument();
    expect(within(screen.getByRole("menu")).getByText("Analista")).toBeInTheDocument();
  });

  it("botão de tema alterna data-theme sem fechar o resto do fluxo", async () => {
    const usuario = userEvent.setup();
    render(<MenuUsuario usuario={{ id: "u1", usuario: "ana1", papel: "ADMIN", ativo: true }} />);

    await usuario.click(screen.getByRole("button", { name: /menu do usuário/i }));
    await usuario.click(screen.getByRole("menuitem", { name: /tema escuro/i }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("sair chama /api/auth/logout e navega pro /login", async () => {
    const usuario = userEvent.setup();
    render(<MenuUsuario usuario={{ id: "u1", usuario: "ana1", papel: "ANALISTA", ativo: true }} />);

    await usuario.click(screen.getByRole("button", { name: /menu do usuário/i }));
    await usuario.click(screen.getByRole("menuitem", { name: "Sair" }));

    expect(fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    expect(push).toHaveBeenCalledWith("/login");
  });

  it("tem um link pro perfil", async () => {
    const usuario = userEvent.setup();
    render(<MenuUsuario usuario={{ id: "u1", usuario: "ana1", papel: "ANALISTA", ativo: true }} />);

    await usuario.click(screen.getByRole("button", { name: /menu do usuário/i }));

    expect(screen.getByRole("menuitem", { name: /meu perfil/i })).toHaveAttribute("href", "/perfil");
  });

  it("admin tem acesso à gestão de usuários", async () => {
    const usuario = userEvent.setup();
    render(<MenuUsuario usuario={{ id: "u1", usuario: "ana1", papel: "ADMIN", ativo: true }} />);

    await usuario.click(screen.getByRole("button", { name: /menu do usuário/i }));

    expect(screen.getByRole("menuitem", { name: /gestão de usuários/i })).toHaveAttribute(
      "href",
      "/admin/usuarios"
    );
  });

  it("Escape fecha o painel e devolve foco ao gatilho", async () => {
    const usuario = userEvent.setup();
    render(<MenuUsuario usuario={{ id: "u1", usuario: "ana1", papel: "ANALISTA", ativo: true }} />);
    const gatilho = screen.getByRole("button", { name: /menu do usuário/i });

    await usuario.click(gatilho);
    await usuario.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(gatilho).toHaveFocus();
  });
});
