import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Usuario } from "@/lib/usuario-api";
import { EditarUsuarioButton } from "./EditarUsuarioButton";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const usuario: Usuario = { id: "u1", usuario: "ana1", papel: "ANALISTA", ativo: true };

describe("EditarUsuarioButton", () => {
  it("abre o modal de edição pré-preenchido", async () => {
    const usuarioInteracao = userEvent.setup();
    render(<EditarUsuarioButton usuario={usuario} />);

    await usuarioInteracao.click(screen.getByRole("button", { name: /^editar$/i }));

    expect(screen.getByRole("dialog", { name: /editar usuário/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Usuário")).toHaveValue("ana1");
  });

  it("fecha o modal e atualiza a lista quando a edição é salva", async () => {
    const usuarioInteracao = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "u1" }), { status: 200 })));
    render(<EditarUsuarioButton usuario={usuario} />);

    await usuarioInteracao.click(screen.getByRole("button", { name: /^editar$/i }));
    await usuarioInteracao.click(screen.getByRole("button", { name: /^salvar$/i }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(refresh).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
