import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ToastProvider";
import { TrocarSenhaForm } from "./TrocarSenhaForm";

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderComProvider() {
  return render(
    <ToastProvider>
      <TrocarSenhaForm />
    </ToastProvider>
  );
}

async function preencher(
  usuario: ReturnType<typeof userEvent.setup>,
  valores: { senhaAtual: string; novaSenha: string; confirmarNovaSenha: string }
) {
  await usuario.type(screen.getByLabelText("Senha atual"), valores.senhaAtual);
  await usuario.type(screen.getByLabelText("Nova senha"), valores.novaSenha);
  await usuario.type(screen.getByLabelText("Confirmar nova senha"), valores.confirmarNovaSenha);
}

describe("TrocarSenhaForm", () => {
  it("identifica as credenciais para gerenciadores de senha", () => {
    renderComProvider();

    expect(screen.getByLabelText("Senha atual")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByLabelText("Nova senha")).toHaveAttribute("autocomplete", "new-password");
    expect(screen.getByLabelText("Confirmar nova senha")).toHaveAttribute("autocomplete", "new-password");
  });

  it("envia PUT /api/usuarios/me/senha e mostra toast de sucesso, limpando o formulário", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const usuario = userEvent.setup();

    renderComProvider();
    await preencher(usuario, { senhaAtual: "atual123", novaSenha: "novaSenha123", confirmarNovaSenha: "novaSenha123" });
    await usuario.click(screen.getByRole("button", { name: /trocar senha/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/usuarios/me/senha",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ senhaAtual: "atual123", novaSenha: "novaSenha123" }),
      })
    );
    expect(await screen.findByText(/senha alterada/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Senha atual")).toHaveValue("");
  });

  it("bloqueia envio quando a confirmação não bate com a nova senha, sem chamar a API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const usuario = userEvent.setup();

    renderComProvider();
    await preencher(usuario, { senhaAtual: "atual123", novaSenha: "novaSenha123", confirmarNovaSenha: "outraSenha" });
    await usuario.click(screen.getByRole("button", { name: /trocar senha/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/não coincidem/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("mostra a mensagem do backend quando a senha atual está errada (401)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ mensagem: "senha atual incorreta" }), { status: 401 })
      )
    );
    const usuario = userEvent.setup();

    renderComProvider();
    await preencher(usuario, { senhaAtual: "errada", novaSenha: "novaSenha123", confirmarNovaSenha: "novaSenha123" });
    await usuario.click(screen.getByRole("button", { name: /trocar senha/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/senha atual incorreta/i);
  });
});
