import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { InativarUsuarioButton } from "./InativarUsuarioButton";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

function renderComProviders() {
  return render(
    <ToastProvider>
      <ConfirmProvider>
        <InativarUsuarioButton usuarioId="u1" />
      </ConfirmProvider>
    </ToastProvider>
  );
}

describe("InativarUsuarioButton", () => {
  it("pede confirmação e, se confirmado, chama PATCH /api/usuarios/{id}/inativar", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "u1" }), { status: 200 })));

    renderComProviders();
    await usuario.click(screen.getByRole("button", { name: "Inativar usuário" }));
    await usuario.click(screen.getByRole("button", { name: "Inativar" }));

    expect(fetch).toHaveBeenCalledWith("/api/usuarios/u1/inativar", expect.objectContaining({ method: "PATCH" }));
    expect(await screen.findByText(/usuário inativado/i)).toBeInTheDocument();
  });

  it("não chama a API se o usuário cancelar a confirmação", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn());

    renderComProviders();
    await usuario.click(screen.getByRole("button", { name: "Inativar usuário" }));
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(fetch).not.toHaveBeenCalled();
  });
});
