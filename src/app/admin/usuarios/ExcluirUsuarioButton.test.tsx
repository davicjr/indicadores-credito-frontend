import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { ExcluirUsuarioButton } from "./ExcluirUsuarioButton";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

function renderComProviders() {
  return render(
    <ToastProvider>
      <ConfirmProvider>
        <ExcluirUsuarioButton usuarioId="u1" />
      </ConfirmProvider>
    </ToastProvider>
  );
}

describe("ExcluirUsuarioButton", () => {
  it("pede confirmação e, se confirmado, chama DELETE /api/usuarios/{id}", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    renderComProviders();
    await usuario.click(screen.getByRole("button", { name: "Excluir usuário" }));
    await usuario.click(screen.getByRole("button", { name: "Excluir" }));

    expect(fetch).toHaveBeenCalledWith("/api/usuarios/u1", expect.objectContaining({ method: "DELETE" }));
    expect(await screen.findByText(/usuário excluído/i)).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("não chama a API se o usuário cancelar a confirmação", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn());

    renderComProviders();
    await usuario.click(screen.getByRole("button", { name: "Excluir usuário" }));
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(fetch).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("mostra a mensagem de erro do backend quando não pode excluir (ex.: último admin)", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ mensagem: "não é possível remover o último administrador ativo" }), {
          status: 409,
        })
      )
    );

    renderComProviders();
    await usuario.click(screen.getByRole("button", { name: "Excluir usuário" }));
    await usuario.click(screen.getByRole("button", { name: "Excluir" }));

    expect(await screen.findByText(/último administrador/i)).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
