import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("mostra o título e o conteúdo", () => {
    render(
      <Modal titulo="Confirmar ação" onFechar={vi.fn()}>
        <p>conteúdo do modal</p>
      </Modal>
    );

    expect(screen.getByRole("dialog", { name: "Confirmar ação" })).toBeInTheDocument();
    expect(screen.getByText("conteúdo do modal")).toBeInTheDocument();
  });

  it("Escape inicia a saída e só chama onFechar quando a animação de saída termina", async () => {
    const usuario = userEvent.setup();
    const onFechar = vi.fn();
    render(
      <Modal titulo="Título" onFechar={onFechar}>
        <p>conteúdo</p>
      </Modal>
    );

    await usuario.keyboard("{Escape}");
    expect(onFechar).not.toHaveBeenCalled();

    // onAnimationEnd é o caminho normal no browser real; jsdom não implementa AnimationEvent,
    // então o teste depende do timeout de segurança (mesma duração) pra fechar de verdade.
    await waitFor(() => expect(onFechar).toHaveBeenCalled());
  });

  it("clicar no backdrop inicia a saída (não ao clicar dentro da caixa), onFechar só após a saída", async () => {
    const usuario = userEvent.setup();
    const onFechar = vi.fn();
    render(
      <Modal titulo="Título" onFechar={onFechar}>
        <p>conteúdo</p>
      </Modal>
    );

    await usuario.click(screen.getByText("conteúdo"));
    expect(onFechar).not.toHaveBeenCalled();

    await usuario.click(screen.getByRole("presentation"));
    expect(onFechar).not.toHaveBeenCalled();

    await waitFor(() => expect(onFechar).toHaveBeenCalled());
  });

  it("variante de cliente mostra descrição e permite fechar pelo botão acessível", async () => {
    const usuario = userEvent.setup();
    const onFechar = vi.fn();
    render(
      <Modal
        titulo="Cadastrar cliente"
        descricao="Descrição do fluxo"
        variante="cliente"
        onFechar={onFechar}
      >
        <p>conteúdo</p>
      </Modal>
    );

    expect(screen.getByText("Descrição do fluxo")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Fechar cadastrar cliente" }));
    await waitFor(() => expect(onFechar).toHaveBeenCalled());
  });

  it("leva o foco para o diálogo, mantém a navegação dentro dele e bloqueia o scroll da página", async () => {
    const usuario = userEvent.setup();
    render(
      <Modal titulo="Revisar ação" onFechar={vi.fn()}>
        <button type="button">Confirmar revisão</button>
      </Modal>,
    );

    const fechar = screen.getByRole("button", { name: "Fechar revisar ação" });
    const confirmar = screen.getByRole("button", { name: "Confirmar revisão" });
    expect(fechar).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");

    await usuario.keyboard("{Shift>}{Tab}{/Shift}");
    expect(confirmar).toHaveFocus();
    await usuario.keyboard("{Tab}");
    expect(fechar).toHaveFocus();
  });
});
