import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CriarUsuarioForm } from "./CriarUsuarioForm";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

describe("CriarUsuarioForm", () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
  });

  it("envia POST /api/usuarios com usuario, senha e papel, e navega pra lista", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "u2" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const interacao = userEvent.setup();

    render(<CriarUsuarioForm />);
    await interacao.type(screen.getByLabelText("Usuário"), "novo1");
    await interacao.type(screen.getByLabelText("Senha"), "senha1234");
    await interacao.selectOptions(screen.getByLabelText("Papel"), "ADMIN");
    await interacao.click(screen.getByRole("button", { name: /criar usuário/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/usuarios",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ usuario: "novo1", senha: "senha1234", papel: "ADMIN" }),
      })
    );
    expect(push).toHaveBeenCalledWith("/admin/usuarios");
  });

  it("mostra erro do backend quando o usuário já existe (409)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ mensagem: "usuário já cadastrado" }), { status: 409 }))
    );
    const interacao = userEvent.setup();

    render(<CriarUsuarioForm />);
    await interacao.type(screen.getByLabelText("Usuário"), "existente1");
    await interacao.type(screen.getByLabelText("Senha"), "senha1234");
    await interacao.click(screen.getByRole("button", { name: /criar usuário/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/já cadastrado/i);
    expect(push).not.toHaveBeenCalled();
  });

  it("chama onSucesso em vez de navegar quando fornecido (uso dentro de modal)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "u2" }), { status: 201 })));
    const interacao = userEvent.setup();
    const onSucesso = vi.fn();

    render(<CriarUsuarioForm onSucesso={onSucesso} />);
    await interacao.type(screen.getByLabelText("Usuário"), "novo1");
    await interacao.type(screen.getByLabelText("Senha"), "senha1234");
    await interacao.click(screen.getByRole("button", { name: /criar usuário/i }));

    await waitFor(() => expect(onSucesso).toHaveBeenCalled());
    expect(push).not.toHaveBeenCalled();
  });
});
