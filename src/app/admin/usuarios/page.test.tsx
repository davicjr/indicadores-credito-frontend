import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { ToastProvider } from "@/components/ToastProvider";

const getUsuarioAtualMock = vi.fn();
const getUsuariosMock = vi.fn();
vi.mock("@/lib/usuario-api", () => ({
  getUsuarioAtual: () => getUsuarioAtualMock(),
  getUsuarios: (pagina: number) => getUsuariosMock(pagina),
}));
const redirectMock = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (rota: string) => {
    redirectMock(rota);
    throw new Error("NEXT_REDIRECT");
  },
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("AdminUsuariosPage", () => {
  beforeEach(() => {
    getUsuarioAtualMock.mockClear();
    getUsuariosMock.mockClear();
    redirectMock.mockClear();
  });

  it("lista os usuários quando o usuário logado é admin", async () => {
    getUsuarioAtualMock.mockResolvedValue({ id: "u1", usuario: "admin1", papel: "ADMIN", ativo: true });
    getUsuariosMock.mockResolvedValue({
      content: [{ id: "u1", usuario: "admin1", papel: "ADMIN", ativo: true }],
      page: { size: 20, number: 0, totalElements: 1, totalPages: 1 },
    });

    const { default: AdminUsuariosPage } = await import("./page");
    render(
      <ToastProvider>
        <ConfirmProvider>{await AdminUsuariosPage({ searchParams: Promise.resolve({}) })}</ConfirmProvider>
      </ToastProvider>
    );

    expect(screen.getByRole("heading", { name: "Gestão de usuários" })).toBeInTheDocument();
    expect(screen.getByText("admin1")).toBeInTheDocument();
  });

  it("redireciona pro dashboard quando o usuário logado não é admin", async () => {
    getUsuarioAtualMock.mockResolvedValue({ id: "u2", usuario: "analista1", papel: "ANALISTA", ativo: true });

    const { default: AdminUsuariosPage } = await import("./page");
    await expect(AdminUsuariosPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
    expect(getUsuariosMock).not.toHaveBeenCalled();
  });
});
