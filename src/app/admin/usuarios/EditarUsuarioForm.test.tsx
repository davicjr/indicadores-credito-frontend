import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Usuario } from "@/lib/usuario-api";
import { EditarUsuarioForm } from "./EditarUsuarioForm";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const usuario: Usuario = { id: "u1", usuario: "ana1", papel: "ANALISTA", ativo: true };

describe("EditarUsuarioForm", () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
  });

  it("pré-preenche usuario e papel, envia PUT /api/usuarios/{id} e navega pra lista", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "u1" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const usuarioInteracao = userEvent.setup();

    render(<EditarUsuarioForm usuario={usuario} />);

    expect(screen.getByLabelText("Usuário")).toHaveValue("ana1");
    expect(screen.getByLabelText("Papel")).toHaveValue("ANALISTA");

    await usuarioInteracao.clear(screen.getByLabelText("Usuário"));
    await usuarioInteracao.type(screen.getByLabelText("Usuário"), "ana2");
    await usuarioInteracao.selectOptions(screen.getByLabelText("Papel"), "ADMIN");
    await usuarioInteracao.click(screen.getByRole("button", { name: /salvar/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/usuarios/u1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ usuario: "ana2", papel: "ADMIN" }),
      })
    );
    expect(push).toHaveBeenCalledWith("/admin/usuarios");
    vi.unstubAllGlobals();
  });

  it("mostra erro do backend quando tenta rebaixar o último admin (409)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ mensagem: "não é possível remover o último administrador ativo" }), {
          status: 409,
        })
      )
    );
    const usuarioInteracao = userEvent.setup();

    render(<EditarUsuarioForm usuario={{ ...usuario, papel: "ADMIN" }} />);
    await usuarioInteracao.click(screen.getByRole("button", { name: /salvar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/último administrador/i);
    expect(push).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("chama onSucesso em vez de navegar quando fornecido (uso dentro de modal)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "u1" }), { status: 200 })));
    const usuarioInteracao = userEvent.setup();
    const onSucesso = vi.fn();

    render(<EditarUsuarioForm usuario={usuario} onSucesso={onSucesso} />);
    await usuarioInteracao.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(onSucesso).toHaveBeenCalled());
    expect(push).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
