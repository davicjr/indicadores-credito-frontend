import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ToastProvider";

const getUsuarioAtualMock = vi.fn();
vi.mock("@/lib/usuario-api", () => ({ getUsuarioAtual: () => getUsuarioAtualMock() }));
const redirectMock = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (rota: string) => {
    redirectMock(rota);
    throw new Error("NEXT_REDIRECT");
  },
}));

describe("PerfilPage", () => {
  it("mostra usuario e papel do usuário logado, com o formulário de troca de senha", async () => {
    getUsuarioAtualMock.mockResolvedValue({ id: "u1", usuario: "ana1", papel: "ADMIN", ativo: true });

    const { default: PerfilPage } = await import("./page");
    render(<ToastProvider>{await PerfilPage()}</ToastProvider>);

    expect(screen.getByText("ana1")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /trocar senha/i })).toBeInTheDocument();
  });

  it("redireciona pro login quando não há sessão válida", async () => {
    getUsuarioAtualMock.mockResolvedValue(null);

    const { default: PerfilPage } = await import("./page");
    await expect(PerfilPage()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
