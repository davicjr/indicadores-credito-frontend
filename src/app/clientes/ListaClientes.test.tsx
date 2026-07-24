import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PaginaClientes } from "@/lib/clientes-api";
import { ListaClientes } from "./ListaClientes";

function paginaComUmCliente(overrides = {}): PaginaClientes {
  return {
    content: [
      {
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
      },
    ],
    page: { size: 20, number: 0, totalElements: 1, totalPages: 1 },
  };
}

describe("ListaClientes", () => {
  it("mostra nome, documento, score e faixa de cada cliente com link pro detalhe", () => {
    render(<ListaClientes pagina={paginaComUmCliente()} />);

    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(screen.getByText("712")).toBeInTheDocument();
    expect(screen.getByText("Bom")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ana Silva/ })).toHaveAttribute("href", "/clientes/c1");
  });

  it("mostra estado vazio quando não há clientes cadastrados", () => {
    render(<ListaClientes pagina={{ content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } }} />);

    expect(screen.getByText(/nenhum cliente cadastrado/i)).toBeInTheDocument();
  });

  it("mostra 'Sem score' quando o cliente ainda não foi avaliado", () => {
    render(<ListaClientes pagina={paginaComUmCliente({ score: null, faixa: null })} />);

    expect(screen.getByText(/sem score/i)).toBeInTheDocument();
  });

  it("cabeçalho de coluna ordenável é um link construído por linkOrdenacao", () => {
    render(
      <ListaClientes
        pagina={paginaComUmCliente()}
        linkOrdenacao={(campo) => `/clientes?sort=${campo},asc`}
        sortAtual="nome,asc"
      />
    );

    const linkNome = screen.getByRole("link", { name: /^Nome/ });
    expect(linkNome).toHaveAttribute("href", "/clientes?sort=nome,asc");
    expect(linkNome.textContent).toContain("▲");
  });
});
