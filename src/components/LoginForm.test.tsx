import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("identifica os campos para preenchimento e gerenciadores de senha", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Usuário")).toHaveAttribute("autocomplete", "username");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("form")).toHaveAttribute("aria-busy", "false");
  });

  it("credenciais válidas: envia pro /api/auth/login e navega pro dashboard", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const interacao = userEvent.setup();
    render(<LoginForm />);

    await interacao.type(screen.getByLabelText("Usuário"), "analista1");
    await interacao.type(screen.getByLabelText("Senha"), "senhaSegura123");
    await interacao.click(screen.getByRole("button", { name: "Entrar" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ usuario: "analista1", senha: "senhaSegura123" }),
      }),
    );
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("credenciais inválidas: mostra a mensagem de erro do backend, não navega", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ mensagem: "usuário ou senha inválidos" }), { status: 401 }),
    );
    const interacao = userEvent.setup();
    render(<LoginForm />);

    await interacao.type(screen.getByLabelText("Usuário"), "analista1");
    await interacao.type(screen.getByLabelText("Senha"), "senhaErrada");
    await interacao.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("usuário ou senha inválidos");
    expect(push).not.toHaveBeenCalled();
  });
});
