import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { ToastProvider } from "@/components/ToastProvider";
import type { PaginaUsuarios } from "@/lib/usuario-api";
import { ListaUsuarios } from "./ListaUsuarios";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

function renderComProviders(pagina: PaginaUsuarios, usuarioAtualId = "admin-logado") {
  return render(
    <ToastProvider>
      <ConfirmProvider>
        <ListaUsuarios pagina={pagina} usuarioAtualId={usuarioAtualId} />
      </ConfirmProvider>
    </ToastProvider>
  );
}

describe("ListaUsuarios", () => {
  it("mostra usuario, papel, status e ações (editar sempre, inativar/excluir só pros ativos)", () => {
    renderComProviders(
      {
        content: [
          { id: "u1", usuario: "admin1", papel: "ADMIN", ativo: true },
          { id: "u2", usuario: "inativo1", papel: "ANALISTA", ativo: false },
        ],
        page: { size: 20, number: 0, totalElements: 2, totalPages: 1 },
      },
      "admin-logado"
    );

    const tabela = screen.getByRole("table");
    const linhas = within(tabela).getAllByRole("row").slice(1);

    expect(within(linhas[0]).getByText("admin1")).toBeInTheDocument();
    expect(within(linhas[0]).getByText("Admin")).toBeInTheDocument();
    expect(within(linhas[0]).getByRole("button", { name: /^editar$/i })).toBeInTheDocument();
    expect(within(linhas[0]).getByRole("button", { name: /inativar usuário/i })).toBeInTheDocument();
    expect(within(linhas[0]).getByRole("button", { name: /excluir usuário/i })).toBeInTheDocument();

    expect(within(linhas[1]).getByText("Inativo")).toBeInTheDocument();
    expect(within(linhas[1]).getByRole("button", { name: /^editar$/i })).toBeInTheDocument();
    expect(within(linhas[1]).queryByRole("button", { name: /inativar usuário/i })).not.toBeInTheDocument();
    expect(within(linhas[1]).queryByRole("button", { name: /excluir usuário/i })).not.toBeInTheDocument();
  });

  it("esconde o botão de excluir na própria linha do admin logado", () => {
    renderComProviders(
      {
        content: [{ id: "eu-mesmo", usuario: "eu1", papel: "ADMIN", ativo: true }],
        page: { size: 20, number: 0, totalElements: 1, totalPages: 1 },
      },
      "eu-mesmo"
    );

    expect(screen.queryByRole("button", { name: /excluir usuário/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /inativar usuário/i })).toBeInTheDocument();
    expect(screen.getByText("Sua conta")).toBeInTheDocument();
  });

  it("mostra estado vazio quando não há usuários", () => {
    renderComProviders({ content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } });

    expect(screen.getByText(/nenhum usuário/i)).toBeInTheDocument();
  });
});
