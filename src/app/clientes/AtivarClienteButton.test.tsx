import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ToastProvider";
import { AtivarClienteButton } from "./AtivarClienteButton";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

function renderComProviders() {
  return render(
    <ToastProvider>
      <AtivarClienteButton clienteId="c1" />
    </ToastProvider>
  );
}

describe("AtivarClienteButton", () => {
  beforeEach(() => {
    refresh.mockClear();
  });

  it("chama PATCH /api/clientes/{id}/ativar direto, sem pedir confirmação", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "c1" }), { status: 200 })));

    renderComProviders();
    await usuario.click(screen.getByRole("button", { name: "Ativar cliente" }));

    expect(fetch).toHaveBeenCalledWith("/api/clientes/c1/ativar", expect.objectContaining({ method: "PATCH" }));
    expect(refresh).toHaveBeenCalled();
    expect(await screen.findByText(/cliente ativado/i)).toBeInTheDocument();
  });
});
