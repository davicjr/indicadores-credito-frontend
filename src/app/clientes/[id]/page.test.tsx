import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { ToastProvider } from "@/components/ToastProvider";

const getClienteByIdMock = vi.fn();
vi.mock("@/lib/clientes-api", () => ({ getClienteById: (id: string) => getClienteByIdMock(id) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe("ClienteDetalhePage", () => {
  it("busca o cliente pelo id da rota e renderiza o detalhe", async () => {
    getClienteByIdMock.mockResolvedValue({
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
    });

    const { default: ClienteDetalhePage } = await import("./page");
    const conteudo = await ClienteDetalhePage({ params: Promise.resolve({ id: "c1" }) });
    render(
      <ToastProvider>
        <ConfirmProvider>{conteudo}</ConfirmProvider>
      </ToastProvider>
    );

    expect(getClienteByIdMock).toHaveBeenCalledWith("c1");
    expect(screen.getByRole("heading", { name: "Ana Silva" })).toBeInTheDocument();
  });
});
