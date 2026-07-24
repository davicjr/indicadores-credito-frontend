import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "./ToastProvider";

function BotaoDeTeste() {
  const mostrarToast = useToast();
  return (
    <>
      <button type="button" onClick={() => mostrarToast("Cliente cadastrado com sucesso")}>
        Disparar
      </button>
      <button type="button" onClick={() => mostrarToast("Serviço indisponível", "erro")}>
        Disparar erro
      </button>
    </>
  );
}

describe("ToastProvider / useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mostra a mensagem ao chamar mostrarToast", async () => {
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider>
        <BotaoDeTeste />
      </ToastProvider>
    );

    await usuario.click(screen.getByRole("button", { name: "Disparar" }));

    expect(screen.getByText("Cliente cadastrado com sucesso")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Informação");
  });

  it("some sozinho depois de um tempo", async () => {
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider>
        <BotaoDeTeste />
      </ToastProvider>
    );

    await usuario.click(screen.getByRole("button", { name: "Disparar" }));
    expect(screen.getByText("Cliente cadastrado com sucesso")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText("Cliente cadastrado com sucesso")).not.toBeInTheDocument();
  });

  it("usa anúncio assertivo para erro e permite dispensar a notificação", async () => {
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider>
        <BotaoDeTeste />
      </ToastProvider>,
    );

    await usuario.click(screen.getByRole("button", { name: "Disparar erro" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Atenção");

    await usuario.click(
      screen.getByRole("button", { name: "Dispensar notificação: Serviço indisponível" }),
    );
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByText("Serviço indisponível")).not.toBeInTheDocument();
  });
});
