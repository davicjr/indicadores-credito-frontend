import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { InativarClienteButton } from "./InativarClienteButton";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

function renderComProviders() {
  return render(
    <ToastProvider>
      <ConfirmProvider>
        <InativarClienteButton clienteId="c1" />
      </ConfirmProvider>
    </ToastProvider>
  );
}

describe("InativarClienteButton", () => {
  beforeEach(() => {
    refresh.mockClear();
  });

  it("pede confirmação e, se confirmado, chama PATCH /api/clientes/{id}/inativar", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "c1" }), { status: 200 })));

    renderComProviders();
    await usuario.click(screen.getByRole("button", { name: "Inativar cliente" }));
    await usuario.click(screen.getByRole("button", { name: "Inativar" }));

    expect(fetch).toHaveBeenCalledWith("/api/clientes/c1/inativar", expect.objectContaining({ method: "PATCH" }));
    expect(refresh).toHaveBeenCalled();
    expect(await screen.findByText(/cliente inativado/i)).toBeInTheDocument();
  });

  it("não chama a API se o usuário cancelar a confirmação", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn());

    renderComProviders();
    await usuario.click(screen.getByRole("button", { name: "Inativar cliente" }));
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(fetch).not.toHaveBeenCalled();
  });
});
