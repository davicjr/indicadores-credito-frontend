import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ConfirmProvider, useConfirm } from "./ConfirmProvider";

function BotaoDeTeste() {
  const confirmar = useConfirm();
  const [resultado, setResultado] = useState<string>("nenhum");

  async function aoClicar() {
    const ok = await confirmar({ titulo: "Apagar item", mensagem: "Tem certeza?" });
    setResultado(ok ? "confirmado" : "cancelado");
  }

  return (
    <div>
      <button type="button" onClick={aoClicar}>
        Apagar
      </button>
      <p>resultado: {resultado}</p>
    </div>
  );
}

describe("ConfirmProvider / useConfirm", () => {
  it("resolve true quando o usuário confirma", async () => {
    const usuario = userEvent.setup();
    render(
      <ConfirmProvider>
        <BotaoDeTeste />
      </ConfirmProvider>
    );

    await usuario.click(screen.getByRole("button", { name: "Apagar" }));
    expect(screen.getByRole("dialog", { name: "Apagar item" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();

    await usuario.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(await screen.findByText("resultado: confirmado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apagar" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("resolve false quando o usuário cancela", async () => {
    const usuario = userEvent.setup();
    render(
      <ConfirmProvider>
        <BotaoDeTeste />
      </ConfirmProvider>
    );

    await usuario.click(screen.getByRole("button", { name: "Apagar" }));
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(await screen.findByText("resultado: cancelado")).toBeInTheDocument();
  });
});
