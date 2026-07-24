import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CriarUsuarioButton } from "./CriarUsuarioButton";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

describe("CriarUsuarioButton", () => {
  it("abre o modal de criação ao clicar", async () => {
    const usuario = userEvent.setup();
    render(<CriarUsuarioButton />);

    await usuario.click(screen.getByRole("button", { name: /criar usuário/i }));

    expect(screen.getByRole("dialog", { name: /criar usuário/i })).toBeInTheDocument();
  });

  it("fecha o modal e atualiza a lista quando o usuário é criado", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "u9" }), { status: 201 })));
    render(<CriarUsuarioButton />);

    await usuario.click(screen.getByRole("button", { name: /criar usuário/i }));
    const dialogo = screen.getByRole("dialog");
    await usuario.type(within(dialogo).getByLabelText("Usuário"), "novo1");
    await usuario.type(within(dialogo).getByLabelText("Senha"), "senha1234");
    await usuario.click(within(dialogo).getByRole("button", { name: /^criar usuário$/i }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(refresh).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
