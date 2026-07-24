import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const getClientesMock = vi.fn();
vi.mock("@/lib/clientes-api", () => ({
  ORDENACAO_PADRAO_CLIENTES: "nome,asc",
  getClientes: (pagina: number, filtros: unknown) => getClientesMock(pagina, filtros),
}));

// FiltroClientes é client component (auto-aplica filtro) e usa esses hooks de navegação.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/clientes",
  useSearchParams: () => new URLSearchParams(),
}));

function paginaVazia(numero: number, totalPages: number) {
  return { content: [], page: { size: 20, number: numero, totalElements: 0, totalPages } };
}

describe("ClientesPage", () => {
  it("busca a página pedida em ?page= e renderiza a lista", async () => {
    getClientesMock.mockResolvedValue(paginaVazia(2, 5));
    const { default: ClientesPage } = await import("./page");

    render(await ClientesPage({ searchParams: Promise.resolve({ page: "2" }) }));

    expect(getClientesMock).toHaveBeenCalledWith(2, { sort: "nome,asc" });
    expect(screen.getByRole("heading", { name: "Clientes" })).toBeInTheDocument();
  });

  it("sem ?page=, busca a primeira página (0)", async () => {
    getClientesMock.mockResolvedValue(paginaVazia(0, 1));
    const { default: ClientesPage } = await import("./page");

    render(await ClientesPage({ searchParams: Promise.resolve({}) }));

    expect(getClientesMock).toHaveBeenCalledWith(0, { sort: "nome,asc" });
  });

  it("repassa nome, faixa, segmento e sort da query pro getClientes", async () => {
    getClientesMock.mockResolvedValue(paginaVazia(0, 1));
    const { default: ClientesPage } = await import("./page");

    render(
      await ClientesPage({
        searchParams: Promise.resolve({ nome: "ana", faixa: "Bom", segmento: "1", sort: "nome,asc" }),
      })
    );

    expect(getClientesMock).toHaveBeenCalledWith(0, {
      nome: "ana",
      faixa: "Bom",
      segmento: 1,
      sort: "nome,asc",
    });
  });

  it("mostra botão pra cadastrar cliente (abre modal, não navega pra página nova)", async () => {
    getClientesMock.mockResolvedValue(paginaVazia(0, 1));
    const { default: ClientesPage } = await import("./page");

    render(await ClientesPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("button", { name: /cadastrar cliente/i })).toBeInTheDocument();
  });

  it("mostra paginação (Próxima) preservando os filtros ativos", async () => {
    getClientesMock.mockResolvedValue({
      content: [],
      page: { size: 20, number: 0, totalElements: 45, totalPages: 3 },
    });
    const { default: ClientesPage } = await import("./page");

    render(await ClientesPage({ searchParams: Promise.resolve({ faixa: "Bom" }) }));

    const proxima = screen.getByRole("link", { name: /próxima/i });
    const href = proxima.getAttribute("href")!;
    expect(href).toContain("page=1");
    expect(href).toContain("faixa=Bom");
  });
});
