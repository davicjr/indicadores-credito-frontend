import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CadastrarClienteButton } from "./CadastrarClienteButton";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

describe("CadastrarClienteButton", () => {
  it("abre o modal de cadastro ao clicar, sem navegar pra uma página nova", async () => {
    const usuario = userEvent.setup();
    render(<CadastrarClienteButton />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /cadastrar cliente/i }));

    expect(screen.getByRole("dialog", { name: /cadastrar cliente/i })).toBeInTheDocument();
    expect(screen.getByLabelText("CPF")).toBeInTheDocument();
  });

  it("fecha o modal e atualiza a lista quando o cadastro é concluído", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "c9" }), { status: 201 })));
    render(<CadastrarClienteButton />);

    await usuario.click(screen.getByRole("button", { name: /cadastrar cliente/i }));
    const dialogo = screen.getByRole("dialog");
    await usuario.type(within(dialogo).getByLabelText("CPF"), "111.444.777-35");
    await usuario.type(within(dialogo).getByLabelText("Nome"), "Ana Silva");
    await usuario.type(within(dialogo).getByLabelText("Email"), "ana@exemplo.com");
    await usuario.type(within(dialogo).getByLabelText("Telefone"), "11999999999");
    await usuario.type(within(dialogo).getByLabelText("Data de nascimento"), "1990-05-10");
    await usuario.type(within(dialogo).getByLabelText("Utilização de crédito rotativo"), "0.3");
    await usuario.type(within(dialogo).getByLabelText("Razão dívida/renda"), "0.2");
    await usuario.type(within(dialogo).getByLabelText("Linhas de crédito abertas"), "3");
    await usuario.type(within(dialogo).getByLabelText("Empréstimos imobiliários"), "1");
    await usuario.type(within(dialogo).getByLabelText("Atrasos de 30 a 59 dias"), "0");
    await usuario.type(within(dialogo).getByLabelText("Atrasos de 60 a 89 dias"), "0");
    await usuario.type(within(dialogo).getByLabelText("Atrasos de 90 dias ou mais"), "0");
    await usuario.click(within(dialogo).getByRole("button", { name: "Cadastrar cliente" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(refresh).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("fecha o modal ao pressionar Escape", async () => {
    const usuario = userEvent.setup();
    render(<CadastrarClienteButton />);

    await usuario.click(screen.getByRole("button", { name: /cadastrar cliente/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await usuario.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
