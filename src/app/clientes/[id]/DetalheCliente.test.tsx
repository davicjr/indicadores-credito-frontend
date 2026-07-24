import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { ToastProvider } from "@/components/ToastProvider";
import type { Cliente } from "@/lib/clientes-api";
import { DetalheCliente } from "./DetalheCliente";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

function renderComProviders(cliente: Cliente) {
  return render(
    <ToastProvider>
      <ConfirmProvider>
        <DetalheCliente cliente={cliente} />
      </ConfirmProvider>
    </ToastProvider>
  );
}

function clienteBase(overrides: Partial<Cliente> = {}): Cliente {
  return {
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
    ...overrides,
  };
}

describe("DetalheCliente", () => {
  it("mostra nome, documento, contato e a régua de score", () => {
    renderComProviders(clienteBase());

    expect(screen.getByRole("heading", { name: "Ana Silva" })).toBeInTheDocument();
    expect(screen.getByText("11144477735")).toBeInTheDocument();
    expect(screen.getByText("ana@exemplo.com")).toBeInTheDocument();
    expect(screen.getByTestId("regua-score-numero")).toHaveTextContent("712");
    expect(screen.getByText("Bom")).toBeInTheDocument();
  });

  it("mostra contato e dados financeiros como cards empilhados, sem abas", () => {
    renderComProviders(clienteBase());

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Contato" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Dados financeiros" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Capacidade financeira" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Uso do crédito" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Histórico de atrasos" })).toBeInTheDocument();
  });

  it("mostra botão pra editar (abre modal, não navega pra página nova)", () => {
    renderComProviders(clienteBase());

    expect(screen.getByRole("button", { name: /^editar$/i })).toBeInTheDocument();
  });

  it("mostra o botão de ativar (em vez de inativar) quando o cliente está inativo", () => {
    renderComProviders(clienteBase({ ativo: false }));
    expect(screen.queryByRole("button", { name: /inativar cliente/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^ativar cliente$/i })).toBeInTheDocument();
    expect(screen.getByText(/inativo/i)).toBeInTheDocument();
  });

  it("mostra o botão de inativar (em vez de ativar) quando o cliente está ativo", () => {
    renderComProviders(clienteBase({ ativo: true }));
    expect(screen.getByRole("button", { name: /inativar cliente/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^ativar cliente$/i })).not.toBeInTheDocument();
  });

  it("todo dado do cliente fica focável pra revelar por teclado (documento e idade, sem exceção)", () => {
    renderComProviders(clienteBase());

    const rotuloDocumento = screen.getByText("Documento");
    const rotuloIdade = screen.getByText("Idade");

    expect(rotuloDocumento.parentElement).toHaveAttribute("tabIndex", "0");
    expect(rotuloIdade.parentElement).toHaveAttribute("tabIndex", "0");
  });

  it("mostra somente o valor dentro do tooltip, sem repetir o rótulo", () => {
    renderComProviders(clienteBase());

    // "Renda mensal" fica focável igual aos outros — a máscara/hover não é exclusividade de
    // documento/e-mail/telefone.
    expect(screen.getByText("Renda mensal").parentElement).toHaveAttribute("tabIndex", "0");
    expect(screen.getAllByText("Documento")).toHaveLength(1);

    // O valor de idade existe no DOM (pra leitor de tela e pra revelar no hover), mas só dentro
    // do painel de tooltip — não solto como texto sempre visível no corpo do item.
    const valorIdade = screen.getByText("36 anos");
    expect(valorIdade.closest('[class*="tooltipValor"]')).not.toBeNull();
  });

  it("apresenta o segmento como perfil de risco e explica seu significado", () => {
    renderComProviders(clienteBase({ segmento: 2 }));

    expect(screen.getByText("Perfil de risco")).toBeInTheDocument();
    expect(screen.getByText("Cliente de confiança")).toBeInTheDocument();
    expect(screen.getByText("Histórico mais estável, com poucos atrasos.")).toBeInTheDocument();
  });
});
