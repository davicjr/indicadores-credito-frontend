import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Cliente } from "@/lib/clientes-api";
import { EditarClienteButton } from "./EditarClienteButton";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const cliente: Cliente = {
  id: "c1",
  nome: "Ana Silva",
  documento: "11144477735",
  email: "ana@exemplo.com",
  telefone: "11999999999",
  dataNascimento: "1990-05-10",
  idade: 36,
  ativo: true,
  dadosFinanceiros: {
    rendaMensal: 5000,
    numeroDependentes: 0,
    utilizacaoCreditoRotativo: 0.3,
    razaoDividaRenda: 0.2,
    linhasCreditoAbertas: 3,
    emprestimosImobiliarios: 1,
    atrasos30a59Dias: 0,
    atrasos60a89Dias: 0,
    atrasos90DiasOuMais: 0,
  },
  score: 712,
  faixa: "Bom",
  segmento: 1,
  modeloUsado: "gbm-v1",
  scoreAtualizadoEm: "2026-07-20T10:00:00",
};

describe("EditarClienteButton", () => {
  it("abre o modal de edição pré-preenchido, sem CPF (não editável)", async () => {
    const usuario = userEvent.setup();
    render(<EditarClienteButton cliente={cliente} />);

    await usuario.click(screen.getByRole("button", { name: /^editar$/i }));

    expect(screen.getByRole("dialog", { name: /editar cliente/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue("Ana Silva");
    expect(screen.queryByLabelText("CPF")).not.toBeInTheDocument();
  });

  it("fecha o modal e atualiza a página quando a edição é salva", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "c1" }), { status: 200 })));
    render(<EditarClienteButton cliente={cliente} />);

    await usuario.click(screen.getByRole("button", { name: /^editar$/i }));
    await usuario.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(refresh).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
